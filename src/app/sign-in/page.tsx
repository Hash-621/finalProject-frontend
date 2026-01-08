// 1. "use client": 이 파일이 브라우저에서 실행되는 클라이언트 컴포넌트임을 선언합니다.
// (사용자 입력, 폼 제출, 상태 관리 등을 위해 필수입니다.)
"use client";

// --- [라이브러리 및 컴포넌트 임포트] ---
import React, { useState } from "react"; // 리액트 훅 (상태 관리)
import { useRouter } from "next/navigation"; // 페이지 이동을 위한 훅
import Link from "next/link"; // 링크 이동 컴포넌트
// 아이콘 라이브러리
import { Mail, Lock, ArrowRight, CheckCircle2 } from "lucide-react";
import { Input } from "@/components/common/Input"; // 공통 입력 컴포넌트
import { useAuth } from "@/hooks/useAuth"; // 인증(로그인) 관련 커스텀 훅
import Image from "next/image"; // 이미지 최적화 컴포넌트

// --- [메인 페이지 컴포넌트] ---
export default function Page() {
  const router = useRouter(); // 라우터 객체 생성

  // useAuth 훅에서 로그인 함수와 소셜 로그인 함수들을 가져옵니다.
  const { login } = useAuth();

  // --- [상태 관리] ---
  const [formData, setFormData] = useState({ loginId: "", password: "" }); // 입력값 상태
  const [isLoading, setIsLoading] = useState(false); // 로딩 중 상태 (버튼 비활성화용)

  // --- [폼 제출 핸들러] ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // 새로고침 방지
    setIsLoading(true); // 로딩 시작 (버튼 비활성화)
    await login(formData); // 로그인 함수 호출 (서버 통신)
    setIsLoading(false); // 로딩 끝 (실패 시 다시 활성화, 성공하면 페이지 이동됨)
  };

  // 소셜 로그인 객체 가져오기 (네이버, 카카오)
  const { socialLogin } = useAuth();

  // --- [화면 렌더링] ---
  return (
    <div className="min-h-screen bg-[#fcfdfc] flex items-center justify-center p-4 md:p-8">
      {/* 전체 컨테이너 카드 (반응형: 모바일은 1열, PC는 2열) */}
      <div className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-2 bg-white rounded-[3.5rem] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.06)] border border-slate-50 overflow-hidden min-h-[700px]">
        {/* 1. 좌측 브랜딩 섹션 (PC에서만 보임 - hidden lg:flex) */}
        <div className="hidden lg:flex flex-col justify-between p-16 bg-slate-900 relative overflow-hidden">
          {/* 배경 장식 (흐릿한 초록색 원) */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-green-500 rounded-full blur-[100px] opacity-20 -mr-20 -mt-20" />

          <div className="relative z-10">
            {/* 로고 (클릭 시 홈으로) */}
            <Link
              href="/"
              className="flex items-center transition hover:opacity-80 mb-16"
            >
              <Image
                src="\images\f_logo.svg" // 로고 이미지 경로 (역슬래시 주의: 보통 / 사용 권장)
                alt="로고"
                width={150}
                height={40}
                className="object-fill "
              />
            </Link>

            {/* 슬로건 텍스트 */}
            <h2 className="text-5xl font-black text-white leading-[1.1] tracking-tighter mb-8">
              우리 동네의 <br />
              <span className="text-green-400 font-serif italic font-light">
                모든 순간을 연결합니다.
              </span>
            </h2>

            {/* 특징 리스트 (체크 아이콘 포함) */}
            <div className="space-y-6">
              <FeatureItem text="검증된 동네 맛집 & 핫플레이스 탐색" />
              <FeatureItem text="실시간 지역 뉴스 및 커뮤니티 소통" />
              <FeatureItem text="내 주변 전문 병원 및 관광지 정보" />
            </div>
          </div>
        </div>

        {/* 2. 우측 로그인 폼 섹션 */}
        <div className="p-8 md:p-16 flex flex-col justify-center relative bg-white">
          <div className="max-w-sm mx-auto w-full relative">
            {/* 로그인 헤더 */}
            <div className="mb-10 text-center lg:text-left">
              <h3 className="text-3xl font-black text-slate-900 tracking-tight mb-2">
                Login
              </h3>
              <p className="text-slate-400 text-sm font-bold tracking-tight">
                계정 정보를 입력해 주세요.
              </p>
            </div>

            {/* 입력 폼 */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* 아이디 입력 */}
              <Input
                label="아이디"
                icon={<Mail size={18} />}
                type="text"
                placeholder="ID 혹은 이메일"
                value={formData.loginId}
                onChange={(e) =>
                  setFormData({ ...formData, loginId: e.target.value })
                }
                disabled={isLoading} // 로딩 중엔 입력 불가
              />
              {/* 비밀번호 입력 */}
              <Input
                label="비밀번호"
                icon={<Lock size={18} />}
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                disabled={isLoading}
              />

              {/* 로그인 버튼 */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-slate-900 text-white font-black py-5 rounded-3xl hover:bg-green-600 disabled:bg-slate-400 transition-all flex items-center justify-center gap-2 mt-4 group"
              >
                {isLoading ? "로그인 중..." : "시작하기"}
                {!isLoading && (
                  <ArrowRight
                    size={18}
                    className="group-hover:translate-x-1 transition-transform"
                  />
                )}
              </button>

              {/* 하단 링크 (아이디 찾기 / 회원가입) */}
              <div className="flex justify-center items-center gap-4 mt-6 text-xs font-bold">
                <Link
                  href="/find-account"
                  className="text-slate-400 hover:text-green-600 transition-colors"
                >
                  아이디/비밀번호 찾기
                </Link>
                <span className="w-1 h-1 bg-slate-200 rounded-full" />
                <Link
                  href="/sign-up"
                  className="text-slate-900 hover:text-green-600 transition-colors"
                >
                  회원가입
                </Link>
              </div>

              {/* 소셜 로그인 구분선 */}
              <div className="flex items-center gap-4 py-4">
                <div className="h-px flex-1 bg-slate-100"></div>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-300">
                  Social Login
                </span>
                <div className="h-px flex-1 bg-slate-100"></div>
              </div>

              {/* 소셜 로그인 버튼들 */}
              <div className="grid grid-cols-2 gap-3">
                {/* 네이버 로그인 */}
                <button
                  type="button"
                  onClick={socialLogin.naver}
                  className="w-full bg-[#03C755] text-white font-black py-4 rounded-3xl flex items-center justify-center gap-2"
                >
                  <span className="text-lg font-black">N</span>
                  <span className="text-xs">네이버</span>
                </button>
                {/* 카카오 로그인 */}
                <button
                  type="button"
                  onClick={socialLogin.kakao}
                  className="w-full bg-[#FEE500] text-[#191919] font-black py-4 rounded-3xl flex items-center justify-center gap-2"
                >
                  {/* 카카오 아이콘 대신 텍스트나 SVG 사용 가능 */}
                  <span className="text-xs">카카오</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- [서브 컴포넌트: 특징 아이템] ---
// 좌측 브랜딩 섹션에 들어가는 체크리스트 아이템입니다.
const FeatureItem = ({ text }: { text: string }) => (
  <div className="flex items-center gap-3 text-slate-300">
    <div className="w-5 h-5 bg-green-500/20 rounded-full flex items-center justify-center text-green-400">
      <CheckCircle2 size={14} strokeWidth={3} />
    </div>
    <span className="text-sm font-bold tracking-tight">{text}</span>
  </div>
);

// 1. 페이지 진입 (Entry)

// 사용자가 /sign-in으로 들어옵니다.

// 화면 왼쪽엔 멋진 로고와 소개글이 보이고, 오른쪽엔 아이디/비번 입력창이 뜹니다. (모바일에선 입력창만 보임)

// 2. 입력 및 제출 (Input & Submit)

// 사용자가 아이디와 비밀번호를 입력하고 [시작하기] 버튼을 누릅니다.

// handleSubmit 함수가 실행됩니다.

// isLoading이 true가 되면서 버튼이 **"로그인 중..."**으로 바뀌고 비활성화됩니다. (중복 클릭 방지)

// login(formData)가 호출되어 서버에 로그인 요청을 보냅니다.

// 3. 로그인 처리 (Processing)

// 성공 시: useAuth 훅 내부 로직에 의해 토큰이 쿠키에 저장되고 메인 페이지(/)로 이동합니다.

// 실패 시: 에러 메시지(예: "비밀번호가 틀렸습니다")가 뜨고, isLoading이 false가 되어 다시 입력할 수 있게 됩니다.

// 4. 소셜 로그인 (Social Login)

// 사용자가 아이디 치기 귀찮아서 [네이버] 버튼을 누릅니다.

// socialLogin.naver()가 실행되어 네이버 로그인 페이지로 이동합니다.

// 네이버에서 로그인을 마치면 다시 우리 사이트의 NaverCallback 페이지로 돌아오게 됩니다.
