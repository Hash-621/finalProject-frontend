import React from "react";
import { tourCurseData } from "@/data/tourCurseData";
import { notFound } from "next/navigation";
import { MapPin, ArrowLeft, ChevronRight } from "lucide-react";
import Link from "next/link";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function TourRouteDetailPage({ params }: Props) {
  const resolvedParams = await params;
  const id = resolvedParams.id;
  const data = tourCurseData.tours.find((t) => String(t.number) === id);

  if (!data) return notFound();

  return (
    <div className="w-full bg-white min-h-screen pb-40 text-slate-900">
      {/* 뒤로가기 버튼 */}
      <div className="max-w-7xl mx-auto px-6 pt-10">
        <Link
          href="/tour/route"
          className="inline-flex items-center gap-2 text-slate-400 hover:text-green-600 transition-colors font-bold group"
        >
          <ArrowLeft
            size={20}
            className="group-hover:-translate-x-1 transition-transform"
          />
          Back to List
        </Link>
      </div>

      {/* 1. 헤더 섹션 (좌측 정렬) */}
      <header className="max-w-7xl mx-auto px-6 mt-12 mb-16">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="flex-1">
            <span className="inline-block bg-green-600 text-white text-[10px] font-black px-3 py-1 rounded-sm mb-4 tracking-[0.2em] uppercase">
              Course 0{data.number}
            </span>
            <h1 className="text-4xl md:text-6xl font-black leading-tight tracking-tighter mb-6">
              {data.title}
            </h1>
            <p className="max-w-2xl text-slate-500 text-lg font-medium leading-relaxed break-keep">
              {data.text}
            </p>
          </div>

          {/* 코스 대표 이미지 (전체 다 보이게) */}
          <div className="w-full md:w-[450px] aspect-4/3 rounded-3xl overflow-hidden shadow-2xl border-12 border-slate-50">
            <img
              src={data.src}
              className="w-full h-full object-cover"
              alt="Course Cover"
            />
          </div>
        </div>
      </header>

      {/* 2. 타임라인 섹션 */}
      <div className="max-w-7xl mx-auto px-6">
        {data.tour.map((dayPlan, dIdx) => (
          <div key={dIdx} className="mb-32">
            {/* Day Title & Route Line */}
            <div className="mb-12">
              <div className="flex items-center gap-4 mb-4">
                <span className="text-4xl font-black italic text-green-600">
                  Day 0{dIdx + 1}
                </span>
                <h2 className="text-2xl font-black">{dayPlan.name}</h2>
              </div>

              {/* 경로 (화살표 아이콘 적용 & 좌측 정렬) */}
              <div className="flex flex-wrap items-center gap-2 py-4 border-y border-slate-100">
                {dayPlan.route.split("→").map((path, pIdx) => (
                  <React.Fragment key={pIdx}>
                    <span className="text-sm font-bold text-slate-800 bg-slate-50 px-4 py-2 rounded-full border border-slate-100 shadow-sm">
                      {path.trim()}
                    </span>
                    {pIdx !== dayPlan.route.split("→").length - 1 && (
                      <ChevronRight size={18} className="text-green-500 mx-1" />
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>

            {/* 상세 장소 리스트 (좌측 정렬 타임라인) */}
            <div className="relative border-l-[3px] border-slate-100 ml-4 pl-8 md:pl-16 space-y-24">
              {dayPlan.detail.map((spot, sIdx) => (
                <div key={sIdx} className="relative">
                  {/* 타임라인 포인트 */}
                  <div className="absolute -left-[42px] md:-left-[74px] top-0 w-6 h-6 bg-white border-[5px] border-green-600 rounded-full z-10" />

                  <div className="flex flex-col lg:flex-row gap-10 items-start">
                    {/* 이미지 (전체 다 보이게 비율 유지) */}
                    <div className="w-full lg:w-[500px]">
                      <div className="relative rounded-2xl overflow-hidden shadow-lg aspect-video group">
                        <img
                          src={spot.src}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          alt={spot.name}
                        />
                        <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-md text-white text-[10px] font-bold px-3 py-1 rounded-md uppercase tracking-widest">
                          Stop 0{sIdx + 1}
                        </div>
                      </div>
                    </div>

                    {/* 텍스트 설명 (좌측 정렬) */}
                    <div className="flex-1 pt-2">
                      <div className="flex items-center gap-2 text-green-600 mb-3 font-black text-xs uppercase tracking-widest">
                        <MapPin size={14} /> {spot.location || "Daejeon, Korea"}
                      </div>
                      <h3 className="text-3xl font-black mb-5 tracking-tight">
                        {spot.name}
                      </h3>
                      <p className="text-slate-500 leading-relaxed font-medium text-lg max-w-2xl break-keep">
                        {spot.text}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* 하단 네비게이션 */}
      <footer className="max-w-7xl mx-auto px-6 pt-16 border-t border-slate-100">
        <Link
          href="/tour/route"
          className="inline-flex items-center gap-4 bg-slate-900 text-white px-8 py-4 rounded-2xl font-black hover:bg-green-600 transition-all hover:gap-6 shadow-xl"
        >
          DISCOVER OTHER COURSES <ChevronRight size={20} />
        </Link>
      </footer>
    </div>
  );
}
