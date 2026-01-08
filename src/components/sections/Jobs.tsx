// 1. "use client": 이 파일이 브라우저에서 실행되는 클라이언트 컴포넌트임을 선언합니다.
// (Swiper 라이브러리와 클릭 이벤트 등을 사용하기 때문에 필수입니다.)
"use client";

// --- [라이브러리 및 컴포넌트 임포트] ---
import Link from "next/link"; // 페이지 이동을 위한 Next.js 링크 컴포넌트

// Swiper(슬라이더 라이브러리) 관련 모듈 임포트
import { Swiper, SwiperSlide } from "swiper/react"; // 슬라이더 본체와 개별 슬라이드
import { Navigation, Mousewheel } from "swiper/modules"; // 네비게이션 화살표, 마우스 휠 기능 모듈
import "swiper/css"; // Swiper 기본 스타일
import "swiper/css/navigation"; // 네비게이션 버튼 스타일

// 커스텀 훅 임포트 (로직 분리)
import { useJobs } from "@/hooks/main/useJobs"; // 채용 공고 데이터를 가져오는 훅
import { useJobModal } from "@/hooks/main/useJobModal"; // 상세 보기 모달을 제어하는 훅

// 하위 컴포넌트 임포트
import JobCard from "@/components/jobTools/JobCard"; // 개별 공고 카드 디자인
import JobDetailModal from "@/components/jobTools/JobDetailModal"; // 공고 상세 모달

// 아이콘 및 애니메이션 라이브러리
import { Loader2, ArrowRight } from "lucide-react"; // 로딩 아이콘, 화살표 아이콘
import { motion } from "framer-motion"; // 부드러운 애니메이션 효과

