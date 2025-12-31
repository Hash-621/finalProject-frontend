"use client";

import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  themeColor?: "green" | "blue" | "black";
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  themeColor = "green",
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const themeStyles = {
    green: "bg-green-600 shadow-green-200",
    blue: "bg-blue-600 shadow-blue-200",
    black: "bg-slate-900 shadow-slate-200",
  };

  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push("...");
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (currentPage < totalPages - 2) pages.push("...");
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <div className="flex justify-center items-center gap-1 md:gap-2 mt-8 md:mt-16 pb-10 px-2">
      {/* 이전 페이지 버튼 */}
      <button
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        className="p-2 md:p-2.5 rounded-full border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-20 disabled:cursor-not-allowed transition-all shadow-sm shrink-0"
      >
        <ChevronLeft size={16} className="text-slate-600 md:w-[18px]" />
      </button>

      {/* 페이지 번호 영역 */}
      <div className="flex items-center gap-1 md:gap-2">
        {getPageNumbers().map((num, i) =>
          num === "..." ? (
            <span
              key={i}
              className="px-1 text-slate-400 font-bold text-xs md:text-base"
            >
              ...
            </span>
          ) : (
            <button
              key={i}
              onClick={() => onPageChange(num as number)}
              className={`w-8 h-8 md:w-10 md:h-10 rounded-full font-bold text-xs md:text-sm transition-all shadow-sm shrink-0 ${
                currentPage === num
                  ? `${themeStyles[themeColor]} text-white shadow-md`
                  : "bg-white text-slate-400 hover:text-slate-900 border border-slate-100"
              }`}
            >
              {num}
            </button>
          )
        )}
      </div>

      {/* 다음 페이지 버튼 */}
      <button
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        className="p-2 md:p-2.5 rounded-full border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-20 disabled:cursor-not-allowed transition-all shadow-sm shrink-0"
      >
        <ChevronRight size={16} className="text-slate-600 md:w-[18px]" />
      </button>
    </div>
  );
}
