import axios from "axios";

const api = axios.create({
  // 백엔드 주소 (뒷부분 /api/v1 확인!)
  baseURL: "http://192.168.0.101:8080/api/v1",
  // 쿠키/세션 공유를 위해 필수
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
