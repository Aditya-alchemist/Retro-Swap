import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface RetroWindowProps {
  title: string;
  icon?: ReactNode;
  gradient?: string;
  titleGradient?: string;
  children: ReactNode;
  className?: string;
}

export function RetroWindow({ 
  title, 
  icon, 
  gradient = "linear-gradient(135deg, #FF69B4 0%, #8A2BE2 100%)",
  titleGradient = "linear-gradient(90deg, #00FFFF 0%, #8A2BE2 100%)",
  children, 
  className 
}: RetroWindowProps) {
  return (
    <div 
      className={cn("retro-window rounded-lg p-1", className)}
      style={{ background: gradient }}
      data-testid="retro-window"
    >
      <div 
        className="title-bar rounded-t-lg px-4 py-2 flex justify-between items-center"
        style={{ background: titleGradient }}
        data-testid="title-bar"
      >
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-red-500 rounded-full border border-black"></div>
            <div className="w-3 h-3 bg-yellow-500 rounded-full border border-black"></div>
            <div className="w-3 h-3 bg-green-500 rounded-full border border-black"></div>
          </div>
          <span className="font-display text-white text-lg font-bold ml-4 flex items-center">
            {icon && <span className="mr-2">{icon}</span>}
            {title}
          </span>
        </div>
      </div>
      <div className="bg-white rounded-b-lg overflow-hidden">
        {children}
      </div>
    </div>
  );
}
