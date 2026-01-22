import { useMemo } from 'react';
import { Users, Brain, Target, Clock, Database } from 'lucide-react';
import { StatCard } from './StatCard';
import { ChartCard } from './ChartCard';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar
} from 'recharts';
import { 
  performanceTrends as mockTrends, 
  departmentStats as mockDeptStats, 
  performanceDistribution as mockPerfDist,
  featureImportance as mockFeatureImportance 
} from '@/data/mockData';
import { AnimatedNumber } from '@/components/ui/animated-number';
import { useDataset } from '@/contexts/DatasetContext';
import { useFilters } from '@/contexts/FilterContext';

const COLORS = ['hsl(187, 85%, 53%)', 'hsl(260, 65%, 60%)', 'hsl(142, 76%, 45%)', 'hsl(38, 92%, 50%)', 'hsl(0, 72%, 51%)'];

export function OverviewSection() {
  const { 
    analysis, 
    datasetName, 
    isAnalyzing, 
    hasUploadedData,
    employees: allEmployees,
    departmentStats: uploadedDeptStats,
    featureImportance: uploadedFeatureImportance,
    performanceDistribution: uploadedPerfDist
  } = useDataset();
  
  const { selectedDepartments } = useFilters();

  // Filter employees by selected departments
  const employees = useMemo(() => {
    if (selectedDepartments.length === 0) return allEmployees;
    return allEmployees.filter(e => selectedDepartments.includes(e.department));
  }, [allEmployees, selectedDepartments]);

  // Use uploaded data if available, otherwise use mock data
  const hasData = hasUploadedData || !!analysis;

  const totalEmployees = hasUploadedData 
    ? employees.length 
    : (analysis?.summary.total_employees ?? 398);
  
  const avgPerformance = hasUploadedData 
    ? (employees.reduce((sum, e) => sum + e.performanceScore, 0) / employees.length || 0)
    : (analysis?.summary.avg_performance ?? 82.34);
  
  const avgSatisfaction = hasUploadedData 
    ? (employees.reduce((sum, e) => sum + e.satisfactionScore, 0) / employees.length || 0)
    : (analysis?.summary.avg_satisfaction ?? 4.2);
  
  const departments = hasUploadedData 
    ? [...new Set(employees.map(e => e.department))]
    : (analysis?.summary.departments ?? ['Engineering', 'Sales', 'HR', 'Marketing', 'Finance']);

  // Filter department stats by selected departments
  const deptStats = useMemo(() => {
    let stats = hasUploadedData 
      ? uploadedDeptStats.map(d => ({
          department: d.department,
          avgPerformance: d.avgPerformance,
          employeeCount: d.employeeCount
        }))
      : (analysis 
          ? analysis.department_stats.map(d => ({
              department: d.department,
              avgPerformance: d.avg_performance,
              employeeCount: d.count
            }))
          : mockDeptStats);
    
    // Apply department filter
    if (selectedDepartments.length > 0) {
      stats = stats.filter(d => selectedDepartments.includes(d.department));
    }
    return stats;
  }, [hasUploadedData, uploadedDeptStats, analysis, selectedDepartments]);

  const perfDistribution = hasUploadedData 
    ? uploadedPerfDist 
    : (analysis?.performance_distribution ?? mockPerfDist);

  const riskDistribution = hasUploadedData 
    ? [
        { name: 'Low Risk', value: employees.filter(e => e.performanceCategory === 'Low').length, color: 'hsl(0, 72%, 51%)' },
        { name: 'Medium Risk', value: employees.filter(e => e.performanceCategory === 'Medium').length, color: 'hsl(38, 92%, 50%)' },
        { name: 'High Performers', value: employees.filter(e => e.performanceCategory === 'High').length, color: 'hsl(142, 76%, 45%)' },
      ]
    : (analysis 
        ? [
            { name: 'Low Risk', value: analysis.summary.risk_distribution.low, color: 'hsl(142, 76%, 45%)' },
            { name: 'Medium Risk', value: analysis.summary.risk_distribution.medium, color: 'hsl(38, 92%, 50%)' },
            { name: 'High Risk', value: analysis.summary.risk_distribution.high, color: 'hsl(0, 72%, 51%)' },
          ]
        : null);

  const featureImportance = hasUploadedData
    ? uploadedFeatureImportance.slice(0, 5).map((f, idx) => ({
        name: f.feature,
        value: f.importance * 100,
        color: ['bg-primary', 'bg-accent', 'bg-success', 'bg-warning', 'bg-chart-5'][idx]
      }))
    : (analysis
        ? analysis.feature_correlations.slice(0, 5).map((f, idx) => ({
            name: f.feature.replace(/_/g, ' '),
            value: Math.abs(f.correlation * 100),
            color: ['bg-primary', 'bg-accent', 'bg-success', 'bg-warning', 'bg-chart-5'][idx]
          }))
        : mockFeatureImportance.slice(0, 5).map((f, idx) => ({
            name: f.feature,
            value: f.importance * 100,
            color: ['bg-primary', 'bg-accent', 'bg-success', 'bg-warning', 'bg-chart-5'][idx]
          })));

  const trends = analysis?.trends
    ? analysis.trends.monthly_performance.map(t => ({
        month: t.month,
        avgPerformance: t.performance,
        predictions: t.performance * (0.95 + Math.random() * 0.1)
      }))
    : mockTrends;

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Dataset Status Banner */}
      {hasData && datasetName && (
        <div className="bg-primary/10 border border-primary/20 rounded-xl p-3 sm:p-4 flex items-center gap-3 sm:gap-4">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
            <Database className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-primary text-sm sm:text-base truncate">Dataset: {datasetName}</p>
            <p className="text-xs sm:text-sm text-muted-foreground">
              {totalEmployees} employees • {departments.length} departments
            </p>
          </div>
        </div>
      )}

      {isAnalyzing && (
        <div className="bg-muted/30 border border-border rounded-xl p-3 sm:p-4 flex items-center gap-3 sm:gap-4">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-muted flex items-center justify-center animate-pulse flex-shrink-0">
            <Brain className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm sm:text-base">Analyzing Dataset...</p>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Processing your data
            </p>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          title="Total Employees"
          value={totalEmployees.toString()}
          subtitle="Active workforce"
          icon={Users}
          trend={{ value: 5.2, isPositive: true }}
          variant="primary"
          delay={0}
        />
        <StatCard
          title="Avg Performance"
          value={`${avgPerformance.toFixed(2)}%`}
          subtitle={hasData ? "From dataset analysis" : "R² Score: 0.8234"}
          icon={Target}
          trend={{ value: 3.8, isPositive: true }}
          variant="success"
          delay={100}
        />
        <StatCard
          title="Avg Satisfaction"
          value={avgSatisfaction.toFixed(1)}
          subtitle="Employee satisfaction score"
          icon={Brain}
          trend={{ value: 2.1, isPositive: true }}
          variant="accent"
          delay={200}
        />
        <StatCard
          title="Departments"
          value={departments.length.toString()}
          subtitle="Active departments"
          icon={Clock}
          trend={{ value: 8.5, isPositive: true }}
          variant="warning"
          delay={300}
        />
      </div>

      {/* Risk Distribution (only when dataset is loaded) */}
      {riskDistribution && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          {riskDistribution.map((risk, idx) => (
            <div 
              key={risk.name}
              className="bg-card border border-border rounded-xl p-3 sm:p-4 flex items-center gap-3 sm:gap-4"
            >
              <div 
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: `${risk.color}20` }}
              >
                <span className="text-lg sm:text-xl font-bold" style={{ color: risk.color }}>
                  {risk.value}
                </span>
              </div>
              <div className="min-w-0">
                <p className="font-medium text-sm sm:text-base truncate">{risk.name}</p>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {((risk.value / totalEmployees) * 100).toFixed(1)}% of workforce
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <ChartCard 
          title="Performance Trends" 
          subtitle={hasData ? "Monthly performance from dataset" : "Actual vs Predicted performance over time"}
          delay={400}
        >
          <ResponsiveContainer width="100%" height={250} className="min-h-[200px] sm:min-h-[250px] lg:min-h-[300px]">
            <AreaChart data={trends}>
              <defs>
                <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(187, 85%, 53%)" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="hsl(187, 85%, 53%)" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorPredicted" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(260, 65%, 60%)" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="hsl(260, 65%, 60%)" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="month" className="fill-muted-foreground" fontSize={12} />
              <YAxis className="fill-muted-foreground" fontSize={12} domain={[65, 90]} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  color: 'hsl(var(--foreground))'
                }}
              />
              <Area 
                type="monotone" 
                dataKey="avgPerformance" 
                stroke="hsl(187, 85%, 53%)" 
                fill="url(#colorActual)" 
                strokeWidth={2}
                name="Actual"
              />
              <Area 
                type="monotone" 
                dataKey="predictions" 
                stroke="hsl(260, 65%, 60%)" 
                fill="url(#colorPredicted)" 
                strokeWidth={2}
                name="Predicted"
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard 
          title="Department Performance" 
          subtitle="Average performance by department"
          delay={500}
        >
          <ResponsiveContainer width="100%" height={250} className="min-h-[200px] sm:min-h-[250px] lg:min-h-[300px]">
            <BarChart data={deptStats} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis type="number" className="fill-muted-foreground" fontSize={10} domain={[0, 100]} />
              <YAxis dataKey="department" type="category" className="fill-muted-foreground" fontSize={10} width={60} tickFormatter={(value) => value.length > 8 ? value.slice(0, 8) + '...' : value} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  color: 'hsl(var(--foreground))'
                }}
              />
              <Bar 
                dataKey="avgPerformance" 
                fill="hsl(187, 85%, 53%)" 
                radius={[0, 4, 4, 0]}
                name="Avg Performance"
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <ChartCard 
          title="Performance Distribution" 
          subtitle="Employee score ranges"
          delay={600}
        >
          <ResponsiveContainer width="100%" height={200} className="min-h-[180px] sm:min-h-[220px]">
            <BarChart data={perfDistribution}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="range" className="fill-muted-foreground" fontSize={10} />
              <YAxis className="fill-muted-foreground" fontSize={10} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  color: 'hsl(var(--foreground))'
                }}
              />
              <Bar dataKey="count" fill="hsl(260, 65%, 60%)" radius={[4, 4, 0, 0]} name="Employees" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard 
          title={hasData ? "Feature Correlations" : "Top Performance Drivers"}
          subtitle={hasData ? "Correlation with performance" : "Feature importance from XGBoost"}
          className="lg:col-span-2"
          delay={700}
        >
          <div className="space-y-3 sm:space-y-4">
            {featureImportance.map((item, index) => (
              <div key={item.name} className="space-y-1.5 sm:space-y-2">
                <div className="flex justify-between text-xs sm:text-sm gap-2">
                  <span className="text-muted-foreground truncate">{item.name}</span>
                  <span className="font-mono font-medium flex-shrink-0">
                    <AnimatedNumber 
                      value={item.value} 
                      decimals={1}
                      suffix="%"
                      delay={800 + index * 100}
                      duration={1500}
                    />
                  </span>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${item.color} rounded-full transition-all duration-1000 ease-out`}
                    style={{ 
                      width: `${Math.min(item.value * 3, 100)}%`,
                      animationDelay: `${800 + index * 100}ms`
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </ChartCard>
      </div>

    </div>
  );
}
