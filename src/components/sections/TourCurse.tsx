// 1. "use client": 이 파일은 사용자의 브라우저에서 실행되는 클라이언트 컴포넌트입니다.
// (슬라이더, 탭 전환, 애니메이션 등 동적인 기능이 많기 때문입니다.)
"use client";

// --- [라이브러리 및 훅 임포트] ---
import { useState, useMemo } from "react"; // 상태 관리(useState)와 연산 최적화(useMemo) 훅
import { tourCurseData } from "@/data/tourCurseData"; // 관광 코스 데이터(JSON 형태)를 가져옵니다.
// Headless UI 라이브러리에서 탭(Tab) 관련 기능을 가져옵니다. (디자인 없는 기능 위주 라이브러리)
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from "@headlessui/react";
// Swiper: 터치 슬라이더 라이브러리입니다.
import { Swiper, SwiperSlide } from "swiper/react";
// Swiper 모듈: 자동재생, 페이지네이션, 커버플로우(3D 효과)
import { Autoplay, Pagination, EffectCoverflow } from "swiper/modules";
import { ArrowRight } from "lucide-react"; // 오른쪽 화살표 아이콘
import Link from "next/link"; // 페이지 이동 링크
import { motion } from "framer-motion"; // 부드러운 움직임을 위한 애니메이션 라이브러리
import TourStopCard from "@/components/sections/tour/TourStopCard"; // 개별 장소 카드 컴포넌트

// Swiper에 필요한 스타일 시트들을 불러옵니다.
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/effect-coverflow";

