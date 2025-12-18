import {
  XMarkIcon,
  ExclamationCircleIcon,
  PaperAirplaneIcon,
  UserIcon,
  PhoneIcon,
  CheckCircleIcon,
  CalendarDaysIcon,
  ChevronRightIcon,
  AcademicCapIcon,
  BriefcaseIcon,
} from "@heroicons/react/24/outline";
import { JobData, ApplyFormData, ApplyStep } from "@/types/job";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedJob: JobData | null;
  detailLoading: boolean;
  detailHtml: string;
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
  detailHtml,
  applyStep,
  setApplyStep,
  applyForm,
  setApplyForm,
  handleApplySubmit,
}: ModalProps) {
  if (!isOpen || !selectedJob) return null;

  return (
    <div
      className="fixed inset-0 z-100 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-300 "
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-4xl h-[85vh] md:h-[90vh] rounded-[2.5rem] flex flex-col overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 헤더 섹션 */}
        <div className="bg-white border-b border-gray-100 shrink-0 px-8 pt-10 pb-8 flex justify-between items-start">
          <div className="pr-10 w-full max-w-2xl">
            <div className="flex flex-wrap items-center gap-2 mb-4">
              {/* 회사명이 있을 때만 렌더링 */}
              {selectedJob.companyName &&
                selectedJob.companyName.length > 0 && (
                  <>
                    <span className="bg-green-600 text-white text-[10px] uppercase tracking-widest font-bold px-2.5 py-2 rounded-md shadow-sm">
                      {selectedJob.companyName}
                    </span>
                    <ChevronRightIcon className="w-4 h-4 text-gray-300" />
                  </>
                )}
              <div className="flex items-center gap-1.5 bg-gray-100 px-2.5 py-2 rounded-md">
                <BriefcaseIcon className="w-3.5 h-3.5 text-gray-500" />
                <span className="text-gray-600 text-xs font-bold">
                  {selectedJob.career}
                </span>
              </div>
              <div className="flex items-center gap-1.5 bg-gray-100 px-2.5 py-2 rounded-md">
                <AcademicCapIcon className="w-3.5 h-3.5 text-gray-500" />
                <span className="text-gray-600 text-xs font-bold">
                  {selectedJob.education}
                </span>
              </div>
            </div>
            <h3 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight mb-5 break-keep">
              {selectedJob.title}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2.5 bg-gray-100 hover:bg-gray-200 rounded-full transition-all group shrink-0"
          >
            <XMarkIcon className="w-6 h-6 text-gray-600 group-hover:rotate-90 transition-transform" />
          </button>
        </div>

        {/* 본문 섹션 */}
        <div className="flex-1 overflow-y-auto bg-gray-50/50 relative">
          {applyStep === "FORM" && (
            <div className="absolute inset-0 bg-white/95 z-30 flex flex-col items-center justify-center p-6 animate-in fade-in slide-in-from-bottom-8 duration-300">
              <div className="w-full max-w-md bg-white p-8 md:p-10 rounded-[2.5rem] shadow-2xl border border-gray-100 text-center">
                <h4 className="text-2xl font-bold text-gray-900 mb-6">
                  간편 지원하기
                </h4>
                <form
                  onSubmit={handleApplySubmit}
                  className="space-y-5 text-left"
                >
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-700 ml-1">
                      이름
                    </label>
                    <div className="relative group">
                      <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-green-500 w-5 h-5" />
                      <input
                        type="text"
                        required
                        className="w-full pl-11 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all outline-none"
                        placeholder="지원자 성함"
                        value={applyForm.name}
                        onChange={(e) =>
                          setApplyForm({ ...applyForm, name: e.target.value })
                        }
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-700 ml-1">
                      연락처
                    </label>
                    <div className="relative group">
                      <PhoneIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-green-500 w-5 h-5" />
                      <input
                        type="tel"
                        required
                        className="w-full pl-11 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all outline-none"
                        placeholder="010-0000-0000"
                        value={applyForm.phone}
                        onChange={(e) =>
                          setApplyForm({ ...applyForm, phone: e.target.value })
                        }
                      />
                    </div>
                  </div>
                  <div className="pt-4 flex gap-3">
                    <button
                      type="button"
                      onClick={() => setApplyStep("NONE")}
                      className="flex-1 py-4 bg-gray-100 text-gray-600 rounded-2xl font-bold"
                    >
                      취소
                    </button>
                    <button
                      type="submit"
                      className="flex-2 py-4 bg-green-600 text-white rounded-2xl font-bold shadow-lg shadow-green-100"
                    >
                      지원 완료
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {applyStep === "DONE" && (
            <div className="absolute inset-0 bg-white z-40 flex flex-col items-center justify-center p-6 text-center animate-in zoom-in-95">
              <CheckCircleIcon className="w-16 h-16 text-green-500 mb-6" />
              <h4 className="text-3xl font-bold text-gray-900 mb-2">
                지원이 완료되었습니다!
              </h4>
              <p className="text-gray-500 mb-10">
                인사담당자가 확인 후 연락드릴 예정입니다.
              </p>
              <button
                onClick={onClose}
                className="px-12 py-4 bg-gray-900 text-white rounded-2xl font-bold"
              >
                모달 닫기
              </button>
            </div>
          )}

          {/* 모집 요강 출력 */}
          <div className="max-w-4xl mx-auto p-4 md:p-10">
            {detailLoading ? (
              <div className="h-full flex flex-col items-center justify-center min-h-[400px]">
                <div className="w-16 h-16 border-4 border-green-100 border-t-green-600 rounded-full animate-spin"></div>
              </div>
            ) : (
              <div className="bg-white p-8 md:p-12 rounded-[2.5rem] border border-gray-100 shadow-sm">
                <div
                  className="crawled-content"
                  dangerouslySetInnerHTML={{ __html: detailHtml }}
                />
              </div>
            )}
          </div>
        </div>

        {/* 푸터 섹션 */}
        <div className="px-8 py-6 border-t border-gray-100 bg-white shrink-0 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <CalendarDaysIcon className="w-5 h-5 text-green-600" />
            <span className="text-sm font-bold text-gray-800">
              마감: {selectedJob.deadline}
            </span>
          </div>
          <div className="flex gap-3 w-full md:w-auto">
            <button
              onClick={onClose}
              className="flex-1 px-8 py-4 bg-gray-100 text-gray-600 rounded-2xl font-bold cursor-pointer"
            >
              닫기
            </button>
            <button
              onClick={() => setApplyStep("FORM")}
              className="flex-2 px-12 py-4 bg-green-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-green-200 cursor-pointer"
            >
              지원하기 <PaperAirplaneIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
