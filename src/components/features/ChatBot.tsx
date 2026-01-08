// 1. "use client": 이 컴포넌트는 브라우저에서 실행됩니다. (채팅 입력, 애니메이션 등)
"use client";

// --- [라이브러리 및 훅 임포트] ---
import { useState, useRef, useEffect } from "react"; // 리액트 기본 훅
import api from "@/api/axios"; // 서버 통신용 axios
// 아이콘 라이브러리 (전송, 닫기, 말풍선, 로봇 아이콘)
import { SendHorizontal, X, MessageCircleMore, Bot } from "lucide-react";
// 애니메이션 라이브러리 (채팅창이 부드럽게 뜨고 사라짐)
import { motion, AnimatePresence } from "framer-motion";
// 마크다운 렌더링 라이브러리 (AI 답변의 볼드체, 링크 등을 예쁘게 표시)
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm"; // 마크다운 표, 취소선 등 확장 기능 지원
import Link from "next/link"; // 내부 링크 이동용

// --- [메인 컴포넌트 정의] ---
export default function ChatBot() {
  // --- [상태 관리] ---
  const [isOpen, setIsOpen] = useState(false); // 채팅창 열림/닫힘 상태
  // 채팅 메시지 목록 (초기값: AI의 첫 인사말)
  const [messages, setMessages] = useState([
    {
      role: "ai", // 메시지 보낸 사람 ('ai' 또는 'user')
      text: "반가워요! 대전의 핫플을 꿰뚫고 있는 '다잇슈' 봇입니다. 🍯 대전에 대해 궁금한 게 있으신가요?",
    },
  ]);
  const [input, setInput] = useState(""); // 사용자 입력창 상태
  const [isLoading, setIsLoading] = useState(false); // AI 답변 기다리는 중인지 여부

  // 스크롤 자동 이동을 위한 ref (채팅창 맨 아래 요소)
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // --- [스크롤 자동 이동 함수] ---
  // 새 메시지가 오거나 창이 열릴 때마다 맨 아래로 스크롤을 내립니다.
  const scrollToBottom = () =>
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });

  useEffect(() => scrollToBottom(), [messages, isOpen]); // messages나 isOpen이 변할 때 실행

  // --- [메시지 전송 핸들러] ---
  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault(); // 폼 제출 시 새로고침 방지
    // 빈 내용이거나 이미 로딩 중이면 무시
    if (!input.trim() || isLoading) return;

    const userMsg = input; // 입력값 저장
    // 1. 사용자 메시지를 화면에 즉시 추가 ('user' 역할)
    setMessages((prev) => [...prev, { role: "user", text: userMsg }]);
    setInput(""); // 입력창 비우기
    setIsLoading(true); // 로딩 시작 (점 3개 애니메이션 표시용)

    try {
      // 2. 서버에 메시지 전송 (POST 요청)
      const res = await api.post("/chatbot/chat", { message: userMsg });
      // 3. 서버 응답(AI 답변)을 메시지 목록에 추가 ('ai' 역할)
      setMessages((prev) => [...prev, { role: "ai", text: res.data.response }]);
    } catch (error) {
      // 4. 에러 발생 시 안내 메시지 추가
      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          text: "잠시 연결이 원활하지 않아요. 😥 다시 한 번 말씀해 주시겠어요?",
        },
      ]);
    } finally {
      setIsLoading(false); // 로딩 종료
    }
  };

  // --- [화면 렌더링 (JSX)] ---
  return (
    <>
      {/* 1. 우측 하단 플로팅 버튼 (토글 버튼) */}
      <button
        onClick={() => setIsOpen(!isOpen)} // 클릭 시 열림/닫힘 반전
        className={`cursor-pointer fixed bottom-6 right-6 z-50 bg-green-500 hover:bg-green-600 text-white p-4 rounded-2xl transition-all duration-300 hover:scale-110 active:scale-95 flex items-center justify-center
    ${
      // 열려있으면 그림자 제거, 닫혀있으면 그림자 표시
      isOpen ? "shadow-none" : "shadow-[0_10px_30px_-5px_rgba(34,197,94,0.5)]"
    }`}
      >
        {/* 상태에 따라 아이콘 변경 (X 또는 말풍선) */}
        {isOpen ? (
          <X className="w-7 h-7" strokeWidth={2.5} />
        ) : (
          <MessageCircleMore className="w-8 h-8" strokeWidth={2} />
        )}
      </button>

      {/* 2. 채팅창 본문 (AnimatePresence로 사라질 때도 애니메이션 적용) */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            // 등장 애니메이션 설정 (아래에서 위로, 투명도 0->1)
            initial={{
              opacity: 0,
              y: 50,
              scale: 0.9,
              transformOrigin: "bottom right",
            }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            // 퇴장 애니메이션 설정
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-24 right-6 z-50 w-[calc(100vw-3rem)] sm:w-[400px] h-[650px] bg-white border border-gray-100 rounded-[2.5rem] flex flex-col overflow-hidden shadow-[0_25px_60px_-15px_rgba(0,0,0,0.15)]"
          >
            {/* (1) 채팅창 헤더 */}
            <div className="bg-linear-to-br from-green-500 to-green-600 p-6 text-white">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-inner">
                  <Bot className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-lg leading-tight">다잇슈 AI</h3>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    {/* 온라인 상태 표시 (깜빡이는 점) */}
                    <span className="w-2 h-2 bg-green-300 rounded-full animate-pulse" />
                    <span className="text-xs text-green-100 font-medium">
                      온라인 · 실시간 도움말
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* (2) 메시지 목록 영역 (스크롤 가능) */}
            <div className="flex-1 overflow-y-auto p-5 space-y-6 bg-[#F8F9FA] custom-scrollbar">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  // 내 메시지는 오른쪽(reverse), AI 메시지는 왼쪽 정렬
                  className={`flex items-end gap-2 ${
                    msg.role === "user" ? "flex-row-reverse" : "flex-row"
                  }`}
                >
                  {/* AI일 때만 프로필 아이콘 표시 */}
                  {msg.role === "ai" && (
                    <div className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center shrink-0 shadow-sm mb-1">
                      <Bot className="w-4 h-4 text-green-500" />
                    </div>
                  )}

                  {/* 말풍선 디자인 */}
                  <div
                    className={`max-w-[85%] p-3.5 px-4 rounded-2xl text-[14px] leading-relaxed shadow-sm ${
                      msg.role === "user"
                        ? "bg-green-500 text-white rounded-br-none" // 내 말풍선 (초록)
                        : "bg-white text-gray-800 border border-gray-100 rounded-bl-none" // AI 말풍선 (흰색)
                    }`}
                  >
                    {msg.role === "user" ? (
                      msg.text // 내 메시지는 그냥 텍스트 출력
                    ) : (
                      // AI 메시지는 마크다운 렌더링 (링크, 리스트 등 표현)
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          // 링크 렌더링 커스텀
                          a: ({ node, ...props }: any) => (
                            <Link
                              href={props.href || "#"}
                              className="text-blue-600 underline font-bold hover:text-blue-800 mx-1"
                              target={
                                props.href?.startsWith("http")
                                  ? "_blank"
                                  : "_self"
                              }
                            >
                              {props.children}
                            </Link>
                          ),
                          // 리스트 스타일링
                          ul: ({ node, ...props }: any) => (
                            <ul
                              className="list-disc pl-4 my-2 space-y-1"
                              {...props}
                            />
                          ),
                          ol: ({ node, ...props }: any) => (
                            <ol
                              className="list-decimal pl-4 my-2 space-y-1"
                              {...props}
                            />
                          ),
                          // 강조 텍스트 스타일링
                          strong: ({ node, ...props }: any) => (
                            <strong
                              className="font-bold text-green-700"
                              {...props}
                            />
                          ),
                          // 문단 간격 조절
                          p: ({ node, ...props }: any) => (
                            <p className="mb-1 last:mb-0" {...props} />
                          ),
                        }}
                      >
                        {msg.text}
                      </ReactMarkdown>
                    )}
                  </div>
                </div>
              ))}

              {/* (3) 로딩 인디케이터 (AI 답변 기다릴 때) */}
              {isLoading && (
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center shadow-sm">
                    <Bot className="w-4 h-4 text-green-500 animate-bounce" />
                  </div>
                  {/* 점 3개가 순차적으로 깜빡이는 애니메이션 */}
                  <div className="bg-white border border-gray-100 p-3 px-5 rounded-2xl rounded-tl-none flex gap-1.5 items-center">
                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-bounce" />
                  </div>
                </div>
              )}
              {/* 스크롤 위치 보정용 빈 div */}
              <div ref={messagesEndRef} />
            </div>

            {/* (4) 입력 폼 영역 (하단 고정) */}
            <form
              onSubmit={handleSend}
              className="p-4 bg-white border-t border-gray-50 flex items-center gap-2 mb-2"
            >
              <div className="flex-1">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="궁금한 맛집이나 여행지를 물어보세요..."
                  className="w-full bg-gray-100 text-gray-800 rounded-2xl px-5 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 transition-all border-none"
                />
              </div>
              <button
                type="submit"
                disabled={isLoading || !input.trim()} // 로딩 중이거나 빈 값이면 비활성화
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

