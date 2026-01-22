import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { OverviewSection } from './OverviewSection';
import { PredictionSection } from './PredictionSection';
import { AnalyticsSection } from './AnalyticsSection';
import { ModelsSection } from './ModelsSection';
import { RegressionSection } from './RegressionSection';
import { DepartmentsSection } from './DepartmentsSection';
import { EmployeesSection } from './EmployeesSection';
import { WhatIfSection } from './WhatIfSection';
import { ProductivitySection } from './ProductivitySection';
import { SettingsPanel } from './SettingsPanel';
import { DatasetUpload } from './DatasetUpload';
import { DepartmentFilter } from './DepartmentFilter';
import { Menu, X, Wifi, WifiOff, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { healthCheck } from '@/services/api';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';

const sectionTitles: Record<string, { title: string; subtitle: string }> = {
  overview: { title: 'Dashboard Overview', subtitle: 'Employee performance insights at a glance' },
  upload: { title: 'Dataset Upload', subtitle: 'Upload and preprocess your employee data' },
  prediction: { title: 'Performance Prediction', subtitle: 'ML-powered employee performance forecasting' },
  analytics: { title: 'Productivity Analytics', subtitle: 'Deep dive into performance drivers' },
  models: { title: 'ML Models', subtitle: 'Compare model performance and run predictions' },
  regression: { title: 'Regression Analysis', subtitle: 'Actual vs predicted performance analysis' },
  departments: { title: 'Department Analytics', subtitle: 'Performance breakdown by department' },
  employees: { title: 'Employee Directory', subtitle: 'View and manage employee data' },
  whatif: { title: 'What-If Scenarios', subtitle: 'Simulate changes and predict performance impact' },
  productivity: { title: 'Productivity Trends', subtitle: 'Team performance and productivity over time' },
};

export function Dashboard() {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const [activeSection, setActiveSection] = useState('overview');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [backendOnline, setBackendOnline] = useState<boolean | null>(null);
  const currentSection = sectionTitles[activeSection];

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  // Check backend health on mount and periodically
  useEffect(() => {
    const checkHealth = async () => {
      const result = await healthCheck();
      setBackendOnline(result.online);
    };
    
    checkHealth();
    const interval = setInterval(checkHealth, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const handleSectionChange = (section: string) => {
    setActiveSection(section);
    setMobileMenuOpen(false);
  };

  const renderSection = () => {
    switch (activeSection) {
      case 'overview':
        return <OverviewSection />;
      case 'upload':
        return <DatasetUpload />;
      case 'prediction':
        return <PredictionSection />;
      case 'analytics':
        return <AnalyticsSection />;
      case 'models':
        return <ModelsSection />;
      case 'regression':
        return <RegressionSection />;
      case 'departments':
        return <DepartmentsSection />;
      case 'employees':
        return <EmployeesSection />;
      case 'whatif':
        return <WhatIfSection />;
      case 'productivity':
        return <ProductivitySection />;
      default:
        return <OverviewSection />;
    }
  };

  return (
    <div className="min-h-screen flex w-full particle-bg">
      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 lg:hidden hover:scale-110 transition-transform"
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
      >
        {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </Button>

      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-background/80 backdrop-blur-md z-40 lg:hidden animate-fade-in"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      <Sidebar 
        activeSection={activeSection} 
        onSectionChange={handleSectionChange}
        onSettingsClick={() => setSettingsOpen(true)}
        mobileOpen={mobileMenuOpen}
        onMobileClose={() => setMobileMenuOpen(false)}
      />
      
      <main className={cn(
        "flex-1 transition-all duration-500",
        "ml-0 lg:ml-64"
      )}>
        {/* Header */}
        <header className="sticky top-0 z-30 backdrop-blur-xl bg-background/70 border-b border-border/50">
          <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 ml-10 lg:ml-0">
              <div className="animate-fade-in">
                <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">{currentSection.title}</h1>
                <p className="text-sm sm:text-base text-muted-foreground mt-1">{currentSection.subtitle}</p>
              </div>
              <div className="flex items-center gap-3">
                <DepartmentFilter />
                <Badge 
                  variant="outline" 
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 text-xs font-medium transition-all duration-300 hover-lift",
                    backendOnline === null 
                      ? "border-muted-foreground/30 text-muted-foreground"
                      : backendOnline 
                        ? "border-green-500/30 text-green-600 dark:text-green-400 bg-green-500/10 shadow-lg shadow-green-500/10" 
                        : "border-destructive/30 text-destructive bg-destructive/10 shadow-lg shadow-destructive/10"
                  )}
                >
                  {backendOnline === null ? (
                    <>
                      <span className="w-2 h-2 rounded-full bg-muted-foreground animate-pulse" />
                      Checking...
                    </>
                  ) : backendOnline ? (
                    <>
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                      </span>
                      <Wifi className="w-3 h-3" />
                      ML Backend Online
                    </>
                  ) : (
                    <>
                      <WifiOff className="w-3 h-3 animate-pulse" />
                      ML Backend Offline
                    </>
                  )}
                </Badge>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleSignOut}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="p-4 sm:p-6 lg:p-8 animate-fade-in" key={activeSection}>
          {renderSection()}
        </div>
      </main>

      {/* Settings Panel */}
      <SettingsPanel isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  );
}
