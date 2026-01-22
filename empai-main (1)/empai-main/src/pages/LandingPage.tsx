import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  Brain, 
  TrendingUp, 
  Users, 
  BarChart3, 
  Sparkles, 
  ArrowRight,
  Activity,
  Target,
  Zap,
  LineChart,
  ChevronDown
} from 'lucide-react';
import { cn } from '@/lib/utils';

const floatingIcons = [
  { Icon: Brain, delay: 0, position: 'top-[15%] left-[8%]', size: 'w-14 h-14' },
  { Icon: TrendingUp, delay: 0.5, position: 'top-[20%] right-[12%]', size: 'w-12 h-12' },
  { Icon: Users, delay: 1, position: 'bottom-[25%] left-[6%]', size: 'w-16 h-16' },
  { Icon: BarChart3, delay: 1.5, position: 'bottom-[30%] right-[8%]', size: 'w-14 h-14' },
  { Icon: Activity, delay: 2, position: 'top-[35%] left-[18%]', size: 'w-10 h-10' },
  { Icon: Target, delay: 2.5, position: 'bottom-[40%] right-[18%]', size: 'w-12 h-12' },
  { Icon: Zap, delay: 0.8, position: 'top-[45%] right-[25%]', size: 'w-10 h-10' },
  { Icon: LineChart, delay: 1.8, position: 'bottom-[50%] left-[15%]', size: 'w-11 h-11' },
];

const stats = [
  { label: 'Accuracy', value: '94.7%', icon: Target },
  { label: 'Employees', value: '10K+', icon: Users },
  { label: 'Predictions', value: '1M+', icon: Brain },
];

