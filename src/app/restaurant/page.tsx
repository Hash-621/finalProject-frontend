// 1. "use client": 이 파일이 브라우저에서 실행되는 클라이언트 컴포넌트임을 선언합니다.
// (사용자 필터링, 검색, 상태 관리 등을 위해 필수입니다.)
"use client";

// --- [라이브러리 및 컴포넌트 임포트] ---
import React, { useEffect, useState } from "react"; // 리액트 훅 (상태, 효과)
import Link from "next/link"; // 페이지 이동 컴포넌트
import { restaurantService, userService } from "@/api/services"; // API 호출 서비스
import { RestaurantData } from "@/types/restaurant"; // 기본 데이터 타입
// 아이콘 라이브러리
import { MapPin, Heart, Search, X, Clock, Check } from "lucide-react";
import Pagination from "@/components/common/Pagination"; // 페이지네이션 컴포넌트

// --- [타입 확장] ---
// 기본 RestaurantData 타입에 '영업 상태' 관련 필드를 추가로 정의합니다.
// 이렇게 하면 코드 내에서 'businessStatus' 같은 속성을 쓸 때 자동 완성이 됩니다.
interface ExtendedRestaurantData extends RestaurantData {
  restOpenTime?: string; // DB에서 넘어오는 원본 영업시간 문자열 (예: "매일 09:00~22:00")
  businessStatus?: "OPEN" | "BREAK" | "CLOSED"; // 현재 영업 상태 (영업중 / 브레이크타임 / 영업종료)
  todayHours?: string; // 오늘 요일의 영업 시간 텍스트 (예: "09:00 ~ 22:00")
}

// --- [UI 컴포넌트: 맛집 스켈레톤] ---
// 데이터 로딩 중에 보여줄 뼈대 UI입니다. (깜빡이는 회색 박스)
const RestaurantSkeleton = () => (
  <div className="bg-white rounded-[2.5rem] overflow-hidden border border-slate-100 shadow-sm animate-pulse h-[380px] flex flex-col">
    <div className="h-48 bg-slate-200 w-full" /> {/* 이미지 자리 */}
    <div className="p-6 flex-1 space-y-3">
      <div className="h-7 bg-slate-200 rounded w-3/4" /> {/* 제목 자리 */}
      <div className="h-4 bg-slate-200 rounded w-1/2" /> {/* 주소 자리 */}
      <div className="h-4 bg-slate-200 rounded w-full mt-6" /> {/* 메뉴 자리 */}
    </div>
  </div>
);

