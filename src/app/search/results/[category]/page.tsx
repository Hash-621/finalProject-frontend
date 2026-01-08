// 1. "use client": 이 파일이 브라우저에서 실행되는 클라이언트 컴포넌트임을 선언합니다.
// (페이지네이션, 라우팅, 검색바 입력 등 상호작용이 많기 때문입니다.)
"use client";

// --- [라이브러리 및 훅 임포트] ---
import { useEffect, useState, Suspense } from "react"; // 리액트 훅
import { useSearchParams, useParams, useRouter } from "next/navigation"; // 라우팅 관련 훅
import api from "@/api/axios"; // API 호출 모듈

// [수정 1] 상단 검색바 컴포넌트 임포트 (재검색 기능 제공)
import SearchBar from "@/components/common/SearchBar";

// 프로젝트 내 사용되는 데이터 타입들 정의 임포트
import { RestaurantData } from "@/types/restaurant";
import { Tour } from "@/types/tour";
import { HospitalResponse } from "@/types/hospital";
import { JobData } from "@/types/job";
import { NewsItem } from "@/types/news";
import { PostItem } from "@/types/board";

// --- [상수 정의] ---
// 한 페이지에 보여줄 아이템 개수 (12개씩 끊어서 보여줌)
const ITEMS_PER_PAGE = 12;

// 이미지 경로 앞부분 (서버나 로컬 폴더 경로에 맞춰 설정)
const RESTAURANT_IMAGE_BASE = "/images/restaurantImages/";
// const TOUR_IMAGE_BASE = "/images/tours/"; // (현재는 주석 처리됨)

// URL 파라미터(영어)를 한글 제목으로 매핑하기 위한 객체
const CATEGORY_TITLES: { [key: string]: string } = {
  restaurants: "맛집",
  tours: "관광지",
  tourPosts: "사용자 추천 관광지",
  hospitals: "병원",
  jobs: "구인구직",
  jobPosts: "사용자 구인구직",
  communityPosts: "커뮤니티",
  news: "뉴스",
};

