import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon?: React.ReactNode;
}

export const Input = ({ label, icon, ...props }: InputProps) => (
  <div className="space-y-2.5 w-full">
    {/* 1. 상단 라벨 (제목) 영역 */}
    <label className="text-[11px] font-black text-slate-400 ml-4 uppercase tracking-[0.15em]">
      {label}
    </label>

    {/* 2. 입력창과 아이콘을 감싸는 컨테이너 (group으로 묶어서 포커스 감지) */}
    <div className="relative group">
      {/* 3. 아이콘 영역 (icon prop이 있을 때만 렌더링) */}
      {icon && (
        <div
          className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-green-500 transition-colors z-10 
      group-focus-within:hidden sm:group-focus-within:block"
        >
          {icon}
        </div>
      )}

      {/* 4. 실제 input 태그 */}
      <input
        {...props} // 부모로부터 받은 나머지 속성들 (type, value 등) 적용
        className={`w-full ${
          // 아이콘 유무에 따라 왼쪽 패딩(여백) 조절
          icon ? "pl-14 focus:pl-6 sm:focus:pl-14" : "px-6"
        } pr-6 py-3 sm:py-5 bg-slate-50/50 border border-slate-100 rounded-[1.8rem] outline-none transition-all font-black text-slate-700 placeholder:text-slate-300 focus:bg-white focus:border-green-400 focus:ring-[6px] focus:ring-green-50/50 disabled:opacity-50`}
      />
    </div>
  </div>
);

// 자리 잡기: 컴포넌트가 화면에 그려지면, 가장 먼저 "이메일"이라는 **라벨(제목)**이 작고 두꺼운 회색 글씨로 상단에 표시됩니다.

// 입력 통 만들기: 라벨 바로 아래에 둥글둥글한(알약 모양의) 입력 상자가 그려집니다. 배경은 아주 연한 회색입니다.

// 아이콘 배치: 만약 개발자가 아이콘을 넣어줬다면, 입력 상자 왼쪽 끝에 아이콘이 살포시 얹어집니다.

// 사용자 클릭 (하이라이트):

// 사용자가 입력창을 클릭하면(포커스), 연한 회색이었던 배경이 하얀색으로 밝아집니다.

// 테두리가 초록색으로 변하고, 주변에 은은한 **초록색 빛(링)**이 퍼집니다.

// 이때, 입력창뿐만 아니라 왼쪽에 있던 회색 아이콘도 같이 초록색으로 변합니다. (이게 디테일 포인트입니다!)

// 글자 입력: 사용자가 글씨를 쓰면, 아이콘이 있는 경우 글자가 아이콘을 가리지 않도록 오른쪽으로 살짝 밀려서 입력됩니다.

// import React from "react";
// 해석: 리액트 라이브러리를 불러옵니다. JSX 문법을 쓰기 위한 기본 준비입니다.

// TypeScript

// interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
//   label: string;
//   icon?: React.ReactNode;
// }
// 해석: Input 컴포넌트가 받을 재료(Props)의 목록과 규칙을 정의합니다.

// extends React.InputHTMLAttributes<HTMLInputElement>: (핵심) "기본적인 HTML <input> 태그가 가진 모든 속성(클릭 이벤트, 타입, 값 등)을 다 물려받겠다"는 뜻입니다. 일일이 다 정의할 필요가 없어집니다.

// label: string;: 추가로 label이라는 이름의 문자열은 필수로 받겠다고 선언합니다.

// icon?: React.ReactNode;: icon은 **선택 사항(?)**이며, 리액트 컴포넌트나 태그 형태(ReactNode)여야 한다고 선언합니다.

// TypeScript

// export const Input = ({ label, icon, ...props }: InputProps) => (
// 해석: Input이라는 컴포넌트를 만듭니다.

// ({ label, icon, ...props }): 부모가 준 재료 주머니를 엽니다.

// label과 icon은 따로 꺼냅니다.

// ...props: "나머지 재료들(예: onChange, placeholder, type 등)은 몽땅 묶어서 props라는 이름으로 줘"라는 뜻입니다.

// TypeScript

//   <div className="space-y-2.5 w-full">
// 해석 (전체 포장지):

// w-full: 너비를 부모 크기에 맞춰 꽉 채웁니다.

// space-y-2.5: 이 안에 들어있는 자식 요소들(라벨과 입력창) 사이에 수직 간격을 10px(2.5 * 4px)만큼 자동으로 띄워줍니다.

// TypeScript

//     <label className="text-[11px] font-black text-slate-400 ml-4 uppercase tracking-[0.15em]">
//       {label}
//     </label>
// 해석 (라벨 텍스트):

// text-[11px]: 글자 크기를 11px로 아주 작게 설정합니다.

// font-black: 글자 굵기를 가장 두껍게(Black) 합니다.

// text-slate-400: 글자 색을 연한 회색으로 합니다.

// ml-4: 왼쪽 여백을 16px 주어 입력창보다 살짝 안쪽으로 들여쓰기합니다.

