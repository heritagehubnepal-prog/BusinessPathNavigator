import { useQuery } from "@tanstack/react-query";
import Header from "@/components/layout/header";
import KPICards from "@/components/dashboard/kpi-cards";
import ProductionChart from "@/components/dashboard/production-chart";
import RecentActivities from "@/components/dashboard/recent-activities";
import ActiveBatches from "@/components/dashboard/active-batches";
import MilestoneTracker from "@/components/dashboard/milestone-tracker";
import QuickActions from "@/components/dashboard/quick-actions";
import type { DashboardAnalytics } from "@/lib/types";

export default function Dashboard() {
  const { data: analytics, isLoading } = useQuery<DashboardAnalytics>({
    queryKey: ["/api/analytics/dashboard"],
  });

  if (isLoading) {
    return (
      <div>
        <Header 
          title="Dashboard" 
          subtitle="Welcome back! Here's what's happening with your mushroom farm."
        />
        <main className="p-6">
          <div className="flex items-center justify-center h-64">
            <p className="text-gray-500">Loading dashboard...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div>
      <Header 
        title="Dashboard" 
        subtitle="Welcome back! Here's what's happening with your mushroom farm."
        actionLabel="Add Production Batch"
        onAction={() => {/* Handle in QuickActions */}}
      />
      
      <main className="p-6">
        {analytics && <KPICards analytics={analytics} />}
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <ProductionChart />
          <RecentActivities />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ActiveBatches />
          <MilestoneTracker />
        </div>

        <QuickActions />
      </main>
    </div>
  );
}
