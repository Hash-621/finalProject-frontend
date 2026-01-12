// --- [라이브러리 및 컴포넌트 임포트] ---
import React from "react"; // 리액트 기본 모듈
import { tourCurseData } from "@/data/tourCurseData"; // 관광 코스 데이터 (하드코딩된 데이터 파일)
import { notFound } from "next/navigation"; // 404 페이지로 보내는 함수
// 아이콘 라이브러리
import { MapPin, ArrowLeft, ChevronRight } from "lucide-react";
import Link from "next/link"; // 페이지 이동 링크

// --- [타입 정의] ---
// 페이지 컴포넌트가 받을 props 타입 정의
// Next.js 15부터는 params가 Promise 타입으로 변경되었습니다.
interface Props {
  params: Promise<{ id: string }>;
}

// --- [메인 상세 페이지 컴포넌트 (비동기 서버 컴포넌트)] ---
export default async function TourRouteDetailPage({ params }: Props) {
  // 1. URL 파라미터(id)를 비동기로 받아옵니다.
  const resolvedParams = await params;
  const id = resolvedParams.id; // 예: "1"

  // 2. 전체 데이터에서 해당 id와 일치하는 코스 데이터를 찾습니다.
  // data 파일의 number가 숫자라서 String으로 변환해서 비교합니다.
  const data = tourCurseData.tours.find((t) => String(t.number) === id);

  // 3. 만약 데이터가 없으면 404 Not Found 페이지를 띄웁니다.
  if (!data) return notFound();

  // --- [화면 렌더링] ---
  return (
    <div className="w-full bg-white min-h-screen pb-8 sm:pb-40 text-slate-900">
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
          목록보기
        </Link>
      </div>

      {/* 1. 상단 헤더 섹션 (코스 제목, 설명, 대표 이미지) */}
      <header className="max-w-7xl mx-auto px-6 mt-12 mb-16">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
          {/* 텍스트 영역 */}
          <div className="flex-1">
            <span className="inline-block bg-green-600 text-white text-[10px] font-black px-3 py-1 rounded-sm mb-4 tracking-[0.2em] uppercase">
              Course 0{data.number}
            </span>
            <h2 className="text-4xl md:text-6xl font-black leading-tight tracking-tighter mb-6">
              {data.title}
            </h2>
            <p className="max-w-2xl text-slate-500 font-medium leading-relaxed break-keep">
              {data.text}
            </p>
          </div>

          {/* 코스 대표 이미지 */}
          <div className="w-full md:w-[450px] aspect-4/3 rounded-3xl overflow-hidden shadow-2xl border-12 border-slate-50">
            <img
              src={data.src}
              className="w-full h-full object-cover"
              alt="Course Cover"
            />
          </div>
        </div>
      </header>

      {/* 2. 타임라인 섹션 (일차별 코스 안내) */}
      <div className="max-w-7xl mx-auto px-6">
        {/* 일차(Day 1, Day 2...)별로 반복 렌더링 */}
        {data.tour.map((dayPlan, dIdx) => (
          <div key={dIdx} className="mb-32">
            {/* 해당 일차의 제목 및 전체 경로 요약 */}
            <div className="mb-12">
              <div className="flex items-center gap-4 mb-4">
                <span className="text-4xl font-black italic text-green-600">
                  Day 0{dIdx + 1}
                </span>
                <h2 className="text-2xl font-black">{dayPlan.name}</h2>
              </div>

              {/* 경로 요약 (예: 대전역 -> 성심당 -> ...) */}
              <div className="flex flex-wrap items-center gap-2 py-4 border-y border-slate-100">
                {dayPlan.route.split("→").map((path, pIdx) => (
                  <React.Fragment key={pIdx}>
                    <span className="text-sm font-bold text-slate-800 bg-slate-50 px-4 py-2 rounded-full border border-slate-100 shadow-sm">
                      {path.trim()}
                    </span>
                    {/* 마지막 항목이 아니면 화살표 아이콘 추가 */}
                    {pIdx !== dayPlan.route.split("→").length - 1 && (
                      <ChevronRight size={18} className="text-green-500 mx-1" />
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>

            {/* 상세 장소 리스트 (세로 타임라인) */}
            <div className="relative border-l-[3px] border-slate-100 ml-4 pl-8 md:pl-16 space-y-24">
              {dayPlan.detail.map((spot, sIdx) => (
                <div key={sIdx} className="relative">
                  {/* 타임라인 포인트 (초록색 동그라미) */}
                  <div className="absolute -left-[42px] md:-left-[74px] top-0 w-6 h-6 bg-white border-[5px] border-green-600 rounded-full z-10" />

                  <div className="flex flex-col lg:flex-row gap-10 items-start">
                    {/* 장소 이미지 */}
                    <div className="w-full lg:w-[500px]">
                      <div className="relative rounded-2xl overflow-hidden shadow-lg aspect-video group">
                        <img
                          src={spot.src}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          alt={spot.name}
                        />
                        {/* 순서 뱃지 (Stop 01) */}
                        <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-md text-white text-[10px] font-bold px-3 py-1 rounded-md uppercase tracking-widest">
                          Stop 0{sIdx + 1}
                        </div>
                      </div>
                    </div>

                    {/* 장소 텍스트 설명 */}
                    <div className="flex-1 pt-2">
                      <div className="flex items-center gap-2 text-green-600 mb-3 font-black text-xs uppercase tracking-widest">
                        <MapPin size={14} /> {spot.location || "Daejeon, Korea"}
                      </div>
                      <h3 className="text-2xl sm:text-3xl font-bold mb-5 tracking-tight">
                        {spot.name}
                      </h3>
                      <p className="text-slate-500 leading-relaxed max-w-2xl break-keep">
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
    </div>
  );
}

// 1. 페이지 진입 및 데이터 로드 (SSR)

// 사용자가 /tour/route/1 주소로 들어옵니다.

// 서버에서 params.id가 "1"임을 확인합니다.

// tourCurseData.tours 배열에서 number가 1인 데이터를 찾아냅니다. (없으면 404 에러)

// 2. 화면 렌더링 (Rendering)

// 헤더: "Course 01" 뱃지와 함께 "1박 2일 대전 완전 정복"이라는 제목과 대표 이미지가 크게 보입니다.

// 타임라인 (Day 1):

// "Day 01" 타이틀과 함께 "대전역 → 으능정이 거리 → 성심당..." 순서의 요약 경로가 가로로 표시됩니다.

// 그 아래로 세로선(타임라인)을 따라 각 장소의 사진과 상세 설명이 쭉 나열됩니다.

// 타임라인 (Day 2): Day 1이 끝나면 이어서 Day 2의 일정이 같은 방식으로 펼쳐집니다.

// 3. 사용자 탐색 (Browsing)

// 사용자는 스크롤을 내리며 여행의 흐름을 시각적으로 따라갑니다. 마치 여행 잡지를 보는 듯한 느낌을 받습니다.

// 다 보고 나면 하단의 [DISCOVER OTHER COURSES] 버튼을 눌러 다시 목록으로 돌아갑니다.
