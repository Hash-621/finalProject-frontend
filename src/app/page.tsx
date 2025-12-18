"use client";

import { motion, Variants } from "framer-motion"; // Variants 타입 추가
import DefaultLayout from "@/components/layouts/DefaultLayout";
import Jobs from "@/components/sections/Jobs";
import Restaurant from "@/components/sections/Restaurant";
import TourCurse from "@/components/sections/TourCurse";
import Utils from "@/components/sections/Utils";
import Visual from "@/components/sections/Visual";

// 애니메이션 설정을 Variants 형식으로 정의하면 타입 에러가 깔끔하게 사라집니다.
const fadeInUp: Variants = {
  initial: { opacity: 0, y: 40 },
  whileInView: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: "easeOut", // 이제 타입이 Variants 내부에 있어 에러가 안 납니다.
    },
  },
};

export default function Home() {
  return (
    <DefaultLayout>
      <Visual />
      {/* viewport 설정은 div에 직접 넣는 것이 타입 안정성에 좋습니다. */}
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
    </DefaultLayout>
  );
}
