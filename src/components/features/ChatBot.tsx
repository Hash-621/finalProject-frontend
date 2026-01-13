// 1. "use client": Next.js에게 이 파일이 서버가 아닌 '브라우저(클라이언트)'에서 실행됨을 알립니다.
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
  Download,
  Navigation,
  Trash2, // 🔥 [추가] 휴지통 아이콘
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Link from "next/link";
import html2canvas from "html2canvas";

// ==================================================================
// [Component] 타이핑 효과
// ==================================================================
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
        onComplete();
      }
    }, 8); // 속도 살짝 더 빠르게

    return () => clearInterval(interval);
  }, [text]);

  return (
    <div className="whitespace-pre-wrap text-gray-800 text-[13.5px] leading-relaxed">
      {displayedText}
    </div>
  );
};

// ==================================================================
// [Config] 마크다운 스타일 정의 객체 (기존 코드 유지 및 보완)
// ==================================================================
const markdownComponents: any = {
  // 1. 링크(a 태그)
  a: ({ node, ...props }: any) => (
    <Link
      href={props.href || "#"}
      className="inline-flex max-w-[200px] items-center gap-1 bg-green-50 text-green-700 hover:bg-green-100 border border-green-200 px-2 py-0.5 rounded-md text-xs font-bold transition-colors mx-1 no-underline transform hover:scale-105"
      target={props.href?.startsWith("http") ? "_blank" : "_self"}
    >
      <MapPin size={10} className="shrink-0" />
      <span className="truncate">{props.children}</span>
    </Link>
  ),
  // 2. 리스트(ul, ol, li)
  ul: ({ node, ...props }: any) => (
    <ul className="list-none pl-1 my-2 space-y-2" {...props} />
  ),
  ol: ({ node, ...props }: any) => (
    <ol className="list-decimal pl-4 my-2 space-y-2 text-gray-700" {...props} />
  ),
  li: ({ node, ...props }: any) => <li className="pl-1" {...props} />,
  // 3. 강조(strong/bold)
  strong: ({ node, ...props }: any) => (
    <strong
      className="font-extrabold text-green-800 bg-green-50/50 px-1 rounded break-all"
      {...props}
    />
  ),
  // 4. 문단(p)
  p: ({ node, ...props }: any) => (
    <p
      className="mb-2 last:mb-0 leading-relaxed break-words [word-break:break-word] overflow-wrap-anywhere"
      {...props}
    />
  ),
  // 5. 구분선(hr)
  hr: ({ node, ...props }: any) => (
    <hr className="my-3 border-gray-200 border-dashed" {...props} />
  ),
  // 6. 테이블(table) - 가로 스크롤 지원
  table: ({ node, ...props }: any) => (
    <div className="w-full overflow-x-auto my-4 border border-gray-200 rounded-lg">
      <table
        className="w-full text-left text-sm text-gray-700 border-collapse min-w-[300px]"
        {...props}
      />
    </div>
  ),
  th: ({ node, ...props }: any) => (
    <th
      className="bg-gray-100 px-4 py-2 font-bold text-gray-800 border-b border-gray-200 whitespace-nowrap"
      {...props}
    />
  ),
  td: ({ node, ...props }: any) => (
    <td className="px-4 py-2 border-b border-gray-100" {...props} />
  ),
};

