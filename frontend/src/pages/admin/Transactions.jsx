import React, { useState, useEffect } from 'react';
import { 
  MagnifyingGlassIcon, 
  CalendarIcon, 
  UserIcon, 
  ChartBarIcon, 
  CheckCircleIcon, 
  XCircleIcon, 
  ArrowPathIcon, 
  EyeIcon, 
  PrinterIcon,
  ClockIcon,
  ShoppingBagIcon,
  CreditCardIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';
import AdminLayout from '../../components/admin/AdminLayout';
import api from '../../api/axios';

const Transactions = () => {
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [cashiers, setCashiers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('all'); // UBAH dari 'today' jadi 'all'
  const [statusFilter, setStatusFilter] = useState('all');
  const [kasirFilter, setKasirFilter] = useState('all');
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // GANTI fetchTransactions dengan API call yang beneran
  const fetchTransactions = async () => {
    setLoading(true);
    try {
      // Prepare query params
      const params = new URLSearchParams();
      
      // Date filter
      const today = new Date();
      if (dateFilter === 'today') {
        params.append('startDate', today.toISOString().split('T')[0]);
        params.append('endDate', today.toISOString().split('T')[0]);
      } else if (dateFilter === 'yesterday') {
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        params.append('startDate', yesterday.toISOString().split('T')[0]);
        params.append('endDate', yesterday.toISOString().split('T')[0]);
      } else if (dateFilter === 'week') {
        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 7);
        params.append('startDate', weekAgo.toISOString().split('T')[0]);
        params.append('endDate', today.toISOString().split('T')[0]);
      } else if (dateFilter === 'month') {
        const monthAgo = new Date(today);
        monthAgo.setDate(monthAgo.getDate() - 30);
        params.append('startDate', monthAgo.toISOString().split('T')[0]);
        params.append('endDate', today.toISOString().split('T')[0]);
      }
      
      if (kasirFilter !== 'all') params.append('cashier_id', kasirFilter);
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (searchTerm) params.append('search', searchTerm);
      
      const response = await api.get(`/transactions/admin/all?${params.toString()}`);
      
      if (response.data.success) {
        const transactionsData = response.data.data || [];
        setTransactions(transactionsData);
        setFilteredTransactions(transactionsData);
      } else {
        setTransactions([]);
        setFilteredTransactions([]);
      }
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
      setTransactions([]);
      setFilteredTransactions([]);
      alert('Gagal mengambil data transaksi: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch cashiers for filter - TAMBAH INI
  const fetchCashiers = async () => {
    try {
      const response = await api.get('/transactions/admin/cashiers');
      if (response.data.success) {
        setCashiers(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch cashiers:', error);
    }
  };

  useEffect(() => {
    fetchCashiers();
  }, []);

  useEffect(() => {
    fetchTransactions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateFilter, kasirFilter, statusFilter, searchTerm]);

  const getStatusBadge = (status) => {
    const styles = {
      completed: { bg: '#4CAF50', text: 'white' },
      void: { bg: '#FF5722', text: 'white' },
      refunded: { bg: '#FF9800', text: 'white' }
    };

    const style = styles[status] || styles.completed;

    return (
      <span 
        className="px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1"
        style={{ backgroundColor: style.bg, color: style.text }}
      >
        {status === 'completed' && <CheckCircleIcon className="w-3 h-3" />}
        {status === 'void' && <XCircleIcon className="w-3 h-3" />}
        {status === 'refunded' && <ArrowPathIcon className="w-3 h-3" />}
        {status === 'completed' && 'Selesai'}
        {status === 'void' && 'Batal'}
        {status === 'refunded' && 'Refund'}
      </span>
    );
  };

  const handleViewDetail = async (transaction) => {
    try {
      // Fetch detailed transaction data from API
      const response = await api.get(`/transactions/${transaction.id}`);
      
      if (response.data.success) {
        const detailData = response.data.data;
        
        // DEBUG: Cek struktur data yang diterima
        console.log('🔍 Detail Data from API:', detailData);
        console.log('🔍 Transaction Items:', detailData.transaction_items);
        
        // Transform data to match modal structure
        const transformedData = {
          ...detailData,
          invoiceNumber: detailData.transaction_code,
          date: new Date(detailData.created_at).toLocaleDateString('id-ID'),
          time: new Date(detailData.created_at).toLocaleTimeString('id-ID'),
          kasir: detailData.cashier_name || detailData.username,
          subtotal: detailData.subtotal || detailData.total_amount || 0,
          tax: detailData.tax_amount || 0,
          total: detailData.total_amount || 0,
          paymentMethod: detailData.payment_method,
          amountPaid: detailData.amount_paid || detailData.total_amount || 0,
          customerChange: detailData.change_amount || 0,
          // UBAH INI - Tambahin fallback lebih banyak
          items: detailData.transaction_items || detailData.items || detailData.details || []
        };
        
        console.log('✅ Transformed Data:', transformedData);
        console.log('✅ Items Length:', transformedData.items.length);
        
        setSelectedTransaction(transformedData);
        setShowDetailModal(true);
      }
    } catch (error) {
      console.error('Failed to fetch transaction detail:', error);
      alert('Gagal mengambil detail transaksi: ' + error.message);
    }
  };

  const handleVoidTransaction = async (transactionId) => {
    if (window.confirm('Yakin mau batalkan transaksi ini?')) {
      try {
        // TODO: API call to void transaction
        const updatedTransactions = transactions.map(t => 
          t.id === transactionId ? { ...t, status: 'void', voidReason: 'Admin void' } : t
        );
        setTransactions(updatedTransactions);
        alert('Transaksi berhasil dibatalkan');
      } catch (error) {
        alert('Gagal batalkan transaksi: ' + error.message);
      }
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: '#2C3E50' }}></div>
            <p style={{ color: '#2C3E50' }}>Loading transaksi...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2" style={{ color: '#2C3E50' }}>
            <CurrencyDollarIcon className="w-8 h-8" />
            Semua Transaksi
          </h1>
          <p className="opacity-70 mt-1" style={{ color: '#2C3E50' }}>
            Monitor dan kelola semua transaksi toko
          </p>
        </div>

        {/* Filters - UPDATED! */}
        <div className="rounded-lg shadow-lg p-6" style={{ backgroundColor: '#FFFFFF' }}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium mb-2 flex items-center gap-2" style={{ color: '#2C3E50' }}>
                <MagnifyingGlassIcon className="w-4 h-4" />
                Cari
              </label>
              <input
                type="text"
                placeholder="Invoice atau kasir..."
                className="w-full px-3 py-2 border-2 rounded-md focus:outline-none"
                style={{ 
                  borderColor: '#2C3E50',
                  backgroundColor: '#F8F9FA',
                  color: '#2C3E50'
                }}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Date Filter */}
            <div>
              <label className="block text-sm font-medium mb-2 flex items-center gap-2" style={{ color: '#2C3E50' }}>
                <CalendarIcon className="w-4 h-4" />
                Tanggal
              </label>
              <select
                className="w-full px-3 py-2 border-2 rounded-md focus:outline-none"
                style={{ 
                  borderColor: '#2C3E50',
                  backgroundColor: '#F8F9FA',
                  color: '#2C3E50'
                }}
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
              >
                <option value="all">Semua Waktu</option>
                <option value="today">Hari Ini</option>
                <option value="yesterday">Kemarin</option>
                <option value="week">Minggu Ini</option>
                <option value="month">Bulan Ini</option>
              </select>
            </div>

            {/* Kasir Filter - NEW! */}
            <div>
              <label className="block text-sm font-medium mb-2 flex items-center gap-2" style={{ color: '#2C3E50' }}>
                <UserIcon className="w-4 h-4" />
                Kasir
              </label>
              <select
                className="w-full px-3 py-2 border-2 rounded-md focus:outline-none"
                style={{ 
                  borderColor: '#2C3E50',
                  backgroundColor: '#F8F9FA',
                  color: '#2C3E50'
                }}
                value={kasirFilter}
                onChange={(e) => setKasirFilter(e.target.value)}
              >
                <option value="all">👥 Semua Kasir</option>
                {cashiers && cashiers.length > 0 && cashiers.map(cashier => (
                  <option key={cashier.id_user} value={cashier.id_user}>
                    {cashier.full_name || cashier.username}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium mb-2 flex items-center gap-2" style={{ color: '#2C3E50' }}>
                <ChartBarIcon className="w-4 h-4" />
                Status
              </label>
              <select
                className="w-full px-3 py-2 border-2 rounded-md focus:outline-none"
                style={{ 
                  borderColor: '#2C3E50',
                  backgroundColor: '#F8F9FA',
                  color: '#2C3E50'
                }}
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">Semua Status</option>
                <option value="completed">✅ Selesai</option>
                <option value="void">❌ Batal</option>
                <option value="refunded">↩️ Refund</option>
              </select>
            </div>

            {/* Quick Actions - NEW! */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#2C3E50' }}>
                ⚡ Quick Filter
              </label>
              <div className="flex space-x-2">
                <button
                  onClick={() => {
                    setDateFilter('today');
                    setStatusFilter('completed');
                  }}
                  className="flex-1 px-2 py-2 text-xs rounded-md transition-colors duration-200 flex items-center gap-1 justify-center"
                  style={{ 
                    backgroundColor: '#2C3E50',
                    color: '#FFFFFF'
                  }}
                >
                  <ChartBarIcon className="w-3 h-3" />
                  Hari Ini
                </button>
                <button
                  onClick={() => {
                    setDateFilter('all');
                    setStatusFilter('all');
                    setKasirFilter('all');
                    setSearchTerm('');
                  }}
                  className="flex-1 px-2 py-2 text-xs rounded-md border-2 transition-colors duration-200 flex items-center gap-1 justify-center"
                  style={{ 
                    backgroundColor: 'transparent',
                    color: '#2C3E50',
                    borderColor: '#2C3E50'
                  }}
                >
                  <ArrowPathIcon className="w-3 h-3" />
                  Reset
                </button>
              </div>
            </div>
          </div>

          {/* Enhanced Summary Stats - UPDATED! */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-6 pt-6 border-t" style={{ borderColor: '#2C3E50' }}>
            <div className="text-center">
              <p className="text-2xl font-bold" style={{ color: '#2C3E50' }}>
                {filteredTransactions.length}
              </p>
              <p className="text-sm opacity-70" style={{ color: '#2C3E50' }}>Total Transaksi</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">
                Rp {filteredTransactions
                  .filter(t => t.status === 'completed')
                  .reduce((sum, t) => sum + (t.total_amount || 0), 0)
                  .toLocaleString('id-ID')}
              </p>
              <p className="text-sm opacity-70" style={{ color: '#2C3E50' }}>Total Revenue</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">
                {filteredTransactions.filter(t => t.status === 'completed').length}
              </p>
              <p className="text-sm opacity-70" style={{ color: '#2C3E50' }}>Selesai</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600">
                {filteredTransactions.filter(t => t.status === 'void').length}
              </p>
              <p className="text-sm opacity-70" style={{ color: '#2C3E50' }}>Batal</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold" style={{ color: '#2C3E50' }}>
                {kasirFilter === 'all' ? '👥 Semua' : `👤 ${kasirFilter.split(' ')[0]}`}
              </p>
              <p className="text-sm opacity-70" style={{ color: '#2C3E50' }}>Kasir Dipilih</p>
            </div>
          </div>
        </div>

        {/* Transactions Table - Rest remains the same... */}
        <div className="rounded-lg shadow-lg overflow-hidden" style={{ backgroundColor: '#FFFFFF' }}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead style={{ backgroundColor: '#2C3E50' }}>
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-medium" style={{ color: '#FFFFFF' }}>
                    Invoice
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium" style={{ color: '#FFFFFF' }}>
                    Tanggal & Waktu
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium" style={{ color: '#FFFFFF' }}>
                    Kasir
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium" style={{ color: '#FFFFFF' }}>
                    Items
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium" style={{ color: '#FFFFFF' }}>
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium" style={{ color: '#FFFFFF' }}>
                    Payment
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium" style={{ color: '#FFFFFF' }}>
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium" style={{ color: '#FFFFFF' }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions && filteredTransactions.length > 0 ? (
                  filteredTransactions.map((transaction, index) => (
                  <tr key={transaction.id} className={index % 2 === 0 ? '' : 'bg-opacity-50'} style={{ backgroundColor: index % 2 === 0 ? 'transparent' : '#F8F9FA' }}>
                    <td className="px-6 py-4">
                      <p className="font-medium" style={{ color: '#2C3E50' }}>
                        {transaction.transaction_code}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <p style={{ color: '#2C3E50' }}>
                        {new Date(transaction.created_at).toLocaleDateString('id-ID')}
                      </p>
                      <p className="text-sm opacity-70" style={{ color: '#2C3E50' }}>
                        {new Date(transaction.created_at).toLocaleTimeString('id-ID')}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <p style={{ color: '#2C3E50' }}>{transaction.cashier_name || transaction.username}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p style={{ color: '#2C3E50' }}>{transaction.item_count} item(s)</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-bold" style={{ color: '#2C3E50' }}>
                        Rp {transaction.total_amount?.toLocaleString('id-ID')}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1" style={{ backgroundColor: '#34495E', color: '#FFFFFF' }}>
                        <CreditCardIcon className="w-3 h-3" />
                        {transaction.payment_method}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(transaction.status)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleViewDetail(transaction)}
                          className="px-3 py-1 text-xs rounded-md transition-colors duration-200 flex items-center gap-1"
                          style={{ 
                            backgroundColor: '#2C3E50',
                            color: '#FFFFFF'
                          }}
                        >
                          <EyeIcon className="w-3 h-3" />
                          Detail
                        </button>
                        {transaction.status === 'completed' && (
                          <button
                            onClick={() => handleVoidTransaction(transaction.id)}
                            className="px-3 py-1 text-xs rounded-md transition-colors duration-200 flex items-center gap-1"
                            style={{ 
                              backgroundColor: '#FF5722',
                              color: 'white'
                            }}
                          >
                            <XCircleIcon className="w-3 h-3" />
                            Batal
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="px-6 py-8 text-center">
                      <p className="text-lg" style={{ color: '#7F8C8D' }}>📭 Tidak ada transaksi ditemukan</p>
                      <p className="text-sm mt-2" style={{ color: '#95A5A6' }}>Coba ubah filter pencarian</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Transaction Detail Modal */}
        {showDetailModal && selectedTransaction && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="max-w-2xl w-full max-h-screen overflow-y-auto rounded-lg shadow-xl" style={{ backgroundColor: '#FFFFFF' }}>
              <div className="p-6">
                {/* Modal Header */}
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold flex items-center gap-2" style={{ color: '#2C3E50' }}>
                    <ShoppingBagIcon className="w-6 h-6" />
                    Detail Transaksi
                  </h2>
                  <button
                    onClick={() => setShowDetailModal(false)}
                    className="text-2xl hover:opacity-75"
                    style={{ color: '#2C3E50' }}
                  >
                    ✕
                  </button>
                </div>

                {/* Transaction Info */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <p className="text-sm opacity-70 flex items-center gap-2" style={{ color: '#2C3E50' }}>
                      <ClockIcon className="w-4 h-4" />
                      Invoice Number
                    </p>
                    <p className="font-bold" style={{ color: '#2C3E50' }}>{selectedTransaction.invoiceNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm opacity-70 flex items-center gap-2" style={{ color: '#2C3E50' }}>
                      <CalendarIcon className="w-4 h-4" />
                      Tanggal & Waktu
                    </p>
                    <p style={{ color: '#2C3E50' }}>{selectedTransaction.date} {selectedTransaction.time}</p>
                  </div>
                  <div>
                    <p className="text-sm opacity-70 flex items-center gap-2" style={{ color: '#2C3E50' }}>
                      <UserIcon className="w-4 h-4" />
                      Kasir
                    </p>
                    <p style={{ color: '#2C3E50' }}>{selectedTransaction.kasir}</p>
                  </div>
                  <div>
                    <p className="text-sm opacity-70 flex items-center gap-2" style={{ color: '#2C3E50' }}>
                      <ChartBarIcon className="w-4 h-4" />
                      Status
                    </p>
                    {getStatusBadge(selectedTransaction.status)}
                  </div>
                </div>

                {/* Items List */}
                <div className="mb-6">
                  <h3 className="font-bold mb-3 flex items-center gap-2" style={{ color: '#2C3E50' }}>
                    <ShoppingBagIcon className="w-5 h-5" />
                    Barang yang Dibeli
                  </h3>
                  <div className="space-y-2">
                    {selectedTransaction.items && selectedTransaction.items.length > 0 ? (
                      selectedTransaction.items.map((item, index) => (
                        <div key={index} className="flex justify-between items-center p-3 rounded-md" style={{ backgroundColor: '#F8F9FA' }}>
                          <div>
                            <p className="font-medium" style={{ color: '#2C3E50' }}>
                              {item.product_name || item.name || 'Produk Tidak Diketahui'}
                            </p>
                            <p className="text-sm opacity-70" style={{ color: '#2C3E50' }}>
                              {item.quantity} × Rp {((item.unit_price || item.price || 0)).toLocaleString('id-ID')}
                            </p>
                          </div>
                          <p className="font-bold" style={{ color: '#2C3E50' }}>
                            Rp {((item.total_price || item.total || (item.quantity * (item.unit_price || item.price)) || 0)).toLocaleString('id-ID')}
                          </p>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-4">
                        <p style={{ color: '#95A5A6' }}>📭 Tidak ada item</p>
                        <p className="text-xs mt-1" style={{ color: '#BDC3C7' }}>
                          {/* DEBUG INFO */}
                          {selectedTransaction && `Debug: items = ${JSON.stringify(selectedTransaction.items)}`}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Transaction Summary */}
                <div className="border-t pt-4" style={{ borderColor: '#2C3E50' }}>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span style={{ color: '#2C3E50' }}>Subtotal</span>
                      <span style={{ color: '#2C3E50' }}>
                        Rp {(selectedTransaction?.subtotal || 0).toLocaleString('id-ID')}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span style={{ color: '#2C3E50' }}>Pajak (10%)</span>
                      <span style={{ color: '#2C3E50' }}>
                        Rp {(selectedTransaction?.tax || 0).toLocaleString('id-ID')}
                      </span>
                    </div>
                    <div className="flex justify-between font-bold text-lg border-t pt-2" style={{ borderColor: '#2C3E50', color: '#2C3E50' }}>
                      <span>Total</span>
                      <span>Rp {(selectedTransaction?.total || 0).toLocaleString('id-ID')}</span>
                    </div>
                  </div>

                  {/* Payment Info */}
                  <div className="mt-4 p-3 rounded-md" style={{ backgroundColor: '#F8F9FA' }}>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm opacity-70 flex items-center gap-2" style={{ color: '#2C3E50' }}>
                          <CreditCardIcon className="w-4 h-4" />
                          Metode Pembayaran
                        </p>
                        <p className="font-medium" style={{ color: '#2C3E50' }}>
                          {selectedTransaction?.paymentMethod || '-'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm opacity-70 flex items-center gap-2" style={{ color: '#2C3E50' }}>
                          <CreditCardIcon className="w-4 h-4" />
                          Jumlah Dibayar
                        </p>
                        <p className="font-medium" style={{ color: '#2C3E50' }}>
                          Rp {(selectedTransaction?.amountPaid || 0).toLocaleString('id-ID')}
                        </p>
                      </div>
                      {(selectedTransaction?.customerChange || 0) > 0 && (
                        <div className="col-span-2">
                          <p className="text-sm opacity-70 flex items-center gap-2" style={{ color: '#2C3E50' }}>
                            <ClockIcon className="w-4 h-4" />
                            Kembalian
                          </p>
                          <p className="font-medium" style={{ color: '#2C3E50' }}>
                            Rp {(selectedTransaction?.customerChange || 0).toLocaleString('id-ID')}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Void Reason */}
                  {selectedTransaction.status === 'void' && selectedTransaction.voidReason && (
                    <div className="mt-4 p-3 rounded-md" style={{ backgroundColor: '#FFE5E5' }}>
                      <p className="text-sm opacity-70 flex items-center gap-2" style={{ color: '#2C3E50' }}>
                        <XCircleIcon className="w-4 h-4" />
                        Alasan Batal
                      </p>
                      <p className="font-medium text-red-600">{selectedTransaction.voidReason}</p>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    onClick={() => window.print()}
                    className="px-4 py-2 rounded-md font-medium transition-colors duration-200 flex items-center gap-2"
                    style={{ 
                      backgroundColor: '#2C3E50',
                      color: '#FFFFFF'
                    }}
                  >
                    <PrinterIcon className="w-4 h-4" />
                    Cetak Struk
                  </button>
                  <button
                    onClick={() => setShowDetailModal(false)}
                    className="px-4 py-2 rounded-md font-medium border-2 transition-colors duration-200"
                    style={{ 
                      backgroundColor: 'transparent',
                      color: '#2C3E50',
                      borderColor: '#2C3E50'
                    }}
                  >
                    Tutup
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default Transactions;