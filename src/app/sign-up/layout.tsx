import PlainLayout from "@/components/layouts/PlainLayout";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "NextShop | Sign-Up",
};

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <PlainLayout>{children}</PlainLayout>;
}
