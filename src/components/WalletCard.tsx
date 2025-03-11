
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import { CoinIcon } from "lucide-react";

interface WalletCardProps {
  currency: string;
  symbol: string;
  balance: string | number;
  isLoading?: boolean;
}

export const WalletCard = ({
  currency,
  symbol,
  balance,
  isLoading = false,
}: WalletCardProps) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-between p-4 border rounded-lg">
        <div className="flex items-center gap-3">
          <Skeleton className="w-10 h-10 rounded-full" />
          <div>
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-4 w-16 mt-1" />
          </div>
        </div>
        <Skeleton className="h-6 w-24" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/5 transition-colors"
    >
      <div className="flex items-center gap-3">
        <div className="bg-primary/10 w-10 h-10 rounded-full flex items-center justify-center text-primary">
          {symbol === "USDC" ? "💲" : symbol === "ETH" ? "Ξ" : <CoinIcon size={20} />}
        </div>
        <div>
          <h3 className="font-medium text-foreground">{symbol}</h3>
          <p className="text-sm text-muted-foreground">{currency}</p>
        </div>
      </div>
      <div className="text-right">
        <p className="font-medium">
          {typeof balance === 'number' ? balance.toFixed(2) : balance}
        </p>
      </div>
    </motion.div>
  );
};
