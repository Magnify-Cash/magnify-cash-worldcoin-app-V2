
import React from "react";

interface PortfolioHeaderProps {
  title: string;
  subtitle: string;
}

export const PortfolioHeader: React.FC<PortfolioHeaderProps> = ({ title, subtitle }) => {
  return (
    <div className="mb-6 sm:mb-8">
      <div className="flex justify-center mb-2 sm:mb-4">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-[#1A1E8F] via-[#5A1A8F] to-[#A11F75] text-transparent bg-clip-text text-center">
          {title}
        </h1>
      </div>
      <p className="text-sm sm:text-base text-gray-700 mb-4 max-w-3xl mx-auto text-center">
        {subtitle}
      </p>
    </div>
  );
};
