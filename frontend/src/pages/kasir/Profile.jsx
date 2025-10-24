import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import KasirLayout from '../../components/kasir/KasirLayout';

const Profile = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    full_name: '',
    username: '',
    current_password: '',
    new_password: '',
    confirm_password: ''
  });
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await api.get('/users/profile');
      if (response.data.success) {
        const userData = response.data.data;
        setUser(userData);
        setFormData({
          full_name: userData.full_name || '',
          username: userData.username || '',
          current_password: '',
          new_password: '',
          confirm_password: ''
        });
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error);
      setMessage({ type: 'error', text: 'Gagal memuat profil' });
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoClick = () => {
    fileInputRef.current.click();
  };

  const handlePhotoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validasi ukuran file (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'Ukuran foto maksimal 5MB!' });
      return;
    }

    // Validasi tipe file
    if (!file.type.startsWith('image/')) {
      setMessage({ type: 'error', text: 'File harus berupa gambar!' });
      return;
    }

    setUploadingPhoto(true);
    setMessage({ type: '', text: '' });

    try {
      const formData = new FormData();
      formData.append('photo', file);

      const response = await api.post('/users/profile/photo', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.success) {
        setMessage({ type: 'success', text: 'Foto profil berhasil diperbarui!' });
        fetchProfile(); // Refresh data
      }
    } catch (error) {
      console.error('Upload photo error:', error);
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Gagal upload foto profil' 
      });
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validasi
    if (formData.new_password && formData.new_password !== formData.confirm_password) {
      setMessage({ type: 'error', text: 'Password baru tidak cocok!' });
      return;
    }

    if (formData.new_password && formData.new_password.length < 6) {
      setMessage({ type: 'error', text: 'Password minimal 6 karakter!' });
      return;
    }

    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      const updateData = {
        full_name: formData.full_name,
        username: formData.username
      };

      if (formData.new_password) {
        updateData.current_password = formData.current_password;
        updateData.new_password = formData.new_password;
      }

      const response = await api.put('/users/profile', updateData);
      
      if (response.data.success) {
        setMessage({ type: 'success', text: 'Profil berhasil diperbarui!' });
        
        setFormData({
          ...formData,
          current_password: '',
          new_password: '',
          confirm_password: ''
        });

        fetchProfile();
      }
    } catch (error) {
      console.error('Update profile error:', error);
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Gagal memperbarui profil' 
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <KasirLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: '#E76F51' }}></div>
            <p style={{ color: '#2C3E50' }}>Loading...</p>
          </div>
        </div>
      </KasirLayout>
    );
  }

  const profilePhotoUrl = user?.profile_photo 
    ? `http://localhost:5000${user.profile_photo}` 
    : null;

  return (
    <KasirLayout>
      <div className="p-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2" style={{ color: '#2C3E50' }}>
              👤 Profil Saya
            </h1>
            <p className="opacity-70" style={{ color: '#2C3E50' }}>
              Kelola informasi profil dan keamanan akun Anda
            </p>
          </div>

          {/* Message Alert */}
          {message.text && (
            <div 
              className={`mb-6 p-4 rounded-lg ${
                message.type === 'success' ? 'bg-green-100' : 'bg-red-100'
              }`}
            >
              <p className={message.type === 'success' ? 'text-green-700' : 'text-red-700'}>
                {message.text}
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Profile Card */}
            <div className="lg:col-span-1">
              <div className="rounded-2xl shadow-lg p-6" style={{ backgroundColor: 'white' }}>
                <div className="text-center">
                  {/* Profile Photo - CLICKABLE */}
                  <div className="relative inline-block">
                    <div 
                      onClick={handlePhotoClick}
                      className="w-24 h-24 rounded-full mx-auto mb-4 flex items-center justify-center text-4xl cursor-pointer overflow-hidden transition-all hover:opacity-80 relative group"
                      style={{ backgroundColor: '#2C3E50' }}
                    >
                      {profilePhotoUrl ? (
                        <img 
                          src={profilePhotoUrl} 
                          alt="Profile" 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span>👤</span>
                      )}
                      
                      {/* Overlay on hover */}
                      <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-white text-sm">📷 Ubah Foto</span>
                      </div>
                      
                      {/* Loading overlay */}
                      {uploadingPhoto && (
                        <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                        </div>
                      )}
                    </div>
                    
                    {/* Camera icon */}
                    <button
                      onClick={handlePhotoClick}
                      className="absolute bottom-3 right-1/2 transform translate-x-10 w-8 h-8 rounded-full flex items-center justify-center shadow-lg"
                      style={{ backgroundColor: '#E76F51', color: 'white' }}
                    >
                      📷
                    </button>
                  </div>

                  {/* Hidden file input */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className="hidden"
                  />

                  <h3 className="text-xl font-bold mb-1" style={{ color: '#2C3E50' }}>
                    {user?.full_name}
                  </h3>
                  <p className="text-sm opacity-70 mb-2" style={{ color: '#2C3E50' }}>
                    @{user?.username}
                  </p>
                  <span 
                    className="inline-block px-3 py-1 rounded-full text-sm font-medium"
                    style={{ backgroundColor: '#E76F51', color: 'white' }}
                  >
                    🏷️ {user?.role === 'kasir' ? 'Kasir' : user?.role === 'admin' ? 'Admin' : 'User'}
                  </span>

                  <div className="mt-6 pt-6 border-t" style={{ borderColor: '#2C3E50' }}>
                    <div className="text-left space-y-3">
                      <div>
                        <p className="text-xs opacity-70" style={{ color: '#2C3E50' }}>Status Akun</p>
                        <p className="font-medium" style={{ color: '#2C3E50' }}>
                          {user?.is_active ? '✅ Aktif' : '❌ Tidak Aktif'}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs opacity-70" style={{ color: '#2C3E50' }}>Terdaftar Sejak</p>
                        <p className="font-medium" style={{ color: '#2C3E50' }}>
                          {new Date(user?.created_at).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Edit Form */}
            <div className="lg:col-span-2">
              <div className="rounded-2xl shadow-lg p-6" style={{ backgroundColor: 'white' }}>
                <h2 className="text-xl font-bold mb-6" style={{ color: '#2C3E50' }}>
                  ✏️ Edit Profil
                </h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Informasi Dasar */}
                  <div>
                    <h3 className="font-semibold mb-4 text-sm" style={{ color: '#E76F51' }}>
                      INFORMASI DASAR
                    </h3>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: '#2C3E50' }}>
                          Nama Lengkap
                        </label>
                        <input
                          type="text"
                          name="full_name"
                          value={formData.full_name}
                          onChange={handleChange}
                          className="w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2"
                          style={{ 
                            borderColor: '#2C3E50',
                            backgroundColor: '#F5F5F5'
                          }}
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: '#2C3E50' }}>
                          Username
                        </label>
                        <input
                          type="text"
                          name="username"
                          value={formData.username}
                          onChange={handleChange}
                          className="w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2"
                          style={{ 
                            borderColor: '#2C3E50',
                            backgroundColor: '#F5F5F5'
                          }}
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Ubah Password */}
                  <div className="pt-6 border-t" style={{ borderColor: '#2C3E50' }}>
                    <h3 className="font-semibold mb-4 text-sm" style={{ color: '#E76F51' }}>
                      UBAH PASSWORD (Opsional)
                    </h3>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: '#2C3E50' }}>
                          Password Saat Ini
                        </label>
                        <input
                          type="password"
                          name="current_password"
                          value={formData.current_password}
                          onChange={handleChange}
                          className="w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2"
                          style={{ 
                            borderColor: '#2C3E50',
                            backgroundColor: '#F5F5F5'
                          }}
                          placeholder="Kosongkan jika tidak ingin mengubah"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: '#2C3E50' }}>
                          Password Baru
                        </label>
                        <input
                          type="password"
                          name="new_password"
                          value={formData.new_password}
                          onChange={handleChange}
                          className="w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2"
                          style={{ 
                            borderColor: '#2C3E50',
                            backgroundColor: '#F5F5F5'
                          }}
                          placeholder="Minimal 6 karakter"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: '#2C3E50' }}>
                          Konfirmasi Password Baru
                        </label>
                        <input
                          type="password"
                          name="confirm_password"
                          value={formData.confirm_password}
                          onChange={handleChange}
                          className="w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2"
                          style={{ 
                            borderColor: '#2C3E50',
                            backgroundColor: '#F5F5F5'
                          }}
                          placeholder="Ketik ulang password baru"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="flex gap-4 pt-6">
                    <button
                      type="submit"
                      disabled={saving}
                      className="flex-1 px-6 py-3 rounded-lg font-semibold transition-all disabled:opacity-50 hover:opacity-90"
                      style={{ 
                        backgroundColor: '#E76F51',
                        color: 'white'
                      }}
                    >
                      {saving ? '💾 Menyimpan...' : '💾 Simpan Perubahan'}
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => navigate('/kasir/dashboard')}
                      className="px-6 py-3 rounded-lg font-semibold transition-all hover:opacity-90"
                      style={{ 
                        backgroundColor: '#2C3E50',
                        color: '#FFFFFF'
                      }}
                    >
                      ❌ Batal
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </KasirLayout>
  );
};

export default Profile;
