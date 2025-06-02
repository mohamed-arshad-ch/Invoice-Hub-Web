"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useDispatch } from "react-redux"
import { login } from "@/lib/redux/slices/authSlice"
import Image from "next/image"
import Link from "next/link"
import { Loader2, AlertCircle } from "lucide-react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "sonner"
import { setUserData } from "@/lib/storage"

const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(1, { message: "Password is required" }),
  rememberMe: z.boolean().optional(),
})

type FormValues = z.infer<typeof formSchema>

export default function LoginForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [loginError, setLoginError] = useState<string | null>(null)
  const dispatch = useDispatch()
  const router = useRouter()

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  })

  const onSubmit = async (data: FormValues) => {
    setIsLoading(true)
    setLoginError(null) // Clear any previous errors

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
        }),
      })

      const result = await response.json()

      if (response.ok && result.success) {
        // Store user data in localStorage
        setUserData(result.user)
        
        // Dispatch login action to Redux
        dispatch(
          login({
            email: data.email,
            role: result.user.role,
            rememberMe: data.rememberMe,
          }),
        )

        toast.success(result.message || 'Login successful! Redirecting...', {
          duration: 2000,
        })
        
        // Redirect to the appropriate dashboard based on user role
        router.push(result.redirectUrl)
      } else {
        // Handle different types of errors
        let errorMessage = 'Login failed. Please try again.'
        
        if (response.status === 401) {
          errorMessage = result.message || 'Invalid email or password. Please check your credentials.'
        } else if (response.status === 400) {
          // Handle validation errors
          if (result.errors && Array.isArray(result.errors)) {
            errorMessage = result.errors.map((err: any) => err.message).join(', ')
          } else {
            errorMessage = result.message || 'Invalid input. Please check your details.'
          }
        } else if (response.status === 500) {
          errorMessage = 'Server error. Please try again later.'
        } else if (result.message) {
          errorMessage = result.message
        }

        setLoginError(errorMessage)
        toast.error(errorMessage, {
          duration: 4000,
        })
      }
    } catch (error) {
      console.error("Login failed:", error)
      const errorMessage = 'Network error. Please check your connection and try again.'
      setLoginError(errorMessage)
      toast.error(errorMessage, {
        duration: 4000,
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md border-0 shadow-lg bg-white/5 backdrop-blur-sm transition-all duration-200">
      <CardHeader className="space-y-4 text-center">
        <div className="mx-auto w-20 h-20 rounded-full bg-slate-800 flex items-center justify-center overflow-hidden">
          <Image
            src="/placeholder.svg?height=80&width=80"
            alt="Company Logo"
            width={80}
            height={80}
            className="object-cover"
          />
        </div>
        <CardTitle className="text-2xl font-semibold text-white font-poppins">InvoiceHub</CardTitle>
        <CardDescription className="text-slate-300 font-poppins">
          Enter your credentials to access your account
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-6">
          {/* Global form error display */}
          {loginError && (
            <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-md">
              <AlertCircle className="h-4 w-4 text-red-400 flex-shrink-0" />
              <p className="text-sm text-red-400 font-poppins">{loginError}</p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email" className="text-slate-200 font-poppins">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="name@company.com"
              className="bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-400 focus:border-blue-500 transition-all duration-200 font-poppins"
              {...register("email")}
            />
            {errors.email && <p className="text-sm text-red-500 mt-1 font-poppins">{errors.email.message}</p>}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-slate-200 font-poppins">
                Password
              </Label>
              <Link
                href="/forgot-password"
                className="text-xs text-blue-400 hover:text-blue-300 transition-colors duration-200 font-poppins"
              >
                Forgot password?
              </Link>
            </div>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              className="bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-400 focus:border-blue-500 transition-all duration-200 font-poppins"
              {...register("password")}
            />
            {errors.password && <p className="text-sm text-red-500 mt-1 font-poppins">{errors.password.message}</p>}
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="rememberMe"
              className="border-slate-500 data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
              onCheckedChange={(checked) => setValue("rememberMe", checked === true)}
            />
            <Label htmlFor="rememberMe" className="text-sm text-slate-300 cursor-pointer font-poppins">
              Remember me for 30 days
            </Label>
          </div>
        </CardContent>

        <CardFooter>
          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-medium py-2 rounded-md transition-all duration-200 font-poppins disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing in...
              </>
            ) : (
              "Sign in"
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
