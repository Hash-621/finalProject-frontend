// 1. "use client": 이 파일이 브라우저에서 실행되는 클라이언트 컴포넌트임을 선언합니다.
// (지도 로드, 모달 팝업, 상태 관리 등은 서버 컴포넌트에서 할 수 없기 때문입니다.)
"use client";

// --- [라이브러리 및 컴포넌트 임포트] ---
import React, { useState, useEffect, useCallback, Suspense } from "react"; // 리액트 훅
import Link from "next/link"; // (현재는 잘 안 쓰임)
import Script from "next/script"; // 외부 스크립트(카카오맵 SDK) 로드
import { useSearchParams } from "next/navigation"; // URL 쿼리 파라미터 읽기
import { tourService, userService } from "@/api/services"; // API 서비스
import { Tour } from "@/types/tour"; // 데이터 타입
// 아이콘 라이브러리
import {
  MapPin,
  Phone,
  X,
  ChevronLeft,
  Map as MapIcon,
  Search,
  Heart,
  RefreshCw,
  Camera,
} from "lucide-react";
import Pagination from "@/components/common/Pagination"; // 페이지네이션 컴포넌트

import makerImg from "../../../../public/images/mapMaker.png";

// --- [UI 컴포넌트: 관광지 스켈레톤] ---
// 데이터 로딩 중에 보여줄 뼈대 UI입니다. (깜빡이는 회색 박스)
const TourSkeleton = () => (
  <div className="bg-white rounded-[2rem] overflow-hidden border border-slate-100 shadow-sm animate-pulse h-[360px] flex flex-col">
    <div className="h-48 bg-slate-200 w-full" /> {/* 이미지 자리 */}
    <div className="p-6 flex-1 space-y-3">
      <div className="h-7 bg-slate-200 rounded w-2/3" /> {/* 제목 자리 */}
      <div className="h-4 bg-slate-200 rounded w-1/2" /> {/* 주소 자리 */}
      <div className="h-4 bg-slate-200 rounded w-full mt-4" /> {/* 설명 자리 */}
    </div>
  </div>
);

