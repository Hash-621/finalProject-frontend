// 1. "use client": 이 파일이 브라우저에서 실행되는 클라이언트 컴포넌트임을 선언합니다.
// (사용자 검색, 스크롤 이동, 라우팅 등을 처리하기 위해 필수입니다.)
"use client";

// --- [라이브러리 및 컴포넌트 임포트] ---
import { useEffect, useState, Suspense } from "react"; // 리액트 훅
import { useSearchParams, useRouter } from "next/navigation"; // 라우팅 훅
import api from "@/api/axios"; // API 호출 모듈

// 검색바 컴포넌트 (상단에 고정되어 재검색을 돕습니다)
import SearchBar from "@/components/common/SearchBar";

// 각종 데이터 타입 정의 불러오기
import { RestaurantData } from "@/types/restaurant";
import { Tour } from "@/types/tour";
import { HospitalResponse } from "@/types/hospital";
import { JobData } from "@/types/job";
import { NewsItem } from "@/types/news";
import { PostItem } from "@/types/board";

// --------------------------------------------------------
// 1. 설정 및 타입 정의
// --------------------------------------------------------

// 전체 검색 결과 데이터의 구조 정의
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

// 검색 결과 초기값 (빈 배열로 초기화)
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

// 각 섹션(카테고리)별 설정값
// id: 데이터 키값, title: 화면에 보일 제목, limit: 미리보기 개수
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

// 이미지 기본 경로 설정
const RESTAURANT_IMAGE_BASE = "/images/restaurantImages/";

// --------------------------------------------------------
// 2. 헬퍼 함수 (유틸리티)
// --------------------------------------------------------

// 이미지 경로가 온전한 URL인지 확인하고, 아니면 기본 경로를 붙여주는 함수
const getSafeImageSrc = (basePath: string, path: string | null | undefined) => {
  if (!path) return null;
  if (path.startsWith("http") || path.startsWith("/")) return path;
  return `${basePath}${path}`;
};

// 이미지가 깨졌을 때(404 등) 호출되는 에러 핸들러
// 이미지를 숨기고 대신 "이미지 없음" 텍스트를 보여줍니다.
const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
  e.currentTarget.style.display = "none";
  if (e.currentTarget.parentElement) {
    e.currentTarget.parentElement.classList.add(
      "flex",
      "items-center",
      "justify-center",
      "text-gray-400",
      "text-sm",
    );
    e.currentTarget.parentElement.innerText = "이미지 없음";
  }
};

// --------------------------------------------------------
// 3. 섹션 컴포넌트 (SearchSection)
// 각 카테고리별 결과를 보여주는 덩어리 컴포넌트입니다.
// --------------------------------------------------------
interface SectionProps {
  title: string;
  data: any[];
  limit: number;
  categoryKey: string;
  searchKeyword: string;
  type: "card" | "list"; // 카드형인지 리스트형인지 결정
  renderItem: (item: any) => React.ReactNode; // 개별 아이템 렌더링 함수
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

  // 데이터가 없으면 아예 섹션을 그리지 않습니다.
  if (!data || data.length === 0) return null;

  // 화면에는 limit 개수만큼만 잘라서 보여줍니다.
  const displayData = data.slice(0, limit);
  // 전체 데이터가 limit보다 많으면 '더보기' 버튼을 보여줄 조건이 됩니다.
  const hasMore = data.length > limit;

  // 더보기 버튼 클릭 시 상세 페이지로 이동
  const handleMoreClick = () => {
    if (categoryKey === "news") {
      // 뉴스만 별도 경로 사용 (/news)
      router.push(`/news?searchKeyword=${encodeURIComponent(searchKeyword)}`);
    } else {
      // 나머지는 공통 상세 페이지 (/search/results/[category])
      router.push(
        `/search/results/${categoryKey}?searchKeyword=${encodeURIComponent(
          searchKeyword,
        )}`,
      );
    }
  };

