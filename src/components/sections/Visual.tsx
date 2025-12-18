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

export default function Visual() {
  const [activeIndex, setActiveIndex] = useState(0);

  const handleSlideChange = (swiper: SwiperCore) => {
    setActiveIndex(swiper.realIndex);
  };

  const slideData = [
    {
      category: "Daejeon Life",
      src: "/images/visual1.png",
      title: "대전의 모든 정보,\n한 곳에서 다잇슈",
      description:
        "뉴스부터 구인구직·병원·맛집까지\n실시간으로 확인하는 대전 생활 가이드.",
      href: "/search/results?searchStatus=all&searchKeyword=", // 검색 전체 페이지나 메인 서비스
    },
    {
      category: "Realtime News",
      src: "/images/visual2.png",
      title: "대전 생활에 필요한\n모든 순간의 기록",
      description:
        "지금 가장 핫한 지역 소식과\n꼭 필요한 정보를 가장 빠르게 전달합니다.",
      href: "/news", // 뉴스/소식 페이지
    },
    {
      category: "Community",
      src: "/images/visual3.png",
      title: "대전 사람들의\n진솔한 이야기 공간",
      description:
        "우리 동네 사람들과 나누는\n따뜻한 정보와 일자리 소식을 만나보세요.",
      href: "/community", // 커뮤니티/게시판 페이지
    },
  ];

  const startScale = 1.15; // 너무 과하지 않게 조절
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
            {/* 📸 이미지 레이어 & Ken Burns 효과 */}
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
              {/* 시네마틱 오버레이 그라데이션 */}
              <div className="absolute inset-0 bg-linear-to-r from-black/70 via-black/30 to-transparent" />
              <div className="absolute inset-0 bg-linear-to-t from-black/40 via-transparent to-transparent" />
            </div>

            {/* ✍️ 컨텐츠 레이어 */}
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
                    {/* 상단 배지 */}
                    <motion.span
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="inline-block px-4 py-1.5 rounded-full bg-green-500 text-white text-xs font-bold tracking-widest uppercase mb-6 shadow-lg shadow-green-500/30"
                    >
                      {item.category}
                    </motion.span>

                    {/* 메인 타이틀 (개행 적용) */}
                    <motion.h2
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      className="text-4xl md:text-6xl font-black text-white mb-6 leading-[1.15] whitespace-pre-line tracking-tight"
                    >
                      {item.title}
                    </motion.h2>

                    {/* 서브 텍스트 */}
                    <motion.p
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 }}
                      className="text-lg md:text-xl text-gray-100/90 leading-relaxed max-w-xl whitespace-pre-line mb-10 font-light"
                    >
                      {item.description}
                    </motion.p>
                    {/* CTA 버튼 영역 */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.8 }}
                      className="flex gap-4 @container"
                    >
                      <Link
                        href={item.href}
                        className="px-8 py-3 bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl transition-all shadow-xl shadow-green-500/20 active:scale-95 flex items-center justify-center  @max-[350px]:hidden"
                      >
                        자세히 보기
                      </Link>

                      <Link
                        href="/community"
                        className="px-8 py-3 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl backdrop-blur-md transition-all border border-white/20 flex items-center justify-center  @max-[350px]:hidden"
                      >
                        커뮤니티 이동
                      </Link>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* 커스텀 네비게이션 스타일링을 위한 CSS (글로벌 CSS나 스탠다드 CSS에 추가 권장) */}
      <style jsx global>{`
        .visual-swiper .swiper-pagination-bullet {
          width: 40px;
          height: 4px;
          border-radius: 2px;
          background: rgba(255, 255, 255, 0.3);
          opacity: 1;
          transition: all 0.3s;
        }
        .visual-swiper .swiper-pagination-bullet-active {
          background: #22c55e !important;
          width: 60px;
        }
        .visual-swiper .swiper-button-next,
        .visual-swiper .swiper-button-prev {
          color: white !important;
          opacity: 0;import { Link } from 'next/link';
import { Link } from 'next/link';
import { Link } from 'next/link';

          transition: all 0.3s;
        }
        .group:hover .swiper-button-next,
        .group:hover .swiper-button-prev {
          opacity: 0.5;
        }
        .group:hover .swiper-button-next:hover,
        .group:hover .swiper-button-prev:hover {
          opacity: 1;
        }
      `}</style>
    </section>
  );
}
