
import backendRequest from "./request";
import { Loan } from "@/types/supabase/loan";
import { readContract } from "@wagmi/core";
import { config } from "@/providers/Wagmi";
import { MAGNIFY_WORLD_ADDRESS_V3 } from "@/utils/constants";
import { magnifyV3Abi } from "@/utils/magnifyV3Abi";
import { ActiveLoanData } from "@/utils/types";

export const getLoanById = async (id: number): Promise<Loan | null> => {
  try {
    const response = await backendRequest<Loan>(
      "GET",
      `loans/${id}`,
      {},
      { retries: 2 }
    );
    
    if (response.status >= 200 && response.status < 300 && response.data) {
      return response.data;
    }
    
    return null;
  } catch (error) {
    console.error("Error fetching loan:", error);
    return null;
  }
};

export const getAllLoans = async (): Promise<Loan[]> => {
  try {
    const response = await backendRequest<Loan[]>(
      "GET",
      "loans",
      {},
      { retries: 2 }
    );
    
    if (response.status >= 200 && response.status < 300 && response.data) {
      return response.data;
    }
    
    return [];
  } catch (error) {
    console.error("Error fetching loans:", error);
    return [];
  }
};

export const getV3ActiveLoan = async (wallet: string, contractAddress: string): Promise<ActiveLoanData | null> => {
  try {
    console.log(`[getV3ActiveLoan] Checking active loan for wallet: ${wallet} on contract: ${contractAddress}`);
    
    const response = await backendRequest<ActiveLoanData>(
      "GET",
      "v3/loan/active",
      { wallet, contract: contractAddress },
      { retries: 2 }
    );
    
    console.log("[getV3ActiveLoan] Response:", response);
    
    if (response.status >= 200 && response.status < 300 && response.data) {
      // Add the pool address to the response data for easier access later
      const loanData = {
        ...response.data,
        poolAddress: contractAddress
      };
      return loanData;
    }
    
    return null;
  } catch (error) {
    console.error("[getV3ActiveLoan] Error:", error);
    return null;
  }
};

// This function will be deprecated as we're moving to backend API calls for V3 loans
export const getV3LoanData = async (walletAddress: string): Promise<{
  hasActiveLoan: boolean;
  amount: bigint;
  startTime: number;
  interestRate: bigint;
  loanPeriod: bigint;
  poolAddress?: string;
} | null> => {
  try {
    console.log("[getV3LoanData] Fetching V3 loan data for wallet:", walletAddress);
    console.warn("[getV3LoanData] This function is deprecated. Use backend API calls through useMagnifyWorld instead.");
    
    const result = await readContract(config, {
      address: MAGNIFY_WORLD_ADDRESS_V3,
      abi: magnifyV3Abi,
      functionName: "userLoans",
      args: [walletAddress as `0x${string}`],
    });
    
    console.log("[getV3LoanData] Raw V3 loan data:", result);
    
    if (result) {
      const loan = result as any;
      
      // Try to detect the structure of the response
      const amount = typeof loan.amount !== 'undefined' ? BigInt(loan.amount) : 
                     Array.isArray(loan) && loan.length > 0 ? BigInt(loan[0] || 0) : BigInt(0);
      
      const startTime = typeof loan.startTime !== 'undefined' ? Number(loan.startTime) :
                        Array.isArray(loan) && loan.length > 1 ? Number(loan[1] || 0) : 0;
                        
      const isActive = typeof loan.isActive !== 'undefined' ? Boolean(loan.isActive) : 
                       Array.isArray(loan) && loan.length > 2 ? Boolean(loan[2] || false) : false;
                       
      const interestRate = typeof loan.interestRate !== 'undefined' ? BigInt(loan.interestRate) :
                          Array.isArray(loan) && loan.length > 3 ? BigInt(loan[3] || 0) : BigInt(0);
                          
      const loanPeriod = typeof loan.loanPeriod !== 'undefined' ? BigInt(loan.loanPeriod) :
                         Array.isArray(loan) && loan.length > 4 ? BigInt(loan[4] || 0) : BigInt(0);
      
      return {
        hasActiveLoan: isActive,
        amount,
        startTime,
        interestRate,
        loanPeriod
      };
    }
    
    return null;
  } catch (error) {
    console.error("[getV3LoanData] Error fetching V3 loan data:", error);
    return null;
  }
};
