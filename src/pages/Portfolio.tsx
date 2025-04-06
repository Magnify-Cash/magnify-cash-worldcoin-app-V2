import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { useIsMobile } from "@/hooks/use-mobile";
import { PortfolioHeader } from "@/components/portfolio/PortfolioHeader";
import { PortfolioSummary } from "@/components/portfolio/PortfolioSummary";
import { NoPositions } from "@/components/portfolio/NoPositions";
import { ActivePositions } from "@/components/portfolio/ActivePositions";
import { LoadingState } from "@/components/portfolio/LoadingState";
import { useUserPoolPositions } from "@/hooks/useUserPoolPositions";
import { useNavigate } from "react-router-dom";
import { useCacheListener, EVENTS } from '@/hooks/useCacheListener';
import { toast } from '@/components/ui/use-toast';

const Portfolio = () => {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [updateTrigger, setUpdateTrigger] = useState<number>(0);
  const [processedTransactions] = useState<Set<string>>(new Set());
  
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
  
  // Listen for transaction events to force refresh
  useCacheListener(EVENTS.TRANSACTION_COMPLETED, (data) => {
    if (!data || (data.transactionId && processedTransactions.has(data.transactionId))) {
      return;
    }
    
    // Track processed transaction to avoid duplicates
    if (data.transactionId) {
      processedTransactions.add(data.transactionId);
    }
    
    console.log('[Portfolio] Transaction event detected, triggering update');
    setUpdateTrigger(prev => prev + 1);
  });

  // Listen for user position updates to refresh the portfolio
  useCacheListener(EVENTS.USER_POSITION_UPDATED, (data) => {
    if (walletAddress && data.key && data.key.includes(walletAddress)) {
      console.log('[Portfolio] User position cache update detected, refreshing positions');
      setUpdateTrigger(prev => prev + 1);
    }
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
          <div className="space-y-5" key={`portfolio-content-${updateTrigger}`}>
            <ActivePositions 
              positions={positions}
              isMobile={isMobile}
              refreshPositions={refreshPositions}
              updateUserPositionOptimistically={updateUserPositionOptimistically}
            />

            <PortfolioSummary
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
