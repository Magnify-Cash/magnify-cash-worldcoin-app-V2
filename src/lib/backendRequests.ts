import backendRequest from "@/lib/request";
import { BackendResponse, TokenMetadata, WalletData, TransactionData, WalletTokens } from "@/utils/types";
import { ISuccessResult } from "@worldcoin/minikit-js";
import * as Sentry from "@sentry/react";

export const getETHBalance = async (wallet: string): Promise<number> => {
  const response = await backendRequest<{ ethBalance: number }>("GET", "getEthBalance", { wallet });

  if (!response.data || typeof response.data.ethBalance !== "number") {
    console.error(`Invalid ETH balance response:`, response);
    return 0;
  }

  return response.data.ethBalance;
};


export const getUSDCBalance = async (wallet: string): Promise<number> => {
  const response = await backendRequest<{ usdcBalance: number }>("GET", "getUSDCBalance", { wallet });

  if (!response.data || typeof response.data.usdcBalance !== "number") {
    console.error(`Failed to fetch USDC balance. Status: ${response.status}, Message: ${response.message}`);
    return 0;
  }

  return response.data.usdcBalance;
};

export const getWalletTokens = async (wallet: string): Promise<WalletTokens[]> => {
  const response = await backendRequest<WalletTokens[]>("GET", "getWalletTokens", { wallet });

  if (!response.data || !Array.isArray(response.data)) {
    throw new Error(`Failed to fetch token balance. Status: ${response.status}, Message: ${response.message}`);
  }

  return response.data.length > 0 ? response.data : [];
};

export const getTokenMetadata = async (tokenAddress: string): Promise<TokenMetadata> => {
  const response = await backendRequest<TokenMetadata>("GET", "getTokenMetadata", { tokenAddress });

  if (!response.data || !response.data.metadata) {
    throw new Error(`Failed to fetch token metadata. Status: ${response.status}, Message: ${response.message}`);
  }

  return response.data;
};

export const checkWallet = async (wallet: string): Promise<boolean> => {
  const response = await backendRequest<{ exists: boolean }>("GET", "checkWallet", { wallet });

  if (!response.data || response.data.exists === undefined) {
    throw new Error(`Failed to fetch wallet existence. Status: ${response.status}, Message: ${response.message}`);
  }

  return response.data.exists;
};

export const saveWallet = async (wallet: string): Promise<WalletData[]> => {
  console.log("[API] Saving wallet:", wallet);
  Sentry.addBreadcrumb({
    category: 'api',
    message: `Saving wallet: ${wallet}`,
    level: 'info'
  });
  
  const response = await backendRequest<WalletData[]>("POST", "saveWallet", { wallet });

  if (!response.data) {
    const errorMsg = `Failed to save wallet. Status: ${response.status}, Message: ${response.message}`;
    console.error("[API]", errorMsg);
    Sentry.captureMessage(errorMsg, "error");
    throw new Error(errorMsg);
  }

  console.log("[API] Wallet saved successfully:", response.data);
  return response.data;
};

export const getTransactionHistory = async (wallet: string): Promise<TransactionData[]> => {
  console.log("[API] Fetching transaction history for wallet:", wallet);
  Sentry.addBreadcrumb({
    category: 'api',
    message: `Fetching transaction history for wallet: ${wallet}`,
    level: 'info'
  });
  
  const response = await backendRequest<TransactionData[]>("GET", "getTransactionHistory", { wallet });

  if (!response.data) {
    const errorMsg = `Failed to fetch transaction history. Status: ${response.status}, Message: ${response.message}`;
    console.error("[API]", errorMsg);
    Sentry.captureMessage(errorMsg, "error");
    throw new Error(errorMsg);
  }

  console.log("[API] Transaction history fetched:", response.data.length, "transactions");
  return response.data;
};

export const verify = async (
  finalPayload: ISuccessResult,
  verificationStatus: { claimAction?: string; upgradeAction?: string },
  ls_wallet: string
): Promise<boolean> => {
  console.log("[Verify] Starting verification process", {
    action: verificationStatus.claimAction || verificationStatus.upgradeAction,
    wallet: ls_wallet,
    payloadStatus: finalPayload.status,
    payloadCredential: finalPayload.credential ? "Present" : "Not present"
  });
  
  Sentry.addBreadcrumb({
    category: 'verification',
    message: `Starting verification for wallet: ${ls_wallet}`,
    level: 'info',
    data: {
      action: verificationStatus.claimAction || verificationStatus.upgradeAction,
      payloadStatus: finalPayload.status
    }
  });
  
  // Log full payload for debugging (sensitive data removed in production)
  console.log("[Verify] Full payload:", JSON.stringify({
    ...finalPayload,
    credential: finalPayload.credential ? "Present (details omitted)" : null,
    nullifier: finalPayload.nullifier ? "Present (details omitted)" : null
  }));

  try {
    const response = await backendRequest<BackendResponse<any>>("POST", "verify", {
      payload: finalPayload,
      action: verificationStatus.claimAction || verificationStatus.upgradeAction,
      signal: ls_wallet,
    });

    console.log("[Verify] Verification response:", {
      status: response.status,
      message: response.message,
      hasData: !!response.data
    });
    
    Sentry.addBreadcrumb({
      category: 'verification',
      message: `Verification response received: ${response.status}`,
      level: response.status === 200 ? 'info' : 'error',
      data: {
        status: response.status,
        message: response.message
      }
    });

    if (response.status === 200) {
      return true;
    } else {
      const errorMsg = `Verification failed with status: ${response.status}, Message: ${response.message}`;
      console.error("[Verify]", errorMsg);
      Sentry.captureMessage(errorMsg, "error");
      throw new Error(errorMsg);
    }
  } catch (error) {
    console.error("[Verify] Error during verification:", error);
    Sentry.captureException(error, {
      tags: {
        component: "backendRequests",
        function: "verify"
      },
      extra: {
        wallet: ls_wallet,
        action: verificationStatus.claimAction || verificationStatus.upgradeAction
      }
    });
    throw error;
  }
};
