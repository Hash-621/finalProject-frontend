"use client";
import { useState, useEffect } from "react";
import SearchBar from "@/components/common/SearchBar";
import UtilsLoginPanel from "@/components/sections/utils/UtilsLoginPanel";
import { adSlides } from "@/data/adData";
import { menuData } from "@/data/menuData";
import Link from "next/link";
import Image from "next/image";
import Cookies from "js-cookie";
import { userService } from "@/api/services";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

export default function Utils() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    const token = Cookies.get("token");
    if (token) {
      setIsLoggedIn(true);
      userService
        .getUserInfo()
        .then((res) => setUserData(res.data))
        .catch(() => setIsLoggedIn(false));
    }
  }, []);

  return (
    <section className="py-12 bg-gray-50/50">
      <div className="w-full mx-auto px-4 flex flex-col gap-6 md:grid md:grid-cols-2 md:grid-rows-[auto_1fr] md:max-w-7xl md:gap-5 lg:grid-cols-4 lg:px-5">
        <div className="lg:col-span-2 flex items-center">
          <SearchBar
            idPrefix="main"
            className="w-full h-14 text-sm lg:text-lg lg:h-18 bg-white border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-4xl px-6 flex items-center transition-all focus-within:shadow-[0_8px_30px_rgba(34,197,94,0.1)] md:h-16"
          />
        </div>

        <div className="h-44 md:row-span-2 md:col-span-1 md:h-full rounded-3xl overflow-hidden shadow-lg shadow-gray-200 relative group">
          <Swiper
            modules={[Autoplay, Pagination]}
            autoplay={{ delay: 4000 }}
            pagination={{ clickable: true }}
            loop={true}
            className="h-full w-full advertise"
          >
            {adSlides.map((slide) => (
              <SwiperSlide key={slide.id}>
                <div
                  className={`w-full h-full ${slide.bg} flex flex-col items-start justify-center p-8 text-white relative overflow-hidden`}
                >
                  <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
                  <span className="text-[10px] font-bold bg-white/20 px-2.5 py-1 rounded-full mb-4 uppercase tracking-widest backdrop-blur-sm">
                    {slide.tag}
                  </span>
                  <div className="flex items-center gap-2 mb-2">
                    {slide.icon}
                    <h3 className="text-xl font-bold leading-tight">
                      {slide.title}
                    </h3>
                  </div>
                  <p className="text-sm font-medium text-white/90 whitespace-pre-line leading-relaxed">
                    {slide.desc}
                  </p>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>

        <UtilsLoginPanel isLoggedIn={isLoggedIn} userData={userData} />

        <div className="lg:col-span-2 bg-white rounded-3xl p-6 lg:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-50 flex items-center">
          <Swiper
            breakpoints={{
              0: { slidesPerView: 3, spaceBetween: 15 },
              360: { slidesPerView: 4, spaceBetween: 15 },
              768: { slidesPerView: 5, spaceBetween: 20 },
              1024: { slidesPerView: 5, spaceBetween: 25 },
            }}
            navigation={true}
            modules={[Navigation]}
            className="quick-swiper w-full"
          >
            {menuData.pages.map((page) => (
              <SwiperSlide key={page.name}>
                <Link
                  href={page.href}
                  className="flex flex-col items-center gap-3 group"
                >
                  <div className="w-14 h-14 lg:w-16 lg:h-16 bg-gray-50 rounded-full flex items-center justify-center group-hover:bg-green-50 transition-colors duration-300">
                    <Image
                      src={page.src}
                      alt={page.name}
                      width={32}
                      height={32}
                      className="group-hover:scale-110 transition-transform"
                    />
                  </div>
                  <p className="text-xs lg:text-sm font-semibold text-gray-600 group-hover:text-green-600 transition-colors">
                    {page.name}
                  </p>
                </Link>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    </section>
  );
}
