"use client";

import { useRouter } from "next/navigation";
import {
  Camera,
  ArrowRight,
  MapPin,
  Sparkles,
  MessageCircle,
  Heart,
} from "lucide-react";
import Image from "next/image";

export default function TourReviewSection() {
  const router = useRouter();

  return (
    <section className="w-full max-w-[1240px] mx-auto pb-16 px-4 md:px-0">
      <div className="relative w-full rounded-[2.5rem] overflow-hidden bg-emerald-900 shadow-2xl shadow-emerald-900/20 group isolate min-h-[480px] flex items-center">
        <div className="absolute inset-0 -z-10">
          <Image
            src="https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?q=80&w=2000&auto=format&fit=crop"
            alt="Travel Background"
            className="w-full h-full object-cover opacity-40 mix-blend-overlay transition-transform duration-1000 group-hover:scale-105"
            width={0}
            height={0}
            unoptimized
          />

          <div className="absolute inset-0 bg-linear-to-r from-emerald-900/95 via-emerald-800/90 to-teal-900/70" />
        </div>

        {/* 장식용 패턴 (반짝이) */}
        <div className="absolute top-0 right-0 p-20 opacity-10 pointer-events-none">
          <Sparkles className="w-64 h-64 text-white" />
        </div>

        <div className="w-full flex flex-col md:flex-row items-center justify-between p-8 sm:p-12 md:p-16 gap-12 sm:gap-16">
          {/* --- 2. 왼쪽: 텍스트 & 버튼 --- */}
          <div className="flex-1 text-center md:text-left space-y-8 z-10 max-w-xl">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/20 backdrop-blur-md border border-emerald-400/30 text-emerald-100 text-xs font-bold uppercase tracking-wider shadow-sm animate-fade-in">
                <MapPin size={12} className="text-emerald-300" />
                Travel Log
              </div>

              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white leading-[1.2] drop-shadow-lg">
                당신의 특별한 여행, <br />
                <span className="text-transparent bg-clip-text bg-linear-to-r from-emerald-200 to-teal-200">
                  이야기가 되다
                </span>
              </h2>

              <p className="text-emerald-100/80 text-base sm:text-lg font-medium leading-relaxed">
                숨겨진 명소부터 맛집까지, 생생한 후기를 확인하세요.
                <br className="hidden sm:block" />
                당신의 소중한 추억이 누군가의 여행이 됩니다.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start pt-2">
              <button
                onClick={() => router.push("/tour/review")}
                className="group/btn relative px-8 py-4 bg-white text-emerald-800 rounded-2xl font-bold shadow-lg shadow-emerald-900/20 hover:shadow-xl hover:shadow-emerald-900/30 hover:-translate-y-1 transition-all active:scale-95 flex items-center justify-center gap-2 overflow-hidden"
              >
                <span className="relative z-10">후기 구경하기</span>
                <ArrowRight
                  size={18}
                  className="relative z-10 transition-transform group-hover/btn:translate-x-1"
                />
                <div className="absolute inset-0 bg-linear-to-r from-emerald-50 to-teal-50 opacity-0 group-hover/btn:opacity-100 transition-opacity" />
              </button>

              <button
                onClick={() => router.push("/tour/review/write")}
                className="px-8 py-4 bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-2xl font-bold hover:bg-white/20 transition-all hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-2 group/camera"
              >
                <Camera
                  size={18}
                  className="group-hover/camera:rotate-12 transition-transform"
                />
                <span>나도 기록하기</span>
              </button>
            </div>
          </div>

          <div className="hidden md:block flex-1 relative w-full max-w-sm lg:max-w-md h-[400px]">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-emerald-500/20 blur-3xl rounded-full" />

            <div className="absolute top-0 right-4 w-60 h-72 bg-white p-3 pb-10 shadow-2xl rotate-6 rounded-xl transform transition-transform hover:rotate-3 hover:scale-105 duration-500 z-10">
              <Image
                src="https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=800&auto=format&fit=crop"
                className="w-full h-full object-cover rounded-lg bg-slate-100"
                alt="Review 1"
                width={0}
                height={0}
                unoptimized
              />

              <div className="absolute bottom-3 left-4 flex gap-0.5">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Sparkles
                    key={i}
                    size={10}
                    className="text-yellow-400 fill-yellow-400"
                  />
                ))}
              </div>
            </div>

            <div className="absolute top-16 right-24 w-64 h-80 bg-white p-3 pb-4 shadow-2xl -rotate-6 rounded-xl transform transition-transform hover:-rotate-3 hover:scale-105 duration-500 z-20">
              <div className="relative w-full h-48 mb-3 overflow-hidden rounded-lg">
                <Image
                  src="https://images.unsplash.com/photo-1511018556340-d16986a1c194?q=80&w=800&auto=format&fit=crop"
                  className="w-full h-full object-cover"
                  alt="Review 2"
                  width={0}
                  height={0}
                  unoptimized
                />

                <div className="absolute top-2 right-2 bg-black/50 backdrop-blur-md px-2 py-1 rounded-full flex items-center gap-1 text-[10px] text-white font-bold">
                  <Heart size={10} className="fill-red-500 text-red-500" /> 128
                </div>
              </div>

              <div className="px-1">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 rounded-full bg-slate-200" />
                  <div className="h-2 w-20 bg-slate-100 rounded-full" />
                </div>
                <div className="space-y-1.5">
                  <div className="h-2 w-full bg-slate-100 rounded-full" />
                  <div className="h-2 w-4/5 bg-slate-100 rounded-full" />
                </div>
                <div className="mt-4 flex items-center justify-between text-xs text-slate-400 font-medium">
                  <span>여행 기록 남기기...</span>
                  <MessageCircle size={14} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
