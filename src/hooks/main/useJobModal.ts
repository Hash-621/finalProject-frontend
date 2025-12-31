import { useState, useEffect } from "react";
import { JobData, ApplyFormData, ApplyStep, DetailContent } from "@/types/job";
import { JOB_DETAILS_DB } from "@/data/jobDetailData";
import { jobService } from "@/api/services";

export const useJobModal = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<JobData | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [applyStep, setApplyStep] = useState<ApplyStep>("NONE");
  const [applyForm, setApplyForm] = useState<ApplyFormData>({
    name: "",
    phone: "",
    message: "",
  });
  const [detailContent, setDetailContent] = useState<DetailContent | null>(
    null
  );

  const openModal = async (job: JobData) => {
    setSelectedJob(job);
    setIsModalOpen(true);
    setDetailLoading(true);
    setApplyStep("NONE");

    const matchedDetail = JOB_DETAILS_DB[job.title];
    setDetailContent(
      matchedDetail || {
        task: ["관련 업무 전반", "팀 내 협업 및 지원"],
        qualification: ["성실하고 책임감 강하신 분"],
        preference: ["유관 업무 경험자 우대"],
      }
    );

    setDetailLoading(false);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setApplyForm({ name: "", phone: "", message: "" });
  };

  const handleApplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!applyForm.name || !applyForm.phone)
      return alert("필수 정보를 입력해주세요.");
    try {
      await jobService.applyJob({
        ...applyForm,
        companyName: selectedJob?.companyName,
        jobTitle: selectedJob?.title,
      });
      alert("지원이 성공되었습니다.");
      closeModal();
    } catch (error) {
      alert("지원 처리 중 오류가 발생했습니다.");
    }
  };

  useEffect(() => {
    if (isModalOpen) {
      const scrollBarWidth = window.innerWidth - document.body.clientWidth;
      document.body.style.overflow = "hidden";
      document.body.style.paddingRight = `${scrollBarWidth}px`;
    } else {
      document.body.style.overflow = "unset";
      document.body.style.paddingRight = "0px";
    }
  }, [isModalOpen]);

  return {
    isModalOpen,
    setIsModalOpen,
    detailLoading,
    closeModal,
    selectedJob,
    applyStep,
    setApplyStep,
    applyForm,
    setApplyForm,
    detailContent,
    openModal,
    handleApplySubmit,
  };
};
