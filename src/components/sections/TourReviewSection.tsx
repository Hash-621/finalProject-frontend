"use client";
import React from "react";
import Link from "next/link";
import { Camera, ArrowRight, Star } from "lucide-react";

export default function TourReviewSection() {
  return (
    <section className="py-24 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="relative bg-gradient-to-br from-indigo-600 to-violet-600 rounded-[3rem] p-10 md:p-20 text-white shadow-2xl shadow-indigo-200 overflow-hidden group">
          {/* 배경 데코레이션 */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
            <div className="max-w-2xl text-center md:text-left">
              <h2 className="text-4xl md:text-5xl font-black mb-6 leading-tight">
                당신의 여행은 <br /> 어떤{" "}
                <span className="text-indigo-200">추억</span>으로 남았나요?
              </h2>
              <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                <Link
                  href="/tour/review"
                  className="bg-white text-indigo-600 px-8 py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 hover:bg-indigo-50 transition-all shadow-lg"
                >
                  후기 보러가기 <ArrowRight size={20} />
                </Link>
                <Link
                  href="/tour/review/write"
                  className="bg-indigo-500/50 backdrop-blur-sm text-white px-8 py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 hover:bg-indigo-500/70 transition-all border border-white/10"
                >
                  <Star size={20} /> 인증샷 올리기
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
