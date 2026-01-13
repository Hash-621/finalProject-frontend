// 1. "use client": Next.js에서 이 파일이 브라우저(클라이언트)에서 실행됨을 선언합니다.
// (사용자의 클릭 이벤트, 상태 관리 등을 위해 필수입니다.)
"use client";

// --- [라이브러리 및 훅 임포트] ---
import { useState, useEffect } from "react"; // 상태 관리(useState)와 생명주기 관리(useEffect)를 위한 리액트 훅
import { useRouter } from "next/navigation"; // 페이지 이동(상세 페이지로 가기 위함)을 위한 훅
import {
  Sparkles, // 반짝임 아이콘 (AI 느낌)
  Search, // 돋보기 아이콘
  Activity, // 심전도 아이콘 (분석 중 표시)
  X, // 닫기(취소) 아이콘
  MapPin, // 지도 핀 아이콘
  ChevronRight, // 오른쪽 화살표 아이콘
  AlertCircle, // 경고 느낌표 아이콘
  AlertTriangle, // 주의 삼각형 아이콘 (응급 시 사용)
  Siren, // 사이렌 아이콘 (초응급 시 사용)
  Clock, // 시계 아이콘 (야간/주말 시 사용)
  CheckCircle2, // 체크 아이콘 (일반 완료 시 사용)
  ExternalLink, // 외부 링크/이동 아이콘 (상세보기 버튼용)
} from "lucide-react"; // 예쁜 아이콘들을 가져오는 라이브러리
import { hospitalService } from "@/api/services"; // 서버에서 병원 데이터를 가져오는 API 함수

// --- [타입 정의] ---
// 부모 컴포넌트(Page.tsx)로부터 받아올 props의 모양을 정의합니다.
// onSelectHospital: 병원을 클릭했을 때 실행할 함수 (지도를 이동시키는 기능)
interface AiHospitalSearchProps {
  onSelectHospital?: (hospital: any) => void;
}

// 응급도 단계를 정의합니다. (문자열 오타 방지용)
// EMERGENCY: 초응급 (빨강), URGENT: 야간/준응급 (주황), NORMAL: 일반 (초록)
type UrgencyLevel = "EMERGENCY" | "URGENT" | "NORMAL";

// --- [분석 규칙 정의 (AI의 지능)] ---
// 사용자가 입력한 텍스트에서 단어를 찾기 위한 규칙들입니다.
const ANALYSIS_RULES = [
  // 🚨 [1순위] 초응급 상황 규칙
  {
    // 이 단어들이 포함되면 매우 위험한 상태로 판단합니다.
    keywords: [
      "숨",
      "호흡",
      "기절",
      "의식",
      "심장",
      "흉통",
      "가슴",
      "마비",
      "출혈",
      "피가",
      "119",
      "응급",
    ],
    dept: "응급의학과", // 추천 진료과
    desc: "즉시 응급 처치가 필요한 위급 상황입니다.", // 사용자에게 보여줄 메시지
    targetTypes: ["종합병원", "병원"], // 동네 의원은 제외하고 큰 병원 위주로 찾습니다.
    urgency: "EMERGENCY" as UrgencyLevel, // 응급도는 최고 단계로 설정
  },
  // 🌙 [2순위] 야간/주말/시간 관련 규칙
  {
    keywords: ["밤", "새벽", "주말", "공휴일", "지금", "야간"],
    dept: "24시 진료/응급실",
    desc: "야간/휴일 진료가 가능한 병원을 우선합니다.",
    targetTypes: ["종합병원", "병원"], // 늦게까지 할 확률이 높은 큰 병원 우선
    urgency: "URGENT" as UrgencyLevel, // 응급도는 중간 단계
  },
  // --- 일반 진료 규칙들 (증상별) ---
  {
    keywords: ["배", "소화", "토", "속", "체", "설사", "복통", "위", "장염"],
    dept: "내과",
    desc: "소화기 계통 문제",
    targetTypes: ["내과", "종합병원", "병원", "의원"], // 내과는 동네 의원도 포함
    urgency: "NORMAL" as UrgencyLevel, // 일반 상태
  },
  {
    keywords: [
      "뼈",
      "허리",
      "무릎",
      "관절",
      "다리",
      "팔",
      "골절",
      "근육",
      "통증",
      "어깨",
      "디스크",
    ],
    dept: "정형외과",
    desc: "근골격계 질환",
    targetTypes: ["정형외과", "종합병원", "병원"],
    urgency: "NORMAL" as UrgencyLevel,
  },
  {
    keywords: ["눈", "시력", "충혈", "눈곱", "다래끼", "안구"],
    dept: "안과",
    desc: "안구 질환",
    targetTypes: ["안과", "종합병원"],
    urgency: "NORMAL" as UrgencyLevel,
  },
  {
    keywords: ["이", "치아", "잇몸", "사랑니", "스케일링", "턱", "치통"],
    dept: "치과",
    desc: "구강 질환",
    targetTypes: ["치과병원", "치과"],
    urgency: "NORMAL" as UrgencyLevel,
  },
  {
    keywords: [
      "피부",
      "두드러기",
      "가려움",
      "발진",
      "아토피",
      "여드름",
      "화상",
    ],
    dept: "피부과",
    desc: "피부 질환",
    targetTypes: ["피부과", "종합병원", "병원"],
    urgency: "NORMAL" as UrgencyLevel,
  },
  {
    keywords: ["코", "목", "감기", "기침", "콧물", "귀", "청력", "비염"],
    dept: "이비인후과",
    desc: "호흡기/이비인후과 질환",
    targetTypes: ["이비인후과", "종합병원", "병원", "내과"],
    urgency: "NORMAL" as UrgencyLevel,
  },
  {
    keywords: ["열", "몸살", "오한", "두통", "독감"],
    dept: "내과",
    desc: "전신 증상 및 고열",
    targetTypes: ["내과", "종합병원", "병원", "의원"],
    urgency: "URGENT" as UrgencyLevel, // 열이 심하면 준응급으로 취급
  },
  {
    keywords: ["침", "한약", "체질", "부항"],
    dept: "한방과",
    desc: "한방 진료",
    targetTypes: ["한방병원", "한의원"],
    urgency: "NORMAL" as UrgencyLevel,
  },
];

