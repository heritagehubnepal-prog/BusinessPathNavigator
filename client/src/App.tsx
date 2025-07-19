import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
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
import Sidebar from "@/components/layout/sidebar";

function Router() {
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
