"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Field, Select, Input } from "@headlessui/react";
import { Search } from "lucide-react";

interface SearchBarProps {
  // 스타일 커스터마이징을 위한 클래스명들 (선택 사항)
  className?: string;
  inputClassName?: string;
  buttonClassName?: string;
  iconClassName?: string;

  // 접근성을 위한 고유 ID 접두사 (필수)
  idPrefix: string;

  // 초기 상태값 (선택 사항)
  initialValue?: string;
  initialStatus?: string;
}

export default function SearchBar({
  className = "",
  inputClassName = "",
  buttonClassName = "",
  iconClassName = "",
  idPrefix,

  initialValue = "",
  initialStatus = "all",
}: SearchBarProps) {
  const router = useRouter();

  // 검색어와 검색 옵션(필터) 상태 관리
  const [keyword, setKeyword] = useState(initialValue);
  const [status, setStatus] = useState(initialStatus);

  // 부모로부터 초기값이 늦게 들어오거나 바뀔 경우를 대비해 상태 동기화
  useEffect(() => {
    setKeyword(initialValue);
  }, [initialValue]);

  useEffect(() => {
    setStatus(initialStatus);
  }, [initialStatus]);

  // 검색 제출 핸들러
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // 새로고침 방지

    // 빈 검색어 방지
    if (!keyword.trim()) {
      alert("검색어를 입력해 주세요.");
      return;
    }

    // 쿼리 스트링 생성 (예: ?searchStatus=title&searchKeyword=안녕)
    const searchParams = new URLSearchParams({
      searchStatus: status,
      searchKeyword: keyword,
    });

    // 검색 결과 페이지로 이동
    const fullPath = `/search/results?${searchParams.toString()}`;
    router.push(fullPath);
  };

  return (
    <form onSubmit={handleSubmit} role="search" className={className}>
      <Field className="flex gap-3 items-center h-full w-full">
        {/* 1. 검색 옵션 선택 (전체/제목/내용) */}
        <Select
          name="status"
          id={`${idPrefix}-status`}
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="outline-0 cursor-pointer text-sm text-gray-700 bg-transparent"
        >
          <option value="all">전체검색</option>
          <option value="title">제목</option>
          <option value="text">내용</option>
        </Select>

        {/* 2. 검색어 입력창 */}
        <Input
          type="text"
          name="full_name"
          id={`${idPrefix}-fullname`}
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          className={`outline-0 flex-1 min-w-0 ${inputClassName}`}
          placeholder="검색어를 입력하세요"
        />

        {/* 3. 검색 버튼 (돋보기 아이콘) */}
        <button
          type="submit"
          className={`flex items-center justify-center transition-transform active:scale-90 cursor-pointer ${buttonClassName}`}
          aria-label="검색 실행"
        >
          <Search
            className={`${iconClassName}`}
            aria-hidden="true"
            strokeWidth={2.5}
          />
        </button>
      </Field>
    </form>
  );
}

// 초기 세팅: 페이지가 열리면 부모가 "맨 처음엔 '강아지'라고 적혀있게 해 줘"라고 부탁하면(initialValue), 검색창에 "강아지"가 미리 입력된 상태로 나타납니다.

// 검색 옵션 선택: 사용자가 왼쪽의 작은 메뉴(Select)를 눌러서 "전체검색", "제목", "내용" 중 하나를 고릅니다.

// 검색어 입력: 사용자가 "고양이"라고 입력하면, 실시간으로 그 내용이 컴포넌트 내부의 메모리(keyword state)에 저장됩니다.

// 돋보기 클릭 (제출):

// 사용자가 돋보기 아이콘을 누르거나 엔터를 칩니다.

// 컴포넌트는 "잠깐! 검색어가 비어있진 않나?" 검사합니다. 비어있으면 경고창을 띄우고 멈춥니다.

// 검색어가 있다면, 주소(URL)를 만듭니다. 예: /search/results?searchStatus=title&searchKeyword=고양이

// 그리고 페이지를 그 주소로 이동(router.push)시킵니다. 그러면 결과 페이지가 뜨겠죠?
