"use client";

import React from "react";
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
import { TrendingUp, Calendar, CheckCircle2 } from "lucide-react";
import { chartData, planPhases } from "@/data/daejeonData";

// --- [2] 메인 페이지 컴포넌트 ---

export default function DaejeonFuturePage() {
  // Y축 포맷팅 함수 (백만 원 -> 조 원)
  const formatYAxis = (tick: number) => {
    return `${(tick / 1000000).toFixed(1)}조`;
  };

  // 커스텀 툴팁 컴포넌트
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const dataPoint = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-slate-200 shadow-xl rounded-lg text-sm">
          <p className="font-bold text-slate-800 mb-1">{label}년 예산 예측</p>
          <p className="text-blue-600 font-semibold text-lg">
            {new Intl.NumberFormat("ko-KR").format(dataPoint.budget)} 백만원
          </p>
          <p className="text-slate-500 text-xs mt-1">
            (약 {(dataPoint.budget / 1000000).toFixed(2)}조 원)
          </p>
          <p className="text-slate-400 text-[10px] mt-2">
            {dataPoint.type === "past" ? "* 실제 확정 예산" : "* 향후 추계치"}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-800 selection:bg-blue-100">
      <div className="relative pt-20 pb-24 px-6 text-center shadow-lg overflow-hidden text-white">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop"
            alt="Background"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="absolute inset-0 z-0 bg-linear-to-br from-blue-900 via-blue-800 to-indigo-900 opacity-90 mix-blend-multiply"></div>

        <div className="relative z-10 max-w-4xl mx-auto">
          <span className="inline-block bg-white/10 backdrop-blur-sm text-blue-100 px-4 py-1.5 rounded-full text-sm font-semibold mb-6 border border-white/20">
            Daejeon Vision 2030+
          </span>
          <div className="text-3xl md:text-5xl font-extrabold mb-6 leading-tight tracking-tight">
            데이터로 미리 보는
            <br />
            <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-200 to-cyan-300">
              대전의 미래 지도
            </span>
          </div>
          <p className="text-lg text-blue-100/90 max-w-2xl mx-auto font-light leading-relaxed">
            과거의 예산 데이터와 미래의 사업 계획을 연결하여,
            <br className="hidden md:block" />
            앞으로 달라질 우리 도시의 모습을 그려봅니다.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 md:px-6 -mt-16 mb-20 relative z-10">
        <section className="bg-white rounded-3xl p-6 md:p-10 shadow-xl mb-16 border border-slate-100">
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

          <div className="w-full h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={chartData}
                margin={{ top: 30, right: 30, left: 0, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#e2e8f0"
                />
                <XAxis
                  dataKey="year"
                  tick={{ fontSize: 12, fill: "#64748b" }}
                  axisLine={false}
                  tickLine={false}
                  dy={10}
                />
                <YAxis
                  tickFormatter={formatYAxis}
                  tick={{ fontSize: 12, fill: "#64748b" }}
                  axisLine={false}
                  tickLine={false}
                  dx={-10}
                  domain={[0, "auto"]}
                />
                <Tooltip
                  content={<CustomTooltip />}
                  cursor={{ stroke: "#94a3b8", strokeWidth: 1 }}
                />

                <ReferenceLine
                  x={2026}
                  stroke="#ef4444"
                  strokeDasharray="3 3"
                  label={{
                    position: "top",
                    value: "NOW",
                    fill: "#ef4444",
                    fontSize: 12,
                  }}
                />

                <Line
                  type="monotone"
                  dataKey="budget"
                  stroke="#2563eb"
                  strokeWidth={4}
                  dot={({ cx, cy, payload }) => {
                    // 미래 데이터는 빈 원으로 표시
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
                    return <circle cx={cx} cy={cy} r={4} fill="#2563eb" />;
                  }}
                  activeDot={{ r: 8, fill: "#1d4ed8" }}
                  animationDuration={1500}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 p-4 bg-slate-50 rounded-xl text-xs text-slate-500 text-center leading-relaxed">
            * 본 데이터는 대전광역시청 예산서 및 지방재정365 공시 자료를
            기반으로 재구성하였으며,
            <br />
            2027년 이후 데이터는 추세선에 따른 예측치로 실제와 다를 수 있습니다.
          </div>
        </section>

        {/* [Roadmap Section] 연도별 주요 계획 */}
        <div className="space-y-12">
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

          <div className="grid gap-8">
            {planPhases.map((phase, index) => (
              <div
                key={index}
                className="group relative bg-white rounded-3xl p-8 shadow-sm hover:shadow-xl border border-slate-100 transition-all duration-300 overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-40 h-40 bg-linear-to-br from-blue-50 to-indigo-50 rounded-bl-full -mr-10 -mt-10 opacity-60 group-hover:scale-110 transition-transform duration-500"></div>

                <div className="relative z-10 flex flex-col lg:flex-row gap-8">
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

                  <div className="lg:w-2/3">
                    <ul className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-1">
                      {phase.events.map((event, idx) => (
                        <li
                          key={idx}
                          className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors"
                        >
                          <div className="mt-1 shrink-0 text-green-500">
                            <CheckCircle2 className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="bg-blue-100 text-blue-700 text-[11px] font-bold px-2 py-0.5 rounded">
                                {event.year}
                              </span>
                              <span className="text-slate-400 text-[11px] border border-slate-200 px-1.5 rounded">
                                {event.tag}
                              </span>
                            </div>
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

        <section className="mt-20 bg-slate-800 text-white rounded-3xl p-10 md:p-16 text-center shadow-2xl relative overflow-hidden">
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

            <a
              href="/files/daejeon_plan.pdf"
              target="_blank"
              download
              className="inline-block bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-xl font-bold transition-all shadow-lg hover:shadow-blue-500/30 transform hover:-translate-y-1"
            >
              대전시 주요 업무계획 다운로드 (PDF)
            </a>

            {/* 2. 하단 출처 표기 추가 */}
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
