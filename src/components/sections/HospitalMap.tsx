// 1. "use client": 이 파일은 브라우저에서 실행되는 클라이언트 컴포넌트입니다.
// (지도 조작, 로드뷰, 상태 관리 등 브라우저 API를 적극적으로 사용하기 때문입니다.)
"use client";

// --- [라이브러리 및 훅 임포트] ---
import {
  useKakaoLoader, // 카카오맵 스크립트를 비동기로 로드해주는 훅
  Map, // 지도 컴포넌트
  MapMarker, // 지도 위의 핀 컴포넌트
  MarkerClusterer, // 핀이 많을 때 묶어서 보여주는 기능
  Roadview, // 로드뷰 컴포넌트
} from "react-kakao-maps-sdk";
import { useState } from "react"; // 상태 관리 훅
import { useRouter } from "next/navigation"; // 페이지 이동 훅
import { useHospitalMap } from "@/hooks/main/useHospitalMap"; // 병원 데이터를 가져오는 커스텀 훅
// 아이콘들 임포트
import {
  X, // 닫기 버튼
  Camera, // 로드뷰 아이콘
  MapPin, // 지도 핀 아이콘
  LayoutGrid, // 카테고리 아이콘
  ChevronRight, // 화살표 아이콘
  Search, // 돋보기 아이콘
  Loader2, // 로딩 스피너
} from "lucide-react";

