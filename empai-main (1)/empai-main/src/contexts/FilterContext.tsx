import { createContext, useContext, useState, ReactNode, useMemo, useCallback } from 'react';
import { useDataset } from './DatasetContext';

interface FilterContextType {
  // Department filter
  selectedDepartments: string[];
  setSelectedDepartments: (departments: string[]) => void;
  toggleDepartment: (department: string) => void;
  clearDepartmentFilter: () => void;
  
  // Available departments from data
  availableDepartments: string[];
  
  // Performance category filter
  selectedPerformanceCategories: ('Low' | 'Medium' | 'High')[];
  setSelectedPerformanceCategories: (categories: ('Low' | 'Medium' | 'High')[]) => void;
  togglePerformanceCategory: (category: 'Low' | 'Medium' | 'High') => void;
  
  // Helper to check if filters are active
  hasActiveFilters: boolean;
  clearAllFilters: () => void;
}

const FilterContext = createContext<FilterContextType | undefined>(undefined);

export function FilterProvider({ children }: { children: ReactNode }) {
  const { employees, hasUploadedData } = useDataset();
  
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([]);
  const [selectedPerformanceCategories, setSelectedPerformanceCategories] = useState<('Low' | 'Medium' | 'High')[]>([]);

  // Get available departments from uploaded data or defaults
  const availableDepartments = useMemo(() => {
    if (hasUploadedData && employees.length > 0) {
      return [...new Set(employees.map(e => e.department))].sort();
    }
    return ['Engineering', 'Sales', 'HR', 'Marketing', 'Finance', 'Operations'];
  }, [employees, hasUploadedData]);

  const toggleDepartment = useCallback((department: string) => {
    setSelectedDepartments(prev => 
      prev.includes(department)
        ? prev.filter(d => d !== department)
        : [...prev, department]
    );
  }, []);

  const clearDepartmentFilter = useCallback(() => {
    setSelectedDepartments([]);
  }, []);

  const togglePerformanceCategory = useCallback((category: 'Low' | 'Medium' | 'High') => {
    setSelectedPerformanceCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  }, []);

  const hasActiveFilters = selectedDepartments.length > 0 || selectedPerformanceCategories.length > 0;

  const clearAllFilters = useCallback(() => {
    setSelectedDepartments([]);
    setSelectedPerformanceCategories([]);
  }, []);

  return (
    <FilterContext.Provider value={{
      selectedDepartments,
      setSelectedDepartments,
      toggleDepartment,
      clearDepartmentFilter,
      availableDepartments,
      selectedPerformanceCategories,
      setSelectedPerformanceCategories,
      togglePerformanceCategory,
      hasActiveFilters,
      clearAllFilters,
    }}>
      {children}
    </FilterContext.Provider>
  );
}

export function useFilters() {
  const context = useContext(FilterContext);
  if (context === undefined) {
    throw new Error('useFilters must be used within a FilterProvider');
  }
  return context;
}
