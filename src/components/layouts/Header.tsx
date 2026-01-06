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
// [추가] 모달 컴포넌트 임포트
import Modal from "@/components/common/Modal";

export default function Header() {
  const [openMobileMenu, setOpenMobileMenu] = useState(false);
  const router = useRouter();

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

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
      title: title || (type === "confirm" ? "로그아웃" : "알림"),
      onConfirm,
    });
  };

  const closeModal = () => {
    setModalConfig((prev) => ({ ...prev, isOpen: false }));
  };
  // ---------------------------

  // 1. 로그인 상태 확인
  useEffect(() => {
    const checkAuth = async () => {
      const token = Cookies.get("token");

      if (!token) {
        setIsLoggedIn(false);
        setIsLoading(false);
        return;
      }

      try {
        const res = await api.get("/mypage/info");
        if (res.status === 200) {
          setIsLoggedIn(true);
        }
      } catch (err) {
        Cookies.remove("token", { path: "/" });
        setIsLoggedIn(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  // 2. 로그아웃 수행 함수
  const performLogout = async () => {
    try {
      await api.post("/user/logout").catch(() => {}); // 서버 로그아웃 시도 (실패해도 진행)
      Cookies.remove("token", { path: "/" });
      setIsLoggedIn(false);

      // 로그아웃 성공 모달 -> 확인 시 메인으로 이동
      openModal("로그아웃 되었습니다.", "success", "완료", () => {
        window.location.href = "/";
      });
    } catch (error) {
      // 에러 발생 시에도 클라이언트 로그아웃은 처리
      Cookies.remove("token", { path: "/" });
      window.location.href = "/";
    }
  };

  // [수정] 로그아웃 버튼 핸들러 (모달 띄우기)
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
          <Link
            href="/mypage"
            className="text-sm font-bold text-green-600 hover:text-green-400 transition-colors"
            onClick={() => isMobile && setOpenMobileMenu(false)}
          >
            마이페이지
          </Link>
          <span aria-hidden="true" className="h-4 w-px bg-gray-200" />
          <button
            onClick={handleLogoutClick} // [수정] 모달 핸들러 연결
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
      {/* [추가] 모달 컴포넌트 렌더링 */}
      <Modal
        isOpen={modalConfig.isOpen}
        onClose={closeModal}
        title={modalConfig.title}
        content={modalConfig.content}
        type={modalConfig.type}
        onConfirm={modalConfig.onConfirm}
      />

      <Dialog
        open={openMobileMenu}
        onClose={setOpenMobileMenu}
        className="relative z-100 lg:hidden"
      >
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
