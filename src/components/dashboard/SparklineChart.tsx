import { Line, LineChart, ResponsiveContainer } from "recharts";

interface SparklineChartProps {
  data: number[];
  color?: string;
}

const SparklineChart = ({ data, color = "hsl(152 100% 50%)" }: SparklineChartProps) => {
  const chartData = data.map((value, index) => ({ index, value }));

  return (
    <ResponsiveContainer width={80} height={30}>
      <LineChart data={chartData}>
        <Line
          type="monotone"
          dataKey="value"
          stroke={color}
          strokeWidth={1.5}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default SparklineChart;
