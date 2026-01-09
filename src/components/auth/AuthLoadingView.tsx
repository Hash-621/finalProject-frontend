import React from "react";

export const AuthLoadingView = ({ status }: { status: string }) => (
  <div className="min-h-screen flex flex-col justify-center items-center bg-[#fcfdfc] gap-8">
    {/* 1. 스피너 영역 (회색 링 + 돌아가는 초록 링 + GO 텍스트) */}
    <div className="relative flex items-center justify-center">
      {/* 배경이 되는 회색 링 */}
      <div className="w-20 h-20 border-4 border-slate-100 rounded-full"></div>
      {/* 위에서 빙글빙글 도는 초록색 링 (윗부분 투명) */}
      <div className="absolute w-20 h-20 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
      {/* 중앙에서 깜빡이는 GO 텍스트 */}
      <div className="absolute text-green-500 font-black text-[10px] tracking-tighter animate-pulse">
        GO
      </div>
    </div>

    {/* 2. 텍스트 정보 영역 */}
    <div className="text-center space-y-3">
      {/* 메인 타이틀 SECURE LOGIN */}
      <h2 className="text-3xl font-black text-slate-900 tracking-tighter">
        SECURE <span className="text-green-500 italic font-serif">LOGIN</span>
      </h2>
      {/* 현재 상태 메시지 (예: 토큰 검증 중...) */}
      <p className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] animate-pulse">
        {status}
      </p>
    </div>

    {/* 3. 하단 로딩 점 3개 (순차적으로 튀어오름) */}
    <div className="flex gap-2">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="w-1.5 h-1.5 bg-slate-200 rounded-full animate-bounce"
          // i값(1,2,3)을 이용해 애니메이션 시작 시간에 차이를 줌 (0.2s, 0.4s, 0.6s)
          style={{ animationDelay: `${i * 0.2}s` }}
        />
      ))}
    </div>
  </div>
);

// 화면 장악: 컴포넌트가 실행되자마자 하얀색 배경이 브라우저 창 전체(min-h-screen)를 꽉 채웁니다. 다른 내용은 보이지 않게 됩니다.

// 중앙 정렬: 모든 내용물(로딩 바, 글씨)은 화면의 정중앙(center)으로 모입니다.

// 스피너 조립 (3단 합체):

// 1단계: 회색 동그라미 테두리가 먼저 그려집니다. (배경 링)

// 2단계: 그 위에 초록색 테두리가 겹쳐지는데, 윗부분이 투명해서 마치 끊긴 링처럼 보입니다. 이 녀석이 뱅글뱅글 돕니다(animate-spin).

// 3단계: 그 링 정중앙에 "GO"라는 글씨가 깜빡거리며(animate-pulse) 나타납니다.

// 메시지 출력: 스피너 아래에 "SECURE LOGIN"이라는 큰 제목과, 부모 컴포넌트가 전달해 준 현재 상황(status 예: "토큰 확인 중...")이 표시됩니다.

// 대기 점 애니메이션: 맨 아래에 작은 점 3개가 나타나는데, 각각 0.2초씩 시차를 두고 통통 튑니다(animate-bounce).
