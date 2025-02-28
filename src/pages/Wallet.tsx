import { useEffect, useState, useCallback } from "react";
import { Header } from "@/components/Header";
import { WalletCard } from "@/components/WalletCard";
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
  
    const requestPermissionPayload: RequestPermissionPayload = {
      permission: Permission.Notifications,
    };
  
    console.log("Requesting permission...");
    console.log(requestPermissionPayload);
  
    try {
      const payload = await MiniKit.commandsAsync.requestPermission(requestPermissionPayload);
      
      let notificationEnabled = false;
  
      if (payload.finalPayload.status === "success") {
        console.log("Notifications enabled:", payload.finalPayload);
        notificationEnabled = true;
      } else {
        console.error("Permission request failed:", payload);
      }
  
      // Send backend request to save wallet and notification status
      await fetch(`${BACKEND_URL}/saveWallet`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          wallet: ls_wallet,
          notification: notificationEnabled,
        }),
      });
  
      console.log("User permission saved successfully.");
  
    } catch (error) {
      console.error("Error requesting notification permission:", error);
    }
  }, []);

  // Request permission on mount if not already granted
  useEffect(() => {
    const checkPermission = async () => {
      if (!MiniKit.isInstalled()) return;

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

    checkPermission();
  }, [requestPermission]);

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
          {/*
          TODO: TOTAL BALANCE
          ALCHEMY API DOES NOT PROVIDE USD PRICES
          <h1 className="text-5xl font-bold mb-8">
            <span className="text-2xl align-top">$</span>
            {totalBalance.split('.')[0]}
            <span className="text-muted-foreground">.{totalBalance.split('.')[1]}</span>
          </h1>
          */}

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
