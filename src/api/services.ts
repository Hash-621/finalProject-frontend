import api from "@/api/axios";

// 유저 관련 서비스
export const userService = {
  login: (data: any) => api.post("/user/login", data),
  signUp: (data: any) => api.post("/user/signup", data),
  getUserInfo: () => api.get("/mypage/info"),
  updateUserInfo: (data: any) => api.put("/mypage/info", data),
};

// 채용 정보 관련 서비스
export const jobService = {
  getCrawledJobs: (params?: Record<string, string | number>) => {
    const query = params ? new URLSearchParams(params as any).toString() : "";
    return api.get(`/job/crawl${query ? `?${query}` : ""}`);
  },
  applyJob: (data: any) => api.post("/job/apply", data),
};

// 맛집 관련 서비스
export const restaurantService = {
  // 전체 맛집 리스트 가져오기
  getRestaurants: () => api.get("/restaurant"),

  // 특정 맛집 상세 정보 가져오기
  getRestaurantDetail: (id: string | number) => api.get(`/restaurant/${id}`),

  // 맛집 즐겨찾기 토글
  toggleFavorite: (id: number) => api.post(`/restaurant/${id}/favorite`),
};

// 여행 코스 관련 서비스
export const tourService = {
  getTourCourses: () => api.get("/tour"),
  getTourDetail: (id: string) => api.get(`/tour/${id}`),
};

// 병원/지도 관련 서비스
export const hospitalService = {
  getHospitals: () => api.get("/hospital"),
  getHospitalDetail: (id: number) => api.get(`/hospital/${id}`),
};

// 게시판 관련 서비스
export const boardService = {
  // 1. 목록 조회 (통합)
  getBoardPosts: (category: string) => {
    const endpoint =
      category === "free" ? "/community/free" : "/community/recommend";
    return api.get(endpoint);
  },

  // 2. 상세 조회
  getPostDetail: (category: string, id: string) => {
    const endpoint =
      category === "free"
        ? `/community/free/${id}`
        : `/community/recommend/${id}`;
    return api.get(endpoint);
  },

  // 3. 게시글 작성 (카테고리 적용)
  createPost: (category: string, data: any) => {
    const endpoint =
      category === "recommend" ? "/community/recommend" : "/community/free";
    return api.post(endpoint, data);
  },

  // 4. 게시글 삭제
  deletePost: (category: string, id: string | number) => {
    const endpoint =
      category === "free"
        ? `/community/free/${id}`
        : `/community/recommend/${id}`;
    return api.delete(endpoint);
  },

  // 5. 댓글 관련 로직
  getComments: (postId: string) => api.get(`/community/comments/${postId}`),
  createComment: (data: any) => api.post("/community/comments", data),
  deleteComment: (commentId: number) =>
    api.delete(`/community/comments/${commentId}`),
};

export const authService = {
  // 카카오 로그인
  kakaoLogin: (code: string) => api.get(`/auth/kakao/callback?code=${code}`),

  // 네이버 로그인 (데이터를 객체로 전달)
  naverLogin: (loginData: { code: string; state: string }) =>
    api.post("/auth/naver/login", loginData, {
      headers: {
        "Content-Type": "application/json",
      },
    }),
};
