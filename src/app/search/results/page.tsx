"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import api from "@/api/axios";
import { Search as SearchIcon, FileQuestion, MapPin } from "lucide-react";

import SearchBar from "@/components/common/SearchBar";

// 타입 Import
import { RestaurantData } from "@/types/restaurant";
import { Tour } from "@/types/tour";
import { HospitalResponse } from "@/types/hospital";
import { JobData } from "@/types/job";
import { NewsItem } from "@/types/news";
import { PostItem } from "@/types/board";

// 상수 정의
const ITEMS_PER_PAGE = 12;
const RESTAURANT_IMAGE_BASE = "/images/restaurantImages/";

const CATEGORY_TITLES: { [key: string]: string } = {
  all: "통합",
  restaurants: "맛집",
  tours: "관광지",
  tourPosts: "사용자 추천 관광지",
  hospitals: "병원",
  jobs: "구인구직",
  jobPosts: "사용자 구인구직",
  communityPosts: "커뮤니티",
  news: "뉴스",
};

const RECOMMEND_KEYWORDS = [
  "성심당",
  "칼국수",
  "한밭수목원",
  "유성온천",
  "꿈돌이",
  "개발자",
];

// [UI] 카드형 스켈레톤
const CardSkeleton = () => (
  <div className="bg-white rounded-xl overflow-hidden border border-gray-100 shadow-sm animate-pulse h-full min-h-[280px] flex flex-col">
    <div className="h-40 bg-gray-200 w-full" />
    <div className="p-5 flex-1 space-y-3">
      <div className="h-6 bg-gray-200 rounded w-3/4" />
      <div className="h-4 bg-gray-200 rounded w-1/2" />
      <div className="h-4 bg-gray-200 rounded w-full mt-4" />
    </div>
  </div>
);

// [UI] 리스트형 스켈레톤
const ListSkeleton = () => (
  <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm animate-pulse">
    <div className="h-6 bg-gray-200 rounded w-2/3 mb-3" />
    <div className="h-4 bg-gray-200 rounded w-full mb-2" />
    <div className="h-4 bg-gray-200 rounded w-5/6 mb-4" />
    <div className="flex justify-end">
      <div className="h-3 bg-gray-200 rounded w-24" />
    </div>
  </div>
);

function CategoryResultContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // [핵심] URL 쿼리 파라미터에서 카테고리 읽기 (없으면 'all')
  const category = searchParams.get("searchStatus") || "all";
  const keyword = searchParams.get("searchKeyword");

  const [allItems, setAllItems] = useState<any[]>([]);
  const [currentItems, setCurrentItems] = useState<any[]>([]);

  // [Fix] 초기 로딩 상태 true (페이지 진입 시 스켈레톤 즉시 노출)
  const [loading, setLoading] = useState(true);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  const pageTitle = CATEGORY_TITLES[category] || category;

  // 1. 데이터 가져오기
  useEffect(() => {
    // 검색어가 없으면 로딩 끄고 종료
    if (!keyword) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      setLoading(true); // 요청 시작 시 로딩 true
      try {
        let data = [];

        if (category === "news") {
          const res = await api.get(`/news/daejeon`, {
            params: { query: keyword, display: 100 },
          });
          data = res.data.items || [];
        } else {
          const res = await api.get(`/search`, {
            params: { query: keyword },
          });

          if (res.data) {
            if (category === "all") {
              // 통합 검색이면 모든 결과를 합침 (API 응답 구조에 따라 조정 가능)
              // 예: res.data가 { restaurants: [], tours: [], ... } 형태라면
              data = Object.values(res.data).flat();
            } else if (res.data[category]) {
              data = res.data[category];
            }
          }
        }

        // 스켈레톤을 보여주기 위한 최소 지연 (0.3초) - 너무 빠르면 깜빡거림 방지
        await new Promise((resolve) => setTimeout(resolve, 300));

        setAllItems(data);
        setTotalPages(Math.ceil(data.length / ITEMS_PER_PAGE));
        setCurrentPage(1);
      } catch (error) {
        console.error("데이터 로딩 실패:", error);
      } finally {
        setLoading(false); // 로딩 종료
      }
    };

    fetchData();
  }, [category, keyword]);

  // 2. 페이지네이션
  useEffect(() => {
    if (allItems.length > 0) {
      const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
      const endIndex = startIndex + ITEMS_PER_PAGE;
      setCurrentItems(allItems.slice(startIndex, endIndex));
      window.scrollTo(0, 0);
    } else {
      setCurrentItems([]);
    }
  }, [currentPage, allItems]);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleKeywordClick = (newKeyword: string) => {
    router.push(
      `/search/results?searchStatus=${category}&searchKeyword=${encodeURIComponent(
        newKeyword
      )}`
    );
  };

  const getSafeImageSrc = (
    basePath: string,
    path: string | null | undefined
  ) => {
    if (!path) return null;
    if (path.startsWith("http") || path.startsWith("/")) return path;
    return `${basePath}${path}`;
  };

  // 스타일
  const gridClass =
    "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6";
  const listClass = "flex flex-col gap-4";

  // [UI 렌더링 로직]
  const renderMainContent = () => {
    // 1. 로딩 중일 때 (스켈레톤)
    if (loading) {
      const isListView = [
        "news",
        "communityPosts",
        "tourPosts",
        "jobPosts",
      ].includes(category);
      if (isListView) {
        return (
          <div className={listClass}>
            {Array(6)
              .fill(0)
              .map((_, i) => (
                <ListSkeleton key={`skel-list-${i}`} />
              ))}
          </div>
        );
      } else {
        return (
          <div className={gridClass}>
            {Array(8)
              .fill(0)
              .map((_, i) => (
                <CardSkeleton key={`skel-card-${i}`} />
              ))}
          </div>
        );
      }
    }

    // 2. 검색 결과 없을 때 (예쁜 스티커 화면)
    if (currentItems.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-24 bg-white rounded-[2.5rem] border border-dashed border-gray-200 text-center px-6 relative overflow-hidden">
          {/* 배경 꾸밈 요소 */}
          <div className="absolute top-10 left-10 text-6xl opacity-5 rotate-[-15deg] select-none pointer-events-none">
            🌸
          </div>
          <div className="absolute bottom-10 right-10 text-6xl opacity-5 rotate-[15deg] select-none pointer-events-none">
            🏙️
          </div>

          {/* 중앙 스티커 이모지 */}
          <div className="relative mb-8 group cursor-default select-none">
            <div className="text-[80px] drop-shadow-2xl filter hover:scale-110 transition-transform duration-300 rotate-[-5deg] z-10 relative">
              🧐
            </div>
            <div className="absolute -top-6 -right-6 text-[50px] drop-shadow-xl rotate-[15deg] animate-bounce z-20">
              ❓
            </div>
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-20 h-4 bg-black/10 blur-md rounded-full"></div>
          </div>

          <h3 className="text-2xl font-black text-gray-900 mb-3 tracking-tight">
            '<span className="text-green-600">{keyword}</span>' 검색 결과가
            없어요
          </h3>
          <p className="text-gray-500 mb-10 text-sm font-medium leading-relaxed">
            아쉽게도 일치하는 정보가 없네요.
            <br />
            오타가 있는지 확인하거나, 아래 추천 검색어를 눌러보세요!
          </p>

          {/* 추천 검색어 */}
          <div className="flex flex-col items-center gap-5 w-full max-w-md mx-auto">
            <div className="flex items-center gap-2 w-full">
              <div className="h-px bg-gray-100 flex-1"></div>
              <span className="text-xs font-bold text-gray-300 tracking-widest uppercase">
                Recommend
              </span>
              <div className="h-px bg-gray-100 flex-1"></div>
            </div>
            <div className="flex flex-wrap justify-center gap-2.5">
              {RECOMMEND_KEYWORDS.map((k) => (
                <button
                  key={k}
                  onClick={() => handleKeywordClick(k)}
                  className="px-5 py-2.5 bg-white hover:bg-green-50 text-gray-600 hover:text-green-600 border border-gray-200 hover:border-green-200 rounded-2xl text-sm font-bold transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5"
                >
                  #{k}
                </button>
              ))}
            </div>
          </div>
        </div>
      );
    }

    // 3. 데이터 리스트 렌더링
    switch (category) {
      case "all": // 통합 검색일 때
      case "restaurants":
      case "tours":
      case "hospitals":
        return (
          <div className={gridClass}>
            {currentItems.map((item: any, index) => {
              // 통합 검색 시 데이터 타입에 따라 이미지 경로 처리
              const imagePath = item.imagePath || item.image;
              const imgSrc = getSafeImageSrc(RESTAURANT_IMAGE_BASE, imagePath);
              const title = item.name || item.title;
              const subInfo = item.menu
                ? item.menu.join(", ")
                : item.address || item.description;

              return (
                <div
                  key={`${item.id}-${index}`}
                  onClick={() => {
                    if (item.menu) router.push(`/restaurant/${item.id}`);
                    else if (item.treatCategory)
                      router.push(`/hospital/${item.id}`);
                    else router.push(`/tour/attraction`);
                  }}
                  className="cursor-pointer border border-gray-200 rounded-xl overflow-hidden hover:shadow-xl hover:border-green-500 transition-all bg-white flex flex-col h-full group"
                >
                  <div
                    className="relative w-full bg-gray-100 flex-shrink-0 overflow-hidden"
                    style={{ height: "160px" }}
                  >
                    <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-sm">
                      이미지 없음
                    </div>
                    {imgSrc && (
                      <img
                        src={imgSrc}
                        alt={title}
                        className="absolute inset-0 w-full h-full object-cover z-10 group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                      />
                    )}
                  </div>
                  <div className="p-5 flex flex-col flex-1 justify-between">
                    <div>
                      <h3 className="font-bold text-xl mb-1 text-gray-900 line-clamp-1">
                        {title}
                      </h3>
                      <p className="text-sm text-gray-600 line-clamp-1 mb-2">
                        {subInfo}
                      </p>
                    </div>
                    {item.address && (
                      <p className="text-xs text-gray-400 truncate flex items-center gap-1">
                        <MapPin size={12} />
                        {item.address}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        );

      case "jobs":
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentItems.map((item: JobData, index) => (
              <div
                key={index}
                onClick={() =>
                  router.push(
                    `/job?keyword=${encodeURIComponent(item.companyName)}`
                  )
                }
                className="cursor-pointer border border-gray-200 rounded-xl p-6 hover:border-green-500 hover:shadow-sm transition-colors bg-white h-full flex flex-col justify-between"
                style={{ minHeight: "180px" }}
              >
                <div>
                  <h3 className="font-bold text-lg mb-2 text-gray-900 line-clamp-1">
                    {item.companyName}
                  </h3>
                  <p className="text-base text-gray-700 mb-4 line-clamp-2">
                    {item.title}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 text-xs text-gray-500">
                  <span className="bg-gray-100 px-2 py-1 rounded-md truncate max-w-[100px]">
                    {item.location || "지역무관"}
                  </span>
                  <span className="bg-gray-100 px-2 py-1 rounded-md">
                    {item.career}
                  </span>
                  <span className="bg-gray-100 px-2 py-1 rounded-md">
                    {item.education}
                  </span>
                </div>
              </div>
            ))}
          </div>
        );

      case "news":
        return (
          <div className={listClass}>
            {currentItems.map((item: NewsItem, index) => (
              <div
                key={index}
                className="border border-gray-200 p-6 rounded-xl hover:shadow-md hover:border-green-500 hover:bg-green-50/10 transition-all bg-white"
              >
                <a
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold text-xl text-blue-600 hover:underline mb-2 block line-clamp-1"
                  dangerouslySetInnerHTML={{ __html: item.title }}
                />
                <p
                  className="text-base text-gray-600 mb-3 line-clamp-2"
                  dangerouslySetInnerHTML={{ __html: item.description }}
                />
                <span className="text-sm text-gray-400">
                  {item.pubDate
                    ? new Date(item.pubDate).toLocaleDateString()
                    : ""}
                </span>
              </div>
            ))}
          </div>
        );

      default:
        // 커뮤니티 등 리스트 뷰
        return (
          <div className={listClass}>
            {currentItems.map((item: PostItem, index) => {
              const isRecommend = category === "tourPosts";
              const targetPath = isRecommend
                ? `/community/recommend/${item.id}`
                : `/community/free/${item.id}`;
              return (
                <div
                  key={index}
                  onClick={() => router.push(targetPath)}
                  className="cursor-pointer border border-gray-200 rounded-lg p-5 hover:bg-green-50/10 hover:border-green-500 transition-colors flex justify-between items-center bg-white"
                >
                  <div className="min-w-0 flex-1 pr-4">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded font-medium whitespace-nowrap">
                        {category === "jobPosts"
                          ? "구인"
                          : item.category || "게시글"}
                      </span>
                      <h3 className="font-medium text-gray-800 text-lg truncate">
                        {item.title}
                      </h3>
                    </div>
                    {item.content && (
                      <p className="text-sm text-gray-500 truncate">
                        {item.content}
                      </p>
                    )}
                  </div>
                  <div className="text-right text-sm text-gray-400 min-w-[100px] flex-shrink-0">
                    <div className="mb-1 font-medium text-gray-600 truncate max-w-[100px] ml-auto">
                      {item.userId}
                    </div>
                    <div>
                      {item.createdAt
                        ? new Date(item.createdAt).toLocaleDateString()
                        : ""}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        );
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 pb-20">
      {/* 상단 검색바 */}
      <div className="top-0 z-50 bg-white/95 backdrop-blur-sm border-b pb-10 pt-10 mb-10">
        <div className="flex justify-center w-full">
          <div className="w-full max-w-2xl">
            <SearchBar
              idPrefix="category-top"
              initialValue={keyword || ""}
              className="flex items-center w-full border border-green-300 rounded-full px-5 py-2.5 bg-gray-50 focus-within:bg-white focus-within:border-green-500 focus-within:ring-2 focus-within:ring-green-100 transition-all shadow-sm"
              inputClassName="bg-transparent text-gray-800 placeholder-gray-400 text-base"
              buttonClassName="text-green-600 hover:text-green-700 hover:scale-110"
              iconClassName="w-5 h-5"
            />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4 mb-12 pb-4">
        <button
          onClick={() => router.back()}
          className="text-gray-500 hover:text-black text-sm font-bold rounded px-3 py-1 hover:text-black-100 transition-colors cursor-pointer"
        >
          ← 뒤로가기
        </button>
        <h1 className="text-3xl font-bold">
          '<span className="text-green-500">{keyword}</span>' 관련{" "}
          <span className="text-slate-500">{pageTitle}</span> 전체 목록
          {!loading && allItems.length > 0 && (
            <span className="text-base font-normal text-gray-500 ml-2">
              (총 {allItems.length}건)
            </span>
          )}
        </h1>
      </div>

      {/* 메인 콘텐츠 (스켈레톤 / Empty(스티커) / 리스트) */}
      {renderMainContent()}

      {/* 페이지네이션 (로딩 끝났고 데이터 있을 때만) */}
      {!loading && currentItems.length > 0 && totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-12">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-4 py-2 border rounded-md disabled:opacity-30 hover:bg-gray-100 transition-colors cursor-pointer"
          >
            이전
          </button>
          <div className="flex gap-1 overflow-x-auto max-w-[300px] sm:max-w-none no-scrollbar">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`w-10 h-10 rounded-md font-bold transition-colors flex-shrink-0 cursor-pointer ${
                  currentPage === page
                    ? "bg-green-600 text-white"
                    : "bg-white text-gray-600 hover:bg-gray-100"
                }`}
              >
                {page}
              </button>
            ))}
          </div>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-4 py-2 border rounded-md disabled:opacity-30 hover:bg-gray-100 transition-colors cursor-pointer"
          >
            다음
          </button>
        </div>
      )}
    </div>
  );
}

export default function CategoryPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CategoryResultContent />
    </Suspense>
  );
}
