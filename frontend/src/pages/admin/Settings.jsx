import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import api from '../../api/axios';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('store');
  const [loading, setLoading] = useState(false);
  const [storeSettings, setStoreSettings] = useState({
    name: 'Warung Maju Jaya',
    address: 'Jl. Sudirman No. 123, Jakarta',
    phone: '08123456789',
    email: 'warung@email.com',
    businessHours: '08:00 - 22:00',
    logo: null
  });

  const [paymentSettings, setPaymentSettings] = useState({
    cash: true,
    qris: true,
    bankTransfer: false,
    debitCard: false,
    ewallet: true
  });

  const [receiptSettings, setReceiptSettings] = useState({
    headerText: 'Warung Maju Jaya',
    footerText: 'Terima kasih sudah berbelanja!',
    fontSize: 'medium',
    paperSize: '80mm',
    autoPrint: true,
    showLogo: true
  });

  const [notificationSettings, setNotificationSettings] = useState({
    emailLowStock: true,
    whatsappNotifications: false,
    smsAlerts: false,
    dailyReport: true,
    weeklyReport: true
  });

  const [systemSettings, setSystemSettings] = useState({
    currency: 'IDR',
    taxRate: 10,
    autoBackup: true,
    sessionTimeout: 30,
    language: 'id'
  });

  const handleSaveSettings = async (settingsType) => {
    setLoading(true);
    try {
      // TODO: Save to backend
      await new Promise(resolve => setTimeout(resolve, 1000)); // Mock delay
      alert(`${settingsType} settings saved successfully!`);
    } catch (error) {
      alert('Failed to save settings: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'store', label: ' Store Info', icon: '🏪' },
    { id: 'payment', label: ' Payment', icon: '💳' },
    { id: 'receipt', label: ' Receipt', icon: '🧾' },
    { id: 'notifications', label: ' Notifications', icon: '🔔' },
    { id: 'system', label: ' System', icon: '⚙️' }
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold" style={{ color: '#2C3E50' }}>⚙️ Settings</h1>
          <p className="opacity-70 mt-1" style={{ color: '#2C3E50' }}>
            Configure your store settings and preferences
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="border-b" style={{ borderColor: '#2C3E50' }}>
          <nav className="flex space-x-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-3 text-sm font-medium rounded-t-lg transition-colors duration-200 ${
                  activeTab === tab.id 
                    ? 'border-b-2' 
                    : 'hover:opacity-75'
                }`}
                style={{
                  backgroundColor: activeTab === tab.id ? '#FFFFFF' : 'transparent',
                  color: '#2C3E50',
                  borderColor: activeTab === tab.id ? '#2C3E50' : 'transparent'
                }}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="rounded-lg shadow-lg p-6" style={{ backgroundColor: '#FFFFFF' }}>
          
          {/* Store Info Tab */}
          {activeTab === 'store' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold" style={{ color: '#2C3E50' }}>
                🏪 Store Information
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: '#2C3E50' }}>
                    Store Name
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border-2 rounded-md focus:outline-none"
                    style={{ 
                      borderColor: '#2C3E50',
                      backgroundColor: '#F8F9FA',
                      color: '#2C3E50'
                    }}
                    value={storeSettings.name}
                    onChange={(e) => setStoreSettings({...storeSettings, name: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: '#2C3E50' }}>
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    className="w-full px-3 py-2 border-2 rounded-md focus:outline-none"
                    style={{ 
                      borderColor: '#2C3E50',
                      backgroundColor: '#F8F9FA',
                      color: '#2C3E50'
                    }}
                    value={storeSettings.phone}
                    onChange={(e) => setStoreSettings({...storeSettings, phone: e.target.value})}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2" style={{ color: '#2C3E50' }}>
                    Address
                  </label>
                  <textarea
                    rows="3"
                    className="w-full px-3 py-2 border-2 rounded-md focus:outline-none resize-none"
                    style={{ 
                      borderColor: '#2C3E50',
                      backgroundColor: '#F8F9FA',
                      color: '#2C3E50'
                    }}
                    value={storeSettings.address}
                    onChange={(e) => setStoreSettings({...storeSettings, address: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: '#2C3E50' }}>
                    Email
                  </label>
                  <input
                    type="email"
                    className="w-full px-3 py-2 border-2 rounded-md focus:outline-none"
                    style={{ 
                      borderColor: '#2C3E50',
                      backgroundColor: '#F8F9FA',
                      color: '#2C3E50'
                    }}
                    value={storeSettings.email}
                    onChange={(e) => setStoreSettings({...storeSettings, email: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: '#2C3E50' }}>
                    Business Hours
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border-2 rounded-md focus:outline-none"
                    style={{ 
                      borderColor: '#2C3E50',
                      backgroundColor: '#F8F9FA',
                      color: '#2C3E50'
                    }}
                    value={storeSettings.businessHours}
                    onChange={(e) => setStoreSettings({...storeSettings, businessHours: e.target.value})}
                    placeholder="e.g., 08:00 - 22:00"
                  />
                </div>
              </div>

              <button
                onClick={() => handleSaveSettings('Store')}
                disabled={loading}
                className="px-6 py-3 rounded-lg font-semibold transition-all duration-200 disabled:opacity-50 shadow-md hover:shadow-lg"
                style={{ 
                  backgroundColor: '#2C3E50',
                  color: '#FFFFFF'
                }}
              >
                {loading ? 'Saving...' : '💾 Save Store Info'}
              </button>
            </div>
          )}

          {/* Payment Methods Tab */}
          {activeTab === 'payment' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold" style={{ color: '#2C3E50' }}>
                💳 Payment Methods
              </h2>
              
              <div className="space-y-4">
                {Object.entries(paymentSettings).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between p-4 rounded-md" style={{ backgroundColor: '#F8F9FA' }}>
                    <div className="flex items-center">
                      <span className="mr-3 text-2xl">
                        {key === 'cash' && '💵'}
                        {key === 'qris' && '📱'}
                        {key === 'bankTransfer' && '🏦'}
                        {key === 'debitCard' && '💳'}
                        {key === 'ewallet' && '📲'}
                      </span>
                      <div>
                        <p className="font-medium" style={{ color: '#2C3E50' }}>
                          {key === 'cash' && 'Cash/Tunai'}
                          {key === 'qris' && 'QRIS (Gopay, OVO, Dana)'}
                          {key === 'bankTransfer' && 'Bank Transfer'}
                          {key === 'debitCard' && 'Debit/Credit Card'}
                          {key === 'ewallet' && 'E-Wallet'}
                        </p>
                        <p className="text-sm opacity-70" style={{ color: '#2C3E50' }}>
                          {value ? 'Active' : 'Inactive'}
                        </p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={value}
                        onChange={(e) => setPaymentSettings({...paymentSettings, [key]: e.target.checked})}
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                    </label>
                  </div>
                ))}
              </div>

              <button
                onClick={() => handleSaveSettings('Payment')}
                disabled={loading}
                className="px-6 py-3 rounded-lg font-semibold transition-all duration-200 disabled:opacity-50 shadow-md hover:shadow-lg"
                style={{ 
                  backgroundColor: '#2C3E50',
                  color: '#FFFFFF'
                }}
              >
                {loading ? 'Saving...' : '💾 Save Payment Settings'}
              </button>
            </div>
          )}

          {/* Receipt Settings Tab */}
          {activeTab === 'receipt' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold" style={{ color: '#2C3E50' }}>
                🧾 Receipt Settings
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: '#2C3E50' }}>
                    Header Text
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border-2 rounded-md focus:outline-none"
                    style={{ 
                      borderColor: '#2C3E50',
                      backgroundColor: '#F8F9FA',
                      color: '#2C3E50'
                    }}
                    value={receiptSettings.headerText}
                    onChange={(e) => setReceiptSettings({...receiptSettings, headerText: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: '#2C3E50' }}>
                    Footer Text
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border-2 rounded-md focus:outline-none"
                    style={{ 
                      borderColor: '#2C3E50',
                      backgroundColor: '#F8F9FA',
                      color: '#2C3E50'
                    }}
                    value={receiptSettings.footerText}
                    onChange={(e) => setReceiptSettings({...receiptSettings, footerText: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: '#2C3E50' }}>
                    Font Size
                  </label>
                  <select
                    className="w-full px-3 py-2 border-2 rounded-md focus:outline-none"
                    style={{ 
                      borderColor: '#2C3E50',
                      backgroundColor: '#F8F9FA',
                      color: '#2C3E50'
                    }}
                    value={receiptSettings.fontSize}
                    onChange={(e) => setReceiptSettings({...receiptSettings, fontSize: e.target.value})}
                  >
                    <option value="small">Small</option>
                    <option value="medium">Medium</option>
                    <option value="large">Large</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: '#2C3E50' }}>
                    Paper Size
                  </label>
                  <select
                    className="w-full px-3 py-2 border-2 rounded-md focus:outline-none"
                    style={{ 
                      borderColor: '#2C3E50',
                      backgroundColor: '#F8F9FA',
                      color: '#2C3E50'
                    }}
                    value={receiptSettings.paperSize}
                    onChange={(e) => setReceiptSettings({...receiptSettings, paperSize: e.target.value})}
                  >
                    <option value="58mm">58mm</option>
                    <option value="80mm">80mm</option>
                  </select>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-md" style={{ backgroundColor: '#F8F9FA' }}>
                  <span style={{ color: '#2C3E50' }}>Auto Print Receipt</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={receiptSettings.autoPrint}
                      onChange={(e) => setReceiptSettings({...receiptSettings, autoPrint: e.target.checked})}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-3 rounded-md" style={{ backgroundColor: '#F8F9FA' }}>
                  <span style={{ color: '#2C3E50' }}>Show Logo on Receipt</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={receiptSettings.showLogo}
                      onChange={(e) => setReceiptSettings({...receiptSettings, showLogo: e.target.checked})}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                  </label>
                </div>
              </div>

              <button
                onClick={() => handleSaveSettings('Receipt')}
                disabled={loading}
                className="px-6 py-3 rounded-lg font-semibold transition-all duration-200 disabled:opacity-50 shadow-md hover:shadow-lg"
                style={{ 
                  backgroundColor: '#2C3E50',
                  color: '#FFFFFF'
                }}
              >
                {loading ? 'Saving...' : '💾 Save Receipt Settings'}
              </button>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold" style={{ color: '#2C3E50' }}>
                🔔 Notification Settings
              </h2>
              
              <div className="space-y-4">
                {Object.entries(notificationSettings).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between p-4 rounded-md" style={{ backgroundColor: '#F8F9FA' }}>
                    <div>
                      <p className="font-medium" style={{ color: '#2C3E50' }}>
                        {key === 'emailLowStock' && '📧 Email Low Stock Alerts'}
                        {key === 'whatsappNotifications' && '📱 WhatsApp Notifications'}
                        {key === 'smsAlerts' && '📱 SMS Alerts'}
                        {key === 'dailyReport' && '📊 Daily Sales Report'}
                        {key === 'weeklyReport' && '📈 Weekly Summary Report'}
                      </p>
                      <p className="text-sm opacity-70" style={{ color: '#2C3E50' }}>
                        {key === 'emailLowStock' && 'Get notified when products are low in stock'}
                        {key === 'whatsappNotifications' && 'Receive important updates via WhatsApp'}
                        {key === 'smsAlerts' && 'Critical alerts via SMS'}
                        {key === 'dailyReport' && 'Daily sales summary via email'}
                        {key === 'weeklyReport' && 'Weekly performance report'}
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={value}
                        onChange={(e) => setNotificationSettings({...notificationSettings, [key]: e.target.checked})}
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                    </label>
                  </div>
                ))}
              </div>

              <button
                onClick={() => handleSaveSettings('Notification')}
                disabled={loading}
                className="px-6 py-3 rounded-lg font-semibold transition-all duration-200 disabled:opacity-50 shadow-md hover:shadow-lg"
                style={{ 
                  backgroundColor: '#2C3E50',
                  color: '#FFFFFF'
                }}
              >
                {loading ? 'Saving...' : '💾 Save Notification Settings'}
              </button>
            </div>
          )}

          {/* System Settings Tab */}
          {activeTab === 'system' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold" style={{ color: '#2C3E50' }}>
                ⚙️ System Settings
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: '#2C3E50' }}>
                    Currency
                  </label>
                  <select
                    className="w-full px-3 py-2 border-2 rounded-md focus:outline-none"
                    style={{ 
                      borderColor: '#2C3E50',
                      backgroundColor: '#F8F9FA',
                      color: '#2C3E50'
                    }}
                    value={systemSettings.currency}
                    onChange={(e) => setSystemSettings({...systemSettings, currency: e.target.value})}
                  >
                    <option value="IDR">IDR (Indonesian Rupiah)</option>
                    <option value="USD">USD (US Dollar)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: '#2C3E50' }}>
                    Tax Rate (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    className="w-full px-3 py-2 border-2 rounded-md focus:outline-none"
                    style={{ 
                      borderColor: '#2C3E50',
                      backgroundColor: '#F8F9FA',
                      color: '#2C3E50'
                    }}
                    value={systemSettings.taxRate}
                    onChange={(e) => setSystemSettings({...systemSettings, taxRate: parseInt(e.target.value)})}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: '#2C3E50' }}>
                    Session Timeout (minutes)
                  </label>
                  <input
                    type="number"
                    min="5"
                    max="120"
                    className="w-full px-3 py-2 border-2 rounded-md focus:outline-none"
                    style={{ 
                      borderColor: '#2C3E50',
                      backgroundColor: '#F8F9FA',
                      color: '#2C3E50'
                    }}
                    value={systemSettings.sessionTimeout}
                    onChange={(e) => setSystemSettings({...systemSettings, sessionTimeout: parseInt(e.target.value)})}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: '#2C3E50' }}>
                    Language
                  </label>
                  <select
                    className="w-full px-3 py-2 border-2 rounded-md focus:outline-none"
                    style={{ 
                      borderColor: '#2C3E50',
                      backgroundColor: '#F8F9FA',
                      color: '#2C3E50'
                    }}
                    value={systemSettings.language}
                    onChange={(e) => setSystemSettings({...systemSettings, language: e.target.value})}
                  >
                    <option value="id">Indonesia</option>
                    <option value="en">English</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-md" style={{ backgroundColor: '#F8F9FA' }}>
                <div>
                  <span className="font-medium" style={{ color: '#2C3E50' }}>Auto Backup Database</span>
                  <p className="text-sm opacity-70" style={{ color: '#2C3E50' }}>Automatically backup data daily</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={systemSettings.autoBackup}
                    onChange={(e) => setSystemSettings({...systemSettings, autoBackup: e.target.checked})}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                </label>
              </div>

              <button
                onClick={() => handleSaveSettings('System')}
                disabled={loading}
                className="px-6 py-3 rounded-lg font-semibold transition-all duration-200 disabled:opacity-50 shadow-md hover:shadow-lg"
                style={{ 
                  backgroundColor: '#2C3E50',
                  color: '#FFFFFF'
                }}
              >
                {loading ? 'Saving...' : '💾 Save System Settings'}
              </button>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default Settings;
