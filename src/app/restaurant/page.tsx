"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { restaurantService } from "@/api/services";
import { RestaurantData } from "@/types/restaurant";
import { MapPin, Loader2, Heart } from "lucide-react";
import Pagination from "@/components/common/Pagination";

export default function RestaurantListPage() {
  const [restaurants, setRestaurants] = useState<RestaurantData[]>([]);
  const [filteredList, setFilteredList] = useState<RestaurantData[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("전체");
  const [loading, setLoading] = useState(true);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        setLoading(true);
        const response = await restaurantService.getRestaurants();
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

  const toggleFavorite = async (e: React.MouseEvent, id: number) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      await restaurantService.toggleFavorite(id);

      const updateState = (list: RestaurantData[]) =>
        list.map((item) =>
          item.id === id ? { ...item, isFavorite: !item.isFavorite } : item
        );

      setRestaurants(updateState(restaurants));
      setFilteredList(updateState(filteredList));
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
      setFilteredList(
        restaurants.filter((item) => item.restCategory === category)
      );
    }
  };

  const totalPages = Math.ceil(filteredList.length / itemsPerPage);
  const currentItems = filteredList.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

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
          <div className="space-y-5">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-bold tracking-tight">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              DAEJEON NOW
            </div>
            <h2 className="text-3xl lg:text-5xl font-extrabold tracking-tight leading-[1.1]">
              <span className="text-transparent bg-clip-text bg-linear-to-r from-green-600 to-green-400">
                대전의 맛
              </span>
              을 찾아서
            </h2>
            <p className="text-slate-500 text-sm font-medium leading-relaxed">
              현지인이 추천하는 진짜 맛집 리스트를 카테고리별로 확인하세요.
            </p>
          </div>

          {/* 카테고리 탭 */}
          <div className="flex flex-wrap items-center gap-3 mt-16">
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
              {/* 즐겨찾기 버튼 */}
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

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={(page) => setCurrentPage(page)}
          themeColor="black"
        />
      </div>
    </div>
  );
}