export function LandingPage() {
  const navigate = useNavigate();
  const [mounted, setMounted] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    setMounted(true);
    
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20,
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="min-h-screen bg-background relative overflow-hidden particle-bg">
      {/* Animated Gradient Orbs */}
      <div 
        className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-gradient-to-br from-primary/20 to-transparent blur-3xl animate-float"
        style={{ transform: `translate(${mousePosition.x * 0.5}px, ${mousePosition.y * 0.5}px)` }}
      />
      <div 
        className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-gradient-to-tl from-accent/20 to-transparent blur-3xl animate-float"
        style={{ animationDelay: '2s', transform: `translate(${-mousePosition.x * 0.3}px, ${-mousePosition.y * 0.3}px)` }}
      />
      <div 
        className="absolute top-[40%] right-[30%] w-[300px] h-[300px] rounded-full bg-gradient-to-br from-success/10 to-transparent blur-3xl animate-float"
        style={{ animationDelay: '4s' }}
      />
      
      {/* Grid Pattern */}
      <div 
        className="absolute inset-0 opacity-[0.02] dark:opacity-[0.04]"
        style={{
          backgroundImage: `linear-gradient(hsl(var(--primary)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary)) 1px, transparent 1px)`,
          backgroundSize: '60px 60px'
        }}
      />

      {/* Floating Animated Icons */}
      {floatingIcons.map(({ Icon, delay, position, size }, index) => (
        <div
          key={index}
          className={cn(
            "absolute hidden md:flex items-center justify-center rounded-2xl",
            "bg-card/40 backdrop-blur-md border border-border/30 shadow-lg",
            "transition-all duration-1000 hover:scale-110 hover:border-primary/50",
            position,
            size,
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          )}
          style={{ 
            transitionDelay: `${delay}s`,
            animation: mounted ? `float 8s ease-in-out infinite ${delay}s` : 'none'
          }}
        >
          <Icon className="w-1/2 h-1/2 text-primary/70" />
        </div>
      ))}

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <div 
          className={cn(
            "flex items-center gap-4 mb-8 transition-all duration-700",
            mounted ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-10"
          )}
        >
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-primary to-accent rounded-2xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity" />
            <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-2xl">
              <Brain className="w-9 h-9 sm:w-11 sm:h-11 text-primary-foreground animate-pulse" />
            </div>
          </div>
          <span className="text-4xl sm:text-5xl lg:text-6xl font-bold gradient-text">EmpAI</span>
        </div>

        {/* Quote */}
        <blockquote 
          className={cn(
            "max-w-4xl text-center mb-8 transition-all duration-700 delay-200",
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          )}
        >
          <p className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-light text-foreground/90 leading-relaxed px-4">
            "Transform your workforce with{' '}
            <span className="text-primary font-semibold relative">
              AI-powered insights
              <span className="absolute -bottom-1 left-0 right-0 h-1 bg-gradient-to-r from-primary to-accent rounded-full animate-pulse" />
            </span>{' '}
            that predict, analyze, and elevate performance."
          </p>
        </blockquote>

        {/* Subtitle */}
        <p 
          className={cn(
            "max-w-2xl text-center text-muted-foreground text-lg sm:text-xl lg:text-2xl mb-10 px-4 transition-all duration-700 delay-300",
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          )}
        >
          Advanced machine learning models for employee performance prediction, 
          productivity analytics, and data-driven decision making.
        </p>

        {/* Stats Row */}
        <div 
          className={cn(
            "flex flex-wrap justify-center gap-6 sm:gap-10 mb-12 transition-all duration-700 delay-400",
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          )}
        >
          {stats.map(({ label, value, icon: StatIcon }, i) => (
            <div 
              key={label}
              className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-card/50 backdrop-blur-sm border border-border/30 hover-lift"
              style={{ animationDelay: `${0.5 + i * 0.1}s` }}
            >
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <StatIcon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{value}</p>
                <p className="text-sm text-muted-foreground">{label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA Button */}
        <div
          className={cn(
            "transition-all duration-700 delay-500",
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          )}
        >
          <Button
            size="lg"
            onClick={() => navigate('/dashboard')}
            className="group relative px-10 py-7 text-lg font-semibold rounded-2xl bg-gradient-to-r from-primary via-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground shadow-2xl shadow-primary/30 hover:shadow-primary/50 transition-all duration-500 hover:scale-105 shine"
          >
            <Sparkles className="w-6 h-6 mr-3 animate-pulse" />
            Launch Dashboard
            <ArrowRight className="w-6 h-6 ml-3 group-hover:translate-x-2 transition-transform duration-300" />
          </Button>
        </div>

        {/* Feature Pills */}
        <div 
          className={cn(
            "flex flex-wrap justify-center gap-3 sm:gap-4 mt-16 px-4 transition-all duration-700 delay-700",
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          )}
        >
          {['ML Predictions', 'Regression Analysis', 'What-If Scenarios', 'Team Analytics', 'Real-time Insights'].map((feature, i) => (
            <div 
              key={feature}
              className={cn(
                "px-5 py-2.5 rounded-full bg-card/60 backdrop-blur-md border border-border/40 text-sm font-medium text-muted-foreground",
                "hover:bg-card hover:border-primary/50 hover:text-foreground transition-all duration-300 cursor-default hover-lift"
              )}
              style={{ animationDelay: `${0.8 + i * 0.1}s` }}
            >
              {feature}
            </div>
          ))}
        </div>

        {/* Scroll Indicator */}
        <div 
          className={cn(
            "absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-muted-foreground/50 transition-all duration-700 delay-1000",
            mounted ? "opacity-100" : "opacity-0"
          )}
        >
          <span className="text-xs uppercase tracking-widest">Explore</span>
          <ChevronDown className="w-5 h-5 animate-bounce-subtle" />
        </div>
      </div>

      {/* Footer */}
      <footer className="absolute bottom-4 left-0 right-0 text-center text-xs sm:text-sm text-muted-foreground/40 px-4">
        Built with precision for modern HR analytics • Powered by Machine Learning
      </footer>
    </div>
  );
}
