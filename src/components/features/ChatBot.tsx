"use client";

import { useState, useRef, useEffect } from "react";
import api from "@/api/axios";
import { SendHorizontal, X, MessageCircleMore, User, Bot } from "lucide-react";
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
      {/* 플로팅 버튼 */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`cursor-pointer fixed bottom-6 right-6 z-50 bg-green-500 hover:bg-green-600 text-white p-4 rounded-2xl transition-all duration-300 hover:scale-110 active:scale-95 flex items-center justify-center
    ${
      isOpen ? "shadow-none" : "shadow-[0_10px_30px_-5px_rgba(34,197,94,0.5)]"
    }`}
      >
        {isOpen ? (
          <X className="w-7 h-7" strokeWidth={2.5} />
        ) : (
          <MessageCircleMore className="w-8 h-8" strokeWidth={2} />
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
            className="fixed bottom-24 right-6 z-50 w-[calc(100vw-3rem)] sm:w-[400px] h-[650px] bg-white border border-gray-100 rounded-[2.5rem] flex flex-col overflow-hidden shadow-[0_25px_60px_-15px_rgba(0,0,0,0.15)]"
          >
            {/* 헤더 */}
            <div className="bg-linear-to-br from-green-500 to-green-600 p-6 text-white">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-inner">
                  <Bot className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-lg leading-tight">다잇슈 AI</h3>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="w-2 h-2 bg-green-300 rounded-full animate-pulse" />
                    <span className="text-xs text-green-100 font-medium">
                      온라인 · 실시간 도움말
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* 채팅 영역 */}
            <div className="flex-1 overflow-y-auto p-5 space-y-6 bg-[#F8F9FA] custom-scrollbar">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex items-end gap-2 ${
                    msg.role === "user" ? "flex-row-reverse" : "flex-row"
                  }`}
                >
                  {msg.role === "ai" && (
                    <div className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center shrink-0 shadow-sm mb-1">
                      <Bot className="w-4 h-4 text-green-500" />
                    </div>
                  )}

                  <div
                    className={`max-w-[75%] p-3.5 px-4 rounded-2xl text-[14px] leading-relaxed shadow-sm ${
                      msg.role === "user"
                        ? "bg-green-500 text-white rounded-br-none"
                        : "bg-white text-gray-800 border border-gray-100 rounded-bl-none"
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center shadow-sm">
                    <Bot className="w-4 h-4 text-green-500 animate-bounce" />
                  </div>
                  <div className="bg-white border border-gray-100 p-3 px-5 rounded-2xl rounded-tl-none flex gap-1.5 items-center">
                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-bounce" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* 입력 영역 */}
            <form
              onSubmit={handleSend}
              className="p-4 bg-white border-t border-gray-50 flex items-center gap-2 mb-2"
            >
              <div className="flex-1">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="메시지를 입력하세요..."
                  className="w-full bg-gray-100 text-gray-800 rounded-2xl px-5 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 transition-all border-none"
                />
              </div>
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="cursor-pointer bg-green-500 text-white p-3.5 rounded-2xl hover:bg-green-600 disabled:bg-gray-200 disabled:text-gray-400 transition-all shadow-md active:scale-90"
              >
                <SendHorizontal className="w-5 h-5" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
