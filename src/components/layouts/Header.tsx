"use client";

import { Fragment, useEffect, useState } from "react";
import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  Popover,
  PopoverButton,
  PopoverGroup,
  PopoverPanel,
} from "@headlessui/react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import SearchBar from "@/components/common/SearchBar";
import { menuData } from "@/data/menuData";
import { useRouter } from "next/navigation";
import api from "@/api/axios";
import Cookies from "js-cookie";
import Image from "next/image";
import Modal from "@/components/common/Modal";

// [추가] 서버 URL 상수 (환경 변수 또는 직접 입력)
const serverURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export default function Header() {
  const [openMobileMenu, setOpenMobileMenu] = useState(false);
  const router = useRouter();

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false); // [추가] 관리자 여부 상태
  const [isLoading, setIsLoading] = useState(true);

  // --- 모달 상태 관리 ---
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
      title: title || (type === "confirm" ? "로그아웃" : "알림"),
      onConfirm,
    });
  };

  const closeModal = () => {
    setModalConfig((prev) => ({ ...prev, isOpen: false }));
  };
  // ---------------------------

  // 1. 로그인 및 권한 확인 (통합 로직)
  useEffect(() => {
    const checkAuthAndRole = async () => {
      const token = Cookies.get("token");

      if (!token) {
        setIsLoggedIn(false);
        setIsAdmin(false);
        setIsLoading(false);
        return;
      }

      try {
        // 1) 로그인 정보 확인
        const res = await api.get("/mypage/info");
        if (res.status === 200) {
          setIsLoggedIn(true);

          // 2) [추가] 관리자 여부 확인 (로그인 성공 시에만 실행)
          // 기존 제공해주신 로직 활용 (fetch 사용)
          try {
            const adminRes = await fetch(`${serverURL}/api/v1/admin/isAdmin`, {
              method: "post",
              headers: {
                "Content-Type": "application/json",
              },
              // mypage/info 응답에 loginId가 있다고 가정 (없다면 백엔드 확인 필요)
              body: JSON.stringify({ loginId: res.data.loginId }),
            });

            if (adminRes.ok) {
              const isUserAdmin = await adminRes.json();
              setIsAdmin(isUserAdmin); // true면 관리자, false면 일반 유저
            } else {
              setIsAdmin(false);
            }
          } catch (adminErr) {
            console.error("관리자 권한 확인 실패:", adminErr);
            setIsAdmin(false); // 에러 나면 안전하게 일반 유저로 처리
          }
        }
      } catch (err) {
        // 토큰 만료 등으로 로그인 정보 조회 실패 시 로그아웃 처리
        Cookies.remove("token", { path: "/" });
        setIsLoggedIn(false);
        setIsAdmin(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthAndRole();
  }, []);

  // 2. 로그아웃 수행 함수
  const performLogout = async () => {
    try {
      await api.post("/user/logout").catch(() => {});
      Cookies.remove("token", { path: "/" });
      setIsLoggedIn(false);
      setIsAdmin(false); // [추가] 로그아웃 시 관리자 권한도 해제

      openModal("로그아웃 되었습니다.", "success", "완료", () => {
        window.location.href = "/";
      });
    } catch (error) {
      Cookies.remove("token", { path: "/" });
      setIsAdmin(false);
      window.location.href = "/";
    }
  };

  const handleLogoutClick = () => {
    openModal(
      "정말 로그아웃 하시겠습니까?",
      "confirm",
      "로그아웃 확인",
      performLogout
    );
  };

  const pages = menuData.pages;

  const renderAuthButtons = (isMobile: boolean) => {
    if (isLoading) return <div className="w-20" />;

    if (isLoggedIn) {
      return (
        <div className="flex items-center space-x-3">
          {/* [추가] 관리자일 때만 보이는 버튼 */}
          {isAdmin && (
            <>
              <Link
                href="/admin" // 관리자 페이지 경로
                className="text-sm font-medium text-gray-700 hover:text-gray-400 transition-colors"
                onClick={() => isMobile && setOpenMobileMenu(false)}
              >
                관리자
              </Link>
              <span aria-hidden="true" className="h-4 w-px bg-gray-200" />
            </>
          )}

          <Link
            href="/mypage"
            className="text-sm font-bold text-green-600 hover:text-green-400 transition-colors"
            onClick={() => isMobile && setOpenMobileMenu(false)}
          >
            마이페이지
          </Link>
          <span aria-hidden="true" className="h-4 w-px bg-gray-200" />
          <button
            onClick={handleLogoutClick}
            className="text-sm font-medium text-gray-700 hover:text-gray-400 transition-colors cursor-pointer"
          >
            로그아웃
          </button>
        </div>
      );
    }

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

  return (
    <>
      <Modal
        isOpen={modalConfig.isOpen}
        onClose={closeModal}
        title={modalConfig.title}
        content={modalConfig.content}
        type={modalConfig.type}
        onConfirm={modalConfig.onConfirm}
      />

      {/* ... (Dialog 컴포넌트는 기존 코드 유지) ... */}
      <Dialog
        open={openMobileMenu}
        onClose={setOpenMobileMenu}
        className="relative z-100 lg:hidden"
      >
        {/* ... (기존 모바일 메뉴 코드) ... */}
        <DialogBackdrop
          transition
          className="fixed inset-0 bg-black/25 transition-opacity duration-300 data-closed:opacity-0"
        />
        <div className="fixed inset-0 z-100 flex w-11/12">
          <DialogPanel
            transition
            className="relative flex w-full max-w-xs transform flex-col overflow-y-auto bg-white pb-12 shadow-xl transition duration-300 data-closed:-translate-x-full"
          >
            <div className="flex h-14 px-4 items-center justify-between border-b border-gray-100">
              {renderAuthButtons(true)}
              <button
                type="button"
                onClick={() => setOpenMobileMenu(false)}
                className="text-gray-400"
              >
                <XMarkIcon aria-hidden="true" className="size-6" />
              </button>
            </div>
            {/* ... (나머지 모바일 메뉴 내용) ... */}
            <SearchBar
              idPrefix="sidebar"
              className="h-14 px-4 bg-gray-50 text-sm items-center w-full"
              inputClassName="bg-transparent"
              iconClassName="w-5"
            />

            <div className="flex-1 divide-y divide-gray-100 overflow-y-auto">
              {pages.map((page) => (
                <div key={page.name} className="px-4 py-4">
                  {page.children && page.children.length > 0 ? (
                    <>
                      <p className="font-bold text-gray-900 mb-4">
                        {page.name}
                      </p>
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
                    <Link
                      href={page.href}
                      onClick={() => setOpenMobileMenu(false)}
                      className="font-bold text-gray-900 block"
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

      <header className="fixed top-0 left-0 w-full z-50 bg-white shadow-sm border-b border-gray-100">
        <nav className="w-full lg:max-w-7xl mx-auto px-4 lg:px-5">
          <div className="flex h-14 lg:h-20 items-center justify-between">
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
                  <Popover key={page.name} className="relative">
                    {!page.children ? (
                      <Link
                        href={page.href}
                        className="flex items-center text-lg font-medium px-5 text-gray-700 hover:text-green-600 transition-colors"
                      >
                        {page.name}
                      </Link>
                    ) : (
                      <>
                        <PopoverButton className="flex cursor-pointer items-center text-lg px-5 font-medium text-gray-700 hover:text-green-600 focus:outline-none transition-colors">
                          {page.name}
                        </PopoverButton>
                        <PopoverPanel
                          transition
                          className="absolute left-1/2 -translate-x-1/2 mt-3 w-40 rounded-xl bg-white shadow-xl ring-1 ring-black/5 text-base transition duration-200 data-closed:opacity-0 z-60"
                        >
                          <div className="p-2">
                            {page.children.map((sub) => (
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
                      </>
                    )}
                  </Popover>
                ))}
              </div>
            </PopoverGroup>

            <div className="flex items-center">
              <button
                type="button"
                onClick={() => setOpenMobileMenu(true)}
                className="p-2 text-gray-500 lg:hidden hover:bg-gray-100 rounded-md"
              >
                <Bars3Icon className="size-6" />
              </button>
              <div className="hidden lg:block">{renderAuthButtons(false)}</div>
            </div>
          </div>
        </nav>
      </header>
      <div className="h-14 lg:h-20" aria-hidden="true" />
    </>
  );
}
