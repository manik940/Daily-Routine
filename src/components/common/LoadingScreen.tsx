import React from "react";

interface LoadingScreenProps {
  message?: string;
}

export default function LoadingScreen({ message = "লোড হচ্ছে, দয়া করে অপেক্ষা করুন..." }: LoadingScreenProps) {
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white" style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" }}>
      <div className="relative w-[80px] h-[80px]">
        <div className="absolute w-full h-full border-[4px] border-[#f3f4f6] rounded-full"></div>
        <div 
          className="absolute w-full h-full border-[4px] border-transparent border-t-[#10b981] rounded-full"
          style={{ animation: 'spin 0.8s ease-in-out infinite' }}
        ></div>
      </div>
      <div className="mt-6 text-center">
        <h1 className="m-0 text-[#111827] text-[20px] font-bold tracking-tight">Daily Routine</h1>
        <p className="mt-2 text-[#6b7280] text-[14px] font-medium">{message}</p>
      </div>
      <style>{`
        @keyframes spin { 
          0% { transform: rotate(0deg); } 
          100% { transform: rotate(360deg); } 
        }
      `}</style>
    </div>
  );
}
