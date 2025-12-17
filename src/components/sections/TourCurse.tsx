"use client";
import { tourCurseData } from "@/data/tourCurseData";
import type { TourCurse } from "@/types/tour";
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from "@headlessui/react";
import { useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import { Autoplay, Pagination } from "swiper/modules";
import { MapPinIcon } from "@heroicons/react/24/outline";
import Link from "next/link";

const TourSwiperContent = ({
  tourCurse,
  currentTabIndex,
  totalTours,
  onNextTab,
}: {
  tourCurse: TourCurse;
  currentTabIndex: number;
  totalTours: number;
  onNextTab: () => void;
}) => {
  const days = tourCurse.tour;
  const allTourStops = days.flatMap((dayRoute) =>
    dayRoute.detail.map((stop) => ({
      ...stop,
      day: dayRoute.day.toUpperCase(),
      dayName: dayRoute.name,
    }))
  );

  const totalSlides = allTourStops.length;

  const handleSlideChange = (swiper: any) => {
    if (swiper.isEnd) {
      onNextTab();
    }
  };

  return (
    <div className="flex gap-6 flex-col md:flex-row">
      <div className="w-full md:w-[40%] lg:w-[30%]">
        <h4 className="font-bold text-base lg:text-lg">관광지 추천코스</h4>
        <h2 className="text-3xl lg:text-4xl font-bold my-3">
          {tourCurse.title}
        </h2>
        <h3 className="text-lg lg:text-2xl">{tourCurse.subTitle}</h3>
        <Link
          href=""
          className="flex w-40 h-12 mt-10 bg-green-600 items-center justify-center rounded-full md:hidden"
        >
          더보기
        </Link>
      </div>
      <Swiper
        autoplay={{
          delay: 2500,
          disableOnInteraction: false,
        }}
        spaceBetween={30}
        slidesPerView={1}
        breakpoints={{
          640: { slidesPerView: 2 },
          768: { slidesPerView: 1 },
          1024: { slidesPerView: 2 },
        }}
        pagination={{
          clickable: true,
        }}
        className="mySwiper w-full md:w-[60%] lg:w-[70%] tour-swiper"
        onReachEnd={() => {}}
        onSlideChange={handleSlideChange}
        modules={[Autoplay, Pagination]}
      >
        {allTourStops.map((stop, index) => (
          <SwiperSlide
            key={index}
            style={{
              backgroundImage: `url(${stop.src})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
            className="overflow-hidden rounded-xl"
          >
            <Link
              href=""
              className="relative w-full h-80 md:h-96 block lg:h-[450px]"
            >
              <div className="absolute left-5 bottom-5 bg-black/40 w-[calc(100%-40px)] p-4 rounded-xl">
                <p className="text-sm">
                  {stop.day} - {stop.dayName}
                </p>

                <h5 className="text-lg font-bold my-2">{stop.name}</h5>
                {stop.location && stop.location.length >= 1 && (
                  <div className="flex gap-1 items-center">
                    <MapPinIcon aria-hidden="true" className="size-4" />
                    <p className="text-sm">{stop.location}</p>
                  </div>
                )}
                <p className="text-sm">{stop.text.substring(0, 30)}...</p>
              </div>
            </Link>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default function TourCurse() {
  const tours = tourCurseData.tours;
  const [selectedIndex, setSelectedIndex] = useState(0);

  const goToNextTab = () => {
    if (selectedIndex < tours.length - 1) {
      setSelectedIndex((prevIndex) => prevIndex + 1);
    } else {
      setSelectedIndex(0);
    }
  };

  return (
    <section className="bg-green-500 py-10 lg:py-20 text-white">
      <div className="w-full lg:max-w-7xl mx-auto px-2 lg:px-5 relative">
        <TabGroup selectedIndex={selectedIndex} onChange={setSelectedIndex}>
          <TabPanels>
            {tours.map((tour, index) => (
              <TabPanel key={index}>
                <TourSwiperContent
                  tourCurse={tour}
                  currentTabIndex={index}
                  totalTours={tours.length}
                  onNextTab={goToNextTab}
                />
              </TabPanel>
            ))}
          </TabPanels>
          <TabList className="hidden md:flex flex-col items-start absolute bottom-8 gap-2.5">
            {tours.map((tour, index) => (
              <Tab
                key={index}
                className={({ selected }) =>
                  `cursor-pointer pl-5 text-base lg:text-lg relative duration-300 after:absolute after:left-0 after:top-1/2 after:-translate-y-1/2 after:w-2 after:h-2 after:rounded-sm after:bg-white after:content-[''] focus:outline-0 ${
                    selected ? "font-bold" : "font-normal"
                  }`
                }
              >
                {tour.title}
              </Tab>
            ))}
          </TabList>
        </TabGroup>
      </div>
    </section>
  );
}
