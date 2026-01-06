"use client";

import React, { useState, useEffect } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler,
  ChartOptions,
  ChartData,
} from "chart.js";
import { Line, Doughnut } from "react-chartjs-2";
import { fetchClient } from "@/utils/api"; // 아까 만든 API 클라이언트
import useAdminCheck from "@/hooks/useAdminCheck"; // 아까 만든 권한 체크 훅

// Chart.js 플러그인 등록
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

// --- 타입 정의 ---
interface VisitorTrend {
  labels: string[];
  thisWeek: number[];
  lastWeek: number[];
}
interface TrafficSource {
  labels: string[];
  data: number[];
}
interface ServerTraffic {
  labels: string[];
  cpu: number[];
}
interface DashboardMetrics {
  visitorTrend: VisitorTrend;
  trafficSource: TrafficSource;
  serverTraffic: ServerTraffic;
}

// --- 차트 컴포넌트들 ---

// 1. 방문자 차트 (꺾은선)
const VisitorChart = ({ data }: { data: VisitorTrend }) => {
  const chartData: ChartData<"line"> = {
    labels: data.labels,
    datasets: [
      {
        label: "이번 주",
        data: data.thisWeek,
        borderColor: "rgb(53, 162, 235)",
        backgroundColor: "rgba(53, 162, 235, 0.2)",
        tension: 0.4,
        fill: true,
      },
      {
        label: "지난 주",
        data: data.lastWeek,
        borderColor: "rgb(201, 203, 207)",
        backgroundColor: "rgba(201, 203, 207, 0.2)",
        tension: 0.4,
        borderDash: [5, 5], // 점선
        fill: false,
      },
    ],
  };
  const options: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "top" },
      title: { display: true, text: "주간 방문자 추이" },
    },
    scales: { y: { beginAtZero: true } },
  };
  return (
    <div style={{ height: "300px" }}>
      <Line options={options} data={chartData} />
    </div>
  );
};

// 2. 유입 경로 차트 (도넛)
const TrafficSourceChart = ({ data }: { data: TrafficSource }) => {
  const chartData: ChartData<"doughnut"> = {
    labels: data.labels,
    datasets: [
      {
        data: data.data,
        backgroundColor: [
          "#FF6384",
          "#36A2EB",
          "#FFCE56",
          "#4BC0C0",
          "#9966FF",
        ],
      },
    ],
  };
  const options: ChartOptions<"doughnut"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "right" },
      title: { display: true, text: "유입 경로" },
    },
  };
  return (
    <div style={{ height: "300px" }}>
      <Doughnut options={options} data={chartData} />
    </div>
  );
};

// 3. 서버 CPU 차트 (실시간)
const ServerTrafficChart = ({ data }: { data: ServerTraffic }) => {
  const chartData: ChartData<"line"> = {
    labels: data.labels,
    datasets: [
      {
        fill: true,
        label: "CPU 사용량 (%)",
        data: data.cpu,
        borderColor: "rgb(75, 192, 192)",
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        tension: 0.3,
        pointRadius: 0,
      },
    ],
  };
  const options: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 0 }, // 깜빡임 방지 (실시간 느낌)
    scales: {
      x: { display: false }, // X축 라벨 숨김 (깔끔하게)
      y: { min: 0, max: 100 },
    },
    plugins: { title: { display: true, text: "실시간 서버 CPU" } },
  };
  return (
    <div style={{ height: "300px" }}>
      <Line options={options} data={chartData} />
    </div>
  );
};

// --- 메인 페이지 컴포넌트 ---
export default function AdminPage() {
  // 1. 관리자 권한 체크 (Hook 사용)
  const { isAdmin, loading: authLoading } = useAdminCheck();

  // 2. 초기 데이터 상태 (빈 껍데기)
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    visitorTrend: { labels: [], thisWeek: [], lastWeek: [] },
    trafficSource: { labels: [], data: [] },
    serverTraffic: { labels: [], cpu: [] },
  });

  // 3. 데이터 가져오는 함수
  const fetchData = async () => {
    try {
      // ★ 중요: fetchClient 사용 (쿠키 자동 포함)
      // 백엔드 경로가 /api/v1/admin/stats 라고 가정
      // fetchClient 내부에서 BASE_URL(/api/v1)을 붙여주므로 여기선 나머지만 작성
      const data = await fetchClient("api/v1/admin");

      if (data) {
        setMetrics((prev) => {
          // CPU 데이터 누적 로직 (큐 구조: 데이터가 흐르는 효과)
          const prevLabels = prev.serverTraffic.labels;
          const prevCpu = prev.serverTraffic.cpu;

          // 새로 받은 데이터 (보통 배열로 오지만 하나만 꺼내 씀)
          const newLabel =
            data.serverTraffic.labels[0] || new Date().toLocaleTimeString();
          const newCpu = data.serverTraffic.cpu[0] || 0;

          const maxLen = 20; // 그래프에 점 20개만 유지
          return {
            ...data, // 방문자, 유입경로는 서버 데이터 그대로 사용
            serverTraffic: {
              // 기존 데이터 뒤에 새 데이터 붙이고, 오래된 건 자름
              labels: [...prevLabels, newLabel].slice(-maxLen),
              cpu: [...prevCpu, newCpu].slice(-maxLen),
            },
          };
        });
      }
    } catch (e) {
      console.error("데이터 로딩 실패", e);
    }
  };

  // 4. 주기적 폴링 (2초마다 갱신)
  useEffect(() => {
    if (!isAdmin) return; // 관리자 아니면 요청 안 함

    fetchData(); // 최초 1회 즉시 실행
    const interval = setInterval(fetchData, 2000); // 2초마다 반복

    return () => clearInterval(interval); // 페이지 나가면 중단
  }, [isAdmin]);

  // 5. 로딩 중이거나 권한 없을 때 화면 숨김
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
        <h2>권한 확인 중...</h2>
      </div>
    );
  }

  // 6. 실제 대시보드 화면
  return (
    <main
      style={{
        padding: "30px",
        backgroundColor: "#f3f4f6",
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

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(12, 1fr)",
          gap: "24px",
        }}
      >
        {/* 방문자 추이 (전체 너비) */}
        <div
          style={{
            gridColumn: "span 12",
            backgroundColor: "white",
            padding: "24px",
            borderRadius: "12px",
            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
          }}
        >
          <VisitorChart data={metrics.visitorTrend} />
        </div>

        {/* 유입 경로 (왼쪽) */}
        <div
          style={{
            gridColumn: "span 4",
            backgroundColor: "white",
            padding: "24px",
            borderRadius: "12px",
            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
          }}
        >
          <TrafficSourceChart data={metrics.trafficSource} />
        </div>

        {/* 서버 CPU (오른쪽) */}
        <div
          style={{
            gridColumn: "span 8",
            backgroundColor: "white",
            padding: "24px",
            borderRadius: "12px",
            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
          }}
        >
          <ServerTrafficChart data={metrics.serverTraffic} />
        </div>
      </div>
    </main>
  );
}
