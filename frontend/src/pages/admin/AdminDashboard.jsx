import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/admin/AdminLayout';
import api from '../../api/axios';

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
      const productsResponse = await api.get('/products');
      const products = productsResponse.data.data || [];
      
      // Calculate stats
      const totalProducts = products.length;
      const lowStockProducts = products.filter(p => p.stock <= p.min_stock).length;
      
      setStats({
        totalProducts,
        totalUsers: 5, // Placeholder
        lowStockProducts,
        todaySales: 2500000 // Placeholder
      });

      // Set recent products (last 5)
      setRecentProducts(products.slice(-5));
      
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

  const StatsCard = ({ title, value, subtitle, icon, isAlert = false }) => (
    <div 
      className="rounded-lg shadow-lg p-6 transition-all duration-200 transform hover:scale-105"
      style={{ 
        backgroundColor: isAlert ? '#FFD56B' : '#F7E9A0',
        border: isAlert ? '2px solid #FF6B6B' : '2px solid #E9C46A'
      }}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium opacity-70" style={{ color: '#3E3E3E' }}>
            {title}
          </p>
          <p className="text-2xl font-bold mt-2" style={{ color: '#3E3E3E' }}>
            {value}
          </p>
          <p className="text-xs opacity-60 mt-1" style={{ color: '#3E3E3E' }}>
            {subtitle}
          </p>
        </div>
        <div className="text-3xl opacity-60">
          {icon}
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto" style={{ borderColor: '#E9C46A' }}></div>
            <p className="mt-4" style={{ color: '#3E3E3E' }}>Loading dashboard...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      {/* Dashboard Stats Cards */}
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-4" style={{ color: '#3E3E3E' }}>
          Overview
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Total Products"
            value={stats.totalProducts}
            subtitle="Active products"
            icon="📦"
          />
          <StatsCard
            title="Today's Sales"
            value={`Rp ${stats.todaySales.toLocaleString()}`}
            subtitle="Revenue today"
            icon="💰"
          />
          <StatsCard
            title="Total Users"
            value={stats.totalUsers}
            subtitle="Registered users"
            icon="👥"
          />
          <StatsCard
            title="Low Stock Alert"
            value={stats.lowStockProducts}
            subtitle="Need restocking"
            icon="⚠️"
            isAlert={stats.lowStockProducts > 0}
          />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-4" style={{ color: '#3E3E3E' }}>
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => navigate('/admin/products')}
            className="p-4 rounded-lg border-2 transition-all duration-200 hover:scale-105"
            style={{ 
              backgroundColor: '#F7E9A0',
              borderColor: '#E9C46A'
            }}
          >
            <div className="text-center">
              <div className="text-2xl mb-2">📦</div>
              <h3 className="font-bold" style={{ color: '#3E3E3E' }}>Manage Products</h3>
              <p className="text-sm opacity-70" style={{ color: '#3E3E3E' }}>Add, edit, delete products</p>
            </div>
          </button>

          <button
            onClick={() => navigate('/admin/reports')}
            className="p-4 rounded-lg border-2 transition-all duration-200 hover:scale-105"
            style={{ 
              backgroundColor: '#F7E9A0',
              borderColor: '#E9C46A'
            }}
          >
            <div className="text-center">
              <div className="text-2xl mb-2">📊</div>
              <h3 className="font-bold" style={{ color: '#3E3E3E' }}>View Reports</h3>
              <p className="text-sm opacity-70" style={{ color: '#3E3E3E' }}>Sales analytics & insights</p>
            </div>
          </button>

          <button
            onClick={() => navigate('/admin/users')}
            className="p-4 rounded-lg border-2 transition-all duration-200 hover:scale-105"
            style={{ 
              backgroundColor: '#F7E9A0',
              borderColor: '#E9C46A'
            }}
          >
            <div className="text-center">
              <div className="text-2xl mb-2">👥</div>
              <h3 className="font-bold" style={{ color: '#3E3E3E' }}>User Management</h3>
              <p className="text-sm opacity-70" style={{ color: '#3E3E3E' }}>Manage kasir accounts</p>
            </div>
          </button>
        </div>
      </div>

      {/* Recent Products */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold" style={{ color: '#3E3E3E' }}>
            Recent Products
          </h2>
          <button
            onClick={() => navigate('/admin/products')}
            className="px-4 py-2 rounded-md text-sm font-medium transition-all duration-200"
            style={{ 
              backgroundColor: '#E9C46A',
              color: '#3E3E3E'
            }}
          >
            View All Products →
          </button>
        </div>

        <div className="rounded-lg shadow-lg overflow-hidden" style={{ backgroundColor: '#F7E9A0' }}>
          <table className="w-full">
            <thead style={{ backgroundColor: '#E9C46A' }}>
              <tr>
                <th className="text-left py-3 px-4 font-semibold" style={{ color: '#3E3E3E' }}>Product</th>
                <th className="text-left py-3 px-4 font-semibold" style={{ color: '#3E3E3E' }}>Category</th>
                <th className="text-left py-3 px-4 font-semibold" style={{ color: '#3E3E3E' }}>Price</th>
                <th className="text-left py-3 px-4 font-semibold" style={{ color: '#3E3E3E' }}>Stock</th>
                <th className="text-left py-3 px-4 font-semibold" style={{ color: '#3E3E3E' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {recentProducts.map((product, index) => (
                <tr key={product.id} className={index % 2 === 0 ? '' : 'bg-black bg-opacity-5'}>
                  <td className="py-3 px-4">
                    <p className="font-medium" style={{ color: '#3E3E3E' }}>{product.name}</p>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-sm" style={{ color: '#3E3E3E' }}>
                      {product.category_name || 'N/A'}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-medium" style={{ color: '#3E3E3E' }}>
                      Rp {product.price?.toLocaleString()}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-medium" style={{ color: '#3E3E3E' }}>
                      {product.stock}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span 
                      className="px-2 py-1 rounded-full text-xs font-medium"
                      style={{
                        backgroundColor: product.stock > product.min_stock ? '#4CAF50' : '#FF9800',
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