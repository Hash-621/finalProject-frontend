"use client";
import { JobData } from "@/types/job";
import {
  BriefcaseIcon,
  BuildingOfficeIcon,
  ClockIcon,
  FolderOpenIcon,
} from "@heroicons/react/24/outline";
interface JobCardProps {
  job: JobData;
  onClick: (job: JobData) => void;
}
export default function JobCard({ job, onClick }: JobCardProps) {
  return (
    <div
      className="group bg-white p-6 rounded-4xl border border-gray-100  transition-all duration-300 flex flex-col justify-between h-[360px] relative overflow-hidden cursor-pointer"
      onClick={() => onClick(job)}
    >
      <div className="absolute top-0 left-0 w-full h-1.5 bg-linear-to-r opacity-0 group-hover:opacity-100 transition-opacity" />
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
        <h3 className="font-bold text-lg text-gray-900 line-clamp-2 leading-snug mb-4 group-hover:text-green-600 transition-color">
          {job.title}
        </h3>
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <BriefcaseIcon aria-hidden="true" className="size-4" />
            <span>{job.career || "경력무관"}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <BuildingOfficeIcon aria-hidden="true" className="size-4" />
            <span>{job.education || "학력무관"}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <ClockIcon aria-hidden="true" className="size-4" />
            <span className="text-orange-500 font-medium">{job.deadline}</span>
          </div>
        </div>
      </div>
      <div className="w-full mt-6 py-3.5 bg-gray-50 text-gray-700 rounded-xl font-bold group-hover:bg-green-600 group-hover:text-white transition-all flex items-center justify-center gap-2 text-sm ">
        <FolderOpenIcon aria-hidden="true" className="size-4" /> 상세 요강 보기
      </div>
    </div>
  );
}
