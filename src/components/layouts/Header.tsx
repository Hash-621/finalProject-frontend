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
  TabGroup,
  TabPanel,
  TabPanels,
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
        className="relative z-40 lg:hidden"
      >
        <DialogBackdrop
          transition
          className="fixed inset-0 bg-black/25 transition-opacity duration-300 ease-linear data-closed:opacity-0"
        />
        <div className="fixed inset-0 z-40 flex">
          <DialogPanel
            transition
            className="relative flex w-full max-w-xs transform flex-col overflow-y-auto bg-white pb-12 shadow-xl transition duration-300 ease-in-out data-closed:-translate-x-full"
          >
            <div className="flex h-14 px-2 justify-between">
              <div className="items-center flex">
                <div className="flex flex-1 items-center justify-end space-x-3 mr-1">
                  <Link
                    href="/sign-in"
                    className="text-sm font-medium text-gray-700"
                  >
                    로그인
                  </Link>
                  <span aria-hidden="true" className="h-4 w-px bg-gray-200" />
                  <Link
                    href="/sign-up"
                    className="text-sm font-medium text-gray-700"
                  >
                    회원가입
                  </Link>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setOpenMobileMenu(false)}
                className="relative -m-2 inline-flex items-center justify-center rounded-md p-2 text-gray-400"
              >
                <span className="sr-only">Close menu</span>
                <XMarkIcon aria-hidden="true" className="size-6" />
              </button>
            </div>

            <SearchBar
              idPrefix="sidebar"
              className="h-14 border-t border-gray-200 bg-gray-100 text-sm"
              inputClassName=""
              buttonClassName=""
              iconClassName="w-5"
            />

            {pages.map((page) => (
              <Fragment key={page.name}>
                {page.children && page.children.length > 0 ? (
                  <TabGroup>
                    <TabPanels as={Fragment}>
                      <TabPanel className="space-y-10 px-4 pt-6 pb-8 border-t border-gray-200">
                        <div>
                          <p className="font-medium text-gray-900">
                            {page.name}
                          </p>
                          <ul
                            role="list"
                            className="mt-6 flex flex-col space-y-6"
                          >
                            {page.children.map((child) => (
                              <li key={child.name} className="flow-root">
                                <Link
                                  href={child.href}
                                  onClick={() => setOpenMobileMenu(false)}
                                  className="-m-2 block p-2 text-gray-500"
                                >
                                  {child.name}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </TabPanel>
                    </TabPanels>
                  </TabGroup>
                ) : (
                  <div className="space-y-6 border-t border-gray-200 px-4 py-6">
                    <div className="flow-root">
                      <Link
                        href={page.href}
                        onClick={() => setOpenMobileMenu(false)}
                        className="-m-2 block p-2 font-medium text-gray-900"
                      >
                        {page.name}
                      </Link>
                    </div>
                  </div>
                )}
              </Fragment>
            ))}
          </DialogPanel>
        </div>
      </Dialog>
      <header>
        <nav aria-label="Top">
          <div className="w-full lg:max-w-7xl mx-auto px-0 lg:px-5">
            <div className="flex h-14 lg:h-20 items-center flex-row-reverse justify-between lg:flex-row lg:justify-center">
              <button
                type="button"
                onClick={() => setOpenMobileMenu(true)}
                className="relative rounded-md bg-white p-2 text-gray-400 lg:hidden"
              >
                <span className="absolute -inset-0.5" />
                <span className="sr-only">Open menu</span>
                <Bars3Icon aria-hidden="true" className="size-6" />
              </button>
              <div className="ml-2 flex lg:ml-0">
                <Link href={"/"}>
                  <span className="sr-only">Your Company</span>
                  <img
                    alt=""
                    src="/images/logo.svg"
                    className="h-9 lg:h-16 w-auto"
                  />
                </Link>
              </div>
              <PopoverGroup className="hidden lg:ml-8 lg:block lg:self-stretch">
                <div className="flex w-full justify-center">
                  <div className="flex">
                    {pages.map((page) => (
                      <Popover key={page.name} className="relative">
                        {!page.children ? (
                          <PopoverButton className="focus:outline-none">
                            <Link
                              href={page.href}
                              className="flex items-center text-lg/20 font-medium px-5  text-gray-700 hover:text-gray-400 transition-colors duration-200"
                            >
                              {page.name}
                            </Link>
                          </PopoverButton>
                        ) : (
                          <PopoverButton className="flex cursor-pointer items-center text-lg/20 px-5  font-medium text-gray-700 hover:text-gray-400 focus:outline-none transition-colors duration-200">
                            {page.name}
                          </PopoverButton>
                        )}

                        {page.children ? (
                          <PopoverPanel
                            transition
                            anchor="bottom"
                            className="absolute left-0 mt-2 w-40 rounded-xl bg-white shadow-lg ring-1 ring-black/5 text-base 
                      transition duration-200 ease-in-out data-closed:opacity-0 z-50"
                          >
                            <div className="p-2">
                              {page.children.map((sub) => (
                                <Link
                                  key={sub.name}
                                  href={sub.href}
                                  className="block rounded-lg px-3 py-2 text-gray-800 hover:bg-gray-100"
                                >
                                  {sub.name}
                                </Link>
                              ))}
                            </div>
                          </PopoverPanel>
                        ) : null}
                      </Popover>
                    ))}
                  </div>
                </div>
              </PopoverGroup>
              <div className="ml-auto items-center hidden lg:flex">
                <div className="flex flex-1 items-center justify-end space-x-3 mr-1">
                  <Link
                    href="/sign-in"
                    className="text-sm font-medium text-gray-700 hover:text-gray-400 transition-colors duration-200"
                  >
                    로그인
                  </Link>
                  <span aria-hidden="true" className="h-4 w-px bg-gray-200" />
                  <Link
                    href="/sign-up"
                    className="text-sm font-medium text-gray-700 hover:text-gray-400 transition-colors duration-200"
                  >
                    회원가입
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </nav>
      </header>
    </>
  );
}
