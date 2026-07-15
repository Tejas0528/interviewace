export function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`animate-pulse bg-white/5 rounded-xl ${className}`} />
  )
}

export function CardSkeleton() {
  return (
    <div className="glass-card space-y-4">
      <Skeleton className="h-4 w-1/3" />
      <Skeleton className="h-8 w-1/2" />
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-4/5" />
    </div>
  )
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2">
          <CardSkeleton />
        </div>
        <CardSkeleton />
      </div>
    </div>
  )
}
