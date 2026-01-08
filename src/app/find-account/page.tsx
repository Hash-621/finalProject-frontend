// 1. "use client": 이 파일이 브라우저에서 실행되는 클라이언트 컴포넌트임을 선언합니다.
// (사용자 입력, 상태 관리, 이벤트 처리 등을 위해 필수입니다.)
"use client";

// --- [라이브러리 및 훅 임포트] ---
import React, { useState } from "react"; // 리액트의 상태 관리 훅(useState)
import Link from "next/link"; // 페이지 이동을 위한 Next.js 링크 컴포넌트
import { useRouter } from "next/navigation"; // 페이지 이동을 위한 라우터 훅

// 화면을 예쁘게 꾸며줄 아이콘들을 가져옵니다.
import {
  Mail, // 이메일 아이콘
  User, // 사용자 아이콘
  ArrowRight, // 오른쪽 화살표 아이콘
  Sparkles, // 반짝임 효과 아이콘
  ChevronLeft, // 뒤로가기 화살표
  CheckCircle2, // 체크박스(완료) 아이콘
} from "lucide-react";
import axios from "axios"; // 서버 통신을 위한 라이브러리
// [추가] 모달 컴포넌트 임포트 (알림창이나 에러 메시지 띄울 때 사용)
import Modal from "@/components/common/Modal";

// --- [타입 정의] ---
// 찾기 모드 타입 (아이디 찾기 또는 비밀번호 찾기)
type FindMode = "id" | "pw";

// 입력 필드(FindInput) 컴포넌트가 받을 속성(Props) 정의
interface FindInputProps {
  label: string; // 라벨 텍스트 (예: "이름")
  icon: React.ReactNode; // 아이콘 컴포넌트
  placeholder: string; // 힌트 텍스트
  value: string; // 현재 입력값
  id: string; // input 태그의 ID
  onChange: (value: string) => void; // 값 변경 시 실행할 함수
}

