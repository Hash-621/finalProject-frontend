import Header from "@/components/layouts/Header";
import Footer from "@/components/layouts/Footer";
import ChatBot from "@/components/features/ChatBot";

import { ToastContainer } from "react-toastify";
import PusherProvider from "@/components/features/PusherProvider";

export default function DefaultLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="wrap overflow-hidden relative">
      <Header />
      <PusherProvider>
        <main>{children}</main>
      </PusherProvider>
      <ToastContainer
        position="bottom-right"
        autoClose={5000}
        hideProgressBar={true}
        theme="light"
        style={{ marginBottom: "80px", zIndex: 9999 }}
      />
      <ChatBot />
      <Footer />
    </div>
  );
}
