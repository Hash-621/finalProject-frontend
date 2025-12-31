import Link from "next/link";
import { tourCurseData } from "@/data/tourCurseData";
import { ArrowRight, MapPin, Sparkles } from "lucide-react";

export default function TourRouteSubPage() {
  return (
    <div className="w-full bg-[#f8f9fa] min-h-screen pb-24">
      <div className="w-full lg:max-w-7xl mx-auto px-4 lg:px-5 pt-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <div className="space-y-5">
            {/* 뱃지 섹션 */}
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-bold tracking-tight">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              07 Special Courses
            </div>

            <h2 className="text-3xl lg:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-[1.1]">
              대전의{" "}
              <span className="text-transparent bg-clip-text bg-linear-to-r from-green-600 to-green-400">
                다채로운 매력을
              </span>
              <br />
              발견해보세요.
            </h2>

            <p className="text-slate-500 text-sm font-medium leading-relaxed max-w-2xl">
              취향에 맞춰 큐레이션된 7가지 코스가 당신의 완벽한 주말을
              책임집니다.
            </p>
          </div>
        </div>

        {/* 그리드 레이아웃: 촘촘하고 균형 잡힌 배열 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {tourCurseData.tours.map((tour) => (
            <Link
              href={`/tour/route/${tour.number}`}
              key={tour.number}
              className="group bg-white rounded-4xl overflow-hidden border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] transition-all duration-500 hover:-translate-y-2 flex flex-col"
            >
              {/* 이미지 영역: 고정 비율로 정갈하게 */}
              <div className="relative aspect-[1.1/1] overflow-hidden">
                <img
                  src={tour.src}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  alt={tour.title}
                />
                <div className="absolute top-4 left-4">
                  <span className="bg-white/90 backdrop-blur-md text-slate-900 text-[11px] font-bold px-3 py-1 rounded-full shadow-sm">
                    COURSE 0{tour.number}
                  </span>
                </div>
              </div>

              {/* 텍스트 영역: 여백과 디테일 */}
              <div className="p-7 flex flex-col flex-1">
                <div className="flex items-center gap-1 text-green-600 text-[10px] font-bold uppercase tracking-wider mb-3">
                  <MapPin size={12} /> Daejeon Tour
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-green-600 transition-colors">
                  {tour.title}
                </h3>
                <p className="text-slate-500 text-sm leading-relaxed mb-8 line-clamp-2">
                  {tour.subTitle}
                </p>

                {/* 하단 버튼 스타일 */}
                <div className="mt-auto flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400">
                    1박 2일 일정
                  </span>
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