// --- [메인 페이지 컴포넌트] ---
export default function Page() {
  const router = useRouter(); // 라우터 객체 생성

  // const proxyUrl = process.env.NEXT_PUBLIC_PROXY_URL; // (현재는 주석 처리되어 사용 안 함)

  // --- [상태 관리 (State)] ---
  const [mode, setMode] = useState<FindMode>("id"); // 현재 모드 (기본값: 'id' - 아이디 찾기)

  // 입력 폼 데이터 관리
  const [formData, setFormData] = useState({
    name: "", // 이름
    email: "", // 이메일
    loginId: "", // 아이디 (비밀번호 찾기 모드에서만 사용)
  });

  const [isSubmitted, setIsSubmitted] = useState(false); // 폼 제출 여부 (제출 후 결과 화면 전환용)
  const [code, setCode] = useState(""); // 이메일로 받은 인증번호 입력값

  // --- [모달 상태 관리] ---
  // 모달을 띄우기 위해 필요한 정보들을 상태로 관리합니다.
  const [modalConfig, setModalConfig] = useState({
    isOpen: false, // 모달 열림 여부
    title: "", // 제목
    content: "", // 내용
    type: "success" as "success" | "error" | "warning" | "confirm", // 타입 (성공/실패 등)
    onConfirm: undefined as (() => void) | undefined, // 확인 버튼 눌렀을 때 실행할 함수
  });

  // --- [모달 헬퍼 함수] ---
  // 모달을 쉽게 열기 위한 함수입니다.
  const openModal = (
    content: string, // 보여줄 메시지
    type: "success" | "error" | "warning" | "confirm" = "success", // 타입 (기본값: success)
    title?: string, // 제목 (생략 시 타입에 따라 자동 설정)
    onConfirm?: () => void // 확인 버튼 클릭 시 콜백
  ) => {
    setModalConfig({
      isOpen: true,
      content,
      type,
      title: title || (type === "error" ? "오류 발생" : "알림"), // 제목 자동 설정 로직
      onConfirm,
    });
  };

  // 모달을 닫는 함수입니다.
  const closeModal = () => {
    setModalConfig((prev) => ({ ...prev, isOpen: false }));
  };
  // ---------------------------

  // --- [폼 제출 핸들러] ---
  // 사용자가 정보를 입력하고 버튼을 눌렀을 때 실행됩니다.
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault(); // 기본 폼 제출 동작(새로고침) 막기
    console.log(
      `${mode === "id" ? "아이디" : "비밀번호"} 찾기 요청:`,
      formData
    );

    // 1. 아이디 찾기 모드일 때
    if (mode === "id") {
      // 유효성 검사: 이름 입력 확인
      if (formData.name.length === 0) {
        openModal("이름을 입력해주세요.", "warning");
        return;
      }
      // 유효성 검사: 이메일 입력 확인
      if (formData.email.length === 0) {
        openModal("이메일을 입력해주세요.", "warning");
        return;
      }

      // 서버에 인증번호 발송 요청 (GET 방식이라고 보이지만, 실제로는 POST로 요청 중)
      axios
        .post(
          `${process.env.NEXT_PUBLIC_API_URL}/api/v1/user/find-id/get-token?addr=${formData.email}`
        )
        .then((response) => {
          // 성공 시 별도 알림 없이 isSubmitted 상태만 변경하여 다음 화면으로 넘어감
        })
        .catch((error) => {
          // 실패 시 에러 모달 표시
          openModal(
            "인증번호 발송에 실패했습니다. 다시 시도해주세요.",
            "error"
          );
        });
    }

    // 2. 비밀번호 찾기 모드일 때
    if (mode === "pw") {
      // 유효성 검사들
      if (formData.loginId.length === 0) {
        openModal("아이디를 입력해주세요.", "warning");
        return;
      }
      if (formData.email.length === 0) {
        openModal("이메일을 입력해주세요.", "warning");
        return;
      }
      if (formData.name.length === 0) {
        openModal("이름을 입력해주세요.", "warning");
        return;
      }

      // 서버에 비밀번호 재설정 링크 발송 요청
      axios
        .post(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/user/getResetPw`, {
          loginId: formData.loginId,
          name: formData.name,
          email: formData.email,
        })
        .then((response) => {
          // 성공 시 다음 화면으로 진행
        })
        .catch((error) => {
          openModal("발송에 실패했습니다. 다시 시도해주세요.", "error");
        });
    }

    // 요청이 성공적으로 보내졌다고 가정하고 화면 전환 (실제로는 axios 성공 안에서 해야 더 안전함)
    setIsSubmitted(true);
  };

  // --- [인증번호 입력 핸들러] ---
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // 숫자만 입력받도록 정규식으로 필터링
    const onlyNumbers = value.replace(/[^0-9]/g, "");
    setCode(onlyNumbers);
  };

  // --- [인증번호 확인 핸들러 (아이디 찾기)] ---
  const handleVerify = () => {
    if (code.length === 0) {
      openModal("인증번호를 입력해주세요.", "warning");
      return;
    }

    // 서버에 인증번호와 정보 전송하여 아이디 찾기 시도
    axios
      .post(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/user/find-id`, {
        name: formData.name,
        email: formData.email,
        token: code,
      })
      .then((response) => {
        const responseData = response.data;
        const koreanRegex = /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/; // 한글 포함 여부 체크용 정규식

        // 에러 메시지가 200 OK와 함께 한글 문자열로 오는 경우를 대비한 방어 코드
        if (
          typeof responseData === "string" &&
          koreanRegex.test(responseData)
        ) {
          console.warn(
            "응답이 한글로 왔습니다 (에러 메시지일 가능성):",
            responseData
          );
          openModal("아이디 찾기 실패: " + responseData, "error");
          return;
        }

        console.log("찾은 아이디:", responseData);

        // [중요] 성공 시 모달로 아이디를 보여줍니다.
        openModal(
          `회원님의 아이디는 [ ${responseData} ] 입니다.`,
          "success",
          "아이디 찾기 성공",
          () => router.push("/sign-in") // 확인 누르면 로그인 페이지로 이동
        );
      })
      .catch((error) => {
        openModal("인증번호 확인에 실패했습니다. 다시 시도해주세요.", "error");
      });

    // (기존 코드의 router.push는 제거됨)
  };

  // --- [화면 렌더링] ---
  return (
    <div className="min-h-screen bg-[#fcfdfc] flex items-center justify-center p-4 md:p-8">
      {/* 1. 모달 컴포넌트 배치 (평소엔 숨겨져 있음) */}
      <Modal
        isOpen={modalConfig.isOpen}
        onClose={closeModal}
        title={modalConfig.title}
        content={modalConfig.content}
        type={modalConfig.type}
        onConfirm={modalConfig.onConfirm}
      />

      <div className="max-w-md w-full">
        {/* 2. 로그인 화면으로 돌아가기 버튼 */}
        <Link
          href="/sign-in"
          className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-900 transition-colors mb-8 group"
        >
          <ChevronLeft
            size={20}
            className="group-hover:-translate-x-1 transition-transform"
          />
          <span className="text-sm font-black tracking-tight">
            Back to Login
          </span>
        </Link>

        {/* 3. 메인 카드 박스 */}
        <div className="bg-white rounded-[3.5rem] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.06)] border border-slate-50 overflow-hidden relative p-8 md:p-12">
          {/* 배경 장식 (흐릿한 초록색 원) */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-green-500 rounded-full blur-[60px] opacity-10 -mr-16 -mt-16" />

          {/* 4. 제출 전(입력 화면)과 제출 후(결과 화면) 분기 */}
          {!isSubmitted ? (
            <>
              {/* 상단 타이틀 영역 */}
              <div className="mb-10 text-center">
                <div className="w-12 h-12 bg-green-500 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-green-100 mx-auto mb-6">
                  <Sparkles size={24} className="fill-white" />
                </div>
                <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-3">
                  Find Account
                </h2>
                <p className="text-slate-400 text-sm font-bold tracking-tight">
                  계정 정보를 잊으셨나요?
                </p>
              </div>

              {/* 탭 스위치 (아이디 찾기 / 비밀번호 재설정) */}
              <div className="flex bg-slate-50 p-1.5 rounded-[1.8rem] mb-8 relative">
                <button
                  onClick={() => setMode("id")}
                  className={`flex-1 py-3.5 text-xs font-black rounded-3xl transition-all relative z-10 ${
                    mode === "id" ? "text-white" : "text-slate-400"
                  }`}
                >
                  아이디 찾기
                </button>
                <button
                  onClick={() => setMode("pw")}
                  className={`flex-1 py-3.5 text-xs font-black rounded-3xl transition-all relative z-10 ${
                    mode === "pw" ? "text-white" : "text-slate-400"
                  }`}
                >
                  비밀번호 재설정
                </button>
                {/* 탭 배경 슬라이더 애니메이션 */}
                <div
                  className={`absolute top-1.5 bottom-1.5 left-1.5 w-[calc(50%-6px)] bg-slate-900 rounded-3xl transition-transform duration-300 ease-out ${
                    mode === "pw" ? "translate-x-full" : "translate-x-0"
                  }`}
                />
              </div>

              {/* 입력 폼 */}
              <form onSubmit={handleSubmit} className="space-y-5">
                {mode === "id" ? (
                  // 아이디 찾기 입력 필드들
                  <>
                    <FindInput
                      id="find-name"
                      label="이름"
                      icon={<User size={18} />}
                      placeholder="가입 시 등록한 이름"
                      value={formData.name}
                      onChange={(v) => setFormData({ ...formData, name: v })}
                    />
                    <FindInput
                      id="find-email"
                      label="이메일 주소"
                      icon={<Mail size={18} />}
                      placeholder="example@mail.com"
                      value={formData.email}
                      onChange={(v) => setFormData({ ...formData, email: v })}
                    />
                  </>
                ) : (
                  // 비밀번호 재설정 입력 필드들 (아이디 추가됨)
                  <>
                    <FindInput
                      id="find-name"
                      label="이름"
                      icon={<User size={18} />}
                      placeholder="가입한 이름 입력"
                      value={formData.name}
                      onChange={(v) => setFormData({ ...formData, name: v })}
                    />
                    <FindInput
                      id="find-id"
                      label="아이디"
                      icon={<User size={18} />}
                      placeholder="가입한 아이디 입력"
                      value={formData.loginId}
                      onChange={(v) => setFormData({ ...formData, loginId: v })}
                    />
                    <FindInput
                      id="find-email-pw"
                      label="이메일 주소"
                      icon={<Mail size={18} />}
                      placeholder="ID에 등록된 이메일"
                      value={formData.email}
                      onChange={(v) => setFormData({ ...formData, email: v })}
                    />
                  </>
                )}

                {/* 제출 버튼 */}
                <button
                  type="submit"
                  className="w-full bg-slate-900 text-white font-black py-5 rounded-4xl shadow-2xl shadow-slate-200 hover:bg-green-600 transition-all active:scale-[0.98] flex items-center justify-center gap-2 mt-6 group"
                >
                  {mode === "id" ? "아이디 확인하기" : "재설정 링크 발송"}
                  <ArrowRight
                    size={18}
                    className="group-hover:translate-x-1 transition-transform"
                  />
                </button>
              </form>
            </>
          ) : (
            /* 5. 결과 완료 화면 (isSubmitted가 true일 때) */
            <div className="text-center py-6 animate-in fade-in zoom-in-95 duration-500">
              <div className="w-20 h-20 bg-green-50 rounded-[2.5rem] flex items-center justify-center text-green-500 mx-auto mb-8">
                <CheckCircle2 size={40} strokeWidth={2.5} />
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-4 tracking-tight">
                요청 완료!
              </h3>

              {mode === "id" ? (
                // 아이디 찾기 완료 시: 인증번호 입력란 표시
                <>
                  <p className="text-slate-500 text-sm font-bold leading-relaxed mb-10 px-4">
                    입력하신 이메일로 인증번호를 발송해 드렸습니다. <br />
                    이메일을 확인하시고 인증번호를 입력해 주세요.
                  </p>
                  <input
                    type="text"
                    id="code"
                    placeholder="인증번호 입력"
                    value={code}
                    onChange={handleInputChange}
                    inputMode="numeric"
                    maxLength={6}
                    className="w-full mb-6 px-4 py-3 border border-slate-200 rounded-2xl text-center font-black text-slate-700 placeholder:text-slate-300 focus:border-green-400 focus:ring-[6px] focus:ring-green-50/50 outline-none transition-all"
                  />
                  <button
                    onClick={handleVerify}
                    type="button"
                    className="w-full bg-slate-900 text-white font-black py-5 rounded-4xl shadow-2xl shadow-slate-200 hover:bg-green-600 transition-all active:scale-[0.98] flex items-center justify-center gap-2 mt-6 group"
                  >
                    인증번호 확인
                  </button>
                </>
              ) : (
                // 비밀번호 찾기 완료 시: 안내 메시지 표시
                <p className="text-slate-500 text-sm font-bold leading-relaxed mb-10 px-4">
                  입력하신 이메일
                  <span className="text-slate-900">
                    {formData.email}
                  </span>로 <br />
                  재설정링크를 보냈습니다.
                </p>
              )}

              <Link
                href="/sign-in"
                className="block w-full bg-slate-50 text-slate-900 font-black py-5 rounded-4xl hover:bg-slate-100 transition-all"
              >
                로그인 화면으로 돌아가기
              </Link>
            </div>
          )}
        </div>

        {/* 6. 하단 고객센터 링크 */}
        <div className="mt-10 text-center">
          <p className="text-xs font-bold text-slate-400">
            도움이 필요하신가요?{" "}
            <Link
              href="#"
              className="text-slate-900 underline underline-offset-4 ml-2"
            >
              고객센터 문의하기
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

// --- [서브 컴포넌트: 입력 필드] ---
// 반복되는 input 디자인을 컴포넌트로 분리하여 재사용성을 높였습니다.
const FindInput = ({
  label,
  icon,
  placeholder,
  value,
  id,
  onChange,
}: FindInputProps) => (
  <div className="space-y-2">
    <label
      htmlFor={id}
      className="text-[11px] font-black text-slate-400 ml-4 uppercase tracking-[0.15em] cursor-pointer"
    >
      {label}
    </label>
    <div className="relative group">
      <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-green-500 transition-colors">
        {icon}
      </div>
      <input
        id={id}
        name={id}
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full pl-14 pr-6 py-5 bg-slate-50/50 border border-slate-100 rounded-[1.8rem] outline-none transition-all font-black text-slate-700 placeholder:text-slate-300 focus:bg-white focus:border-green-400 focus:ring-[6px] focus:ring-green-50/50"
      />
    </div>
  </div>
);

// 1. 페이지 진입 (Initial State)

// 사용자가 페이지에 접속합니다.

// 기본 모드는 mode: "id"(아이디 찾기)이고, isSubmitted: false이므로 이름과 이메일을 입력하는 폼이 보입니다.

// 2. 탭 전환 (Interaction)

// 사용자가 [비밀번호 재설정] 탭을 클릭합니다.

// setMode("pw")가 실행되어 mode가 바뀝니다. 검은색 배경 슬라이더가 오른쪽으로 이동하고, 입력 폼에 아이디 입력란이 추가됩니다.

// 다시 [아이디 찾기] 탭을 클릭해 돌아옵니다.

// 3. 폼 입력 및 제출 (Form Submission)

// 사용자가 이름과 이메일을 입력하고 [아이디 확인하기] 버튼을 누릅니다.

// handleSubmit 함수가 실행됩니다.

// 입력값 검증 후 axios.post(.../get-token)을 호출해 서버에 **"이 이메일로 인증번호 보내줘"**라고 요청합니다.

// 요청 후 setIsSubmitted(true)가 되어 화면이 "요청 완료! 인증번호를 입력하세요" 상태로 바뀝니다.

// 4. 인증번호 입력 및 확인 (Verify)

// 사용자가 이메일을 확인하고 인증번호(예: 123456)를 입력합니다. code 상태에 저장됩니다.

// [인증번호 확인] 버튼을 누르면 handleVerify 함수가 실행됩니다.

// 서버에 이름, 이메일, 인증번호를 보내 확인 요청을 합니다.

// 5. 결과 확인 (Completion)

// 서버가 **"맞아! 아이디는 user123이야"**라고 응답합니다.

// openModal 함수가 실행되어 **"회원님의 아이디는 [ user123 ] 입니다."**라는 성공 모달창이 뜹니다.

// 사용자가 모달의 [확인] 버튼을 누르면 로그인 페이지로 이동합니다.
