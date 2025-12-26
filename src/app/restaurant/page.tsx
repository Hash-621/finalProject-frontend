"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/api/axios";
import { RestaurantData } from "@/types/restaurant";
import {
  MapPin,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Heart,
} from "lucide-react";

export default function RestaurantListPage() {
  const [restaurants, setRestaurants] = useState<RestaurantData[]>([]);
  const [filteredList, setFilteredList] = useState<RestaurantData[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("전체");
  const [loading, setLoading] = useState(true);

  // --- 페이지네이션 상태 ---
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        setLoading(true);
        const response = await api.get("/restaurant");
        // 백엔드에서 데이터 로드 시 각 아이템에 isFavorite 상태가 포함되어 있어야 합니다.
        setRestaurants(response.data);
        setFilteredList(response.data);
      } catch (error) {
        console.error("Error fetching restaurants:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchRestaurants();
  }, []);

  // 📡 즐겨찾기 토글 API 연동
  const toggleFavorite = async (e: React.MouseEvent, id: number) => {
    e.preventDefault(); // 카드 클릭 이동 방지
    e.stopPropagation();

    try {
      // 알려주신 엔드포인트로 POST 요청
      await api.post(`/restaurant/${id}/favorite`);

      // 화면 UI 즉시 업데이트 (로컬 상태 반영)
      const updatedList = restaurants.map((item) => {
        if (item.id === id) {
          return { ...item, isFavorite: !item.isFavorite };
        }
        return item;
      });
      setRestaurants(updatedList);

      // 필터링된 리스트도 함께 업데이트
      const updatedFiltered = filteredList.map((item) => {
        if (item.id === id) {
          return { ...item, isFavorite: !item.isFavorite };
        }
        return item;
      });
      setFilteredList(updatedFiltered);
    } catch (error) {
      console.error("즐겨찾기 요청 실패:", error);
      alert("즐겨찾기 처리에 실패했습니다. 로그인을 확인해주세요.");
    }
  };

  const handleFilter = (category: string) => {
    setSelectedCategory(category);
    setCurrentPage(1);
    if (category === "전체") {
      setFilteredList(restaurants);
    } else {
      const filtered = restaurants.filter(
        (item) => item.restCategory === category
      );
      setFilteredList(filtered);
    }
  };

  const totalPages = Math.ceil(filteredList.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredList.slice(indexOfFirstItem, indexOfLastItem);

  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxVisiblePages = 5;
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) pageNumbers.push(i);
    } else {
      pageNumbers.push(1);
      if (currentPage > 3) pageNumbers.push("...");
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) pageNumbers.push(i);
      if (currentPage < totalPages - 2) pageNumbers.push("...");
      pageNumbers.push(totalPages);
    }
    return pageNumbers;
  };

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <Loader2 className="animate-spin text-green-500 w-10 h-10" />
      </div>
    );
  }

  return (
    <div className="w-full bg-[#fcfcfc] min-h-screen pb-24">
      <div className="bg-white border-b border-slate-100 pt-20 pb-10">
        <div className="max-w-7xl mx-auto px-6">
          <h1 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">
            대전의 맛을 찾아서
          </h1>
          <p className="text-slate-500 font-medium mb-10">
            현지인이 추천하는 진짜 맛집 리스트를 카테고리별로 확인하세요.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            {["전체", "한식", "일식", "중식", "양식", "카페"].map((cat) => (
              <button
                key={cat}
                onClick={() => handleFilter(cat)}
                className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all ${
                  selectedCategory === cat
                    ? "bg-green-600 text-white shadow-lg shadow-green-100"
                    : "bg-white border border-slate-200 text-slate-600 hover:border-slate-900"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 mt-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {currentItems.map((item) => (
            <div key={item.id} className="relative group">
              {/* 즐겨찾기 하트 버튼 */}
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

        {filteredList.length === 0 && (
          <div className="w-full py-20 text-center">
            <p className="text-slate-400 font-medium">
              선택하신 카테고리의 맛집이 아직 등록되지 않았습니다.
            </p>
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-16">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-full border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft size={20} className="text-slate-600" />
            </button>
            <div className="flex gap-2 items-center">
              {getPageNumbers().map((pageNum, index) => (
                <React.Fragment key={index}>
                  {pageNum === "..." ? (
                    <span className="px-2 text-slate-400 font-bold">...</span>
                  ) : (
                    <button
                      onClick={() => setCurrentPage(pageNum as number)}
                      className={`w-10 h-10 rounded-full text-sm font-bold transition-all ${
                        currentPage === pageNum
                          ? "bg-slate-900 text-white shadow-md shadow-slate-200"
                          : "bg-white border border-slate-200 text-slate-500 hover:border-slate-900 hover:text-slate-900"
                      }`}
                    >
                      {pageNum}
                    </button>
                  )}
                </React.Fragment>
              ))}
            </div>
            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
              className="p-2 rounded-full border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <ChevronRight size={20} className="text-slate-600" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
