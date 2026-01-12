"use client"; // 이 파일은 사용자의 브라우저에서 실행되는 클라이언트 컴포넌트입니다. (useEffect, useState 사용 필수)

// 1. React와 Next.js, 기타 라이브러리들을 불러옵니다.
import { useEffect, useRef, Suspense, useState } from "react"; // 화면 상태 관리 및 생명주기 훅
import { useRouter, useSearchParams } from "next/navigation"; // 페이지 이동 및 URL 정보 읽기 도구
import { authService } from "@/api/services"; // 백엔드로 로그인 요청을 보낼 함수 모음
import Cookies from "js-cookie"; // 브라우저 쿠키에 토큰을 쉽게 저장하게 해주는 도구
import { AuthLoadingView } from "@/components/auth/AuthLoadingView"; // 로딩 중일 때 보여줄 화면 컴포넌트

// ==================================================================
// [Component 1] 실제 네이버 로그인 로직을 처리하는 알맹이 컴포넌트
// ==================================================================
function NaverCallbackContent() {
  // 1. 페이지를 이동시킬 수 있는 리모컨(router)을 가져옵니다.
  const router = useRouter();

  // 2. 현재 주소창 뒤에 붙은 ?code=... &state=... 같은 쿼리 파라미터를 읽어옵니다.
  const searchParams = useSearchParams();

  // 3. [중복 실행 방지] API 요청을 이미 보냈는지 체크하는 변수입니다.
  // useRef는 값이 바뀌어도 화면이 깜빡(렌더링)이지 않아서 이런 체크용으로 딱입니다.
  const isRequestSent = useRef(false);

  // 4. 현재 진행 상황을 화면에 글씨로 보여주기 위한 상태 변수입니다.
  // 기본값은 "Authenticating Naver..." (네이버 인증 중...) 입니다.
  const [status, setStatus] = useState("Authenticating Naver...");

  // 5. [핵심 로직] 화면이 켜지거나 주소창 파라미터가 바뀔 때 실행됩니다.
  useEffect(() => {
    // [방어 코드] 만약 이미 요청을 보낸 적이 있다면(true), 더 이상 진행하지 않고 멈춥니다.
    // React 18의 Strict Mode에서는 이 useEffect가 두 번 실행될 수 있어서 꼭 필요합니다.
    if (isRequestSent.current) return;

    // 6. 주소창에서 네이버가 준 선물('code'와 'state')을 꺼냅니다.
    const code = searchParams.get("code");
    const state = searchParams.get("state");

    // 7. 코드와 스테이트가 둘 다 있을 때만 로그인을 시도합니다.
    if (code && state) {
      // "자, 이제 요청 보낸다!"라고 깃발을 꽂습니다. (중복 실행 방지)
      isRequestSent.current = true;

      // 8. [API 요청] 백엔드 서버에게 네이버 로그인 처리를 부탁합니다.
      authService
        .naverLogin({ code, state }) // 코드와 스테이트를 객체로 묶어서 보냅니다.
        .then((res) => {
          // [성공 시] 백엔드가 "OK" 하고 응답을 줬을 때 실행됩니다.

          // 응답 데이터에서 로그인 토큰(accessToken 또는 token)을 찾습니다.
          const token = res.data.accessToken || res.data.token;

          if (token) {
            // 토큰이 잘 왔다면 쿠키에 저장합니다. (7일 동안 유지, 사이트 전체에서 사용 가능)
            Cookies.set("token", token, { expires: 7, path: "/" });

            // 모든 처리가 끝났으니 메인 페이지("/")로 이동합니다.
            router.push("/");
          } else {
            // 성공은 했는데 토큰이 없다면? 뭔가 이상한 상황입니다.
            setStatus("Token missing");
          }
        })
        .catch((err) => {
          // [실패 시] 백엔드가 에러를 뱉거나 인터넷 문제 등으로 실패했을 때 실행됩니다.

          // 상태 메시지를 "Login Failed"(로그인 실패)로 바꿉니다.
          setStatus("Login Failed");

          // 에러 내용을 분석합니다. (객체로 올 수도 있고 문자열로 올 수도 있음)
          const errbody = err.response?.data;
          const errorMessage =
            typeof errbody === "object"
              ? JSON.stringify(errbody, null, 2) // 객체라면 보기 좋게 문자열로 변환
              : errbody; // 문자열이면 그대로 사용

          // 사용자에게 알림창으로 실패 이유를 보여줍니다.
          alert(`네이버 로그인에 실패했습니다. : ${errorMessage}`);

          // 실패했으니 다시 로그인하라고 로그인 페이지("/sign-in")로 보냅니다.
          router.push("/sign-in");
        });
    }
  }, [searchParams, router]); // 이 useEffect는 주소 파라미터나 라우터가 준비됐을 때 실행됩니다.

  // 9. 로직이 처리되는 동안 화면에는 로딩 뷰를 보여줍니다.
  return <AuthLoadingView status={status} />;
}

// ==================================================================
// [Component 2] 최종적으로 내보내는 페이지 컴포넌트
// ==================================================================
export default function Page() {
  return (
    // [Suspense] 필수!
    // useSearchParams()를 사용하는 컴포넌트는 반드시 Suspense로 감싸야 합니다.
    // URL에서 데이터를 읽어오는 건 비동기 작업이라서, 읽어오는 동안 보여줄 화면(fallback)이 필요하기 때문입니다.
    <Suspense fallback={<AuthLoadingView status="Loading..." />}>
      <NaverCallbackContent />
    </Suspense>
  );
}

// 상황: 사용자가 네이버 로그인 창에서 아이디/비번을 입력하고 [동의하기]를 눌렀습니다.

// 복귀: 네이버 서버가 사용자를 다시 우리 사이트(.../callback/naver)로 보내줍니다. 이때 주머니(URL)에 **code(인증키)**와 **state(보안키)**를 슬쩍 넣어줍니다.

// 포착 (useSearchParams): 이 페이지가 열리자마자 주소창을 뒤져서 네이버가 넣어준 code와 state를 찾아냅니다.

// 중복 방지 (useRef):

// "잠깐, 이거 벌써 처리한 건가?" 확인합니다.

// React 특성상 페이지가 열릴 때 코드가 두 번 실행될 수 있는데, 그러면 "이미 쓴 인증키입니다"라며 에러가 납니다. 이걸 막기 위해 **"처리 중" 깃발(isRequestSent)**을 꽂습니다.

// 서버 교환 (authService.naverLogin):

// 백엔드 서버에게 "네이버가 이 코드랑 스테이트 줬어요. 확인해 주세요!"라고 요청합니다.

// 화면에는 "Authenticating Naver..."(네이버 인증 중...)라는 문구가 뜹니다.

// 결과:

// 성공: 백엔드가 "확인됐어. 자, 여기 로그인 토큰!" 하고 줍니다. 이걸 쿠키에 저장하고 메인 페이지(/)로 이동합니다.

// 실패: "뭔가 잘못됐어."라고 하면 에러 메시지를 띄우고 다시 로그인 페이지(/sign-in)로 보냅니다.
