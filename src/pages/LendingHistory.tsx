
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Card, CardContent } from "@/components/ui/card";
import { HistoryIcon, ExternalLink } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

// Define a transaction type for lending activities
interface LendingTransaction {
  id: number;
  created_at: string;
  type: "deposit" | "withdrawal";
  amount: number;
  currency: string;
  pool_id: number;
  pool_name: string;
  lp_tokens: number;
  pool_token: string;
}

const LendingHistory = () => {
  const [transactions, setTransactions] = useState<LendingTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  
  // Demo transactions for now - in a real app, these would come from the database
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading(true);
        
        // In a real implementation, this would fetch from Supabase
        // const { data, error } = await supabase
        //   .from('lending_transactions')
        //   .select('*')
        //   .order('created_at', { ascending: false });
        
        // if (error) throw error;
        
        // For demo purposes, we'll use mock data
        const mockTransactions: LendingTransaction[] = [
          {
            id: 1,
            created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
            type: "deposit",
            amount: 1000,
            currency: "USDC",
            pool_id: 1,
            pool_name: "Default Resistant Pool",
            lp_tokens: 980.5,
            pool_token: "DFLP"
          },
          {
            id: 2,
            created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
            type: "deposit",
            amount: 500,
            currency: "USDC",
            pool_id: 2,
            pool_name: "High Uptake Pool",
            lp_tokens: 490.2,
            pool_token: "HULP"
          },
          {
            id: 3,
            created_at: new Date(Date.now() - 86400000 * 7).toISOString(),
            type: "withdrawal",
            amount: 200,
            currency: "USDC",
            pool_id: 3,
            pool_name: "Fast Cycle Pool",
            lp_tokens: 198.3,
            pool_token: "FCLP"
          }
        ];
        
        setTransactions(mockTransactions);
      } catch (error) {
        console.error("Error fetching lending transactions:", error);
        toast({
          title: "Error",
          description: "Failed to load your lending transaction history.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchTransactions();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Header title="Lending History" />
      
      <main className="container max-w-5xl mx-auto px-3 sm:px-4 pt-4 sm:pt-6">
        <div className="mb-5 sm:mb-6">
          <div className="flex justify-center mb-2">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-[#1A1E8F] via-[#5A1A8F] to-[#A11F75] text-transparent bg-clip-text text-center">
              Your Lending History
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-gray-700 mb-4 max-w-3xl mx-auto text-center">
            Track all your lending activities across different pools.
          </p>
        </div>
        
        {loading ? (
          <div className="grid grid-cols-1 gap-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-4">
                  <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : transactions.length > 0 ? (
          <div className="space-y-4">
            {transactions.map((tx) => (
              <Card key={tx.id} className="overflow-hidden hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-medium text-sm">
                        {tx.type === "deposit" ? "Supplied to" : "Withdrew from"} {tx.pool_name}
                      </h3>
                      <p className="text-xs text-gray-500">
                        {new Date(tx.created_at).toLocaleDateString()} at {new Date(tx.created_at).toLocaleTimeString()}
                      </p>
                    </div>
                    <div 
                      className="cursor-pointer"
                      onClick={() => navigate(`/pool/${tx.pool_id}`)}
                    >
                      <ExternalLink className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 mt-3">
                    <div>
                      <p className="text-xs text-gray-500">{tx.currency}</p>
                      <p className={`text-sm font-medium ${tx.type === "deposit" ? "text-red-600" : "text-green-600"}`}>
                        {tx.type === "deposit" ? "-" : "+"}{tx.amount} {tx.currency}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">{tx.pool_token}</p>
                      <p className={`text-sm font-medium ${tx.type === "deposit" ? "text-green-600" : "text-red-600"}`}>
                        {tx.type === "deposit" ? "+" : "-"}{tx.lp_tokens.toFixed(2)} {tx.pool_token}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="mb-4">
              <HistoryIcon className="h-12 w-12 mx-auto text-gray-300" />
            </div>
            <h3 className="text-lg font-medium text-gray-800 mb-2">No lending history yet</h3>
            <p className="text-sm text-gray-600 mb-6 max-w-md mx-auto">
              When you supply liquidity to pools or withdraw your funds, your transactions will appear here.
            </p>
            <button 
              onClick={() => navigate("/lending")}
              className="px-4 py-2 text-sm rounded-md bg-gradient-to-r from-[#1A1E8F] via-[#5A1A8F] to-[#A11F75] text-white hover:opacity-90"
            >
              Explore Lending Pools
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default LendingHistory;
