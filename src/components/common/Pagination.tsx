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
  // 전체 페이지가 1개 이하면 페이지네이션을 보여주지 않음 (숨김 처리)
  if (totalPages <= 1) return null;

  // 테마 색상에 따른 Tailwind CSS 클래스 정의
  const themeStyles = {
    green: "bg-green-600 shadow-green-200",
    blue: "bg-blue-600 shadow-blue-200",
    black: "bg-slate-900 shadow-slate-200",
  };

  // 화면에 보여줄 페이지 번호 리스트를 계산하는 함수
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    // 페이지가 적을 경우 (5페이지 이하) : 1부터 끝까지 다 보여줌
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      // 페이지가 많을 경우 : 현재 페이지 주변과 양 끝만 보여주고 나머지는 ... 처리

      // 1. 항상 첫 페이지는 보여줌
      pages.push(1);

      // 2. 현재 페이지가 4페이지 이상이면 앞쪽에 ... 추가
      if (currentPage > 3) pages.push("...");

      // 3. 현재 페이지를 중심으로 앞뒤 1개씩 계산 (범위 설정)
      // Math.max(2, ...): 1페이지와 겹치지 않게 최소 2부터 시작
      const start = Math.max(2, currentPage - 1);
      // Math.min(..., ...): 마지막 페이지와 겹치지 않게 조정
      const end = Math.min(totalPages - 1, currentPage + 1);

      // 계산된 범위의 페이지 번호들을 배열에 추가
      for (let i = start; i <= end; i++) pages.push(i);

      // 4. 현재 페이지가 뒤쪽에서 멀리 떨어져 있으면 뒤쪽에 ... 추가
      if (currentPage < totalPages - 2) pages.push("...");

      // 5. 항상 마지막 페이지는 보여줌
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <div className="flex justify-center items-center gap-1 md:gap-2 mt-8 md:mt-16 pb-10 px-2">
      {/* 이전 페이지 버튼 (<) */}
      <button
        // 1페이지보다 작아지지 않도록 Math.max 사용
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1} // 1페이지면 비활성화
        className="p-2 md:p-2.5 rounded-full border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-20 disabled:cursor-not-allowed transition-all shadow-sm shrink-0"
      >
        <ChevronLeft size={16} className="text-slate-600 md:w-[18px]" />
      </button>

      {/* 페이지 번호 영역 */}
      <div className="flex items-center gap-1 md:gap-2">
        {getPageNumbers().map((num, i) =>
          // "..."인 경우 클릭 불가능한 텍스트로 표시
          num === "..." ? (
            <span
              key={i}
              className="px-1 text-slate-400 font-bold text-xs md:text-base"
            >
              ...
            </span>
          ) : (
            // 숫자인 경우 클릭 가능한 버튼으로 표시
            <button
              key={i}
              onClick={() => onPageChange(num as number)}
              className={`w-8 h-8 md:w-10 md:h-10 rounded-full font-bold text-xs md:text-sm transition-all shadow-sm shrink-0 ${
                // 현재 페이지면 색상 칠하기(활성), 아니면 흰색(비활성)
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

      {/* 다음 페이지 버튼 (>) */}
      <button
        // 마지막 페이지보다 커지지 않도록 Math.min 사용
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages} // 마지막 페이지면 비활성화
        className="p-2 md:p-2.5 rounded-full border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-20 disabled:cursor-not-allowed transition-all shadow-sm shrink-0"
      >
        <ChevronRight size={16} className="text-slate-600 md:w-[18px]" />
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