// --- [메인 컴포넌트 시작] ---
export default function AiHospitalSearch({
  onSelectHospital, // 부모에게서 지도 이동 함수를 받습니다.
}: AiHospitalSearchProps) {
  const router = useRouter(); // 페이지 이동을 위한 라우터 객체 생성
  const [symptom, setSymptom] = useState(""); // 사용자가 입력한 증상 텍스트
  const [isAnalyzing, setIsAnalyzing] = useState(false); // 분석 중인지 로딩 상태
  const [dbHospitals, setDbHospitals] = useState<any[]>([]); // 서버에서 가져온 전체 병원 데이터

  // 분석 결과 상태 (결과가 있으면 화면이 바뀝니다)
  const [result, setResult] = useState<{
    departmentTitle: string; // 추천 진료과 제목
    desc: string; // 설명 멘트
    matchedHospitals: any[]; // 필터링된 병원 리스트
    urgencyLevel: UrgencyLevel; // 판단된 응급도
    isComplex: boolean; // 복합 증상 여부 (여러 과가 겹치는지)
  } | null>(null);

  // 1. [데이터 로드] 컴포넌트가 처음 화면에 뜰 때 실행됩니다.
  useEffect(() => {
    const loadHospitals = async () => {
      try {
        // 서버에서 병원 목록을 가져옵니다.
        const res = await hospitalService.getHospitals();
        let hospitals = res.data;

        // 카카오맵 기능이 로드되어 있다면, 주소를 좌표로 변환합니다.
        if (window.kakao && window.kakao.maps) {
          const geocoder = new window.kakao.maps.services.Geocoder();

          // 모든 병원의 주소를 좌표로 변환하는 작업을 병렬로 처리합니다.
          const promises = hospitals.map((item: any) => {
            return new Promise((resolve) => {
              // 주소가 없으면 변환하지 않고 null 반환 (실패 처리)
              if (!item.address) {
                resolve(null);
                return;
              }
              // 주소 검색 실행
              geocoder.addressSearch(
                item.address,
                (result: any, status: any) => {
                  // 검색 성공 시 (OK)
                  if (status === window.kakao.maps.services.Status.OK) {
                    resolve({
                      ...item, // 기존 병원 데이터 유지
                      lat: Number(result[0].y), // 위도 추가
                      lng: Number(result[0].x), // 경도 추가
                    });
                  } else {
                    // 검색 실패 시 null 반환 (나중에 걸러냄)
                    resolve(null);
                  }
                }
              );
            });
          });

          // 모든 변환이 끝날 때까지 기다립니다.
          const results = await Promise.all(promises);
          // null이 아닌(좌표 변환에 성공한) 병원만 저장합니다.
          setDbHospitals(results.filter((h) => h !== null));
        } else {
          // 카카오맵이 로드되지 않았으면 원본 데이터를 저장합니다.
          setDbHospitals(hospitals);
        }
      } catch (err) {
        console.error("데이터 로드 실패:", err); // 에러 발생 시 콘솔에 출력
      }
    };

    // 약간의 딜레이(1초) 후 데이터 로드를 시작합니다. (페이지 부하 분산)
    const timer = setTimeout(() => loadHospitals(), 1000);
    return () => clearTimeout(timer); // 컴포넌트가 사라지면 타이머 취소
  }, []);

  // 2. [분석 로직] 사용자가 '병원 찾아보기' 버튼을 누르면 실행됩니다.
  const handleAnalyze = () => {
    if (!symptom.trim()) return; // 입력값이 없으면 실행하지 않습니다.

    setIsAnalyzing(true); // 로딩 상태 시작 (아이콘 뱅글뱅글)
    setResult(null); // 이전 결과 초기화

    // AI가 분석하는 척 1.5초 기다립니다. (UX를 위한 연출)
    setTimeout(() => {
      const text = symptom; // 사용자가 입력한 텍스트

      // 입력된 텍스트와 일치하는 규칙들을 찾습니다.
      const matchedRules = ANALYSIS_RULES.filter((rule) =>
        rule.keywords.some((keyword) => text.includes(keyword))
      );

      // 화면에 표시할 제목, 설명, 필터링할 변수들을 초기화합니다.
      let displayTitle = "";
      let displayDesc = "";
      let finalTargetTypes = new Set<string>(); // 중복 방지를 위해 Set 사용
      let keywordsToFilter = new Set<string>(); // 병원 이름 검색용 키워드

      // 가장 높은 응급도를 계산합니다. (기본은 NORMAL)
      let maxUrgency: UrgencyLevel = "NORMAL";

      // [분석 결과 처리 로직]
      if (matchedRules.length === 0) {
        // 1. 매칭된 규칙이 하나도 없을 때
        displayTitle = "가까운 병원";
        displayDesc =
          "증상을 명확히 파악하기 어려워 일반 진료 병원을 추천합니다.";
        // 기본적으로 갈 수 있는 병원 유형들을 추가합니다.
        ["종합병원", "병원", "의원", "내과"].forEach((t) =>
          finalTargetTypes.add(t)
        );
      } else {
        // 2. 매칭된 규칙이 있을 때 -> 응급도 판단
        const hasEmergency = matchedRules.some(
          (r) => r.urgency === "EMERGENCY"
        );
        const hasUrgent = matchedRules.some((r) => r.urgency === "URGENT");

        // 응급 > 야간 > 일반 순으로 우선순위 결정
        if (hasEmergency) maxUrgency = "EMERGENCY";
        else if (hasUrgent) maxUrgency = "URGENT";

        // 화면에 보여줄 진료과목 이름들을 뽑아냅니다.
        const depts = matchedRules
          .filter((r) => r.dept !== "24시 진료/응급실") // 중복 표시 방지
          .map((r) => r.dept);
        const uniqueDepts = Array.from(new Set(depts)).join(", ");

        // 응급도에 따라 제목과 설명을 설정합니다.
        if (maxUrgency === "EMERGENCY") {
          displayTitle = "응급 상황 감지";
          displayDesc =
            "즉시 처치가 가능한 종합병원 및 응급의료기관을 추천합니다.";
          finalTargetTypes.add("종합병원"); // 응급 시엔 종합병원 필수
        } else if (maxUrgency === "URGENT") {
          displayTitle = uniqueDepts
            ? `${uniqueDepts} (야간/진료가능)`
            : "야간/휴일 진료";
          displayDesc = "현재 진료 가능성이 높은 대형 병원을 우선 추천합니다.";
          finalTargetTypes.add("종합병원");
        } else {
          // 일반적인 경우
          displayTitle = uniqueDepts;
          displayDesc =
            matchedRules.length > 1
              ? "여러 증상이 복합되어 종합적인 진료가 필요해 보입니다."
              : matchedRules[0].desc + " 관련 전문 병원을 우선 추천합니다.";
        }

        // 분석된 규칙에 따라 찾을 병원 유형과 키워드를 수집합니다.
        matchedRules.forEach((rule) => {
          rule.targetTypes.forEach((t) => finalTargetTypes.add(t));
          // 특수 키워드(야간, 응급)는 병원 이름 매칭에서는 제외합니다.
          if (rule.dept !== "24시 진료/응급실" && rule.dept !== "응급의학과") {
            keywordsToFilter.add(rule.dept.split("/")[0]);
          }
        });
      }

      // 3. [1차 필터링] 병원 종류나 이름이 일치하는 병원만 뽑습니다.
      let filtered = dbHospitals.filter((h) => {
        // 좌표가 없는 데이터는 제외 (안전장치)
        if (!h.lat || !h.lng) return false;

        const category = (h.treatCategory || h.type || "").toString();
        const name = (h.name || "").toString();

        const targetArray = Array.from(finalTargetTypes);
        const keywordArray = Array.from(keywordsToFilter);

        // 카테고리가 일치하거나
        const isTypeMatch = targetArray.some((t) => category.includes(t));
        // 이름에 키워드가 포함되어 있으면 합격
        const isNameMatch = keywordArray.some((k) => name.includes(k));

        // 예외: 치과는 엄격하게 체크 (내과 검색에 치과 안 나오게)
        if (keywordsToFilter.has("치과") && !keywordsToFilter.has("내과")) {
          return category.includes("치과") || name.includes("치과");
        }
        return isTypeMatch || isNameMatch;
      });

      // 4. [2차 정렬] 점수 시스템으로 순위를 매깁니다.
      filtered.sort((a, b) => {
        const nameA = a.name || "";
        const nameB = b.name || "";
        const catA = a.treatCategory || "";
        const catB = b.treatCategory || "";

        let scoreA = 0;
        let scoreB = 0;

        // A. 키워드가 이름에 포함되면 가산점 (예: '튼튼정형외과')
        keywordsToFilter.forEach((k) => {
          if (nameA.includes(k)) scoreA += 3;
          if (nameB.includes(k)) scoreB += 3;
          if (catA.includes(k)) scoreA += 2;
          if (catB.includes(k)) scoreB += 2;
        });

        // B. 종합병원 가중치 로직
        const isGeneralA =
          catA.includes("종합") ||
          nameA.includes("종합") ||
          catA.includes("대학") ||
          nameA.includes("대학");
        const isGeneralB =
          catB.includes("종합") ||
          nameB.includes("종합") ||
          catB.includes("대학") ||
          nameB.includes("대학");

        // 상황별 가중치 부여
        if (maxUrgency === "EMERGENCY" || maxUrgency === "URGENT") {
          // 응급/야간: 종합병원에 큰 점수 (+10)
          if (isGeneralA) scoreA += 10;
          if (isGeneralB) scoreB += 10;
        } else if (matchedRules.length > 1) {
          // 복합 증상: 종합병원에 중간 점수 (+5)
          if (isGeneralA) scoreA += 5;
          if (isGeneralB) scoreB += 5;
        } else {
          // 일반 증상: 전문 의원에 집중하되 종합병원도 살짝 추천 (+1)
          if (isGeneralA) scoreA += 1;
          if (isGeneralB) scoreB += 1;
        }

        // 점수가 높은 순서대로 정렬 (내림차순)
        return scoreB - scoreA;
      });

      // 상위 5개만 잘라서 보여줍니다.
      const limitedResult = filtered.slice(0, 5);

      // 최종 결과를 state에 저장하여 화면을 갱신합니다.
      setResult({
        departmentTitle: displayTitle,
        desc: displayDesc,
        matchedHospitals: limitedResult,
        urgencyLevel: maxUrgency,
        isComplex: matchedRules.length > 1,
      });
      setIsAnalyzing(false); // 로딩 종료
    }, 1500);
  };

  // 초기화 버튼 핸들러 (입력창으로 돌아가기)
  const handleReset = () => {
    setSymptom("");
    setResult(null);
  };

  // 응급도에 따라 색상 테마를 반환하는 함수 (UI 디자인용)
  const getThemeColor = (urgency: UrgencyLevel) => {
    switch (urgency) {
      case "EMERGENCY": // 빨간색 테마
        return {
          bg: "bg-red-50",
          border: "border-red-500",
          text: "text-red-700",
          badge: "bg-red-100 text-red-800",
          hoverBorder: "hover:border-red-400",
          bar: "bg-red-500",
          icon: <Siren size={18} className="text-red-600 animate-pulse" />,
        };
      case "URGENT": // 주황색 테마
        return {
          bg: "bg-amber-50",
          border: "border-amber-400",
          text: "text-amber-800",
          badge: "bg-amber-100 text-amber-900",
          hoverBorder: "hover:border-amber-400",
          bar: "bg-amber-500",
          icon: <Clock size={18} className="text-amber-600" />,
        };
      default: // 초록색(기본) 테마
        return {
          bg: "bg-white",
          border: "border-green-500",
          text: "text-green-600",
          badge: "bg-green-100 text-green-700",
          hoverBorder: "hover:border-green-400",
          bar: "bg-green-500",
          icon: <CheckCircle2 size={18} className="text-green-600" />,
        };
    }
  };

  // --- [화면 렌더링] ---
  return (
    <div className="bg-gradient-to-br from-slate-50 to-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm relative overflow-hidden group">
      {/* 배경 장식용 효과 */}
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-green-100 rounded-full blur-3xl opacity-50 group-hover:opacity-100 transition-opacity" />

      <div className="relative z-10">
        {/* 상단 헤더 영역 */}
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 bg-green-100 text-green-600 rounded-xl">
            <Sparkles size={18} className={isAnalyzing ? "animate-spin" : ""} />
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-800 leading-tight">
              AI 증상 상담소
            </h3>
            <p className="text-xs text-slate-400 font-medium">
              증상과 상황을 말하면 딱 맞는 병원을 추천해요.
            </p>
          </div>
        </div>

        {/* 결과가 없을 때 (= 입력 화면) */}
        {!result ? (
          <div className="space-y-3">
            <textarea
              value={symptom}
              onChange={(e) => setSymptom(e.target.value)}
              placeholder="예: 숨쉬기가 힘들어요(응급) / 밤인데 배가 아파요(야간)"
              className="w-full h-24 p-4 bg-white border border-slate-200 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 resize-none transition-all placeholder:text-slate-300"
              disabled={isAnalyzing}
            />
            <button
              onClick={handleAnalyze}
              disabled={!symptom || isAnalyzing}
              className={`w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg ${
                !symptom || isAnalyzing
                  ? "bg-slate-100 text-slate-400 cursor-not-allowed shadow-none"
                  : "bg-slate-900 text-white hover:bg-green-600 hover:shadow-green-200"
              }`}
            >
              {isAnalyzing ? (
                <>
                  <Activity size={16} className="animate-pulse" /> 증상
                  분석중...
                </>
              ) : (
                <>
                  <Search size={16} /> 병원 찾아보기
                </>
              )}
            </button>
          </div>
        ) : (
          // 결과가 있을 때 (= 추천 리스트 화면)
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            {/* 결과 요약 카드 */}
            <div
              className={`border-2 rounded-2xl p-5 mb-4 shadow-md relative ${
                getThemeColor(result.urgencyLevel).bg
              } ${getThemeColor(result.urgencyLevel).border}`}
            >
              {/* 닫기 버튼 */}
              <button
                onClick={handleReset}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X size={16} />
              </button>

              {/* 분석 결과 뱃지 */}
              <div className="flex items-center gap-2 mb-2">
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 ${
                    getThemeColor(result.urgencyLevel).badge
                  }`}
                >
                  {getThemeColor(result.urgencyLevel).icon}
                  {result.urgencyLevel === "EMERGENCY"
                    ? "응급 상황 (Code Red)"
                    : result.urgencyLevel === "URGENT"
                    ? "야간/준응급 상황"
                    : "AI 분석 완료"}
                </span>
              </div>

              {/* 추천 제목 및 설명 */}
              <h4
                className={`text-xl font-black mb-1 leading-snug ${
                  getThemeColor(result.urgencyLevel).text
                }`}
              >
                {result.departmentTitle}
              </h4>
              <p className="text-xs text-slate-600 font-medium leading-relaxed mb-0">
                {result.desc}
              </p>
            </div>

            {/* 추천 병원 리스트 */}
            <div className="mb-4">
              <div className="flex justify-between items-end mb-3 px-1">
                <h5 className="text-sm font-bold text-slate-800 flex items-center gap-1">
                  {result.urgencyLevel === "EMERGENCY" ? (
                    <AlertTriangle size={14} className="text-red-500" />
                  ) : (
                    <Activity size={14} className="text-green-500" />
                  )}
                  추천 병원 TOP {result.matchedHospitals.length}
                </h5>
              </div>

              {/* 리스트 아이템 렌더링 */}
              {result.matchedHospitals.length > 0 ? (
                <div className="space-y-2 pr-1">
                  {result.matchedHospitals.map((h, idx) => (
                    <div
                      key={h.id}
                      // 1. 박스 전체 클릭 시: 부모 컴포넌트의 지도 이동 함수 실행
                      onClick={() => {
                        if (onSelectHospital) onSelectHospital(h);
                      }}
                      className={`bg-white p-3 rounded-xl border border-slate-100 hover:shadow-md transition-all cursor-pointer flex justify-between items-center group relative overflow-hidden ${
                        getThemeColor(result.urgencyLevel).hoverBorder
                      }`}
                    >
                      {/* 1순위 추천 병원에는 왼쪽 컬러 바 표시 */}
                      {idx === 0 && (
                        <div
                          className={`absolute top-0 left-0 w-1 h-full ${
                            getThemeColor(result.urgencyLevel).bar
                          }`}
                        />
                      )}

                      {/* 병원 정보 표시 영역 */}
                      <div className="overflow-hidden flex-1 pl-2 pr-2">
                        <div className="flex justify-between items-start mb-0.5">
                          <p className="text-xs font-bold text-slate-800 truncate transition-colors flex-1 group-hover:text-slate-900">
                            {h.name}
                          </p>
                          <span className="text-[9px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded ml-2 shrink-0">
                            {h.treatCategory || h.type || "병원"}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 truncate flex items-center gap-1">
                          <MapPin size={10} /> {h.address}
                        </p>
                      </div>

                      {/* 2. 상세보기 버튼 (클릭 시 상세 페이지로 이동) */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation(); // 부모 클릭 이벤트(지도 이동) 막음
                          router.push(`/hospital/${h.id}`); // 상세 페이지로 이동
                        }}
                        className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-green-600 rounded-lg transition-colors text-[10px] font-bold border border-slate-100 shrink-0"
                      >
                        상세 <ExternalLink size={10} />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                // 추천 결과가 없을 때 표시
                <div className="text-center py-6 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  <AlertCircle
                    size={20}
                    className="text-slate-300 mx-auto mb-2"
                  />
                  <p className="text-xs text-slate-400 mb-1">
                    딱 맞는 병원을 찾지 못했어요.
                  </p>
                  {result.urgencyLevel === "EMERGENCY" && (
                    <p className="text-[10px] text-red-500 font-bold mt-1">
                      즉시 119에 연락하거나 가까운 응급실로 이동하세요!
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* 다시 검색하기 버튼 */}
            <button
              onClick={handleReset}
              className="w-full py-3 bg-slate-100 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-200 transition-colors flex items-center justify-center gap-1"
            >
              다시 검색하기
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
// 준비 단계 (Component Mount)

// 페이지가 열리자마자(useEffect), 이 컴포넌트는 백그라운드에서 병원 데이터를 서버로부터 가져옵니다.

// 가져온 주소("대전 서구 둔산동...")를 지도에서 쓸 수 있는 **좌표(위도, 경도)**로 미리 변환해 둡니다. (나중에 클릭하면 바로 이동하려고요!)

// 사용자 입력 (Input)

// 사용자가 "밤인데 배가 너무 아파요"라고 입력하고 [병원 찾아보기] 버튼을 누릅니다.

// AI 분석 및 판단 (Analysis Logic)

// 키워드 분석: 입력된 문장에서 "밤(야간)", "배(내과)", "아파요" 같은 단어를 찾아냅니다.

// 응급도 판단: "밤"이라는 단어 때문에 '야간/준응급' 상황으로 판단하고, 테마 색상을 주황색으로 결정합니다. (숨 안 쉬어지면 빨간색!)

// 병원 필터링: 미리 로딩해둔 병원 목록 중에서 '내과' 진료가 가능하거나, 야간 진료가 가능한 '종합병원'을 추려냅니다.

// 순위 매기기: 야간이니까 동네 작은 의원보다는 종합병원에 더 높은 점수를 줘서 리스트 상단에 올립니다.

// 결과 보여주기 (Rendering)

// 분석이 끝나면 입력창이 사라지고 **추천 병원 리스트(TOP 5)**가 뜹니다.

// 박스 클릭 시: 지도가 해당 병원 위치로 이동합니다.

// 상세 버튼 클릭 시: 해당 병원의 상세 페이지로 이동합니다.
