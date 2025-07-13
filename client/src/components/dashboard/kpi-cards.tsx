import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, BarChart3, Shield, Coins } from "lucide-react";
import type { DashboardAnalytics } from "@/lib/types";

interface KPICardsProps {
  analytics: DashboardAnalytics;
}

export default function KPICards({ analytics }: KPICardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {/* Break-even Progress */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-primary bg-opacity-10 rounded-lg">
              <TrendingUp className="text-primary text-xl" />
            </div>
            <span className="text-sm font-medium text-success">On Track</span>
          </div>
          <h3 className="text-2xl font-bold text-slate mb-1">Month 4</h3>
          <p className="text-gray-600 text-sm">Break-even Progress</p>
          <div className="mt-4">
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>Progress</span>
              <span>{analytics.breakEvenProgress}%</span>
            </div>
            <Progress value={analytics.breakEvenProgress} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Monthly Yield */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-success bg-opacity-10 rounded-lg">
              <BarChart3 className="text-success text-xl" />
            </div>
            <span className="text-sm font-medium text-success">+24%</span>
          </div>
          <h3 className="text-2xl font-bold text-slate mb-1">{analytics.totalYieldThisMonth}kg</h3>
          <p className="text-gray-600 text-sm">This Month's Yield</p>
          <p className="text-xs text-gray-500 mt-2">Target: 340kg (24% increase)</p>
        </CardContent>
      </Card>

      {/* Contamination Rate */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-success bg-opacity-10 rounded-lg">
              <Shield className="text-success text-xl" />
            </div>
            <span className="text-sm font-medium text-success">Good</span>
          </div>
          <h3 className="text-2xl font-bold text-slate mb-1">{analytics.contaminationRate}%</h3>
          <p className="text-gray-600 text-sm">Contamination Rate</p>
          <p className="text-xs text-gray-500 mt-2">Target: &lt;5%</p>
        </CardContent>
      </Card>

      {/* Revenue This Month */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-accent bg-opacity-10 rounded-lg">
              <Coins className="text-accent text-xl" />
            </div>
            <span className="text-sm font-medium text-success">+18%</span>
          </div>
          <h3 className="text-2xl font-bold text-slate mb-1">NPR {analytics.revenueThisMonth.toLocaleString()}</h3>
          <p className="text-gray-600 text-sm">Revenue This Month</p>
          <p className="text-xs text-gray-500 mt-2">Profit: NPR {analytics.profitThisMonth.toLocaleString()}</p>
        </CardContent>
      </Card>
    </div>
  );
}
