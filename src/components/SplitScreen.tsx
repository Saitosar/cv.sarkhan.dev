'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import type { SplitScreenProps, MobileTab } from '@/types/split-screen';

const MOBILE_BREAKPOINT = 768;

export default function SplitScreen({
  left,
  right,
  defaultLeftRatio = 0.4,
  minLeftRatio = 0.25,
  maxLeftRatio = 0.6,
  orientation,
  onRatioChange,
  className,
}: SplitScreenProps) {
  const [leftRatio, setLeftRatio] = React.useState(defaultLeftRatio);
  const [isDragging, setIsDragging] = React.useState(false);
  const [isMobile, setIsMobile] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState<MobileTab>('chat');
  const containerRef = React.useRef<HTMLDivElement>(null);
  const currentOrientation = orientation ?? (isMobile ? 'vertical' : 'horizontal');

  React.useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  React.useEffect(() => {
    if (isDragging) {
      document.body.style.cursor = currentOrientation === 'horizontal' ? 'col-resize' : 'row-resize';
      document.body.style.userSelect = 'none';
    } else {
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    }
  }, [isDragging, currentOrientation]);

  const clamp = React.useCallback(
    (value: number) => Math.max(minLeftRatio, Math.min(maxLeftRatio, value)),
    [minLeftRatio, maxLeftRatio]
  );

  const handleMove = React.useCallback(
    (clientX: number, clientY: number) => {
      if (!containerRef.current || !isDragging) return;
      const rect = containerRef.current.getBoundingClientRect();
      const isHorizontal = currentOrientation === 'horizontal';
      const pos = isHorizontal ? clientX - rect.left : clientY - rect.top;
      const size = isHorizontal ? rect.width : rect.height;
      const ratio = clamp(pos / size);
      setLeftRatio(ratio);
      onRatioChange?.(ratio);
    },
    [isDragging, currentOrientation, clamp, onRatioChange]
  );

  const startDrag = React.useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      e.preventDefault();
      setIsDragging(true);
    },
    []
  );

  React.useEffect(() => {
    if (!isDragging) return;

    const onMouseMove = (e: MouseEvent) => handleMove(e.clientX, e.clientY);
    const onTouchMove = (e: TouchEvent) => {
      if (e.touches[0]) handleMove(e.touches[0].clientX, e.touches[0].clientY);
    };
    const stopDrag = () => setIsDragging(false);

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', stopDrag);
    document.addEventListener('touchmove', onTouchMove, { passive: false });
    document.addEventListener('touchend', stopDrag);

    return () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', stopDrag);
      document.removeEventListener('touchmove', onTouchMove);
      document.removeEventListener('touchend', stopDrag);
    };
  }, [isDragging, handleMove]);

  const handleKeyResize = React.useCallback(
    (direction: 'decrease' | 'increase') => {
      const step = 0.05;
      const ratio = clamp(leftRatio + (direction === 'increase' ? step : -step));
      setLeftRatio(ratio);
      onRatioChange?.(ratio);
    },
    [leftRatio, clamp, onRatioChange]
  );

  const splitterKeyDown = (e: React.KeyboardEvent) => {
    if (currentOrientation !== 'horizontal') return;
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      handleKeyResize('decrease');
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      handleKeyResize('increase');
    }
  };

  if (isMobile) {
    return (
      <div className={cn('flex flex-col h-full', className)}>
        <div className="flex-1 overflow-hidden animate-tab-fade pb-[calc(72px+env(safe-area-inset-bottom))]">
          {activeTab === 'chat' && left}
          {activeTab === 'resume' && right}
          {activeTab === 'jobs' && (
            <div className="flex h-full items-center justify-center p-6">
              <div className="text-center text-[#c4c7c7]">
                Job Search panel placeholder
              </div>
            </div>
          )}
          {activeTab === 'score' && (
            <div className="flex h-full items-center justify-center p-6">
              <div className="text-center text-[#c4c7c7]">
                ATS Score breakdown placeholder
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (currentOrientation === 'vertical') {
    return (
      <div ref={containerRef} className={cn('flex flex-col h-full w-full overflow-hidden relative', className)}>
        <div
          className={cn(
            'overflow-hidden transition-all duration-150 ease-out',
            isDragging && 'transition-none'
          )}
          style={{ height: `${leftRatio * 100}%` }}
        >
          {left}
        </div>
        <div
          role="separator"
          tabIndex={0}
          aria-label="Resize panels"
          aria-orientation="vertical"
          aria-valuenow={Math.round(leftRatio * 100)}
          aria-valuemin={Math.round(minLeftRatio * 100)}
          aria-valuemax={Math.round(maxLeftRatio * 100)}
          className={cn(
            'relative h-5 cursor-row-resize flex-shrink-0 group transition-colors duration-200 z-10',
            'hover:bg-purple-500/20',
            isDragging && 'bg-purple-500/20'
          )}
          onMouseDown={startDrag}
          onTouchStart={startDrag}
          onKeyDown={splitterKeyDown}
          >
          <div
            className={cn(
              'absolute left-0 top-1/2 w-full h-[4px] -translate-y-1/2 rounded-full',
              'bg-white/20 group-hover:bg-white/40 transition-colors duration-200',
              isDragging && 'bg-purple-500 shadow-[0_0_8px_rgba(96,1,209,0.6)]'
            )}
          />
          <span className="material-symbols-outlined absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-[#e5e2e1]/40 group-hover:text-[#e5e2e1]/70 text-lg pointer-events-none transition-colors duration-200">
            drag_indicator
          </span>
          </div>
        <div className="flex-1 overflow-hidden">{right}</div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className={cn('flex h-full w-full overflow-hidden relative', className)}>
      <div
        className={cn(
          'overflow-hidden transition-all duration-150 ease-out',
          isDragging && 'transition-none'
        )}
        style={{ width: `${leftRatio * 100}%` }}
      >
        {left}
      </div>
      <div
        role="separator"
        tabIndex={0}
        aria-label="Resize panels"
        aria-orientation="horizontal"
        aria-valuenow={Math.round(leftRatio * 100)}
        aria-valuemin={Math.round(minLeftRatio * 100)}
        aria-valuemax={Math.round(maxLeftRatio * 100)}
        className={cn(
          'relative w-5 cursor-col-resize flex-shrink-0 group transition-colors duration-200 z-10',
          'hover:bg-purple-500/20',
          isDragging && 'bg-purple-500/20'
        )}
        onMouseDown={startDrag}
        onTouchStart={startDrag}
        onKeyDown={splitterKeyDown}
      >
        <div
          className={cn(
            'absolute left-1/2 top-0 h-full w-[4px] -translate-x-1/2 rounded-full',
            'bg-white/20 group-hover:bg-white/40 transition-colors duration-200',
            isDragging && 'bg-purple-500 shadow-[0_0_8px_rgba(96,1,209,0.6)]'
          )}
        />
        <span className="material-symbols-outlined absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-[#e5e2e1]/40 group-hover:text-[#e5e2e1]/70 text-lg pointer-events-none transition-colors duration-200">
          drag_indicator
        </span>
      </div>
      <div className="flex-1 overflow-hidden">{right}</div>
    </div>
  );
}
