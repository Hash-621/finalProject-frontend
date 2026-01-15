// 1. "use client": 이 파일은 브라우저에서 실행되는 클라이언트 컴포넌트입니다.
// (로그인 상태 관리, 모바일 메뉴 토글, 스크롤 이벤트 등은 브라우저의 몫이니까요.)
"use client";

// --- [라이브러리 및 훅 임포트] ---
import { Fragment, useEffect, useState } from "react"; // React의 기본 훅들
import {
  Dialog, // 모바일 메뉴용 팝업 창
  DialogBackdrop, // 모바일 메뉴 배경 (어둡게 처리)
  DialogPanel, // 모바일 메뉴 본문 패널
  Popover, // PC 메뉴용 드롭다운 컨테이너
  PopoverButton, // 드롭다운을 여는 버튼
  PopoverGroup, // 여러 팝오버를 묶는 그룹
  PopoverPanel,
  Transition, // 드롭다운 내용 패널
} from "@headlessui/react"; // UI 라이브러리 (Headless UI)
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline"; // 아이콘 (햄버거, X)
import Link from "next/link"; // 페이지 이동 링크
import SearchBar from "@/components/common/SearchBar"; // 검색창 컴포넌트
import { menuData } from "@/data/menuData"; // 메뉴 데이터 (맛집, 관광 등 목록)
import { useRouter } from "next/navigation"; // 페이지 이동 훅
import api from "@/api/axios"; // API 통신 모듈
import Cookies from "js-cookie"; // 쿠키 관리 라이브러리
import Image from "next/image"; // 이미지 최적화 컴포넌트
import Modal from "@/components/common/Modal"; // 알림/확인 모달
import { MenuItem, SubMenuItem } from "@/types/menu";

// [설정] 서버 URL 상수 (환경 변수 우선 사용, 없으면 로컬)
const serverURL = process.env.NEXT_PUBLIC_API_URL ;

// pc메뉴 대메뉴에서 서브메뉴 있으면 hover시 서브메뉴 보이고, 해당 대메뉴 클릭시 서브메뉴1로 이동
function NavItem({ page }: { page: MenuItem }) {
  const [isHovered, setIsHovered] = useState(false);

  // 1. 하위 메뉴가 없는 경우: 일반 링크 반환
  if (!page.children || page.children.length === 0) {
    return (
      <Link
        href={page.href}
        className="flex items-center text-lg font-medium px-5 text-gray-700 hover:text-green-600 transition-colors"
      >
        {page.name}
      </Link>
    );
  }

  // 2. 하위 메뉴가 있는 경우: Hover로 열리고, 클릭 시 첫 번째 링크로 이동
  return (
    <Popover
      className="relative flex items-center h-full"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* 기존 PopoverButton 대신 Link 사용 
        클릭 시 첫 번째 자식(page.children[0])의 주소로 이동
      */}
      <PopoverButton>
        <Link
          href={page.children[0]?.href || "#"}
          className={`flex items-center text-lg px-5 font-medium transition-colors cursor-pointer ${
            isHovered ? "text-green-600" : "text-gray-700"
          }`}
        >
          {page.name}
        </Link>
      </PopoverButton>

      {/* Dropdown Panel */}
      <Transition
        show={isHovered}
        as={Fragment}
        enter="transition ease-out duration-200"
        enterFrom="opacity-0 translate-y-1"
        enterTo="opacity-100 translate-y-0"
        leave="transition ease-in duration-150"
        leaveFrom="opacity-100 translate-y-0"
        leaveTo="opacity-0 translate-y-1"
      >
        <PopoverPanel
          static // static: Transition이 제어하므로 항상 렌더링 상태 유지
          className="absolute left-1/2 -translate-x-1/2 top-full mt-3 w-40 rounded-xl bg-white shadow-xl ring-1 ring-black/5 text-base z-50"
        >
          <div className="p-2">
            {page.children.map((sub: any) => (
              <Link
                key={sub.name}
                href={sub.href}
                className="block rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-green-50 hover:text-green-600"
              >
                {sub.name}
              </Link>
            ))}
          </div>
        </PopoverPanel>
      </Transition>
    </Popover>
  );
}

