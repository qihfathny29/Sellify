import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';

const AdminLayout = ({ children }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('role');
    setShowDropdown(false);
    window.location.href = '/login';
  };

  const handleProfileClick = () => {
    setShowDropdown(false);
    navigate('/admin/profile');
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
      {/* Sidebar */}
      <AdminSidebar 
        isCollapsed={sidebarCollapsed} 
        setIsCollapsed={setSidebarCollapsed} 
      />

      {/* Main Content Area */}
      <div 
        className={`transition-all duration-300 ${
          sidebarCollapsed ? 'ml-16' : 'ml-64'
        }`}
      >
        {/* Top Header - Navy Theme */}
        <header 
          className="sticky top-0 z-50 px-6 py-4 shadow-md"
          style={{ backgroundColor: '#2C3E50' }}
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold" style={{ color: '#FFFFFF' }}>
                Admin Dashboard
              </h1>
              <p className="text-sm opacity-80" style={{ color: '#ECF0F1' }}>
                Manage your store efficiently
              </p>
            </div>
            
            <div className="flex items-center space-x-4 relative">
              {/* Notifications */}
              <button className="relative p-2 rounded-full hover:bg-white hover:bg-opacity-10 transition-colors">
                <span className="text-xl">🔔</span>
                <span 
                  className="absolute -top-1 -right-1 w-5 h-5 rounded-full text-xs flex items-center justify-center font-bold"
                  style={{ backgroundColor: '#E74C3C', color: '#FFFFFF' }}
                >
                  3
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
                    👤
                  </div>
                  <div className="text-left hidden md:block">
                    <p className="font-semibold text-sm">Admin</p>
                    <p className="text-xs opacity-80">Administrator</p>
                  </div>
                  <span className="text-sm">
                    {showDropdown ? '▲' : '▼'}
                  </span>
                </button>

                {/* Dropdown Menu */}
                {showDropdown && (
                  <div 
                    className="absolute right-0 mt-2 w-56 rounded-xl shadow-2xl overflow-hidden"
                    style={{ backgroundColor: '#FFFFFF' }}
                  >
                    <div className="p-4 border-b" style={{ borderColor: '#ECF0F1', backgroundColor: '#F8F9FA' }}>
                      <p className="font-bold" style={{ color: '#2C3E50' }}>Admin Account</p>
                      <p className="text-xs opacity-70" style={{ color: '#7F8C8D' }}>admin@sellify.com</p>
                    </div>

                    <div className="py-2">
                      <button
                        onClick={handleProfileClick}
                        className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors duration-150 flex items-center gap-3"
                        style={{ color: '#2C3E50' }}
                      >
                        <span className="text-lg">👤</span>
                        <span className="font-medium">Profile Settings</span>
                      </button>

                      <button
                        onClick={handleLogout}
                        className="w-full px-4 py-3 text-left transition-colors duration-150 flex items-center gap-3"
                        style={{ color: '#E74C3C' }}
                        onMouseEnter={(e) => e.target.style.backgroundColor = '#FFEBEE'}
                        onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                      >
                        <span className="text-lg">🚪</span>
                        <span className="font-medium">Logout</span>
                      </button>
                    </div>
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

export default AdminLayout;
