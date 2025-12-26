export interface TourStop {
  name: string;
  location: string;
  src: string;
  text: string;
}

export interface DayRoute {
  day: string;
  name: string;
  route: string;
  detail: TourStop[];
}

export interface TourCurse {
  number: number;
  title: string;
  subTitle: string;
  text: string;
  src: string;
  tour: DayRoute[];
}

export interface CurseStructure {
  tours: TourCurse[];
}

export interface Tour {
  id: number;
  name: string;
  address: string;
  phone: string;
  description: string;
  image: string;
}
