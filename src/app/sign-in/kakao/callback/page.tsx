"use client"; // 이 파일은 사용자의 브라우저에서 실행되는 클라이언트 컴포넌트라고 선언합니다. (useEffect, useState 사용 필수)

// 1. React의 핵심 기능들을 불러옵니다.
// useEffect: 화면이 켜지자마자 실행할 작업용
// useRef: 값이 바뀌어도 화면을 다시 그리지 않는 변수용 (중복 실행 방지)
// Suspense: 데이터가 준비될 때까지 기다려주는 기능
// useState: 화면에 보여줄 상태(문구) 저장용
import { useEffect, useRef, Suspense, useState } from "react";

// 2. Next.js의 내비게이션 기능들을 불러옵니다.
// useRouter: 페이지 이동시킬 때 사용
// useSearchParams: URL 뒤에 붙은 ?code=... 값을 읽을 때 사용
import { useRouter, useSearchParams } from "next/navigation";

// 3. 우리가 미리 만들어둔 API 호출 함수 모음집을 불러옵니다. (로그인 요청용)
import { authService } from "@/api/services";

// 4. 브라우저 쿠키를 쉽게 다루기 위한 라이브러리를 불러옵니다. (토큰 저장용)
import Cookies from "js-cookie";

// 5. 로그인 처리하는 동안 보여줄 예쁜 로딩 화면 컴포넌트를 불러옵니다.
import { AuthLoadingView } from "@/components/auth/AuthLoadingView";

// ==================================================================
// [Component 1] 실제 카카오 로그인 로직을 담당하는 내부 컴포넌트
// ==================================================================
function KakaoCallbackContent() {
  // 1. 페이지 이동을 위한 라우터 객체를 생성합니다.
  const router = useRouter();

  // 2. 현재 URL의 쿼리 스트링(?뒤에 붙은 것들)을 읽어오는 도구입니다.
  const searchParams = useSearchParams();

  // 3. 쿼리 스트링 중에서 'code'라는 이름의 값을 뽑아냅니다.
  // 예: /callback?code=ABCD... 라면 code 변수에는 "ABCD..."가 들어갑니다.
  // 이게 바로 카카오가 발급해준 '인가 코드'입니다.
  const code = searchParams.get("code");

  // 4. useEffect가 두 번 실행되는 것을 막기 위한 안전장치입니다.
  // React 18 개발 모드에서는 useEffect가 2번 실행되는데, 로그인이 2번 요청되면 에러가 납니다.
  // useRef는 값이 바뀌어도 컴포넌트가 다시 렌더링되지 않으므로, 실행 여부 체크용으로 딱입니다.
  const isRun = useRef(false);

  // 5. 현재 진행 상황을 화면에 보여주기 위한 상태 변수입니다.
  // 처음엔 "Authenticating Kakao..."(카카오 인증 중...)라고 보여줍니다.
  const [status, setStatus] = useState("Authenticating Kakao...");

  // 6. [핵심] 컴포넌트가 화면에 나타나거나 'code'가 바뀔 때 실행되는 로직입니다.
  useEffect(() => {
    // [예외 처리] 코드가 없거나, 이미 한 번 실행된 적이 있다면(isRun.current가 true면)
    // 아무것도 하지 않고 함수를 끝냅니다. (중복 로그인 요청 방지)
    if (!code || isRun.current) return;

    // "나 이제 실행한다!"라고 깃발을 꽂습니다. 다음엔 위 if문에 걸려서 실행 안 됩니다.
    isRun.current = true;

    // 7. [API 요청] 백엔드 서버에게 카카오 코드를 보냅니다.
    // "이 코드 줄 테니까 로그인 처리해주고 우리 사이트 전용 토큰 줘!"
    authService
      .kakaoLogin(code)
      .then((res) => {
        // [성공 시] 백엔드가 정상적으로 처리하고 응답(res)을 줬을 때 실행됩니다.

        // 응답 데이터에서 실제 사용할 토큰(JWT 등)을 꺼냅니다.
        const token = res.data.token;

        // 쿠키에 "token"이라는 이름으로 저장합니다.
        // expires: 1 -> 1일 동안 유지
        // path: "/" -> 사이트 모든 곳에서 이 쿠키 사용 가능
        Cookies.set("token", token, { expires: 1, path: "/" });

        // 로그인이 완료되었으니 메인 페이지("/")로 이동시킵니다.
         router.push("/");
      })
      .catch((err) => {
        // [실패 시] 백엔드가 에러를 뱉었거나 통신이 실패했을 때 실행됩니다.

        // 에러 응답의 본문(body)을 꺼냅니다.
        const errbody = err.response?.data;

        // 에러 메시지가 객체(JSON) 형태면 문자열로 예쁘게 변환하고, 아니면 그대로 씁니다.
        const errorMessage =
          typeof errbody === "object"
            ? JSON.stringify(errbody, null, 2)
            : errbody;

        // 화면 상태 메시지를 "Login Failed"(로그인 실패)로 바꿉니다.
        setStatus("Login Failed");

        // 사용자에게 알림창(Alert)을 띄웁니다.
        // 만약 토큰이 null이면 "이미 가입된 메일"이라고 친절하게 알려주고,
        // 그 외의 에러면 서버가 준 에러 메시지를 그대로 보여줍니다.
        alert(
          `카카오 로그인에 실패했습니다. : ${
            errbody.token === null ? "이미 가입된 메일 입니다" : errorMessage
          }`
        );

        // 로그인에 실패했으니 다시 로그인 페이지("/sign-in")로 쫓아냅니다.
        router.push("/sign-in");
      });
  }, [code, router]); // 이 useEffect는 'code'나 'router'가 변경될 때 실행됩니다.

  // 8. 로직이 돌아가는 동안 화면에는 로딩 컴포넌트를 보여줍니다.
  // status 변수에 담긴 메시지(예: "Authenticating Kakao...")가 화면에 뜹니다.
  return <AuthLoadingView status={status} />;
}

