export const handleNaverLogin = () => {
  const naverClientId = process.env.NEXT_PUBLIC_NAVER_CLIENT_ID;
  const redirectUri = `${window.location.origin}/sign-in/naver/callback`;
  const state = "false";

  const naverAuthUrl = `https://nid.naver.com/oauth2.0/authorize?response_type=code&client_id=${naverClientId}&state=${state}&redirect_uri=${encodeURIComponent(
    redirectUri
  )}`;
  window.location.href = naverAuthUrl;
};

export const handleKakaoLogin = () => {
  const kakaoApiKey = process.env.NEXT_PUBLIC_KAKAO_API_KEY;
  const redirectUri = `${window.location.origin}/sign-in/kakao/callback`;
  window.location.href = `https://kauth.kakao.com/oauth/authorize?client_id=${kakaoApiKey}&redirect_uri=${redirectUri}&response_type=code`;
};
