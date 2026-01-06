"use client";

import { useSearchParams } from "next/navigation";
import React, {
  useEffect,
  useState,
  useCallback,
  useMemo,
  Suspense,
} from "react";
import api from "@/api/axios";
import { Loader2, RefreshCw, Search, Filter, X } from "lucide-react";

// 컴포넌트 및 타입
import JobCard from "@/components/jobTools/JobCard";
import JobDetailModal from "@/components/jobTools/JobDetailModal";
import Pagination from "@/components/common/Pagination";
import { JOB_DETAILS_DB } from "@/data/jobDetailData";
import { JobData, ApplyFormData, ApplyStep, DetailContent } from "@/types/job";

// [UI] 채용 공고 스켈레톤 UI
const JobSkeleton = () => (
  <div className="bg-white p-7 rounded-[2rem] border border-slate-100 shadow-sm animate-pulse h-[280px] flex flex-col">
    <div className="flex justify-between items-start mb-6">
      <div className="h-6 bg-slate-200 rounded-lg w-20" /> {/* D-Day 배지 */}
      <div className="h-6 bg-slate-200 rounded-full w-8" /> {/* 북마크 버튼 */}
    </div>
    <div className="space-y-3 mb-6 flex-1">
      <div className="h-5 bg-slate-200 rounded w-1/3" /> {/* 회사명 */}
      <div className="h-7 bg-slate-200 rounded w-3/4" /> {/* 공고 제목 */}
      <div className="flex gap-2 pt-2">
        <div className="h-4 bg-slate-200 rounded w-16" /> {/* 태그 1 */}
        <div className="h-4 bg-slate-200 rounded w-16" /> {/* 태그 2 */}
      </div>
    </div>
    <div className="h-12 bg-slate-200 rounded-2xl w-full mt-auto" />{" "}
    {/* 버튼 영역 */}
  </div>
);

// [UI] 추천 검색어 목록
const RECOMMEND_KEYWORDS = [
  "개발자",
  "마케팅",
  "디자인",
  "신입",
  "인턴",
  "재택근무",
];

