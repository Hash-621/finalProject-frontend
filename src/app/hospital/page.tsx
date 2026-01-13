// 1. "use client": 이 파일이 브라우저(클라이언트) 환경에서 실행됨을 명시합니다.
// (지도 라이브러리, 훅 사용 등을 위해 필수)
"use client";

// --- [라이브러리 및 컴포넌트 임포트] ---
import {
  useKakaoLoader, // 카카오맵 SDK를 비동기로 로드하는 훅
  Map, // 지도 컴포넌트
  MapMarker, // 지도 위 마커 컴포넌트
  MarkerClusterer, // 마커가 많을 때 그룹화해주는 컴포넌트
  Roadview, // 로드뷰 컴포넌트
} from "react-kakao-maps-sdk";
import { useEffect, useState, useMemo } from "react"; // 리액트 기본 훅
import { useRouter } from "next/navigation"; // 페이지 이동 훅
import { hospitalService, userService } from "@/api/services"; // API 서비스 함수들
// 각종 아이콘 임포트
import {
  Search,
  MapPin,
  Loader2,
  Plus,
  Map as MapIcon,
  ArrowRight,
  Camera,
  X,
  Heart,
  LayoutGrid,
  ChevronRight,
} from "lucide-react";
import makerImg from "../../../public/images/mapMaker.png";

// 🔥 [추가] AI 증상 상담소 컴포넌트 임포트
// (경로가 맞는지 확인해주세요. src/components/features/AiHospitalSearch.tsx)
import AiHospitalSearch from "@/components/features/AiHospitalSearch";

// --- [UI 컴포넌트: 병원 리스트 스켈레톤] ---
// 데이터 로딩 중에 보여줄 뼈대 UI입니다. (깜빡이는 회색 박스)
const HospitalListSkeleton = () => (
  <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm animate-pulse mb-6">
    <div className="flex justify-between items-start mb-4">
      <div className="flex items-center gap-2">
        <div className="w-16 h-6 bg-slate-200 rounded-md" />
        <div className="w-9 h-9 bg-slate-200 rounded-full ml-2" />
      </div>
      <div className="w-11 h-11 bg-slate-200 rounded-2xl" />
    </div>
    <div className="h-8 bg-slate-200 rounded w-3/4 mb-4" />
    <div className="h-4 bg-slate-200 rounded w-full mb-2" />
    <div className="h-4 bg-slate-200 rounded w-2/3 mb-8" />
    <div className="h-10 bg-slate-200 rounded-2xl w-full" />
  </div>
);

