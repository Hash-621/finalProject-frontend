"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import api from "@/api/axios";

import SearchBar from "@/components/common/SearchBar";

import { RestaurantData } from "@/types/restaurant";
import { Tour } from "@/types/tour";
import { HospitalResponse } from "@/types/hospital";
import { JobData } from "@/types/job";
import { NewsItem } from "@/types/news";
import { PostItem } from "@/types/post";

// --------------------------------------------------------
// 1. 설정 및 타입
// --------------------------------------------------------
interface SearchResultData {
  restaurants: RestaurantData[];
  tours: Tour[];
  tourPosts: PostItem[];
  jobs: JobData[];
  jobPosts: PostItem[];
  hospitals: HospitalResponse[];
  communityPosts: PostItem[];
  news: NewsItem[];
}

const INITIAL_RESULTS: SearchResultData = {
  restaurants: [],
  tours: [],
  tourPosts: [],
  jobs: [],
  jobPosts: [],
  hospitals: [],
  communityPosts: [],
  news: [],
};

const SECTION_CONFIG = [
  { id: "restaurants", title: "맛집", limit: 4 },
  { id: "tours", title: "관광지", limit: 4 },
  { id: "tourPosts", title: "사용자 추천 관광지", limit: 4 },
  { id: "hospitals", title: "병원", limit: 4 },
  { id: "jobs", title: "구인구직", limit: 6 },
  { id: "jobPosts", title: "사용자 구인구직", limit: 6 },
  { id: "news", title: "뉴스", limit: 6 },
  { id: "communityPosts", title: "커뮤니티", limit: 6 },
];

const RESTAURANT_IMAGE_BASE = "/images/restaurantImages/";

// --------------------------------------------------------
// 2. 헬퍼 함수
// --------------------------------------------------------
const getSafeImageSrc = (basePath: string, path: string | null | undefined) => {
  if (!path) return null;
  if (path.startsWith("http") || path.startsWith("/")) return path;
  return `${basePath}${path}`;
};

const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
  e.currentTarget.style.display = "none";
  if (e.currentTarget.parentElement) {
    e.currentTarget.parentElement.classList.add(
      "flex",
      "items-center",
      "justify-center",
      "text-gray-400",
      "text-sm"
    );
    e.currentTarget.parentElement.innerText = "이미지 없음";
  }
};

// --------------------------------------------------------
// 3. 섹션 컴포넌트
// --------------------------------------------------------
interface SectionProps {
  title: string;
  data: any[];
  limit: number;
  categoryKey: string;
  searchKeyword: string;
  type: "card" | "list";
  renderItem: (item: any) => React.ReactNode;
}

const SearchSection = ({
  title,
  data,
  limit,
  categoryKey,
  searchKeyword,
  type,
  renderItem,
}: SectionProps) => {
  const router = useRouter();

  if (!data || data.length === 0) return null;

  const displayData = data.slice(0, limit);
  const hasMore = data.length > limit;

  const handleMoreClick = () => {
    if (categoryKey === "news") {
      router.push(`/news?searchKeyword=${encodeURIComponent(searchKeyword)}`);
    } else {
      router.push(
        `/search/results/${categoryKey}?searchKeyword=${encodeURIComponent(
          searchKeyword
        )}`
      );
    }
  };

  return (
    <div id={categoryKey} className="mb-16 scroll-mt-32">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold flex items-center gap-2 text-gray-800">
          {title}
          <span className="text-green-600 text-sm font-medium bg-green-50 px-2 py-0.5 rounded-full">
            {data.length}
          </span>
        </h2>
        {hasMore && (
          <button
            onClick={handleMoreClick}
            className="text-sm text-gray-500 hover:text-black font-medium flex items-center transition-colors cursor-pointer"
          >
            더보기 <span className="ml-1">→</span>
          </button>
        )}
      </div>

      <div
        className={
          type === "card"
            ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            : "flex flex-col gap-3"
        }
      >
        {displayData.map((item, index) => (
          <div key={index} className="w-full">
            {renderItem(item)}
          </div>
        ))}
      </div>
    </div>
  );
};

