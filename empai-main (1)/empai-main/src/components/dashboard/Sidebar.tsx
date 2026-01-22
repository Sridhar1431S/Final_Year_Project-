import { useState } from 'react';
import { cn } from '@/lib/utils';
import { 
  LayoutDashboard, 
  Users, 
  Brain, 
  LineChart, 
  PieChart,
  TrendingUp,
  Settings,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  FlaskConical,
  Activity,
  Home,
  Upload
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
}

const navItems: NavItem[] = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'upload', label: 'Dataset Upload', icon: Upload },
  { id: 'prediction', label: 'Prediction', icon: Sparkles },
  { id: 'whatif', label: 'What-If Analysis', icon: FlaskConical },
  { id: 'productivity', label: 'Productivity', icon: Activity },
  { id: 'analytics', label: 'Analytics', icon: TrendingUp },
  { id: 'models', label: 'ML Models', icon: Brain },
  { id: 'regression', label: 'Regression', icon: LineChart },
  { id: 'departments', label: 'Departments', icon: PieChart },
  { id: 'employees', label: 'Employees', icon: Users },
];

interface SidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  onSettingsClick: () => void;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export function Sidebar({ activeSection, onSectionChange, onSettingsClick, mobileOpen }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();

  return (
    <aside 
      className={cn(
        "fixed left-0 top-0 h-screen bg-sidebar/95 backdrop-blur-xl border-r border-sidebar-border/50 z-50 transition-all duration-500",
        "transform lg:transform-none shadow-xl lg:shadow-none",
        mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Decorative gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-accent/5 pointer-events-none" />
      
      {/* Logo */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-sidebar-border/50 relative z-10">
        {!collapsed && (
          <div className="flex items-center gap-3 animate-fade-in">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-primary to-accent rounded-lg blur opacity-50 group-hover:opacity-75 transition-opacity" />
              <div className="relative w-9 h-9 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <Brain className="w-5 h-5 text-primary-foreground" />
              </div>
            </div>
            <span className="font-bold text-lg gradient-text">EmpAI</span>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className="ml-auto hover:bg-sidebar-accent hidden lg:flex transition-transform duration-300 hover:scale-110"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-160px)] relative z-10">
        {/* Home Button */}
        <button
          onClick={() => navigate('/')}
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-300 group hover-lift",
            "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground mb-3"
          )}
        >
          <Home className="w-5 h-5 transition-all duration-300 group-hover:scale-110 group-hover:text-primary" />
          {!collapsed && <span className="font-medium text-sm">Home</span>}
        </button>

        <div className="h-px bg-sidebar-border/50 mb-3" />

        {navItems.map((item, index) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onSectionChange(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-300 group relative overflow-hidden",
                "animate-slide-in-left",
                isActive 
                  ? "bg-gradient-to-r from-primary/20 to-accent/10 text-sidebar-primary shadow-lg shadow-primary/10" 
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
              )}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-primary to-accent rounded-r-full" />
              )}
              <Icon className={cn(
                "w-5 h-5 transition-all duration-300 group-hover:scale-110 flex-shrink-0",
                isActive ? "text-primary" : "group-hover:text-primary"
              )} />
              {!collapsed && (
                <span className="font-medium text-sm truncate">{item.label}</span>
              )}
              {isActive && !collapsed && (
                <div className="ml-auto w-2 h-2 rounded-full bg-primary animate-pulse-glow flex-shrink-0" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Settings at bottom */}
      <div className="absolute bottom-4 left-0 right-0 px-3 z-10">
        <button
          onClick={onSettingsClick}
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-300 group hover-lift",
            "text-sidebar-foreground/50 hover:bg-sidebar-accent hover:text-sidebar-foreground"
          )}
        >
          <Settings className="w-5 h-5 transition-transform duration-300 group-hover:rotate-90" />
          {!collapsed && <span className="font-medium text-sm">Settings</span>}
        </button>
      </div>
    </aside>
  );
}
