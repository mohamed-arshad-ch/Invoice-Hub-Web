"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, ListChecks, BarChart3 } from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "/client/dashboard", label: "Home", icon: Home },
  { href: "/client/transactions", label: "Transactions", icon: ListChecks },
  { href: "/client/reports", label: "Reports", icon: BarChart3 },
  // { href: "/client/profile", label: "Profile", icon: UserCircle }, // Example for a profile tab
]

export default function ClientBottomNavigation() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-16 bg-slate-900/80 backdrop-blur-md border-t border-slate-700  z-50">
      <div className="flex justify-around items-center h-full max-w-md mx-auto">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href || (item.href !== "/client/dashboard" && pathname.startsWith(item.href))
          return (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center space-y-1 p-2 rounded-md transition-colors duration-200 w-1/3 text-center",
                isActive
                  ? "text-blue-400" // Primary color for active
                  : "text-slate-400 hover:text-slate-200",
              )}
              aria-current={isActive ? "page" : undefined}
            >
              <item.icon className="w-5 h-5 sm:w-6 sm:h-6" />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
