"use client";

import Link from "next/link";
import React, { useEffect, useState, useCallback } from "react";
import api from "@/api/axios";

// Swiper 라이브러리
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Mousewheel } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";

// 컴포넌트 및 타입
import JobCard from "@/components/jobTools/JobCard";
import JobDetailModal from "@/components/jobTools/JobDetailModal";
import { JOB_DETAILS_DB } from "@/data/jobDetailData";
import { JobData, ApplyFormData, ApplyStep, DetailContent } from "@/types/job";

// lucide-react로 변경
import { Loader2, ChevronRight, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export default function Jobs() {
  const [jobs, setJobs] = useState<JobData[]>([]);
  const [loading, setLoading] = useState(false);

  // 모달 관련 상태
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [selectedJob, setSelectedJob] = useState<JobData | null>(null);
  const [applyStep, setApplyStep] = useState<ApplyStep>("NONE");
  const [applyForm, setApplyForm] = useState<ApplyFormData>({
    name: "",
    phone: "",
    message: "",
  });

  const [detailContent, setDetailContent] = useState<DetailContent | null>(
    null
  );

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    try {
      const TOTAL_PAGES = 4;

      const requests = Array.from({ length: TOTAL_PAGES }, (_, i) =>
        api.get(`/job/crawl?page=${i + 1}`)
      );

      const responses = await Promise.all(requests);

      const combined = responses.flatMap((res) =>
        Array.isArray(res.data) ? res.data : []
      );

      const uniqueJobs = combined
        .filter(
          (item, index, self) =>
            index === self.findIndex((t) => t.url === item.url)
        )
        .slice(0, 20);

      setJobs(uniqueJobs);
    } catch (e) {
      console.error("데이터 로드 실패:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  useEffect(() => {
    if (isModalOpen) {
      const scrollBarWidth = window.innerWidth - document.body.clientWidth;
      document.body.style.overflow = "hidden";
      document.body.style.paddingRight = `${scrollBarWidth}px`;
    } else {
      document.body.style.overflow = "unset";
      document.body.style.paddingRight = "0px";
    }

    return () => {
      document.body.style.overflow = "unset";
      document.body.style.paddingRight = "0px";
    };
  }, [isModalOpen]);

  const handleDetailClick = async (job: JobData) => {
    setSelectedJob(job);
    setIsModalOpen(true);
    setDetailLoading(true);
    setApplyStep("NONE");
    const matchedDetail = JOB_DETAILS_DB[job.title];
    if (matchedDetail) {
      setDetailContent(matchedDetail);
    } else {
      setDetailContent({
        task: ["관련 업무 전반", "팀 내 협업 및 지원"],
        qualification: [
          "성실하고 책임감 강하신 분",
          "원활한 커뮤니케이션 가능자",
        ],
        preference: ["유관 업무 경험자 우대", "즉시 출근 가능자"],
      });
    }
    setDetailLoading(false);
  };

  const handleApplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!applyForm.name || !applyForm.phone)
      return alert("필수 정보를 입력해주세요.");
    try {
      await api.post("/job/apply", {
        ...applyForm,
        companyName: selectedJob?.companyName,
        jobTitle: selectedJob?.title,
      });
      setApplyStep("DONE");
    } catch (error) {
      setApplyStep("DONE");
    }
  };

  return (
    <section className="py-12 bg-gray-50/20 overflow-hidden">
      <div className="w-full mx-auto px-4 md:max-w-7xl lg:px-8">
        <div className="flex flex-col lg:flex-row gap-10">
          <div className="w-full lg:w-[30%] shrink-0 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-bold tracking-tight">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              LIVE UPDATE
            </div>
            <h2 className="text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
              대전{" "}
              <span className="text-transparent bg-clip-text bg-linear-to-r from-green-600 to-emerald-500">
                채용 공고
              </span>
              <br />
              최신 업데이트
            </h2>
            <p className="text-slate-500 text-sm font-medium leading-relaxed">
              실시간으로 업데이트되는 대전 지역의
              <br className="hidden lg:block" /> 엄선된 최신 공고 20개를
              확인하세요.
            </p>
            <Link href="/job">
              <motion.div
                whileHover="hover"
                className="inline-flex px-8 py-3.5 text-white bg-slate-900 hover:bg-green-600 transition-colors duration-300 rounded-full font-bold shadow-lg shadow-slate-100 items-center gap-2 cursor-pointer"
              >
                전체 공고 보기
                <motion.div
                  variants={{
                    hover: { x: 5 },
                  }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  <ArrowRight className="w-4 h-4" />
                </motion.div>
              </motion.div>
            </Link>
          </div>

          <div className="w-full lg:w-[75%] min-w-0 relative">
            {loading ? (
              <div className="h-[360px] flex flex-col items-center justify-center bg-white rounded-4xl border border-gray-100 shadow-sm">
                {/* Loader2로 변경 */}
                <Loader2 className="animate-spin text-green-500 w-10 h-10 mb-2" />
                <p className="text-gray-400 font-medium">
                  채용 정보를 불러오는 중...
                </p>
              </div>
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
                observer={true}
                observeParents={true}
                className="job-swiper"
              >
                {jobs.map((job, i) => (
                  <SwiperSlide key={`${job.url}-${i}`}>
                    <JobCard job={job} onClick={handleDetailClick} />
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
        selectedJob={selectedJob}
        detailLoading={detailLoading}
        detailContent={detailContent}
        applyStep={applyStep}
        setApplyStep={setApplyStep}
        applyForm={applyForm}
        setApplyForm={setApplyForm}
        handleApplySubmit={handleApplySubmit}
      />
    </section>
  );
}
