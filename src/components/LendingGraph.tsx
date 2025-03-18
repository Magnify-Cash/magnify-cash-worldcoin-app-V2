
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import { useIsMobile } from "@/hooks/use-mobile";

const data = [
  { date: "Jan", rate: 1.000 },
  { date: "Feb", rate: 1.004 },
  { date: "Mar", rate: 1.009 },
  { date: "Apr", rate: 1.015 },
  { date: "May", rate: 1.021 },
  { date: "Jun", rate: 1.028 },
  { date: "Jul", rate: 1.035 },
];

export function LendingGraph() {
  const isMobile = useIsMobile();
  
  return (
    <div className="w-full h-[250px] sm:h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{
            top: 10,
            right: isMobile ? 0 : 10,
            left: isMobile ? -20 : 0,
            bottom: 0,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis 
            dataKey="date" 
            tick={{ fontSize: isMobile ? 10 : 12 }}
            tickMargin={isMobile ? 5 : 10}
          />
          <YAxis 
            domain={[1, 1.05]}
            tick={{ fontSize: isMobile ? 10 : 12 }}
            tickFormatter={(value) => {
              // Check if value is a number before calling toFixed
              return typeof value === 'number' 
                ? (isMobile ? value.toFixed(2) : value.toFixed(3))
                : value;
            }}
            width={isMobile ? 30 : 40}
          />
          <Tooltip 
            formatter={(value) => {
              // Check if value is a number before calling toFixed
              return typeof value === 'number'
                ? [value.toFixed(4), 'Exchange Rate']
                : [value, 'Exchange Rate'];
            }}
            labelFormatter={(label) => `${label} 2024`}
          />
          {/* Reference line at value 1.0 for negative growth indicator */}
          <ReferenceLine 
            y={1} 
            stroke="#666" 
            strokeDasharray="3 3" 
            label={{ 
              value: "$1", 
              position: "insideBottomRight",
              fontSize: 10,
              fill: "#666" 
            }} 
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
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
