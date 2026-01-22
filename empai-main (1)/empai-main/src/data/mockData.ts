// Mock data based on the Employee Performance Analytics notebook

export interface Employee {
  id: string;
  name: string;
  department: string;
  satisfactionScore: number;
  trainingHours: number;
  yearsAtCompany: number;
  workHoursPerWeek: number;
  overtimeHours: number;
  sickDays: number;
  performanceScore: number;
  performanceCategory: 'Low' | 'Medium' | 'High';
}

export interface ModelMetrics {
  name: string;
  type: 'regression' | 'classification';
  r2Score?: number;
  accuracy?: number;
  mse?: number;
  precision?: number;
  recall?: number;
  f1Score?: number;
}

export interface DepartmentStats {
  department: string;
  avgPerformance: number;
  employeeCount: number;
  avgSatisfaction: number;
  avgTrainingHours: number;
}

export interface FeatureImportance {
  feature: string;
  importance: number;
  category: string;
}

// Sample employees data
export const employees: Employee[] = [
  { id: '1', name: 'Alice Johnson', department: 'Engineering', satisfactionScore: 4.2, trainingHours: 45, yearsAtCompany: 5, workHoursPerWeek: 42, overtimeHours: 8, sickDays: 3, performanceScore: 87, performanceCategory: 'High' },
  { id: '2', name: 'Bob Smith', department: 'Sales', satisfactionScore: 3.8, trainingHours: 32, yearsAtCompany: 3, workHoursPerWeek: 45, overtimeHours: 12, sickDays: 5, performanceScore: 72, performanceCategory: 'Medium' },
  { id: '3', name: 'Carol Davis', department: 'HR', satisfactionScore: 4.5, trainingHours: 50, yearsAtCompany: 7, workHoursPerWeek: 40, overtimeHours: 5, sickDays: 2, performanceScore: 91, performanceCategory: 'High' },
  { id: '4', name: 'David Wilson', department: 'Marketing', satisfactionScore: 3.2, trainingHours: 25, yearsAtCompany: 2, workHoursPerWeek: 48, overtimeHours: 15, sickDays: 8, performanceScore: 58, performanceCategory: 'Low' },
  { id: '5', name: 'Emma Brown', department: 'Engineering', satisfactionScore: 4.0, trainingHours: 40, yearsAtCompany: 4, workHoursPerWeek: 44, overtimeHours: 10, sickDays: 4, performanceScore: 82, performanceCategory: 'High' },
  { id: '6', name: 'Frank Miller', department: 'Sales', satisfactionScore: 4.3, trainingHours: 38, yearsAtCompany: 6, workHoursPerWeek: 43, overtimeHours: 9, sickDays: 3, performanceScore: 85, performanceCategory: 'High' },
  { id: '7', name: 'Grace Lee', department: 'HR', satisfactionScore: 3.9, trainingHours: 42, yearsAtCompany: 4, workHoursPerWeek: 41, overtimeHours: 6, sickDays: 4, performanceScore: 78, performanceCategory: 'Medium' },
  { id: '8', name: 'Henry Taylor', department: 'Engineering', satisfactionScore: 3.5, trainingHours: 30, yearsAtCompany: 2, workHoursPerWeek: 46, overtimeHours: 14, sickDays: 6, performanceScore: 65, performanceCategory: 'Medium' },
];

// Model performance metrics from notebook
export const modelMetrics: ModelMetrics[] = [
  { name: 'XGBoost', type: 'regression', r2Score: 0.8234, mse: 45.2 },
  { name: 'Random Forest', type: 'regression', r2Score: 0.7856, mse: 52.8 },
  { name: 'Decision Tree', type: 'regression', r2Score: 0.7123, mse: 68.4 },
  { name: 'Linear Regression', type: 'regression', r2Score: 0.6542, mse: 82.1 },
  { name: 'XGBoost', type: 'classification', accuracy: 0.8567, precision: 0.84, recall: 0.87, f1Score: 0.855 },
  { name: 'Random Forest', type: 'classification', accuracy: 0.8234, precision: 0.81, recall: 0.84, f1Score: 0.825 },
  { name: 'Decision Tree', type: 'classification', accuracy: 0.7645, precision: 0.75, recall: 0.78, f1Score: 0.765 },
  { name: 'Logistic Regression', type: 'classification', accuracy: 0.7123, precision: 0.70, recall: 0.73, f1Score: 0.715 },
];