// --- [메인 컴포넌트 정의] ---
export default function Jobs() {
  // 1. 커스텀 훅을 사용해 데이터와 로딩 상태를 가져옵니다.
  // useJobs 내부에서 API 호출(fetch)이 일어나고, 그 결과가 jobs에 담깁니다.
  const { jobs, loading } = useJobs();

  // 2. 모달 제어에 필요한 상태와 함수들을 가져옵니다.
  // openModal: 모달 열기, handleApplySubmit: 지원하기 처리 등 복잡한 로직을 훅으로 뺐습니다.
  const {
    openModal,
    handleApplySubmit,
    isModalOpen,
    setIsModalOpen,
    ...modalProps // 나머지 잡다한 props들은 한꺼번에 묶어서 받습니다.
  } = useJobModal();

  // --- [화면 렌더링 (JSX)] ---
  return (
    // 전체 섹션 컨테이너: 회색 배경, 위아래 여백
    <section className="py-12 bg-gray-50/20 overflow-hidden">
      <div className="w-full mx-auto px-4 md:max-w-7xl lg:px-8">
        {/* 좌우 배치를 위한 Flex 컨테이너 (모바일에선 위아래, PC에선 좌우) */}
        <div className="flex flex-col lg:flex-row gap-10">
          {/* 1. 좌측 타이틀 섹션 (30% 너비) */}
          <div className="w-full lg:w-[30%] shrink-0 space-y-4">
            {/* 'LIVE UPDATE' 깜빡이는 뱃지 */}
            <LiveBadge />

            {/* 메인 타이틀 */}
            <h2 className="text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
              대전 {/* 그라데이션 텍스트 효과 */}
              <span className="text-transparent bg-clip-text bg-linear-to-r from-green-600 to-emerald-500">
                채용 공고
              </span>
              <br />
              최신 업데이트
            </h2>

            {/* 설명 문구 */}
            <p className="text-slate-500 text-sm font-medium leading-relaxed">
              실시간으로 업데이트되는 대전 지역의 엄선된 최신 공고 20개를
              확인하세요.
            </p>

            {/* '전체 공고 보기' 버튼 (클릭 시 /job 페이지로 이동) */}
            <Link href="/job">
              <motion.div
                whileHover="hover" // 마우스를 올렸을 때 'hover' 애니메이션 실행
                className="inline-flex px-8 py-3.5 text-white bg-slate-900 hover:bg-green-600 transition-colors duration-300 rounded-full font-bold shadow-lg shadow-slate-100 items-center gap-2 cursor-pointer"
              >
                전체 공고 보기
                {/* 화살표 아이콘 애니메이션 (오른쪽으로 살짝 이동) */}
                <motion.div
                  variants={{ hover: { x: 5 } }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  <ArrowRight className="w-4 h-4" />
                </motion.div>
              </motion.div>
            </Link>
          </div>

          {/* 2. 우측 슬라이더 섹션 (75% 너비) */}
          <div className="w-full lg:w-[75%] min-w-0 relative">
            {loading ? (
              // (1) 로딩 중일 때: 로딩 박스 표시
              <LoadingState />
            ) : (
              // (2) 데이터가 있을 때: Swiper 슬라이더 표시
              <Swiper
                modules={[Navigation, Mousewheel]} // 사용할 모듈 등록
                spaceBetween={20} // 슬라이드 간 간격 (20px)
                slidesPerView={1.2} // 한 번에 보여줄 슬라이드 개수 (기본 1.2개 -> 옆에 살짝 보임)
                mousewheel={{ forceToAxis: true }} // 마우스 휠로 가로 스크롤 가능하게 설정
                breakpoints={{
                  // 화면 크기에 따른 반응형 설정
                  640: { slidesPerView: 2.2 }, // 태블릿: 2.2개
                  1024: { slidesPerView: 3 }, // PC: 3개
                }}
                className="job-swiper"
              >
                {/* 데이터 개수만큼 슬라이드 생성 */}
                {jobs.map((job, i) => (
                  <SwiperSlide key={`${job.url}-${i}`}>
                    {/* 공고 카드 컴포넌트 (클릭 시 모달 열림) */}
                    <JobCard job={job} onClick={() => openModal(job)} />
                  </SwiperSlide>
                ))}
              </Swiper>
            )}

            {/* 하단 안내 문구 (로딩 끝났고 데이터 있을 때만 표시) */}
            {!loading && jobs.length > 0 && (
              <p className="text-center text-[11px] text-gray-400 mt-4 italic">
                상위 20개의 최신 공고가 표시됩니다.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* 상세 보기 모달 (포탈처럼 동작, 평소엔 숨겨져 있음) */}
      <JobDetailModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        handleApplySubmit={handleApplySubmit}
        {...modalProps} // 나머지 props 전달
      />
    </section>
  );
}

// --- [보조 UI 컴포넌트: 라이브 뱃지] ---
const LiveBadge = () => (
  <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-bold tracking-tight">
    {/* 깜빡이는 초록 점 효과 */}
    <span className="relative flex h-2 w-2">
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
      <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
    </span>
    LIVE UPDATE
  </div>
);

// --- [보조 UI 컴포넌트: 로딩 상태] ---
const LoadingState = () => (
  <div className="h-[360px] flex flex-col items-center justify-center bg-white rounded-4xl border border-gray-100 shadow-sm">
    <Loader2 className="animate-spin text-green-500 w-10 h-10 mb-2" />
    <p className="text-gray-400 font-medium">채용 정보를 불러오는 중...</p>
  </div>
);

// 1. 초기 로드 및 데이터 요청 (Initial Load)

// 사용자가 메인 페이지에 들어옵니다. 스크롤을 내려 이 Jobs 섹션이 화면에 보입니다.
// 컴포넌트가 실행되면서 useJobs() 훅이 작동해 서버에 "최신 공고 20개만 줘"라고 요청을 보냅니다.
// 데이터가 오기 전까지 loading은 true이므로, 우측 영역에는 슬라이더 대신 **LoadingState (로딩 박스)**가 표시됩니다.

// 2. 데이터 수신 및 슬라이더 렌더링 (Data Fetch & Render)

// 서버에서 데이터가 도착하면 jobs 배열에 데이터가 담기고 loading이 false가 됩니다.
// 로딩 박스가 사라지고, 그 자리에 Swiper 슬라이더가 나타납니다.
// jobs.map(...)이 실행되어 각 공고 데이터가 JobCard로 변환되어 슬라이드 한 칸씩 차지하게 됩니다.

// 3. 사용자 인터랙션 (Interaction)

// 슬라이드 넘기기: 사용자가 마우스로 드래그하거나 휠을 돌려 옆으로 슬라이드를 넘겨봅니다. Mousewheel 모듈 덕분에 부드럽게 넘어갑니다.
// 상세 보기: 마음에 드는 공고 카드를 클릭합니다. openModal(job)이 실행됩니다.
// 전체 보기: "더 많은 공고를 보고 싶어" 하며 좌측의 [전체 공고 보기] 버튼을 클릭합니다. /job 페이지로 이동합니다.

// 4. 모달 열림 (Modal Open)

// 카드를 클릭하면 isModalOpen이 true가 되면서 화면 위에 **JobDetailModal**이 뜹니다.
// 이 모달 안에서 상세 내용을 확인하고 '지원하기'까지 할 수 있습니다. (모달 로직은 useJobModal 훅에서 관리)
