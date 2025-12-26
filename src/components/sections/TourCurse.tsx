"use client";

import { tourCurseData } from "@/data/tourCurseData";
import type { TourCurse as TourCurseType } from "@/types/tour";
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from "@headlessui/react";
import { useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, EffectCoverflow } from "swiper/modules";
import { MapPin, ArrowRight } from "lucide-react";
import Link from "next/link";

import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/effect-coverflow";
import { motion } from "framer-motion";

const TourSwiperContent = ({
  tourCurse,
  allTours,
  onNextTab,
}: {
  tourCurse: TourCurseType;
  allTours: TourCurseType[];
  onNextTab: () => void;
}) => {
  // Swiper에 표시할 데이터 가공 (Day 정보 포함)
  const allTourStops = tourCurse.tour.flatMap((dayRoute) =>
    dayRoute.detail.map((stop) => ({
      ...stop,
      day: dayRoute.day.toUpperCase(),
      // 핵심 수정: 부모(코스)의 number를 stop 데이터와 함께 전달
      courseNumber: tourCurse.number,
    }))
  );

  const handleSlideChange = (swiper: any) => {
    if (swiper.isEnd) {
      setTimeout(() => {
        onNextTab();
      }, 500);
    }
  };

  return (
    <div className="flex gap-10 lg:gap-16 flex-col lg:flex-row items-center">
      <div className="w-full lg:w-[35%] space-y-8">
        <div className="space-y-5">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-500/10 border border-green-500/20 text-green-400 rounded-full text-xs font-bold tracking-tight">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            EXPLORE DAEJEON
          </div>
          <h2 className="text-3xl lg:text-4xl font-extrabold text-white leading-[1.1] tracking-tight">
            {tourCurse.title}
          </h2>
          <p className="text-slate-400 text-base lg:text-lg leading-relaxed font-light break-keep">
            {tourCurse.subTitle}
          </p>
        </div>

        <TabList className="hidden lg:flex flex-col gap-4 border-l border-white/10 pl-6">
          {allTours.map((tour, index) => (
            <Tab
              key={index}
              className={({ selected }) =>
                `text-left text-sm transition-all duration-500 focus:outline-none ${
                  selected
                    ? "text-green-500 font-bold scale-110 origin-left"
                    : "text-slate-500 hover:text-slate-300 font-medium"
                }`
              }
            >
              {tour.title}
            </Tab>
          ))}
        </TabList>

        {/* 하단 버튼도 해당 코스의 번호로 이동하게 설정 */}
        <Link href={`/tour/route`}>
          <motion.div
            whileHover="hover"
            className="inline-flex items-center gap-2 text-white font-bold bg-white/5 hover:bg-green-600 px-6 py-3 rounded-full transition-colors duration-300 border border-white/10 cursor-pointer"
          >
            전체 코스보기
            <motion.div
              variants={{
                hover: { x: 5 },
              }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <ArrowRight className="w-4 h-4" />
            </motion.div>
          </motion.div>
        </Link>
      </div>

      <div className="w-full lg:w-[65%] relative">
        <Swiper
          effect={"coverflow"}
          grabCursor={true}
          centeredSlides={true}
          slidesPerView={1.2}
          coverflowEffect={{
            rotate: 0,
            stretch: 0,
            depth: 100,
            modifier: 2.5,
            slideShadows: false,
          }}
          autoplay={{ delay: 4000, disableOnInteraction: false }}
          breakpoints={{ 768: { slidesPerView: 2 } }}
          pagination={{ clickable: true }}
          onSlideChange={handleSlideChange}
          modules={[Autoplay, Pagination, EffectCoverflow]}
          className="tour-swiper pb-14!"
        >
          {allTourStops.map((stop, index) => (
            <SwiperSlide
              key={index}
              className="rounded-3xl overflow-hidden shadow-2xl border border-white/5"
            >
              <Link
                href={`/tour/route/${stop.courseNumber}`}
                className="relative block aspect-3/4 group"
              >
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 group-hover:scale-110"
                  style={{ backgroundImage: `url(${stop.src})` }}
                />
                <div className="absolute inset-0 bg-linear-to-t from-[#020617] via-transparent to-black/20" />

                <div className="absolute bottom-0 left-0 p-8 w-full space-y-3">
                  <div className="flex gap-2">
                    <span className="bg-green-600 text-[10px] font-black px-2 py-0.5 rounded text-white italic">
                      {stop.day}
                    </span>
                  </div>
                  <h4 className="text-2xl font-bold text-white group-hover:text-green-400 transition-colors">
                    {stop.name}
                  </h4>
                  <div className="flex items-center gap-1.5 text-slate-400 text-xs">
                    <MapPin className="w-3.5 h-3.5 text-green-500/70" />
                    <span>{stop.location || "대전광역시"}</span>
                  </div>
                </div>
              </Link>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
};

export default function TourCurse() {
  const tours = tourCurseData.tours;
  const [selectedIndex, setSelectedIndex] = useState(0);

  const goToNextTab = () => {
    setSelectedIndex((prev) => (prev + 1) % tours.length);
  };

  return (
    <section className="bg-[#020617] py-24 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-green-500/10 rounded-full blur-[120px] -z-10" />
      <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-blue-500/10 rounded-full blur-[100px] -z-10" />

      <div className="max-w-7xl mx-auto px-6">
        <TabGroup selectedIndex={selectedIndex} onChange={setSelectedIndex}>
          <TabPanels>
            {tours.map((tour, index) => (
              <TabPanel
                key={index}
                className="focus:outline-none transition-all duration-700 data-closed:opacity-0 data-closed:translate-y-4"
              >
                <TourSwiperContent
                  tourCurse={tour}
                  allTours={tours}
                  onNextTab={goToNextTab}
                />
              </TabPanel>
            ))}
          </TabPanels>
        </TabGroup>
      </div>
    </section>
  );
}
