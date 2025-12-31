"use client";

import { useState, useMemo } from "react";
import { tourCurseData } from "@/data/tourCurseData";
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from "@headlessui/react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, EffectCoverflow } from "swiper/modules";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import TourStopCard from "@/components/sections/tour/TourStopCard";

import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/effect-coverflow";

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
                <TourContent
                  tour={tour}
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

function TourContent({ tour, allTours, onNextTab }: any) {
  const allStops = useMemo(
    () =>
      tour.tour.flatMap((dayRoute: any) =>
        dayRoute.detail.map((stop: any) => ({
          ...stop,
          day: dayRoute.day.toUpperCase(),
          courseNumber: tour.number,
        }))
      ),
    [tour]
  );

  return (
    <div className="flex gap-10 lg:gap-16 flex-col lg:flex-row items-center">
      {/* 좌측 정보 영역 */}
      <div className="w-full lg:w-[35%] space-y-8">
        <div className="space-y-5">
          <Badge text="EXPLORE DAEJEON" />
          <h2 className="text-3xl lg:text-4xl font-extrabold text-white leading-[1.1] tracking-tight">
            {tour.title}
          </h2>
          <p className="text-slate-400 text-base lg:text-lg leading-relaxed font-light break-keep">
            {tour.subTitle}
          </p>
        </div>

        <TabList className="hidden lg:flex flex-col gap-4 border-l border-white/10 pl-6">
          {allTours.map((t: any, idx: number) => (
            <Tab
              key={idx}
              className={({ selected }) =>
                `text-left text-sm transition-all duration-500 focus:outline-none ${
                  selected
                    ? "text-green-500 font-bold scale-110 origin-left"
                    : "text-slate-500 hover:text-slate-300"
                }`
              }
            >
              {t.title}
            </Tab>
          ))}
        </TabList>

        <Link href="/tour/route">
          <motion.div
            whileHover="hover"
            className="inline-flex items-center gap-2 text-white font-bold bg-white/5 hover:bg-green-600 px-6 py-3 rounded-full transition-colors border border-white/10 cursor-pointer"
          >
            전체 코스보기
            <motion.div
              variants={{ hover: { x: 5 } }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <ArrowRight className="w-4 h-4" />
            </motion.div>
          </motion.div>
        </Link>
      </div>

      <div className="w-full lg:w-[65%] relative">
        <Swiper
          effect="coverflow"
          grabCursor
          centeredSlides
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
          onSlideChange={(swiper) => swiper.isEnd && setTimeout(onNextTab, 500)}
          modules={[Autoplay, Pagination, EffectCoverflow]}
          className="tour-swiper pb-14!"
        >
          {allStops.map((stop: any, idx: number) => (
            <SwiperSlide
              key={idx}
              className="rounded-3xl overflow-hidden shadow-2xl border border-white/5"
            >
              <TourStopCard stop={stop} />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
}

const Badge = ({ text }: { text: string }) => (
  <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-500/10 border border-green-500/20 text-green-400 rounded-full text-xs font-bold tracking-tight">
    <span className="relative flex h-2 w-2">
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
      <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
    </span>
    {text}
  </div>
);
