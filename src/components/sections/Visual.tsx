"use client";
import { useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Swiper as SwiperCore } from "swiper";
import { motion } from "framer-motion";
import "swiper/css";
import "swiper/css/effect-fade";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { Autoplay, EffectFade, Navigation, Pagination } from "swiper/modules";

export default function Visual() {
  const [activeIndex, setActiveIndex] = useState(0);
  const handleSlideChange = (swiper: SwiperCore) => {
    setActiveIndex(swiper.realIndex);
  };

  const slideData = [
    {
      src: "/images/visual1.png",
      title: "대전의 모든 정보, 한 곳에서",
      description:
        "뉴스부터 구인구직·병원·맛집·관광지까지 실시간으로 확인하세요.",
    },
    {
      src: "/images/visual2.png",
      title: "대전 생활에 필요한 모든 순간",
      description: "지금 필요한 지역 소식과 정보를 빠르게 찾을 수 있습니다.",
    },
    {
      src: "/images/visual3.png",
      title: "대전 사람들의 이야기와 정보",
      description: "지역 뉴스와 일자리, 추천 정보까지 함께 공유하는 공간.",
    },
  ];
  const startScale = 1.2;
  const durationMs = 5000;

  const textVariants = {
    initial: {
      y: 50,
      opacity: 0,
    },

    animate: {
      y: 0,
      opacity: 1,
    },
  };

  const containerVariants = {
    animate: {
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  return (
    <section>
      <Swiper
        effect={"fade"}
        loop={true}
        navigation={true}
        autoplay={{
          delay: 5000,
          disableOnInteraction: false,
        }}
        pagination={{
          clickable: true,
        }}
        onSwiper={handleSlideChange}
        onSlideChange={handleSlideChange}
        modules={[Autoplay, EffectFade, Navigation, Pagination]}
        className="mySwiper h-96 lg:h-[500px] visual-swiper"
      >
        {slideData.map((item, index) => (
          <SwiperSlide key={index} className="overflow-hidden">
            <img
              className={`block w-full h-full object-cover transition-transform ease-in`}
              src={item.src}
              style={{
                transform: `scale(${activeIndex === index ? startScale : 1})`,
                transitionDuration: `${durationMs}ms`,
              }}
            />
            <div className="absolute inset-0 flex justify-center items-center text-white bg-black/30">
              <div className="w-full lg:max-w-7xl mx-auto px-5">
                <motion.div
                  key={activeIndex}
                  variants={containerVariants}
                  initial="initial"
                  animate={activeIndex === index ? "animate" : "initial"}
                  className="flex flex-col justify-center"
                >
                  <motion.h2
                    variants={textVariants}
                    transition={{ duration: 0.5 }}
                    className="text-4xl lg:text-5xl font-bold mb-4 text-center sm:text-left"
                  >
                    {item.title}
                  </motion.h2>
                  <motion.p
                    variants={textVariants}
                    transition={{ duration: 0.5 }}
                    className="text-lg lg:text-xl max-w-2xl text-center sm:text-left"
                  >
                    {item.description}
                  </motion.p>
                </motion.div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
}
