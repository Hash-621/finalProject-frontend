"use client";

import { useEffect, useState } from "react";
import Pusher from "pusher-js";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
// Lucide 아이콘으로 변경
import { Megaphone, X } from "lucide-react";

interface NotificationData {
  title: string;
  url: string;
}

export default function PusherProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [lastNotification, setLastNotification] =
    useState<NotificationData | null>(null);

  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_PUSHER_KEY;
    const cluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER;

    if (!key || !cluster) return;

    Pusher.logToConsole = true;

    const pusher = new Pusher(key, {
      cluster,
      forceTLS: true,
    });

    const channel = pusher.subscribe("my-channel");

    channel.bind("new-post", (data: NotificationData) => {
      setLastNotification(data);
      showToast(data);
    });

    return () => {
      channel.unbind_all();
      pusher.unsubscribe("my-channel");
      pusher.disconnect();
    };
  }, [router]);

  const showToast = (data: NotificationData) => {
    toast(
      ({ closeToast }) => (
        <div
          className="flex items-center gap-3 cursor-pointer group w-full relative h-14"
          onClick={() => {
            router.push(data.url || "/");
            closeToast();
          }}
        >
          {/* 아이콘 영역: MegaphoneIcon -> Megaphone */}
          <div className="bg-orange-500 text-white p-4 rounded-2xl transition-all duration-300 group-hover:scale-110 active:scale-95 flex items-center justify-center shadow-[0_10px_30px_-5px_rgba(249,115,22,0.5)]">
            <Megaphone className="w-7 h-7 text-white" strokeWidth={2.5} />
          </div>

          <div className="hidden sm:flex flex-col flex-1 min-w-0 pr-8 text-left ml-1">
            <p className="text-[10px] font-bold text-orange-600 uppercase mb-0.5 tracking-wider">
              New Notification
            </p>
            <p className="text-[14px] font-bold text-gray-800 truncate leading-tight">
              {data.title}
            </p>
          </div>

          {/* 닫기 버튼: XMarkIcon -> X */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              closeToast();
            }}
            className="hidden sm:flex absolute -top-1 -right-1 w-6 h-6 items-center justify-center text-gray-400 hover:text-gray-600 transition-all hover:scale-110"
          >
            <X className="w-4 h-4" strokeWidth={3} />
          </button>
        </div>
      ),
      {
        position: "bottom-right",
        autoClose: 5000,
        hideProgressBar: true,
        closeButton: false,
        className: "custom-toast-responsive",
        style: { background: "transparent", boxShadow: "none", padding: 0 },
      }
    );
  };

  return <>{children}</>;
}
