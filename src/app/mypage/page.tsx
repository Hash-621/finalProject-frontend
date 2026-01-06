"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  User,
  FileText,
  MessageSquare,
  Star,
  Settings,
  LogOut,
  Home,
  ArrowRight,
  Clock,
  History,
  Heart,
  MapPin,
  UtensilsCrossed,
  Newspaper,
  Sparkles,
} from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import { Input } from "@/components/common/Input";
import { useAuth } from "@/hooks/useAuth";
import { usePosts } from "@/hooks/userPost";
import { userService, boardService } from "@/api/services";
import Cookies from "js-cookie";
// [추가] 모달 컴포넌트 임포트
import Modal from "@/components/common/Modal";

import "swiper/css";
import "swiper/css/pagination";

// [Type] 활동 내역 통합 타입
type ActivityType = "POST" | "COMMENT" | "FAVORITE";
interface ActivityItem {
  id: string | number;
  type: ActivityType;
  title: string;
  description?: string;
  date: string;
  link: string;
  thumbnail?: string | null;
}

export default function MyPage() {
  const { logout } = useAuth();
  const [activeTab, setActiveTab] = useState<string>("info");
  const [info, setInfo] = useState<any>({});
  const [tempNickname, setTempNickname] = useState("");
  const [tempEmail, setTempEmail] = useState("");
  const [isInfoLoading, setIsInfoLoading] = useState(true);

  // --- [추가] 모달 상태 관리 ---
  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    title: "",
    content: "",
    type: "success" as "success" | "error" | "warning" | "confirm",
    onConfirm: undefined as (() => void) | undefined,
  });

  const openModal = (
    content: string,
    type: "success" | "error" | "warning" | "confirm" = "success",
    title?: string,
    onConfirm?: () => void
  ) => {
    setModalConfig({
      isOpen: true,
      content,
      type,
      title:
        title ||
        (type === "error" ? "오류 발생" : type === "confirm" ? "확인" : "알림"),
      onConfirm,
    });
  };

  const closeModal = () => {
    setModalConfig((prev) => ({ ...prev, isOpen: false }));
  };
  // ---------------------------

  // [수정] 로그아웃 버튼 클릭 핸들러 (모달 띄우기)
  const handleLogoutClick = () => {
    openModal(
      "정말 로그아웃 하시겠습니까?",
      "confirm",
      "로그아웃",
      () => logout() // 확인 버튼 클릭 시 실제 로그아웃 실행
    );
  };

  // 기존 훅
  const { listData, isLoading: isListLoading, fetchPosts } = usePosts();

  // 활동 내역 상태
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [isActivityLoading, setIsActivityLoading] = useState(false);

  // 사용자 정보 로드
  const fetchUserInfo = useCallback(async () => {
    try {
      setIsInfoLoading(true);
      const res = await userService.getUserInfo();
      const data = res.data;
      setInfo(data);
      setTempNickname(data.nickname || "");
      setTempEmail(data.email || "");
    } catch (err: any) {
      if (err.response?.status === 401) {
        Cookies.remove("token");
        window.location.href = "/sign-in";
      }
    } finally {
      setIsInfoLoading(false);
    }
  }, []);

  // HTML 태그 제거 (텍스트만 추출)
  const stripHtml = (html: string) => {
    if (!html) return "";
    if (typeof window !== "undefined") {
      const tmp = document.createElement("DIV");
      tmp.innerHTML = html;
      let text = tmp.textContent || tmp.innerText || "";

      if (text.trim().startsWith("{") && text.includes("blocks")) {
        try {
          const json = JSON.parse(text);
          return json.blocks
            .filter(
              (block: any) =>
                block.type === "paragraph" || block.type === "header"
            )
            .map((block: any) => block.data.text.replace(/<[^>]*>?/gm, ""))
            .join(" ");
        } catch (e) {
          return "내용 미리보기";
        }
      }
      return text;
    }
    return html.replace(/<[^>]*>?/gm, "");
  };

  // 첫 번째 이미지 URL 추출
  const extractFirstImage = (content: string): string | null => {
    if (!content) return null;

    if (content.trim().startsWith("{") && content.includes("blocks")) {
      try {
        const json = JSON.parse(content);
        const imgBlock = json.blocks.find((b: any) => b.type === "image");
        if (imgBlock && imgBlock.data && imgBlock.data.file) {
          return imgBlock.data.file.url;
        }
      } catch (e) {}
    }

    const imgMatch = content.match(/<img[^>]+src="([^">]+)"/);
    if (imgMatch && imgMatch[1]) {
      return imgMatch[1];
    }
    return null;
  };

  // 활동 내역 데이터 통합 로드
  const fetchActivities = useCallback(async () => {
    try {
      setIsActivityLoading(true);
      const [postsRes, commentsRes, favoritesRes] = await Promise.allSettled([
        boardService.getBoardPosts("free"),
        Promise.resolve({ data: [] }),
        userService.getFavorites(),
      ]);

      let allData: ActivityItem[] = [];

      if (postsRes.status === "fulfilled") {
        const posts = Array.isArray(postsRes.value.data)
          ? postsRes.value.data
          : [];
        const postItems = posts.map(
          (p: any) =>
            ({
              id: `post-${p.id}`,
              type: "POST",
              title: p.title,
              description: stripHtml(p.content),
              thumbnail: extractFirstImage(p.content),
              date: p.createdAt || new Date().toISOString(),
              link: `/community/free/${p.id}`,
            } as ActivityItem)
        );
        allData = [...allData, ...postItems];
      }

      if (favoritesRes.status === "fulfilled") {
        const favs = Array.isArray(favoritesRes.value.data)
          ? favoritesRes.value.data
          : [];
        const favItems = favs.map((f: any) => {
          const isRest = f.menu || f.restCategory;
          const imagePath = f.imagePath || f.image;
          const thumb = imagePath
            ? isRest
              ? `/images/restaurantImages/${imagePath}`
              : imagePath
            : null;

          return {
            id: `fav-${f.id}`,
            type: "FAVORITE",
            title: f.name,
            description: f.address,
            thumbnail: thumb,
            date: f.createdAt || new Date().toISOString(),
            link: isRest ? `/restaurant/${f.id}` : `/tour/attraction`,
          } as ActivityItem;
        });
        allData = [...allData, ...favItems];
      }

      allData.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      setActivities(allData);
    } catch (e) {
      console.error("활동 내역 로드 실패", e);
    } finally {
      setIsActivityLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!Cookies.get("token")) {
      window.location.href = "/sign-in";
      return;
    }
    if (activeTab === "info") {
      fetchUserInfo();
    } else if (activeTab === "history") {
      fetchActivities();
    } else {
      fetchPosts(activeTab, 1);
    }
  }, [activeTab, fetchUserInfo, fetchPosts, fetchActivities]);

  const handleUpdateInfo = async () => {
    try {
      const updateData = { ...info, nickname: tempNickname, email: tempEmail };
      await userService.updateUserInfo(updateData);
      setInfo(updateData);
      // [수정] 성공 시 모달
      openModal("성공적으로 변경되었습니다.", "success");
    } catch (err) {
      // [수정] 실패 시 모달
      openModal("변경에 실패했습니다.", "error");
    }
  };

  const truncateText = (text: string) => {
    if (!text) return "";
    const cleanText = stripHtml(text);
    if (typeof window === "undefined") return cleanText;
    const width = window.innerWidth;
    let limit = 40;
    if (width <= 320) limit = 12;
    else if (width < 768) limit = 18;
    return cleanText.length > limit
      ? cleanText.slice(0, limit) + "..."
      : cleanText;
  };

  if (isInfoLoading && activeTab === "info") {
    return (
      <div className="min-h-screen flex items-center justify-center font-black text-slate-400 text-sm tracking-[0.2em]">
        LOADING DASHBOARD...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fcfdfc] py-10 md:py-16 px-3 md:px-4 lg:px-0 font-pretendard">
      {/* [추가] 모달 컴포넌트 렌더링 */}
      <Modal
        isOpen={modalConfig.isOpen}
        onClose={closeModal}
        title={modalConfig.title}
        content={modalConfig.content}
        type={modalConfig.type}
        onConfirm={modalConfig.onConfirm}
      />

      <div className="max-w-6xl mx-auto">
        {/* 상단 헤더 */}
        <div className="mb-8 md:mb-12 px-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-50 text-green-600 rounded-full text-[10px] font-black mb-4 tracking-[0.2em]">
            <Settings
              size={12}
              className="animate-spin"
              style={{ animationDuration: "4s" }}
            />
            USER DASHBOARD
          </div>
          <div className="flex justify-between items-end">
            <h2 className="text-3xl xs:text-4xl md:text-5xl font-black text-slate-900 tracking-tighter">
              MY{" "}
              <span className="text-green-500 italic font-serif leading-none">
                PAGE
              </span>
            </h2>
            <button
              onClick={handleLogoutClick} // [수정] 모달 핸들러 연결
              className="flex items-center gap-2 text-slate-400 hover:text-red-500 font-black text-[10px] md:text-xs transition-colors mb-2"
            >
              <LogOut size={14} /> LOGOUT
            </button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 md:gap-10">
          {/* 사이드바 */}
          <div className="w-full lg:w-72 flex flex-col gap-4">
            <div className="bg-white rounded-4xl md:rounded-[2.5rem] shadow-sm border border-slate-100 p-5 md:p-6 overflow-hidden relative group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-green-50 rounded-full -mr-16 -mt-16 transition-transform duration-700 group-hover:scale-110" />
              <div className="mb-8 md:mb-10 px-2 relative">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-14 h-14 md:w-16 md:h-16 bg-green-500 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-green-100">
                    <User className="w-7 h-7 md:w-8 md:h-8" strokeWidth={2.5} />
                  </div>
                  <Link
                    href="/"
                    className="w-10 h-10 md:w-12 md:h-12 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center hover:bg-slate-900 hover:text-white transition-all"
                  >
                    <Home size={18} />
                  </Link>
                </div>
                <p className="text-[11px] md:text-xs font-bold text-slate-400 mb-1">
                  반갑습니다,
                </p>
                <h3 className="text-xl md:text-2xl font-black text-slate-800 tracking-tighter">
                  {info.nickname || "사용자"}님
                </h3>
              </div>
              <div className="space-y-1 relative">
                <TabBtn
                  id="info"
                  label="내 정보 관리"
                  icon={<User size={18} />}
                  active={activeTab}
                  onClick={setActiveTab}
                />
                <TabBtn
                  id="history"
                  label="활동 타임라인"
                  icon={<History size={18} />}
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

          {/* 메인 영역 */}
          <div className="flex-1 bg-white rounded-[2.5rem] md:rounded-[3.5rem] shadow-sm border border-slate-50 p-5 md:p-14 min-h-[500px] flex flex-col relative">
            <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-green-50/30 rounded-full blur-[80px] -mr-20 -mt-20 pointer-events-none" />
            <div className="relative h-full flex flex-col">
              <div className="flex justify-between items-center mb-8 md:mb-14">
                <h2 className="text-xl md:text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
                  <div className="w-1.5 h-6 md:h-10 bg-green-500 rounded-full" />
                  {activeTab === "info"
                    ? "Settings"
                    : activeTab === "history"
                    ? "Activity Timeline"
                    : activeTab === "favorites"
                    ? "Favorites"
                    : "My Posts"}
                </h2>
              </div>

              {activeTab === "info" ? (
                // 1. 정보 관리
                <div className="flex flex-col xl:flex-row items-start gap-10 xl:gap-16 animate-in fade-in slide-in-from-bottom-8 duration-1000">
                  <div className="w-full xl:max-w-md space-y-6 md:space-y-10">
                    <div className="space-y-6">
                      <Input label="Login ID" value={info.loginId} disabled />
                      <Input
                        label="Nickname"
                        value={tempNickname}
                        onChange={(e) => setTempNickname(e.target.value)}
                      />
                      <Input
                        label="Email Address"
                        value={tempEmail}
                        onChange={(e) => setTempEmail(e.target.value)}
                      />
                    </div>

                    <div className="pt-4">
                      <button
                        onClick={handleUpdateInfo}
                        className="w-full bg-slate-900 text-white font-black py-5 rounded-3xl hover:bg-green-600 transition-all flex items-center justify-center gap-3 group shadow-xl shadow-slate-200"
                      >
                        변경사항 저장하기
                        <ArrowRight
                          size={18}
                          className="group-hover:translate-x-1 transition-transform"
                        />
                      </button>
                    </div>
                  </div>

                  {/* 🔹 Swiper 배너 */}
                  <div className="w-full xl:w-80 flex flex-col gap-6">
                    <div className="w-full rounded-[2.5rem] overflow-hidden shadow-2xl shadow-slate-100 border border-slate-50 relative">
                      <Swiper
                        modules={[Autoplay, Pagination]}
                        spaceBetween={0}
                        slidesPerView={1}
                        autoplay={{ delay: 4500 }}
                        pagination={{ clickable: true }}
                        className="mySwiper h-[280px] md:h-[340px]"
                      >
                        {/* Slide 1 */}
                        <SwiperSlide>
                          <Link
                            href="/community/recommend"
                            className="block h-full"
                          >
                            <div className="bg-green-50 h-full p-6 md:p-8 flex flex-col justify-between">
                              <div>
                                <p className="text-[10px] font-black text-green-700 uppercase mb-4 flex items-center gap-2">
                                  <MapPin size={12} /> Local Hotplace
                                </p>
                                <h4 className="text-lg md:text-xl font-black text-slate-800 leading-tight mb-2">
                                  우리 동네 <br /> 숨은 맛집{" "}
                                  <span className="text-green-600 italic">
                                    찾기!
                                  </span>
                                </h4>
                                <p className="text-[11px] text-slate-500">
                                  이웃들이 검증한 진짜 맛집 후기.
                                </p>
                              </div>
                              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-green-500 self-end">
                                <UtensilsCrossed size={18} />
                              </div>
                            </div>
                          </Link>
                        </SwiperSlide>
                        {/* Slide 2 */}
                        <SwiperSlide>
                          <Link href="/news" className="block h-full">
                            <div className="bg-slate-900 h-full p-6 md:p-8 flex flex-col justify-between text-white">
                              <div>
                                <p className="text-[10px] font-bold opacity-40 uppercase tracking-widest mb-4 flex items-center gap-2">
                                  <Newspaper size={12} /> News
                                </p>
                                <h4 className="text-lg md:text-xl font-black leading-tight mb-2">
                                  가장 빠른 <br /> 우리 지역{" "}
                                  <span className="text-green-400 italic">
                                    뉴스
                                  </span>
                                </h4>
                                <p className="text-[11px] opacity-50">
                                  생활 정보부터 공공 소식까지.
                                </p>
                              </div>
                              <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-green-400 self-end">
                                <Sparkles size={18} />
                              </div>
                            </div>
                          </Link>
                        </SwiperSlide>
                        {/* Slide 3 */}
                        <SwiperSlide>
                          <Link href="/community/free" className="block h-full">
                            <div className="bg-orange-50 h-full p-6 md:p-8 flex flex-col justify-between">
                              <div>
                                <p className="text-[10px] font-black text-orange-700 uppercase mb-4 flex items-center gap-2">
                                  <Star size={12} /> Community
                                </p>
                                <h4 className="text-lg md:text-xl font-black text-slate-800 leading-tight mb-2">
                                  이웃과 함께하는 <br /> 따뜻한{" "}
                                  <span className="text-orange-500 italic">
                                    공간
                                  </span>
                                </h4>
                                <p className="text-[11px] text-slate-500">
                                  지금 바로 소통을 시작해보세요.
                                </p>
                              </div>
                              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-orange-500 self-end">
                                <MessageSquare size={18} />
                              </div>
                            </div>
                          </Link>
                        </SwiperSlide>
                      </Swiper>
                    </div>
                  </div>
                </div>
              ) : activeTab === "history" ? (
                // 2. 활동 타임라인 (썸네일 포함)
                <div className="flex-1 animate-in fade-in duration-500">
                  {isActivityLoading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-3">
                      <div className="w-10 h-10 border-4 border-green-100 border-t-green-500 rounded-full animate-spin"></div>
                      <p className="text-slate-400 text-sm font-bold">
                        활동 내역 불러오는 중...
                      </p>
                    </div>
                  ) : activities.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 text-center border-2 border-dashed border-slate-100 rounded-[2.5rem]">
                      <div className="text-5xl mb-4 grayscale opacity-30">
                        📂
                      </div>
                      <p className="font-black text-lg text-slate-400">
                        아직 활동 내역이 없습니다.
                      </p>
                      <p className="text-slate-300 text-sm mt-1">
                        커뮤니티 활동을 시작해보세요!
                      </p>
                    </div>
                  ) : (
                    <div className="pl-4 border-l-2 border-slate-50 space-y-8 relative">
                      {activities.map((item) => {
                        const iconColor =
                          item.type === "POST"
                            ? "bg-blue-100 text-blue-600"
                            : item.type === "COMMENT"
                            ? "bg-orange-100 text-orange-600"
                            : "bg-red-100 text-red-500";
                        const Icon =
                          item.type === "POST"
                            ? FileText
                            : item.type === "COMMENT"
                            ? MessageSquare
                            : Heart;

                        return (
                          <div key={item.id} className="relative group">
                            <div
                              className={`absolute -left-[25px] top-0 w-8 h-8 rounded-full flex items-center justify-center border-4 border-white shadow-sm ${iconColor}`}
                            >
                              <Icon size={14} />
                            </div>

                            <Link
                              href={item.link}
                              className="block bg-slate-50/50 hover:bg-white p-5 rounded-3xl hover:shadow-md hover:border-green-100 border border-transparent transition-all"
                            >
                              <div className="flex gap-4">
                                <div className="flex-1 min-w-0">
                                  <div className="flex justify-between items-start mb-2">
                                    <span
                                      className={`text-[10px] font-black px-2 py-0.5 rounded-md ${iconColor.replace(
                                        "100",
                                        "50"
                                      )}`}
                                    >
                                      {item.type}
                                    </span>
                                    <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
                                      <Clock size={12} />{" "}
                                      {new Date(item.date).toLocaleDateString()}
                                    </span>
                                  </div>
                                  <h4 className="font-bold text-slate-800 mb-1 line-clamp-1">
                                    {item.title}
                                  </h4>
                                  {item.description && (
                                    <p className="text-xs text-slate-500 line-clamp-2">
                                      {truncateText(item.description)}
                                    </p>
                                  )}
                                </div>

                                {item.thumbnail && (
                                  <div className="w-16 h-16 md:w-20 md:h-20 shrink-0 rounded-2xl overflow-hidden border border-slate-100">
                                    <img
                                      src={item.thumbnail}
                                      alt="thumbnail"
                                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                      onError={(e) =>
                                        (e.currentTarget.style.display = "none")
                                      }
                                    />
                                  </div>
                                )}
                              </div>
                            </Link>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              ) : (
                // 3. 기존 리스트형 탭 (작성한 글/댓글/즐겨찾기)
                <div className="flex-1 flex flex-col animate-in fade-in duration-500">
                  {listData.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-300 py-20 text-center">
                      <p className="font-black text-lg text-slate-400">
                        내역이 없습니다.
                      </p>
                    </div>
                  ) : (
                    <div className="grid gap-4">
                      {listData.map((item: any) => {
                        const category = (
                          item.category || "free"
                        ).toLowerCase();
                        const postId = item.POST_ID || item.id;
                        const detailPath =
                          activeTab === "favorites" && item.menu
                            ? `/restaurant/${item.id}`
                            : activeTab === "favorites"
                            ? `/tour/attraction`
                            : `/community/${category}/${postId}`;

                        const rawText =
                          activeTab === "posts"
                            ? item.title
                            : item.content || item.name;

                        return (
                          <Link
                            key={item.id}
                            href={detailPath}
                            className="block group"
                          >
                            <div className="p-4 md:p-7 bg-slate-50/50 rounded-[1.8rem] md:rounded-[2.5rem] border border-transparent hover:border-green-200 hover:bg-white transition-all">
                              <div className="flex justify-between items-center gap-2">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-2">
                                    <span className="text-[8px] md:text-[10px] font-black uppercase text-green-700 bg-green-100 px-2 py-0.5 rounded-md shrink-0">
                                      {activeTab === "posts"
                                        ? "POST"
                                        : activeTab === "comments"
                                        ? "COMMENT"
                                        : "FAVORITE"}
                                    </span>
                                  </div>
                                  <h3 className="text-sm md:text-xl font-black text-slate-800 group-hover:text-green-600 transition-colors">
                                    {truncateText(rawText)}
                                  </h3>
                                </div>
                                <ArrowRight
                                  size={16}
                                  className="text-slate-200 group-hover:text-green-500 shrink-0"
                                />
                              </div>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const TabBtn = ({ id, label, icon, active, onClick }: any) => (
  <button
    onClick={() => onClick(id)}
    className={`w-full flex items-center gap-3 md:gap-4 p-4 md:p-5 rounded-[1.2rem] md:rounded-3xl font-black transition-all mb-1 md:mb-2 ${
      active === id
        ? "bg-green-500 text-white shadow-lg"
        : "text-slate-400 hover:bg-slate-50"
    }`}
  >
    <span className={active === id ? "scale-110" : ""}>{icon}</span>
    <span className="text-[11px] md:text-[13px] tracking-tight">{label}</span>
  </button>
);
