import { TooltipProps } from 'recharts';
import { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent';

interface ChartTooltipContentProps extends TooltipProps<ValueType, NameType> {
  formatter?: (value: number, name: string) => [string, string];
}

export function ChartTooltipContent({ 
  active, 
  payload, 
  label,
  formatter 
}: ChartTooltipContentProps) {
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  return (
    <div className="bg-card border border-border rounded-lg p-3 shadow-xl">
      {label && (
        <p className="text-sm font-medium text-foreground mb-2">{label}</p>
      )}
      <div className="space-y-1">
        {payload.map((entry, index) => {
          const [formattedValue, formattedName] = formatter 
            ? formatter(entry.value as number, entry.name as string)
            : [String(entry.value), entry.name];
          
          return (
            <div key={index} className="flex items-center gap-2 text-sm">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-muted-foreground">{formattedName}:</span>
              <span className="font-medium text-foreground">{formattedValue}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Theme-aware tooltip style object for Recharts
export const tooltipStyle = {
  backgroundColor: 'hsl(var(--card))',
  border: '1px solid hsl(var(--border))',
  borderRadius: '8px',
  color: 'hsl(var(--foreground))',
};
