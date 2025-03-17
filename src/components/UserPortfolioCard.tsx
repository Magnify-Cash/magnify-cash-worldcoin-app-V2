
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowUpFromLine, ArrowDownToLine, Wallet } from "lucide-react";

interface UserPortfolioCardProps {
  balance: number;
  depositedValue: number;
  currentValue: number;
  earnings: number;
  onSupply: () => void;
  onWithdraw: () => void;
}

export function UserPortfolioCard({ 
  balance, 
  depositedValue, 
  currentValue, 
  earnings, 
  onSupply, 
  onWithdraw 
}: UserPortfolioCardProps) {
  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl flex items-center gap-2">
          <Wallet className="h-5 w-5 text-[#8B5CF6]" />
          Your Portfolio
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {balance > 0 ? (
          <>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Your Balance</span>
                <span className="font-semibold">{balance.toFixed(2)} LP</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Deposited Value</span>
                <span className="font-semibold">${depositedValue.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Current Value</span>
                <span className="font-semibold">${currentValue.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Earnings</span>
                <span className="font-semibold text-green-600">+${earnings.toFixed(2)}</span>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-6">
            <p className="text-gray-500 mb-2">You haven't supplied any assets yet</p>
            <p className="text-sm text-gray-400">Supply assets to start earning interest and $MAG rewards</p>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex gap-2">
        <Button 
          onClick={onSupply} 
          className="flex-1 bg-[#8B5CF6] hover:bg-[#7E69AB]"
        >
          <ArrowUpFromLine className="mr-2 h-4 w-4" />
          Supply
        </Button>
        <Button 
          onClick={onWithdraw} 
          variant="outline" 
          className="flex-1"
          disabled={balance <= 0}
        >
          <ArrowDownToLine className="mr-2 h-4 w-4" />
          Withdraw
        </Button>
      </CardFooter>
    </Card>
  );
}
