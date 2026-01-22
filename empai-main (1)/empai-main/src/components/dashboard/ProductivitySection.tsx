import { useState, useMemo } from 'react';
import { ChartCard } from './ChartCard';
import { StatCard } from './StatCard';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, ComposedChart, Bar, Legend, ScatterChart, Scatter, ZAxis
} from 'recharts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Clock, Target, Activity, Users, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { departmentStats as mockDeptStats, employees as mockEmployees, performanceTrends } from '@/data/mockData';
import { AnimatedNumber } from '@/components/ui/animated-number';
import { useDataset } from '@/contexts/DatasetContext';
import { useFilters } from '@/contexts/FilterContext';

// Extended productivity data
const weeklyProductivity = [
  { week: 'W1', tasks: 145, hours: 168, efficiency: 86 },
  { week: 'W2', tasks: 152, hours: 172, efficiency: 88 },
  { week: 'W3', tasks: 138, hours: 165, efficiency: 84 },
  { week: 'W4', tasks: 167, hours: 175, efficiency: 95 },
  { week: 'W5', tasks: 159, hours: 170, efficiency: 94 },
  { week: 'W6', tasks: 171, hours: 178, efficiency: 96 },
  { week: 'W7', tasks: 163, hours: 168, efficiency: 97 },
  { week: 'W8', tasks: 178, hours: 180, efficiency: 99 },
];

const hourlyProductivity = [
  { hour: '8AM', productivity: 65, focus: 70 },
  { hour: '9AM', productivity: 82, focus: 85 },
  { hour: '10AM', productivity: 95, focus: 92 },
  { hour: '11AM', productivity: 88, focus: 85 },
  { hour: '12PM', productivity: 45, focus: 40 },
  { hour: '1PM', productivity: 55, focus: 60 },
  { hour: '2PM', productivity: 78, focus: 75 },
  { hour: '3PM', productivity: 85, focus: 82 },
  { hour: '4PM', productivity: 72, focus: 70 },
  { hour: '5PM', productivity: 58, focus: 55 },
];

