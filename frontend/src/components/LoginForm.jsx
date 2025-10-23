import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaEye, FaEyeSlash } from 'react-icons/fa';
import api from '../api/axios';
import logo from '../assets/images/logo-sellify.png'; // Import logo

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
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#FFFCF2' }}>
      <div className="max-w-md w-full space-y-8 p-8 rounded-lg shadow-lg" style={{ backgroundColor: '#F7E9A0' }}>
        <div>
          <img 
            className="mx-auto h-28 w-auto"
            src={logo} 
            alt="Sellify Logo" 
          />
          <p className="mt-0 text-center text-sm" style={{ color: '#3E3E3E' }}>
            Masuk ke sistem kasir
          </p>
        </div>
        
        <form className="space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="border border-red-400 text-red-700 px-4 py-3 rounded" style={{ backgroundColor: '#FFE5E5' }}>
              {error}
            </div>
          )}
          
          {/* Username Field */}
          <div>
            <label className="block text-left font-medium mb-2" style={{ color: '#3E3E3E' }}>
              Username
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <FaUser className="h-5 w-5" style={{ color: '#E9C46A' }} />
              </div>
              <input
                type="text"
                required
                className="w-full pl-3 pr-10 py-2 border-2 rounded-md focus:outline-none focus:ring-2 transition-all"
                style={{ 
                  borderColor: '#E9C46A',
                  backgroundColor: '#FFFCF2',
                  color: '#3E3E3E'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#FFD56B';
                  e.target.style.boxShadow = '0 0 0 2px rgba(255, 213, 107, 0.2)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#E9C46A';
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
            <label className="block text-left font-medium mb-2" style={{ color: '#3E3E3E' }}>
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                className="w-full pl-3 pr-10 py-2 border-2 rounded-md focus:outline-none focus:ring-2 transition-all"
                style={{ 
                  borderColor: '#E9C46A',
                  backgroundColor: '#FFFCF2',
                  color: '#3E3E3E'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#FFD56B';
                  e.target.style.boxShadow = '0 0 0 2px rgba(255, 213, 107, 0.2)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#E9C46A';
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
                    <FaEyeSlash className="h-5 w-5" style={{ color: '#E9C46A' }} />
                  ) : (
                    <FaEye className="h-5 w-5" style={{ color: '#E9C46A' }} />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium transition-all duration-200 disabled:opacity-50"
            style={{ 
              backgroundColor: '#E9C46A',
              color: '#3E3E3E'
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.target.style.backgroundColor = '#FFD56B';
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.target.style.backgroundColor = '#E9C46A';
              }
            }}
          >
            {loading ? 'Loading...' : 'Sign In'}
          </button>
        </form>
        
        
      </div>
    </div>
  );
};

export default LoginForm;