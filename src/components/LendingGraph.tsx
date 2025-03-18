
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import { useIsMobile } from "@/hooks/use-mobile";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";

const data = [
  { date: "Jan", rate: 1.000 },
  { date: "Feb", rate: 1.004 },
  { date: "Mar", rate: 1.009 },
  { date: "Apr", rate: 1.015 },
  { date: "May", rate: 1.021 },
  { date: "Jun", rate: 1.028 },
  { date: "Jul", rate: 1.035 },
  { date: "Aug", rate: 1.032 },  // Start of decline
  { date: "Sep", rate: 1.020 },  // Continued decline
  { date: "Oct", rate: 0.998 },  // Below $1 (negative growth)
  { date: "Nov", rate: 0.992 },  // Further below $1
  { date: "Dec", rate: 1.005 },  // Recovery
];

export function LendingGraph() {
  const isMobile = useIsMobile();
  
  // Calculate which ticks to show based on mobile/desktop
  const getTickInterval = () => {
    return isMobile ? 2 : 1; // Show every other month on mobile
  };

  // Custom tick formatter for X axis
  const formatXAxisTick = (tick: string) => {
    return tick;
  };

  return (
    <div className="w-full h-[280px] sm:h-[300px]"> {/* Increased height for mobile */}
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{
            top: 10,
            right: isMobile ? 5 : 10,
            left: isMobile ? 0 : 0,
            bottom: isMobile ? 10 : 0, // Increased bottom margin for mobile
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={!isMobile} />
          <XAxis 
            dataKey="date" 
            tick={{ fontSize: isMobile ? 11 : 12 }}
            tickMargin={isMobile ? 8 : 10}
            interval={getTickInterval()}
            tickFormatter={formatXAxisTick}
            padding={{ left: 10, right: 10 }}
          />
          <YAxis 
            domain={[0.98, 1.05]}
            tick={{ fontSize: isMobile ? 11 : 12 }}
            tickFormatter={(value) => {
              // Check if value is a number before calling toFixed
              if (typeof value !== 'number') return value;
              
              // For mobile, simplify display but ensure $ is visible
              if (isMobile) {
                if (value === 1) return "$1.00";
                return "$" + value.toFixed(2);
              } 
              
              return "$" + value.toFixed(3);
            }}
            width={isMobile ? 45 : 50}  // Slightly increased width for mobile
            tickCount={isMobile ? 5 : 6} // Fewer ticks on mobile
            padding={{ top: 10, bottom: 10 }}
          />
          <Tooltip 
            content={({ active, payload, label }) => {
              if (active && payload && payload.length) {
                const value = payload[0].value as number;
                return (
                  <div className="bg-white/90 backdrop-blur-sm border border-gray-200 shadow-md rounded-md p-2 text-xs">
                    <p className="font-medium">{label} 2024</p>
                    <p className="text-[#8B5CF6] font-semibold pt-1">
                      LP Token: ${value.toFixed(4)}
                    </p>
                  </div>
                );
              }
              return null;
            }}
          />
          {/* Reference line at value 1.0 for negative growth indicator - removed label */}
          <ReferenceLine 
            y={1} 
            stroke="#666" 
            strokeDasharray="3 3" 
          />
          <defs>
            <linearGradient id="rateGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area 
            type="monotone" 
            dataKey="rate" 
            stroke="#8B5CF6" 
            strokeWidth={2}
            fill="url(#rateGradient)" 
            activeDot={{ r: 6, strokeWidth: 1, stroke: '#fff' }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
