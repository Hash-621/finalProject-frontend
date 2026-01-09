// 1. "use client": 이 파일이 브라우저에서 실행되는 클라이언트 컴포넌트임을 선언합니다.
// (차트 라이브러리, useEffect, useState 등을 사용하기 위해 필수입니다.)
"use client";

// --- [라이브러리 및 컴포넌트 임포트] ---
import React, { useState, useEffect } from "react"; // 리액트 기본 훅
// Chart.js 관련 모듈들을 가져옵니다. (차트를 그리기 위한 핵심 도구들)
import {
  Chart as ChartJS,
  CategoryScale, // X축 (카테고리형)
  LinearScale, // Y축 (숫자형)
  PointElement, // 점
  LineElement, // 선
  Title, // 차트 제목
  Tooltip, // 마우스 올렸을 때 설명창
  Legend, // 범례 (데이터 이름)
  ArcElement, // 원형 차트용 호
  Filler, // 영역 채우기
  ChartOptions, // 차트 옵션 타입
  ChartData, // 차트 데이터 타입
} from "chart.js";
// 리액트용 Chart.js 래퍼 컴포넌트 (Line: 선 차트, Doughnut: 도넛 차트)
import { Line, Doughnut } from "react-chartjs-2";
import { fetchClient } from "@/utils/api"; // API 호출 유틸리티 함수
import useAdminCheck from "@/hooks/useAdminCheck"; // 관리자 권한 확인 커스텀 훅
import { useRouter } from "next/navigation"; // 페이지 이동 훅

// Chart.js에 필요한 플러그인들을 등록합니다. (반드시 해야 차트가 나옵니다)
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler
);

// --- [타입 정의] ---
// 방문자 추이 데이터 타입
interface VisitorTrend {
  labels: string[]; // 날짜 라벨 (예: ["월", "화", ...])
  thisWeek: number[]; // 이번 주 방문자 수 데이터
}

// 유입 경로 데이터 타입
interface TrafficSource {
  labels: string[]; // 경로 이름 (예: ["검색", "SNS", ...])
  data: number[]; // 각 경로별 비율 데이터
}

// 서버 트래픽(CPU) 데이터 타입
interface ServerTraffic {
  labels: string[]; // 시간 라벨
  cpu: number[]; // CPU 사용량 (%)
}

// 전체 대시보드 데이터 타입
interface DashboardDto {
  visitorTrend: VisitorTrend;
  trafficSource: TrafficSource;
  serverTraffic: ServerTraffic;
}

// --- [차트 컴포넌트들] ---

// (1) 방문자 차트 컴포넌트 (선 그래프)
const VisitorChart = ({ data }: { data: VisitorTrend }) => {
  // 차트에 들어갈 데이터 설정
  const chartData: ChartData<"line"> = {
    labels: data.labels,
    datasets: [
      {
        label: "방문자 수", // 데이터셋 이름
        data: data.thisWeek, // 실제 데이터 배열
        borderColor: "rgb(53, 162, 235)", // 선 색상 (파란색)
        backgroundColor: "rgba(53, 162, 235, 0.2)", // 채우기 색상 (연한 파란색)
        tension: 0.4, // 곡선 부드러움 정도 (0이면 직선)
        fill: true, // 선 아래 영역 채우기 활성화
      },
    ],
  };

  // 차트 옵션 설정
  const options: ChartOptions<"line"> = {
    responsive: true, // 화면 크기에 반응형으로 동작
    maintainAspectRatio: false, // 부모 컨테이너 크기에 맞춤
    plugins: {
      legend: { display: false }, // 범례 숨김 (데이터가 1개라 불필요)
      title: { display: true, text: "최근 7일 방문자 추이" }, // 차트 제목
    },
    scales: {
      y: {
        beginAtZero: true, // Y축 0부터 시작
        ticks: { stepSize: 1 }, // 눈금을 1단위로 표시 (사람 수는 정수니까)
      },
    },
  };

  return (
    <div style={{ height: "300px" }}>
      <Line options={options} data={chartData} />
    </div>
  );
};

