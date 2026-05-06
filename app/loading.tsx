import { Skeleton } from '@/components/ui/Skeleton'

export default function RootLoading() {
  return (
    <div className="mx-auto flex min-h-[60vh] w-full max-w-7xl flex-col gap-8 px-4 py-24 sm:px-6 lg:px-8">
      <Skeleton className="h-10 w-48" />
      <Skeleton className="h-[40vh] w-full" />
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="aspect-[4/5] w-full" />
        ))}
      </div>
    </div>
  )
}
