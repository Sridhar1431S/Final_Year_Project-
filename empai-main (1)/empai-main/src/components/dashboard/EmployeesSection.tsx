import { useState, useMemo, useEffect } from 'react';
import { employees as mockEmployees, Employee } from '@/data/mockData';
import { ChartCard } from './ChartCard';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Search, Filter, ChevronUp, ChevronDown, Download, ChevronLeft, ChevronRight } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useDataset } from '@/contexts/DatasetContext';
import { useFilters } from '@/contexts/FilterContext';

type SortField = 'name' | 'performanceScore' | 'satisfactionScore' | 'department';
type SortDirection = 'asc' | 'desc';

const ITEMS_PER_PAGE = 10;

export function EmployeesSection() {
  const [search, setSearch] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<SortField>('performanceScore');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const { toast } = useToast();
  const { employees: uploadedEmployees, hasUploadedData } = useDataset();
  const { selectedDepartments } = useFilters();

  // Use uploaded data if available, otherwise use mock data
  const allEmployees: Employee[] = hasUploadedData ? uploadedEmployees : mockEmployees;
  
  // Apply global department filter first
  const employees = useMemo(() => {
    if (selectedDepartments.length === 0) return allEmployees;
    return allEmployees.filter(e => selectedDepartments.includes(e.department));
  }, [allEmployees, selectedDepartments]);

  // Sync local department filter with global filter
  useEffect(() => {
    if (selectedDepartments.length > 0 && departmentFilter !== 'all') {
      // If global filter is active, reset local filter
      setDepartmentFilter('all');
    }
  }, [selectedDepartments]);

  const departments = ['all', ...new Set(employees.map(e => e.department))];

  const filteredEmployees = employees
    .filter(e => {
      const matchesSearch = e.name.toLowerCase().includes(search.toLowerCase());
      const matchesDept = departmentFilter === 'all' || e.department === departmentFilter;
      return matchesSearch && matchesDept;
    })
    .sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];
      const modifier = sortDirection === 'asc' ? 1 : -1;
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return aVal.localeCompare(bVal) * modifier;
      }
      return ((aVal as number) - (bVal as number)) * modifier;
    });

  const totalPages = Math.ceil(filteredEmployees.length / ITEMS_PER_PAGE);
  const paginatedEmployees = filteredEmployees.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
    setCurrentPage(1);
  };

  const handleFilterChange = (value: string) => {
    setDepartmentFilter(value);
    setCurrentPage(1);
  };

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setCurrentPage(1);
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? 
      <ChevronUp className="w-4 h-4" /> : 
      <ChevronDown className="w-4 h-4" />;
  };

  const exportToCSV = () => {
    const headers = ['Name', 'Department', 'Performance Score', 'Satisfaction Score', 'Training Hours', 'Years at Company', 'Performance Category'];
    const rows = filteredEmployees.map(e => [
      e.name,
      e.department,
      e.performanceScore,
      e.satisfactionScore,
      e.trainingHours,
      e.yearsAtCompany,
      e.performanceCategory
    ]);
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'employee_report.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast({
      title: "Export Successful",
      description: `Exported ${filteredEmployees.length} employee records as CSV`,
    });
  };

  const exportToJSON = () => {
    const jsonContent = JSON.stringify(filteredEmployees, null, 2);
    
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'employee_report.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast({
      title: "Export Successful",
      description: `Exported ${filteredEmployees.length} employee records as JSON`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search employees..."
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Select value={departmentFilter} onValueChange={handleFilterChange}>
            <SelectTrigger className="w-full sm:w-48">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Department" />
            </SelectTrigger>
            <SelectContent>
              {departments.map(dept => (
                <SelectItem key={dept} value={dept}>
                  {dept === 'all' ? 'All Departments' : dept}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon" onClick={exportToCSV} title="Export CSV">
            <Download className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Table */}
      <ChartCard 
        title="Employee Directory" 
        subtitle={`${filteredEmployees.length} employees found`}
        delay={0}
      >
        {/* Desktop Table */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th 
                  className="text-left py-3 px-3 font-medium text-muted-foreground cursor-pointer hover:text-foreground transition-colors text-sm"
                  onClick={() => handleSort('name')}
                >
                  <div className="flex items-center gap-2">
                    Name <SortIcon field="name" />
                  </div>
                </th>
                <th 
                  className="text-left py-3 px-3 font-medium text-muted-foreground cursor-pointer hover:text-foreground transition-colors text-sm"
                  onClick={() => handleSort('department')}
                >
                  <div className="flex items-center gap-2">
                    Department <SortIcon field="department" />
                  </div>
                </th>
                <th 
                  className="text-left py-3 px-3 font-medium text-muted-foreground cursor-pointer hover:text-foreground transition-colors text-sm"
                  onClick={() => handleSort('performanceScore')}
                >
                  <div className="flex items-center gap-2">
                    Performance <SortIcon field="performanceScore" />
                  </div>
                </th>
                <th 
                  className="text-left py-3 px-3 font-medium text-muted-foreground cursor-pointer hover:text-foreground transition-colors text-sm"
                  onClick={() => handleSort('satisfactionScore')}
                >
                  <div className="flex items-center gap-2">
                    Satisfaction <SortIcon field="satisfactionScore" />
                  </div>
                </th>
                <th className="text-left py-3 px-3 font-medium text-muted-foreground text-sm">
                  Training
                </th>
                <th className="text-left py-3 px-3 font-medium text-muted-foreground text-sm">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {paginatedEmployees.map((employee, index) => (
                <tr 
                  key={employee.id}
                  className="border-b border-border/50 hover:bg-secondary/30 transition-colors animate-fade-in"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground font-semibold text-sm flex-shrink-0">
                        {employee.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium truncate">{employee.name}</p>
                        <p className="text-xs text-muted-foreground">{employee.yearsAtCompany} years</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    <Badge variant="secondary" className="text-xs">{employee.department}</Badge>
                  </td>
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-2 bg-secondary rounded-full overflow-hidden">
                        <div 
                          className={cn(
                            "h-full rounded-full",
                            employee.performanceScore >= 80 ? "bg-success" :
                            employee.performanceScore >= 60 ? "bg-warning" : "bg-destructive"
                          )}
                          style={{ width: `${employee.performanceScore}%` }}
                        />
                      </div>
                      <span className="font-mono text-xs">{employee.performanceScore}</span>
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map(star => (
                        <div 
                          key={star}
                          className={cn(
                            "w-2 h-2 rounded-full",
                            star <= employee.satisfactionScore ? "bg-primary" : "bg-secondary"
                          )}
                        />
                      ))}
                      <span className="font-mono text-xs ml-1">{employee.satisfactionScore.toFixed(1)}</span>
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    <span className="font-mono text-xs">{employee.trainingHours}h</span>
                  </td>
                  <td className="py-3 px-3">
                    <Badge 
                      className={cn(
                        "border-0 text-xs",
                        employee.performanceCategory === 'High' ? "bg-success/20 text-success" :
                        employee.performanceCategory === 'Medium' ? "bg-warning/20 text-warning" :
                        "bg-destructive/20 text-destructive"
                      )}
                    >
                      {employee.performanceCategory}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile/Tablet Card View */}
        <div className="lg:hidden space-y-3">
          {paginatedEmployees.map((employee, index) => (
            <div 
              key={employee.id}
              className="p-4 rounded-lg bg-muted/20 border border-border/50 animate-fade-in"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground font-semibold flex-shrink-0">
                    {employee.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium truncate">{employee.name}</p>
                    <p className="text-xs text-muted-foreground">{employee.yearsAtCompany} years</p>
                  </div>
                </div>
                <Badge 
                  className={cn(
                    "border-0 flex-shrink-0",
                    employee.performanceCategory === 'High' ? "bg-success/20 text-success" :
                    employee.performanceCategory === 'Medium' ? "bg-warning/20 text-warning" :
                    "bg-destructive/20 text-destructive"
                  )}
                >
                  {employee.performanceCategory}
                </Badge>
              </div>
              
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Department</p>
                  <Badge variant="secondary" className="text-xs">{employee.department}</Badge>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Training</p>
                  <span className="font-mono">{employee.trainingHours}h</span>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Performance</p>
                  <div className="flex items-center gap-2">
                    <div className="w-12 h-2 bg-secondary rounded-full overflow-hidden">
                      <div 
                        className={cn(
                          "h-full rounded-full",
                          employee.performanceScore >= 80 ? "bg-success" :
                          employee.performanceScore >= 60 ? "bg-warning" : "bg-destructive"
                        )}
                        style={{ width: `${employee.performanceScore}%` }}
                      />
                    </div>
                    <span className="font-mono text-xs">{employee.performanceScore}</span>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Satisfaction</p>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map(star => (
                      <div 
                        key={star}
                        className={cn(
                          "w-2 h-2 rounded-full",
                          star <= employee.satisfactionScore ? "bg-primary" : "bg-secondary"
                        )}
                      />
                    ))}
                    <span className="font-mono text-xs ml-1">{employee.satisfactionScore.toFixed(1)}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 mt-4 border-t border-border">
            <p className="text-sm text-muted-foreground">
              Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1}-{Math.min(currentPage * ITEMS_PER_PAGE, filteredEmployees.length)} of {filteredEmployees.length} employees
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
              >
                First
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="px-3 py-1 text-sm font-medium">
                {currentPage} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
              >
                Last
              </Button>
            </div>
          </div>
        )}
      </ChartCard>
    </div>
  );
}