// ==================================================================
// [Main Component] 헤더 컴포넌트 시작
// ==================================================================
export default function Header() {
  // --- [State] 상태 관리 ---
  const [openMobileMenu, setOpenMobileMenu] = useState(false); // 모바일 메뉴 열림 여부
  const router = useRouter(); // 라우터

  // 인증 관련 상태
  const [isLoggedIn, setIsLoggedIn] = useState(false); // 로그인 여부
  const [isAdmin, setIsAdmin] = useState(false); // 관리자 여부
  const [isLoading, setIsLoading] = useState(true); // 권한 확인 중인지 (로딩)

  // --- [Modal Config] 모달 상태 관리 ---
  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    title: "",
    content: "",
    type: "success" as "success" | "error" | "warning" | "confirm",
    onConfirm: undefined as (() => void) | undefined,
  });

  // 모달 열기 헬퍼 함수
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
      title: title || (type === "confirm" ? "로그아웃" : "알림"),
      onConfirm,
    });
  };

  // 모달 닫기 헬퍼 함수
  const closeModal = () => {
    setModalConfig((prev) => ({ ...prev, isOpen: false }));
  };
  // ---------------------------

  // --- [Effect] 로그인 및 권한 확인 (페이지 로드 시 1회 실행) ---
  useEffect(() => {
    const checkAuthAndRole = async () => {
      // 쿠키에서 인증 토큰을 꺼내봅니다.
      const token = Cookies.get("token");

      // 토큰이 없으면 비로그인 상태로 확정하고 종료
      if (!token) {
        setIsLoggedIn(false);
        setIsAdmin(false);
        setIsLoading(false);
        return;
      }

      try {
        // 1) [API] 내 정보 조회 요청 (토큰 유효성 검사 겸용)
        const res = await api.get("/mypage/info");

        // 정보 조회가 성공했다면 로그인 된 것으로 간주
        if (res.status === 200) {
          setIsLoggedIn(true);

          // 2) [API] 관리자 권한 확인 (별도 API 호출)
          try {
            // fetch를 사용하여 관리자 확인 API 호출 (axios instance 대신 fetch 사용 예시)
            const adminRes = await fetch(`/api/v1/admin/isAdmin`, {
              method: "post",
              headers: {
                "Content-Type": "application/json",
              },
              // 내 정보에서 loginId를 꺼내서 보냄
              body: JSON.stringify({ loginId: res.data.loginId }),
            });

            if (adminRes.ok) {
              const isUserAdmin = await adminRes.json();
              setIsAdmin(isUserAdmin); // 서버가 true라고 하면 관리자 권한 부여
            } else {
              setIsAdmin(false);
            }
          } catch (adminErr) {
            console.error("관리자 권한 확인 실패:", adminErr);
            setIsAdmin(false); // 에러 나면 안전하게 일반 유저로 처리
          }
        }
      } catch (err) {
        // 토큰이 만료되었거나 유효하지 않으면 로그아웃 처리 (청소)
        Cookies.remove("token", { path: "/" });
        setIsLoggedIn(false);
        setIsAdmin(false);
      } finally {
        setIsLoading(false); // 검사 끝났으니 로딩 상태 해제
      }
    };

    checkAuthAndRole();
  }, []); // 의존성 배열이 비어있으므로 마운트 시 한 번만 실행됨

  // --- [Function] 실제 로그아웃 수행 함수 ---
  const performLogout = async () => {
    try {
      // 서버에 로그아웃 요청 (세션 종료 등) - 실패해도 진행
      await api.post("/user/logout").catch(() => {});

      // 클라이언트 정리: 쿠키 삭제, 상태 초기화
      Cookies.remove("token", { path: "/" });
      setIsLoggedIn(false);
      setIsAdmin(false);

      // 로그아웃 성공 알림 후 메인 페이지로 이동 (새로고침 효과를 위해 window.location 사용)
      openModal("로그아웃 되었습니다.", "success", "완료", () => {
        window.location.href = "/";
      });
    } catch (error) {
      // 에러가 나도 강제 로그아웃 처리
      Cookies.remove("token", { path: "/" });
      setIsAdmin(false);
      window.location.href = "/";
    }
  };

  // --- [Handler] 로그아웃 버튼 클릭 핸들러 ---
  const handleLogoutClick = () => {
    // 바로 로그아웃 하지 않고 확인 모달을 먼저 띄움
    openModal(
      "정말 로그아웃 하시겠습니까?",
      "confirm",
      "로그아웃 확인",
      performLogout // 확인 누르면 performLogout 실행
    );
  };

  // 메뉴 데이터 가져오기
  const pages = menuData.pages;

  // --- [Helper Component] 인증 상태에 따른 버튼 렌더링 ---
  const renderAuthButtons = (isMobile: boolean) => {
    // 로딩 중이면 공간만 차지하고 아무것도 안 보여줌 (깜빡임 방지)
    if (isLoading) return <div className="w-20" />;

    // 로그인 상태일 때
    if (isLoggedIn) {
      return (
        <div className="flex items-center space-x-3">
          {/* 관리자라면 관리자 페이지 버튼 추가 */}
          {isAdmin && (
            <>
              <Link
                href="/admin"
                className="text-sm font-medium text-gray-700 hover:text-gray-400 transition-colors"
                onClick={() => isMobile && setOpenMobileMenu(false)} // 모바일이면 메뉴 닫기
              >
                관리자
              </Link>
              <span aria-hidden="true" className="h-4 w-px bg-gray-200" />
            </>
          )}

          {/* 마이페이지 버튼 */}
          <Link
            href="/mypage"
            className="text-sm font-bold text-green-600 hover:text-green-400 transition-colors"
            onClick={() => isMobile && setOpenMobileMenu(false)}
          >
            마이페이지
          </Link>
          <span aria-hidden="true" className="h-4 w-px bg-gray-200" />

          {/* 로그아웃 버튼 */}
          <button
            onClick={handleLogoutClick}
            className="text-sm font-medium text-gray-700 hover:text-gray-400 transition-colors cursor-pointer"
          >
            로그아웃
          </button>
        </div>
      );
    }

    // 비로그인 상태일 때
    return (
      <div className="flex items-center space-x-3">
        <Link
          href="/sign-in"
          className="text-sm font-medium text-gray-700 hover:text-gray-400 transition-colors"
          onClick={() => isMobile && setOpenMobileMenu(false)}
        >
          로그인
        </Link>
        <span aria-hidden="true" className="h-4 w-px bg-gray-200" />
        <Link
          href="/sign-up"
          className="text-sm font-medium text-gray-700 hover:text-gray-400 transition-colors"
          onClick={() => isMobile && setOpenMobileMenu(false)}
        >
          회원가입
        </Link>
      </div>
    );
  };

  // -----------------------------------------------------------
  // [Render] 화면 렌더링 시작
  // -----------------------------------------------------------
  return (
    <>
      {/* 전역 알림 모달 (평소엔 숨겨져 있음) */}
      <Modal
        isOpen={modalConfig.isOpen}
        onClose={closeModal}
        title={modalConfig.title}
        content={modalConfig.content}
        type={modalConfig.type}
        onConfirm={modalConfig.onConfirm}
      />

      {/* --- [Mobile Menu] 모바일용 슬라이드 메뉴 --- */}
      <Dialog
        open={openMobileMenu}
        onClose={setOpenMobileMenu}
        className="relative z-100 lg:hidden" // PC(lg)에서는 숨김
      >
        {/* 어두운 배경 (Backdrop) */}
        <DialogBackdrop
          transition
          className="fixed inset-0 bg-black/25 transition-opacity duration-300 data-closed:opacity-0"
        />

        <div className="fixed inset-0 z-100 flex w-11/12">
          {/* 메뉴 패널 (왼쪽에서 슬라이드) */}
          <DialogPanel
            transition
            className="relative flex w-full max-w-xs transform flex-col overflow-y-auto bg-white pb-12 shadow-xl transition duration-300 data-closed:-translate-x-full"
          >
            {/* 모바일 메뉴 헤더 (로그인 버튼들 + 닫기 버튼) */}
            <div className="flex h-14 px-4 items-center justify-between border-b border-gray-100">
              {renderAuthButtons(true)} {/* 모바일용 버튼 렌더링 */}
              <button
                type="button"
                onClick={() => setOpenMobileMenu(false)}
                className="text-gray-400"
              >
                <XMarkIcon aria-hidden="true" className="size-6" />
              </button>
            </div>

            {/* 모바일 메뉴 내부 검색창 */}
            <SearchBar
              idPrefix="sidebar"
              className="h-14 px-4 bg-gray-50 text-sm items-center w-full"
              inputClassName="bg-transparent"
              iconClassName="w-5"
            />

            {/* 모바일 메뉴 리스트 */}
            <div className="flex-1 divide-y divide-gray-100 overflow-y-auto">
              {pages.map((page) => (
                <div key={page.name} className="px-4 py-4">
                  {/* 하위 메뉴가 있는 경우 */}
                  {page.children && page.children.length > 0 ? (
                    <>
                      <Link
                        href={page.children[0]?.href}
                        onClick={() => setOpenMobileMenu(false)}
                        className="font-bold text-gray-900 mb-4 block hover:text-green-600 transition-colors"
                      >
                        {page.name}
                      </Link>
                      <ul className="space-y-4 ml-2">
                        {page.children.map((child) => (
                          <li key={child.name}>
                            <Link
                              href={child.href}
                              onClick={() => setOpenMobileMenu(false)}
                              className="text-gray-600 hover:text-green-600 block text-sm"
                            >
                              {child.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </>
                  ) : (
                    // 하위 메뉴가 없는 경우 (단일 링크)
                    <Link
                      href={page.href}
                      onClick={() => setOpenMobileMenu(false)}
                      className="font-bold text-gray-900 block hover:text-green-600"
                    >
                      {page.name}
                    </Link>
                  )}
                </div>
              ))}
            </div>
          </DialogPanel>
        </div>
      </Dialog>

      {/* --- [PC Header] 상단 고정바 --- */}
      <header className="fixed top-0 left-0 w-full z-50 bg-white shadow-sm border-b border-gray-100">
        <nav className="w-full lg:max-w-7xl mx-auto px-4 lg:px-5">
          <div className="flex h-14 lg:h-20 items-center justify-between">
            {/* 로고 영역 */}
            <div className="flex items-center">
              <Link
                href="/"
                className="flex items-center transition hover:opacity-80"
              >
                <Image
                  src="/images/logo.svg"
                  alt="로고"
                  width={90}
                  height={25}
                  className="object-fill md:w-[129px] md:h-9"
                />
              </Link>
            </div>

            <PopoverGroup className="hidden lg:flex lg:ml-8 items-center justify-center flex-1">
              <div className="flex space-x-2">
                {pages.map((page) => (
                  <NavItem key={page.name} page={page} />
                ))}
              </div>
            </PopoverGroup>

            {/* 우측 영역: 모바일 햄버거 버튼 + PC 로그인 버튼 */}
            <div className="flex items-center">
              {/* 모바일에서만 보이는 햄버거 버튼 */}
              <button
                type="button"
                onClick={() => setOpenMobileMenu(true)}
                className="p-2 text-gray-500 lg:hidden hover:bg-gray-100 rounded-md"
              >
                <Bars3Icon className="size-6" />
              </button>

              {/* PC에서만 보이는 로그인/회원가입 버튼 그룹 */}
              <div className="hidden lg:block">{renderAuthButtons(false)}</div>
            </div>
          </div>
        </nav>
      </header>

      {/* 헤더 높이만큼 공간 차지 (헤더가 fixed라서 본문이 가려지는 것 방지) */}
      <div className="h-14 lg:h-20" aria-hidden="true" />
    </>
  );
}

// 초기 로딩: 헤더가 렌더링 되면서 가장 먼저 "이 사람 누구지?" 확인합니다(checkAuthAndRole). 쿠키를 열어 토큰이 있는지 보고, 있다면 서버에 "이 토큰 유효해? 관리자야?"라고 물어봅니다.

// 화면 표시:

// PC: 가로로 긴 메뉴바가 뜹니다. 로고 - 메뉴들 - (관리자/마이페이지/로그아웃) 버튼이 보입니다.

// 모바일: 햄버거 버튼(☰)만 보입니다. 누르면 옆에서 메뉴 패널이 스르륵 나옵니다.

// 상태별 버튼:

// 비로그인: [로그인] [회원가입] 버튼이 보입니다.

// 일반 유저: [마이페이지] [로그아웃] 버튼이 보입니다.

// 관리자: [관리자] [마이페이지] [로그아웃] 버튼이 보입니다.

// 로그아웃:

// [로그아웃]을 누르면 바로 꺼지는 게 아니라, "정말 로그아웃 하시겠습니까?" 하고 모달창이 한 번 묻습니다. (실수 방지)

// 확인을 누르면 토큰을 삭제하고 메인 페이지로 이동합니다.