// --- [메인 콘텐츠 컴포넌트] ---
function TourPageContent() {
  const searchParams = useSearchParams();
  const initialKeyword = searchParams.get("keyword") || ""; // URL에서 초기 검색어 가져오기

  // --- [상태 관리] ---
  const [tours, setTours] = useState<Tour[]>([]); // 전체 관광지 데이터
  const [filteredTours, setFilteredTours] = useState<Tour[]>([]); // 필터링된 데이터
  const [selectedTour, setSelectedTour] = useState<Tour | null>(null); // 선택된 관광지 (모달용)

  const [loading, setLoading] = useState(true); // 로딩 상태

  const [keyword, setKeyword] = useState(initialKeyword); // 검색어
  const [selectedCategory, setSelectedCategory] = useState("전체"); // 지역 필터 (구 단위)

  const [currentPage, setCurrentPage] = useState(1); // 현재 페이지
  const itemsPerPage = 8; // 페이지당 아이템 수

  // --- [1. 데이터 로드 (useEffect)] ---
  useEffect(() => {
    const fetchTours = async () => {
      try {
        setLoading(true); // 로딩 시작

        // 관광지 목록과 내 즐겨찾기 목록을 동시에 가져옴 (병렬 처리)
        const [toursRes, favoritesRes] = await Promise.allSettled([
          tourService.getTourCourses(),
          userService.getFavorites(),
        ]);

        // 스켈레톤 UI를 보여주기 위해 0.5초 일부러 지연 (UX)
        await new Promise((resolve) => setTimeout(resolve, 500));

        let allTours: Tour[] = [];
        const myFavoriteIds = new Set<number>();

        // 응답 데이터 정리
        if (toursRes.status === "fulfilled") {
          allTours = toursRes.value.data;
        }
        if (favoritesRes.status === "fulfilled") {
          const favoriteList = favoritesRes.value.data;
          if (Array.isArray(favoriteList)) {
            favoriteList.forEach((item: any) => myFavoriteIds.add(item.id));
          }
        }

        // 즐겨찾기 여부를 합쳐서 최종 데이터 생성
        const mergedList = allTours.map((item) => ({
          ...item,
          isFavorite: myFavoriteIds.has(item.id),
        }));

        setTours(mergedList);
        setFilteredTours(mergedList);
      } catch (error) {
        console.error("데이터 호출 실패:", error);
      } finally {
        setLoading(false); // 로딩 끝
      }
    };
    fetchTours();
  }, []);

  // --- [2. 통합 필터링 로직 (useEffect)] ---
  // 데이터, 카테고리, 검색어가 바뀔 때마다 실행되어 filteredTours를 업데이트
  useEffect(() => {
    let result = tours;

    // 지역(구) 필터링
    if (selectedCategory !== "전체") {
      result = result.filter((tour) => tour.address.includes(selectedCategory));
    }

    // 검색어 필터링 (다중 키워드 지원)
    const trimmedKeyword = keyword.trim();
    if (trimmedKeyword !== "") {
      const searchTerms = trimmedKeyword.split(/\s+/);
      result = result.filter((tour) => {
        const name = tour.name || "";
        const address = tour.address || "";
        return searchTerms.every(
          (term) => name.includes(term) || address.includes(term)
        );
      });
    }

    setFilteredTours(result);
    setCurrentPage(1); // 필터 바뀌면 1페이지로 리셋
  }, [tours, selectedCategory, keyword]);

  // 필터 초기화 버튼 핸들러
  const handleReset = () => {
    setKeyword("");
    setSelectedCategory("전체");
  };

  // 즐겨찾기 토글 핸들러
  const toggleFavorite = async (e: React.MouseEvent, id: number) => {
    e.preventDefault();
    e.stopPropagation(); // 카드 클릭(모달 열기) 방지

    const previousTours = [...tours]; // 롤백용 백업

    // 화면 먼저 업데이트 (낙관적 업데이트)
    const updateState = (list: Tour[]) =>
      list.map((item) =>
        item.id === id ? { ...item, isFavorite: !item.isFavorite } : item
      );

    setTours((prev) => updateState(prev));

    try {
      await tourService.toggleFavorite(id); // 서버 요청
    } catch (error) {
      console.error("즐겨찾기 요청 실패:", error);
      setTours(previousTours); // 실패 시 원복
      alert("로그인이 필요합니다.");
    }
  };

  // --- [지도 초기화 함수] ---
  // 모달 안에 지도를 그리는 로직
  const initMap = (address: string, name: string) => {
    const { kakao } = window as any;
    if (!kakao || !kakao.maps) return;

    const container = document.getElementById("map"); // 지도를 넣을 div
    const options = {
      center: new kakao.maps.LatLng(36.3504, 127.3845), // 초기 중심
      level: 3,
    };

    const map = new kakao.maps.Map(container, options);
    const geocoder = new kakao.maps.services.Geocoder();

    // 주소로 좌표 검색 후 마커 표시
    geocoder.addressSearch(address, (result: any, status: any) => {
      if (status === kakao.maps.services.Status.OK) {
        const coords = new kakao.maps.LatLng(result[0].y, result[0].x);
        var imageSrc = makerImg.src, // 마커이미지의 주소입니다
          imageSize = new kakao.maps.Size(32, 34), // 마커이미지의 크기입니다
          imageOption = { offset: new kakao.maps.Point(16, 34) }; // 마커이미지의 옵션입니다. 마커의 좌표와 일치시킬 이미지 안에서의 좌표를 설정합니다.
        var markerImage = new kakao.maps.MarkerImage(
          imageSrc,
          imageSize,
          imageOption
        );
        new kakao.maps.Marker({ map, position: coords, image: markerImage });
        const infowindow = new kakao.maps.InfoWindow({
          content: `<div style="width:150px;text-align:center;padding:6px 0;font-size:12px;font-weight:bold;color:#1e293b;">${name}</div>`,
        });
        infowindow.open(
          map,
          new kakao.maps.Marker({ map, position: coords, image: markerImage })
        );
        map.setCenter(coords);
      }
    });
  };

  // 모달이 열리면(selectedTour 존재) 지도 초기화 실행
  useEffect(() => {
    if (selectedTour) {
      const timer = setTimeout(() => {
        initMap(selectedTour.address, selectedTour.name);
      }, 300); // 모달 애니메이션 끝난 뒤 실행
      return () => clearTimeout(timer);
    }
  }, [selectedTour]);

  // --- [모달 스크롤 방지] ---
  // 모달이 열려있을 때 뒤쪽 배경이 스크롤되지 않도록 막는 로직
  useEffect(() => {
    if (selectedTour) {
      const scrollY = window.scrollY;
      document.body.style.cssText = `position: fixed; top: -${scrollY}px; overflow-y: scroll; width: 100%;`;
    } else {
      const scrollY = document.body.style.top;
      document.body.style.cssText = "";
      window.scrollTo(0, parseInt(scrollY || "0") * -1);
    }
    return () => {
      document.body.style.cssText = "";
    };
  }, [selectedTour]);

  // HTML 태그 제거 함수 (설명 텍스트용)
  const cleanDescription = (text: string) => {
    if (!text) return "";
    return text
      .replace(/<[^>]*>?/gm, "")
      .replace(/&nbsp;/g, " ")
      .trim();
  };

  // 카테고리 필터 핸들러
  const handleFilter = (category: string) => {
    setSelectedCategory(category);
  };

  // 페이지네이션 계산
  const totalPages = Math.ceil(filteredTours.length / itemsPerPage);
  const currentItems = filteredTours.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const categories = ["전체", "대덕구", "동구", "서구", "유성구", "중구"];

  // --- [화면 렌더링] ---
  return (
    <div className="w-full bg-[#fcfcfc] min-h-screen pb-24">
      {/* 카카오맵 SDK 로드 */}
      <Script
        src={`//dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_JS_KEY}&libraries=services&autoload=false`}
        onLoad={() => {
          (window as any).kakao.maps.load(() => console.log("Kakao Map Ready"));
        }}
      />

      {/* 1. 헤더 섹션 (제목, 검색창, 필터버튼) */}
      <div className="bg-white border-b border-slate-100 pt-20 pb-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 mb-6 bg-green-50 text-green-700 rounded-full text-xs font-black tracking-tight w-fit">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            DAEJEON TOUR
          </div>

          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10">
            <h1 className="text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-[1.1]">
              맞춤형 <span className="text-green-500">대전 명소</span> 큐레이션
            </h1>

            <div className="relative w-full lg:w-96">
              <Search
                className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400"
                size={20}
              />
              <input
                type="text"
                placeholder="관광지 이름이나 주소 검색..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                className="w-full pl-12 pr-12 py-4 bg-white border border-slate-200 rounded-3xl text-sm font-bold shadow-sm focus:outline-none focus:ring-4 focus:ring-green-500/10 focus:border-green-500 transition-all"
              />
              {/* 검색어 삭제 및 초기화 버튼 */}
              {keyword ? (
                <button
                  onClick={() => setKeyword("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-100 rounded-full text-slate-400 hover:text-green-600 transition-colors"
                >
                  <X size={16} />
                </button>
              ) : (
                <button
                  onClick={handleReset}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-100 rounded-full text-slate-400 hover:text-green-600 transition-colors"
                  title="필터 초기화"
                >
                  <RefreshCw size={16} />
                </button>
              )}
            </div>
          </div>

          {/* 지역 필터 버튼들 */}
          <div className="flex flex-wrap items-center gap-3">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => handleFilter(cat)}
                className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all ${
                  selectedCategory === cat
                    ? "bg-green-600 text-white shadow-lg"
                    : "bg-white border border-slate-200 text-slate-600 hover:border-slate-900"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 2. 관광지 목록 영역 */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        {loading ? (
          // (1) 로딩 중: 스켈레톤
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-12">
            {Array(8)
              .fill(0)
              .map((_, i) => (
                <TourSkeleton key={i} />
              ))}
          </div>
        ) : filteredTours.length === 0 ? (
          // (2) 결과 없음: Empty State
          <div className="py-32 flex flex-col items-center justify-center bg-white rounded-[2.5rem] border border-dashed border-slate-200 text-center relative overflow-hidden">
            {/* ... 장식용 배경 요소들 ... */}
            <h3 className="text-2xl font-black text-slate-900 mb-2">
              검색된 관광지가 없어요.
            </h3>
            <p className="text-slate-500 text-sm font-medium">
              다른 검색어를 입력하거나 전체 목록을 확인해보세요!
            </p>
          </div>
        ) : (
          // (3) 데이터 리스트: 관광지 카드
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-12">
            {currentItems.map((tour, index) => (
              <div
                key={`${tour.id}-${index}`}
                className="group cursor-pointer"
                onClick={() => setSelectedTour(tour)} // 클릭 시 모달 열기
              >
                <div className="relative h-72 overflow-hidden rounded-4xl bg-slate-100 shadow-sm transition-all duration-500 group-hover:shadow-2xl group-hover:-translate-y-2">
                  <img
                    src={tour.image}
                    alt={tour.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  {/* 즐겨찾기 버튼 */}
                  <button
                    onClick={(e) => toggleFavorite(e, tour.id)}
                    className="absolute top-4 right-4 z-20 p-2.5 rounded-full bg-white/80 backdrop-blur-md shadow-sm transition-all hover:scale-110 active:scale-90 border border-slate-100"
                  >
                    <Heart
                      size={18}
                      className={`${
                        tour.isFavorite
                          ? "fill-orange-500 text-orange-500"
                          : "text-slate-400"
                      } transition-colors`}
                    />
                  </button>
                </div>
                <div className="mt-5">
                  <h2 className="text-xl font-bold text-slate-900 group-hover:text-green-600 transition-colors truncate">
                    {tour.name}
                  </h2>
                  <div className="flex items-center text-slate-400 text-sm mt-1 font-medium">
                    <MapPin className="w-4 h-4 mr-1 text-green-500" />{" "}
                    {tour.address.split(" ").slice(0, 2).join(" ")}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 3. 페이지네이션 */}
        {!loading && filteredTours.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={(page) => setCurrentPage(page)}
            themeColor="green"
          />
        )}
      </div>

      {/* 4. 상세 정보 모달 (selectedTour가 있을 때만 렌더링) */}
      {selectedTour && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-0 md:p-6"
          onClick={() => setSelectedTour(null)} // 배경 클릭 시 닫기
        >
          <div
            className="bg-white w-full h-full md:max-w-6xl md:h-[90vh] md:rounded-[3rem] shadow-2xl overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()} // 모달 내부 클릭 시 닫기 방지
          >
            {/* 모달 헤더 */}
            <div className="sticky top-0 z-20 flex justify-between items-center p-6 bg-white border-b border-slate-50">
              <button
                onClick={() => setSelectedTour(null)}
                className="flex items-center text-slate-500 hover:text-green-600 font-bold transition-all"
              >
                <ChevronLeft className="w-6 h-6 mr-1" /> 목록보기
              </button>
              <span className="font-bold text-slate-900 text-lg truncate px-4">
                {selectedTour.name}
              </span>
              <button
                onClick={() => setSelectedTour(null)}
                className="p-2 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X className="w-6 h-6 text-slate-400" />
              </button>
            </div>

            {/* 모달 본문 (스크롤 가능) */}
            <div className="overflow-y-auto flex-1 custom-scrollbar">
              <div className="grid grid-cols-1 lg:grid-cols-2">
                {/* 왼쪽: 이미지 + 상세 설명 */}
                <div className="p-6 md:p-12 space-y-10 border-r border-slate-50">
                  <div className="rounded-[2.5rem] overflow-hidden shadow-xl aspect-square lg:aspect-video relative">
                    <img
                      src={selectedTour.image}
                      className="w-full h-full object-cover"
                      alt={selectedTour.name}
                    />
                    <button
                      onClick={(e) => toggleFavorite(e, selectedTour.id)}
                      className={`absolute top-6 right-6 p-3 rounded-full bg-white/90 backdrop-blur-md shadow-lg transition-all active:scale-95 ${
                        selectedTour.isFavorite
                          ? "text-orange-500"
                          : "text-slate-400"
                      }`}
                    >
                      <Heart
                        size={24}
                        className={
                          selectedTour.isFavorite ? "fill-orange-500" : ""
                        }
                      />
                    </button>
                  </div>
                  <div className="space-y-6">
                    <h4 className="text-2xl font-black text-slate-900 flex items-center gap-3">
                      <span className="w-2 h-8 bg-green-500 rounded-full"></span>{" "}
                      상세 소개
                    </h4>
                    <p className="text-slate-600 leading-loose whitespace-pre-wrap text-lg font-medium">
                      {cleanDescription(selectedTour.description)}
                    </p>
                  </div>
                </div>

                {/* 오른쪽: 지도 + 위치 정보 */}
                <div className="p-6 md:p-12 bg-slate-50/50 space-y-10">
                  <div className="space-y-6">
                    <h4 className="text-2xl font-black text-slate-900 flex items-center gap-3">
                      <span className="w-2 h-8 bg-green-500 rounded-full"></span>{" "}
                      위치 정보
                    </h4>
                    {/* 지도 컨테이너 */}
                    <div
                      id="map"
                      className="w-full h-[350px] rounded-[2.5rem] bg-white border border-slate-200 shadow-md"
                    ></div>
                    <div className="flex items-start gap-3 p-4 bg-white rounded-2xl border border-slate-100">
                      <MapPin className="text-green-500 shrink-0 mt-1" />
                      <span className="font-bold text-slate-700 leading-relaxed">
                        {selectedTour.address}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <a
                      href={`https://map.kakao.com/link/search/${encodeURIComponent(
                        selectedTour.address
                      )}`}
                      target="_blank"
                      className="flex items-center justify-center gap-2 py-5 bg-[#FFEB00] text-[#3C1E1E] rounded-2xl font-black shadow-lg hover:shadow-xl transition-all"
                    >
                      <MapIcon size={20} /> 카카오맵 길찾기
                    </a>
                    <div className="flex flex-col justify-center items-center py-4 bg-slate-900 text-white rounded-2xl shadow-lg">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">
                        Contact
                      </span>
                      <span className="text-xl font-black tracking-tight flex items-center gap-2">
                        <Phone size={18} className="text-green-400" />{" "}
                        {selectedTour.phone || "정보 없음"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// --- [최상위 페이지 컴포넌트] ---
export default function TourPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <TourPageContent />
    </Suspense>
  );
}
// 1. 페이지 진입 및 데이터 로드 (Entry)

// useEffect가 실행되어 서버에서 모든 관광지 데이터를 불러옵니다.

// 로딩 중엔 스켈레톤(회색 박스)이 반짝이며, 로딩이 끝나면 관광지 카드들이 그리드 형태로 쫙 펼쳐집니다.

// 2. 필터링 및 검색 (Filter)

// 사용자가 상단 버튼에서 **[유성구]**를 클릭합니다.

// handleFilter가 작동하여 주소에 '유성구'가 포함된 관광지들만 남기고 나머지는 숨깁니다.

// 검색창에 "온천"이라고 치면, 유성구이면서 이름에 "온천"이 들어간 곳만 남습니다.

// 3. 모달 팝업 열기 (Open Modal)

// 사용자가 "유성온천 공원" 카드를 클릭합니다.

// setSelectedTour(tour)가 실행되어 selectedTour 상태에 해당 관광지 정보가 담깁니다.

// 화면 전체를 덮는 모달 팝업이 부드럽게 나타납니다. 이때 배경 스크롤은 잠깁니다.

// 4. 상세 정보 확인 및 지도 (Detail View)

// 모달이 열리면서 내부의 useEffect가 initMap을 호출해 카카오지도를 그립니다.

// 왼쪽엔 큰 사진과 설명이, 오른쪽엔 지도와 주소, 전화번호가 보입니다.

// 사용자는 [카카오맵 길찾기] 버튼을 눌러 바로 길 안내를 받을 수 있습니다.
