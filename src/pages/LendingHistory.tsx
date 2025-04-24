
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Card, CardContent } from "@/components/ui/card";
import { HistoryIcon, ArrowUpRight, ArrowDownLeft } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { toast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { getUserLendingHistory } from "@/lib/backendRequests";
import { format } from "date-fns";
import { UserLendingHistoryResponse } from "@/utils/types";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

const LendingHistory = () => {
  const [historyData, setHistoryData] = useState<UserLendingHistoryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  
  useEffect(() => {
    const fetchLendingHistory = async () => {
      try {
        setLoading(true);
        
        const wallet = localStorage.getItem("ls_wallet_address");
        if (!wallet) {
          throw new Error("Wallet address not found");
        }
        
        const data = await getUserLendingHistory(wallet);
        setHistoryData(data);
      } catch (error) {
        console.error("Error fetching lending history:", error);
        setError("Failed to load your lending transaction history.");
        toast({
          title: "Error",
          description: "Failed to load your lending transaction history.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchLendingHistory();
  }, [currentPage]);

  // Function to handle page change
  const handlePageChange = (page: number) => {
    if (page !== currentPage) {
      setCurrentPage(page);
    }
  };

  // Function to format transaction type from event name
  const formatEventType = (eventName: string): { type: string, icon: JSX.Element, colorClass: string } => {
    if (eventName.toLowerCase() === "deposit" || eventName.toLowerCase() === "mint") {
      return { 
        type: "Supplied", 
        icon: <ArrowDownLeft className="h-4 w-4" />, 
        colorClass: "text-green-600" 
      };
    } else {
      return { 
        type: "Withdrew", 
        icon: <ArrowUpRight className="h-4 w-4" />, 
        colorClass: "text-red-600" 
      };
    }
  };

  // Function to format amount display
  const formatAmount = (amount: string): string => {
    return (parseFloat(amount) / 1000000).toFixed(2); // Assuming 6 decimals like USDC
  };

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
        ) : error ? (
          <div className="text-center py-12">
            <div className="mb-4">
              <HistoryIcon className="h-12 w-12 mx-auto text-gray-300" />
            </div>
            <h3 className="text-lg font-medium text-gray-800 mb-2">Error loading history</h3>
            <p className="text-sm text-gray-600 mb-6 max-w-md mx-auto">
              {error}
            </p>
            <Button 
              onClick={() => navigate("/lending")}
              className="px-4 py-2 text-sm rounded-md bg-gradient-to-r from-[#1A1E8F] via-[#5A1A8F] to-[#A11F75] text-white hover:opacity-90"
            >
              Explore Lending Pools
            </Button>
          </div>
        ) : historyData && historyData.history.length > 0 ? (
          <>
            <div className="space-y-4">
              {historyData.history.map((tx, index) => {
                const txInfo = formatEventType(tx.eventname);
                return (
                  <Card key={index} className="overflow-hidden hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="mb-2">
                        <h3 className="font-medium text-sm flex items-center justify-center gap-1">
                          <span className={txInfo.colorClass}>{txInfo.icon}</span>
                          {txInfo.type} {txInfo.type === "Supplied" ? "to" : "from"} {tx.name}
                        </h3>
                        <p className="text-xs text-gray-500 text-center">
                          {format(new Date(tx.timestamp), "MMM dd, yyyy 'at' h:mm a")}
                        </p>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 mt-3 mb-4">
                        <div>
                          <p className="text-xs text-gray-500">USDC</p>
                          <p className={`text-sm font-medium ${txInfo.type === "Supplied" ? "text-red-600" : "text-green-600"}`}>
                            {txInfo.type === "Supplied" ? "-" : "+"}{formatAmount(tx.assets)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">{tx.symbol}</p>
                          <p className={`text-sm font-medium ${txInfo.type === "Supplied" ? "text-green-600" : "text-red-600"}`}>
                            {txInfo.type === "Supplied" ? "+" : "-"}{formatAmount(tx.shares)}
                          </p>
                        </div>
                      </div>
                      
                      <div className="mt-4 text-center">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => navigate(`/pool/${tx.pool_address}`)}
                          className="w-full text-xs"
                        >
                          View Pool
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Pagination */}
            {historyData.pagination && historyData.pagination.totalPages > 1 && (
              <div className="mt-6">
                <Pagination>
                  <PaginationContent>
                    {historyData.pagination.previousPage !== null && (
                      <PaginationItem>
                        <PaginationPrevious 
                          onClick={() => handlePageChange(historyData.pagination.previousPage || 1)} 
                          className="cursor-pointer"
                        />
                      </PaginationItem>
                    )}

                    {Array.from({ length: historyData.pagination.totalPages }, (_, i) => i + 1).map(page => {
                      // Display current page, first, last, and pages adjacent to current
                      if (
                        page === 1 || 
                        page === historyData.pagination.totalPages ||
                        (page >= currentPage - 1 && page <= currentPage + 1)
                      ) {
                        return (
                          <PaginationItem key={page}>
                            <PaginationLink 
                              isActive={page === currentPage}
                              onClick={() => handlePageChange(page)}
                              className="cursor-pointer"
                            >
                              {page}
                            </PaginationLink>
                          </PaginationItem>
                        );
                      }
                      
                      // Add ellipsis for skipped pages
                      if (
                        (page === 2 && currentPage > 3) ||
                        (page === historyData.pagination.totalPages - 1 && currentPage < historyData.pagination.totalPages - 2)
                      ) {
                        return (
                          <PaginationItem key={page}>
                            <PaginationEllipsis />
                          </PaginationItem>
                        );
                      }
                      
                      return null;
                    })}

                    {historyData.pagination.nextPage !== null && (
                      <PaginationItem>
                        <PaginationNext 
                          onClick={() => handlePageChange(historyData.pagination.nextPage || 1)}
                          className="cursor-pointer"
                        />
                      </PaginationItem>
                    )}
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <div className="mb-4">
              <HistoryIcon className="h-12 w-12 mx-auto text-gray-300" />
            </div>
            <h3 className="text-lg font-medium text-gray-800 mb-2">No lending history yet</h3>
            <p className="text-sm text-gray-600 mb-6 max-w-md mx-auto">
              When you supply liquidity to pools or withdraw your funds, your transactions will appear here.
            </p>
            <Button 
              onClick={() => navigate("/lending")}
              className="px-4 py-2 text-sm rounded-md bg-gradient-to-r from-[#1A1E8F] via-[#5A1A8F] to-[#A11F75] text-white hover:opacity-90"
            >
              Explore Lending Pools
            </Button>
          </div>
        )}
      </main>
    </div>
  );
};

export default LendingHistory;
