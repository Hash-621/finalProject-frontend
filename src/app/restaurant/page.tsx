"use client";

import React, {
  useEffect,
  useState,
  useRef,
  useMemo,
  useCallback,
} from "react";
import Link from "next/link";
import { restaurantService, userService } from "@/api/services";
import { RestaurantData } from "@/types/restaurant";
import {
  MapPin,
  Heart,
  Search,
  X,
  Clock,
  Check,
  Map as MapIcon,
  List as ListIcon,
  Loader2,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Eye,
  Undo2,
} from "lucide-react";
import Pagination from "@/components/common/Pagination";
// react-kakao-maps-sdk 라이브러리
import {
  Map as KakaoMap,
  MapMarker,
  MarkerClusterer,
  useKakaoLoader,
  CustomOverlayMap,
  Roadview,
} from "react-kakao-maps-sdk";

// --- [타입 정의] ---
interface ExtendedRestaurantData extends RestaurantData {
  restOpenTime?: string;
  businessStatus?: "OPEN" | "BREAK" | "CLOSED";
  todayHours?: string;
  lat?: number;
  lng?: number;
}

// --- [최적화 1] 사이드바 리스트 아이템 컴포넌트 ---
const RestaurantListItem = React.memo(
  ({
    item,
    activeId,
    onClick,
    onFavorite,
  }: {
    item: ExtendedRestaurantData;
    activeId: number | null;
    onClick: (id: number) => void;
    onFavorite: (e: React.MouseEvent, id: number) => void;
  }) => {
    return (
      <div
        onClick={() => onClick(item.id)}
        className={`flex gap-4 p-4 border-b border-slate-100 cursor-pointer transition-colors bg-white hover:bg-slate-50 ${
          activeId === item.id
            ? "bg-green-50 border-green-200 ring-1 ring-inset ring-green-200"
            : ""
        }`}
      >
        <div className="relative w-20 h-20 rounded-lg overflow-hidden shrink-0 border border-slate-100 bg-slate-100">
          <img
            src={`/images/restaurantImages/${item.imagePath}`}
            alt={item.name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
        <div className="flex-1 min-w-0 flex flex-col justify-center">
          <div className="flex justify-between items-start">
            <h4
              className={`font-bold text-sm truncate ${
                activeId === item.id ? "text-green-700" : "text-slate-900"
              }`}
            >
              {item.name}
            </h4>
          </div>
          <p className="text-xs text-slate-500 mt-0.5 truncate">
            {item.address}
          </p>
          <div className="flex flex-wrap items-center gap-2 mt-2">
            <span className="text-[10px] font-bold text-slate-500 border border-slate-200 px-1.5 py-0.5 rounded bg-white">
              {item.restCategory}
            </span>
            {item.businessStatus === "OPEN" && (
              <span className="text-[10px] font-bold text-green-600 flex items-center gap-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>{" "}
                영업중
              </span>
            )}
            {item.businessStatus === "BREAK" && (
              <span className="text-[10px] font-bold text-orange-500">
                브레이크타임
              </span>
            )}
            {item.businessStatus === "CLOSED" && (
              <span className="text-[10px] font-bold text-slate-400">
                영업종료
              </span>
            )}
          </div>
        </div>
        <button
          onClick={(e) => onFavorite(e, item.id)}
          className="absolute top-2 right-2 p-2 text-slate-300 hover:text-orange-500 transition-colors"
        >
          <Heart
            size={16}
            className={item.isFavorite ? "fill-orange-500 text-orange-500" : ""}
          />
        </button>
      </div>
    );
  }
);
RestaurantListItem.displayName = "RestaurantListItem";

// --- [최적화 2] 지도 컨테이너 컴포넌트 ---
const KakaoMapContainer = React.memo(
  ({
    data,
    activeId,
    isSidebarOpen,
    onMarkerClick,
    onMapClick,
  }: {
    data: ExtendedRestaurantData[];
    activeId: number | null;
    isSidebarOpen: boolean;
    onMarkerClick: (item: ExtendedRestaurantData) => void;
    onMapClick: () => void;
  }) => {
    const mapRef = useRef<kakao.maps.Map | null>(null);

    const [isRoadviewMode, setIsRoadviewMode] = useState(false);
    const [roadviewPosition, setRoadviewPosition] = useState<{
      lat: number;
      lng: number;
      radius: number;
    }>({
      lat: 0,
      lng: 0,
      radius: 50,
    });

    const kakaoKey = process.env.NEXT_PUBLIC_KAKAO_JS_KEY;

    const [loading, error] = useKakaoLoader({
      appkey: kakaoKey || "dummy_key",
      libraries: ["services", "clusterer"],
      id: "kakao-map-script",
    });

    const [isForceLoaded, setIsForceLoaded] = useState(false);

    useEffect(() => {
      if (typeof window !== "undefined" && window.kakao && window.kakao.maps) {
        setIsForceLoaded(true);
        return;
      }
      const timer = setTimeout(() => {
        setIsForceLoaded(true);
      }, 3000);
      return () => clearTimeout(timer);
    }, []);

    // 사이드바 토글 시 지도 레이아웃 재계산
    useEffect(() => {
      if (mapRef.current) {
        setTimeout(() => {
          mapRef.current?.relayout();
        }, 300);
      }
    }, [isSidebarOpen]);

    // [핵심 수정] 지도 이동 및 확대 로직 개선 (위치 튐 방지)
    useEffect(() => {
      if (!mapRef.current || !activeId || isRoadviewMode) return;

      const target = data.find((d) => d.id === activeId);

      if (
        target &&
        typeof target.lat === "number" &&
        typeof target.lng === "number"
      ) {
        const moveLatLon = new kakao.maps.LatLng(target.lat, target.lng);
        const currentLevel = mapRef.current.getLevel();

        // 줌 레벨이 4보다 크면(멀면) 3으로 확대 후 이동
        if (currentLevel > 4) {
          mapRef.current.setLevel(3, { animate: true });

          // [수정] 줌 애니메이션과 이동이 겹치지 않게 지연 시간 부여
          // 이렇게 해야 좌표가 꼬이지 않고 정확하게 중앙으로 옵니다.
          setTimeout(() => {
            mapRef.current?.panTo(moveLatLon);
          }, 150);
        } else {
          // 이미 확대된 상태면 바로 부드럽게 이동
          mapRef.current.panTo(moveLatLon);
        }
      }
    }, [activeId, data, isRoadviewMode]);

    const handleOpenRoadview = useCallback((lat: number, lng: number) => {
      setRoadviewPosition({ lat, lng, radius: 50 });
      setIsRoadviewMode(true);
    }, []);

    // 현재 선택된 아이템 찾기 (오버레이 독립 렌더링용)
    const activeItem = useMemo(
      () => data.find((d) => d.id === activeId),
      [data, activeId]
    );

    if (!kakaoKey) {
      return (
        <div className="flex flex-col items-center justify-center h-full bg-slate-50 text-slate-500">
          <AlertCircle size={40} className="mb-2 text-red-400" />
          <p className="font-bold">API 키 확인 필요</p>
        </div>
      );
    }

    if (loading && !isForceLoaded) {
      return (
        <div className="flex flex-col items-center justify-center h-full bg-slate-50">
          <Loader2 className="animate-spin text-green-500 mb-2" size={32} />
          <p className="text-sm font-bold text-slate-400">
            지도를 불러오는 중...
          </p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex flex-col items-center justify-center h-full bg-slate-50 text-red-500">
          <AlertCircle size={32} className="mb-2" />
          <p>지도 로드 실패</p>
        </div>
      );
    }

    if (isRoadviewMode) {
      return (
        <div className="relative w-full h-full">
          <button
            onClick={() => setIsRoadviewMode(false)}
            className="absolute top-4 left-4 z-50 bg-white px-4 py-2 rounded-lg shadow-lg border border-slate-200 text-slate-700 font-bold flex items-center gap-2 hover:bg-slate-50 transition-transform hover:scale-105"
          >
            <Undo2 size={18} /> 지도 보기
          </button>
          <Roadview position={roadviewPosition} className="w-full h-full" />
        </div>
      );
    }

    return (
      <div className="w-full h-full [&_img]:max-w-none [&_img]:h-auto [&_img]:border-none">
        <KakaoMap
          center={{ lat: 36.3504, lng: 127.3845 }}
          className="w-full h-full"
          level={7}
          onCreate={(map) => (mapRef.current = map)}
          onClick={onMapClick}
        >
          <MarkerClusterer averageCenter={true} minLevel={6}>
            {data.map(
              (item) =>
                typeof item.lat === "number" &&
                typeof item.lng === "number" && (
                  <MapMarker
                    key={item.id}
                    position={{ lat: item.lat, lng: item.lng }}
                    onClick={() => onMarkerClick(item)}
                    image={{
                      src:
                        activeId === item.id
                          ? "https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/markerStar.png"
                          : "https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/marker_red.png",
                      size:
                        activeId === item.id
                          ? { width: 29, height: 42 }
                          : { width: 24, height: 35 },
                      options: {
                        offset:
                          activeId === item.id
                            ? { x: 14.5, y: 42 }
                            : { x: 12, y: 35 },
                      },
                    }}
                    zIndex={activeId === item.id ? 9999 : 1}
                    clickable={true}
                  />
                )
            )}
          </MarkerClusterer>

          {/* [핵심 수정] 오버레이를 MarkerClusterer 밖으로 빼서 독립적으로 렌더링 */}
          {/* 이렇게 하면 마커가 클러스터링 되거나 리렌더링 되는 순간에도 오버레이는 유지됩니다. */}
          {activeItem && activeItem.lat && activeItem.lng && (
            <CustomOverlayMap
              position={{ lat: activeItem.lat, lng: activeItem.lng }}
              yAnchor={1.4}
              zIndex={10000}
              clickable={true}
            >
              <div
                className="bg-white p-3 rounded-xl shadow-2xl border border-slate-100 w-56 animate-in zoom-in duration-200 relative pointer-events-auto cursor-default"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onMapClick();
                  }}
                  className="absolute top-2 right-2 text-slate-300 hover:text-red-500 bg-white rounded-full p-0.5 transition-colors z-10"
                >
                  <X size={16} />
                </button>

                <div className="mb-2 pr-5">
                  <h5 className="font-black text-sm text-slate-900 truncate">
                    {activeItem.name}
                  </h5>
                  <p className="text-[10px] text-slate-500 truncate mt-0.5">
                    {activeItem.address}
                  </p>
                </div>

                <div className="flex gap-2 mt-3">
                  <Link
                    href={`/restaurant/${activeItem.id}`}
                    className="flex-1 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold text-center rounded-lg transition-colors"
                  >
                    상세정보
                  </Link>
                  <button
                    onClick={() =>
                      handleOpenRoadview(activeItem.lat!, activeItem.lng!)
                    }
                    className="px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-100 rounded-lg transition-colors flex items-center justify-center"
                    title="로드뷰 보기"
                  >
                    <Eye size={16} />
                  </button>
                </div>
              </div>
            </CustomOverlayMap>
          )}
        </KakaoMap>
      </div>
    );
  }
);
KakaoMapContainer.displayName = "KakaoMapContainer";

