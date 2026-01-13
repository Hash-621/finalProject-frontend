// 1. "use client": 이 파일이 브라우저에서 실행되는 클라이언트 컴포넌트임을 선언합니다.
// (사용자 검색, 더보기 클릭 등 상호작용이 있기 때문입니다.)
"use client";

// --- [라이브러리 및 훅 임포트] ---
import { useState, useEffect, useMemo, useCallback, Suspense } from "react"; // 리액트 훅들
import { useSearchParams } from "next/navigation"; // URL 쿼리 파라미터 읽기용
import api from "@/api/axios"; // API 통신 모듈
import { NewsResponse, NewsItem } from "@/types/news"; // 데이터 타입 정의
// 아이콘 라이브러리
import { ArrowRight, Loader2, Search, X } from "lucide-react";
import { formatDate } from "@/utils/formatDate";

// --- [UI 컴포넌트: 뉴스 스켈레톤] ---
// 뉴스 데이터 로딩 중에 보여줄 뼈대 UI입니다. 깜빡이는 회색 박스들로 구성됩니다.
const NewsSkeleton = () => (
  <div className="flex flex-col bg-white rounded-[2.5rem] overflow-hidden border border-slate-100 shadow-sm animate-pulse">
    <div className="aspect-16/11 bg-slate-200" /> {/* 이미지 자리 */}
    <div className="p-7 flex flex-col flex-1">
      <div className="h-7 bg-slate-200 rounded-lg w-3/4 mb-3" />{" "}
      {/* 제목 자리 */}
      <div className="h-7 bg-slate-200 rounded-lg w-1/2 mb-6" />
      <div className="space-y-3 mb-8">
        {" "}
        {/* 본문 자리 */}
        <div className="h-4 bg-slate-200 rounded w-full" />
        <div className="h-4 bg-slate-200 rounded w-full" />
        <div className="h-4 bg-slate-200 rounded w-2/3" />
      </div>
      <div className="mt-auto pt-5 flex items-center justify-between border-t border-slate-50">
        <div className="h-3 bg-slate-200 rounded w-20" /> {/* 날짜 자리 */}
        <div className="h-3 bg-slate-200 rounded w-16" /> {/* 버튼 자리 */}
      </div>
    </div>
  </div>
);

// --- [유틸리티 함수: 텍스트 정리] ---
// API에서 온 뉴스 데이터에 포함된 HTML 태그(<b>, &quot; 등)를 제거하고 깨끗한 텍스트로 만듭니다.
const cleanText = (text: string) => {
  if (!text) return "";
  return text
    .replace(/(<([^>]+)>)/gi, "") // HTML 태그 제거
    .replace(/&quot;/g, '"') // 따옴표 복원
    .replace(/&amp;/g, "&") // & 기호 복원
    .replace(/&lt;/g, "<") // 부등호(<) 복원
    .replace(/&gt;/g, ">") // 부등호(>) 복원
    .replace(/&nbsp;/g, " "); // 공백 복원
};

