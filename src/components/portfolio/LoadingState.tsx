
import React from "react";

interface LoadingStateProps {
  message?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({ 
  message = "Loading your portfolio..." 
}) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-6 flex flex-col items-center justify-center">
        <div className="py-8 flex justify-center items-center">
        <div className="dot-spinner">
          <div className="dot bg-[#1A1E8E]"></div>
          <div className="dot bg-[#4A3A9A]"></div>
          <div className="dot bg-[#7A2F8A]"></div>
          <div className="dot bg-[#A11F75]"></div>
        </div>
        </div>
        <p className="text-gray-500 text-center">{message}</p>
      </div>
    </div>
  );
};
