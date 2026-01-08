// --- [라이브러리 및 아이콘 임포트] ---
import React from "react"; // 리액트 기본 모듈
// Heroicons 라이브러리에서 아이콘들을 가져옵니다. (X표시, 종이비행기, 가방 등)
import {
  XMarkIcon,
  PaperAirplaneIcon,
  BriefcaseIcon,
  AcademicCapIcon,
  MapPinIcon,
  CreditCardIcon,
  CheckCircleIcon,
  BuildingOffice2Icon,
} from "@heroicons/react/24/outline";
// 타입 정의와 하위 컴포넌트(지원 양식)를 가져옵니다.
import { JobData, ApplyFormData, ApplyStep } from "@/types/job";
import ApplyForm from "@/components/jobTools/ApplyForm";

// --- [Props 타입 정의] ---
// 부모 컴포넌트(JobPage)로부터 받아야 할 데이터들의 규칙입니다.
interface ModalProps {
  isOpen: boolean; // 모달이 열려있는지 여부
  onClose: () => void; // 모달을 닫는 함수
  selectedJob: JobData | null; // 선택된 공고 데이터 (제목, 회사명 등)
  detailContent: {
    // 공고의 상세 내용 (담당업무, 자격요건 등)
    task: string[];
    qualification: string[];
    preference: string[];
  } | null;
  detailLoading: boolean; // 상세 내용을 불러오는 중인지 여부
  applyStep: ApplyStep; // 현재 지원 단계 ('NONE', 'FORM', 'DONE')
  setApplyStep: (step: ApplyStep) => void; // 지원 단계 변경 함수
  applyForm: ApplyFormData; // 지원 양식 입력 데이터
  setApplyForm: React.Dispatch<React.SetStateAction<ApplyFormData>>; // 지원 양식 변경 함수
  handleApplySubmit: (e: React.FormEvent) => void; // 지원 제출 함수
}

