import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../api/client';
import { DollarSign, TrendingUp, Wallet, Search, ArrowRight, Receipt } from 'lucide-react';

export default function AdminTransactions() {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'course' | 'gig'>('all');

  const { data: revenue, isLoading: loadingRevenue } = useQuery({
    queryKey: ['admin-revenue'],
    queryFn: async () => (await api.get('/transactions/admin/revenue')).data,
  });

  const { data: transactions, isLoading: loadingTransactions } = useQuery({
    queryKey: ['admin-transactions'],
    queryFn: async () => (await api.get('/transactions/admin/all')).data,
  });

  const filteredTransactions = transactions?.filter((tx: any) => {
    const matchesSearch = 
      tx.itemTitle?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.buyerId?.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.buyerId?.lastName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.sellerId?.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.sellerId?.lastName?.toLowerCase().includes(searchQuery.toLowerCase());
      
    const matchesType = typeFilter === 'all' || tx.type === typeFilter;
    
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Revenue & Transactions</h1>
        <p className="text-gray-600">Track all platform payments and your 10% commission.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Platform Revenue (10%) */}
        <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 text-white p-6 rounded-2xl shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16"></div>
          <div className="relative z-10 flex justify-between items-start">
            <div>
              <p className="text-indigo-200 text-sm font-medium mb-1">Platform Revenue (10%)</p>
              <p className="text-4xl font-extrabold">
                {loadingRevenue ? '...' : `$${revenue?.totalPlatformFees?.toFixed(2) || '0.00'}`}
              </p>
            </div>
            <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
              <Wallet className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Total Sales Volume */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500 text-sm font-medium mb-1">Total Sales Volume</p>
              <p className="text-4xl font-extrabold text-gray-900">
                {loadingRevenue ? '...' : `$${revenue?.totalRevenue?.toFixed(2) || '0.00'}`}
              </p>
            </div>
            <div className="bg-emerald-50 p-3 rounded-xl">
              <TrendingUp className="w-6 h-6 text-emerald-600" />
            </div>
          </div>
        </div>

        {/* Total Transactions */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500 text-sm font-medium mb-1">Total Transactions</p>
              <p className="text-4xl font-extrabold text-gray-900">
                {loadingRevenue ? '...' : revenue?.totalTransactions || 0}
              </p>
            </div>
            <div className="bg-blue-50 p-3 rounded-xl">
              <Receipt className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-bold text-gray-900">Transaction History</h2>
            <span className="bg-gray-100 text-gray-600 text-sm font-semibold px-3 py-1 rounded-full">
              {filteredTransactions?.length || 0} records
            </span>
          </div>

          <div className="flex gap-3 w-full md:w-auto">
            {/* Type Filter */}
            <select 
              value={typeFilter} 
              onChange={(e) => setTypeFilter(e.target.value as any)}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
            >
              <option value="all">All Types</option>
              <option value="course">Courses</option>
              <option value="gig">Gigs</option>
            </select>

            {/* Search */}
            <div className="relative w-full md:w-72">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search by item or user..."
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-100 text-sm">
              <tr>
                <th className="p-4 font-semibold text-gray-600">Date</th>
                <th className="p-4 font-semibold text-gray-600">Item</th>
                <th className="p-4 font-semibold text-gray-600">Buyer → Seller</th>
                <th className="p-4 font-semibold text-gray-600">Amount</th>
                <th className="p-4 font-semibold text-gray-600">Platform Fee</th>
                <th className="p-4 font-semibold text-gray-600">Seller Earnings</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loadingTransactions ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-500">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
                    </div>
                  </td>
                </tr>
              ) : filteredTransactions?.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-gray-500">
                    <DollarSign size={40} className="mx-auto mb-3 text-gray-300" />
                    <p>No transactions found.</p>
                  </td>
                </tr>
              ) : (
                filteredTransactions?.map((tx: any) => (
                  <tr key={tx._id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4 text-sm text-gray-500 whitespace-nowrap">
                      {new Date(tx.createdAt).toLocaleDateString('en-US', { 
                        month: 'short', day: 'numeric', year: 'numeric' 
                      })}
                    </td>
                    <td className="p-4">
                      <p className="font-semibold text-gray-900 line-clamp-1">{tx.itemTitle}</p>
                      <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full uppercase mt-1 ${tx.type === 'course' ? 'bg-indigo-100 text-indigo-700' : 'bg-emerald-100 text-emerald-700'}`}>
                        {tx.type}
                      </span>
                    </td>
                    <td className="p-4 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900">{tx.buyerId?.firstName} {tx.buyerId?.lastName}</span>
                        <ArrowRight size={14} className="text-gray-400" />
                        <span className="font-medium text-gray-900">{tx.sellerId?.firstName} {tx.sellerId?.lastName}</span>
                      </div>
                    </td>
                    <td className="p-4 font-bold text-gray-900">${tx.amount.toFixed(2)}</td>
                    <td className="p-4">
                      <span className="font-bold text-indigo-600">+${tx.platformFee.toFixed(2)}</span>
                    </td>
                    <td className="p-4">
                      <span className="font-bold text-emerald-600">${tx.sellerEarnings.toFixed(2)}</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}