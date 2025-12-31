"use client";

import Link from "next/link";
import { MapPin } from "lucide-react";
import { RestaurantData } from "@/types/restaurant";

interface Props {
  item: RestaurantData;
}

export default function RestaurantCard({ item }: Props) {
  return (
    <div className="relative h-full overflow-hidden rounded-4xl group">
      <div
        className="absolute inset-0 bg-cover bg-center transition-transform duration-700 ease-out group-hover:scale-110"
        style={{
          backgroundImage: item.imagePath
            ? `linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,0.1) 100%), url(/images/restaurantImages/${item.imagePath})`
            : "none",
          backgroundColor: item.imagePath ? "transparent" : "#111",
        }}
      />

      <div className="relative h-full flex flex-col justify-end p-6 text-white">
        <div className="animate-fadeIn">
          <div className="inline-block px-2 py-1 bg-green-500 text-white text-[10px] font-black rounded-md tracking-tighter shadow-sm mb-2 uppercase">
            {item.restCategory}
          </div>

          <h2 className="text-xl font-bold mb-2 line-clamp-1 group-hover:text-orange-400 transition-colors">
            {item.name}
          </h2>

          <div className="space-y-1 mb-6 opacity-90">
            <p className="text-sm font-light line-clamp-1 italic text-orange-200">
              {item.bestMenu ? `"${item.bestMenu}"` : "대전의 숨은 맛집"}
            </p>
            <p className="text-[11px] font-light text-gray-300 flex items-center gap-1">
              <MapPin className="w-3 h-3 text-green-400" />
              <span className="line-clamp-1">{item.address}</span>
            </p>
          </div>

          <Link
            href={`/restaurant/${item.id}`}
            className="inline-block w-full text-center py-2.5 border border-white/30 backdrop-blur-sm rounded-xl text-xs font-bold hover:bg-green-600 hover:border-green-600 transition-all duration-300"
          >
            상세정보 보기
          </Link>
        </div>
      </div>
    </div>
  );
}
