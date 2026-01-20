// 1. [지시어] "use client"
// 이 파일이 사용자의 브라우저에서 실행되는 '클라이언트 컴포넌트'임을 선언합니다.
// useState, useRouter 같은 리액트 훅을 사용하려면 이 줄이 필수입니다.
"use client";

// 2. [Import] 리액트와 Next.js, 외부 라이브러리에서 필요한 도구들을 가져옵니다.
import React, { useState } from "react"; // 상태 관리(useState)를 위해 가져옵니다.
import { useRouter } from "next/navigation"; // 페이지를 이동시키는 리모컨(router)을 가져옵니다.
import Link from "next/link"; // 페이지 간 이동을 위한 링크 태그입니다. (새로고침 없이 이동)
// 예쁜 아이콘들을 lucide-react 라이브러리에서 가져옵니다.
import { Mail, Lock, ArrowRight, CheckCircle2, ArrowLeft } from "lucide-react";
// 우리가 미리 만들어둔 커스텀 입력창 컴포넌트입니다.
import { Input } from "@/components/common/Input";
// 로그인 로직이 들어있는 커스텀 훅입니다. (API 통신 등 복잡한 건 여기 숨겨져 있습니다.)
import { useAuth } from "@/hooks/useAuth";
import Image from "next/image"; // 이미지 최적화를 위한 Next.js 전용 태그입니다.

