import React from "react";
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
import { JobData, ApplyFormData, ApplyStep } from "@/types/job";
import ApplyForm from "@/components/jobTools/ApplyForm";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedJob: JobData | null;
  detailContent: {
    task: string[];
    qualification: string[];
    preference: string[];
  } | null;
  detailLoading: boolean;
  applyStep: ApplyStep;
  setApplyStep: (step: ApplyStep) => void;
  applyForm: ApplyFormData;
  setApplyForm: React.Dispatch<React.SetStateAction<ApplyFormData>>;
  handleApplySubmit: (e: React.FormEvent) => void;
}

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
  if (!isOpen || !selectedJob) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-md p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-2xl h-[90vh] rounded-3xl flex flex-col overflow-hidden shadow-2xl animate-in slide-in-from-bottom-10 duration-300 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* --- 헤더 섹션 --- */}
        <div className="bg-white border-b border-gray-100 px-6 py-5 flex justify-between items-start sticky top-0 z-10">
          <div className="pr-4">
            <h3 className="text-xl md:text-2xl font-black text-gray-900 leading-tight mb-2 break-keep">
              {selectedJob.title}
            </h3>
            <div className="flex items-center gap-2 text-sm font-medium text-green-600">
              <BuildingOffice2Icon className="w-4 h-4" />
              <span>{selectedJob.companyName}</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 bg-gray-50 hover:bg-gray-100 rounded-full transition-colors shrink-0"
          >
            <XMarkIcon className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        {/* --- 본문 섹션 --- */}
        <div className="flex-1 overflow-y-auto bg-gray-50 relative custom-scrollbar">
          {/* [1] 지원 폼 레이어 */}
          {applyStep === "FORM" && (
            <ApplyForm
              applyForm={applyForm}
              setApplyForm={setApplyForm}
              onSubmit={handleApplySubmit}
              onCancel={() => setApplyStep("NONE")}
            />
          )}

          {/* [2] 지원 완료 레이어 */}
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
                onClick={onClose}
                className="px-10 py-3 bg-gray-900 text-white rounded-xl font-bold"
              >
                확인
              </button>
            </div>
          )}

          {/* [3] 실제 상세 공고 내용 */}
          <div className="p-6 md:p-8 space-y-8 @container">
            {/* 상단 요약 카드 그리드 */}
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

            {/* 상세 텍스트 영역 */}
            <div className="space-y-6">
              <section>
                <h4 className="text-lg font-bold text-gray-900 mb-3 border-l-4 border-green-500 pl-3">
                  모집 부문 및 상세 내용
                </h4>
                <div className="bg-white rounded-xl border border-gray-200 p-6 text-sm text-gray-600 leading-relaxed">
                  {detailLoading ? (
                    <div className="py-10 flex justify-center">
                      <div className="w-8 h-8 border-4 border-green-100 border-t-green-500 rounded-full animate-spin" />
                    </div>
                  ) : (
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

        {/* --- 푸터 버튼 섹션 --- */}
        <div className="bg-white border-t border-gray-100 p-5 flex gap-3 shadow-[0_-4px_20px_rgba(0,0,0,0.03)] z-10">
          <button
            onClick={onClose}
            className="flex-1 py-3.5 bg-gray-100 text-gray-600 rounded-xl font-bold hover:bg-gray-200 transition-colors"
          >
            닫기
          </button>
          <button
            onClick={() => setApplyStep("FORM")}
            className="flex-2 py-3.5 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition-all shadow-lg flex items-center justify-center gap-2"
          >
            지원하기 <PaperAirplaneIcon className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