// 1. 채팅창 열기 (Open)

// 사용자가 우측 하단의 말풍선 버튼을 클릭합니다.

// isOpen이 true가 되면서 AnimatePresence 안의 motion.div가 렌더링 됩니다.

// 채팅창이 아래에서 위로 부드럽게 올라오며 나타납니다.

// 2. 메시지 입력 및 전송 (User Action)

// 사용자가 "성심당 말고..."를 입력하고 전송 버튼을 누릅니다.

// handleSend 함수가 실행됩니다.

// 사용자가 입력한 텍스트가 즉시 messages 배열에 추가되어 화면 오른쪽(초록색 말풍선)에 나타납니다.

// 입력창은 비워지고, isLoading이 true가 되어 화면 왼쪽 하단에 점 3개가 깜빡이는 로딩 애니메이션이 표시됩니다.

// 3. 서버 통신 (Server Request)

// api.post("/chatbot/chat", ...)가 실행되어 사용자의 질문을 백엔드 서버로 보냅니다.

// 브라우저는 응답이 올 때까지 대기합니다.

// 4. 답변 수신 및 렌더링 (AI Response)

// 서버에서 답변("칼국수는 어떠세요? ...")이 도착합니다.

// messages 배열에 AI의 답변이 추가되고, isLoading은 false가 되어 로딩 애니메이션이 사라집니다.

// 화면 왼쪽에 흰색 말풍선으로 AI의 답변이 표시됩니다.

// 이때 **ReactMarkdown**이 작동하여, 답변 텍스트 중에 굵은 글씨나 [링크]가 있다면 적절한 스타일(초록색 볼드체, 파란색 링크)로 변환해 보여줍니다.

// 5. 자동 스크롤 (Auto Scroll)

// 메시지가 추가되어 화면이 길어지면, useEffect가 감지하고 messagesEndRef 위치(채팅창 맨 아래)로 스크롤을 자동으로 내립니다. 사용자는 항상 최신 메시지를 볼 수 있습니다.
