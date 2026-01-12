// 1. "use client": 브라우저에서 실행되는 클라이언트 컴포넌트임을 선언합니다.
// (실시간 통신 연결, 알림 띄우기 등은 브라우저의 역할이니까요.)
"use client";

// --- [라이브러리 및 훅 임포트] ---
import { useEffect, useState } from "react"; // React 훅 (부수효과 처리, 상태 관리)
import Pusher from "pusher-js"; // Pusher 클라이언트 라이브러리 (실시간 통신용)
import { toast } from "react-toastify"; // 예쁜 알림창을 띄워주는 라이브러리
import { useRouter } from "next/navigation"; // 페이지 이동을 위한 Next.js 훅
import { Megaphone, X } from "lucide-react"; // 아이콘 (확성기, 닫기 버튼)

// --- [인터페이스 정의] ---
// 서버에서 보내주는 알림 데이터의 모양을 미리 정해둡니다.
interface NotificationData {
  title: string; // 알림 제목 (예: "새 공지사항이 등록되었습니다.")
  url: string; // 클릭 시 이동할 링크 주소
}

// ==================================================================
// [Main Component] PusherProvider 컴포넌트 시작
// 이 컴포넌트는 앱 전체를 감싸서 어디서든 알림을 받을 수 있게 합니다.
// ==================================================================
export default function PusherProvider({
  children, // 감싸고 있는 하위 컴포넌트들 (앱 전체 내용)
}: {
  children: React.ReactNode;
}) {
  const router = useRouter(); // 페이지 이동용 라우터
  // 마지막으로 받은 알림 데이터를 저장할 상태 (디버깅이나 중복 방지용으로 쓸 수 있음)
  const [lastNotification, setLastNotification] =
    useState<NotificationData | null>(null);

  // --- [Effect] Pusher 연결 및 구독 설정 ---
  // 컴포넌트가 처음 마운트될 때(켜질 때) 한 번만 실행됩니다.
  useEffect(() => {
    // 환경변수에서 Pusher 설정값(Key, Cluster)을 가져옵니다.
    const key = process.env.NEXT_PUBLIC_PUSHER_KEY;
    const cluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER;

    // 설정값이 없으면 연결하지 않고 그냥 종료합니다. (에러 방지)
    if (!key || !cluster) return;

    // [디버깅] 개발 환경(development)일 때만 콘솔에 로그를 찍습니다.
    // 배포 환경에서는 시끄러운 로그를 숨깁니다.
    if (process.env.NODE_ENV === "development") {
      Pusher.logToConsole = true;
    }

    // 1. Pusher 객체 생성 (연결 시도)
    const pusher = new Pusher(key, {
      cluster,
      forceTLS: true, // 보안 연결(HTTPS) 강제 사용
    });

    // 2. 채널 구독 ('my-channel'이라는 이름의 방송을 듣겠다!)
    const channel = pusher.subscribe("my-channel");

    // 3. 이벤트 바인딩 ('new-post'라는 신호가 오면 이 함수를 실행해라!)
    channel.bind("new-post", (data: NotificationData) => {
      console.log("🔥 [Pusher 데이터 전체]", data); // 받은 데이터 확인
      setLastNotification(data); // 상태 업데이트
      showToast(data); // ★ 핵심: 화면에 알림 띄우기
    });

    // 4. [Clean-up] 컴포넌트가 사라질 때 연결 해제 (메모리 누수 방지)
    return () => {
      channel.unbind_all(); // 모든 이벤트 연결 끊기
      pusher.unsubscribe("my-channel"); // 구독 취소
      pusher.disconnect(); // 서버 연결 끊기
    };
  }, [router]); // router가 변경될 때 재실행 (사실상 마운트 시 1회 실행)

  // --- [Function] 토스트 알림 띄우기 함수 ---
  const showToast = (data: NotificationData) => {
    // react-toastify 라이브러리를 사용해 커스텀 알림을 띄웁니다.
    toast(
      // 알림 내용물 (JSX)
      ({ closeToast }) => (
        <div
          // 전체 클릭 영역
          className="flex items-center gap-3 cursor-pointer group relative h-14"
          onClick={() => {
            // 클릭 시 해당 URL로 이동하고 알림창 닫기
            router.push(data.url || "/");
            closeToast();
          }}
        >
          {/* 1. 아이콘 영역 (주황색 배경의 확성기) */}
          <div className="bg-orange-500 text-white p-4.5 rounded-2xl transition-all duration-300 group-hover:scale-110 active:scale-95 flex items-center justify-center shadow-[0_10px_30px_-5px_rgba(249,115,22,0.5)]">
            <Megaphone className="w-7 h-7 text-white" strokeWidth={2.5} />
          </div>

          {/* 2. 텍스트 영역 (모바일에서는 숨김, sm 이상에서 보임) */}
          <div className="hidden sm:flex flex-col flex-1 min-w-0 pr-8 text-left ml-1">
            <p className="text-[10px] font-bold text-orange-600 uppercase mb-0.5 tracking-wider">
              New Notification
            </p>
            <p className="text-[14px] font-bold text-gray-800 truncate leading-tight">
              {data.title}
            </p>
          </div>

          {/* 3. 닫기 버튼 (우측 상단 X) */}
          <button
            onClick={(e) => {
              e.stopPropagation(); // 부모의 클릭 이벤트(이동)가 발생하지 않도록 막음
              closeToast(); // 알림만 닫기
            }}
            className="hidden sm:flex absolute -top-1 -right-1 w-6 h-6 items-center justify-center text-gray-400 hover:text-gray-600 transition-all hover:scale-110"
          >
            <X className="w-4 h-4" strokeWidth={3} />
          </button>
        </div>
      ),
      // 알림 설정 옵션
      {
        position: "bottom-right", // 우측 하단에 표시
        autoClose: 5000, // 5초 뒤 자동 삭제
        hideProgressBar: true, // 진행 바 숨김
        closeButton: false, // 기본 닫기 버튼 숨김 (커스텀 버튼 사용)
        className: "custom-toast-responsive", // CSS 클래스 추가
      }
    );
  };

  // 이 컴포넌트는 UI를 직접 그리지 않고 기능만 제공하므로 children을 그대로 반환합니다.
  return <>{children}</>;
}

// 연결 대기 (Listening): 사용자가 사이트에 접속하자마자 이 컴포넌트가 실행되어 Pusher 서버와 연결을 맺고 "혹시 새 소식 없나요?" 하며 귀를 기울입니다(subscribe).

// 이벤트 발생: 누군가 게시판에 새 글을 쓰거나 관리자가 공지사항을 올립니다.

// 알림 수신: Pusher 서버가 "야! 새 글 올라왔어!"라며 new-post라는 신호를 보냅니다.

// 토스트 팝업:

// 사용자의 화면 오른쪽 아래에 주황색 확성기 아이콘과 함께 "새로운 알림 도착!" 메시지가 뿅 하고 나타납니다.

// 5초 동안 떠 있다가 사라집니다.

// 클릭 반응: 사용자가 "어? 뭐지?" 하고 알림을 클릭하면, 바로 그 게시글(data.url)로 페이지가 이동합니다.
