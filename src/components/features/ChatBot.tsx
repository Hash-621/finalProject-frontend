// 1. "use client": Next.js에게 이 파일이 서버가 아닌 '브라우저(클라이언트)'에서 실행됨을 알립니다.
// (useState 같은 훅이나 onClick 같은 이벤트를 쓰려면 필수입니다.)
"use client";

// --- [라이브러리 및 훅 임포트] ---
import { useState, useRef, useEffect } from "react"; // React의 상태(값 저장), 참조(DOM 접근), 부수효과(타이머 등) 관리 훅
import api from "@/api/axios"; // 백엔드와 통신하기 위해 미리 설정해둔 axios 인스턴스 (API 요청용)
// 화면을 예쁘게 꾸며줄 아이콘들을 가져옵니다.
import {
  SendHorizontal, // 전송 비행기 아이콘
  X, // 닫기(X) 아이콘
  MessageCircleMore, // 말풍선 아이콘 (챗봇 버튼)
  Bot, // AI 로봇 얼굴 아이콘
  Sparkles, // 반짝이 아이콘 (헤더 장식)
  MapPin, // 지도 핀 아이콘 (장소 링크용)
} from "lucide-react";
// 부드러운 애니메이션을 위한 라이브러리입니다.
import { motion, AnimatePresence } from "framer-motion";
// AI의 답변(마크다운 형식)을 예쁜 HTML로 바꿔주는 라이브러리입니다.
import ReactMarkdown from "react-markdown";
// 마크다운에서 표, 링크, 취소선 등을 지원하게 해주는 플러그인입니다.
import remarkGfm from "remark-gfm";
import Link from "next/link"; // 페이지 이동을 위한 Next.js 링크 컴포넌트

// ==================================================================
// [Component 1] 타이핑 효과 컴포넌트
// AI가 답변할 때 한 번에 팍! 뜨지 않고, 타자 치듯 한 글자씩 나오게 합니다.
// ==================================================================
const TypingEffect = ({
  text, // 출력할 전체 텍스트
  onComplete, // 타이핑이 다 끝났을 때 실행할 함수 (부모에게 알림)
}: {
  text: string;
  onComplete: () => void;
}) => {
  // 현재 화면에 보여줄 텍스트 상태 (처음엔 빈 문자열)
  const [displayedText, setDisplayedText] = useState("");

  // 텍스트가 변경될 때마다 실행되는 로직
  useEffect(() => {
    let i = 0; // 현재 몇 번째 글자인지 추적하는 인덱스

    // 15ms마다 실행되는 타이머를 만듭니다. (매우 빠름)
    const interval = setInterval(() => {
      if (i < text.length) {
        // 아직 칠 글자가 남았다면, 기존 글자에 다음 글자를 하나 더 붙입니다.
        setDisplayedText((prev) => prev + text.charAt(i));
        i++; // 인덱스 증가
      } else {
        // 다 쳤으면 타이머를 멈추고 완료 신호를 보냅니다.
        clearInterval(interval);
        onComplete();
      }
    }, 15); // 숫자가 작을수록 타자 속도가 빠릅니다.

    // 컴포넌트가 사라지거나 텍스트가 바뀌면 기존 타이머를 청소합니다. (메모리 누수 방지)
    return () => clearInterval(interval);
  }, [text]);

  // 타이핑 중인 텍스트도 마크다운으로 변환해서 보여줍니다.
  return (
    <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
      {displayedText}
    </ReactMarkdown>
  );
};

