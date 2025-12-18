"use client";
import { Fragment, useState } from "react";
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

export default function Header() {
  const [openMobileMenu, setOpenMobileMenu] = useState(false);
  const pages = menuData.pages;

  return (
    <>
      <Dialog
        open={openMobileMenu}
        onClose={setOpenMobileMenu}
        className="relative z-100 lg:hidden"
      >
        <DialogBackdrop
          transition
          className="fixed inset-0 bg-black/25 transition-opacity duration-300 ease-linear data-closed:opacity-0"
        />
        {/* 고정 위치 설정 */}
        <div className="fixed inset-0 z-100 flex w-11/12">
          <DialogPanel
            transition
            className="relative flex w-full max-w-xs transform flex-col overflow-y-auto bg-white pb-12 shadow-xl transition duration-300 ease-in-out data-closed:-translate-x-full h-full"
          >
            <div className="flex h-14 px-4 items-center justify-between border-b border-gray-100">
              <div className="flex items-center space-x-3">
                <Link
                  href="/sign-in"
                  onClick={() => setOpenMobileMenu(false)}
                  className="text-sm font-medium text-gray-700"
                >
                  로그인
                </Link>
                <span aria-hidden="true" className="h-4 w-px bg-gray-200" />
                <Link
                  href="/sign-up"
                  onClick={() => setOpenMobileMenu(false)}
                  className="text-sm font-medium text-gray-700"
                >
                  회원가입
                </Link>
              </div>
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
                      <ul role="list" className="space-y-4 ml-2">
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

      {/* --- 상단 헤더 (Header Fixed) --- */}
      <header className="fixed top-0 left-0 w-full z-50 bg-white shadow-sm border-b border-gray-100">
        <nav aria-label="Top">
          <div className="w-full lg:max-w-7xl mx-auto px-4 lg:px-5">
            <div className="flex h-14 lg:h-20 items-center justify-between">
              {/* 로고 영역 */}
              <div className="flex lg:ml-0 items-center">
                <Link href={"/"}>
                  <span className="sr-only">Your Company</span>
                  <img
                    alt="Logo"
                    src="/images/logo.svg"
                    className="h-9 lg:h-14 w-auto"
                  />
                </Link>
              </div>

              {/* 데스크탑 메뉴 영역 */}
              <PopoverGroup className="hidden lg:flex lg:ml-8 lg:self-stretch items-center justify-center flex-1">
                <div className="flex space-x-2">
                  {pages.map((page) => (
                    <Popover key={page.name} className="relative">
                      {!page.children ? (
                        <Link
                          href={page.href}
                          className="flex items-center text-lg font-medium px-5 text-gray-700 hover:text-green-600 transition-colors duration-200"
                        >
                          {page.name}
                        </Link>
                      ) : (
                        <>
                          <PopoverButton className="flex cursor-pointer items-center text-lg px-5 font-medium text-gray-700 hover:text-green-600 focus:outline-none transition-colors duration-200">
                            {page.name}
                          </PopoverButton>

                          <PopoverPanel
                            transition
                            className="absolute left-1/2 -translate-x-1/2 mt-3 w-40 rounded-xl bg-white shadow-xl ring-1 ring-black/5 text-base transition duration-200 ease-in-out data-closed:opacity-0 z-60"
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

              {/* 우측 유틸리티 영역 */}
              <div className="flex items-center">
                {/* 모바일 햄버거 버튼 */}
                <button
                  type="button"
                  onClick={() => setOpenMobileMenu(true)}
                  className="relative rounded-md p-2 text-gray-500 lg:hidden hover:bg-gray-100"
                >
                  <Bars3Icon aria-hidden="true" className="size-6" />
                </button>

                {/* 데스크탑 로그인/회원가입 */}
                <div className="hidden lg:flex lg:items-center lg:space-x-4">
                  <Link
                    href="/sign-in"
                    className="text-sm font-medium text-gray-700 hover:text-green-600 transition-colors duration-200"
                  >
                    로그인
                  </Link>
                  <span aria-hidden="true" className="h-4 w-px bg-gray-200" />
                  <Link
                    href="/sign-up"
                    className="text-sm font-medium text-gray-700 hover:text-green-600 transition-colors duration-200"
                  >
                    회원가입
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </nav>
      </header>

      {/* 헤더가 fixed이므로 아래 컨텐츠가 겹치지 않도록 여백 공간 확보용 div */}
      <div className="h-14 lg:h-20" aria-hidden="true" />
    </>
  );
}
