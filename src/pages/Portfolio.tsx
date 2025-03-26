
import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { getPools, getUserPoolPosition } from "@/lib/poolRequests";
import { LiquidityPool } from "@/types/supabase/liquidity";
import { toast } from "@/components/ui/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { PortfolioHeader } from "@/components/portfolio/PortfolioHeader";
import { PortfolioSummary } from "@/components/portfolio/PortfolioSummary";
import { NoPositions } from "@/components/portfolio/NoPositions";
import { ActivePositions } from "@/components/portfolio/ActivePositions";
import { LoadingState } from "@/components/portfolio/LoadingState";

const Portfolio = () => {
  const isMobile = useIsMobile();
  const [loading, setLoading] = useState(true);
  const [pools, setPools] = useState<LiquidityPool[]>([]);
  const [activePool, setActivePool] = useState<LiquidityPool | null>(null);
  const [showDummyData, setShowDummyData] = useState(true);
  const [userPosition, setUserPosition] = useState({
    balance: 1200,
    depositedValue: 1200,
    currentValue: 1250.75,
    earnings: 50.75
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const poolsData = await getPools();
        setPools(poolsData);
        
        const userPositionData = await getUserPoolPosition(1);
        
        if (userPositionData) {
          const poolWithPosition = poolsData.find(pool => pool.id === 1);
          if (poolWithPosition) {
            setActivePool(poolWithPosition);
          }
        }
      } catch (error) {
        console.error("Error fetching portfolio data:", error);
        toast({
          title: "Error",
          description: "Could not load your portfolio data. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-white pb-20">
      <Header title="Lending Portfolio" />

      <main className="container max-w-5xl mx-auto px-3 sm:px-4 pt-4 sm:pt-6">
        <PortfolioHeader 
          title="Your Lending Portfolio" 
          subtitle="Track and manage your positions across all lending pools."
        />

        {loading ? (
          <LoadingState />
        ) : showDummyData && activePool ? (
          <div className="space-y-6">
            <ActivePositions 
              pool={activePool}
              balance={userPosition.balance}
              depositedValue={userPosition.depositedValue}
              currentValue={userPosition.currentValue}
              earnings={userPosition.earnings}
              isMobile={isMobile}
              onRemoveDemoData={() => setShowDummyData(false)}
            />

            <PortfolioSummary
              currentValue={userPosition.currentValue}
              earnings={userPosition.earnings}
              isMobile={isMobile}
            />
          </div>
        ) : (
          <NoPositions onShowDemoData={() => setShowDummyData(true)} />
        )}
      </main>
    </div>
  );
};

export default Portfolio;