// ==================================================================
// [Config] 마크다운 스타일 정의 객체
// AI가 준 텍스트 중 링크나 강조 등을 어떻게 꾸밀지 정의합니다.
// ==================================================================
const markdownComponents: any = {
  // 1. 링크(a 태그)를 만났을 때: 단순 파란 글씨 대신 '버튼'처럼 꾸밉니다.
  a: ({ node, ...props }: any) => (
    <Link
      href={props.href || "#"} // 링크 주소 연결
      // 스타일: 초록색 배경, 둥근 모서리, 지도 핀 아이콘 포함
      className="inline-flex items-center gap-1 bg-green-50 text-green-700 hover:bg-green-100 border border-green-200 px-2 py-0.5 rounded-md text-xs font-bold transition-colors mx-1 no-underline transform hover:scale-105"
      // 외부 링크면 새 창(_blank)으로, 내부면 현재 창(_self)으로 엽니다.
      target={props.href?.startsWith("http") ? "_blank" : "_self"}
    >
      <MapPin size={10} /> {/* 지도 핀 아이콘 추가 */}
      {props.children} {/* 링크 텍스트 (예: "성심당") */}
    </Link>
  ),
  // 2. 리스트(ul, ol, li) 스타일링
  ul: ({ node, ...props }: any) => (
    <ul className="list-none pl-1 my-2 space-y-2" {...props} />
  ),
  ol: ({ node, ...props }: any) => (
    <ol className="list-decimal pl-4 my-2 space-y-2 text-gray-700" {...props} />
  ),
  li: ({ node, ...props }: any) => <li className="pl-1" {...props} />,
  // 3. 강조(strong/bold) 스타일링
  strong: ({ node, ...props }: any) => (
    <strong
      className="font-extrabold text-green-800 bg-green-50/50 px-1 rounded"
      {...props}
    />
  ),
  // 4. 문단(p) 스타일링
  p: ({ node, ...props }: any) => (
    <p className="mb-2 last:mb-0 leading-relaxed" {...props} />
  ),
  // 5. 구분선(hr) 스타일링
  hr: ({ node, ...props }: any) => (
    <hr className="my-3 border-gray-200 border-dashed" {...props} />
  ),
};