import mapMarkerImg from "../../../public/images/mapMaker.png"; // 커스텀 마커 이미지
// ==================================================================
// [Main Component] 병원 지도 컴포넌트 시작
// ==================================================================
export default function HospitalMap() {
  const router = useRouter(); // 라우터 객체 생성

  // 1. 카카오맵 스크립트 로드
  // - appkey: 환경변수에서 가져옴 (없으면 빈 문자열)
  // - libraries: 'services'(장소검색 등), 'clusterer'(마커 클러스터) 기능 사용
  const [loading, error] = useKakaoLoader({
    appkey: process.env.NEXT_PUBLIC_KAKAO_JS_KEY || "",
    libraries: ["services", "clusterer"],
  });

  // --- [State] 상태 관리 ---
  const [map, setMap] = useState<kakao.maps.Map | null>(null); // 지도 객체 저장
  const [selectedCategory, setSelectedCategory] = useState<string>("전체"); // 현재 선택된 진료과목
  const [selectedMarkerId, setSelectedMarkerId] = useState<number | null>(null); // 클릭된 병원 ID (오버레이 표시용)
  const [isRoadviewOpen, setIsRoadviewOpen] = useState(false); // 로드뷰 팝업 열림 여부
  const [roadviewPos, setRoadviewPos] = useState({ lat: 0, lng: 0 }); // 로드뷰 보여줄 좌표

  // 2. 병원 데이터 가져오기 (커스텀 훅 사용)
  // - !loading: 카카오맵 로딩이 끝난 후에 데이터를 가져오기 시작함
  const {
    filteredHospitals, // 필터링된 병원 목록 (화면에 보여줄 것들)
    setFilteredHospitals, // 목록 업데이트 함수
    categories, // 진료과목 목록 (내과, 피부과 등)
    isDataFetching, // 데이터 가져오는 중인지 여부
    keyword, // 검색어
    setKeyword, // 검색어 업데이트 함수
    hospitals, // 전체 병원 원본 데이터
  } = useHospitalMap(!loading);

  // 3. [Loading View] 로딩 중일 때 보여줄 화면
  if (loading || isDataFetching) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-[#f8fafc]">
        <Loader2 className="animate-spin text-green-500 w-16 h-16 mb-4" />
        <p className="text-slate-800 font-extrabold text-2xl tracking-tight">
          병원 정보를 불러오는 중
        </p>
      </div>
    );
  }

  // --- [Handler] 카테고리 클릭 핸들러 ---
  const handleCategoryClick = (category: string) => {
    setSelectedCategory(category); // 선택된 카테고리 상태 업데이트
    setSelectedMarkerId(null); // 선택된 마커 초기화 (오버레이 닫기)

    // 선택된 카테고리에 맞는 병원만 필터링
    let newFiltered =
      category === "전체"
        ? hospitals
        : hospitals.filter((h) => h.category === category);
    setFilteredHospitals(newFiltered);

    // [중요] 지도의 범위를 필터링된 병원들이 모두 보이도록 자동 조정
    if (map && newFiltered.length > 0) {
      const bounds = new window.kakao.maps.LatLngBounds();
      newFiltered.forEach((h) =>
        bounds.extend(new window.kakao.maps.LatLng(h.lat, h.lng))
      );
      map.setBounds(bounds);
    }
  };

  // -----------------------------------------------------------
  // [Render] 화면 렌더링 시작
  // -----------------------------------------------------------
  return (
    <div className="w-full bg-[#f8fafc] py-12 sm:px-6 lg:px-8 min-h-screen">
      <div className="w-full mx-auto px-4 md:max-w-7xl lg:px-5">
        {/* --- [Header] 제목 및 검색창 --- */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-6">
          <div className="space-y-3">
            {/* 뱃지: 실시간 지도 */}
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold tracking-tight">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              REAL-TIME MAP
            </div>
            {/* 타이틀 */}
            <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight">
              대전{" "}
              <span className="text-transparent bg-clip-text bg-linear-to-r from-green-600 to-emerald-500">
                전문의 병원
              </span>{" "}
              파인더
            </h2>
          </div>

          {/* 검색창 */}
          <div className="bg-white p-2 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-2 w-full md:w-auto">
            <Search className="w-5 h-5 text-slate-400 ml-2" />
            <input
              type="text"
              placeholder="병원 이름을 검색하세요..."
              className="bg-transparent outline-none text-sm font-medium w-full md:w-64"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)} // 검색어 입력 시 실시간 필터링
            />
          </div>
        </div>

        {/* --- [Content] 리스트 + 지도 --- */}
        {/* 12컬럼 그리드: 왼쪽(4) 리스트, 오른쪽(8) 지도 */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 bg-white p-4 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-slate-100 overflow-hidden">
          {/* [Left Panel] 병원 목록 및 카테고리 */}
          <div className="lg:col-span-4 flex flex-col h-[600px]">
            <div className="p-4">
              {/* 현재 선택된 카테고리 정보 */}
              <div className="flex items-center justify-between mb-6 px-2">
                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <LayoutGrid className="w-5 h-5 text-green-500" />{" "}
                  {selectedCategory}
                </h3>
                <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-lg">
                  총 {filteredHospitals.length}곳
                </span>
              </div>

              {/* 카테고리 버튼 목록 (가로 스크롤) */}
              <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide">
                <button
                  onClick={() => handleCategoryClick("전체")}
                  className={`whitespace-nowrap px-5 py-2.5 rounded-full text-xs font-bold ${
                    selectedCategory === "전체"
                      ? "bg-slate-900 text-white shadow-lg"
                      : "bg-slate-100 text-slate-500"
                  }`}
                >
                  전체
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => handleCategoryClick(cat)}
                    className={`whitespace-nowrap px-5 py-2.5 rounded-full text-xs font-bold ${
                      selectedCategory === cat
                        ? "bg-green-600 text-white shadow-lg"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* 병원 리스트 (세로 스크롤) */}
            <div className="flex-1 overflow-y-auto px-2 space-y-3 custom-scrollbar">
              {filteredHospitals.map((h) => (
                <div
                  key={h.id}
                  // 리스트 아이템 클릭 시 지도 이동 및 마커 활성화
                  onClick={() => {
                    setSelectedMarkerId(h.id);
                    map?.panTo(new kakao.maps.LatLng(h.lat, h.lng)); // 지도 중심 이동
                  }}
                  className={`p-5 rounded-2xl border transition-all cursor-pointer group ${
                    selectedMarkerId === h.id
                      ? "border-green-500 bg-green-50/50" // 선택됨
                      : "border-slate-50 bg-white" // 평상시
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] font-black text-green-600 bg-green-100 px-2 py-0.5 rounded-md uppercase tracking-tighter">
                      {h.category}
                    </span>
                    <ChevronRight
                      className={`w-4 h-4 transition-transform ${
                        selectedMarkerId === h.id
                          ? "rotate-90 text-green-600"
                          : "text-slate-300"
                      }`}
                    />
                  </div>
                  <h4 className="font-bold text-slate-900 group-hover:text-green-600 transition-colors">
                    {h.name}
                  </h4>
                  <div className="flex items-center gap-1.5 mt-2 text-slate-400">
                    <MapPin className="w-3.5 h-3.5" />
                    <span className="text-[11px] font-medium truncate">
                      {h.address}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* [Right Panel] 지도 영역 */}
          <div className="lg:col-span-8 h-[600px] relative rounded-2xl overflow-hidden shadow-inner bg-slate-50 border border-slate-100">
            <Map
              center={{ lat: 36.3504, lng: 127.3845 }} // 초기 중심 좌표 (대전 시청)
              className="w-full h-full"
              level={7} // 초기 확대 레벨
              onCreate={setMap} // 지도가 생성되면 map 상태에 저장
            >
              {/* 마커 클러스터러: 마커가 겹칠 때 숫자로 묶어줌 */}
              <MarkerClusterer averageCenter={true} minLevel={5}>
                {filteredHospitals.map((h) => (
                  <MapMarker
                    key={h.id}
                    position={{ lat: h.lat, lng: h.lng }}
                    onClick={() => setSelectedMarkerId(h.id)} // 마커 클릭 시 선택 상태 변경
                    image={{
                      src: mapMarkerImg.src, // 파란색 별 마커
                      size: { width: 32, height: 32 },
                    }}
                  >
                    {/* 선택된 마커 위에 뜨는 커스텀 오버레이 (말풍선) */}
                    {selectedMarkerId === h.id && (
                      <div className="p-0 min-w-64 overflow-hidden rounded-2xl shadow-2xl bg-white border-none">
                        <div className="bg-slate-900 p-5 text-white">
                          <p className="text-[10px] font-bold text-green-400 tracking-widest uppercase mb-1">
                            {h.category}
                          </p>
                          <h4 className="font-bold text-base">{h.name}</h4>
                        </div>
                        <div className="p-5 space-y-2">
                          {/* 로드뷰 버튼 */}
                          <button
                            onClick={() => {
                              setRoadviewPos({ lat: h.lat, lng: h.lng });
                              setIsRoadviewOpen(true);
                            }}
                            className="w-full flex items-center justify-center gap-2 py-3 bg-green-600 text-white rounded-xl text-xs font-black shadow-lg shadow-green-100 hover:bg-green-700 transition-all"
                          >
                            <Camera className="w-4 h-4" /> 로드뷰 보기
                          </button>
                          {/* 상세페이지 버튼 */}
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

              {/* [Modal] 로드뷰 팝업 */}
              {/* isRoadviewOpen이 true일 때만 화면 위에 덮어씌움 */}
              {isRoadviewOpen && (
                <div className="absolute inset-0 z-50 bg-slate-900/60 backdrop-blur-sm p-4 flex items-center justify-center">
                  <div className="w-full h-full bg-white rounded-3xl overflow-hidden relative shadow-2xl border border-white/20">
                    {/* 닫기 버튼 */}
                    <div className="absolute top-6 right-6 z-60">
                      <button
                        onClick={() => setIsRoadviewOpen(false)}
                        className="p-3 bg-slate-900 text-white rounded-full shadow-xl hover:scale-110 active:scale-95 transition-all"
                      >
                        <X className="w-6 h-6" />
                      </button>
                    </div>
                    {/* 실제 로드뷰 화면 */}
                    <Roadview
                      position={{ ...roadviewPos, radius: 50 }} // 반경 50m 내에서 가장 가까운 도로 찾기
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
  );
}

// 로딩 (Data Fetching):

// 페이지에 들어오자마자 카카오맵 스크립트를 불러오고, 동시에 서버에 병원 데이터 전체를 요청합니다.

// 준비될 때까지 화면 중앙에 초록색 뺑뺑이(Loader)가 돕니다.

// 화면 표시 (UI):

// 로딩이 끝나면 왼쪽에 병원 리스트, 오른쪽에 지도가 짠! 하고 나타납니다.

// 지도에는 대전 시내 곳곳에 병원 위치를 나타내는 핀(마커)들이 꽂혀 있습니다.

// 탐색 (Interaction):

// 사용자가 왼쪽 카테고리에서 "피부과" 버튼을 누릅니다.

// 지도 위의 핀들이 싹 사라지고 피부과 핀만 남습니다. 지도 범위도 피부과들이 있는 곳으로 줌인됩니다.

// 리스트도 피부과 목록으로 갱신됩니다.

// 상세 확인:

// 지도 위의 핀을 누르거나 리스트에서 병원 이름을 클릭합니다.

// 핀 위에 **말풍선(오버레이)**이 뜨면서 병원 이름과 "로드뷰 보기", "상세정보" 버튼이 나옵니다.

// 로드뷰:

// "로드뷰 보기"를 누르면 지도가 어두워지면서 그 위에 팝업창처럼 로드뷰 화면이 뜹니다.

// 실제 거리 모습을 확인하고 닫기(X)를 누르면 다시 지도로 돌아옵니다.
