// 1. "use client": 이 컴포넌트는 브라우저에서 실행됩니다. (마우스 호버, 클릭 이벤트가 있기 때문)
"use client";

// --- [타입 및 아이콘 임포트] ---
import { JobData } from "@/types/job"; // 채용 공고 데이터 타입 (title, companyName 등)
// 화면을 예쁘게 꾸며줄 아이콘들을 가져옵니다.
import { Briefcase, Building2, Clock, FileText } from "lucide-react";

// --- [Props 타입 정의] ---
// 부모 컴포넌트로부터 받아야 할 데이터들의 규칙입니다.
interface JobCardProps {
  job: JobData; // 카드에 표시할 공고 데이터 객체
  onClick: (job: JobData) => void; // 카드를 클릭했을 때 실행할 함수 (주로 모달 열기)
}

// --- [메인 컴포넌트 정의] ---
export default function JobCard({ job, onClick }: JobCardProps) {
  // --- [화면 렌더링 (JSX)] ---
  return (
    // 1. 카드 전체 컨테이너
    <div
      // 스타일링:
      // group: 자식 요소들이 호버 상태를 공유할 수 있게 함
      // transition-all duration-300: 모든 변화(색상, 크기 등)를 0.3초 동안 부드럽게
      // relative overflow-hidden: 내부 장식 요소가 카드 밖으로 튀어나가지 않게 자름
      className="group bg-white p-6 rounded-4xl border border-gray-100 transition-all duration-300 flex flex-col justify-between h-[360px] relative overflow-hidden cursor-pointer "
      // 클릭 시 부모가 준 onClick 함수 실행 (현재 공고 데이터 전달)
      onClick={() => onClick(job)}
    >
      {/* 2. 상단 호버 라인 효과 */}
      {/* 평소엔 투명하다가(opacity-0), 마우스를 올리면(group-hover) 초록색 띠가 나타남 */}
      <div className="absolute top-0 left-0 w-full h-1.5 bg-green-500 opacity-0 group-hover:opacity-100 transition-opacity" />

      {/* 3. 카드 상단 내용 영역 (회사명, 제목, 조건들) */}
      <div>
        {/* 상단 뱃지 영역 (회사명, 마감일) */}
        <div className="flex justify-between items-start mb-4">
          {/* 회사명 뱃지 */}
          <span
            className={`text-[11px] font-bold text-green-600 bg-green-50 px-2.5 py-1 rounded-md border border-green-100 tracking-wide truncate max-w-[70%] transition-opacity ${
              // 회사명이 없으면 아예 안 보이게 처리 (opacity-0)
              !job.companyName || job.companyName.length === 0
                ? "opacity-0"
                : "opacity-100"
            }`}
          >
            {job.companyName || "공백"}{" "}
            {/* 데이터 없으면 '공백'이라고 표시 (안전장치) */}
          </span>

          {/* 마감 여부 뱃지 (고정값) */}
          <span className="text-[11px] font-medium text-gray-400 bg-gray-50 px-2 py-1 rounded-md shrink-0">
            채용시 마감
          </span>
        </div>

        {/* 공고 제목 */}
        {/* line-clamp-2: 제목이 너무 길면 2줄까지만 보여주고 ... 처리 */}
        {/* group-hover: 마우스 올리면 제목 색깔이 초록색으로 변함 */}
        <h3 className="font-bold text-lg text-gray-900 line-clamp-2 leading-snug mb-4 group-hover:text-green-600 transition-colors">
          {job.title}
        </h3>

        {/* 상세 조건 목록 (경력, 학력, 마감일) */}
        <div className="space-y-2.5">
          {/* 경력 정보 */}
          <div className="flex items-center gap-2 text-[13px] text-gray-500">
            <Briefcase className="w-4 h-4 text-gray-400" strokeWidth={2} />
            <span>{job.career || "경력무관"}</span>
          </div>
          {/* 학력 정보 */}
          <div className="flex items-center gap-2 text-[13px] text-gray-500">
            <Building2 className="w-4 h-4 text-gray-400" strokeWidth={2} />
            <span>{job.education || "학력무관"}</span>
          </div>
          {/* 마감일 정보 */}
          <div className="flex items-center gap-2 text-[13px] text-gray-500">
            <Clock className="w-4 h-4 text-orange-400" strokeWidth={2} />
            <span className="text-orange-500 font-medium">{job.deadline}</span>
          </div>
        </div>
      </div>

      {/* 4. 하단 버튼 영역 (상세 요강 보기) */}
      {/* 평소엔 회색 배경, 마우스 올리면 초록색 배경+흰 글씨로 반전됨 */}
      <div className="w-full mt-6 py-3.5 bg-gray-50 text-gray-700 rounded-2xl font-bold group-hover:bg-green-600 group-hover:text-white transition-all flex items-center justify-center gap-2 text-sm shadow-sm group-hover:shadow-green-200">
        <FileText className="w-4 h-4" strokeWidth={2.5} />
        상세 요강 보기
      </div>
    </div>
  );
}

// 1. 렌더링 (Display)

// 부모 컴포넌트(목록 페이지)가 JobCard를 호출하면서 데이터(job)를 넘겨줍니다.

// JobCard는 받은 데이터를 이용해 회사명, 제목, 경력 등의 텍스트를 채워 넣습니다.

// 이때 회사명이 비어있다면 opacity-0 클래스를 적용해 화면에서 안 보이게 숨깁니다.

// 2. 마우스 호버 (Hover Effect)

// 사용자가 카드 위에 마우스 커서를 올립니다.

// group-hover 클래스들이 일제히 작동합니다.

// 카드 맨 위의 absolute div가 나타나면서 상단에 초록색 띠가 생깁니다.

// 제목(h3)의 색상이 검은색에서 초록색으로 바뀝니다.

// 하단 버튼 배경색이 회색에서 진한 초록색으로 바뀌고 글씨는 흰색이 됩니다.

// 이 모든 변화는 transition 덕분에 0.3초 동안 부드럽게 일어납니다.

// 3. 클릭 (Click Action)

// 사용자가 카드를 클릭합니다.

// onClick={() => onClick(job)} 함수가 실행됩니다.

// 이 함수는 부모 컴포넌트(JobPage 등)에 있는 **"모달 열기 함수"**를 호출하게 되고, 결과적으로 화면에 상세 보기 모달이 뜨게 됩니다.
