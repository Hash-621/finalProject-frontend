"use client"; // 이 코드는 브라우저(클라이언트)에서 실행됩니다.

// --- [Imports] 필요한 도구들을 불러옵니다 ---
import React, {
  useEffect, // 화면이 켜지거나 상태가 바뀔 때 실행할 작업 정의
  useState, // 화면 상태(데이터) 저장
  useRef, // 지도 객체 같은 DOM 요소나 변수 직접 참조
  useMemo, // 복잡한 계산 결과 저장 (성능 최적화)
  useCallback, // 함수 재생성 방지 (성능 최적화)
} from "react";
import Link from "next/link"; // 페이지 이동 링크
import { restaurantService, userService } from "@/api/services"; // API 호출 함수들
import { RestaurantData } from "@/types/restaurant"; // 타입 정의
// 아이콘들 불러오기
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
import Pagination from "@/components/common/Pagination"; // 페이지네이션 컴포넌트
// 카카오맵 라이브러리 불러오기
import {
  Map as KakaoMap,
  MapMarker,
  MarkerClusterer,
  useKakaoLoader,
  CustomOverlayMap,
  Roadview,
} from "react-kakao-maps-sdk";

import makerImg from "../../../public/images/mapMaker.png"; // 커스텀 마커 이미지

// --- [타입 정의] 기본 맛집 데이터에 추가 정보(영업상태, 좌표 등)를 더한 타입 ---
interface ExtendedRestaurantData extends RestaurantData {
  restOpenTime?: string; // 영업시간 문자열
  businessStatus?: "OPEN" | "BREAK" | "CLOSED"; // 현재 영업 상태
  todayHours?: string; // 오늘 영업 시간
  lat?: number; // 위도
  lng?: number; // 경도
}

// ==================================================================
// [Component 1] 사이드바 리스트 아이템 (지도 뷰에서 왼쪽 목록)
// React.memo를 사용하여 리스트가 변경되지 않으면 다시 그리지 않게 최적화함
// ==================================================================
const RestaurantListItem = React.memo(
  ({
    item, // 맛집 데이터 하나
    activeId, // 현재 선택된 맛집 ID
    onClick, // 클릭 시 실행할 함수
    onFavorite, // 찜하기 버튼 클릭 시 실행할 함수
  }: {
    item: ExtendedRestaurantData;
    activeId: number | null;
    onClick: (id: number) => void;
    onFavorite: (e: React.MouseEvent, id: number) => void;
  }) => {
    return (
      <div
        onClick={() => onClick(item.id)} // 클릭하면 부모에게 "나 선택됐어!" 알림
        className={`flex gap-4 p-4 border-b border-slate-100 cursor-pointer transition-colors bg-white hover:bg-slate-50 ${
          activeId === item.id
            ? "bg-green-50 border-green-200 ring-1 ring-inset ring-green-200" // 선택된 상태면 초록색 배경
            : ""
        }`}
      >
        {/* 썸네일 이미지 영역 */}
        <div className="relative w-20 h-20 rounded-lg overflow-hidden shrink-0 border border-slate-100 bg-slate-100">
          <img
            src={`/images/restaurantImages/${item.imagePath}`}
            alt={item.name}
            className="w-full h-full object-cover"
            loading="lazy" // 성능을 위해 화면에 보일 때 로딩
          />
        </div>

        {/* 텍스트 정보 영역 */}
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

          {/* 태그 영역 (카테고리, 영업상태) */}
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

        {/* 찜하기 하트 버튼 */}
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
RestaurantListItem.displayName = "RestaurantListItem"; // 디버깅용 이름 설정

// ==================================================================
// [Component 2] 카카오맵 컨테이너 (지도 화면)
// 역시 React.memo로 불필요한 렌더링 방지
// ==================================================================
const KakaoMapContainer = React.memo(
  ({
    data, // 지도에 표시할 맛집 데이터들
    activeId, // 현재 선택된 맛집 ID
    isSidebarOpen, // 사이드바가 열려있는지 여부
    onMarkerClick, // 마커 클릭 핸들러
    onMapClick, // 지도 빈 곳 클릭 핸들러
  }: {
    data: ExtendedRestaurantData[];
    activeId: number | null;
    isSidebarOpen: boolean;
    onMarkerClick: (item: ExtendedRestaurantData) => void;
    onMapClick: () => void;
  }) => {
    const mapRef = useRef<kakao.maps.Map | null>(null); // 지도 객체 저장용 Ref

    // 로드뷰 상태 관리
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

    const kakaoKey = process.env.NEXT_PUBLIC_KAKAO_JS_KEY; // API 키 가져오기

    // 카카오맵 스크립트 로더 훅 (라이브러리 사용)
    const [loading, error] = useKakaoLoader({
      appkey: kakaoKey || "dummy_key",
      libraries: ["services", "clusterer"], // 필요한 라이브러리들
      id: "kakao-map-script",
    });

    // 스크립트 로드 완료 여부를 확실히 체크하기 위한 상태
    const [isForceLoaded, setIsForceLoaded] = useState(false);

    // 이미 로드되어 있는지 체크 (페이지 이동했다 돌아왔을 때 등)
    useEffect(() => {
      if (typeof window !== "undefined" && window.kakao && window.kakao.maps) {
        setIsForceLoaded(true);
        return;
      }
      // 혹시 로딩이 너무 길어지면 강제로 로드 완료 처리 (3초 타임아웃)
      const timer = setTimeout(() => {
        setIsForceLoaded(true);
      }, 3000);
      return () => clearTimeout(timer);
    }, []);

    // 사이드바 토글 시 지도 레이아웃 재계산 (지도가 찌그러지지 않게)
    useEffect(() => {
      if (mapRef.current) {
        setTimeout(() => {
          mapRef.current?.relayout();
        }, 300);
      }
    }, [isSidebarOpen]);

    // [중요] 특정 맛집이 선택되면(activeId) 지도를 그곳으로 이동시키는 로직
    useEffect(() => {
      if (!mapRef.current || !activeId || isRoadviewMode) return;

      const target = data.find((d) => d.id === activeId);

      // 좌표가 있는 경우에만 이동
      if (
        target &&
        typeof target.lat === "number" &&
        typeof target.lng === "number"
      ) {
        const moveLatLon = new kakao.maps.LatLng(target.lat, target.lng);
        const currentLevel = mapRef.current.getLevel();

        // 지도가 너무 축소되어 있으면(레벨 > 4), 확대하면서 이동
        if (currentLevel > 4) {
          mapRef.current.setLevel(3, { animate: true });

          // 줌 애니메이션과 이동이 겹치지 않게 약간의 딜레이 후 이동
          setTimeout(() => {
            mapRef.current?.panTo(moveLatLon);
          }, 150);
        } else {
          // 이미 확대된 상태면 바로 부드럽게 이동
          mapRef.current.panTo(moveLatLon);
        }
      }
    }, [activeId, data, isRoadviewMode]);

    // 로드뷰 열기 함수
    const handleOpenRoadview = useCallback((lat: number, lng: number) => {
      setRoadviewPosition({ lat, lng, radius: 50 });
      setIsRoadviewMode(true);
    }, []);

    // 현재 선택된 아이템 찾기 (오버레이 표시용)
    const activeItem = useMemo(
      () => data.find((d) => d.id === activeId),
      [data, activeId]
    );

    // API 키가 없으면 에러 표시
    if (!kakaoKey) {
      return (
        <div className="flex flex-col items-center justify-center h-full bg-slate-50 text-slate-500">
          <AlertCircle size={40} className="mb-2 text-red-400" />
          <p className="font-bold">API 키 확인 필요</p>
        </div>
      );
    }

    // 로딩 중이면 로딩 표시
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

    // 에러 발생 시
    if (error) {
      return (
        <div className="flex flex-col items-center justify-center h-full bg-slate-50 text-red-500">
          <AlertCircle size={32} className="mb-2" />
          <p>지도 로드 실패</p>
        </div>
      );
    }

    // 로드뷰 모드일 때 화면
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

    // 일반 지도 렌더링
    return (
      <div className="w-full h-full [&_img]:max-w-none [&_img]:h-auto [&_img]:border-none">
        <KakaoMap
          center={{ lat: 36.3504, lng: 127.3845 }} // 초기 중심 좌표 (대전)
          className="w-full h-full"
          level={7} // 초기 확대 레벨
          onCreate={(map) => (mapRef.current = map)} // 지도 생성 시 Ref에 저장
          onClick={onMapClick} // 지도 빈 곳 클릭 시
        >
          {/* 마커 클러스터러: 마커가 많으면 묶어서 보여줌 */}
          <MarkerClusterer averageCenter={true} minLevel={6}>
            {data.map(
              (item) =>
                // 좌표가 있는 아이템만 마커 생성
                typeof item.lat === "number" &&
                typeof item.lng === "number" && (
                  <MapMarker
                    key={item.id}
                    position={{ lat: item.lat, lng: item.lng }}
                    onClick={() => onMarkerClick(item)} // 마커 클릭 시
                    image={{
                      src:
                        activeId === item.id
                          ? "https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/markerStar.png" // 선택된 마커 (별)
                          : makerImg.src, // 기본 마커 (커스텀 이미지)
                      size:
                        activeId === item.id
                          ? { width: 29, height: 42 }
                          : { width: 34, height: 35 },
                      options: {
                        offset:
                          activeId === item.id
                            ? { x: 14.5, y: 42 }
                            : { x: 12, y: 35 },
                      },
                    }}
                    zIndex={activeId === item.id ? 9999 : 1} // 선택된 마커를 맨 위로
                    clickable={true}
                  />
                )
            )}
          </MarkerClusterer>

          {/* 선택된 마커 위에 뜨는 정보창 (오버레이) */}
          {activeItem && activeItem.lat && activeItem.lng && (
            <CustomOverlayMap
              position={{ lat: activeItem.lat, lng: activeItem.lng }}
              yAnchor={1.4} // 마커 위쪽으로 띄우기
              zIndex={10000}
              clickable={true}
            >
              <div
                className="bg-white p-3 rounded-xl shadow-2xl border border-slate-100 w-56 animate-in zoom-in duration-200 relative pointer-events-auto cursor-default"
                onClick={(e) => e.stopPropagation()} // 오버레이 클릭 시 지도 클릭 이벤트 방지
              >
                {/* 닫기 버튼 */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onMapClick(); // 닫기 누르면 선택 해제
                  }}
                  className="absolute top-2 right-2 text-slate-300 hover:text-red-500 bg-white rounded-full p-0.5 transition-colors z-10"
                >
                  <X size={16} />
                </button>

                {/* 가게 정보 */}
                <div className="mb-2 pr-5">
                  <h5 className="font-black text-sm text-slate-900 truncate">
                    {activeItem.name}
                  </h5>
                  <p className="text-[10px] text-slate-500 truncate mt-0.5">
                    {activeItem.address}
                  </p>
                </div>

                {/* 버튼들 */}
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
KakaoMapContainer.displayName = "KakaoMapContainer"; // 디버깅용 이름

// ==================================================================
// [Component 3] 메인 페이지 컴포넌트
// ==================================================================
export default function RestaurantListPage() {
  // --- [State] 데이터 및 UI 상태 ---
  const [restaurants, setRestaurants] = useState<ExtendedRestaurantData[]>([]); // 전체 맛집 데이터

  // 필터링 관련 상태
  const [selectedCategory, setSelectedCategory] = useState("전체"); // 카테고리 필터
  const [showOpenOnly, setShowOpenOnly] = useState(false); // 영업중 필터
  const [keyword, setKeyword] = useState(""); // 검색어
  const [loading, setLoading] = useState(true); // 로딩 상태

  // 뷰 모드 및 지도 관련 상태
  const [isMapView, setIsMapView] = useState(false); // 지도 뷰인지 여부
  const [activeId, setActiveId] = useState<number | null>(null); // 선택된 맛집 ID
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // 지도뷰에서 사이드바 열림 여부

  // 페이지네이션
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8; // 한 페이지당 보여줄 개수

  // 상위 컴포넌트에서도 지도 스크립트 로더 상태 확인
  const [mapScriptLoading] = useKakaoLoader({
    appkey: process.env.NEXT_PUBLIC_KAKAO_JS_KEY || "dummy_key",
    libraries: ["services", "clusterer"],
    id: "kakao-map-script",
  });

  // --- [Helper Functions] 시간 계산 및 영업상태 판단 ---

  // "14:30" 문자열을 870(분)으로 변환
  const parseTime = useCallback((str: string) => {
    const [h, m] = str.split(":").map(Number);
    return h * 60 + m;
  }, []);

  // 영업시간 문자열을 파싱해서 현재 상태(OPEN/CLOSED/BREAK) 반환
  const getBusinessStatus = useCallback(
    (
      timeString: string | undefined
    ): { status: "OPEN" | "BREAK" | "CLOSED"; todayStr: string } => {
      if (!timeString) return { status: "CLOSED", todayStr: "정보 없음" };

      const now = new Date();
      const dayIndex = now.getDay(); // 0(일) ~ 6(토)
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

      // 영업시간 문자열 파싱 로직 (복잡한 룰 처리)
      const rules = timeString.split("|").map((s) => s.trim());
      let targetRule = "";

      // 1. 요일별 규칙 찾기
      for (const rule of rules) {
        if (rule.includes(todayLabel)) {
          targetRule = rule;
          break;
        }
      }
      // 2. 평일/주말 규칙 찾기
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
      // 3. 매일/기타 규칙 찾기
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

      // 시간 추출 (예: 10:00 ~ 22:00)
      const timeMatch = targetRule.match(
        /(\d{1,2}:\d{2})\s*~\s*(\d{1,2}:\d{2})/
      );
      if (!timeMatch) return { status: "CLOSED", todayStr: targetRule };

      const [_, openStr, closeStr] = timeMatch;
      const openMin = parseTime(openStr);
      let closeMin = parseTime(closeStr);
      if (closeMin < openMin) closeMin += 24 * 60; // 새벽까지 영업 시

      // 브레이크 타임 체크
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

      // 최종 상태 판단
      if (currentMinutes >= openMin && currentMinutes < closeMin) {
        return { status: "OPEN", todayStr: `${openStr} ~ ${closeStr}` };
      }
      return { status: "CLOSED", todayStr: `${openStr} ~ ${closeStr}` };
    },
    [parseTime]
  );

  // --- [Effect] 데이터 가져오기 ---
  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        setLoading(true);
        // 맛집 데이터와 즐겨찾기 데이터를 병렬로 요청 (Promise.allSettled)
        const [restaurantsRes, favoritesRes] = await Promise.allSettled([
          restaurantService.getRestaurants(),
          userService.getFavorites(),
        ]);

        await new Promise((resolve) => setTimeout(resolve, 500)); // 로딩 느낌을 위한 최소 딜레이

        let allRestaurants: any[] = [];
        const myFavoriteIds = new Set<number>();

        if (restaurantsRes.status === "fulfilled")
          allRestaurants = restaurantsRes.value.data;
        if (favoritesRes.status === "fulfilled") {
          const favoriteList = favoritesRes.value.data;
          if (Array.isArray(favoriteList))
            favoriteList.forEach((item: any) => myFavoriteIds.add(item.id));
        }

        // 데이터 합치기 (맛집 정보 + 영업 상태 + 찜 여부)
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

  // --- [Memo] 필터링 로직 (성능 최적화) ---
  const filteredList = useMemo(() => {
    let result = restaurants;

    // 1. 카테고리 필터
    if (selectedCategory !== "전체") {
      result = result.filter((item) => item.restCategory === selectedCategory);
    }

    // 2. 키워드 검색
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

    // 3. 영업중 필터
    if (showOpenOnly) {
      result = result.filter((item) => item.businessStatus === "OPEN");
    }

    return result;
  }, [restaurants, selectedCategory, keyword, showOpenOnly]);

  // 필터가 바뀌면 1페이지로 리셋
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, keyword, showOpenOnly]);

  // --- [Effect] 주소 -> 좌표 변환 (Geocoding) ---
  useEffect(() => {
    if (filteredList.length === 0) return;

    // 좌표가 없는 아이템만 골라냄
    const itemsToGeocode = filteredList.filter(
      (item) => !item.lat && item.address
    );
    if (itemsToGeocode.length === 0) return;

    // 카카오맵 스크립트가 로드되었는지 확인
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

      // 변환된 좌표를 상태에 업데이트
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

  // --- [Handlers] 이벤트 핸들러들 ---

  // 찜하기 토글
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

  // 필터 변경
  const handleFilter = useCallback(
    (category: string) => setSelectedCategory(category),
    []
  );
  // 마커 클릭
  const handleMarkerClick = useCallback(
    (item: ExtendedRestaurantData) => setActiveId(item.id),
    []
  );
  // 지도 빈 곳 클릭 (선택 해제)
  const handleMapClick = useCallback(() => setActiveId(null), []);

  // 페이지네이션 계산 (현재 페이지 아이템 자르기)
  const totalPages = Math.ceil(filteredList.length / itemsPerPage);
  const currentItems = filteredList.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // -----------------------------------------------------------
  // [Render] 화면 렌더링 시작
  // -----------------------------------------------------------
  return (
    <div className="w-full bg-[#fcfcfc] min-h-screen pb-24 font-pretendard">
      {/* 1. Header (제목 및 검색/필터 영역) */}
      <div className="bg-white border-b border-slate-100 pt-20 pb-10">
        <div className="max-w-7xl mx-auto px-6">
          {/* 배지 */}
          <div className="inline-flex items-center gap-2 px-3 py-1 mb-3 bg-green-50 text-green-700 rounded-full text-xs font-black tracking-tight w-fit">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            DAEJEON NOW
          </div>

          {/* 제목 및 검색창 */}
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

            {/* 그리드 뷰일 때만 상단 검색창 표시 */}
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

          {/* 필터 버튼들 */}
          <div className="flex flex-col sm:flex-row items-center justify-between mt-10 gap-4">
            {/* 카테고리 필터 */}
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

            {/* 기능 버튼 (영업중 필터, 지도뷰 토글) */}
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

      {/* 2. Content (목록 or 지도) */}
      <div className="max-w-7xl mx-auto px-6 mt-8">
        {loading ? (
          // 로딩 스켈레톤
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
          // [View Mode] 지도 뷰
          <div className="flex h-[750px] w-full bg-white rounded-2xl overflow-hidden shadow-2xl border border-slate-200 relative">
            {/* Sidebar (검색 및 리스트) */}
            <div
              className={`flex flex-col bg-white border-r border-slate-100 transition-all duration-300 ease-in-out relative z-10 ${
                isSidebarOpen
                  ? "w-[400px] min-w-[320px]"
                  : "w-0 min-w-0 overflow-hidden"
              }`}
            >
              {/* 사이드바 내부 검색창 */}
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

              {/* 검색 결과 카운트 & 닫기 버튼 */}
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

              {/* 리스트 목록 */}
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
              {/* 사이드바 열기 버튼 */}
              {!isSidebarOpen && (
                <button
                  onClick={() => setIsSidebarOpen(true)}
                  className="absolute top-4 left-4 z-20 bg-white p-2.5 rounded-lg shadow-md border border-slate-200 text-slate-600 hover:text-green-600 transition-transform hover:scale-105"
                >
                  <ChevronRight size={20} />
                </button>
              )}

              {/* 지도 컴포넌트 */}
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
          // [View Mode] 그리드 뷰 - 검색 결과 없음
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
          // [View Mode] 그리드 뷰 - 목록 표시
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {currentItems.map((item) => (
                <div key={item.id} className="relative group">
                  {/* 찜하기 버튼 (카드 우상단) */}
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
                      {/* 이미지 영역 */}
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
                        {/* 영업상태 뱃지 */}
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

                      {/* 텍스트 영역 */}
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

            {/* 페이지네이션 (그리드 뷰에서만 사용) */}
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

// 데이터 준비 (로딩): 페이지에 들어오면 서버에서 전체 맛집 데이터와 나의 찜 목록을 가져옵니다. 이때 화면은 스켈레톤 UI(회색 박스들이 반짝이는 것)를 보여주어 지루함을 덜어줍니다.

// 데이터 가공: 가져온 데이터에 "지금 영업 중인가?"(Open/Closed), "내가 찜했나?"(IsFavorite), "위도/경도 좌표는 어디인가?" 등의 정보를 추가합니다.

// 화면 표시 (기본: 그리드 뷰): 카드 형태의 맛집 목록이 쫘르륵 뜹니다.

// 검색 & 필터: 상단 검색창에 "치킨"을 치거나, "한식" 버튼을 누르면 즉시 목록이 바뀝니다.

// 영업 중 필터: "영업 중만 보기"를 체크하면 문 닫은 가게는 싹 사라집니다.

// 지도 보기 전환: "지도로 보기" 버튼을 누르면 화면이 바뀝니다.

// 왼쪽: 검색 결과를 보여주는 리스트 사이드바가 생깁니다.

// 오른쪽: 카카오맵이 뜨고 맛집 위치에 마커들이 찍힙니다.

// 상호작용: 리스트에서 가게를 클릭하면 지도가 그곳으로 이동하고, 지도 마커를 클릭하면 가게 정보가 말풍선(오버레이)으로 뜹니다.

// 로드뷰: 눈 모양 아이콘을 누르면 거리뷰(로드뷰) 모드로 전환되어 주변을 둘러볼 수 있습니다.
