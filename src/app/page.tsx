"use client";

import { motion, Variants } from "framer-motion";
import DefaultLayout from "@/components/layouts/DefaultLayout";
import Jobs from "@/components/sections/Jobs";
import Restaurant from "@/components/sections/Restaurant";
import TourCurse from "@/components/sections/TourCurse";
import Utils from "@/components/sections/Utils";
import Visual from "@/components/sections/Visual";
import HospitalMap from "@/components/sections/HospitalMap";
import BoardSection from "@/components/sections/BoardSection";
// ★ 여행 후기 섹션 import (별도 파일이 아닌 직접 구현으로 변경)
import { useRouter } from "next/navigation";
import { ArrowRight, Camera, Sparkles } from "lucide-react";

// 애니메이션 variants
const fadeInUp: Variants = {
  initial: { opacity: 0, y: 40 },
  whileInView: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: "easeOut",
    },
  },
};

// ★ TourReviewSection 컴포넌트 직접 정의 (요청하신 디자인 반영)
function TourReviewSection() {
  const router = useRouter();

  return (
    <section className="w-full max-w-[1240px] mx-auto px-5 py-20">
      {/* ★ 디자인 포인트 
        - 배경: 세련된 에메랄드(Emerald) -> 청록(Teal) 그라데이션 적용
        - 텍스트: 가독성 높은 흰색 + 반투명 효과
        - 버튼: 화이트/초록 조합으로 깔끔하고 모던하게 변경
      */}
      <div className="relative overflow-hidden rounded-[40px] shadow-2xl shadow-emerald-900/20 group">
        {/* 배경 그라데이션 (Emerald-600 -> Teal-500) */}
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-teal-500 transition-transform duration-700 group-hover:scale-105" />

        {/* 은은한 패턴 효과 */}
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between p-10 md:p-16 gap-10">
          {/* 왼쪽 텍스트 영역 */}
          <div className="text-center md:text-left space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white text-xs font-bold uppercase tracking-widest shadow-sm">
              <Sparkles size={12} className="text-yellow-300 fill-yellow-300" />
              Travel Community
            </div>

            <h2 className="text-3xl md:text-5xl font-[900] text-white leading-tight drop-shadow-sm">
              당신의 여행은 <br />
              <span className="text-emerald-100">어떤 추억</span>으로 남았나요?
            </h2>

            <p className="text-emerald-50/90 text-lg font-medium max-w-md leading-relaxed">
              소중한 순간을 기록하고 공유해보세요.
              <br className="hidden md:block" />
              당신의 이야기가 누군가에게는 설렘이 됩니다.
            </p>
          </div>

          {/* 오른쪽 버튼 영역 */}
          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
            <button
              onClick={() => router.push("/tour/review")}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-white text-emerald-600 px-8 py-4 rounded-2xl font-bold shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all active:scale-95 group/btn"
            >
              후기 보러가기
              <ArrowRight
                size={18}
                className="group-hover/btn:translate-x-1 transition-transform"
              />
            </button>

            <button
              onClick={() => router.push("/tour/review/write")}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-emerald-800/30 backdrop-blur-sm border border-white/30 text-white px-8 py-4 rounded-2xl font-bold hover:bg-emerald-800/50 transition-all hover:-translate-y-1 active:scale-95"
            >
              <Camera size={18} />
              인증샷 올리기
            </button>
          </div>
        </div>

        {/* 장식용 원형 블러 효과 */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-teal-300/20 rounded-full blur-3xl" />
      </div>
    </section>
  );
}

// 메인 페이지 컴포넌트
export default function Home() {
  return (
    <DefaultLayout>
      <Visual />

      <motion.div
        variants={fadeInUp}
        initial="initial"
        whileInView="whileInView"
        viewport={{ once: true, margin: "-100px" }}
      >
        <Utils />
      </motion.div>

      <motion.div
        variants={fadeInUp}
        initial="initial"
        whileInView="whileInView"
        viewport={{ once: true, margin: "-100px" }}
      >
        <Jobs />
      </motion.div>

      <motion.div
        variants={fadeInUp}
        initial="initial"
        whileInView="whileInView"
        viewport={{ once: true, margin: "-100px" }}
      >
        <TourCurse />
      </motion.div>

      {/* ★ 여행 후기 섹션 (수정된 디자인 적용) */}
      <motion.div
        variants={fadeInUp}
        initial="initial"
        whileInView="whileInView"
        viewport={{ once: true, margin: "-100px" }}
      >
        <TourReviewSection />
      </motion.div>

      <motion.div
        variants={fadeInUp}
        initial="initial"
        whileInView="whileInView"
        viewport={{ once: true, margin: "-100px" }}
      >
        <Restaurant />
      </motion.div>

      <motion.div
        variants={fadeInUp}
        initial="initial"
        whileInView="whileInView"
        viewport={{ once: true, margin: "-100px" }}
      >
        <HospitalMap />
      </motion.div>

      <motion.div
        variants={fadeInUp}
        initial="initial"
        whileInView="whileInView"
        viewport={{ once: true, margin: "-100px" }}
      >
        <BoardSection />
      </motion.div>
    </DefaultLayout>
  );
}
