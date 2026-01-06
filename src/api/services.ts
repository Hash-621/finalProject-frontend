import api from "@/api/axios";

// 1. 유저 관련 서비스 (프로필, 정보 수정 등)
export const userService = {
  // 중복 사용 가능성을 위해 유지 (필요 없으면 제거 가능)
  login: (data: any) => api.post("/user/login", data),
  signUp: (data: any) => api.post("/user/signup", data),

  getUserInfo: () => api.get("/mypage/info"),
  updateUserInfo: (data: any) => api.put("/mypage/info", data),
  getFavorites: () => api.get("/mypage/favorites"),
};

// 2. 인증 관련 서비스 (로그인, 회원가입 - 페이지에서 사용하는 부분)
export const authService = {
  // [New] 일반 로그인 추가 (SignUpPage/SignInPage 호환용)
  login: (data: any) => api.post("/user/login", data),

  // [New] 회원가입 추가 (SignUpPage 호환용)
  signUp: (data: any) => api.post("/user/signup", data),

  // 카카오 로그인
  kakaoLogin: (code: string) => api.get(`/auth/kakao/callback?code=${code}`),

  // 네이버 로그인
  naverLogin: (loginData: { code: string; state: string }) =>
    api.post("/auth/naver/login", loginData, {
      headers: {
        "Content-Type": "application/json",
      },
    }),
};

// 3. 채용 정보 관련 서비스
export const jobService = {
  getCrawledJobs: (params?: Record<string, string | number>) => {
    const query = params ? new URLSearchParams(params as any).toString() : "";
    return api.get(`/job/crawl${query ? `?${query}` : ""}`);
  },
  applyJob: (data: any) => api.post("/job/apply", data),
};

// 4. 맛집 관련 서비스
export const restaurantService = {
  getRestaurants: () => api.get("/restaurant"),
  getRestaurantDetail: (id: string | number) => api.get(`/restaurant/${id}`),
  toggleFavorite: (id: number) => api.post(`/restaurant/${id}/favorite`),
};

// 5. 여행 코스 관련 서비스
export const tourService = {
  getTourCourses: () => api.get("/tour"),
  getTourDetail: (id: string) => api.get(`/tour/${id}`),
  toggleFavorite: (id: number) => api.post(`/tour/${id}/favorite`),
};

// 6. 병원/지도 관련 서비스
export const hospitalService = {
  getHospitals: () => api.get("/hospital"),
  getHospitalDetail: (id: number) => api.get(`/hospital/${id}`),
  toggleFavorite: (id: number) => api.post(`/hospital/${id}/favorite`),
};

// 7. 게시판 관련 서비스
export const boardService = {
  // 목록 조회
  getBoardPosts: (category: string) => {
    const endpoint =
      category === "free" ? "/community/free" : "/community/recommend";
    return api.get(endpoint);
  },

  // 상세 조회
  getPostDetail: (category: string, id: string) => {
    const endpoint =
      category === "free"
        ? `/community/free/${id}`
        : `/community/recommend/${id}`;
    return api.get(endpoint);
  },

  // 게시글 작성
  createPost: (category: string, data: any) => {
    const endpoint =
      category === "recommend" ? "/community/recommend" : "/community/free";
    return api.post(endpoint, data);
  },

  // 게시글 삭제
  deletePost: (category: string, id: string | number) => {
    const endpoint =
      category === "free"
        ? `/community/free/${id}`
        : `/community/recommend/${id}`;
    return api.delete(endpoint);
  },

  // 댓글 관련 로직
  getComments: (postId: string) => api.get(`/community/comments/${postId}`),
  createComment: (data: any) => api.post("/community/comments", data),
  deleteComment: (commentId: number) =>
    api.delete(`/community/comments/${commentId}`),
};
