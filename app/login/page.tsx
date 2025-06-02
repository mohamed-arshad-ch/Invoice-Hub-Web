import type { Metadata } from "next"
import LoginForm from "@/components/login-form"

export const metadata: Metadata = {
  title: "Login | InvoiceHub",
  description: "Login to your InvoiceHub account",
}

export default function LoginPage() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-b from-slate-900 to-slate-800 p-4">
      <LoginForm />
    </div>
  )
}
