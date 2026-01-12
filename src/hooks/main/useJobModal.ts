// 1. [Imports] React의 상태 관리(useState)와 생명주기(useEffect) 훅을 가져옵니다.
import { useState, useEffect } from "react";

// 2. [Type Imports] 직무 데이터, 지원서 폼, 진행 단계 등 타입 정의를 가져옵니다. (TypeScript용 설명서)
import { JobData, ApplyFormData, ApplyStep, DetailContent } from "@/types/job";

// 3. [Data Import] 직무별 상세 내용(하는 일, 자격요건 등)이 담긴 정적 데이터(JSON 같은 것)를 가져옵니다.
import { JOB_DETAILS_DB } from "@/data/jobDetailData";

// 4. [Service Import] 서버에 지원서를 전송할 API 함수 모음을 가져옵니다.
import { jobService } from "@/api/services";

// 5. [Custom Hook Definition] 채용 모달 로직을 관리하는 훅을 정의합니다.
export const useJobModal = () => {
  // --- [State] 상태 관리 변수들 ---

  // 6. 모달이 현재 열려있는지 닫혀있는지 (true: 열림 / false: 닫힘)
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 7. 사용자가 클릭한 '그 직무'의 정보를 담습니다. (없으면 null)
  const [selectedJob, setSelectedJob] = useState<JobData | null>(null);

  // 8. 상세 내용을 불러오는 중인지 (로딩 스피너 표시용)
  const [detailLoading, setDetailLoading] = useState(false);

  // 9. 현재 모달이 어떤 화면인지 (NONE: 상세정보 보는 중 / APPLY: 지원서 쓰는 중)
  const [applyStep, setApplyStep] = useState<ApplyStep>("NONE");

  // 10. 사용자가 입력하고 있는 지원서 내용 (이름, 전화번호, 메시지)
  const [applyForm, setApplyForm] = useState<ApplyFormData>({
    name: "",
    phone: "",
    message: "",
  });

  // 11. 선택된 직무의 구체적인 상세 내용 (주요 업무, 자격 요건 등)
  const [detailContent, setDetailContent] = useState<DetailContent | null>(
    null
  );

  // --- [Function] 모달 열기 함수 ---
  // 사용자가 직무 카드를 클릭했을 때 실행됩니다.
  const openModal = async (job: JobData) => {
    setSelectedJob(job); // 1. 어떤 직무를 눌렀는지 저장
    setIsModalOpen(true); // 2. 모달 창 열기
    setDetailLoading(true); // 3. "로딩 중..." 표시 시작
    setApplyStep("NONE"); // 4. 처음엔 지원서 폼이 아니라 상세 정보 화면부터 보여줌

    // 5. 직무 제목(job.title)을 키(Key)로 사용해서 DB에서 상세 내용을 찾습니다.
    const matchedDetail = JOB_DETAILS_DB[job.title];

    // 6. 찾은 내용을 상태에 저장합니다. (만약 DB에 내용이 없으면 기본 문구를 넣어줍니다 - 안전장치)
    setDetailContent(
      matchedDetail || {
        task: ["관련 업무 전반", "팀 내 협업 및 지원"],
        qualification: ["성실하고 책임감 강하신 분"],
        preference: ["유관 업무 경험자 우대"],
      }
    );

    setDetailLoading(false); // 7. 로딩 끝! 내용 보여주기
  };

  // --- [Function] 모달 닫기 함수 ---
  const closeModal = () => {
    setIsModalOpen(false); // 모달 창 닫기
    // 다음 번에 열 때를 대비해 입력 폼을 깨끗하게 비웁니다.
    setApplyForm({ name: "", phone: "", message: "" });
  };

  // --- [Function] 지원서 제출 함수 ---
  const handleApplySubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // 폼 제출 시 페이지가 새로고침 되는 것을 막습니다.

    // 1. 유효성 검사: 이름이나 전화번호를 안 썼으면 경고창 띄우고 중단
    if (!applyForm.name || !applyForm.phone)
      return alert("필수 정보를 입력해주세요.");

    try {
      // 2. [API Call] 서버에 지원서를 보냅니다.
      await jobService.applyJob({
        ...applyForm, // 입력한 이름, 전화번호, 메시지
        companyName: selectedJob?.companyName, // 어느 회사인지
        jobTitle: selectedJob?.title, // 무슨 직무인지 함께 전송
      });

      // 3. 성공 시 알림을 띄우고 모달을 닫습니다.
      alert("지원이 성공되었습니다.");
      closeModal();
    } catch (error) {
      // 4. 실패 시 에러 알림
      alert("지원 처리 중 오류가 발생했습니다.");
    }
  };

  // --- [Effect] 스크롤 잠금 처리 (UX 향상) ---
  // 모달이 열리고 닫힐 때마다 실행됩니다.
  useEffect(() => {
    if (isModalOpen) {
      // 모달이 열리면:
      // 1. 현재 스크롤바의 너비를 계산합니다. (스크롤바가 사라질 때 화면이 덜컹거리는 것 방지)
      const scrollBarWidth = window.innerWidth - document.body.clientWidth;

      // 2. body의 스크롤을 막습니다 (overflow: hidden).
      document.body.style.overflow = "hidden";

      // 3. 사라진 스크롤바 자리만큼 오른쪽 패딩을 줘서 레이아웃 밀림을 막습니다.
      document.body.style.paddingRight = `${scrollBarWidth}px`;
    } else {
      // 모달이 닫히면:
      // 원래대로 스크롤을 풀고 패딩을 없앱니다.
      document.body.style.overflow = "unset";
      document.body.style.paddingRight = "0px";
    }
  }, [isModalOpen]); // isModalOpen 값이 바뀔 때마다 이 로직이 작동합니다.

  // --- [Return] 컴포넌트에게 필요한 도구들을 배달합니다 ---
  return {
    isModalOpen, // 모달 열림 여부
    setIsModalOpen, // 모달 상태 변경 함수
    detailLoading, // 로딩 상태
    closeModal, // 닫기 함수
    selectedJob, // 선택된 직무 정보
    applyStep, // 현재 단계 (상세보기 vs 지원하기)
    setApplyStep, // 단계 변경 함수
    applyForm, // 지원서 입력 데이터
    setApplyForm, // 지원서 입력 함수
    detailContent, // 상세 내용 데이터
    openModal, // 열기 함수
    handleApplySubmit, // 제출 함수
  };
};

