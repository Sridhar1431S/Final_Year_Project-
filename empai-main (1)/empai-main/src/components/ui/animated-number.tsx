import { useCountUp } from '@/hooks/useCountUp';
import { cn } from '@/lib/utils';

interface AnimatedNumberProps {
  value: number;
  duration?: number;
  decimals?: number;
  suffix?: string;
  prefix?: string;
  delay?: number;
  className?: string;
}

export function AnimatedNumber({
  value,
  duration = 2000,
  decimals = 0,
  suffix = '',
  prefix = '',
  delay = 0,
  className = '',
}: AnimatedNumberProps) {
  const { formattedValue } = useCountUp({
    end: value,
    duration,
    decimals,
    suffix,
    prefix,
    delay,
  });

  return <span className={cn("font-mono tabular-nums", className)}>{formattedValue}</span>;
}