// --- [메인 컴포넌트 정의] ---
export default function JobDetailModal({
  isOpen,
  onClose,
  selectedJob,
  detailLoading,
  detailContent,
  applyStep,
  setApplyStep,
  applyForm,
  setApplyForm,
  handleApplySubmit,
}: ModalProps) {
  // 1. 모달이 닫혀있거나 선택된 공고가 없으면 아무것도 그리지 않습니다. (null 반환)
  if (!isOpen || !selectedJob) return null;

  // --- [화면 렌더링 (JSX)] ---
  return (
    // 2. 배경 오버레이 (Overlay): 화면 전체를 덮는 반투명 검은색 배경
    // 클릭 시 onClose가 실행되어 모달이 닫힙니다.
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-md p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      {/* 3. 모달 컨텐츠 박스 (Content Box): 실제 내용이 담긴 흰색 박스 */}
      {/* e.stopPropagation()으로 박스 클릭 시 닫히는 것을 방지합니다. */}
      <div
        className="bg-white w-full max-w-2xl h-[90vh] rounded-3xl flex flex-col overflow-hidden shadow-2xl animate-in slide-in-from-bottom-10 duration-300 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* --- 헤더 섹션 (고정) --- */}
        <div className="bg-white border-b border-gray-100 px-6 py-5 flex justify-between items-start sticky top-0 z-10">
          <div className="pr-4">
            {/* 공고 제목 */}
            <h3 className="text-xl md:text-2xl font-black text-gray-900 leading-tight mb-2 break-keep">
              {selectedJob.title}
            </h3>
            {/* 회사명 */}
            <div className="flex items-center gap-2 text-sm font-medium text-green-600">
              <BuildingOffice2Icon className="w-4 h-4" />
              <span>{selectedJob.companyName}</span>
            </div>
          </div>
          {/* 닫기 버튼 (X 아이콘) */}
          <button
            onClick={onClose}
            className="p-2 bg-gray-50 hover:bg-gray-100 rounded-full transition-colors shrink-0"
          >
            <XMarkIcon className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        {/* --- 본문 섹션 (스크롤 가능) --- */}
        <div className="flex-1 overflow-y-auto bg-gray-50 relative custom-scrollbar">
          {/* [1] 지원 폼 레이어 (조건부 렌더링) */}
          {/* applyStep이 'FORM'일 때만 나타나서 본문을 덮어버림 */}
          {applyStep === "FORM" && (
            <ApplyForm
              applyForm={applyForm}
              setApplyForm={setApplyForm}
              onSubmit={handleApplySubmit}
              onCancel={() => setApplyStep("NONE")}
            />
          )}

          {/* [2] 지원 완료 레이어 (조건부 렌더링) */}
          {/* applyStep이 'DONE'일 때 나타나는 완료 메시지 화면 */}
          {applyStep === "DONE" && (
            <div className="absolute inset-0 bg-white z-30 flex flex-col items-center justify-center p-6 text-center animate-in zoom-in-95">
              <CheckCircleIcon className="w-20 h-20 text-green-500 mb-4" />
              <h4 className="text-2xl font-black text-gray-900 mb-2">
                지원이 완료되었습니다!
              </h4>
              <p className="text-gray-500 mb-8">
                담당자가 확인 후 빠른 시일 내에 연락드리겠습니다.
              </p>
              <button
                onClick={onClose} // 확인 누르면 모달 닫힘
                className="px-10 py-3 bg-gray-900 text-white rounded-xl font-bold"
              >
                확인
              </button>
            </div>
          )}

          {/* [3] 실제 상세 공고 내용 */}
          <div className="p-6 md:p-8 space-y-8 @container">
            {/* 상단 요약 카드 그리드 (경력, 학력, 근무지, 급여) */}
            <div className="grid grid-cols-2 gap-4 @max-[360px]:flex @max-[360px]:flex-col">
              <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-start gap-3">
                <BriefcaseIcon className="w-5 h-5 text-green-500 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-400 font-medium mb-1">경력</p>
                  <p className="font-bold text-gray-800 text-sm">
                    {selectedJob.career}
                  </p>
                </div>
              </div>
              <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-start gap-3">
                <AcademicCapIcon className="w-5 h-5 text-green-500 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-400 font-medium mb-1">학력</p>
                  <p className="font-bold text-gray-800 text-sm">
                    {selectedJob.education}
                  </p>
                </div>
              </div>
              <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-start gap-3">
                <MapPinIcon className="w-5 h-5 text-green-500 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-400 font-medium mb-1">
                    근무지
                  </p>
                  <p className="font-bold text-gray-800 text-sm">
                    {selectedJob.location || "대전 전체"}
                  </p>
                </div>
              </div>
              <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-start gap-3">
                <CreditCardIcon className="w-5 h-5 text-green-500 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-400 font-medium mb-1">급여</p>
                  <p className="font-bold text-gray-800 text-sm">
                    면접 후 결정
                  </p>
                </div>
              </div>
            </div>

            {/* 상세 텍스트 영역 (담당업무, 자격요건 등) */}
            <div className="space-y-6">
              <section>
                <h4 className="text-lg font-bold text-gray-900 mb-3 border-l-4 border-green-500 pl-3">
                  모집 부문 및 상세 내용
                </h4>
                <div className="bg-white rounded-xl border border-gray-200 p-6 text-sm text-gray-600 leading-relaxed">
                  {/* 로딩 중이면 스피너 표시 */}
                  {detailLoading ? (
                    <div className="py-10 flex justify-center">
                      <div className="w-8 h-8 border-4 border-green-100 border-t-green-500 rounded-full animate-spin" />
                    </div>
                  ) : (
                    // 로딩 완료 시 상세 내용 표시
                    <div className="space-y-6">
                      <div>
                        <strong className="text-base text-gray-800 block mb-2">
                          📌 담당업무
                        </strong>
                        <ul className="list-disc list-inside space-y-1">
                          {detailContent?.task.map((item, i) => (
                            <li key={i}>{item}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <strong className="text-base text-gray-800 block mb-2">
                          🎯 지원자격
                        </strong>
                        <ul className="list-disc list-inside space-y-1">
                          {detailContent?.qualification.map((item, i) => (
                            <li key={i}>{item}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <strong className="text-base text-gray-800 block mb-2">
                          ⭐ 우대사항
                        </strong>
                        <ul className="list-disc list-inside space-y-1">
                          {detailContent?.preference.map((item, i) => (
                            <li key={i}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              </section>

              {/* 접수 기간 섹션 */}
              <section>
                <h4 className="text-lg font-bold text-gray-900 mb-3 border-l-4 border-green-500 pl-3">
                  접수 기간
                </h4>
                <div className="bg-green-50 rounded-xl p-5 border border-green-100 flex justify-between items-center">
                  <span className="text-sm font-bold text-gray-600">
                    남은 기간
                  </span>
                  <span className="text-sm font-bold text-red-500">
                    {selectedJob.deadline} 까지
                  </span>
                </div>
              </section>
            </div>
          </div>
        </div>

        {/* --- 푸터 버튼 섹션 (고정) --- */}
        <div className="bg-white border-t border-gray-100 p-5 flex gap-3 shadow-[0_-4px_20px_rgba(0,0,0,0.03)] z-10">
          <button
            onClick={onClose}
            className="flex-1 py-3.5 bg-gray-100 text-gray-600 rounded-xl font-bold hover:bg-gray-200 transition-colors"
          >
            닫기
          </button>
          <button
            onClick={() => setApplyStep("FORM")} // 클릭 시 지원 폼 화면으로 전환
            className="flex-2 py-3.5 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition-all shadow-lg flex items-center justify-center gap-2"
          >
            지원하기 <PaperAirplaneIcon className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

// 1. 모달 오픈 및 데이터 로드 (Open & Loading)

// isOpen이 true가 되면서 모달이 화면에 나타납니다.

// 처음에는 detailLoading이 true이므로, 본문 영역에는 뱅글뱅글 도는 로딩 스피너가 보입니다.

// 부모 컴포넌트(JobPage)가 상세 데이터를 찾아 detailContent prop으로 넘겨주면 로딩이 끝나고 내용이 표시됩니다.

// 2. 내용 확인 (Browsing)

// 사용자는 스크롤을 내리며 담당 업무, 자격 요건 등을 확인합니다.

// 헤더와 푸터(버튼 영역)는 sticky 또는 flex 레이아웃 덕분에 스크롤과 상관없이 상/하단에 고정되어 있습니다.

// 3. 지원하기 (Apply Action)

// 사용자가 하단의 [지원하기] 버튼을 누릅니다.

// setApplyStep("FORM")이 실행되면서, ApplyForm 컴포넌트가 렌더링 됩니다.

// 이 폼은 absolute inset-0 스타일 덕분에 기존 상세 내용 위에 새로운 레이어처럼 덮어씌워지며 나타납니다.

// 4. 지원 완료 (Completion)

// 폼 작성을 마치고 제출하면, applyStep이 "DONE"으로 바뀝니다.

// 이번에는 초록색 체크 아이콘이 있는 완료 화면이 덮어씌워집니다.

// [확인] 버튼을 누르면 onClose가 실행되어 모달이 완전히 닫히고, 다시 목록 페이지로 돌아갑니다.
