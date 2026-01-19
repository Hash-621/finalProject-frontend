"use client"; // 이 파일이 브라우저(클라이언트 사이드)에서 실행되는 컴포넌트임을 Next.js에게 알립니다.

<<<<<<< HEAD
// --- [Imports] React 및 외부 라이브러리, 내부 모듈들을 불러옵니다 ---
=======
// --- [Imports] 필요한 도구들을 불러옵니다 ---

>>>>>>> origin/main
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
<<<<<<< HEAD
import Pagination from "@/components/common/Pagination"; // 페이지네이션 처리를 위한 공통 컴포넌트
// 카카오맵 관련 기능을 사용하기 위해 react-kakao-maps-sdk에서 컴포넌트들을 가져옵니다.
=======

import Pagination from "@/components/common/Pagination"; // 페이지네이션 컴포넌트

// 카카오맵 라이브러리 불러오기

>>>>>>> origin/main
import {
  Map as KakaoMap, // 지도 본체 컴포넌트
  MapMarker, // 지도 위 마커 컴포넌트
  MarkerClusterer, // 마커가 겹칠 때 그룹화해주는 컴포넌트
  useKakaoLoader, // 카카오맵 스크립트를 비동기로 로드하는 훅
  CustomOverlayMap, // 마커 위에 커스텀 HTML을 띄우기 위한 오버레이 컴포넌트
  Roadview, // 로드뷰를 보여주는 컴포넌트
} from "react-kakao-maps-sdk";

import makerImg from "../../../public/images/mapMaker.png"; // 지도에 표시할 커스텀 마커 이미지 경로

<<<<<<< HEAD
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
=======
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

>>>>>>> origin/main
// ==================================================================