// --------------------------------------------------------
// 4. 메인 컨텐츠
// --------------------------------------------------------
function SearchResultsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const keyword = searchParams.get("searchKeyword");
  const status = searchParams.get("searchStatus") || "all";

  const [results, setResults] = useState<SearchResultData>(INITIAL_RESULTS);
  const [loading, setLoading] = useState(false);
  const [activeSection, setActiveSection] = useState<string>("");

  const handleScrollTo = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const headerOffset = 100;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition =
        elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });

      setActiveSection(id);
    }
  };

  useEffect(() => {
    if (!keyword) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const generalSearchPromise = api.get(`/search`, {
          params: { query: keyword },
        });
        const newsSearchPromise = api.get(`/news/daejeon`, {
          params: { query: keyword },
        });

        const [generalRes, newsRes] = await Promise.all([
          generalSearchPromise,
          newsSearchPromise,
        ]);

        setResults({
          ...INITIAL_RESULTS,
          ...generalRes.data,
          news: newsRes.data.items || [],
        });
      } catch (error) {
        console.error("검색 오류:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [keyword, status]);

  if (!keyword)
    return (
      <div className="p-20 text-center text-gray-500">
        검색어를 입력해주세요.
      </div>
    );

  return (
    <div className="max-w-7xl mx-auto px-4 pb-20">
      {/* 1. 최상단 검색바 */}
      <div className="top-0 z-50 bg-white/95 backdrop-blur-sm border-b pb-10 pt-10 mb-10">
        <div className="flex justify-center w-full">
          <div className="w-full max-w-2xl">
            <SearchBar
              idPrefix="results-top"
              initialValue={keyword || ""}
              className="flex items-center w-full border border-green-300 rounded-full px-5 py-2.5 bg-gray-50 focus-within:bg-white focus-within:border-green-500 focus-within:ring-2 focus-within:ring-green-100 transition-all shadow-sm"
              inputClassName="bg-transparent text-gray-800 placeholder-gray-400 text-base"
              buttonClassName="text-green-600 hover:text-green-700 hover:scale-110"
              iconClassName="w-5 h-5"
            />
          </div>
        </div>
      </div>

      {/* 2. 컨텐츠 영역 */}
      <div className="flex flex-col lg:flex-row gap-12 relative">
        {/* 좌측 퀵 메뉴 */}
        <aside className="hidden lg:block w-40 flex-shrink-0">
          <div className="sticky top-32">
            <ul className="flex flex-col gap-1 border-l-2 border-gray-100">
              {SECTION_CONFIG.map((section) => {
                const data = results[section.id as keyof SearchResultData];
                if (!data || data.length === 0) return null;

                const isActive = activeSection === section.id;

                return (
                  <li key={section.id}>
                    <button
                      onClick={() => handleScrollTo(section.id)}
                      className={`text-sm text-left w-full pl-4 py-2 transition-all duration-200 border-l-2 -ml-[2px] 
                        ${
                          isActive
                            ? "border-green-500 text-green-600 font-bold"
                            : "border-transparent text-gray-500 hover:text-gray-800 hover:border-gray-300"
                        }`}
                    >
                      {section.title}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </aside>

        {/* 우측 메인 검색 결과 */}
        <main className="flex-1 min-w-0">
          <div className="mb-14">
            <h1 className="text-3xl font-bold text-gray-900">
              '<span className="text-green-600">{keyword}</span>' 검색 결과
            </h1>
          </div>

          {loading ? (
            <div className="py-20 text-center text-gray-500">
              열심히 검색하고 있어요... ⏳
            </div>
          ) : Object.values(results).every(
              (arr) => !arr || arr.length === 0
            ) ? (
            <div className="py-20 text-center text-gray-500 border-2 border-dashed rounded-xl bg-gray-50">
              <p className="text-lg">'{keyword}'에 대한 결과가 없습니다.</p>
              <p className="text-sm mt-2">다른 검색어로 다시 시도해보세요.</p>
            </div>
          ) : (
            <>
              {SECTION_CONFIG.map((section) => {
                const data = results[section.id as keyof SearchResultData];
                if (!data || data.length === 0) return null;

                let renderItemFn;
                let type: "card" | "list" = "card";

                // ----------------------------------------------------------------
                // [라우팅 및 렌더링 로직]
                // 각 케이스별로 onClick 핸들러를 추가하여 페이지 이동 구현
                // ----------------------------------------------------------------
                switch (section.id) {
                  case "restaurants":
                    renderItemFn = (item: RestaurantData) => {
                      const imgSrc = getSafeImageSrc(
                        RESTAURANT_IMAGE_BASE,
                        item.imagePath
                      );
                      return (
                        <div
                          onClick={() => router.push(`/restaurant/${item.id}`)}
                          className="cursor-pointer border border-gray-100 rounded-2xl overflow-hidden hover:border-green-500 hover:shadow-lg transition-all duration-300 bg-white h-full flex flex-col group"
                        >
                          <div
                            className="relative w-full bg-gray-100 flex-shrink-0 overflow-hidden"
                            style={{ height: "160px" }}
                          >
                            {imgSrc ? (
                              <img
                                src={imgSrc}
                                alt={item.name}
                                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                onError={handleImageError}
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                                이미지 없음
                              </div>
                            )}
                          </div>
                          <div className="p-5 flex flex-col flex-1 justify-between">
                            <div>
                              <h3 className="font-bold text-lg mb-1 truncate text-gray-900">
                                {item.name}
                              </h3>
                              <p className="text-sm text-gray-500 mb-2 truncate">
                                {item.menu
                                  ? item.menu.join(", ")
                                  : "메뉴 정보 없음"}
                              </p>
                            </div>
                            <p className="text-xs text-gray-400 truncate">
                              {item.address || "주소 없음"}
                            </p>
                          </div>
                        </div>
                      );
                    };
                    break;

                  case "tours":
                    renderItemFn = (item: Tour) => {
                      const imgSrc = getSafeImageSrc("", item.image);
                      return (
                        <div
                          onClick={() => router.push(`/tour/attraction`)}
                          className="cursor-pointer border border-gray-100 rounded-2xl overflow-hidden hover:border-green-500 hover:shadow-lg transition-all duration-300 bg-white h-full flex flex-col group"
                        >
                          <div
                            className="relative w-full bg-blue-50 flex-shrink-0 overflow-hidden"
                            style={{ height: "160px" }}
                          >
                            {imgSrc ? (
                              <img
                                src={imgSrc}
                                alt={item.name}
                                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                onError={handleImageError}
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-blue-300">
                                관광지
                              </div>
                            )}
                          </div>
                          <div className="p-5 flex flex-col flex-1 justify-between">
                            <h3 className="font-bold text-lg mb-1 truncate text-gray-900">
                              {item.name}
                            </h3>
                            <p className="text-xs text-gray-400 truncate">
                              {item.address}
                            </p>
                          </div>
                        </div>
                      );
                    };
                    break;

                  case "hospitals":
                    renderItemFn = (item: HospitalResponse) => (
                      <div
                        onClick={() => router.push(`/hospital/${item.id}`)}
                        className="cursor-pointer border border-gray-100 rounded-2xl p-5 hover:border-green-500 hover:shadow-lg transition-all bg-white flex flex-col justify-between h-full"
                        style={{ minHeight: "160px" }}
                      >
                        <div>
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="font-bold text-lg truncate text-gray-900">
                              {item.name}
                            </h3>
                            <span className="text-xs bg-green-50 text-green-600 px-2 py-1 rounded-md whitespace-nowrap ml-2 font-medium">
                              {item.treatCategory}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                            {item.address}
                          </p>
                        </div>
                      </div>
                    );
                    break;

                  case "jobs":
                    renderItemFn = (item: JobData) => (
                      <div
                        onClick={() =>
                          router.push(
                            `/job?keyword=${encodeURIComponent(
                              item.companyName
                            )}`
                          )
                        }
                        className="cursor-pointer border border-gray-100 rounded-2xl p-5 hover:border-green-500 hover:shadow-lg transition-all h-full flex flex-col justify-between"
                        style={{ minHeight: "150px" }}
                      >
                        <div>
                          <h3 className="font-bold text-md mb-1 truncate text-gray-900">
                            {item.companyName}
                          </h3>
                          <p className="text-sm text-gray-600 truncate mb-3">
                            {item.title}
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-2 text-xs text-gray-500">
                          <span className="bg-gray-100 px-2 py-1 rounded">
                            {item.location || "지역 정보 없음"}
                          </span>
                          <span className="bg-gray-100 px-2 py-1 rounded">
                            {item.career}
                          </span>
                        </div>
                      </div>
                    );
                    break;

                  case "news":
                    type = "list";
                    renderItemFn = (item: NewsItem) => (
                      <div className="border border-gray-100 py-4 rounded-lg hover:border-green-500 hover:shadow-lg transition-all flex flex-col sm:flex-row justify-between sm:items-center">
                        <div className="flex-1 pr-4 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded border border-blue-100 font-bold">
                              NEWS
                            </span>
                            <a
                              href={item.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-semibold text-gray-900 hover:text-blue-600 hover:underline truncate block w-full"
                              dangerouslySetInnerHTML={{ __html: item.title }}
                            />
                          </div>
                          <p
                            className="text-sm text-gray-500 truncate pl-1"
                            dangerouslySetInnerHTML={{
                              __html: item.description,
                            }}
                          />
                        </div>
                        <span className="text-xs text-gray-400 mt-2 sm:mt-0 whitespace-nowrap">
                          {item.pubDate
                            ? new Date(item.pubDate).toLocaleDateString()
                            : ""}
                        </span>
                      </div>
                    );
                    break;

                  case "tourPosts":
                    renderItemFn = (item: PostItem) => (
                      <div
                        onClick={() =>
                          router.push(`/community/recommend/${item.id}`)
                        }
                        className="cursor-pointer border border-gray-100 rounded-2xl p-5 h-full flex flex-col justify-between hover:shadow-md transition-all bg-white"
                      >
                        <div>
                          <span className="text-xs text-green-600 font-bold mb-1 block">
                            추천
                          </span>
                          <h3 className="font-bold truncate mb-2 text-gray-900">
                            {item.title}
                          </h3>
                          <p className="text-sm text-gray-500 line-clamp-3 bg-gray-50 p-2 rounded-lg">
                            {item.content}
                          </p>
                        </div>
                        <p className="text-xs text-gray-400 mt-3 text-right">
                          by {item.userId}
                        </p>
                      </div>
                    );
                    break;

                  case "communityPosts":
                  case "jobPosts":
                    type = "list";
                    renderItemFn = (item: PostItem) => {
                      const targetPath = `/community/free/${item.id}`;

                      return (
                        <div
                          onClick={() => router.push(targetPath)}
                          className="cursor-pointer border-b border-gray-100 py-3 hover:bg-gray-50 px-3 rounded-lg flex justify-between items-center transition-colors"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded-full whitespace-nowrap">
                              {section.id === "jobPosts"
                                ? "구인"
                                : item.category || "자유"}
                            </span>
                            <span className="font-medium text-gray-800 truncate text-sm">
                              {item.title}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 ml-4 text-xs text-gray-400 whitespace-nowrap">
                            {section.id !== "jobPosts" && (
                              <span>{item.userId}</span>
                            )}
                            <span>
                              {item.createdAt
                                ? new Date(item.createdAt).toLocaleDateString()
                                : ""}
                            </span>
                          </div>
                        </div>
                      );
                    };
                    break;

                  default:
                    return null;
                }

                return (
                  <SearchSection
                    key={section.id}
                    title={section.title}
                    limit={section.limit}
                    categoryKey={section.id}
                    searchKeyword={keyword}
                    data={data}
                    type={type}
                    renderItem={renderItemFn}
                  />
                );
              })}
            </>
          )}
        </main>
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SearchResultsContent />
    </Suspense>
  );
}
