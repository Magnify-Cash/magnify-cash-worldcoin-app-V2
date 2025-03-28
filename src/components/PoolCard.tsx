
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { 
  Coins, 
  TrendingUp, 
  Lock,
  Calendar,
  Info,
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
import { format, addDays } from "date-fns";
import { Separator } from "@/components/ui/separator";

interface PoolCardProps {
  id: number;
  title: string;
  apy: number;
  totalSupply: number;
  availableLiquidity: number;
  status: 'warm-up' | 'active' | 'cooldown' | 'withdrawal';
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
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const getPoolName = () => {
    if (id === 1) return "Default Resistant Pool";
    if (id === 2) return "High Uptake Pool";
    if (id === 3) return "Fast Cycle Pool";
    if (id === 4) return "Identity Based Pool";
    if (id === 5) return "Loyalty Rewards Pool";
    return title;
  };

  const getPoolSymbol = () => {
    if (id === 1) return "DFLP";
    if (id === 2) return "HULP";
    if (id === 3) return "FCLP";
    if (id === 4) return "IDLP";
    if (id === 5) return "LRLP";
    return "";
  };

  const getLockDuration = () => {
    switch (id) {
      case 1:
        return "180 days";
      case 2:
        return "365 days";
      case 3:
        return "90 days";
      case 4:
        return "30 days";
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
      if (id === 4) daysToAdd = 30;
      
      const endDate = addDays(today, daysToAdd);
      return format(endDate, 'MMM d, yyyy');
    }
  };

  const getLockPeriodLabel = () => {
    return status === 'warm-up' 
      ? "Lock Period Start Date" 
      : "Lock Period End Date";
  };

  const getStatusColor = () => {
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

  const getStatusIcon = () => {
    switch (status) {
      case 'warm-up':
        return <div className="h-3 w-3 rounded-full bg-amber-500 mr-1.5"></div>;
      case 'active':
        return <div className="h-3 w-3 rounded-full bg-green-500 mr-1.5"></div>;
      case 'cooldown':
        return <div className="h-3 w-3 rounded-full bg-gray-500 mr-1.5"></div>;
      case 'withdrawal':
        return <div className="h-3 w-3 rounded-full bg-purple-500 mr-1.5"></div>;
      default:
        return <div className="h-3 w-3 rounded-full bg-gray-500 mr-1.5"></div>;
    }
  };
  
  const gradientClass = useCustomGradient 
    ? "from-[#8B5CF6]/5 via-[#A855F7]/10 to-[#D946EF]/5 border-[#D946EF]/20" 
    : "from-[#8B5CF6]/5 via-[#7E69AB]/10 to-[#6E59A5]/5 border-[#8B5CF6]/20";
  
  const accentColor = useCustomGradient ? "text-[#D946EF]" : "text-[#8B5CF6]";
  const iconBgColor = useCustomGradient ? "bg-[#A855F7]/10" : "bg-[#8B5CF6]/10";

  return (
    <Card className={`overflow-hidden border bg-gradient-to-r ${gradientClass}`}>
      <CardHeader className="flex flex-col gap-2 pb-2 pt-3">
        {/* Pool name and icon row */}
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            <div className={`flex justify-center items-center rounded-full p-1.5 ${iconBgColor}`}>
              <Coins className={`h-4 w-4 ${accentColor}`} />
            </div>
            <div>
              <h3 className="font-semibold text-sm sm:text-base leading-tight truncate max-w-[210px]">
                {getPoolName()}
              </h3>
              <span className="text-xs text-gray-500">{getPoolSymbol()}</span>
            </div>
          </div>
          
          <Badge variant="outline" className={`flex items-center gap-0.5 px-2 py-0.5 text-xs font-medium ${getStatusColor()} ml-auto shrink-0`}>
            {getStatusIcon()}
            <span>{status.charAt(0).toUpperCase() + status.slice(1)}</span>
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="px-3 sm:px-4 pt-2 pb-4 space-y-3 sm:space-y-4">
        {/* Primary stats row */}
        <div className="grid grid-cols-2 gap-2 sm:gap-4">
          {/* APY */}
          <div className="space-y-1 bg-white/30 rounded-lg p-2 sm:p-3">
            <div className="text-xs text-gray-500 flex items-center gap-1">
              <TrendingUp className="h-3 w-3 flex-shrink-0" />
              <span>APY</span>
              <Popover>
                <PopoverTrigger asChild>
                  <button className="inline-flex">
                    <Info className="h-3 w-3 text-gray-400 hover:text-gray-600 transition-colors" />
                  </button>
                </PopoverTrigger>
                <PopoverContent className="max-w-[250px] text-xs p-3">
                  <p>Annual Percentage Yield. This is an estimated return on your deposited funds over one year.</p>
                </PopoverContent>
              </Popover>
            </div>
            <div className={`font-bold text-lg sm:text-xl ${accentColor}`}>
              {apy}%
            </div>
          </div>
          
          {/* Lock Duration */}
          <div className="space-y-1 bg-white/30 rounded-lg p-2 sm:p-3">
            <div className="text-xs text-gray-500 flex items-center gap-1">
              <Lock className="h-3 w-3 flex-shrink-0" />
              <span className="whitespace-nowrap">Lock Duration</span>
            </div>
            <div className="font-bold text-lg sm:text-xl text-gray-800">
              {getLockDuration()}
            </div>
          </div>
        </div>
        
        {/* Lock Period Date */}
        <div className="bg-white/30 rounded-lg p-2 sm:p-3">
          <div className="text-xs text-gray-500 flex items-center gap-1 mb-1">
            <Calendar className="h-3 w-3 flex-shrink-0" />
            <span>{getLockPeriodLabel()}</span>
          </div>
          <div className="font-bold text-sm sm:text-base text-gray-800">
            {getLockPeriodDate()}
          </div>
        </div>
        
        <Separator className="my-1 bg-gray-200" />
        
        {/* Action button */}
        <Button 
          onClick={() => navigate(`/pool/${id}`)} 
          className={`w-full flex items-center justify-center gap-2 ${useCustomGradient 
            ? "bg-gradient-to-r from-[#8B5CF6] via-[#A855F7] to-[#D946EF] hover:opacity-90"
            : "bg-gradient-to-r from-[#1A1E8F] via-[#5A1A8F] to-[#A11F75] hover:opacity-90"
          }`}
          size={isMobile ? "sm" : "default"}
        >
          View Pool <ExternalLink className="h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  );
}
