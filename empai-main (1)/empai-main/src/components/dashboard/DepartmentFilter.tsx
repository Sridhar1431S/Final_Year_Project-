import { useFilters } from '@/contexts/FilterContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Filter, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export function DepartmentFilter() {
  const { 
    selectedDepartments, 
    toggleDepartment, 
    clearDepartmentFilter,
    availableDepartments,
    hasActiveFilters 
  } = useFilters();

  return (
    <div className="flex items-center gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="outline" 
            size="sm" 
            className={cn(
              "gap-2 transition-all",
              hasActiveFilters && "border-primary/50 bg-primary/10"
            )}
          >
            <Filter className="w-4 h-4" />
            <span className="hidden sm:inline">Filter</span>
            {selectedDepartments.length > 0 && (
              <Badge 
                variant="secondary" 
                className="ml-1 h-5 px-1.5 text-xs bg-primary text-primary-foreground"
              >
                {selectedDepartments.length}
              </Badge>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent 
          align="end" 
          className="w-56 bg-popover border border-border shadow-lg z-50"
        >
          <DropdownMenuLabel className="flex items-center justify-between">
            <span>Filter by Department</span>
            {selectedDepartments.length > 0 && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
                onClick={(e) => {
                  e.preventDefault();
                  clearDepartmentFilter();
                }}
              >
                Clear
              </Button>
            )}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {availableDepartments.map((department) => (
            <DropdownMenuCheckboxItem
              key={department}
              checked={selectedDepartments.includes(department)}
              onCheckedChange={() => toggleDepartment(department)}
              className="cursor-pointer"
            >
              {department}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Active filter badges */}
      {selectedDepartments.length > 0 && (
        <div className="hidden md:flex items-center gap-1 flex-wrap">
          {selectedDepartments.slice(0, 3).map((dept) => (
            <Badge 
              key={dept} 
              variant="secondary" 
              className="gap-1 pr-1 bg-primary/10 text-primary border-primary/20"
            >
              {dept}
              <button
                onClick={() => toggleDepartment(dept)}
                className="ml-1 hover:bg-primary/20 rounded-full p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
          {selectedDepartments.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{selectedDepartments.length - 3} more
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}
