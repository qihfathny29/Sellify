import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import logoSellify from '../../assets/images/logo-sellify.png';

const AdminSidebar = ({ isCollapsed, setIsCollapsed }) => {
  const location = useLocation();
  const [expandedItems, setExpandedItems] = useState({});

  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: '📊',
      path: '/admin',
      subItems: []
    },
    {
      id: 'products',
      label: 'Products',
      icon: '📦',
      path: '/admin/products',
      subItems: [
        { label: 'All Products', path: '/admin/products' },
        { label: 'Add Product', path: '/admin/products?add=true' },
        { label: 'Categories', path: '/admin/categories' }
      ]
    },
    {
      id: 'transactions',
      label: 'Transactions',
      icon: '💰',
      path: '/admin/transactions',
      subItems: [
        { label: "Today's Sales", path: '/admin/transactions/today' },
        { label: 'Transaction History', path: '/admin/transactions/history' }
      ]
    },
    {
      id: 'reports',
      label: 'Reports',
      icon: '📈',
      path: '/admin/reports',
      subItems: [
        { label: 'Sales Report', path: '/admin/reports/sales' },
        { label: 'Stock Report', path: '/admin/reports/stock' },
        { label: 'Profit Analysis', path: '/admin/reports/profit' }
      ]
    },
    {
      id: 'users',
      label: 'User Management',
      icon: '👥',
      path: '/admin/users',
      subItems: [
        { label: 'Kasir Accounts', path: '/admin/users' },
        { label: 'Activity Log', path: '/admin/users/activity' }
      ]
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: '⚙️',
      path: '/admin/settings',
      subItems: [
        { label: 'Store Info', path: '/admin/settings/store' },
        { label: 'Payment Methods', path: '/admin/settings/payment' },
        { label: 'Notifications', path: '/admin/settings/notifications' }
      ]
    }
  ];

  const toggleExpanded = (itemId) => {
    setExpandedItems(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
  };

  // FIX: Better active state detection
  const isActive = (path) => {
    if (path === '/admin') {
      // Dashboard only active on exact /admin path
      return location.pathname === '/admin';
    }
    // For other paths, check if current path starts with the menu path
    return location.pathname.startsWith(path);
  };

  const isParentActive = (item) => {
    // Check if main item path is active
    if (isActive(item.path)) return true;
    
    // Check if any sub-item is active
    return item.subItems.some(subItem => isActive(subItem.path));
  };

  return (
    <div 
      className={`fixed left-0 top-0 h-full transition-all duration-300 z-40 ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}
      style={{ backgroundColor: '#F7E9A0' }}
    >
      {/* Sidebar Header - Logo Only & Centered */}
      <div className="p-6 border-b" style={{ borderColor: '#E9C46A' }}>
        <div className="flex items-center justify-between">
          {/* Logo - Always centered, SUPER GEDE banget! */}
          <div className={`flex ${isCollapsed ? 'justify-center w-full' : 'justify-center flex-1'}`}>
            <img 
              src={logoSellify} 
              alt="Sellify Logo" 
              className={isCollapsed ? "w-12 h-12 object-contain" : "w-24 h-24 object-contain"} // SUPER GEDE: w-24 h-24 (96px!)
            />
          </div>
          
          {/* Collapse Button - Only show when expanded */}
          {!isCollapsed && (
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-2 rounded-md transition-colors duration-200 ml-2"
              style={{ 
                backgroundColor: 'transparent',
                color: '#3E3E3E' 
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#E9C46A'}
              onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
            >
              <span className="text-lg">←</span>
            </button>
          )}
        </div>
        
        {/* Collapse button for collapsed state - separate row */}
        {isCollapsed && (
          <div className="flex justify-center mt-2">
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-1 rounded-md transition-colors duration-200"
              style={{ 
                backgroundColor: 'transparent',
                color: '#3E3E3E' 
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#E9C46A'}
              onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
            >
              <span className="text-sm">→</span>
            </button>
          </div>
        )}
      </div>

      {/* Menu Items */}
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1">
          {menuItems.map((item) => (
            <li key={item.id}>
              {/* Main Menu Item */}
              <div>
                <Link
                  to={item.path}
                  className={`flex items-center px-4 py-3 transition-colors duration-200 ${
                    isParentActive(item)
                      ? 'text-white'
                      : 'hover:text-white'
                  }`}
                  style={{
                    backgroundColor: isParentActive(item) ? '#E9C46A' : 'transparent',
                    color: isParentActive(item) ? '#3E3E3E' : '#3E3E3E'
                  }}
                  onMouseEnter={(e) => {
                    if (!isParentActive(item)) {
                      e.target.style.backgroundColor = '#FFD56B';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isParentActive(item)) {
                      e.target.style.backgroundColor = 'transparent';
                    }
                  }}
                  onClick={() => {
                    if (item.subItems.length > 0 && !isCollapsed) {
                      toggleExpanded(item.id);
                    }
                  }}
                >
                  <span className="text-xl mr-3">{item.icon}</span>
                  {!isCollapsed && (
                    <>
                      <span className="flex-1 font-medium">{item.label}</span>
                      {item.subItems.length > 0 && (
                        <span className={`transform transition-transform duration-200 ${
                          expandedItems[item.id] ? 'rotate-90' : ''
                        }`}>
                          ▶
                        </span>
                      )}
                    </>
                  )}
                </Link>

                {/* Sub Menu Items */}
                {!isCollapsed && item.subItems.length > 0 && expandedItems[item.id] && (
                  <ul style={{ backgroundColor: '#E9C46A' }}>
                    {item.subItems.map((subItem, index) => (
                      <li key={index}>
                        <Link
                          to={subItem.path}
                          className="flex items-center px-12 py-2 text-sm transition-colors duration-200"
                          style={{
                            backgroundColor: isActive(subItem.path) ? '#FFD56B' : 'transparent',
                            color: '#3E3E3E'
                          }}
                          onMouseEnter={(e) => {
                            if (!isActive(subItem.path)) {
                              e.target.style.backgroundColor = '#FFD56B';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!isActive(subItem.path)) {
                              e.target.style.backgroundColor = 'transparent';
                            }
                          }}
                        >
                          <span className="mr-2">•</span>
                          {subItem.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </li>
          ))}
        </ul>
      </nav>

      {/* User Info (Bottom) */}
      {!isCollapsed && (
        <div className="p-4 border-t" style={{ borderColor: '#E9C46A' }}>
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: '#E9C46A' }}>
              <span className="text-sm font-bold" style={{ color: '#3E3E3E' }}>A</span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium" style={{ color: '#3E3E3E' }}>Admin</p>
              <p className="text-xs opacity-70" style={{ color: '#3E3E3E' }}>Administrator</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSidebar;