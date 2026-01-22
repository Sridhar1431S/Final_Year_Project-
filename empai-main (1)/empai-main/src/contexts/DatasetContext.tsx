import { createContext, useContext, useState, ReactNode, useMemo } from 'react';
import { Employee, DepartmentStats, FeatureImportance } from '@/data/mockData';

// Raw data structure from uploaded files
export interface RawEmployeeData {
  [key: string]: any;
}

interface DatasetAnalysis {
  summary: {
    total_employees: number;
    avg_performance: number;
    avg_satisfaction: number;
    departments: string[];
    risk_distribution: {
      low: number;
      medium: number;
      high: number;
    };
  };
  department_stats: Array<{
    department: string;
    count: number;
    avg_performance: number;
    avg_satisfaction: number;
    avg_salary: number;
  }>;
  performance_distribution: Array<{
    range: string;
    count: number;
  }>;
  feature_correlations: Array<{
    feature: string;
    correlation: number;
  }>;
  predictions: Array<{
    employee_id: number;
    predicted_performance: number;
    risk_level: string;
    confidence: number;
  }>;
  trends: {
    monthly_performance: Array<{ month: string; performance: number }>;
    department_comparison: Array<{ department: string; performance: number }>;
  };
}

interface DatasetContextType {
  // Raw data from upload
  rawData: RawEmployeeData[];
  setRawData: (data: RawEmployeeData[]) => void;
  
  // Computed/analyzed data
  analysis: DatasetAnalysis | null;
  setAnalysis: (analysis: DatasetAnalysis | null) => void;
  
  // Metadata
  datasetName: string | null;
  setDatasetName: (name: string | null) => void;
  isAnalyzing: boolean;
  setIsAnalyzing: (analyzing: boolean) => void;
  
  // Computed getters for all sections
  employees: Employee[];
  departmentStats: DepartmentStats[];
  featureImportance: FeatureImportance[];
  performanceDistribution: Array<{ range: string; count: number }>;
  hasUploadedData: boolean;
  
  // Reset function
  resetDataset: () => void;
}

const DatasetContext = createContext<DatasetContextType | undefined>(undefined);

// Helper to normalize field names (handle different CSV column naming conventions)
function normalizeFieldName(key: string): string {
  return key.toLowerCase().replace(/[\s_-]+/g, '');
}

// Map raw data to Employee interface
function mapRawToEmployee(raw: RawEmployeeData, index: number): Employee {
  const normalized: Record<string, any> = {};
  Object.entries(raw).forEach(([key, value]) => {
    normalized[normalizeFieldName(key)] = value;
  });
  
  const performanceScore = 
    normalized['performancescore'] ?? 
    normalized['performance'] ?? 
    normalized['score'] ?? 
    normalized['performancerating'] ??
    Math.round(50 + Math.random() * 40);
  
  const satisfactionScore = 
    normalized['satisfactionscore'] ?? 
    normalized['satisfaction'] ?? 
    normalized['employeesatisfaction'] ??
    (3 + Math.random() * 2);
  
  const department = 
    normalized['department'] ?? 
    normalized['dept'] ?? 
    'General';
  
  const name = 
    normalized['name'] ?? 
    normalized['employeename'] ?? 
    normalized['fullname'] ??
    `Employee ${index + 1}`;
  
  const trainingHours = 
    normalized['traininghours'] ?? 
    normalized['training'] ?? 
    normalized['traininghoursperyear'] ??
    Math.round(20 + Math.random() * 40);
  
  const yearsAtCompany = 
    normalized['yearsatcompany'] ?? 
    normalized['tenure'] ?? 
    normalized['years'] ??
    Math.round(1 + Math.random() * 10);
  
  const workHoursPerWeek = 
    normalized['workhoursperweek'] ?? 
    normalized['workhours'] ?? 
    normalized['hoursperweek'] ??
    40;
  
  const overtimeHours = 
    normalized['overtimehours'] ?? 
    normalized['overtime'] ?? 
    0;
  
  const sickDays = 
    normalized['sickdays'] ?? 
    normalized['absences'] ?? 
    0;
  
  let performanceCategory: 'Low' | 'Medium' | 'High' = 'Medium';
  if (performanceScore >= 80) performanceCategory = 'High';
  else if (performanceScore < 60) performanceCategory = 'Low';
  
  return {
    id: normalized['id']?.toString() ?? normalized['employeeid']?.toString() ?? `emp-${index + 1}`,
    name,
    department,
    satisfactionScore: typeof satisfactionScore === 'number' ? satisfactionScore : parseFloat(satisfactionScore) || 3.5,
    trainingHours: typeof trainingHours === 'number' ? trainingHours : parseInt(trainingHours) || 30,
    yearsAtCompany: typeof yearsAtCompany === 'number' ? yearsAtCompany : parseInt(yearsAtCompany) || 3,
    workHoursPerWeek: typeof workHoursPerWeek === 'number' ? workHoursPerWeek : parseInt(workHoursPerWeek) || 40,
    overtimeHours: typeof overtimeHours === 'number' ? overtimeHours : parseInt(overtimeHours) || 0,
    sickDays: typeof sickDays === 'number' ? sickDays : parseInt(sickDays) || 0,
    performanceScore: typeof performanceScore === 'number' ? performanceScore : parseInt(performanceScore) || 70,
    performanceCategory,
  };
}

