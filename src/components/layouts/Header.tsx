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
import Cookies from "js-cookie"; // [추가] 쿠키 라이브러리

export default function Header() {
  const [openMobileMenu, setOpenMobileMenu] = useState(false);
  const router = useRouter();

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // 1. 로그인 상태 확인 로직 수정 (쿠키 방식)
  useEffect(() => {
    const checkAuth = async () => {
      // 쿠키에서 토큰 확인
      const token = Cookies.get("token");

      if (!token) {
        setIsLoggedIn(false);
        setIsLoading(false);
        return;
      }

      try {
        // 토큰이 있다면 서버에 유효성 검사 요청
        const res = await api.get("/mypage/info");
        if (res.status === 200) {
          setIsLoggedIn(true);
        }
      } catch (err) {
        console.error("인증 확인 실패:", err);
        // 토큰이 유효하지 않으면 쿠키 삭제
        Cookies.remove("token", { path: "/" });
        setIsLoggedIn(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  // 2. 로그아웃 처리 수정 (쿠키 삭제 방식)
  const handleLogout = async () => {
    if (!confirm("로그아웃 하시겠습니까?")) return;

    try {
      // 서버 로그아웃 호출 (필요한 경우만)
      await api.post("/user/logout").catch(() => {});

      // 핵심: 쿠키 삭제 (path 설정 중요)
      Cookies.remove("token", { path: "/" });

      setIsLoggedIn(false);
      alert("로그아웃 되었습니다.");

      // 상태 완전 초기화를 위해 새로고침 이동
      window.location.href = "/";
    } catch (error) {
      Cookies.remove("token", { path: "/" });
      window.location.href = "/";
    }
  };

  const pages = menuData.pages;

  const renderAuthButtons = (isMobile: boolean) => {
    // 로딩 중에는 UI 점프 방지
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
            onClick={handleLogout}
            className="text-sm font-medium text-gray-700 hover:text-gray-400 transition-colors cursor-pointer border-none bg-transparent p-0"
          >
            로그아웃
          </button>
        </div>
      );
    }

    return (
      <div className="flex items-center space-x-3">
        <Link
          href="/sign-in" // /sign-in에서 /login으로 변경 권장
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
                <span className="text-2xl lg:text-3xl font-black text-gray-900 tracking-tighter">
                  다잇슈{" "}
                  <span className="text-transparent bg-clip-text bg-linear-to-r from-green-600 to-green-400">
                    대전
                  </span>
                </span>
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
