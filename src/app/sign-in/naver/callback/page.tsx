// 1. "use client": 이 파일이 브라우저에서 실행되는 클라이언트 컴포넌트임을 선언합니다.
// (페이지 이동, 쿠키 저장 등 브라우저 API를 사용해야 하므로 필수입니다.)
"use client";

// --- [라이브러리 및 훅 임포트] ---
import { useEffect, useRef, Suspense, useState } from "react"; // 리액트 훅들 (비동기 처리, 참조 변수, 대기, 상태 관리)
import { useRouter, useSearchParams } from "next/navigation"; // Next.js 라우팅 훅 (페이지 이동, URL 파라미터 읽기)
import { authService } from "@/api/services"; // 백엔드와 통신하는 API 함수 모음
import Cookies from "js-cookie"; // 브라우저 쿠키를 쉽게 저장/삭제하는 라이브러리
import { AuthLoadingView } from "@/components/auth/AuthLoadingView"; // 로그인 진행 중에 보여줄 로딩 화면 컴포넌트

// --- [실제 네이버 로그인 로직을 처리하는 내부 컴포넌트] ---
function NaverCallbackContent() {
  const router = useRouter(); // 페이지 이동을 위한 객체
  const searchParams = useSearchParams(); // URL 뒤에 붙은 파라미터(?code=...&state=...)를 읽는 도구

  // 2. useEffect가 두 번 실행되는 것을 막기 위한 안전장치입니다. (React Strict Mode 대응)
  // useRef는 값이 바뀌어도 컴포넌트가 다시 렌더링되지 않습니다. "요청 보냈음" 깃발 역할을 합니다.
  const isRequestSent = useRef(false);

  // 3. 현재 진행 상황을 화면에 보여주기 위한 텍스트 상태입니다.
  const [status, setStatus] = useState("Authenticating Naver...");

  // --- [로그인 처리 (useEffect)] ---
  // 컴포넌트가 화면에 나타나면(Mount) 자동으로 실행됩니다.
  useEffect(() => {
    // 만약 이미 요청을 보낸 적이 있다면(True), 더 이상 진행하지 않고 멈춥니다.
    // (API 중복 호출 방지)
    if (isRequestSent.current) return;

    // 4. 네이버가 URL에 붙여준 '인증 코드'와 '상태 토큰'을 가져옵니다.
    const code = searchParams.get("code");
    const state = searchParams.get("state");

    // 5. 코드와 상태 값이 모두 있을 때만 로그인을 시도합니다.
    if (code && state) {
      // "나 이제 요청 보낸다!"라고 깃발을 꽂습니다. (중복 방지 락 걸기)
      isRequestSent.current = true;

      // 6. 백엔드 서버에 '네이버 로그인' 요청을 보냅니다.
      // code: 인증 티켓, state: 위조 방지용 토큰
      authService
        .naverLogin({ code, state })
        .then((res) => {
          // (1) 성공 시: 백엔드가 응답으로 준 토큰을 꺼냅니다.
          // (API 응답 구조에 따라 accessToken 또는 token 필드 사용)
          const token = res.data.accessToken || res.data.token;

          if (token) {
            // (2) 토큰이 있으면 쿠키에 저장합니다.
            // 이름: "token", 유효기간: 7일, 경로: 모든 페이지("/")
            Cookies.set("token", token, { expires: 7, path: "/" });

            // (3) 로그인이 완료되었으므로 메인 페이지("/")로 이동시킵니다.
            router.push("/");
          } else {
            // 토큰이 안 왔다면 에러 처리
            setStatus("Token missing");
          }
        })
        .catch((err) => {
          // (4) 실패 시: 에러 처리
          setStatus("Login Failed"); // 화면 메시지 변경
          alert("네이버 로그인에 실패했습니다."); // 경고창 띄움
          router.push("/sign-in"); // 다시 로그인 페이지로 돌려보냄
        });
    }
  }, [searchParams, router]); // URL 파라미터나 라우터가 준비되면 실행

  // 7. 로딩 중일 때 보여줄 화면을 렌더링합니다.
  return <AuthLoadingView status={status} />;
}

// --- [최상위 페이지 컴포넌트] ---
export default function Page() {
  // useSearchParams를 쓰는 컴포넌트는 빌드 에러 방지를 위해 Suspense로 감싸야 합니다.
  return (
    // 로딩되기 전까지 보여줄 대체 화면(fallback)을 설정합니다.
    <Suspense fallback={<AuthLoadingView status="Loading..." />}>
      <NaverCallbackContent />
    </Suspense>
  );
}

// 1. 네이버 인증 및 리다이렉트 (External Redirect)

// 사용자가 네이버 사이트에서 아이디/비번을 입력하고 동의합니다.

// 네이버 서버는 사용자를 우리 사이트 주소인 http://사이트주소/auth/callback/naver?code=AAA...&state=BBB... 로 다시 돌려보냅니다.

// 2. 페이지 진입 및 파라미터 추출 (Entry)

// 브라우저가 위 주소로 접속합니다. Page 컴포넌트 안의 NaverCallbackContent가 실행됩니다.

// useSearchParams가 URL에 있는 code(인증키)와 state(보안키)를 낚아챕니다.

// 3. 백엔드 교환 요청 (Token Exchange)

// useEffect가 실행됩니다. isRequestSent 체크를 통해 딱 한 번만 실행되도록 보장합니다.

// authService.naverLogin({ code, state })를 호출합니다.

// 프론트엔드: "백엔드야, 네이버가 준 이 코드(code)랑 보안키(state) 줄게. 확인해보고 로그인 시켜줘."

// 백엔드: (네이버 서버에 코드를 보내 유효성을 확인하고, 유저 정보를 조회한 뒤, 우리 사이트 전용 토큰을 발급)

// 4. 쿠키 저장 및 로그인 완료 (Completion)

// 백엔드에서 로그인 토큰이 도착합니다.

// Cookies.set을 통해 이 토큰을 브라우저의 쿠키 저장소에 안전하게 넣습니다. (유효기간 7일)

// 5. 페이지 이동 (Navigation)

// 모든 처리가 끝나면 router.push("/")가 실행되어 메인 페이지로 이동합니다.

// 사용자는 "Authenticating Naver..." 화면을 아주 잠깐만 보게 되며, 곧바로 로그인된 상태의 메인 화면을 보게 됩니다.
