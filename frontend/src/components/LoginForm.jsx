import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaEye, FaEyeSlash } from 'react-icons/fa';
import api from '../api/axios';
import logo from '../assets/images/logo-sellify.png'; // Import logo - TETAP PAKAI INI

const LoginForm = () => {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await api.post('/auth/login', credentials);
      const { token, role } = response.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('role', role);
      
      if (role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/kasir');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#F5F5F5' }}>
      <div className="max-w-md w-full space-y-8 p-8 rounded-3xl shadow-2xl" style={{ backgroundColor: '#FFFFFF' }}>
        <div>
          {/* LOGO - TETAP PAKAI IMAGE */}
          <img 
            className="mx-auto h-28 w-auto"
            src={logo} 
            alt="Sellify Logo" 
          />
          <p className="mt-2 text-center text-sm font-medium" style={{ color: '#2C3E50' }}>
            Masuk ke sistem kasir
          </p>
        </div>
        
        <form className="space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="border border-red-400 text-red-700 px-4 py-3 rounded-lg" style={{ backgroundColor: '#FFE5E5' }}>
              {error}
            </div>
          )}
          
          {/* Username Field */}
          <div>
            <label className="block text-left font-semibold mb-2" style={{ color: '#2C3E50' }}>
              Username
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <FaUser className="h-5 w-5" style={{ color: '#95A5A6' }} />
              </div>
              <input
                type="text"
                required
                className="w-full pl-4 pr-10 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 transition-all"
                style={{ 
                  borderColor: '#2C3E50',
                  backgroundColor: '#FFFFFF',
                  color: '#2C3E50'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#34495E';
                  e.target.style.boxShadow = '0 0 0 3px rgba(52, 73, 94, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#2C3E50';
                  e.target.style.boxShadow = 'none';
                }}
                placeholder="Masukkan username"
                value={credentials.username}
                onChange={(e) => setCredentials({...credentials, username: e.target.value})}
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-left font-semibold mb-2" style={{ color: '#2C3E50' }}>
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                className="w-full pl-4 pr-10 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 transition-all"
                style={{ 
                  borderColor: '#2C3E50',
                  backgroundColor: '#FFFFFF',
                  color: '#2C3E50'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#34495E';
                  e.target.style.boxShadow = '0 0 0 3px rgba(52, 73, 94, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#2C3E50';
                  e.target.style.boxShadow = 'none';
                }}
                placeholder="Masukkan password"
                value={credentials.password}
                onChange={(e) => setCredentials({...credentials, password: e.target.value})}
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="focus:outline-none hover:opacity-70 transition-opacity"
                >
                  {showPassword ? (
                    <FaEyeSlash className="h-5 w-5" style={{ color: '#95A5A6' }} />
                  ) : (
                    <FaEye className="h-5 w-5" style={{ color: '#95A5A6' }} />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-lg text-lg font-bold transition-all duration-200 disabled:opacity-50 hover:shadow-xl"
            style={{ 
              backgroundColor: '#2C3E50',
              color: '#FFFFFF'
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.target.style.backgroundColor = '#34495E';
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.target.style.backgroundColor = '#2C3E50';
              }
            }}
          >
            {loading ? '⏳ Loading...' : 'Sign In'}
          </button>
        </form>
        
        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-xs" style={{ color: '#95A5A6' }}>
            © 2025 Sellify
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;