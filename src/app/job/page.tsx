// 1. "use client": 이 파일이 브라우저에서 동작하는 클라이언트 컴포넌트임을 선언합니다.
// (useState, useEffect, 이벤트 핸들러 등을 사용하기 위해 필수입니다.)
"use client";

// --- [라이브러리 및 훅 임포트] ---
import { useSearchParams, useRouter, usePathname } from "next/navigation"; // URL 쿼리 파라미터(?keyword=...)를 읽어오는 훅
import React, {
  useEffect, // 데이터 로딩 등 부수 효과 처리
  useState, // 상태 관리
  useCallback, // 함수 캐싱 (성능 최적화)
  useMemo, // 값 캐싱 (성능 최적화)
  Suspense, // 비동기 컴포넌트 로딩 대기 (useSearchParams 사용 시 필요)
} from "react";
import api from "@/api/axios"; // 서버 통신을 위한 axios 인스턴스
// 화면에 쓰일 아이콘들을 가져옵니다.
import { Loader2, RefreshCw, Search, Filter, X } from "lucide-react";

// --- [하위 컴포넌트 및 데이터 임포트] ---
import JobCard from "@/components/jobTools/JobCard"; // 채용 공고 카드 컴포넌트
import JobDetailModal from "@/components/jobTools/JobDetailModal"; // 상세 보기 모달 컴포넌트
import Pagination from "@/components/common/Pagination"; // 페이지네이션 컴포넌트
import { JOB_DETAILS_DB } from "@/data/jobDetailData"; // 상세 정보 더미 데이터 (임시)
import { JobData, ApplyFormData, ApplyStep, DetailContent } from "@/types/job"; // 타입 정의

// --- [UI 컴포넌트: 스켈레톤 로딩] ---
// 데이터 로딩 중에 보여줄 '뼈대' UI입니다. 깜빡이는 효과(animate-pulse)로 로딩 중임을 알립니다.
const JobSkeleton = () => (
  <div className="bg-white p-7 rounded-[2rem] border border-slate-100 shadow-sm animate-pulse h-[280px] flex flex-col">
    <div className="flex justify-between items-start mb-6">
      <div className="h-6 bg-slate-200 rounded-lg w-20" />{" "}
      {/* D-Day 뱃지 자리 */}
      <div className="h-6 bg-slate-200 rounded-full w-8" />{" "}
      {/* 북마크 버튼 자리 */}
    </div>
    <div className="space-y-3 mb-6 flex-1">
      <div className="h-5 bg-slate-200 rounded w-1/3" /> {/* 회사명 자리 */}
      <div className="h-7 bg-slate-200 rounded w-3/4" /> {/* 공고 제목 자리 */}
      <div className="flex gap-2 pt-2">
        <div className="h-4 bg-slate-200 rounded w-16" /> {/* 태그 자리 1 */}
        <div className="h-4 bg-slate-200 rounded w-16" /> {/* 태그 자리 2 */}
      </div>
    </div>
    <div className="h-12 bg-slate-200 rounded-2xl w-full mt-auto" />{" "}
    {/* 버튼 자리 */}
  </div>
);

// --- [추천 검색어 목록 상수] ---
const RECOMMEND_KEYWORDS = [
  "개발자",
  "마케팅",
  "디자인",
  "신입",
  "인턴",
  "재택근무",
];

