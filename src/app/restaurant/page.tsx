"use client"; // 이 파일이 브라우저(클라이언트 사이드)에서 실행되는 컴포넌트임을 Next.js에게 알립니다.

// --- [Imports] React 및 외부 라이브러리, 내부 모듈들을 불러옵니다 ---
import React, {
  useEffect, // 컴포넌트 마운트/업데이트 시 사이드 이펙트(데이터 가져오기 등)를 처리하는 훅
  useState, // 컴포넌트 내부의 상태 값을 관리하는 훅
  useRef, // DOM 요소나 특정 값을 렌더링 없이 유지하기 위해 사용하는 훅 (지도 객체 참조용)
  useMemo, // 연산 비용이 높은 작업의 결과를 캐싱하여 성능을 최적화하는 훅 (필터링 로직용)
  useCallback, // 함수를 메모이제이션하여 불필요한 재생성을 방지하는 훅 (핸들러 최적화용)
  Suspense, // 비동기 컴포넌트 로딩 중 대체 UI(로딩 스피너)를 보여주기 위한 React 내장 컴포넌트
} from "react";
import Link from "next/link"; // 페이지 이동을 위한 Next.js 링크 컴포넌트 (SPA 방식 이동)
import { restaurantService, userService } from "@/api/services"; // 백엔드 통신을 위한 API 서비스 함수들
import { RestaurantData } from "@/types/restaurant"; // 맛집 데이터의 타입 정의 (TypeScript 인터페이스)
import { useRouter, useSearchParams, usePathname } from "next/navigation"; // URL 경로 및 쿼리 파라미터를 제어하는 훅들
// UI에 사용될 아이콘들을 lucide-react 라이브러리에서 가져옵니다.
import {
  MapPin, // 지도 핀 아이콘
  Heart, // 하트(찜하기) 아이콘
  Search, // 돋보기 아이콘
  X, // 닫기(취소) 아이콘
  Clock, // 시계 아이콘
  Check, // 체크 아이콘
  Map as MapIcon, // 지도 모양 아이콘
  List as ListIcon, // 리스트 모양 아이콘
  Loader2, // 로딩 스피너 아이콘
  ChevronLeft, // 왼쪽 화살표
  ChevronRight, // 오른쪽 화살표
  AlertCircle, // 경고 느낌표 아이콘
  Eye, // 눈(보기) 아이콘
  Undo2, // 되돌리기 아이콘
} from "lucide-react";
import Pagination from "@/components/common/Pagination"; // 페이지네이션 처리를 위한 공통 컴포넌트
// 카카오맵 관련 기능을 사용하기 위해 react-kakao-maps-sdk에서 컴포넌트들을 가져옵니다.
import {
  Map as KakaoMap, // 지도 본체 컴포넌트
  MapMarker, // 지도 위 마커 컴포넌트
  MarkerClusterer, // 마커가 겹칠 때 그룹화해주는 컴포넌트
  useKakaoLoader, // 카카오맵 스크립트를 비동기로 로드하는 훅
  CustomOverlayMap, // 마커 위에 커스텀 HTML을 띄우기 위한 오버레이 컴포넌트
  Roadview, // 로드뷰를 보여주는 컴포넌트
} from "react-kakao-maps-sdk";

import makerImg from "../../../public/images/mapMaker.png"; // 지도에 표시할 커스텀 마커 이미지 경로

// --- [타입 정의] 기본 맛집 데이터 인터페이스를 확장하여 UI 상태를 포함합니다 ---
interface ExtendedRestaurantData extends RestaurantData {
  restOpenTime?: string; // 영업시간 정보 (문자열 형태)
  businessStatus?: "OPEN" | "BREAK" | "CLOSED"; // 현재 영업 상태 (영업중, 휴게시간, 종료)
  todayHours?: string; // 오늘 날짜 기준 영업 시간 텍스트
  lat?: number; // 위도 (Geocoding 결과)
  lng?: number; // 경도 (Geocoding 결과)
}

