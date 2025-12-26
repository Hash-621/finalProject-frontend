"use client";
import { JobData } from "@/types/job";
// Lucide 아이콘으로 변경
import { Briefcase, Building2, Clock, FileText } from "lucide-react";

interface JobCardProps {
  job: JobData;
  onClick: (job: JobData) => void;
}

export default function JobCard({ job, onClick }: JobCardProps) {
  return (
    <div
      className="group bg-white p-6 rounded-4xl border border-gray-100 transition-all duration-300 flex flex-col justify-between h-[360px] relative overflow-hidden cursor-pointer "
      onClick={() => onClick(job)}
    >
      {/* 상단 호버 라인 효과 */}
      <div className="absolute top-0 left-0 w-full h-1.5 bg-green-500 opacity-0 group-hover:opacity-100 transition-opacity" />

      <div>
        <div className="flex justify-between items-start mb-4">
          <span
            className={`text-[11px] font-bold text-green-600 bg-green-50 px-2.5 py-1 rounded-md border border-green-100 tracking-wide truncate max-w-[70%] transition-opacity ${
              !job.companyName || job.companyName.length === 0
                ? "opacity-0"
                : "opacity-100"
            }`}
          >
            {job.companyName || "공백"}
          </span>
          <span className="text-[11px] font-medium text-gray-400 bg-gray-50 px-2 py-1 rounded-md shrink-0">
            채용시 마감
          </span>
        </div>

        <h3 className="font-bold text-lg text-gray-900 line-clamp-2 leading-snug mb-4 group-hover:text-green-600 transition-colors">
          {job.title}
        </h3>

        <div className="space-y-2.5">
          <div className="flex items-center gap-2 text-[13px] text-gray-500">
            <Briefcase className="w-4 h-4 text-gray-400" strokeWidth={2} />
            <span>{job.career || "경력무관"}</span>
          </div>
          <div className="flex items-center gap-2 text-[13px] text-gray-500">
            <Building2 className="w-4 h-4 text-gray-400" strokeWidth={2} />
            <span>{job.education || "학력무관"}</span>
          </div>
          <div className="flex items-center gap-2 text-[13px] text-gray-500">
            <Clock className="w-4 h-4 text-orange-400" strokeWidth={2} />
            <span className="text-orange-500 font-medium">{job.deadline}</span>
          </div>
        </div>
      </div>

      <div className="w-full mt-6 py-3.5 bg-gray-50 text-gray-700 rounded-2xl font-bold group-hover:bg-green-600 group-hover:text-white transition-all flex items-center justify-center gap-2 text-sm shadow-sm group-hover:shadow-green-200">
        <FileText className="w-4 h-4" strokeWidth={2.5} />
        상세 요강 보기
      </div>
    </div>
  );
}
