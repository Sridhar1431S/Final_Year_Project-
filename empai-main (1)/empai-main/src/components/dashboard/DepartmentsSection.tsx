import { useMemo } from 'react';
import { ChartCard } from './ChartCard';
import { departmentStats as mockDeptStats } from '@/data/mockData';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
  RadialBarChart, RadialBar
} from 'recharts';
import { cn } from '@/lib/utils';
import { Users, TrendingUp, Clock, Star } from 'lucide-react';
import { useDataset } from '@/contexts/DatasetContext';
import { useFilters } from '@/contexts/FilterContext';

const COLORS = [
  'hsl(187, 85%, 53%)', 
  'hsl(260, 65%, 60%)', 
  'hsl(142, 76%, 45%)', 
  'hsl(38, 92%, 50%)', 
  'hsl(0, 72%, 51%)',
  'hsl(280, 65%, 60%)'
];

export function DepartmentsSection() {
  const { departmentStats: uploadedDeptStats, hasUploadedData } = useDataset();
  const { selectedDepartments } = useFilters();
  
  // Use uploaded data if available, otherwise use mock data
  const allDepartmentStats = hasUploadedData ? uploadedDeptStats : mockDeptStats;
  
  // Apply global department filter
  const departmentStats = useMemo(() => {
    if (selectedDepartments.length === 0) return allDepartmentStats;
    return allDepartmentStats.filter(d => selectedDepartments.includes(d.department));
  }, [allDepartmentStats, selectedDepartments]);

  const pieData = departmentStats.map(d => ({
    name: d.department,
    value: d.employeeCount
  }));

  const radialData = departmentStats.map((d, i) => ({
    name: d.department,
    performance: d.avgPerformance,
    fill: COLORS[i % COLORS.length]
  }));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Employee Distribution */}
        <ChartCard 
          title="Employee Distribution" 
          subtitle="Headcount by department"
          delay={0}
        >
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={3}
                dataKey="value"
              >
                {pieData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  color: 'hsl(var(--foreground))'
                }}
                labelStyle={{ color: 'hsl(var(--foreground))' }}
                itemStyle={{ color: 'hsl(var(--foreground))' }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Performance Radial */}
        <ChartCard 
          title="Performance by Department" 
          subtitle="Average scores comparison"
          delay={100}
        >
          <ResponsiveContainer width="100%" height={300}>
            <RadialBarChart 
              cx="50%" 
              cy="50%" 
              innerRadius="20%" 
              outerRadius="90%" 
              data={radialData}
              startAngle={180}
              endAngle={0}
            >
              <RadialBar
                background
                dataKey="performance"
                cornerRadius={5}
              />
              <Legend 
                iconSize={10}
                layout="horizontal"
                verticalAlign="bottom"
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  color: 'hsl(var(--foreground))'
                }}
                labelStyle={{ color: 'hsl(var(--foreground))' }}
                itemStyle={{ color: 'hsl(var(--foreground))' }}
                formatter={(value: number) => [`${value.toFixed(1)}%`, 'Performance']}
              />
            </RadialBarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Department Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {departmentStats.map((dept, index) => (
          <div 
            key={dept.department}
            className="glass-card-hover p-6 animate-slide-up"
            style={{ animationDelay: `${200 + index * 100}ms` }}
          >
            <div className="flex items-center gap-4 mb-6">
              <div 
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: `${COLORS[index]}20` }}
              >
                <Users className="w-6 h-6" style={{ color: COLORS[index] }} />
              </div>
              <div>
                <h3 className="font-semibold text-lg">{dept.department}</h3>
                <p className="text-sm text-muted-foreground">{dept.employeeCount} employees</p>
              </div>
            </div>

            <div className="space-y-4">
              {/* Performance */}
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" /> Performance
                  </span>
                  <span className="font-mono font-medium">{dept.avgPerformance.toFixed(1)}%</span>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all duration-1000"
                    style={{ 
                      width: `${dept.avgPerformance}%`,
                      backgroundColor: COLORS[index]
                    }}
                  />
                </div>
              </div>

              {/* Satisfaction */}
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground flex items-center gap-2">
                    <Star className="w-4 h-4" /> Satisfaction
                  </span>
                  <span className="font-mono font-medium">{dept.avgSatisfaction.toFixed(1)}/5</span>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all duration-1000 bg-accent"
                    style={{ width: `${dept.avgSatisfaction * 20}%` }}
                  />
                </div>
              </div>

              {/* Training Hours */}
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground flex items-center gap-2">
                    <Clock className="w-4 h-4" /> Training
                  </span>
                  <span className="font-mono font-medium">{dept.avgTrainingHours}h</span>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all duration-1000 bg-success"
                    style={{ width: `${dept.avgTrainingHours}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
