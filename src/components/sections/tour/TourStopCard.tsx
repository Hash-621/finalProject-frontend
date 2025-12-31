"use client";
import Link from "next/link";
import { MapPin } from "lucide-react";

export default function TourStopCard({ stop }: { stop: any }) {
  return (
    <Link
      href={`/tour/route/${stop.courseNumber}`}
      className="relative block aspect-3/4 group"
    >
      <div
        className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 group-hover:scale-110"
        style={{ backgroundImage: `url(${stop.src})` }}
      />
      <div className="absolute inset-0 bg-linear-to-t from-[#020617] via-transparent to-black/20" />
      <div className="absolute bottom-0 left-0 p-8 w-full space-y-3">
        <div className="flex gap-2">
          <span className="bg-green-600 text-[10px] font-black px-2 py-0.5 rounded text-white italic">
            {stop.day}
          </span>
        </div>
        <h4 className="text-2xl font-bold text-white group-hover:text-green-400 transition-colors">
          {stop.name}
        </h4>
        <div className="flex items-center gap-1.5 text-slate-400 text-xs">
          <MapPin className="w-3.5 h-3.5 text-green-500/70" />
          <span>{stop.location || "대전광역시"}</span>
        </div>
      </div>
    </Link>
  );
}
