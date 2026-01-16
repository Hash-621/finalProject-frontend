// "use client": 이 파일이 브라우저에서 동작하는 클라이언트 컴포넌트임을 선언합니다.
// (useState, useEffect 같은 리액트 훅을 사용하기 위해 필수입니다.)
"use client";

// --- [라이브러리 및 도구 임포트] ---
import React, { useEffect, useState } from "react"; // 리액트의 핵심 기능(상태 관리, 수명 주기)을 가져옵니다.
import { useRouter, useSearchParams, usePathname } from "next/navigation"; // 페이지 이동을 위한 훅(Hook)을 가져옵니다.
import api from "@/api/axios"; // 서버와 통신하기 위해 미리 설정해둔 axios 도구를 가져옵니다.
// 화면을 꾸며줄 아이콘들을 가져옵니다.
import {
  Edit3, // 글쓰기 아이콘
  Heart, // 좋아요 하트
  MessageCircle, // 댓글 아이콘 (현재 코드에선 사용 안 됨)
  Eye, // 조회수 눈 아이콘
  Camera, // 사진 아이콘 (이미지 없을 때 사용)
  Search, // 검색 돋보기
  Loader2, // 로딩 스피너
  Sparkles, // 반짝임 효과 아이콘
} from "lucide-react";

// 페이지 번호를 표시해줄 별도의 컴포넌트를 가져옵니다.
import Pagination from "@/components/common/Pagination";


// --- [환경 설정 상수] ---
// 백엔드 서버 주소를 설정합니다.
// 환경 변수(NEXT_PUBLIC_API_URL)가 있으면 그걸 쓰고, 없으면 로컬 주소(localhost:8080)를 씁니다.
// 이미지 경로를 완성할 때 사용됩니다.
const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL;

// --- [데이터 타입 정의] ---
// 서버에서 받아올 게시글 데이터가 어떻게 생겼는지 미리 정의해둡니다. (TypeScript)
interface Post {
  id: number; // 게시글 고유 번호
  title: string; // 제목
  content: string; // 내용 (HTML 태그 포함)
  userNickname: string; // 작성자 닉네임
  viewCount: number; // 조회수
  commentCount: number; // 댓글 수
  likeCount: number; // 좋아요 수
  createdAt: string; // 작성일
  filePath?: string; // 썸네일 이미지 경로 (있을 수도 있고 없을 수도 있음)
}

