import { useEffect, useState } from "react";
import { WalletCard } from "@/components/WalletCard";
import { Header } from "@/components/Header";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useDemoData } from "@/providers/DemoDataProvider";

const Wallet = () => {
  const navigate = useNavigate();
  const ls_wallet = localStorage.getItem("ls_wallet_address");
  const { demoData } = useDemoData();
  const [tokens, setTokens] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (ls_wallet) {
      // Simulated token balances (frontend-only) - using the stored USDC.e balance
      const dummyTokens = [
        {
          contractAddress: "0x1234567890123456789012345678901234567890", // USDC.e
          balance: demoData.usdcBalance.toString(), // Use the stored balance
          symbol: "USDC.e",
          decimals: 6,
          name: "Bridged USDC (world-chain-mainnet)",
        },
      ];
      
      setTokens(dummyTokens);
    }

    setIsLoading(false);
  }, [ls_wallet, demoData.usdcBalance]);

  return (
    <div className="min-h-screen bg-background">
      <Header title="Wallet" showBack={false} />

      <div className="py-6 max-w-2xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-2xl font-bold mb-8">
            {ls_wallet ? `${ls_wallet.substring(0, 6)}...${ls_wallet.substring(ls_wallet.length - 6)}` : "No Wallet Connected"}
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
