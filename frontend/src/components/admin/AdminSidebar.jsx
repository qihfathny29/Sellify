import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import logoSellify from '../../assets/images/logo-sellify.png';
import { 
  FaChartBar, 
  FaBox, 
  FaMoneyBillWave, 
  FaChartLine, 
  FaUsers, 
  FaCog 
} from 'react-icons/fa';

const AdminSidebar = ({ isCollapsed, setIsCollapsed }) => {
  const location = useLocation();
  const [expandedItems, setExpandedItems] = useState({});

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', Icon: FaChartBar, path: '/admin', subItems: [] },
    { id: 'products', label: 'Products', Icon: FaBox, path: '/admin/products', subItems: [] },
    { id: 'transactions', label: 'Transactions', Icon: FaMoneyBillWave, path: '/admin/transactions', subItems: [] },
    { id: 'reports', label: 'Reports', Icon: FaChartLine, path: '/admin/reports', subItems: [] },
    { id: 'users', label: 'User Management', Icon: FaUsers, path: '/admin/users', subItems: [] },
    { id: 'settings', label: 'Settings', Icon: FaCog, path: '/admin/settings', subItems: [] }
  ];

  const isActive = (path) => {
    if (path === '/admin') return location.pathname === '/admin';
    return location.pathname.startsWith(path);
  };

  return (
    <div className={'fixed left-0 top-0 h-full transition-all duration-300 z-40 shadow-xl ' + (isCollapsed ? 'w-16' : 'w-64')}
      style={{ backgroundColor: '#FFFFFF', borderRight: '2px solid #E0E0E0' }}>
      <div className="p-6 border-b" style={{ borderColor: '#2C3E50' }}>  {/* Ganti ke #CBD5E1 biar lebih kontras, bukan putih samar */}
        <div className="flex items-center justify-center">
          <img src={logoSellify} alt="Sellify" className={isCollapsed ? "w-10 h-10 object-contain" : "w-20 h-20 object-contain"} />
        </div>
      </div>
      <nav className="py-6">
        <ul className="space-y-3 px-3">
          {menuItems.map((item) => (
            <li key={item.id}>
              <Link to={item.path} 
                className={'flex items-center px-4 py-4 rounded-xl transition-all duration-200 ' + (isActive(item.path) ? 'font-bold border-b-2 border-blue-500' : '')}
                style={{ 
                  color: isActive(item.path) ? '#2C3E50' : '#7F8C8D', 
                  backgroundColor: 'transparent' 
                }}>
                <span className="text-xl mr-3 flex-shrink-0">
                  <item.Icon style={{ color: isActive(item.path) ? '#2C3E50' : '#7F8C8D', fontSize: '1.5rem' }} />
                </span>
                {!isCollapsed && <span className="flex-1 font-semibold text-base">{item.label}</span>}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};

export default AdminSidebar;