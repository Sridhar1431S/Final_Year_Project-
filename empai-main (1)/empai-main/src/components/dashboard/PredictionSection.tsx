import { useState, useEffect, useCallback, useMemo } from 'react';
import { Sparkles, AlertCircle, CheckCircle2, AlertTriangle, Loader2, Wifi, WifiOff, RotateCcw, Zap, Users, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ChartCard } from './ChartCard';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { predictPerformance, healthCheck } from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { useDataset } from '@/contexts/DatasetContext';
import { useFilters } from '@/contexts/FilterContext';

interface PredictionResult {
  score: number;
  category: 'Low' | 'Medium' | 'High';
  confidence: number;
  probabilities: {
    low: number;
    medium: number;
    high: number;
  };
  riskLevel: 'Low' | 'Medium' | 'High';
  recommendations: string[];
}

export function PredictionSection() {
  const { employees: allEmployees, hasUploadedData, datasetName } = useDataset();
  const { selectedDepartments } = useFilters();
  
  // Filter employees by selected departments
  const employees = useMemo(() => {
    if (selectedDepartments.length === 0) return allEmployees;
    return allEmployees.filter(e => selectedDepartments.includes(e.department));
  }, [allEmployees, selectedDepartments]);
  
  // Employee selection state (for uploaded data mode)
  const [selectedEmployeeIndex, setSelectedEmployeeIndex] = useState(0);
  const [isAutoMode, setIsAutoMode] = useState(true);
  
  // All dataset features
  const [age, setAge] = useState(30);
  const [gender, setGender] = useState('Male');
  const [department, setDepartment] = useState('Engineering');
  const [educationLevel, setEducationLevel] = useState("Bachelor's");
  const [yearsAtCompany, setYearsAtCompany] = useState([5]);
  const [monthlySalary, setMonthlySalary] = useState(5000);
  const [workHoursPerWeek, setWorkHoursPerWeek] = useState([40]);
  const [projectsHandled, setProjectsHandled] = useState([5]);
  const [overtimeHours, setOvertimeHours] = useState([5]);
  const [sickDays, setSickDays] = useState([3]);
  const [remoteWorkFrequency, setRemoteWorkFrequency] = useState('Hybrid');
  const [teamSize, setTeamSize] = useState([8]);
  const [trainingHours, setTrainingHours] = useState([20]);
  const [promotions, setPromotions] = useState([1]);
  const [satisfactionScore, setSatisfactionScore] = useState([3.5]);
  const [jobTitle, setJobTitle] = useState('Software Engineer');
  
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [apiStatus, setApiStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const { toast } = useToast();

  // Get current employee when in auto mode with uploaded data
  const currentEmployee = useMemo(() => {
    if (hasUploadedData && employees.length > 0 && isAutoMode) {
      return employees[selectedEmployeeIndex];
    }
    return null;
  }, [hasUploadedData, employees, selectedEmployeeIndex, isAutoMode]);

  // Auto-populate fields when employee changes
  useEffect(() => {
    if (currentEmployee) {
      // Use available Employee fields, defaults for others
      setAge(30); // Default - not in Employee interface
      setGender('Male'); // Default - not in Employee interface
      setDepartment(currentEmployee.department || 'Engineering');
      setEducationLevel("Bachelor's"); // Default - not in Employee interface
      setYearsAtCompany([currentEmployee.yearsAtCompany || 5]);
      setMonthlySalary(5000); // Default - not in Employee interface
      setWorkHoursPerWeek([currentEmployee.workHoursPerWeek || 40]);
      setProjectsHandled([5]); // Default - not in Employee interface
      setOvertimeHours([currentEmployee.overtimeHours || 5]);
      setSickDays([currentEmployee.sickDays || 3]);
      setRemoteWorkFrequency('Hybrid'); // Default - not in Employee interface
      setTeamSize([8]); // Default - not in Employee interface
      setTrainingHours([currentEmployee.trainingHours || 20]);
      setPromotions([1]); // Default - not in Employee interface
      setSatisfactionScore([currentEmployee.satisfactionScore || 3.5]);
      setJobTitle('Software Engineer'); // Default - not in Employee interface
      setPrediction(null);
    }
  }, [currentEmployee]);

  // Navigate to next employee
  const nextEmployee = useCallback(() => {
    if (employees.length > 0) {
      setSelectedEmployeeIndex((prev) => (prev + 1) % employees.length);
    }
  }, [employees.length]);

  // Navigate to previous employee
  const prevEmployee = useCallback(() => {
    if (employees.length > 0) {
      setSelectedEmployeeIndex((prev) => (prev - 1 + employees.length) % employees.length);
    }
  }, [employees.length]);

  // Health check on mount
  useEffect(() => {
    const checkHealth = async () => {
      const result = await healthCheck();
      setApiStatus(result.online ? 'online' : 'offline');
    };
    checkHealth();
    const interval = setInterval(checkHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  // Reset all fields to defaults
  const resetFields = useCallback(() => {
    setAge(30);
    setGender('Male');
    setDepartment('Engineering');
    setEducationLevel("Bachelor's");
    setYearsAtCompany([5]);
    setMonthlySalary(5000);
    setWorkHoursPerWeek([40]);
    setProjectsHandled([5]);
    setOvertimeHours([5]);
    setSickDays([3]);
    setRemoteWorkFrequency('Hybrid');
    setTeamSize([8]);
    setTrainingHours([20]);
    setPromotions([1]);
    setSatisfactionScore([3.5]);
    setJobTitle('Software Engineer');
    setPrediction(null);
    setError(null);
  }, []);

  // Simulate prediction locally when backend is offline
  const simulatePrediction = useCallback(() => {
    const weights = {
      satisfaction: 14,
      training: 0.55,
      years: 2.5,
      workHours: -0.3,
      overtime: -1.0,
      sickDays: -1.8,
      projects: 1.2,
      promotions: 3.5,
      teamSize: 0.2,
      salary: 0.001,
      education: { 'High School': -5, "Associate's": 0, "Bachelor's": 5, "Master's": 10, 'PhD': 15 },
      remote: { 'Never': -2, 'Rarely': 0, 'Hybrid': 3, 'Mostly': 2, 'Always': 1 }
    };

    let score = 25 +
      satisfactionScore[0] * weights.satisfaction +
      trainingHours[0] * weights.training +
      yearsAtCompany[0] * weights.years +
      (workHoursPerWeek[0] - 40) * weights.workHours +
      overtimeHours[0] * weights.overtime +
      sickDays[0] * weights.sickDays +
      projectsHandled[0] * weights.projects +
      promotions[0] * weights.promotions +
      teamSize[0] * weights.teamSize +
      monthlySalary * weights.salary +
      (weights.education[educationLevel as keyof typeof weights.education] || 0) +
      (weights.remote[remoteWorkFrequency as keyof typeof weights.remote] || 0);

    // Age factor - peak performance at 35-45
    const ageFactor = age < 25 ? -3 : age > 55 ? -5 : age >= 35 && age <= 45 ? 5 : 0;
    score += ageFactor;

    score = Math.min(100, Math.max(0, score));
    const category: 'Low' | 'Medium' | 'High' = score < 60 ? 'Low' : score < 80 ? 'Medium' : 'High';
    const confidence = 75 + Math.random() * 15;

    const recommendations: string[] = [];
    if (satisfactionScore[0] < 3) recommendations.push('Focus on improving employee satisfaction through engagement initiatives');
    if (trainingHours[0] < 20) recommendations.push('Increase training hours to boost skill development');
    if (overtimeHours[0] > 10) recommendations.push('Reduce overtime to prevent burnout and maintain productivity');
    if (sickDays[0] > 10) recommendations.push('Implement wellness programs to reduce sick days');
    if (promotions[0] === 0 && yearsAtCompany[0] > 3) recommendations.push('Consider career development opportunities');
    if (score >= 80) recommendations.push('Maintain current excellent performance levels');
    if (recommendations.length === 0) recommendations.push('Continue monitoring performance metrics regularly');

    return {
      score: Math.round(score),
      category,
      confidence,
      probabilities: {
        low: category === 'Low' ? 0.6 + Math.random() * 0.2 : 0.1 + Math.random() * 0.1,
        medium: category === 'Medium' ? 0.5 + Math.random() * 0.2 : 0.2 + Math.random() * 0.1,
        high: category === 'High' ? 0.65 + Math.random() * 0.2 : 0.15 + Math.random() * 0.1,
      },
      riskLevel: category === 'Low' ? 'High' : category === 'Medium' ? 'Medium' : 'Low' as 'Low' | 'Medium' | 'High',
      recommendations
    };
  }, [age, satisfactionScore, trainingHours, yearsAtCompany, workHoursPerWeek, overtimeHours, sickDays, projectsHandled, promotions, teamSize, monthlySalary, educationLevel, remoteWorkFrequency]);

  const handlePredict = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Use local simulation if backend is offline
      if (apiStatus === 'offline') {
        await new Promise(resolve => setTimeout(resolve, 800)); // Simulate delay
        const simulated = simulatePrediction();
        setPrediction(simulated as PredictionResult);
        toast({
          title: "Simulation Complete (Offline Mode)",
          description: `Estimated performance score: ${simulated.score}`,
        });
        setIsLoading(false);
        return;
      }

      const payload = {
        age: age,
        gender: gender,
        department: department,
        education: educationLevel,
        jobTitle: jobTitle,
        yearsAtCompany: yearsAtCompany[0],
        salary: monthlySalary,
        teamSize: teamSize[0],
        remote: remoteWorkFrequency,
        workHours: workHoursPerWeek[0],
        projects: projectsHandled[0],
        overtime: overtimeHours[0],
        sickDays: sickDays[0],
        training: trainingHours[0],
        promotions: promotions[0],
        satisfaction: satisfactionScore[0]
      };

      const response = await predictPerformance(payload);

      if (!response || response.success === false) {
        setError('Prediction unavailable. Please fill all fields correctly.');
        setPrediction(null);
        return;
      }

      setPrediction({
        score: Math.round(response.performance_score ?? 0),
        category: response.risk_level ?? 'Medium',
        confidence: response.confidence ?? 0,
        probabilities: {
          low: response.probabilities?.low ?? 0,
          medium: response.probabilities?.medium ?? 0,
          high: response.probabilities?.high ?? 0,
        },
        riskLevel: response.risk_level ?? 'Medium',
        recommendations: response.recommendations ?? [],
      });

      toast({
        title: "Prediction Complete",
        description: `Performance score: ${Math.round(response.performance_score ?? 0)}`,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get prediction';
      setError(errorMessage);
      toast({
        variant: "destructive",
        title: "Prediction Failed",
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/20 via-accent/10 to-transparent border border-primary/20 p-6 sm:p-8">
        <div className="absolute inset-0 bg-grid-pattern opacity-5" />
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-accent/20 rounded-full blur-3xl" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-6">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/25">
            <Sparkles className="w-8 h-8 sm:w-10 sm:h-10 text-primary-foreground" />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl sm:text-3xl font-bold mb-2">AI Performance Predictor</h2>
            <p className="text-muted-foreground text-sm sm:text-base max-w-2xl">
              {hasUploadedData && isAutoMode 
                ? `Analyzing employees from "${datasetName}". Navigate through employees to see predictions.`
                : 'Enter employee metrics below to predict performance using our ML models.'}
              {apiStatus === 'offline' ? ' Currently using local simulation mode.' : ' Connected to ML backend.'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {hasUploadedData && (
              <Badge 
                variant="outline" 
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border-primary/30 text-primary bg-primary/10 cursor-pointer"
                onClick={() => setIsAutoMode(!isAutoMode)}
              >
                <Users className="w-3 h-3" />
                {isAutoMode ? 'Auto Mode' : 'Manual Mode'}
              </Badge>
            )}
            <Badge 
              variant="outline" 
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium",
                apiStatus === 'online' 
                  ? "border-green-500/30 text-green-500 bg-green-500/10" 
                  : apiStatus === 'offline'
                    ? "border-amber-500/30 text-amber-500 bg-amber-500/10"
                    : "border-muted-foreground/30 text-muted-foreground"
              )}
            >
              {apiStatus === 'checking' && <Loader2 className="w-3 h-3 animate-spin" />}
              {apiStatus === 'online' && <Wifi className="w-3 h-3" />}
              {apiStatus === 'offline' && <Zap className="w-3 h-3" />}
              {apiStatus === 'checking' ? 'Checking...' : apiStatus === 'online' ? 'Live Mode' : 'Simulation Mode'}
            </Badge>
          </div>
        </div>
      </div>

      {/* Employee Navigator (shown when uploaded data and auto mode) */}
      {hasUploadedData && isAutoMode && employees.length > 0 && (
        <div className="bg-card border border-border rounded-xl p-4 flex items-center justify-between gap-4">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={prevEmployee}
            disabled={employees.length <= 1}
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Previous
          </Button>
          <div className="flex-1 text-center">
            <p className="text-sm text-muted-foreground">Employee</p>
            <p className="text-lg font-semibold">
              {currentEmployee?.name || `#${selectedEmployeeIndex + 1}`}
              <span className="text-sm font-normal text-muted-foreground ml-2">
                ({selectedEmployeeIndex + 1} of {employees.length})
              </span>
            </p>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={nextEmployee}
            disabled={employees.length <= 1}
          >
            Next
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Form */}
        <ChartCard 
          title="Employee Metrics" 
          subtitle="Configure all 16 prediction factors"
          delay={0}
        >
          <ScrollArea className="h-[600px] pr-4">
            <div className="space-y-5">
            {/* Row 1: Age, Gender */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Age</Label>
                <Input
                  type="number"
                  value={age}
                  onChange={(e) => setAge(Math.max(18, Math.min(65, parseInt(e.target.value) || 18)))}
                  min={18}
                  max={65}
                  className="font-mono"
                />
              </div>
              <div className="space-y-2">
                <Label>Gender</Label>
                <Select value={gender} onValueChange={setGender}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Row 2: Department, Education Level */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Department</Label>
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
              <div className="space-y-2">
                <Label>Education Level</Label>
                <Select value={educationLevel} onValueChange={setEducationLevel}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="High School">High School</SelectItem>
                    <SelectItem value="Associate's">Associate's</SelectItem>
                    <SelectItem value="Bachelor's">Bachelor's</SelectItem>
                    <SelectItem value="Master's">Master's</SelectItem>
                    <SelectItem value="PhD">PhD</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Row 3: Job Title, Monthly Salary */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Job Title</Label>
                <Select value={jobTitle} onValueChange={setJobTitle}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Software Engineer">Software Engineer</SelectItem>
                    <SelectItem value="Data Analyst">Data Analyst</SelectItem>
                    <SelectItem value="Manager">Manager</SelectItem>
                    <SelectItem value="Sales Rep">Sales Rep</SelectItem>
                    <SelectItem value="HR Specialist">HR Specialist</SelectItem>
                    <SelectItem value="Designer">Designer</SelectItem>
                    <SelectItem value="Accountant">Accountant</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Monthly Salary ($)</Label>
                <Input
                  type="number"
                  value={monthlySalary}
                  onChange={(e) => setMonthlySalary(Math.max(1000, Math.min(50000, parseInt(e.target.value) || 1000)))}
                  min={1000}
                  max={50000}
                  className="font-mono"
                />
              </div>
            </div>

            {/* Row 4: Remote Work, Team Size */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Remote Work Frequency</Label>
                <Select value={remoteWorkFrequency} onValueChange={setRemoteWorkFrequency}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Never">Never (On-site)</SelectItem>
                    <SelectItem value="Rarely">Rarely</SelectItem>
                    <SelectItem value="Hybrid">Hybrid</SelectItem>
                    <SelectItem value="Mostly">Mostly Remote</SelectItem>
                    <SelectItem value="Always">Fully Remote</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label>Team Size</Label>
                  <span className="text-sm font-mono text-primary">{teamSize[0]}</span>
                </div>
                <Slider
                  value={teamSize}
                  onValueChange={setTeamSize}
                  min={1}
                  max={50}
                  step={1}
                />
              </div>
            </div>

            {/* Years at Company */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label>Years at Company</Label>
                <span className="text-sm font-mono text-primary">{yearsAtCompany[0]}</span>
              </div>
              <Slider
                value={yearsAtCompany}
                onValueChange={setYearsAtCompany}
                min={0}
                max={30}
                step={1}
              />
            </div>

            {/* Work Hours Per Week */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label>Work Hours/Week</Label>
                <span className="text-sm font-mono text-primary">{workHoursPerWeek[0]}h</span>
              </div>
              <Slider
                value={workHoursPerWeek}
                onValueChange={setWorkHoursPerWeek}
                min={20}
                max={60}
                step={1}
              />
            </div>

            {/* Projects Handled */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label>Projects Handled</Label>
                <span className="text-sm font-mono text-primary">{projectsHandled[0]}</span>
              </div>
              <Slider
                value={projectsHandled}
                onValueChange={setProjectsHandled}
                min={0}
                max={20}
                step={1}
              />
            </div>

            {/* Overtime Hours */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label>Overtime Hours/Week</Label>
                <span className="text-sm font-mono text-primary">{overtimeHours[0]}h</span>
              </div>
              <Slider
                value={overtimeHours}
                onValueChange={setOvertimeHours}
                min={0}
                max={30}
                step={1}
              />
            </div>

            {/* Sick Days */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label>Sick Days (Annual)</Label>
                <span className="text-sm font-mono text-primary">{sickDays[0]}</span>
              </div>
              <Slider
                value={sickDays}
                onValueChange={setSickDays}
                min={0}
                max={30}
                step={1}
              />
            </div>

            {/* Training Hours */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label>Training Hours (Annual)</Label>
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

            {/* Promotions */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label>Promotions</Label>
                <span className="text-sm font-mono text-primary">{promotions[0]}</span>
              </div>
              <Slider
                value={promotions}
                onValueChange={setPromotions}
                min={0}
                max={5}
                step={1}
              />
            </div>

            {/* Employee Satisfaction Score */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label>Satisfaction Score</Label>
                <span className="text-sm font-mono text-primary">{satisfactionScore[0].toFixed(1)}</span>
              </div>
              <Slider
                value={satisfactionScore}
                onValueChange={setSatisfactionScore}
                min={1}
                max={5}
                step={0.1}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                onClick={resetFields}
                className="flex-shrink-0"
                disabled={isLoading}
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset
              </Button>
              <Button 
                onClick={handlePredict} 
                className="flex-1"
                variant="glow"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {apiStatus === 'offline' ? 'Simulating...' : 'Predicting...'}
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    {apiStatus === 'offline' ? 'Run Simulation' : 'Predict Performance'}
                  </span>
                )}
              </Button>
            </div>
          </div>
        </ScrollArea>
      </ChartCard>

      {/* Prediction Results */}
      <ChartCard 
        title="Prediction Results" 
        subtitle="ML model output"
        delay={100}
      >
        {error && !prediction ? (
          <div className="flex flex-col items-center justify-center h-[400px] text-center">
            <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
              <AlertTriangle className="w-10 h-10 text-destructive" />
            </div>
            <p className="text-destructive font-medium mb-2">Connection Error</p>
            <p className="text-muted-foreground text-sm max-w-xs">{error}</p>
          </div>
        ) : prediction ? (
          <div className="space-y-6 animate-fade-in">
            {/* Score Display */}
            <div className="text-center py-6">
              <div className="relative inline-flex">
                <div className={cn(
                  "w-32 h-32 sm:w-40 sm:h-40 rounded-full flex items-center justify-center",
                  "bg-gradient-to-br",
                  prediction.category === 'High' ? "from-success/20 to-success/5 glow-primary" :
                  prediction.category === 'Medium' ? "from-warning/20 to-warning/5" :
                  "from-destructive/20 to-destructive/5"
                )}>
                  <div className="text-center">
                    <p className="text-4xl sm:text-5xl font-bold">{prediction.score}</p>
                    <p className="text-xs sm:text-sm text-muted-foreground">Performance Score</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Risk Level Badge */}
            <div className="flex justify-center gap-3 flex-wrap">
              <div className={cn(
                "px-4 py-1.5 rounded-full font-medium text-sm",
                prediction.riskLevel === 'High' ? "bg-destructive/20 text-destructive" :
                prediction.riskLevel === 'Medium' ? "bg-warning/20 text-warning" :
                "bg-success/20 text-success"
              )}>
                Risk: {prediction.riskLevel}
              </div>
              <div className={cn(
                "px-4 py-1.5 rounded-full font-medium text-sm",
                prediction.category === 'High' ? "bg-success/20 text-success" :
                prediction.category === 'Medium' ? "bg-warning/20 text-warning" :
                "bg-destructive/20 text-destructive"
              )}>
                {prediction.category} Performer
              </div>
            </div>

            {/* Confidence & Probabilities */}
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 rounded-lg bg-secondary/30">
                <p className="text-xs text-muted-foreground">Confidence</p>
                <p className="text-xl font-mono font-semibold text-primary">
                  {Number(prediction.confidence || 0).toFixed(2)}%
                </p>
              </div>
              <div className="text-center p-3 rounded-lg bg-secondary/30">
                <p className="text-xs text-muted-foreground">Probabilities</p>
                <div className="flex justify-center gap-2 text-xs mt-1">
                  <span className="text-destructive">L:{((prediction.probabilities?.low ?? 0) * 100).toFixed(0)}%</span>
                  <span className="text-warning">M:{((prediction.probabilities?.medium ?? 0) * 100).toFixed(0)}%</span>
                  <span className="text-success">H:{((prediction.probabilities?.high ?? 0) * 100).toFixed(0)}%</span>
                </div>
              </div>
            </div>

            {/* Recommendations */}
            <div className="space-y-3">
              <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                Recommendations
              </h4>
              {prediction.recommendations.map((rec, index) => (
                <div 
                  key={index}
                  className="flex items-start gap-3 p-3 rounded-lg bg-secondary/50"
                >
                  {prediction.category === 'High' ? (
                    <CheckCircle2 className="w-5 h-5 text-success shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-warning shrink-0 mt-0.5" />
                  )}
                  <span className="text-sm">{rec}</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-[400px] text-center">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mb-6 animate-pulse">
              <Sparkles className="w-12 h-12 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-2">Ready to Predict</h3>
            <p className="text-muted-foreground max-w-md">
              Configure the employee metrics on the left and click 
              "{apiStatus === 'offline' ? 'Run Simulation' : 'Predict Performance'}" to see AI-powered predictions.
            </p>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-4">
              <Zap className="w-4 h-4 text-primary" />
              <span>{apiStatus === 'offline' ? 'Simulation Mode Active' : 'ML Backend Connected'}</span>
            </div>
          </div>
        )}
        </ChartCard>
      </div>
    </div>
  );
}
