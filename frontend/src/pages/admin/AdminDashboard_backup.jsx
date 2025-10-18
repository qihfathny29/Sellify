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
  const [categories, setCategories] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Get products data
      const productsResponse = await api.get('/products?limit=5');
      const products = productsResponse.data.data;
      
      // Calculate stats
      const lowStock = products.filter(p => p.stock_status === 'low' || p.stock_status === 'out').length;
      
      setStats({
        totalProducts: productsResponse.data.pagination.total,
        totalUsers: 3,
        lowStockProducts: lowStock,
        todaySales: 0
      });
      
      setRecentProducts(products);
      
      // Get categories
      const categoriesResponse = await api.get('/products/categories/all');
      setCategories(categoriesResponse.data.data);
      
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    navigate('/login');
  };

  // Simple StatsCard component (inline)
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
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#FFD56B';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = '#E9C46A';
              }}
            >
              Manage Products
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-2 rounded-md font-medium transition-all duration-200 border-2"
              style={{ 
                backgroundColor: 'transparent',
                color: '#3E3E3E',
                borderColor: '#E9C46A'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#E9C46A';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'transparent';
              }}
          </button>

        {/* Recent Products */}
        <div className="grid grid-cols-1 gap-6 mb-8">
          <StatsCard
            title="Total Products"
            value={stats.totalProducts}
            subtitle="Active products in store"
            icon="📦"
          />
          <StatsCard
            title="Total Users"
            value={stats.totalUsers}
            subtitle="Admin & Kasir accounts"
            icon="👥"
          />
          <StatsCard
            title="Low Stock Alert"
            value={stats.lowStockProducts}
            subtitle="Products need restock"
            icon="⚠️"
            isAlert={stats.lowStockProducts > 0}
          />
          <StatsCard
            title="Today's Sales"
            value={`Rp ${stats.todaySales.toLocaleString()}`}
            subtitle="Revenue today"
            icon="💰"
          />
        </div>

        {/* Recent Products */}
        <div className="rounded-lg shadow-lg p-6" style={{ backgroundColor: '#F7E9A0' }}>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold" style={{ color: '#3E3E3E' }}>
              Recent Products
            </h2>
            <div className="flex space-x-2">
              <button
                onClick={() => navigate('/admin/products?action=add')} // Tambah parameter
                className="px-4 py-2 rounded-md font-medium transition-all duration-200"
                style={{ 
                  backgroundColor: '#E9C46A',
                  color: '#3E3E3E'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#FFD56B';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = '#E9C46A';
                }}
              >
                + Add Product
              </button>
              <button
                onClick={() => navigate('/admin/products')}
                className="text-sm font-medium hover:underline"
                style={{ color: '#3E3E3E' }}
              >
                View All Products →
              </button>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2" style={{ borderColor: '#E9C46A' }}>
                  <th className="text-left py-2 px-4 font-medium" style={{ color: '#3E3E3E' }}>Product</th>
                  <th className="text-left py-2 px-4 font-medium" style={{ color: '#3E3E3E' }}>Category</th>
                  <th className="text-left py-2 px-4 font-medium" style={{ color: '#3E3E3E' }}>Price</th>
                  <th className="text-left py-2 px-4 font-medium" style={{ color: '#3E3E3E' }}>Stock</th>
                  <th className="text-left py-2 px-4 font-medium" style={{ color: '#3E3E3E' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentProducts.map((product) => (
                  <tr key={product.id} className="border-b hover:opacity-75 transition-opacity" style={{ borderColor: '#E9C46A' }}>
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-medium" style={{ color: '#3E3E3E' }}>{product.name}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4" style={{ color: '#3E3E3E' }}>
                      {product.category_name}
                    </td>
                    <td className="py-3 px-4 font-medium" style={{ color: '#3E3E3E' }}>
                      Rp {product.price.toLocaleString()}
                    </td>
                    <td className="py-3 px-4" style={{ color: '#3E3E3E' }}>
                      {product.stock}
                    </td>
                    <td className="py-3 px-4">
                      <span 
                        className="px-3 py-1 rounded-full text-xs font-medium"
                        style={{
                          backgroundColor: product.stock_status === 'normal' ? '#E9C46A' : 
                                          product.stock_status === 'low' ? '#FFD56B' : '#FF6B6B',
                          color: '#3E3E3E'
                        }}
                      >
                        {product.stock_status === 'normal' ? 'Normal' :
                         product.stock_status === 'low' ? 'Low Stock' : 'Out of Stock'}
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