function JobPageContent() {
  const searchParams = useSearchParams();
  const initialKeyword = searchParams.get("keyword") || "";

  const [jobs, setJobs] = useState<JobData[]>([]);
  // [Fix] 초기 로딩 상태 true (스켈레톤 즉시 노출)
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  const [tempFilters, setTempFilters] = useState({
    keyword: initialKeyword,
    career: "",
    education: "",
  });

  const [activeFilters, setActiveFilters] = useState({
    keyword: initialKeyword,
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

      // 스켈레톤 확인용 지연 (0.5초)
      await new Promise((resolve) => setTimeout(resolve, 500));

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

  // 키워드 클릭 핸들러
  const handleKeywordClick = (keyword: string) => {
    const newFilters = { ...tempFilters, keyword };
    setTempFilters(newFilters);
    setActiveFilters(newFilters);
  };

  // 페이지네이션용 데이터 계산
  const totalPages = useMemo(
    () => Math.ceil(jobs.length / itemsPerPage) || 1,
    [jobs]
  );

  const currentJobs = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return jobs.slice(start, start + itemsPerPage);
  }, [jobs, currentPage]);

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
    <section className="py-16 bg-gray-50/30 overflow-hidden min-h-screen">
      <div className="w-full lg:max-w-7xl mx-auto px-4 lg:px-5">
        <div className="w-full shrink-0 space-y-5 relative mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-bold tracking-tight">
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
          <p className="text-slate-500 text-sm font-medium leading-relaxed pr-16 md:pr-0 max-w-[85%] md:max-w-none">
            사람인과 잡코리아의 실시간 데이터를 분석하여 가장 적합한 일자리를
            한눈에 보여드립니다.
          </p>

          <button
            onClick={() => {
              const reset = { keyword: "", career: "", education: "" };
              setTempFilters(reset);
              setActiveFilters(reset);
            }}
            className="flex items-center gap-2 p-3 md:px-6 md:py-3 bg-white border border-slate-200 rounded-full text-slate-600 hover:text-green-600 hover:border-green-200 transition-all shadow-sm text-sm font-bold group absolute right-0 bottom-0"
            title="필터 초기화 및 새로고침"
          >
            <RefreshCw
              size={18}
              className={
                loading
                  ? "animate-spin text-green-500"
                  : "group-hover:rotate-180 transition-transform duration-500"
              }
            />
            <span className="hidden md:inline">필터 초기화 및 새로고침</span>
          </button>
        </div>

        <div className="flex-1 min-w-0 space-y-8">
          {/* 검색/필터 바 */}
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
                  className="w-full pl-12 pr-4 py-4 bg-slate-50/50 border-none rounded-2xl focus:ring-2 focus:ring-green-500/20 focus:bg-white transition-all text-sm outline-none font-bold text-slate-700 placeholder:font-medium"
                />
                {tempFilters.keyword && (
                  <button
                    onClick={() =>
                      setTempFilters((prev) => ({ ...prev, keyword: "" }))
                    }
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-slate-300 hover:text-slate-500 rounded-full"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
              <div className="flex gap-3">
                <select
                  name="career"
                  value={tempFilters.career}
                  onChange={handleFilterChange}
                  className="px-4 py-4 bg-slate-50/50 border-none rounded-2xl text-sm font-bold text-slate-600 outline-none focus:ring-2 focus:ring-green-500/20 cursor-pointer min-w-[120px]"
                >
                  <option value="">경력전체</option>
                  <option value="신입">신입</option>
                  <option value="경력">경력</option>
                  <option value="무관">경력무관</option>
                </select>
                <button
                  onClick={handleSearch}
                  className="px-8 bg-slate-900 hover:bg-green-600 text-white rounded-2xl font-bold transition-all shadow-lg shadow-slate-200 hover:shadow-green-200 flex items-center gap-2 active:scale-95"
                >
                  <Filter size={18} />
                  검색
                </button>
              </div>
            </div>
          </div>

          {/* 결과 리스트 영역 */}
          {loading ? (
            // [New] 로딩 시 스켈레톤 UI 표시
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {Array(6)
                .fill(0)
                .map((_, i) => (
                  <JobSkeleton key={`skeleton-${i}`} />
                ))}
            </div>
          ) : jobs.length === 0 ? (
            // [New] 검색 결과 없음 (Empty State - 스티커 적용)
            <div className="py-24 flex flex-col items-center justify-center bg-white rounded-[2.5rem] border border-dashed border-slate-200 text-center px-4 relative overflow-hidden">
              {/* 배경 데코레이션 */}
              <div className="absolute top-10 left-10 text-6xl opacity-5 rotate-[-15deg] select-none pointer-events-none">
                💼
              </div>
              <div className="absolute bottom-10 right-10 text-6xl opacity-5 rotate-[15deg] select-none pointer-events-none">
                📄
              </div>

              {/* 스티커 이모지 */}
              <div className="relative mb-8 group cursor-default select-none">
                <div className="text-[80px] drop-shadow-2xl filter hover:scale-110 transition-transform duration-300 rotate-[-5deg] z-10 relative">
                  👨‍💼
                </div>
                <div className="absolute -top-6 -right-6 text-[50px] drop-shadow-xl rotate-[15deg] animate-bounce z-20">
                  ❓
                </div>
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-20 h-4 bg-black/10 blur-md rounded-full"></div>
              </div>

              <p className="text-slate-800 font-bold text-xl mb-2">
                '{activeFilters.keyword}' 검색 결과가 없습니다.
              </p>
              <p className="text-slate-400 text-sm mb-8">
                단어의 철자가 정확한지 확인하시거나, 다른 키워드로 검색해보세요.
              </p>

              <div className="flex flex-col items-center gap-4">
                <span className="text-xs font-bold text-slate-400 tracking-wider uppercase">
                  Recommend Keywords
                </span>
                <div className="flex flex-wrap justify-center gap-2">
                  {RECOMMEND_KEYWORDS.map((keyword) => (
                    <button
                      key={keyword}
                      onClick={() => handleKeywordClick(keyword)}
                      className="px-4 py-2 bg-slate-50 hover:bg-green-50 text-slate-600 hover:text-green-600 border border-slate-100 hover:border-green-200 rounded-full text-sm font-bold transition-all"
                    >
                      #{keyword}
                    </button>
                  ))}
                </div>
              </div>
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
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={(page) => setCurrentPage(page)}
                themeColor="green"
              />
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

// Suspense 감싸기 (useSearchParams 사용 시 필수)
export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50/30">
          <Loader2 className="animate-spin w-10 h-10 text-green-500" />
        </div>
      }
    >
      <JobPageContent />
    </Suspense>
  );
}
