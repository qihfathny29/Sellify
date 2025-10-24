import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import KasirLayout from '../../components/kasir/KasirLayout';

const MyTransactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, today, week, month
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchTransactions();
  }, []);

  // Load transactions from database
  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const response = await api.get('/transactions/my-transactions');
      if (response.data.success) {
        const transactions = response.data.data.map(transaction => ({
          id: transaction.id,
          transaction_number: transaction.transaction_code,
          total: transaction.total_amount,
          payment_method: transaction.payment_method,
          amount_paid: transaction.payment_amount,
          change: transaction.change_amount,
          status: transaction.status,
          created_at: transaction.created_at,
          item_count: transaction.item_count
        }));
        setTransactions(transactions);
      }
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch full transaction detail for modal
  const fetchTransactionDetail = async (id) => {
    setDetailLoading(true);
    try {
      const response = await api.get(`/transactions/${id}`);
      if (response.data.success) {
        const data = response.data.data;
        // Hitung subtotal dari items (sum total_price)
        const subtotal = data.items.reduce((sum, item) => sum + (item.total_price || (item.quantity * item.unit_price)), 0);
        // Pajak = total - subtotal (asumsi 10%)
        const tax = data.total_amount - subtotal;
        setSelectedTransaction({
          ...data,
          subtotal,
          tax
        });
      }
    } catch (error) {
      console.error('Failed to fetch transaction detail:', error);
      alert('Gagal memuat detail transaksi!');
    } finally {
      setDetailLoading(false);
      setShowDetailModal(true);
    }
  };

  // Filter transactions
  const filteredTransactions = transactions.filter(transaction => {
    // Search filter
    if (searchTerm && !transaction.transaction_number?.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }

    // Date filter
    const transactionDate = new Date(transaction.created_at);
    const today = new Date();
    
    switch (filter) {
      case 'today':
        return transactionDate.toDateString() === today.toDateString();
      case 'week':
        const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        return transactionDate >= weekAgo;
      case 'month':
        const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
        return transactionDate >= monthAgo;
      default:
        return true;
    }
  });

  // Format tanggal & waktu - FINAL FIX: Handle ISO UTC ('T' & 'Z') langsung, tampil raw time dengan kolon
  const formatDateTime = (dateStr) => {
    if (!dateStr) return 'Tanggal tidak valid';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return 'Tanggal tidak valid';
    // Format sebagai UTC biar match raw jam dari API/DB (no +7 adjust)
    let formatted = new Intl.DateTimeFormat('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'UTC'
    }).format(date);
    // Ganti titik (.) ke kolon (:) biar konsisten
    return formatted.replace(/\./g, ':');
  };

  const formatDateTimeWithSeconds = (dateStr) => {
    if (!dateStr) return 'Tanggal tidak valid';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return 'Tanggal tidak valid';
    let formatted = new Intl.DateTimeFormat('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZone: 'UTC'
    }).format(date);
    return formatted.replace(/\./g, ':');
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  // Show transaction detail
  const showTransactionDetail = (transaction) => {
    fetchTransactionDetail(transaction.id);
  };

  // Get payment method color
  const getPaymentMethodColor = (method) => {
    switch (method?.toLowerCase()) {
      case 'cash': return 'bg-green-100 text-green-700';
      case 'qris': return 'bg-blue-100 text-blue-700';
      case 'transfer': return 'bg-purple-100 text-purple-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  // Get payment method icon
  const getPaymentMethodIcon = (method) => {
    switch (method?.toLowerCase()) {
      case 'cash': return '💵';
      case 'qris': return '📱';
      case 'transfer': return '🏦';
      default: return '💳';
    }
  };

  return (
    <KasirLayout>
      <div className="min-h-screen" style={{ backgroundColor: '#F5F5F5' }}>
        <div className="p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold" style={{ color: '#2C3E50' }}>
              🧾 Transaksi Saya
            </h1>
            <p className="text-gray-600 mt-1">Riwayat transaksi yang telah selesai</p>
          </div>
          <button
            onClick={() => navigate('/kasir/pos')}
            className="px-4 py-2 rounded-lg font-medium transition-colors"
            style={{ backgroundColor: '#2C3E50', color: '#FFFFFF' }}
          >
            ➕ Transaksi Baru
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#2C3E50' }}>
                🔍 Cari Transaksi
              </label>
              <input
                type="text"
                placeholder="Nomor transaksi..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2"
                style={{ borderColor: '#2C3E50', backgroundColor: '#F5F5F5' }}
              />
            </div>

            {/* Date Filter */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#2C3E50' }}>
                📅 Filter Periode
              </label>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2"
                style={{ borderColor: '#2C3E50', backgroundColor: '#F5F5F5' }}
              >
                <option value="all">Semua Waktu</option>
                <option value="today">Hari Ini</option>
                <option value="week">7 Hari Terakhir</option>
                <option value="month">30 Hari Terakhir</option>
              </select>
            </div>

            {/* Summary */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#2C3E50' }}>
                📊 Ringkasan
              </label>
              <div className="text-sm" style={{ color: '#2C3E50' }}>
                <div>Total Transaksi: <span className="font-bold">{filteredTransactions.length}</span></div>
                <div>Total Pendapatan: <span className="font-bold text-green-600">
                  {formatCurrency(filteredTransactions.reduce((sum, t) => sum + (t.total || 0), 0))}
                </span></div>
              </div>
            </div>
          </div>
        </div>

        {/* Transaction List */}
        {loading ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <div className="text-4xl mb-4">⏳</div>
            <div className="text-lg font-medium" style={{ color: '#2C3E50' }}>Loading transaksi...</div>
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <div className="text-6xl mb-4">📭</div>
            <div className="text-xl font-medium mb-2" style={{ color: '#2C3E50' }}>
              {searchTerm || filter !== 'all' ? 'Tidak ada transaksi yang sesuai filter' : 'Belum ada transaksi'}
            </div>
            <p className="text-gray-600 mb-4">
              {searchTerm || filter !== 'all' 
                ? 'Coba ubah filter atau kata kunci pencarian' 
                : 'Mulai transaksi pertama Anda di POS System'
              }
            </p>
            <button
              onClick={() => navigate('/kasir/pos')}
              className="px-6 py-2 rounded-lg font-medium"
              style={{ backgroundColor: '#2C3E50', color: '#2C3E50' }}
            >
              🚀 Mulai Transaksi
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead style={{ backgroundColor: '#FFFFFF' }}>
                  <tr>
                    <th className="px-4 py-3 text-left font-medium" style={{ color: '#2C3E50' }}>No. Transaksi</th>
                    <th className="px-4 py-3 text-left font-medium" style={{ color: '#2C3E50' }}>Tanggal & Waktu</th>
                    <th className="px-4 py-3 text-left font-medium" style={{ color: '#2C3E50' }}>Total</th>
                    <th className="px-4 py-3 text-left font-medium" style={{ color: '#2C3E50' }}>Metode Bayar</th>
                    <th className="px-4 py-3 text-left font-medium" style={{ color: '#2C3E50' }}>Status</th>
                    <th className="px-4 py-3 text-center font-medium" style={{ color: '#2C3E50' }}>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTransactions.map((transaction, index) => (
                    <tr key={transaction.id || index} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="font-medium" style={{ color: '#2C3E50' }}>
                          {transaction.transaction_number || `TRX-${transaction.id || index + 1}`}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm" style={{ color: '#2C3E50' }}>
                          {formatDateTime(transaction.created_at)}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-bold text-green-600">
                          {formatCurrency(transaction.total || 0)}
                        </div>
                        <div className="text-xs text-gray-500">
                          {transaction.item_count || 0} item(s)
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${getPaymentMethodColor(transaction.payment_method)}`}>
                          {getPaymentMethodIcon(transaction.payment_method)} {transaction.payment_method || 'Cash'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-green-100 text-green-700 text-xs font-medium">
                          ✅ Selesai
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => showTransactionDetail(transaction)}
                          className="px-3 py-1 text-xs rounded-md font-medium transition-colors"
                          style={{ backgroundColor: '#2C3E50', color: '#FFFFFF' }}
                        >
                          👁️ Detail
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden">
              {filteredTransactions.map((transaction, index) => (
                <div key={transaction.id || index} className="p-4 border-b">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="font-medium" style={{ color: '#2C3E50' }}>
                        {transaction.transaction_number || `TRX-${transaction.id || index + 1}`}
                      </div>
                      <div className="text-sm text-gray-500">
                        {formatDateTime(transaction.created_at)}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-green-600">
                        {formatCurrency(transaction.total || 0)}
                      </div>
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${getPaymentMethodColor(transaction.payment_method)}`}>
                        {getPaymentMethodIcon(transaction.payment_method)} {transaction.payment_method || 'Cash'}
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-green-100 text-green-700 text-xs font-medium">
                      ✅ Selesai
                    </span>
                    <button
                      onClick={() => showTransactionDetail(transaction)}
                      className="px-3 py-1 text-xs rounded-md font-medium"
                      style={{ backgroundColor: '#2C3E50', color: '#2C3E50' }}
                    >
                      👁️ Detail
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Transaction Detail Modal */}
        {showDetailModal && selectedTransaction && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="p-4 border-b flex justify-between items-center">
                <h3 className="text-lg font-bold" style={{ color: '#2C3E50' }}>📄 Detail Transaksi</h3>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="text-gray-500 hover:text-gray-700 text-xl"
                >
                  ✕
                </button>
              </div>
              
              <div className="p-4">
                {detailLoading ? (
                  <div className="text-center py-8">
                    <div className="text-2xl mb-2">⏳</div>
                    <p style={{ color: '#2C3E50' }}>Memuat detail...</p>
                  </div>
                ) : (
                  <>
                    {/* Transaction Info */}
                    <div className="mb-4">
                      <div className="text-sm text-gray-600">Nomor Transaksi</div>
                      <div className="font-medium" style={{ color: '#2C3E50' }}>
                        {selectedTransaction.transaction_code || `TRX-${selectedTransaction.id}`}
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <div className="text-sm text-gray-600">Tanggal & Waktu</div>
                      <div className="font-medium" style={{ color: '#2C3E50' }}>
                        {formatDateTimeWithSeconds(selectedTransaction.created_at)}
                      </div>
                    </div>

                    {/* Items */}
                    <div className="mb-4">
                      <div className="text-sm text-gray-600 mb-2">Item Dibeli</div>
                      <div className="space-y-2">
                        {selectedTransaction.items?.length > 0 ? (
                          selectedTransaction.items.map((item, idx) => (
                            <div key={idx} className="flex justify-between text-sm">
                              <div>
                                <div className="font-medium">{item.product_name || item.name}</div>
                                <div className="text-gray-500">{item.quantity} x {formatCurrency(item.unit_price || item.price)}</div>
                              </div>
                              <div className="font-medium">
                                {formatCurrency(item.total_price || (item.quantity * (item.unit_price || item.price)))}
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-gray-500 text-sm">Tidak ada detail item</div>
                        )}
                      </div>
                    </div>

                    {/* Payment Summary */}
                    <div className="border-t pt-4">
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Subtotal</span>
                          <span>{formatCurrency(selectedTransaction.subtotal || 0)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Pajak</span>
                          <span>{formatCurrency(selectedTransaction.tax || 0)}</span>
                        </div>
                        <div className="flex justify-between font-bold text-lg border-t pt-2">
                          <span>Total</span>
                          <span className="text-green-600">{formatCurrency(selectedTransaction.total_amount || selectedTransaction.total || 0)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Metode Pembayaran</span>
                          <span className={`px-2 py-1 rounded text-xs ${getPaymentMethodColor(selectedTransaction.payment_method)}`}>
                            {getPaymentMethodIcon(selectedTransaction.payment_method)} {selectedTransaction.payment_method || 'Cash'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Dibayar</span>
                          <span>{formatCurrency(selectedTransaction.payment_amount || selectedTransaction.amount_paid || 0)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Kembalian</span>
                          <span>{formatCurrency(selectedTransaction.change_amount || selectedTransaction.change || 0)}</span>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>

              <div className="p-4 border-t bg-gray-50">
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="w-full py-2 px-4 rounded-lg font-medium bg-gray-200 text-gray-700"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
    </KasirLayout>
  );
};

export default MyTransactions;