// --- [메인 페이지 컴포넌트] ---
export default function RestaurantListPage() {
  // --- [상태 관리] ---
  const [restaurants, setRestaurants] = useState<ExtendedRestaurantData[]>([]); // 전체 맛집 데이터 (원본)
  const [filteredList, setFilteredList] = useState<ExtendedRestaurantData[]>(
    []
  ); // 필터링된 데이터 (화면 표시용)
  const [selectedCategory, setSelectedCategory] = useState("전체"); // 선택된 카테고리 (한식, 중식 등)

  // [New] 영업 중 필터 상태 (체크 여부)
  const [showOpenOnly, setShowOpenOnly] = useState(false);

  const [loading, setLoading] = useState(true); // 데이터 로딩 중 여부
  const [keyword, setKeyword] = useState(""); // 검색어 입력값
  const [currentPage, setCurrentPage] = useState(1); // 현재 페이지 번호
  const itemsPerPage = 8; // 한 페이지당 보여줄 아이템 수

  // -------------------------------------------------------------------------
  // [Logic] 영업 시간 파싱 및 상태 계산 함수
  // 복잡한 영업시간 문자열을 분석해 현재 '영업중'인지 판단하는 핵심 로직입니다.
  // -------------------------------------------------------------------------
  const getBusinessStatus = (
    timeString: string | undefined
  ): { status: "OPEN" | "BREAK" | "CLOSED"; todayStr: string } => {
    // 1. 데이터가 없으면 '정보 없음' 처리
    if (!timeString) return { status: "CLOSED", todayStr: "정보 없음" };

    const now = new Date();
    const dayIndex = now.getDay(); // 0(일) ~ 6(토)
    // 현재 시간을 '분(minute)' 단위로 변환 (예: 10시 30분 -> 630분)
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
    const isWeekend = dayIndex === 0 || dayIndex === 6; // 주말 여부

    // 파이프(|)로 구분된 여러 규칙을 분리 (예: "평일 09:00~18:00 | 주말 휴무")
    const rules = timeString.split("|").map((s) => s.trim());
    let targetRule = "";

    // 2. 오늘의 규칙 찾기 (우선순위: 요일명 > 평일/주말 > 매일)

    // (1) 요일명이 명시된 규칙 찾기 ("월요일 휴무" 등)
    for (const rule of rules) {
      if (rule.includes(todayLabel)) {
        targetRule = rule;
        break;
      }
    }
    // (2) 없으면 평일/주말 규칙 찾기
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
    // (3) 그래도 없으면 일반 규칙("매일" 또는 요일 없는 규칙) 찾기
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

    // 3. 찾은 규칙 분석
    // 규칙이 없거나 "휴무"라고 적혀있으면 영업종료 처리
    if (!targetRule || targetRule.includes("휴무")) {
      return { status: "CLOSED", todayStr: "금일 휴무" };
    }

    // 시간 포맷(00:00 ~ 00:00) 추출
    const timeMatch = targetRule.match(/(\d{1,2}:\d{2})\s*~\s*(\d{1,2}:\d{2})/);
    if (!timeMatch) return { status: "CLOSED", todayStr: targetRule }; // 시간 포맷 없으면 종료 처리

    const [_, openStr, closeStr] = timeMatch;
    const openMin = parseTime(openStr); // 오픈 시간 (분)
    let closeMin = parseTime(closeStr); // 마감 시간 (분)

    // 마감 시간이 오픈 시간보다 작으면(예: 새벽 2시), 다음 날로 계산 (+24시간)
    if (closeMin < openMin) closeMin += 24 * 60;

    // 4. 브레이크 타임 체크
    // 문자열에 "브레이크" 또는 "break"가 포함된 시간 구간이 있는지 확인
    const breakMatch = timeString.match(
      /(\d{1,2}:\d{2})\s*~\s*(\d{1,2}:\d{2}).*(브레이크|break)/i
    );
    if (breakMatch) {
      const [__, bStart, bEnd] = breakMatch;
      const bStartMin = parseTime(bStart);
      const bEndMin = parseTime(bEnd);
      // 현재 시간이 브레이크 타임 구간에 포함되면 BREAK 반환
      if (currentMinutes >= bStartMin && currentMinutes < bEndMin) {
        return { status: "BREAK", todayStr: `${openStr} ~ ${closeStr}` };
      }
    }

    // 5. 최종 상태 결정
    // 현재 시간이 오픈~마감 사이에 있으면 OPEN, 아니면 CLOSED
    if (currentMinutes >= openMin && currentMinutes < closeMin) {
      return { status: "OPEN", todayStr: `${openStr} ~ ${closeStr}` };
    }
    return { status: "CLOSED", todayStr: `${openStr} ~ ${closeStr}` };
  };

  // 시간 문자열("14:30")을 분(870)으로 변환하는 헬퍼 함수
  const parseTime = (str: string) => {
    const [h, m] = str.split(":").map(Number);
    return h * 60 + m;
  };
  // -------------------------------------------------------------------------

  // --- [데이터 로드 (초기 실행)] ---
  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        setLoading(true); // 로딩 시작

        // 맛집 목록과 즐겨찾기 목록 동시 호출 (병렬 처리)
        const [restaurantsRes, favoritesRes] = await Promise.allSettled([
          restaurantService.getRestaurants(),
          userService.getFavorites(),
        ]);

        // 스켈레톤 보여주기 위한 인공 지연
        await new Promise((resolve) => setTimeout(resolve, 500));

        let allRestaurants: any[] = [];
        const myFavoriteIds = new Set<number>();

        // 데이터 정리
        if (restaurantsRes.status === "fulfilled") {
          allRestaurants = restaurantsRes.value.data;
        }
        if (favoritesRes.status === "fulfilled") {
          const favoriteList = favoritesRes.value.data;
          if (Array.isArray(favoriteList)) {
            favoriteList.forEach((item: any) => myFavoriteIds.add(item.id));
          }
        }

        // [중요] 각 맛집 데이터에 '영업 상태'와 '즐겨찾기 여부'를 계산해서 병합
        const mergedList = allRestaurants.map((item) => {
          // 위에서 만든 getBusinessStatus 함수로 현재 상태 계산
          const { status, todayStr } = getBusinessStatus(
            item.restOpenTime || item.openTime
          );
          return {
            ...item,
            isFavorite: myFavoriteIds.has(item.id),
            businessStatus: status, // "OPEN" | "BREAK" | "CLOSED"
            todayHours: todayStr,
          } as ExtendedRestaurantData;
        });

        setRestaurants(mergedList); // 원본 데이터 저장
        setFilteredList(mergedList); // 화면 표시용 데이터 저장
      } catch (error) {
        console.error("Error fetching restaurants:", error);
      } finally {
        setLoading(false); // 로딩 끝
      }
    };
    fetchRestaurants();
  }, []);

  // --- [통합 필터링 로직] ---
  // 원본 데이터, 카테고리, 검색어, 영업필터가 바뀔 때마다 실행
  useEffect(() => {
    let result = restaurants;

    // 1. 카테고리 필터
    if (selectedCategory !== "전체") {
      result = result.filter((item) => item.restCategory === selectedCategory);
    }

    // 2. 검색어 필터 (다중 검색어 지원)
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

    // 3. [New] 영업 중 필터 적용
    // 사용자가 '영업 중인 곳만 보기'를 체크했다면 businessStatus가 "OPEN"인 것만 남김
    if (showOpenOnly) {
      result = result.filter((item) => item.businessStatus === "OPEN");
    }

    setFilteredList(result); // 필터링된 결과 저장
    setCurrentPage(1); // 페이지 초기화
  }, [restaurants, selectedCategory, keyword, showOpenOnly]);

  // --- [즐겨찾기 토글 핸들러] ---
  const toggleFavorite = async (e: React.MouseEvent, id: number) => {
    e.preventDefault(); // 링크 이동 방지
    e.stopPropagation(); // 이벤트 버블링 방지
    try {
      await restaurantService.toggleFavorite(id); // 서버 요청

      // 화면 상태 즉시 업데이트 (낙관적 업데이트 방식과 유사하게 구현됨)
      const updateState = (list: ExtendedRestaurantData[]) =>
        list.map((item) =>
          item.id === id ? { ...item, isFavorite: !item.isFavorite } : item
        );
      setRestaurants(updateState(restaurants)); // 원본 업데이트 (필터링 로직 재실행됨)
    } catch (error) {
      console.error("즐겨찾기 요청 실패:", error);
      alert("로그인이 필요합니다.");
    }
  };

  // --- [카테고리 선택 핸들러] ---
  const handleFilter = (category: string) => {
    setSelectedCategory(category);
  };

  // --- [페이지네이션 계산] ---
  const totalPages = Math.ceil(filteredList.length / itemsPerPage);
  const currentItems = filteredList.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // --- [화면 렌더링] ---
  return (
    <div className="w-full bg-[#fcfcfc] min-h-screen pb-24 font-pretendard">
      {/* 1. 헤더 섹션 (제목, 검색창, 필터) */}
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

            {/* 검색창 */}
            <div className="relative w-full lg:w-96 mb-4">
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

          {/* 카테고리 버튼들 + 영업 중 필터 */}
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

            {/* [New] 영업 중 필터 버튼 */}
            <button
              onClick={() => setShowOpenOnly(!showOpenOnly)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold transition-all border shrink-0 ${
                showOpenOnly
                  ? "bg-green-50 border-green-200 text-green-700 ring-2 ring-green-500/20"
                  : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50"
              }`}
            >
              {/* 체크박스 UI */}
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
              <span>지금 영업 중인 곳만 보기</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. 맛집 목록 영역 */}
      <div className="max-w-7xl mx-auto px-6 mt-12">
        {loading ? (
          // (1) 로딩 중일 때: 스켈레톤 8개
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {Array(8)
              .fill(0)
              .map((_, i) => (
                <RestaurantSkeleton key={i} />
              ))}
          </div>
        ) : filteredList.length === 0 ? (
          // (2) 결과 없을 때: Empty State UI
          <div className="py-32 flex flex-col items-center justify-center bg-white rounded-[2.5rem] border border-dashed border-gray-200 text-center relative overflow-hidden">
            {/* 배경 이모지 장식 */}
            <div className="absolute top-10 right-10 text-6xl opacity-5 rotate-[15deg] select-none pointer-events-none">
              🍕
            </div>
            {/* ... (생략된 장식 요소들) ... */}
            <h3 className="text-2xl font-black text-slate-900 mb-2">
              {showOpenOnly
                ? "지금 영업 중인 맛집이 없어요."
                : "검색된 맛집이 없습니다."}
            </h3>
            <p className="text-slate-500 text-sm font-medium">
              다른 검색어를 입력하거나 전체 목록을 확인해보세요!
            </p>
          </div>
        ) : (
          // (3) 결과 있을 때: 맛집 카드 그리드
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {currentItems.map((item) => (
              <div key={item.id} className="relative group">
                {/* 즐겨찾기(하트) 버튼 (카드 위에 둥둥 떠있음) */}
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
                    } transition-colors`}
                  />
                </button>

                {/* 맛집 카드 (클릭 시 상세 이동) */}
                <Link href={`/restaurant/${item.id}`} className="block h-full">
                  <div className="bg-white rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 border border-slate-100 h-full flex flex-col">
                    {/* 이미지 영역 */}
                    <div className="relative aspect-video overflow-hidden">
                      <img
                        src={`/images/restaurantImages/${item.imagePath}`}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        alt={item.name}
                      />
                      {/* 카테고리 뱃지 */}
                      <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm px-3 py-1 rounded-full text-[10px] font-black text-green-600 shadow-sm">
                        {item.restCategory}
                      </div>

                      {/* [New] 영업 상태 뱃지 (영업중/브레이크타임/영업종료) */}
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

                    {/* 텍스트 정보 영역 */}
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
        )}

        {/* 3. 페이지네이션 (데이터가 있을 때만 표시) */}
        {!loading && filteredList.length > 0 && (
          <div className="mt-12">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              themeColor="black"
            />
          </div>
        )}
      </div>
    </div>
  );
}