// ==================================================================
// [Main Component] 관광 코스 섹션 (부모 컴포넌트)
// ==================================================================
export default function TourCurse() {
  // 1. 데이터 로드: 파일에서 전체 투어 목록을 가져옵니다.
  const tours = tourCurseData.tours;

  // 2. 상태 관리: 현재 몇 번째 탭(코스)을 보고 있는지 저장합니다. (0부터 시작)
  const [selectedIndex, setSelectedIndex] = useState(0);

  // 3. 탭 전환 함수: 다음 코스로 넘어가는 기능을 합니다.
  // (현재 인덱스 + 1)을 전체 길이로 나눈 나머지(%)를 구해서, 마지막 코스 다음엔 다시 0번으로 돌아오게 합니다.
  const goToNextTab = () => {
    setSelectedIndex((prev) => (prev + 1) % tours.length);
  };

  // 4. [Render] 화면 그리기
  return (
    // section: 전체 배경은 아주 어두운 남색(#020617), 위아래 여백(py-24), 넘치는 건 숨김
    <section className="bg-[#020617] py-24 relative overflow-hidden">
      {/* --- [Background Decor] 배경 장식 (빛뭉치 효과) --- */}
      {/* 오른쪽 위: 초록색 빛 */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-green-500/10 rounded-full blur-[120px] -z-10" />
      {/* 왼쪽 아래: 파란색 빛 */}
      <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-blue-500/10 rounded-full blur-[100px] -z-10" />

      {/* 중앙 정렬 컨테이너 */}
      <div className="max-w-7xl mx-auto px-6">
        {/* --- [Tab Logic] 탭 그룹 시작 --- */}
        {/* selectedIndex: 현재 선택된 탭 번호 / onChange: 탭이 바뀌면 상태 업데이트 */}
        <TabGroup selectedIndex={selectedIndex} onChange={setSelectedIndex}>
          <TabPanels>
            {/* 데이터(tours)를 돌면서 각 코스에 대한 패널을 만듭니다. */}
            {tours.map((tour, index) => (
              <TabPanel
                key={index}
                // 패널이 나타날 때 부드럽게(opacity, translate) 등장하는 효과를 줍니다.
                className="focus:outline-none transition-all duration-700 data-closed:opacity-0 data-closed:translate-y-4"
              >
                {/* 실제 내용은 너무 복잡하니까 별도 컴포넌트(TourContent)로 분리해서 그립니다. */}
                {/* onNextTab 함수를 자식에게 넘겨줘서, 슬라이드가 끝나면 부모의 탭을 바꾸게 합니다. */}
                <TourContent
                  tour={tour} // 현재 보여줄 코스 데이터
                  allTours={tours} // 전체 코스 목록 (왼쪽 탭 리스트용)
                  onNextTab={goToNextTab} // 다음 탭으로 넘기는 함수
                />
              </TabPanel>
            ))}
          </TabPanels>
        </TabGroup>
      </div>
    </section>
  );
}

// ==================================================================
// [Sub Component] 실제 코스 내용을 그리는 컴포넌트
// ==================================================================
function TourContent({ tour, allTours, onNextTab }: any) {
  // 1. [Data Flattening] 데이터 평탄화 작업 (중요!)
  // 원본 데이터는 [1일차: {장소A, 장소B}, 2일차: {장소C}] 이런 식의 계층 구조입니다.
  // 슬라이더에 넣으려면 [장소A, 장소B, 장소C] 처럼 1차원 배열로 펴야 합니다.
  // useMemo를 써서 tour 데이터가 바뀔 때만 이 작업을 수행합니다.
  const allStops = useMemo(
    () =>
      tour.tour.flatMap(
        (
          dayRoute: any // flatMap: 배열을 매핑하면서 동시에 껍질을 한 겹 벗깁니다.
        ) =>
          dayRoute.detail.map((stop: any) => ({
            ...stop, // 장소 정보 복사
            day: dayRoute.day.toUpperCase(), // "1day" 같은 정보를 대문자로 변환해서 추가
            courseNumber: tour.number, // 몇 번째 코스인지 정보 추가
          }))
      ),
    [tour]
  );

  return (
    // 전체 레이아웃: 모바일은 세로 배치(flex-col), PC(lg)는 가로 배치(flex-row)
    <div className="flex gap-10 lg:gap-16 flex-col lg:flex-row items-center">
      {/* --- [Left Section] 텍스트 정보 및 탭 리스트 --- */}
      <div className="w-full lg:w-[35%] space-y-8">
        {/* 타이틀 그룹 */}
        <div className="space-y-5">
          {/* 뱃지 컴포넌트 */}
          <Badge text="EXPLORE DAEJEON" />

          {/* 메인 타이틀 */}
          <h2 className="text-3xl lg:text-4xl font-extrabold text-white leading-[1.1] tracking-tight">
            {tour.title}
          </h2>

          {/* 서브 설명 (줄바꿈 허용 break-keep) */}
          <p className="text-slate-400 text-base lg:text-lg leading-relaxed font-light break-keep">
            {tour.subTitle}
          </p>
        </div>

        {/* 탭 리스트 (PC에서만 보임 hidden lg:flex) */}
        {/* 사용자가 직접 클릭해서 다른 코스로 넘어갈 수 있게 해줍니다. */}
        <TabList className="hidden lg:flex flex-col gap-4 border-l border-white/10 pl-6">
          {allTours.map((t: any, idx: number) => (
            <Tab
              key={idx}
              // 선택된 탭은 초록색+확대, 안 된 탭은 회색으로 스타일링
              className={({ selected }) =>
                `text-left text-sm transition-all duration-500 focus:outline-none ${
                  selected
                    ? "text-green-500 font-bold scale-110 origin-left"
                    : "text-slate-500 hover:text-slate-300"
                }`
              }
            >
              {t.title}
            </Tab>
          ))}
        </TabList>

        {/* 전체 코스 보기 버튼 */}
        <Link href="/tour/route">
          <motion.div
            whileHover="hover" // 마우스 올렸을 때 애니메이션 정의
            className="inline-flex items-center gap-2 text-white font-bold bg-white/5 hover:bg-green-600 px-6 py-3 rounded-full transition-colors border border-white/10 cursor-pointer"
          >
            전체 코스보기
            {/* 화살표 애니메이션: 마우스 올리면 오른쪽으로 5px 이동 */}
            <motion.div
              variants={{ hover: { x: 5 } }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <ArrowRight className="w-4 h-4" />
            </motion.div>
          </motion.div>
        </Link>
      </div>

      {/* --- [Right Section] Swiper 슬라이더 --- */}
      <div className="w-full lg:w-[65%] relative">
        <Swiper
          effect="coverflow" // 3D 카드 효과 적용
          grabCursor // 마우스 커서가 잡는 손모양으로 변함
          centeredSlides // 현재 슬라이드를 가운데 정렬
          slidesPerView={1.2} // 한 번에 보여줄 슬라이드 개수 (1.2개 -> 옆에게 살짝 보임)
          // 커버플로우 3D 효과 세부 설정
          coverflowEffect={{
            rotate: 0, // 회전 안 함
            stretch: 0, // 당기기 없음
            depth: 100, // 깊이감 (원근감)
            modifier: 2.5, // 효과 강도
            slideShadows: false, // 그림자 끔 (깔끔하게)
          }}
          autoplay={{ delay: 4000, disableOnInteraction: false }} // 4초마다 자동 넘김
          breakpoints={{ 768: { slidesPerView: 2 } }} // 태블릿 이상에선 2개씩 보임
          pagination={{ clickable: true }} // 하단 점박이 네비게이션 사용
          // [핵심] 마지막 슬라이드에 도달하면 0.5초 뒤에 다음 탭(코스)으로 자동 전환!
          onSlideChange={(swiper) => swiper.isEnd && setTimeout(onNextTab, 500)}
          modules={[Autoplay, Pagination, EffectCoverflow]} // 사용할 모듈 등록
          className="tour-swiper pb-14!" // 하단 패딩 확보 (페이지네이션 공간)
        >
          {/* 평탄화한 데이터(allStops)를 돌면서 카드를 만듭니다. */}
          {allStops.map((stop: any, idx: number) => (
            <SwiperSlide
              key={idx}
              className="rounded-3xl overflow-hidden shadow-2xl border border-white/5"
            >
              {/* 개별 장소 카드 컴포넌트 */}
              <TourStopCard stop={stop} />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
}

// ==================================================================
// [Sub Component] 뱃지 컴포넌트 (EXPLORE DAEJEON)
// ==================================================================
const Badge = ({ text }: { text: string }) => (
  <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-500/10 border border-green-500/20 text-green-400 rounded-full text-xs font-bold tracking-tight">
    {/* 반짝이는 점 애니메이션 */}
    <span className="relative flex h-2 w-2">
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
      <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
    </span>
    {text}
  </div>
);

// 진입 (Atmosphere):

// 사용자가 스크롤을 내리다가 검은색 배경(bg-[#020617])의 섹션을 만납니다.

// 배경에는 초록색, 파란색 빛뭉치(Blur)가 은은하게 깔려있어 고급스러운 느낌을 줍니다.

// 데이터 준비 (TabGroup):

// tourCurseData에서 추천 코스 목록(예: 1. 힐링 코스, 2. 과학 코스...)을 가져옵니다.

// 처음엔 0번(첫 번째) 코스를 보여줍니다.

// 데이터 가공 (useMemo):

// 코스 데이터는 보통 "1일차: [장소A, 장소B]", "2일차: [장소C]" 처럼 나뉘어 있습니다.

// 하지만 슬라이더에선 1일차, 2일차 구분 없이 쭉 보여줘야 하므로, flatMap을 써서 [장소A, 장소B, 장소C] 로 평평하게 만듭니다.

// 화면 표시:

// 왼쪽: "과학 도시 대전 탐방" 같은 제목과 설명이 나옵니다. PC 화면에서는 다른 코스로 바로 갈 수 있는 탭 메뉴도 보입니다.

// 오른쪽: 장소 카드들이 앨범 커버 넘기듯(EffectCoverflow) 입체적으로 슬라이드 됩니다.

// 자동 넘김 로직:

// 슬라이드가 자동으로 넘어갑니다.

// 만약 첫 번째 코스의 슬라이드가 끝까지 다다르면? onSlideChange 이벤트가 발동해서 자동으로 다음 코스(탭)로 넘어갑니다.