// (2) 유입 경로 차트 컴포넌트 (도넛 그래프)
const TrafficSourceChart = ({ data }: { data: TrafficSource }) => {
  const chartData: ChartData<"doughnut"> = {
    labels: data.labels,
    datasets: [
      {
        data: data.data,
        // 각 조각별 색상 지정
        backgroundColor: [
          "#FF6384",
          "#36A2EB",
          "#FFCE56",
          "#4BC0C0",
          "#9966FF",
          "#FF9F40",
        ],
      },
    ],
  };

  const options: ChartOptions<"doughnut"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "right" }, // 범례를 오른쪽에 배치
      title: { display: true, text: "접속 경로" },
    },
  };

  return (
    <div style={{ height: "300px" }}>
      <Doughnut options={options} data={chartData} />
    </div>
  );
};

// (3) 서버 CPU 차트 컴포넌트 (실시간 선 그래프)
const ServerTrafficChart = ({ data }: { data: ServerTraffic }) => {
  const chartData: ChartData<"line"> = {
    labels: data.labels,
    datasets: [
      {
        fill: true,
        label: "CPU Load (%)",
        data: data.cpu,
        borderColor: "rgb(75, 192, 192)", // 청록색 선
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        tension: 0.3,
        pointRadius: 0, // 데이터 포인트 점 숨김 (깔끔하게 보이기 위해)
      },
    ],
  };

  const options: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 0 }, // 실시간 업데이트 시 깜빡임 방지를 위해 애니메이션 끔
    scales: {
      x: { display: false }, // X축 라벨 숨김 (너무 많아지면 지저분하므로)
      y: { min: 0, max: 100 }, // Y축 범위 0~100% 고정
    },
    plugins: { title: { display: true, text: "실시간 서버 부하 (CPU)" } },
  };

  return (
    <div style={{ height: "300px" }}>
      <Line options={options} data={chartData} />
    </div>
  );
};

