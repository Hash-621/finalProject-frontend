"use client";

import { useEffect, useRef } from "react";
import { motion, Variants } from "framer-motion";
import DefaultLayout from "@/components/layouts/DefaultLayout";
import Jobs from "@/components/sections/Jobs";
import Restaurant from "@/components/sections/Restaurant";
import TourCurse from "@/components/sections/TourCurse";
import Utils from "@/components/sections/Utils";
import Visual from "@/components/sections/Visual";
import HospitalMap from "@/components/sections/HospitalMap";
import BoardSection from "@/components/sections/BoardSection";
import TourReviewSection from "@/components/sections/TourReviewSection";

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

// 메인 페이지 컴포넌트
export default function Home() {
  const serverURL = process.env.NEXT_PUBLIC_API_URL;
  // React 18에서는 useEffect가 두 번 실행될 수 있으므로(Strict Mode),
  // 중복 전송 방지용 Ref 사용
  const isLogged = useRef(false);

  useEffect(() => {
    if (isLogged.current) return; // 이미 기록했으면 패스

    const logVisit = async () => {
      try {
        await fetch(`${serverURL}/api/v1/admin/visit`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            // 현재 보고 있는 페이지 주소
            currentUrl: window.location.href,
            // 이전 페이지 주소 (브라우저가 알고 있음)
            referrer: document.referrer,
          }),
        });
        isLogged.current = true; // 기록 완료 플래그
      } catch (error) {
        console.error("방문 기록 실패 (서버 꺼짐?)", error);
      }
    };

    logVisit();
  }, []);
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
        <TourReviewSection />
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
