import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCountUp } from '@/hooks/useCountUp';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?: 'default' | 'primary' | 'accent' | 'success' | 'warning';
  delay?: number;
}

const variantStyles = {
  default: 'from-secondary to-muted',
  primary: 'from-primary/20 to-primary/5',
  accent: 'from-accent/20 to-accent/5',
  success: 'from-success/20 to-success/5',
  warning: 'from-warning/20 to-warning/5',
};

const iconStyles = {
  default: 'bg-secondary text-foreground',
  primary: 'bg-primary/20 text-primary',
  accent: 'bg-accent/20 text-accent',
  success: 'bg-success/20 text-success',
  warning: 'bg-warning/20 text-warning',
};

// Parse value to extract number and suffix
function parseValue(value: string | number): { numericValue: number; prefix: string; suffix: string; decimals: number } {
  if (typeof value === 'number') {
    return { numericValue: value, prefix: '', suffix: '', decimals: Number.isInteger(value) ? 0 : 2 };
  }
  
  const match = value.match(/^([^\d]*)([\d.]+)(.*)$/);
  if (match) {
    const numericValue = parseFloat(match[2]);
    const decimals = match[2].includes('.') ? match[2].split('.')[1].length : 0;
    return {
      prefix: match[1],
      numericValue,
      suffix: match[3],
      decimals,
    };
  }
  
  return { numericValue: 0, prefix: '', suffix: value, decimals: 0 };
}

export function StatCard({ title, value, subtitle, icon: Icon, trend, variant = 'default', delay = 0 }: StatCardProps) {
  const { numericValue, prefix, suffix, decimals } = parseValue(value);
  
  const { formattedValue } = useCountUp({
    end: numericValue,
    duration: 2000,
    decimals,
    prefix,
    suffix,
    delay: delay + 200, // Start after card animation
  });

  return (
    <div 
      className="stat-card animate-slide-up group shine"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className={cn(
        "absolute inset-0 bg-gradient-to-br opacity-50 rounded-xl transition-opacity duration-500 group-hover:opacity-80",
        variantStyles[variant]
      )} />
      
      {/* Animated corner accent */}
      <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-primary/10 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-3 sm:mb-4">
          <div className={cn(
            "p-2.5 sm:p-3 rounded-xl transition-all duration-500 group-hover:scale-110 group-hover:rotate-3",
            iconStyles[variant]
          )}>
            <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          {trend && (
            <div className={cn(
              "flex items-center gap-1 text-xs sm:text-sm font-medium px-2 sm:px-3 py-1 rounded-full transition-transform duration-300 group-hover:scale-105",
              trend.isPositive 
                ? "bg-success/20 text-success" 
                : "bg-destructive/20 text-destructive"
            )}>
              <span className="animate-bounce-subtle">{trend.isPositive ? '↑' : '↓'}</span>
              <span>{Math.abs(trend.value)}%</span>
            </div>
          )}
        </div>
        
        <div className="space-y-1">
          <p className="text-xs sm:text-sm text-muted-foreground font-medium uppercase tracking-wide">{title}</p>
          <p className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight font-mono bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">{formattedValue}</p>
          {subtitle && (
            <p className="text-[10px] sm:text-xs text-muted-foreground/80 line-clamp-1 pt-1">{subtitle}</p>
          )}
        </div>
      </div>
    </div>
  );
}
