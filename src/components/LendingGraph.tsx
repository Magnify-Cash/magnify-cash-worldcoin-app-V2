
import { useState } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Legend } from "recharts";
import { useIsMobile } from "@/hooks/use-mobile";
import { Checkbox } from "@/components/ui/checkbox";

// Data for multiple pools
const poolsData = [
  {
    id: 1,
    name: "Pool A",
    color: "#8B5CF6", // Purple
    transparentColor: "#E5DEFF", // Transparent purple
    data: [
      { date: "Jan", rate: 1.000 },
      { date: "Feb", rate: 1.004 },
      { date: "Mar", rate: 1.009 },
      { date: "Apr", rate: 1.015 },
      { date: "May", rate: 1.021 },
      { date: "Jun", rate: 1.028 },
      { date: "Jul", rate: 1.035 },
      { date: "Aug", rate: 1.032 },
      { date: "Sep", rate: 1.020 },
      { date: "Oct", rate: 0.998 },
      { date: "Nov", rate: 0.992 },
      { date: "Dec", rate: 1.005 },
    ]
  },
  {
    id: 2,
    name: "Pool B",
    color: "#10B981", // Green
    transparentColor: "#F2FCE2", // Transparent green
    data: [
      { date: "Jan", rate: 1.000 },
      { date: "Feb", rate: 1.006 },
      { date: "Mar", rate: 1.013 },
      { date: "Apr", rate: 1.021 },
      { date: "May", rate: 1.019 },
      { date: "Jun", rate: 1.025 },
      { date: "Jul", rate: 1.033 },
      { date: "Aug", rate: 1.042 },
      { date: "Sep", rate: 1.045 },
      { date: "Oct", rate: 1.044 },
      { date: "Nov", rate: 1.048 },
      { date: "Dec", rate: 1.053 },
    ]
  },
  {
    id: 3,
    name: "Pool C",
    color: "#F59E0B", // Amber/Orange
    transparentColor: "#FEC6A1", // Transparent orange
    data: [
      { date: "Jan", rate: 1.000 },
      { date: "Feb", rate: 1.002 },
      { date: "Mar", rate: 1.007 },
      { date: "Apr", rate: 1.011 },
      { date: "May", rate: 1.016 },
      { date: "Jun", rate: 1.014 },
      { date: "Jul", rate: 1.009 },
      { date: "Aug", rate: 1.013 },
      { date: "Sep", rate: 1.018 },
      { date: "Oct", rate: 1.024 },
      { date: "Nov", rate: 1.031 },
      { date: "Dec", rate: 1.038 },
    ]
  }
];

// Combined data for proper date alignment
const combinedData = poolsData[0].data.map((item, index) => {
  const result: Record<string, any> = { date: item.date };
  
  poolsData.forEach(pool => {
    result[`rate_${pool.id}`] = pool.data[index].rate;
  });
  
  return result;
});

export function LendingGraph() {
  const isMobile = useIsMobile();
  const [visiblePools, setVisiblePools] = useState<number[]>(poolsData.map(pool => pool.id));
  
  // Toggle pool visibility
  const togglePoolVisibility = (poolId: number) => {
    setVisiblePools(prev => 
      prev.includes(poolId)
        ? prev.filter(id => id !== poolId)
        : [...prev, poolId]
    );
  };

  // Calculate which ticks to show based on mobile/desktop
  const getTickInterval = () => {
    return isMobile ? 2 : 1; // Show every other month on mobile
  };

  return (
    <div className="w-full">
      <div className="flex flex-wrap gap-4 mb-3 px-2">
        {poolsData.map(pool => (
          <div key={pool.id} className="flex items-center space-x-2">
            <Checkbox 
              id={`pool-${pool.id}`}
              checked={visiblePools.includes(pool.id)}
              onCheckedChange={() => togglePoolVisibility(pool.id)}
              className="border-2 data-[state=checked]:bg-transparent"
              style={{ 
                borderColor: pool.color,
                backgroundColor: visiblePools.includes(pool.id) ? pool.transparentColor : 'transparent'
              }}
            />
            <label
              htmlFor={`pool-${pool.id}`}
              className="text-xs sm:text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
            >
              {pool.name}
            </label>
          </div>
        ))}
      </div>
    
      <div className="w-full h-[280px] sm:h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={combinedData}
            margin={{
              top: 10,
              right: isMobile ? 5 : 10,
              left: isMobile ? 0 : 0,
              bottom: isMobile ? 10 : 0,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={!isMobile} />
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: isMobile ? 11 : 12 }}
              tickMargin={isMobile ? 8 : 10}
              interval={getTickInterval()}
              padding={{ left: 10, right: 10 }}
            />
            <YAxis 
              domain={[0.98, 1.06]}
              tick={{ fontSize: isMobile ? 11 : 12 }}
              tickFormatter={(value) => {
                if (typeof value !== 'number') return value;
                
                if (isMobile) {
                  if (value === 1) return "$1.00";
                  return "$" + value.toFixed(2);
                } 
                
                return "$" + value.toFixed(3);
              }}
              width={isMobile ? 45 : 50}
              tickCount={isMobile ? 5 : 6}
              padding={{ top: 10, bottom: 10 }}
            />
            <Tooltip 
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-white/90 backdrop-blur-sm border border-gray-200 shadow-md rounded-md p-2 text-xs">
                      <p className="font-medium">{label} 2024</p>
                      <div className="pt-1 space-y-1">
                        {payload.map((entry, index) => {
                          if (!entry.value) return null;
                          // Fix: Cast dataKey to string before using split
                          const dataKey = String(entry.dataKey);
                          const poolId = parseInt(dataKey.split('_')[1]);
                          const pool = poolsData.find(p => p.id === poolId);
                          if (!pool || !visiblePools.includes(poolId)) return null;
                          
                          return (
                            <p key={index} style={{ color: pool.color }} className="font-semibold">
                              {pool.name}: ${(entry.value as number).toFixed(4)}
                            </p>
                          );
                        })}
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            {/* Reference line at value 1.0 for negative growth indicator */}
            <ReferenceLine 
              y={1} 
              stroke="#666" 
              strokeDasharray="3 3" 
            />
            
            {/* Render each pool's data */}
            {poolsData.map(pool => {
              // Only render if pool is visible
              if (!visiblePools.includes(pool.id)) return null;
              
              return (
                <defs key={`gradient-${pool.id}`}>
                  <linearGradient id={`rateGradient_${pool.id}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={pool.color} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={pool.color} stopOpacity={0} />
                  </linearGradient>
                </defs>
              );
            })}
            
            {poolsData.map(pool => {
              // Only render if pool is visible
              if (!visiblePools.includes(pool.id)) return null;
              
              return (
                <Area 
                  key={`area-${pool.id}`}
                  type="monotone" 
                  dataKey={`rate_${pool.id}`} 
                  stroke={pool.color} 
                  strokeWidth={2}
                  fill={`url(#rateGradient_${pool.id})`} 
                  activeDot={{ r: 6, strokeWidth: 1, stroke: '#fff' }}
                  isAnimationActive={true}
                  animationDuration={1000}
                />
              );
            })}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
