import { useState } from "react";
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
  UserPlus,
  LogOut,
  ChevronDown,
  ChevronRight,
  Settings,
  UserCog,
  UserCheck,
  Building2,
  DollarSign,
  ClipboardCheck,
  BarChart,
  Database
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";

interface MenuItem {
  id: string;
  name: string;
  href?: string;
  icon: any;
  children?: MenuItem[];
  roles?: string[]; // Roles that can access this menu
}

const menuStructure: MenuItem[] = [
  { 
    id: "dashboard", 
    name: "Dashboard", 
    href: "/dashboard", 
    icon: BarChart3 
  },
  { 
    id: "operations", 
    name: "Operations", 
    icon: Factory,
    children: [
      { id: "production", name: "Production", href: "/production", icon: Factory },
      { id: "inventory", name: "Inventory", href: "/inventory", icon: Package },
      { id: "locations", name: "Locations", href: "/locations", icon: MapPin },
    ]
  },
  { 
    id: "business", 
    name: "Business", 
    icon: TrendingUp,
    children: [
      { id: "financial", name: "Financial", href: "/financial", icon: DollarSign },
      { id: "sales", name: "Sales", href: "/sales", icon: ShoppingCart },
      { id: "tasks", name: "Tasks & Milestones", href: "/tasks", icon: CheckSquare },
    ]
  },
  { 
    id: "hr", 
    name: "Human Resources", 
    href: "/hr", 
    icon: Users 
  },
  { 
    id: "administration", 
    name: "Administration", 
    icon: Settings,
    roles: ["admin"], // Only admin can see this section
    children: [
      { id: "user-approval", name: "User Approval", href: "/user-approval", icon: UserCheck },
      { id: "user-management", name: "User Management", href: "/users", icon: UserCog },
      { id: "role-management", name: "Role Management", href: "/roles", icon: Shield },
    ]
  },
  { 
    id: "analytics", 
    name: "Analytics & Reports", 
    icon: BarChart,
    children: [
      { id: "analytics", name: "Analytics", href: "/analytics", icon: PieChart },
      { id: "reports", name: "Reports", href: "/reports", icon: FileText },
    ]
  },
];

interface DynamicSidebarProps {
  className?: string;
}

export default function DynamicSidebar({ className }: DynamicSidebarProps) {
  const [location] = useLocation();
  const { user } = useAuth();
  const [expandedMenus, setExpandedMenus] = useState<Set<string>>(new Set());

  const toggleMenu = (menuId: string) => {
    const newExpanded = new Set(expandedMenus);
    if (newExpanded.has(menuId)) {
      newExpanded.delete(menuId);
    } else {
      newExpanded.add(menuId);
    }
    setExpandedMenus(newExpanded);
  };

  const hasAccess = (item: MenuItem): boolean => {
    if (!item.roles) return true;
    if (!user) return false;
    
    // For now, check if user is admin (you can expand this based on your role system)
    return user.roleId === 1 || user.roleId === 2; // Admin or manager roles
  };

  const isActiveMenuItem = (item: MenuItem): boolean => {
    if (item.href) {
      return location === item.href || (location === "/" && item.href === "/dashboard");
    }
    
    // Check if any child is active
    if (item.children) {
      return item.children.some(child => child.href && 
        (location === child.href || (location === "/" && child.href === "/dashboard"))
      );
    }
    
    return false;
  };

  const renderMenuItem = (item: MenuItem, level: number = 0) => {
    if (!hasAccess(item)) return null;

    const isActive = isActiveMenuItem(item);
    const isExpanded = expandedMenus.has(item.id);
    const hasChildren = item.children && item.children.length > 0;
    const Icon = item.icon;

    return (
      <div key={item.id} className={cn("w-full", level > 0 && "ml-4")}>
        {item.href ? (
          <Link
            href={item.href}
            className={cn(
              "nav-item w-full",
              isActive 
                ? "active" 
                : "text-gray-300 hover:text-white",
              level > 0 && "text-sm py-2"
            )}
          >
            <Icon className={cn("w-5 h-5", level > 0 && "w-4 h-4")} />
            <span>{item.name}</span>
            {isActive && (
              <div className="ml-auto w-2 h-2 bg-green-400 rounded-full pulse-green"></div>
            )}
          </Link>
        ) : (
          <button
            onClick={() => toggleMenu(item.id)}
            className={cn(
              "nav-item w-full",
              isActive 
                ? "active" 
                : "text-gray-300 hover:text-white",
              level > 0 && "text-sm py-2"
            )}
          >
            <Icon className={cn("w-5 h-5", level > 0 && "w-4 h-4")} />
            <span>{item.name}</span>
            {hasChildren && (
              <div className="ml-auto">
                {isExpanded ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </div>
            )}
            {isActive && !hasChildren && (
              <div className="ml-auto w-2 h-2 bg-green-400 rounded-full pulse-green"></div>
            )}
          </button>
        )}
        
        {hasChildren && isExpanded && (
          <div className="mt-2 space-y-1">
            {item.children?.map(child => renderMenuItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={cn("w-64 sidebar-modern shadow-2xl", className)}>
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
            {menuStructure.map(item => renderMenuItem(item))}
          </div>
        </div>
        
        <div className="mt-8 px-4">
          <div className="border-t border-gray-600 pt-4">
            <div className="flex items-center justify-between px-4 py-2">
              <div className="flex items-center space-x-3">
                <img 
                  src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=40&h=40" 
                  alt="User avatar" 
                  className="w-8 h-8 rounded-full"
                />
                <div>
                  <p className="text-sm font-medium text-white">
                    {user ? `${user.firstName} ${user.lastName}` : 'Loading...'}
                  </p>
                  <p className="text-xs text-gray-400">
                    {user?.employeeId || 'User'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => window.location.href = '/api/logout'}
                className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-all duration-200"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </nav>
    </div>
  );
}