'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { 
  CreditCard, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Ban,
  Search,
  Download,
  Loader2,
  User,
  BookOpen,
  Phone,
  Calendar,
  Eye,
  RefreshCcw,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  DollarSign,
  X
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import { motion, AnimatePresence } from 'framer-motion'

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8080/api'

const STATUS_CONFIG = {
  success: { 
    color: 'bg-emerald-100 text-emerald-800 border-emerald-200', 
    Icon: CheckCircle2,
    label: 'Completed',
    bg: 'bg-emerald-50'
  },
  pending: { 
    color: 'bg-amber-100 text-amber-800 border-amber-200', 
    Icon: Clock,
    label: 'Pending',
    bg: 'bg-amber-50'
  },
  failed: { 
    color: 'bg-rose-100 text-rose-800 border-rose-200', 
    Icon: XCircle,
    label: 'Failed',
    bg: 'bg-rose-50'
  },
  cancelled: { 
    color: 'bg-slate-100 text-slate-800 border-slate-200', 
    Icon: Ban,
    label: 'Cancelled',
    bg: 'bg-slate-50'
  }
}

export default function AdminPayments() {
  const router = useRouter()
  const [payments, setPayments] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [dateRange, setDateRange] = useState('all')
  const [selectedPayment, setSelectedPayment] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10
  const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'desc' })

  useEffect(() => {
    fetchPayments()
  }, [])

  const fetchPayments = async (showRefresh = false) => {
    try {
      if (showRefresh) setRefreshing(true)
      else setLoading(true)
      
      const [paymentsRes, statsRes] = await Promise.all([
        fetch(`${backendUrl}/payment/all`, {
          credentials: 'include',
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }),
        fetch(`${backendUrl}/payment/stats`, {
          credentials: 'include',
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        })
      ])

      if (!paymentsRes.ok) {
        if (paymentsRes.status === 401) router.push('/login')
        throw new Error('Failed to fetch payments')
      }
      
      const paymentsData = await paymentsRes.json()
      const statsData = await statsRes.json()

      if (paymentsData.success) setPayments(paymentsData.payments)
      if (statsData.success) setStats(statsData)
    } catch (error) {
      console.error('Error:', error)
      toast.error(error.message || 'Failed to load payments')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const filteredPayments = useMemo(() => {
    let result = [...payments]

    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      result = result.filter(p => 
        p.user?.name?.toLowerCase().includes(term) ||
        p.user?.email?.toLowerCase().includes(term) ||
        p.book?.title?.toLowerCase().includes(term) ||
        p.transaction?.toLowerCase().includes(term) ||
        p.phone?.includes(term)
      )
    }

    if (statusFilter !== 'all') {
      result = result.filter(p => p.status === statusFilter)
    }

    if (dateRange !== 'all') {
      const now = new Date()
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      
      result = result.filter(p => {
        const paymentDate = new Date(p.createdAt)
        if (dateRange === 'today') return paymentDate >= today
        if (dateRange === 'week') {
          const weekAgo = new Date(today)
          weekAgo.setDate(weekAgo.getDate() - 7)
          return paymentDate >= weekAgo
        }
        if (dateRange === 'month') {
          const monthAgo = new Date(today)
          monthAgo.setMonth(monthAgo.getMonth() - 1)
          return paymentDate >= monthAgo
        }
        return true
      })
    }

    result.sort((a, b) => {
      let aVal = a[sortConfig.key]
      let bVal = b[sortConfig.key]
      
      if (sortConfig.key === 'user') {
        aVal = a.user?.name || ''
        bVal = b.user?.name || ''
      }
      if (sortConfig.key === 'book') {
        aVal = a.book?.title || ''
        bVal = b.book?.title || ''
      }
      if (sortConfig.key === 'amount') {
        aVal = a.amount
        bVal = b.amount
      }
      if (sortConfig.key === 'createdAt') {
        aVal = new Date(aVal)
        bVal = new Date(bVal)
      }

      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1
      return 0
    })

    return result
  }, [payments, searchTerm, statusFilter, dateRange, sortConfig])

  const totalPages = Math.ceil(filteredPayments.length / itemsPerPage)
  const paginatedPayments = filteredPayments.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }))
  }

  const exportToCSV = () => {
    const headers = ['Date', 'User Name', 'Email', 'Phone', 'Book', 'Amount', 'Status', 'Transaction ID', 'M-Pesa Receipt']
    const csvData = filteredPayments.map(p => [
      new Date(p.createdAt).toLocaleString(),
      p.user?.name || 'Deleted User',
      p.user?.email || 'N/A',
      p.phone,
      p.book?.title || 'Deleted Book',
      p.amount,
      p.status,
      p.transaction,
      p.mpesaReceipt || 'N/A'
    ])
    
    const csvContent = '\uFEFF' + [headers, ...csvData].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `payments-export-${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast.success('Export downloaded!')
  }

  const summaryStats = useMemo(() => {
    const today = new Date()
    today.setHours(0,0,0,0)
    
    return {
      today: payments.filter(p => new Date(p.createdAt) >= today && p.status === 'success')
        .reduce((sum, p) => sum + p.amount, 0),
      successRate: payments.length > 0 
        ? ((payments.filter(p => p.status === 'success').length / payments.length) * 100).toFixed(1)
        : 0
    }
  }, [payments])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-500">Loading payments...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Payment Management</h1>
            <p className="text-gray-500 mt-1">Track and manage all book purchases</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => fetchPayments(true)}
              disabled={refreshing}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              <RefreshCcw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <button
              onClick={exportToCSV}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">KES {stats?.totalRevenue?.toLocaleString() || 0}</p>
              </div>
              <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Today's Revenue</p>
                <p className="text-2xl font-bold text-gray-900">KES {summaryStats.today.toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Success Rate</p>
                <p className="text-2xl font-bold text-gray-900">{summaryStats.successRate}%</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Total Transactions</p>
                <p className="text-2xl font-bold text-gray-900">{payments.length}</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Status Breakdown */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {['success', 'pending', 'failed', 'cancelled'].map((status) => {
            const count = payments.filter(p => p.status === status).length
            const total = payments.length
            const percentage = total > 0 ? ((count / total) * 100).toFixed(0) : 0
            const config = STATUS_CONFIG[status]
            const StatusIcon = config.Icon
            
            return (
              <div 
                key={status}
                onClick={() => setStatusFilter(status === statusFilter ? 'all' : status)}
                className={`cursor-pointer rounded-lg p-4 border-2 transition-all ${statusFilter === status ? 'border-blue-500 bg-blue-50' : 'border-transparent bg-white hover:bg-gray-50'}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
                    <StatusIcon className="w-3 h-3" />
                    {config.label}
                  </span>
                  <span className="text-lg font-bold text-gray-900">{count}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div className={`h-1.5 rounded-full ${status === 'success' ? 'bg-emerald-500' : status === 'pending' ? 'bg-amber-500' : status === 'failed' ? 'bg-rose-500' : 'bg-slate-500'}`} style={{ width: `${percentage}%` }} />
                </div>
                <p className="text-xs text-gray-500 mt-1">{percentage}% of total</p>
              </div>
            )
          })}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center">
            <div className="relative w-full lg:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search users, books, transactions..."
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1) }}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div className="flex flex-wrap gap-3 w-full lg:w-auto">
              <select
                value={dateRange}
                onChange={(e) => { setDateRange(e.target.value); setCurrentPage(1) }}
                className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">Last 7 Days</option>
                <option value="month">Last 30 Days</option>
              </select>

              <button
                onClick={() => { setSearchTerm(''); setStatusFilter('all'); setDateRange('all'); setCurrentPage(1) }}
                className="px-4 py-2.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {[{ key: 'user', label: 'Customer' }, { key: 'book', label: 'Book' }, { key: 'phone', label: 'Phone' }, { key: 'amount', label: 'Amount' }, { key: 'status', label: 'Status' }, { key: 'transaction', label: 'Transaction' }, { key: 'createdAt', label: 'Date' }, { key: 'actions', label: '' }].map((column) => (
                    <th 
                      key={column.key}
                      onClick={() => column.key !== 'actions' && handleSort(column.key)}
                      className={`px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider ${column.key !== 'actions' ? 'cursor-pointer hover:bg-gray-100' : ''}`}
                    >
                      <div className="flex items-center gap-1">
                        {column.label}
                        {sortConfig.key === column.key && (
                          <ChevronDown className={`w-3 h-3 transition-transform ${sortConfig.direction === 'asc' ? 'rotate-180' : ''}`} />
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <AnimatePresence>
                  {paginatedPayments.map((payment) => {
                    const statusConfig = STATUS_CONFIG[payment.status] || STATUS_CONFIG.pending
                    const StatusIcon = statusConfig.Icon
                    
                    return (
                      <motion.tr key={payment._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="hover:bg-gray-50 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-medium text-sm">
                              {payment.user?.name ? payment.user.name.charAt(0).toUpperCase() : '?'}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{payment.user?.name || <span className="text-red-500 italic">Deleted User</span>}</p>
                              <p className="text-sm text-gray-500">{payment.user?.email || 'No email'}</p>
                            </div>
                          </div>
                        </td>
                        
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-14 rounded bg-gray-200 overflow-hidden flex-shrink-0">
                              {payment.book?.coverImage ? (
                                <img src={payment.book.coverImage} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <BookOpen className="w-full h-full p-2 text-gray-400" />
                              )}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900 line-clamp-1 max-w-[150px]">{payment.book?.title || <span className="text-red-500 italic">Deleted Book</span>}</p>
                              <p className="text-xs text-gray-500">by {payment.book?.author || 'Unknown'}</p>
                            </div>
                          </div>
                        </td>
                        
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-sm text-gray-600 font-mono">
                            <Phone className="w-4 h-4 text-gray-400" />
                            {payment.phone}
                          </div>
                        </td>
                        
                        <td className="px-6 py-4">
                          <p className="font-bold text-gray-900">KES {payment.amount?.toLocaleString()}</p>
                        </td>
                        
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border ${statusConfig.color}`}>
                            <StatusIcon className="w-3.5 h-3.5" />
                            {statusConfig.label}
                          </span>
                        </td>
                        
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            <code className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-700 font-mono block">{payment.transaction}</code>
                            {payment.mpesaReceipt && <p className="text-xs text-emerald-600 font-medium">Receipt: {payment.mpesaReceipt}</p>}
                          </div>
                        </td>
                        
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-600">
                            <p className="font-medium">{new Date(payment.createdAt).toLocaleDateString()}</p>
                            <p className="text-xs text-gray-400">{new Date(payment.createdAt).toLocaleTimeString()}</p>
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <button onClick={() => setSelectedPayment(payment)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors opacity-0 group-hover:opacity-100">
                            <Eye className="w-4 h-4 text-gray-500" />
                          </button>
                        </td>
                      </motion.tr>
                    )
                  })}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
          
          {filteredPayments.length === 0 && (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CreditCard className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">No payments found</h3>
              <p className="text-gray-500">Try adjusting your search or filters</p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <p className="text-sm text-gray-600">Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredPayments.length)} of {filteredPayments.length} results</p>
            <div className="flex gap-2">
              <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-2 hover:bg-gray-100 rounded-lg disabled:opacity-50">
                <ChevronLeft className="w-5 h-5" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button key={page} onClick={() => setCurrentPage(page)} className={`w-10 h-10 rounded-lg font-medium transition-colors ${currentPage === page ? 'bg-blue-600 text-white' : 'hover:bg-gray-100 text-gray-700'}`}>
                  {page}
                </button>
              ))}
              <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="p-2 hover:bg-gray-100 rounded-lg disabled:opacity-50">
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedPayment && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Payment Details</h2>
                <button onClick={() => setSelectedPayment(null)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-6 space-y-6">
                {/* Status Banner - FIXED HERE */}
                {(() => {
                  const config = STATUS_CONFIG[selectedPayment.status] || STATUS_CONFIG.pending
                  const StatusIcon = config.Icon
                  return (
                    <div className={`p-4 rounded-xl ${config.bg}`}>
                      <div className="flex items-center gap-3">
                        <StatusIcon className="w-8 h-8" />
                        <div>
                          <p className="text-sm text-gray-600">Status</p>
                          <p className="text-lg font-bold capitalize">{selectedPayment.status}</p>
                        </div>
                      </div>
                    </div>
                  )
                })()}

                {/* Amount */}
                <div className="text-center p-6 bg-gray-50 rounded-xl">
                  <p className="text-sm text-gray-500 mb-1">Amount Paid</p>
                  <p className="text-4xl font-bold text-gray-900">KES {selectedPayment.amount?.toLocaleString()}</p>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Customer</p>
                    <p className="font-medium text-gray-900">{selectedPayment.user?.name || 'N/A'}</p>
                    <p className="text-sm text-gray-500">{selectedPayment.user?.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Phone</p>
                    <p className="font-medium text-gray-900 font-mono">{selectedPayment.phone}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm text-gray-500 mb-1">Book</p>
                    <p className="font-medium text-gray-900">{selectedPayment.book?.title || 'N/A'}</p>
                    <p className="text-sm text-gray-500">by {selectedPayment.book?.author}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Transaction ID</p>
                    <code className="text-xs bg-gray-100 px-2 py-1 rounded">{selectedPayment.transaction}</code>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Date</p>
                    <p className="text-sm text-gray-900">{new Date(selectedPayment.createdAt).toLocaleString()}</p>
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
                <button onClick={() => setSelectedPayment(null)} className="w-full py-3 bg-white border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors">Close</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}