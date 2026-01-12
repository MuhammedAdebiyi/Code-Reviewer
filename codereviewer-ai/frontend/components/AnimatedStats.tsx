// frontend/components/AnimatedStats.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { Code2, Shield, Zap, Users } from 'lucide-react';

interface Stat {
  icon: React.ReactNode;
  value: number;
  suffix: string;
  label: string;
  color: string;
}

export default function AnimatedStats() {
  const [isVisible, setIsVisible] = useState(false);
  const statsRef = useRef<HTMLDivElement>(null);

  const stats: Stat[] = [
    {
      icon: <Code2 className="w-5 h-5" />,
      value: 50000,
      suffix: '+',
      label: 'Lines Analyzed',
      color: 'blue',
    },
    {
      icon: <Shield className="w-5 h-5" />,
      value: 1250,
      suffix: '+',
      label: 'Issues Found',
      color: 'green',
    },
    {
      icon: <Zap className="w-5 h-5" />,
      value: 98,
      suffix: '%',
      label: 'Accuracy',
      color: 'yellow',
    },
    {
      icon: <Users className="w-5 h-5" />,
      value: 1000,
      suffix: '+',
      label: 'Developers',
      color: 'purple',
    },
  ];

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (statsRef.current) {
      observer.observe(statsRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={statsRef} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <StatCard key={index} stat={stat} isVisible={isVisible} delay={index * 100} />
      ))}
    </div>
  );
}

function StatCard({ stat, isVisible, delay }: { stat: Stat; isVisible: boolean; delay: number }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isVisible) return;

    const duration = 2000;
    const steps = 60;
    const increment = stat.value / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= stat.value) {
        setCount(stat.value);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [isVisible, stat.value]);

  const getColorClasses = (color: string) => {
    const colors: Record<string, string> = {
      blue: 'text-blue-500',
      green: 'text-green-500',
      yellow: 'text-yellow-500',
      purple: 'text-purple-500',
    };
    return colors[color] || colors.blue;
  };

  return (
    <div
      className="p-6 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all duration-500"
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
        transitionDelay: `${delay}ms`,
      }}
    >
      <div className={`mb-3 ${getColorClasses(stat.color)}`}>{stat.icon}</div>
      <div className="text-3xl font-bold text-white mb-1">
        {count.toLocaleString()}
        {stat.suffix}
      </div>
      <div className="text-sm text-gray-400">{stat.label}</div>
    </div>
  );
}