import { useState } from 'react';
import { ChartCard } from './ChartCard';
import { modelMetrics } from '@/data/mockData';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend
} from 'recharts';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trophy, Target, Percent, TrendingUp, Calculator, Sparkles } from 'lucide-react';

interface ModelPrediction {
  name: string;
  predictedScore: number;
  confidence: number;
  category: 'Low' | 'Medium' | 'High';
}

// Simulated model prediction functions (in production, these would call actual ML APIs)
const predictWithModel = (
  modelName: string,
  satisfaction: number,
  trainingHours: number,
  yearsAtCompany: number,
  workHours: number,
  overtime: number,
  sickDays: number,
  department: string
): ModelPrediction => {
  // Base calculation with different weights per model
  const weights: Record<string, Record<string, number>> = {
    'XGBoost': { sat: 14, train: 0.55, years: 2.5, work: -0.3, ot: -1.0, sick: -1.8 },
    'Random Forest': { sat: 13, train: 0.48, years: 2.2, work: -0.25, ot: -0.9, sick: -1.5 },
    'Decision Tree': { sat: 11, train: 0.40, years: 1.8, work: -0.2, ot: -0.7, sick: -1.2 },
    'Linear Regression': { sat: 10, train: 0.35, years: 1.5, work: -0.15, ot: -0.5, sick: -1.0 },
    'Logistic Regression': { sat: 10, train: 0.35, years: 1.5, work: -0.15, ot: -0.5, sick: -1.0 },
  };

  const deptBonus: Record<string, number> = {
    'HR': 5,
    'Sales': 4,
    'Engineering': 2,
    'Finance': 3,
    'Marketing': 1,
    'Operations': 0,
  };

  const w = weights[modelName] || weights['Linear Regression'];
  
  let score = 25 +
    satisfaction * w.sat +
    trainingHours * w.train +
    yearsAtCompany * w.years +
    (workHours - 40) * w.work +
    overtime * w.ot +
    sickDays * w.sick +
    (deptBonus[department] || 0);

  // Add some model-specific variance
  const variance = {
    'XGBoost': 0,
    'Random Forest': (Math.random() - 0.5) * 3,
    'Decision Tree': (Math.random() - 0.5) * 5,
    'Linear Regression': (Math.random() - 0.5) * 4,
    'Logistic Regression': (Math.random() - 0.5) * 4,
  };

  score = Math.min(100, Math.max(0, score + (variance[modelName as keyof typeof variance] || 0)));

  const confidence = {
    'XGBoost': 85 + Math.random() * 10,
    'Random Forest': 80 + Math.random() * 10,
    'Decision Tree': 70 + Math.random() * 12,
    'Linear Regression': 65 + Math.random() * 12,
    'Logistic Regression': 68 + Math.random() * 10,
  };

  const category: 'Low' | 'Medium' | 'High' = score < 60 ? 'Low' : score < 80 ? 'Medium' : 'High';

  return {
    name: modelName,
    predictedScore: Math.round(score),
    confidence: confidence[modelName as keyof typeof confidence] || 75,
    category,
  };
};

