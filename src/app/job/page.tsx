"use client";

import Link from "next/link";
import React, { useEffect, useState, useCallback, useMemo } from "react";
import api from "@/api/axios";
import {
  Loader2, // ArrowPathIcon 대신 사용
  RefreshCw,
  Briefcase,
  GraduationCap,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  ChevronRightIcon,
} from "lucide-react";

// 컴포넌트 및 타입
import JobCard from "@/components/jobTools/JobCard";
import JobDetailModal from "@/components/jobTools/JobDetailModal";
import { JOB_DETAILS_DB } from "@/data/jobDetailData";
import { JobData, ApplyFormData, ApplyStep, DetailContent } from "@/types/job";
// import { ArrowPathIcon } from "@heroicons/react/24/outline"; // 삭제

export default function Page() {
  const [jobs, setJobs] = useState<JobData[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  const [tempFilters, setTempFilters] = useState({
    keyword: "",
    career: "",
    education: "",
  });
  const [activeFilters, setActiveFilters] = useState({
    keyword: "",
    career: "",
    education: "",
  });

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
      const queryParams = new URLSearchParams(activeFilters);
      const res = await api.get(`/job/crawl?${queryParams.toString()}`);
      setJobs(res.data || []);
      setCurrentPage(1);
    } catch (e) {
      console.error("공고 로드 실패:", e);
      setJobs([]);
    } finally {
      setLoading(false);
    }
  }, [activeFilters]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const handleSearch = () => setActiveFilters(tempFilters);
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSearch();
  };
  const handleFilterChange = (
    e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setTempFilters((prev) => ({ ...prev, [name]: value }));
  };

  const totalPages = useMemo(
    () => Math.ceil(jobs.length / itemsPerPage) || 1,
    [jobs]
  );
  const currentJobs = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return jobs.slice(start, start + itemsPerPage);
  }, [jobs, currentPage]);

  const pageNumbers = useMemo(() => {
    const range = 2;
    const nums = [];
    for (
      let i = Math.max(1, currentPage - range);
      i <= Math.min(totalPages, currentPage + range);
      i++
    ) {
      nums.push(i);
    }
    return nums;
  }, [currentPage, totalPages]);

  useEffect(() => {
    if (isModalOpen) {
      const scrollBarWidth =
        window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = "hidden";
      document.body.style.paddingRight = `${scrollBarWidth}px`;
    } else {
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
    }
  }, [isModalOpen]);

  const handleDetailClick = (job: JobData) => {
    setSelectedJob(job);
    setIsModalOpen(true);
    setDetailLoading(true);
    setApplyStep("NONE");
    const matchedDetail = JOB_DETAILS_DB[job.title];
    setDetailContent(
      matchedDetail || {
        task: ["관련 업무 전반", "팀 내 협업 및 지원"],
        qualification: [
          "성실하고 책임감 강하신 분",
          "원활한 커뮤니케이션 가능자",
        ],
        preference: ["유관 업무 경험자 우대", "즉시 출근 가능자"],
      }
    );
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
    <section className="py-16 bg-gray-50/30 overflow-hidden">
      <div className="w-full lg:max-w-7xl mx-auto px-4 lg:px-5">
        <div className="w-full shrink-0 space-y-5 relative mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-black tracking-tight">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            SMART CURATION
          </div>
          <h2 className="text-3xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.1]">
            맞춤형{" "}
            <span className="text-transparent bg-clip-text bg-linear-to-r from-green-600 to-green-400">
              인재 채용{" "}
            </span>
            큐레이션
          </h2>
          <p className="text-slate-500 text-sm font-medium leading-relaxed">
            사람인과 잡코리아의 실시간 데이터를 분석하여 가장 적합한 일자리를
            한눈에 보여드립니다.
          </p>

          <button
            onClick={() => {
              const reset = { keyword: "", career: "", education: "" };
              setTempFilters(reset);
              setActiveFilters(reset);
            }}
            className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-full text-slate-600 hover:text-green-600 hover:border-green-200 transition-all shadow-sm text-sm font-bold group absolute right-0 bottom-0"
          >
            <RefreshCw
              size={16}
              className={
                loading
                  ? "animate-spin"
                  : "group-hover:rotate-180 transition-transform duration-500"
              }
            />
            필터 초기화 및 새로고침
          </button>
        </div>

        <div className="flex-1 min-w-0 space-y-8">
          <div className="bg-white p-4 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100">
            <div className="flex flex-col md:flex-row gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  type="text"
                  name="keyword"
                  value={tempFilters.keyword}
                  onChange={handleFilterChange}
                  onKeyDown={handleKeyDown}
                  placeholder="기업명 혹은 직무 검색"
                  className="w-full pl-12 pr-4 py-4 bg-slate-50/50 border-none rounded-2xl focus:ring-2 focus:ring-green-500/20 focus:bg-white transition-all text-sm outline-none"
                />
              </div>
              <div className="flex gap-3">
                <select
                  name="career"
                  value={tempFilters.career}
                  onChange={handleFilterChange}
                  className="px-4 py-4 bg-slate-50/50 border-none rounded-2xl text-sm font-medium outline-none focus:ring-2 focus:ring-green-500/20 cursor-pointer"
                >
                  <option value="">경력전체</option>
                  <option value="신입">신입</option>
                  <option value="경력">경력</option>
                  <option value="무관">경력무관</option>
                </select>
                <button
                  onClick={handleSearch}
                  className="px-8 bg-slate-900 hover:bg-green-600 text-white rounded-2xl font-bold transition-all shadow-lg shadow-slate-200 flex items-center gap-2"
                >
                  <Filter size={18} />
                  검색
                </button>
              </div>
            </div>
          </div>

          {/* 결과 리스트 */}
          {loading ? (
            <div className="py-32 flex flex-col items-center justify-center bg-white rounded-[2.5rem] border border-slate-100 shadow-sm">
              {/* ArrowPathIcon 대신 Loader2 사용 */}
              <Loader2 className="animate-spin text-green-500 w-12 h-12 mb-4" />
              <p className="text-slate-400 font-semibold text-lg">
                최적의 공고를 선별하고 있습니다...
              </p>
            </div>
          ) : jobs.length === 0 ? (
            <div className="py-32 flex flex-col items-center justify-center bg-white rounded-[2.5rem] border border-slate-100 border-dashed">
              <p className="text-slate-400 font-bold text-xl">
                검색 결과가 없습니다.
              </p>
              <p className="text-slate-300 text-sm mt-2">
                다른 검색어나 필터를 선택해보세요.
              </p>
            </div>
          ) : (
            <div className="space-y-10">
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {currentJobs.map((job, i) => (
                  <div
                    key={`${job.companyName}-${i}`}
                    className="transform hover:scale-[1.02] transition-transform duration-300"
                  >
                    <JobCard job={job} onClick={handleDetailClick} />
                  </div>
                ))}
              </div>

              {/* 페이지네이션 */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-3 pt-6">
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(1, prev - 1))
                    }
                    disabled={currentPage === 1}
                    className="w-12 h-12 flex items-center justify-center rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-30 transition-all shadow-sm"
                  >
                    <ChevronLeft size={20} />
                  </button>

                  <div className="flex gap-2">
                    {pageNumbers.map((number) => (
                      <button
                        key={number}
                        onClick={() => setCurrentPage(number)}
                        className={`w-12 h-12 rounded-2xl font-bold text-sm transition-all shadow-sm ${
                          currentPage === number
                            ? "bg-slate-900 text-white scale-110 shadow-slate-300"
                            : "bg-white border border-slate-200 text-slate-500 hover:border-green-400 hover:text-green-600"
                        }`}
                      >
                        {number}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                    }
                    disabled={currentPage === totalPages}
                    className="w-12 h-12 flex items-center justify-center rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-30 transition-all shadow-sm"
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
              )}
            </div>
          )}
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
