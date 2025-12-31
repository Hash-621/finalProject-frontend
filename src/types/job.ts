// 1. 기본 채용 데이터 구조
export interface JobData {
  companyName: string;
  title: string;
  url: string;
  career: string;
  education: string;
  deadline: string;
  location?: string;
}

// 2. 지원하기 폼 데이터 (Apply Form)
export interface ApplyFormData {
  name: string;
  phone: string;
  message: string;
}

// 3. 지원 프로세스 단계 (Union Type)
// 문자열 오타 방지를 위해 타입을 고정합니다.
export type ApplyStep = "NONE" | "FORM" | "DONE";

// 4.
export interface DetailContent {
  task: string[];
  qualification: string[];
  preference: string[];
}

// 5.. API 응답 형태 (선택 사항)
// 백엔드에서 내려주는 데이터가 배열 형태라면 유용합니다.
export type JobResponse = JobData[];
