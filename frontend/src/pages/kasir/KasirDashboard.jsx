import React from 'react';
import { useNavigate } from 'react-router-dom';

const KasirDashboard = () => {
  const navigate = useNavigate();
  
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <h1 className="text-3xl font-bold text-gray-900">Kasir Dashboard</h1>
            </div>
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="border-4 border-dashed border-gray-200 rounded-lg h-96 p-4">
            <h2 className="text-xl font-semibold mb-4">Welcome to Cashier System</h2>
            <p className="text-gray-600">Cashier features will be implemented here.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
              <button
                onClick={() => navigate('/kasir/pos')}
                className="bg-blue-500 text-white p-6 rounded-lg shadow-md hover:bg-blue-600 transition-colors duration-200"
              >
                <h3 className="text-xl font-bold mb-2">💰 New Sale</h3>
                <p className="opacity-90">Process customer transactions</p>
              </button>

              <button
                onClick={() => navigate('/kasir/products')}
                className="bg-green-500 text-white p-6 rounded-lg shadow-md hover:bg-green-600 transition-colors duration-200"
              >
                <h3 className="text-xl font-bold mb-2">📦 View Products</h3>
                <p className="opacity-90">Browse available products</p>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KasirDashboard;