// --- [메인 콘텐츠 컴포넌트] ---
function JobPageContent() {
  // URL에서 쿼리 파라미터를 읽어옵니다. (예: /job?keyword=삼성전자 -> initialKeyword = "삼성전자")
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const initialKeyword = searchParams.get("keyword") || "";

  // --- [상태 관리 (State)] ---
  const [jobs, setJobs] = useState<JobData[]>([]); // 채용 공고 데이터 목록
  const [loading, setLoading] = useState(true); // 로딩 상태 (초기값 true -> 바로 스켈레톤 보임)

  const itemsPerPage = 9; // 한 페이지당 보여줄 아이템 수

  const currentKeyword = searchParams.get("keyword") || "";
  const currentCareer = searchParams.get("career") || "";
  const currentPage = Number(searchParams.get("page")) || 1;

  const [tempFilters, setTempFilters] = useState({
    keyword: currentKeyword,
    career: currentCareer,
    education: "",
  });

  // 모달 관련 상태
  const [isModalOpen, setIsModalOpen] = useState(false); // 모달 열림 여부
  const [detailLoading, setDetailLoading] = useState(false); // 모달 내부 데이터 로딩 여부
  const [selectedJob, setSelectedJob] = useState<JobData | null>(null); // 선택된 공고 정보
  const [applyStep, setApplyStep] = useState<ApplyStep>("NONE"); // 지원 단계 (NONE -> FORM -> DONE)
  const [applyForm, setApplyForm] = useState<ApplyFormData>({
    // 지원서 입력 데이터
    name: "",
    phone: "",
    message: "",
  });
  const [detailContent, setDetailContent] = useState<DetailContent | null>( // 상세 공고 내용
    null
  );

  // --- [데이터 로드 함수 (API 호출)] ---
  // activeFilters가 바뀔 때마다 실행되어 데이터를 새로 가져옵니다.
  const fetchJobs = useCallback(async () => {
    setLoading(true);
    try {
      // URL 값을 서버로 보냄
      const queryParams = new URLSearchParams();
      if (currentKeyword) queryParams.set("keyword", currentKeyword);
      if (currentCareer) queryParams.set("career", currentCareer);

      const res = await api.get(`/job/crawl?${queryParams.toString()}`);

      await new Promise((resolve) => setTimeout(resolve, 500));
      setJobs(res.data || []);
    } catch (e) {
      console.error("공고 로드 실패:", e);
      setJobs([]);
    } finally {
      setLoading(false);
    }
  }, [currentKeyword, currentCareer]);

  // 컴포넌트 마운트 시 또는 fetchJobs 변경 시 실행
  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  // --- [이벤트 핸들러] ---

  // 검색 버튼 클릭 시: 임시 필터를 활성 필터로 적용 -> API 호출 유발
  // 🟢 변경: 검색 버튼용
  const handleSearch = () => {
    const params = new URLSearchParams();
    if (tempFilters.keyword) params.set("keyword", tempFilters.keyword);
    if (tempFilters.career) params.set("career", tempFilters.career);
    params.set("page", "1"); // 검색하면 1페이지로 리셋
    router.push(`${pathname}?${params.toString()}`);
  };

  // 🟢 변경: 추천 키워드 클릭용
  const handleKeywordClick = (keyword: string) => {
    setTempFilters((prev) => ({ ...prev, keyword })); // 입력창 채우기
    const params = new URLSearchParams(searchParams);
    params.set("keyword", keyword);
    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`);
  };

  // 🟢 추가: 페이지 이동용
  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", String(page));
    router.push(`${pathname}?${params.toString()}`);
  };

  // 엔터키 입력 시 검색 실행
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSearch();
  };

  // 필터 입력값 변경 (검색창, 드롭다운)
  const handleFilterChange = (
    e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setTempFilters((prev) => ({ ...prev, [name]: value }));
  };

  // --- [페이지네이션 계산 (메모이제이션)] ---
  // 전체 페이지 수 계산
  const totalPages = useMemo(
    () => Math.ceil(jobs.length / itemsPerPage) || 1,
    [jobs]
  );

  // 현재 페이지에 보여줄 데이터 슬라이싱
  const currentJobs = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return jobs.slice(start, start + itemsPerPage);
  }, [jobs, currentPage]);

  // --- [모달 스크롤 제어] ---
  // 모달이 열리면 뒷배경 스크롤을 막고, 닫히면 풉니다.
  useEffect(() => {
    if (isModalOpen) {
      const scrollBarWidth =
        window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = "hidden"; // 스크롤 잠금
      document.body.style.paddingRight = `${scrollBarWidth}px`; // 스크롤바 너비만큼 패딩 추가 (화면 밀림 방지)
    } else {
      document.body.style.overflow = ""; // 잠금 해제
      document.body.style.paddingRight = "";
    }
  }, [isModalOpen]);

  // --- [공고 클릭 시 상세 모달 열기] ---
  const handleDetailClick = (job: JobData) => {
    setSelectedJob(job); // 선택된 공고 저장
    setIsModalOpen(true); // 모달 열기
    setDetailLoading(true); // 상세 로딩 시작
    setApplyStep("NONE"); // 지원 단계 초기화

    // (임시) 더미 데이터에서 상세 정보 매칭 (나중엔 API 호출로 변경 가능)
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
    setDetailLoading(false); // 상세 로딩 끝
  };

  // --- [지원하기 폼 제출] ---
  const handleApplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!applyForm.name || !applyForm.phone)
      return alert("필수 정보를 입력해주세요."); // 간단 유효성 검사
    try {
      // 지원 API 호출
      await api.post("/job/apply", {
        ...applyForm,
        companyName: selectedJob?.companyName,
        jobTitle: selectedJob?.title,
      });
      setApplyStep("DONE"); // 완료 화면으로 전환
    } catch (error) {
      setApplyStep("DONE"); // 에러가 나도 일단 완료 화면으로 (실무에선 에러 처리 필요)
    }
  };

  // --- [화면 렌더링] ---
  return (
    <section className="py-16 bg-gray-50/30 overflow-hidden min-h-screen">
      <div className="w-full lg:max-w-7xl mx-auto px-4 lg:px-5">
        {/* 1. 상단 헤더 섹션 (타이틀, 배지, 새로고침 버튼) */}
        <div className="w-full shrink-0 space-y-5 relative mb-12">
          {/* 큐레이션 배지 */}
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-bold tracking-tight">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            SMART CURATION
          </div>
          {/* 페이지 타이틀 */}
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

          {/* 필터 초기화(새로고침) 버튼 */}
          <button
            onClick={() => {
              setTempFilters({ keyword: "", career: "", education: "" });
              router.push(pathname);
            }}
            className="flex items-center gap-2 p-3 md:px-6 md:py-3 bg-white border border-slate-200 rounded-full text-slate-600 hover:text-green-600 hover:border-green-200 transition-all shadow-sm text-sm font-bold group absolute right-0 bottom-0"
            title="필터 초기화 및 새로고침"
          >
            <RefreshCw
              size={18}
              className={
                loading
                  ? "animate-spin text-green-500" // 로딩 중이면 아이콘 회전
                  : "group-hover:rotate-180 transition-transform duration-500"
              }
            />
            <span className="hidden md:inline">필터 초기화 및 새로고침</span>
          </button>
        </div>

        <div className="flex-1 min-w-0 space-y-8">
          {/* 2. 검색 및 필터 바 */}
          <div className="bg-white p-4 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100">
            <div className="flex flex-col md:flex-row gap-3">
              {/* 검색어 입력창 */}
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
                {/* 검색어 삭제 버튼 (입력값이 있을 때만 표시) */}
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
              {/* 경력 선택 드롭다운 & 검색 버튼 */}
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

          {/* 3. 공고 목록 표시 영역 */}
          {loading ? (
            // (1) 로딩 중일 때: 스켈레톤 6개 표시
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {Array(6)
                .fill(0)
                .map((_, i) => (
                  <JobSkeleton key={`skeleton-${i}`} />
                ))}
            </div>
          ) : jobs.length === 0 ? (
            // (2) 데이터가 없을 때: Empty State UI 표시
            <div className="py-24 flex flex-col items-center justify-center bg-white rounded-[2.5rem] border border-dashed border-slate-200 text-center px-4 relative overflow-hidden">
              {/* 배경 장식 이모지들 */}
              <div className="absolute top-10 left-10 text-6xl opacity-5 rotate-[-15deg] select-none pointer-events-none">
                💼
              </div>
              <div className="absolute bottom-10 right-10 text-6xl opacity-5 rotate-[15deg] select-none pointer-events-none">
                📄
              </div>

              {/* 중앙 메인 아이콘 */}
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
                '{currentKeyword}' 검색 결과가 없습니다.
              </p>
              <p className="text-slate-400 text-sm mb-8">
                단어의 철자가 정확한지 확인하시거나, 다른 키워드로 검색해보세요.
              </p>

              {/* 추천 검색어 버튼들 */}
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
            // (3) 데이터가 있을 때: 공고 카드 그리드 및 페이지네이션 표시
            <div className="space-y-10">
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {currentJobs.map((job, i) => (
                  <div
                    key={`${job.companyName}-${i}`}
                    className="transform hover:scale-[1.02] transition-transform duration-300"
                  >
                    {/* 카드 클릭 시 상세 모달 오픈 */}
                    <JobCard job={job} onClick={handleDetailClick} />
                  </div>
                ))}
              </div>

              {/* 페이지네이션 */}
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                themeColor="green"
              />
            </div>
          )}
        </div>
      </div>

      {/* 상세 보기 모달 (포탈처럼 동작) */}
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

// --- [최상위 페이지 컴포넌트] ---
// useSearchParams를 쓰기 위해 Suspense로 감싸줍니다. (빌드 에러 방지)
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

// 1. 페이지 진입 및 초기 데이터 로드 (Mount)

// 사용자가 페이지에 접속합니다. loading = true이므로 화면에는 깜빡이는 스켈레톤(JobSkeleton) 6개가 먼저 보입니다.

// 동시에 useEffect가 실행되어 fetchJobs()를 호출, 서버에 공고 데이터를 요청합니다.

// 데이터가 도착하면 setJobs로 저장하고, 스켈레톤을 끄고 실제 채용 공고 카드들을 보여줍니다.

// 2. 검색 및 필터링 (Search Interaction)

// 사용자가 검색창에 "마케팅"을 입력하고 [검색] 버튼을 누릅니다.

// handleSearch가 실행되어 activeFilters 상태가 업데이트됩니다.

// useEffect가 필터 변경을 감지하고, 다시 fetchJobs()를 호출합니다. 이번엔 ?keyword=마케팅 파라미터를 달고 요청합니다.

// 새로운 데이터로 목록이 갱신됩니다. 만약 결과가 없으면 **Empty State(스티커 화면)**를 보여줍니다.

// 3. 상세 확인 (Detail Modal)

// 목록에서 관심 있는 공고를 클릭합니다. handleDetailClick이 실행됩니다.

// isModalOpen = true가 되면서 화면 위에 모달 창이 뜹니다. 뒷배경은 스크롤되지 않도록 막힙니다.

// 모달 내부에서 JOB_DETAILS_DB를 뒤져 상세 정보를 찾아 보여줍니다.

// 4. 지원하기 (Apply Flow)

// 모달 안에서 [지원하기] 버튼을 누르면 ApplyForm이 나옵니다.

// 이름과 연락처를 쓰고 제출하면 handleApplySubmit이 실행되어 서버로 지원 정보를 보냅니다.

// 성공하면 applyStep이 "DONE"으로 바뀌며 "지원이 완료되었습니다!" 화면이 뜹니다.
