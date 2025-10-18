import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import api from '../../api/axios';

const Transactions = () => {
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('today');
  const [statusFilter, setStatusFilter] = useState('all');
  const [kasirFilter, setKasirFilter] = useState('all'); // NEW!
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Mock data for development
  const mockTransactions = [
    {
      id: 1,
      invoiceNumber: 'INV-2025-001',
      date: '2025-10-18',
      time: '14:30:25',
      kasir: 'Siti Nurjana',
      items: [
        { name: 'Chitato Keju', quantity: 2, price: 15000, total: 30000 },
        { name: 'Aqua 600ml', quantity: 3, price: 5000, total: 15000 }
      ],
      subtotal: 45000,
      tax: 4500,
      total: 49500,
      paymentMethod: 'Cash',
      status: 'completed',
      customerChange: 500,
      amountPaid: 50000
    },
    {
      id: 2,
      invoiceNumber: 'INV-2025-002',
      date: '2025-10-18',
      time: '15:45:12',
      kasir: 'Budi Santoso',
      items: [
        { name: 'Indomie Goreng', quantity: 5, price: 3500, total: 17500 },
        { name: 'Teh Botol', quantity: 2, price: 4000, total: 8000 },
        { name: 'Oreo', quantity: 1, price: 12000, total: 12000 }
      ],
      subtotal: 37500,
      tax: 3750,
      total: 41250,
      paymentMethod: 'QRIS',
      status: 'completed',
      customerChange: 0,
      amountPaid: 41250
    },
    {
      id: 3,
      invoiceNumber: 'INV-2025-003',
      date: '2025-10-18',
      time: '16:20:08',
      kasir: 'Maya Sari',
      items: [
        { name: 'Beng-beng', quantity: 10, price: 2500, total: 25000 }
      ],
      subtotal: 25000,
      tax: 2500,
      total: 27500,
      paymentMethod: 'Cash',
      status: 'void',
      customerChange: 0,
      amountPaid: 0,
      voidReason: 'Customer cancelled order'
    },
    {
      id: 4,
      invoiceNumber: 'INV-2025-004',
      date: '2025-10-17',
      time: '10:15:30',
      kasir: 'Siti Nurjana',
      items: [
        { name: 'Mie Sedaap', quantity: 3, price: 3000, total: 9000 },
        { name: 'Coca Cola', quantity: 2, price: 6000, total: 12000 }
      ],
      subtotal: 21000,
      tax: 2100,
      total: 23100,
      paymentMethod: 'Bank Transfer',
      status: 'completed',
      customerChange: 0,
      amountPaid: 23100
    },
    {
      id: 5,
      invoiceNumber: 'INV-2025-005',
      date: '2025-10-18',
      time: '17:30:45',
      kasir: 'Budi Santoso',
      items: [
        { name: 'Kopiko', quantity: 8, price: 1500, total: 12000 },
        { name: 'Sprite', quantity: 1, price: 7000, total: 7000 }
      ],
      subtotal: 19000,
      tax: 1900,
      total: 20900,
      paymentMethod: 'Cash',
      status: 'completed',
      customerChange: 100,
      amountPaid: 21000
    }
  ];

  // Fetch transactions data
  const fetchTransactions = async () => {
    setLoading(true);
    try {
      // TODO: Replace with real API call
      await new Promise(resolve => setTimeout(resolve, 1000)); // Mock delay
      setTransactions(mockTransactions);
      setFilteredTransactions(mockTransactions);
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
      setTransactions(mockTransactions);
      setFilteredTransactions(mockTransactions);
    } finally {
      setLoading(false);
    }
  };

  // Filter transactions - UPDATED!
  useEffect(() => {
    let filtered = transactions;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(transaction => 
        transaction.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.kasir.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Date filter
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0];
    const monthAgo = new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0];

    if (dateFilter === 'today') {
      filtered = filtered.filter(transaction => transaction.date === today);
    } else if (dateFilter === 'yesterday') {
      filtered = filtered.filter(transaction => transaction.date === yesterday);
    } else if (dateFilter === 'week') {
      filtered = filtered.filter(transaction => transaction.date >= weekAgo);
    } else if (dateFilter === 'month') {
      filtered = filtered.filter(transaction => transaction.date >= monthAgo);
    }

    // Kasir filter - NEW!
    if (kasirFilter !== 'all') {
      filtered = filtered.filter(transaction => transaction.kasir === kasirFilter);
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(transaction => transaction.status === statusFilter);
    }

    setFilteredTransactions(filtered);
  }, [transactions, searchTerm, dateFilter, kasirFilter, statusFilter]);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const getStatusBadge = (status) => {
    const styles = {
      completed: { bg: '#4CAF50', text: 'white' },
      void: { bg: '#FF5722', text: 'white' },
      refunded: { bg: '#FF9800', text: 'white' }
    };

    const style = styles[status] || styles.completed;

    return (
      <span 
        className="px-2 py-1 rounded-full text-xs font-medium"
        style={{ backgroundColor: style.bg, color: style.text }}
      >
        {status === 'completed' && '✅ Selesai'}
        {status === 'void' && '❌ Batal'}
        {status === 'refunded' && '↩️ Refund'}
      </span>
    );
  };

  const handleViewDetail = (transaction) => {
    setSelectedTransaction(transaction);
    setShowDetailModal(true);
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
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: '#E9C46A' }}></div>
            <p style={{ color: '#3E3E3E' }}>Loading transaksi...</p>
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
          <h1 className="text-3xl font-bold" style={{ color: '#3E3E3E' }}>💰 Semua Transaksi</h1>
          <p className="opacity-70 mt-1" style={{ color: '#3E3E3E' }}>
            Monitor dan kelola semua transaksi toko
          </p>
        </div>

        {/* Filters - UPDATED! */}
        <div className="rounded-lg shadow-lg p-6" style={{ backgroundColor: '#F7E9A0' }}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#3E3E3E' }}>
                🔍 Cari
              </label>
              <input
                type="text"
                placeholder="Invoice atau kasir..."
                className="w-full px-3 py-2 border-2 rounded-md focus:outline-none"
                style={{ 
                  borderColor: '#E9C46A',
                  backgroundColor: '#FFFCF2',
                  color: '#3E3E3E'
                }}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Date Filter */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#3E3E3E' }}>
                📅 Tanggal
              </label>
              <select
                className="w-full px-3 py-2 border-2 rounded-md focus:outline-none"
                style={{ 
                  borderColor: '#E9C46A',
                  backgroundColor: '#FFFCF2',
                  color: '#3E3E3E'
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
              <label className="block text-sm font-medium mb-2" style={{ color: '#3E3E3E' }}>
                👤 Kasir
              </label>
              <select
                className="w-full px-3 py-2 border-2 rounded-md focus:outline-none"
                style={{ 
                  borderColor: '#E9C46A',
                  backgroundColor: '#FFFCF2',
                  color: '#3E3E3E'
                }}
                value={kasirFilter}
                onChange={(e) => setKasirFilter(e.target.value)}
              >
                <option value="all">👥 Semua Kasir</option>
                <option value="Siti Nurjana">👩 Siti Nurjana</option>
                <option value="Budi Santoso">👨 Budi Santoso</option>
                <option value="Maya Sari">👩 Maya Sari</option>
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#3E3E3E' }}>
                📊 Status
              </label>
              <select
                className="w-full px-3 py-2 border-2 rounded-md focus:outline-none"
                style={{ 
                  borderColor: '#E9C46A',
                  backgroundColor: '#FFFCF2',
                  color: '#3E3E3E'
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
              <label className="block text-sm font-medium mb-2" style={{ color: '#3E3E3E' }}>
                ⚡ Quick Filter
              </label>
              <div className="flex space-x-2">
                <button
                  onClick={() => {
                    setDateFilter('today');
                    setStatusFilter('completed');
                  }}
                  className="flex-1 px-2 py-2 text-xs rounded-md transition-colors duration-200"
                  style={{ 
                    backgroundColor: '#E9C46A',
                    color: '#3E3E3E'
                  }}
                >
                  📈 Hari Ini
                </button>
                <button
                  onClick={() => {
                    setDateFilter('all');
                    setStatusFilter('all');
                    setKasirFilter('all');
                    setSearchTerm('');
                  }}
                  className="flex-1 px-2 py-2 text-xs rounded-md border-2 transition-colors duration-200"
                  style={{ 
                    backgroundColor: 'transparent',
                    color: '#3E3E3E',
                    borderColor: '#E9C46A'
                  }}
                >
                  🔄 Reset
                </button>
              </div>
            </div>
          </div>

          {/* Enhanced Summary Stats - UPDATED! */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-6 pt-6 border-t" style={{ borderColor: '#E9C46A' }}>
            <div className="text-center">
              <p className="text-2xl font-bold" style={{ color: '#3E3E3E' }}>
                {filteredTransactions.length}
              </p>
              <p className="text-sm opacity-70" style={{ color: '#3E3E3E' }}>Total Transaksi</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">
                Rp {filteredTransactions
                  .filter(t => t.status === 'completed')
                  .reduce((sum, t) => sum + t.total, 0)
                  .toLocaleString()}
              </p>
              <p className="text-sm opacity-70" style={{ color: '#3E3E3E' }}>Total Revenue</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">
                {filteredTransactions.filter(t => t.status === 'completed').length}
              </p>
              <p className="text-sm opacity-70" style={{ color: '#3E3E3E' }}>Selesai</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600">
                {filteredTransactions.filter(t => t.status === 'void').length}
              </p>
              <p className="text-sm opacity-70" style={{ color: '#3E3E3E' }}>Batal</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold" style={{ color: '#3E3E3E' }}>
                {kasirFilter === 'all' ? '👥 Semua' : `👤 ${kasirFilter.split(' ')[0]}`}
              </p>
              <p className="text-sm opacity-70" style={{ color: '#3E3E3E' }}>Kasir Dipilih</p>
            </div>
          </div>
        </div>

        {/* Transactions Table - Rest remains the same... */}
        <div className="rounded-lg shadow-lg overflow-hidden" style={{ backgroundColor: '#F7E9A0' }}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead style={{ backgroundColor: '#E9C46A' }}>
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-medium" style={{ color: '#3E3E3E' }}>
                    Invoice
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium" style={{ color: '#3E3E3E' }}>
                    Tanggal & Waktu
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium" style={{ color: '#3E3E3E' }}>
                    Kasir
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium" style={{ color: '#3E3E3E' }}>
                    Items
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium" style={{ color: '#3E3E3E' }}>
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium" style={{ color: '#3E3E3E' }}>
                    Payment
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium" style={{ color: '#3E3E3E' }}>
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium" style={{ color: '#3E3E3E' }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map((transaction, index) => (
                  <tr key={transaction.id} className={index % 2 === 0 ? '' : 'bg-opacity-50'} style={{ backgroundColor: index % 2 === 0 ? 'transparent' : '#FFFCF2' }}>
                    <td className="px-6 py-4">
                      <p className="font-medium" style={{ color: '#3E3E3E' }}>
                        {transaction.invoiceNumber}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <p style={{ color: '#3E3E3E' }}>{transaction.date}</p>
                      <p className="text-sm opacity-70" style={{ color: '#3E3E3E' }}>
                        {transaction.time}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <p style={{ color: '#3E3E3E' }}>{transaction.kasir}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p style={{ color: '#3E3E3E' }}>{transaction.items.length} items</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-bold" style={{ color: '#3E3E3E' }}>
                        Rp {transaction.total.toLocaleString()}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: '#E9C46A', color: '#3E3E3E' }}>
                        {transaction.paymentMethod}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(transaction.status)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleViewDetail(transaction)}
                          className="px-3 py-1 text-xs rounded-md transition-colors duration-200"
                          style={{ 
                            backgroundColor: '#E9C46A',
                            color: '#3E3E3E'
                          }}
                        >
                          👁️ Detail
                        </button>
                        {transaction.status === 'completed' && (
                          <button
                            onClick={() => handleVoidTransaction(transaction.id)}
                            className="px-3 py-1 text-xs rounded-md transition-colors duration-200"
                            style={{ 
                              backgroundColor: '#FF5722',
                              color: 'white'
                            }}
                          >
                            ❌ Batal
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredTransactions.length === 0 && (
            <div className="text-center py-8">
              <p className="text-xl" style={{ color: '#3E3E3E' }}>📭</p>
              <p style={{ color: '#3E3E3E' }}>Tidak ada transaksi ditemukan</p>
              <p className="text-sm opacity-70" style={{ color: '#3E3E3E' }}>
                Coba ubah filter pencarian
              </p>
            </div>
          )}
        </div>

        {/* Transaction Detail Modal - Keep existing modal code... */}
        {showDetailModal && selectedTransaction && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="max-w-2xl w-full max-h-screen overflow-y-auto rounded-lg shadow-xl" style={{ backgroundColor: '#F7E9A0' }}>
              <div className="p-6">
                {/* Modal Header */}
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold" style={{ color: '#3E3E3E' }}>
                    🧾 Detail Transaksi
                  </h2>
                  <button
                    onClick={() => setShowDetailModal(false)}
                    className="text-2xl hover:opacity-75"
                    style={{ color: '#3E3E3E' }}
                  >
                    ✕
                  </button>
                </div>

                {/* Transaction Info */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <p className="text-sm opacity-70" style={{ color: '#3E3E3E' }}>Invoice Number</p>
                    <p className="font-bold" style={{ color: '#3E3E3E' }}>{selectedTransaction.invoiceNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm opacity-70" style={{ color: '#3E3E3E' }}>Tanggal & Waktu</p>
                    <p style={{ color: '#3E3E3E' }}>{selectedTransaction.date} {selectedTransaction.time}</p>
                  </div>
                  <div>
                    <p className="text-sm opacity-70" style={{ color: '#3E3E3E' }}>Kasir</p>
                    <p style={{ color: '#3E3E3E' }}>{selectedTransaction.kasir}</p>
                  </div>
                  <div>
                    <p className="text-sm opacity-70" style={{ color: '#3E3E3E' }}>Status</p>
                    {getStatusBadge(selectedTransaction.status)}
                  </div>
                </div>

                {/* Items List */}
                <div className="mb-6">
                  <h3 className="font-bold mb-3" style={{ color: '#3E3E3E' }}>Barang yang Dibeli</h3>
                  <div className="space-y-2">
                    {selectedTransaction.items.map((item, index) => (
                      <div key={index} className="flex justify-between items-center p-3 rounded-md" style={{ backgroundColor: '#FFFCF2' }}>
                        <div>
                          <p className="font-medium" style={{ color: '#3E3E3E' }}>{item.name}</p>
                          <p className="text-sm opacity-70" style={{ color: '#3E3E3E' }}>
                            {item.quantity} × Rp {item.price.toLocaleString()}
                          </p>
                        </div>
                        <p className="font-bold" style={{ color: '#3E3E3E' }}>
                          Rp {item.total.toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Transaction Summary */}
                <div className="border-t pt-4" style={{ borderColor: '#E9C46A' }}>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span style={{ color: '#3E3E3E' }}>Subtotal</span>
                      <span style={{ color: '#3E3E3E' }}>Rp {selectedTransaction.subtotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span style={{ color: '#3E3E3E' }}>Pajak (10%)</span>
                      <span style={{ color: '#3E3E3E' }}>Rp {selectedTransaction.tax.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg border-t pt-2" style={{ borderColor: '#E9C46A', color: '#3E3E3E' }}>
                      <span>Total</span>
                      <span>Rp {selectedTransaction.total.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Payment Info */}
                  <div className="mt-4 p-3 rounded-md" style={{ backgroundColor: '#FFFCF2' }}>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm opacity-70" style={{ color: '#3E3E3E' }}>Metode Pembayaran</p>
                        <p className="font-medium" style={{ color: '#3E3E3E' }}>{selectedTransaction.paymentMethod}</p>
                      </div>
                      <div>
                        <p className="text-sm opacity-70" style={{ color: '#3E3E3E' }}>Jumlah Dibayar</p>
                        <p className="font-medium" style={{ color: '#3E3E3E' }}>Rp {selectedTransaction.amountPaid.toLocaleString()}</p>
                      </div>
                      {selectedTransaction.customerChange > 0 && (
                        <div className="col-span-2">
                          <p className="text-sm opacity-70" style={{ color: '#3E3E3E' }}>Kembalian</p>
                          <p className="font-medium" style={{ color: '#3E3E3E' }}>Rp {selectedTransaction.customerChange.toLocaleString()}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Void Reason */}
                  {selectedTransaction.status === 'void' && selectedTransaction.voidReason && (
                    <div className="mt-4 p-3 rounded-md" style={{ backgroundColor: '#FFE5E5' }}>
                      <p className="text-sm opacity-70" style={{ color: '#3E3E3E' }}>Alasan Batal</p>
                      <p className="font-medium text-red-600">{selectedTransaction.voidReason}</p>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    onClick={() => window.print()}
                    className="px-4 py-2 rounded-md font-medium transition-colors duration-200"
                    style={{ 
                      backgroundColor: '#E9C46A',
                      color: '#3E3E3E'
                    }}
                  >
                    🖨️ Cetak Struk
                  </button>
                  <button
                    onClick={() => setShowDetailModal(false)}
                    className="px-4 py-2 rounded-md font-medium border-2 transition-colors duration-200"
                    style={{ 
                      backgroundColor: 'transparent',
                      color: '#3E3E3E',
                      borderColor: '#E9C46A'
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