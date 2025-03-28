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
  const [showDummyData, setShowDummyData] = useState(true);
  
  const [demoBalances, setDemoBalances] = useState<Record<number, number>>({
    1: 1200,
    2: 500,
    3: 300,
    4: 800,
    5: 600
  });
  
  const [demoDepositedValues, setDemoDepositedValues] = useState<Record<number, number>>({
    1: 1200,
    2: 500,
    3: 300,
    4: 800,
    5: 600
  });
  
  const [demoCurrentValues, setDemoCurrentValues] = useState<Record<number, number>>({
    1: 1250.75,
    2: 520.50,
    3: 305.20,
    4: 812.40,
    5: 618.30
  });
  
  const [demoEarnings, setDemoEarnings] = useState<Record<number, number>>({
    1: 50.75,
    2: 20.50,
    3: 5.20,
    4: 12.40,
    5: 18.30
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const poolsData = await getPools();
        setPools(poolsData);
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

  const calculateTotals = () => {
    let totalValue = 0;
    let totalEarnings = 0;
    
    pools.forEach(pool => {
      if (demoCurrentValues[pool.id]) {
        totalValue += demoCurrentValues[pool.id];
      }
      
      if (demoEarnings[pool.id]) {
        totalEarnings += demoEarnings[pool.id];
      }
    });
    
    return { totalValue, totalEarnings };
  };
  
  const { totalValue, totalEarnings } = calculateTotals();

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Header title="Your Lending Portfolio" />

      <main className="container max-w-5xl mx-auto px-3 sm:px-4 pt-4 sm:pt-6">
        <PortfolioHeader 
          title="Your Lending Portfolio" 
          subtitle="Track and manage your positions across all lending pools."
        />

        {loading ? (
          <LoadingState />
        ) : showDummyData && pools.length > 0 ? (
          <div className="space-y-5">
            <ActivePositions 
              pools={pools}
              balances={demoBalances}
              depositedValues={demoDepositedValues}
              currentValues={demoCurrentValues}
              earnings={demoEarnings}
              isMobile={isMobile}
              onRemoveDemoData={() => setShowDummyData(false)}
            />

            <PortfolioSummary
              totalValue={totalValue}
              totalEarnings={totalEarnings}
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
