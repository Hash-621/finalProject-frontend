"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import api from "@/api/axios";
import { RestaurantData } from "@/types/restaurant";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import { Loader2, MapPin, Plus } from "lucide-react";

import "swiper/css";

export default function Restaurant() {
  const [randomList, setRandomList] = useState<RestaurantData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAndPickRandom = async () => {
      try {
        setLoading(true);
        const response = await api.get("/restaurant");
        const allData: RestaurantData[] = response.data;

        if (allData.length > 0) {
          const shuffled = [...allData].sort(() => 0.5 - Math.random());
          const selected = shuffled.slice(0, 10);
          setRandomList(selected);
        }
      } catch (error) {
        console.error("데이터 로드 실패:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAndPickRandom();
  }, []);

  if (loading)
    return (
      <div className="h-[500px] w-full flex flex-col items-center justify-center">
        <Loader2 className="animate-spin text-green-500 w-12 h-12 mb-4" />

        <p className="text-gray-500 font-bold text-lg">
          오늘의 추천 맛집을 찾는 중...
        </p>
        <p className="text-gray-400 text-sm mt-2">잠시만 기다려 주세요!</p>
      </div>
    );

  return (
    <section className="py-12">
      <div className="w-full mx-auto px-4 md:max-w-7xl lg:px-8 relative">
        <div className="relative">
          <div className="w-full relative space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-bold tracking-tight">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
              </span>
              HOT PLACE
            </div>
            <h2 className="text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
              오늘의{" "}
              <span className="text-transparent bg-clip-text bg-linear-to-r from-orange-500 to-red-500">
                대전 맛집
              </span>
            </h2>
            <p className="text-slate-500 text-sm font-medium leading-relaxed">
              대전 전역의 인기 식당을 카테고리별로 분석해
              <br className="hidden lg:block" /> 셰프가 추천하는 핵심 정보만
              제공합니다.
            </p>
            <Link
              href="/restaurant"
              className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center justify-center w-12 h-12 text-orange-400 border border-slate-200 hover:text-white hover:bg-green-500 hover:border-green-500 transition-all rounded-full group shadow-sm"
              aria-label="더보기"
            >
              <Plus className="w-6 h-6 transition-transform group-hover:rotate-90" />
            </Link>
          </div>
        </div>

        <Swiper
          loop={true}
          autoplay={{
            delay: 3000,
            disableOnInteraction: false,
          }}
          spaceBetween={20}
          slidesPerView={1.2}
          breakpoints={{
            640: { slidesPerView: 2.2 },
            1024: { slidesPerView: 4 },
          }}
          modules={[Autoplay]}
          className="h-[450px] w-full mt-6"
        >
          {randomList.map((item) => (
            <SwiperSlide
              key={item.id}
              className="relative overflow-hidden rounded-4xl group"
            >
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 ease-out group-hover:scale-110"
                style={{
                  backgroundImage: item.imagePath
                    ? `linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,0.1) 100%), url(/images/restaurantImages/${item.imagePath})`
                    : "none",
                  backgroundColor: item.imagePath ? "transparent" : "#111",
                }}
              />

              <div className="relative h-full flex flex-col justify-end p-6 text-white">
                <div className="animate-fadeIn">
                  <div className="inline-block px-2 py-1 bg-green-500 text-white text-[10px] font-black rounded-md tracking-tighter shadow-sm mb-2">
                    {item.restCategory}
                  </div>

                  <h2 className="text-xl font-bold mb-2 line-clamp-1">
                    {item.name}
                  </h2>

                  <div className="space-y-1 mb-6 opacity-90">
                    <p className="text-sm font-light line-clamp-1 italic text-orange-200">
                      {item.bestMenu
                        ? `"${item.bestMenu}"`
                        : "대전의 숨은 맛집"}
                    </p>
                    <p className="text-[11px] font-light text-gray-300 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-green-400" />
                      <span className="line-clamp-1">{item.address}</span>
                    </p>
                  </div>

                  <Link
                    href={`/restaurant/${item.id}`}
                    className="inline-block w-full text-center py-2.5 border border-white/30 backdrop-blur-sm rounded-xl text-xs font-bold hover:bg-green-600 hover:border-green-600 transition-all duration-300"
                  >
                    상세정보 보기
                  </Link>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
}
