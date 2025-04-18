
import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { useIsMobile } from "@/hooks/use-mobile";
import { PortfolioHeader } from "@/components/portfolio/PortfolioHeader";
import { PortfolioSummary } from "@/components/portfolio/PortfolioSummary";
import { NoPositions } from "@/components/portfolio/NoPositions";
import { ActivePositions } from "@/components/portfolio/ActivePositions";
import { LoadingState } from "@/components/portfolio/LoadingState";
import { useNavigate } from "react-router-dom";
import { PortfolioProvider, usePortfolio } from "@/contexts/PortfolioContext";

// Portfolio content component that consumes the portfolio context
const PortfolioContent = () => {
  const isMobile = useIsMobile();
  const { state } = usePortfolio();
  const { positions, totalValue, loading, error, hasPositions } = state;

  if (loading) {
    return <LoadingState />;
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 text-center">
        <p className="text-red-500 mb-4">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (hasPositions) {
    return (
      <div className="space-y-5">
        <ActivePositions 
          positions={positions}
          isMobile={isMobile}
        />

        <PortfolioSummary
          totalValue={totalValue}
          isMobile={isMobile}
        />
      </div>
    );
  }

  return <NoPositions onShowDemoData={() => {}} />;
};

// Main Portfolio page component that provides the context
const Portfolio = () => {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  
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

  // Don't render anything until we've checked for wallet address
  if (!walletAddress) {
    return <LoadingState />;
  }

  return (
    <PortfolioProvider>
      <div className="min-h-screen bg-gray-50 pb-20">
        <Header title="Lending Portfolio" />

        <main className="container max-w-5xl mx-auto px-3 sm:px-4 pt-4 sm:pt-6">
          <PortfolioHeader 
            title="Your Lending Portfolio" 
            subtitle="Track and manage your positions across all lending pools."
          />

          <PortfolioContent />
        </main>
      </div>
    </PortfolioProvider>
  );
};

export default Portfolio;
