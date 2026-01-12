// 1. "use client": 브라우저 전용 기능(Link 등)을 사용하기 위해 선언합니다.
"use client";

// 2. Next.js의 링크 기능과 이미지 최적화 기능을 가져옵니다.
import Link from "next/link";
import Image from "next/image";
// 3. 예쁜 아이콘들을 라이브러리에서 가져옵니다.
import { Facebook, Twitter, Youtube, Instagram } from "lucide-react";

// ==================================================================
// [Main Component] Footer 컴포넌트 시작
// ==================================================================
export default function Footer() {
  return (
    // footer 태그: 시맨틱 태그를 사용하여 "여기가 바닥글이야"라고 검색엔진에 알립니다.
    // 스타일: 어두운 배경(slate-900), 회색 글씨(gray-400), 위쪽에 얇은 선(border-t)
    <footer className="bg-slate-900 text-gray-400 py-16 border-t border-slate-800">
      {/* 내용물을 감싸는 중앙 정렬 박스 (최대 너비 제한) */}
      <div className="max-w-7xl mx-auto px-6">
        {/* 3단 그리드 레이아웃: 모바일은 1열, PC(lg)는 3열로 배치 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mb-12">
          {/* [Section 1] 왼쪽: 로고 및 기업 정보 */}
          <div className="space-y-6">
            {/* 로고 클릭 시 메인으로 이동 */}
            <Link href="/">
              <Image
                src="\images\f_logo.svg" // 로고 이미지 경로
                alt="로고"
                width={90}
                height={25}
                className="object-fill md:w-[103px] md:h-[29px]" // 반응형 크기 조절
              />
            </Link>

            {/* 주소 및 연락처 정보 */}
            <div className="text-sm leading-relaxed space-y-2 mt-4">
              <p className="flex gap-3">
                <span className="text-slate-500 w-12 shrink-0">주소</span>
                <span className="text-slate-300">
                  대전광역시 중구 계룡로 825 희영빌딩 2층
                </span>
              </p>
              <p className="flex gap-3">
                <span className="text-slate-500 w-12 shrink-0">고객센터</span>
                <span className="text-slate-300 font-bold">070-0000-0000</span>
              </p>
            </div>
          </div>

          {/* [Section 2] 가운데: 주요 정책 메뉴 */}
          {/* lg:justify-center -> PC에서는 가운데 정렬 */}
          <div className="flex lg:justify-center items-start">
            <div className="flex flex-col space-y-4">
              <h3 className="text-white font-bold text-sm uppercase tracking-wider">
                Policy
              </h3>
              <Link
                href="/policy/terms"
                className="text-sm hover:text-green-500 transition-colors"
              >
                이용약관
              </Link>
              <Link
                href="/policy/privacy"
                // 개인정보처리방침은 중요하니까 좀 더 눈에 띄게 (font-extrabold, 색상 강조)
                className="text-sm hover:text-green-500 transition-colors font-extrabold text-slate-300"
              >
                개인정보처리방침
              </Link>
            </div>
          </div>

          {/* [Section 3] 오른쪽: SNS 아이콘 및 저작권 표시 */}
          {/* lg:items-end -> PC에서는 오른쪽 끝으로 붙임 */}
          <div className="flex flex-col items-start lg:items-end justify-between space-y-8 w-full">
            {/* SNS 아이콘 모음 (아래에 정의한 SocialIcon 컴포넌트 사용) */}
            <div className="flex items-center gap-3">
              <SocialIcon icon={<Facebook size={16} />} />
              <SocialIcon icon={<Twitter size={16} />} />
              <SocialIcon icon={<Youtube size={16} />} />
              <SocialIcon icon={<Instagram size={16} />} />
            </div>

            {/* 저작권 문구 */}
            <div className="text-right">
              <p className="text-xs text-slate-600 leading-loose lg:text-right">
                Copyright ⓒ TEAM202507_1.
                <br />
                All rights reserved.
              </p>
            </div>
          </div>
        </div>

        {/* [Bottom Bar] 최하단 버전 정보 */}
        {/* 위쪽에 아주 연한 선을 긋고 작게 표시 */}
        <div className="border-t border-slate-800/50 pt-8 mt-8 ">
          <p className="text-[10px] text-slate-700 uppercase tracking-widest">
            Daejeon Community Platform v1.0
          </p>
        </div>
      </div>
    </footer>
  );
}

// ==================================================================
// [Sub Component] SNS 아이콘 버튼 (재사용용)
// 동그라미 모양에 마우스 올리면 하얘지는 효과를 가짐
// ==================================================================
function SocialIcon({ icon }: { icon: React.ReactNode }) {
  return (
    <a
      href="#"
      className="w-9 h-9 rounded-full border border-white/20 flex items-center justify-center text-gray-400 hover:text-white hover:border-white transition-all duration-300 hover:bg-white/10"
    >
      {icon}
    </a>
  );
}

// 배치 (Layout): 화면 맨 아래에 어두운 남색(bg-slate-900)의 묵직한 가로 바가 깔립니다.

// 구성 (Grid): 내부는 크게 3개의 덩어리로 나뉩니다. (PC 화면 기준)

// 왼쪽: "다잇슈" 로고와 회사 주소, 고객센터 전화번호가 있습니다.

// 가운데: "Policy"라는 제목 아래 이용약관, 개인정보처리방침 링크가 세로로 나열됩니다.

// 오른쪽: 페이스북, 트위터 같은 동그란 SNS 아이콘들이 있고, 그 아래에 "Copyright ⓒ..." 저작권 문구가 오른쪽 정렬되어 있습니다.

// 반응형 (Mobile): 모바일 화면에서는 이 3개의 덩어리가 세로로 층층이 쌓여서 길게 보입니다.

// 디테일:

// SNS 아이콘에 마우스를 올리면 하얀색 테두리가 밝게 빛나며 배경이 살짝 생깁니다.

// 맨 아래에는 아주 작은 글씨로 버전 정보(v1.0)가 적혀 있어 전문적인 느낌을 줍니다.
