import { useState, useMemo } from 'react';
import { ChartCard } from './ChartCard';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Cell
} from 'recharts';
import { 
  Sparkles, TrendingUp, TrendingDown, Minus, RefreshCw, Play, Target, 
  Zap, Brain, Heart, Clock, Award, AlertTriangle, CheckCircle2, ArrowRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { departmentStats } from '@/data/mockData';

interface ScenarioResult {
  baselineScore: number;
  newScore: number;
  delta: number;
  percentChange: number;
  category: 'Low' | 'Medium' | 'High';
  riskLevel: 'low' | 'medium' | 'high';
  impactBreakdown: Array<{ factor: string; impact: number; direction: 'positive' | 'negative' | 'neutral' }>;
}

interface Scenario {
  name: string;
  description: string;
  icon: React.ElementType;
  color: string;
  adjustments: {
    satisfaction?: number;
    training?: number;
    workHours?: number;
    overtime?: number;
    sickDays?: number;
  };
}

const presetScenarios: Scenario[] = [
  {
    name: 'Training Boost',
    description: '+20% training hours',
    icon: Brain,
    color: 'from-blue-500 to-cyan-400',
    adjustments: { training: 20 }
  },
  {
    name: 'Work-Life Balance',
    description: '-50% overtime',
    icon: Heart,
    color: 'from-pink-500 to-rose-400',
    adjustments: { overtime: -50 }
  },
  {
    name: 'Engagement Drive',
    description: '+15% satisfaction',
    icon: Sparkles,
    color: 'from-amber-500 to-yellow-400',
    adjustments: { satisfaction: 15 }
  },
  {
    name: 'Wellness Program',
    description: '-30% sick days',
    icon: Heart,
    color: 'from-green-500 to-emerald-400',
    adjustments: { sickDays: -30 }
  },
  {
    name: 'Full Optimization',
    description: 'All factors improved',
    icon: Zap,
    color: 'from-violet-500 to-purple-400',
    adjustments: { training: 10, overtime: -25, satisfaction: 10 }
  }
];

export function WhatIfSection() {
  const [baseline] = useState({
    satisfaction: 3.8,
    trainingHours: 35,
    workHours: 43,
    overtime: 10,
    sickDays: 5
  });

  const [satisfactionChange, setSatisfactionChange] = useState([0]);
  const [trainingChange, setTrainingChange] = useState([0]);
  const [workHoursChange, setWorkHoursChange] = useState([0]);
  const [overtimeChange, setOvertimeChange] = useState([0]);
  const [sickDaysChange, setSickDaysChange] = useState([0]);
  const [selectedDepartment, setSelectedDepartment] = useState('All');
  const [isSimulating, setIsSimulating] = useState(false);
  const [result, setResult] = useState<ScenarioResult | null>(null);
  const [activeScenario, setActiveScenario] = useState<string | null>(null);

  const adjustedValues = useMemo(() => ({
    satisfaction: baseline.satisfaction * (1 + satisfactionChange[0] / 100),
    trainingHours: baseline.trainingHours * (1 + trainingChange[0] / 100),
    workHours: baseline.workHours * (1 + workHoursChange[0] / 100),
    overtime: baseline.overtime * (1 + overtimeChange[0] / 100),
    sickDays: baseline.sickDays * (1 + sickDaysChange[0] / 100)
  }), [baseline, satisfactionChange, trainingChange, workHoursChange, overtimeChange, sickDaysChange]);

  const runSimulation = () => {
    setIsSimulating(true);

    setTimeout(() => {
      const weights = {
        satisfaction: 0.285,
        training: 0.198,
        workHours: 0.124,
        overtime: 0.098,
        sickDays: 0.072
      };

      const baselineScore = 75;

      const impactBreakdown = [
        {
          factor: 'Satisfaction',
          impact: satisfactionChange[0] * weights.satisfaction * 0.5,
          direction: satisfactionChange[0] > 0 ? 'positive' : satisfactionChange[0] < 0 ? 'negative' : 'neutral'
        },
        {
          factor: 'Training',
          impact: trainingChange[0] * weights.training * 0.4,
          direction: trainingChange[0] > 0 ? 'positive' : trainingChange[0] < 0 ? 'negative' : 'neutral'
        },
        {
          factor: 'Work Hours',
          impact: workHoursChange[0] * weights.workHours * -0.2,
          direction: workHoursChange[0] > 5 ? 'negative' : workHoursChange[0] < -5 ? 'positive' : 'neutral'
        },
        {
          factor: 'Overtime',
          impact: overtimeChange[0] * weights.overtime * -0.5,
          direction: overtimeChange[0] > 0 ? 'negative' : overtimeChange[0] < 0 ? 'positive' : 'neutral'
        },
        {
          factor: 'Sick Days',
          impact: sickDaysChange[0] * weights.sickDays * -0.6,
          direction: sickDaysChange[0] > 0 ? 'negative' : sickDaysChange[0] < 0 ? 'positive' : 'neutral'
        }
      ] as ScenarioResult['impactBreakdown'];

      const totalImpact = impactBreakdown.reduce((sum, item) => sum + item.impact, 0);
      const newScore = Math.max(0, Math.min(100, baselineScore + totalImpact));
      const delta = newScore - baselineScore;
      const percentChange = (delta / baselineScore) * 100;

      const negativeImpacts = impactBreakdown.filter(i => i.direction === 'negative').length;
      const riskLevel = negativeImpacts >= 3 ? 'high' : negativeImpacts >= 1 ? 'medium' : 'low';

      setResult({
        baselineScore,
        newScore: Math.round(newScore * 10) / 10,
        delta: Math.round(delta * 10) / 10,
        percentChange: Math.round(percentChange * 10) / 10,
        category: newScore >= 80 ? 'High' : newScore >= 60 ? 'Medium' : 'Low',
        riskLevel,
        impactBreakdown
      });

      setIsSimulating(false);
    }, 1200);
  };

  const applyPreset = (scenario: Scenario) => {
    setActiveScenario(scenario.name);
    setSatisfactionChange([scenario.adjustments.satisfaction || 0]);
    setTrainingChange([scenario.adjustments.training || 0]);
    setOvertimeChange([scenario.adjustments.overtime || 0]);
    setSickDaysChange([scenario.adjustments.sickDays || 0]);
    setWorkHoursChange([0]);
  };

  const resetAll = () => {
    setActiveScenario(null);
    setSatisfactionChange([0]);
    setTrainingChange([0]);
    setWorkHoursChange([0]);
    setOvertimeChange([0]);
    setSickDaysChange([0]);
    setResult(null);
  };

  const impactChartData = result?.impactBreakdown.map(item => ({
    factor: item.factor,
    impact: Math.round(item.impact * 10) / 10,
    fill: item.direction === 'positive' ? 'hsl(var(--success))' : 
          item.direction === 'negative' ? 'hsl(var(--destructive))' : 
          'hsl(var(--muted-foreground))'
  })) || [];

  const radarData = [
    { metric: 'Satisfaction', baseline: baseline.satisfaction * 20, adjusted: adjustedValues.satisfaction * 20 },
    { metric: 'Training', baseline: baseline.trainingHours, adjusted: adjustedValues.trainingHours },
    { metric: 'Work-Life', baseline: 100 - baseline.overtime * 3, adjusted: 100 - adjustedValues.overtime * 3 },
    { metric: 'Health', baseline: 100 - baseline.sickDays * 5, adjusted: 100 - adjustedValues.sickDays * 5 },
    { metric: 'Productivity', baseline: baseline.workHours * 1.5, adjusted: adjustedValues.workHours * 1.5 },
  ];

  return (
    <div className="space-y-6">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/20 via-accent/10 to-transparent border border-primary/20 p-6 sm:p-8">
        <div className="absolute inset-0 bg-grid-pattern opacity-5" />
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-accent/20 rounded-full blur-3xl" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-6">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/25">
            <Target className="w-8 h-8 sm:w-10 sm:h-10 text-primary-foreground" />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl sm:text-3xl font-bold mb-2">What-If Scenario Builder</h2>
            <p className="text-muted-foreground text-sm sm:text-base max-w-2xl">
              Simulate the impact of organizational changes before implementation. 
              Adjust key factors and see real-time predictions powered by ML models.
            </p>
          </div>
          <div className="hidden lg:flex items-center gap-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-background/50 border border-border">
              <Brain className="w-4 h-4 text-primary" />
              <span>XGBoost Model</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-background/50 border border-border">
              <Zap className="w-4 h-4 text-accent" />
              <span>Real-time Analysis</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Scenarios - Visual Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        {presetScenarios.map((scenario, index) => {
          const Icon = scenario.icon;
          const isActive = activeScenario === scenario.name;
          
          return (
            <button
              key={scenario.name}
              onClick={() => applyPreset(scenario)}
              className={cn(
                "group relative overflow-hidden rounded-xl p-4 text-left transition-all duration-300",
                "border-2 hover:scale-[1.02] hover:shadow-lg",
                isActive 
                  ? "border-primary bg-primary/10 shadow-lg shadow-primary/20" 
                  : "border-border bg-card hover:border-primary/50"
              )}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className={cn(
                "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity",
                `bg-gradient-to-br ${scenario.color}`
              )} style={{ opacity: isActive ? 0.1 : undefined }} />
              
              <div className={cn(
                "w-10 h-10 rounded-lg flex items-center justify-center mb-3 transition-colors",
                `bg-gradient-to-br ${scenario.color}`
              )}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              
              <h3 className="font-semibold text-sm mb-1 truncate">{scenario.name}</h3>
              <p className="text-xs text-muted-foreground truncate">{scenario.description}</p>
              
              {isActive && (
                <div className="absolute top-2 right-2">
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                </div>
              )}
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Scenario Builder - Enhanced */}
        <div className="lg:col-span-4">
          <div className="glass-card p-6 h-full space-y-6 border-2 border-border hover:border-primary/30 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-lg flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  Custom Scenario
                </h3>
                <p className="text-sm text-muted-foreground">Fine-tune each factor</p>
              </div>
              <Button variant="ghost" size="sm" onClick={resetAll} className="text-muted-foreground hover:text-foreground">
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>

            {/* Department Filter */}
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">Target Department</Label>
              <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                <SelectTrigger className="bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Departments</SelectItem>
                  {departmentStats.map(d => (
                    <SelectItem key={d.department} value={d.department}>{d.department}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Sliders with visual feedback */}
            <div className="space-y-5">
              {/* Satisfaction */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label className="flex items-center gap-2 text-sm">
                    <Heart className="w-4 h-4 text-pink-500" />
                    Satisfaction
                  </Label>
                  <Badge variant={satisfactionChange[0] > 0 ? 'default' : satisfactionChange[0] < 0 ? 'destructive' : 'secondary'} className="font-mono">
                    {satisfactionChange[0] > 0 ? '+' : ''}{satisfactionChange[0]}%
                  </Badge>
                </div>
                <Slider
                  value={satisfactionChange}
                  onValueChange={setSatisfactionChange}
                  min={-50}
                  max={50}
                  step={5}
                  className="cursor-pointer"
                />
              </div>

              {/* Training */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label className="flex items-center gap-2 text-sm">
                    <Brain className="w-4 h-4 text-blue-500" />
                    Training Hours
                  </Label>
                  <Badge variant={trainingChange[0] > 0 ? 'default' : trainingChange[0] < 0 ? 'destructive' : 'secondary'} className="font-mono">
                    {trainingChange[0] > 0 ? '+' : ''}{trainingChange[0]}%
                  </Badge>
                </div>
                <Slider
                  value={trainingChange}
                  onValueChange={setTrainingChange}
                  min={-50}
                  max={100}
                  step={5}
                />
              </div>

              {/* Work Hours */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label className="flex items-center gap-2 text-sm">
                    <Clock className="w-4 h-4 text-amber-500" />
                    Work Hours
                  </Label>
                  <Badge variant={workHoursChange[0] < -10 ? 'default' : workHoursChange[0] > 10 ? 'destructive' : 'secondary'} className="font-mono">
                    {workHoursChange[0] > 0 ? '+' : ''}{workHoursChange[0]}%
                  </Badge>
                </div>
                <Slider
                  value={workHoursChange}
                  onValueChange={setWorkHoursChange}
                  min={-30}
                  max={30}
                  step={5}
                />
              </div>

              {/* Overtime */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label className="flex items-center gap-2 text-sm">
                    <AlertTriangle className="w-4 h-4 text-orange-500" />
                    Overtime
                  </Label>
                  <Badge variant={overtimeChange[0] < 0 ? 'default' : overtimeChange[0] > 0 ? 'destructive' : 'secondary'} className="font-mono">
                    {overtimeChange[0] > 0 ? '+' : ''}{overtimeChange[0]}%
                  </Badge>
                </div>
                <Slider
                  value={overtimeChange}
                  onValueChange={setOvertimeChange}
                  min={-100}
                  max={100}
                  step={10}
                />
              </div>

              {/* Sick Days */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label className="flex items-center gap-2 text-sm">
                    <Award className="w-4 h-4 text-green-500" />
                    Sick Days
                  </Label>
                  <Badge variant={sickDaysChange[0] < 0 ? 'default' : sickDaysChange[0] > 0 ? 'destructive' : 'secondary'} className="font-mono">
                    {sickDaysChange[0] > 0 ? '+' : ''}{sickDaysChange[0]}%
                  </Badge>
                </div>
                <Slider
                  value={sickDaysChange}
                  onValueChange={setSickDaysChange}
                  min={-50}
                  max={100}
                  step={10}
                />
              </div>
            </div>

            <Button 
              onClick={runSimulation} 
              className="w-full h-12 text-base"
              variant="glow"
              disabled={isSimulating}
            >
              {isSimulating ? (
                <span className="flex items-center gap-2">
                  <span className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  Simulating...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Play className="w-5 h-5" />
                  Run Simulation
                  <ArrowRight className="w-4 h-4" />
                </span>
              )}
            </Button>
          </div>
        </div>

        {/* Results Panel - Enhanced */}
        <div className="lg:col-span-8">
          <div className="glass-card p-6 h-full">
            {result ? (
              <div className="space-y-6 animate-fade-in">
                {/* Score Comparison - Hero Style */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="text-center p-6 rounded-xl bg-muted/30 border border-border">
                    <p className="text-sm text-muted-foreground mb-2 uppercase tracking-wide">Current Score</p>
                    <p className="text-4xl sm:text-5xl font-bold text-muted-foreground">{result.baselineScore}</p>
                  </div>
                  
                  <div className="text-center p-6 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/30">
                    <p className="text-sm text-muted-foreground mb-2 uppercase tracking-wide">Change</p>
                    <p className={cn(
                      "text-4xl sm:text-5xl font-bold flex items-center justify-center gap-2",
                      result.delta > 0 ? "text-green-500" : result.delta < 0 ? "text-red-500" : "text-muted-foreground"
                    )}>
                      {result.delta > 0 ? <TrendingUp className="w-8 h-8" /> : 
                       result.delta < 0 ? <TrendingDown className="w-8 h-8" /> : 
                       <Minus className="w-8 h-8" />}
                      {result.delta > 0 ? '+' : ''}{result.delta}
                    </p>
                  </div>
                  
                  <div className={cn(
                    "text-center p-6 rounded-xl border-2",
                    result.category === 'High' ? "bg-green-500/10 border-green-500/50" :
                    result.category === 'Medium' ? "bg-amber-500/10 border-amber-500/50" :
                    "bg-red-500/10 border-red-500/50"
                  )}>
                    <p className="text-sm text-muted-foreground mb-2 uppercase tracking-wide">Projected</p>
                    <p className={cn(
                      "text-4xl sm:text-5xl font-bold",
                      result.category === 'High' ? "text-green-500" :
                      result.category === 'Medium' ? "text-amber-500" :
                      "text-red-500"
                    )}>{result.newScore}</p>
                  </div>
                </div>

                {/* Category & Risk Badges */}
                <div className="flex items-center justify-center gap-3 flex-wrap">
                  <Badge className={cn(
                    "text-base py-2 px-5",
                    result.category === 'High' ? "bg-green-500/20 text-green-500 hover:bg-green-500/30" :
                    result.category === 'Medium' ? "bg-amber-500/20 text-amber-500 hover:bg-amber-500/30" :
                    "bg-red-500/20 text-red-500 hover:bg-red-500/30"
                  )}>
                    <Target className="w-4 h-4 mr-2" />
                    {result.category} Performer
                  </Badge>
                  <Badge variant="outline" className={cn(
                    "text-base py-2 px-5",
                    result.riskLevel === 'low' ? "border-green-500 text-green-500" :
                    result.riskLevel === 'medium' ? "border-amber-500 text-amber-500" :
                    "border-red-500 text-red-500"
                  )}>
                    {result.riskLevel === 'low' ? <CheckCircle2 className="w-4 h-4 mr-2" /> : <AlertTriangle className="w-4 h-4 mr-2" />}
                    {result.riskLevel.charAt(0).toUpperCase() + result.riskLevel.slice(1)} Risk
                  </Badge>
                </div>

                {/* Charts Row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Impact Chart */}
                  <div className="bg-muted/20 rounded-xl p-4 border border-border">
                    <h4 className="text-sm font-medium text-muted-foreground mb-4">Factor Impact Analysis</h4>
                    <ResponsiveContainer width="100%" height={180}>
                      <BarChart data={impactChartData} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                        <XAxis type="number" className="fill-muted-foreground" fontSize={11} />
                        <YAxis dataKey="factor" type="category" className="fill-muted-foreground" fontSize={11} width={80} />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'hsl(var(--card))', 
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px',
                            color: 'hsl(var(--foreground))'
                          }}
                        />
                        <Bar dataKey="impact" radius={[0, 4, 4, 0]}>
                          {impactChartData.map((entry, index) => (
                            <Cell key={index} fill={entry.fill} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Radar Comparison */}
                  <div className="bg-muted/20 rounded-xl p-4 border border-border">
                    <h4 className="text-sm font-medium text-muted-foreground mb-4">Before vs After Comparison</h4>
                    <ResponsiveContainer width="100%" height={180}>
                      <RadarChart data={radarData}>
                        <PolarGrid className="stroke-border" />
                        <PolarAngleAxis dataKey="metric" className="fill-muted-foreground" fontSize={10} />
                        <PolarRadiusAxis className="fill-muted-foreground" fontSize={9} />
                        <Radar name="Baseline" dataKey="baseline" stroke="hsl(var(--muted-foreground))" fill="hsl(var(--muted-foreground))" fillOpacity={0.2} strokeWidth={2} />
                        <Radar name="Adjusted" dataKey="adjusted" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.3} strokeWidth={2} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center p-8">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mb-6 animate-pulse">
                  <Target className="w-12 h-12 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2">Ready to Simulate</h3>
                <p className="text-muted-foreground max-w-md mb-6">
                  Choose a preset scenario or customize the factors on the left, then click "Run Simulation" to see the projected impact on employee performance.
                </p>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Zap className="w-4 h-4 text-primary" />
                  <span>Powered by XGBoost ML Model</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}