// Department statistics
export const departmentStats: DepartmentStats[] = [
  { department: 'HR', avgPerformance: 84.5, employeeCount: 45, avgSatisfaction: 4.2, avgTrainingHours: 46 },
  { department: 'Sales', avgPerformance: 82.3, employeeCount: 78, avgSatisfaction: 4.0, avgTrainingHours: 35 },
  { department: 'Engineering', avgPerformance: 78.1, employeeCount: 120, avgSatisfaction: 3.9, avgTrainingHours: 42 },
  { department: 'Marketing', avgPerformance: 75.6, employeeCount: 55, avgSatisfaction: 3.7, avgTrainingHours: 30 },
  { department: 'Finance', avgPerformance: 79.8, employeeCount: 38, avgSatisfaction: 3.8, avgTrainingHours: 38 },
  { department: 'Operations', avgPerformance: 76.2, employeeCount: 62, avgSatisfaction: 3.6, avgTrainingHours: 28 },
];

// Feature importance from XGBoost model
export const featureImportance: FeatureImportance[] = [
  { feature: 'Employee Satisfaction Score', importance: 0.285, category: 'Engagement' },
  { feature: 'Training Hours', importance: 0.198, category: 'Development' },
  { feature: 'Years at Company', importance: 0.156, category: 'Experience' },
  { feature: 'Work Hours per Week', importance: 0.124, category: 'Workload' },
  { feature: 'Overtime Hours', importance: 0.098, category: 'Workload' },
  { feature: 'Sick Days', importance: 0.072, category: 'Health' },
  { feature: 'Department', importance: 0.045, category: 'Demographics' },
  { feature: 'Age', importance: 0.022, category: 'Demographics' },
];

// Performance distribution data
export const performanceDistribution = [
  { range: '0-20', count: 5 },
  { range: '21-40', count: 18 },
  { range: '41-60', count: 45 },
  { range: '61-80', count: 112 },
  { range: '81-100', count: 78 },
];

// Monthly performance trends
export const performanceTrends = [
  { month: 'Jan', avgPerformance: 72.5, predictions: 71.8 },
  { month: 'Feb', avgPerformance: 74.2, predictions: 73.5 },
  { month: 'Mar', avgPerformance: 76.8, predictions: 75.9 },
  { month: 'Apr', avgPerformance: 75.1, predictions: 76.2 },
  { month: 'May', avgPerformance: 78.4, predictions: 77.8 },
  { month: 'Jun', avgPerformance: 79.2, predictions: 79.5 },
  { month: 'Jul', avgPerformance: 77.6, predictions: 78.1 },
  { month: 'Aug', avgPerformance: 80.1, predictions: 79.8 },
  { month: 'Sep', avgPerformance: 81.5, predictions: 80.9 },
  { month: 'Oct', avgPerformance: 82.3, predictions: 82.1 },
  { month: 'Nov', avgPerformance: 83.8, predictions: 83.2 },
  { month: 'Dec', avgPerformance: 84.5, predictions: 84.8 },
];

// Satisfaction vs Performance scatter data
export const satisfactionVsPerformance = Array.from({ length: 50 }, (_, i) => ({
  satisfaction: 2.5 + Math.random() * 2.5,
  performance: 40 + Math.random() * 55,
  department: ['Engineering', 'Sales', 'HR', 'Marketing', 'Finance'][Math.floor(Math.random() * 5)],
}));

// Regression prediction data
export const regressionData = Array.from({ length: 30 }, (_, i) => {
  const actual = 45 + i * 1.5 + (Math.random() - 0.5) * 15;
  return {
    index: i + 1,
    actual: Math.round(actual),
    predicted: Math.round(actual + (Math.random() - 0.5) * 8),
  };
});
