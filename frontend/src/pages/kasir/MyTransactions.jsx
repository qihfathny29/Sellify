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
  const navigate = useNavigate();

  useEffect(() => {
    fetchTransactions();
  }, []);

  // Load saved transactions from localStorage (temporary solution)
  const fetchTransactions = async () => {
    setLoading(true);
    try {
      // Coba ambil dari API dulu
      const response = await api.get('/transactions/my');
      if (response.data?.success && response.data.data?.length > 0) {
        setTransactions(response.data.data);
      } else {
        // Fallback ke localStorage jika API belum ada
        const savedTransactions = JSON.parse(localStorage.getItem('transactions') || '[]');
        setTransactions(savedTransactions);
      }
    } catch (error) {
      console.log('API not available, using localStorage');
      // Fallback ke localStorage
      const savedTransactions = JSON.parse(localStorage.getItem('transactions') || '[]');
      setTransactions(savedTransactions);
    } finally {
      setLoading(false);
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
    setSelectedTransaction(transaction);
    setShowDetailModal(true);
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
      <div className="min-h-screen" style={{ backgroundColor: '#FFFCF2' }}>
        <div className="p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold" style={{ color: '#3E3E3E' }}>
              🧾 Transaksi Saya
            </h1>
            <p className="text-gray-600 mt-1">Riwayat transaksi yang telah selesai</p>
          </div>
          <button
            onClick={() => navigate('/kasir/pos')}
            className="px-4 py-2 rounded-lg font-medium transition-colors"
            style={{ backgroundColor: '#E9C46A', color: '#3E3E3E' }}
          >
            ➕ Transaksi Baru
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#3E3E3E' }}>
                🔍 Cari Transaksi
              </label>
              <input
                type="text"
                placeholder="Nomor transaksi..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2"
                style={{ borderColor: '#E9C46A', backgroundColor: '#FFFCF2' }}
              />
            </div>

            {/* Date Filter */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#3E3E3E' }}>
                📅 Filter Periode
              </label>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2"
                style={{ borderColor: '#E9C46A', backgroundColor: '#FFFCF2' }}
              >
                <option value="all">Semua Waktu</option>
                <option value="today">Hari Ini</option>
                <option value="week">7 Hari Terakhir</option>
                <option value="month">30 Hari Terakhir</option>
              </select>
            </div>

            {/* Summary */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#3E3E3E' }}>
                📊 Ringkasan
              </label>
              <div className="text-sm" style={{ color: '#3E3E3E' }}>
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
            <div className="text-lg font-medium" style={{ color: '#3E3E3E' }}>Loading transaksi...</div>
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <div className="text-6xl mb-4">📭</div>
            <div className="text-xl font-medium mb-2" style={{ color: '#3E3E3E' }}>
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
              style={{ backgroundColor: '#E9C46A', color: '#3E3E3E' }}
            >
              🚀 Mulai Transaksi
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead style={{ backgroundColor: '#F7E9A0' }}>
                  <tr>
                    <th className="px-4 py-3 text-left font-medium" style={{ color: '#3E3E3E' }}>No. Transaksi</th>
                    <th className="px-4 py-3 text-left font-medium" style={{ color: '#3E3E3E' }}>Tanggal & Waktu</th>
                    <th className="px-4 py-3 text-left font-medium" style={{ color: '#3E3E3E' }}>Total</th>
                    <th className="px-4 py-3 text-left font-medium" style={{ color: '#3E3E3E' }}>Metode Bayar</th>
                    <th className="px-4 py-3 text-left font-medium" style={{ color: '#3E3E3E' }}>Status</th>
                    <th className="px-4 py-3 text-center font-medium" style={{ color: '#3E3E3E' }}>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTransactions.map((transaction, index) => (
                    <tr key={transaction.id || index} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="font-medium" style={{ color: '#3E3E3E' }}>
                          {transaction.transaction_number || `TRX-${transaction.id || index + 1}`}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm" style={{ color: '#3E3E3E' }}>
                          {(() => {
                            const date = new Date(transaction.created_at);
                            if (isNaN(date.getTime())) {
                              return 'Tanggal tidak valid';
                            }
                            return date.toLocaleString('id-ID', {
                              day: '2-digit',
                              month: '2-digit', 
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            });
                          })()}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-bold text-green-600">
                          {formatCurrency(transaction.total || 0)}
                        </div>
                        <div className="text-xs text-gray-500">
                          {transaction.items?.length || 0} item(s)
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
                          style={{ backgroundColor: '#E9C46A', color: '#3E3E3E' }}
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
                      <div className="font-medium" style={{ color: '#3E3E3E' }}>
                        {transaction.transaction_number || `TRX-${transaction.id || index + 1}`}
                      </div>
                      <div className="text-sm text-gray-500">
                        {(() => {
                          const date = new Date(transaction.created_at);
                          return isNaN(date.getTime()) ? 'Tanggal tidak valid' : date.toLocaleString('id-ID');
                        })()}
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
                      style={{ backgroundColor: '#E9C46A', color: '#3E3E3E' }}
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
                <h3 className="text-lg font-bold" style={{ color: '#3E3E3E' }}>📄 Detail Transaksi</h3>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="text-gray-500 hover:text-gray-700 text-xl"
                >
                  ✕
                </button>
              </div>
              
              <div className="p-4">
                {/* Transaction Info */}
                <div className="mb-4">
                  <div className="text-sm text-gray-600">Nomor Transaksi</div>
                  <div className="font-medium" style={{ color: '#3E3E3E' }}>
                    {selectedTransaction.transaction_number || `TRX-${selectedTransaction.id}`}
                  </div>
                </div>
                
                <div className="mb-4">
                  <div className="text-sm text-gray-600">Tanggal & Waktu</div>
                  <div className="font-medium" style={{ color: '#3E3E3E' }}>
                    {(() => {
                      const date = new Date(selectedTransaction.created_at);
                      return isNaN(date.getTime()) ? 'Tanggal tidak valid' : date.toLocaleString('id-ID');
                    })()}
                  </div>
                </div>

                {/* Items */}
                <div className="mb-4">
                  <div className="text-sm text-gray-600 mb-2">Item Dibeli</div>
                  <div className="space-y-2">
                    {selectedTransaction.items?.map((item, idx) => (
                      <div key={idx} className="flex justify-between text-sm">
                        <div>
                          <div className="font-medium">{item.name}</div>
                          <div className="text-gray-500">{item.quantity} x {formatCurrency(item.price)}</div>
                        </div>
                        <div className="font-medium">
                          {formatCurrency(item.quantity * item.price)}
                        </div>
                      </div>
                    )) || (
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
                      <span className="text-green-600">{formatCurrency(selectedTransaction.total || 0)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Metode Pembayaran</span>
                      <span className={`px-2 py-1 rounded text-xs ${getPaymentMethodColor(selectedTransaction.payment_method)}`}>
                        {getPaymentMethodIcon(selectedTransaction.payment_method)} {selectedTransaction.payment_method || 'Cash'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Dibayar</span>
                      <span>{formatCurrency(selectedTransaction.amount_paid || 0)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Kembalian</span>
                      <span>{formatCurrency(selectedTransaction.change || 0)}</span>
                    </div>
                  </div>
                </div>
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