// ==================================================================
// [Main Component] 챗봇 메인 컴포넌트 시작
// ==================================================================
export default function ChatBot() {
  // --- [State] 상태 관리 변수들 ---
  const [isOpen, setIsOpen] = useState(false); // 채팅창이 열렸는지 닫혔는지 (true/false)

  // 대화 내용을 담는 배열입니다. 기본 인사말을 미리 넣어둡니다.
  const [messages, setMessages] = useState([
    {
      role: "ai", // 화자: AI
      text: "반가워요! 대전 여행 전문가 '다잇슈' 봇입니다. 🍯\n어떤 여행을 계획 중이신가요? 맛집, 명소, 데이트 코스 등 무엇이든 물어보세요!",
      isTyping: false, // 이미 완료된 메시지니까 타이핑 효과 없음
    },
  ]);

  const [input, setInput] = useState(""); // 사용자가 입력창에 치고 있는 글자
  const [isLoading, setIsLoading] = useState(false); // 서버 응답을 기다리는 중인지 (로딩 상태)

  // 자동 스크롤을 위해 채팅창 맨 아래에 붙일 투명한 div를 가리키는 Ref입니다.
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // --- [Config] 추천 질문 리스트 (Chips) ---
  // 사용자가 타자 치기 귀찮을 때 클릭 한 번으로 질문하게 해주는 버튼들입니다.
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

  // --- [Function] 스크롤 내리기 함수 ---
  // 채팅창의 스크롤을 가장 아래로 부드럽게 내립니다.
  const scrollToBottom = () =>
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });

  // 메시지가 추가되거나, 창이 열리거나, 로딩이 시작되면 스크롤을 맨 아래로 내립니다.
  useEffect(() => scrollToBottom(), [messages, isOpen, isLoading]);

  // --- [Function] 메시지 전송 핵심 로직 ---
  const sendMessage = async (text: string) => {
    // 빈칸이거나 이미 로딩 중이면 함수를 멈춥니다. (중복 전송 방지)
    if (!text.trim() || isLoading) return;

    // 1. [UI 업데이트] 사용자의 메시지를 화면에 먼저 띄웁니다.
    setMessages((prev) => [
      ...prev, // 기존 메시지 유지
      { role: "user", text: text, isTyping: false }, // 내 메시지 추가
    ]);
    setInput(""); // 입력창 비우기
    setIsLoading(true); // 로딩 시작 (점 3개 애니메이션 표시)

    try {
      // 2. [API 요청] 백엔드 서버에 질문을 보냅니다.
      const res = await api.post("/chatbot/chat", { message: text });

      // 3. [응답 처리] 서버에서 답이 오면 AI 메시지로 추가합니다.
      setMessages((prev) => [
        ...prev,
        // isTyping: true로 설정해서 타이핑 효과가 시작되게 합니다.
        { role: "ai", text: res.data.response, isTyping: true },
      ]);
    } catch (error) {
      // 에러 발생 시 안내 메시지를 띄웁니다.
      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          text: "죄송해요, 잠시 연결 상태가 좋지 않아요. 😥 잠시 후 다시 시도해주세요.",
          isTyping: false,
        },
      ]);
    } finally {
      setIsLoading(false); // 로딩 종료
    }
  };

  // 엔터키를 치거나 전송 버튼을 눌렀을 때 실행되는 함수 wrapper
  const handleSend = (e: React.FormEvent) => {
    e.preventDefault(); // 새로고침 방지
    sendMessage(input);
  };

  // TypingEffect 컴포넌트가 "나 타자 다 쳤어!"라고 알려주면 실행되는 함수
  const handleTypingComplete = (index: number) => {
    // 해당 메시지의 isTyping 상태를 false로 바꿔서 타이핑 효과를 끕니다.
    setMessages((prev) =>
      prev.map((msg, i) => (i === index ? { ...msg, isTyping: false } : msg))
    );
  };

  // --- [Render] 화면 그리기 ---
  return (
    <>
      {/* 1. 우측 하단 플로팅 버튼 (챗봇 열기/닫기) */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`cursor-pointer fixed bottom-6 right-6 z-50 bg-green-600 hover:bg-green-700 text-white p-4 rounded-2xl transition-all duration-300 hover:scale-110 active:scale-95 flex items-center justify-center
        ${
          isOpen
            ? "shadow-none rotate-90" // 열려있으면 그림자 없애고 회전 (X 모양 연출)
            : "shadow-[0_8px_30px_rgb(22,163,74,0.4)]" // 닫혀있으면 초록색 그림자
        }`}
      >
        {/* 열려있으면 X 아이콘, 닫혀있으면 말풍선 아이콘 */}
        {isOpen ? (
          <X className="w-7 h-7" />
        ) : (
          <MessageCircleMore className="w-8 h-8" />
        )}
      </button>

      {/* 2. 채팅창 본문 (AnimatePresence로 사라질 때 애니메이션 적용) */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            // 등장 애니메이션 설정
            initial={{
              opacity: 0,
              y: 50, // 아래에서
              scale: 0.9, // 약간 작게 시작
              transformOrigin: "bottom right", // 기준점은 우측 하단
            }}
            animate={{ opacity: 1, y: 0, scale: 1 }} // 제자리로 뿅
            exit={{ opacity: 0, y: 20, scale: 0.9 }} // 사라질 땐 다시 아래로
            // 스타일: 우측 하단 고정, 모바일 꽉 채움 / PC는 적당한 크기
            className="fixed bottom-24 right-6 z-50 w-[calc(100vw-2rem)] sm:w-[380px] h-[600px] bg-white border border-gray-100 rounded-[2rem] flex flex-col overflow-hidden shadow-2xl font-pretendard"
          >
            {/* (1) 헤더 섹션: 초록색 그라데이션 배경 */}
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-5 text-white shrink-0">
              <div className="flex items-center gap-3">
                {/* 봇 아이콘 + 반짝이 */}
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

            {/* (2) 메시지 리스트 영역 */}
            <div className="flex-1 overflow-y-auto p-4 space-y-5 bg-slate-50 custom-scrollbar">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  // 내 메시지는 오른쪽(reverse), AI는 왼쪽(row) 배치
                  className={`flex items-end gap-2.5 ${
                    msg.role === "user" ? "flex-row-reverse" : "flex-row"
                  }`}
                >
                  {/* AI일 경우 왼쪽에 프로필 아이콘 표시 */}
                  {msg.role === "ai" && (
                    <div className="w-8 h-8 rounded-full bg-white border border-gray-100 flex items-center justify-center shrink-0 shadow-sm mb-1 overflow-hidden">
                      <Bot className="w-5 h-5 text-green-600" />
                    </div>
                  )}

                  {/* 말풍선 본체 */}
                  <div
                    className={`max-w-[85%] p-3.5 px-4 rounded-2xl text-[13px] leading-relaxed shadow-sm relative ${
                      msg.role === "user"
                        ? "bg-green-600 text-white rounded-br-none" // 내 거: 초록색
                        : "bg-white text-gray-800 border border-gray-100 rounded-tl-none" // AI 거: 흰색
                    }`}
                  >
                    {/* 조건부 렌더링: 타이핑 중? vs 완료됨? vs 내 메시지? */}
                    {msg.role === "ai" && msg.isTyping ? (
                      // 타이핑 효과 중일 때
                      <TypingEffect
                        text={msg.text}
                        onComplete={() => handleTypingComplete(idx)}
                      />
                    ) : msg.role === "ai" ? (
                      // AI 답변 완료 시 (마크다운 렌더링)
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={markdownComponents}
                      >
                        {msg.text}
                      </ReactMarkdown>
                    ) : (
                      // 사용자 메시지 (그냥 텍스트)
                      msg.text
                    )}
                  </div>
                </div>
              ))}

              {/* (2.5) 로딩 인디케이터 (점 3개 튀는 애니메이션) */}
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
              {/* 자동 스크롤을 위한 투명한 앵커 */}
              <div ref={messagesEndRef} />
            </div>

            {/* (3) 추천 질문 칩 (가로 스크롤 가능) */}
            <div className="bg-white border-t border-gray-50 px-4 py-3 shrink-0">
              <p className="text-[10px] text-gray-400 mb-2 font-bold ml-1">
                💡 이런 질문은 어떠세요?
              </p>
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                {suggestedPrompts.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => sendMessage(item.query)} // 클릭하면 바로 전송
                    className="whitespace-nowrap px-3 py-1.5 bg-green-50 text-green-700 border border-green-100 rounded-full text-[11px] font-bold hover:bg-green-100 transition-colors active:scale-95"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* (4) 입력 폼 영역 */}
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
                // 입력값이 없거나 로딩 중이면 비활성화
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

