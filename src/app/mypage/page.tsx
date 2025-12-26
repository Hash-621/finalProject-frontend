"use client";

import React, { useEffect, useState } from "react";
import api from "@/api/axios";
import Link from "next/link";

// Swiper 관련 임포트
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";

import {
  User,
  FileText,
  MessageSquare,
  Star,
  Trash2,
  Edit2,
  ChevronLeft,
  ChevronRight,
  Bookmark,
  Settings,
  ArrowRight,
  Sparkles,
  MapPin,
  Newspaper,
  UtensilsCrossed,
  Bell,
  Home,
} from "lucide-react";

// --- 타입 정의 ---
interface UserInfo {
  loginId?: string;
  nickname?: string;
  email?: string;
}

interface ListItem {
  targetId: number;
  title?: string;
  content?: string;
  category?: string;
  createdAt: string;
}

export default function MyPage() {
  const [activeTab, setActiveTab] = useState<string>("info");
  const [info, setInfo] = useState<UserInfo>({});
  const [listData, setListData] = useState<ListItem[]>([]);

  // 페이지네이션 상태
  const [currentPage, setCurrentPage] = useState(1);
  const [isLastPage, setIsLastPage] = useState(false);

  // 수정 상태 관리
  const [editingItem, setEditingItem] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({ title: "", content: "" });

  useEffect(() => {
    setCurrentPage(1);
    fetchData(activeTab, 1);
    setEditingItem(null);
  }, [activeTab]);

  const fetchData = async (tab: string, page: number) => {
    try {
      let url = tab === "info" ? "/mypage/info" : `/mypage/${tab}?page=${page}`;
      const res = await api.get(url);

      if (tab === "info") {
        setInfo(res.data);
      } else {
        setListData(res.data);
        setIsLastPage(res.data.length < 10);
      }
    } catch (err) {
      console.error("데이터 조회 실패:", err);
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage < 1) return;
    setCurrentPage(newPage);
    fetchData(activeTab, newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleUpdateInfo = async () => {
    try {
      await api.put("/mypage/info", info);
      alert("성공적으로 변경되었습니다.");
    } catch (err) {
      alert("변경에 실패했습니다.");
    }
  };

  const startEdit = (item: ListItem) => {
    setEditingItem(item.targetId);
    setEditForm({
      title: item.title || "",
      content: item.content || item.title || "",
    });
  };

  const saveEdit = async (id: number) => {
    try {
      const url =
        activeTab === "posts" ? `/mypage/post/${id}` : `/mypage/comment/${id}`;
      const payload =
        activeTab === "posts" ? editForm : { content: editForm.content };

      await api.put(url, payload);
      setEditingItem(null);
      fetchData(activeTab, currentPage);
    } catch (err) {
      alert("수정에 실패했습니다.");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("삭제하시겠습니까?")) return;
    try {
      let url = "";
      if (activeTab === "posts") url = `/mypage/post/${id}`;
      else if (activeTab === "comments") url = `/mypage/comment/${id}`;
      else if (activeTab === "favorites") url = `/mypage/favorite/${id}`;

      await api.delete(url);
      fetchData(activeTab, currentPage);
    } catch (err) {
      alert("삭제 실패");
    }
  };

  return (
    <div className="min-h-screen bg-[#fcfdfc] py-16 px-4 lg:px-0">
      <div className="max-w-6xl mx-auto">
        {/* 상단 헤더 */}
        <div className="mb-12 animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-50 text-green-600 rounded-full text-[10px] font-black mb-4 tracking-[0.2em]">
            <Settings
              size={12}
              className="animate-spin"
              style={{ animationDuration: "4s" }}
            />
            USER DASHBOARD
          </div>
          <h1 className="text-5xl font-black text-slate-900 tracking-tighter">
            MY{" "}
            <span className="text-green-500 italic font-serif leading-none">
              PAGE
            </span>
          </h1>
        </div>

        <div className="flex flex-col lg:flex-row gap-10">
          {/* 사이드바 메뉴 */}
          <div className="w-full lg:w-72 flex flex-col gap-4">
            <div className="bg-white rounded-[2.5rem] shadow-[0_15px_50px_-15px_rgba(0,0,0,0.05)] border border-slate-100 p-6 overflow-hidden relative group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-green-50 rounded-full -mr-16 -mt-16 transition-transform duration-700 group-hover:scale-110" />

              <div className="mb-10 px-2 relative">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-16 h-16 bg-green-500 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-green-100">
                    <User size={32} strokeWidth={2.5} />
                  </div>
                  {/* 추가된 홈 버튼 */}
                  <Link
                    href="/"
                    className="w-12 h-12 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center hover:bg-slate-900 hover:text-white transition-all duration-300 group/home"
                    title="홈으로 이동"
                  >
                    <Home
                      size={20}
                      className="group-hover/home:scale-110 transition-transform"
                    />
                  </Link>
                </div>

                <p className="text-xs font-bold text-slate-400 mb-1">
                  반갑습니다,
                </p>
                <h3 className="text-2xl font-black text-slate-800 tracking-tighter">
                  {info.nickname || "사용자"}님
                </h3>
              </div>

              <div className="space-y-1 relative">
                <p className="text-[10px] font-black text-slate-300 px-4 mb-3 uppercase tracking-[0.3em]">
                  Menu
                </p>
                <TabBtn
                  id="info"
                  label="내 정보 관리"
                  icon={<User size={18} />}
                  active={activeTab}
                  onClick={setActiveTab}
                />
                <TabBtn
                  id="posts"
                  label="작성한 게시글"
                  icon={<FileText size={18} />}
                  active={activeTab}
                  onClick={setActiveTab}
                />
                <TabBtn
                  id="comments"
                  label="작성한 댓글"
                  icon={<MessageSquare size={18} />}
                  active={activeTab}
                  onClick={setActiveTab}
                />
                <TabBtn
                  id="favorites"
                  label="즐겨찾기 목록"
                  icon={
                    <Star
                      size={18}
                      className={activeTab === "favorites" ? "fill-white" : ""}
                    />
                  }
                  active={activeTab}
                  onClick={setActiveTab}
                />
              </div>
            </div>
          </div>

          {/* 메인 컨텐츠 영역 */}
          <div className="flex-1 bg-white rounded-[3.5rem] shadow-[0_30px_80px_-20px_rgba(0,0,0,0.04)] border border-slate-50 p-6 md:p-14 min-h-[800px] flex flex-col relative transition-all duration-500">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-green-50/30 rounded-full blur-[120px] -mr-40 -mt-40 pointer-events-none" />

            <div className="relative h-full flex flex-col">
              <div className="flex justify-between items-center mb-14">
                <h2 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-4">
                  <div className="w-2 h-10 bg-green-500 rounded-full" />
                  {activeTab === "info"
                    ? "Account Settings"
                    : "Activity History"}
                </h2>
                <div className="hidden md:flex items-center gap-2 text-slate-400">
                  <Bell
                    size={18}
                    className="animate-bounce"
                    style={{ animationDuration: "3s" }}
                  />
                  <span className="text-[10px] font-black uppercase tracking-widest">
                    Live Connect
                  </span>
                </div>
              </div>

              {activeTab === "info" ? (
                <div className="flex flex-col xl:flex-row items-start gap-16 animate-in fade-in slide-in-from-bottom-8 duration-1000">
                  {/* 왼쪽: 폼 영역 */}
                  <div className="w-full xl:max-w-md space-y-10">
                    <InputGroup
                      label="Login ID"
                      value={info.loginId}
                      disabled
                    />
                    <InputGroup
                      label="Nickname"
                      value={info.nickname}
                      onChange={(v: string) =>
                        setInfo({ ...info, nickname: v })
                      }
                    />
                    <InputGroup
                      label="Email Address"
                      value={info.email}
                      onChange={(v: string) => setInfo({ ...info, email: v })}
                    />
                    <button
                      onClick={handleUpdateInfo}
                      className="w-full mt-10 bg-slate-900 text-white font-black py-6 rounded-4xl hover:bg-green-600 shadow-2xl shadow-slate-200 hover:shadow-green-100 transition-all active:scale-[0.98] flex items-center justify-center gap-3 group"
                    >
                      저장하기{" "}
                      <ArrowRight
                        size={20}
                        className="group-hover:translate-x-1 transition-transform"
                      />
                    </button>
                  </div>

                  {/* 오른쪽: Swiper 가이드 슬라이더 */}
                  <div className="w-full xl:w-80 flex flex-col gap-6">
                    <div className="w-full rounded-[2.5rem] overflow-hidden shadow-2xl shadow-slate-100 border border-slate-50 relative">
                      <Swiper
                        modules={[Autoplay, Pagination]}
                        spaceBetween={0}
                        slidesPerView={1}
                        autoplay={{ delay: 4500, disableOnInteraction: false }}
                        pagination={{ clickable: true }}
                        className="mySwiper h-[340px]"
                      >
                        <SwiperSlide>
                          <div className="bg-green-50 h-full p-8 relative overflow-hidden flex flex-col justify-between">
                            <div className="absolute -right-4 -top-4 w-24 h-24 bg-green-100 rounded-full blur-2xl opacity-60" />
                            <div>
                              <p className="text-[10px] font-black text-green-700 uppercase tracking-widest mb-6 flex items-center gap-2">
                                <MapPin size={12} className="fill-green-500" />{" "}
                                Local Hotplace
                              </p>
                              <h4 className="text-xl font-black text-slate-800 leading-tight mb-4">
                                우리 동네 <br />
                                숨은 맛집{" "}
                                <span className="text-green-600 italic">
                                  찾기!
                                </span>
                              </h4>
                              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                                이웃들이 검증한 진짜 맛집 후기를 확인해보세요.
                                실패 없는 나들이를 보장합니다.
                              </p>
                            </div>
                            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-green-500 shadow-sm self-end">
                              <UtensilsCrossed size={20} />
                            </div>
                          </div>
                        </SwiperSlide>

                        <SwiperSlide>
                          <div className="bg-slate-900 h-full p-8 relative overflow-hidden text-white flex flex-col justify-between">
                            <div className="absolute bottom-0 right-0 w-32 h-32 bg-green-500 rounded-full blur-[60px] opacity-20" />
                            <div>
                              <p className="text-[10px] font-bold opacity-40 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                                <Newspaper size={12} /> Daily News
                              </p>
                              <h4 className="text-xl font-black mb-4 leading-tight">
                                가장 빠른 <br />
                                <span className="text-green-400 font-serif italic font-light">
                                  우리 지역 뉴스
                                </span>
                              </h4>
                              <p className="text-xs opacity-50 font-medium leading-relaxed">
                                생활정보부터 공공기관 소식까지, 필요한 소식을
                                실시간으로 알려드려요.
                              </p>
                            </div>
                            <div className="flex items-center gap-2 text-green-400 text-[10px] font-black uppercase tracking-tighter">
                              Read More <ArrowRight size={14} />
                            </div>
                          </div>
                        </SwiperSlide>

                        <SwiperSlide>
                          <div className="bg-white h-full p-8 border-2 border-green-50 relative overflow-hidden flex flex-col justify-between">
                            <div>
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                                <Sparkles
                                  size={12}
                                  className="text-green-500"
                                />{" "}
                                Interaction
                              </p>
                              <h4 className="text-xl font-black text-slate-800 leading-tight mb-4">
                                이웃과 함께하는 <br />
                                <span className="text-green-600">
                                  활발한 소통
                                </span>
                              </h4>
                              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                                커뮤니티 가이드라인을 준수하며 즐거운 지역
                                문화를 함께 만들어가요.
                              </p>
                            </div>
                            <MessageSquare
                              size={32}
                              className="text-green-100 self-end"
                            />
                          </div>
                        </SwiperSlide>
                      </Swiper>
                    </div>

                    <div className="px-6 py-5 bg-slate-50 rounded-3xl border border-slate-100">
                      <p className="text-[11px] text-slate-400 font-bold leading-relaxed">
                        *{" "}
                        <span className="text-green-600">
                          지역 포털 가이드:
                        </span>{" "}
                        허위 정보 제보는 고객센터 1:1 문의를 통해 접수됩니다.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                /* 활동 리스트 섹션 */
                <div className="flex-1 flex flex-col justify-between animate-in fade-in duration-500">
                  {listData.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-300 py-24">
                      <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                        <Bookmark size={40} className="opacity-10" />
                      </div>
                      <p className="font-black text-xl tracking-tight text-slate-400">
                        활동 내역이 없습니다.
                      </p>
                    </div>
                  ) : (
                    <div>
                      <div className="grid gap-6">
                        {listData.map((item, index) => (
                          <div
                            key={item.targetId || index}
                            className="group p-7 bg-slate-50/50 rounded-[2.5rem] border border-transparent hover:border-green-200 hover:bg-white hover:shadow-2xl hover:shadow-green-900/5 transition-all duration-300"
                          >
                            {editingItem === item.targetId ? (
                              <div className="space-y-4">
                                <textarea
                                  value={editForm.content}
                                  onChange={(e) =>
                                    setEditForm({
                                      ...editForm,
                                      content: e.target.value,
                                    })
                                  }
                                  className="w-full p-5 bg-white border border-slate-200 rounded-2xl h-32 outline-none focus:ring-4 focus:ring-green-50 font-medium"
                                />
                                <div className="flex justify-end gap-3">
                                  <button
                                    onClick={() => setEditingItem(null)}
                                    className="px-6 py-2 text-slate-400 font-bold"
                                  >
                                    취소
                                  </button>
                                  <button
                                    onClick={() => saveEdit(item.targetId)}
                                    className="px-8 py-2 bg-green-500 text-white font-black rounded-xl"
                                  >
                                    저장
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div className="flex justify-between items-center">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-3 mb-3">
                                    <span className="text-[10px] font-black uppercase text-green-700 bg-green-100 px-2.5 py-1 rounded-lg tracking-widest">
                                      {item.category || activeTab}
                                    </span>
                                    <span className="text-xs text-slate-400 font-bold tracking-tighter">
                                      {item.createdAt}
                                    </span>
                                  </div>
                                  <h3 className="text-xl font-black text-slate-800 group-hover:text-green-600 transition-colors truncate pr-10">
                                    {activeTab === "comments"
                                      ? item.content
                                      : item.title}
                                  </h3>
                                </div>
                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                                  {activeTab !== "favorites" && (
                                    <button
                                      onClick={() => startEdit(item)}
                                      className="w-12 h-12 flex items-center justify-center text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-2xl transition-all"
                                    >
                                      <Edit2 size={18} />
                                    </button>
                                  )}
                                  <button
                                    onClick={() => handleDelete(item.targetId)}
                                    className="w-12 h-12 flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all"
                                  >
                                    <Trash2 size={18} />
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>

                      <div className="flex justify-center items-center gap-4 mt-20">
                        <PageBtn
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage === 1}
                          icon={<ChevronLeft size={22} />}
                        />
                        <span className="w-14 h-14 flex items-center justify-center bg-slate-900 text-white rounded-2xl font-black text-lg">
                          {currentPage}
                        </span>
                        <PageBtn
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={isLastPage}
                          icon={<ChevronRight size={22} />}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .swiper-pagination-bullet {
          background: #cbd5e1 !important;
          opacity: 1 !important;
          width: 8px !important;
          height: 8px !important;
          transition: all 0.3s !important;
        }
        .swiper-pagination-bullet-active {
          background: #22c55e !important;
          width: 24px !important;
          border-radius: 4px !important;
        }
      `}</style>
    </div>
  );
}

// --- 서브 컴포넌트 ---

const TabBtn = ({
  id,
  label,
  icon,
  active,
  onClick,
}: {
  id: string;
  label: string;
  icon: React.ReactNode;
  active: string;
  onClick: (id: string) => void;
}) => (
  <button
    onClick={() => onClick(id)}
    className={`w-full flex items-center gap-4 p-5 rounded-3xl font-black transition-all mb-2 ${
      active === id
        ? "bg-green-500 text-white shadow-[0_15px_30px_-10px_rgba(34,197,94,0.4)]"
        : "text-slate-400 hover:bg-slate-50 hover:text-slate-600"
    }`}
  >
    <span className={active === id ? "scale-110" : ""}>{icon}</span>
    <span className="text-[13px] tracking-tight">{label}</span>
  </button>
);

const InputGroup = ({
  label,
  value,
  disabled,
  onChange,
}: {
  label: string;
  value?: string;
  disabled?: boolean;
  onChange?: (v: string) => void;
}) => (
  <div className="flex flex-col gap-3">
    <label className="text-[11px] font-black text-slate-400 ml-4 uppercase tracking-[0.2em]">
      {label}
    </label>
    <input
      value={value || ""}
      disabled={disabled}
      onChange={(e) => onChange?.(e.target.value)}
      className={`w-full p-6 rounded-4xl border border-slate-100 outline-none transition-all font-black text-slate-700 ${
        disabled
          ? "bg-slate-50/50 text-slate-300 border-none shadow-inner"
          : "focus:border-green-400 focus:ring-8 focus:ring-green-50/50 bg-slate-50/30"
      }`}
    />
  </div>
);

const PageBtn = ({
  onClick,
  disabled,
  icon,
}: {
  onClick: () => void;
  disabled: boolean;
  icon: React.ReactNode;
}) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className="w-14 h-14 flex items-center justify-center bg-white border border-slate-100 rounded-2xl disabled:opacity-20 hover:border-green-200 hover:text-green-500 transition-all text-slate-400"
  >
    {icon}
  </button>
);
