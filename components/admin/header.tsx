"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Settings, LogOut, User, ChevronDown } from "lucide-react"
import { toast } from "sonner"
import { getUserData, clearUserData, type StoredUser } from "@/lib/storage"
import { useDispatch } from "react-redux"
import { logout } from "@/lib/redux/slices/authSlice"

export default function AdminHeader() {
  const [user, setUser] = useState<StoredUser | null>(null)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const router = useRouter()
  const dispatch = useDispatch()

  useEffect(() => {
    // Get user data from localStorage
    const userData = getUserData()
    setUser(userData)
  }, [])

  const handleLogout = async () => {
    setIsLoggingOut(true)
    
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const result = await response.json()

      if (result.success) {
        // Clear user data from localStorage
        clearUserData()
        
        // Dispatch logout action to Redux
        dispatch(logout())
        
        toast.success('Logged out successfully')
        
        // Redirect to login page
        router.push('/login')
      } else {
        toast.error('Failed to logout. Please try again.')
      }
    } catch (error) {
      console.error('Logout failed:', error)
      toast.error('An error occurred during logout.')
    } finally {
      setIsLoggingOut(false)
    }
  }

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
  }

  if (!user) {
    return null // or a loading skeleton
  }

  return (
    <header className="border-b border-slate-200 bg-slate-900/80 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Admin Dashboard</h1>
          <p className="text-sm text-slate-600">Welcome back, {user.firstName}!</p>
        </div>
        
        <div className="flex items-center gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                className="flex items-center gap-2 hover:bg-slate-100"
                disabled={isLoggingOut}
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/placeholder-avatar.png" alt={`${user.firstName} ${user.lastName}`} />
                  <AvatarFallback className="bg-blue-500 text-white text-sm font-medium">
                    {getInitials(user.firstName, user.lastName)}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium">{user.firstName} {user.lastName}</p>
                  <p className="text-xs text-slate-500">{user.role}</p>
                </div>
                <ChevronDown className="h-4 w-4 text-slate-500" />
              </Button>
            </DropdownMenuTrigger>
            
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">{user.firstName} {user.lastName}</p>
                  <p className="text-xs text-slate-500">{user.email}</p>
                  <p className="text-xs text-slate-500">{user.companyName}</p>
                </div>
              </DropdownMenuLabel>
              
              <DropdownMenuSeparator />
              
              <DropdownMenuItem className="cursor-pointer">
                <User className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              
              <DropdownMenuItem className="cursor-pointer">
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
              
              <DropdownMenuSeparator />
              
              <DropdownMenuItem 
                className="cursor-pointer text-red-600 focus:text-red-600"
                onClick={handleLogout}
                disabled={isLoggingOut}
              >
                <LogOut className="mr-2 h-4 w-4" />
                {isLoggingOut ? 'Logging out...' : 'Logout'}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
} 