// --- [메인 페이지 컴포넌트] ---
export default function RestaurantListPage() {
  const [restaurants, setRestaurants] = useState<ExtendedRestaurantData[]>([]);

  const [selectedCategory, setSelectedCategory] = useState("전체");
  const [showOpenOnly, setShowOpenOnly] = useState(false);
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(true);

  // View & Interaction State
  const [isMapView, setIsMapView] = useState(false);
  const [activeId, setActiveId] = useState<number | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // 부모 컴포넌트에서도 로더 상태 구독
  const [mapScriptLoading] = useKakaoLoader({
    appkey: process.env.NEXT_PUBLIC_KAKAO_JS_KEY || "dummy_key",
    libraries: ["services", "clusterer"],
    id: "kakao-map-script",
  });

  // Helpers
  const parseTime = useCallback((str: string) => {
    const [h, m] = str.split(":").map(Number);
    return h * 60 + m;
  }, []);

  const getBusinessStatus = useCallback(
    (
      timeString: string | undefined
    ): { status: "OPEN" | "BREAK" | "CLOSED"; todayStr: string } => {
      if (!timeString) return { status: "CLOSED", todayStr: "정보 없음" };

      const now = new Date();
      const dayIndex = now.getDay();
      const currentMinutes = now.getHours() * 60 + now.getMinutes();
      const daysKor = [
        "일요일",
        "월요일",
        "화요일",
        "수요일",
        "목요일",
        "금요일",
        "토요일",
      ];
      const todayLabel = daysKor[dayIndex];
      const isWeekend = dayIndex === 0 || dayIndex === 6;

      const rules = timeString.split("|").map((s) => s.trim());
      let targetRule = "";

      for (const rule of rules) {
        if (rule.includes(todayLabel)) {
          targetRule = rule;
          break;
        }
      }
      if (!targetRule) {
        for (const rule of rules) {
          if (isWeekend && (rule.includes("주말") || rule.includes("공휴일"))) {
            targetRule = rule;
            break;
          }
          if (!isWeekend && rule.includes("평일")) {
            targetRule = rule;
            break;
          }
        }
      }
      if (!targetRule) {
        for (const rule of rules) {
          if (
            rule.includes("매일") ||
            !rule.match(/(월|화|수|목|금|토|일)요일|평일|주말/)
          ) {
            targetRule = rule;
            break;
          }
        }
      }

      if (!targetRule || targetRule.includes("휴무"))
        return { status: "CLOSED", todayStr: "금일 휴무" };

      const timeMatch = targetRule.match(
        /(\d{1,2}:\d{2})\s*~\s*(\d{1,2}:\d{2})/
      );
      if (!timeMatch) return { status: "CLOSED", todayStr: targetRule };

      const [_, openStr, closeStr] = timeMatch;
      const openMin = parseTime(openStr);
      let closeMin = parseTime(closeStr);
      if (closeMin < openMin) closeMin += 24 * 60;

      const breakMatch = timeString.match(
        /(\d{1,2}:\d{2})\s*~\s*(\d{1,2}:\d{2}).*(브레이크|break)/i
      );
      if (breakMatch) {
        const [__, bStart, bEnd] = breakMatch;
        const bStartMin = parseTime(bStart);
        const bEndMin = parseTime(bEnd);
        if (currentMinutes >= bStartMin && currentMinutes < bEndMin) {
          return { status: "BREAK", todayStr: `${openStr} ~ ${closeStr}` };
        }
      }

      if (currentMinutes >= openMin && currentMinutes < closeMin) {
        return { status: "OPEN", todayStr: `${openStr} ~ ${closeStr}` };
      }
      return { status: "CLOSED", todayStr: `${openStr} ~ ${closeStr}` };
    },
    [parseTime]
  );

  // Data Fetching
  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        setLoading(true);
        const [restaurantsRes, favoritesRes] = await Promise.allSettled([
          restaurantService.getRestaurants(),
          userService.getFavorites(),
        ]);

        await new Promise((resolve) => setTimeout(resolve, 500));

        let allRestaurants: any[] = [];
        const myFavoriteIds = new Set<number>();

        if (restaurantsRes.status === "fulfilled")
          allRestaurants = restaurantsRes.value.data;
        if (favoritesRes.status === "fulfilled") {
          const favoriteList = favoritesRes.value.data;
          if (Array.isArray(favoriteList))
            favoriteList.forEach((item: any) => myFavoriteIds.add(item.id));
        }

        const mergedList = allRestaurants.map((item) => {
          const { status, todayStr } = getBusinessStatus(
            item.restOpenTime || item.openTime
          );
          return {
            ...item,
            isFavorite: myFavoriteIds.has(item.id),
            businessStatus: status,
            todayHours: todayStr,
          } as ExtendedRestaurantData;
        });

        setRestaurants(mergedList);
      } catch (error) {
        console.error("Error fetching:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchRestaurants();
  }, [getBusinessStatus]);

  // Filtering (useMemo)
  const filteredList = useMemo(() => {
    let result = restaurants;

    if (selectedCategory !== "전체") {
      result = result.filter((item) => item.restCategory === selectedCategory);
    }

    const trimmedKeyword = keyword.trim();
    if (trimmedKeyword !== "") {
      const searchTerms = trimmedKeyword.split(/\s+/);
      result = result.filter((item) => {
        const name = item.name || "";
        const menu = (item.menu || []).join(" ");
        const category = item.restCategory || "";
        return searchTerms.every(
          (term) =>
            name.includes(term) ||
            menu.includes(term) ||
            category.includes(term)
        );
      });
    }

    if (showOpenOnly) {
      result = result.filter((item) => item.businessStatus === "OPEN");
    }

    return result;
  }, [restaurants, selectedCategory, keyword, showOpenOnly]);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, keyword, showOpenOnly]);

  // Geocoding (순차 처리)
  useEffect(() => {
    if (filteredList.length === 0) return;

    const itemsToGeocode = filteredList.filter(
      (item) => !item.lat && item.address
    );
    if (itemsToGeocode.length === 0) return;

    if (
      mapScriptLoading ||
      typeof window === "undefined" ||
      !window.kakao ||
      !window.kakao.maps?.services
    ) {
      return;
    }

    const geocoder = new window.kakao.maps.services.Geocoder();

    const processGeocoding = async () => {
      const updatedCoords = new Map<number, { lat: number; lng: number }>();

      const promises = itemsToGeocode.map((item) => {
        return new Promise<void>((resolve) => {
          if (!item.address) {
            resolve();
            return;
          }
          geocoder.addressSearch(item.address, (result, status) => {
            if (status === window.kakao.maps.services.Status.OK) {
              updatedCoords.set(item.id, {
                lat: Number(result[0].y),
                lng: Number(result[0].x),
              });
            }
            resolve();
          });
        });
      });

      await Promise.all(promises);

      if (updatedCoords.size > 0) {
        setRestaurants((prev) =>
          prev.map((item) => {
            const coords = updatedCoords.get(item.id);
            return coords
              ? { ...item, lat: coords.lat, lng: coords.lng }
              : item;
          })
        );
      }
    };

    processGeocoding();
  }, [filteredList, mapScriptLoading]);

  // Handlers
  const toggleFavorite = useCallback(
    async (e: React.MouseEvent, id: number) => {
      e.preventDefault();
      e.stopPropagation();
      try {
        await restaurantService.toggleFavorite(id);
        setRestaurants((prev) =>
          prev.map((item) =>
            item.id === id ? { ...item, isFavorite: !item.isFavorite } : item
          )
        );
      } catch (error) {
        alert("로그인이 필요합니다.");
      }
    },
    []
  );

  const handleFilter = useCallback(
    (category: string) => setSelectedCategory(category),
    []
  );
  const handleMarkerClick = useCallback(
    (item: ExtendedRestaurantData) => setActiveId(item.id),
    []
  );
  const handleMapClick = useCallback(() => setActiveId(null), []);

  const totalPages = Math.ceil(filteredList.length / itemsPerPage);
  const currentItems = filteredList.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="w-full bg-[#fcfcfc] min-h-screen pb-24 font-pretendard">
      {/* 1. Header */}
      <div className="bg-white border-b border-slate-100 pt-20 pb-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 mb-3 bg-green-50 text-green-700 rounded-full text-xs font-black tracking-tight w-fit">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            DAEJEON NOW
          </div>

          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div>
              <h1 className="text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-[1.1] mb-2">
                <span className="text-transparent bg-clip-text bg-linear-to-r from-green-600 to-green-400">
                  대전의 맛
                </span>
                을 찾아서
              </h1>
              <p className="text-slate-500 font-medium">
                현지인이 추천하는 진짜 맛집 리스트를 카테고리별로 확인하세요.
              </p>
            </div>

            {!isMapView && (
              <div className="relative w-full lg:w-96 mb-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <Search
                  className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400"
                  size={20}
                />
                <input
                  type="text"
                  placeholder="맛집 이름, 메뉴 검색..."
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
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between mt-10 gap-4">
            <div className="flex flex-wrap items-center gap-2">
              {[
                "전체",
                "한식",
                "일식",
                "중식",
                "양식",
                "분식",
                "치킨",
                "카페·디저트",
              ].map((cat) => (
                <button
                  key={cat}
                  onClick={() => handleFilter(cat)}
                  className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all ${
                    selectedCategory === cat
                      ? "bg-green-600 text-white shadow-lg shadow-green-100"
                      : "bg-white border border-slate-200 text-slate-600 hover:border-slate-900"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowOpenOnly(!showOpenOnly)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold transition-all border shrink-0 ${
                  showOpenOnly
                    ? "bg-green-50 border-green-200 text-green-700 ring-2 ring-green-500/20"
                    : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50"
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${
                    showOpenOnly
                      ? "bg-green-500 border-green-500"
                      : "border-slate-300 bg-white"
                  }`}
                >
                  {showOpenOnly && <Check size={10} className="text-white" />}
                </div>
                <Clock size={16} />
                <span>영업 중만 보기</span>
              </button>

              <button
                onClick={() => setIsMapView(!isMapView)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold transition-all border shrink-0 ${
                  isMapView
                    ? "bg-slate-900 text-white border-slate-900"
                    : "bg-white border-slate-200 text-slate-900 hover:bg-slate-50"
                }`}
              >
                {isMapView ? (
                  <>
                    <ListIcon size={16} />
                    <span>리스트로 보기</span>
                  </>
                ) : (
                  <>
                    <MapIcon size={16} />
                    <span>지도로 보기</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Content */}
      <div className="max-w-7xl mx-auto px-6 mt-8">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {Array(8)
              .fill(0)
              .map((_, i) => (
                <div
                  key={i}
                  className="bg-white rounded-[2.5rem] overflow-hidden border border-slate-100 shadow-sm animate-pulse h-[380px] flex flex-col"
                >
                  <div className="h-48 bg-slate-200 w-full" />
                  <div className="p-6 flex-1 space-y-3">
                    <div className="h-7 bg-slate-200 rounded w-3/4" />
                    <div className="h-4 bg-slate-200 rounded w-1/2" />
                    <div className="h-4 bg-slate-200 rounded w-full mt-6" />
                  </div>
                </div>
              ))}
          </div>
        ) : isMapView ? (
          <div className="flex h-[750px] w-full bg-white rounded-2xl overflow-hidden shadow-2xl border border-slate-200 relative">
            {/* Sidebar */}
            <div
              className={`flex flex-col bg-white border-r border-slate-100 transition-all duration-300 ease-in-out relative z-10 ${
                isSidebarOpen
                  ? "w-[400px] min-w-[320px]"
                  : "w-0 min-w-0 overflow-hidden"
              }`}
            >
              <div className="p-4 pb-2 bg-white sticky top-0 z-20">
                <div className="relative">
                  <Search
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    size={18}
                  />
                  <input
                    type="text"
                    placeholder="지도 내 검색 (가게명, 메뉴)"
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    className="w-full pl-10 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-green-500 focus:bg-white transition-all"
                  />
                  {keyword && (
                    <button
                      onClick={() => setKeyword("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-green-600"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
              </div>

              <div className="px-4 py-2 border-b border-slate-100 bg-white flex items-center justify-between shrink-0">
                <span className="text-sm font-bold text-slate-600">
                  검색 결과{" "}
                  <span className="text-green-600">{filteredList.length}</span>
                  개
                </span>
                <button
                  onClick={() => setIsSidebarOpen(false)}
                  className="p-1.5 hover:bg-slate-100 rounded-md text-slate-400 lg:hidden"
                >
                  <ChevronLeft size={16} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar bg-slate-50/50">
                {filteredList.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-64 text-slate-400 gap-2">
                    <Search size={32} className="opacity-20" />
                    <p className="text-xs font-bold">검색 결과가 없습니다.</p>
                  </div>
                ) : (
                  filteredList.map((item) => (
                    <RestaurantListItem
                      key={item.id}
                      item={item}
                      activeId={activeId}
                      onClick={setActiveId}
                      onFavorite={toggleFavorite}
                    />
                  ))
                )}
              </div>
            </div>

            {/* Map Area */}
            <div className="flex-1 relative h-full bg-slate-100 overflow-hidden">
              {!isSidebarOpen && (
                <button
                  onClick={() => setIsSidebarOpen(true)}
                  className="absolute top-4 left-4 z-20 bg-white p-2.5 rounded-lg shadow-md border border-slate-200 text-slate-600 hover:text-green-600 transition-transform hover:scale-105"
                >
                  <ChevronRight size={20} />
                </button>
              )}

              <KakaoMapContainer
                data={filteredList}
                activeId={activeId}
                isSidebarOpen={isSidebarOpen}
                onMarkerClick={handleMarkerClick}
                onMapClick={handleMapClick}
              />
            </div>
          </div>
        ) : filteredList.length === 0 ? (
          <div className="py-32 flex flex-col items-center justify-center bg-white rounded-[2.5rem] border border-dashed border-gray-200 text-center">
            <div className="text-4xl mb-4">😢</div>
            <h3 className="text-xl font-black text-slate-900 mb-2">
              검색된 맛집이 없습니다.
            </h3>
            <p className="text-slate-500 text-sm">
              다른 키워드로 검색해보세요.
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {currentItems.map((item) => (
                <div key={item.id} className="relative group">
                  <button
                    onClick={(e) => toggleFavorite(e, item.id)}
                    className="absolute top-4 right-4 z-20 p-2.5 rounded-full bg-white/80 backdrop-blur-md shadow-sm transition-all hover:scale-110 active:scale-90 border border-slate-100"
                  >
                    <Heart
                      size={18}
                      className={`${
                        item.isFavorite
                          ? "fill-orange-500 text-orange-500"
                          : "text-slate-400"
                      }`}
                    />
                  </button>
                  <Link
                    href={`/restaurant/${item.id}`}
                    className="block h-full"
                  >
                    <div className="bg-white rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 border border-slate-100 h-full flex flex-col">
                      <div className="relative aspect-video overflow-hidden">
                        <img
                          src={`/images/restaurantImages/${item.imagePath}`}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                          alt={item.name}
                          loading="lazy"
                        />
                        <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm px-3 py-1 rounded-full text-[10px] font-black text-green-600 shadow-sm">
                          {item.restCategory}
                        </div>
                        {item.businessStatus &&
                          item.businessStatus !== "CLOSED" && (
                            <div
                              className={`absolute bottom-4 left-4 px-3 py-1 rounded-full text-[10px] font-bold shadow-md flex items-center gap-1 text-white ${
                                item.businessStatus === "OPEN"
                                  ? "bg-green-500"
                                  : "bg-orange-500"
                              }`}
                            >
                              <Clock size={10} />
                              {item.businessStatus === "OPEN"
                                ? "영업중"
                                : "브레이크타임"}
                            </div>
                          )}
                        {item.businessStatus === "CLOSED" && (
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-[2px]">
                            <span className="text-white font-black border-2 border-white px-4 py-2 rounded-xl">
                              영업종료
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="p-6 flex flex-col grow">
                        <h3 className="text-lg font-black text-slate-900 mb-2 group-hover:text-green-600 transition-colors">
                          {item.name}
                        </h3>
                        <div className="flex items-center gap-1 text-slate-400 text-[11px] mb-4 font-medium">
                          <MapPin size={12} className="text-slate-300" />
                          <span className="line-clamp-1">{item.address}</span>
                        </div>
                        <div className="mt-auto pt-4 border-t border-slate-50 flex flex-col gap-1">
                          <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">
                            Best Menu
                          </span>
                          <span className="text-orange-600 font-bold text-sm truncate">
                            {item.bestMenu || "추천메뉴"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </div>
              ))}
            </div>

            <div className="mt-12">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                themeColor="black"
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
