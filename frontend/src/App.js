import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import PrivateRoute from './router/PrivateRoute';

// Pages
import Login from './pages/Login';
import AdminDashboard from './pages/admin/AdminDashboard';
import ProductManagement from './pages/admin/ProductManagement';
import KasirDashboard from './pages/kasir/KasirDashboard';
import Profile from './pages/admin/Profile';
import Reports  from './pages/admin/Reports';
import Settings from './pages/admin/Settings';
import Transactions from './pages/admin/Transactions';
import UserManagement from './pages/admin/UserManagement';


function App() {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');
  
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route 
            path="/login" 
            element={!token ? <Login /> : <Navigate to={role === 'admin' ? '/admin' : '/kasir'} replace />} 
          />
          <Route 
            path="/admin" 
            element={
              <PrivateRoute requiredRole="admin">
                <AdminDashboard />
              </PrivateRoute>
            } 
          />
          <Route path="/admin/products" element= {
            <PrivateRoute requiredRole="admin">
                <ProductManagement />
              </PrivateRoute>
          }/>
          <Route path="/admin/reports" element={
            <PrivateRoute requiredRole="admin">
                <Reports />
            </PrivateRoute>
          } />
          <Route path='/admin/settings' element={
            <PrivateRoute requiredRole="admin">
              <Settings />
            </PrivateRoute>
          } />
          <Route 
              path="/admin/transactions" 
              element={
                <PrivateRoute requiredRole="admin">
                  <Transactions />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/admin/users" 
              element={
                <PrivateRoute requiredRole="admin">
                  <UserManagement />
                </PrivateRoute>
              } 
            />
          <Route path="/admin/profile" element={
            <PrivateRoute requiredRole="admin">
              <Profile />
            </PrivateRoute>
          } />
          <Route 
            path="/kasir" 
            element={
              <PrivateRoute requiredRole="kasir">
                <KasirDashboard />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/" 
            element={<Navigate to="/login" replace />} 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;