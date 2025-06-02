import { Skeleton } from "@/components/ui/skeleton"
import { Filter, PlusCircle, CreditCard } from "lucide-react"

export default function PaymentsPageLoading() {
  return (
    <div className="space-y-6 font-poppins">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <Skeleton className="h-9 w-72 mb-2" /> {/* Payment Management */}
          <Skeleton className="h-4 w-96" /> {/* Track and manage... */}
        </div>
        <Skeleton className="h-12 w-48 rounded-md flex items-center justify-center gap-2">
          {" "}
          {/* Record Payment Button */}
          <PlusCircle size={20} className="text-transparent" />
          <span className="text-transparent">Record Payment</span>
        </Skeleton>
      </header>

      {/* Filter Section Skeleton */}
      <div className="p-4 sm:p-6 bg-white dark:bg-slate-800/60 backdrop-blur-md border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm space-y-4">
        <div className="flex items-center gap-2 text-lg font-semibold">
          <Filter size={20} className="text-slate-400 dark:text-slate-500" />
          <Skeleton className="h-6 w-20" /> {/* Filters */}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          <Skeleton className="h-11 w-full rounded-md" /> {/* Search Input */}
          <Skeleton className="h-11 w-full rounded-md" /> {/* Date Range Picker */}
          <Skeleton className="h-11 w-full rounded-md" /> {/* Client Filter */}
          <Skeleton className="h-11 w-full rounded-md" /> {/* Status Filter */}
          <Skeleton className="h-11 w-full rounded-md" /> {/* Method Filter */}
        </div>
      </div>

      {/* Payments Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[...Array(8)].map((_, index) => (
          <div
            key={index}
            className="bg-white dark:bg-slate-800/80 p-5 rounded-lg shadow-custom border border-slate-200 dark:border-slate-700 space-y-3"
          >
            <div className="flex justify-between items-start">
              <Skeleton className="h-6 w-3/5" /> {/* Payment Number */}
              <Skeleton className="h-5 w-1/4" /> {/* Status Badge */}
            </div>
            <Skeleton className="h-5 w-4/5" /> {/* Client Name */}
            <div className="flex justify-between items-center text-sm">
              <Skeleton className="h-4 w-1/3" /> {/* Amount */}
              <Skeleton className="h-4 w-1/3" /> {/* Date */}
            </div>
            <div className="flex justify-between items-center text-sm pt-2">
              <Skeleton className="h-4 w-2/5" /> {/* Payment Method */}
            </div>
            <div className="flex gap-2 pt-3 border-t border-slate-200 dark:border-slate-700/50 mt-3">
              <Skeleton className="h-9 w-1/2 rounded-md" /> {/* View Details Button */}
              <Skeleton className="h-9 w-1/2 rounded-md" /> {/* Edit Button */}
            </div>
          </div>
        ))}
      </div>
      {/* Fallback for no items, shown during skeleton loading */}
      <div className="text-center py-10 opacity-0" aria-hidden="true">
        <CreditCard size={48} className="mx-auto text-slate-400 dark:text-slate-500 mb-4" />
        <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-300 mb-2">Loading Payments...</h3>
        <p className="text-slate-500 dark:text-slate-400">Please wait while we fetch the payment records.</p>
      </div>
    </div>
  )
}
