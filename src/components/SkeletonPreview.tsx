'use client';

interface SkeletonPreviewProps {
  status?: string;
}

export function SkeletonPreview({ status = 'Loading...' }: SkeletonPreviewProps) {
  return (
    <div className="w-full h-full min-h-[600px] flex flex-col items-center justify-center gap-6 p-8">
      {/* AI Status with gradient animation */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 via-purple-500/20 to-cyan-500/20 blur-xl animate-pulse" />
        <div className="relative flex items-center gap-3 glass-card px-6 py-3 rounded-full">
          <div className="w-2 h-2 bg-cyan-400 rounded-full animate-ping" />
          <span className="text-sm font-medium text-cyan-400">{status}</span>
        </div>
      </div>

      {/* Skeleton Resume Preview */}
      <div className="w-full max-w-2xl bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 space-y-6">
        {/* Header skeleton */}
        <div className="space-y-3 border-b border-white/10 pb-6">
          <div className="h-8 bg-gradient-to-r from-white/20 to-white/10 rounded-lg animate-shimmer w-3/4" />
          <div className="h-4 bg-gradient-to-r from-white/15 to-white/5 rounded animate-shimmer w-1/2" />
          <div className="h-3 bg-gradient-to-r from-white/10 to-white/5 rounded animate-shimmer w-2/3" />
        </div>

        {/* Summary skeleton */}
        <div className="space-y-2">
          <div className="h-4 bg-gradient-to-r from-white/15 to-white/5 rounded animate-shimmer" />
          <div className="h-4 bg-gradient-to-r from-white/15 to-white/5 rounded animate-shimmer w-5/6" />
          <div className="h-4 bg-gradient-to-r from-white/15 to-white/5 rounded animate-shimmer w-4/6" />
        </div>

        {/* Experience skeleton */}
        <div className="space-y-4 pt-4">
          <div className="h-5 bg-gradient-to-r from-white/20 to-white/10 rounded animate-shimmer w-1/3" />
          <div className="space-y-3">
            <div className="h-4 bg-gradient-to-r from-white/15 to-white/5 rounded animate-shimmer w-3/4" />
            <div className="h-3 bg-gradient-to-r from-white/10 to-white/5 rounded animate-shimmer w-1/2" />
            <div className="space-y-2">
              <div className="h-3 bg-gradient-to-r from-white/10 to-white/5 rounded animate-shimmer" />
              <div className="h-3 bg-gradient-to-r from-white/10 to-white/5 rounded animate-shimmer w-5/6" />
            </div>
          </div>
        </div>

        {/* Skills skeleton */}
        <div className="space-y-3 pt-4">
          <div className="h-5 bg-gradient-to-r from-white/20 to-white/10 rounded animate-shimmer w-1/4" />
          <div className="flex flex-wrap gap-2">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="h-6 w-20 bg-gradient-to-r from-white/15 to-white/5 rounded-full animate-shimmer"
                style={{ animationDelay: `${i * 0.1}s` }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Progress dots */}
      <div className="flex gap-2">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="w-2 h-2 bg-cyan-400/50 rounded-full animate-bounce"
            style={{ animationDelay: `${i * 0.2}s` }}
          />
        ))}
      </div>
    </div>
  );
}
