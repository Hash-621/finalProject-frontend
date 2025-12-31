export default function Page() {
  return (
    <article className="prose prose-slate max-w-none">
      <h1 className="text-3xl font-black mb-10">이용약관</h1>

      <section className="mb-8">
        <h2 className="text-xl font-bold mb-4">제 1 조 (목적)</h2>
        <p className="text-slate-600 leading-relaxed">
          본 약관은 대전 꿀잼 투어(이하 "회사")가 제공하는 제반 서비스의 이용과
          관련하여 회사와 회원 및 이용자의 권리, 의무 및 책임사항을 규정함을
          목적으로 합니다.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-bold mb-4">제 2 조 (용어의 정의)</h2>
        <ul className="list-disc pl-5 text-slate-600 space-y-2">
          <li>
            "서비스"란 회사가 제공하는 대전 관광 코스 큐레이션 및 관련 정보를
            의미합니다.
          </li>
          <li>
            "이용자"란 서비스를 이용하는 모든 회원 및 비회원을 의미합니다.
          </li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-bold mb-4">
          제 3 조 (서비스의 제공 및 변경)
        </h2>
        <p className="text-slate-600 leading-relaxed">
          회사는 이용자에게 대전의 관광 정보, 1박 2일 추천 코스 등의 정보를 무료
          혹은 유료로 제공하며, 정보의 정확성을 위해 지속적으로 관리합니다.
        </p>
      </section>

      <p className="text-sm text-slate-400 mt-20">
        공고일자: 2025년 12월 22일 / 시행일자: 2025년 12월 30일
      </p>
    </article>
  );
}
