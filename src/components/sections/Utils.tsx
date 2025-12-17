// Utils.tsx
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
    <section className="py-10 lg:py-20">
      <div className="w-full mx-auto px-2 flex flex-col gap-x-4 gap-y-4 md:grid-cols-2 md:grid-rows-2 md:grid md:max-w-7xl md:gap-x-5 md:gap-y-0 lg:grid-cols-4 lg:gap-6 lg:px-5 ">
        <SearchBar
          idPrefix="main"
          className="h-12 text-sm border-2 rounded-4xl p-2 border-green-500 md:h-14 lg:col-span-2 lg:h-16 lg:text-base @container"
          inputClassName="w-[70%] @sm:flex-1 @sm:w-auto"
          buttonClassName=""
          iconClassName="w-7 text-green-500"
        />
        <div className="h-48 bg-green-500 rounded-xl flex items-center justify-center text-white md:row-span-2 md:col-span-1 md:h-full">
          광고들어갈자리
        </div>
        <div className="hidden border-2 border-green-500 rounded-xl p-5 flex-col justify-between lg:row-span-2 lg:flex lg:col-span-1 lg:h-full">
          <div className="text-sm text-gray-400 flex justify-between">
            <Link href="">아이디·비밀번호 찾기</Link>
            <Link href="">회원가입</Link>
          </div>
          <Link
            href=""
            className="bg-green-500 w-full h-10 text-white flex items-center justify-center text-center"
          >
            로그인
          </Link>
          <div className="flex items-center justify-between">
            <span className="block w-18 h-px bg-gray-200"></span>
            <p className="text-gray-300 text-xs">간편로그인</p>
            <span className="block w-18 h-px bg-gray-200"></span>
          </div>
          <div className="flex justify-center gap-2.5">
            <Link href="">
              <Image
                src="/images/login-site1.png"
                alt="카카오톡 로그인"
                width={30}
                height={30}
              ></Image>
            </Link>
            <Link href="">
              <Image
                src="/images/login-site2.png"
                alt="네이버 로그인"
                width={30}
                height={30}
              ></Image>
            </Link>
          </div>
        </div>
        <Swiper
          breakpoints={{
            0: {
              slidesPerView: 3,
              spaceBetween: 12,
            },
            360: {
              slidesPerView: 4,
              spaceBetween: 10,
            },
            500: {
              slidesPerView: 5,
              spaceBetween: 12,
            },
            768: {
              slidesPerView: 4,
              spaceBetween: 15,
            },
            1024: {
              slidesPerView: 6,
              spaceBetween: 20,
            },
          }}
          navigation={true}
          onSwiper={handleSlideChange}
          onSlideChange={handleSlideChange}
          modules={[Navigation]}
          className="mySwiper quick-swiper overflow-hidden w-full lg:col-span-2"
        >
          {pages.map((page) => (
            <SwiperSlide key={page.name}>
              <Link
                href={page.href}
                className="flex flex-col items-center gap-2"
              >
                <Image src={page.src} alt={page.name} width={50} height={50} />
                <p className="text-sm">{page.name}</p>
              </Link>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
}
