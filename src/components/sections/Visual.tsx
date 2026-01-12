// 1. "use client": 이 파일은 브라우저에서 실행되는 클라이언트 컴포넌트입니다.
// (애니메이션, 슬라이드 동작, 상태 관리 등은 브라우저에서만 가능하니까요.)
"use client";

// --- [라이브러리 임포트] ---
import { useState } from "react"; // 현재 몇 번째 슬라이드인지 기억하기 위한 훅
// Swiper: 터치 슬라이더 라이브러리의 핵심 부품들
import { Swiper, SwiperSlide } from "swiper/react";
import { Swiper as SwiperCore } from "swiper"; // Swiper의 핵심 타입 정의
// Framer Motion: 텍스트가 스르륵 움직이는 애니메이션을 위한 라이브러리
import { motion, AnimatePresence } from "framer-motion";

// Swiper 스타일 시트 (이게 없으면 슬라이더가 다 깨져 보입니다)
import "swiper/css";
import "swiper/css/effect-fade"; // 페이드 효과 스타일
import "swiper/css/navigation"; // 좌우 화살표 스타일
import "swiper/css/pagination"; // 하단 점박이 스타일

// Swiper 기능을 확장하는 모듈들
import { Autoplay, EffectFade, Navigation, Pagination } from "swiper/modules";
import Link from "next/link"; // 페이지 이동 링크
import { ArrowRight } from "lucide-react"; // 화살표 아이콘
import { slideData } from "@/data/visualData"; // 슬라이드에 들어갈 데이터(이미지, 제목 등)

// ==================================================================
// [Main Component] 메인 비주얼 슬라이더 컴포넌트
// ==================================================================
export default function Visual() {
  // 1. [State] 현재 보고 있는 슬라이드 번호 (0, 1, 2...)
  // 이 번호가 바뀌어야 텍스트 애니메이션이 새로 시작됩니다.
  const [activeIndex, setActiveIndex] = useState(0);

  // 2. [Handler] 슬라이드가 넘어갈 때 실행되는 함수
  // swiper.realIndex를 쓰는 이유: 'loop' 모드에서는 복제된 슬라이드가 생기는데,
  // 진짜 데이터의 인덱스(0, 1, 2)를 정확히 알기 위해서입니다.
  const handleSlideChange = (swiper: SwiperCore) => {
    setActiveIndex(swiper.realIndex);
  };

  // 3. [Config] 배경 이미지 줌인 효과 설정
  const startScale = 1.15; // 1.15배 확대된 상태로 시작
  const durationMs = 6000; // 6초 동안 천천히 원래 크기(1)로 돌아오거나 커지는 효과

  // 4. [Render] 화면 그리기
  return (
    // relative group: 자식 요소 위치 기준점 설정
    <section className="relative group">
      {/* --- [Swiper Container] 슬라이더 본체 --- */}
      <Swiper
        effect={"fade"} // 옆으로 미는 게 아니라, 스르륵 바뀌는 페이드 효과 사용
        loop={true} // 마지막 장에서 다시 처음으로 무한 반복
        navigation={true} // 좌우 화살표 네비게이션 켜기
        autoplay={{
          delay: 5000, // 5초마다 자동 넘김
          disableOnInteraction: false, // 사용자가 건드려도 자동 재생 멈추지 않음
        }}
        pagination={{
          clickable: true, // 하단 점을 클릭해서 이동 가능
          // 점(bullet)을 커스텀 HTML로 렌더링 (스타일링을 위해)
          renderBullet: (index, className) => {
            return `<span class="${className}"></span>`;
          },
        }}
        onSlideChange={handleSlideChange} // 슬라이드 바뀔 때마다 state 업데이트
        modules={[Autoplay, EffectFade, Navigation, Pagination]} // 사용할 기능 등록
        className="h-[550px] lg:h-[700px] visual-swiper" // 높이 설정 (모바일 550px, PC 700px)
      >
        {/* 데이터(slideData)를 순회하며 슬라이드를 만듭니다. */}
        {slideData.map((item, index) => (
          <SwiperSlide key={index} className="relative overflow-hidden">
            {/* --- [Layer 1] 배경 이미지 영역 --- */}
            <div className="absolute inset-0">
              {/* 실제 이미지 */}
              <img
                className="w-full h-full object-cover transition-transform ease-out"
                src={item.src}
                style={{
                  // 현재 활성화된 슬라이드면 확대(scale), 아니면 원상복구
                  // Ken Burns 효과: 이미지가 살짝 움직이는 느낌을 줌
                  transform:
                    activeIndex === index ? `scale(${startScale})` : "scale(1)",
                  transitionDuration: `${durationMs}ms`,
                }}
                alt={item.title}
              />

              {/* 그라데이션 오버레이 1: 왼쪽에서 오른쪽으로 어두워짐 (텍스트 가독성 확보) */}
              <div className="absolute inset-0 bg-linear-to-r from-black/70 via-black/30 to-transparent" />
              {/* 그라데이션 오버레이 2: 아래에서 위로 살짝 어두워짐 */}
              <div className="absolute inset-0 bg-linear-to-t from-black/40 via-transparent to-transparent" />
            </div>

            {/* --- [Layer 2] 텍스트 콘텐츠 영역 --- */}
            <div className="relative h-full max-w-7xl mx-auto px-6 flex flex-col justify-center">
              {/* AnimatePresence: 컴포넌트가 사라질 때(exit) 애니메이션을 실행하게 해주는 마법사 */}
              {/* mode="wait": 이전 텍스트가 다 사라지고 나서 새 텍스트가 나옴 (겹침 방지) */}
              <AnimatePresence mode="wait">
                {/* 현재 슬라이드 번호(index)와 활성 번호(activeIndex)가 같을 때만 내용을 보여줌 */}
                {activeIndex === index && (
                  <motion.div
                    // [전체 컨테이너 애니메이션]
                    initial={{ opacity: 0, x: -30 }} // 시작: 투명하고 왼쪽(-30px)에 있음
                    animate={{ opacity: 1, x: 0 }} // 등장: 불투명해지며 제자리로 옴
                    exit={{ opacity: 0, x: 20 }} // 퇴장: 투명해지며 오른쪽(+20px)으로 사라짐
                    transition={{ duration: 0.8, ease: "easeOut" }} // 0.8초 동안 부드럽게
                    className="max-w-3xl"
                  >
                    {/* (1) 카테고리 뱃지 */}
                    <motion.span
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }} // 0.2초 뒤에 늦게 시작 (순차 등장)
                      className="inline-flex items-center gap-2 px-3 py-1 bg-green-50/30 text-green-400 rounded-full text-xs font-black tracking-tight mb-3 uppercase"
                    >
                      {/* 초록색 깜빡이는 점 애니메이션 */}
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                      </span>
                      {item.category}
                    </motion.span>

                    {/* (2) 메인 타이틀 */}
                    <motion.h2
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }} // 0.4초 뒤에 등장
                      className="text-4xl md:text-6xl font-bold text-white mb-6 leading-[1.15] whitespace-pre-line tracking-tight"
                    >
                      {item.title}
                    </motion.h2>

                    {/* (3) 설명 문구 */}
                    <motion.p
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 }} // 0.6초 뒤에 등장
                      className="text-lg md:text-xl text-gray-100/90 leading-relaxed max-w-xl whitespace-pre-line mb-10 font-light"
                    >
                      {item.description}
                    </motion.p>

                    {/* (4) 버튼 그룹 */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.8 }} // 0.8초 뒤에 마지막으로 등장
                      className="flex gap-4 @container"
                    >
                      {/* [자세히 보기 버튼] */}
                      <Link href={item.href}>
                        <motion.div
                          whileHover="hover" // 마우스 올렸을 때 애니메이션 실행
                          className="inline-flex items-center gap-2 text-white font-bold bg-green-600 hover:bg-green-500 text-sm sm:text-lg px-4 sm:px-6 py-3 rounded-full transition-colors duration-300 shadow-lg shadow-green-900/40 cursor-pointer"
                        >
                          자세히 보기
                          {/* 화살표 아이콘 애니메이션: 호버 시 오른쪽으로 튕김 */}
                          <motion.div
                            variants={{
                              hover: { x: 6 },
                            }}
                            transition={{
                              type: "spring", // 스프링처럼 통통 튀는 느낌
                              stiffness: 400,
                              damping: 10,
                            }}
                          >
                            <ArrowRight className="w-4 h-4" />
                          </motion.div>
                        </motion.div>
                      </Link>

                      {/* [커뮤니티 버튼] - 반투명 유리 효과(Glassmorphism) */}
                      <Link href="/community/free">
                        <motion.div
                          whileHover="hover"
                          className="inline-flex items-center gap-2 text-white font-bold bg-white/10 hover:bg-white/20 text-sm sm:text-lg px-4 sm:px-6 py-3 rounded-full transition-all duration-300 border border-white/20 backdrop-blur-md cursor-pointer"
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

