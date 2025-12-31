"use client";

import Link from "next/link";
import { Facebook, Twitter, Youtube, Instagram } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-gray-400 py-16 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mb-12">
          {/* 1. 로고 및 기업 정보 */}
          <div className="space-y-6">
            <Link href="/">
              <span className="text-2xl font-black text-white tracking-tighter transition hover:opacity-80">
                다잇슈{" "}
                <span className="text-transparent bg-clip-text bg-linear-to-r from-green-600 to-green-400">
                  대전
                </span>
              </span>
            </Link>
            <div className="text-sm leading-relaxed space-y-2 mt-4">
              <p className="flex gap-3">
                <span className="text-slate-500 w-12 shrink-0">주소</span>
                <span className="text-slate-300">
                  대전광역시 중구 계룡로 825 희영빌딩 2층
                </span>
              </p>
              <p className="flex gap-3">
                <span className="text-slate-500 w-12 shrink-0">고객센터</span>
                <span className="text-slate-300 font-bold">070-0000-0000</span>
              </p>
            </div>
          </div>

          {/* 2. 주요 메뉴 */}
          <div className="flex lg:justify-center items-start">
            <div className="flex flex-col space-y-4">
              <h3 className="text-white font-bold text-sm uppercase tracking-wider">
                Policy
              </h3>
              <Link
                href="/policy/terms"
                className="text-sm hover:text-green-500 transition-colors"
              >
                이용약관
              </Link>
              <Link
                href="/policy/privacy"
                className="text-sm hover:text-green-500 transition-colors font-extrabold text-slate-300"
              >
                개인정보처리방침
              </Link>
            </div>
          </div>

          {/* 3. SNS 및 저작권 (우측 벽 밀착 + 흰색 테두리 원형 아이콘) */}
          <div className="flex flex-col items-start lg:items-end justify-between space-y-8 w-full">
            {/* 하얀 선 들어간 동그라미 아이콘 */}
            <div className="flex items-center gap-3">
              <SocialIcon icon={<Facebook size={16} />} />
              <SocialIcon icon={<Twitter size={16} />} />
              <SocialIcon icon={<Youtube size={16} />} />
              <SocialIcon icon={<Instagram size={16} />} />
            </div>

            <div className="text-right">
              <p className="text-xs text-slate-600 leading-loose lg:text-right">
                Copyright ⓒ TEAM202507_1.
                <br />
                All rights reserved.
              </p>
            </div>
          </div>
        </div>

        {/* 최하단 버전 정보 */}
        <div className="border-t border-slate-800/50 pt-8 mt-8 ">
          <p className="text-[10px] text-slate-700 uppercase tracking-widest">
            Daejeon Community Platform v1.0
          </p>
        </div>
      </div>
    </footer>
  );
}

// 하얀 선이 들어간 원형 아이콘 컴포넌트
function SocialIcon({ icon }: { icon: React.ReactNode }) {
  return (
    <a
      href="#"
      className="w-9 h-9 rounded-full border border-white/20 flex items-center justify-center text-gray-400 hover:text-white hover:border-white transition-all duration-300 hover:bg-white/10"
    >
      {icon}
    </a>
  );
}