  return (
    <div id={categoryKey} className="mb-16 scroll-mt-32">
      {/* 섹션 헤더 (제목 + 개수 + 더보기 버튼) */}
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

      {/* 아이템 리스트 (카드형/리스트형 분기) */}
      <div
        className={
          type === "card"
            ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            : "flex flex-col gap-3"
        }
      >
        {displayData.map((item, index) => (
          <div key={index} className="w-full">
            {/* 부모가 전달해준 renderItem 함수로 내용을 그립니다. */}
            {renderItem(item)}
          </div>
        ))}
      </div>
    </div>
  );
};

// --------------------------------------------------------
// 4. 메인 컨텐츠 컴포넌트
// --------------------------------------------------------
function SearchResultsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const keyword = searchParams.get("searchKeyword"); // URL에서 검색어 추출
  const status = searchParams.get("searchStatus") || "all"; // (현재 미사용)

  const [results, setResults] = useState<SearchResultData>(INITIAL_RESULTS); // 검색 결과 상태
  const [loading, setLoading] = useState(false); // 로딩 상태
  const [activeSection, setActiveSection] = useState<string>(""); // 현재 보고 있는 섹션 (좌측 메뉴용)

  // 좌측 메뉴 클릭 시 해당 섹션으로 스크롤 이동하는 함수
  const handleScrollTo = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const headerOffset = 100; // 헤더 높이만큼 보정
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition =
        elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });

      setActiveSection(id); // 활성 섹션 업데이트
    }
  };

  // --- [데이터 패칭] ---
  // 검색어가 바뀔 때마다 실행
  useEffect(() => {
    if (!keyword) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        // 일반 검색 API 요청
        const generalSearchPromise = api.get(`/search`, {
          params: { query: keyword },
        });
        // 뉴스 검색 API 요청 (별도 엔드포인트)
        const newsSearchPromise = api.get(`/news/daejeon`, {
          params: { query: keyword },
        });

        // 두 요청을 병렬로 동시에 실행 (Promise.all)
        const [generalRes, newsRes] = await Promise.all([
          generalSearchPromise,
          newsSearchPromise,
        ]);

        // 결과 합치기
        setResults({
          ...INITIAL_RESULTS,
          ...generalRes.data, // 맛집, 관광지 등
          news: newsRes.data.items || [], // 뉴스 데이터
        });
      } catch (error) {
        console.error("검색 오류:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [keyword, status]);

  // 검색어가 없으면 안내 메시지 표시
  if (!keyword)
    return (
      <div className="p-20 text-center text-gray-500">
        검색어를 입력해주세요.
      </div>
    );

  // --- [화면 렌더링] ---
  return (
    <div className="max-w-7xl mx-auto px-4 pb-20">
      {/* 1. 최상단 검색바 (고정) */}
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

      {/* 2. 컨텐츠 영역 (좌측 메뉴 + 우측 결과) */}
      <div className="flex flex-col lg:flex-row gap-12 relative">
        {/* 좌측 퀵 메뉴 (PC에서만 보임, 스크롤 따라다님) */}
        <aside className="hidden lg:block w-40 flex-shrink-0">
          <div className="sticky top-32">
            <ul className="flex flex-col gap-1 border-l-2 border-gray-100">
              {SECTION_CONFIG.map((section) => {
                const data = results[section.id as keyof SearchResultData];
                // 데이터 없는 섹션은 메뉴에서도 숨김
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
            // 로딩 중 표시
            <div className="py-20 text-center text-gray-500">
              열심히 검색하고 있어요... ⏳
            </div>
          ) : Object.values(results).every(
              (arr) => !arr || arr.length === 0,
            ) ? (
            // 결과 없음 표시
            <div className="flex flex-col items-center justify-center py-20 min-h-[400px]">
              <div className="text-[90px] mb-6 animate-bounce filter drop-shadow-lg leading-none">
                🧐
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-3">
                '<span className="text-green-600">{keyword}</span>'에 대한 검색
                결과가 없어요
              </h3>
              <div className="text-gray-500 text-center space-y-1 bg-gray-50 px-8 py-6 rounded-2xl">
                <p>단어의 철자가 정확한지 확인해 주세요.</p>
                <p>검색어를 조금 더 짧게, 혹은 다른 단어로 시도해 보세요!</p>
              </div>
            </div>
          ) : (
            // 결과 목록 렌더링
            <>
              {SECTION_CONFIG.map((section) => {
                const data = results[section.id as keyof SearchResultData];
                if (!data || data.length === 0) return null;

                let renderItemFn;
                let type: "card" | "list" = "card";

                // ----------------------------------------------------------------
                // [카테고리별 렌더링 로직]
                // 각 섹션마다 아이템을 어떻게 그릴지 함수를 정의합니다.
                // ----------------------------------------------------------------
                switch (section.id) {
                  case "restaurants":
                    renderItemFn = (item: RestaurantData) => {
                      const imgSrc = getSafeImageSrc(
                        RESTAURANT_IMAGE_BASE,
                        item.imagePath,
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
                          onClick={() =>
                            router.push(
                              `/tour/attraction?keyword=${encodeURIComponent(
                                item.name,
                              )}`,
                            )
                          }
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
                              item.companyName,
                            )}`,
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
                            {item.description || "대전 전체"}
                          </span>
                          <span className="bg-gray-100 px-2 py-1 rounded">
                            {item.careerLevel}
                          </span>
                        </div>
                      </div>
                    );
                    break;

                  case "news":
                    type = "list";
                    renderItemFn = (item: NewsItem) => (
                      <div className="border border-gray-100 py-4 rounded-lg hover:border-green-500 hover:shadow-lg transition-all flex flex-col sm:flex-row justify-between sm:items-center">
                        <div className="flex-1 pr-4 min-w-0 ml-3 md:ml-4">
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
                        <span className="text-xs text-gray-400 mt-2 sm:mt-0 whitespace-nowrap ml-4 md:mr-4">
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
                          by {item.userNickname}
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
                              <span>{item.userNickname}</span>
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

                // SearchSection 컴포넌트를 이용해 최종 렌더링
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

// --- [최상위 페이지 컴포넌트] ---
// useSearchParams를 안전하게 사용하기 위해 Suspense로 감싸줍니다.
export default function SearchPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SearchResultsContent />
    </Suspense>
  );
}

// 1. 페이지 진입 및 데이터 병렬 호출 (Initial Fetch)

// 사용자가 /search?searchKeyword=김치찌개로 이동합니다.

// useEffect가 실행되어 keyword("김치찌개")를 확인합니다.

// [핵심] 서버에 두 가지 요청을 동시에 보냅니다.

// GET /search?query=김치찌개: 맛집, 관광지, 병원 등 내부 DB 검색

// GET /news/daejeon?query=김치찌개: 네이버 뉴스 등 외부 API 검색

// Promise.all로 두 요청이 모두 끝날 때까지 기다립니다.

// 2. 결과 병합 및 렌더링 (Merge & Render)

// 응답이 도착하면 setResults로 모든 데이터를 한 번에 저장하고 로딩을 끕니다.

// 화면에는 SECTION_CONFIG 순서대로 섹션(맛집, 관광지...)들이 차례로 그려집니다.

// 각 섹션은 SearchSection 컴포넌트가 담당하며, 데이터가 있는 섹션만 표시됩니다.

// 3. 사용자 탐색 (User Navigation)

// 좌측 퀵 메뉴: "맛집" 버튼을 누르면 화면이 부드럽게 스크롤되어 맛집 섹션으로 이동합니다. (handleScrollTo)

// 상세 이동: "할머니 김치찌개" 카드를 클릭하면 해당 상세 페이지(/restaurant/123)로 이동합니다.

// 더보기: 맛집 결과가 4개보다 많으면, 우측 상단에 "더보기" 버튼이 생깁니다. 이걸 누르면 맛집만 모아둔 상세 결과 페이지(/search/results/restaurants)로 이동합니다.
