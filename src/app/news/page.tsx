"use client";

import { useState, useEffect, useMemo, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation"; // 1. 훅 임포트
import api from "@/api/axios";
import { NewsResponse, NewsItem } from "@/types/news";
import { ArrowRight, Loader2, Newspaper, Search, X } from "lucide-react";

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
  const searchParams = useSearchParams(); // 2. URL 파라미터 가져오기

  // 3. URL에서 'searchKeyword'가 있으면 가져오고 없으면 빈 문자열
  const initialKeyword = searchParams.get("searchKeyword") || "";

  const [allFetchedNews, setAllFetchedNews] = useState<NewsItem[]>([]);
  const [displayCount, setDisplayCount] = useState(4);
  const [page, setPage] = useState(1);

  // 4. useState 초기값에 URL에서 가져온 키워드를 넣어줍니다.
  // 이렇게 하면 페이지가 열리자마자 검색창에 글자가 채워져 있고, activeSearch가 설정됩니다.
  const [searchTerm, setSearchTerm] = useState(initialKeyword);
  const [activeSearch, setActiveSearch] = useState(initialKeyword);

  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  // 📡 데이터 가져오기 로직
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

  // 5. activeSearch(초기값 포함)가 있으면 useEffect가 실행되어 fetchNews를 호출합니다.
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

        {/* 뉴스 그리드 */}
        {visibleNews.length > 0 ? (
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
          !isLoading && (
            <div className="flex flex-col items-center justify-center py-32 text-center border-2 border-dashed border-slate-200 rounded-[3rem]">
              <Newspaper className="w-12 h-12 text-slate-200 mb-6" />
              <h3 className="text-2xl font-black mb-2 text-slate-900">
                {activeSearch
                  ? `'${activeSearch}'에 대한 뉴스가 없습니다.`
                  : "뉴스가 없습니다."}
              </h3>
            </div>
          )
        )}
      </div>
    </div>
  );
}

// 6. Suspense로 감싸주기 (useSearchParams 사용 시 필수)
export default function NewsPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center">Loading...</div>}>
      <NewsPageContent />
    </Suspense>
  );
}