// 공고 클릭 (openModal):

// 사용자가 "프론트엔드 개발자 구함" 카드를 클릭합니다.

// 이 훅이 실행되면서 **모달(팝업)**을 엽니다.

// 동시에 "상세 내용 로딩 중..."을 잠깐 보여주고, 미리 준비된 데이터(JOB_DETAILS_DB)에서 해당 직무의 상세 정보(주요 업무, 자격 요건 등)를 가져와 보여줍니다.

// 스크롤 잠금 (useEffect):

// 팝업이 뜨는 순간, 뒤에 있는 메인 페이지가 스크롤 되면 안 되겠죠?

// 브라우저의 스크롤바를 없애고 화면을 고정시킵니다. (이때 화면이 덜컹거리지 않게 스크롤바 너비만큼 여백을 주는 센스까지 발휘합니다.)

// 지원 결심 (applyStep):

// 상세 내용을 다 읽은 사용자가 "지원하기" 버튼을 누릅니다.

// 화면이 상세 정보 창에서 지원서 입력 폼으로 바뀝니다.

// 작성 및 제출 (handleApplySubmit):

// 이름, 연락처를 입력하고 [제출]을 누릅니다.

// 입력한 정보가 올바른지 확인하고, 서버(jobService)로 지원서를 보냅니다.

// 완료 및 종료 (closeModal):

// "지원이 성공되었습니다." 알림이 뜨고 모달이 닫힙니다.

// 다음 지원을 위해 입력했던 폼은 깨끗하게 지워집니다.
