"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { restaurantService, userService } from "@/api/services";
import { RestaurantData } from "@/types/restaurant";
import { MapPin, Heart, Search, X, Clock, Check } from "lucide-react";
import Pagination from "@/components/common/Pagination";

// [Type] 확장된 데이터 타입 (영업 상태 포함)
interface ExtendedRestaurantData extends RestaurantData {
  restOpenTime?: string; // DB 데이터 필드명
  businessStatus?: "OPEN" | "BREAK" | "CLOSED";
  todayHours?: string;
}

// [UI] 스켈레톤 UI
const RestaurantSkeleton = () => (
  <div className="bg-white rounded-[2.5rem] overflow-hidden border border-slate-100 shadow-sm animate-pulse h-[380px] flex flex-col">
    <div className="h-48 bg-slate-200 w-full" />
    <div className="p-6 flex-1 space-y-3">
      <div className="h-7 bg-slate-200 rounded w-3/4" />
      <div className="h-4 bg-slate-200 rounded w-1/2" />
      <div className="h-4 bg-slate-200 rounded w-full mt-6" />
    </div>
  </div>
);

export default function RestaurantListPage() {
  const [restaurants, setRestaurants] = useState<ExtendedRestaurantData[]>([]);
  const [filteredList, setFilteredList] = useState<ExtendedRestaurantData[]>(
    []
  );
  const [selectedCategory, setSelectedCategory] = useState("전체");

  // [New] 영업 중 필터 상태
  const [showOpenOnly, setShowOpenOnly] = useState(false);

  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // -------------------------------------------------------------------------
  // [Logic] 영업 시간 파싱 및 상태 계산
  // -------------------------------------------------------------------------
  const getBusinessStatus = (
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

    // 규칙 찾기 (요일 > 평일/주말 > 매일)
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

    if (!targetRule || targetRule.includes("휴무")) {
      return { status: "CLOSED", todayStr: "금일 휴무" };
    }

    const timeMatch = targetRule.match(/(\d{1,2}:\d{2})\s*~\s*(\d{1,2}:\d{2})/);
    if (!timeMatch) return { status: "CLOSED", todayStr: targetRule };

    const [_, openStr, closeStr] = timeMatch;
    const openMin = parseTime(openStr);
    let closeMin = parseTime(closeStr);
    if (closeMin < openMin) closeMin += 24 * 60;

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

    if (currentMinutes >= openMin && currentMinutes < closeMin) {
      return { status: "OPEN", todayStr: `${openStr} ~ ${closeStr}` };
    }
    return { status: "CLOSED", todayStr: `${openStr} ~ ${closeStr}` };
  };

  const parseTime = (str: string) => {
    const [h, m] = str.split(":").map(Number);
    return h * 60 + m;
  };
  // -------------------------------------------------------------------------

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

        if (restaurantsRes.status === "fulfilled") {
          allRestaurants = restaurantsRes.value.data;
        }

        if (favoritesRes.status === "fulfilled") {
          const favoriteList = favoritesRes.value.data;
          if (Array.isArray(favoriteList)) {
            favoriteList.forEach((item: any) => myFavoriteIds.add(item.id));
          }
        }

        const mergedList = allRestaurants.map((item) => {
          // [Logic] 영업 상태 계산
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
        setFilteredList(mergedList);
      } catch (error) {
        console.error("Error fetching restaurants:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchRestaurants();
  }, []);

  // [Logic] 통합 필터링 (카테고리 + 검색어 + 영업여부)
  useEffect(() => {
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

    // [New] 영업 중 필터 적용
    if (showOpenOnly) {
      result = result.filter((item) => item.businessStatus === "OPEN");
    }

    setFilteredList(result);
    setCurrentPage(1);
  }, [restaurants, selectedCategory, keyword, showOpenOnly]);

  const toggleFavorite = async (e: React.MouseEvent, id: number) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await restaurantService.toggleFavorite(id);
      const updateState = (list: ExtendedRestaurantData[]) =>
        list.map((item) =>
          item.id === id ? { ...item, isFavorite: !item.isFavorite } : item
        );
      setRestaurants(updateState(restaurants));
    } catch (error) {
      console.error("즐겨찾기 요청 실패:", error);
      alert("로그인이 필요합니다.");
    }
  };

  const handleFilter = (category: string) => {
    setSelectedCategory(category);
  };

  const totalPages = Math.ceil(filteredList.length / itemsPerPage);
  const currentItems = filteredList.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="w-full bg-[#fcfcfc] min-h-screen pb-24 font-pretendard">
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

          {/* 카테고리 탭 + 영업 중 필터 */}
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

      <div className="max-w-7xl mx-auto px-6 mt-12">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {Array(8)
              .fill(0)
              .map((_, i) => (
                <RestaurantSkeleton key={i} />
              ))}
          </div>
        ) : filteredList.length === 0 ? (
          <div className="py-32 flex flex-col items-center justify-center bg-white rounded-[2.5rem] border border-dashed border-gray-200 text-center relative overflow-hidden">
            <div className="absolute top-10 right-10 text-6xl opacity-5 rotate-[15deg] select-none pointer-events-none">
              🍕
            </div>
            <div className="absolute bottom-10 left-10 text-6xl opacity-5 rotate-[-15deg] select-none pointer-events-none">
              🍜
            </div>
            <div className="relative mb-8 group cursor-default select-none">
              <div className="text-[80px] drop-shadow-2xl filter hover:scale-110 transition-transform duration-300 rotate-[-5deg] z-10 relative">
                🍳
              </div>
              <div className="absolute -top-6 -right-6 text-[50px] drop-shadow-xl rotate-[15deg] animate-bounce z-20">
                🤔
              </div>
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-20 h-4 bg-black/10 blur-md rounded-full"></div>
            </div>
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
                    } transition-colors`}
                  />
                </button>

                <Link href={`/restaurant/${item.id}`} className="block h-full">
                  <div className="bg-white rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 border border-slate-100 h-full flex flex-col">
                    <div className="relative aspect-video overflow-hidden">
                      <img
                        src={`/images/restaurantImages/${item.imagePath}`}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        alt={item.name}
                      />
                      <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm px-3 py-1 rounded-full text-[10px] font-black text-green-600 shadow-sm">
                        {item.restCategory}
                      </div>

                      {/* [New] 영업 상태 배지 표시 */}
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
        )}

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
