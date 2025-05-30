import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { 
  TrendingUp, 
  Lock,
  Calendar,
  Info,
  ExternalLink,
} from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { 
  HoverCard,
  HoverCardContent,
  HoverCardTrigger
} from "@/components/ui/hover-card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { safeParseDate, formatToLocalTime, formatUnlockDate } from "@/utils/dateUtils";
import { Skeleton } from "@/components/ui/skeleton";
import { getPoolAPY } from "@/utils/poolConstants";

interface PoolCardProps {
  id: number;
  title: string;
  apy: number;
  totalSupply: number;
  availableLiquidity: number;
  status: 'warm-up' | 'active' | 'cooldown' | 'withdrawal';
  symbol?: string;
  lockDuration?: number;
  startDate?: string;
  endDate?: string;
  contract?: string;
  isLoading?: boolean;
}

export function PoolCard({ 
  id,
  title, 
  apy, 
  totalSupply, 
  availableLiquidity,
  status,
  symbol,
  lockDuration,
  startDate,
  endDate,
  contract,
  isLoading = false
}: PoolCardProps) {
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const displayAPY = contract ? 
    getPoolAPY(contract, apy) : 
    getPoolAPY(id, apy);
  
  console.log("[PoolCard]", title, "Contract:", contract, "ID:", id, "Default APY:", apy, "Display APY:", displayAPY);
  
  const formatDate = (dateStr?: string): string => {
    if (!dateStr) return '';
    return formatToLocalTime(dateStr, 'MMM d, yyyy');
  };

  const formatFullDate = (dateStr?: string): string => {
    if (!dateStr) return '';
    return formatUnlockDate(dateStr);
  };

  const getExactTime = (dateStr?: string): string => {
    if (!dateStr) return '';
    const safeDate = safeParseDate(dateStr);
    return format(safeDate, 'h:mm a');
  };

  const getLockPeriodDate = () => {
    if (isLoading) return '';
    if (status === 'warm-up' && startDate) {
      return formatDate(startDate);
    } else if (endDate) {
      return formatDate(endDate);
    }
    return '';
  };

  const getLockPeriodFullDate = () => {
    if (isLoading) return '';
    if (status === 'warm-up' && startDate) {
      return formatFullDate(startDate);
    } else if (endDate) {
      return formatFullDate(endDate);
    }
    return '';
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
        return <div className="h-3 w-3 rounded-full bg-amber-500 mr-1"></div>;
      case 'active':
        return <div className="h-3 w-3 rounded-full bg-green-500 mr-1"></div>;
      case 'cooldown':
        return <div className="h-3 w-3 rounded-full bg-gray-500 mr-1"></div>;
      case 'withdrawal':
        return <div className="h-3 w-3 rounded-full bg-purple-500 mr-1"></div>;
      default:
        return <div className="h-3 w-3 rounded-full bg-gray-500 mr-1"></div>;
    }
  };
  
  const gradientClass = "from-[#8B5CF6]/5 via-[#7E69AB]/10 to-[#6E59A5]/5 border-[#8B5CF6]/20";
  
  const handleViewPool = () => {
    if (contract) {
      navigate(`/pool/${contract}`);
    } else {
      navigate(`/pool/id/${id}`);
    }
  };
  
  return (
    <Card className={`overflow-hidden border bg-gradient-to-r ${gradientClass}`}>
      <CardHeader className="flex flex-col items-center gap-2 pb-2 pt-3">
        {isLoading ? (
          <Skeleton className="h-6 w-40" />
        ) : (
          <h3 className="font-semibold text-lg sm:text-xl leading-tight text-center">
            {title}
          </h3>
        )}
        
        {isLoading ? (
          <Skeleton className="h-5 w-24" />
        ) : (
          <Badge variant="outline" className={`inline-flex items-center ${getStatusColor()} py-0.5 px-2`}>
            <span className="flex items-center">
              {getStatusIcon()}
              <span>{status.charAt(0).toUpperCase() + status.slice(1)}</span>
            </span>
          </Badge>
        )}
      </CardHeader>
      
      <CardContent className="px-3 sm:px-4 pt-2 pb-4 space-y-3 sm:space-y-4">
        <div className="grid grid-cols-2 gap-2 sm:gap-4">
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
            {isLoading ? (
              <Skeleton className="h-6 w-20" />
            ) : (
              <div className="font-bold text-lg sm:text-xl text-[#8B5CF6]">
                {displayAPY}%
              </div>
            )}
          </div>
          
          <div className="space-y-1 bg-white/30 rounded-lg p-2 sm:p-3">
            <div className="text-xs text-gray-500 flex items-center gap-1">
              <Lock className="h-3 w-3 flex-shrink-0" />
              <span className="whitespace-nowrap">Lock Duration</span>
            </div>
            {isLoading ? (
              <Skeleton className="h-6 w-20" />
            ) : (
              <div className="font-bold text-lg sm:text-xl text-gray-800">
                {lockDuration ? `${lockDuration} days` : ''}
              </div>
            )}
          </div>
        </div>
        
        <div className="bg-white/30 rounded-lg p-2 sm:p-3">
          <div className="text-xs text-gray-500 flex items-center gap-1 mb-1">
            <Calendar className="h-3 w-3 flex-shrink-0" />
            <span>{getLockPeriodLabel()}</span>
            <HoverCard>
              <HoverCardTrigger asChild>
                <button className="inline-flex">
                  <Info className="h-3 w-3 text-gray-400 hover:text-gray-600 transition-colors" />
                </button>
              </HoverCardTrigger>
              <HoverCardContent className="w-auto p-3">
                <div className="space-y-1">
                  <p className="font-medium text-xs">{getLockPeriodFullDate()}</p>
                </div>
              </HoverCardContent>
            </HoverCard>
          </div>
          {isLoading ? (
            <Skeleton className="h-5 w-32" />
          ) : (
            <div className="font-bold text-sm sm:text-base text-gray-800">
              {getLockPeriodDate()}
            </div>
          )}
        </div>
        
        <Separator className="my-1 bg-gray-200" />
        
        <Button 
          onClick={handleViewPool} 
          className="w-full flex items-center justify-center gap-2 bg-[#9b87f5] hover:opacity-90 hover:text-white"
          size={isMobile ? "sm" : "default"}
          disabled={isLoading}
        >
          {isLoading ? "Loading..." : "View Pool"} {!isLoading && <ExternalLink className="h-4 w-4" />}
        </Button>
      </CardContent>
    </Card>
  );
}
