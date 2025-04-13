
import { useEffect, useState, useCallback } from "react";
import { WalletCard } from "@/components/WalletCard";
import { Header } from "@/components/Header";
import { useNavigate } from "react-router-dom";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MiniKit, RequestPermissionPayload, Permission } from "@worldcoin/minikit-js";
import { checkWallet, saveWallet, getWalletTokens } from "@/lib/backendRequests";

const MIN_BALANCE_THRESHOLD = 0.00049; // Minimum balance threshold to display tokens

const Wallet = () => {
  const navigate = useNavigate();

  const ls_wallet = localStorage.getItem("ls_wallet_address");

  const [tokens, setTokens] = useState([]);
  const [error, setError] = useState(null);
  const [loadingTokens, setLoadingTokens] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);

  const checkWalletExists = useCallback(async (wallet: string) => {
    try {
      return await checkWallet(wallet);
    } catch (error) {
      return false;
    }
  }, []);  
  
  const requestPermission = useCallback(async () => {
    if (!MiniKit.isInstalled()) {
      console.warn("MiniKit is not installed");
      return;
    }
  
    if (!ls_wallet) {
      return;
    }
  
    const walletExists = await checkWalletExists(ls_wallet);
    if (walletExists) {
      return;
    }
  
    const requestPermissionPayload: RequestPermissionPayload = {
      permission: Permission.Notifications,
    };
    
    let notificationEnabled = false;
  
    try {
      const payload = await MiniKit.commandsAsync.requestPermission(requestPermissionPayload);
      notificationEnabled = payload.finalPayload.status === "success";
    } catch (error) {
      console.error("Error requesting notification permission:", error);
    }
  
    try {
      await saveWallet(ls_wallet);
    } catch (error) {
      console.warn("Error saving wallet:", error);
    }
  }, [checkWalletExists]);

  useEffect(() => {
    const checkAndSaveWallet = async () => {
      if (!ls_wallet) return;
  
      const walletExists = await checkWalletExists(ls_wallet);
      if (!walletExists) {
        if (MiniKit.isInstalled()) {
          requestPermission();
        }
        return;
      }
  
      if (MiniKit.isInstalled()) {
        try {
          const result = await MiniKit.commandsAsync.requestPermission({ permission: Permission.Notifications });  
          if (result.finalPayload.status === "error" && result.finalPayload.error_code !== "already_granted") {
            requestPermission();
          }
        } catch (error) {
          console.error("Error checking permission:", error);
        }
      }
    };
  
    checkAndSaveWallet();
  }, [requestPermission, checkWalletExists]);

  const fetchBalances = async () => {
    try {
      setIsRefreshing(true);
      setLoadingTokens(true);
      setError(null);

      try {
        const tokenList = await getWalletTokens(ls_wallet);
        setTokens(tokenList);
      } catch (error) {
        console.error("Failed to fetch wallet tokens:", error);
        setError("Failed to fetch wallet tokens");
      } finally {
        setLoadingTokens(false);
      }

      setTimeout(() => {
        setIsRefreshing(false);
        setDataLoaded(true);
      }, 600);
    } catch (error) {
      console.error("Unexpected error fetching balances:", error);
      setError("Unexpected error fetching balances");
      setLoadingTokens(false);
      setIsRefreshing(false);
      setDataLoaded(true);
    }
  };

  useEffect(() => {
    if (!ls_wallet) return;
    fetchBalances();
  }, [ls_wallet]);

  // Filter tokens based on minimum balance threshold
  const filteredTokens = tokens.filter(token => token.tokenBalance >= MIN_BALANCE_THRESHOLD);

  // Determine if we should show the error message
  const shouldShowError = error && loadingTokens === false && !filteredTokens.length;

  return (
    <div className="min-h-screen bg-background">
      <Header title="Wallet" showBack={false} />

      <div className="py-6 max-w-2xl mx-auto">
        {shouldShowError && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Failed to load wallet data. Please try again later.
            </AlertDescription>
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

        <div className="mb-8">
          {dataLoaded && (
            <div className="flex justify-end mb-2">
              <Button 
                onClick={fetchBalances} 
                variant="ghost" 
                size="icon" 
                className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 h-8 w-8"
                disabled={isRefreshing}
              >
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span className="sr-only">Refresh wallet</span>
              </Button>
            </div>
          )}
          
          <div className="space-y-4">
            {loadingTokens ? (
              <>
                <WalletCard currency="" symbol="" balance="" isLoading={true} />
                <WalletCard currency="" symbol="" balance="" isLoading={true} />
                <WalletCard currency="" symbol="" balance="" isLoading={true} />
              </>
            ) : filteredTokens.length > 0 ? (
              filteredTokens.map((token) => (
                <WalletCard
                  key={token.tokenAddress || token.tokenSymbol}
                  currency={token.tokenName}
                  symbol={token.tokenSymbol}
                  balance={token.tokenBalance.toFixed(3)}
                />
              ))
            ) : (
              <div className="text-center py-4">No tokens found. Add some to see your balance!</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Wallet;
