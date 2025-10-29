import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import logoSellify from '../../assets/images/logo-sellify.png';
import { 
  FaChartBar, 
  FaMoneyBillWave, 
  FaBox, 
  FaClipboardList, 
  FaUser, 
  FaBell, 
  FaDoorOpen 
} from 'react-icons/fa';

const KasirLayout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const menuItems = [
    { path: '/kasir/dashboard', Icon: FaChartBar, label: 'Dashboard' },
    { path: '/kasir/pos', Icon: FaMoneyBillWave, label: 'POS System' },
    { path: '/kasir/products', Icon: FaBox, label: 'Products' },
    { path: '/kasir/transactions', Icon: FaClipboardList, label: 'Transaksi Saya' },
    { path: '/kasir/profile', Icon: FaUser, label: 'Profile' }
  ];

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('user');
    setShowDropdown(false);
    window.location.href = '/login';
  };

  const handleProfileClick = () => {
    setShowDropdown(false);
    navigate('/kasir/profile');
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      setTimeout(() => {
        document.addEventListener('mousedown', handleClickOutside);
      }, 100);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDropdown]);

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F5F5F5' }}>
      {/* Sidebar - Mirip Admin */}
      <aside 
        className={`fixed top-0 left-0 h-screen shadow-lg transition-all duration-300 z-40 ${
          sidebarCollapsed ? 'w-16' : 'w-64'
        }`}
        style={{ backgroundColor: '#FFFFFF' }}
      >
        {/* Logo & Toggle */}
        <div className="p-4 border-b" style={{ borderColor: '#2C3E50' }}>  {/* Ganti ke #2C3E50 biar kontras */}
          <div className="flex items-center justify-between">
            {!sidebarCollapsed ? (
              <>
                <img 
                  src={logoSellify} 
                  alt="Sellify Logo" 
                  className="h-16 w-16 object-contain mx-auto"
                />
                <button
                  onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  style={{ color: '#2C3E50' }}
                >
                  ←
                </button>
              </>
            ) : (
              <div className="flex flex-col items-center w-full">
                <img 
                  src={logoSellify} 
                  alt="Sellify" 
                  className="h-16 w-16 object-contain mx-auto mb-2"
                />
                <button
                  onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  style={{ color: '#2C3E50' }}
                >
                  →
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Menu Items - Mirip Admin */}
        <nav className="py-6 px-3">  {/* Tambah py-6 buat top/bottom lega */}
          <ul className="space-y-3">  {/* space-y-3 buat jarak antar item lebar */}
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <li key={item.path}>
                  <button
                    onClick={() => navigate(item.path)}
                    className={`w-full flex items-center px-4 py-4 rounded-xl transition-all duration-200 ${isActive ? 'font-bold border-b-2 border-blue-500' : ''}`}  
                    style={{
                      backgroundColor: 'transparent',  // Selalu transparent, no bg
                      color: isActive ? '#2C3E50' : '#7F8C8D'  // Warna text active gelap, non-active abu
                    }}
                    title={sidebarCollapsed ? item.label : ''}
                  >
                    <span className="text-xl mr-3 flex-shrink-0">  {/* mr-3 biar jarak icon-text pas */}
                      <item.Icon style={{ color: isActive ? '#2C3E50' : '#7F8C8D', fontSize: '1.5rem' }} />  {/* Icon ikut warna, size 1.5rem */}
                    </span>
                    {!sidebarCollapsed && (
                      <span className="flex-1 font-semibold text-base">{item.label}</span>  
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>

      {/* Main Content Area */}
      <div 
        className={`transition-all duration-300 ${
          sidebarCollapsed ? 'ml-16' : 'ml-64'
        }`}
      >
        {/* Top Header */}
        <header 
          className="sticky top-0 z-50 px-6 py-4 shadow-md"
          style={{ backgroundColor: '#2C3E50' }}
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold" style={{ color: '#FFFFFF' }}>
                Kasir Dashboard
              </h1>
              <p className="text-sm opacity-80" style={{ color: '#ECF0F1' }}>
                Point of Sale System
              </p>
            </div>
            
            <div className="flex items-center space-x-4 relative">
              {/* Notifications - Ganti emoji ke icon */}
              <button className="relative p-2 rounded-full hover:bg-white hover:bg-opacity-10 transition-colors">
                <FaBell className="text-xl" style={{ color: '#FFFFFF' }} />
                <span 
                  className="absolute -top-1 -right-1 w-5 h-5 rounded-full text-xs flex items-center justify-center font-bold"
                  style={{ backgroundColor: '#E74C3C', color: '#FFFFFF' }}
                >
                  0
                </span>
              </button>

              {/* User Profile Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center space-x-3 px-4 py-2 rounded-lg transition-all duration-200"
                  style={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    color: '#FFFFFF'
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.2)'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'}
                >
                  <div 
                    className="w-10 h-10 rounded-full flex items-center justify-center text-xl font-bold"
                    style={{ backgroundColor: '#34495E', color: '#FFFFFF' }}
                  >
                    <FaUser />  {/* Ganti emoji ke icon */}
                  </div>
                  <div className="text-left">
                    <p className="font-medium">{user.name || 'Kasir'}</p>
                    <p className="text-xs opacity-70">{user.role || 'Kasir'}</p>
                  </div>
                  <span className="text-xs">▼</span>
                </button>

                {/* Dropdown Menu */}
                {showDropdown && (
                  <div 
                    className="absolute right-0 mt-2 w-48 rounded-lg shadow-xl overflow-hidden"
                    style={{ backgroundColor: '#FFFFFF' }}
                  >
                    <button
                      onClick={handleProfileClick}
                      className="w-full px-4 py-3 text-left hover:bg-gray-100 transition-colors flex items-center"
                      style={{ color: '#2C3E50' }}
                    >
                      <FaUser className="mr-3 text-lg" style={{ color: '#2C3E50' }} />  {/* Ganti emoji ke icon */}
                      Profile
                    </button>
                    <button
                      onClick={handleLogout}
                      className="w-full px-4 py-3 text-left hover:bg-gray-100 transition-colors flex items-center border-t"
                      style={{ color: '#E74C3C', borderColor: '#E8E8E8' }}
                    >
                      <FaDoorOpen className="mr-3 text-lg" style={{ color: '#E74C3C' }} />  {/* Ganti emoji ke icon */}
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default KasirLayout;