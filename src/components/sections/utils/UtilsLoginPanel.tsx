// 1. "use client": 브라우저에서 실행되는 클라이언트 컴포넌트입니다.
// (로그아웃 클릭 이벤트, 모달 상태 관리 등이 필요하기 때문입니다.)
"use client";

// --- [라이브러리 및 컴포넌트 임포트] ---
import Link from "next/link"; // 페이지 이동 링크
import Image from "next/image"; // 이미지 최적화 컴포넌트
import { LogOut, ChevronRight } from "lucide-react"; // 아이콘 (로그아웃, 화살표)
import { useAuth } from "@/hooks/useAuth"; // 인증 관련 훅 (로그아웃, 소셜로그인 기능 포함)
import { useState } from "react"; // 상태 관리 훅
// [추가] 공통 모달 컴포넌트 임포트
import Modal from "@/components/common/Modal";

// --- [Props 정의] ---
// 부모 컴포넌트에게 받아야 할 데이터의 규칙을 정합니다.
interface Props {
  isLoggedIn: boolean; // 로그인 여부 (true/false)
  userData: { nickname: string; email: string } | null; // 사용자 정보 객체 (닉네임, 이메일)
}

// ==================================================================
// [Main Component] 유틸리티 로그인 패널 컴포넌트 시작
// ==================================================================
export default function UtilsLoginPanel({ isLoggedIn, userData }: Props) {
  // useAuth 훅에서 로그아웃 함수와 소셜 로그인 함수들을 가져옵니다.
  const { logout, socialLogin } = useAuth();

  // --- [Modal Config] 모달 상태 관리 ---
  const [modalConfig, setModalConfig] = useState({
    isOpen: false, // 모달 열림 여부
    title: "", // 모달 제목
    content: "", // 모달 내용
    type: "success" as "success" | "error" | "warning" | "confirm", // 모달 타입
    onConfirm: undefined as (() => void) | undefined, // 확인 버튼 클릭 시 실행할 함수
  });

  // 모달 열기 헬퍼 함수
  const openModal = (
    content: string,
    type: "success" | "error" | "warning" | "confirm" = "success",
    title?: string,
    onConfirm?: () => void
  ) => {
    setModalConfig({
      isOpen: true,
      content,
      type,
      title: title || (type === "confirm" ? "로그아웃" : "알림"),
      onConfirm,
    });
  };

  // 모달 닫기 헬퍼 함수
  const closeModal = () => {
    setModalConfig((prev) => ({ ...prev, isOpen: false }));
  };
  // ---------------------------

  // --- [Handler] 로그아웃 버튼 클릭 핸들러 ---
  const handleLogoutClick = () => {
    // 바로 로그아웃 하지 않고 확인 모달을 먼저 띄웁니다.
    openModal("정말 로그아웃 하시겠습니까?", "confirm", "로그아웃 확인", () => {
      logout(); // 모달에서 [확인]을 눌렀을 때만 실제 로그아웃 실행
      closeModal(); // 모달 닫기
    });
  };

  // --- [Style] 공통 컨테이너 스타일 ---
  // - hidden lg:flex: 모바일에서는 숨기고(hidden), PC(lg)부터 보입니다(flex).
  // - sticky 등 위치 관련 스타일은 부모 컴포넌트에서 제어하거나 여기에 추가할 수 있습니다.
  const containerStyle =
    "hidden bg-white border border-gray-100 rounded-3xl p-7 flex-col justify-between lg:row-span-2 lg:flex lg:col-span-1 lg:h-full shadow-[0_8px_30px_rgb(0,0,0,0.04)]";

  // ==================================================================
  // [Case 1] 로그인 상태일 때 화면
  // ==================================================================
  if (isLoggedIn && userData) {
    return (
      <>
        {/* 전역 모달 컴포넌트 (평소엔 숨겨져 있음) */}
        <Modal
          isOpen={modalConfig.isOpen}
          onClose={closeModal}
          title={modalConfig.title}
          content={modalConfig.content}
          type={modalConfig.type}
          onConfirm={modalConfig.onConfirm}
        />

        <div className={containerStyle}>
          {/* 애니메이션: 서서히 나타남 (fade-in) */}
          <div className="flex flex-col h-full justify-between animate-in fade-in duration-300">
            {/* 상단 프로필 영역 */}
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                {/* 프로필 이미지 (없으면 닉네임 첫 글자) */}
                <div className="w-14 h-14 bg-slate-100 rounded-xl shrink-0 flex items-center justify-center text-slate-500 font-bold text-xl">
                  {(userData.nickname || "회")[0]}
                </div>
                {/* 환영 메시지 */}
                <div>
                  <p className="text-xs text-gray-400 font-medium mb-1">
                    오늘도 즐거운 하루!
                  </p>
                  <h5 className="font-bold text-gray-800 text-lg leading-tight">
                    <span className="text-green-600">{userData.nickname}</span>
                    님
                  </h5>
                </div>
              </div>

              {/* 마이페이지 버튼 */}
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

            {/* 하단 로그아웃 버튼 */}
            <div className="pt-4 border-t border-gray-50">
              <button
                onClick={handleLogoutClick} // 모달 띄우는 핸들러 연결
                className="w-full flex items-center justify-center gap-2 text-gray-400 text-sm font-medium hover:text-red-500 transition-colors py-2"
              >
                <LogOut className="w-4 h-4" /> 로그아웃
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  // ==================================================================
  // [Case 2] 비로그인 상태일 때 화면
  // ==================================================================
  return (
    <div className={containerStyle}>
      {/* 상단 로그인 유도 영역 */}
      <div className="space-y-4">
        <h5 className="font-bold text-gray-800 text-lg">로그인</h5>

        {/* 메인 로그인 버튼 */}
        <Link
          href="/sign-in"
          // 그라데이션 배경, 그림자 효과
          className="bg-linear-to-r from-green-600 to-green-400 w-full h-12 rounded-2xl text-white font-bold flex items-center justify-center text-center shadow-md shadow-green-100 transition-all duration-300 hover:opacity-90 hover:shadow-lg hover:-translate-y-0.5 active:scale-95"
        >
          다잇슈 시작하기
        </Link>

        {/* 아이디 찾기 / 회원가입 링크 */}
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

      {/* 하단 소셜 로그인 영역 */}
      <div className="space-y-4">
        {/* 구분선 */}
        <div className="flex items-center gap-3">
          <span className="flex-1 h-px bg-gray-100"></span>
          <p className="text-gray-300 text-[10px] font-bold uppercase tracking-tighter">
            Social Login
          </p>
          <span className="flex-1 h-px bg-gray-100"></span>
        </div>

        {/* 소셜 버튼들 */}
        <div className="flex justify-center gap-4">
          {/* 네이버 로그인 버튼 */}
          <button
            className="hover:scale-110 transition-transform"
            onClick={socialLogin.naver}
          >
            <Image
              src="/images/login-site1.png" // 네이버 아이콘
              alt="네이버"
              width={36}
              height={36}
              className="rounded-full shadow-sm"
            />
          </button>

          {/* 카카오 로그인 버튼 */}
          <button
            onClick={socialLogin.kakao}
            className="hover:scale-110 transition-transform"
          >
            <Image
              src="/images/login-site2.png" // 카카오 아이콘
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

// 상태 확인: 부모 컴포넌트로부터 isLoggedIn(로그인했니?)과 userData(누구니?) 정보를 받습니다.

// 분기 1: 비로그인 상태 (if 조건 불만족)

// "로그인" 제목과 함께 초록색 [다잇슈 시작하기] 버튼이 큼지막하게 보입니다.

// 그 아래엔 아이디 찾기/회원가입 링크가 작게 있고, 맨 밑엔 네이버/카카오 소셜 로그인 버튼이 있습니다.

// 분기 2: 로그인 상태 (if 조건 만족)

// 프로필 이미지(또는 닉네임 첫 글자)와 함께 **"홍길동님"**이라는 환영 문구가 뜹니다.

// **[마이페이지]**로 가는 큰 버튼이 생깁니다.

// 맨 밑엔 [로그아웃] 버튼이 있습니다.

// 로그아웃 시도:

// 로그아웃 버튼을 누르면 바로 꺼지는 게 아니라, 모달창이 떠서 "정말 로그아웃 하시겠습니까?"라고 묻습니다.

// [확인]을 누르면 useAuth의 logout 함수가 실행되어 로그아웃됩니다.
