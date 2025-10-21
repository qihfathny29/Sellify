import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const KasirLayout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const menuItems = [
    { path: '/kasir/dashboard', icon: '🏠', label: 'Dashboard' },
    { path: '/kasir/pos', icon: '💰', label: 'POS System' },
    { path: '/kasir/products', icon: '📦', label: 'Products' },
    { path: '/kasir/transactions', icon: '📋', label: 'Transaksi Saya' },
    { path: '/kasir/profile', icon: '👤', label: 'Profile' }
  ];

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FFFCF2' }}>
      {/* Top Navigation Bar */}
      <nav className="shadow-lg" style={{ backgroundColor: '#E9C46A' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold" style={{ color: '#3E3E3E' }}>
                🏪 Sellify - Kasir
              </h1>
            </div>
            
            {/* User Info */}
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="font-medium" style={{ color: '#3E3E3E' }}>
                  {user.name || 'Kasir'}
                </p>
                <p className="text-xs opacity-70" style={{ color: '#3E3E3E' }}>
                  {user.role || 'kasir'}
                </p>
              </div>
              <button
                onClick={() => setShowLogoutModal(true)}
                className="px-4 py-2 rounded-md font-medium transition-colors duration-200"
                style={{ 
                  backgroundColor: '#3E3E3E',
                  color: '#FFFCF2'
                }}
              >
                🚪 Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content with Sidebar */}
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 min-h-screen shadow-lg" style={{ backgroundColor: '#F7E9A0' }}>
          <nav className="mt-5 px-2">
            {menuItems.map((item) => (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center px-4 py-3 mb-2 text-left rounded-lg transition-colors duration-200 ${
                  location.pathname === item.path ? 'font-bold' : ''
                }`}
                style={{
                  backgroundColor: location.pathname === item.path ? '#E9C46A' : 'transparent',
                  color: '#3E3E3E'
                }}
              >
                <span className="text-2xl mr-3">{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="max-w-md w-full rounded-lg shadow-xl p-6" style={{ backgroundColor: '#F7E9A0' }}>
            <h2 className="text-2xl font-bold mb-4" style={{ color: '#3E3E3E' }}>
              🚪 Konfirmasi Logout
            </h2>
            <p className="mb-6" style={{ color: '#3E3E3E' }}>
              Yakin mau logout dari sistem?
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="px-6 py-2 rounded-md font-medium border-2 transition-colors duration-200"
                style={{ 
                  backgroundColor: 'transparent',
                  color: '#3E3E3E',
                  borderColor: '#E9C46A'
                }}
              >
                Batal
              </button>
              <button
                onClick={handleLogout}
                className="px-6 py-2 rounded-md font-medium transition-colors duration-200"
                style={{ 
                  backgroundColor: '#FF5722',
                  color: 'white'
                }}
              >
                Ya, Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KasirLayout;