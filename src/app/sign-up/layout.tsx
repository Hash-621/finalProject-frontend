import PlainLayout from "@/components/layouts/PlainLayout";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "다잇슈대전 | Sign-Up",
};

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <PlainLayout>{children}</PlainLayout>;
}
