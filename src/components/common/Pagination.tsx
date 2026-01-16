"use client";

import React from "react";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

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
    // 모바일에서는 계산할 필요가 없으므로 PC 로직 그대로 둠
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
    <div className="flex justify-center items-center gap-2 mt-8 md:mt-16 pb-10 px-2">
      {/* 1. 맨 처음 버튼 (<<) */}
      <button
        onClick={() => onPageChange(1)}
        disabled={currentPage === 1}
        className="p-2 rounded-full border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-20 disabled:cursor-not-allowed transition-all shadow-sm shrink-0"
        title="맨 처음으로"
      >
        <ChevronsLeft size={16} className="text-slate-600" />
      </button>

      {/* 2. 이전 버튼 (<) */}
      <button
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        className="p-2 rounded-full border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-20 disabled:cursor-not-allowed transition-all shadow-sm shrink-0"
        title="이전 페이지"
      >
        <ChevronLeft size={16} className="text-slate-600" />
      </button>

      {/* 🔥 [핵심 수정] 반응형 페이지 번호 영역 */}

      {/* (1) 모바일용: 숫자 리스트 대신 '현재 / 전체' 텍스트 표시 */}
      <span className="text-sm font-bold text-slate-600 px-2 sm:hidden">
        {currentPage} / {totalPages}
      </span>

      {/* (2) 태블릿/PC용: 기존 숫자 버튼 리스트 표시 (sm:flex) */}
      <div className="hidden sm:flex items-center gap-1 md:gap-2">
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

      {/* 3. 다음 버튼 (>) */}
      <button
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        className="p-2 rounded-full border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-20 disabled:cursor-not-allowed transition-all shadow-sm shrink-0"
        title="다음 페이지"
      >
        <ChevronRight size={16} className="text-slate-600" />
      </button>

      {/* 4. 맨 끝 버튼 (>>) */}
      <button
        onClick={() => onPageChange(totalPages)}
        disabled={currentPage === totalPages}
        className="p-2 rounded-full border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-20 disabled:cursor-not-allowed transition-all shadow-sm shrink-0"
        title="맨 끝으로"
      >
        <ChevronsRight size={16} className="text-slate-600" />
      </button>
    </div>
  );
}

// 데이터 수신: 부모 컴포넌트(예: 상품 목록 페이지)가 이 컴포넌트에게 "지금 50페이지고, 전체는 100페이지야."라고 알려줍니다.

// 검문소 (유효성 체크): "전체 페이지가 1장뿐인가?" 확인합니다. 1장이면 굳이 넘길 필요가 없으니 화면에 아무것도 그리지 않고 조용히 사라집니다. (return null)

// 숫자 계산 (핵심 두뇌):

// 현재가 50페이지라면, 사용자에게 1번(처음), 100번(끝), 그리고 **49, 50, 51(현재 주변)**만 보여주기로 결정합니다.

// 중간에 건너뛴 숫자들은 점 3개(...)로 바꿔치기합니다.

// 결과적으로 [1, "...", 49, 50, 51, "...", 100]이라는 목록을 만듭니다.

// 화면 그리기:

// 왼쪽 화살표: 현재 1페이지면 비활성화(흐릿하게), 아니면 활성화합니다.

// 숫자 버튼: 아까 계산한 목록을 하나씩 그립니다. 현재 페이지인 '50'번 버튼은 **초록색(테마색)**으로 칠해서 눈에 띄게 하고, 나머지는 하얀색으로 둡니다.

// 오른쪽 화살표: 현재 마지막 페이지면 비활성화합니다.

// 클릭 반응: 사용자가 '51'을 누르면 onPageChange(51) 함수를 실행해 부모에게 "51페이지 데이터로 바꿔줘!"라고 신호를 보냅니다.
