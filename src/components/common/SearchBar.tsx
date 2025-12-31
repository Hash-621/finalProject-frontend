"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Field, Select, Input } from "@headlessui/react";
import { Search } from "lucide-react";

interface SearchBarProps {
  className?: string;
  inputClassName?: string;
  buttonClassName?: string;
  iconClassName?: string;
  idPrefix: string;

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

  const [keyword, setKeyword] = useState(initialValue);
  const [status, setStatus] = useState(initialStatus);

  useEffect(() => {
    setKeyword(initialValue);
  }, [initialValue]);

  // Status도 동일하게 처리
  useEffect(() => {
    setStatus(initialStatus);
  }, [initialStatus]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!keyword.trim()) {
      alert("검색어를 입력해 주세요.");
      return;
    }

    const searchParams = new URLSearchParams({
      searchStatus: status,
      searchKeyword: keyword,
    });
    const fullPath = `/search/results?${searchParams.toString()}`;

    router.push(fullPath);
  };

  return (
    <form onSubmit={handleSubmit} role="search" className={className}>
      <Field className="flex gap-3 items-center h-full w-full">
        <Select
          name="status"
          id={`${idPrefix}-status`}
          // [UI] Headless UI Select와 State 연결
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="outline-0 cursor-pointer text-sm text-gray-700 bg-transparent"
        >
          <option value="all">전체검색</option>
          <option value="title">제목</option>
          <option value="text">내용</option>
        </Select>

        <Input
          type="text"
          name="full_name"
          id={`${idPrefix}-fullname`}
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          className={`outline-0 flex-1 min-w-0 ${inputClassName}`}
          placeholder="검색어를 입력하세요"
        />

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
