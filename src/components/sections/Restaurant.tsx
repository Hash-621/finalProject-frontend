"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import { Loader2, Plus } from "lucide-react";
import { restaurantService } from "@/api/services";
import { RestaurantData } from "@/types/restaurant";
import RestaurantCard from "@/components/sections/restaurant/RestaurantCard";

import "swiper/css";

export default function Restaurant() {
  const [allRestaurants, setAllRestaurants] = useState<RestaurantData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        setLoading(true);
        const response = await restaurantService.getRestaurants();
        setAllRestaurants(response.data || []);
      } catch (error) {
        console.error("데이터 로드 실패:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchRestaurants();
  }, []);

  const randomList = useMemo(() => {
    if (allRestaurants.length === 0) return [];
    return [...allRestaurants].sort(() => 0.5 - Math.random()).slice(0, 10);
  }, [allRestaurants]);

  if (loading) return <LoadingState />;

  return (
    <section className="py-12">
      <div className="w-full mx-auto px-4 md:max-w-7xl lg:px-8 relative">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div className="space-y-3">
            <Badge text="HOT PLACE" />
            <h2 className="text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
              오늘의{" "}
              <span className="text-transparent bg-clip-text bg-linear-to-r from-orange-500 to-red-500">
                대전 맛집
              </span>
            </h2>
            <p className="text-slate-500 text-sm font-medium leading-relaxed">
              대전 전역의 인기 식당을 분석해 핵심 정보만 제공합니다.
            </p>
          </div>

          <Link
            href="/restaurant"
            className="flex items-center justify-center w-12 h-12 text-orange-400 border border-slate-200 hover:text-white hover:bg-green-500 hover:border-green-500 transition-all rounded-full group shadow-sm"
          >
            <Plus className="w-6 h-6 transition-transform group-hover:rotate-90" />
          </Link>
        </div>

        <Swiper
          loop={true}
          autoplay={{ delay: 3000, disableOnInteraction: false }}
          spaceBetween={20}
          slidesPerView={1.2}
          breakpoints={{
            640: { slidesPerView: 2.2 },
            1024: { slidesPerView: 4 },
          }}
          modules={[Autoplay]}
          className="h-[380px] md:h-[450px] w-full"
        >
          {randomList.map((item) => (
            <SwiperSlide key={item.id}>
              <RestaurantCard item={item} />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
}

const Badge = ({ text }: { text: string }) => (
  <div className="inline-flex items-center gap-2 px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-bold tracking-tight">
    <span className="relative flex h-2 w-2">
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
      <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
    </span>
    {text}
  </div>
);

const LoadingState = () => (
  <div className="h-[500px] w-full flex flex-col items-center justify-center">
    <Loader2 className="animate-spin text-green-500 w-12 h-12 mb-4" />
    <p className="text-gray-500 font-bold text-lg">
      오늘의 추천 맛집을 찾는 중...
    </p>
    <p className="text-gray-400 text-sm mt-2">잠시만 기다려 주세요!</p>
  </div>
);
