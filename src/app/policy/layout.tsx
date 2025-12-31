import DefaultLayout from "@/components/layouts/DefaultLayout";
import Link from "next/link";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <DefaultLayout>
      <div className="w-full bg-[#f8f9fa] min-h-screen py-16 md:py-24 px-6">
        <div className="max-w-4xl mx-auto bg-white border border-slate-100 p-8 md:p-16 rounded-[2.5rem] shadow-sm">
          {children}
        </div>

        <div className="max-w-4xl mx-auto mt-10 text-center">
          <Link
            href="/"
            className="text-slate-400 hover:text-green-600 font-bold text-sm transition-colors"
          >
            © 다잇슈 대전 — 메인으로 돌아가기
          </Link>
        </div>
      </div>
    </DefaultLayout>
  );
}
