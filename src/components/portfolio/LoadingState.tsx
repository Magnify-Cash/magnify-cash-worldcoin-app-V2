
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
          <div className="orbit-spinner">
            <div className="orbit"></div>
            <div className="orbit"></div>
            <div className="center"></div>
          </div>
        </div>
        <p className="text-gray-500 text-center">{message}</p>
      </div>
    </div>
  );
};
