
import React, { useState } from 'react';

/**
 * A banner component that informs users they are using a demo version
 * without actual World ID authentication or World Wallet.
 */
const DemoBanner: React.FC = () => {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-blue-600 text-white p-3 z-50">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex-1">
          <p className="text-sm font-medium">
            <span className="font-bold">Demo Mode:</span> You're using a demo version with simulated verification and loans. No actual blockchain transactions are occurring.
          </p>
        </div>
        <button 
          onClick={() => setIsVisible(false)}
          className="ml-4 bg-white bg-opacity-20 rounded-full p-1 hover:bg-opacity-30 transition-colors"
          aria-label="Close banner"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default DemoBanner;
