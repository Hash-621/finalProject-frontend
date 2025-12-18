"use client";

import { tourCurseData } from "@/data/tourCurseData";
import type { TourCurse as TourCurseType } from "@/types/tour";
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from "@headlessui/react";
import { useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import { MapPinIcon, PlusIcon } from "@heroicons/react/24/outline";
import Link from "next/link";

// Swiper 스타일
import "swiper/css";
import "swiper/css/pagination";

/**
 * 1. 개별 탭의 컨텐츠 (제목 영역 + 스와이퍼)
 */
const TourSwiperContent = ({
  tourCurse,
  onNextTab,
  allTours, // TabList 구성을 위해 전체 데이터 전달
}: {
  tourCurse: TourCurseType;
  onNextTab: () => void;
  allTours: TourCurseType[];
}) => {
  const days = tourCurse.tour;
  const allTourStops = days.flatMap((dayRoute) =>
    dayRoute.detail.map((stop) => ({
      ...stop,
      day: dayRoute.day.toUpperCase(),
      dayName: dayRoute.name,
    }))
  );

  const handleSlideChange = (swiper: any) => {
    // 마지막 슬라이드 도달 시 다음 탭으로 이동 (원할 경우 활성화)
    if (swiper.isEnd) {
      onNextTab();
    }
  };

  return (
    <div className="flex gap-8 lg:gap-12 flex-col md:flex-row-reverse">
      {/* [제목 영역] - 여기가 TabList의 기준점이 됩니다 */}
      <div className="w-full md:w-[40%] lg:w-[30%] relative flex flex-col gap-6 min-h-auto md:min-h-[450px]">
        <div className="md:min-h-[153px]">
          <h4 className="font-bold mb-2 text-green-100 opacity-80">
            관광지 추천코스
          </h4>
          <h2 className="text-3xl lg:text-4xl font-bold mb-4 break-keep">
            {tourCurse.title.length > 10 ? (
              <>
                {tourCurse.title.slice(0, 10)}
                <br className="hidden lg:block" />
                {tourCurse.title.slice(10)}
              </>
            ) : (
              tourCurse.title
            )}
          </h2>
          <h3 className="text-sm lg:text-base opacity-90 leading-relaxed break-keep">
            {tourCurse.subTitle}
          </h3>
        </div>

        {/* [TabList] - 제목 영역 div 안의 하단에 배치 */}
        <TabList className="hidden md:flex flex-col items-start gap-3 mb-4">
          {allTours.map((tour, index) => (
            <Tab
              key={index}
              className={({ selected }) =>
                `cursor-pointer pl-5 text-base relative duration-300 focus:outline-0 transition-all text-left ${
                  selected
                    ? "font-bold opacity-100 translate-x-2"
                    : "font-normal opacity-50 hover:opacity-100 hover:translate-x-1"
                } after:absolute after:left-0 after:top-1/2 after:-translate-y-1/2 after:w-1.5 after:h-1.5 after:rounded-full after:bg-white after:content-['']`
              }
            >
              {tour.title}
            </Tab>
          ))}
        </TabList>

        {/* 모바일 전용 플러스 버튼 */}
        <Link
          href="/tour"
          className="absolute right-0 top-0 flex items-center justify-center w-10 h-10 text-white bg-green-600 border border-white/20 hover:bg-green-700 transition-all rounded-full shadow-md md:hidden"
          aria-label="더보기"
        >
          <PlusIcon className="w-6 h-6 transition-transform group-hover:rotate-90" />
        </Link>
      </div>

      {/* [스와이퍼 영역] */}
      <div className="w-full md:w-[60%] lg:w-[70%]">
        <Swiper
          autoplay={{
            delay: 3500,
            disableOnInteraction: false,
          }}
          spaceBetween={20}
          slidesPerView={1.2}
          breakpoints={{
            860: { slidesPerView: 2 },
          }}
          pagination={{
            clickable: true,
            dynamicBullets: true,
          }}
          onSlideChange={handleSlideChange}
          modules={[Autoplay, Pagination]}
          className="tour-swiper pb-8!"
        >
          {allTourStops.map((stop, index) => (
            <SwiperSlide
              key={index}
              className="overflow-hidden rounded-2xl group"
            >
              <Link
                href={`/tour/${stop.name}`}
                className="relative block w-full h-80 md:h-[450px]"
              >
                {/* 배경 이미지 */}
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                  style={{ backgroundImage: `url(${stop.src})` }}
                />
                {/* 오버레이 */}
                <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent" />

                {/* 텍스트 정보 */}
                <div className="absolute left-0 bottom-0 w-full p-6 text-white @container">
                  <div className="flex items-center gap-2 mb-3 @max-[500px]:flex-col @max-[500px]:items-start">
                    <span className="px-2 py-0.5 bg-green-500 text-white text-[10px] font-black rounded-md tracking-tighter shadow-sm">
                      {stop.day}
                    </span>
                    <span className="px-3 py-1 bg-white/10 backdrop-blur-md border border-white/20 text-green-400 text-xs font-bold rounded-full tracking-wider uppercase flex items-center gap-1.5 shadow-lg">
                      <span className="w-1 h-1 bg-green-400 rounded-full animate-pulse" />{" "}
                      {/* 작은 포인트 점 */}
                      {stop.dayName}
                    </span>
                  </div>
                  <h5 className="text-xl font-bold mb-2 group-hover:text-green-400 transition-colors">
                    {stop.name}
                  </h5>
                  {stop.location && (
                    <div className="flex gap-1 items-center opacity-80 mb-3">
                      <MapPinIcon className="w-3.5 h-3.5" />
                      <p className="text-xs font-light">{stop.location}</p>
                    </div>
                  )}
                  <p className="text-sm opacity-70 line-clamp-1 font-light">
                    {stop.text}
                  </p>
                </div>
              </Link>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
};

/**
 * 2. 메인 컴포넌트
 */
export default function TourCurse() {
  const tours = tourCurseData.tours;
  const [selectedIndex, setSelectedIndex] = useState(0);

  const goToNextTab = () => {
    setSelectedIndex((prev) => (prev + 1) % tours.length);
  };

  return (
    <section className="bg-green-500 py-12 lg:py-16 text-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-5 relative">
        <TabGroup selectedIndex={selectedIndex} onChange={setSelectedIndex}>
          <TabPanels>
            {tours.map((tour, index) => (
              <TabPanel key={index} className="focus:outline-0">
                <TourSwiperContent
                  tourCurse={tour}
                  onNextTab={goToNextTab}
                  allTours={tours}
                />
              </TabPanel>
            ))}
          </TabPanels>
        </TabGroup>
      </div>
    </section>
  );
}