const RestaurantListItem = React.memo(
  ({
<<<<<<< HEAD
    item, // 렌더링할 맛집 데이터 객체
    activeId, // 현재 선택(활성화)된 맛집의 ID
    onClick, // 아이템 클릭 시 실행될 부모 컴포넌트의 함수 (ID를 전달)
    onFavorite, // 찜하기 버튼 클릭 시 실행될 부모 컴포넌트의 함수
  }: {
    item: ExtendedRestaurantData; // 타입 정의
=======
    item, // 맛집 데이터 하나

    activeId, // 현재 선택된 맛집 ID

    onClick, // 클릭 시 실행할 함수

    onFavorite, // 찜하기 버튼 클릭 시 실행할 함수
  }: {
    item: ExtendedRestaurantData;

>>>>>>> origin/main
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

<<<<<<< HEAD
        {/* 텍스트 정보 영역 (이름, 주소, 태그) */}
=======
        {/* 텍스트 정보 영역 */}

>>>>>>> origin/main
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

<<<<<<< HEAD
          {/* 태그 영역 (카테고리 및 영업 상태 뱃지) */}
=======
          {/* 태그 영역 (카테고리, 영업상태) */}

>>>>>>> origin/main
          <div className="flex flex-wrap items-center gap-2 mt-2">
            <span className="text-[10px] font-bold text-slate-500 border border-slate-200 px-1.5 py-0.5 rounded bg-white">
              {item.restCategory} {/* 음식 카테고리 표시 */}
            </span>
<<<<<<< HEAD
            {/* 영업 상태에 따라 다른 색상과 텍스트의 뱃지를 조건부 렌더링 */}
=======

>>>>>>> origin/main
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

<<<<<<< HEAD
        {/* 찜하기(하트) 버튼 - 우측 상단 절대 위치 */}
=======
        {/* 찜하기 하트 버튼 */}

>>>>>>> origin/main
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
<<<<<<< HEAD
RestaurantListItem.displayName = "RestaurantListItem"; // React DevTools에서 컴포넌트 이름을 식별하기 위해 설정

// ==================================================================
// [Component 2] KakaoMapContainer
// 실제 카카오맵을 렌더링하고 마커 이벤트를 처리하는 컨테이너 컴포넌트입니다.
// 지도 로직이 복잡하므로 별도 컴포넌트로 분리하고 Memoization을 적용했습니다.
=======

RestaurantListItem.displayName = "RestaurantListItem"; // 디버깅용 이름 설정

// ==================================================================

// [Component 2] 카카오맵 컨테이너 (지도 화면)

// 역시 React.memo로 불필요한 렌더링 방지

>>>>>>> origin/main
// ==================================================================

const KakaoMapContainer = React.memo(
  ({
<<<<<<< HEAD
    data, // 지도에 표시할 전체 맛집 데이터 배열
    activeId, // 현재 선택된 맛집 ID
    isSidebarOpen, // 사이드바 열림/닫힘 상태 (지도 리레이아웃 트리거용)
    onMarkerClick, // 마커 클릭 시 실행할 함수
    onMapClick, // 지도 빈 공간 클릭 시 실행할 함수
=======
    data, // 지도에 표시할 맛집 데이터들

    activeId, // 현재 선택된 맛집 ID

    isSidebarOpen, // 사이드바가 열려있는지 여부

    onMarkerClick, // 마커 클릭 핸들러

    onMapClick, // 지도 빈 곳 클릭 핸들러
>>>>>>> origin/main
  }: {
    data: ExtendedRestaurantData[];

    activeId: number | null;

    isSidebarOpen: boolean;

    onMarkerClick: (item: ExtendedRestaurantData) => void;

    onMapClick: () => void;
  }) => {
    const mapRef = useRef<kakao.maps.Map | null>(null); // 카카오맵 인스턴스를 저장할 Ref (DOM 조작용)

<<<<<<< HEAD
    // 로드뷰 모드 상태 관리
    const [isRoadviewMode, setIsRoadviewMode] = useState(false); // 로드뷰 활성화 여부
=======
    // 로드뷰 상태 관리

    const [isRoadviewMode, setIsRoadviewMode] = useState(false);

>>>>>>> origin/main
    const [roadviewPosition, setRoadviewPosition] = useState<{
      lat: number;

      lng: number;

      radius: number;
    }>({
      lat: 0,

      lng: 0,
<<<<<<< HEAD
      radius: 50, // 로드뷰 검색 반경
=======

      radius: 50,
>>>>>>> origin/main
    });

    const kakaoKey = process.env.NEXT_PUBLIC_KAKAO_JS_KEY; // 환경 변수에서 카카오 JS 키 가져오기

<<<<<<< HEAD
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
=======
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

>>>>>>> origin/main
    useEffect(() => {
      if (mapRef.current) {
        setTimeout(() => {
          mapRef.current?.relayout(); // 지도 레이아웃 재계산
        }, 300); // 애니메이션 시간을 고려하여 0.3초 딜레이
      }
    }, [isSidebarOpen]);

<<<<<<< HEAD
    // 활성화된 아이템(activeId)이 변경되면 해당 위치로 지도를 이동시킵니다.
=======
    // [중요] 특정 맛집이 선택되면(activeId) 지도를 그곳으로 이동시키는 로직

>>>>>>> origin/main
    useEffect(() => {
      if (!mapRef.current || !activeId || isRoadviewMode) return; // 지도가 없거나 로드뷰 모드면 중단

      const target = data.find((d) => d.id === activeId); // 활성화된 맛집 데이터 찾기

<<<<<<< HEAD
      // 좌표 정보가 유효한 경우에만 이동
=======
      // 좌표가 있는 경우에만 이동

>>>>>>> origin/main
      if (
        target &&
        typeof target.lat === "number" &&
        typeof target.lng === "number"
      ) {
        const moveLatLon = new kakao.maps.LatLng(target.lat, target.lng);

        const currentLevel = mapRef.current.getLevel();

<<<<<<< HEAD
        // 지도가 너무 축소되어 있으면(레벨 > 4) 확대하면서 이동하고, 아니면 부드럽게 이동(panTo)
        if (currentLevel > 4) {
          mapRef.current.setLevel(3, { animate: true }); // 레벨 3으로 확대
=======
        // 지도가 너무 축소되어 있으면(레벨 > 4), 확대하면서 이동

        if (currentLevel > 4) {
          mapRef.current.setLevel(3, { animate: true });

          // 줌 애니메이션과 이동이 겹치지 않게 약간의 딜레이 후 이동

>>>>>>> origin/main
          setTimeout(() => {
            mapRef.current?.panTo(moveLatLon);
          }, 150);
        } else {
          // 이미 확대된 상태면 바로 부드럽게 이동

          mapRef.current.panTo(moveLatLon);
        }
      }
    }, [activeId, data, isRoadviewMode]);

<<<<<<< HEAD
    // 로드뷰 버튼 클릭 핸들러 (좌표를 받아 로드뷰 모드를 켬)
=======
    // 로드뷰 열기 함수

>>>>>>> origin/main
    const handleOpenRoadview = useCallback((lat: number, lng: number) => {
      setRoadviewPosition({ lat, lng, radius: 50 });

      setIsRoadviewMode(true);
    }, []);

<<<<<<< HEAD
    // 현재 활성화된 아이템 데이터를 계산 (오버레이 표시용)
=======
    // 현재 선택된 아이템 찾기 (오버레이 표시용)

>>>>>>> origin/main
    const activeItem = useMemo(
      () => data.find((d) => d.id === activeId),

      [data, activeId],
    );

<<<<<<< HEAD
    // API 키가 없으면 에러 메시지 표시
=======
    // API 키가 없으면 에러 표시

>>>>>>> origin/main
    if (!kakaoKey) {
      return (
        <div className="flex flex-col items-center justify-center h-full bg-slate-50 text-slate-500">
          <AlertCircle size={40} className="mb-2 text-red-400" />

          <p className="font-bold">API 키 확인 필요</p>
        </div>
      );
    }

<<<<<<< HEAD
    // 로딩 중이면 로딩 스피너 표시
=======
    // 로딩 중이면 로딩 표시

>>>>>>> origin/main
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

<<<<<<< HEAD
    // 에러 발생 시 에러 메시지 표시
=======
    // 에러 발생 시

>>>>>>> origin/main
    if (error) {
      return (
        <div className="flex flex-col items-center justify-center h-full bg-slate-50 text-red-500">
          <AlertCircle size={32} className="mb-2" />

          <p>지도 로드 실패</p>
        </div>
      );
    }

<<<<<<< HEAD
    // 로드뷰 모드일 경우 로드뷰 컴포넌트 렌더링
=======
    // 로드뷰 모드일 때 화면

>>>>>>> origin/main
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

<<<<<<< HEAD
    // 기본 지도 렌더링
=======
    // 일반 지도 렌더링

>>>>>>> origin/main
    return (
      <div className="w-full h-full [&_img]:max-w-none [&_img]:h-auto [&_img]:border-none">
        {/* Next.js 이미지 스타일 충돌 방지를 위한 CSS 오버라이드 포함 */}
        <KakaoMap
<<<<<<< HEAD
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
=======
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

>>>>>>> origin/main
                typeof item.lat === "number" &&
                typeof item.lng === "number" && (
                  <MapMarker
                    key={item.id}
                    position={{ lat: item.lat, lng: item.lng }}
<<<<<<< HEAD
                    onClick={() => onMarkerClick(item)} // 마커 클릭 시 활성화
                    image={{
                      src:
                        activeId === item.id
                          ? "https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/markerStar.png" // 선택됨: 별 모양 마커
                          : makerImg.src, // 기본: 커스텀 마커 이미지
=======
                    onClick={() => onMarkerClick(item)} // 마커 클릭 시
                    image={{
                      src:
                        activeId === item.id
                          ? "https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/markerStar.png" // 선택된 마커 (별)
                          : makerImg.src, // 기본 마커 (커스텀 이미지)

>>>>>>> origin/main
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
<<<<<<< HEAD
                    zIndex={activeId === item.id ? 9999 : 1} // 선택된 마커를 맨 위로 올림
=======
                    zIndex={activeId === item.id ? 9999 : 1} // 선택된 마커를 맨 위로
>>>>>>> origin/main
                    clickable={true}
                  />
                ),
            )}
          </MarkerClusterer>

<<<<<<< HEAD
          {/* 선택된 맛집이 있으면 지도 위에 오버레이(정보창)를 띄움 */}
          {activeItem && activeItem.lat && activeItem.lng && (
            <CustomOverlayMap
              position={{ lat: activeItem.lat, lng: activeItem.lng }}
              yAnchor={1.4} // 마커 위쪽에 표시되도록 앵커 조정
=======
          {/* 선택된 마커 위에 뜨는 정보창 (오버레이) */}

          {activeItem && activeItem.lat && activeItem.lng && (
            <CustomOverlayMap
              position={{ lat: activeItem.lat, lng: activeItem.lng }}
              yAnchor={1.4} // 마커 위쪽으로 띄우기
>>>>>>> origin/main
              zIndex={10000}
              clickable={true}
            >
              <div
                className="bg-white p-3 rounded-xl shadow-2xl border border-slate-100 w-56 animate-in zoom-in duration-200 relative pointer-events-auto cursor-default"
<<<<<<< HEAD
                onClick={(e) => e.stopPropagation()} // 오버레이 클릭 시 지도 클릭 이벤트 전파 방지
              >
                {/* 닫기 버튼 */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onMapClick(); // 지도 클릭과 동일하게 선택 해제
=======
                onClick={(e) => e.stopPropagation()} // 오버레이 클릭 시 지도 클릭 이벤트 방지
              >
                {/* 닫기 버튼 */}

                <button
                  onClick={(e) => {
                    e.stopPropagation();

                    onMapClick(); // 닫기 누르면 선택 해제
>>>>>>> origin/main
                  }}
                  className="absolute top-2 right-2 text-slate-300 hover:text-red-500 bg-white rounded-full p-0.5 transition-colors z-10"
                >
                  <X size={16} />
                </button>

<<<<<<< HEAD
                {/* 가게 이름 및 주소 */}
=======
                {/* 가게 정보 */}

>>>>>>> origin/main
                <div className="mb-2 pr-5">
                  <h5 className="font-black text-sm text-slate-900 truncate">
                    {activeItem.name}
                  </h5>

                  <p className="text-[10px] text-slate-500 truncate mt-0.5">
                    {activeItem.address}
                  </p>
                </div>

<<<<<<< HEAD
                {/* 상세정보 및 로드뷰 버튼 */}
=======
                {/* 버튼들 */}

>>>>>>> origin/main
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

KakaoMapContainer.displayName = "KakaoMapContainer"; // 디버깅용 이름

// ==================================================================
<<<<<<< HEAD
// [Component 3] RestaurantPageContent
// 메인 페이지의 로직과 UI를 담당하는 컴포넌트입니다.
=======

// [Component 3] 메인 페이지 컴포넌트

>>>>>>> origin/main
// ==================================================================

function RestaurantPageContent() {
<<<<<<< HEAD
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
=======
  const router = useRouter();

  const pathname = usePathname();

  const searchParams = useSearchParams();

  // --- [State] 데이터 및 UI 상태 ---

  const [restaurants, setRestaurants] = useState<ExtendedRestaurantData[]>([]); // 전체 맛집 데이터

  // 필터링 관련 상태

  const [loading, setLoading] = useState(true); // 로딩 상태

  const [activeId, setActiveId] = useState<number | null>(null); // 선택된 맛집 ID

  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // 지도뷰에서 사이드바 열림 여부

  const itemsPerPage = 8; // 한 페이지당 보여줄 개수
>>>>>>> origin/main

  // URL 쿼리 파라미터에서 필터 상태 가져오기
  const currentCategory = searchParams.get("category") || "전체";

  const currentKeyword = searchParams.get("keyword") || "";
<<<<<<< HEAD
  const showOpenOnly = searchParams.get("open") === "true"; // "true" 문자열을 boolean으로 변환
  const isMapView = searchParams.get("view") === "map"; // 뷰 모드 확인
  const currentPage = Number(searchParams.get("page")) || 1; // 현재 페이지 번호
=======

  const showOpenOnly = searchParams.get("open") === "true";

  const isMapView = searchParams.get("view") === "map";

  const currentPage = Number(searchParams.get("page")) || 1;
>>>>>>> origin/main

  const [tempKeyword, setTempKeyword] = useState(currentKeyword); // 검색어 입력용 임시 상태

<<<<<<< HEAD
  // 카카오맵 스크립트 로더 (지오코딩용)
=======
  // 상위 컴포넌트에서도 지도 스크립트 로더 상태 확인

>>>>>>> origin/main
  const [mapScriptLoading] = useKakaoLoader({
    appkey: process.env.NEXT_PUBLIC_KAKAO_JS_KEY || "dummy_key",

    libraries: ["services", "clusterer"],

    id: "kakao-map-script",
  });

<<<<<<< HEAD
  // --- [Helper Functions] 시간 계산 및 영업 상태 로직 ---
  // "HH:MM" 형식의 문자열을 분 단위 정수로 변환하는 함수
=======
  // --- [Helper Functions] 시간 계산 및 영업상태 판단 ---

  // "14:30" 문자열을 870(분)으로 변환

>>>>>>> origin/main
  const parseTime = useCallback((str: string) => {
    const [h, m] = str.split(":").map(Number);

    return h * 60 + m;
  }, []);

<<<<<<< HEAD
  // 영업 시간 문자열을 분석하여 현재 영업 상태(OPEN/BREAK/CLOSED)를 반환하는 함수
=======
  // 영업시간 문자열을 파싱해서 현재 상태(OPEN/CLOSED/BREAK) 반환

>>>>>>> origin/main
  const getBusinessStatus = useCallback(
    (
      timeString: string | undefined,
    ): { status: "OPEN" | "BREAK" | "CLOSED"; todayStr: string } => {
      if (!timeString) return { status: "CLOSED", todayStr: "정보 없음" };

      const now = new Date();
<<<<<<< HEAD
      const dayIndex = now.getDay(); // 0(일) ~ 6(토)
      const currentMinutes = now.getHours() * 60 + now.getMinutes(); // 현재 시각을 분 단위로 변환
=======

      const dayIndex = now.getDay(); // 0(일) ~ 6(토)

      const currentMinutes = now.getHours() * 60 + now.getMinutes();

>>>>>>> origin/main
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

<<<<<<< HEAD
      const rules = timeString.split("|").map((s) => s.trim()); // "|"로 구분된 여러 규칙 분리
      let targetRule = "";

      // 1. 요일이 정확히 일치하는 규칙 찾기
=======
      // 영업시간 문자열 파싱 로직 (복잡한 룰 처리)

      const rules = timeString.split("|").map((s) => s.trim());

      let targetRule = "";

      // 1. 요일별 규칙 찾기

>>>>>>> origin/main
      for (const rule of rules) {
        if (rule.includes(todayLabel)) {
          targetRule = rule;

          break;
        }
      }
<<<<<<< HEAD
      // 2. 평일/주말 규칙 찾기
=======

      // 2. 평일/주말 규칙 찾기

>>>>>>> origin/main
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
<<<<<<< HEAD
      // 3. 매일 또는 기타 기본 규칙 찾기
=======

      // 3. 매일/기타 규칙 찾기

>>>>>>> origin/main
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

      // 휴무일 처리
      if (!targetRule || targetRule.includes("휴무"))
        return { status: "CLOSED", todayStr: "금일 휴무" };

<<<<<<< HEAD
      // 시간 파싱 (예: "10:00 ~ 22:00")
=======
      // 시간 추출 (예: 10:00 ~ 22:00)

>>>>>>> origin/main
      const timeMatch = targetRule.match(
        /(\d{1,2}:\d{2})\s*~\s*(\d{1,2}:\d{2})/,
      );

      if (!timeMatch) return { status: "CLOSED", todayStr: targetRule };

      const [_, openStr, closeStr] = timeMatch;

      const openMin = parseTime(openStr);

      let closeMin = parseTime(closeStr);
<<<<<<< HEAD
      if (closeMin < openMin) closeMin += 24 * 60; // 새벽까지 영업하는 경우 (예: 25시) 처리
=======

      if (closeMin < openMin) closeMin += 24 * 60; // 새벽까지 영업 시

      // 브레이크 타임 체크
>>>>>>> origin/main

      // 브레이크 타임 확인
      const breakMatch = timeString.match(
        /(\d{1,2}:\d{2})\s*~\s*(\d{1,2}:\d{2}).*(브레이크|break)/i,
      );

      if (breakMatch) {
        const [__, bStart, bEnd] = breakMatch;

        const bStartMin = parseTime(bStart);

        const bEndMin = parseTime(bEnd);

        if (currentMinutes >= bStartMin && currentMinutes < bEndMin) {
          return { status: "BREAK", todayStr: `${openStr} ~ ${closeStr}` };
        }
      }

<<<<<<< HEAD
      // 현재 시간이 영업 시간 내인지 확인
=======
      // 최종 상태 판단

>>>>>>> origin/main
      if (currentMinutes >= openMin && currentMinutes < closeMin) {
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
<<<<<<< HEAD
        // 맛집 리스트와 즐겨찾기 목록을 병렬로 요청하여 성능 향상
=======

        // 맛집 데이터와 즐겨찾기 데이터를 병렬로 요청 (Promise.allSettled)

>>>>>>> origin/main
        const [restaurantsRes, favoritesRes] = await Promise.allSettled([
          restaurantService.getRestaurants(),

          userService.getFavorites(),
        ]);

<<<<<<< HEAD
        // 로딩 UI를 너무 빨리 없애면 깜빡임이 생길 수 있어 약간의 딜레이 추가 (UX)
        await new Promise((resolve) => setTimeout(resolve, 500));

        let allRestaurants: any[] = [];
        const myFavoriteIds = new Set<number>(); // 빠른 조회를 위해 Set 자료구조 사용
=======
        await new Promise((resolve) => setTimeout(resolve, 500)); // 로딩 느낌을 위한 최소 딜레이

        let allRestaurants: any[] = [];

        const myFavoriteIds = new Set<number>();
>>>>>>> origin/main

        // 응답 처리: 성공한 경우 데이터 저장
        if (restaurantsRes.status === "fulfilled")
          allRestaurants = restaurantsRes.value.data;

        if (favoritesRes.status === "fulfilled") {
          const favoriteList = favoritesRes.value.data;

          if (Array.isArray(favoriteList))
            favoriteList.forEach((item: any) => myFavoriteIds.add(item.id));
        }

<<<<<<< HEAD
        // 데이터 병합 및 가공 (즐겨찾기 여부, 영업 상태 계산)
=======
        // 데이터 합치기 (맛집 정보 + 영업 상태 + 찜 여부)

>>>>>>> origin/main
        const mergedList = allRestaurants.map((item) => {
          const { status, todayStr } = getBusinessStatus(
            item.restOpenTime || item.openTime,
          );

          return {
            ...item,
<<<<<<< HEAD
            isFavorite: myFavoriteIds.has(item.id), // 즐겨찾기 여부 확인
            businessStatus: status, // 계산된 영업 상태
            todayHours: todayStr, // 계산된 오늘 영업 시간 텍스트
=======

            isFavorite: myFavoriteIds.has(item.id),

            businessStatus: status,

            todayHours: todayStr,
>>>>>>> origin/main
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

<<<<<<< HEAD
  // --- [Memo] 필터링 로직 ---
  // 필터 조건이 바뀔 때마다 리스트를 필터링하고 결과를 캐싱합니다.
  const filteredList = useMemo(() => {
    let result = restaurants;

    // 카테고리 필터
=======
  // --- [Memo] 필터링 로직 (성능 최적화) ---

  const filteredList = useMemo(() => {
    let result = restaurants;

    // 1. 카테고리 필터

>>>>>>> origin/main
    if (currentCategory !== "전체") {
      result = result.filter((item) => item.restCategory === currentCategory);
    }

<<<<<<< HEAD
    // 키워드 검색 필터
=======
    // 2. 키워드 검색

>>>>>>> origin/main
    const trimmedKeyword = currentKeyword.trim();

    if (trimmedKeyword !== "") {
<<<<<<< HEAD
      const searchTerms = trimmedKeyword.split(/\s+/); // 공백 기준으로 검색어 분리 (다중 검색 지원)
=======
      const searchTerms = trimmedKeyword.split(/\s+/);

>>>>>>> origin/main
      result = result.filter((item) => {
        const name = item.name || "";

        const menu = (item.menu || []).join(" ");

        const category = item.restCategory || "";

        const address = item.address || "";
<<<<<<< HEAD
        // 모든 검색어가 포함되어야 함 (AND 조건)
=======

>>>>>>> origin/main
        return searchTerms.every(
          (term) =>
            name.includes(term) ||
            menu.includes(term) ||
            category.includes(term) ||
            address.includes(term),
        );
      });
    }

<<<<<<< HEAD
    // 영업 중 필터
=======
    // 3. 영업중 필터

>>>>>>> origin/main
    if (showOpenOnly) {
      result = result.filter((item) => item.businessStatus === "OPEN");
    }

    return result;
  }, [restaurants, currentCategory, currentKeyword, showOpenOnly]);

  // --- [Effect] 주소 -> 좌표 변환 (Geocoding) ---
<<<<<<< HEAD
  // 필터링된 리스트 중 좌표(lat, lng)가 없는 데이터가 있으면 좌표를 찾아옵니다.
  useEffect(() => {
    if (filteredList.length === 0) return;

    // 좌표가 없는 항목 식별
=======

  useEffect(() => {
    if (filteredList.length === 0) return;

    // 좌표가 없는 아이템만 골라냄

>>>>>>> origin/main
    const itemsToGeocode = filteredList.filter(
      (item) => !item.lat && item.address,
    );

    if (itemsToGeocode.length === 0) return;

<<<<<<< HEAD
    // 카카오맵 라이브러리 로드 확인
=======
    // 카카오맵 스크립트가 로드되었는지 확인

>>>>>>> origin/main
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

<<<<<<< HEAD
      // 변환된 좌표가 있으면 상태 업데이트
=======
      // 변환된 좌표를 상태에 업데이트

>>>>>>> origin/main
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

<<<<<<< HEAD
  // --- [Handlers] 이벤트 핸들러 모음 ---

  // 찜하기 버튼 클릭 핸들러
  const toggleFavorite = useCallback(
    async (e: React.MouseEvent, id: number) => {
      e.preventDefault(); // 링크 이동 방지
      e.stopPropagation(); // 상위 클릭 이벤트 전파 방지
      try {
        await restaurantService.toggleFavorite(id); // 서버 API 호출
        // 상태 업데이트 (낙관적 업데이트는 아니지만 즉시 반영)
=======
  // --- [Handlers] 이벤트 핸들러들 ---

  // 찜하기 토글

  const toggleFavorite = useCallback(
    async (e: React.MouseEvent, id: number) => {
      e.preventDefault();

      e.stopPropagation();

      try {
        await restaurantService.toggleFavorite(id);

>>>>>>> origin/main
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

<<<<<<< HEAD
  // URL 파라미터 업데이트 헬퍼 함수
=======
  // 🟢 URL 업데이트 도우미 함수

>>>>>>> origin/main
  const updateParams = (newParams: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams);

    Object.entries(newParams).forEach(([key, value]) => {
      if (value === null) params.delete(key); // 값이 null이면 파라미터 제거
      else params.set(key, value); // 아니면 설정
    });
<<<<<<< HEAD
    if (!newParams.page) params.set("page", "1"); // 필터 변경 시 페이지 1로 초기화
    router.push(`${pathname}?${params.toString()}`); // URL 이동
  };

  const handleFilter = (category: string) => updateParams({ category }); // 카테고리 변경
  const handleSearch = () => updateParams({ keyword: tempKeyword }); // 검색 실행
  const clearKeyword = () => {
    setTempKeyword("");
    updateParams({ keyword: null }); // 검색 취소
=======

    if (!newParams.page) params.set("page", "1"); // 필터 바뀌면 1페이지로

    router.push(`${pathname}?${params.toString()}`);
  };

  // 🟢 새 핸들러들

  const handleFilter = (category: string) => updateParams({ category });

  const handleSearch = () => updateParams({ keyword: tempKeyword });

  const clearKeyword = () => {
    setTempKeyword("");

    updateParams({ keyword: null });
>>>>>>> origin/main
  };

  const toggleOpenOnly = () =>
<<<<<<< HEAD
    updateParams({ open: showOpenOnly ? null : "true" }); // 영업중 토글
  const toggleView = () => updateParams({ view: isMapView ? null : "map" }); // 뷰 모드 토글
=======
    updateParams({ open: showOpenOnly ? null : "true" });

  const toggleView = () => updateParams({ view: isMapView ? null : "map" });

>>>>>>> origin/main
  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams);

    params.set("page", String(page));

    router.push(`${pathname}?${params.toString()}`);
  };

<<<<<<< HEAD
  // 지도 마커 클릭 핸들러
=======
  // 마커 클릭

>>>>>>> origin/main
  const handleMarkerClick = useCallback(
    (item: ExtendedRestaurantData) => setActiveId(item.id),

    [],
  );
<<<<<<< HEAD
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
=======

  // 지도 빈 곳 클릭 (선택 해제)

  const handleMapClick = useCallback(() => setActiveId(null), []);

  // 페이지네이션 계산 (현재 페이지 아이템 자르기)
>>>>>>> origin/main

  // 페이지네이션 계산
  const totalPages = Math.ceil(filteredList.length / itemsPerPage);

  const currentItems = filteredList.slice(
    (currentPage - 1) * itemsPerPage,

    currentPage * itemsPerPage,
  );

  // -----------------------------------------------------------
<<<<<<< HEAD
  // [Render] 화면 렌더링
=======

  // [Render] 화면 렌더링 시작

>>>>>>> origin/main
  // -----------------------------------------------------------

  return (
    <div className="w-full bg-[#fcfcfc] min-h-screen pb-24 font-pretendard">
<<<<<<< HEAD
      {/* 헤더 섹션: 타이틀 및 검색창 */}
=======
      {/* 1. Header (제목 및 검색/필터 영역) */}

>>>>>>> origin/main
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

<<<<<<< HEAD
            {/* 리스트 뷰일 때만 상단 검색창 표시 */}
=======
            {/* 그리드 뷰일 때만 상단 검색창 표시 */}

>>>>>>> origin/main
            {!isMapView && (
              <div className="relative w-full lg:w-96 mb-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
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

<<<<<<< HEAD
          {/* 필터 및 뷰 토글 버튼 영역 */}
          <div className="flex flex-col sm:flex-row items-center justify-between mt-10 gap-4">
            {/* 카테고리 버튼 목록 */}
=======
          {/* 필터 버튼들 */}

          <div className="flex flex-col sm:flex-row items-center justify-between mt-10 gap-4">
            {/* 카테고리 필터 */}

>>>>>>> origin/main
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

<<<<<<< HEAD
            {/* 우측 옵션 버튼들 (영업중 보기, 지도/리스트 보기) */}
=======
            {/* 기능 버튼 (영업중 필터, 지도뷰 토글) */}

>>>>>>> origin/main
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

<<<<<<< HEAD
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
=======
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

>>>>>>> origin/main
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

<<<<<<< HEAD
              {/* 검색 결과 카운트 및 닫기 버튼 */}
=======
              {/* 검색 결과 카운트 & 닫기 버튼 */}

>>>>>>> origin/main
              <div className="px-4 py-2 border-b border-slate-100 bg-white flex items-center justify-between shrink-0">
                <span className="text-sm font-bold text-slate-600">
                  검색 결과{" "}
                  <span className="text-green-600">
                    {filteredList.length}
                  </span>
                  개
                </span>
<<<<<<< HEAD
                {/* 모바일용 닫기 버튼 */}
=======

>>>>>>> origin/main
                <button
                  onClick={() => setIsSidebarOpen(false)}
                  className="p-1.5 hover:bg-slate-100 rounded-md text-slate-400 lg:hidden"
                >
<<<<<<< HEAD
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
=======
                  <ChevronLeft size={16} />
                </button>
              </div>

              {/* 리스트 목록 */}

>>>>>>> origin/main
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

<<<<<<< HEAD
            {/* Map Area (지도 표시 영역) */}
            <div
              id="restaurant-map-section" // 스크롤 이동 타겟 ID
              className="relative bg-slate-100 overflow-hidden 
                w-full h-[500px] min-h-[500px] lg:h-full lg:flex-1
                rounded-2xl shadow-sm border border-slate-200 lg:rounded-none lg:shadow-none lg:border-0"
            >
              {/* 사이드바가 닫혔을 때 여는 버튼 */}
=======
            {/* Map Area */}

            <div className="flex-1 relative h-full bg-slate-100 overflow-hidden">
              {/* 사이드바 열기 버튼 */}

>>>>>>> origin/main
              {!isSidebarOpen && (
                <button
                  onClick={() => setIsSidebarOpen(true)}
                  className="absolute top-4 left-4 z-20 bg-white p-2.5 rounded-lg shadow-md border border-slate-200 text-slate-600 hover:text-green-600 transition-transform hover:scale-105"
                >
<<<<<<< HEAD
                  <ChevronRight
                    size={20}
                    className="-rotate-90 lg:rotate-0"
                  />
                </button>
              )}

              {/* 지도 컨테이너 렌더링 */}
=======
                  <ChevronRight size={20} />
                </button>
              )}

              {/* 지도 컴포넌트 */}

>>>>>>> origin/main
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
<<<<<<< HEAD
                  {/* 카드 위 찜하기 버튼 */}
=======
                  {/* 찜하기 버튼 (카드 우상단) */}

>>>>>>> origin/main
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
<<<<<<< HEAD
                      {/* 카드 이미지 영역 */}
=======
                      {/* 이미지 영역 */}

>>>>>>> origin/main
                      <div className="relative aspect-video overflow-hidden">
                        <img
                          src={`/images/restaurantImages/${item.imagePath}`}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                          alt={item.name}
                          loading="lazy"
                        />
<<<<<<< HEAD
                        {/* 카테고리 뱃지 */}
                        <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm px-3 py-1 rounded-full text-[10px] font-black text-green-600 shadow-sm">
                          {item.restCategory}
                        </div>
                        {/* 영업 상태 뱃지 */}
=======

                        <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm px-3 py-1 rounded-full text-[10px] font-black text-green-600 shadow-sm">
                          {item.restCategory}
                        </div>

                        {/* 영업상태 뱃지 */}

>>>>>>> origin/main
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
<<<<<<< HEAD
                        {/* 영업 종료 시 딤처리 */}
=======

>>>>>>> origin/main
                        {item.businessStatus === "CLOSED" && (
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-[2px]">
                            <span className="text-white font-black border-2 border-white px-4 py-2 rounded-xl">
                              영업종료
                            </span>
                          </div>
                        )}
                      </div>

<<<<<<< HEAD
                      {/* 카드 내용 영역 */}
=======
                      {/* 텍스트 영역 */}

>>>>>>> origin/main
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

<<<<<<< HEAD
            {/* 페이지네이션 (그리드 뷰 하단) */}
=======
            {/* 페이지네이션 (그리드 뷰에서만 사용) */}

>>>>>>> origin/main
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

<<<<<<< HEAD
// --- [최상위 페이지 컴포넌트] ---
// Suspense를 사용하여 비동기 로딩 중 fallback UI를 보여줍니다.
=======
>>>>>>> origin/main
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
<<<<<<< HEAD
}
=======
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
>>>>>>> origin/main