// uppercase: 영문일 경우 무조건 대문자로 바꿉니다.

// tracking-[0.15em]: 글자 사이 간격(자간)을 넓게 벌려 세련된 느낌을 줍니다.

// {label}: 부모가 보내준 실제 라벨 내용(예: "Password")을 출력합니다.

// TypeScript

//     <div className="relative group">
// 해석 (입력창 껍데기):

// relative: **"여기가 기준점이야!"**라고 선언합니다. 이 안에 들어올 아이콘(absolute)이 밖으로 도망가지 못하게 가두는 울타리 역할입니다.

// group: (중요) 이 div와 그 자식들을 하나의 **'그룹'**으로 묶습니다. 나중에 "자식인 입력창이 클릭되었을 때, 형제인 아이콘 색을 바꾸는 마법"을 부리기 위해 필요합니다.

// TypeScript

//       {icon && (
// 해석: "만약 icon이라는 재료가 존재한다면?" (없으면 이 아래 코드는 무시됩니다.)

// TypeScript

//         <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-green-500 transition-colors z-10">
//           {icon}
//         </div>
// 해석 (아이콘 상자):

// absolute: 기준점(relative)을 기준으로 둥둥 띄웁니다.

// left-5: 왼쪽에서 20px 떨어진 곳에 놓습니다.

// top-1/2 -translate-y-1/2: 이 두 조합은 **"수직 정중앙 정렬"**의 공식입니다. 위에서 50% 내려오고, 자기 자신의 크기만큼 다시 50% 올라가서 딱 가운데 맞춥니다.

// text-slate-300: 기본 아이콘 색은 연한 회색입니다.

// group-focus-within:text-green-500: (핵심) 아까 묶은 group 내부 어딘가에 포커스(클릭)가 생기면, 이 아이콘 색을 초록색으로 바꿉니다. (입력창을 클릭했는데 아이콘 색이 변하는 효과)

// transition-colors: 색이 변할 때 깜빡이지 않고 부드럽게 변하게 합니다.

// z-10: 입력창보다 앞으로 튀어나오게(레이어 순서) 합니다.

// {icon}: 실제 아이콘 그림을 출력합니다.

// TypeScript

//       )}
//       <input
//         {...props}
// 해석 (실제 입력 태그):

// input: 사용자가 글을 쓰는 진짜 입력 태그입니다.

// {...props}: 아까 위에서 따로 챙겨둔 나머지 재료들(type, placeholder 등)을 여기에 몽땅 털어 넣습니다. 이렇게 해야 개발자가 <Input type="password" />라고 썼을 때 실제로 비밀번호 입력창이 됩니다.

// TypeScript

//         className={`w-full ${
//           icon ? "pl-14" : "px-6"
//         } pr-6 py-5 bg-slate-50/50 border border-slate-100 rounded-[1.8rem] outline-none transition-all font-black text-slate-700 placeholder:text-slate-300 focus:bg-white focus:border-green-400 focus:ring-[6px] focus:ring-green-50/50 disabled:opacity-50`}
//       />
// 해석 (입력창 스타일): 아주 길지만 하나씩 보면 쉽습니다.

// w-full: 너비 100%.

// ${icon ? "pl-14" : "px-6"}: (조건부 스타일) 아이콘이 있으면 왼쪽 안쪽 여백(padding-left)을 56px(pl-14)만큼 줘서 글자가 아이콘을 덮지 않게 합니다. 아이콘이 없으면 그냥 24px(px-6)만 줍니다.

// pr-6 py-5: 오른쪽 여백 24px, 위아래 여백 20px을 주어 상자를 통통하게 만듭니다.

// bg-slate-50/50: 배경색은 아주 연한 회색인데, 투명도 50%(/50)를 줍니다.

// border border-slate-100: 1px짜리 아주 연한 회색 테두리를 그립니다.

// rounded-[1.8rem]: 모서리를 아주 둥글게 깎습니다.

// outline-none: 브라우저 기본 파란색 테두리를 없앱니다.

// transition-all: 색상이나 모양이 바뀔 때 애니메이션 효과를 줍니다.

// font-black text-slate-700: 입력되는 글자는 아주 두껍고 진한 회색입니다.

// placeholder:text-slate-300: 안내 문구(placeholder)는 연한 회색입니다.

// focus:bg-white: (포커스 효과) 클릭하면 배경이 완전 흰색이 됩니다.

// focus:border-green-400: (포커스 효과) 클릭하면 테두리가 초록색이 됩니다.

// focus:ring-[6px] focus:ring-green-50/50: (포커스 효과) 클릭하면 테두리 바깥에 6px 두께의 반투명한 초록색 링(광채)이 생깁니다.

// disabled:opacity-50: 입력 불가능 상태(disabled)가 되면 전체적으로 흐릿하게(50%) 만듭니다.

// TypeScript

//     </div>
//   </div>
// );
// 해석: relative group div를 닫고, 전체 포장지 div를 닫고, 컴포넌트를 마칩니다.