// ==================================================================
// [Component 2] 외부로 내보내는 메인 페이지 컴포넌트
// ==================================================================
export default function Page() {
  return (
    // [Suspense] 중요!
    // useSearchParams()를 쓰는 컴포넌트(KakaoCallbackContent)는 반드시 Suspense로 감싸야 합니다.
    // 왜냐하면 URL 쿼리 파라미터를 읽어오는 과정이 비동기적으로 일어나기 때문입니다.
    // 데이터를 읽어오는 동안에는 fallback에 있는 <AuthLoadingView ... />를 대신 보여줍니다.
    <Suspense fallback={<AuthLoadingView status="Loading..." />}>
      <KakaoCallbackContent />
    </Suspense>
  );
}

// 진입: 사용자가 카카오 로그인 창에서 아이디/비번을 치고 [로그인]을 누르면, 브라우저가 우리 사이트 주소인 .../callback/kakao?code=어쩌구저쩌구로 이동합니다.

// 포착: useSearchParams가 주소창 뒤에 붙은 ?code=... 부분을 낚아칩니다. 이게 바로 카카오가 준 인증 코드입니다.

// 검문 (useEffect):

// 코드가 있나? -> 있어!

// 이미 처리했나? (isRun 체크) -> 아니, 처음이야!

// 그럼 실행하자!

// 서버 통신 (authService.kakaoLogin):

// 우리 백엔드 서버한테 "야, 카카오가 이 코드 줬어. 이거 카카오 서버에 확인해보고 진짜면 우리 사이트 로그인 토큰 내놔."라고 요청을 보냅니다.

// 이때 화면에는 "Authenticating Kakao..."(카카오 인증 중...)라는 문구가 뜹니다.

// 결과 처리:

// 성공하면: 백엔드가 토큰을 줍니다. 이걸 쿠키에 저장하고 메인 페이지(/)로 이동시킵니다. (로그인 성공!)

// 실패하면: "이미 가입된 이메일입니다" 같은 에러 메시지를 띄우고 다시 로그인 페이지(/sign-in)로 돌려보냅니다.
