
import { magnifyV1Abi } from "@/utils/magnifyV1Abi";
import { createPublicClient, http } from "viem";
import { worldchain } from "wagmi/chains";
import { WORLDCHAIN_RPC_URL } from "@/utils/constants";

export interface V1LoanInfo {
  amountBorrowed: bigint;
  dueDate: bigint;
  totalDue: bigint;
}

// Create a public client for the Worldchain network
const client = createPublicClient({
  chain: worldchain,
  transport: http(WORLDCHAIN_RPC_URL)
}) as any;

export const fetchLoanByAddress = async (contractAddress: string, wallet: string): Promise<bigint[]> => {
  console.log("[v1LoanRequests] Fetching V1 loans for wallet:", wallet);
  try {
    const result = await client.readContract({
      address: contractAddress as `0x${string}`,
      abi: magnifyV1Abi,
      functionName: "fetchLoansByAddress",
      args: [wallet as `0x${string}`],
    });
    
    console.log("[v1LoanRequests] V1 loans found:", result);
    return result as bigint[];
  } catch (error) {
    console.error("[v1LoanRequests] Error fetching V1 loans:", error);
    return [];
  }
};

export const fetchLoanInfo = async (contractAddress: string, tokenId: bigint): Promise<V1LoanInfo> => {
  console.log("[v1LoanRequests] Fetching loan info for token:", tokenId.toString());
  try {
    const result = await client.readContract({
      address: contractAddress as `0x${string}`,
      abi: magnifyV1Abi,
      functionName: "fetchLoanInfo",
      args: [tokenId],
    });
    
    console.log("[v1LoanRequests] Loan info:", result);
    return {
      amountBorrowed: result[0],
      dueDate: result[1],
      totalDue: result[2],
    };
  } catch (error) {
    console.error("[v1LoanRequests] Error fetching loan info:", error);
    throw error;
  }
};

