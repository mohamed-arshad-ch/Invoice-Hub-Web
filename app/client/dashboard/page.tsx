"use client"

import { useSelector } from "react-redux"
import type { RootState } from "@/lib/redux/store"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertCircle, FileText, MessageSquare, Download, Clock, CheckCircle, AlertTriangle } from "lucide-react"

// Mock data - replace with actual data fetching
const outstandingBalance = { amount: 1250.75, currency: "USD", overdue: true }
const recentTransactions = [
  { id: "txn_1", description: "Invoice #INV-007 Payment", amount: -250.0, date: "2024-05-28" },
  { id: "txn_2", description: "Service Subscription", amount: -49.99, date: "2024-05-25" },
  { id: "txn_3", description: "Refund for Order #ORD-003", amount: 75.5, date: "2024-05-22" },
]
const activeQuotations = [
  { id: "quo_1", title: "Website Redesign Project", status: "Pending Approval", amount: 3500.0 },
  { id: "quo_2", title: "Monthly Maintenance", status: "Pending Approval", amount: 150.0 },
]
const recentActivity = [
  { id: "act_1", text: "Invoice #INV-008 generated", timestamp: "2 hours ago", icon: FileText },
  { id: "act_2", text: "Payment received for Invoice #INV-007", timestamp: "1 day ago", icon: CheckCircle },
  { id: "act_3", text: "New quotation QOU-010 sent for approval", timestamp: "2 days ago", icon: FileText },
  { id: "act_4", text: "Support ticket #ST-023 updated", timestamp: "3 days ago", icon: MessageSquare },
]

export default function ClientDashboardPage() {
  const auth = useSelector((state: RootState) => state.auth)
  const clientName = auth.user?.email?.split("@")[0] || "Valued Client" // Simple name extraction

  return (
    <div className="container mx-auto px-4 py-8 space-y-8 font-poppins">
      {/* Welcome Message */}
      <Card className="bg-slate-800/70 border-slate-700 shadow-lg rounded-lg">
        <CardHeader>
          <CardTitle className="text-3xl font-semibold text-white">
            Welcome back, <span className="text-blue-400 capitalize">{clientName}</span>!
          </CardTitle>
          <CardDescription className="text-slate-300">Here's an overview of your account.</CardDescription>
        </CardHeader>
      </Card>

      {/* Account Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Outstanding Balance */}
        <Card className="bg-slate-800/70 border-slate-700 shadow-md rounded-lg hover:shadow-blue-500/30 transition-shadow duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">Outstanding Balance</CardTitle>
            <AlertCircle className={`h-5 w-5 ${outstandingBalance.overdue ? "text-pink-500" : "text-slate-400"}`} />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">
              {outstandingBalance.amount.toLocaleString(undefined, {
                style: "currency",
                currency: outstandingBalance.currency,
              })}
            </div>
            {outstandingBalance.overdue && (
              <p className="text-xs text-pink-400 mt-1 flex items-center">
                <AlertTriangle className="h-4 w-4 mr-1" />
                Payment overdue. Please settle soon.
              </p>
            )}
            {!outstandingBalance.overdue && <p className="text-xs text-slate-400 mt-1">All payments are up to date.</p>}
          </CardContent>
        </Card>

        {/* Recent Transactions */}
        <Card className="bg-slate-800/70 border-slate-700 shadow-md rounded-lg hover:shadow-purple-500/30 transition-shadow duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">Recent Transactions</CardTitle>
            <FileText className="h-5 w-5 text-slate-400" />
          </CardHeader>
          <CardContent>
            {recentTransactions.length > 0 ? (
              <ul className="space-y-2">
                {recentTransactions.slice(0, 3).map((txn) => (
                  <li key={txn.id} className="text-sm text-slate-200 flex justify-between">
                    <span>{txn.description}</span>
                    <span className={txn.amount > 0 ? "text-green-400" : "text-red-400"}>
                      {txn.amount.toLocaleString(undefined, { style: "currency", currency: "USD" })}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-slate-400">No recent transactions.</p>
            )}
          </CardContent>
          <CardFooter className="pt-2">
            <Button variant="link" className="text-blue-400 p-0 h-auto text-xs hover:text-blue-300">
              View all transactions
            </Button>
          </CardFooter>
        </Card>

        {/* Active Quotations */}
        <Card className="bg-slate-800/70 border-slate-700 shadow-md rounded-lg hover:shadow-pink-500/30 transition-shadow duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">Active Quotations</CardTitle>
            <FileText className="h-5 w-5 text-slate-400" />
          </CardHeader>
          <CardContent>
            {activeQuotations.length > 0 ? (
              <ul className="space-y-2">
                {activeQuotations.slice(0, 2).map((quote) => (
                  <li key={quote.id} className="text-sm text-slate-200">
                    {quote.title} - <span className="text-yellow-400">{quote.status}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-slate-400">No active quotations requiring approval.</p>
            )}
          </CardContent>
          <CardFooter className="pt-2">
            <Button variant="link" className="text-blue-400 p-0 h-auto text-xs hover:text-blue-300">
              View all quotations
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="bg-slate-800/70 border-slate-700 shadow-lg rounded-lg">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-white">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <Button
            variant="outline"
            className="w-full justify-start text-left bg-slate-700/50 border-slate-600 hover:bg-slate-700 text-slate-100 hover:text-white transition-colors duration-200"
          >
            <FileText className="mr-2 h-5 w-5 text-blue-400" /> View My Invoices
          </Button>
          <Button
            variant="outline"
            className="w-full justify-start text-left bg-slate-700/50 border-slate-600 hover:bg-slate-700 text-slate-100 hover:text-white transition-colors duration-200"
          >
            <Download className="mr-2 h-5 w-5 text-purple-400" /> Download Receipts
          </Button>
          <Button
            variant="outline"
            className="w-full justify-start text-left bg-slate-700/50 border-slate-600 hover:bg-slate-700 text-slate-100 hover:text-white transition-colors duration-200"
          >
            <MessageSquare className="mr-2 h-5 w-5 text-pink-400" /> Contact Support
          </Button>
        </CardContent>
      </Card>

      {/* Recent Activity Timeline */}
      <Card className="bg-slate-800/70 border-slate-700 shadow-lg rounded-lg">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-white">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-4">
            {recentActivity.map((activity) => (
              <li key={activity.id} className="flex items-start space-x-3">
                <div className="flex-shrink-0 pt-0.5">
                  <activity.icon className="h-5 w-5 text-slate-400" />
                </div>
                <div>
                  <p className="text-sm text-slate-200">{activity.text}</p>
                  <p className="text-xs text-slate-500 flex items-center">
                    <Clock className="h-3 w-3 mr-1" /> {activity.timestamp}
                  </p>
                </div>
              </li>
            ))}
          </ul>
          {recentActivity.length === 0 && <p className="text-sm text-slate-400">No recent activity to display.</p>}
        </CardContent>
      </Card>
    </div>
  )
}
