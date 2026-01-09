// 1. "use client": 이 컴포넌트는 브라우저에서 실행됩니다.
"use client";

// --- [라이브러리 및 훅 임포트] ---
import { useState, useRef, useEffect } from "react";
import api from "@/api/axios";
import {
  SendHorizontal,
  X,
  MessageCircleMore,
  Bot,
  Sparkles,
  MapPin,
} from "lucide-react"; // 아이콘 추가
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Link from "next/link";

// --- [타이핑 효과 컴포넌트] ---
// AI 답변이 타닥타닥 찍히는 듯한 연출을 위한 컴포넌트입니다.
const TypingEffect = ({
  text,
  onComplete,
}: {
  text: string;
  onComplete: () => void;
}) => {
  const [displayedText, setDisplayedText] = useState("");

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      if (i < text.length) {
        setDisplayedText((prev) => prev + text.charAt(i));
        i++;
      } else {
        clearInterval(interval);
        onComplete(); // 타이핑 완료 시 콜백
      }
    }, 15); // 속도 조절 (작을수록 빠름)
    return () => clearInterval(interval);
  }, [text]);

  // 타이핑 중에도 마크다운 렌더링 적용
  return (
    <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
      {displayedText}
    </ReactMarkdown>
  );
};

// --- [마크다운 스타일 정의] ---
// 재사용을 위해 컴포넌트 객체를 밖으로 뺐습니다.
const markdownComponents: any = {
  // 1. 링크(장소 추천)를 버튼처럼 예쁘게 꾸미기
  a: ({ node, ...props }: any) => (
    <Link
      href={props.href || "#"}
      className="inline-flex items-center gap-1 bg-green-50 text-green-700 hover:bg-green-100 border border-green-200 px-2 py-0.5 rounded-md text-xs font-bold transition-colors mx-1 no-underline transform hover:scale-105"
      target={props.href?.startsWith("http") ? "_blank" : "_self"}
    >
      <MapPin size={10} />
      {props.children}
    </Link>
  ),
  ul: ({ node, ...props }: any) => (
    <ul className="list-none pl-1 my-2 space-y-2" {...props} />
  ),
  ol: ({ node, ...props }: any) => (
    <ol className="list-decimal pl-4 my-2 space-y-2 text-gray-700" {...props} />
  ),
  li: ({ node, ...props }: any) => <li className="pl-1" {...props} />,
  strong: ({ node, ...props }: any) => (
    <strong
      className="font-extrabold text-green-800 bg-green-50/50 px-1 rounded"
      {...props}
    />
  ),
  p: ({ node, ...props }: any) => (
    <p className="mb-2 last:mb-0 leading-relaxed" {...props} />
  ),
  hr: ({ node, ...props }: any) => (
    <hr className="my-3 border-gray-200 border-dashed" {...props} />
  ),
};

