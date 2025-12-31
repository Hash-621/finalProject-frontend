import { MenuStructure } from "@/types/menu";

export const menuData: MenuStructure = {
  pages: [
    { name: "뉴스", href: "/news", src: "/images/quick-menu1.png" },
    { name: "구인구직", href: "/job", src: "/images/quick-menu7.png" },
    {
      name: "관광지",
      href: "/tour/attraction",
      src: "/images/quick-menu3.png",
      children: [
        {
          name: "추천관광지",
          href: "/tour/attraction",
          src: "",
        },
        {
          name: "추천코스",
          href: "/tour/route",
          src: "",
        },
      ],
    },
    { name: "맛집", href: "/restaurant", src: "/images/quick-menu4.png" },
    { name: "병원", href: "/hospital", src: "/images/quick-menu5.png" },
    {
      name: "커뮤니티",
      href: "/community/free",
      src: "/images/quick-menu6.png",
      children: [
        {
          name: "자유게시판",
          href: "/community/free",
          src: "",
        },
        {
          name: "추천게시판",
          href: "/community/recommend",
          src: "",
        },
      ],
    },
  ],
};