export function ProductivitySection() {
  const [timeRange, setTimeRange] = useState('8weeks');
  const [selectedTeam, setSelectedTeam] = useState('All');
  const { employees: uploadedEmployees, departmentStats: uploadedDeptStats, hasUploadedData } = useDataset();
  const { selectedDepartments } = useFilters();

  // Use uploaded data if available, otherwise use mock data
  const allEmployees = hasUploadedData ? uploadedEmployees : mockEmployees;
  const allDepartmentStats = hasUploadedData ? uploadedDeptStats : mockDeptStats;
  
  // Apply global department filter
  const employees = useMemo(() => {
    if (selectedDepartments.length === 0) return allEmployees;
    return allEmployees.filter(e => selectedDepartments.includes(e.department));
  }, [allEmployees, selectedDepartments]);

  const departmentStats = useMemo(() => {
    if (selectedDepartments.length === 0) return allDepartmentStats;
    return allDepartmentStats.filter(d => selectedDepartments.includes(d.department));
  }, [allDepartmentStats, selectedDepartments]);

  const teamComparison = useMemo(() => departmentStats.map(dept => ({
    team: dept.department,
    productivity: Math.round(dept.avgPerformance + Math.random() * 10 - 5),
    engagement: Math.round(dept.avgSatisfaction * 20 + Math.random() * 10),
    efficiency: Math.round(75 + Math.random() * 20),
    size: dept.employeeCount
  })), [departmentStats]);

  const employeeScatter = useMemo(() => employees.map(emp => ({
    name: emp.name,
    hours: emp.workHoursPerWeek + emp.overtimeHours,
    performance: emp.performanceScore,
    satisfaction: emp.satisfactionScore,
    department: emp.department
  })), [employees]);

  const filteredScatter = selectedTeam === 'All' 
    ? employeeScatter 
    : employeeScatter.filter(e => e.department === selectedTeam);

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Avg Productivity"
          value="87.4%"
          subtitle="Tasks completed on time"
          icon={Target}
          trend={{ value: 4.2, isPositive: true }}
          variant="primary"
          delay={0}
        />
        <StatCard
          title="Team Efficiency"
          value="92.1%"
          subtitle="Resource utilization"
          icon={Zap}
          trend={{ value: 6.8, isPositive: true }}
          variant="accent"
          delay={100}
        />
        <StatCard
          title="Avg Work Hours"
          value="43.2h"
          subtitle="Per week/employee"
          icon={Clock}
          trend={{ value: 2.1, isPositive: false }}
          variant="warning"
          delay={200}
        />
        <StatCard
          title="Active Teams"
          value="6"
          subtitle="Across departments"
          icon={Users}
          variant="success"
          delay={300}
        />
      </div>

      {/* Time Range Filter */}
      <div className="flex items-center gap-4">
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Time Range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="4weeks">Last 4 Weeks</SelectItem>
            <SelectItem value="8weeks">Last 8 Weeks</SelectItem>
            <SelectItem value="quarter">Last Quarter</SelectItem>
            <SelectItem value="year">Last Year</SelectItem>
          </SelectContent>
        </Select>
        <Select value={selectedTeam} onValueChange={setSelectedTeam}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Team" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Teams</SelectItem>
            {departmentStats.map(d => (
              <SelectItem key={d.department} value={d.department}>{d.department}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Productivity Trend */}
        <ChartCard 
          title="Weekly Productivity Trends" 
          subtitle="Tasks completed and efficiency over time"
          delay={400}
        >
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={weeklyProductivity}>
              <defs>
                <linearGradient id="efficiencyGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(142, 76%, 45%)" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="hsl(142, 76%, 45%)" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 47%, 16%)" />
              <XAxis dataKey="week" stroke="hsl(215, 20%, 55%)" fontSize={12} />
              <YAxis yAxisId="left" stroke="hsl(215, 20%, 55%)" fontSize={12} />
              <YAxis yAxisId="right" orientation="right" stroke="hsl(215, 20%, 55%)" fontSize={12} domain={[70, 100]} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(222, 47%, 8%)', 
                  border: '1px solid hsl(222, 47%, 16%)',
                  borderRadius: '8px'
                }}
              />
              <Legend />
              <Bar yAxisId="left" dataKey="tasks" name="Tasks" fill="hsl(187, 85%, 53%)" radius={[4, 4, 0, 0]} />
              <Area 
                yAxisId="right" 
                type="monotone" 
                dataKey="efficiency" 
                name="Efficiency %" 
                stroke="hsl(142, 76%, 45%)" 
                fill="url(#efficiencyGradient)"
                strokeWidth={2}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Hourly Pattern */}
        <ChartCard 
          title="Daily Productivity Pattern" 
          subtitle="Productivity and focus levels by hour"
          delay={500}
        >
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={hourlyProductivity}>
              <defs>
                <linearGradient id="productivityGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(187, 85%, 53%)" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="hsl(187, 85%, 53%)" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="focusGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(260, 65%, 60%)" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="hsl(260, 65%, 60%)" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 47%, 16%)" />
              <XAxis dataKey="hour" stroke="hsl(215, 20%, 55%)" fontSize={11} />
              <YAxis stroke="hsl(215, 20%, 55%)" fontSize={12} domain={[0, 100]} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(222, 47%, 8%)', 
                  border: '1px solid hsl(222, 47%, 16%)',
                  borderRadius: '8px'
                }}
              />
              <Legend />
              <Area 
                type="monotone" 
                dataKey="productivity" 
                name="Productivity" 
                stroke="hsl(187, 85%, 53%)" 
                fill="url(#productivityGrad)"
                strokeWidth={2}
              />
              <Area 
                type="monotone" 
                dataKey="focus" 
                name="Focus" 
                stroke="hsl(260, 65%, 60%)" 
                fill="url(#focusGrad)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Team Comparison */}
        <ChartCard 
          title="Team Comparison" 
          subtitle="Productivity metrics by department"
          delay={600}
        >
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={teamComparison} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 47%, 16%)" />
              <XAxis type="number" stroke="hsl(215, 20%, 55%)" fontSize={12} domain={[0, 100]} />
              <YAxis dataKey="team" type="category" stroke="hsl(215, 20%, 55%)" fontSize={11} width={80} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(222, 47%, 8%)', 
                  border: '1px solid hsl(222, 47%, 16%)',
                  borderRadius: '8px'
                }}
              />
              <Legend />
              <Bar dataKey="productivity" name="Productivity" fill="hsl(187, 85%, 53%)" radius={[0, 4, 4, 0]} barSize={8} />
              <Bar dataKey="engagement" name="Engagement" fill="hsl(260, 65%, 60%)" radius={[0, 4, 4, 0]} barSize={8} />
              <Bar dataKey="efficiency" name="Efficiency" fill="hsl(142, 76%, 45%)" radius={[0, 4, 4, 0]} barSize={8} />
            </ComposedChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Hours vs Performance Scatter */}
        <ChartCard 
          title="Hours vs Performance" 
          subtitle="Employee work hours correlated with performance"
          delay={700}
        >
          <ResponsiveContainer width="100%" height={300}>
            <ScatterChart>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 47%, 16%)" />
              <XAxis 
                type="number" 
                dataKey="hours" 
                name="Hours" 
                stroke="hsl(215, 20%, 55%)" 
                fontSize={12}
                domain={[35, 60]}
                label={{ value: 'Weekly Hours', position: 'bottom', fill: 'hsl(215, 20%, 55%)', fontSize: 11 }}
              />
              <YAxis 
                type="number" 
                dataKey="performance" 
                name="Performance" 
                stroke="hsl(215, 20%, 55%)" 
                fontSize={12}
                domain={[50, 100]}
                label={{ value: 'Performance', angle: -90, position: 'left', fill: 'hsl(215, 20%, 55%)', fontSize: 11 }}
              />
              <ZAxis type="number" dataKey="satisfaction" range={[50, 400]} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(222, 47%, 8%)', 
                  border: '1px solid hsl(222, 47%, 16%)',
                  borderRadius: '8px'
                }}
                formatter={(value: number, name: string) => [value, name]}
                labelFormatter={(label) => `Employee`}
              />
              <Scatter 
                name="Employees" 
                data={filteredScatter} 
                fill="hsl(187, 85%, 53%)"
              />
            </ScatterChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Performance Over Time */}
      <ChartCard 
        title="Performance Trajectory" 
        subtitle="12-month performance trend with model predictions"
        delay={800}
      >
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={performanceTrends}>
            <defs>
              <linearGradient id="actualGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(187, 85%, 53%)" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="hsl(187, 85%, 53%)" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 47%, 16%)" />
            <XAxis dataKey="month" stroke="hsl(215, 20%, 55%)" fontSize={12} />
            <YAxis stroke="hsl(215, 20%, 55%)" fontSize={12} domain={[65, 90]} />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'hsl(222, 47%, 8%)', 
                border: '1px solid hsl(222, 47%, 16%)',
                borderRadius: '8px'
              }}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="avgPerformance" 
              name="Actual Performance" 
              stroke="hsl(187, 85%, 53%)" 
              strokeWidth={3}
              dot={{ fill: 'hsl(187, 85%, 53%)', strokeWidth: 2 }}
              activeDot={{ r: 6, fill: 'hsl(187, 85%, 53%)' }}
            />
            <Line 
              type="monotone" 
              dataKey="predictions" 
              name="ML Predictions" 
              stroke="hsl(260, 65%, 60%)" 
              strokeWidth={2}
              strokeDasharray="8 4"
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Insights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          {
            title: 'Peak Hours',
            value: '10AM - 11AM',
            description: 'Highest productivity window',
            color: 'text-success',
            bgColor: 'bg-success/10',
            isText: true
          },
          {
            title: 'Top Team',
            value: 'HR',
            description: 'Highest avg performance (84.5)',
            color: 'text-primary',
            bgColor: 'bg-primary/10',
            isText: true
          },
          {
            title: 'Growth Rate',
            numValue: 12.0,
            prefix: '+',
            suffix: '%',
            description: 'YoY productivity improvement',
            color: 'text-accent',
            bgColor: 'bg-accent/10',
            isText: false
          }
        ].map((insight, index) => (
          <div 
            key={insight.title}
            className={cn("glass-card p-5 animate-slide-up", insight.bgColor)}
            style={{ animationDelay: `${900 + index * 100}ms` }}
          >
            <p className="text-sm text-muted-foreground mb-1">{insight.title}</p>
            <p className={cn("text-2xl font-bold mb-1", insight.color)}>
              {insight.isText ? insight.value : (
                <AnimatedNumber 
                  value={insight.numValue!} 
                  decimals={1}
                  prefix={insight.prefix}
                  suffix={insight.suffix}
                  delay={1000 + index * 150}
                  duration={1800}
                />
              )}
            </p>
            <p className="text-xs text-muted-foreground">{insight.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