// ==================================================================
// [Main Component] ChatBot
// ==================================================================
export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);

  // 🔥 초기값을 빈 배열로 두고, useEffect에서 로드합니다.
  const [messages, setMessages] = useState<any[]>([]);
  const [isLoaded, setIsLoaded] = useState(false); // 로드 상태 확인

  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatAreaRef = useRef<HTMLDivElement>(null);

  const suggestedPrompts = [
    {
      label: "❤️ 데이트 코스",
      query: "연인과 가기 좋은 로맨틱한 대전 데이트 코스 추천해줘",
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

  // 🔥 [기능 1] 컴포넌트 실행 시 저장된 대화 불러오기 (Session Storage)
  useEffect(() => {
    const savedHistory = sessionStorage.getItem("chatbot_history");
    if (savedHistory) {
      setMessages(JSON.parse(savedHistory));
    } else {
      // 저장된 내용이 없으면 기본 인사말
      setMessages([
        {
          role: "ai",
          text: "안녕하세요! 대전 여행 큐레이터 '방방곡곡 AI'입니다. 🍯\n어떤 코스를 추천해 드릴까요?",
          isTyping: false,
        },
      ]);
    }
    setIsLoaded(true);
  }, []);

  // 🔥 [기능 2] 대화가 변경될 때마다 저장하기
  useEffect(() => {
    if (isLoaded) {
      sessionStorage.setItem("chatbot_history", JSON.stringify(messages));
    }
  }, [messages, isLoaded]);

  const scrollToBottom = () =>
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });

  useEffect(() => scrollToBottom(), [messages, isOpen, isLoading]);

  // 🔥 [기능 3] 대화 초기화 함수
  const clearHistory = () => {
    if (window.confirm("대화 내용을 모두 삭제하시겠습니까?")) {
      const initialMessage = [
        {
          role: "ai",
          text: "대화가 초기화되었습니다. 새로운 여행 계획을 세워볼까요? ✨",
          isTyping: false,
        },
      ];
      setMessages(initialMessage);
      sessionStorage.setItem("chatbot_history", JSON.stringify(initialMessage));
    }
  };

  const saveAsImage = async () => {
    if (!chatAreaRef.current) return;
    try {
      const canvas = await html2canvas(chatAreaRef.current, {
        useCORS: true,
        backgroundColor: "#f8fafc",
        scale: 2,
      });
      const link = document.createElement("a");
      link.href = canvas.toDataURL("image/png");
      link.download = `대전여행_코스_${Date.now()}.png`;
      link.click();
    } catch (err) {
      console.error(err);
    }
  };

  const goNavi = (name: string, address: string) => {
    const url = `https://map.kakao.com/link/to/${encodeURIComponent(
      name
    )},${address}`;
    window.open(url, "_blank");
  };

  useEffect(() => {
    (window as any).dispatchNavi = goNavi;
  }, []);

  // 🔥 [핵심] 텍스트 꾸미기 및 카드화 (CSS Class 기반)
  const formatAiResponse = (text: string) => {
    if (!text) return "";

    let formatted = text;

    // 1. **굵게** -> 형광펜 효과 (노란색/초록색)
    formatted = formatted.replace(
      /\*\*(.*?)\*\*/g,
      '<span class="highlight-text">$1</span>'
    );

    // 2. ### 제목 -> 예쁜 타이틀로 변환 (밑줄 효과)
    formatted = formatted.replace(
      /^### (.*$)/gim,
      '<div class="section-title">$1</div>'
    );

    // 3. 줄바꿈 처리 (너무 넓지 않게)
    formatted = formatted.replace(/\n/g, "<br/>");

    // 4. [GO:REST:...] -> 맛집 카드 UI (콤팩트형)
    formatted = formatted.replace(
      /\[GO:REST:(\d+):(.+?)\]/g,
      (match, id, addr) => {
        return `
        <div class="recommend-card">
          <div class="card-header">
            <span class="card-badge-rest">맛집</span>
            <span class="card-addr">${addr}</span>
          </div>
          <div class="card-actions">
            <a href="/restaurant/${id}" class="btn-detail">정보보기</a>
            <button onclick="window.dispatchNavi('맛집', '${addr}')" class="btn-navi">길찾기</button>
          </div>
        </div>
      `;
      }
    );

    // 5. [GO:TOUR:...] -> 관광지 카드 UI (콤팩트형)
    formatted = formatted.replace(
      /\[GO:TOUR:(.+?):(.+?)\]/g,
      (match, name, addr) => {
        return `
        <div class="recommend-card">
          <div class="card-header">
            <span class="card-badge-tour">관광</span>
            <span class="card-addr">${addr}</span>
          </div>
          <div class="card-actions">
            <a href="/tour/attraction?keyword=${name}" class="btn-detail">정보보기</a>
            <button onclick="window.dispatchNavi('${name}', '${addr}')" class="btn-navi">길찾기</button>
          </div>
        </div>
      `;
      }
    );

    return formatted;
  };

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    setMessages((prev) => [...prev, { role: "user", text, isTyping: false }]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await api.post("/chatbot/chat", { message: text });

      const finalHtml = formatAiResponse(res.data.response);

      setMessages((prev) => [
        ...prev,
        { role: "ai", text: finalHtml, isTyping: true },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { role: "ai", text: "잠시 문제가 생겼어요. 😥", isTyping: false },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTypingComplete = (index: number) => {
    setMessages((prev) =>
      prev.map((msg, i) => (i === index ? { ...msg, isTyping: false } : msg))
    );
  };

  // 로딩 전에는 렌더링 하지 않음 (깜빡임 방지)
  if (isOpen && !isLoaded) return null;

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 z-50 bg-green-600 hover:bg-green-700 text-white p-4 rounded-2xl shadow-xl transition-all hover:scale-105 active:scale-95 flex items-center justify-center
        ${isOpen ? "rotate-90" : ""}`}
      >
        {isOpen ? <X size={28} /> : <MessageCircleMore size={32} />}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-24 right-6 z-50 w-[calc(100vw-3rem)] sm:w-[380px] h-[500px] sm:h-[600px] bg-white border border-gray-100 rounded-4xl flex flex-col overflow-hidden shadow-2xl font-pretendard"
          >
            {/* 헤더 */}
            <div className="bg-gradient-to-r from-green-600 to-teal-500 p-5 text-white flex justify-between items-center shrink-0">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-2 rounded-full backdrop-blur-sm">
                  <Sparkles size={18} className="text-yellow-300" />
                </div>
                <div>
                  <h3 className="font-bold text-lg leading-tight">
                    방방곡곡 AI
                  </h3>
                  <p className="text-[11px] opacity-90">
                    당신만의 대전 여행 가이드
                  </p>
                </div>
              </div>
              <div className="flex gap-1">
                {/* 🔥 초기화 버튼 */}
                <button
                  onClick={clearHistory}
                  className="text-white/80 hover:text-white transition-colors p-1.5 hover:bg-white/10 rounded-lg"
                  title="대화 초기화"
                >
                  <Trash2 size={18} />
                </button>
                {/* 저장 버튼 */}
                <button
                  onClick={saveAsImage}
                  className="text-white/80 hover:text-white transition-colors p-1.5 hover:bg-white/10 rounded-lg"
                  title="대화 저장"
                >
                  <Download size={18} />
                </button>
              </div>
            </div>

            {/* 채팅 영역 */}
            <div
              ref={chatAreaRef}
              className="flex-1 overflow-y-auto p-4 space-y-5 bg-[#f1f5f9] custom-scrollbar"
            >
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex gap-3 ${
                    msg.role === "user" ? "flex-row-reverse" : "flex-row"
                  }`}
                >
                  {msg.role === "ai" && (
                    <div className="w-9 h-9 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center shrink-0 overflow-hidden mt-1">
                      <Bot size={20} className="text-green-600" />
                    </div>
                  )}

                  <div
                    className={`max-w-[90%] p-3.5 rounded-2xl text-[13.5px] shadow-sm leading-relaxed
                    ${
                      msg.role === "user"
                        ? "bg-green-600 text-white rounded-tr-none"
                        : "bg-white text-gray-800 rounded-tl-none border border-gray-100"
                    }`}
                  >
                    {msg.role === "ai" && msg.isTyping ? (
                      <TypingEffect
                        text={msg.text.replace(/<[^>]*>/g, "")}
                        onComplete={() => handleTypingComplete(idx)}
                      />
                    ) : msg.role === "ai" ? (
                      // AI의 답변은 HTML로 렌더링 (카드 UI 포함)
                      <div
                        className="prose-custom"
                        dangerouslySetInnerHTML={{ __html: msg.text }}
                      />
                    ) : (
                      // 사용자의 질문은 마크다운 또는 텍스트로 렌더링
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={markdownComponents}
                      >
                        {msg.text}
                      </ReactMarkdown>
                    )}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-3">
                  <div className="w-9 h-9 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center shrink-0">
                    <Bot size={20} className="text-green-600 animate-pulse" />
                  </div>
                  <div className="bg-white p-3.5 rounded-2xl rounded-tl-none shadow-sm border border-gray-100 flex gap-1 items-center">
                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-bounce"></span>
                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* 추천 질문 (Chips) */}
            <div className="bg-white px-4 py-3 border-t border-gray-100 overflow-x-auto whitespace-nowrap scrollbar-hide flex gap-2 shrink-0">
              {suggestedPrompts.map((item, i) => (
                <button
                  key={i}
                  onClick={() => {
                    if (!isLoading) setInput(item.query);
                  }}
                  className="px-3 py-1.5 rounded-full bg-slate-50 text-slate-600 text-[11px] font-bold border border-slate-200 hover:bg-green-50 hover:text-green-700 hover:border-green-200 transition-colors"
                >
                  {item.label}
                </button>
              ))}
            </div>

            {/* 입력창 */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                sendMessage(input);
              }}
              className="p-3 bg-white border-t border-gray-100 flex items-center gap-2"
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="궁금한 코스를 물어보세요..."
                className="flex-1 bg-gray-50 text-gray-900 rounded-xl p-2 sm:px-4 sm:py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:bg-white transition-all border border-transparent focus:border-green-200"
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="bg-green-600 text-white p-2 sm:p-3 rounded-xl hover:bg-green-700 disabled:bg-gray-200 disabled:cursor-not-allowed transition-all shadow-md active:scale-95 flex items-center justify-center"
              >
                <SendHorizontal size={18} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 🔥 [스타일 정의] 세련된 디자인 적용 */}
      <style jsx global>{`
        /* 하이라이트 (형광펜 효과) */
        .highlight-text {
          font-weight: 700;
          color: #15803d;
          background: linear-gradient(to top, #dcfce7 40%, transparent 40%);
        }

        /* 섹션 타이틀 */
        .section-title {
          font-size: 15px;
          font-weight: 800;
          color: #1e293b;
          margin-top: 16px;
          margin-bottom: 6px;
          padding-left: 8px;
          border-left: 3px solid #22c55e;
          line-height: 1.2;
        }

        /* 추천 카드 (콤팩트) */
        .recommend-card {
          margin-top: 8px;
          margin-bottom: 4px;
          background-color: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 10px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.03);
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .card-header {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .card-badge-rest {
          font-size: 10px;
          font-weight: bold;
          color: #e11d48;
          background: #ffe4e6;
          padding: 2px 6px;
          rounded: 4px;
        }
        .card-badge-tour {
          font-size: 10px;
          font-weight: bold;
          color: #0369a1;
          background: #e0f2fe;
          padding: 2px 6px;
          rounded: 4px;
        }

        .card-addr {
          font-size: 11px;
          color: #64748b;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 160px;
        }

        .card-actions {
          display: flex;
          gap: 6px;
        }

        /* 버튼 공통 */
        .btn-detail,
        .btn-navi {
          flex: 1;
          text-align: center;
          padding: 6px 0;
          border-radius: 8px;
          font-size: 11px;
          font-weight: 600;
          cursor: pointer;
          text-decoration: none;
          transition: 0.2s;
        }

        /* 상세보기 버튼 */
        .btn-detail {
          background-color: #f8fafc;
          color: #334155;
          border: 1px solid #cbd5e1;
        }
        .btn-detail:hover {
          background-color: #f1f5f9;
          border-color: #94a3b8;
        }

        /* 길찾기 버튼 */
        .btn-navi {
          background-color: #10b981;
          color: white;
          border: 1px solid #10b981;
        }
        .btn-navi:hover {
          background-color: #059669;
          border-color: #059669;
        }

        /* 본문 텍스트 간격 조정 */
        .prose-custom br {
          display: block;
          content: "";
          margin-bottom: 2px; /* 줄바꿈 간격 최소화 */
        }
      `}</style>
    </>
  );
}
