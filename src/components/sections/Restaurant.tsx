"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import api from "@/api/axios";
import { RestaurantData } from "@/types/restaurant";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import {
  ArrowPathIcon,
  MapPinIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";

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
        <ArrowPathIcon className="animate-spin text-green-500 w-12 h-12 mb-4" />

        <p className="text-gray-500 font-bold text-lg">
          오늘의 추천 맛집을 찾는 중...
        </p>
        <p className="text-gray-400 text-sm mt-2">잠시만 기다려 주세요!</p>
      </div>
    );

  return (
    <section className="py-12">
      <div className="w-full mx-auto px-4 md:max-w-7xl lg:px-8 relative">
        <div className=" relative">
          <div className="w-full">
            <h4 className="font-bold text-green-600 mb-2">맛집 소개</h4>
            <h2 className="text-3xl lg:text-4xl font-bold mb-4 leading-tight">
              오늘의 대전 맛집
            </h2>
            <p className="text-gray-500 mb-8 text-sm">
              대전 전역의 인기 식당을 카테고리별로
              <br className="hidden lg:block" /> 분석해 핵심 정보만제공합니다.
            </p>
            <Link
              href="/restaurant" // 맛집 서브페이지 주소
              className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center justify-center w-10 h-10 text-white bg-green-500 hover:bg-green-600 transition-all rounded-full shadow-md group"
              aria-label="더보기"
            >
              <PlusIcon className="w-6 h-6 transition-transform group-hover:rotate-90" />
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
          navigation={true}
          modules={[Autoplay]}
          className="h-80 w-full"
        >
          {randomList.map((item) => (
            <SwiperSlide
              key={item.id}
              className="relative overflow-hidden rounded-3xl" // 라운드를 더 크게 (4xl 권장)
            >
              {/* 배경 이미지 영역 */}
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-7000 ease-out scale-110 group-hover:scale-100"
                style={{
                  backgroundImage: item.imagePath
                    ? `linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.2) 60%, rgba(0,0,0,0.1) 100%), url(/images/restaurantImages/${item.imagePath})`
                    : "none",
                  backgroundColor: item.imagePath ? "transparent" : "#111",
                }}
              />

              {/* 컨텐츠 영역: 좌측 하단 정렬로 변경 */}
              <div className="relative h-full flex flex-col justify-end p-8 lg:p-12 text-white">
                <div className="max-w-xl animate-fadeIn">
                  <div className="absolute top-0 right-6 z-10">
                    <div className="bg-green-600 text-white px-3 py-4 rounded-b-lg shadow-lg flex flex-col items-center">
                      <span className="text-sm font-bold [writing-mode:vertical-lr] tracking-widest py-1">
                        {item.category}
                      </span>
                    </div>
                  </div>

                  <h2 className="text-2xl font-bold mb-3">{item.name}</h2>

                  <div className="space-y-1 mb-8 opacity-90">
                    <p className="text-lg font-light">
                      {item.bestMenu
                        ? `"${item.bestMenu}"`
                        : "대전의 숨은 맛집"}
                    </p>
                    <p className="text-sm font-light text-gray-300 flex items-center gap-1">
                      <MapPinIcon aria-hidden="true" className="size-4" />
                      {item.address}
                    </p>
                  </div>

                  <Link
                    href={`/restaurant/${item.id}`}
                    className="inline-block px-8 py-3 border border-white/30 backdrop-blur-sm rounded-full text-sm font-bold hover:bg-green-500 hover:border-green-500 transition-all duration-300"
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
