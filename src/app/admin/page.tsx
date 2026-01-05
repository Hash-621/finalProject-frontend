"use client";

import React, { useState, useEffect, useRef } from "react";
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

// 타입 정의
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
const serverURL = process.env.NEXT_PUBLIC_API_URL;
// ==========================================
// [Real API] 백엔드 연동
// ==========================================
const fetchDashboardData = async (): Promise<DashboardMetrics | null> => {
  try {
    const res = await fetch(`${serverURL}/api/v1/admin/stats`, {
      method: "GET",
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`Server Error: ${res.status}`);
    return await res.json();
  } catch (error) {
    console.error("Failed to fetch:", error);
    return null;
  }
};

// ==========================================
// [Chart Components]
// ==========================================

// 1. 방문자 차트 (기존 동일)
const VisitorChart = ({ data }: { data: VisitorTrend }) => {
  const chartData: ChartData<"line"> = {
    labels: data.labels,
    datasets: [
      {
        label: "This Week",
        data: data.thisWeek,
        borderColor: "rgb(53, 162, 235)",
        backgroundColor: "rgba(53, 162, 235, 0.5)",
        tension: 0.4,
      },
    ],
  };
  const options: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "top" },
      title: { display: true, text: "Visitor Trends" },
    },
  };
  return (
    <div style={{ height: "300px" }}>
      <Line options={options} data={chartData} />
    </div>
  );
};

// 2. 유입 경로 차트 (기존 동일)
const TrafficSourceChart = ({ data }: { data: TrafficSource }) => {
  const chartData: ChartData<"doughnut"> = {
    labels: data.labels,
    datasets: [
      {
        data: data.data,
        backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0"],
      },
    ],
  };
  const options: ChartOptions<"doughnut"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "right" },
      title: { display: true, text: "Traffic Sources" },
    },
  };
  return (
    <div style={{ height: "300px" }}>
      <Doughnut options={options} data={chartData} />
    </div>
  );
};

// ==========================================
// ★ [핵심 수정] 3. 실시간 서버 트래픽 차트
// ==========================================
const ServerTrafficChart = ({ data }: { data: ServerTraffic }) => {
  const chartData: ChartData<"line"> = {
    labels: data.labels,
    datasets: [
      {
        fill: true,
        label: "CPU Usage (%)",
        data: data.cpu,
        borderColor: "rgb(75, 192, 192)",
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        tension: 0.3,
        pointRadius: 0, // 점 숨기기 (선만 보이게)
      },
    ],
  };

  const options: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 0, // ★ 중요: 깜빡임 방지 (데이터 갱신 시 애니메이션 끄기)
    },
    scales: {
      x: {
        display: false, // X축 라벨(시간)이 너무 많아지므로 숨김 처리 (깔끔하게)
      },
      y: {
        min: 0,
        max: 100,
        ticks: { stepSize: 20 },
      },
    },
    plugins: {
      title: { display: true, text: "Real-time Server CPU" },
    },
  };

  return (
    <div style={{ height: "300px" }}>
      <Line options={options} data={chartData} />
    </div>
  );
};

// ==========================================
// [Main Page]
// ==========================================
export default function DashboardPage() {
  // 초기 상태: 빈 껍데기
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    visitorTrend: { labels: [], thisWeek: [], lastWeek: [] },
    trafficSource: { labels: [], data: [] },
    serverTraffic: { labels: [], cpu: [] }, // 처음엔 빈 배열
  });

  // React StrictMode 방지용 Ref
  const isVisited = useRef(false);

  // 1. 방문자 기록 (최초 1회 실행)
  useEffect(() => {
    if (isVisited.current) return;
    const logVisit = async () => {
      try {
        await fetch(`${serverURL}/api/v1/admin/visit`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            currentUrl: window.location.href,
            referrer: document.referrer,
          }),
        });
        isVisited.current = true;
      } catch (e) {
        console.error(e);
      }
    };
    logVisit();
  }, []);

  // 2. ★ 데이터 폴링 (2초마다 실행)
  useEffect(() => {
    const fetchData = async () => {
      const newData = await fetchDashboardData();
      if (!newData) return;

      setMetrics((prev) => {
        // A. 기존 CPU 데이터 가져오기 (없으면 빈 배열)
        const prevLabels = prev.serverTraffic.labels;
        const prevCpu = prev.serverTraffic.cpu;

        // B. 새로운 데이터(점 1개) 가져오기
        // 백엔드에서 리스트로 주지만 0번째가 최신값이라고 가정
        const newLabelPoint = newData.serverTraffic.labels[0] || "";
        const newCpuPoint = newData.serverTraffic.cpu[0] || 0;

        // C. 배열 합치기 (최대 20개까지만 유지)
        // [구 데이터 19개] + [새 데이터 1개]
        const maxDataPoints = 20;
        const updatedLabels = [...prevLabels, newLabelPoint].slice(
          -maxDataPoints
        );
        const updatedCpu = [...prevCpu, newCpuPoint].slice(-maxDataPoints);

        return {
          visitorTrend: newData.visitorTrend, // 얘는 그냥 덮어쓰기
          trafficSource: newData.trafficSource, // 얘도 덮어쓰기
          serverTraffic: {
            labels: updatedLabels, // 누적된 배열 저장
            cpu: updatedCpu, // 누적된 배열 저장
          },
        };
      });
    };

    // 최초 실행
    fetchData();

    // 2초마다 반복 (Real-time 효과)
    const intervalId = setInterval(fetchData, 2000);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <main
      style={{
        padding: "20px",
        backgroundColor: "#f5f7fa",
        minHeight: "100vh",
      }}
    >
      <h1
        style={{ marginBottom: "24px", fontSize: "24px", fontWeight: "bold" }}
      >
        Admin Dashboard
      </h1>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(12, 1fr)",
          gap: "20px",
          maxWidth: "1200px",
          margin: "0 auto",
        }}
      >
        {/* 방문자 */}
        <div
          style={{
            backgroundColor: "#fff",
            padding: "20px",
            borderRadius: "12px",
            gridColumn: "span 12",
          }}
        >
          <VisitorChart data={metrics.visitorTrend} />
        </div>

        {/* 유입 경로 */}
        <div
          style={{
            backgroundColor: "#fff",
            padding: "20px",
            borderRadius: "12px",
            gridColumn: "span 4",
          }}
        >
          <TrafficSourceChart data={metrics.trafficSource} />
        </div>

        {/* 서버 트래픽 (실시간) */}
        <div
          style={{
            backgroundColor: "#fff",
            padding: "20px",
            borderRadius: "12px",
            gridColumn: "span 8",
          }}
        >
          <ServerTrafficChart data={metrics.serverTraffic} />
        </div>
      </div>
    </main>
  );
}
