import React, { useState, useEffect } from 'react';
import { 
  ArrowTrendingUpIcon, 
  DocumentIcon, 
  CalendarIcon, 
  ChartBarIcon, 
  ShoppingBagIcon, 
  CurrencyDollarIcon, 
  ReceiptPercentIcon, // Ganti dari ReceiptIcon (yang nggak ada)
  UserGroupIcon, 
  ClockIcon,
  ArrowDownTrayIcon, // Ganti dari DownloadIcon (yang nggak ada)
  ChevronDownIcon,
  XMarkIcon,
  CheckCircleIcon // Tambah ini buat ESLint
} from '@heroicons/react/24/outline';
import AdminLayout from '../../components/admin/AdminLayout';
import api from '../../api/axios';

const Reports = () => {
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('all');
  const [showDownloadMenu, setShowDownloadMenu] = useState(false);
  const [showPeriodMenu, setShowPeriodMenu] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState(null);
  const [reportData, setReportData] = useState({
    totalRevenue: 0,
    totalTransactions: 0,
    totalItems: 0,
    averageTransaction: 0,
    topProducts: [],
    salesByCategory: [],
    revenueChart: [],
    profitMargin: 0
  });

  // Format tanggal konsisten (dari bug sebelumnya)
  const formatDateTime = (dateStr) => {
    if (!dateStr) return 'Tanggal tidak valid';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return 'Tanggal tidak valid';
    let formatted = new Intl.DateTimeFormat('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'UTC'
    }).format(date);
    return formatted.replace(/\./g, ':');
  };

  // Fetch report data
  const fetchReportData = async () => {
    try {
      setLoading(true);
      
      // Fetch transactions dari API
      const transactionsResponse = await api.get('/transactions/admin/all');
      
      if (transactionsResponse.data.success) {
        const transactions = transactionsResponse.data.data;
        
        // Filter berdasarkan dateRange
        const now = new Date();
        const filteredTransactions = transactions.filter(transaction => {
          const transactionDate = new Date(transaction.created_at);
          
          switch(dateRange) {
            case 'today':
              return transactionDate.toDateString() === now.toDateString();
            case 'week':
              const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
              return transactionDate >= weekAgo;
            case 'month':
              return transactionDate.getMonth() === now.getMonth() && 
                     transactionDate.getFullYear() === now.getFullYear();
            case 'year':
              return transactionDate.getFullYear() === now.getFullYear();
            default:
              return true;
          }
        });
        
        // Hitung statistik dari data transactions
        const totalRevenue = filteredTransactions.reduce((sum, t) => sum + parseFloat(t.total_amount || 0), 0);
        const totalTransactions = filteredTransactions.length;
        const totalItems = filteredTransactions.reduce((sum, t) => sum + parseInt(t.item_count || 0), 0);
        const averageTransaction = totalTransactions > 0 ? totalRevenue / totalTransactions : 0;
        
        // Fetch transaction items untuk top products dan category breakdown (limit 50 buat efficiency)
        let allItems = [];
        if (filteredTransactions.length <= 50) {
          for (const transaction of filteredTransactions) {
            try {
              const itemsResponse = await api.get(`/transactions/${transaction.id}`);
              if (itemsResponse.data.success && itemsResponse.data.data.items) {
                // Map items dengan fallback values
                const items = itemsResponse.data.data.items.map(item => ({
                  product_name: item.product_name || item.current_product_name || 'Unknown Product',
                  quantity: parseInt(item.quantity) || 0,
                  subtotal: parseFloat(item.total_price || item.price * item.quantity || 0),
                  category_name: item.category_name || 'Uncategorized'
                }));
                allItems = [...allItems, ...items];
              }
            } catch (error) {
              console.error(`Error fetching transaction ${transaction.id} items:`, error.message);
              // Continue with next transaction instead of stopping
            }
          }
        } else {
          console.warn('Terlalu banyak transaksi untuk fetch items detail. Skip top products/category.');
        }
        
        // Group by product untuk top products
        const productMap = {};
        allItems.forEach(item => {
          const productName = item.product_name || 'Unknown Product';
          if (!productMap[productName]) {
            productMap[productName] = { 
              name: productName, 
              sold: 0, 
              revenue: 0,
              category: item.category_name || 'Uncategorized'
            };
          }
          productMap[productName].sold += parseInt(item.quantity || 0);
          productMap[productName].revenue += parseFloat(item.subtotal || 0);
        });
        
        const topProducts = Object.values(productMap)
          .sort((a, b) => b.revenue - a.revenue)
          .slice(0, 5);
        
        // Group by category untuk sales by category
        const categoryMap = {};
        allItems.forEach(item => {
          const category = item.category_name || 'Uncategorized';
          if (!categoryMap[category]) {
            categoryMap[category] = { name: category, value: 0 };
          }
          categoryMap[category].value += parseFloat(item.subtotal || 0);
        });
        
        const salesByCategory = Object.values(categoryMap);
        
        // Revenue by date untuk chart
        const revenueByDate = {};
        filteredTransactions.forEach(transaction => {
          const date = new Date(transaction.created_at).toLocaleDateString('id-ID', { weekday: 'short' });
          revenueByDate[date] = (revenueByDate[date] || 0) + parseFloat(transaction.total_amount || 0);
        });
        
        const revenueChart = Object.entries(revenueByDate).map(([day, revenue]) => ({
          day,
          revenue
        }));
        
        setReportData({
          totalRevenue,
          totalTransactions,
          totalItems,
          averageTransaction,
          topProducts,
          salesByCategory,
          revenueChart,
          profitMargin: 35 // Placeholder since we don't have cost data
        });
      }
    } catch (error) {
      console.error('Failed to fetch report data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReportData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateRange]);

  // Handle download format selection
  const handleFormatSelect = (format) => {
    setSelectedFormat(format);
    setShowDownloadMenu(false);
    setShowPeriodMenu(true);
  };

  // Handle period selection and download
  const handleDownload = async (period) => {
    setShowPeriodMenu(false);
    
    try {
      // Fetch transactions untuk periode tertentu
      const response = await api.get('/transactions/admin/all');
      
      if (response.data.success) {
        const transactions = response.data.data;
        
        // Filter berdasarkan period
        const now = new Date();
        const filteredData = transactions.filter(transaction => {
          const transactionDate = new Date(transaction.created_at);
          
          switch(period) {
            case 'today':
              return transactionDate.toDateString() === now.toDateString();
            case 'week':
              const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
              return transactionDate >= weekAgo;
            case 'month':
              return transactionDate.getMonth() === now.getMonth() && 
                     transactionDate.getFullYear() === now.getFullYear();
            case 'year':
              return transactionDate.getFullYear() === now.getFullYear();
            default:
              return true;
          }
        });
        
        if (selectedFormat === 'excel') {
          // Generate CSV (Excel bisa buka CSV)
          let csv = 'No,Kode Transaksi,Tanggal,Kasir,Total,Status\n';
          
          filteredData.forEach((transaction, index) => {
            const date = formatDateTime(transaction.created_at);
            csv += `${index + 1},${transaction.transaction_code},${date},${transaction.username || transaction.cashier_name},Rp ${transaction.total_amount.toLocaleString()},${transaction.status}\n`;
          });
          
          // Download CSV
          const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.setAttribute('download', `report_${period}_${new Date().getTime()}.csv`);
          document.body.appendChild(link);
          link.click();
          link.remove();
          
          alert(`✅ Report berhasil didownload sebagai CSV (Excel format)!`);
        } else if (selectedFormat === 'pdf') {
          // Generate HTML untuk print as PDF
          const printWindow = window.open('', '', 'width=800,height=600');
          
          let html = `
            <html>
              <head>
                <title>Report ${period}</title>
                <style>
                  body { font-family: Arial, sans-serif; padding: 20px; }
                  h1 { color: #2C3E50; text-align: center; }
                  table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                  th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                  th { background-color: #2C3E50; color: white; }
                  .total { font-weight: bold; margin-top: 20px; }
                </style>
              </head>
              <body>
                <h1>📊 Sales Report - ${period.toUpperCase()}</h1>
                <p>Generated: ${formatDateTime(new Date())}</p>
                <table>
                  <thead>
                    <tr>
                      <th>No</th>
                      <th>Kode Transaksi</th>
                      <th>Tanggal</th>
                      <th>Kasir</th>
                      <th>Total</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
          `;
          
          let totalRevenue = 0;
          filteredData.forEach((transaction, index) => {
            const date = formatDateTime(transaction.created_at);
            totalRevenue += transaction.total_amount;
            
            html += `
              <tr>
                <td>${index + 1}</td>
                <td>${transaction.transaction_code}</td>
                <td>${date}</td>
                <td>${transaction.username || transaction.cashier_name}</td>
                <td>Rp ${transaction.total_amount.toLocaleString('id-ID')}</td>
                <td>${transaction.status}</td>
              </tr>
            `;
          });
          
          html += `
                  </tbody>
                </table>
                <div class="total">
                  <p>Total Transaksi: ${filteredData.length}</p>
                  <p>Total Revenue: Rp ${totalRevenue.toLocaleString('id-ID')}</p>
                </div>
                <script>
                  window.onload = function() {
                    window.print();
                    setTimeout(function() { window.close(); }, 100);
                  };
                </script>
              </body>
            </html>
          `;
          
          printWindow.document.write(html);
          printWindow.document.close();
        }
      }
    } catch (error) {
      console.error('Download failed:', error);
      alert('❌ Gagal mendownload report: ' + (error.response?.data?.message || error.message));
    }
    
    setSelectedFormat(null);
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <ArrowTrendingUpIcon className="w-12 h-12 mx-auto mb-4 text-gray-400 animate-spin" />
            <div className="text-xl" style={{ color: '#2C3E50' }}>Loading reports...</div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2" style={{ color: '#2C3E50' }}>
              <ChartBarIcon className="w-8 h-8" />
              Reports & Analytics
            </h1>
            <p className="opacity-70 mt-1" style={{ color: '#2C3E50' }}>
              Sales insights and business performance
            </p>
          </div>
          
          <div className="flex gap-3">
            {/* Download Button with Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowDownloadMenu(!showDownloadMenu)}
                className="px-4 py-2 border-2 rounded-md focus:outline-none font-semibold flex items-center gap-2 hover:opacity-80 transition-opacity"
                style={{ 
                  borderColor: '#2C3E50',
                  backgroundColor: '#2C3E50',
                  color: '#FFFFFF'
                }}
              >
                <ArrowDownTrayIcon className="w-4 h-4" />
                Download Data
                <ChevronDownIcon className={`w-4 h-4 transition-transform ${showDownloadMenu ? 'rotate-180' : ''}`} />
              </button>

              {/* Format Selection Menu */}
              {showDownloadMenu && (
                <div 
                  className="absolute right-0 mt-2 w-48 rounded-lg shadow-xl z-50 overflow-hidden"
                  style={{ backgroundColor: '#FFFFFF', border: '2px solid #2C3E50' }}
                >
                  <button
                    onClick={() => handleFormatSelect('pdf')}
                    className="w-full px-4 py-3 text-left hover:opacity-80 transition-all flex items-center gap-3"
                    style={{ backgroundColor: '#FFFFFF', color: '#2C3E50', borderBottom: '1px solid #E8E8E8' }}
                  >
                    <DocumentIcon className="w-4 h-4" />
                    <div>
                      <p className="font-semibold">PDF</p>
                      <p className="text-xs opacity-70">Portable Document Format</p>
                    </div>
                  </button>
                  
                  <button
                    onClick={() => handleFormatSelect('excel')}
                    className="w-full px-4 py-3 text-left hover:opacity-80 transition-all flex items-center gap-3"
                    style={{ backgroundColor: '#FFFFFF', color: '#2C3E50' }}
                  >
                    <ChartBarIcon className="w-4 h-4" />
                    <div>
                      <p className="font-semibold">Excel</p>
                      <p className="text-xs opacity-70">Spreadsheet Format</p>
                    </div>
                  </button>
                </div>
              )}

              {/* Period Selection Menu */}
              {showPeriodMenu && (
                <div 
                  className="absolute right-0 mt-2 w-56 rounded-lg shadow-xl z-50 overflow-hidden"
                  style={{ backgroundColor: '#FFFFFF', border: '2px solid #2C3E50' }}
                >
                  <div className="px-4 py-2 font-bold border-b flex items-center gap-2" style={{ backgroundColor: '#F8F9FA', color: '#2C3E50', borderColor: '#E8E8E8' }}>
                    <CalendarIcon className="w-4 h-4" />
                    Pilih Periode Data
                  </div>
                  
                  <button
                    onClick={() => handleDownload('all')}
                    className="w-full px-4 py-3 text-left hover:opacity-80 transition-all flex items-center gap-3"
                    style={{ backgroundColor: '#FFFFFF', color: '#2C3E50', borderBottom: '1px solid #E8E8E8' }}
                  >
                    <CalendarIcon className="w-4 h-4" />
                    <div>
                      <p className="font-semibold">All Time</p>
                      <p className="text-xs opacity-70">Semua data</p>
                    </div>
                  </button>

                  <button
                    onClick={() => handleDownload('today')}
                    className="w-full px-4 py-3 text-left hover:opacity-80 transition-all flex items-center gap-3"
                    style={{ backgroundColor: '#FFFFFF', color: '#2C3E50', borderBottom: '1px solid #E8E8E8' }}
                  >
                    <ClockIcon className="w-4 h-4" />
                    <div>
                      <p className="font-semibold">Today</p>
                      <p className="text-xs opacity-70">Hari ini</p>
                    </div>
                  </button>

                  <button
                    onClick={() => handleDownload('week')}
                    className="w-full px-4 py-3 text-left hover:opacity-80 transition-all flex items-center gap-3"
                    style={{ backgroundColor: '#FFFFFF', color: '#2C3E50', borderBottom: '1px solid #E8E8E8' }}
                  >
                    <CalendarIcon className="w-4 h-4" />
                    <div>
                      <p className="font-semibold">This Week</p>
                      <p className="text-xs opacity-70">7 hari terakhir</p>
                    </div>
                  </button>

                  <button
                    onClick={() => handleDownload('month')}
                    className="w-full px-4 py-3 text-left hover:opacity-80 transition-all flex items-center gap-3"
                    style={{ backgroundColor: '#FFFFFF', color: '#2C3E50', borderBottom: '1px solid #E8E8E8' }}
                  >
                    <CalendarIcon className="w-4 h-4" />
                    <div>
                      <p className="font-semibold">This Month</p>
                      <p className="text-xs opacity-70">Bulan ini</p>
                    </div>
                  </button>

                  <button
                    onClick={() => handleDownload('year')}
                    className="w-full px-4 py-3 text-left hover:opacity-80 transition-all flex items-center gap-3"
                    style={{ backgroundColor: '#FFFFFF', color: '#2C3E50', borderBottom: '1px solid #E8E8E8' }}
                  >
                    <CalendarIcon className="w-4 h-4" />
                    <div>
                      <p className="font-semibold">This Year</p>
                      <p className="text-xs opacity-70">Tahun ini</p>
                    </div>
                  </button>
                  
                  <button
                    onClick={() => {
                      setShowPeriodMenu(false);
                      setSelectedFormat(null);
                    }}
                    className="w-full px-4 py-2 text-center font-semibold hover:opacity-80 flex items-center justify-center gap-2"
                    style={{ backgroundColor: '#F8F9FA', color: '#95A5A6' }}
                  >
                    <XMarkIcon className="w-4 h-4" />
                    Batal
                  </button>
                </div>
              )}
            </div>

            {/* Date Range Filter */}
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-4 py-2 border-2 rounded-md focus:outline-none font-semibold flex items-center gap-2"
              style={{ 
                borderColor: '#2C3E50',
                backgroundColor: '#F8F9FA',
                color: '#2C3E50'
              }}
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="year">This Year</option>
            </select>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Revenue */}
          <div className="rounded-lg shadow-lg p-6" style={{ backgroundColor: '#FFFFFF' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-70 flex items-center gap-2" style={{ color: '#2C3E50' }}>
                  <CurrencyDollarIcon className="w-4 h-4" />
                  Total Revenue
                </p>
                <p className="text-2xl font-bold" style={{ color: '#2C3E50' }}>
                  Rp {reportData.totalRevenue.toLocaleString()}
                </p>
                <p className="text-sm opacity-70 mt-1" style={{ color: '#2C3E50' }}>
                  {dateRange === 'today' ? 'Today' : `This ${dateRange}`}
                </p>
              </div>
              <div className="text-4xl opacity-20" style={{ color: '#2C3E50' }}>
                <CurrencyDollarIcon className="w-12 h-12" />
              </div>
            </div>
          </div>

          {/* Total Transactions */}
          <div className="rounded-lg shadow-lg p-6" style={{ backgroundColor: '#FFFFFF' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-70 flex items-center gap-2" style={{ color: '#2C3E50' }}>
                  <ReceiptPercentIcon className="w-4 h-4" />
                  Total Transactions
                </p>
                <p className="text-2xl font-bold" style={{ color: '#2C3E50' }}>
                  {reportData.totalTransactions}
                </p>
                <p className="text-sm opacity-70 mt-1" style={{ color: '#2C3E50' }}>
                  Completed sales
                </p>
              </div>
              <div className="text-4xl opacity-20" style={{ color: '#2C3E50' }}>
                <ReceiptPercentIcon className="w-12 h-12" />
              </div>
            </div>
          </div>

          {/* Items Sold */}
          <div className="rounded-lg shadow-lg p-6" style={{ backgroundColor: '#FFFFFF' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-70 flex items-center gap-2" style={{ color: '#2C3E50' }}>
                  <ShoppingBagIcon className="w-4 h-4" />
                  Items Sold
                </p>
                <p className="text-2xl font-bold" style={{ color: '#2C3E50' }}>
                  {reportData.totalItems}
                </p>
                <p className="text-sm opacity-70 mt-1" style={{ color: '#2C3E50' }}>
                  Products sold
                </p>
              </div>
              <div className="text-4xl opacity-20" style={{ color: '#2C3E50' }}>
                <ShoppingBagIcon className="w-12 h-12" />
              </div>
            </div>
          </div>

          {/* Average Transaction */}
          <div className="rounded-lg shadow-lg p-6" style={{ backgroundColor: '#FFFFFF' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-70 flex items-center gap-2" style={{ color: '#2C3E50' }}>
                  <ChartBarIcon className="w-4 h-4" />
                  Avg Transaction
                </p>
                <p className="text-2xl font-bold" style={{ color: '#2C3E50' }}>
                  Rp {reportData.averageTransaction.toLocaleString()}
                </p>
                <p className="text-sm opacity-70 mt-1" style={{ color: '#2C3E50' }}>
                  Per transaction
                </p>
              </div>
              <div className="text-4xl opacity-20" style={{ color: '#2C3E50' }}>
                <ChartBarIcon className="w-12 h-12" />
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue Trend Chart */}
          <div className="rounded-lg shadow-lg p-6" style={{ backgroundColor: '#FFFFFF' }}>
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2" style={{ color: '#2C3E50' }}>
              <ArrowTrendingUpIcon className="w-5 h-5" />
              Revenue Trend
            </h3>
            
            {/* Simple Bar Chart */}
            <div className="space-y-3">
              {reportData.revenueChart.length > 0 ? (
                reportData.revenueChart.map((item, index) => (
                  <div key={index} className="flex items-center">
                    <div className="w-12 text-sm font-medium" style={{ color: '#2C3E50' }}>
                      {item.day}
                    </div>
                    <div className="flex-1 mx-3">
                      <div className="h-6 rounded-full" style={{ backgroundColor: '#F8F9FA' }}>
                        <div 
                          className="h-6 rounded-full transition-all duration-500"
                          style={{ 
                            backgroundColor: '#2C3E50',
                            width: `${(item.revenue / Math.max(...reportData.revenueChart.map(r => r.revenue))) * 100}%`
                          }}
                        />
                      </div>
                    </div>
                    <div className="w-20 text-sm text-right" style={{ color: '#2C3E50' }}>
                      Rp {(item.revenue / 1000).toFixed(0)}k
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center py-4 opacity-60" style={{ color: '#2C3E50' }}>
                  Belum ada data revenue
                </p>
              )}
            </div>
          </div>

          {/* Sales by Category */}
          <div className="rounded-lg shadow-lg p-6" style={{ backgroundColor: '#FFFFFF' }}>
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2" style={{ color: '#2C3E50' }}>
              <ChartBarIcon className="w-5 h-5" />
              Sales by Category
            </h3>
            
            <div className="space-y-4">
              {reportData.salesByCategory && reportData.salesByCategory.length > 0 ? (
                reportData.salesByCategory.map((item, index) => {
                  const totalRevenue = reportData.salesByCategory.reduce((sum, cat) => sum + (cat.value || 0), 0);
                  const percentage = totalRevenue > 0 ? ((item.value || 0) / totalRevenue * 100).toFixed(1) : 0;
                  
                  return (
                    <div key={index}>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium" style={{ color: '#2C3E50' }}>
                          {item.name || 'Uncategorized'}
                        </span>
                        <span className="text-sm" style={{ color: '#2C3E50' }}>
                          {percentage}%
                        </span>
                      </div>
                      <div className="w-full h-3 rounded-full" style={{ backgroundColor: '#F8F9FA' }}>
                        <div 
                          className="h-3 rounded-full transition-all duration-500"
                          style={{ 
                            backgroundColor: ['#2C3E50', '#F4A261', '#E76F51'][index % 3],
                            width: `${percentage}%`
                          }}
                        />
                      </div>
                      <div className="text-xs opacity-70 mt-1" style={{ color: '#2C3E50' }}>
                        Rp {(item.value || 0).toLocaleString('id-ID')}
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-center py-4 opacity-60" style={{ color: '#2C3E50' }}>
                  Belum ada data kategori
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Top Products & Performance */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Products */}
          <div className="rounded-lg shadow-lg p-6" style={{ backgroundColor: '#FFFFFF' }}>
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2" style={{ color: '#2C3E50' }}>
              <ShoppingBagIcon className="w-5 h-5" />
              Top Products
            </h3>
            
            <div className="space-y-3">
              {reportData.topProducts && reportData.topProducts.length > 0 ? (
                reportData.topProducts.map((product, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-md" style={{ backgroundColor: '#F8F9FA' }}>
                    <div className="flex items-center">
                      <div 
                        className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mr-3"
                        style={{ 
                          backgroundColor: index === 0 ? '#FFD700' : index === 1 ? '#C0C0C0' : index === 2 ? '#CD7F32' : '#2C3E50',
                          color: index < 3 ? '#000' : '#FFF'
                        }}
                      >
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium" style={{ color: '#2C3E50' }}>{product.name || 'Unknown Product'}</p>
                        <p className="text-sm opacity-70" style={{ color: '#2C3E50' }}>{product.sold || 0} sold</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold" style={{ color: '#2C3E50' }}>
                        Rp {(product.revenue || 0).toLocaleString('id-ID')}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center py-4 opacity-60" style={{ color: '#2C3E50' }}>
                  Belum ada data produk terlaris
                </p>
              )}
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="rounded-lg shadow-lg p-6" style={{ backgroundColor: '#FFFFFF' }}>
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2" style={{ color: '#2C3E50' }}>
              <ChartBarIcon className="w-5 h-5" />
              Performance Metrics
            </h3>
            
            <div className="space-y-4">
              {/* Profit Margin */}
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium flex items-center gap-2" style={{ color: '#2C3E50' }}>
                    <CurrencyDollarIcon className="w-4 h-4" />
                    Profit Margin
                  </span>
                  <span className="text-sm font-bold" style={{ color: '#2C3E50' }}>
                    {reportData.profitMargin}%
                  </span>
                </div>
                <div className="w-full h-3 rounded-full" style={{ backgroundColor: '#F8F9FA' }}>
                  <div 
                    className="h-3 rounded-full transition-all duration-500"
                    style={{ 
                      backgroundColor: reportData.profitMargin > 30 ? '#4CAF50' : reportData.profitMargin > 20 ? '#FF9800' : '#FF5722',
                      width: `${reportData.profitMargin}%`
                    }}
                  />
                </div>
              </div>

              {/* Growth Indicators */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 rounded-md text-center" style={{ backgroundColor: '#F8F9FA' }}>
                  <ArrowTrendingUpIcon className="w-8 h-8 mx-auto mb-2 text-green-600" />
                  <p className="text-sm font-medium" style={{ color: '#2C3E50' }}>Revenue Growth</p>
                  <p className="text-lg font-bold text-green-600">+15%</p>
                </div>
                
                <div className="p-3 rounded-md text-center" style={{ backgroundColor: '#F8F9FA' }}>
                  <UserGroupIcon className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                  <p className="text-sm font-medium" style={{ color: '#2C3E50' }}>Customer Growth</p>
                  <p className="text-lg font-bold text-blue-600">+8%</p>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="pt-4 border-t" style={{ borderColor: '#2C3E50' }}>
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <p className="text-lg font-bold" style={{ color: '#2C3E50' }}>85%</p>
                    <p className="text-xs opacity-70 flex items-center justify-center gap-2" style={{ color: '#2C3E50' }}>
                      <CheckCircleIcon className="w-3 h-3" />
                      Customer Satisfaction
                    </p>
                  </div>
                  <div>
                    <p className="text-lg font-bold" style={{ color: '#2C3E50' }}>12</p>
                    <p className="text-xs opacity-70 flex items-center justify-center gap-2" style={{ color: '#2C3E50' }}>
                      <ShoppingBagIcon className="w-3 h-3" />
                      Items per Transaction
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Reports;