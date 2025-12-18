export interface RestaurantData {
  id: number;
  category: string;
  name: string;
  address: string | null;
  addressDetail: string | null;
  phone: string | null;
  openTime: string | null;
  restCategory: string | null;
  bestMenu: string | null;
  menu: string[] | null;
  menuDetail: string[] | null;
  price: string[] | null;
  url: string | null;
  imagePath: string;
}
