
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Coins, 
  Landmark, 
  Droplet, 
  TrendingUp, 
  Info, 
  Clock, 
  Package,
  Lock,
  Shield,
  ExternalLink 
} from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";

interface PoolCardProps {
  id: number;
  title: string;
  apy: number;
  totalSupply: number;
  availableLiquidity: number;
  status: 'warm-up' | 'active' | 'completed';
  useCustomGradient?: boolean;
}

export function PoolCard({ 
  id,
  title, 
  apy, 
  totalSupply, 
  availableLiquidity,
  status,
  useCustomGradient = false 
}: PoolCardProps) {
  const isMobile = useIsMobile();
  const navigate = useNavigate();

  const getPoolName = () => {
    if (id === 1) return "Pool A";
    if (id === 2) return "Pool B";
    if (id === 3) return "Pool C";
    return title;
  };

  const formatValue = (value: number, suffix: string) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(2)}M${suffix}`;
    } else if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K${suffix}`;
    }
    return `${value.toFixed(0)}${suffix}`;
  };

  const getStatusColor = () => {
    switch (status) {
      case 'warm-up':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'completed':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'warm-up':
        return <Clock className="h-3 w-3 mr-1 text-amber-500" />;
      case 'active':
        return <Lock className="h-3 w-3 mr-1 text-green-500" />;
      case 'completed':
        return <Package className="h-3 w-3 mr-1 text-gray-500" />;
      default:
        return null;
    }
  };

  const gradientBg = useCustomGradient 
    ? 'from-[#8B5CF6]/10 via-[#A855F7]/10 to-[#D946EF]/5' 
    : 'from-[#8B5CF6]/10 via-[#7E69AB]/10 to-[#6E59A5]/5';
  
  const accentColor = useCustomGradient ? 'text-[#A855F7]' : 'text-[#8B5CF6]';
  const borderColor = useCustomGradient ? 'border-[#D946EF]/20' : 'border-[#8B5CF6]/20';

  return (
    <Card className={`overflow-hidden border ${borderColor}`}>
      <CardHeader className={`pb-2 pt-4 bg-gradient-to-r ${gradientBg}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`flex items-center justify-center ${useCustomGradient ? 'bg-[#A855F7]/10' : 'bg-[#8B5CF6]/10'} p-2 rounded-full h-9 w-9`}>
              <Coins className={`h-4 w-4 ${accentColor}`} />
            </div>
            <div>
              <CardTitle className="text-xl">{getPoolName()}</CardTitle>
              <div className="flex items-center mt-1">
                <Badge variant="outline" className={`flex items-center gap-1 px-2 py-0.5 text-xs font-medium ${getStatusColor()}`}>
                  {getStatusIcon()}
                  <span>{status.charAt(0).toUpperCase() + status.slice(1)}</span>
                </Badge>
              </div>
            </div>
          </div>
          <div className="flex items-center">
            <p className={`text-sm font-medium ${accentColor}`}>
              {apy}% APY
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className={`p-4 sm:p-6 ${isMobile ? 'pt-3' : ''}`}>
        <div className="grid grid-cols-2 gap-2 sm:gap-4 mb-4">
          <div className="space-y-1">
            <div className="text-xs sm:text-sm text-gray-500 flex items-center gap-1">
              <Landmark className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
              <span className="truncate">Supply</span>
              <Popover>
                <PopoverTrigger asChild>
                  <button className="inline-flex">
                    <Info className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400 hover:text-gray-600 transition-colors" />
                  </button>
                </PopoverTrigger>
                <PopoverContent className="max-w-[250px] text-xs p-3">
                  <p>Total Supply. The combined value of all assets deposited into this lending pool by all users.</p>
                </PopoverContent>
              </Popover>
            </div>
            <div className="font-semibold text-base sm:text-lg flex items-center">
              ${formatValue(totalSupply, '')}
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-xs sm:text-sm text-gray-500 flex items-center gap-1">
              <Droplet className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
              <span className="truncate">Liquidity</span>
              <Popover>
                <PopoverTrigger asChild>
                  <button className="inline-flex">
                    <Info className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400 hover:text-gray-600 transition-colors" />
                  </button>
                </PopoverTrigger>
                <PopoverContent className="max-w-[250px] text-xs p-3">
                  <p>Available Liquidity. The amount of funds currently available for borrowing or withdrawal from this pool.</p>
                </PopoverContent>
              </Popover>
            </div>
            <div className="font-semibold text-base sm:text-lg flex items-center">
              ${formatValue(availableLiquidity, '')}
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2 mb-4">
          <Shield className="h-3.5 w-3.5 text-gray-500" />
          <span className="text-xs text-gray-500">Worldcoin Verified Borrowers</span>
        </div>
        
        <Button 
          onClick={() => navigate(`/pool/${id}`)} 
          className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-[#1A1E8F] via-[#5A1A8F] to-[#A11F75] hover:opacity-90"
        >
          View Pool <ExternalLink className="h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  );
}