export default function ChatBot() {
  // --- [상태 관리] ---
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "ai",
      text: "반가워요! 대전 여행 전문가 '다잇슈' 봇입니다. 🍯\n어떤 여행을 계획 중이신가요? 맛집, 명소, 데이트 코스 등 무엇이든 물어보세요!",
      isTyping: false, // 이미 완료된 메시지
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // 자동 스크롤용 Ref
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // --- [추천 질문 리스트 (Chips)] ---
  // 사용자가 뭘 물어볼지 모를 때 클릭 유도
  const suggestedPrompts = [
    {
      label: "❤️ 데이트 코스 추천",
      query: "주말에 연인과 가기 좋은 대전 데이트 코스 짜줘",
    },
    {
      label: "👨‍👩‍👧‍👦 아이와 함께",
      query: "아이들과 가볼 만한 대전 가족 여행지 추천해줘",
    },
    {
      label: "🍞 빵지순례",
      query: "성심당 말고 다른 맛있는 빵집이나 디저트 카페 알려줘",
    },
    {
      label: "🌧 비 오는 날",
      query: "비 오는 날 실내에서 놀기 좋은 곳 추천해줘",
    },
  ];

  const scrollToBottom = () =>
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });

  useEffect(() => scrollToBottom(), [messages, isOpen, isLoading]);

  // --- [메시지 전송 함수] ---
  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    // 1. 사용자 메시지 추가
    setMessages((prev) => [
      ...prev,
      { role: "user", text: text, isTyping: false },
    ]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await api.post("/chatbot/chat", { message: text });

      // 2. AI 메시지 추가 (isTyping: true로 시작)
      setMessages((prev) => [
        ...prev,
        { role: "ai", text: res.data.response, isTyping: true }, // 타이핑 효과 시작
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          text: "죄송해요, 잠시 연결 상태가 좋지 않아요. 😥 잠시 후 다시 시도해주세요.",
          isTyping: false,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  // 타이핑 완료 핸들러
  const handleTypingComplete = (index: number) => {
    setMessages((prev) =>
      prev.map((msg, i) => (i === index ? { ...msg, isTyping: false } : msg))
    );
  };

  return (
    <>
      {/* 1. 플로팅 버튼 */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`cursor-pointer fixed bottom-6 right-6 z-50 bg-green-600 hover:bg-green-700 text-white p-4 rounded-2xl transition-all duration-300 hover:scale-110 active:scale-95 flex items-center justify-center
        ${
          isOpen
            ? "shadow-none rotate-90"
            : "shadow-[0_8px_30px_rgb(22,163,74,0.4)]"
        }`}
      >
        {isOpen ? (
          <X className="w-7 h-7" />
        ) : (
          <MessageCircleMore className="w-8 h-8" />
        )}
      </button>

      {/* 2. 채팅창 본문 */}
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
            className="fixed bottom-24 right-6 z-50 w-[calc(100vw-2rem)] sm:w-[380px] h-[600px] bg-white border border-gray-100 rounded-[2rem] flex flex-col overflow-hidden shadow-2xl font-pretendard"
          >
            {/* (1) 헤더 */}
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-5 text-white shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/30">
                  <Sparkles className="w-5 h-5 text-yellow-300 fill-yellow-300" />
                </div>
                <div>
                  <h3 className="font-bold text-base">방방곡곡 AI 가이드</h3>
                  <div className="flex items-center gap-1.5 opacity-90">
                    <span className="w-1.5 h-1.5 bg-green-300 rounded-full animate-pulse" />
                    <span className="text-[11px] font-medium">
                      대전 여행 코스 설계 중...
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* (2) 메시지 영역 */}
            <div className="flex-1 overflow-y-auto p-4 space-y-5 bg-slate-50 custom-scrollbar">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex items-end gap-2.5 ${
                    msg.role === "user" ? "flex-row-reverse" : "flex-row"
                  }`}
                >
                  {/* AI 프로필 */}
                  {msg.role === "ai" && (
                    <div className="w-8 h-8 rounded-full bg-white border border-gray-100 flex items-center justify-center shrink-0 shadow-sm mb-1 overflow-hidden">
                      <Bot className="w-5 h-5 text-green-600" />
                    </div>
                  )}

                  {/* 말풍선 */}
                  <div
                    className={`max-w-[85%] p-3.5 px-4 rounded-2xl text-[13px] leading-relaxed shadow-sm relative ${
                      msg.role === "user"
                        ? "bg-green-600 text-white rounded-br-none"
                        : "bg-white text-gray-800 border border-gray-100 rounded-tl-none"
                    }`}
                  >
                    {msg.role === "ai" && msg.isTyping ? (
                      // 타이핑 효과 중일 때
                      <TypingEffect
                        text={msg.text}
                        onComplete={() => handleTypingComplete(idx)}
                      />
                    ) : // 일반 렌더링 (Markdown)
                    msg.role === "ai" ? (
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={markdownComponents}
                      >
                        {msg.text}
                      </ReactMarkdown>
                    ) : (
                      msg.text
                    )}
                  </div>
                </div>
              ))}

              {/* 로딩 표시 */}
              {isLoading && (
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-white border border-gray-100 flex items-center justify-center shadow-sm">
                    <Bot className="w-5 h-5 text-green-600 animate-pulse" />
                  </div>
                  <div className="bg-white border border-gray-100 p-3 rounded-2xl rounded-tl-none flex gap-1 items-center shadow-sm">
                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-bounce" />
                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-bounce [animation-delay:0.1s]" />
                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* (3) 추천 질문 칩 (Quick Prompts) - 스크롤 가능하게 */}
            <div className="bg-white border-t border-gray-50 px-4 py-3 shrink-0">
              <p className="text-[10px] text-gray-400 mb-2 font-bold ml-1">
                💡 이런 질문은 어떠세요?
              </p>
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                {suggestedPrompts.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => sendMessage(item.query)}
                    className="whitespace-nowrap px-3 py-1.5 bg-green-50 text-green-700 border border-green-100 rounded-full text-[11px] font-bold hover:bg-green-100 transition-colors active:scale-95"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* (4) 입력 폼 */}
            <form
              onSubmit={handleSend}
              className="p-3 bg-white border-t border-gray-100 flex items-center gap-2"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="궁금한 코스를 물어보세요..."
                className="flex-1 bg-gray-50 text-gray-900 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:bg-white transition-all border border-transparent focus:border-green-200"
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="bg-green-600 text-white p-3 rounded-xl hover:bg-green-700 disabled:bg-gray-200 disabled:cursor-not-allowed transition-all shadow-md active:scale-95 flex items-center justify-center"
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
