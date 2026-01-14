"use client";

import React, { useState, useEffect } from "react";
// [수정 1] dynamic import를 위해 next/dynamic 불러오기
import dynamic from "next/dynamic";
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
import { fetchClient } from "@/utils/api";
import useAdminCheck from "@/hooks/useAdminCheck";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react"; // 로딩 아이콘

// [수정 2] 차트 컴포넌트를 Dynamic Import로 변경 (ssr: false 필수)
// 이렇게 해야 "width(-1)" 에러가 사라집니다.
const Line = dynamic(() => import("react-chartjs-2").then((mod) => mod.Line), {
  ssr: false,
});
const Doughnut = dynamic(
  () => import("react-chartjs-2").then((mod) => mod.Doughnut),
  { ssr: false }
);

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

// --- [차트 컴포넌트들] ---

const VisitorChart = ({ data }: { data: VisitorTrend }) => {
  const chartData: ChartData<"line"> = {
    labels: data.labels,
    datasets: [
      {
        label: "방문자 수",
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
      legend: { display: false },
      title: { display: true, text: "최근 7일 방문자 추이" },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { stepSize: 1 },
      },
    },
  };

  return (
    <div className="h-[300px] w-full">
      <Line options={options} data={chartData} />
    </div>
  );
};

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
      title: { display: true, text: "접속 경로" },
    },
  };

  return (
    <div className="h-[300px] w-full">
      <Doughnut options={options} data={chartData} />
    </div>
  );
};

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
    <div className="h-[300px] w-full">
      <Line options={options} data={chartData} />
    </div>
  );
};

// --- [메인 페이지] ---
export default function AdminPage() {
  const router = useRouter();
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
      console.error("데이터 로딩 실패:", e);
    }
  };

  useEffect(() => {
    if (!isAdmin) return;
    fetchData();
    const interval = setInterval(fetchData, 2000);
    return () => clearInterval(interval);
  }, [isAdmin]);

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      alert("접근 권한이 없습니다.");
      router.replace("/");
    }
  }, [authLoading, isAdmin, router]);

  // 로딩 화면
  if (authLoading || !isAdmin) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 gap-4">
        <Loader2 className="animate-spin text-blue-500" size={48} />
        <h2 className="text-gray-500 font-bold">관리자 권한 확인 중...</h2>
      </div>
    );
  }

  // 메인 화면
  return (
    // [수정 3] Tailwind CSS 적용
    <main className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">
            관리자 대시보드
          </h1>
          <p className="text-gray-500 mt-2">
            실시간 서버 상태 및 방문자 통계를 확인합니다.
          </p>
        </header>

        {/* 그리드 레이아웃 */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          
          {/* 1. 방문자 추이 (전체 너비) */}
          <div className="col-span-1 md:col-span-12 bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
            <VisitorChart data={metrics.visitorTrend} />
          </div>

          {/* 2. 유입 경로 (왼쪽 4칸) */}
          <div className="col-span-1 md:col-span-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
            <TrafficSourceChart data={metrics.trafficSource} />
          </div>

          {/* 3. 서버 트래픽 (오른쪽 8칸) */}
          <div className="col-span-1 md:col-span-8 bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
            <ServerTrafficChart data={metrics.serverTraffic} />
          </div>
        </div>
      </div>
    </main>
  );
}