// --- [메인 콘텐츠 컴포넌트] ---
function NewsPageContent() {
  // URL에서 초기 검색어 가져오기 (예: /news?searchKeyword=과학 -> "과학")
  const searchParams = useSearchParams();
  const initialKeyword = searchParams.get("searchKeyword") || "";

  // --- [상태 관리] ---
  const [allFetchedNews, setAllFetchedNews] = useState<NewsItem[]>([]); // 불러온 모든 뉴스 데이터
  const [displayCount, setDisplayCount] = useState(12); // 화면에 보여줄 개수 (초기 4개)
  const [page, setPage] = useState(1); // 현재 API 페이지 번호

  const [searchTerm, setSearchTerm] = useState(initialKeyword); // 검색창 입력값
  const [activeSearch, setActiveSearch] = useState(initialKeyword); // 실제 검색 실행된 키워드

  const [isLoading, setIsLoading] = useState(true); // 로딩 중 여부
  const [hasMore, setHasMore] = useState(true); // 더 불러올 데이터가 있는지 여부

  // 초기 로딩 상태인지 확인 (첫 페이지 로딩 중일 때만 스켈레톤 보여주기 위함)
  const isInitialLoading = isLoading && page === 1;

  // --- [뉴스 데이터 가져오기 함수] ---
  const fetchNews = useCallback(
    async (pageNum: number, isNewSearch: boolean = false) => {
      setIsLoading(true); // 로딩 시작
      try {
        // 검색어가 있으면 쿼리 파라미터 추가
        const queryParam = activeSearch
          ? `&query=${encodeURIComponent(activeSearch)}`
          : "";

        // API 호출
        const response = await api.get<NewsResponse>(
          `/news/daejeon?page=${pageNum}${queryParam}`
        );
        const newItems = response.data.items || [];

        // [UX] 첫 로딩 시 스켈레톤을 잠깐 보여주기 위해 0.5초 지연
        if (pageNum === 1) await new Promise((r) => setTimeout(r, 500));

        // 데이터 상태 업데이트 (중복 제거 로직 포함)
        setAllFetchedNews((prev) => {
          if (isNewSearch) return newItems; // 새 검색이면 덮어쓰기
          // 더보기일 경우: 기존 데이터에 없는 새 데이터만 추가
          const existingLinks = new Set(prev.map((item) => item.link));
          const uniqueNewItems = newItems.filter(
            (item) => !existingLinks.has(item.link)
          );
          return [...prev, ...uniqueNewItems];
        });

        // 가져온 데이터가 8개 미만이면 더 이상 데이터가 없는 것으로 간주
        if (newItems.length < 8) setHasMore(false);
        else setHasMore(true);
      } catch (err) {
        console.error("뉴스 로드 실패:", err);
        setHasMore(false);
      } finally {
        setIsLoading(false); // 로딩 끝
      }
    },
    [activeSearch] // 검색어가 바뀔 때마다 함수 재생성
  );

  // --- [초기 실행 및 검색어 변경 감지] ---
  useEffect(() => {
    setPage(1); // 1페이지부터 시작
    setDisplayCount(12); // 4개만 먼저 보여줌
    fetchNews(1, true); // 데이터 요청 (새 검색 모드)
  }, [activeSearch, fetchNews]);

  // --- [이벤트 핸들러] ---

  // 검색 폼 제출
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setActiveSearch(searchTerm); // 실제 검색어 상태 업데이트 -> useEffect 발동
  };

  // '더보기' 버튼 클릭
  const handleLoadMore = async () => {
    const nextDisplayCount = displayCount + 4; // 4개 더 보여주기

    // 만약 보여줄 데이터가 부족하고, 서버에 더 있다면? -> 추가 로딩
    if (nextDisplayCount > allFetchedNews.length && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      await fetchNews(nextPage); // 다음 페이지 데이터 요청
    }
    setDisplayCount(nextDisplayCount); // 보여줄 개수 업데이트
  };

  // 현재 화면에 보여줄 뉴스 데이터만 자르기 (Memoization)
  const visibleNews = useMemo(() => {
    return allFetchedNews.slice(0, displayCount);
  }, [allFetchedNews, displayCount]);

  // 더보기 버튼을 보여줄지 결정 (더 로딩할 게 있거나, 아직 덜 보여준 게 있으면 true)
  const showMoreButton = hasMore || displayCount < allFetchedNews.length;

  // --- [화면 렌더링] ---
  return (
    <div className="min-h-screen bg-[#fcfcfc] text-slate-900 pb-24">
      <div className="max-w-7xl mx-auto px-6 py-16">
        {/* 1. 헤더 섹션 (제목, 검색창) */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-16">
          {/* 타이틀 및 뱃지 */}
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
            {/* 검색어 삭제 버튼 (입력값 있을 때만) */}
            {searchTerm && (
              <button
                type="button"
                onClick={() => {
                  setSearchTerm("");
                  setActiveSearch(""); // 검색어도 초기화
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-100 rounded-full"
              >
                <X size={16} className="text-slate-400" />
              </button>
            )}
          </form>
        </div>

        {/* 2. 뉴스 목록 영역 */}
        {isInitialLoading ? (
          // (1) 초기 로딩 중: 스켈레톤 8개 표시
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array(8)
              .fill(0)
              .map((_, index) => (
                <NewsSkeleton key={`skeleton-${index}`} />
              ))}
          </div>
        ) : visibleNews.length > 0 ? (
          // (2) 데이터 있음: 뉴스 카드 그리드 표시
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {visibleNews.map((item, index) => (
                <article
                  key={`${item.link}-${index}`}
                  className="group flex flex-col bg-white rounded-[2.5rem] overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-500"
                >
                  {/* 썸네일 이미지 */}
                  <div className="relative aspect-16/11 overflow-hidden">
                    <img
                      src={item.thumbnail || "/placeholder.png"}
                      alt="thumbnail"
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      onError={(e) => (e.currentTarget.style.display = "none")} // 이미지 에러 시 숨김 처리
                    />
                  </div>

                  {/* 뉴스 내용 */}
                  <div className="p-7 flex flex-col flex-1">
                    {/* 제목 (클릭 시 원문 이동) */}
                    <h3 className="text-lg font-bold leading-snug mb-3 group-hover:text-green-600 transition-colors line-clamp-2">
                      <a
                        href={item.link}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {cleanText(item.title)} {/* HTML 태그 제거된 제목 */}
                      </a>
                    </h3>
                    {/* 본문 요약 */}
                    <p className="text-sm text-slate-500 line-clamp-3 mb-8 leading-relaxed font-medium">
                      {cleanText(item.description)}
                    </p>

                    {/* 하단 정보 (날짜, 더보기 버튼) */}
                    <div className="mt-auto pt-5 flex items-center justify-between border-t border-slate-50">
                      <span className="text-[11px] text-slate-400 font-bold uppercase">
                        {formatDate(item.pubDate)}
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

            {/* 더보기 버튼 */}
            {showMoreButton && (
              <div className="mt-20 flex justify-center">
                <button
                  onClick={handleLoadMore}
                  disabled={isLoading} // 로딩 중 클릭 방지
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
          // (3) 데이터 없음: Empty State UI 표시
          <div className="flex flex-col items-center justify-center py-32 bg-white rounded-[3rem] border border-dashed border-slate-200 text-center relative overflow-hidden">
            {/* 배경 장식 */}
            <div className="absolute top-10 left-10 text-6xl opacity-5 rotate-[-15deg] select-none pointer-events-none">
              📰
            </div>
            <div className="absolute bottom-10 right-10 text-6xl opacity-5 rotate-15 select-none pointer-events-none">
              🗞️
            </div>

            {/* 중앙 아이콘 */}
            <div className="relative mb-8 group cursor-default select-none">
              <div className="text-[80px] drop-shadow-2xl filter hover:scale-110 transition-transform duration-300 rotate-[-5deg] z-10 relative">
                🤔
              </div>
              <div className="absolute -top-6 -right-6 text-[50px] drop-shadow-xl rotate-15 animate-bounce z-20">
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

// --- [최상위 페이지 컴포넌트] ---
// useSearchParams를 안전하게 쓰기 위해 Suspense로 감쌉니다.
export default function NewsPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center">Loading...</div>}>
      <NewsPageContent />
    </Suspense>
  );
}

// 1. 페이지 진입 및 초기 로딩 (Initial Fetch)

// 페이지에 들어오자마자 useEffect가 실행됩니다.

// fetchNews(1)이 호출되어 1페이지 뉴스 데이터를 요청합니다.

// 데이터가 올 때까지 화면엔 스켈레톤(회색 박스) 8개가 깜빡입니다. (로딩 중임을 알림)

// 2. 데이터 수신 및 렌더링 (Data Render)

// 서버에서 뉴스 목록이 도착합니다. setAllFetchedNews로 저장하고, loading을 끕니다.

// 스켈레톤이 사라지고 뉴스 카드 4개가 나타납니다. (초기 displayCount가 4개)

// 3. 더보기 클릭 (Pagination Interaction)

// 사용자가 하단의 [뉴스 더 불러오기] 버튼을 누릅니다.

// displayCount가 4에서 8로 늘어나, 숨겨져 있던 뉴스 4개가 추가로 보입니다.

// 만약 불러온 데이터(8개)를 다 보여줬다면? -> fetchNews(2)를 호출해 서버에서 다음 페이지 데이터를 더 가져옵니다.

// 4. 검색 실행 (Search)

// 사용자가 검색창에 "날씨"라고 입력하고 엔터를 칩니다.

// handleSearch -> setActiveSearch -> useEffect 순으로 실행됩니다.

// 기존 목록을 싹 비우고, ?query=날씨 파라미터를 달아 서버에 새로 요청합니다.

// 새로운 검색 결과가 화면에 나타납니다. 만약 결과가 없다면 "관련 뉴스를 찾을 수 없어요" 화면이 뜹니다.