// --- [메인 콘텐츠 컴포넌트] ---
function CategoryResultContent() {
  const router = useRouter(); // 라우터 객체
  const params = useParams(); // URL 경로 파라미터 (/search/[category] 등)
  const searchParams = useSearchParams(); // URL 쿼리 파라미터 (?searchKeyword=...)

  const category = params.category as string; // 현재 카테고리 (예: 'restaurants')
  const keyword = searchParams.get("searchKeyword"); // 검색어 (예: '김치찌개')

  // --- [상태 관리] ---
  const [allItems, setAllItems] = useState<any[]>([]); // 불러온 전체 데이터
  const [currentItems, setCurrentItems] = useState<any[]>([]); // 현재 페이지에 보여줄 데이터
  const [loading, setLoading] = useState(false); // 로딩 상태

  const [currentPage, setCurrentPage] = useState(1); // 현재 페이지 번호
  const [totalPages, setTotalPages] = useState(0); // 전체 페이지 수

  // 화면에 표시할 한글 제목 (없으면 영어 그대로 표시)
  const pageTitle = CATEGORY_TITLES[category] || category;

  // --- [1. 데이터 가져오기 (useEffect)] ---
  // 카테고리나 검색어가 바뀔 때마다 실행되어 데이터를 새로 요청합니다.
  useEffect(() => {
    if (!keyword || !category) return; // 필수 값이 없으면 중단

    const fetchData = async () => {
      setLoading(true); // 로딩 시작
      try {
        let data = [];

        // 뉴스 카테고리는 별도 API 엔드포인트 사용
        if (category === "news") {
          const res = await api.get(`/news/daejeon`, {
            params: { query: keyword, display: 100 }, // 최대 100개까지 가져옴
          });
          data = res.data.items || [];
        } else {
          // 그 외 카테고리는 통합 검색 API 사용
          const res = await api.get(`/search`, {
            params: { query: keyword },
          });
          // 응답 데이터 구조에서 해당 카테고리 배열만 추출
          if (res.data && res.data[category]) {
            data = res.data[category];
          }
        }

        setAllItems(data); // 전체 데이터 저장
        setTotalPages(Math.ceil(data.length / ITEMS_PER_PAGE)); // 총 페이지 수 계산
        setCurrentPage(1); // 1페이지로 초기화
      } catch (error) {
        console.error("데이터 로딩 실패:", error);
      } finally {
        setLoading(false); // 로딩 끝
      }
    };

    fetchData();
  }, [category, keyword]);

  // --- [2. 페이지네이션 (useEffect)] ---
  // 페이지 번호나 전체 데이터가 바뀔 때마다 실행되어 보여줄 데이터를 자릅니다.
  useEffect(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    setCurrentItems(allItems.slice(startIndex, endIndex)); // 배열 슬라이싱
    window.scrollTo(0, 0); // 페이지 바뀔 때 스크롤 맨 위로 이동
  }, [currentPage, allItems]);

  // 페이지 변경 핸들러
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // --- [이미지 경로 처리 헬퍼 함수] ---
  // DB에 저장된 이미지 경로가 완전한 URL인지, 상대 경로인지 확인하여 올바른 주소 반환
  const getSafeImageSrc = (
    basePath: string,
    path: string | null | undefined
  ) => {
    if (!path) return null;
    if (path.startsWith("http") || path.startsWith("/")) return path;
    return `${basePath}${path}`;
  };

  // --- [화면 렌더링 1: 로딩 중] ---
  if (loading)
    return (
      <div className="p-20 text-center">데이터를 불러오는 중입니다... ⏳</div>
    );

  // -----------------------------------------------------------------------
  // [렌더링 로직] 카테고리별로 다른 카드 UI를 보여줍니다.
  // -----------------------------------------------------------------------
  const renderContent = () => {
    // 1. 결과 없음 처리
    if (currentItems.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-20 min-h-[400px]">
          {/* 텅 빈 우체통 이모지 애니메이션 */}
          <div className="text-[100px] mb-6 animate-bounce filter drop-shadow-lg leading-none">
            📭
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-3">
            결과가 없습니다
          </h3>
          <div className="text-gray-500 text-center space-y-1 bg-gray-50 px-8 py-6 rounded-2xl">
            <p>'{pageTitle}' 카테고리에 대한 데이터가 없거나,</p>
            <p>검색어와 일치하는 내용을 찾을 수 없어요.</p>
          </div>
          <button
            onClick={() => router.push("/")}
            className="mt-8 px-6 py-2.5 bg-gray-100 hover:bg-green-100 hover:text-green-700 text-gray-600 rounded-full font-medium transition-colors text-sm"
          >
            홈으로 돌아가기
          </button>
        </div>
      );
    }

    // 그리드 레이아웃 공통 클래스 (반응형)
    const gridClass =
      "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6";

    // 카테고리별 분기 처리
    switch (category) {
      // (1) 맛집 카테고리
      case "restaurants":
        return (
          <div className={gridClass}>
            {currentItems.map((item: RestaurantData, index) => {
              const imgSrc = getSafeImageSrc(
                RESTAURANT_IMAGE_BASE,
                item.imagePath
              );
              return (
                <div
                  key={index}
                  onClick={() => router.push(`/restaurant/${item.id}`)}
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
                        alt={item.name}
                        className="absolute inset-0 w-full h-full object-cover z-10 group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => {
                          e.currentTarget.style.display = "none"; // 이미지 로드 실패 시 숨김
                        }}
                      />
                    )}
                  </div>

                  <div className="p-5 flex flex-col flex-1 justify-between">
                    <div>
                      <h3 className="font-bold text-xl mb-1 text-gray-900 line-clamp-1">
                        {item.name}
                      </h3>
                      <p className="text-sm text-gray-600 line-clamp-1 mb-2">
                        {item.menu ? item.menu.join(", ") : "메뉴 정보 없음"}
                      </p>
                    </div>
                    <p className="text-xs text-gray-400 truncate">
                      {item.address || "주소 없음"}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        );

      // (2) 관광지 카테고리
      case "tours":
        return (
          <div className={gridClass}>
            {currentItems.map((item: Tour, index) => {
              const imgSrc = getSafeImageSrc("", item.image); // 관광지는 URL 그대로 사용한다고 가정
              return (
                <div
                  key={index}
                  onClick={() => router.push(`/tour/attraction`)} // (임시 경로)
                  className="cursor-pointer border border-gray-200 rounded-xl overflow-hidden hover:shadow-xl hover:border-green-500 transition-all bg-white flex flex-col h-full group"
                >
                  <div
                    className="relative w-full bg-blue-50 flex-shrink-0 overflow-hidden"
                    style={{ height: "160px" }}
                  >
                    <div className="absolute inset-0 flex items-center justify-center text-blue-300 text-sm">
                      관광지
                    </div>
                    {imgSrc && (
                      <img
                        src={imgSrc}
                        alt={item.name}
                        className="absolute inset-0 w-full h-full object-cover z-10 group-hover:scale-105 transition-transform duration-500"
                        onError={(e) =>
                          (e.currentTarget.style.display = "none")
                        }
                      />
                    )}
                  </div>

                  <div className="p-5 flex flex-col flex-1 justify-between">
                    <h3 className="font-bold text-xl mb-2 text-gray-900 line-clamp-1">
                      {item.name}
                    </h3>
                    <p className="text-sm text-gray-500 truncate">
                      {item.address}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        );

      // (3) 병원 카테고리
      case "hospitals":
        return (
          <div className={gridClass}>
            {currentItems.map((item: HospitalResponse, index) => (
              <div
                key={index}
                onClick={() => router.push(`/hospital/${item.id}`)}
                className="cursor-pointer border border-gray-200 rounded-xl p-6 hover:border-green-500 hover:shadow-md transition-all bg-white flex flex-col justify-between h-full"
                style={{ minHeight: "200px" }}
              >
                <div>
                  <div className="flex justify-between items-start mb-3 gap-2">
                    <h3 className="font-bold text-lg text-gray-800 line-clamp-1 flex-1">
                      {item.name}
                    </h3>
                    {/* 진료 과목 뱃지 */}
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full whitespace-nowrap font-medium flex-shrink-0">
                      {item.treatCategory}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed line-clamp-3">
                    {item.address}
                  </p>
                </div>
              </div>
            ))}
          </div>
        );

      // (4) 구인구직 카테고리
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

      // (5) 뉴스 카테고리
      case "news":
        return (
          <div className="flex flex-col gap-4">
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
                  dangerouslySetInnerHTML={{ __html: item.title }} // HTML 태그 포함된 제목 렌더링
                />
                <p
                  className="text-base text-gray-600 mb-3 line-clamp-2"
                  dangerouslySetInnerHTML={{ __html: item.description }} // HTML 태그 포함된 요약 렌더링
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

      // (6) 기타 (커뮤니티 글, 사용자 추천 등)
      default:
        return (
          <div className="flex flex-col gap-3">
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

  // --- [화면 렌더링 2: 메인 구조] ---
  return (
    <div className="max-w-7xl mx-auto px-4 pb-20">
      {/* 1. 최상단 검색바 (재검색용) */}
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

      {/* 2. 헤더 정보 (뒤로가기, 타이틀, 개수) */}
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
          <span className="text-base font-normal text-gray-500 ml-2">
            (총 {allItems.length}건)
          </span>
        </h1>
      </div>

      {/* 3. 실제 콘텐츠 리스트 (switch-case로 분기됨) */}
      {renderContent()}

      {/* 4. 페이지네이션 (데이터가 1페이지 넘게 있을 때만 표시) */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-12">
          {/* 이전 버튼 */}
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-4 py-2 border rounded-md disabled:opacity-30 hover:bg-gray-100 transition-colors cursor-pointer"
          >
            이전
          </button>

          {/* 페이지 번호들 (가로 스크롤 가능하게 처리) */}
          <div className="flex gap-1 overflow-x-auto max-w-[300px] sm:max-w-none no-scrollbar">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`w-10 h-10 rounded-md font-bold transition-colors flex-shrink-0 cursor-pointer ${
                  currentPage === page
                    ? "bg-blue-600 text-white" // 현재 페이지 강조
                    : "bg-white text-gray-600 hover:bg-gray-100"
                }`}
              >
                {page}
              </button>
            ))}
          </div>

          {/* 다음 버튼 */}
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

// --- [최상위 페이지 컴포넌트] ---
// useSearchParams를 안전하게 사용하기 위해 Suspense로 감싸줍니다.
export default function CategoryPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CategoryResultContent />
    </Suspense>
  );
}

// 1. 페이지 진입 및 데이터 로드 (Entry & Fetch)

// 사용자가 /search/restaurants?searchKeyword=김치찌개 페이지로 이동합니다.

// useEffect가 실행되어 keyword("김치찌개")와 category("restaurants")를 감지합니다.

// 서버 API(/search?query=김치찌개)를 호출하고, 응답에서 restaurants 배열만 추출합니다.

// 전체 데이터(allItems)가 저장되고, 페이지 수(totalPages)가 계산됩니다.

// 2. 화면 렌더링 (Rendering)

// renderContent() 함수 내의 switch (category) 문에서 case "restaurants"가 실행됩니다.

// 김치찌개 맛집들의 카드 목록이 그리드 형태로 쫙 펼쳐집니다. 이미지가 있으면 보여주고, 없으면 "이미지 없음" 회색 박스를 띄웁니다.

// 3. 페이지 이동 (Pagination)

// 맛집이 너무 많아 3페이지까지 생겼습니다. 사용자가 하단의 [2] 버튼을 누릅니다.

// currentPage가 2로 바뀌고, useEffect가 다시 실행되어 allItems에서 13번째~24번째 맛집을 잘라내어 currentItems에 넣습니다.

// 화면이 깜빡임 없이 2페이지 데이터로 갱신되고, 스크롤이 맨 위로 올라갑니다.

// 4. 상세 이동 (Navigation)

// 사용자가 "할머니 김치찌개" 카드를 클릭합니다.

// onClick 핸들러가 작동하여 /restaurant/123 상세 페이지로 이동시킵니다.
