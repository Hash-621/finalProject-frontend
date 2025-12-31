export interface SubMenuItem {
  name: string;
  href: string;
  src: string;
}

export interface MenuItem {
  name: string;
  href: string;
  src: string;
  children?: SubMenuItem[];
}

export interface MenuStructure {
  pages: MenuItem[];
}
