import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import api from '../../api/axios';

const Reports = () => {
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('today');
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

  // Fetch report data
  const fetchReportData = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/reports/dashboard?range=${dateRange}`);
      setReportData(response.data.data);
    } catch (error) {
      console.error('Failed to fetch report data:', error);
      // Mock data for development
      setReportData({
        totalRevenue: 2500000,
        totalTransactions: 75,
        totalItems: 150,
        averageTransaction: 33333,
        topProducts: [
          { name: 'Chitato Keju', sold: 50, revenue: 500000 },
          { name: 'Indomie Goreng', sold: 45, revenue: 450000 },
          { name: 'Aqua 600ml', sold: 40, revenue: 200000 },
          { name: 'Teh Botol', sold: 35, revenue: 175000 },
          { name: 'Oreo', sold: 30, revenue: 300000 }
        ],
        salesByCategory: [
          { category: 'Makanan Ringan', percentage: 45, revenue: 1125000 },
          { category: 'Minuman', percentage: 30, revenue: 750000 },
          { category: 'Kebutuhan Harian', percentage: 25, revenue: 625000 }
        ],
        revenueChart: [
          { day: 'Mon', revenue: 300000 },
          { day: 'Tue', revenue: 450000 },
          { day: 'Wed', revenue: 380000 },
          { day: 'Thu', revenue: 520000 },
          { day: 'Fri', revenue: 480000 },
          { day: 'Sat', revenue: 650000 },
          { day: 'Sun', revenue: 590000 }
        ],
        profitMargin: 35
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReportData();
  }, [dateRange]);

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: '#E9C46A' }}></div>
            <p style={{ color: '#3E3E3E' }}>Loading reports...</p>
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
            <h1 className="text-3xl font-bold" style={{ color: '#3E3E3E' }}>📊 Reports & Analytics</h1>
            <p className="opacity-70 mt-1" style={{ color: '#3E3E3E' }}>
              Sales insights and business performance
            </p>
          </div>
          
          {/* Date Range Filter */}
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-2 border-2 rounded-md focus:outline-none"
            style={{ 
              borderColor: '#E9C46A',
              backgroundColor: '#FFFCF2',
              color: '#3E3E3E'
            }}
          >
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="year">This Year</option>
          </select>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Revenue */}
          <div className="rounded-lg shadow-lg p-6" style={{ backgroundColor: '#F7E9A0' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-70" style={{ color: '#3E3E3E' }}>Total Revenue</p>
                <p className="text-2xl font-bold" style={{ color: '#3E3E3E' }}>
                  Rp {reportData.totalRevenue.toLocaleString()}
                </p>
                <p className="text-sm opacity-70 mt-1" style={{ color: '#3E3E3E' }}>
                  {dateRange === 'today' ? 'Today' : `This ${dateRange}`}
                </p>
              </div>
              <div className="text-4xl">💰</div>
            </div>
          </div>

          {/* Total Transactions */}
          <div className="rounded-lg shadow-lg p-6" style={{ backgroundColor: '#F7E9A0' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-70" style={{ color: '#3E3E3E' }}>Total Transactions</p>
                <p className="text-2xl font-bold" style={{ color: '#3E3E3E' }}>
                  {reportData.totalTransactions}
                </p>
                <p className="text-sm opacity-70 mt-1" style={{ color: '#3E3E3E' }}>
                  Completed sales
                </p>
              </div>
              <div className="text-4xl">🧾</div>
            </div>
          </div>

          {/* Items Sold */}
          <div className="rounded-lg shadow-lg p-6" style={{ backgroundColor: '#F7E9A0' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-70" style={{ color: '#3E3E3E' }}>Items Sold</p>
                <p className="text-2xl font-bold" style={{ color: '#3E3E3E' }}>
                  {reportData.totalItems}
                </p>
                <p className="text-sm opacity-70 mt-1" style={{ color: '#3E3E3E' }}>
                  Products sold
                </p>
              </div>
              <div className="text-4xl">📦</div>
            </div>
          </div>

          {/* Average Transaction */}
          <div className="rounded-lg shadow-lg p-6" style={{ backgroundColor: '#F7E9A0' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-70" style={{ color: '#3E3E3E' }}>Avg Transaction</p>
                <p className="text-2xl font-bold" style={{ color: '#3E3E3E' }}>
                  Rp {reportData.averageTransaction.toLocaleString()}
                </p>
                <p className="text-sm opacity-70 mt-1" style={{ color: '#3E3E3E' }}>
                  Per transaction
                </p>
              </div>
              <div className="text-4xl">📊</div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue Trend Chart */}
          <div className="rounded-lg shadow-lg p-6" style={{ backgroundColor: '#F7E9A0' }}>
            <h3 className="text-xl font-bold mb-4" style={{ color: '#3E3E3E' }}>
              📈 Revenue Trend
            </h3>
            
            {/* Simple Bar Chart */}
            <div className="space-y-3">
              {reportData.revenueChart.map((item, index) => (
                <div key={index} className="flex items-center">
                  <div className="w-12 text-sm font-medium" style={{ color: '#3E3E3E' }}>
                    {item.day}
                  </div>
                  <div className="flex-1 mx-3">
                    <div className="h-6 rounded-full" style={{ backgroundColor: '#FFFCF2' }}>
                      <div 
                        className="h-6 rounded-full transition-all duration-500"
                        style={{ 
                          backgroundColor: '#E9C46A',
                          width: `${(item.revenue / Math.max(...reportData.revenueChart.map(r => r.revenue))) * 100}%`
                        }}
                      />
                    </div>
                  </div>
                  <div className="w-20 text-sm text-right" style={{ color: '#3E3E3E' }}>
                    Rp {(item.revenue / 1000).toFixed(0)}k
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sales by Category */}
          <div className="rounded-lg shadow-lg p-6" style={{ backgroundColor: '#F7E9A0' }}>
            <h3 className="text-xl font-bold mb-4" style={{ color: '#3E3E3E' }}>
              🥧 Sales by Category
            </h3>
            
            <div className="space-y-4">
              {reportData.salesByCategory.map((item, index) => (
                <div key={index}>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium" style={{ color: '#3E3E3E' }}>
                      {item.category}
                    </span>
                    <span className="text-sm" style={{ color: '#3E3E3E' }}>
                      {item.percentage}%
                    </span>
                  </div>
                  <div className="w-full h-3 rounded-full" style={{ backgroundColor: '#FFFCF2' }}>
                    <div 
                      className="h-3 rounded-full transition-all duration-500"
                      style={{ 
                        backgroundColor: ['#E9C46A', '#F4A261', '#E76F51'][index % 3],
                        width: `${item.percentage}%`
                      }}
                    />
                  </div>
                  <div className="text-xs opacity-70 mt-1" style={{ color: '#3E3E3E' }}>
                    Rp {item.revenue.toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top Products & Performance */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Products */}
          <div className="rounded-lg shadow-lg p-6" style={{ backgroundColor: '#F7E9A0' }}>
            <h3 className="text-xl font-bold mb-4" style={{ color: '#3E3E3E' }}>
              🏆 Top Products
            </h3>
            
            <div className="space-y-3">
              {reportData.topProducts.map((product, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-md" style={{ backgroundColor: '#FFFCF2' }}>
                  <div className="flex items-center">
                    <div 
                      className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mr-3"
                      style={{ 
                        backgroundColor: index === 0 ? '#FFD700' : index === 1 ? '#C0C0C0' : index === 2 ? '#CD7F32' : '#E9C46A',
                        color: '#3E3E3E'
                      }}
                    >
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium" style={{ color: '#3E3E3E' }}>{product.name}</p>
                      <p className="text-sm opacity-70" style={{ color: '#3E3E3E' }}>{product.sold} sold</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold" style={{ color: '#3E3E3E' }}>
                      Rp {product.revenue.toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="rounded-lg shadow-lg p-6" style={{ backgroundColor: '#F7E9A0' }}>
            <h3 className="text-xl font-bold mb-4" style={{ color: '#3E3E3E' }}>
              🎯 Performance Metrics
            </h3>
            
            <div className="space-y-4">
              {/* Profit Margin */}
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium" style={{ color: '#3E3E3E' }}>
                    Profit Margin
                  </span>
                  <span className="text-sm font-bold" style={{ color: '#3E3E3E' }}>
                    {reportData.profitMargin}%
                  </span>
                </div>
                <div className="w-full h-3 rounded-full" style={{ backgroundColor: '#FFFCF2' }}>
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
                <div className="p-3 rounded-md text-center" style={{ backgroundColor: '#FFFCF2' }}>
                  <p className="text-2xl">📈</p>
                  <p className="text-sm font-medium" style={{ color: '#3E3E3E' }}>Revenue Growth</p>
                  <p className="text-lg font-bold text-green-600">+15%</p>
                </div>
                
                <div className="p-3 rounded-md text-center" style={{ backgroundColor: '#FFFCF2' }}>
                  <p className="text-2xl">👥</p>
                  <p className="text-sm font-medium" style={{ color: '#3E3E3E' }}>Customer Growth</p>
                  <p className="text-lg font-bold text-blue-600">+8%</p>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="pt-4 border-t" style={{ borderColor: '#E9C46A' }}>
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <p className="text-lg font-bold" style={{ color: '#3E3E3E' }}>85%</p>
                    <p className="text-xs opacity-70" style={{ color: '#3E3E3E' }}>Customer Satisfaction</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold" style={{ color: '#3E3E3E' }}>12</p>
                    <p className="text-xs opacity-70" style={{ color: '#3E3E3E' }}>Items per Transaction</p>
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