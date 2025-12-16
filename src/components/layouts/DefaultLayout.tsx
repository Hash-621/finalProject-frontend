import Header from "@/components/layouts/Header";
import Footer from "@/components/layouts/Footer";
import ChatBot from "@/components/features/ChatBot";

export default function DefaultLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="overflow-hidden relative">
      <Header />
      <main>{children}</main>
      <ChatBot />
      <Footer />
    </div>
  );
}
