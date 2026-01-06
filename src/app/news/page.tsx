"use client";

import { useState, useEffect, useMemo, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import api from "@/api/axios";
import { NewsResponse, NewsItem } from "@/types/news";
import { ArrowRight, Loader2, Search, X } from "lucide-react";

// 스켈레톤 UI 컴포넌트
const NewsSkeleton = () => (
  <div className="flex flex-col bg-white rounded-[2.5rem] overflow-hidden border border-slate-100 shadow-sm animate-pulse">
    <div className="aspect-16/11 bg-slate-200" />
    <div className="p-7 flex flex-col flex-1">
      <div className="h-7 bg-slate-200 rounded-lg w-3/4 mb-3" />
      <div className="h-7 bg-slate-200 rounded-lg w-1/2 mb-6" />
      <div className="space-y-3 mb-8">
        <div className="h-4 bg-slate-200 rounded w-full" />
        <div className="h-4 bg-slate-200 rounded w-full" />
        <div className="h-4 bg-slate-200 rounded w-2/3" />
      </div>
      <div className="mt-auto pt-5 flex items-center justify-between border-t border-slate-50">
        <div className="h-3 bg-slate-200 rounded w-20" />
        <div className="h-3 bg-slate-200 rounded w-16" />
      </div>
    </div>
  </div>
);

const cleanText = (text: string) => {
  if (!text) return "";
  return text
    .replace(/(<([^>]+)>)/gi, "")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ");
};

function NewsPageContent() {
  const searchParams = useSearchParams();
  const initialKeyword = searchParams.get("searchKeyword") || "";

  const [allFetchedNews, setAllFetchedNews] = useState<NewsItem[]>([]);
  const [displayCount, setDisplayCount] = useState(4);
  const [page, setPage] = useState(1);

  const [searchTerm, setSearchTerm] = useState(initialKeyword);
  const [activeSearch, setActiveSearch] = useState(initialKeyword);

  // [Fix] 초기 로딩 true (스켈레톤 즉시 노출)
  const [isLoading, setIsLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);

  const isInitialLoading = isLoading && page === 1;

  const fetchNews = useCallback(
    async (pageNum: number, isNewSearch: boolean = false) => {
      setIsLoading(true);
      try {
        const queryParam = activeSearch
          ? `&query=${encodeURIComponent(activeSearch)}`
          : "";
        const response = await api.get<NewsResponse>(
          `/news/daejeon?page=${pageNum}${queryParam}`
        );
        const newItems = response.data.items || [];

        // 스켈레톤 확인용 지연 (0.5초)
        if (pageNum === 1) await new Promise((r) => setTimeout(r, 500));

        setAllFetchedNews((prev) => {
          if (isNewSearch) return newItems;
          const existingLinks = new Set(prev.map((item) => item.link));
          const uniqueNewItems = newItems.filter(
            (item) => !existingLinks.has(item.link)
          );
          return [...prev, ...uniqueNewItems];
        });

        if (newItems.length < 8) setHasMore(false);
        else setHasMore(true);
      } catch (err) {
        console.error("뉴스 로드 실패:", err);
        setHasMore(false);
      } finally {
        setIsLoading(false);
      }
    },
    [activeSearch]
  );

  useEffect(() => {
    setPage(1);
    setDisplayCount(4);
    fetchNews(1, true);
  }, [activeSearch, fetchNews]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setActiveSearch(searchTerm);
  };

  const handleLoadMore = async () => {
    const nextDisplayCount = displayCount + 4;
    if (nextDisplayCount > allFetchedNews.length && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      await fetchNews(nextPage);
    }
    setDisplayCount(nextDisplayCount);
  };

  const visibleNews = useMemo(() => {
    return allFetchedNews.slice(0, displayCount);
  }, [allFetchedNews, displayCount]);

  const showMoreButton = hasMore || displayCount < allFetchedNews.length;

  return (
    <div className="min-h-screen bg-[#fcfcfc] text-slate-900 pb-24">
      <div className="max-w-7xl mx-auto px-6 py-16">
        {/* 헤더 섹션 */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-16">
          <div className="space-y-5">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-black tracking-tight">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              DAEJEON NOW
            </div>
            <h2 className="text-3xl lg:text-5xl font-extrabold tracking-tight leading-[1.1]">
              대전 실시간{" "}
              <span className="text-transparent bg-clip-text bg-linear-to-r from-green-600 to-green-400">
                핵심 뉴스
              </span>
            </h2>
          </div>

          {/* 검색 폼 */}
          <form onSubmit={handleSearch} className="relative w-full lg:w-96">
            <Search
              className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400"
              size={20}
            />
            <input
              type="text"
              placeholder="뉴스 검색 후 엔터..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-14 pr-12 py-4 bg-white border border-slate-200 rounded-3xl text-sm font-bold shadow-sm focus:outline-none focus:ring-4 focus:ring-green-500/10 focus:border-green-500 transition-all"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => {
                  setSearchTerm("");
                  setActiveSearch("");
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-100 rounded-full"
              >
                <X size={16} className="text-slate-400" />
              </button>
            )}
          </form>
        </div>

        {/* 렌더링 로직 */}
        {isInitialLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array(8)
              .fill(0)
              .map((_, index) => (
                <NewsSkeleton key={`skeleton-${index}`} />
              ))}
          </div>
        ) : visibleNews.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {visibleNews.map((item, index) => (
                <article
                  key={`${item.link}-${index}`}
                  className="group flex flex-col bg-white rounded-[2.5rem] overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-500"
                >
                  <div className="relative aspect-16/11 overflow-hidden">
                    <img
                      src={item.thumbnail || "/placeholder.png"}
                      alt="thumbnail"
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      onError={(e) => (e.currentTarget.style.display = "none")}
                    />
                  </div>
                  <div className="p-7 flex flex-col flex-1">
                    <h3 className="text-lg font-bold leading-snug mb-3 group-hover:text-green-600 transition-colors line-clamp-2">
                      <a
                        href={item.link}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {cleanText(item.title)}
                      </a>
                    </h3>
                    <p className="text-sm text-slate-500 line-clamp-3 mb-8 leading-relaxed font-medium">
                      {cleanText(item.description)}
                    </p>
                    <div className="mt-auto pt-5 flex items-center justify-between border-t border-slate-50">
                      <span className="text-[11px] text-slate-400 font-bold uppercase">
                        {item.pubDate}
                      </span>
                      <a
                        href={item.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-black text-green-600 flex items-center gap-1 group/btn"
                      >
                        READ MORE{" "}
                        <ArrowRight
                          size={14}
                          className="group-hover/btn:translate-x-1 transition-transform"
                        />
                      </a>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            {showMoreButton && (
              <div className="mt-20 flex justify-center">
                <button
                  onClick={handleLoadMore}
                  disabled={isLoading}
                  className="px-10 py-5 bg-slate-900 text-white rounded-2xl font-black text-sm hover:scale-105 transition-all shadow-xl active:scale-95 flex items-center gap-2 disabled:bg-slate-400"
                >
                  {isLoading ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : null}
                  뉴스 더 불러오기 (+4개)
                </button>
              </div>
            )}
          </>
        ) : (
          // [New] 뉴스 Empty State (스티커 적용)
          <div className="flex flex-col items-center justify-center py-32 bg-white rounded-[3rem] border border-dashed border-slate-200 text-center relative overflow-hidden">
            {/* 배경 데코레이션 */}
            <div className="absolute top-10 left-10 text-6xl opacity-5 rotate-[-15deg] select-none pointer-events-none">
              📰
            </div>
            <div className="absolute bottom-10 right-10 text-6xl opacity-5 rotate-[15deg] select-none pointer-events-none">
              🗞️
            </div>

            {/* 스티커 이모지 */}
            <div className="relative mb-8 group cursor-default select-none">
              <div className="text-[80px] drop-shadow-2xl filter hover:scale-110 transition-transform duration-300 rotate-[-5deg] z-10 relative">
                🤔
              </div>
              <div className="absolute -top-6 -right-6 text-[50px] drop-shadow-xl rotate-[15deg] animate-bounce z-20">
                🔎
              </div>
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-20 h-4 bg-black/10 blur-md rounded-full"></div>
            </div>

            <h3 className="text-2xl font-black text-slate-900 mb-3 tracking-tight">
              {activeSearch
                ? `'${activeSearch}' 관련 뉴스를 찾을 수 없어요.`
                : "등록된 뉴스가 없습니다."}
            </h3>
            <p className="text-slate-500 mb-0 text-sm font-medium">
              다른 키워드로 검색하거나 잠시 후 다시 시도해보세요!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function NewsPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center">Loading...</div>}>
      <NewsPageContent />
    </Suspense>
  );
}
