"use client";

import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

interface LevelUpAnimationProps {
  level: number;
  isOpen: boolean;
  onClose: () => void;
}

export function LevelUpAnimation({ level, isOpen, onClose }: LevelUpAnimationProps) {
  const [animationStep, setAnimationStep] = useState(0);

  useEffect(() => {
    if (!isOpen) {
      setAnimationStep(0);
      return;
    }

    // Sequence the animation steps
    const step1Timer = setTimeout(() => setAnimationStep(1), 500);
    const step2Timer = setTimeout(() => setAnimationStep(2), 1500);
    const step3Timer = setTimeout(() => setAnimationStep(3), 3000);
    const closeTimer = setTimeout(() => onClose(), 5000);

    return () => {
      clearTimeout(step1Timer);
      clearTimeout(step2Timer);
      clearTimeout(step3Timer);
      clearTimeout(closeTimer);
    };
  }, [isOpen, onClose]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-black/80 border-[#00d4ff] max-w-md mx-auto">
        <div className="flex flex-col items-center justify-center min-h-[300px] relative overflow-hidden">
          {/* Background effects */}
          <div className="absolute inset-0 bg-[#040a14] overflow-hidden">
            {/* Animated grid background */}
            <div className="absolute inset-0 grid-pattern opacity-30"></div>

            {/* Animated particles */}
            <div className="particle-container">
              {Array.from({ length: 20 }).map((_, i) => (
                <div
                  key={i}
                  className="absolute rounded-full bg-[#00d4ff]"
                  style={{
                    width: `${Math.random() * 10 + 2}px`,
                    height: `${Math.random() * 10 + 2}px`,
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    opacity: Math.random() * 0.5 + 0.2,
                    animationDuration: `${Math.random() * 3 + 2}s`,
                    animationDelay: `${Math.random() * 2}s`,
                    animation: 'float-up 3s ease-out infinite'
                  }}
                />
              ))}
            </div>
          </div>

          {/* First animation - "Level Up" text */}
          <div className={cn(
            "absolute inset-0 flex items-center justify-center transition-opacity duration-500",
            animationStep >= 1 ? "opacity-100" : "opacity-0"
          )}>
            <h2 className="text-4xl font-bold text-[#00d4ff] text-glow tracking-widest uppercase mb-4">
              Level Up!
            </h2>
          </div>

          {/* Second animation - Level number */}
          <div className={cn(
            "absolute inset-0 flex items-center justify-center transition-all duration-1000 transform",
            animationStep >= 2
              ? "opacity-100 scale-100"
              : "opacity-0 scale-50"
          )}>
            <div className="relative">
              <div className="text-[#00d4ff] text-8xl font-bold text-glow">
                {level}
              </div>
              <div className="absolute -bottom-6 left-0 right-0 text-center text-gray-400 text-sm">LEVEL</div>
            </div>
          </div>

          {/* Final message */}
          <div className={cn(
            "absolute bottom-8 left-0 right-0 text-center transition-opacity duration-500",
            animationStep >= 3 ? "opacity-100" : "opacity-0"
          )}>
            <p className="text-gray-300">You have become stronger!</p>
            <p className="text-[#00d4ff] mt-2">+3 Physical Points, +1 Mental Point</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
