"use client";
import {
  Loader2,
  FileText,
  Plus,
  Building2,
  Briefcase,
  Clock,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import api from "@/api/axios";
export default function JobList() {
  const [jobs, setJobs] = useState<JobData[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  useEffect(() => {
    fetchJobs(1);
  }, []);
  const fetchJobs = async (pageNum: number) => {
    if (loading) return;
    setLoading(true);
    try {
      const res = await api.get(`/job/crawl?page=${pageNum}`);
      if (pageNum === 1) {
        setJobs(res.data);
      } else {
        setJobs((prev) => [...prev, ...res.data]);
      }
    } catch (e) {
      console.error("공고 로드 실패:", e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {jobs.length === 0 && loading ? (
        <div className="flex flex-col items-center justify-center py-40">
          <Loader2 className="animate-spin w-12 h-12 text-blue-600 mb-4" />
          <p className="text-gray-400 font-medium">
            채용 정보를 불러오는 중입니다...
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {jobs.map((job, i) => (
              <div
                key={i}
                className="group bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between h-[360px] relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-500 to-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-[11px] font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-100 tracking-wide truncate max-w-[70%]">
                      {job.companyName}
                    </span>
                    <span className="text-[11px] font-medium text-gray-400 bg-gray-50 px-2 py-1 rounded-md shrink-0">
                      채용시 마감
                    </span>
                  </div>
                  <h3 className="font-bold text-lg text-gray-900 line-clamp-2 leading-snug mb-4 group-hover:text-blue-600 transition-colors h-[3.2rem]">
                    {job.title}
                  </h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Briefcase size={14} className="text-gray-400" />
                      <span>{job.career || "경력무관"}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Building2 size={14} className="text-gray-400" />
                      <span>{job.education || "학력무관"}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Clock size={14} className="text-gray-400" />
                      <span className="text-orange-500 font-medium">
                        {job.deadline}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="w-full mt-6 py-3.5 bg-gray-50 text-gray-700 rounded-xl font-bold group-hover:bg-blue-600 group-hover:text-white transition-all flex items-center justify-center gap-2 text-sm">
                  <FileText size={16} /> 상세 요강 보기
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
