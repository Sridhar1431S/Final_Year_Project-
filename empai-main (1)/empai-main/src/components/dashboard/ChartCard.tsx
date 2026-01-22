import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface ChartCardProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
  action?: ReactNode;
  delay?: number;
}

export function ChartCard({ title, subtitle, children, className, action, delay = 0 }: ChartCardProps) {
  return (
    <div 
      className={cn(
        "glass-card-hover p-4 sm:p-6 animate-slide-up relative overflow-hidden group",
        className
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Decorative corner gradient */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-primary/5 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 sm:gap-4 mb-4 sm:mb-6 relative z-10">
        <div className="min-w-0">
          <h3 className="text-base sm:text-lg font-semibold truncate group-hover:text-primary transition-colors duration-300">{title}</h3>
          {subtitle && (
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 sm:mt-1 line-clamp-2">{subtitle}</p>
          )}
        </div>
        {action && <div className="flex-shrink-0">{action}</div>}
      </div>
      <div className="min-h-0 overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0 relative z-10">
        {children}
      </div>
    </div>
  );
}