export function ModelsSection() {
  const [satisfaction, setSatisfaction] = useState([3.5]);
  const [trainingHours, setTrainingHours] = useState([35]);
  const [yearsAtCompany, setYearsAtCompany] = useState([3]);
  const [workHours, setWorkHours] = useState([42]);
  const [overtime, setOvertime] = useState([8]);
  const [sickDays, setSickDays] = useState([4]);
  const [department, setDepartment] = useState('Engineering');
  const [predictions, setPredictions] = useState<ModelPrediction[]>([]);
  const [isCalculating, setIsCalculating] = useState(false);

  const regressionModels = modelMetrics.filter(m => m.type === 'regression');
  const classificationModels = modelMetrics.filter(m => m.type === 'classification');

  const radarData = classificationModels.map(m => ({
    model: m.name,
    Accuracy: (m.accuracy || 0) * 100,
    Precision: (m.precision || 0) * 100,
    Recall: (m.recall || 0) * 100,
    'F1 Score': (m.f1Score || 0) * 100,
  }));

  const handleCalculate = () => {
    setIsCalculating(true);
    
    setTimeout(() => {
      const modelNames = ['XGBoost', 'Random Forest', 'Decision Tree', 'Linear Regression'];
      const results = modelNames.map(model => 
        predictWithModel(
          model,
          satisfaction[0],
          trainingHours[0],
          yearsAtCompany[0],
          workHours[0],
          overtime[0],
          sickDays[0],
          department
        )
      );
      
      // Sort by predicted score descending
      results.sort((a, b) => b.predictedScore - a.predictedScore);
      setPredictions(results);
      setIsCalculating(false);
    }, 1000);
  };

  const predictionChartData = predictions.map(p => ({
    name: p.name,
    score: p.predictedScore,
    confidence: p.confidence,
  }));

  return (
    <div className="space-y-6">
      {/* Best Model Highlight */}
      <div className="glass-card p-6 glow-primary animate-slide-up">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <Trophy className="w-8 h-8 text-primary-foreground" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-2xl font-bold">XGBoost</h2>
              <Badge variant="default" className="bg-primary/20 text-primary border-0">Best Performer</Badge>
            </div>
            <p className="text-muted-foreground">
              Top performing model with R² = 0.8234 (Regression) and 85.67% Accuracy (Classification)
            </p>
          </div>
          <div className="hidden md:flex gap-8">
            <div className="text-center">
              <p className="text-3xl font-bold text-primary">82.34%</p>
              <p className="text-sm text-muted-foreground">R² Score</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-accent">85.67%</p>
              <p className="text-sm text-muted-foreground">Accuracy</p>
            </div>
          </div>
        </div>
      </div>

      {/* Model Calculator */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard 
          title="Model Calculator" 
          subtitle="Enter employee metrics to compare model predictions"
          delay={50}
        >
          <div className="space-y-5">
            {/* Satisfaction Score */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label className="text-sm">Satisfaction Score</Label>
                <span className="text-sm font-mono text-primary">{satisfaction[0].toFixed(1)}</span>
              </div>
              <Slider
                value={satisfaction}
                onValueChange={setSatisfaction}
                min={1}
                max={5}
                step={0.1}
              />
            </div>

            {/* Training Hours */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label className="text-sm">Training Hours</Label>
                <span className="text-sm font-mono text-primary">{trainingHours[0]}h</span>
              </div>
              <Slider
                value={trainingHours}
                onValueChange={setTrainingHours}
                min={0}
                max={100}
                step={1}
              />
            </div>

            {/* Years at Company */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label className="text-sm">Years at Company</Label>
                <span className="text-sm font-mono text-primary">{yearsAtCompany[0]}</span>
              </div>
              <Slider
                value={yearsAtCompany}
                onValueChange={setYearsAtCompany}
                min={0}
                max={20}
                step={1}
              />
            </div>

            {/* Work Hours */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label className="text-sm">Work Hours/Week</Label>
                <span className="text-sm font-mono text-primary">{workHours[0]}h</span>
              </div>
              <Slider
                value={workHours}
                onValueChange={setWorkHours}
                min={20}
                max={60}
                step={1}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Overtime */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label className="text-sm">Overtime</Label>
                  <span className="text-sm font-mono text-primary">{overtime[0]}h</span>
                </div>
                <Slider
                  value={overtime}
                  onValueChange={setOvertime}
                  min={0}
                  max={30}
                  step={1}
                />
              </div>

              {/* Sick Days */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label className="text-sm">Sick Days</Label>
                  <span className="text-sm font-mono text-primary">{sickDays[0]}</span>
                </div>
                <Slider
                  value={sickDays}
                  onValueChange={setSickDays}
                  min={0}
                  max={20}
                  step={1}
                />
              </div>
            </div>

            {/* Department */}
            <div className="space-y-2">
              <Label className="text-sm">Department</Label>
              <Select value={department} onValueChange={setDepartment}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Engineering">Engineering</SelectItem>
                  <SelectItem value="Sales">Sales</SelectItem>
                  <SelectItem value="HR">HR</SelectItem>
                  <SelectItem value="Marketing">Marketing</SelectItem>
                  <SelectItem value="Finance">Finance</SelectItem>
                  <SelectItem value="Operations">Operations</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button 
              onClick={handleCalculate} 
              className="w-full"
              variant="glow"
              disabled={isCalculating}
            >
              {isCalculating ? (
                <span className="flex items-center gap-2">
                  <span className="animate-spin">⟳</span>
                  Calculating...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Calculator className="w-4 h-4" />
                  Calculate All Models
                </span>
              )}
            </Button>
          </div>
        </ChartCard>

        {/* Model Predictions Comparison */}
        <ChartCard 
          title="Model Predictions Comparison" 
          subtitle="See how each model predicts performance"
          delay={100}
        >
          {predictions.length > 0 ? (
            <div className="space-y-6 animate-fade-in">
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={predictionChartData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 47%, 16%)" />
                  <XAxis type="number" stroke="hsl(215, 20%, 55%)" fontSize={12} domain={[0, 100]} />
                  <YAxis dataKey="name" type="category" stroke="hsl(215, 20%, 55%)" fontSize={11} width={100} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(222, 47%, 8%)', 
                      border: '1px solid hsl(222, 47%, 16%)',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar 
                    dataKey="score" 
                    fill="hsl(187, 85%, 53%)" 
                    radius={[0, 4, 4, 0]}
                    name="Predicted Score"
                  />
                </BarChart>
              </ResponsiveContainer>

              <div className="space-y-3">
                {predictions.map((pred, index) => (
                  <div 
                    key={pred.name}
                    className={cn(
                      "p-4 rounded-lg border transition-all",
                      index === 0 
                        ? "bg-primary/10 border-primary/30" 
                        : "bg-secondary/50 border-border/50"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {index === 0 && <Sparkles className="w-4 h-4 text-primary" />}
                        <span className="font-medium">{pred.name}</span>
                        {index === 0 && (
                          <Badge className="bg-primary/20 text-primary border-0 text-xs">
                            Best Match
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-2xl font-bold">{pred.predictedScore}</p>
                          <p className="text-xs text-muted-foreground">Score</p>
                        </div>
                        <Badge 
                          className={cn(
                            "border-0",
                            pred.category === 'High' ? "bg-success/20 text-success" :
                            pred.category === 'Medium' ? "bg-warning/20 text-warning" :
                            "bg-destructive/20 text-destructive"
                          )}
                        >
                          {pred.category}
                        </Badge>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">Confidence:</span>
                      <div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-accent rounded-full"
                          style={{ width: `${pred.confidence}%` }}
                        />
                      </div>
                      <span className="text-xs font-mono">{pred.confidence.toFixed(1)}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-[350px] text-center">
              <div className="w-20 h-20 rounded-full bg-secondary/50 flex items-center justify-center mb-4">
                <Calculator className="w-10 h-10 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground">
                Enter employee metrics and click<br />"Calculate All Models" to compare predictions
              </p>
            </div>
          )}
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Regression Models Comparison */}
        <ChartCard 
          title="Regression Models" 
          subtitle="R² Score comparison"
          delay={150}
        >
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={regressionModels} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 47%, 16%)" />
              <XAxis 
                type="number" 
                stroke="hsl(215, 20%, 55%)" 
                fontSize={12} 
                domain={[0, 1]}
                tickFormatter={(value) => `${(value * 100).toFixed(0)}%`}
              />
              <YAxis dataKey="name" type="category" stroke="hsl(215, 20%, 55%)" fontSize={12} width={120} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(222, 47%, 8%)', 
                  border: '1px solid hsl(222, 47%, 16%)',
                  borderRadius: '8px'
                }}
                formatter={(value: number) => [`${(value * 100).toFixed(2)}%`, 'R² Score']}
              />
              <Bar 
                dataKey="r2Score" 
                fill="hsl(187, 85%, 53%)" 
                radius={[0, 4, 4, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Classification Models Radar */}
        <ChartCard 
          title="Classification Metrics" 
          subtitle="Multi-metric comparison"
          delay={200}
        >
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="hsl(222, 47%, 16%)" />
              <PolarAngleAxis dataKey="model" stroke="hsl(215, 20%, 55%)" fontSize={11} />
              <PolarRadiusAxis stroke="hsl(215, 20%, 55%)" fontSize={10} domain={[0, 100]} />
              <Radar 
                name="Accuracy" 
                dataKey="Accuracy" 
                stroke="hsl(187, 85%, 53%)" 
                fill="hsl(187, 85%, 53%)" 
                fillOpacity={0.2} 
              />
              <Radar 
                name="F1 Score" 
                dataKey="F1 Score" 
                stroke="hsl(260, 65%, 60%)" 
                fill="hsl(260, 65%, 60%)" 
                fillOpacity={0.2} 
              />
              <Legend />
            </RadarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Model Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {classificationModels.map((model, index) => (
          <div 
            key={model.name}
            className={cn(
              "glass-card-hover p-5 animate-slide-up",
              index === 0 && "ring-1 ring-primary/50"
            )}
            style={{ animationDelay: `${300 + index * 100}ms` }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">{model.name}</h3>
              {index === 0 && (
                <Badge variant="default" className="bg-primary text-primary-foreground text-xs">
                  Best
                </Badge>
              )}
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground flex items-center gap-2">
                  <Target className="w-4 h-4" /> Accuracy
                </span>
                <span className="font-mono font-medium">{((model.accuracy || 0) * 100).toFixed(1)}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground flex items-center gap-2">
                  <Percent className="w-4 h-4" /> Precision
                </span>
                <span className="font-mono font-medium">{((model.precision || 0) * 100).toFixed(1)}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" /> F1 Score
                </span>
                <span className="font-mono font-medium">{((model.f1Score || 0) * 100).toFixed(1)}%</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
