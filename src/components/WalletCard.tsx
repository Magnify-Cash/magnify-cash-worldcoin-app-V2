
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";

interface WalletCardProps {
  currency: string;
  symbol: string;
  balance: string;
  isLoading?: boolean;
  type?: "worldchain" | "default";
}

export const WalletCard = ({
  currency,
  symbol,
  balance,
  isLoading = false,
  type = "default",
}: WalletCardProps) => {
  const randomTailwindColor = (char: string) => {
    const colors = ["red", "green", "blue", "indigo", "purple", "pink"];
    const colorIndex = char.charCodeAt(0) % colors.length;
    const color = colors[colorIndex];
    return `bg-${color}-500`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-between p-4">
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
      className="flex items-center justify-between hover:bg-accent/5 rounded-lg transition-colors mb-8"
    >
      <div className="flex items-center content-between gap-4">
        <div className="text-start">
          <h3 className="font-medium text-foreground">{symbol}</h3>
          <p className="text-xs text-muted-foreground">{currency}</p>
        </div>
      </div>
      <div className="text-right">
        <p className="font-medium">{balance}</p>
      </div>
    </motion.div>
  );
};
