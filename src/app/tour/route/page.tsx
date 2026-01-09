// 1. Next.js에서 페이지 이동을 위해 사용하는 Link 컴포넌트입니다.
// <a> 태그와 비슷하지만, 페이지를 새로고침하지 않고 부드럽게 이동시켜 주는 역할을 합니다.
import Link from "next/link";

// 2. 관광 코스 데이터(JSON 형태)를 가져옵니다.
// 이 파일 안에 '1박2일 코스', '과학 코스' 등 7가지 코스에 대한 정보(제목, 설명, 이미지 경로 등)가 들어있습니다.
import { tourCurseData } from "@/data/tourCurseData";

// 3. 화면을 예쁘게 꾸며줄 아이콘들을 가져옵니다.
// ArrowRight: 화살표, MapPin: 지도 핀 모양, Sparkles: 반짝임 효과
import { ArrowRight, MapPin, Sparkles } from "lucide-react";

// --- [메인 페이지 컴포넌트] ---
// 이 함수가 실행되어 화면을 그립니다.
export default function TourRouteSubPage() {
  return (
    // 1. 전체 배경 설정
    // bg-[#f8f9fa]: 아주 연한 회색 배경을 깔아 눈을 편안하게 합니다.
    // min-h-screen: 내용이 적어도 화면 꽉 차게 높이를 잡습니다.
    <div className="w-full bg-[#f8f9fa] min-h-screen pb-24">
      {/* 2. 콘텐츠 컨테이너 */}
      {/* // max-w-7xl: 내용이 너무 퍼지지 않게 최대 너비를 제한합니다. // mx-auto:
      화면 중앙에 오도록 합니다. */}
      <div className="w-full lg:max-w-7xl mx-auto px-4 lg:px-5 pt-10">
        {/* 3. 상단 헤더 영역 (제목과 설명) */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <div className="space-y-5">
            {/* (1) 뱃지: "07 Special Courses" */}
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-bold tracking-tight">
              {/* 반짝이는 초록색 점 애니메이션 */}
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              07 Special Courses
            </div>

            {/* (2) 메인 타이틀 */}
            <h2 className="text-3xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.1]">
              대전의 {/* 그라데이션 텍스트 효과 (초록색 계열) */}
              <span className="text-transparent bg-clip-text bg-linear-to-r from-green-600 to-green-400">
                다채로운 매력을
              </span>
              <br />
              발견해보세요.
            </h2>

            {/* (3) 서브 설명 */}
            <p className="text-slate-500 text-sm font-medium leading-relaxed max-w-2xl">
              취향에 맞춰 큐레이션된 7가지 코스가 당신의 완벽한 주말을
              책임집니다.
            </p>
          </div>
        </div>
        {/* 4. 코스 리스트 그리드 (카드 목록) */}
        {/* // grid-cols-1: 모바일에서는 1줄에 1개 // md:grid-cols-2: 태블릿에서는
        2개 // lg:grid-cols-3: PC에서는 3개씩 보여줍니다. */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {/* 데이터 파일에 있는 코스 목록(tours)을 하나씩 꺼내서 카드로 만듭니다. */}
          {tourCurseData.tours.map((tour) => (
            <Link
              href={`/tour/route/${tour.number}`} // 클릭하면 상세 페이지(/tour/route/1 등)로 이동
              key={tour.number} // 리액트가 리스트를 관리하기 위한 고유 키
              // 카드 디자인: 둥근 모서리, 그림자, 마우스 올리면(hover) 살짝 떠오르는 효과
              className="group bg-white rounded-4xl overflow-hidden border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] transition-all duration-500 hover:-translate-y-2 flex flex-col"
            >
              {/* (A) 이미지 영역 */}
              <div className="relative aspect-[1.1/1] overflow-hidden">
                <img
                  src={tour.src} // 코스 대표 이미지
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" // 호버 시 이미지 확대
                  alt={tour.title}
                />
                {/* 왼쪽 상단 코스 번호 라벨 */}
                <div className="absolute top-4 left-4">
                  <span className="bg-white/90 backdrop-blur-md text-slate-900 text-[11px] font-bold px-3 py-1 rounded-full shadow-sm">
                    COURSE 0{tour.number}
                  </span>
                </div>
              </div>

              {/* (B) 텍스트 내용 영역 */}
              <div className="p-7 flex flex-col flex-1">
                {/* 작은 라벨 */}
                <div className="flex items-center gap-1 text-green-600 text-[10px] font-bold uppercase tracking-wider mb-3">
                  <MapPin size={12} /> Daejeon Tour
                </div>
                {/* 코스 제목 */}
                <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-green-600 transition-colors">
                  {tour.title}
                </h3>
                {/* 코스 설명 (두 줄 넘어가면 ... 처리) */}
                <p className="text-slate-500 text-sm leading-relaxed mb-8 line-clamp-2">
                  {tour.subTitle}
                </p>

                {/* 하단 정보 및 버튼 */}
                <div className="mt-auto flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400">
                    1박 2일 일정
                  </span>
                  {/* 화살표 버튼 (호버 시 초록색으로 변함) */}
                  <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-900 group-hover:bg-green-600 group-hover:text-white transition-all">
                    <ArrowRight size={18} />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

// 1. 페이지 진입 및 데이터 로드 (Render)

// 사용자가 /tour/route 페이지에 들어옵니다.

// tourCurseData 파일에서 미리 준비된 7개의 코스 데이터를 불러옵니다.

// 화면에는 **"대전의 다채로운 매력을 발견해보세요"**라는 큰 제목과 함께, 7개의 카드가 그리드 형태로 예쁘게 정렬되어 나타납니다.

// 2. 사용자 탐색 (Interaction)

// 사용자가 마우스를 첫 번째 카드 "Course 01" 위에 올립니다.

// 카드가 살짝 위로 떠오르고(hover:-translate-y-2), 이미지가 미세하게 확대(group-hover:scale-105)되면서 "나를 눌러봐!"라고 시각적인 신호를 줍니다. 화살표 버튼도 초록색으로 바뀝니다.

// 3. 상세 페이지 이동 (Navigation)

// 사용자가 카드를 클릭합니다.

// <Link> 컴포넌트가 작동하여 /tour/route/1 페이지로 이동합니다.

// 이동한 페이지에서는 Course 01에 대한 자세한 1박 2일 일정과 지도를 볼 수 있게 됩니다.
