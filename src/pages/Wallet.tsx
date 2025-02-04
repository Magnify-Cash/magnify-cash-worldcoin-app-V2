import { Header } from "@/components/Header";
import { WalletCard } from "@/components/WalletCard";
import { useNavigate } from "react-router-dom";
import { useWallet } from "@/hooks/use-wallet";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const Wallet = () => {
  const navigate = useNavigate();
  const { balances, transactions, isLoading, error } = useWallet();

  // Calculate total balance from the individual balances
  const calculateTotal = () => {
    if (isLoading || !balances.length) return "30.41";
    
    const total = balances.reduce((sum, balance) => {
      const amount = parseFloat(balance.balance.replace('$', ''));
      return sum + amount;
    }, 0);
    
    return total.toFixed(2);
  };

  const totalBalance = calculateTotal();

  return (
    <div className="min-h-screen bg-background">
      <Header title="Wallet" showBack={false} />
      
      <div className="p-6 max-w-2xl mx-auto">
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Failed to load wallet data. Please try again later.
            </AlertDescription>
          </Alert>
        )}

        {/* Total Balance */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-8">
            <span className="text-2xl align-top">$</span>
            {totalBalance.split('.')[0]}
            <span className="text-muted-foreground">.{totalBalance.split('.')[1]}</span>
          </h1>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <Button
              onClick={() => navigate("/loan")}
              variant="outline"
              className="h-20 hover:bg-accent/10"
            >
              <div className="text-center">
                <div className="text-2xl mb-1">💰</div>
                <span className="text-sm text-muted-foreground">Get a loan</span>
              </div>
            </Button>
            <Button
              onClick={() => navigate("/dashboard")}
              variant="outline"
              className="h-20 hover:bg-accent/10"
            >
              <div className="text-center">
                <div className="text-2xl mb-1">📊</div>
                <span className="text-sm text-muted-foreground">Loan Dashboard</span>
              </div>
            </Button>
          </div>
        </div>

        {/* Wallet Cards */}
        <div className="space-y-4 mb-8">
          {isLoading ? (
            <>
              <WalletCard
                currency=""
                symbol=""
                balance=""
                isLoading={true}
              />
              <WalletCard
                currency=""
                symbol=""
                balance=""
                isLoading={true}
              />
            </>
          ) : (
            balances.map((balance) => (
              <WalletCard
                key={balance.id}
                currency={balance.currency}
                symbol={balance.symbol}
                balance={balance.balance}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Wallet;