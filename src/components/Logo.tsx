"use client";

import { Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ArchieLogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  /** Show only icon without wordmark */
  iconOnly?: boolean;
}

const sizeMap = {
  sm: { icon: 14, box: 'w-7 h-7 rounded-lg', text: 'text-base', gap: 'gap-2' },
  md: { icon: 16, box: 'w-8 h-8 rounded-xl', text: 'text-lg', gap: 'gap-3' },
  lg: { icon: 20, box: 'w-10 h-10 rounded-xl', text: 'text-2xl', gap: 'gap-3' },
};

export default function ArchieLogo({ size = 'md', className, iconOnly = false }: ArchieLogoProps) {
  const s = sizeMap[size];
  return (
    <div className={cn('flex items-center', s.gap, className)}>
      <div
        className={cn(
          s.box,
          'bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 shrink-0'
        )}
      >
        <Sparkles size={s.icon} className="text-white" />
      </div>
      {!iconOnly && (
        <span className={cn('font-bold tracking-tight text-fg', s.text)}>
          Archie
        </span>
      )}
    </div>
  );
}
