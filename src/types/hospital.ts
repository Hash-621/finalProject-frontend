export interface Hospital {
  id: number;
  name: string;
  category: string;
  address: string;
  lat: number;
  lng: number;
}

export interface HospitalResponse {
  id: number;
  name: string;
  treatCategory: string;
  address: string;
}
