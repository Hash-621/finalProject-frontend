"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/api/axios";
import { MapPin, UserCircle2, Clock } from "lucide-react";

export default function TalentListPage() {
  const [talents, setTalents] = useState([]);

  useEffect(() => {
    api
      .get("/job/user/list")
      .then((res) => setTalents(res.data))
      .catch((err) => console.error(err));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-6xl mx-auto">
        {/* 헤더 */}
        <div className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-3xl font-black text-gray-900 mb-2">
              인재 찾기
            </h1>
            <p className="text-gray-500">
              우리 동네의 성실한 인재를 직접 찾아보세요!
            </p>
          </div>
          <Link
            href="/job/user/write"
            className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-200"
          >
            내 프로필 등록
          </Link>
        </div>

        {/* 인재 카드 그리드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {talents.map((item: any) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition cursor-pointer group"
            >
              {/* 상단: 프로필 정보 */}
              <div className="flex items-center gap-4 mb-4 border-b border-gray-50 pb-4">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-gray-400">
                  <UserCircle2 size={32} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    {/* DB userId 대신 닉네임 등을 보여주면 좋음 */}
                    <span className="font-bold text-gray-900">
                      {item.userId} 님
                    </span>
                    {/* isActive가 1이면 구직중, 0이면 구직완료 */}
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
                  <span className="text-xs text-gray-400">
                    {item.careerLevel} · {item.education}
                  </span>
                </div>
              </div>

              {/* 중단: 자기소개 (제목) */}
              <h3 className="text-lg font-bold text-gray-800 mb-3 line-clamp-2 group-hover:text-blue-600 transition">
                "{item.title}"
              </h3>

              {/* 하단: 희망 근무 조건 (DB 매핑된 데이터 표시) */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin size={16} className="text-blue-500" />
                  <span className="font-medium">희망지역:</span>
                  {/* DB: companyName -> 화면: 희망지역 */}
                  <span>{item.companyName}</span>
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock size={16} className="text-purple-500" />
                  <span className="font-medium">희망직종:</span>
                  {/* DB: companyType -> 화면: 희망직종 */}
                  <span>{item.companyType}</span>
                </div>
              </div>

              {/* 마감일 표시 */}
              <div className="mt-4 pt-4 border-t border-gray-50 flex justify-between items-center text-xs text-gray-400">
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
