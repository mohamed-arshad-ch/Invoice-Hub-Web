import type React from "react"
import type { Metadata } from "next"
import ClientBottomNavigation from "@/components/client/bottom-navigation"
import { Poppins } from "next/font/google"
import { ReduxProvider } from "@/lib/redux/provider" // Assuming you want Redux here too
import { Toaster } from "@/components/ui/toaster"

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins",
})

export const metadata: Metadata = {
  title: "Client Dashboard | InvoiceHub",
  description: "Manage your account and transactions with InvoiceHub.",
}

export default function ClientDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ReduxProvider>
      <html lang="en" className={`${poppins.variable} font-poppins`}>
        <body className="bg-slate-900 text-slate-50 antialiased">
          <div className="flex flex-col min-h-screen">
            {/* Optional Header for Client Dashboard - can be added later */}
            {/* <header className="sticky top-0 z-50 w-full border-b border-slate-700 bg-slate-900/80 backdrop-blur-md">
            <div className="container flex h-16 items-center justify-between">
              <Link href="/client/dashboard" className="text-2xl font-bold text-white">
                Invoice<span className="text-blue-400">Hub</span> <span className="text-sm font-normal text-slate-400">(Client)</span>
              </Link>
              Profile/Notifications can go here
            </div>
          </header> */}
            <main className="flex-1 pb-20 md:pb-0">{children}</main>
            <ClientBottomNavigation />
            <Toaster />
          </div>
        </body>
      </html>
    </ReduxProvider>
  )
}
