"use client";
import { useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Swiper as SwiperCore } from "swiper";
import { motion, AnimatePresence } from "framer-motion";
import "swiper/css";
import "swiper/css/effect-fade";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { Autoplay, EffectFade, Navigation, Pagination } from "swiper/modules";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function Visual() {
  const [activeIndex, setActiveIndex] = useState(0);

  const handleSlideChange = (swiper: SwiperCore) => {
    setActiveIndex(swiper.realIndex);
  };
  const slideData = [
    {
      category: "Travel Guide", // 'Tour/Route' 대신 더 포괄적인 느낌으로 변경
      src: "/images/visual1.png",
      title: "대전의 숨은 명소,\n테마별 추천 코스",
      description:
        "가족, 연인, 친구와 함께 떠나는\n대전만의 매력 넘치는 관광 가이드.",
      href: "/tour/route",
    },
    {
      category: "Realtime News",
      src: "/images/visual2.png",
      title: "대전 생활에 필요한\n모든 순간의 기록",
      description:
        "지금 가장 핫한 지역 소식과\n꼭 필요한 정보를 가장 빠르게 전달합니다.",
      href: "/news",
    },
    {
      category: "Job & Career", // 단순히 'Job'보다 전문적인 느낌 부여
      src: "/images/visual3.png",
      title: "내 일을 찾는 즐거움,\n대전 맞춤형 일자리",
      description:
        "우리 동네 구인 소식부터 취업 정보까지\n당신의 새로운 시작을 함께합니다.",
      href: "/job",
    },
  ];

  const startScale = 1.15;
  const durationMs = 6000;

  return (
    <section className="relative group">
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
          renderBullet: (index, className) => {
            return `<span class="${className}"></span>`;
          },
        }}
        onSlideChange={handleSlideChange}
        modules={[Autoplay, EffectFade, Navigation, Pagination]}
        className="h-[550px] lg:h-[700px] visual-swiper"
      >
        {slideData.map((item, index) => (
          <SwiperSlide key={index} className="relative overflow-hidden">
            <div className="absolute inset-0">
              <img
                className="w-full h-full object-cover transition-transform ease-out"
                src={item.src}
                style={{
                  transform:
                    activeIndex === index ? `scale(${startScale})` : "scale(1)",
                  transitionDuration: `${durationMs}ms`,
                }}
                alt={item.title}
              />

              <div className="absolute inset-0 bg-linear-to-r from-black/70 via-black/30 to-transparent" />
              <div className="absolute inset-0 bg-linear-to-t from-black/40 via-transparent to-transparent" />
            </div>

            <div className="relative h-full max-w-7xl mx-auto px-6 flex flex-col justify-center">
              <AnimatePresence mode="wait">
                {activeIndex === index && (
                  <motion.div
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="max-w-3xl"
                  >
                    <motion.span
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="inline-flex items-center gap-2 px-3 py-1 bg-green-50/30 text-green-400 rounded-full text-xs font-black tracking-tight mb-3 uppercase"
                    >
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                      </span>

                      {item.category}
                    </motion.span>

                    <motion.h2
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      className="text-4xl md:text-6xl font-bold text-white mb-6 leading-[1.15] whitespace-pre-line tracking-tight"
                    >
                      {item.title}
                    </motion.h2>

                    <motion.p
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 }}
                      className="text-lg md:text-xl text-gray-100/90 leading-relaxed max-w-xl whitespace-pre-line mb-10 font-light"
                    >
                      {item.description}
                    </motion.p>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.8 }}
                      className="flex gap-4 @container"
                    >
                      {/* 자세히 보기 버튼 */}
                      <Link href={item.href}>
                        <motion.div
                          whileHover="hover" // 호버 시 아래 'hover' 상태 실행
                          className="inline-flex items-center gap-2 text-white font-bold bg-green-600 hover:bg-green-500 px-6 py-3 rounded-full transition-colors duration-300 shadow-lg shadow-green-900/40 cursor-pointer"
                        >
                          자세히 보기
                          <motion.div
                            variants={{
                              hover: { x: 6 }, // 호버 시 x축으로 6px 이동
                            }}
                            transition={{
                              type: "spring",
                              stiffness: 400,
                              damping: 10,
                            }}
                          >
                            <ArrowRight className="w-4 h-4" />
                          </motion.div>
                        </motion.div>
                      </Link>

                      {/* 커뮤니티 버튼 */}
                      <Link href="/community/free">
                        <motion.div
                          whileHover="hover"
                          className="inline-flex items-center gap-2 text-white font-bold bg-white/10 hover:bg-white/20 px-6 py-3 rounded-full transition-all duration-300 border border-white/20 backdrop-blur-md cursor-pointer"
                        >
                          커뮤니티
                          <motion.div
                            variants={{
                              hover: { x: 6 },
                            }}
                            transition={{
                              type: "spring",
                              stiffness: 400,
                              damping: 10,
                            }}
                          >
                            <ArrowRight className="w-4 h-4" />
                          </motion.div>
                        </motion.div>
                      </Link>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
}