// 발견 (Floating Button): 웹사이트 우측 하단에 초록색 말풍선 아이콘이 둥둥 떠 있습니다.

// 진입 (Animation): 아이콘을 클릭하면, Framer Motion이 작동하며 채팅창이 아래에서 위로 부드럽게 솟아오릅니다.

// 제안 (Guidance): 사용자가 뭘 물어볼지 고민하지 않게 "데이트 코스", "맛집 추천" 같은 **추천 질문 버튼(Chips)**들이 가로로 나열되어 있습니다.

// 질문 (Interaction):

// 사용자가 채팅창에 "대전 맛집 알려줘"라고 치고 엔터를 칩니다.

// 즉시 반응: 사용자의 말풍선이 화면에 붙고, AI 쪽에는 점 3개가 춤추는 로딩 애니메이션이 뜹니다. (사용자는 "아, 생각 중이구나" 하고 기다립니다.)

// 답변 (Typing Effect):

// 서버에서 응답이 도착하면 로딩이 사라집니다.

// 답변이 한 번에 팍! 뜨는 게 아니라, TypingEffect 컴포넌트가 작동해 한 글자씩 타닥타닥 써 내려갑니다. (진짜 사람이 치는 듯한 느낌)

// 답변 중에 "성심당" 같은 장소 이름이 있다면, ReactMarkdown이 이를 감지해 지도 아이콘이 달린 예쁜 링크 버튼으로 바꿔서 보여줍니다.
