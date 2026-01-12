// src/data/daejeonData.ts

export interface BudgetData {
  year: number;
  budget: number; // 단위: 백만 원
  type: "past" | "future";
}

// 과거 데이터 (2009~2026)
const pastData = [
  { year: 2009, budget: 2515393 },
  { year: 2010, budget: 2685327 },
  { year: 2011, budget: 2753848 },
  { year: 2012, budget: 2911992 },
  { year: 2013, budget: 3375500 },
  { year: 2014, budget: 3412939 },
  { year: 2015, budget: 3508414 },
  { year: 2016, budget: 3854686 },
  { year: 2017, budget: 3710181 },
  { year: 2018, budget: 4312830 },
  { year: 2019, budget: 4753894 },
  { year: 2020, budget: 5381371 },
  { year: 2021, budget: 5681833 },
  { year: 2022, budget: 6365186 },
  { year: 2023, budget: 6561725 },
  { year: 2024, budget: 6532974 },
  { year: 2025, budget: 6677096 },
  { year: 2026, budget: 7058230 },
];

// 미래 데이터 (2027~2056 일부 발췌)
const futureData = [
  { year: 2027, budget: 7321611 },
  { year: 2028, budget: 7612462 },
  { year: 2029, budget: 7903313 },
  { year: 2030, budget: 8194165 },
  { year: 2031, budget: 8485016 },
  { year: 2032, budget: 8775867 },
  { year: 2035, budget: 9648421 },
  { year: 2040, budget: 11102678 },
  { year: 2050, budget: 14011192 },
  // 그래프 가독성을 위해 미래 데이터는 주요 포인트만 남기거나 전체를 다 넣으셔도 됩니다.
];

export const chartData: BudgetData[] = [
  ...pastData.map((d) => ({ ...d, type: "past" as const })),
  ...futureData.map((d) => ({ ...d, type: "future" as const })),
];

export interface PlanPhase {
  title: string;
  years: string;
  desc: string;
  keywords: string[];
  events: { year: number; content: string; tag: string }[];
}

export const planPhases: PlanPhase[] = [
  {
    title: "도약 준비: 씨앗을 뿌리다",
    years: "2025 ~ 2026",
    desc: "대전의 미래 먹거리를 위한 기초 공사와 행정적 기반을 마련하는 시기입니다.",
    keywords: ["행정통합", "국가산단", "국제행사"],
    events: [
      {
        year: 2025,
        content: "우주항공·바이오 전략산업 특구 지정",
        tag: "기반조성",
      },
      {
        year: 2025,
        content: "대전·충남 행정통합 특별법 발의 및 공론화",
        tag: "행정",
      },
      {
        year: 2026,
        content: "제9회 세계태양광총회 & 과학축제 통합 개최",
        tag: "행사",
      },
      { year: 2026, content: "나노·반도체 국가산단 예타 재신청", tag: "산업" },
    ],
  },
  {
    title: "대전의 르네상스: 변화를 체감하다",
    years: "2027 ~ 2028",
    desc: "준비했던 주요 시설들이 준공되고 개관하며 시민들의 삶이 실질적으로 변화합니다.",
    keywords: ["시설개관", "문화부흥", "인프라완성"],
    events: [
      {
        year: 2027,
        content: "대전바이오창업원 준공 및 입주 (4월)",
        tag: "경제",
      },
      {
        year: 2027,
        content: "이종수도예관 및 첫 대전시청사(복원) 개관",
        tag: "문화",
      },
      {
        year: 2027,
        content: "수소연료전지 발전소 상업 운전 개시",
        tag: "에너지",
      },
      { year: 2028, content: "대전국민안전체험관 건립 공사 준공", tag: "안전" },
      {
        year: 2028,
        content: "융복합 특수영상 콘텐츠 클러스터 공사 완료",
        tag: "산업",
      },
    ],
  },
  {
    title: "초일류 도시 완성: 비전의 실현",
    years: "2029 ~ 2030+",
    desc: "국가산단과 대형 문화예술 복합단지가 완성되어 과학수도의 위상을 확립합니다.",
    keywords: ["비전완성", "국가산단", "랜드마크"],
    events: [
      {
        year: 2029,
        content: "우주기술혁신 인재양성센터 사업 완료",
        tag: "교육",
      },
      { year: 2030, content: "대전산업단지 재생사업 완료 목표", tag: "재생" },
      { year: 2030, content: "보물산 프로젝트(전망타워) 추진", tag: "관광" },
      { year: 2031, content: "제2 문화예술복합단지 순차적 건립", tag: "예술" },
    ],
  },
];
