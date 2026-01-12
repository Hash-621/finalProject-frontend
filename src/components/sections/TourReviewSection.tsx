// 1. "use client": 이 파일은 브라우저에서 실행되는 클라이언트 컴포넌트입니다.
// (useRouter 같은 훅을 사용하고, 버튼 클릭 이벤트를 처리해야 하기 때문입니다.)
"use client";

// --- [라이브러리 및 컴포넌트 임포트] ---
import { useRouter } from "next/navigation"; // 페이지 이동을 위한 Next.js 훅
// 화면을 예쁘게 꾸며줄 아이콘들을 가져옵니다.
import {
  Camera, // 카메라 아이콘 (글쓰기 버튼용)
  ArrowRight, // 화살표 아이콘 (이동 버튼용)
  MapPin, // 지도 핀 아이콘 (뱃지용)
  Sparkles, // 반짝이 아이콘 (장식용)
  MessageCircle, // 말풍선 아이콘 (장식용)
  Heart, // 하트 아이콘 (좋아요 장식용)
} from "lucide-react";
import Image from "next/image"; // 이미지 최적화 컴포넌트

// ==================================================================
// [Main Component] 여행 후기 섹션 컴포넌트 시작
// ==================================================================
export default function TourReviewSection() {
  // 1. 페이지 이동을 담당할 라우터 객체를 생성합니다.
  const router = useRouter();

  // 2. [Render] 화면 그리기
  return (
    // 전체 섹션 틀: 최대 너비 1240px, 가운데 정렬, 아래쪽 여백(pb-16)
    <section className="w-full max-w-[1240px] mx-auto pb-16 px-4 md:px-0">
      {/* [Main Card] 초록색 큰 배경 카드
        - relative: 내부 요소들의 위치 기준점
        - overflow-hidden: 배경 이미지가 확대될 때 밖으로 튀어나가지 않게 자름
        - bg-emerald-900: 기본 배경색은 진한 에메랄드색
        - group: 이 카드에 마우스를 올렸을 때 자식 요소들이 반응하도록 그룹핑
        - isolate: z-index 쌓임 맥락을 생성 (배경과 내용 분리)
      */}
      <div className="relative w-full rounded-[2.5rem] overflow-hidden bg-emerald-900 shadow-2xl shadow-emerald-900/20 group isolate min-h-[480px] flex items-center">
        {/* --- [Layer 1] 배경 이미지 영역 --- */}
        <div className="absolute inset-0 -z-10">
          {/* 배경 사진 (Unsplash) */}
          <Image
            src="https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?q=80&w=2000&auto=format&fit=crop"
            alt="Travel Background"
            // 스타일: 꽉 채우기, 투명도 40%, 오버레이 효과
            // group-hover:scale-105: 카드에 마우스 올리면 사진이 살짝 커짐
            className="w-full h-full object-cover opacity-40 mix-blend-overlay transition-transform duration-1000 group-hover:scale-105"
            width={0}
            height={0}
            unoptimized // 외부 이미지(Unsplash) 최적화 생략 (설정 없이 쓰기 위해)
          />

          {/* 그라데이션 오버레이: 사진 위에 색을 덮어 글씨가 잘 보이게 함 */}
          {/* 왼쪽은 진하게, 오른쪽으로 갈수록 약간 투명하게 */}
          <div className="absolute inset-0 bg-linear-to-r from-emerald-900/95 via-emerald-800/90 to-teal-900/70" />
        </div>

        {/* --- [Layer 2] 장식용 패턴 (오른쪽 위 반짝이) --- */}
        <div className="absolute top-0 right-0 p-20 opacity-10 pointer-events-none">
          <Sparkles className="w-64 h-64 text-white" />
        </div>

        {/* --- [Layer 3] 실제 콘텐츠 영역 (좌/우 분할) --- */}
        <div className="w-full flex flex-col md:flex-row items-center justify-between p-8 sm:p-12 md:p-16 gap-12 sm:gap-16">
          {/* === [Left Side] 텍스트 및 버튼 === */}
          <div className="flex-1 text-center md:text-left space-y-8 z-10 max-w-xl">
            {/* 텍스트 그룹 */}
            <div className="space-y-4">
              {/* 상단 뱃지 (Travel Log) */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/20 backdrop-blur-md border border-emerald-400/30 text-emerald-100 text-xs font-bold uppercase tracking-wider shadow-sm animate-fade-in">
                <MapPin size={12} className="text-emerald-300" />
                Travel Log
              </div>

              {/* 메인 타이틀 */}
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white leading-[1.2] drop-shadow-lg">
                당신의 특별한 여행, <br />
                {/* 그라데이션 텍스트 강조 */}
                <span className="text-transparent bg-clip-text bg-linear-to-r from-emerald-200 to-teal-200">
                  이야기가 되다
                </span>
              </h2>

              {/* 서브 설명글 */}
              <p className="text-emerald-100/80 text-base sm:text-lg font-medium leading-relaxed">
                숨겨진 명소부터 맛집까지, 생생한 후기를 확인하세요.
                {/* 모바일에서는 줄바꿈 안 함 */}
                <br className="hidden sm:block" />
                당신의 소중한 추억이 누군가의 여행이 됩니다.
              </p>
            </div>

            {/* 버튼 그룹 */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start pt-2">
              {/* [Button 1] 후기 구경하기 */}
              <button
                onClick={() => router.push("/community/review")} // 클릭 시 이동
                className="group/btn relative px-8 py-4 bg-white text-emerald-800 rounded-2xl font-bold shadow-lg shadow-emerald-900/20 hover:shadow-xl hover:shadow-emerald-900/30 hover:-translate-y-1 transition-all active:scale-95 flex items-center justify-center gap-2 overflow-hidden"
              >
                <span className="relative z-10">후기 구경하기</span>
                {/* 화살표 애니메이션: 호버 시 오른쪽으로 이동 */}
                <ArrowRight
                  size={18}
                  className="relative z-10 transition-transform group-hover/btn:translate-x-1"
                />
                {/* 버튼 배경 광택 효과 */}
                <div className="absolute inset-0 bg-linear-to-r from-emerald-50 to-teal-50 opacity-0 group-hover/btn:opacity-100 transition-opacity" />
              </button>

              {/* [Button 2] 나도 기록하기 */}
              <button
                onClick={() => router.push("/community/review/write")} // 클릭 시 이동
                className="px-8 py-4 bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-2xl font-bold hover:bg-white/20 transition-all hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-2 group/camera"
              >
                {/* 카메라 아이콘 애니메이션: 호버 시 갸우뚱(회전) */}
                <Camera
                  size={18}
                  className="group-hover/camera:rotate-12 transition-transform"
                />
                <span>나도 기록하기</span>
              </button>
            </div>
          </div>

          {/* === [Right Side] 이미지 장식 (모바일 숨김) === */}
          <div className="hidden md:block flex-1 relative w-full max-w-sm lg:max-w-md h-[400px]">
            {/* 뒤쪽 배경의 은은한 초록색 빛 (Glow Effect) */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-emerald-500/20 blur-3xl rounded-full" />

            {/* [Card 1] 뒤쪽 카드 (오른쪽 위로 기울어짐) */}
            <div className="absolute top-0 right-4 w-60 h-72 bg-white p-3 pb-10 shadow-2xl rotate-6 rounded-xl transform transition-transform hover:rotate-3 hover:scale-105 duration-500 z-10">
              <Image
                src="https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=800&auto=format&fit=crop"
                className="w-full h-full object-cover rounded-lg bg-slate-100"
                alt="Review 1"
                width={0}
                height={0}
                unoptimized
              />
              {/* 별점 장식 (별 5개) */}
              <div className="absolute bottom-3 left-4 flex gap-0.5">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Sparkles
                    key={i}
                    size={10}
                    className="text-yellow-400 fill-yellow-400"
                  />
                ))}
              </div>
            </div>

            {/* [Card 2] 앞쪽 카드 (왼쪽 위로 기울어짐) */}
            <div className="absolute top-16 right-24 w-64 h-80 bg-white p-3 pb-4 shadow-2xl -rotate-6 rounded-xl transform transition-transform hover:-rotate-3 hover:scale-105 duration-500 z-20">
              {/* 이미지 영역 */}
              <div className="relative w-full h-48 mb-3 overflow-hidden rounded-lg">
                <Image
                  src="https://images.unsplash.com/photo-1511018556340-d16986a1c194?q=80&w=800&auto=format&fit=crop"
                  className="w-full h-full object-cover"
                  alt="Review 2"
                  width={0}
                  height={0}
                  unoptimized
                />
                {/* 좋아요 수 뱃지 */}
                <div className="absolute top-2 right-2 bg-black/50 backdrop-blur-md px-2 py-1 rounded-full flex items-center gap-1 text-[10px] text-white font-bold">
                  <Heart size={10} className="fill-red-500 text-red-500" /> 128
                </div>
              </div>

              {/* 텍스트 영역 (가짜 글씨 UI) */}
              <div className="px-1">
                {/* 프로필 + 이름 */}
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 rounded-full bg-slate-200" />
                  <div className="h-2 w-20 bg-slate-100 rounded-full" />
                </div>
                {/* 본문 줄글 */}
                <div className="space-y-1.5">
                  <div className="h-2 w-full bg-slate-100 rounded-full" />
                  <div className="h-2 w-4/5 bg-slate-100 rounded-full" />
                </div>
                {/* 하단 입력창 흉내 */}
                <div className="mt-4 flex items-center justify-between text-xs text-slate-400 font-medium">
                  <span>여행 기록 남기기...</span>
                  <MessageCircle size={14} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// 시선 포착 (Visual Hook):

// 짙은 에메랄드빛 배경에 은은하게 깔린 여행지 사진이 보입니다.

// 마우스를 섹션 위에 올리면 배경 이미지가 아주 천천히 확대되며(scale-105) 생동감을 줍니다.

// 메시지 전달 (Copywriting):

// 왼쪽에는 **"당신의 특별한 여행, 이야기가 되다"**라는 감성적인 문구가 적혀있습니다.

// 오른쪽에는 여행지 사진과 좋아요(♥) 128개가 찍힌 카드들이 겹쳐져 있어, "이곳은 활발한 커뮤니티구나"라는 느낌을 줍니다.

// 행동 유도 (Action):

// [후기 구경하기]: "남들은 어디 갔나 볼까?" -> 클릭 시 리뷰 목록 페이지로 이동합니다.

// [나도 기록하기]: "내 여행도 자랑해볼까?" -> 클릭 시 글쓰기 페이지로 이동합니다. 카메라는 마우스를 올리면 까닥거리는 애니메이션이 있어 누르고 싶게 만듭니다.
