// 1. [Imports] Next.js에서 페이지 이동을 담당하는 훅을 가져옵니다.
import { useRouter } from "next/navigation";

// 2. [Imports] 브라우저의 쿠키(Cookie)를 쉽게 저장하고 삭제할 수 있게 해주는 라이브러리입니다.
import Cookies from "js-cookie";

// 3. [Imports] 실제 서버(백엔드)와 통신해서 로그인 요청을 보낼 API 함수들을 가져옵니다.
import { authService } from "@/api/services";

// 4. [Custom Hook Definition] 'useAuth'라는 이름의 커스텀 훅을 만듭니다.
// 이 훅은 로그인, 로그아웃, 소셜 로그인 기능을 꾸러미로 묶어서 제공합니다.
export const useAuth = () => {
  // 5. [Router] 페이지 이동을 위한 라우터 객체를 생성합니다. (하지만 아래 코드에서는 window.location을 주로 씁니다)
  const router = useRouter();

  // 6. [Function] 일반 로그인(이메일/비번)을 처리하는 비동기 함수입니다.
  // formData: 사용자가 입력한 아이디, 비밀번호가 담긴 객체입니다.
  const login = async (formData: any) => {
    try {
      // 7. [API Call] 서버에 로그인 정보를 보내고 응답을 기다립니다.
      // 주석 설명: 백엔드가 Set-Cookie 헤더를 주면 브라우저가 알아서 저장하지만,
      // 혹시 몰라 프론트엔드에서도 수동으로 저장하는 로직이 아래에 포함되어 있습니다.
      const response = await authService.login(formData);

      // 8. [Token Extraction] 서버 응답에서 토큰(출입증)을 꺼냅니다.
      // 서버가 주는 이름이 'token'일 수도 있고 'accessToken'일 수도 있어서 둘 다 확인합니다.
      const token = response.data.token || response.data.accessToken;

      // 9. [Cookie Setting] 토큰이 정상적으로 있다면 쿠키에 저장합니다.
      if (token) {
        // "token"이라는 이름으로 저장하고, 7일 뒤에 만료되게 설정하며, 사이트 전체("/")에서 쓸 수 있게 합니다.
        Cookies.set("token", token, { expires: 7, path: "/" });
      }

      // 10. [Redirect] 로그인이 성공했으니 메인 페이지("/")로 이동합니다.
      // router.push 대신 window.location.href를 쓴 이유는 페이지를 '새로고침'하여 로그인 상태를 확실하게 반영하기 위함입니다.
      window.location.href = "/";
    } catch (error: any) {
      // 11. [Error Handling] 로그인에 실패하면 에러 메시지를 알림창으로 띄웁니다.
      // 서버가 보낸 메시지가 있으면 그걸 보여주고, 없으면 "로그인에 실패했습니다"라고 띄웁니다.
      alert(error.response?.data?.message || "로그인에 실패했습니다.");
    }
  };

  // 12. [Function] 로그아웃을 처리하는 함수입니다.
  const logout = () => {
    // 13. [Cookie Removal] 저장해뒀던 'token' 쿠키를 삭제합니다.
    Cookies.remove("token", { path: "/" });

    // 14. [Cookie Removal] 혹시 모르니 'accessToken'이라는 이름의 쿠키도 같이 삭제합니다. (청소)
    Cookies.remove("accessToken", { path: "/" });

    // 15. [Redirect] 로그아웃 되었으니 메인 페이지로 이동(새로고침)합니다.
    window.location.href = "/";
  };

  // 16. [Object] 소셜 로그인(네이버, 카카오) 기능을 담은 객체입니다.
  const socialLogin = {
    // 17. [Naver] 네이버 로그인 함수
    naver: () => {
      // 환경변수(.env)에서 네이버 아이디(Client ID)를 가져옵니다.
      const naverClientId = process.env.NEXT_PUBLIC_NAVER_CLIENT_ID;

      // 로그인이 끝나고 돌아올 우리 사이트 주소(Callback URL)를 만듭니다.
      // window.location.origin은 현재 사이트 도메인(예: http://localhost:3000)입니다.
      const redirectUri = `${window.location.origin}/sign-in/naver/callback`;

      // 네이버 로그인 페이지로 이동시킵니다.
      // 필요한 정보(ID, 돌아올 주소 등)를 URL 뒤에 쿼리스트링으로 붙여서 보냅니다.
      window.location.href = `https://nid.naver.com/oauth2.0/authorize?response_type=code&client_id=${naverClientId}&state=false&redirect_uri=${encodeURIComponent(
        redirectUri
      )}`;
    },

    // 18. [Kakao] 카카오 로그인 함수
    kakao: () => {
      // 환경변수에서 카카오 API 키를 가져옵니다.
      const kakaoApiKey = process.env.NEXT_PUBLIC_KAKAO_API_KEY;

      // 로그인이 끝나고 돌아올 주소를 만듭니다.
      const redirectUri = `${window.location.origin}/sign-in/kakao/callback`;

      // 카카오 로그인 페이지로 이동시킵니다.
      window.location.href = `https://kauth.kakao.com/oauth/authorize?client_id=${kakaoApiKey}&redirect_uri=${redirectUri}&response_type=code`;
    },
  };

  // 19. [Return] 컴포넌트가 이 기능들을 쓸 수 있도록 밖으로 내보냅니다.
  return { login, logout, socialLogin };
};

// 로그인 시도 (login):

// 사용자가 입력한 정보(formData)를 들고 서버(authService)에 가서 "문 열어주세요" 하고 노크합니다.

// 서버가 정보를 확인하고 "맞네, 들어와!"라며 **토큰(Token, 출입증)**을 줍니다.

// 이 훅은 그 출입증을 받아서 브라우저의 **쿠키(Cookie)**라는 안전한 주머니에 token이라는 이름으로 저장합니다. (유효기간 7일)

// 저장이 끝나면 메인 페이지(/)로 화면을 강제로 이동시킵니다. (새로고침 효과)

// 로그아웃 (logout):

// 사용자가 [로그아웃]을 누르면, 쿠키 주머니를 뒤져서 token과 accessToken이라는 출입증을 모두 찢어버립니다(삭제).

// 그리고 다시 메인 대문(/)으로 쫓아냅니다.

// 소셜 로그인 (socialLogin):

// [네이버 로그인] 버튼을 누르면, 네이버가 정해준 **특수 주소(URL)**로 이동시킵니다.

// 이때 "우리 사이트 열쇠(Client ID)"와 "로그인 끝나면 돌아올 곳(Redirect URI)"을 같이 적어서 보냅니다.
