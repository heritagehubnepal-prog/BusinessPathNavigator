import { Link, useLocation } from "wouter";
import { 
  Sprout, 
  BarChart3, 
  Factory, 
  Package, 
  TrendingUp, 
  CheckSquare, 
  PieChart, 
  FileText,
  ShoppingCart,
  MapPin,
  Users,
  Shield,
  UserPlus
} from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: BarChart3 },
  { name: "Production", href: "/production", icon: Factory },
  { name: "Inventory", href: "/inventory", icon: Package },
  { name: "Financial", href: "/financial", icon: TrendingUp },
  { name: "Tasks & Milestones", href: "/tasks", icon: CheckSquare },
  { name: "Sales", href: "/sales", icon: ShoppingCart },
  { name: "Locations", href: "/locations", icon: MapPin },
  { name: "Human Resources", href: "/hr", icon: Users },
  { name: "User Management", href: "/users", icon: UserPlus },
  { name: "Role Management", href: "/roles", icon: Shield },
  { name: "Analytics", href: "/analytics", icon: PieChart },
  { name: "Reports", href: "/reports", icon: FileText },
];

export default function Sidebar() {
  const [location] = useLocation();

  return (
    <div className="w-64 sidebar-modern shadow-2xl">
      <div className="p-6 border-b border-slate-700/50 mycelium-network">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Sprout className="text-green-400 text-2xl float-animation" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-amber-400 rounded-full pulse-green"></div>
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Mycopath</h1>
            <p className="text-xs text-green-300">🍄 Mushroom Innovation Lab</p>
            <p className="text-xs text-amber-300 bounce-subtle">🇳🇵 From Nepal's Mountains</p>
          </div>
        </div>
      </div>
      
      <nav className="mt-6">
        <div className="px-4">
          <div className="space-y-2">
            {navigation.map((item) => {
              const isActive = location === item.href || (location === "/" && item.href === "/dashboard");
              const Icon = item.icon;
              
              return (
                <Link key={item.name} href={item.href} className={cn(
                  "nav-item",
                  isActive 
                    ? "active" 
                    : "text-gray-300 hover:text-white"
                )}>
                  <Icon className="w-5 h-5" />
                  <span>{item.name}</span>
                  {isActive && (
                    <div className="ml-auto w-2 h-2 bg-green-400 rounded-full pulse-green"></div>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
        
        <div className="mt-8 px-4">
          <div className="border-t border-gray-600 pt-4">
            <div className="flex items-center space-x-3 px-4 py-2">
              <img 
                src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=40&h=40" 
                alt="User avatar" 
                className="w-8 h-8 rounded-full"
              />
              <div>
                <p className="text-sm font-medium">Akash Rai</p>
                <p className="text-xs text-gray-400">Founder/CEO</p>
              </div>
            </div>
          </div>
        </div>
      </nav>
    </div>
  );
}
