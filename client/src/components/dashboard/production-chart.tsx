import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function ProductionChart() {
  const { data: productionData, isLoading } = useQuery({
    queryKey: ["/api/analytics/production"],
  });

  if (isLoading) {
    return (
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Production Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center">
            <p className="text-gray-500">Loading chart...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const months = Object.keys(productionData || {});
  const mushroomData = months.map(month => productionData?.[month]?.mushrooms || 0);
  const myceliumData = months.map(month => productionData?.[month]?.mycelium || 0);

  const chartData = {
    labels: months.length > 0 ? months : ['Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan'],
    datasets: [
      {
        label: 'Mushroom Yield (kg)',
        data: mushroomData.length > 0 ? mushroomData : [180, 210, 195, 240, 265, 284],
        borderColor: '#6B8E23',
        backgroundColor: '#6B8E2320',
        tension: 0.4,
        fill: true,
      },
      {
        label: 'Mycelium Products (units)',
        data: myceliumData.length > 0 ? myceliumData : [15, 18, 22, 28, 35, 42],
        borderColor: '#DAA520',
        backgroundColor: '#DAA52020',
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Production Overview</CardTitle>
          <Select defaultValue="6months">
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="3months">Last 3 Months</SelectItem>
              <SelectItem value="6months">Last 6 Months</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <Line data={chartData} options={options} />
        </div>
      </CardContent>
    </Card>
  );
}
