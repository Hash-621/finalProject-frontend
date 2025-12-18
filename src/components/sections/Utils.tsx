"use client";
import { useState } from "react";
import SearchBar from "@/components/common/SearchBar";
import { menuData } from "@/data/menuData";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Swiper as SwiperClass } from "swiper";
import "swiper/css";
import "swiper/css/navigation";
import { Navigation } from "swiper/modules";
import Image from "next/image";

export default function Utils() {
  const [activeIndex, setActiveIndex] = useState(0);
  const handleSlideChange = (swiper: SwiperClass) => {
    setActiveIndex(swiper.realIndex);
  };

  const pages = menuData.pages;

  return (
    <section className="py-12 bg-gray-50/50">
      <div className="w-full mx-auto px-4 flex flex-col gap-6 md:grid md:grid-cols-2 md:grid-rows-[auto_1fr] md:max-w-7xl md:gap-5 lg:grid-cols-4 lg:px-5">
        <div className="lg:col-span-2 flex items-center">
          <SearchBar
            idPrefix="main"
            className="w-full h-14 text-sm lg:text-lg lg:h-18 bg-white border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-4xl px-6 flex items-center transition-all focus-within:shadow-[0_8px_30px_rgba(34,197,94,0.1)] md:h-16 "
            inputClassName="flex-1 bg-transparent text-gray-700 placeholder:text-gray-400 focus:outline-none"
            buttonClassName="p-2 hover:scale-110 transition-transform"
            iconClassName="w-6 h-6 lg:w-8 lg:h-8 text-green-500"
          />
        </div>

        <div className="h-44 bg-linear-to-br from-green-400 to-green-600 rounded-3xl flex flex-col items-center justify-center text-white md:row-span-2 md:col-span-1 md:h-full shadow-lg shadow-green-100 relative overflow-hidden group">
          <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
          <span className="text-xs font-bold bg-white/20 px-3 py-1 rounded-full mb-2 uppercase tracking-widest">
            Sponsored
          </span>
          <p className="font-medium">광고 영역</p>
        </div>

        <div className="hidden bg-white border border-gray-100 rounded-3xl p-7 flex-col justify-between lg:row-span-2 lg:flex lg:col-span-1 lg:h-full shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
          <div className="space-y-4">
            <h5 className="font-bold text-gray-800 text-lg">로그인</h5>
            <Link
              href="/login"
              className="bg-green-500 w-full h-12 rounded-2xl text-white font-bold flex items-center justify-center text-center hover:bg-green-600 transition-colors shadow-md shadow-green-100"
            >
              다잇슈 시작하기
            </Link>
            <div className="flex justify-center gap-4 text-xs text-gray-400 font-medium py-1">
              <Link href="" className="hover:text-green-500 transition-colors">
                아이디 찾기
              </Link>
              <span className="text-gray-200">|</span>
              <Link href="" className="hover:text-green-500 transition-colors">
                회원가입
              </Link>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="flex-1 h-px bg-gray-100"></span>
              <p className="text-gray-300 text-[10px] font-bold uppercase tracking-tighter">
                Social Login
              </p>
              <span className="flex-1 h-px bg-gray-100"></span>
            </div>
            <div className="flex justify-center gap-4">
              <Link href="" className="hover:scale-110 transition-transform">
                <Image
                  src="/images/login-site1.png"
                  alt="카카오"
                  width={36}
                  height={36}
                  className="rounded-full shadow-sm"
                />
              </Link>
              <Link href="" className="hover:scale-110 transition-transform">
                <Image
                  src="/images/login-site2.png"
                  alt="네이버"
                  width={36}
                  height={36}
                  className="rounded-full shadow-sm"
                />
              </Link>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 bg-white rounded-[2.5rem] p-6 lg:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-50 flex items-center">
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
            {pages.map((page) => (
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