// Compute department stats from employees
function computeDepartmentStats(employees: Employee[]): DepartmentStats[] {
  const deptMap = new Map<string, { total: number; perf: number; sat: number; training: number }>();
  
  employees.forEach(emp => {
    const current = deptMap.get(emp.department) || { total: 0, perf: 0, sat: 0, training: 0 };
    deptMap.set(emp.department, {
      total: current.total + 1,
      perf: current.perf + emp.performanceScore,
      sat: current.sat + emp.satisfactionScore,
      training: current.training + emp.trainingHours,
    });
  });
  
  return Array.from(deptMap.entries()).map(([department, stats]) => ({
    department,
    avgPerformance: Math.round((stats.perf / stats.total) * 10) / 10,
    employeeCount: stats.total,
    avgSatisfaction: Math.round((stats.sat / stats.total) * 10) / 10,
    avgTrainingHours: Math.round(stats.training / stats.total),
  }));
}

// Compute performance distribution
function computePerformanceDistribution(employees: Employee[]): Array<{ range: string; count: number }> {
  const ranges = [
    { range: '0-20', min: 0, max: 20 },
    { range: '21-40', min: 21, max: 40 },
    { range: '41-60', min: 41, max: 60 },
    { range: '61-80', min: 61, max: 80 },
    { range: '81-100', min: 81, max: 100 },
  ];
  
  return ranges.map(r => ({
    range: r.range,
    count: employees.filter(e => e.performanceScore >= r.min && e.performanceScore <= r.max).length,
  }));
}

// Compute feature importance (simplified correlation-based)
function computeFeatureImportance(employees: Employee[]): FeatureImportance[] {
  if (employees.length < 2) return [];
  
  const avgPerf = employees.reduce((sum, e) => sum + e.performanceScore, 0) / employees.length;
  
  // Simplified importance based on variance contribution
  const features = [
    { feature: 'Employee Satisfaction Score', getValue: (e: Employee) => e.satisfactionScore * 20, category: 'Engagement' },
    { feature: 'Training Hours', getValue: (e: Employee) => e.trainingHours, category: 'Development' },
    { feature: 'Years at Company', getValue: (e: Employee) => e.yearsAtCompany * 5, category: 'Experience' },
    { feature: 'Work Hours per Week', getValue: (e: Employee) => e.workHoursPerWeek, category: 'Workload' },
    { feature: 'Overtime Hours', getValue: (e: Employee) => e.overtimeHours * 2, category: 'Workload' },
    { feature: 'Sick Days', getValue: (e: Employee) => e.sickDays * -3, category: 'Health' },
  ];
  
  const importanceScores = features.map(f => {
    const values = employees.map(e => f.getValue(e));
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((sum, v) => sum + Math.pow(v - avg, 2), 0) / values.length;
    return { ...f, importance: Math.sqrt(variance) / 10 };
  });
  
  // Normalize to sum to ~1
  const total = importanceScores.reduce((sum, f) => sum + f.importance, 0);
  
  return importanceScores
    .map(f => ({ 
      feature: f.feature, 
      importance: total > 0 ? f.importance / total : 0.15, 
      category: f.category 
    }))
    .sort((a, b) => b.importance - a.importance);
}

export function DatasetProvider({ children }: { children: ReactNode }) {
  const [rawData, setRawData] = useState<RawEmployeeData[]>([]);
  const [analysis, setAnalysis] = useState<DatasetAnalysis | null>(null);
  const [datasetName, setDatasetName] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Compute derived data from rawData
  const computedData = useMemo(() => {
    if (rawData.length === 0) {
      return {
        employees: [],
        departmentStats: [],
        featureImportance: [],
        performanceDistribution: [],
        hasUploadedData: false,
      };
    }
    
    const employees = rawData.map((raw, idx) => mapRawToEmployee(raw, idx));
    const departmentStats = computeDepartmentStats(employees);
    const featureImportance = computeFeatureImportance(employees);
    const performanceDistribution = computePerformanceDistribution(employees);
    
    return {
      employees,
      departmentStats,
      featureImportance,
      performanceDistribution,
      hasUploadedData: true,
    };
  }, [rawData]);

  const resetDataset = () => {
    setRawData([]);
    setAnalysis(null);
    setDatasetName(null);
    setIsAnalyzing(false);
  };

  return (
    <DatasetContext.Provider value={{ 
      rawData,
      setRawData,
      analysis, 
      setAnalysis, 
      datasetName, 
      setDatasetName,
      isAnalyzing,
      setIsAnalyzing,
      employees: computedData.employees,
      departmentStats: computedData.departmentStats,
      featureImportance: computedData.featureImportance,
      performanceDistribution: computedData.performanceDistribution,
      hasUploadedData: computedData.hasUploadedData,
      resetDataset,
    }}>
      {children}
    </DatasetContext.Provider>
  );
}

export function useDataset() {
  const context = useContext(DatasetContext);
  if (context === undefined) {
    throw new Error('useDataset must be used within a DatasetProvider');
  }
  return context;
}
