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
import { JobData, ApplyFormData, ApplyStep } from "@/types/job";
import { ArrowPathIcon } from "@heroicons/react/24/outline";

export default function Jobs() {
  const [jobs, setJobs] = useState<JobData[]>([]);
  const [loading, setLoading] = useState(false);

  // 모달 관련 상태
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [detailHtml, setDetailHtml] = useState("");
  const [detailLoading, setDetailLoading] = useState(false);
  const [selectedJob, setSelectedJob] = useState<JobData | null>(null);
  const [applyStep, setApplyStep] = useState<ApplyStep>("NONE");
  const [applyForm, setApplyForm] = useState<ApplyFormData>({
    name: "",
    phone: "",
    message: "",
  });

  const fetch20Jobs = useCallback(async () => {
    setLoading(true);
    try {
      const TOTAL_PAGES = 4; // 5개씩 4페이지 = 20개

      const requests = Array.from({ length: TOTAL_PAGES }, (_, i) =>
        api.get(`/job/crawl?page=${i + 1}`)
      );

      const responses = await Promise.all(requests);

      const combined = responses.flatMap((res) => res.data || []);
      const uniqueJobs = combined
        .filter(
          (item, index, self) =>
            index === self.findIndex((t) => t.url === item.url)
        )
        .slice(0, 20);

      setJobs(uniqueJobs);
    } catch (e) {
      console.error("데이터 로드 실패", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch20Jobs();
  }, [fetch20Jobs]);

  // 상세 보기 및 지원 제출 로직 (유지)
  const handleDetailClick = async (job: JobData) => {
    setIsModalOpen(true);
    setDetailLoading(true);
    setSelectedJob(job);
    setDetailHtml("");
    setApplyStep("NONE");
    try {
      const res = await api.get(
        `/job/detail?url=${encodeURIComponent(job.url)}`
      );
      setDetailHtml(
        res.data === "FAIL" || !res.data || res.data.length < 50
          ? "FAIL"
          : res.data
      );
    } catch (e) {
      setDetailHtml("FAIL");
    } finally {
      setDetailLoading(false);
    }
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
          <div className="w-full lg:w-[25%] shrink-0">
            <h4 className="font-bold text-green-600 mb-2">구인구직</h4>
            <h2 className="text-3xl lg:text-4xl font-bold mb-4 leading-tight">
              대전 채용 공고
              <br />
              최신 업데이트
            </h2>
            <p className="text-gray-500 mb-8 text-sm">
              실시간 업데이트되는 대전 지역
              <br className="hidden lg:block" /> 최신 공고 20개를 확인하세요.
            </p>
            <Link
              href="/job"
              className="inline-flex px-8 py-3 text-white bg-green-500 hover:bg-green-600 transition-all rounded-full font-bold text-sm shadow-md"
            >
              전체 공고 보기
            </Link>
          </div>

          <div className="w-full lg:w-[75%] min-w-0 relative">
            {loading ? (
              <div className="h-[360px] flex flex-col items-center justify-center bg-white rounded-4xl border border-gray-100 shadow-sm">
                <ArrowPathIcon className="animate-spin text-green-500 w-10 h-10 mb-2" />
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
        detailHtml={detailHtml}
        applyStep={applyStep}
        setApplyStep={setApplyStep}
        applyForm={applyForm}
        setApplyForm={setApplyForm}
        handleApplySubmit={handleApplySubmit}
      />
    </section>
  );
}
