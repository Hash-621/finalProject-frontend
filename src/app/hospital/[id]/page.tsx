"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/api/axios";
import {
  Loader2,
  MapPin,
  Stethoscope,
  Phone,
  Clock,
  Info,
  ChevronLeft,
  Calendar,
  ShieldCheck,
  Building2,
} from "lucide-react";
import Link from "next/link";

export default function HospitalDetail() {
  const { id } = useParams();
  const router = useRouter();

  const [hospital, setHospital] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        setLoading(true);
        const response = await api.get("/hospital");
        const allData = response.data;
        const detail = allData.find((item: any) => String(item.id) === id);

        if (detail) {
          setHospital(detail);
        } else {
          router.push("/hospital");
        }
      } catch (error) {
        console.error("데이터 로드 실패:", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchDetail();
  }, [id, router]);

  if (loading)
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-white">
        <Loader2 className="animate-spin text-green-500 w-12 h-12 mb-4" />
        <p className="text-slate-600 font-bold">병원 정보를 불러오는 중...</p>
      </div>
    );

  if (!hospital) return null;

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* 1. 상단 비주얼 섹션 (병원 테마 컬러 적용) */}
      <section className="relative h-[40vh] md:h-[50vh] w-full overflow-hidden bg-slate-900">
        <div
          className="absolute inset-0 opacity-40 bg-center bg-cover"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80')",
            backgroundAttachment: "fixed",
          }}
        />
        <div className="absolute inset-0 bg-linear-to-t from-slate-950 via-slate-900/40 to-transparent" />

        <div className="absolute top-6 left-6 z-30">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full text-white hover:bg-white hover:text-black transition-all group"
          >
            <ChevronLeft className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
            <span className="text-sm font-bold">뒤로가기</span>
          </button>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-8 md:p-16 text-white z-10 max-w-7xl mx-auto w-full">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-500 text-white text-[10px] font-black rounded-md mb-4 uppercase tracking-widest shadow-lg">
            {hospital.treatCategory || "전문의원"}
          </div>
          <h1 className="text-4xl md:text-6xl font-black mb-6 tracking-tighter">
            {hospital.name}
          </h1>
          <div className="flex flex-wrap items-center gap-6 text-slate-300 font-bold">
            <div className="flex items-center gap-1.5">
              <MapPin className="w-5 h-5 text-green-400" />
              <span className="text-white/90 font-medium">
                {hospital.address}
              </span>
            </div>
            <div className="flex items-center gap-1.5 border-l border-white/20 pl-6">
              <ShieldCheck className="w-5 h-5 text-blue-400" />
              <span className="text-white/90 font-medium">
                보건복지부 인증 전문의
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. 상세 컨텐츠 섹션 */}
      <section className="relative z-20 md:-mt-12 bg-white rounded-t-[48px] flex-1">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
            <div className="lg:col-span-8 space-y-16">
              {/* 진료 철학/소개 */}
              <div>
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center text-green-600">
                    <Stethoscope className="w-6 h-6" />
                  </div>
                  <h3 className="text-2xl font-black text-slate-900">
                    진료 및 전문성 안내
                  </h3>
                </div>

                <div className="group relative overflow-hidden bg-slate-50 rounded-4xl p-10 border border-slate-100 transition-all hover:shadow-xl hover:shadow-green-50">
                  <div className="relative z-10">
                    <span className="text-green-600 font-black text-sm uppercase tracking-widest mb-2 block">
                      Medical Expert
                    </span>
                    <p className="text-slate-900 font-black text-3xl mb-4 leading-tight">
                      {hospital.treatCategory} 전문 진료 서비스
                    </p>
                    <p className="text-slate-500 leading-relaxed text-lg font-medium max-w-xl">
                      {hospital.name}은(는) 대전 지역 전문 의료기관으로서 최첨단
                      장비와 풍부한 임상 경험을 바탕으로 환자 맞춤형 치료를
                      제공합니다. 과잉 진료 없는 정직한 진료를 약속드립니다.
                    </p>
                  </div>
                  <div className="absolute -right-4 -bottom-4 text-green-100/50 font-black text-8xl pointer-events-none select-none italic">
                    DOC
                  </div>
                </div>
              </div>

              {/* 병원 기본 정보 */}
              <div>
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600">
                    <Info className="w-6 h-6" />
                  </div>
                  <h3 className="text-2xl font-black text-slate-900">
                    병원 상세 정보
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-slate-700 font-medium">
                  <div className="p-6 bg-white rounded-2xl border border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Building2 className="w-5 h-5 text-slate-400" />
                      <span className="text-slate-400">의료기관 구분</span>
                    </div>
                    <span className="font-bold">의원 / 전문의</span>
                  </div>
                  <div className="p-6 bg-white rounded-2xl border border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-slate-400" />
                      <span className="text-slate-400">예약 여부</span>
                    </div>
                    <span className="font-bold text-green-600">
                      전화 예약 권장
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* 오른쪽 사이드바 (영업 및 연락 정보) */}
            <div className="lg:col-span-4">
              <div className="sticky top-28 space-y-6">
                <div className="p-8 bg-slate-900 rounded-[40px] text-white shadow-2xl">
                  <h4 className="text-xl font-bold mb-8 flex items-center gap-2">
                    <Clock className="w-6 h-6 text-green-400" />
                    진료 시간 및 문의
                  </h4>

                  <div className="space-y-8 mb-10">
                    <div className="space-y-2">
                      <p className="text-white/40 text-xs font-black uppercase tracking-widest">
                        Address
                      </p>
                      <p className="text-sm font-medium leading-relaxed">
                        {hospital.address}
                      </p>
                    </div>

                    <div className="space-y-2 text-green-400">
                      <p className="text-white/40 text-xs font-black uppercase tracking-widest">
                        Clinic Hours
                      </p>
                      <p className="text-sm font-black italic uppercase">
                        {hospital.openTime || "평일 09:00 - 18:30 (문의 요망)"}
                      </p>
                      <p className="text-[10px] text-white/30 font-medium">
                        * 토/일/공휴일은 매장마다 상이하므로 확인이 필요합니다.
                      </p>
                    </div>
                  </div>

                  {hospital.tel ? (
                    <>
                      <div className="space-y-2 text-green-400">
                        <p className="text-white/40 text-xs font-black uppercase tracking-widest">
                          TEL Number
                        </p>
                        <p className="text-sm font-black uppercase">
                          {hospital.tel}
                        </p>
                      </div>
                      <div className="mt-5">
                        <Link
                          href={`tel:${hospital.tel}`}
                          className="flex items-center justify-center w-full py-5 bg-green-600 hover:bg-green-700 text-white rounded-2xl font-black text-lg transition-all active:scale-95 shadow-lg shadow-green-950/20"
                        >
                          전화 문의 및 예약
                        </Link>
                      </div>
                    </>
                  ) : (
                    <div className="w-full py-5 bg-slate-800 text-slate-400 rounded-2xl font-bold text-center text-sm border border-slate-700">
                      전화번호 정보 없음
                    </div>
                  )}
                </div>

                {hospital.tel && (
                  <p className="px-4 text-[11px] text-slate-400 text-center leading-tight font-medium">
                    진료 중일 경우 전화 연결이 어려울 수 있습니다.
                    <br />
                    방문 전 주소지를 다시 한 번 확인해주세요.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. 푸터 버튼 */}
      <div className="bg-white py-12 border-t border-slate-50 mt-auto">
        <div className="max-w-6xl mx-auto px-6 flex justify-center">
          <button
            onClick={() => router.push("/hospital")}
            className="text-slate-300 hover:text-green-600 font-black text-sm uppercase tracking-[0.2em] transition-colors"
          >
            Back to Hospital List
          </button>
        </div>
      </div>
    </div>
  );
}
