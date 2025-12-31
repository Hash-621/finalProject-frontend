import { useState, useEffect } from "react";
import { hospitalService } from "@/api/services";
import { Hospital, HospitalResponse } from "@/types/hospital";

export const useHospitalMap = (isMapLoaded: boolean) => {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [filteredHospitals, setFilteredHospitals] = useState<Hospital[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [isDataFetching, setIsDataFetching] = useState(true);
  const [keyword, setKeyword] = useState("");

  useEffect(() => {
    if (!isMapLoaded || !window.kakao?.maps?.services) return;

    const fetchAndGeocode = async () => {
      try {
        setIsDataFetching(true);
        const { data } = await hospitalService.getHospitals();
        const geocoder = new window.kakao.maps.services.Geocoder();
        const categorySet = new Set<string>();

        const promises = data.map((item: HospitalResponse) => {
          return new Promise<Hospital | null>((resolve) => {
            geocoder.addressSearch(item.address, (result, status) => {
              if (status === window.kakao.maps.services.Status.OK) {
                categorySet.add(item.treatCategory);
                resolve({
                  id: item.id,
                  name: item.name,
                  category: item.treatCategory,
                  address: item.address,
                  lat: Number(result[0].y),
                  lng: Number(result[0].x),
                });
              } else resolve(null);
            });
          });
        });

        const results = await Promise.all(promises);
        const validData = results.filter((h): h is Hospital => h !== null);

        setHospitals(validData);
        setFilteredHospitals(validData);
        setCategories(Array.from(categorySet));
      } catch (err) {
        console.error(err);
      } finally {
        setIsDataFetching(false);
      }
    };
    fetchAndGeocode();
  }, [isMapLoaded]);

  useEffect(() => {
    const filtered = hospitals.filter(
      (h) =>
        h.name.toLowerCase().includes(keyword.toLowerCase()) ||
        h.category.toLowerCase().includes(keyword.toLowerCase())
    );
    setFilteredHospitals(filtered);
  }, [keyword, hospitals]);

  return {
    hospitals,
    filteredHospitals,
    setFilteredHospitals,
    categories,
    isDataFetching,
    keyword,
    setKeyword,
  };
};