// --- [메인 컴포넌트 시작] ---
export default function TourReviewList() {
  // 페이지 이동을 담당하는 도구(router)를 준비합니다.
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  // ================= [1. 상태 관리 (변수 저장소)] =================

  // 서버에서 가져온 게시글 목록을 저장할 곳입니다. 처음엔 빈 배열([])입니다.
  const [posts, setPosts] = useState<Post[]>([]);

  // 데이터 로딩 중인지 여부를 저장합니다. 처음엔 로딩 중(true)으로 시작합니다.
  const [loading, setLoading] = useState(true);

  // 검색창에 입력한 검색어를 저장합니다.
  const [searchTerm, setSearchTerm] = useState("");

  // --- 페이지네이션 관련 상태 ---
  // 현재 보고 있는 페이지 번호 (기본값 1페이지)
  const currentPage = Number(searchParams.get("page")) || 1;

  // 한 페이지에 몇 개의 글을 보여줄지 설정 (6개씩)
  const postsPerPage = 6;

  // ================= [2. 데이터 로딩 (useEffect)] =================
  // 화면이 처음 켜질 때(마운트 될 때) 딱 한 번 실행되는 함수입니다.
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        // 1. 로딩 상태를 true로 만듭니다. (로딩 스피너를 보여주기 위해)
        setLoading(true);

        // 2. 서버에 데이터를 요청합니다.
        // GET 요청을 보내며, 카테고리가 "TOUR_REVIEW"인 글만 달라고 파라미터를 같이 보냅니다.
        const response = await api.get("/community/posts", {
          params: { category: "REVIEW" },
        });

        // 3. 받아온 데이터를 안전하게 처리합니다.
        // 서버 응답이 배열 형태인지, 아니면 페이지 객체({ content: [...] }) 형태인지 확인합니다.
        // 백엔드마다 응답 구조가 다를 수 있어서 안전장치를 둔 것입니다.
        const postList = Array.isArray(response.data)
          ? response.data // 배열이면 그대로 사용
          : response.data.content || []; // 객체면 content 안의 배열을 꺼내 씀 (없으면 빈 배열)

        // 4. 가져온 데이터를 상태 변수(posts)에 저장합니다.
        setPosts(postList);
      } catch (error) {
        // 5. 에러가 나면 콘솔에 로그를 찍어줍니다.
        console.error("게시글 로딩 실패:", error);
      } finally {
        // 6. 성공하든 실패하든 로딩 상태를 false로 꺼줍니다. (화면을 보여주기 위해)
        setLoading(false);
      }
    };

    fetchPosts(); // 위에서 정의한 함수를 실행합니다.
  }, []); // 의존성 배열이 비어있으므로 컴포넌트가 처음 나타날 때 1번만 실행됩니다.

  // ================= [3. 유틸리티 (도와주는 함수들)] =================

  // (1) 이미지의 전체 URL을 만들어주는 함수
  const getImageUrl = (path: string) => {
    // 경로가 없으면 아무것도 반환하지 않습니다.
    if (!path) return null;

    // 만약 경로가 이미 'http'로 시작하는 완벽한 주소라면 건드리지 않고 그대로 씁니다.
    if (path.startsWith("http")) return path;

    // 경로에서 파일 이름만 쏙 뽑아냅니다. (슬래시나 역슬래시로 자름)
    const fileName = path.split(/[/\\]/).pop();

    // 백엔드 주소 + /images/ + 파일명 형태로 조합해서 반환합니다.
    return `${BACKEND_URL}/images/${fileName}`;
  };

  // (2) [핵심] 본문 내용(HTML)에서 이미지를 찾아내는 함수
  // 사용자가 썸네일을 따로 안 올렸을 때, 본문에 있는 첫 번째 사진을 썸네일로 쓰기 위함입니다.
  const extractImageFromContent = (htmlContent: string) => {
    // 브라우저 환경이 아니면(서버라면) 실행하지 않습니다.
    if (typeof window === "undefined") return null;

    // 가상의 HTML 태그(div)를 하나 만듭니다.
    const tempDiv = document.createElement("div");
    // 그 안에 본문 내용을 집어넣습니다.
    tempDiv.innerHTML = htmlContent;
    // 태그 안에서 첫 번째 <img> 태그를 찾습니다.
    const img = tempDiv.querySelector("img");
    // 이미지가 있으면 그 주소(src)를, 없으면 null을 반환합니다.
    return img ? img.src : null;
  };

  // (3) 본문 미리보기 텍스트 추출 함수
  // HTML 태그(<p>, <b> 등)를 다 떼어내고 순수 글자만 뽑아서 미리보기를 만듭니다.
  const getPreviewText = (html: string) => {
    if (typeof window === "undefined") return "";
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = html;
    // 텍스트만 추출합니다.
    const text = tempDiv.textContent || tempDiv.innerText || "";
    // 글자가 너무 길면 50자까지만 자르고 "..."을 붙여줍니다.
    return text.length > 50 ? text.substring(0, 50) + "..." : text;
  };

  // ================= [4. 페이지네이션 및 검색 로직] =================

  // 1. 검색어로 필터링하기
  // 게시글 전체(posts) 중에서 제목에 검색어(searchTerm)가 포함된 것만 남깁니다.
  const filteredPosts = posts.filter((post) =>
    post.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 2. 현재 페이지에 보여줄 게시글 자르기
  // 마지막 인덱스 계산 (예: 1페이지면 6, 2페이지면 12)
  const indexOfLastPost = currentPage * postsPerPage;
  // 시작 인덱스 계산 (예: 1페이지면 0, 2페이지면 6)
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  // 필터링된 목록을 페이지에 맞게 잘라냅니다.
  const currentPosts = filteredPosts.slice(indexOfFirstPost, indexOfLastPost);

  // 3. 전체 페이지 수 계산
  // (전체 글 개수 / 페이지당 개수)를 올림 처리합니다.
  const totalPages = Math.ceil(filteredPosts.length / postsPerPage);

  // 4. 페이지 변경 핸들러
  const handlePageChange = (pageNumber: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", String(pageNumber));
    router.push(`${pathname}?${params.toString()}`); // 주소창 업데이트
    window.scrollTo({ top: 400, behavior: "smooth" });
  };

  // ================= [5. 화면 렌더링 (JSX)] =================
  return (
    <div className="min-h-screen bg-slate-50">
      {/* 1. Hero Section (상단 배너 영역) */}
      <section className="relative h-[500px] w-full overflow-hidden bg-slate-900">
        {/* 배경 그라데이션 오버레이 */}
        <div className="absolute inset-0 bg-linear-to-r from-emerald-900/90 to-teal-900/80 z-10" />
        {/* 배경 이미지 */}
        <img
          src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=2021&auto=format&fit=crop"
          alt="Travel Background"
          className="absolute inset-0 w-full h-full object-cover opacity-50"
        />
        {/* 배너 텍스트 내용 */}
        <div className="relative z-20 h-full flex flex-col justify-center items-center text-center px-4">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-bold uppercase tracking-wider mb-6 backdrop-blur-sm">
            <Sparkles size={14} /> Travel Community
          </span>
          <h2 className="text-4xl md:text-6xl font-black text-white mb-6 leading-tight">
            당신의 여행은 <br className="md:hidden" />
            <span className="text-transparent bg-clip-text bg-linear-to-r from-emerald-400 to-teal-300">
              어떤 추억
            </span>
            으로 남았나요?
          </h2>
          <p className="text-slate-300 text-lg md:text-xl max-w-2xl font-medium leading-relaxed">
            소중한 여행의 순간을 기록하고 공유해보세요.
          </p>
        </div>
        {/* 하단 자연스러운 연결을 위한 그라데이션 */}
        <div className="absolute bottom-0 left-0 w-full h-24 bg-linear-to-t from-slate-50 to-transparent z-20" />
      </section>

      {/* 2. Main Content Area (실제 콘텐츠 영역) */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24 -mt-20 relative z-30">
        {/* 상단 툴바 (검색창 + 글쓰기 버튼) */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-10 bg-white/80 backdrop-blur-xl p-4 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white">
          {/* 검색창 영역 */}
          <div className="relative w-full md:w-96 group">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors"
              size={20}
            />
            <input
              type="text"
              placeholder="여행지나 키워드로 검색해보세요"
              className="w-full pl-12 pr-6 py-3.5 bg-slate-50 border-none rounded-2xl text-slate-700 outline-none focus:ring-2 focus:ring-emerald-100 transition-all font-medium"
              value={searchTerm}
              // 검색어를 입력하면 상태를 업데이트하고, 페이지를 1페이지로 초기화합니다.
              onChange={(e) => {
                setSearchTerm(e.target.value);
                router.push(pathname);
              }}
            />
          </div>

          {/* 글쓰기 버튼 (클릭 시 글쓰기 페이지로 이동) */}
          <button
            onClick={() => router.push("/community/review/write")}
            className="w-full md:w-auto flex items-center justify-center gap-2 bg-linear-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white px-8 py-3.5 rounded-2xl font-bold shadow-lg shadow-emerald-200 transition-all hover:-translate-y-1"
          >
            <Edit3 size={18} />
            <span>인증샷 올리기</span>
          </button>
        </div>

        {/* 3. 게시글 리스트 렌더링 분기 처리 */}
        {loading ? (
          // (1) 로딩 중일 때: 뱅글뱅글 도는 스피너를 보여줍니다.
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-emerald-500 w-12 h-12" />
          </div>
        ) : filteredPosts.length === 0 ? (
          // (2) 검색 결과나 글이 없을 때: "결과가 없습니다" 안내를 보여줍니다.
          <div className="text-center py-32 bg-white rounded-[3rem] border border-dashed border-slate-200">
            <Camera className="w-16 h-16 text-slate-200 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-500">
              결과가 없습니다.
            </h3>
          </div>
        ) : (
          // (3) 데이터가 있을 때: 실제 게시글 카드들을 그리드 형태로 보여줍니다.
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* 현재 페이지에 해당하는 글(currentPosts)만 map으로 반복해서 그립니다. */}
              {currentPosts.map((post) => {
                // 썸네일 결정 로직:
                // 1순위: filePath (업로드한 대표 사진)
                // 2순위: 본문에서 추출한 첫 번째 이미지
                // 3순위: null (이미지 없음)
                const thumbnailSrc = post.filePath
                  ? getImageUrl(post.filePath)
                  : extractImageFromContent(post.content);

                return (
                  // 카드 전체 컨테이너
                  <div
                    key={post.id} // 리액트 반복문 필수 키
                    onClick={() => router.push(`/community/review/${post.id}`)} // 클릭 시 상세 페이지 이동
                    className="group bg-white rounded-4xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-emerald-900/10 transition-all duration-500 cursor-pointer hover:-translate-y-2 flex flex-col h-full"
                  >
                    {/* 이미지 영역 */}
                    <div className="relative aspect-4/3 overflow-hidden bg-slate-100">
                      {thumbnailSrc ? (
                        // 썸네일이 있으면 이미지 표시
                        <img
                          src={thumbnailSrc}
                          alt={post.title}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" // 호버 시 확대 효과
                          onError={(e) => {
                            // 이미지가 깨지거나 로드 실패하면 숨깁니다.
                            e.currentTarget.style.display = "none";
                            e.currentTarget.parentElement?.classList.add(
                              "bg-slate-50"
                            );
                          }}
                        />
                      ) : (
                        // 썸네일이 없으면 카메라 아이콘 표시
                        <div className="w-full h-full flex items-center justify-center bg-slate-50 text-slate-300">
                          <Camera size={40} />
                        </div>
                      )}
                      {/* 왼쪽 상단 뱃지 */}
                      <div className="absolute top-4 left-4">
                        <span className="px-3 py-1 bg-white/90 backdrop-blur-md rounded-full text-[10px] font-black tracking-wider text-emerald-600 shadow-sm">
                          VISIT REVIEW
                        </span>
                      </div>
                    </div>

                    {/* 텍스트 정보 영역 */}
                    <div className="p-6 flex flex-col flex-1">
                      <div className="mb-4 flex-1">
                        {/* 제목 (너무 길면 ... 처리) */}
                        <h3 className="text-xl font-bold text-slate-900 mb-2 line-clamp-1 group-hover:text-emerald-600 transition-colors">
                          {post.title}
                        </h3>
                        {/* 본문 미리보기 (2줄까지만 표시) */}
                        <p className="text-slate-500 text-sm line-clamp-2 leading-relaxed">
                          {getPreviewText(post.content)}
                        </p>
                      </div>

                      {/* 하단 정보 (작성자, 조회수, 좋아요) */}
                      <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                        {/* 작성자 정보 */}
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-xs uppercase">
                            {/* 닉네임 첫 글자를 아바타처럼 표시 */}
                            {post.userNickname ? post.userNickname[0] : "U"}
                          </div>
                          <span className="text-xs font-bold text-slate-600">
                            {post.userNickname}
                          </span>
                        </div>
                        {/* 통계 정보 */}
                        <div className="flex items-center gap-3 text-slate-400 text-xs font-medium">
                          <span className="flex items-center gap-1">
                            <Eye size={14} /> {post.viewCount || 0}
                          </span>
                          <span className="flex items-center gap-1">
                            <Heart size={14} /> {post.likeCount || 0}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* 4. 페이지네이션 컴포넌트 */}
            {/* 페이지 번호 버튼들을 보여주는 외부 컴포넌트입니다. */}
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              themeColor="green"
            />
          </>
        )}
      </main>
    </div>
  );
}

// 1단계: 빈 무대와 로딩 (초기 렌더링)
// 사용자가 페이지에 접속하자마자 브라우저는 자바스크립트 코드를 읽어 내려갑니다.

// 메모리 확보: useState 훅들이 실행되면서 브라우저 메모리에 방을 만듭니다.

// posts: 아직 데이터가 없으니 빈 배열 []입니다.

// loading: 처음엔 true로 설정됩니다.

// searchTerm: 빈 문자열 ""입니다.

// 첫 화면 그리기: 브라우저는 화면을 그립니다. 그런데 loading 변수가 true입니다.

// 그래서 게시글 목록을 그려야 할 자리에 아직 데이터를 넣지 않고, **Loader2 (뱅글뱅글 도는 로딩 아이콘)**만 덩그러니 그려 넣습니다.

// 사용자 눈에는 상단 배너와 로딩 아이콘만 보입니다.

// 2단계: 서버로의 출장 (비동기 데이터 요청)
// 화면이 그려진 직후(0.1초 뒤), useEffect가 발동합니다.
// API 호출: 브라우저는 백엔드 서버(api.get)에 요청을 보냅니다. "카테고리가 'TOUR_REVIEW'인 글 목록 좀 줘."

// 대기 (Async): 요청을 보낸 후 브라우저는 서버의 답이 올 때까지 기다립니다. 이 짧은 시간 동안 사용자는 계속 로딩 아이콘을 보고 있습니다.

// 3단계: 데이터 도착과 화면 교체 (Re-rendering)
// 서버에서 응답이 도착했습니다.

// 데이터 수령 및 검사: 받아온 데이터가 배열인지, 아니면 객체(content 필드 포함)인지 확인하고 postList 변수에 정리해 넣습니다.

// 상태 업데이트: setPosts(postList)로 데이터를 메모리에 저장하고, 가장 중요한 setLoading(false)를 실행합니다. "로딩 끝났다!"라고 선언하는 것이죠.

// 화면 갱신: loading 상태가 false로 바뀌었기 때문에 React는 화면을 다시 그립니다(리렌더링).

// 아까의 로딩 아이콘은 사라집니다.

// 대신 filteredPosts 배열을 순회하며(map) 카드 모양의 HTML 코드를 생성합니다.

// 이때 썸네일 이미지가 없으면 본문 HTML을 뒤져서 첫 번째 이미지를 찾아내고, 그것도 없으면 카메라 아이콘을 박아넣습니다.

// 사용자 눈앞에 비로소 게시글 카드 목록이 짠 하고 나타납니다.

// 4단계: 실시간 검색 (클라이언트 필터링)
// 사용자가 검색창에 "제주도"라고 타이핑합니다.

// 실시간 감지: 키보드를 칠 때마다 onChange 이벤트가 발생해 setSearchTerm("제주도")가 실행됩니다.

// 자동 필터링: 상태가 바뀌었으므로 React는 또 화면을 다시 그립니다.

// 이때 posts.filter(...) 코드가 즉시 실행됩니다.

// 전체 목록 중에서 제목에 "제주도"가 없는 글들은 메모리 상에서 제외됩니다.

// 화면에는 "제주도"가 포함된 게시글 카드만 남게 됩니다. (서버에 다시 요청하는 게 아니라, 이미 받아온 것 중에서 보여줍니다.)

// 5단계: 페이지 넘기기 (페이지네이션)
// 사용자가 하단의 페이지 번호 2를 클릭합니다.

// 페이지 변경: handlePageChange(2) 함수가 실행되어 currentPage 변수가 2로 바뀝니다.

// 데이터 자르기: 다시 화면을 그릴 때 slice(6, 12)가 작동합니다. 전체 목록 중 0~5번(1페이지)은 건너뛰고, 6~11번(2페이지) 데이터만 잘라냅니다.

// 스크롤 이동: window.scrollTo가 실행되어 화면 스크롤이 자동으로 리스트의 맨 위쪽으로 부드럽게 올라갑니다.
