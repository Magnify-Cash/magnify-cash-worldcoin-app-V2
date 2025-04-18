
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ArrowUpRight, Info, TrendingUp, Wallet, Coins } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ActivePositionCardProps {
  poolId: number;
  poolName: string;
  balance: number;
  depositedValue: number;
  currentValue: number;
  earnings: number;
  status: 'warm-up' | 'active' | 'cooldown' | 'withdrawal';
  apy: number;
}

export function ActivePositionCard({
  poolId,
  poolName,
  balance,
  depositedValue,
  currentValue,
  earnings,
  status,
  apy
}: ActivePositionCardProps) {
  const navigate = useNavigate();
  const percentageChange = depositedValue > 0 ? (earnings / depositedValue * 100) : 0;
  const isPositive = percentageChange >= 0;

  const getStatusColor = (status: 'warm-up' | 'active' | 'cooldown' | 'withdrawal') => {
    switch (status) {
      case 'warm-up':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'cooldown':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'withdrawal':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPoolIcon = (poolId: number) => {
    switch (poolId) {
      case 1:
        return <Coins className="h-3.5 w-3.5 mr-1 text-blue-500" />;
      case 2:
        return <Coins className="h-3.5 w-3.5 mr-1 text-purple-500" />;
      case 3:
        return <Coins className="h-3.5 w-3.5 mr-1 text-yellow-500" />;
      case 4:
        return <Coins className="h-3.5 w-3.5 mr-1 text-green-500" />;
      default:
        return <Coins className="h-3.5 w-3.5 mr-1 text-[#8B5CF6]" />;
    }
  };

  return (
    <div className="rounded-lg border border-[#8B5CF6]/20 overflow-hidden">
      <div className="bg-gradient-to-r from-[#8B5CF6]/5 to-transparent p-4">
        <div className="flex justify-between items-center mb-3">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-medium text-lg flex items-center">
                {getPoolIcon(poolId)}{poolName}
              </h3>
              <Badge variant="outline" className={`${getStatusColor(status)}`}>
                <div className={`h-3 w-3 rounded-full mr-1.5 ${
                  status === 'warm-up' ? 'bg-amber-500' :
                  status === 'active' ? 'bg-green-500' :
                  status === 'cooldown' ? 'bg-gray-500' :
                  status === 'withdrawal' ? 'bg-purple-500' :
                  'bg-gray-500'
                }`}></div>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </Badge>
            </div>
            <div className="flex items-center mt-1 text-sm text-gray-600">
              <TrendingUp className="h-3.5 w-3.5 mr-1 text-[#8B5CF6]" />
              <span>{apy}% APY</span>
            </div>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => navigate(`/pool/${poolId}`)} 
            className="flex items-center gap-1 text-[#8B5CF6] border-[#8B5CF6]/30 hover:bg-[#8B5CF6]/10"
          >
            View Pool 
            <ArrowUpRight className="h-3.5 w-3.5 ml-1" />
          </Button>
        </div>

        <div className="bg-white rounded-lg p-4 shadow-sm">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Your Balance</span>
              <span className="font-medium">{balance.toFixed(2)} LP</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Deposited Value</span>
              <span className="font-medium">${depositedValue.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Current Value</span>
              <span className="font-medium">${currentValue.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Earnings</span>
              <span className="font-medium text-green-600">
                +{earnings.toFixed(2)} (+{percentageChange.toFixed(2)}%)
              </span>
            </div>
          </div>

          <div className="mt-4 flex gap-2">
            <Button 
              onClick={() => navigate(`/pool/${poolId}`)} 
              className="flex-1 bg-gradient-to-r from-[#1A1E8F] via-[#5A1A8F] to-[#A11F75] hover:opacity-90"
            >
              Supply More
            </Button>
            <Button 
              onClick={() => navigate(`/pool/${poolId}`)} 
              variant="outline" 
              className="flex-1 border-[#8B5CF6] text-[#8B5CF6] hover:bg-[#8B5CF6]/10"
            >
              Withdraw
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
