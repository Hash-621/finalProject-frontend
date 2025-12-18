"use client";

import { useState, useRef, useEffect } from "react";
import api from "@/api/axios";
import {
  PaperAirplaneIcon,
  XMarkIcon,
  ChatBubbleOvalLeftEllipsisIcon,
  UserIcon,
} from "@heroicons/react/24/outline";
import { motion, AnimatePresence } from "framer-motion";

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "ai",
      text: "반가워요! 대전의 핫플을 꿰뚫고 있는 '다잇슈' 봇입니다. 🍯 대전에 대해 궁금한 게 있으신가요?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () =>
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  useEffect(() => scrollToBottom(), [messages, isOpen]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg = input;
    setMessages((prev) => [...prev, { role: "user", text: userMsg }]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await api.post("/chatbot/chat", { message: userMsg });
      setMessages((prev) => [...prev, { role: "ai", text: res.data.response }]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          text: "잠시 연결이 원활하지 않아요. 😥 다시 한 번 말씀해 주시겠어요?",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`cursor-pointer fixed bottom-6 right-6 z-50 bg-green-500 hover:bg-green-600 text-white p-4 rounded-2xl transition-all duration-300 hover:scale-110 active:scale-95 flex items-center justify-center
    ${
      isOpen
        ? "shadow-none"
        : "shadow-[0_10px_30px_-5px_rgba(34,197,94,0.5),0_4px_10px_-2px_rgba(34,197,94,0.3)]"
    }`}
      >
        {isOpen ? (
          <XMarkIcon className="w-7 h-7" />
        ) : (
          <ChatBubbleOvalLeftEllipsisIcon className="w-8 h-8" />
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{
              opacity: 0,
              y: 50,
              scale: 0.9,
              transformOrigin: "bottom right",
            }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-24 right-6 z-50 w-[calc(100vw-3rem)] sm:w-[400px] h-[600px] bg-white border border-gray-100 rounded-[2.5rem] flex flex-col overflow-hidden shadow-[0_25px_60px_-15px_rgba(0,0,0,0.15)]"
          >
            <div className="bg-linear-to-br from-green-500 to-green-600 p-5 text-white shadow-md">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center">
                  <ChatBubbleOvalLeftEllipsisIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-lg leading-tight">다잇슈 AI</h3>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 bg-green-300 rounded-full animate-pulse" />
                    <span className="text-xs text-green-100 font-medium">
                      실시간 도우미 가동 중
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-6 bg-[#F8F9FA]">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex items-end gap-2 ${
                    msg.role === "user" ? "flex-row-reverse" : "flex-row"
                  }`}
                >
                  {msg.role === "ai" && (
                    <div className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center shrink-0 shadow-sm mb-1">
                      <span className="text-[10px] font-bold text-green-500">
                        DA
                      </span>
                    </div>
                  )}

                  <div
                    className={`max-w-[75%] p-3.5 px-4 rounded-2xl text-[14px] leading-relaxed relative ${
                      msg.role === "user"
                        ? "bg-green-500 text-white rounded-br-none shadow-md shadow-green-200"
                        : "bg-white text-gray-800 border border-gray-100 rounded-bl-none shadow-sm"
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center shadow-sm">
                    <span className="text-[10px] font-bold text-green-500 animate-pulse">
                      DA
                    </span>
                  </div>
                  <div className="bg-white border border-gray-100 p-3 px-5 rounded-2xl rounded-tl-none flex gap-1 items-center">
                    <div
                      className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce"
                      style={{ animationDelay: "0ms" }}
                    />
                    <div
                      className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce"
                      style={{ animationDelay: "200ms" }}
                    />
                    <div
                      className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce"
                      style={{ animationDelay: "400ms" }}
                    />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <form
              onSubmit={handleSend}
              className="p-4 bg-white border-t border-gray-50 flex items-center gap-2"
            >
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="무엇이든 물어보세요!"
                  className="w-full bg-gray-100 text-gray-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/50 transition-all border-none"
                />
              </div>
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="cursor-pointer bg-green-500 text-white p-3 rounded-xl hover:bg-green-600 disabled:bg-gray-200 disabled:text-gray-400 transition-all duration-200 shadow-sm"
              >
                <PaperAirplaneIcon className="w-5 h-5" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
