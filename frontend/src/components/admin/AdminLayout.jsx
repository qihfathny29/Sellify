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
    // Hard redirect to avoid infinite loop
    window.location.href = '/login';
  };

  const handleProfileClick = () => {
    setShowDropdown(false);
    navigate('/admin/profile');
  };

  // Handle click outside dropdown
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
    <div className="min-h-screen" style={{ backgroundColor: '#FFFCF2' }}>
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
        {/* Top Header */}
        <header 
          className="sticky top-0 z-50 px-6 py-4 border-b"
          style={{ backgroundColor: '#F7E9A0', borderColor: '#E9C46A' }}
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold" style={{ color: '#3E3E3E' }}>
                Admin Dashboard
              </h1>
              <p className="text-sm opacity-70" style={{ color: '#3E3E3E' }}>
                Manage your store efficiently
              </p>
            </div>
            
            <div className="flex items-center space-x-4 relative">
              {/* Notifications */}
              <button className="relative p-2 rounded-full hover:bg-black hover:bg-opacity-10 transition-colors">
                <span className="text-xl">🔔</span>
                <span 
                  className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-xs flex items-center justify-center text-white"
                  style={{ backgroundColor: '#FF6B6B' }}
                >
                  3
                </span>
              </button>

              {/* User Profile Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center space-x-2 p-2 rounded-md hover:bg-yellow-400 transition-colors duration-200"
                  style={{ 
                    backgroundColor: 'transparent',
                    color: '#3E3E3E'
                  }}
                >
                    <div 
                      className="w-8 h-8 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: '#E9C46A' }}
                    >
                      <span className="text-sm font-bold" style={{ color: '#3E3E3E' }}>A</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium" style={{ color: '#3E3E3E' }}>Admin</p>
                      <p className="text-xs opacity-70" style={{ color: '#3E3E3E' }}>Online</p>
                    </div>
                    <span className="text-sm" style={{ color: '#3E3E3E' }}>▼</span>
                  </button>

                  {/* Dropdown Menu */}
                  {showDropdown && (
                    <div 
                      className="absolute right-0 mt-2 w-48 rounded-md shadow-lg border"
                      style={{ 
                        backgroundColor: '#F7E9A0',
                        borderColor: '#E9C46A',
                        zIndex: 9999
                      }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="py-1">
                        {/* Profile Option */}
                        <button
                          onClick={handleProfileClick}
                          className="flex items-center w-full px-4 py-2 text-sm transition-colors duration-200 hover:bg-yellow-400 cursor-pointer"
                          style={{ 
                            color: '#3E3E3E',
                            backgroundColor: 'transparent'
                          }}
                        >
                          <span className="mr-3">👤</span>
                          Profile
                        </button>
                        
                        {/* Divider */}
                        <hr style={{ borderColor: '#E9C46A' }} />
                        
                        {/* Logout Option */}
                        <button
                          onClick={() => {
                            setShowDropdown(false);
                            handleLogout();
                          }}
                          className="flex items-center w-full px-4 py-2 text-sm transition-colors duration-200 hover:bg-red-400 cursor-pointer"
                          style={{ 
                            color: '#3E3E3E',
                            backgroundColor: 'transparent'
                          }}
                        >
                          <span className="mr-3">🚪</span>
                          Logout
                        </button>
                      </div>
                    </div>
                  )}
                </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">
          {children}
        </main>
      </div>


    </div>
  );
};

export default AdminLayout;