// --- 3. 메인 관리자 페이지 컴포넌트 ---
export default function AdminPage() {
  const router = useRouter(); // 라우터
  // 커스텀 훅을 통해 관리자 여부와 로딩 상태 확인
  const { isAdmin, loading: authLoading } = useAdminCheck();

  // 대시보드 데이터 상태 관리 (초기값은 빈 배열)
  const [metrics, setMetrics] = useState<DashboardDto>({
    visitorTrend: { labels: [], thisWeek: [] },
    trafficSource: { labels: [], data: [] },
    serverTraffic: { labels: [], cpu: [] },
  });

  // 데이터 가져오기 함수
  const fetchData = async () => {
    try {
      // 서버 API 호출
      const data: DashboardDto = await fetchClient("/api/v1/admin/stats");

      if (data) {
        setMetrics((prev) => {
          // 서버 트래픽 데이터 누적 처리 로직
          // (새 데이터만 가져오지만 그래프는 과거 데이터도 보여줘야 하므로 합칩니다)

          // 최신 라벨(시간)과 CPU 값 추출 (없으면 현재 시간/0 사용)
          const latestLabel =
            data.serverTraffic.labels[0] || new Date().toLocaleTimeString();
          const latestCpu = data.serverTraffic.cpu[0] || 0;

          // 기존 라벨 배열 뒤에 최신 라벨 추가 후, 뒤에서부터 20개만 남김
          const newCpuLabels = [
            ...prev.serverTraffic.labels,
            latestLabel,
          ].slice(-20);

          // 기존 CPU 데이터 뒤에 최신 값 추가 후, 뒤에서부터 20개만 남김
          const newCpuData = [...prev.serverTraffic.cpu, latestCpu].slice(-20);

          return {
            visitorTrend: data.visitorTrend, // 방문자는 그대로 덮어쓰기
            trafficSource: data.trafficSource, // 유입 경로도 그대로 덮어쓰기
            serverTraffic: {
              labels: newCpuLabels, // 누적된 라벨 배열
              cpu: newCpuData, // 누적된 데이터 배열
            },
          };
        });
      }
    } catch (e) {
      console.error("대시보드 데이터 로딩 실패:", e);
    }
  };

  // --- [데이터 폴링 (Polling)] ---
  // 관리자 권한이 확인되면 2초마다 데이터를 새로고침합니다.
  useEffect(() => {
    if (!isAdmin) return; // 관리자 아니면 실행 안 함
    fetchData(); // 최초 1회 실행
    const interval = setInterval(fetchData, 2000); // 2초마다 반복 실행 설정
    return () => clearInterval(interval); // 컴포넌트 사라질 때 타이머 해제 (메모리 누수 방지)
  }, [isAdmin]);

  // --- [권한 체크 및 리다이렉트] ---
  useEffect(() => {
    // 로딩이 끝났는데 관리자가 아니라면?
    if (!authLoading && !isAdmin) {
      alert("접근 권한이 없습니다."); // 경고창 띄우고
      router.replace("/"); // 메인 페이지로 쫓아냄
    }
  }, [authLoading, isAdmin, router]);

  // --- [화면 렌더링] ---

  // (1) 권한 확인 중이거나 관리자가 아니면 로딩 화면만 보여줌 (내용 숨김)
  if (authLoading || !isAdmin) {
    return (
      <div
        style={{
          display: "flex",
          height: "100vh",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <h2>관리자 권한 확인 중...</h2>
      </div>
    );
  }

  // (2) 관리자 확인 완료 시 대시보드 렌더링
  return (
    <main
      style={{
        padding: "30px",
        backgroundColor: "#f3f4f6", // 밝은 회색 배경
        minHeight: "100vh",
      }}
    >
      <h1
        style={{
          fontSize: "28px",
          fontWeight: "bold",
          marginBottom: "30px",
          color: "#1f2937",
        }}
      >
        관리자 대시보드
      </h1>

      {/* 그리드 레이아웃 (12칸) */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(12, 1fr)",
          gap: "24px",
        }}
      >
        {/* 1. 방문자 추이 차트 (가로 전체 차지 - span 12) */}
        <div
          style={{
            gridColumn: "span 12",
            backgroundColor: "white",
            padding: "24px",
            borderRadius: "12px",
            boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
          }}
        >
          <VisitorChart data={metrics.visitorTrend} />
        </div>

        {/* 2. 유입 경로 차트 (왼쪽 4칸 차지 - span 4) */}
        <div
          style={{
            gridColumn: "span 4",
            backgroundColor: "white",
            padding: "24px",
            borderRadius: "12px",
            boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
          }}
        >
          <TrafficSourceChart data={metrics.trafficSource} />
        </div>

        {/* 3. 서버 CPU 차트 (오른쪽 8칸 차지 - span 8) */}
        <div
          style={{
            gridColumn: "span 8",
            backgroundColor: "white",
            padding: "24px",
            borderRadius: "12px",
            boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
          }}
        >
          <ServerTrafficChart data={metrics.serverTraffic} />
        </div>
      </div>
    </main>
  );
}

// 1. 권한 확인 (Auth Check)

// 페이지가 열리면 useAdminCheck 훅이 가장 먼저 실행됩니다.

// 서버에 "지금 접속한 사람 관리자 맞아?"라고 묻습니다.

// 확인될 때까지 화면에는 "관리자 권한 확인 중..." 메시지만 뜹니다.

// 만약 일반 유저가 URL을 치고 들어왔다면? -> "접근 권한이 없습니다." 경고창이 뜨고 메인 페이지로 강제 추방됩니다.

// 2. 데이터 폴링 시작 (Polling Start)

// 관리자로 확인되면(isAdmin === true), useEffect가 작동합니다.

// fetchData 함수가 실행되어 서버에 통계 데이터를 요청합니다.

// 그리고 setInterval이 타이머를 켭니다. 이제 2초마다 자동으로 fetchData가 실행되어 데이터를 갱신합니다.

// 3. 데이터 가공 및 상태 업데이트 (Data Processing)

// 서버에서 데이터를 받아옵니다.

// 특히 CPU 데이터는 과거의 흐름을 보여줘야 하므로, 기존 배열(prev.cpu) 뒤에 새 값을 붙이고, 너무 길어지지 않게 최근 20개만 잘라서 저장합니다.

// 이렇게 하면 차트가 왼쪽으로 흐르는 듯한 애니메이션 효과를 낼 수 있습니다.

// 4. 차트 렌더링 (Visualization)

// metrics 상태가 업데이트되면 리액트가 화면을 다시 그립니다.

// VisitorChart는 꺾은선 그래프로 이번 주 가입자 수를 보여줍니다.

// TrafficSourceChart는 알록달록한 도넛 그래프로 가입 경로 비율을 보여줍니다.

// ServerTrafficChart는 2초마다 갱신되는 실시간 그래프로 서버 부하량을 보여줍니다.
