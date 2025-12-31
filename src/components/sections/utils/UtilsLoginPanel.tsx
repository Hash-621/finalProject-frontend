"use client";
import Link from "next/link";
import Image from "next/image";
import { LogOut, ChevronRight } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface Props {
  isLoggedIn: boolean;
  userData: { nickname: string; email: string } | null;
}

export default function UtilsLoginPanel({ isLoggedIn, userData }: Props) {
  const { logout } = useAuth();

  const handleLogoutClick = () => {
    if (window.confirm("로그아웃 하시겠습니까?")) {
      logout();
    }
  };

  const { socialLogin } = useAuth();

  const containerStyle =
    "hidden bg-white border border-gray-100 rounded-3xl p-7 flex-col justify-between lg:row-span-2 lg:flex lg:col-span-1 lg:h-full shadow-[0_8px_30px_rgb(0,0,0,0.04)]";

  if (isLoggedIn && userData) {
    return (
      <div className={containerStyle}>
        <div className="flex flex-col h-full justify-between animate-in fade-in duration-300">
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-slate-100 rounded-xl shrink-0 flex items-center justify-center text-slate-500 font-bold text-xl">
                {(userData.nickname || "회")[0]}
              </div>
              <div>
                <p className="text-xs text-gray-400 font-medium mb-1">
                  오늘도 즐거운 하루!
                </p>
                <h5 className="font-bold text-gray-800 text-lg leading-tight">
                  <span className="text-green-600">{userData.nickname}</span>님
                </h5>
              </div>
            </div>
            <div className="space-y-2">
              <Link
                href="/mypage"
                className="w-full h-12 bg-gray-900 rounded-2xl text-white font-bold flex items-center justify-between px-6 hover:bg-gray-800 transition-colors shadow-md"
              >
                <span>마이페이지</span>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </Link>
            </div>
          </div>
          <div className="pt-4 border-t border-gray-50">
            <button
              onClick={handleLogoutClick}
              className="w-full flex items-center justify-center gap-2 text-gray-400 text-sm font-medium hover:text-red-500 transition-colors py-2"
            >
              <LogOut className="w-4 h-4" /> 로그아웃
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={containerStyle}>
      <div className="space-y-4">
        <h5 className="font-bold text-gray-800 text-lg">로그인</h5>
        <Link
          href="/sign-in"
          className="bg-linear-to-r from-green-600 to-green-400 w-full h-12 rounded-2xl text-white font-bold flex items-center justify-center text-center shadow-md shadow-green-100 transition-all duration-300 hover:opacity-90 hover:shadow-lg hover:-translate-y-0.5 active:scale-95"
        >
          다잇슈 시작하기
        </Link>
        <div className="flex justify-center gap-4 text-xs text-gray-400 font-medium py-1">
          <Link
            href="/find-account"
            className="hover:text-green-500 transition-colors"
          >
            아이디 찾기
          </Link>
          <span className="text-gray-200">|</span>
          <Link
            href="/sign-up"
            className="hover:text-green-500 transition-colors"
          >
            회원가입
          </Link>
        </div>
      </div>
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <span className="flex-1 h-px bg-gray-100"></span>
          <p className="text-gray-300 text-[10px] font-bold uppercase tracking-tighter">
            Social Login
          </p>
          <span className="flex-1 h-px bg-gray-100"></span>
        </div>
        <div className="flex justify-center gap-4">
          <button
            className="hover:scale-110 transition-transform"
            onClick={socialLogin.naver}
          >
            <Image
              src="/images/login-site1.png"
              alt="네이버"
              width={36}
              height={36}
              className="rounded-full shadow-sm"
            />
          </button>
          <button
            onClick={socialLogin.kakao}
            className="hover:scale-110 transition-transform"
          >
            <Image
              src="/images/login-site2.png"
              alt="카카오"
              width={36}
              height={36}
              className="rounded-full shadow-sm"
            />
          </button>
        </div>
      </div>
    </div>
  );
}
