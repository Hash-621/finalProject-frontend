// 1. "use client": 이 파일은 브라우저에서 실행되는 클라이언트 컴포넌트입니다.
// (그래프의 마우스 오버 효과, 툴팁 같은 상호작용이 필요하기 때문입니다.)
"use client";

// --- [Imports] 필요한 도구들을 가져옵니다. ---
import React from "react";
// Recharts: 리액트에서 차트를 쉽게 그리기 위한 라이브러리입니다.
// 선 그래프, 축(X, Y), 그리드, 툴팁, 반응형 컨테이너 등을 가져옵니다.
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
// 아이콘들을 가져옵니다. (상승 그래프, 달력, 체크 표시)
import { TrendingUp, Calendar, CheckCircle2 } from "lucide-react";
// 아까 분석했던 데이터 파일에서 '차트 데이터'와 '로드맵 데이터'를 가져옵니다.
import { chartData, planPhases } from "@/data/daejeonData";

// ==================================================================
// [Main Component] 대전 미래 비전 페이지 컴포넌트
// ==================================================================
export default function DaejeonFuturePage() {
  // --- [Helper Function 1] Y축 숫자 포맷팅 함수 ---
  // 차트 Y축에 1000000(백만) 같은 큰 숫자 대신 "1.0조" 처럼 보기 좋게 바꿔줍니다.
  const formatYAxis = (tick: number) => {
    // 값을 백만으로 나누고 소수점 첫째 자리까지 표시한 뒤 '조'를 붙입니다.
    return `${(tick / 1000000).toFixed(1)}조`;
  };

  // --- [Helper Component] 커스텀 툴팁 컴포넌트 ---
  // 그래프 점에 마우스를 올렸을 때 뜨는 작은 박스를 디자인합니다.
  const CustomTooltip = ({ active, payload, label }: any) => {
    // active: 마우스가 올라갔는지?, payload: 그 지점의 데이터가 있는지?
    if (active && payload && payload.length) {
      const dataPoint = payload[0].payload; // 현재 마우스가 가리키는 데이터 한 개
      return (
        // 흰색 박스에 그림자 효과를 주어 둥둥 떠있는 느낌을 줍니다.
        <div className="bg-white p-3 border border-slate-200 shadow-xl rounded-lg text-sm">
          {/* 상단: 연도 표시 */}
          <p className="font-bold text-slate-800 mb-1">{label}년 예산 예측</p>
          {/* 중단: 구체적인 금액 표시 (천 단위 콤마) */}
          <p className="text-blue-600 font-semibold text-lg">
            {new Intl.NumberFormat("ko-KR").format(dataPoint.budget)} 백만원
          </p>
          {/* 하단: 조 단위 환산 금액 표시 (보조 설명) */}
          <p className="text-slate-500 text-xs mt-1">
            (약 {(dataPoint.budget / 1000000).toFixed(2)}조 원)
          </p>
          {/* 데이터 타입(과거/미래)에 따라 다른 안내 문구 표시 */}
          <p className="text-slate-400 text-[10px] mt-2">
            {dataPoint.type === "past" ? "* 실제 확정 예산" : "* 향후 추계치"}
          </p>
        </div>
      );
    }
    return null; // 마우스가 없으면 아무것도 안 보여줍니다.
  };

  // -----------------------------------------------------------
  // [Render] 화면 그리기 시작
  // -----------------------------------------------------------
  return (
    // 전체 배경: 아주 연한 회색(slate-50), 텍스트는 진한 회색
    // 드래그 시 선택 영역 색상을 파란색(selection:bg-blue-100)으로 설정
    <main className="min-h-screen bg-slate-50 text-slate-800 selection:bg-blue-100">
      {/* === [Section 1] Hero Section (상단 배너) === */}
      <div className="relative pt-20 pb-24 px-6 text-center shadow-lg overflow-hidden text-white">
        {/* (1) 배경 이미지 */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop"
            alt="Background"
            className="w-full h-full object-cover" // 이미지를 꽉 채웁니다.
          />
        </div>

        {/* (2) 배경 오버레이 (이미지를 어둡고 파랗게 덮어씌움) */}
        {/* mix-blend-multiply: 이미지와 색상을 곱해서 어둡고 깊은 느낌을 냅니다. */}
        <div className="absolute inset-0 z-0 bg-linear-to-br from-blue-900 via-blue-800 to-indigo-900 opacity-90 mix-blend-multiply"></div>

        {/* (3) 텍스트 콘텐츠 (z-10으로 배경보다 위에 올림) */}
        <div className="relative z-10 max-w-4xl mx-auto">
          {/* 작은 뱃지 */}
          <span className="inline-block bg-white/10 backdrop-blur-sm text-blue-100 px-4 py-1.5 rounded-full text-sm font-semibold mb-6 border border-white/20">
            Daejeon Vision 2030+
          </span>
          {/* 메인 타이틀 */}
          <div className="text-3xl md:text-5xl font-extrabold mb-6 leading-tight tracking-tight">
            데이터로 미리 보는
            <br />
            {/* 텍스트에 그라데이션 색상 입히기 (bg-clip-text) */}
            <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-200 to-cyan-300">
              대전의 미래 지도
            </span>
          </div>
          {/* 서브 설명글 */}
          <p className="text-lg text-blue-100/90 max-w-2xl mx-auto font-light leading-relaxed">
            과거의 예산 데이터와 미래의 사업 계획을 연결하여,
            <br className="hidden md:block" />
            앞으로 달라질 우리 도시의 모습을 그려봅니다.
          </p>
        </div>
      </div>

      {/* === [Section 2] Main Content (차트 + 로드맵) === */}
      {/* -mt-16: 위쪽 배너 위로 살짝 겹쳐서 올라오게 만듭니다. (입체감) */}
      <div className="max-w-5xl mx-auto px-4 md:px-6 -mt-16 mb-20 relative z-10">
        {/* --- [Chart Card] 예산 그래프 영역 --- */}
        <section className="bg-white rounded-3xl p-6 md:p-10 shadow-xl mb-16 border border-slate-100">
          {/* 차트 헤더 (제목 + 범례) */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
            <div>
              <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-blue-600" />
                대전시 예산 성장 그래프
              </h2>
              <p className="text-slate-500 mt-2 text-sm">
                2009년부터 2050년까지의 예산 추이 (단위: 백만 원)
              </p>
            </div>
            {/* 범례 (Legend) */}
            <div className="flex items-center gap-4 text-xs font-medium">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-blue-600"></span>
                <span className="text-slate-600">과거/현재</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full border-2 border-blue-400 bg-white border-dashed"></span>
                <span className="text-slate-600">미래 예측</span>
              </div>
            </div>
          </div>

          {/* 차트 본문 (Recharts) */}
          <div className="w-full h-[400px]">
            {/* 반응형 컨테이너: 부모 크기에 맞춰 차트 크기 자동 조절 */}
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={chartData} // data/daejeonData.ts에서 가져온 데이터 연결
                margin={{ top: 30, right: 30, left: 0, bottom: 0 }}
              >
                {/* 배경 그리드 (점선) */}
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false} // 세로선은 끄고 가로선만 표시
                  stroke="#e2e8f0"
                />
                {/* X축 (연도) */}
                <XAxis
                  dataKey="year"
                  tick={{ fontSize: 12, fill: "#64748b" }}
                  axisLine={false}
                  tickLine={false}
                  dy={10} // 텍스트 위치 살짝 아래로
                />
                {/* Y축 (예산) */}
                <YAxis
                  tickFormatter={formatYAxis} // 아까 만든 포맷팅 함수 적용 (1.0조)
                  tick={{ fontSize: 12, fill: "#64748b" }}
                  axisLine={false}
                  tickLine={false}
                  dx={-10} // 텍스트 위치 살짝 왼쪽으로
                  domain={[0, "auto"]} // 0부터 시작해서 자동으로 최대값 설정
                />
                {/* 툴팁 (마우스 오버 시 정보창) */}
                <Tooltip
                  content={<CustomTooltip />} // 커스텀 툴팁 컴포넌트 사용
                  cursor={{ stroke: "#94a3b8", strokeWidth: 1 }} // 마우스 위치 표시선
                />

                {/* 기준선 (현재 시점 표시) */}
                <ReferenceLine
                  x={2026} // 2026년 위치에 선 긋기
                  stroke="#ef4444" // 빨간색
                  strokeDasharray="3 3" // 점선
                  label={{
                    position: "top",
                    value: "NOW",
                    fill: "#ef4444",
                    fontSize: 12,
                  }}
                />

                {/* 실제 데이터 라인 */}
                <Line
                  type="monotone" // 부드러운 곡선
                  dataKey="budget" // 데이터의 'budget' 값을 사용
                  stroke="#2563eb" // 파란색 선
                  strokeWidth={4} // 선 두께
                  // [중요] 점(Dot) 커스터마이징 함수
                  dot={({ cx, cy, payload }) => {
                    // 미래 데이터(type === 'future')는 속이 빈 하얀 원으로 그림
                    if (payload.type === "future") {
                      return (
                        <circle
                          cx={cx}
                          cy={cy}
                          r={4}
                          stroke="#2563eb"
                          strokeWidth={2}
                          fill="white"
                        />
                      );
                    }
                    // 과거 데이터는 꽉 찬 파란 원으로 그림
                    return <circle cx={cx} cy={cy} r={4} fill="#2563eb" />;
                  }}
                  activeDot={{ r: 8, fill: "#1d4ed8" }} // 마우스 올렸을 때 점 크기 확대
                  animationDuration={1500} // 그래프 그려지는 애니메이션 시간
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* 하단 주석 (데이터 출처) */}
          <div className="mt-4 p-4 bg-slate-50 rounded-xl text-xs text-slate-500 text-center leading-relaxed">
            * 본 데이터는 대전광역시청 예산서 및 지방재정365 공시 자료를
            기반으로 재구성하였으며,
            <br />
            2027년 이후 데이터는 추세선에 따른 예측치로 실제와 다를 수 있습니다.
          </div>
        </section>

        {/* --- [Roadmap Section] 연도별 주요 계획 --- */}
        <div className="space-y-12">
          {/* 섹션 타이틀 */}
          <div className="text-center mb-10">
            <span className="text-blue-600 font-bold tracking-wider text-sm uppercase">
              Roadmap
            </span>
            <h2 className="text-3xl font-bold text-slate-800 mt-2">
              연도별 주요 변화 요약
            </h2>
            <p className="text-slate-500 mt-3 max-w-2xl mx-auto">
              늘어나는 예산은 시민을 위해 사용됩니다.
              <br />
              향후 계획된 주요 인프라와 사업이 언제 완성되는지 확인해보세요.
            </p>
          </div>

          {/* 로드맵 카드 그리드 */}
          <div className="grid gap-8">
            {/* planPhases 데이터를 순회하며 카드 생성 (3개 단계) */}
            {planPhases.map((phase, index) => (
              <div
                key={index}
                className="group relative bg-white rounded-3xl p-8 shadow-sm hover:shadow-xl border border-slate-100 transition-all duration-300 overflow-hidden"
              >
                {/* 배경 장식용 원 (오른쪽 위) */}
                <div className="absolute top-0 right-0 w-40 h-40 bg-linear-to-br from-blue-50 to-indigo-50 rounded-bl-full -mr-10 -mt-10 opacity-60 group-hover:scale-110 transition-transform duration-500"></div>

                <div className="relative z-10 flex flex-col lg:flex-row gap-8">
                  {/* [Card Left] 연도, 제목, 키워드 */}
                  <div className="lg:w-lex-shrink-0 lg:border-r border-slate-100 lg:pr-8">
                    <div className="flex items-center gap-2 text-blue-600 font-bold mb-3">
                      <Calendar className="w-5 h-5" />
                      <span className="text-lg">{phase.years}</span>
                    </div>
                    <h3 className="text-2xl font-bold mb-4 leading-tight text-slate-800 group-hover:text-blue-700 transition-colors">
                      {phase.title}
                    </h3>
                    <p className="text-slate-600 text-sm leading-relaxed mb-6">
                      {phase.desc}
                    </p>
                    {/* 키워드 태그 리스트 */}
                    <div className="flex flex-wrap gap-2">
                      {phase.keywords.map((kw) => (
                        <span
                          key={kw}
                          className="bg-slate-100 text-slate-600 text-xs px-3 py-1.5 rounded-full font-medium border border-slate-200"
                        >
                          #{kw}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* [Card Right] 상세 이벤트 리스트 */}
                  <div className="lg:w-2/3">
                    <ul className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-1">
                      {phase.events.map((event, idx) => (
                        <li
                          key={idx}
                          className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors"
                        >
                          {/* 체크 아이콘 */}
                          <div className="mt-1 shrink-0 text-green-500">
                            <CheckCircle2 className="w-5 h-5" />
                          </div>
                          <div>
                            {/* 연도 뱃지 & 태그 */}
                            <div className="flex items-center gap-2 mb-1">
                              <span className="bg-blue-100 text-blue-700 text-[11px] font-bold px-2 py-0.5 rounded">
                                {event.year}
                              </span>
                              <span className="text-slate-400 text-[11px] border border-slate-200 px-1.5 rounded">
                                {event.tag}
                              </span>
                            </div>
                            {/* 이벤트 내용 */}
                            <span className="text-slate-700 font-medium text-sm block">
                              {event.content}
                            </span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* --- [Footer CTA] 하단 다운로드 섹션 --- */}
        <section className="mt-20 bg-slate-800 text-white rounded-3xl p-10 md:p-16 text-center shadow-2xl relative overflow-hidden">
          {/* 상단 무지개 라인 장식 */}
          <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-blue-400 via-indigo-500 to-purple-500"></div>

          <div className="relative z-10">
            <h3 className="text-2xl md:text-3xl font-bold mb-4">
              2030년, 대전은{" "}
              <span className="text-blue-400">대한민국 과학수도</span>로
              완성됩니다.
            </h3>
            <p className="text-slate-300 mb-8 max-w-xl mx-auto leading-relaxed">
              단순한 수치의 성장을 넘어, 시민 모두가 체감할 수 있는
              <br />
              삶의 질 향상을 위해 대전시의 노력은 계속됩니다.
            </p>

            {/* 다운로드 버튼 */}
            <a
              href="/files/daejeon_plan.pdf"
              target="_blank"
              download
              className="inline-block bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-xl font-bold transition-all shadow-lg hover:shadow-blue-500/30 transform hover:-translate-y-1"
            >
              대전시 주요 업무계획 다운로드 (PDF)
            </a>

            {/* 저작권 및 출처 표기 */}
            <p className="text-slate-400 text-xs mt-4 font-light">
              ※ 본 자료의 저작권은 대전광역시청에 있으며, 공공누리 제1유형
              조건에 따라 이용됩니다.
              <br />
              (출처: 대전광역시청 www.daejeon.go.kr)
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}

// 첫 인상 (Hero Section):

// 페이지 상단에 웅장한 배경 이미지와 함께 **"데이터로 미리 보는 대전의 미래 지도"**라는 문구가 나타납니다.

// 파란색 그라데이션이 덮여 있어 신뢰감 있고 미래지향적인 느낌을 줍니다.

// 데이터 분석 (Interactive Chart):

// 스크롤을 내리면 예산 성장 그래프가 나옵니다.

// **과거(실선)**는 진한 파란색, **미래(점선/빈 원)**는 예측치로 구분되어 있습니다.

// 그래프에 마우스를 올리면 **툴팁(Tooltip)**이 떠서 정확한 예산 금액을 "조 단위"로 환산해 보여줍니다.

// 2026년(현재) 위치에 빨간 점선(ReferenceLine)이 그어져 있어 기준점을 잡아줍니다.

// 로드맵 확인 (Cards):

// 더 아래로 내려가면 3단계 로드맵이 카드 형태로 나옵니다.

// 각 카드는 "준비 -> 체감 -> 완성" 단계별로 연도, 키워드, 주요 사건들을 깔끔하게 정리해 보여줍니다.

// 마무리 (CTA):

// 마지막에는 **"2030년 과학수도 완성"**이라는 비전 문구와 함께, 실제 PDF 계획서를 다운로드할 수 있는 버튼이 있습니다.
