// 1. "use client": 이 파일이 브라우저에서 실행되는 클라이언트 컴포넌트임을 선언합니다.
// (로그인 처리 후 쿠키 저장, 페이지 이동 등은 브라우저에서만 가능하기 때문입니다.)
"use client";

// --- [라이브러리 및 훅 임포트] ---
import { useEffect, useRef, Suspense, useState } from "react"; // 리액트 훅들 (사이드 이펙트, 참조, 비동기 대기, 상태 관리)
import { useRouter, useSearchParams } from "next/navigation"; // Next.js 라우팅 훅 (페이지 이동, URL 파라미터 읽기)
import { authService } from "@/api/services"; // 백엔드와 통신하는 API 함수 모음
import Cookies from "js-cookie"; // 브라우저 쿠키를 쉽게 다루는 라이브러리
import { AuthLoadingView } from "@/components/auth/AuthLoadingView"; // 로딩 화면 컴포넌트 (로그인 처리 중에 보여줌)

// --- [실제 로그인 로직을 담당하는 내부 컴포넌트] ---
function KakaoCallbackContent() {
  const router = useRouter(); // 페이지 이동을 위한 객체 생성
  const searchParams = useSearchParams(); // URL 뒤에 붙은 파라미터(?code=...)를 읽어오는 도구

  // 1. 카카오가 보내준 '인증 코드'를 URL에서 추출합니다.
  const code = searchParams.get("code");

  // 2. useEffect가 두 번 실행되는 것을 막기 위한 안전장치입니다. (React 18 Strict Mode 대응)
  // useRef는 값이 바뀌어도 화면이 다시 그려지지 않는 변수입니다.
  const isRun = useRef(false);

  // 3. 현재 진행 상황을 화면에 보여주기 위한 텍스트 상태입니다.
  const [status, setStatus] = useState("Authenticating Kakao...");

  // --- [로그인 처리 (useEffect)] ---
  // 컴포넌트가 화면에 나타나면(Mount) 자동으로 실행됩니다.
  useEffect(() => {
    // 코드가 없거나, 이미 한 번 실행된 적이 있다면(isRun.current === true) 중단합니다.
    // (중복 요청으로 인한 에러 방지)
    if (!code || isRun.current) return;

    // 실행되었다고 표시를 남깁니다.
    isRun.current = true;

    // 4. 백엔드 서버에 '카카오 로그인' 요청을 보냅니다.
    // 이때 카카오한테 받은 인증 코드(code)를 같이 보냅니다.
    authService
      .kakaoLogin(code)
      .then((res) => {
        // (1) 성공 시: 백엔드가 응답으로 준 JWT 토큰을 받습니다.
        const token = res.data.token;

        // (2) 받은 토큰을 브라우저 쿠키에 저장합니다.
        // 이름: "token", 유효기간: 1일, 경로: 모든 페이지("/")에서 접근 가능
        Cookies.set("token", token, { expires: 1, path: "/" });

        // (3) 로그인이 완료되었으므로 메인 페이지("/")로 이동시킵니다.
        router.push("/");
      })
      .catch((err) => {
        // (4) 실패 시: 에러 처리
        setStatus("Login Failed"); // 화면 메시지 변경
        alert("카카오 로그인에 실패했습니다."); // 경고창 띄움
        router.push("/sign-in"); // 다시 로그인 페이지로 돌려보냄
      });
  }, [code, router]); // code나 router가 변경될 때 실행 (사실상 처음 한 번만 실행됨)

  // 5. 로딩 중일 때 보여줄 화면을 렌더링합니다.
  return <AuthLoadingView status={status} />;
}

// --- [최상위 페이지 컴포넌트] ---
export default function Page() {
  // useSearchParams를 사용하는 컴포넌트(KakaoCallbackContent)는
  // 반드시 Suspense로 감싸야 빌드 에러가 나지 않습니다.
  return (
    // 로딩되기 전까지 보여줄 대체 화면(fallback)을 설정합니다.
    <Suspense fallback={<AuthLoadingView status="Loading..." />}>
      <KakaoCallbackContent />
    </Suspense>
  );
}

// 1. 카카오 인증 및 리다이렉트 (External Redirect)

// 사용자가 카카오 서버에서 아이디/비번을 입력하고 로그인을 완료합니다.

// 카카오 서버는 사용자를 우리 사이트 주소인 http://사이트주소/auth/callback/kakao?code=ABC123XYZ... 로 다시 돌려보냅니다.

// 2. 페이지 진입 및 코드 추출 (Entry)

// 브라우저가 위 주소로 접속합니다. Page 컴포넌트가 실행되고, 그 안의 KakaoCallbackContent가 실행됩니다.

// useSearchParams가 URL에 있는 code 값(ABC123XYZ...)을 낚아챕니다.

// 3. 백엔드 교환 요청 (Token Exchange)

// useEffect가 실행됩니다. isRun 체크를 통해 딱 한 번만 실행되도록 보장합니다.

// authService.kakaoLogin(code)를 호출합니다.

// 프론트엔드: "백엔드야, 내가 카카오한테 받은 이 임시 코드(ABC123XYZ...) 줄게. 진짜 우리 사이트 로그인 토큰으로 바꿔줘."

// 백엔드: (카카오 서버에 코드를 보내서 진짜 유저인지 확인 후, 우리 사이트 전용 JWT 토큰을 발급해서 응답)

// 4. 쿠키 저장 및 로그인 완료 (Completion)

// 백엔드에서 JWT 토큰이 도착합니다.

// Cookies.set을 통해 이 토큰을 브라우저의 쿠키 저장소에 안전하게 넣습니다. (이제 브라우저는 "나 로그인한 사람이야"라고 증명할 수 있게 됩니다.)

// 5. 페이지 이동 (Navigation)

// 모든 처리가 끝나면 router.push("/")가 실행되어 메인 페이지로 이동합니다.

// 사용자는 로그인 처리 화면을 아주 잠깐(0.5초~1초)만 보게 되며, 곧바로 로그인된 상태의 메인 화면을 보게 됩니다.