// ==================================================================
// [Component 1] RestaurantListItem
// 지도 뷰의 사이드바에 표시되는 개별 맛집 리스트 아이템 컴포넌트입니다.
// React.memo를 사용하여 props가 변경되지 않으면 리렌더링되지 않도록 최적화했습니다.
// ==================================================================
const RestaurantListItem = React.memo(
  ({
    item, // 렌더링할 맛집 데이터 객체
    activeId, // 현재 선택(활성화)된 맛집의 ID
    onClick, // 아이템 클릭 시 실행될 부모 컴포넌트의 함수 (ID를 전달)
    onFavorite, // 찜하기 버튼 클릭 시 실행될 부모 컴포넌트의 함수
  }: {
    item: ExtendedRestaurantData; // 타입 정의
    activeId: number | null;
    onClick: (id: number) => void;
    onFavorite: (e: React.MouseEvent, id: number) => void;
  }) => {
    return (
      <div
        onClick={() => onClick(item.id)} // 클릭 이벤트 발생 시 해당 ID를 부모에게 전달
        className={`flex gap-4 p-4 border-b border-slate-100 cursor-pointer transition-colors bg-white hover:bg-slate-50 ${
          activeId === item.id
            ? "bg-green-50 border-green-200 ring-1 ring-inset ring-green-200" // 활성화 상태일 때 초록색 강조 스타일 적용
            : ""
        }`}
      >
        {/* 썸네일 이미지 영역 */}
        <div className="relative w-20 h-20 rounded-lg overflow-hidden shrink-0 border border-slate-100 bg-slate-100">
          <img
            src={`/images/restaurantImages/${item.imagePath}`} // 이미지 경로 설정
            alt={item.name} // 접근성을 위한 대체 텍스트
            className="w-full h-full object-cover" // 이미지가 영역을 꽉 채우도록 설정
            loading="lazy" // 성능 최적화를 위해 이미지를 지연 로딩함
          />
        </div>

        {/* 텍스트 정보 영역 (이름, 주소, 태그) */}
        <div className="flex-1 min-w-0 flex flex-col justify-center">
          <div className="flex justify-between items-start">
            <h4
              className={`font-bold text-sm truncate ${
                activeId === item.id ? "text-green-700" : "text-slate-900" // 활성화 여부에 따른 텍스트 색상 변경
              }`}
            >
              {item.name} {/* 가게 이름 표시 */}
            </h4>
          </div>
          <p className="text-xs text-slate-500 mt-0.5 truncate">
            {item.address} {/* 주소 표시 (길면 말줄임표) */}
          </p>

          {/* 태그 영역 (카테고리 및 영업 상태 뱃지) */}
          <div className="flex flex-wrap items-center gap-2 mt-2">
            <span className="text-[10px] font-bold text-slate-500 border border-slate-200 px-1.5 py-0.5 rounded bg-white">
              {item.restCategory} {/* 음식 카테고리 표시 */}
            </span>
            {/* 영업 상태에 따라 다른 색상과 텍스트의 뱃지를 조건부 렌더링 */}
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

        {/* 찜하기(하트) 버튼 - 우측 상단 절대 위치 */}
        <button
          onClick={(e) => onFavorite(e, item.id)} // 클릭 시 onFavorite 함수 실행 (이벤트 버블링 방지는 부모 함수에서 처리 가능하나 여기서 e 전달)
          className="absolute top-2 right-2 p-2 text-slate-300 hover:text-orange-500 transition-colors"
        >
          <Heart
            size={16}
            className={item.isFavorite ? "fill-orange-500 text-orange-500" : ""} // 찜 상태면 색칠된 하트 표시
          />
        </button>
      </div>
    );
  },
);
RestaurantListItem.displayName = "RestaurantListItem"; // React DevTools에서 컴포넌트 이름을 식별하기 위해 설정

