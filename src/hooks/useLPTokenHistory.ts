
import { useState, useEffect } from "react";
import { getPoolLpTokenPrice } from "@/lib/backendRequests";
import { PoolLpTokenPrice } from "@/utils/types";
import { format } from "date-fns";

interface ProcessedPriceData {
  date: string;
  price: number;
}

interface UseLPTokenHistoryResult {
  priceData: ProcessedPriceData[];
  isLoading: boolean;
  error: Error | null;
}

export function useLPTokenHistory(
  contractAddress: string,
  timeframe: "hours" | "days" | "weeks" = "hours"
): UseLPTokenHistoryResult {
  const [priceData, setPriceData] = useState<ProcessedPriceData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchTokenHistory = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Fetch token price history from the backend
        const response = await getPoolLpTokenPrice(contractAddress);
        
        if (!response || !Array.isArray(response)) {
          console.error("Invalid response format for LP token prices:", response);
          throw new Error("Invalid response format");
        }
        
        // Process and transform the data
        const processedData = response.map((item: PoolLpTokenPrice) => {
          // Convert timestamp to Date and format
          const date = new Date(parseInt(item.timestamp) * 1000);
          
          let formattedDate: string;
          if (timeframe === "hours") {
            formattedDate = format(date, "HH:mm");
          } else if (timeframe === "days") {
            formattedDate = format(date, "MM/dd");
          } else {
            formattedDate = format(date, "MM/dd");
          }
          
          return {
            date: formattedDate,
            price: parseFloat(item.token_price)
          };
        });
        
        // Sort by timestamp in ascending order (oldest to newest)
        processedData.sort((a, b) => {
          const timestampA = response.find(item => 
            format(new Date(parseInt(item.timestamp) * 1000), 
              timeframe === "hours" ? "HH:mm" : "MM/dd") === a.date)?.timestamp || "0";
          const timestampB = response.find(item => 
            format(new Date(parseInt(item.timestamp) * 1000), 
              timeframe === "hours" ? "HH:mm" : "MM/dd") === b.date)?.timestamp || "0";
          return parseInt(timestampA) - parseInt(timestampB);
        });
        
        // Filter and limit data based on timeframe
        let filteredData: ProcessedPriceData[] = [];
        
        if (timeframe === "hours") {
          // For hourly view, take the last 24 hours of data
          filteredData = processedData.slice(-24);
        } else if (timeframe === "days" && processedData.length > 30) {
          // For daily view, take the last 30 days
          filteredData = processedData.slice(-30);
        } else if (timeframe === "weeks") {
          // Group by week
          const weeklyData: Record<string, number[]> = {};
          
          processedData.forEach((item) => {
            const week = item.date.split("/")[1]; // Extract day part as rough week approximation
            if (!weeklyData[week]) {
              weeklyData[week] = [];
            }
            weeklyData[week].push(item.price);
          });
          
          // Calculate average price for each week
          filteredData = Object.entries(weeklyData).map(([week, prices]) => {
            const avgPrice = prices.reduce((sum, price) => sum + price, 0) / prices.length;
            
            // Find a date that belongs to this week
            const dateForWeek = processedData.find(item => item.date.split("/")[1] === week)?.date || "";
            
            return {
              date: dateForWeek,
              price: parseFloat(avgPrice.toFixed(4))
            };
          });
          
          // Limit to 12 weeks if needed
          if (filteredData.length > 12) {
            filteredData = filteredData.slice(-12);
          }
        } else {
          filteredData = processedData;
        }
        
        setPriceData(filteredData);
      } catch (err) {
        console.error("Error fetching LP token history:", err);
        setError(err instanceof Error ? err : new Error("Failed to fetch token price history"));
        setPriceData([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTokenHistory();
  }, [contractAddress, timeframe]);

  return { priceData, isLoading, error };
}