// ==================================================================
// [Component] 로그인 페이지의 메인 함수 시작
// ==================================================================
export default function Page() {
  // 1. 라우터 준비: 로그인 성공 후 페이지를 이동시킬 때 사용합니다.
  const router = useRouter();

  // 2. 인증 훅 사용: useAuth라는 훅에서 'login' 함수와 'socialLogin' 객체를 꺼내옵니다.
  // 이 페이지는 디자인에 집중하고, 실제 로그인 기능은 useAuth에게 맡깁니다.
  const { login, socialLogin } = useAuth();

  // 3. 입력 데이터 상태 관리: 아이디(loginId)와 비밀번호(password)를 저장할 변수입니다.
  const [formData, setFormData] = useState({ loginId: "", password: "" });

  // 4. 로딩 상태 관리: 로그인 버튼을 눌렀을 때 중복 클릭을 막고 스피너를 보여주기 위함입니다.
  const [isLoading, setIsLoading] = useState(false);

  // 5. [Handler] 로그인 폼 제출 함수
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // 중요! 폼 제출 시 브라우저가 새로고침 되는 기본 동작을 막습니다.
    setIsLoading(true); // 로딩 시작: 버튼을 비활성화하고 "로그인 중..."으로 바꿉니다.

    // useAuth에서 가져온 실제 로그인 함수를 실행합니다. (서버와 통신)
    // await를 써서 통신이 끝날 때까지 기다립니다.
    await login(formData);

    setIsLoading(false); // 로딩 끝: 통신이 끝나면 다시 버튼을 활성화합니다.
  };

  // 6. [Render] 화면 그리기 시작
  return (
    // 전체 배경: 꽉 찬 화면(min-h-screen), 연한 회색 배경, 중앙 정렬
    <div className="min-h-screen bg-[#fcfdfc] flex flex-col lg:items-center justify-center p-4 md:p-8">
      <Link
        href="/"
        className="inline-flex lg:hidden items-center gap-2 text-slate-400 hover:text-slate-900 transition-colors mb-8 group"
      >
        <ArrowLeft
          size={20}
          className="group-hover:-translate-x-1 transition-transform"
        />
        <span className="text-sm font-black tracking-tight">HOME</span>
      </Link>
      {/* 메인 카드 박스: 최대 너비 제한, 그리드 레이아웃(반반 쪼개기) 적용 */}
      <div className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-2 bg-white rounded-[3.5rem] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.06)] border border-slate-50 overflow-hidden min-h-[700px]">
        {/* === [Left Section] 왼쪽: 브랜드 소개 및 이미지 영역 === */}
        {/* lg:flex -> PC 화면(lg) 이상에서만 보이고, 모바일에서는 숨김(hidden) 처리합니다. */}
        <div className="hidden lg:flex flex-col justify-between p-16 bg-slate-900 relative overflow-hidden">
          {/* 배경 장식: 오른쪽 위에 흐릿한 초록색 빛을 넣어 분위기를 냅니다. */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-green-500 rounded-full blur-[100px] opacity-20 -mr-20 -mt-20" />

          <div className="relative z-10">
            {/* 로고 영역: 클릭하면 홈(/)으로 이동 */}
            <Link
              href="/"
              className="flex items-center transition hover:opacity-80 mb-16"
            >
              <Image
                src="\images\f_logo.svg" // 로고 이미지 경로 (public 폴더 기준)
                alt="로고"
                width={150} // 이미지 너비
                height={40} // 이미지 높이
                className="object-fill" // 비율 유지하며 채우기
              />
            </Link>

            {/* 슬로건 텍스트 */}
            <h2 className="text-5xl font-black text-white leading-[1.1] tracking-tighter mb-8">
              우리 동네의 <br />
              <span className="text-green-400 font-serif italic font-light">
                모든 순간을 연결합니다.
              </span>
            </h2>

            {/* 특징 리스트: 아래쪽에 정의한 FeatureItem 컴포넌트를 재사용합니다. */}
            <div className="space-y-6">
              <FeatureItem text="검증된 동네 맛집 & 핫플레이스 탐색" />
              <FeatureItem text="실시간 지역 뉴스 및 커뮤니티 소통" />
              <FeatureItem text="내 주변 전문 병원 및 관광지 정보" />
            </div>
          </div>
        </div>

        {/* === [Right Section] 오른쪽: 로그인 폼 영역 === */}
        <div className="p-8 md:p-16 flex flex-col justify-center relative bg-white">
          <div className="max-w-sm mx-auto w-full relative">
            {/* 폼 헤더: Login 제목과 설명 */}
            <div className="mb-10 text-center lg:text-left">
              <h3 className="text-3xl font-black text-slate-900 tracking-tight mb-2">
                Login
              </h3>
              <p className="text-slate-400 text-sm font-bold tracking-tight">
                계정 정보를 입력해 주세요.
              </p>
            </div>

            {/* 실제 로그인 입력 폼 */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* 아이디 입력 컴포넌트 */}
              <Input
                label="아이디"
                icon={<Mail size={18} />} // 메일 아이콘 전달
                type="text"
                placeholder="ID 혹은 이메일"
                value={formData.loginId} // 상태 변수와 연결 (양방향 바인딩)
                onChange={(e) =>
                  // 입력값이 바뀔 때마다 기존 formData를 복사(...formData)하고 loginId만 업데이트
                  setFormData({ ...formData, loginId: e.target.value })
                }
                disabled={isLoading} // 로딩 중엔 입력 불가
              />

              {/* 비밀번호 입력 컴포넌트 */}
              <Input
                label="비밀번호"
                icon={<Lock size={18} />} // 자물쇠 아이콘 전달
                type="password" // 글자 가림 처리
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                disabled={isLoading}
              />

              {/* 로그인 버튼 */}
              <button
                type="submit" // 폼 제출 트리거
                disabled={isLoading} // 로딩 중엔 클릭 불가
                className="w-full bg-slate-900 text-white font-black py-5 rounded-3xl hover:bg-green-600 disabled:bg-slate-400 transition-all flex items-center justify-center gap-2 mt-4 group"
              >
                {/* 로딩 상태에 따라 텍스트 변경 */}
                {isLoading ? "로그인 중..." : "시작하기"}

                {/* 로딩 중이 아닐 때만 화살표 아이콘 표시 */}
                {!isLoading && (
                  <ArrowRight
                    size={18}
                    className="group-hover:translate-x-1 transition-transform" // 호버 시 화살표 이동 애니메이션
                  />
                )}
              </button>

              {/* 하단 링크들 (아이디 찾기 / 회원가입) */}
              <div className="flex justify-center items-center gap-4 mt-6 text-xs font-bold">
                <Link
                  href="/find-account"
                  className="text-slate-400 hover:text-green-600 transition-colors"
                >
                  아이디/비밀번호 찾기
                </Link>
                {/* 구분점 */}
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

              {/* 소셜 로그인 버튼 그룹 */}
              <div className="grid grid-cols-2 gap-3">
                {/* 네이버 로그인 */}
                <button
                  type="button" // 폼 제출 안 되게 type="button" 지정 필수
                  onClick={socialLogin.naver} // useAuth에서 가져온 함수 연결
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
                  <span className="flex items-center">
                    <Image
                      src="/images/kakao.png"
                      alt="카카오 로고"
                      width={20}
                      height={20}
                    />
                  </span>
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

// ==================================================================
// [Sub Component] 왼쪽 섹션에 들어가는 특징 아이템 (재사용용)
// ==================================================================
const FeatureItem = ({ text }: { text: string }) => (
  <div className="flex items-center gap-3 text-slate-300">
    {/* 초록색 체크 아이콘 박스 */}
    <div className="w-5 h-5 bg-green-500/20 rounded-full flex items-center justify-center text-green-400">
      <CheckCircle2 size={14} strokeWidth={3} />
    </div>
    {/* 텍스트 내용 */}
    <span className="text-sm font-bold tracking-tight">{text}</span>
  </div>
);

// 화면 진입: 사용자가 /sign-in 페이지에 들어옵니다.

// PC 화면: 왼쪽엔 로고와 슬로건이 있는 파란 배경, 오른쪽엔 흰색 입력창이 보입니다.

// 모바일 화면: 왼쪽의 장식 영역은 숨겨지고(hidden), 바로 하얀색 로그인 입력창만 깔끔하게 뜹니다.

// 입력 시작: 사용자가 아이디 칸에 글자를 칠 때마다, onChange 이벤트가 발생해서 formData라는 메모리(State)에 실시간으로 글자가 저장됩니다.

// 로그인 시도 (일반):

// 사용자가 [시작하기] 버튼을 누릅니다.

// 가장 먼저 화면 새로고침을 막습니다(e.preventDefault).

// 버튼을 비활성화하고 "로그인 중..."으로 글씨를 바꿉니다(setIsLoading(true)).

// useAuth 훅에 있는 login 함수를 호출해 서버로 데이터를 보냅니다.

// 응답이 오면 로딩을 풉니다. (성공 시 보통 페이지가 이동되므로 로딩 해제는 실패했을 때 주로 보입니다.)

// 로그인 시도 (소셜): 네이버나 카카오 버튼을 누르면, 별도의 입력 과정 없이 socialLogin 함수가 실행되어 해당 소셜 서비스의 인증 화면으로 이동합니다.
