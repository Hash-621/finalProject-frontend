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
import { fetchClient } from "@/utils/api";
import useAdminCheck from "@/hooks/useAdminCheck";

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

// --- 1. 타입 정의 (lastWeek 삭제됨) ---
interface VisitorTrend {
  labels: string[];
  thisWeek: number[];
}

interface TrafficSource {
  labels: string[];
  data: number[];
}

interface ServerTraffic {
  labels: string[];
  cpu: number[];
}

interface DashboardDto {
  visitorTrend: VisitorTrend;
  trafficSource: TrafficSource;
  serverTraffic: ServerTraffic;
}

// --- 2. 차트 컴포넌트들 ---

// (1) 방문자 차트 (데이터셋 1개로 수정)
const VisitorChart = ({ data }: { data: VisitorTrend }) => {
  const chartData: ChartData<"line"> = {
    labels: data.labels,
    datasets: [
      {
        label: "방문자 수", // 라벨 변경
        data: data.thisWeek,
        borderColor: "rgb(53, 162, 235)",
        backgroundColor: "rgba(53, 162, 235, 0.2)",
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const options: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false }, // 선이 하나라 범례가 굳이 필요 없음 (선택사항)
      title: { display: true, text: "최근 7일 가입자 추이" },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { stepSize: 1 }, // 사람 수는 정수로 나오게
      },
    },
  };

  return (
    <div style={{ height: "300px" }}>
      <Line options={options} data={chartData} />
    </div>
  );
};

// (2) 유입 경로 차트 (기존 유지)
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
          "#FF9F40",
        ],
      },
    ],
  };

  const options: ChartOptions<"doughnut"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "right" },
      title: { display: true, text: "가입 경로" },
    },
  };

  return (
    <div style={{ height: "300px" }}>
      <Doughnut options={options} data={chartData} />
    </div>
  );
};

// (3) 서버 CPU 차트 (기존 유지)
const ServerTrafficChart = ({ data }: { data: ServerTraffic }) => {
  const chartData: ChartData<"line"> = {
    labels: data.labels,
    datasets: [
      {
        fill: true,
        label: "CPU Load (%)",
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
    animation: { duration: 0 },
    scales: {
      x: { display: false },
      y: { min: 0, max: 100 },
    },
    plugins: { title: { display: true, text: "실시간 서버 부하 (CPU)" } },
  };

  return (
    <div style={{ height: "300px" }}>
      <Line options={options} data={chartData} />
    </div>
  );
};

// --- 3. 메인 페이지 ---
export default function AdminPage() {
  const { isAdmin, loading: authLoading } = useAdminCheck();

  const [metrics, setMetrics] = useState<DashboardDto>({
    visitorTrend: { labels: [], thisWeek: [] },
    trafficSource: { labels: [], data: [] },
    serverTraffic: { labels: [], cpu: [] },
  });

  const fetchData = async () => {
    try {
      const data: DashboardDto = await fetchClient("/api/v1/admin/stats");

      if (data) {
        setMetrics((prev) => {
          const latestLabel =
            data.serverTraffic.labels[0] || new Date().toLocaleTimeString();
          const latestCpu = data.serverTraffic.cpu[0] || 0;

          const newCpuLabels = [
            ...prev.serverTraffic.labels,
            latestLabel,
          ].slice(-20);
          const newCpuData = [...prev.serverTraffic.cpu, latestCpu].slice(-20);

          return {
            visitorTrend: data.visitorTrend,
            trafficSource: data.trafficSource,
            serverTraffic: {
              labels: newCpuLabels,
              cpu: newCpuData,
            },
          };
        });
      }
    } catch (e) {
      console.error("대시보드 데이터 로딩 실패:", e);
    }
  };

  useEffect(() => {
    if (!isAdmin) return;
    fetchData();
    const interval = setInterval(fetchData, 2000);
    return () => clearInterval(interval);
  }, [isAdmin]);

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
        {/* 방문자 추이 */}
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

        {/* 유입 경로 */}
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

        {/* 서버 CPU */}
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
