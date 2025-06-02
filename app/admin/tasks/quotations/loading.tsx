import { Skeleton } from "@/components/ui/skeleton"

export default function LoadingQuotationPage() {
  return (
    <div className="space-y-6 p-4 md:p-6 bg-slate-900 min-h-screen">
      <header className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <Skeleton className="h-9 w-48 mb-2 bg-slate-700" />
          <Skeleton className="h-5 w-72 bg-slate-700" />
        </div>
        <Skeleton className="h-10 w-44 bg-slate-700 rounded-md" />
      </header>

      {/* Filter Section Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-slate-800 rounded-lg shadow-md">
        <Skeleton className="h-10 w-full bg-slate-700 rounded-md" />
        <Skeleton className="h-10 w-full bg-slate-700 rounded-md" />
        <Skeleton className="h-10 w-full bg-slate-700 rounded-md" />
        <Skeleton className="h-10 w-full bg-slate-700 rounded-md" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, index) => (
          <div key={index} className="bg-slate-800 p-6 rounded-lg shadow-lg space-y-3">
            <div className="flex justify-between items-start">
              <Skeleton className="h-6 w-3/5 bg-slate-700" />
              <Skeleton className="h-5 w-1/4 bg-slate-700 rounded-full" />
            </div>
            <Skeleton className="h-5 w-4/5 bg-slate-700" />
            <Skeleton className="h-8 w-1/2 bg-slate-700" />
            <div className="flex justify-between items-center pt-2">
              <Skeleton className="h-5 w-1/3 bg-slate-700" />
              <Skeleton className="h-5 w-1/4 bg-slate-700" />
            </div>
            <div className="flex gap-2 pt-2">
              <Skeleton className="h-8 w-1/2 bg-slate-700 rounded-md" />
              <Skeleton className="h-8 w-1/2 bg-slate-700 rounded-md" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
