"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Script from "next/script";
// [수정] userService 추가 임포트
import { tourService, userService } from "@/api/services";
import { Tour } from "@/types/tour";
import {
  MapPin,
  Phone,
  X,
  ChevronLeft,
  Map as MapIcon,
  Search,
  Heart,
  RefreshCw,
} from "lucide-react";
import Pagination from "@/components/common/Pagination"; // Pagination 경로 확인

function TourPageContent() {
  const searchParams = useSearchParams();
  const initialKeyword = searchParams.get("keyword") || "";

  const [tours, setTours] = useState<Tour[]>([]);
  const [filteredTours, setFilteredTours] = useState<Tour[]>([]);
  const [selectedTour, setSelectedTour] = useState<Tour | null>(null);
  const [loading, setLoading] = useState(true);

  const [keyword, setKeyword] = useState(initialKeyword);
  const [selectedCategory, setSelectedCategory] = useState("전체");

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // 1. 데이터 로드 (관광지 리스트 + 내 즐겨찾기 병합)
  useEffect(() => {
    const fetchTours = async () => {
      try {
        setLoading(true);

        // [수정] 관광지 리스트와 즐겨찾기 동시 호출
        const [toursRes, favoritesRes] = await Promise.allSettled([
          tourService.getTourCourses(),
          userService.getFavorites(),
        ]);

        let allTours: Tour[] = [];
        const myFavoriteIds = new Set<number>();

        // 1) 전체 관광지 데이터 확보
        if (toursRes.status === "fulfilled") {
          allTours = toursRes.value.data;
        }

        // 2) 내 즐겨찾기 ID 확보
        if (favoritesRes.status === "fulfilled") {
          const favoriteList = favoritesRes.value.data;
          if (Array.isArray(favoriteList)) {
            favoriteList.forEach((item: any) => myFavoriteIds.add(item.id));
          }
        }

        // 3) 데이터 병합 (isFavorite 덮어쓰기)
        const mergedList = allTours.map((item) => ({
          ...item,
          isFavorite: myFavoriteIds.has(item.id),
        }));

        setTours(mergedList);
        setFilteredTours(mergedList); // 초기값 설정 (이후 useEffect에서 필터링됨)
      } catch (error) {
        console.error("데이터 호출 실패:", error);
      } finally {
        setTimeout(() => setLoading(false), 500);
      }
    };
    fetchTours();
  }, []);

  // 2. 통합 필터링 로직
  useEffect(() => {
    if (tours.length === 0) return;

    let result = tours;

    // (1) 지역 카테고리 필터
    if (selectedCategory !== "전체") {
      result = result.filter((tour) => tour.address.includes(selectedCategory));
    }

    // (2) 검색어 필터
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
    setCurrentPage(1); // 필터 변경 시 1페이지로
  }, [tours, selectedCategory, keyword]);

  const handleReset = () => {
    setKeyword("");
    setSelectedCategory("전체");
  };

  // 3. 즐겨찾기 토글 (낙관적 업데이트 적용)
  const toggleFavorite = async (e: React.MouseEvent, id: number) => {
    e.preventDefault();
    e.stopPropagation();

    // UI 먼저 업데이트
    const previousTours = [...tours];
    const updateState = (list: Tour[]) =>
      list.map((item) =>
        item.id === id ? { ...item, isFavorite: !item.isFavorite } : item
      );

    setTours((prev) => updateState(prev));
    // filteredTours는 useEffect([tours])에 의해 자동 업데이트됨 (혹은 즉시 반영 위해 아래 추가)
    setFilteredTours((prev) => updateState(prev));

    try {
      await tourService.toggleFavorite(id);
    } catch (error) {
      console.error("즐겨찾기 요청 실패:", error);
      // 실패 시 롤백
      setTours(previousTours);
      setFilteredTours(previousTours); // 필터링된 목록도 롤백 필요 시 주의
      alert("로그인이 필요합니다.");
    }
  };

  // 지도 관련 함수 (기존 유지)
  const initMap = (address: string, name: string) => {
    const { kakao } = window as any;
    if (!kakao || !kakao.maps) return;

    const container = document.getElementById("map");
    const options = {
      center: new kakao.maps.LatLng(36.3504, 127.3845),
      level: 3,
    };

    const map = new kakao.maps.Map(container, options);
    const geocoder = new kakao.maps.services.Geocoder();

    geocoder.addressSearch(address, (result: any, status: any) => {
      if (status === kakao.maps.services.Status.OK) {
        const coords = new kakao.maps.LatLng(result[0].y, result[0].x);
        new kakao.maps.Marker({ map, position: coords });
        const infowindow = new kakao.maps.InfoWindow({
          content: `<div style="width:150px;text-align:center;padding:6px 0;font-size:12px;font-weight:bold;color:#1e293b;">${name}</div>`,
        });
        infowindow.open(map, new kakao.maps.Marker({ map, position: coords }));
        map.setCenter(coords);
      }
    });
  };

  useEffect(() => {
    if (selectedTour) {
      const timer = setTimeout(() => {
        initMap(selectedTour.address, selectedTour.name);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [selectedTour]);

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

  const cleanDescription = (text: string) => {
    if (!text) return "";
    return text
      .replace(/<[^>]*>?/gm, "")
      .replace(/&nbsp;/g, " ")
      .trim();
  };

  const handleFilter = (category: string) => {
    setSelectedCategory(category);
  };

  const totalPages = Math.ceil(filteredTours.length / itemsPerPage);
  const currentItems = filteredTours.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const categories = ["전체", "대덕구", "동구", "서구", "유성구", "중구"];

  if (loading && tours.length === 0) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-white">
        <div className="w-12 h-12 border-4 border-green-100 border-t-green-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="w-full bg-[#fcfcfc] min-h-screen pb-24">
      <Script
        src={`//dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_JS_KEY}&libraries=services&autoload=false`}
        onLoad={() => {
          (window as any).kakao.maps.load(() => console.log("Kakao Map Ready"));
        }}
      />

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
              {keyword && (
                <button
                  onClick={() => setKeyword("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-100 rounded-full text-slate-400 hover:text-green-600 transition-colors"
                >
                  <X size={16} />
                </button>
              )}
              {!keyword && (
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

      <div className="max-w-7xl mx-auto px-6 py-16">
        {filteredTours.length === 0 ? (
          <div className="py-32 flex flex-col items-center justify-center bg-white rounded-[2.5rem] border border-slate-100 border-dashed">
            <p className="text-slate-400 font-bold text-xl">
              검색 결과가 없습니다.
            </p>
            <p className="text-slate-300 text-sm mt-2">
              다른 키워드나 필터를 선택해보세요.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-12">
            {currentItems.map((tour, index) => (
              <div
                key={`${tour.id}-${index}`}
                className="group cursor-pointer"
                onClick={() => setSelectedTour(tour)}
              >
                <div className="relative h-72 overflow-hidden rounded-4xl bg-slate-100 shadow-sm transition-all duration-500 group-hover:shadow-2xl group-hover:-translate-y-2">
                  <img
                    src={tour.image}
                    alt={tour.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  {/* 즐겨찾기 버튼 추가 */}
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

        {/* 페이지네이션 컴포넌트 사용 */}
        {filteredTours.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={(page) => setCurrentPage(page)}
            themeColor="green"
          />
        )}
      </div>

      {selectedTour && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-0 md:p-6"
          onClick={() => setSelectedTour(null)}
        >
          <div
            className="bg-white w-full h-full md:max-w-6xl md:h-[90vh] md:rounded-[3rem] shadow-2xl overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
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

            <div className="overflow-y-auto flex-1 custom-scrollbar">
              <div className="grid grid-cols-1 lg:grid-cols-2">
                <div className="p-6 md:p-12 space-y-10 border-r border-slate-50">
                  <div className="rounded-[2.5rem] overflow-hidden shadow-xl aspect-square lg:aspect-video relative">
                    <img
                      src={selectedTour.image}
                      className="w-full h-full object-cover"
                      alt={selectedTour.name}
                    />
                    {/* 모달 내부 즐겨찾기 버튼 */}
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

                <div className="p-6 md:p-12 bg-slate-50/50 space-y-10">
                  <div className="space-y-6">
                    <h4 className="text-2xl font-black text-slate-900 flex items-center gap-3">
                      <span className="w-2 h-8 bg-green-500 rounded-full"></span>{" "}
                      위치 정보
                    </h4>
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

export default function TourPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <TourPageContent />
    </Suspense>
  );
}
