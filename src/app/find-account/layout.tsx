import PlainLayout from "@/components/layouts/PlainLayout";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "다잇슈 대전 | 정보 찾기",
};

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <PlainLayout>{children}</PlainLayout>;
}
