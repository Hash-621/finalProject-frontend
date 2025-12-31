import React from "react";

export const AuthLoadingView = ({ status }: { status: string }) => (
  <div className="min-h-screen flex flex-col justify-center items-center bg-[#fcfdfc] gap-8">
    <div className="relative flex items-center justify-center">
      <div className="w-20 h-20 border-4 border-slate-100 rounded-full"></div>
      <div className="absolute w-20 h-20 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
      <div className="absolute text-green-500 font-black text-[10px] tracking-tighter animate-pulse">
        GO
      </div>
    </div>
    <div className="text-center space-y-3">
      <h2 className="text-3xl font-black text-slate-900 tracking-tighter">
        SECURE <span className="text-green-500 italic font-serif">LOGIN</span>
      </h2>
      <p className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] animate-pulse">
        {status}
      </p>
    </div>
    <div className="flex gap-2">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="w-1.5 h-1.5 bg-slate-200 rounded-full animate-bounce"
          style={{ animationDelay: `${i * 0.2}s` }}
        />
      ))}
    </div>
  </div>
);
