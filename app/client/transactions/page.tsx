"use client"

import { useState, useEffect } from "react"
import type { Invoice } from "@/lib/types/invoice" // Re-using Invoice type for transactions
import TransactionCard from "@/components/client/transactions/transaction-card"
import TransactionDetailSheet from "@/components/client/transactions/transaction-detail-sheet"
import { Info } from "lucide-react"

// Mock data - replace with actual data fetching logic
const mockClientTransactions: Invoice[] = [
  {
    id: "INV-C001",
    invoiceNumber: "INV-C001",
    clientId: "CLIENT-001",
    clientName: "Current Client LLC", // This would be the logged-in client
    clientEmail: "client@example.com",
    issueDate: "2024-05-01T00:00:00.000Z",
    dueDate: "2024-05-31T00:00:00.000Z",
    lineItems: [
      {
        id: "LI-001",
        productId: "PROD-A",
        productName: "Web Design Package",
        description: "Initial design phase",
        quantity: 1,
        unitPrice: 1500,
        amount: 1500,
      },
      {
        id: "LI-002",
        productId: "PROD-B",
        productName: "Monthly Hosting",
        description: "May 2024",
        quantity: 1,
        unitPrice: 50,
        amount: 50,
      },
    ],
    subtotal: 1550,
    taxRatePercent: 10,
    taxAmount: 155,
    totalAmount: 1705,
    amountPaid: 1000,
    balanceDue: 705,
    status: "pending_payment",
    paymentTerms: "Net 30",
    notes: "Thank you for your business!",
    createdAt: "2024-05-01T00:00:00.000Z",
    updatedAt: "2024-05-05T00:00:00.000Z",
  },
  {
    id: "INV-C002",
    invoiceNumber: "INV-C002",
    clientId: "CLIENT-001",
    clientName: "Current Client LLC",
    clientEmail: "client@example.com",
    issueDate: "2024-04-15T00:00:00.000Z",
    dueDate: "2024-05-15T00:00:00.000Z",
    lineItems: [
      {
        id: "LI-003",
        productId: "PROD-C",
        productName: "Consulting Hours",
        description: "Strategy session",
        quantity: 5,
        unitPrice: 100,
        amount: 500,
      },
    ],
    subtotal: 500,
    taxRatePercent: 0,
    taxAmount: 0,
    totalAmount: 500,
    amountPaid: 500,
    balanceDue: 0,
    status: "paid",
    createdAt: "2024-04-15T00:00:00.000Z",
    updatedAt: "2024-04-20T00:00:00.000Z",
  },
  {
    id: "INV-C003",
    invoiceNumber: "INV-C003",
    clientId: "CLIENT-001",
    clientName: "Current Client LLC",
    clientEmail: "client@example.com",
    issueDate: "2024-03-10T00:00:00.000Z",
    dueDate: "2024-04-09T00:00:00.000Z", // This one is overdue
    lineItems: [
      {
        id: "LI-004",
        productId: "PROD-D",
        productName: "Software License",
        description: "Annual Subscription",
        quantity: 1,
        unitPrice: 299,
        amount: 299,
      },
    ],
    subtotal: 299,
    taxRatePercent: 0,
    taxAmount: 0,
    totalAmount: 299,
    amountPaid: 0,
    balanceDue: 299,
    status: "overdue",
    createdAt: "2024-03-10T00:00:00.000Z",
    updatedAt: "2024-03-10T00:00:00.000Z",
  },
]

export default function ClientTransactionsPage() {
  const [transactions, setTransactions] = useState<Invoice[]>([])
  const [selectedTransaction, setSelectedTransaction] = useState<Invoice | null>(null)
  const [isDetailSheetOpen, setIsDetailSheetOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // In a real app, you'd fetch client-specific transactions, possibly using Redux or an API call
  // const clientAuth = useSelector((state: RootState) => state.auth.client); // Example
  // For now, using mock data
  useEffect(() => {
    // Simulate fetching data
    setTimeout(() => {
      // Filter mock transactions for a specific client or assume all are for the current client
      setTransactions(mockClientTransactions)
      setIsLoading(false)
    }, 1000)
  }, [])

  const handleViewDetails = (transaction: Invoice) => {
    setSelectedTransaction(transaction)
    setIsDetailSheetOpen(true)
  }

  const handleCloseSheet = () => {
    setIsDetailSheetOpen(false)
    setSelectedTransaction(null)
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 font-poppins text-center text-slate-300">
        <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-400"></div>
          <p className="ml-3 text-lg">Loading transactions...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 font-poppins">
      <header className="mb-8">
        <h1 className="text-3xl font-semibold text-white">My Transactions</h1>
        <p className="text-slate-400 mt-1">View your invoices and payment history.</p>
      </header>

      {transactions.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center bg-slate-800/70 border border-slate-700 rounded-lg p-10 min-h-[300px]">
          <Info size={48} className="text-blue-400 mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">No Transactions Yet</h2>
          <p className="text-slate-400">When you have invoices or payments, they will appear here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {transactions.map((transaction) => (
            <TransactionCard
              key={transaction.id}
              transaction={transaction}
              onViewDetails={() => handleViewDetails(transaction)}
            />
          ))}
        </div>
      )}

      {selectedTransaction && (
        <TransactionDetailSheet
          isOpen={isDetailSheetOpen}
          onClose={handleCloseSheet}
          transaction={selectedTransaction}
        />
      )}
    </div>
  )
}
