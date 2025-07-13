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
    <div className="min-h-screen">
      <Header 
        title="🍄 Mushroom Farm Dashboard" 
        subtitle="Welcome back! Monitor your mycelium empire and track growth progress."
        actionLabel="+ Add Production Batch"
        onAction={() => {/* Handle in QuickActions */}}
      />
      
      <main className="p-6 space-y-8">
        {/* Hero Stats Section */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-green-100/50 to-amber-100/50 rounded-3xl -z-10"></div>
          {analytics && <KPICards analytics={analytics} />}
        </div>
        
        {/* Main Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 glass-card card-hover p-6">
            <ProductionChart />
          </div>
          <div className="glass-card card-hover p-6">
            <RecentActivities />
          </div>
        </div>

        {/* Secondary Widgets */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="glass-card card-hover p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-green-200/30 to-emerald-200/30 rounded-full -translate-y-10 translate-x-10"></div>
            <ActiveBatches />
          </div>
          <div className="glass-card card-hover p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-amber-200/30 to-orange-200/30 rounded-full -translate-y-10 translate-x-10"></div>
            <MilestoneTracker />
          </div>
        </div>

        {/* Quick Actions */}
        <div className="glass-card card-hover p-6 relative overflow-hidden">
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-green-100/40 to-transparent rounded-full -translate-x-16 translate-y-16"></div>
          <QuickActions />
        </div>
      </main>
    </div>
  );
}
