// 1. "use client": 이 파일이 브라우저에서 실행되는 클라이언트 컴포넌트임을 선언합니다.
// (useEffect, useState 등을 사용하기 위해 필수입니다.)
"use client";

// --- [라이브러리 및 훅 임포트] ---
import React, { useEffect, useState } from "react"; // 리액트 훅 (상태 관리, 사이드 이펙트)
import Link from "next/link"; // 페이지 이동 컴포넌트
import api from "@/api/axios"; // API 호출 모듈 (Axios 인스턴스)
// 아이콘 라이브러리 (MapPin: 지도 핀, UserCircle2: 프로필 아이콘, Clock: 시계 아이콘)
import { MapPin, UserCircle2, Clock } from "lucide-react";

// --- [메인 페이지 컴포넌트] ---
export default function TalentListPage() {
  // 인재 목록 데이터를 저장할 상태 변수 (초기값은 빈 배열)
  const [talents, setTalents] = useState([]);

  // --- [데이터 로드 (useEffect)] ---
  // 페이지가 처음 로드될 때(마운트 시점) 한 번만 실행됩니다.
  useEffect(() => {
    // 1. 서버 API('/job/user/list')에 GET 요청을 보냅니다.
    // 이 API는 구직자들이 등록한 프로필 목록을 반환합니다.
    api
      .get("/job/user/list")
      .then((res) => setTalents(res.data)) // 2. 성공 시 받아온 데이터(res.data)를 상태에 저장합니다.
      .catch((err) => console.error(err)); // 3. 실패 시 에러를 콘솔에 출력합니다.
  }, []); // 의존성 배열이 비어있으므로 최초 1회만 실행됨

  // --- [화면 렌더링] ---
  return (
    // 전체 배경 설정 (회색톤 배경, 최소 높이 화면 전체)
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      {/* 콘텐츠 컨테이너 (최대 너비 제한, 중앙 정렬) */}
      <div className="max-w-6xl mx-auto">
        {/* 1. 페이지 헤더 영역 (제목 + 등록 버튼) */}
        <div className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-3xl font-black text-gray-900 mb-2">
              인재 찾기
            </h1>
            <p className="text-gray-500">
              우리 동네의 성실한 인재를 직접 찾아보세요!
            </p>
          </div>
          {/* '내 프로필 등록' 버튼 (구직자가 자신의 정보를 올리는 페이지로 이동) */}
          <Link
            href="/job/user/write"
            className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-200"
          >
            내 프로필 등록
          </Link>
        </div>

        {/* 2. 인재 카드 그리드 영역 */}
        {/* 반응형 그리드: 모바일 1열, 태블릿 2열, PC 3열 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* talents 배열을 순회하며 카드 아이템을 생성합니다. */}
          {talents.map((item: any) => (
            <div
              key={item.id} // 리액트 리스트 렌더링용 고유 키
              className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition cursor-pointer group"
            >
              {/* (A) 상단: 프로필 기본 정보 */}
              <div className="flex items-center gap-4 mb-4 border-b border-gray-50 pb-4">
                {/* 프로필 이미지 아이콘 (회색 원형 배경) */}
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-gray-400">
                  <UserCircle2 size={32} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    {/* 구직자 아이디 (실무에서는 이름이나 닉네임을 주로 사용) */}
                    <span className="font-bold text-gray-900">
                      {item.userId} 님
                    </span>
                    {/* 구직 상태 뱃지 (1: 구직중, 그외: 구직완료) */}
                    {item.isActive === 1 ? (
                      <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold">
                        구직중
                      </span>
                    ) : (
                      <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-bold">
                        구직완료
                      </span>
                    )}
                  </div>
                  {/* 경력 및 학력 정보 */}
                  <span className="text-xs text-gray-400">
                    {item.careerLevel} · {item.education}
                  </span>
                </div>
              </div>

              {/* (B) 중단: 자기소개 제목 */}
              {/* 마우스 호버 시 파란색으로 변하는 효과(group-hover) 적용 */}
              <h3 className="text-lg font-bold text-gray-800 mb-3 line-clamp-2 group-hover:text-blue-600 transition">
                "{item.title}"
              </h3>

              {/* (C) 하단: 희망 근무 조건 상세 */}
              <div className="space-y-2">
                {/* 희망 지역 (companyName 필드에 저장된 값을 사용) */}
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin size={16} className="text-blue-500" />
                  <span className="font-medium">희망지역:</span>
                  <span>{item.companyName}</span>
                </div>

                {/* 희망 직종 (companyType 필드에 저장된 값을 사용) */}
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock size={16} className="text-purple-500" />
                  <span className="font-medium">희망직종:</span>
                  <span>{item.companyType}</span>
                </div>
              </div>

              {/* (D) 최하단: 등록일 및 마감일 */}
              <div className="mt-4 pt-4 border-t border-gray-50 flex justify-between items-center text-xs text-gray-400">
                {/* 날짜 데이터에서 시간 부분(T 이후)을 잘라내고 날짜만 표시 */}
                <span>등록일: {item.createdAt?.split("T")[0]}</span>
                <span className="text-red-400 font-bold">
                  ~ {item.deadline?.split("T")[0]} 까지
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// 1. 페이지 진입 및 데이터 로드 (Data Fetching)

// 사용자가 /job/user/list 주소로 들어옵니다.

// useEffect가 실행되어 백엔드 서버에 **"구직자 리스트 좀 줘"**라고 요청합니다. (api.get)

// 서버가 DB에서 구직자 데이터를 긁어와서 응답해 줍니다.

// 프론트엔드는 이 데이터를 talents라는 상태 변수에 저장합니다.

// 2. 화면 렌더링 (Rendering)

// talents에 데이터가 들어오면 리액트가 화면을 다시 그립니다.

// 데이터 개수만큼 카드(div)가 반복해서 생성됩니다.

// 각 카드에는 구직자의 아이디, 구직 상태(구직중), 자기소개 제목, 희망 지역/직종 등이 예쁘게 배치되어 표시됩니다.

// 3. 사용자 탐색 (Browsing)

// 사장님은 카드들을 훑어보며 마음에 드는 인재를 찾습니다.

// **"성실함이 무기입니다"**라는 제목의 카드를 발견하고 마우스를 올리면, 제목 색깔이 파란색으로 바뀌며 클릭할 수 있음을 알려줍니다. (상세 페이지 이동 기능은 현재 코드엔 없지만, 보통 div 전체를 Link로 감싸서 구현합니다.)

// 4. 프로필 등록 (Action)

// 만약 사용자가 구직자라면, 우측 상단의 [내 프로필 등록] 버튼을 눌러 자신의 정보를 올리는 페이지(/job/user/write)로 이동할 수 있습니다.
