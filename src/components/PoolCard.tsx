import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Coins, 
  Landmark, 
  Droplet, 
  TrendingUp, 
  Info, 
  Circle, 
  CircleCheck, 
  ExternalLink,
  Timer,
  Lock,
  Calendar
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
import { format, addDays } from "date-fns";

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
        return <Timer className="h-3 w-3 mr-1 text-amber-500" />;
      case 'active':
        return <CircleCheck className="h-3 w-3 mr-1 text-green-500" />;
      case 'completed':
        return <CircleCheck className="h-3 w-3 mr-1 text-gray-500" />;
      default:
        return <Circle className="h-3 w-3 mr-1 text-gray-500" />;
    }
  };

  const getLockDuration = () => {
    switch (id) {
      case 1:
        return "180 days";
      case 2:
        return "365 days";
      case 3:
        return "90 days";
      default:
        return "180 days";
    }
  };

  const getLockPeriodDate = () => {
    const today = new Date();
    
    if (status === 'warm-up') {
      const startDate = addDays(today, 15);
      return format(startDate, 'MMM d, yyyy');
    } else {
      let daysToAdd = 180;
      if (id === 2) daysToAdd = 365;
      if (id === 3) daysToAdd = 90;
      
      const endDate = addDays(today, daysToAdd);
      return format(endDate, 'MMM d, yyyy');
    }
  };

  const getLockPeriodLabel = () => {
    return status === 'warm-up' 
      ? "Lock Period Start Date" 
      : "Lock Period End Date";
  };

  return (
    <Card className={`overflow-hidden border ${useCustomGradient ? 'border-[#D946EF]/20' : 'border-[#8B5CF6]/20'}`}>
      <CardHeader className={`pb-2 pt-4 bg-gradient-to-r ${useCustomGradient ? 'from-[#8B5CF6]/10 via-[#A855F7]/10 to-[#D946EF]/5' : 'from-[#8B5CF6]/10 via-[#7E69AB]/10 to-[#6E59A5]/5'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className={`flex justify-center items-center rounded-full p-1.5 mr-2 ${useCustomGradient ? 'bg-[#A855F7]/10' : 'bg-[#8B5CF6]/10'}`}>
              <Coins className={`h-4 w-4 sm:h-5 sm:w-5 ${useCustomGradient ? 'text-[#A855F7]' : 'text-[#8B5CF6]'}`} />
            </div>
            <CardTitle className="text-lg sm:text-xl">
              {getPoolName()}
            </CardTitle>
          </div>
          <Badge variant="outline" className={`flex items-center gap-0.5 px-2 py-0.5 text-xs font-medium ${getStatusColor()}`}>
            {getStatusIcon()}
            <span>{status.charAt(0).toUpperCase() + status.slice(1)}</span>
          </Badge>
        </div>
      </CardHeader>
      <CardContent className={`p-4 sm:p-6 ${isMobile ? 'pt-3' : ''}`}>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
          <div className="space-y-1">
            <div className="text-xs sm:text-sm text-gray-500 flex items-center gap-1">
              <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
              <span className="truncate">APY</span>
              <Popover>
                <PopoverTrigger asChild>
                  <button className="inline-flex">
                    <Info className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400 hover:text-gray-600 transition-colors" />
                  </button>
                </PopoverTrigger>
                <PopoverContent className="max-w-[250px] text-xs p-3">
                  <p>Annual Percentage Yield. This is an estimated return on your deposited funds over one year.</p>
                </PopoverContent>
              </Popover>
            </div>
            <div className={`font-semibold text-base sm:text-lg flex items-center ${useCustomGradient ? "text-[#D946EF]" : "text-[#8B5CF6]"}`}>
              {apy}%
            </div>
          </div>
          
          <div className="space-y-1">
            <div className="text-xs sm:text-sm text-gray-500 flex items-center gap-1">
              <Lock className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
              <span className="truncate">Lock Duration</span>
            </div>
            <div className="font-semibold text-base sm:text-lg flex items-center">
              {getLockDuration()}
            </div>
          </div>
          
          {!isMobile && (
            <div className="space-y-1">
              <div className="text-xs sm:text-sm text-gray-500 flex items-center gap-1">
                <Calendar className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                <span className="truncate">{getLockPeriodLabel()}</span>
              </div>
              <div className="font-semibold text-base sm:text-lg flex items-center">
                {getLockPeriodDate()}
              </div>
            </div>
          )}
        </div>
        
        <Button 
          onClick={() => navigate(`/pool/${id}`)} 
          className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-[#1A1E8F] via-[#5A1A8F] to-[#A11F75] hover:opacity-90"
        >
          View Pool 
        </Button>
      </CardContent>
    </Card>
  );
}
