import { useEffect, useState, useCallback } from "react";
import { WalletCard } from "@/components/WalletCard";
import { Header } from "@/components/Header";
import { useNavigate } from "react-router-dom";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MiniKit, RequestPermissionPayload, Permission } from "@worldcoin/minikit-js";
import { BACKEND_URL } from "@/utils/constants";

const Wallet = () => {
  const navigate = useNavigate();
  const ls_wallet = localStorage.getItem("ls_wallet_address");
  const [tokens, setBalances] = useState([]);
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Function to check if the wallet already exists in the database
  const checkWalletExists = useCallback(async (wallet: string) => {
    try {
      const response = await fetch(`${BACKEND_URL}/checkWallet?wallet=${encodeURIComponent(wallet)}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Origin": window.location.origin,
        },
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
  
      const data = await response.json();
      return data.exists; // Returns true if wallet exists, false otherwise
    } catch (error) {
      console.error("Error checking wallet existence:", error);
      return false;
    }
  }, []);
  

  // Function to request notification permissions
  const requestPermission = useCallback(async () => {
    if (!MiniKit.isInstalled()) {
      console.error("MiniKit is not installed");
      return;
    }
  
    const ls_wallet = localStorage.getItem("ls_wallet_address");
  
    if (!ls_wallet) {
      console.error("No wallet found in localStorage");
      return;
    }
  
    // Check if wallet already exists before saving
    const walletExists = await checkWalletExists(ls_wallet);
    if (walletExists) {
      console.log("Wallet already exists. Skipping saveWallet request.");
      return;
    }
  
    const requestPermissionPayload: RequestPermissionPayload = {
      permission: Permission.Notifications,
    };
  
    console.log("Requesting permission...");
  
    let notificationEnabled = false;
  
    try {
      const payload = await MiniKit.commandsAsync.requestPermission(requestPermissionPayload);
      notificationEnabled = payload.finalPayload.status === "success";
  
      if (!notificationEnabled) {
        console.warn("Notification permission request was unsuccessful:", payload);
      } else {
        console.log("Notifications enabled:", payload.finalPayload);
      }
    } catch (error) {
      console.error("Error requesting notification permission:", error);
    }
  
    try {
      const saveResponse = await fetch(`${BACKEND_URL}/saveWallet`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Origin": window.location.origin,
        },
        body: JSON.stringify({
          wallet: ls_wallet,
          notification: notificationEnabled,
        }),
      });
  
      if (!saveResponse.ok) {
        throw new Error(`Failed to save wallet. Status: ${saveResponse.status}`);
      }
  
      console.log("User wallet saved successfully, notification status:", notificationEnabled);
    } catch (error) {
      console.error("Error saving wallet:", error);
    }
  }, [checkWalletExists]);
  

  // Request permission on mount if not already granted
  useEffect(() => {
    const checkAndSaveWallet = async () => {
      if (!MiniKit.isInstalled()) return;
  
      const ls_wallet = localStorage.getItem("ls_wallet_address");
      if (!ls_wallet) return;
  
      const walletExists = await checkWalletExists(ls_wallet);
      if (!walletExists) {
        console.log("Wallet not found in backend. Saving now...");
        requestPermission();
        return;
      }
  
      try {
        const result = await MiniKit.commandsAsync.requestPermission({ permission: Permission.Notifications });
  
        console.log("Permission status:", result);
  
        if (result.finalPayload.status === "error" && result.finalPayload.error_code !== "already_granted") {
          console.log("Requesting permission...");
          requestPermission();
        }
      } catch (error) {
        console.error("Error checking permission:", error);
      }
    };
  
    checkAndSaveWallet();
  }, [requestPermission, checkWalletExists]);
  

  useEffect(() => {
    const url = `https://worldchain-mainnet.g.alchemy.com/v2/j-_GFK85PRHN59YaKb8lmVbV0LHmFGBL`;

    const fetchBalances = async () => {
      try {
        setLoading(true);
        setError(null);

        const ethBalanceResponse = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            jsonrpc: "2.0",
            method: "eth_getBalance",
            params: [ls_wallet, "latest"],
            id: 1,
          }),
        });

        const ethBalanceResult = await ethBalanceResponse.json();
        const ethBalance = parseInt(ethBalanceResult.result, 16) / 1e18;

        const tokenBalancesResponse = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            jsonrpc: "2.0",
            method: "alchemy_getTokenBalances",
            params: [ls_wallet],
            id: 2,
          }),
        });

        const tokenBalancesResult = await tokenBalancesResponse.json();
        const tokenBalances = tokenBalancesResult.result.tokenBalances;

        const detailedBalances = await Promise.all(
          tokenBalances.map(async (token) => {
            const metadataResponse = await fetch(url, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                jsonrpc: "2.0",
                method: "alchemy_getTokenMetadata",
                params: [token.contractAddress],
                id: 1,
              }),
            });

            const metadata = await metadataResponse.json();
            const decimals = metadata.result.decimals || 18;
            const balanceDecimal = parseInt(token.tokenBalance, 16) / Math.pow(10, decimals);

            if (balanceDecimal > 0) {
              return {
                contractAddress: token.contractAddress,
                balance: balanceDecimal.toFixed(3),
                symbol: metadata.result.symbol,
                decimals: decimals,
                name: metadata.result.name,
              };
            }
            return null;
          }),
        );

        const balancesToAdd = [];

        if (ethBalance > 0) {
          balancesToAdd.push({
            symbol: "ETH",
            name: "Ether",
            balance: ethBalance,
            decimals: 18,
            contractAddress: "0x0000000000000000000000000000000000000000",
          });
        }

        detailedBalances.forEach((token) => {
          if (token) balancesToAdd.push(token);
        });

        setBalances(balancesToAdd);
      } catch (error) {
        console.error("Failed to fetch tokens:", error);
        setError(error.message);
        setBalances([]);
      } finally {
        setLoading(false);
      }
    };

    if (ls_wallet) {
      fetchBalances();
    }
  }, [ls_wallet]);

  return (
    <div className="min-h-screen bg-background">
      <Header title="Wallet" showBack={false} />

      <div className="py-6 max-w-2xl mx-auto">
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>Failed to load wallet data. Please try again later.</AlertDescription>
          </Alert>
        )}

        <div className="text-center mb-12">
          <h1 className="text text-2xl font-bold mb-8">
            {ls_wallet.substring(0, 6)}...{ls_wallet.substring(ls_wallet.length - 6)}
          </h1>

          <div className="grid grid-cols-2 gap-4 mb-8">
            <Button onClick={() => navigate("/loan")} variant="outline" className="h-20 hover:bg-accent/10">
              <div className="text-center">
                <div className="text-2xl mb-1">💰</div>
                <span className="text-sm text-muted-foreground">Get a loan</span>
              </div>
            </Button>
            <Button onClick={() => navigate("/repay-loan")} variant="outline" className="h-20 hover:bg-accent/10">
              <div className="text-center">
                <div className="text-2xl mb-1">🔄</div>
                <span className="text-sm text-muted-foreground">Repay Loan</span>
              </div>
            </Button>
          </div>
        </div>
        <div className="space-y-4 mb-8">
          {isLoading ? (
            <>
              <WalletCard currency="" symbol="" balance="" isLoading={true} />
              <WalletCard currency="" symbol="" balance="" isLoading={true} />
            </>
          ) : tokens.length > 0 ? (
            tokens.map((token) => (
              <WalletCard
                key={token.contractAddress}
                currency={token.name}
                symbol={token.symbol}
                balance={token.balance}
              />
            ))
          ) : (
            <div className="text-center py-4">No tokens found. Add some to see your balance!</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Wallet;
