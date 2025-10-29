import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/admin/AdminLayout';
import api from '../../api/axios';
import { FaBox, FaMoneyBillWave, FaUsers, FaExclamationTriangle, FAChartBar, FaUserCog, FaChartBar } from 'react-icons/fa';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalUsers: 0,
    lowStockProducts: 0,
    todaySales: 0
  });
  const [recentProducts, setRecentProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch products for stats
      const productsResponse = await api.get('/products', { params: { limit: 1000 } });
      const products = productsResponse.data.data || [];
      
      // Fetch users
      const usersResponse = await api.get('/users');
      const users = usersResponse.data.data || [];
      
      // Fetch today's transactions
      const transactionsResponse = await api.get('/transactions/admin/all');
      const allTransactions = transactionsResponse.data.data || [];
      
      const today = new Date().toDateString();
      const todayTransactions = allTransactions.filter(t => 
        new Date(t.created_at).toDateString() === today
      );
      
      const todaySales = todayTransactions.reduce((sum, t) => sum + parseFloat(t.total_amount || 0), 0);
      
      // Calculate stats
      const totalProducts = products.filter(p => p.is_active === 1 || p.is_active === true).length;
      const lowStockProducts = products.filter(p => p.stock <= (p.min_stock || 5)).length;
      
      setStats({
        totalProducts,
        totalUsers: users.length,
        lowStockProducts,
        todaySales
      });

      // Set recent products (last 5)
      setRecentProducts(products.slice(0, 5));
      
    } catch (error) {
      console.error('Dashboard data fetch error:', error);
      if (error.response?.status === 401) {
        console.log('401 Unauthorized - Token might be expired');
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    } finally {
      setLoading(false);
    }
  };

  const StatsCard = ({ title, value, subtitle, Icon, iconColor = '#7F8C8D', isAlert = false }) => (
    <div 
      className="rounded-xl shadow-lg p-6 transition-all duration-200 transform hover:scale-105"
      style={{ 
        backgroundColor: isAlert ? '#E74C3C' : '#FFFFFF',
        border: isAlert ? '2px solid #C0392B' : '2px solid #ECF0F1'
      }}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium" style={{ color: isAlert ? '#FFFFFF' : '#7F8C8D' }}>
            {title}
          </p>
          <p className="text-2xl font-bold mt-2" style={{ color: isAlert ? '#FFFFFF' : '#2C3E50' }}>
            {value}
          </p>
          <p className="text-xs mt-1" style={{ color: isAlert ? 'rgba(255,255,255,0.8)' : '#95A5A6' }}>
            {subtitle}
          </p>
        </div>
        <div className="text-3xl opacity-60">
          <Icon style={{ color: isAlert ? '#FFFFFF' : iconColor }} />
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto" style={{ borderColor: '#2C3E50' }}></div>
            <p className="mt-4" style={{ color: '#2C3E50' }}>Loading dashboard...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      {/* Dashboard Stats Cards */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-6" style={{ color: '#2C3E50' }}>
          Overview
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Total Products"
            value={stats.totalProducts}
            subtitle="Active products"
            Icon={FaBox}
            iconColor="#2C3E50"
          />
          <StatsCard
            title="Today's Sales"
            value={`Rp ${stats.todaySales.toLocaleString()}`}
            subtitle="Revenue today"
            Icon={FaMoneyBillWave}
            iconColor="#2C3E50"
          />
          <StatsCard
            title="Total Users"
            value={stats.totalUsers}
            subtitle="Registered users"
            Icon={FaUsers}
            iconColor="#2C3E50"
          />
          <StatsCard
            title="Low Stock Alert"
            value={stats.lowStockProducts}
            subtitle="Need restocking"
            Icon={FaExclamationTriangle }
            iconColor="#DD0303"
            isAlert={stats.lowStockProducts > 0}
          />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-6" style={{ color: '#2C3E50' }}>
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
          onClick={() => navigate('/admin/products')}
          className="p-6 rounded-xl shadow-lg transition-all duration-200 hover:scale-105 hover:shadow-xl flex items-center gap-4"
          style={{ 
            backgroundColor: '#FFFFFF',
            border: '2px solid #ECF0F1'
          }}
        >
          <FaBox style={{ color: '#2C3E50', fontSize: '2.5rem' }} />
          <div className="flex flex-col items-start text-left">
            <h3 className="font-bold text-lg" style={{ color: '#2C3E50' }}>Manage Products</h3>
            <p className="text-sm mt-2" style={{ color: '#7F8C8D' }}>Add, edit, delete products</p>
          </div>
        </button>

          <button
          onClick={() => navigate('/admin/reports')}
          className="p-6 rounded-xl shadow-lg transition-all duration-200 hover:scale-105 hover:shadow-xl flex items-center gap-4"
          style={{ 
            backgroundColor: '#FFFFFF',
            border: '2px solid #ECF0F1'
          }}
        >
          <FaChartBar style={{ color: '#2C3E50', fontSize: '2.5rem' }} />
          <div className="flex flex-col items-start text-left">
            <h3 className="font-bold text-lg" style={{ color: '#2C3E50' }}>View Reports</h3>
            <p className="text-sm mt-2" style={{ color: '#7F8C8D' }}>Sales analytics & insights</p>
          </div>
        </button>

          <button
            onClick={() => navigate('/admin/users')}
            className="p-6 rounded-xl shadow-lg transition-all duration-200 hover:scale-105 hover:shadow-xl flex items-center gap-4"
            style={{ 
              backgroundColor: '#FFFFFF',
              border: '2px solid #ECF0F1'
            }}
          >
            <FaUserCog style={{ color: '#2C3E50', fontSize: '2.5rem' }} />
            <div className="flex flex-col items-start text-left">
              <h3 className="font-bold text-lg" style={{ color: '#2C3E50' }}>User Management</h3>
              <p className="text-sm mt-2" style={{ color: '#7F8C8D' }}>Manage kasir accounts</p>
            </div>
          </button>
        </div>
      </div>

      {/* Recent Products */}
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold" style={{ color: '#2C3E50' }}>
            Recent Products
          </h2>
          <button
            onClick={() => navigate('/admin/products')}
            className="px-6 py-2 rounded-lg text-sm font-medium transition-all duration-200 shadow-md hover:shadow-lg"
            style={{ 
              backgroundColor: '#2C3E50',
              color: '#FFFFFF'
            }}
          >
            View All Products →
          </button>
        </div>

        <div className="rounded-xl shadow-lg overflow-hidden" style={{ backgroundColor: '#FFFFFF' }}>
          <table className="w-full">
            <thead style={{ backgroundColor: '#2C3E50' }}>
              <tr>
                <th className="text-left py-4 px-6 font-semibold" style={{ color: '#FFFFFF' }}>Product</th>
                <th className="text-left py-4 px-6 font-semibold" style={{ color: '#FFFFFF' }}>Category</th>
                <th className="text-left py-4 px-6 font-semibold" style={{ color: '#FFFFFF' }}>Price</th>
                <th className="text-left py-4 px-6 font-semibold" style={{ color: '#FFFFFF' }}>Stock</th>
                <th className="text-left py-4 px-6 font-semibold" style={{ color: '#FFFFFF' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {recentProducts.map((product, index) => (
                <tr key={product.id} style={{ backgroundColor: index % 2 === 0 ? '#FFFFFF' : '#F8F9FA' }}>
                  <td className="py-4 px-6">
                    <p className="font-medium" style={{ color: '#2C3E50' }}>{product.name}</p>
                  </td>
                  <td className="py-4 px-6">
                    <span className="text-sm" style={{ color: '#7F8C8D' }}>
                      {product.category_name || 'N/A'}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <span className="font-medium" style={{ color: '#2C3E50' }}>
                      Rp {product.price?.toLocaleString()}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <span className="font-medium" style={{ color: '#2C3E50' }}>
                      {product.stock}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <span 
                      className="px-3 py-1 rounded-full text-xs font-medium"
                      style={{
                        backgroundColor: product.stock > product.min_stock ? '#27AE60' : '#E67E22',
                        color: '#FFFFFF'
                      }}
                    >
                      {product.stock > product.min_stock ? 'Normal' : 'Low Stock'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;