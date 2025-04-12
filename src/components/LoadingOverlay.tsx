
import React from "react";

interface LoadingOverlayProps {
  message?: string;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  message = "Processing, please wait..."
}) => {
  return (
    <div className="fixed top-0 left-0 w-full h-full bg-black/70 flex flex-col items-center justify-center z-50">
      <div className="flex justify-center">
        <div className="orbit-spinner">
          <div className="orbit"></div>
          <div className="orbit"></div>
          <div className="center"></div>
        </div>
      </div>
      <p className="text-white text-center max-w-md px-4 text-lg font-medium mt-4">
        {message}
      </p>
    </div>
  );
};
