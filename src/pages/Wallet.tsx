import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { WalletCard } from "@/components/WalletCard";
import { useNavigate } from "react-router-dom";
import { useWallet } from "@/hooks/use-wallet";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const Wallet = () => {
  const navigate = useNavigate();
  const ls_wallet = localStorage.getItem("ls_wallet_address");
  const ls_username = localStorage.getItem("ls_username");
  const [tokens, setBalances] = useState([]);
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState(null); // New error state

  useEffect(() => {
    const url = `https://worldchain-mainnet.g.alchemy.com/v2/j-_GFK85PRHN59YaKb8lmVbV0LHmFGBL`;
    const fetchBalances = async () => {
      try {
        setLoading(true); // Set loading to true before starting the fetch operations
        setError(null); // Clear any previous error before new fetch

        const ethBalanceResponse = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            jsonrpc: "2.0",
            method: "eth_getBalance",
            params: [ls_wallet, "latest"], // "latest" for the latest block
            id: 1,
          }),
        });

        const ethBalanceResult = await ethBalanceResponse.json();
        const ethBalance = parseInt(ethBalanceResult.result, 16) / 1e18; // Convert from wei to ether

        const tokenBalancesResponse = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            jsonrpc: "2.0",
            method: "alchemy_getTokenBalances",
            params: [ls_wallet],
            id: 2,
          }),
        });

        const tokenBalancesResult = await tokenBalancesResponse.json();
        const tokenBalances = tokenBalancesResult.result.tokenBalances;

        // Fetch metadata for each token and convert balances
        const detailedBalances = await Promise.all(
          tokenBalances.map(async (token) => {
            const metadataResponse = await fetch(url, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                jsonrpc: "2.0",
                method: "alchemy_getTokenMetadata",
                params: [token.contractAddress],
                id: 1,
              }),
            });
            const metadata = await metadataResponse.json();
            const decimals = metadata.result.decimals || 18; // Default to 18 if decimals are missing

            // Convert token balance from hex to decimal, considering decimals
            const balanceDecimal = parseInt(token.tokenBalance, 16) / Math.pow(10, decimals);

            // Only return token if balance is greater than 0
            if (balanceDecimal > 0) {
              const balanceString = balanceDecimal.toFixed(3);
              return {
                contractAddress: token.contractAddress,
                balance: balanceString,
                symbol: metadata.result.symbol,
                decimals: decimals,
                name: metadata.result.name,
              };
            } else {
              return null;
            }
          }),
        );

        // Combine native token balance with ERC-20 token tokens, only if ETH balance is greater than 0
        const balancesToAdd = [];

        // Add ETH if balance is greater than 0
        if (ethBalance > 0) {
          balancesToAdd.push({
            symbol: "ETH",
            name: "Ether",
            balance: ethBalance,
            decimals: 18,
            contractAddress: "0x0000000000000000000000000000000000000000", // Native token's pseudo address
          });
        }

        // Add ERC-20 tokens with non-zero balance
        detailedBalances.forEach((token) => {
          if (token) {
            balancesToAdd.push(token);
          }
        });

        setBalances(balancesToAdd);
      } catch (error) {
        console.error("Failed to fetch tokens:", error);
        setError(error.message); // Set the error state
        setBalances([]); // Set to empty array on error
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

        {/* Total Balance */}
        <div className="text-center mb-12">
          <h1 className="text text-2xl font-bold mb-8">
            {ls_wallet.substring(0, 6)}
            ...
            {ls_wallet.substring(ls_wallet.length - 6)}
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

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <Button onClick={() => navigate("/loan")} variant="outline" className="h-20 hover:bg-accent/10">
              <div className="text-center">
                <div className="text-2xl mb-1">💰</div>
                <span className="text-sm text-muted-foreground">Get a loan</span>
              </div>
            </Button>
            <Button
              onClick={() => navigate("/repay-loan")}
              variant="outline"
              className="h-20 hover:bg-accent/10"
            >
              <div className="text-center">
                <div className="text-2xl mb-1">📊</div>
                <span className="text-sm text-muted-foreground">Repay Loan</span>
              </div>
            </Button>
          </div>
        </div>

        {/* Wallet Cards */}
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
