import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { userService } from "@/api/services";

export const useAuth = () => {
  const router = useRouter();

  const login = async (formData: any) => {
    try {
      const response = await userService.login(formData);
      const token = response.data.token || response.data.accessToken;
      if (token) {
        Cookies.set("token", token, { expires: 7, path: "/" });
        window.location.href = "/";
      }
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
