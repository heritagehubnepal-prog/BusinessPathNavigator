import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import Production from "@/pages/production";
import Inventory from "@/pages/inventory";
import Financial from "@/pages/financial";
import Tasks from "@/pages/tasks";
import Analytics from "@/pages/analytics";
import Reports from "@/pages/reports";
import Sales from "@/pages/sales";
import Locations from "@/pages/locations";
import HRPage from "@/pages/hr";
import RolesManagement from "@/pages/roles";
import UsersPage from "@/pages/users";
import AuthPage from "@/pages/auth";
import UserApproval from "@/pages/user-approval";
import Sidebar from "@/components/layout/sidebar";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  // Show loading screen while checking authentication
  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="text-center space-y-4">
          <div className="animate-spin w-8 h-8 border-4 border-green-400 border-t-transparent rounded-full mx-auto"></div>
          <p className="text-white">Loading Mycopath System...</p>
        </div>
      </div>
    );
  }

  // Show auth page if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="h-screen">
        <AuthPage />
      </div>
    );
  }

  // Show main app if authenticated
  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 overflow-auto">
        <Switch>
          <Route path="/" component={Dashboard} />
          <Route path="/dashboard" component={Dashboard} />
          <Route path="/production" component={Production} />
          <Route path="/inventory" component={Inventory} />
          <Route path="/financial" component={Financial} />
          <Route path="/tasks" component={Tasks} />
          <Route path="/sales" component={Sales} />
          <Route path="/locations" component={Locations} />
          <Route path="/hr" component={HRPage} />
          <Route path="/roles" component={RolesManagement} />
          <Route path="/users" component={UsersPage} />
          <Route path="/user-approval" component={UserApproval} />
          <Route path="/auth" component={AuthPage} />
          <Route path="/analytics" component={Analytics} />
          <Route path="/reports" component={Reports} />
          <Route component={NotFound} />
        </Switch>
      </div>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