// 초기 로딩 (Mount):

// 컴포넌트가 실행되면 Swiper(슬라이더)가 준비됩니다.

// 첫 번째 이미지(index 0)가 배경에 깔립니다. 이때 scale(1.15) 효과가 적용되어 이미지가 아주 천천히 확대되며 생동감을 줍니다(Ken Burns 효과).

// 텍스트 등장 (Entrance Animation):

// activeIndex가 0임을 감지한 Framer Motion이 작동합니다.

// 뱃지 -> 제목 -> 설명 -> 버튼 순서대로 시간차(delay)를 두고 왼쪽에서 스르륵 나타납니다(opacity: 0 -> 1, x: -30 -> 0).

// 자동 슬라이드 (Autoplay):

// 5초(delay: 5000)가 지나면 Swiper가 다음 슬라이드로 넘어갑니다.

// 이때 handleSlideChange 함수가 실행되어 activeIndex를 1로 바꿉니다.

// 화면 전환 (Transition):

// 기존 텍스트: AnimatePresence 덕분에 그냥 사라지는 게 아니라, 오른쪽으로 스르륵 밀려나며 사라집니다(exit).

// 새 텍스트: 새로운 슬라이드의 텍스트가 다시 왼쪽에서 등장합니다.

// 배경: EffectFade 효과로 인해 이전 이미지는 자연스럽게 흐려지고 새 이미지가 나타납니다.

// 상호작용 (Interaction):

// 사용자가 "자세히 보기" 버튼에 마우스를 올리면, 버튼 배경색이 바뀌고 화살표가 뿅 하고 튀어 나가는 귀여운 애니메이션이 실행됩니다.
