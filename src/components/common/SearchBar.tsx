"user client";

import React from "react";
import { useRouter } from "next/navigation";
import { Field, Select, Input } from "@headlessui/react";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";

interface SearchBarProps {
  className?: string;
  inputClassName?: string;
  buttonClassName?: string;
  iconClassName?: string;
  idPrefix: string;
}

export default function SearchBar({
  className = "",
  inputClassName = "",
  buttonClassName = "",
  iconClassName = "",
  idPrefix,
}: SearchBarProps) {
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    const status = formData.get("status") as string;
    const keyword = formData.get("full_name") as string;

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
        <Select name="status" id={`${idPrefix}-status`} className="outline-0">
          <option value="all">전체검색</option>
          <option value="title">제목</option>
          <option value="text">내용</option>
        </Select>

        <Input
          type="text"
          name="full_name"
          id={`${idPrefix}-fullname`}
          className={`outline-0 flex-1 min-w-0 ${inputClassName}`}
          placeholder="검색어를 입력하세요"
        />

        <button
          type="submit"
          className={` ${buttonClassName}`}
          aria-label="검색 실행"
        >
          <MagnifyingGlassIcon
            className={` ${iconClassName}`}
            aria-hidden="true"
          />
        </button>
      </Field>
    </form>
  );
}
