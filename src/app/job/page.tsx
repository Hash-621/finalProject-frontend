"use client";

import React, { useEffect, useState, useCallback } from "react";
import api from "@/api/axios";

import { ArrowPathIcon, PlusIcon } from "@heroicons/react/24/outline";
import { JobData, ApplyFormData, ApplyStep } from "@/types/job";

import JobCard from "@/components/jobTools/JobCard";
import JobDetailModal from "@/components/jobTools/JobDetailModal";

export default function Page() {
  const [jobs, setJobs] = useState<JobData[]>([]);
  const [loading, setLoading] = useState(false);

  const [visibleCount, setVisibleCount] = useState(5);

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

  const fetchAllJobs = useCallback(async () => {
    setLoading(true);
    try {
      const TOTAL_PAGES = 8;
      const requests = Array.from({ length: TOTAL_PAGES }, (_, i) =>
        api.get(`/job/crawl?page=${i + 1}`)
      );

      const responses = await Promise.all(requests);
      const combined = responses.flatMap((res) => res.data || []);
      const uniqueJobs = combined.filter(
        (item, index, self) =>
          index === self.findIndex((t) => t.url === item.url)
      );

      setJobs(uniqueJobs);
      setVisibleCount(5);
    } catch (e) {
      console.error("데이터 로드 실패", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllJobs();
  }, [fetchAllJobs]);

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

  const handleShowMore = () => {
    setVisibleCount((prev) => prev + 5);
  };

  return (
    <main className="min-h-screen bg-gray-50/50">
      <section className="bg-white border-b border-gray-100 pt-32 pb-16">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 text-center">
          <span className="inline-block px-4 py-1.5 bg-green-50 text-green-600 rounded-full text-sm font-bold mb-4">
            Daejeon Job Connect
          </span>
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-6 tracking-tight">
            대전 채용 공고 전체보기
          </h1>
          <p className="text-gray-500 max-w-2xl mx-auto leading-relaxed">
            실시간으로 수집된 대전 지역의 최신 구인 정보를 확인하세요.
            <br />
            관심 있는 공고의 상세 요강을 확인하고 바로 지원할 수 있습니다.
          </p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 lg:px-8 py-16">
        {loading && jobs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-40">
            <ArrowPathIcon className="animate-spin text-green-500 w-12 h-12 mb-4" />
            <p className="text-gray-500 font-bold">
              공고 데이터를 불러오고 있습니다...
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 w-full mb-16">
              {jobs.slice(0, visibleCount).map((job, i) => (
                <JobCard
                  key={`${job.url}-${i}`}
                  job={job}
                  onClick={handleDetailClick}
                />
              ))}
            </div>

            {visibleCount < jobs.length && (
              <button
                onClick={handleShowMore}
                className="group flex items-center gap-3 px-14 py-5 bg-white border-2 border-green-500 text-green-600 rounded-2xl font-black text-xl hover:bg-green-50 transition-all shadow-xl shadow-green-100 hover:-translate-y-1 active:scale-95"
              >
                <PlusIcon className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" />
                공고 5개 더 보기
              </button>
            )}

            {/* 공고 끝 알림 */}
            {!loading && jobs.length > 0 && visibleCount >= jobs.length && (
              <p className="text-gray-400 font-medium italic">
                모든 공고를 확인하셨습니다.
              </p>
            )}
          </div>
        )}
      </section>

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
    </main>
  );
}
