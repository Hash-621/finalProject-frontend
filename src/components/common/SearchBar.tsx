"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Field, Select, Input } from "@headlessui/react";
import {
  Search,
  Camera, // [추가] 이미지 아이콘
  Loader2, // [추가] 로딩 아이콘
} from "lucide-react";
import axios from "axios"; // [추가] AI 서버 통신용

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

  // [추가] 이미지 업로드 중인지 확인하는 상태
  const [isUploading, setIsUploading] = useState(false);
  // [추가] 숨겨진 파일 입력창을 제어하기 위한 Ref
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 부모로부터 초기값이 늦게 들어오거나 바뀔 경우를 대비해 상태 동기화
  useEffect(() => {
    setKeyword(initialValue);
  }, [initialValue]);

  useEffect(() => {
    setStatus(initialStatus);
  }, [initialStatus]);

  // 1. [일반 검색] 제출 핸들러 (기존 유지)
  // 돋보기 버튼이나 엔터를 쳤을 때 실행 -> /search/results 로 이동
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

    // 일반 검색 결과 페이지로 이동
    const fullPath = `/search/results?${searchParams.toString()}`;
    router.push(fullPath);
  };

  // 2. [이미지 검색] 핸들러 (경로 분리됨)
  // 사진을 업로드하고 AI 분석이 끝나면 -> /search/imageresults 로 이동
  const handleImageSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true); // 로딩 시작

    try {
      // 1. FormData 생성
      const formData = new FormData();
      formData.append("file", file);

      // 2. AI 서버로 POST 요청 (192.168.0.97:5000)
      const res = await axios.post(
        "http://192.168.0.97:5000/predict",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      // 3. 결과 처리
      // 서버가 { result: "사과" } 형태로 준다고 가정
      const aiResult = res.data.result || res.data;

      if (aiResult) {
        setKeyword(aiResult); // 검색창에 결과 텍스트 표시

        // 🔥 [경로 변경 핵심] 이미지 검색 결과 페이지로 이동
        const searchParams = new URLSearchParams({
          searchStatus: "all", // 이미지 검색은 보통 전체 검색으로 처리
          searchKeyword: aiResult,
        });

        // /search/imageresults 경로로 이동
        router.push(`/search/imageresults?${searchParams.toString()}`);
      } else {
        alert("이미지를 분석할 수 없습니다.");
      }
    } catch (error) {
      console.error("이미지 검색 실패:", error);
      alert("이미지 검색 서버 연결에 실패했습니다.");
    } finally {
      setIsUploading(false); // 로딩 종료
      if (fileInputRef.current) fileInputRef.current.value = ""; // 입력창 초기화
    }
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

        {/* [추가] 2-1. 이미지 검색 버튼 (돋보기 옆) */}
        {/* 실제 파일 입력창은 숨김 처리 */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleImageSearch}
          className="hidden"
          accept="image/*" // 이미지 파일만 허용
        />
        <button
          type="button" // submit이 일어나지 않도록 type="button" 필수
          onClick={() => fileInputRef.current?.click()} // 버튼 클릭 시 숨겨진 input 클릭
          className={`flex items-center justify-center transition-transform active:scale-90 cursor-pointer text-gray-400 hover:text-green-600 ${buttonClassName}`}
          aria-label="이미지로 검색"
          disabled={isUploading}
        >
          {isUploading ? (
            <Loader2 className={`animate-spin ${iconClassName}`} size={26} />
          ) : (
            <Camera className={`${iconClassName}`} size={26} />
          )}
        </button>

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

// [추가됨] 이미지 검색:
// 사용자가 돋보기 옆의 '사진 아이콘'을 누릅니다.
// 파일 선택창이 열리고 사진을 고르면, 자동으로 지정된 AI 서버(192.168.0.97)로 사진을 보냅니다.
// AI가 사진을 분석해서 "사과"라고 알려주면, 알림창이 뜨고 **`/search/imageresults`** 페이지로 이동합니다.

// 돋보기 클릭 (일반 검색):
// 사용자가 돋보기 아이콘을 누르거나 엔터를 칩니다.
// 컴포넌트는 검색어가 비어있는지 확인합니다.
// 검색어가 있다면, **`/search/results`** 페이지로 이동합니다.
