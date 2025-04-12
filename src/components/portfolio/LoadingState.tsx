
import React from "react";

interface LoadingStateProps {
  message?: string;
  fullScreen?: boolean;
}

export const LoadingState: React.FC<LoadingStateProps> = ({ 
  message = "Loading your portfolio...",
  fullScreen = false
}) => {
  if (fullScreen) {
    return (
      <div className="fixed top-0 left-0 w-full h-full bg-black/70 flex flex-col items-center justify-center z-50">
        <div className="flex justify-center">
          <div className="orbit-spinner">
            <div className="orbit"></div>
            <div className="orbit"></div>
            <div className="center"></div>
          </div>
        </div>
        <p className="text-white text-center max-w-md px-4 text-lg font-medium mt-4">{message}</p>
      </div>
    );
  }
  
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
