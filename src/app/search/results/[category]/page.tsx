"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useParams, useRouter } from "next/navigation";
import api from "@/api/axios";

// [수정 1] SearchBar 컴포넌트 임포트 (경로 확인해주세요)
import SearchBar from "@/components/common/SearchBar";

// 프로젝트 타입 Import
import { RestaurantData } from "@/types/restaurant";
import { Tour } from "@/types/tour";
import { HospitalResponse } from "@/types/hospital";
import { JobData } from "@/types/job";
import { NewsItem } from "@/types/news";
import { PostItem } from "@/types/board";

// 페이지당 아이템 개수
const ITEMS_PER_PAGE = 12;

// 이미지 기본 경로 (public 폴더 기준)
const RESTAURANT_IMAGE_BASE = "/images/restaurantImages/";
// const TOUR_IMAGE_BASE = "/images/tours/";

// 카테고리별 한글 제목
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

function CategoryResultContent() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();

  const category = params.category as string;
  const keyword = searchParams.get("searchKeyword");

  const [allItems, setAllItems] = useState<any[]>([]);
  const [currentItems, setCurrentItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  const pageTitle = CATEGORY_TITLES[category] || category;

  // 1. 데이터 가져오기
  useEffect(() => {
    if (!keyword || !category) return;

    const fetchData = async () => {
      setLoading(true);
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
          if (res.data && res.data[category]) {
            data = res.data[category];
          }
        }

        setAllItems(data);
        setTotalPages(Math.ceil(data.length / ITEMS_PER_PAGE));
        setCurrentPage(1);
      } catch (error) {
        console.error("데이터 로딩 실패:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [category, keyword]);

  // 2. 페이지네이션
  useEffect(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    setCurrentItems(allItems.slice(startIndex, endIndex));
    window.scrollTo(0, 0);
  }, [currentPage, allItems]);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // [이미지 경로 처리 함수]
  const getSafeImageSrc = (
    basePath: string,
    path: string | null | undefined
  ) => {
    if (!path) return null;
    if (path.startsWith("http") || path.startsWith("/")) return path;
    return `${basePath}${path}`;
  };

  if (loading)
    return (
      <div className="p-20 text-center">데이터를 불러오는 중입니다... ⏳</div>
    );

  // -----------------------------------------------------------------------
  // 렌더링 로직 (라우팅 기능 추가됨)
  // -----------------------------------------------------------------------
  const renderContent = () => {
    if (currentItems.length === 0) {
      return (
        <div className="text-center py-20 text-gray-500">결과가 없습니다.</div>
      );
    }

    const gridClass =
      "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6";

    switch (category) {
      // 1. 맛집
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
                          e.currentTarget.style.display = "none";
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

      // 2. 관광지
      case "tours":
        return (
          <div className={gridClass}>
            {currentItems.map((item: Tour, index) => {
              const imgSrc = getSafeImageSrc("", item.image);
              return (
                <div
                  key={index}
                  onClick={() => router.push(`/tour/attraction`)}
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

      // 3. 병원
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

      // 4. 구인구직
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

      // 5. 뉴스
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

      // 6. 커뮤니티 등
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

  return (
    <div className="max-w-7xl mx-auto px-4 pb-20">
      {/* [수정 2] 최상단 검색바 추가 */}
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
          <span className="text-base font-normal text-gray-500 ml-2">
            (총 {allItems.length}건)
          </span>
        </h1>
      </div>

      {renderContent()}

      {totalPages > 1 && (
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
                    ? "bg-blue-600 text-white"
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
