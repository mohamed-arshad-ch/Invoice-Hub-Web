"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, FolderOpen, CheckSquare, BarChart3 } from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "/admin/dashboard", label: "Home", icon: Home },
  { href: "/admin/files", label: "Files", icon: FolderOpen },
  { href: "/admin/tasks", label: "Tasks", icon: CheckSquare },
  { href: "/admin/reports", label: "Reports", icon: BarChart3 },
]

export default function BottomNavigation() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-16 bg-slate-900/80 backdrop-blur-md border-t border-slate-700  z-50">
      <div className="flex justify-around items-center h-full">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href || (item.href !== "/admin/dashboard" && pathname.startsWith(item.href))
          return (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center space-y-1 p-2 rounded-md transition-colors duration-200",
                isActive ? "text-blue-400" : "text-slate-400 hover:text-slate-200",
              )}
            >
              <item.icon className="w-6 h-6" />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