// --- [메인 페이지 컴포넌트] ---
export default function Page() {
  const router = useRouter(); // 라우터 객체 생성

  // 1. 카카오맵 스크립트 로드
  const [mapLoading] = useKakaoLoader({
    appkey: process.env.NEXT_PUBLIC_KAKAO_JS_KEY || "",
    libraries: ["services", "clusterer"],
  });

  const [map, setMap] = useState<kakao.maps.Map | null>(null); // 지도 객체 저장 상태

  // [수정 1] 지도 중심 좌표 관리 (초기값: 대전 시청 근처)
  const [mapCenter, setMapCenter] = useState({ lat: 36.3504, lng: 127.3845 });

  // --- [상태 관리] ---
  const [hospitals, setHospitals] = useState<any[]>([]); // 전체 병원 데이터 (원본)
  const [filteredHospitals, setFilteredHospitals] = useState<any[]>([]); // 필터링된 병원 데이터 (화면 표시용)
  const [selectedId, setSelectedId] = useState<number | null>(null); // 현재 선택된(클릭된) 병원 ID
  const [visibleCount, setVisibleCount] = useState(6); // 리스트에 보여줄 개수 (더보기 기능용)
  const [filterCategory, setFilterCategory] = useState("전체"); // 진료과목 필터 상태

  const [dataLoading, setDataLoading] = useState(true); // 데이터 로딩 상태
  const [keyword, setKeyword] = useState(""); // 검색어 상태

  // 로드뷰 관련 상태
  const [isRoadviewOpen, setIsRoadviewOpen] = useState(false);
  const [roadviewPos, setRoadviewPos] = useState({ lat: 0, lng: 0 });

  // --- [스크롤 설정] ---
  useEffect(() => {
    const wrapElement = document.querySelector(".wrap") as HTMLElement;
    if (wrapElement) wrapElement.style.overflow = "visible";
    return () => {
      if (wrapElement) wrapElement.style.overflow = "hidden";
    };
  }, []);

  // --- [데이터 로드 및 지오코딩 (핵심 로직)] ---
  useEffect(() => {
    if (mapLoading) return; // 지도 스크립트가 아직 로드 안 됐으면 대기

    const fetchAndGeocodeHospitals = async () => {
      setDataLoading(true); // 로딩 시작
      try {
        // 1. 병원 목록과 즐겨찾기 목록을 동시에 호출 (병렬 처리)
        const [hospitalsRes, favoritesRes] = await Promise.allSettled([
          hospitalService.getHospitals(),
          userService.getFavorites(),
        ]);

        let dbData: any[] = [];
        const myFavoriteIds = new Set<number>();

        // 2. 응답 데이터 정리
        if (hospitalsRes.status === "fulfilled") {
          dbData = hospitalsRes.value.data;
        }
        if (favoritesRes.status === "fulfilled") {
          const favoriteList = favoritesRes.value.data;
          if (Array.isArray(favoriteList)) {
            favoriteList.forEach((item: any) => myFavoriteIds.add(item.id));
          }
        }

        // [UX] 스켈레톤 보여주기 위해 0.5초 지연
        await new Promise((resolve) => setTimeout(resolve, 500));

        // 3. 주소 -> 좌표 변환 (Geocoding)
        const geocoder = new window.kakao.maps.services.Geocoder();

        // 모든 병원 주소를 좌표로 변환하는 비동기 작업 배열 생성
        const promises = dbData.map((item: any) => {
          return new Promise((resolve) => {
            geocoder.addressSearch(item.address, (result, status) => {
              if (status === window.kakao.maps.services.Status.OK) {
                // 변환 성공 시: 기존 데이터에 lat, lng, isFavorite 정보 추가해서 반환
                resolve({
                  ...item,
                  lat: Number(result[0].y),
                  lng: Number(result[0].x),
                  isFavorite: myFavoriteIds.has(item.id),
                });
              } else resolve(null); // 실패 시 null
            });
          });
        });

        // 모든 변환 작업이 끝날 때까지 대기
        const results = await Promise.all(promises);
        const validHospitals = results.filter((h) => h !== null); // 유효한 데이터만 필터링

        setHospitals(validHospitals);
        setFilteredHospitals(validHospitals);
      } catch (err) {
        console.error("데이터 로드 실패:", err);
      } finally {
        setDataLoading(false); // 로딩 종료
      }
    };

    fetchAndGeocodeHospitals();
  }, [mapLoading]); // mapLoading 상태가 변할 때(로드 완료 시) 실행

  // --- [카테고리 목록 생성] ---
  const categories = useMemo(() => {
    const sets = new Set(hospitals.map((h) => h.treatCategory));
    return ["전체", ...Array.from(sets)];
  }, [hospitals]);

  // --- [필터링 및 검색 로직] ---
  useEffect(() => {
    let result = hospitals;

    // 1. 카테고리 필터링
    if (filterCategory !== "전체") {
      result = result.filter((h) => h.treatCategory === filterCategory);
    }

    // 2. 키워드 검색 필터링 (다중 검색어 지원)
    const trimmedKeyword = keyword.trim();
    if (trimmedKeyword !== "") {
      const searchTerms = trimmedKeyword.split(/\s+/); // 공백으로 검색어 분리

      result = result.filter((h) => {
        const name = h.name || "";
        const address = h.address || "";
        const category = h.treatCategory || "";

        // 모든 검색어가 포함되어야 함 (AND 조건)
        return searchTerms.every((term) => {
          return (
            name.toLowerCase().includes(term.toLowerCase()) ||
            address.includes(term) ||
            category.includes(term)
          );
        });
      });
    }

    setFilteredHospitals(result);
  }, [hospitals, filterCategory, keyword]);

  // --- [즐겨찾기 토글 핸들러] ---
  const toggleFavorite = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation(); // 카드 클릭 이벤트 버블링 방지
    const previousHospitals = [...hospitals]; // 롤백용 백업

    // 화면 즉시 업데이트 함수
    const updateList = (list: any[]) =>
      list.map((item) =>
        item.id === id ? { ...item, isFavorite: !item.isFavorite } : item
      );

    setHospitals((prev) => updateList(prev));
    setFilteredHospitals((prev) => updateList(prev));

    try {
      await hospitalService.toggleFavorite(id); // 서버 요청
    } catch (error) {
      console.error("즐겨찾기 실패:", error);
      // 실패 시 원상복구
      setHospitals(previousHospitals);
      setFilteredHospitals(previousHospitals);
      alert("로그인이 필요합니다.");
    }
  };

  // --- [병원 클릭 핸들러 (지도 이동)] ---
  // 이 함수가 AiHospitalSearch 컴포넌트에 전달되어 실행됩니다.
  const handleHospitalClick = (h: any) => {
    setSelectedId(h.id);

    // [수정 2] 지도 중심을 해당 병원 위치로 이동시킴
    setMapCenter({ lat: h.lat, lng: h.lng });

    // 모바일 화면일 경우, 스크롤을 지도 위치로 부드럽게 이동
    if (window.innerWidth < 1024) {
      const mapElement = document.getElementById("hospital-map-section");
      if (mapElement) {
        const headerOffset = 200;
        const elementPosition = mapElement.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.scrollY - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: "smooth",
        });
      }
    }

    // [수정 3] 줌 레벨 조정
    if (map) {
      map.setLevel(3); // 좀 더 확대해서 보여줌
    }
  };

  // --- [로드뷰 열기 핸들러] ---
  const handleOpenRoadview = (h: any) => {
    setRoadviewPos({ lat: h.lat, lng: h.lng });
    setIsRoadviewOpen(true);
  };

  // --- [필터 버튼 핸들러] ---
  const handleFilter = (cat: string) => {
    setFilterCategory(cat);
    setVisibleCount(6); // 더보기 초기화
    setSelectedId(null); // 선택 초기화
  };

  // --- [화면 렌더링 1: 지도 로딩 중] ---
  if (mapLoading)
    return (
      <div className="h-screen flex items-center justify-center bg-white">
        <Loader2 className="animate-spin text-green-500" size={40} />
      </div>
    );

  // --- [화면 렌더링 2: 메인 화면] ---
  return (
    <div className="w-full bg-[#fbfcfd] min-h-screen pb-24">
      {/* 1. 헤더 섹션 (제목, 검색창, 필터 버튼들) */}
      <div className="bg-white border-b border-slate-100 pt-20 pb-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 sm:mb-16">
            <div className="space-y-5">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-black tracking-tight">
                {/* 깜빡이는 녹색 점 애니메이션 */}
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                VERIFIED SPECIALISTS
              </div>
              <h2 className="text-3xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.1]">
                <span className="text-transparent bg-clip-text bg-linear-to-r from-green-600 to-green-400">
                  대전 전문의를{" "}
                </span>
                찾아서
              </h2>
              <p className="text-slate-500 text-sm font-medium leading-relaxed max-w-2xl">
                보건복지부 인증 전문의가 상주하는 대전의 믿을 수 있는 병원
                리스트입니다.
              </p>
            </div>

            {/* 검색창 */}
            <div className="relative w-full lg:w-96 mb-15">
              <Search
                className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400"
                size={20}
              />
              <input
                type="text"
                placeholder="병원명, 진료과목, 주소 검색..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                className="w-full pl-12 pr-12 py-4 bg-white border border-slate-200 rounded-3xl text-sm font-bold shadow-sm focus:outline-none focus:ring-4 focus:ring-green-500/10 focus:border-green-500 transition-all"
              />
              {/* 검색어 삭제 버튼 */}
              {keyword && (
                <button
                  onClick={() => setKeyword("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-100 rounded-full text-slate-400 hover:text-green-600 transition-colors"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          </div>

          {/* 카테고리 필터 버튼 목록 */}
          <div className="flex flex-wrap items-center gap-3">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => handleFilter(cat)}
                className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all ${
                  filterCategory === cat
                    ? "bg-green-600 text-white shadow-lg shadow-green-100"
                    : "bg-white border border-slate-200 text-slate-600 hover:border-slate-900"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="w-full lg:max-w-7xl mx-auto px-4 lg:px-5 mt-10">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start relative">
          {/* 2. 좌측 리스트 섹션 (2/5 공간 차지) */}
          <div className="w-full lg:col-span-2 space-y-6 order-1">
            <div className="p-4">
              {/* 🔥🔥🔥 [추가] AI 증상 상담소 컴포넌트 삽입 위치 🔥🔥🔥 */}
              <div className="mb-6">
                <AiHospitalSearch onSelectHospital={handleHospitalClick} />
              </div>
              {/* 🔥🔥🔥 -------------------------------------- 🔥🔥🔥 */}
            </div>

            {/* 리스트 헤더 (개수 표시) */}
            <div className="flex items-center justify-between px-2 mb-4">
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">
                  Medical List
                </span>
                <p className="text-sm font-bold text-slate-500">
                  {filterCategory}
                </p>
              </div>
              <span className="text-xs font-bold text-slate-400 bg-slate-100 px-3 py-1 rounded-full">
                {dataLoading ? "..." : `${filteredHospitals.length}개`}
              </span>
            </div>

            {/* 데이터 로딩 중: 스켈레톤 표시 */}
            {dataLoading ? (
              Array(4)
                .fill(0)
                .map((_, i) => <HospitalListSkeleton key={i} />)
            ) : filteredHospitals.length === 0 ? (
              // 검색 결과 없음 표시
              <div className="py-20 flex flex-col items-center justify-center bg-white rounded-[2.5rem] border border-slate-100 border-dashed relative overflow-hidden">
                <p className="text-slate-800 font-bold text-lg mb-1">
                  검색된 병원이 없습니다.
                </p>
              </div>
            ) : (
              // 실제 병원 리스트
              <>
                {filteredHospitals.slice(0, visibleCount).map((h) => (
                  <div
                    key={h.id}
                    onClick={() => handleHospitalClick(h)} // 클릭 시 지도 이동
                    className={`group bg-white rounded-[2.5rem] p-8 border transition-all cursor-pointer relative ${
                      selectedId === h.id
                        ? "border-green-500 shadow-2xl shadow-green-500/10 -translate-y-1" // 선택된 카드 강조
                        : "border-slate-100 hover:border-green-200 shadow-sm"
                    }`}
                  >
                    {/* 카드 내부 내용 */}
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-2">
                        {/* 진료과목 뱃지 */}
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-500 text-white text-[10px] font-black rounded-md uppercase tracking-widest shadow-lg shadow-green-200">
                          {h.treatCategory}
                        </div>
                        {/* 즐겨찾기 하트 버튼 */}
                        <button
                          onClick={(e) => toggleFavorite(e, h.id)}
                          className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                            h.isFavorite
                              ? "bg-red-50 text-red-500"
                              : "bg-slate-50 text-slate-300 hover:bg-slate-100"
                          }`}
                        >
                          <Heart
                            size={18}
                            className={h.isFavorite ? "fill-red-500" : ""}
                          />
                        </button>
                      </div>
                      <div
                        className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all ${
                          selectedId === h.id
                            ? "bg-green-600 text-white shadow-lg shadow-green-200"
                            : "bg-slate-50 text-slate-300 group-hover:bg-slate-100"
                        }`}
                      >
                        <MapIcon size={20} />
                      </div>
                    </div>
                    <h4 className="text-2xl font-black text-slate-900 mb-4 tracking-tight line-clamp-1">
                      {h.name}
                    </h4>
                    <div className="flex flex-col gap-3 mb-8 text-slate-500 text-sm font-medium">
                      <div className="flex items-center gap-2.5">
                        <MapPin size={16} className="text-green-500 shrink-0" />
                        <span className="line-clamp-1">{h.address}</span>
                      </div>
                    </div>
                    <div className="pt-6 border-t border-dashed border-slate-100 flex flex-col gap-1 sm:gap-0 sm:flex-row sm:items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        <span className="text-[11px] font-black text-slate-400 uppercase">
                          Clinic Open
                        </span>
                      </div>
                      {/* 상세 정보 버튼 */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/hospital/${h.id}`);
                        }}
                        className="flex items-center justify-center sm:justify-start gap-2 px-7 py-3.5 bg-slate-900 text-white rounded-2xl text-[13px] font-bold hover:bg-green-600 transition-all shadow-xl shadow-slate-200"
                      >
                        진료 정보 보기 <ArrowRight size={16} />
                      </button>
                    </div>
                  </div>
                ))}
                {/* 더보기 버튼 */}
                {visibleCount < filteredHospitals.length && (
                  <button
                    onClick={() => setVisibleCount((v) => v + 5)}
                    className="w-full py-6 bg-white border-2 border-slate-100 rounded-[2.2rem] text-slate-400 font-black text-sm hover:text-green-600 transition-all flex items-center justify-center gap-2"
                  >
                    <Plus size={20} /> 결과 더 보기
                  </button>
                )}
              </>
            )}
          </div>

          {/* 3. 우측 지도 섹션 (3/5 공간 차지, 스크롤 시 고정됨) */}
          <div
            id="hospital-map-section"
            className="w-full h-[500px] lg:h-[calc(100vh-140px)] lg:col-span-3 lg:sticky lg:top-[100px] lg:self-start mt-8 lg:mt-0 order-2"
          >
            <div className="w-full h-full rounded-[3.5rem] overflow-hidden border-12px border-white shadow-2xl relative bg-slate-50">
              {/* 카카오맵 컴포넌트 */}
              <Map
                // [수정 4] 지도 중심 좌표 및 이동 설정
                center={mapCenter}
                isPanto={true} // 부드러운 이동 효과 켜기
                style={{ width: "100%", height: "100%" }}
                level={7} // 초기 줌 레벨
                onCreate={setMap} // 맵 객체 생성 시 상태에 저장
              >
                {/* 마커 클러스터러: 마커가 겹치면 숫자로 표시해줌 */}
                <MarkerClusterer
                  averageCenter={true}
                  minLevel={5}
                  key={filterCategory}
                >
                  {filteredHospitals.map((h) => (
                    <MapMarker
                      key={`marker-${h.id}`}
                      position={{ lat: h.lat, lng: h.lng }}
                      onClick={() => setSelectedId(h.id)} // 마커 클릭 시 해당 병원 선택
                      image={{
                        src: makerImg.src,
                        size: { width: 32, height: 32 },
                        options: { offset: { x: 16, y: 32 } },
                      }}
                    >
                      {/* 마커 클릭 시 나타나는 정보창 (커스텀 오버레이) */}
                      {selectedId === h.id && (
                        <div className="p-0 min-w-64 overflow-hidden rounded-2xl shadow-2xl bg-white border-none">
                          <div className="bg-slate-900 p-5 text-white">
                            <div className="flex justify-between items-start">
                              <p className="text-[10px] font-bold text-green-400 tracking-widest uppercase mb-1">
                                {h.treatCategory}
                              </p>
                              <button onClick={(e) => toggleFavorite(e, h.id)}>
                                <Heart
                                  size={16}
                                  className={
                                    h.isFavorite
                                      ? "fill-red-500 text-red-500"
                                      : "text-slate-400"
                                  }
                                />
                              </button>
                            </div>
                            <h4 className="font-bold text-base truncate">
                              {h.name}
                            </h4>
                          </div>
                          <div className="p-4 space-y-2">
                            <button
                              onClick={() => handleOpenRoadview(h)}
                              className="w-full flex items-center justify-center gap-2 py-3 bg-green-600 text-white rounded-xl text-xs font-black hover:bg-green-700 transition-all shadow-lg"
                            >
                              <Camera size={14} /> 로드뷰 보기
                            </button>
                            <button
                              onClick={() => router.push(`/hospital/${h.id}`)}
                              className="w-full py-3 bg-slate-50 text-slate-700 rounded-xl text-xs font-black hover:bg-slate-100 transition-all"
                            >
                              상세정보
                            </button>
                          </div>
                        </div>
                      )}
                    </MapMarker>
                  ))}
                </MarkerClusterer>

                {/* 로드뷰 오버레이 (조건부 렌더링) */}
                {isRoadviewOpen && (
                  <div className="absolute inset-0 z-50 bg-slate-900/60 backdrop-blur-sm p-4 flex items-center justify-center">
                    <div className="w-full h-full bg-white rounded-3xl overflow-hidden relative shadow-2xl">
                      <div className="absolute top-6 right-6 z-60">
                        <button
                          onClick={() => setIsRoadviewOpen(false)}
                          className="p-3 bg-slate-900 text-white rounded-full shadow-xl hover:scale-110 transition-transform active:scale-95"
                        >
                          <X size={20} />
                        </button>
                      </div>
                      <Roadview
                        position={{ ...roadviewPos, radius: 50 }}
                        className="w-full h-full"
                      />
                    </div>
                  </div>
                )}
              </Map>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
