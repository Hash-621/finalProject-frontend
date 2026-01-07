import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { authService, userService } from "@/api/services";

export const useAuth = () => {
  const router = useRouter();

  const login = async (formData: any) => {
    try {
      // 백엔드가 Set-Cookie 헤더로 응답하면, 브라우저가 자동으로 저장합니다.
      await authService.login(formData);

      // ❌ 더 이상 프론트엔드에서 토큰을 직접 세팅할 필요가 없습니다.
      // const token = response.data.token || response.data.accessToken;
      // if (token) {
      //   Cookies.set("token", token, { expires: 7, path: "/" });
      // }

      // 로그인 성공 시 페이지 이동만 처리
      window.location.href = "/";
    } catch (error: any) {
      alert(error.response?.data?.message || "로그인에 실패했습니다.");
    }
  };

  const logout = () => {
    Cookies.remove("token", { path: "/" });

    Cookies.remove("accessToken", { path: "/" });

    window.location.href = "/";
  };

  const socialLogin = {
    naver: () => {
      const naverClientId = process.env.NEXT_PUBLIC_NAVER_CLIENT_ID;
      const redirectUri = `${window.location.origin}/sign-in/naver/callback`;
      window.location.href = `https://nid.naver.com/oauth2.0/authorize?response_type=code&client_id=${naverClientId}&state=false&redirect_uri=${encodeURIComponent(
        redirectUri
      )}`;
    },
    kakao: () => {
      const kakaoApiKey = process.env.NEXT_PUBLIC_KAKAO_API_KEY;
      const redirectUri = `${window.location.origin}/sign-in/kakao/callback`;
      window.location.href = `https://kauth.kakao.com/oauth/authorize?client_id=${kakaoApiKey}&redirect_uri=${redirectUri}&response_type=code`;
    },
  };

  return { login, logout, socialLogin };
};
