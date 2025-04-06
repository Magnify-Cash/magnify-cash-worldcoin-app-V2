
import { useState, useEffect, useCallback, useRef } from "react";
import { Header } from "@/components/Header";
import { useIsMobile } from "@/hooks/use-mobile";
import { PortfolioHeader } from "@/components/portfolio/PortfolioHeader";
import { PortfolioSummary } from "@/components/portfolio/PortfolioSummary";
import { NoPositions } from "@/components/portfolio/NoPositions";
import { ActivePositions } from "@/components/portfolio/ActivePositions";
import { LoadingState } from "@/components/portfolio/LoadingState";
import { useUserPoolPositions } from "@/hooks/useUserPoolPositions";
import { useNavigate } from "react-router-dom";
import { useCacheListener, EVENTS, TRANSACTION_TYPES } from '@/hooks/useCacheListener';
import { toast } from '@/components/ui/use-toast';

const Portfolio = () => {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [updateTrigger, setUpdateTrigger] = useState<number>(0);
  const [positionUpdateKey, setPositionUpdateKey] = useState<number>(0);
  const [portfolioTotalKey, setPortfolioTotalKey] = useState<number>(0);
  const processedTransactions = useRef<Set<string>>(new Set());
  
  // Get user's wallet address from localStorage
  useEffect(() => {
    const ls_wallet = localStorage.getItem("ls_wallet_address");
    if (!ls_wallet) {
      // Redirect to welcome page if no wallet address is found
      navigate("/welcome");
      return;
    }
    setWalletAddress(ls_wallet);
  }, [navigate]);
  
  // Force refresh function - can be called to immediately trigger a data refresh
  const forceRefresh = useCallback(() => {
    console.log('[Portfolio] Force refreshing portfolio data');
    setUpdateTrigger(prev => prev + 1);
  }, []);
  
  // Handle position updates - this will force a re-render of position components
  const forcePositionUpdate = useCallback(() => {
    console.log('[Portfolio] Force updating position UI');
    setPositionUpdateKey(prev => prev + 1);
  }, []);
  
  // Handle portfolio total updates - this will force a re-render of the summary component
  const forcePortfolioTotalUpdate = useCallback(() => {
    console.log('[Portfolio] Force updating portfolio total');
    setPortfolioTotalKey(prev => prev + 1);
  }, []);

  // Listen for transaction events to update UI immediately
  useCacheListener(EVENTS.TRANSACTION_COMPLETED, (data) => {
    if (!data) return;
    
    // Skip if we've already processed this transaction
    if (data.transactionId && processedTransactions.current.has(data.transactionId)) {
      console.log('[Portfolio] Skipping already processed transaction:', data.transactionId);
      return;
    }
    
    // Track processed transactions
    if (data.transactionId) {
      console.log('[Portfolio] Processing transaction:', data.transactionId, data.type);
      processedTransactions.current.add(data.transactionId);
    }
    
    // Update UI components independently
    forcePositionUpdate();
    forcePortfolioTotalUpdate();
    
    // Also queue a background refresh after a short delay
    setTimeout(() => {
      forceRefresh();
    }, 500);
  });

  const { 
    positions, 
    totalValue, 
    loading, 
    error, 
    hasPositions,
    refreshPositions,
    updateUserPositionOptimistically
  } = useUserPoolPositions(walletAddress || "", updateTrigger);

  // Don't render anything until we've checked for wallet address
  if (!walletAddress) {
    return <LoadingState />;
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Header title="Lending Portfolio" />

      <main className="container max-w-5xl mx-auto px-3 sm:px-4 pt-4 sm:pt-6">
        <PortfolioHeader 
          title="Your Lending Portfolio" 
          subtitle="Track and manage your positions across all lending pools."
        />

        {loading ? (
          <LoadingState />
        ) : error ? (
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <p className="text-red-500 mb-4">{error}</p>
            <button 
              onClick={refreshPositions}
              className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
            >
              Try Again
            </button>
          </div>
        ) : hasPositions ? (
          <div className="space-y-5">
            <ActivePositions 
              key={`positions-${positionUpdateKey}-${updateTrigger}`}
              positions={positions}
              isMobile={isMobile}
              refreshPositions={forceRefresh}
              updateUserPositionOptimistically={updateUserPositionOptimistically}
            />

            <PortfolioSummary
              key={`summary-${portfolioTotalKey}-${updateTrigger}-${positionUpdateKey}`}
              totalValue={totalValue}
              isMobile={isMobile}
            />
          </div>
        ) : (
          <NoPositions onShowDemoData={() => {}} />
        )}
      </main>
    </div>
  );
};

export default Portfolio;
