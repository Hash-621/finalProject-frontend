"use client";

import Link from "next/link";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Mousewheel } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";

import { useJobs } from "@/hooks/main/useJobs";
import { useJobModal } from "@/hooks/main/useJobModal";
import JobCard from "@/components/jobTools/JobCard";
import JobDetailModal from "@/components/jobTools/JobDetailModal";

import { Loader2, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export default function Jobs() {
  const { jobs, loading } = useJobs();
  const {
    openModal,
    handleApplySubmit,
    isModalOpen,
    setIsModalOpen,
    ...modalProps
  } = useJobModal();

  return (
    <section className="py-12 bg-gray-50/20 overflow-hidden">
      <div className="w-full mx-auto px-4 md:max-w-7xl lg:px-8">
        <div className="flex flex-col lg:flex-row gap-10">
          {/* 1. 좌측 타이틀 섹션 */}
          <div className="w-full lg:w-[30%] shrink-0 space-y-4">
            <LiveBadge />
            <h2 className="text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
              대전{" "}
              <span className="text-transparent bg-clip-text bg-linear-to-r from-green-600 to-emerald-500">
                채용 공고
              </span>
              <br />
              최신 업데이트
            </h2>
            <p className="text-slate-500 text-sm font-medium leading-relaxed">
              실시간으로 업데이트되는 대전 지역의 엄선된 최신 공고 20개를
              확인하세요.
            </p>
            <Link href="/job">
              <motion.div
                whileHover="hover"
                className="inline-flex px-8 py-3.5 text-white bg-slate-900 hover:bg-green-600 transition-colors duration-300 rounded-full font-bold shadow-lg shadow-slate-100 items-center gap-2 cursor-pointer"
              >
                전체 공고 보기
                <motion.div
                  variants={{ hover: { x: 5 } }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  <ArrowRight className="w-4 h-4" />
                </motion.div>
              </motion.div>
            </Link>
          </div>

          <div className="w-full lg:w-[75%] min-w-0 relative">
            {loading ? (
              <LoadingState />
            ) : (
              <Swiper
                modules={[Navigation, Mousewheel]}
                spaceBetween={20}
                slidesPerView={1.2}
                mousewheel={{ forceToAxis: true }}
                breakpoints={{
                  640: { slidesPerView: 2.2 },
                  1024: { slidesPerView: 3 },
                }}
                className="job-swiper"
              >
                {jobs.map((job, i) => (
                  <SwiperSlide key={`${job.url}-${i}`}>
                    <JobCard job={job} onClick={() => openModal(job)} />
                  </SwiperSlide>
                ))}
              </Swiper>
            )}

            {!loading && jobs.length > 0 && (
              <p className="text-center text-[11px] text-gray-400 mt-4 italic">
                상위 20개의 최신 공고가 표시됩니다.
              </p>
            )}
          </div>
        </div>
      </div>

      <JobDetailModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        handleApplySubmit={handleApplySubmit}
        {...modalProps}
      />
    </section>
  );
}

const LiveBadge = () => (
  <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-bold tracking-tight">
    <span className="relative flex h-2 w-2">
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
      <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
    </span>
    LIVE UPDATE
  </div>
);

const LoadingState = () => (
  <div className="h-[360px] flex flex-col items-center justify-center bg-white rounded-4xl border border-gray-100 shadow-sm">
    <Loader2 className="animate-spin text-green-500 w-10 h-10 mb-2" />
    <p className="text-gray-400 font-medium">채용 정보를 불러오는 중...</p>
  </div>
);
