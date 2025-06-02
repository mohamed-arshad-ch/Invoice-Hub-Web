import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="space-y-6 animate-fade-in">
      <header className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <Skeleton className="h-9 w-64 mb-2 bg-slate-700" /> {/* Title */}
          <Skeleton className="h-5 w-80 bg-slate-700" /> {/* Subtitle */}
        </div>
        <Skeleton className="h-10 w-40 bg-slate-700 rounded-md" /> {/* Button */}
      </header>

      {/* Filters Skeleton */}
      <Card className="p-4 bg-slate-800/60 border-slate-700">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 items-end">
          <div className="lg:col-span-2 xl:col-span-1">
            <Skeleton className="h-4 w-20 mb-1 bg-slate-700" /> {/* Label */}
            <Skeleton className="h-10 w-full bg-slate-700 rounded-md" /> {/* Input */}
          </div>
          {[...Array(4)].map((_, i) => (
            <div key={i}>
              <Skeleton className="h-4 w-16 mb-1 bg-slate-700" /> {/* Label */}
              <Skeleton className="h-10 w-full bg-slate-700 rounded-md" /> {/* Select/Input */}
            </div>
          ))}
        </div>
      </Card>

      {/* Invoice Cards Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array(6)
          .fill(0)
          .map((_, index) => (
            <Card key={index} className="bg-slate-800/60 border-slate-700">
              <CardHeader className="p-4">
                <div className="flex justify-between items-start">
                  <Skeleton className="h-5 w-2/5 bg-slate-700" /> {/* Inv Number */}
                  <Skeleton className="h-6 w-20 bg-slate-700 rounded-full" /> {/* Status Badge */}
                </div>
                <Skeleton className="h-5 w-3/4 mt-2 bg-slate-700" /> {/* Client Name */}
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <Skeleton className="h-4 w-1/2 mb-2 bg-slate-700" /> {/* Date */}
                <Skeleton className="h-6 w-1/3 bg-slate-700" /> {/* Amount */}
              </CardContent>
              <CardFooter className="p-4 border-t border-slate-700/50 flex justify-end space-x-2">
                <Skeleton className="h-8 w-8 rounded-md bg-slate-700" /> {/* Icon Button */}
                <Skeleton className="h-8 w-8 rounded-md bg-slate-700" /> {/* Icon Button */}
                <Skeleton className="h-8 w-8 rounded-md bg-slate-700" /> {/* Icon Button */}
              </CardFooter>
            </Card>
          ))}
      </div>

      {/* Pagination Skeleton */}
      <div className="flex items-center justify-center space-x-2 py-4">
        <Skeleton className="h-9 w-24 bg-slate-700 rounded-md" />
        <Skeleton className="h-5 w-20 bg-slate-700 rounded-md" />
        <Skeleton className="h-9 w-20 bg-slate-700 rounded-md" />
      </div>
    </div>
  )
}
