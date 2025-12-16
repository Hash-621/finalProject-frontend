export interface MenuItem {
  name: string;
  href: string;
  src: string;
  children?: MenuItem[];
}

export interface MenuStructure {
  pages: MenuItem[];
}

export const menuData: MenuStructure = {
  pages: [
    { name: "뉴스", href: "/news", src: "/images/quick-menu1.png" },
    { name: "구인구직", href: "/jobs", src: "/images/quick-menu2.png" },
    { name: "관광지", href: "/attractions", src: "/images/quick-menu3.png" },
    { name: "맛집", href: "/restaurants", src: "/images/quick-menu4.png" },
    { name: "병원", href: "/hospitals", src: "/images/quick-menu5.png" },
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
