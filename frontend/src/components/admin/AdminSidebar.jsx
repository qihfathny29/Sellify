import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import logoSellify from '../../assets/images/logo-sellify.png';

const AdminSidebar = ({ isCollapsed, setIsCollapsed }) => {
  const location = useLocation();
  const [expandedItems, setExpandedItems] = useState({});

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊', path: '/admin', subItems: [] },
    { id: 'products', label: 'Products', icon: '📦', path: '/admin/products', subItems: [] },
    { id: 'transactions', label: 'Transactions', icon: '💰', path: '/admin/transactions', subItems: [] },
    { id: 'reports', label: 'Reports', icon: '📈', path: '/admin/reports', subItems: [] },
    { id: 'users', label: 'User Management', icon: '👥', path: '/admin/users', subItems: [] },
    { id: 'settings', label: 'Settings', icon: '⚙️', path: '/admin/settings', subItems: [] }
  ];

  const isActive = (path) => {
    if (path === '/admin') return location.pathname === '/admin';
    return location.pathname.startsWith(path);
  };

  return (
    <div className={'fixed left-0 top-0 h-full transition-all duration-300 z-40 shadow-xl ' + (isCollapsed ? 'w-16' : 'w-64')}
      style={{ backgroundColor: '#FFFFFF', borderRight: '2px solid #E0E0E0' }}>
      <div className="p-6 border-b" style={{ borderColor: '#E0E0E0' }}>
        <div className="flex items-center justify-center">
          <img src={logoSellify} alt="Sellify" className={isCollapsed ? "w-10 h-10 object-contain" : "w-20 h-20 object-contain"} />
        </div>
      </div>
      <nav className="py-4">
        <ul className="space-y-1 px-3">
          {menuItems.map((item) => (
            <li key={item.id}>
              <Link to={item.path} className={'flex items-center px-4 py-3 rounded-xl transition-all duration-200 ' + (isActive(item.path) ? 'shadow-md' : '')}
                style={{ backgroundColor: isActive(item.path) ? '#2C3E50' : 'transparent', color: isActive(item.path) ? '#FFFFFF' : '#2C3E50' }}>
                <span className="text-xl mr-3">{item.icon}</span>
                {!isCollapsed && <span className="flex-1 font-semibold text-sm">{item.label}</span>}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};

export default AdminSidebar;