// ==================================================================
// [Component 2] KakaoMapContainer
// 실제 카카오맵을 렌더링하고 마커 이벤트를 처리하는 컨테이너 컴포넌트입니다.
// 지도 로직이 복잡하므로 별도 컴포넌트로 분리하고 Memoization을 적용했습니다.
// ==================================================================
const KakaoMapContainer = React.memo(
  ({
    data, // 지도에 표시할 전체 맛집 데이터 배열
    activeId, // 현재 선택된 맛집 ID
    isSidebarOpen, // 사이드바 열림/닫힘 상태 (지도 리레이아웃 트리거용)
    onMarkerClick, // 마커 클릭 시 실행할 함수
    onMapClick, // 지도 빈 공간 클릭 시 실행할 함수
  }: {
    data: ExtendedRestaurantData[];
    activeId: number | null;
    isSidebarOpen: boolean;
    onMarkerClick: (item: ExtendedRestaurantData) => void;
    onMapClick: () => void;
  }) => {
    const mapRef = useRef<kakao.maps.Map | null>(null); // 카카오맵 인스턴스를 저장할 Ref (DOM 조작용)

    // 로드뷰 모드 상태 관리
    const [isRoadviewMode, setIsRoadviewMode] = useState(false); // 로드뷰 활성화 여부
    const [roadviewPosition, setRoadviewPosition] = useState<{
      lat: number;
      lng: number;
      radius: number;
    }>({
      lat: 0,
      lng: 0,
      radius: 50, // 로드뷰 검색 반경
    });

    const kakaoKey = process.env.NEXT_PUBLIC_KAKAO_JS_KEY; // 환경 변수에서 카카오 JS 키 가져오기

    // useKakaoLoader 훅을 사용하여 카카오맵 SDK 스크립트를 비동기로 로드합니다.
    const [loading, error] = useKakaoLoader({
      appkey: kakaoKey || "dummy_key", // 키가 없을 경우 더미 키 사용 (에러 방지)
      libraries: ["services", "clusterer"], // 사용할 라이브러리 목록 (장소 검색, 클러스터러)
      id: "kakao-map-script", // 스크립트 태그 ID
    });

    // 스크립트 로딩 완료를 강제로 인식시키기 위한 상태 (타임아웃 대비)
    const [isForceLoaded, setIsForceLoaded] = useState(false);

    // 컴포넌트 마운트 시 window 객체에 카카오맵이 이미 있는지 확인합니다.
    useEffect(() => {
      if (typeof window !== "undefined" && window.kakao && window.kakao.maps) {
        setIsForceLoaded(true); // 이미 로드되어 있으면 즉시 로드 완료 처리
        return;
      }
      // 로딩이 지연될 경우 3초 후 강제로 로드 완료 처리 (무한 로딩 방지)
      const timer = setTimeout(() => {
        setIsForceLoaded(true);
      }, 3000);
      return () => clearTimeout(timer); // 클린업 함수: 타이머 해제
    }, []);

    // 사이드바가 열리거나 닫힐 때 지도의 크기가 변하므로 relayout을 호출하여 깨짐을 방지합니다.
    useEffect(() => {
      if (mapRef.current) {
        setTimeout(() => {
          mapRef.current?.relayout(); // 지도 레이아웃 재계산
        }, 300); // 애니메이션 시간을 고려하여 0.3초 딜레이
      }
    }, [isSidebarOpen]);

    // 활성화된 아이템(activeId)이 변경되면 해당 위치로 지도를 이동시킵니다.
    useEffect(() => {
      if (!mapRef.current || !activeId || isRoadviewMode) return; // 지도가 없거나 로드뷰 모드면 중단

      const target = data.find((d) => d.id === activeId); // 활성화된 맛집 데이터 찾기

      // 좌표 정보가 유효한 경우에만 이동
      if (
        target &&
        typeof target.lat === "number" &&
        typeof target.lng === "number"
      ) {
        const moveLatLon = new kakao.maps.LatLng(target.lat, target.lng);
        const currentLevel = mapRef.current.getLevel();

        // 지도가 너무 축소되어 있으면(레벨 > 4) 확대하면서 이동하고, 아니면 부드럽게 이동(panTo)
        if (currentLevel > 4) {
          mapRef.current.setLevel(3, { animate: true }); // 레벨 3으로 확대
          setTimeout(() => {
            mapRef.current?.panTo(moveLatLon);
          }, 150);
        } else {
          mapRef.current.panTo(moveLatLon);
        }
      }
    }, [activeId, data, isRoadviewMode]);

    // 로드뷰 버튼 클릭 핸들러 (좌표를 받아 로드뷰 모드를 켬)
    const handleOpenRoadview = useCallback((lat: number, lng: number) => {
      setRoadviewPosition({ lat, lng, radius: 50 });
      setIsRoadviewMode(true);
    }, []);

    // 현재 활성화된 아이템 데이터를 계산 (오버레이 표시용)
    const activeItem = useMemo(
      () => data.find((d) => d.id === activeId),
      [data, activeId],
    );

    // API 키가 없으면 에러 메시지 표시
    if (!kakaoKey) {
      return (
        <div className="flex flex-col items-center justify-center h-full bg-slate-50 text-slate-500">
          <AlertCircle size={40} className="mb-2 text-red-400" />
          <p className="font-bold">API 키 확인 필요</p>
        </div>
      );
    }

    // 로딩 중이면 로딩 스피너 표시
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

    // 에러 발생 시 에러 메시지 표시
    if (error) {
      return (
        <div className="flex flex-col items-center justify-center h-full bg-slate-50 text-red-500">
          <AlertCircle size={32} className="mb-2" />
          <p>지도 로드 실패</p>
        </div>
      );
    }

    // 로드뷰 모드일 경우 로드뷰 컴포넌트 렌더링
    if (isRoadviewMode) {
      return (
        <div className="relative w-full h-full">
          {/* 로드뷰 닫기(지도 보기) 버튼 */}
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

    // 기본 지도 렌더링
    return (
      <div className="w-full h-full [&_img]:max-w-none [&_img]:h-auto [&_img]:border-none">
        {/* Next.js 이미지 스타일 충돌 방지를 위한 CSS 오버라이드 포함 */}
        <KakaoMap
          center={{ lat: 36.3504, lng: 127.3845 }} // 초기 중심 좌표 (대전 시청)
          className="w-full h-full"
          level={7} // 초기 확대 레벨
          onCreate={(map) => (mapRef.current = map)} // 맵 객체 생성 시 ref에 저장
          onClick={onMapClick} // 지도 클릭 이벤트 연결
        >
          {/* 마커 클러스터러: 마커가 많을 때 그룹화하여 숫자로 표시 */}
          <MarkerClusterer averageCenter={true} minLevel={6}>
            {data.map(
              (item) =>
                // 좌표가 있는 데이터만 마커 생성
                typeof item.lat === "number" &&
                typeof item.lng === "number" && (
                  <MapMarker
                    key={item.id}
                    position={{ lat: item.lat, lng: item.lng }}
                    onClick={() => onMarkerClick(item)} // 마커 클릭 시 활성화
                    image={{
                      src:
                        activeId === item.id
                          ? "https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/markerStar.png" // 선택됨: 별 모양 마커
                          : makerImg.src, // 기본: 커스텀 마커 이미지
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
                    zIndex={activeId === item.id ? 9999 : 1} // 선택된 마커를 맨 위로 올림
                    clickable={true}
                  />
                ),
            )}
          </MarkerClusterer>

          {/* 선택된 맛집이 있으면 지도 위에 오버레이(정보창)를 띄움 */}
          {activeItem && activeItem.lat && activeItem.lng && (
            <CustomOverlayMap
              position={{ lat: activeItem.lat, lng: activeItem.lng }}
              yAnchor={1.4} // 마커 위쪽에 표시되도록 앵커 조정
              zIndex={10000}
              clickable={true}
            >
              <div
                className="bg-white p-3 rounded-xl shadow-2xl border border-slate-100 w-56 animate-in zoom-in duration-200 relative pointer-events-auto cursor-default"
                onClick={(e) => e.stopPropagation()} // 오버레이 클릭 시 지도 클릭 이벤트 전파 방지
              >
                {/* 닫기 버튼 */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onMapClick(); // 지도 클릭과 동일하게 선택 해제
                  }}
                  className="absolute top-2 right-2 text-slate-300 hover:text-red-500 bg-white rounded-full p-0.5 transition-colors z-10"
                >
                  <X size={16} />
                </button>

                {/* 가게 이름 및 주소 */}
                <div className="mb-2 pr-5">
                  <h5 className="font-black text-sm text-slate-900 truncate">
                    {activeItem.name}
                  </h5>
                  <p className="text-[10px] text-slate-500 truncate mt-0.5">
                    {activeItem.address}
                  </p>
                </div>

                {/* 상세정보 및 로드뷰 버튼 */}
                <div className="flex gap-2 mt-3">
                  <Link
                    href={`/restaurant/${activeItem.id}`} // 상세 페이지 이동 링크
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
  },
);
KakaoMapContainer.displayName = "KakaoMapContainer";

// ==================================================================
// [Component 3] RestaurantPageContent
// 메인 페이지의 로직과 UI를 담당하는 컴포넌트입니다.
// ==================================================================
function RestaurantPageContent() {
  const router = useRouter(); // 페이지 라우팅용 훅
  const pathname = usePathname(); // 현재 경로 확인용 훅
  const searchParams = useSearchParams(); // URL 쿼리 파라미터 읽기용 훅

  // --- [State] 데이터 및 UI 상태 관리 ---
  const [restaurants, setRestaurants] = useState<ExtendedRestaurantData[]>([]); // 맛집 데이터 목록

  const [loading, setLoading] = useState(true); // 데이터 로딩 상태
  const [activeId, setActiveId] = useState<number | null>(null); // 현재 선택된 맛집 ID
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // 지도 뷰에서 사이드바 열림 상태
  const itemsPerPage = 8; // 페이지당 아이템 수

  // 지도 중심 좌표 상태
  const [mapCenter, setMapCenter] = useState({
    lat: 36.3504,
    lng: 127.3845,
  });

  // URL 쿼리 파라미터에서 필터 상태 가져오기
  const currentCategory = searchParams.get("category") || "전체";
  const currentKeyword = searchParams.get("keyword") || "";
  const showOpenOnly = searchParams.get("open") === "true"; // "true" 문자열을 boolean으로 변환
  const isMapView = searchParams.get("view") === "map"; // 뷰 모드 확인
  const currentPage = Number(searchParams.get("page")) || 1; // 현재 페이지 번호

  const [tempKeyword, setTempKeyword] = useState(currentKeyword); // 검색어 입력용 임시 상태

  // 카카오맵 스크립트 로더 (지오코딩용)
  const [mapScriptLoading] = useKakaoLoader({
    appkey: process.env.NEXT_PUBLIC_KAKAO_JS_KEY || "dummy_key",
    libraries: ["services", "clusterer"],
    id: "kakao-map-script",
  });

  // --- [Helper Functions] 시간 계산 및 영업 상태 로직 ---
  // "HH:MM" 형식의 문자열을 분 단위 정수로 변환하는 함수
  const parseTime = useCallback((str: string) => {
    const [h, m] = str.split(":").map(Number);
    return h * 60 + m;
  }, []);

  // 영업 시간 문자열을 분석하여 현재 영업 상태(OPEN/BREAK/CLOSED)를 반환하는 함수
  const getBusinessStatus = useCallback(
    (
      timeString: string | undefined,
    ): { status: "OPEN" | "BREAK" | "CLOSED"; todayStr: string } => {
      if (!timeString) return { status: "CLOSED", todayStr: "정보 없음" };

      const now = new Date();
      const dayIndex = now.getDay(); // 0(일) ~ 6(토)
      const currentMinutes = now.getHours() * 60 + now.getMinutes();
      const daysKor = ["일", "월", "화", "수", "목", "금", "토"]; // 짧은 요일
      const todayShort = daysKor[dayIndex]; // 오늘 요일 (예: "월")

      // 1. 휴무일 체크 (보수적 접근)
      // "월요일 휴무", "매주 월요일 휴무", "둘째주 일요일 휴무" 등이 포함되어 있으면 일단 휴무 가능성 높음
      // 단, "월~금" 같은 범위 표현과 헷갈리지 않게 "휴무"라는 단어와 함께 있는지 체크
      if (
        timeString.includes(`${todayShort}요일 휴무`) ||
        timeString.includes(`${todayShort}요일휴무`)
      ) {
        // (심화: 여기서 "둘째 주" 등을 체크하려면 날짜 계산 로직이 추가로 필요함.
        // 현재는 텍스트에 '오늘요일 휴무'가 있으면 일단 CLOSED로 처리)
        return { status: "CLOSED", todayStr: "금일 휴무" };
      }

      // 2. 시간 파싱 (HH:MM ~ HH:MM 패턴 찾기)
      // 문자열 어디에 있든 시간 패턴을 찾아냄
      const timeMatch = timeString.match(
        /(\d{1,2}:\d{2})\s*[~\-]\s*(\d{1,2}:\d{2})/,
      );

      // 시간이 없으면 판단 불가 -> 일단 정보 띄우고 CLOSED (혹은 24시간 영업일 수도 있으나 안전하게 처리)
      if (!timeMatch) return { status: "CLOSED", todayStr: timeString };

      const [_, openStr, closeStr] = timeMatch;
      const openMin = parseTime(openStr);
      let closeMin = parseTime(closeStr);

      // 종료 시간이 시작 시간보다 작으면 다음날 새벽으로 간주 (예: 11:00 ~ 02:00)
      if (closeMin < openMin) closeMin += 24 * 60;

      // 3. 새벽 야간 영업 처리 (현재 시각이 0~새벽 시간대인 경우)
      // 예: 영업시간 17:00 ~ 02:00(26:00), 현재 시각 01:00(60) -> 25:00(1500)으로 보정하여 비교
      let adjustedCurrent = currentMinutes;
      if (currentMinutes < openMin && closeMin >= 24 * 60) {
        // 단, 현재 시각이 '전날 마감 시간' 이내여야 함
        if (currentMinutes < closeMin - 24 * 60) {
          adjustedCurrent += 24 * 60;
        }
      }

      // 4. 브레이크 타임 체크
      // 예: "15:00~17:00 브레이크타임" 패턴이 있는지 확인
      const breakMatch = timeString.match(
        /(\d{1,2}:\d{2})\s*[~\-]\s*(\d{1,2}:\d{2}).*(브레이크|break)/i,
      );
      if (breakMatch) {
        const [__, bStart, bEnd] = breakMatch;
        const bStartMin = parseTime(bStart);
        const bEndMin = parseTime(bEnd);
        if (adjustedCurrent >= bStartMin && adjustedCurrent < bEndMin) {
          return { status: "BREAK", todayStr: `${openStr} ~ ${closeStr}` };
        }
      }

      // 5. 최종 상태 판단
      if (adjustedCurrent >= openMin && adjustedCurrent < closeMin) {
        return { status: "OPEN", todayStr: `${openStr} ~ ${closeStr}` };
      }
      return { status: "CLOSED", todayStr: `${openStr} ~ ${closeStr}` };
    },
    [parseTime],
  );

  // --- [Effect] 데이터 가져오기 ---
  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        setLoading(true);
        // 맛집 리스트와 즐겨찾기 목록을 병렬로 요청하여 성능 향상
        const [restaurantsRes, favoritesRes] = await Promise.allSettled([
          restaurantService.getRestaurants(),
          userService.getFavorites(),
        ]);

        // 로딩 UI를 너무 빨리 없애면 깜빡임이 생길 수 있어 약간의 딜레이 추가 (UX)
        await new Promise((resolve) => setTimeout(resolve, 500));

        let allRestaurants: any[] = [];
        const myFavoriteIds = new Set<number>(); // 빠른 조회를 위해 Set 자료구조 사용

        // 응답 처리: 성공한 경우 데이터 저장
        if (restaurantsRes.status === "fulfilled")
          allRestaurants = restaurantsRes.value.data;
        if (favoritesRes.status === "fulfilled") {
          const favoriteList = favoritesRes.value.data;
          if (Array.isArray(favoriteList))
            favoriteList.forEach((item: any) => myFavoriteIds.add(item.id));
        }

        // 데이터 병합 및 가공 (즐겨찾기 여부, 영업 상태 계산)
        const mergedList = allRestaurants.map((item) => {
          const { status, todayStr } = getBusinessStatus(
            item.restOpenTime || item.openTime,
          );
          return {
            ...item,
            isFavorite: myFavoriteIds.has(item.id), // 즐겨찾기 여부 확인
            businessStatus: status, // 계산된 영업 상태
            todayHours: todayStr, // 계산된 오늘 영업 시간 텍스트
          } as ExtendedRestaurantData;
        });

        setRestaurants(mergedList); // 상태 업데이트
      } catch (error) {
        console.error("Error fetching:", error);
      } finally {
        setLoading(false); // 로딩 종료
      }
    };
    fetchRestaurants();
  }, [getBusinessStatus]); // 의존성 배열: getBusinessStatus 함수가 바뀌면 재실행

  // --- [Memo] 필터링 로직 ---
  // 필터 조건이 바뀔 때마다 리스트를 필터링하고 결과를 캐싱합니다.
  const filteredList = useMemo(() => {
    let result = restaurants;

    // 카테고리 필터
    if (currentCategory !== "전체") {
      result = result.filter((item) => item.restCategory === currentCategory);
    }

    // 키워드 검색 필터
    const trimmedKeyword = currentKeyword.trim();
    if (trimmedKeyword !== "") {
      const searchTerms = trimmedKeyword.split(/\s+/); // 공백 기준으로 검색어 분리 (다중 검색 지원)
      result = result.filter((item) => {
        const name = item.name || "";
        const menu = (item.menu || []).join(" ");
        const category = item.restCategory || "";
        const address = item.address || "";
        // 모든 검색어가 포함되어야 함 (AND 조건)
        return searchTerms.every(
          (term) =>
            name.includes(term) ||
            menu.includes(term) ||
            category.includes(term) ||
            address.includes(term),
        );
      });
    }

    // 영업 중 필터
    if (showOpenOnly) {
      result = result.filter((item) => item.businessStatus === "OPEN");
    }

    return result;
  }, [restaurants, currentCategory, currentKeyword, showOpenOnly]);

  // --- [Effect] 주소 -> 좌표 변환 (Geocoding) ---
  // 필터링된 리스트 중 좌표(lat, lng)가 없는 데이터가 있으면 좌표를 찾아옵니다.
  useEffect(() => {
    if (filteredList.length === 0) return;

    // 좌표가 없는 항목 식별
    const itemsToGeocode = filteredList.filter(
      (item) => !item.lat && item.address,
    );
    if (itemsToGeocode.length === 0) return;

    // 카카오맵 라이브러리 로드 확인
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

      // 각 아이템에 대해 주소 검색 실행
      const promises = itemsToGeocode.map((item) => {
        return new Promise<void>((resolve) => {
          if (!item.address) {
            resolve();
            return;
          }
          geocoder.addressSearch(item.address, (result, status) => {
            if (status === window.kakao.maps.services.Status.OK) {
              // 검색 성공 시 좌표 저장
              updatedCoords.set(item.id, {
                lat: Number(result[0].y),
                lng: Number(result[0].x),
              });
            }
            resolve();
          });
        });
      });

      await Promise.all(promises); // 모든 요청이 끝날 때까지 대기

      // 변환된 좌표가 있으면 상태 업데이트
      if (updatedCoords.size > 0) {
        setRestaurants((prev) =>
          prev.map((item) => {
            const coords = updatedCoords.get(item.id);
            return coords
              ? { ...item, lat: coords.lat, lng: coords.lng }
              : item;
          }),
        );
      }
    };

    processGeocoding();
  }, [filteredList, mapScriptLoading]);

  // --- [Handlers] 이벤트 핸들러 모음 ---

  // 찜하기 버튼 클릭 핸들러
  const toggleFavorite = useCallback(
    async (e: React.MouseEvent, id: number) => {
      e.preventDefault(); // 링크 이동 방지
      e.stopPropagation(); // 상위 클릭 이벤트 전파 방지
      try {
        await restaurantService.toggleFavorite(id); // 서버 API 호출
        // 상태 업데이트 (낙관적 업데이트는 아니지만 즉시 반영)
        setRestaurants((prev) =>
          prev.map((item) =>
            item.id === id ? { ...item, isFavorite: !item.isFavorite } : item,
          ),
        );
      } catch (error) {
        alert("로그인이 필요합니다.");
      }
    },
    [],
  );

  // URL 파라미터 업데이트 헬퍼 함수
  const updateParams = (newParams: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams);
    Object.entries(newParams).forEach(([key, value]) => {
      if (value === null)
        params.delete(key); // 값이 null이면 파라미터 제거
      else params.set(key, value); // 아니면 설정
    });
    if (!newParams.page) params.set("page", "1"); // 필터 변경 시 페이지 1로 초기화
    router.push(`${pathname}?${params.toString()}`); // URL 이동
  };

  const handleFilter = (category: string) => updateParams({ category }); // 카테고리 변경
  const handleSearch = () => updateParams({ keyword: tempKeyword }); // 검색 실행
  const clearKeyword = () => {
    setTempKeyword("");
    updateParams({ keyword: null }); // 검색 취소
  };
  const toggleOpenOnly = () =>
    updateParams({ open: showOpenOnly ? null : "true" }); // 영업중 토글
  const toggleView = () => updateParams({ view: isMapView ? null : "map" }); // 뷰 모드 토글
  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", String(page));
    router.push(`${pathname}?${params.toString()}`);
  };

  // 지도 마커 클릭 핸들러
  const handleMarkerClick = useCallback(
    (item: ExtendedRestaurantData) => setActiveId(item.id),
    [],
  );
  // 지도 빈 곳 클릭 핸들러 (선택 해제)
  const handleMapClick = useCallback(() => setActiveId(null), []);

  // 🔥 [수정됨] 리스트 아이템 클릭 핸들러 (버그 수정)
  // 이전: item 객체를 받을 것으로 예상했으나 id(number)가 넘어와서 오류 발생
  // 수정: id(number)를 받아 처리하도록 변경, id로 맛집 정보를 찾아 좌표 업데이트
  const handleRestaurantClick = (id: number) => {
    setActiveId(id);

    // ID에 해당하는 맛집 데이터를 찾음
    const target = restaurants.find((item) => item.id === id);

    // 좌표 정보가 있으면 지도 중심 이동용 상태 업데이트 (필요 시)
    if (target && target.lat && target.lng) {
      setMapCenter({ lat: target.lat, lng: target.lng });
    }

    // 모바일 화면에서는 지도가 하단에 있으므로 지도로 스크롤 이동
    if (window.innerWidth < 1024) {
      const mapElement = document.getElementById("restaurant-map-section");
      if (mapElement) {
        mapElement.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  // 페이지네이션 계산
  const totalPages = Math.ceil(filteredList.length / itemsPerPage);
  const currentItems = filteredList.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  // -----------------------------------------------------------
  // [Render] 화면 렌더링
  // -----------------------------------------------------------
  return (
    <div className="w-full bg-[#fcfcfc] min-h-screen pb-24 font-pretendard">
      {/* 헤더 섹션: 타이틀 및 검색창 */}
      <div className="bg-white border-b border-slate-100 pt-20 pb-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 sm:mb-16">
            <div className="space-y-5">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-black tracking-tight">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                DAEJEON NOW
              </div>
              <h2 className="text-3xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.1]">
                <span className="text-transparent bg-clip-text bg-linear-to-r from-green-600 to-green-400">
                  대전의 맛
                </span>
                을 찾아서
              </h2>
              <p className="text-slate-500 text-sm font-medium leading-relaxed max-w-2xl">
                현지인이 추천하는 진짜 맛집 리스트를 카테고리별로 확인하세요.
              </p>
            </div>

            {/* 리스트 뷰일 때만 상단 검색창 표시 */}
            {!isMapView && (
              <div className="relative w-full lg:w-96 mb-15">
                <Search
                  className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400"
                  size={20}
                />
                <input
                  type="text"
                  placeholder="맛집 이름, 메뉴 검색..."
                  value={tempKeyword}
                  onChange={(e) => setTempKeyword(e.target.value)}
                  className="w-full pl-12 pr-12 py-4 bg-white border border-slate-200 rounded-3xl text-sm font-bold shadow-sm focus:outline-none focus:ring-4 focus:ring-green-500/10 focus:border-green-500 transition-all"
                />
                {tempKeyword && (
                  <button
                    onClick={clearKeyword}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-100 rounded-full text-slate-400 hover:text-green-600 transition-colors"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            )}
          </div>

          {/* 필터 및 뷰 토글 버튼 영역 */}
          <div className="flex flex-col sm:flex-row items-center justify-between mt-10 gap-4">
            {/* 카테고리 버튼 목록 */}
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
                    currentCategory === cat
                      ? "bg-green-600 text-white shadow-lg shadow-green-100"
                      : "bg-white border border-slate-200 text-slate-600 hover:border-slate-900"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* 우측 옵션 버튼들 (영업중 보기, 지도/리스트 보기) */}
            <div className="flex flex-wrap items-center gap-3 w-full sm:justify-end">
              <button
                onClick={toggleOpenOnly}
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
                onClick={toggleView}
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

      {/* 메인 컨텐츠 영역 */}
      <div className="w-full lg:max-w-7xl mx-auto px-4 lg:px-5 mt-10">
        {isMapView ? (
          // === [지도로 보기 모드] ===
          // 모바일: 세로 배치 (flex-col), PC: 가로 배치 (flex-row)
          <div className="flex flex-col lg:flex-row gap-4 lg:gap-0 h-auto lg:h-[750px] w-full bg-transparent lg:bg-white lg:rounded-2xl lg:overflow-hidden lg:shadow-2xl lg:border lg:border-slate-200 relative">
            {/* Sidebar (맛집 리스트) */}
            <div
              className={`flex flex-col transition-all duration-300 ease-in-out relative z-10 
                bg-white rounded-2xl shadow-sm border border-slate-200 lg:shadow-none lg:rounded-none lg:border-0 lg:border-r lg:border-slate-100
                ${
                  isSidebarOpen
                    ? "h-[400px] lg:h-full w-full lg:w-[400px] lg:min-w-[320px]" // 열렸을 때: 모바일 높이 400px, PC 너비 400px
                    : "h-0 lg:h-full w-full lg:w-0 lg:min-w-0 overflow-hidden" // 닫혔을 때: 숨김
                }`}
            >
              {/* 사이드바 헤더 (검색창) */}
              <div className="p-4 pb-2 bg-white sticky top-0 z-20">
                <div className="relative">
                  <Search
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    size={18}
                  />
                  <input
                    type="text"
                    placeholder="지도 내 검색 (가게명, 메뉴)"
                    value={tempKeyword}
                    onChange={(e) => setTempKeyword(e.target.value)}
                    className="w-full pl-10 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-green-500 focus:bg-white transition-all"
                  />
                  {tempKeyword && (
                    <button
                      onClick={clearKeyword}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-green-600"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
              </div>

              {/* 검색 결과 카운트 및 닫기 버튼 */}
              <div className="px-4 py-2 border-b border-slate-100 bg-white flex items-center justify-between shrink-0">
                <span className="text-sm font-bold text-slate-600">
                  검색 결과{" "}
                  <span className="text-green-600">{filteredList.length}</span>
                  개
                </span>
                {/* 모바일용 닫기 버튼 */}
                <button
                  onClick={() => setIsSidebarOpen(false)}
                  className="p-1.5 hover:bg-slate-100 rounded-md text-slate-400 lg:hidden"
                >
                  <ChevronRight size={16} className="rotate-90" />
                </button>
                {/* PC용 닫기 버튼 */}
                <button
                  onClick={() => setIsSidebarOpen(false)}
                  className="p-1.5 hover:bg-slate-100 rounded-md text-slate-400 hidden lg:block"
                >
                  <ChevronRight size={16} className="rotate-180" />
                </button>
              </div>

              {/* 리스트 아이템 스크롤 영역 */}
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
                      onClick={handleRestaurantClick} // 클릭 시 지도 이동 및 스크롤
                      onFavorite={toggleFavorite}
                    />
                  ))
                )}
              </div>
            </div>

            {/* Map Area (지도 표시 영역) */}
            <div
              id="restaurant-map-section" // 스크롤 이동 타겟 ID
              className="relative bg-slate-100 overflow-hidden 
                w-full h-[500px] min-h-[500px] lg:h-full lg:flex-1
                rounded-2xl shadow-sm border border-slate-200 lg:rounded-none lg:shadow-none lg:border-0"
            >
              {/* 사이드바가 닫혔을 때 여는 버튼 */}
              {!isSidebarOpen && (
                <button
                  onClick={() => setIsSidebarOpen(true)}
                  className="absolute top-4 left-4 z-20 bg-white p-2.5 rounded-lg shadow-md border border-slate-200 text-slate-600 hover:text-green-600 transition-transform hover:scale-105"
                >
                  <ChevronRight size={20} className="-rotate-90 lg:rotate-0" />
                </button>
              )}

              {/* 지도 컨테이너 렌더링 */}
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
                  {/* 카드 위 찜하기 버튼 */}
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
                    href={`/restaurant/${item.id}`} // 클릭 시 상세 페이지 이동
                    className="block h-full"
                  >
                    <div className="bg-white rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 border border-slate-100 h-full flex flex-col">
                      {/* 카드 이미지 영역 */}
                      <div className="relative aspect-video overflow-hidden">
                        <img
                          src={`/images/restaurantImages/${item.imagePath}`}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                          alt={item.name}
                          loading="lazy"
                        />
                        {/* 카테고리 뱃지 */}
                        <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm px-3 py-1 rounded-full text-[10px] font-black text-green-600 shadow-sm">
                          {item.restCategory}
                        </div>
                        {/* 영업 상태 뱃지 */}
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
                        {/* 영업 종료 시 딤처리 */}
                        {item.businessStatus === "CLOSED" && (
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-[2px]">
                            <span className="text-white font-black border-2 border-white px-4 py-2 rounded-xl">
                              영업종료
                            </span>
                          </div>
                        )}
                      </div>

                      {/* 카드 내용 영역 */}
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

            {/* 페이지네이션 (그리드 뷰 하단) */}
            <div className="mt-12">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                themeColor="black"
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// --- [최상위 페이지 컴포넌트] ---
// Suspense를 사용하여 비동기 로딩 중 fallback UI를 보여줍니다.
export default function RestaurantListPage() {
  return (
    <Suspense
      fallback={
        <div className="h-screen flex justify-center items-center">
          <Loader2 className="animate-spin text-green-500" />
        </div>
      }
    >
      <RestaurantPageContent />
    </Suspense>
  );
}
