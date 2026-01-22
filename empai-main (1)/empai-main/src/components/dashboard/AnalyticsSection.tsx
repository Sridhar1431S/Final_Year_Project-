import { ChartCard } from './ChartCard';
import { featureImportance, performanceTrends } from '@/data/mockData';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  ComposedChart, Line, Area
} from 'recharts';
import { StatCard } from './StatCard';
import { TrendingUp, Users, Clock, Heart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AnimatedNumber } from '@/components/ui/animated-number';

export function AnalyticsSection() {
  // Group features by category
  const categoryColors: Record<string, string> = {
    'Engagement': 'bg-primary',
    'Development': 'bg-accent',
    'Experience': 'bg-success',
    'Workload': 'bg-warning',
    'Health': 'bg-destructive',
    'Demographics': 'bg-chart-1',
  };

  return (
    <div className="space-y-6">
      {/* Key Insights */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          title="Satisfaction Impact"
          value="+28.5%"
          subtitle="Strongest predictor"
          icon={Heart}
          trend={{ value: 12, isPositive: true }}
          variant="primary"
          delay={0}
        />
        <StatCard
          title="Training ROI"
          value="+19.8%"
          subtitle="Performance boost"
          icon={TrendingUp}
          trend={{ value: 8, isPositive: true }}
          variant="accent"
          delay={100}
        />
        <StatCard
          title="Avg Tenure"
          value="4.2 yrs"
          subtitle="Company average"
          icon={Clock}
          trend={{ value: 5, isPositive: true }}
          variant="success"
          delay={200}
        />
        <StatCard
          title="Active Employees"
          value="398"
          subtitle="Across 6 departments"
          icon={Users}
          variant="warning"
          delay={300}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Feature Importance */}
        <ChartCard 
          title="Feature Importance Analysis" 
          subtitle="XGBoost SHAP-style rankings"
          delay={400}
        >
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={featureImportance} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 47%, 16%)" />
              <XAxis 
                type="number" 
                stroke="hsl(215, 20%, 55%)" 
                fontSize={12}
                tickFormatter={(v) => `${(v * 100).toFixed(0)}%`}
              />
              <YAxis 
                dataKey="feature" 
                type="category" 
                stroke="hsl(215, 20%, 55%)" 
                fontSize={11} 
                width={150}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(222, 47%, 8%)', 
                  border: '1px solid hsl(222, 47%, 16%)',
                  borderRadius: '8px'
                }}
                formatter={(value: number) => [`${(value * 100).toFixed(1)}%`, 'Importance']}
              />
              <Bar 
                dataKey="importance" 
                radius={[0, 4, 4, 0]}
                fill="hsl(187, 85%, 53%)"
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Year-over-Year Trend */}
        <ChartCard 
          title="Performance Trend Analysis" 
          subtitle="Monthly comparison with predictions"
          delay={500}
        >
          <ResponsiveContainer width="100%" height={350}>
            <ComposedChart data={performanceTrends}>
              <defs>
                <linearGradient id="performanceGradient" x1="0" y1="0" x2="0" y2="1">
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
              <Area 
                type="monotone" 
                dataKey="avgPerformance" 
                fill="url(#performanceGradient)" 
                stroke="hsl(187, 85%, 53%)"
                strokeWidth={2}
                name="Actual Performance"
              />
              <Line 
                type="monotone" 
                dataKey="predictions" 
                stroke="hsl(260, 65%, 60%)" 
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={false}
                name="Model Predictions"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Feature Categories */}
      <ChartCard 
        title="Feature Categories" 
        subtitle="Grouped importance by category"
        delay={600}
      >
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {Object.entries(
            featureImportance.reduce((acc, f) => {
              acc[f.category] = (acc[f.category] || 0) + f.importance;
              return acc;
            }, {} as Record<string, number>)
          ).sort((a, b) => b[1] - a[1]).map(([category, importance], index) => (
            <div 
              key={category}
              className="glass-card p-4 text-center animate-slide-up"
              style={{ animationDelay: `${700 + index * 50}ms` }}
            >
              <div className={cn(
                "w-12 h-12 rounded-xl mx-auto mb-3 flex items-center justify-center",
                categoryColors[category] + '/20'
              )}>
                <div className={cn(
                  "w-4 h-4 rounded-full",
                  categoryColors[category]
                )} />
              </div>
              <p className="text-2xl font-bold">
                <AnimatedNumber 
                  value={importance * 100} 
                  decimals={1} 
                  suffix="%" 
                  delay={800 + index * 100}
                  duration={1500}
                />
              </p>
              <p className="text-xs text-muted-foreground mt-1">{category}</p>
            </div>
          ))}
        </div>
      </ChartCard>

      {/* Insights Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ChartCard 
          title="Key Insights" 
          subtitle="AI-generated observations"
          className="lg:col-span-2"
          delay={800}
        >
          <div className="space-y-4">
            {[
              {
                title: 'High Satisfaction = High Performance',
                description: 'Employees with satisfaction scores above 4.0 show 35% higher performance on average.',
                type: 'positive'
              },
              {
                title: 'Training Investment Pays Off',
                description: 'Each additional 10 hours of training correlates with a 5-point performance increase.',
                type: 'positive'
              },
              {
                title: 'Overtime Threshold',
                description: 'Performance starts declining when overtime exceeds 12 hours per week.',
                type: 'warning'
              },
              {
                title: 'Experience Curve',
                description: 'Optimal performance peaks between 4-7 years of tenure.',
                type: 'info'
              }
            ].map((insight, index) => (
              <div 
                key={index}
                className={cn(
                  "p-4 rounded-lg border-l-4",
                  insight.type === 'positive' ? "bg-success/10 border-success" :
                  insight.type === 'warning' ? "bg-warning/10 border-warning" :
                  "bg-primary/10 border-primary"
                )}
              >
                <h4 className="font-semibold mb-1">{insight.title}</h4>
                <p className="text-sm text-muted-foreground">{insight.description}</p>
              </div>
            ))}
          </div>
        </ChartCard>

        <ChartCard 
          title="Quick Stats" 
          subtitle="At a glance"
          delay={900}
        >
          <div className="space-y-6">
            {[
              { label: 'High Performers', value: 31, suffix: '%', color: 'text-success' },
              { label: 'Medium Performers', value: 47, suffix: '%', color: 'text-warning' },
              { label: 'Low Performers', value: 22, suffix: '%', color: 'text-destructive' },
              { label: 'Avg Satisfaction', value: 3.85, decimals: 2, suffix: '', color: 'text-primary' },
              { label: 'Training Completion', value: 78, suffix: '%', color: 'text-accent' },
            ].map((stat, index) => (
              <div key={stat.label} className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{stat.label}</span>
                <span className={cn("font-mono font-bold text-lg", stat.color)}>
                  <AnimatedNumber 
                    value={stat.value} 
                    decimals={stat.decimals || 0}
                    suffix={stat.suffix}
                    delay={1000 + index * 150}
                    duration={1800}
                  />
                </span>
              </div>
            ))}
          </div>
        </ChartCard>
      </div>
    </div>
  );
}
