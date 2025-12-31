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
// ★ 여행 후기 섹션 import
import TourReviewSection from "@/components/sections/TourReviewSection";

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

      {/* ★ 여행 후기 섹션 배치 */}
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
