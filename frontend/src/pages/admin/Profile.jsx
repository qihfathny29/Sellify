import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import api from '../../api/axios';

const Profile = () => {
  const [profileData, setProfileData] = useState({
    name: '',
    username: '',
    email: '',
    phone: '',
    role: '',
    avatar: null,
    profile_photo: null
  });

  const [previewImage, setPreviewImage] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });

  // Fetch profile data
  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await api.get('/users/profile');
      const userData = response.data.data;
      
      setProfileData({
        name: userData.full_name || '',
        username: userData.username || '',
        email: userData.email || '',
        phone: userData.phone || '',
        role: userData.role || '',
        avatar: null,
        profile_photo: userData.profile_photo || null
      });

      if (userData.profile_photo) {
        setPreviewImage(`http://localhost:5000${userData.profile_photo}`);
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error);
      alert('Failed to load profile: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileData({ ...profileData, avatar: file });
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => setPreviewImage(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // Update profile info
      await api.put('/users/profile', {
        full_name: profileData.name,
        username: profileData.username,
        current_password: passwordData.current_password || undefined,
        new_password: passwordData.new_password || undefined
      });

      // Upload photo if changed
      if (profileData.avatar) {
        const formData = new FormData();
        formData.append('photo', profileData.avatar);
        await api.post('/users/profile/photo', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }

      alert('Profile updated successfully!');
      setIsEditing(false);
      setPasswordData({ current_password: '', new_password: '', confirm_password: '' });
      fetchProfile(); // Refresh data
    } catch (error) {
      console.error('Update profile error:', error);
      alert('Failed to update profile: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  if (loading && !profileData.name) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: '#2C3E50' }}></div>
            <p style={{ color: '#2C3E50' }}>Loading profile...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold" style={{ color: '#2C3E50' }}>👤 Profile</h1>
          <p className="opacity-70 mt-1" style={{ color: '#2C3E50' }}>
            Manage your account settings
          </p>
        </div>

        {/* Profile Card */}
        <div className="rounded-lg shadow-lg p-6" style={{ backgroundColor: '#FFFFFF' }}>
          <div className="flex items-start space-x-6">
            {/* Avatar Section */}
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                <div 
                  className="w-32 h-32 rounded-full flex items-center justify-center border-4 overflow-hidden"
                  style={{ borderColor: '#2C3E50', backgroundColor: '#F8F9FA' }}
                >
                  {previewImage ? (
                    <img 
                      src={previewImage} 
                      alt="Profile" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-4xl font-bold" style={{ color: '#2C3E50' }}>
                      {profileData.name.charAt(0)}
                    </span>
                  )}
                </div>
                
                {isEditing && (
                  <label className="absolute bottom-0 right-0 cursor-pointer">
                    <div 
                      className="w-10 h-10 rounded-full flex items-center justify-center border-2 shadow-lg"
                      style={{ backgroundColor: '#2C3E50', borderColor: '#2C3E50' }}
                    >
                      <span className="text-sm">📷</span>
                    </div>
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden"
                      onChange={handleImageChange}
                    />
                  </label>
                )}
              </div>
              
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-6 py-2 rounded-lg font-semibold transition-all duration-200 shadow-md hover:shadow-lg"
                  style={{ 
                    backgroundColor: '#2C3E50',
                    color: '#FFFFFF'
                  }}
                >
                  ✏️ Edit Profile
                </button>
              )}
            </div>

            {/* Profile Information */}
            <div className="flex-1 space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: '#2C3E50' }}>
                  Full Name
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    className="w-full px-3 py-2 border-2 rounded-md focus:outline-none"
                    style={{ 
                      borderColor: '#2C3E50',
                      backgroundColor: '#F8F9FA',
                      color: '#2C3E50'
                    }}
                    value={profileData.name}
                    onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                  />
                ) : (
                  <p className="text-lg font-medium" style={{ color: '#2C3E50' }}>
                    {profileData.name}
                  </p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: '#2C3E50' }}>
                  Email Address
                </label>
                {isEditing ? (
                  <input
                    type="email"
                    className="w-full px-3 py-2 border-2 rounded-md focus:outline-none"
                    style={{ 
                      borderColor: '#2C3E50',
                      backgroundColor: '#F8F9FA',
                      color: '#2C3E50'
                    }}
                    value={profileData.email}
                    onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                  />
                ) : (
                  <p className="text-lg" style={{ color: '#2C3E50' }}>
                    {profileData.email}
                  </p>
                )}
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: '#2C3E50' }}>
                  Phone Number
                </label>
                {isEditing ? (
                  <input
                    type="tel"
                    className="w-full px-3 py-2 border-2 rounded-md focus:outline-none"
                    style={{ 
                      borderColor: '#2C3E50',
                      backgroundColor: '#F8F9FA',
                      color: '#2C3E50'
                    }}
                    value={profileData.phone}
                    onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                  />
                ) : (
                  <p className="text-lg" style={{ color: '#2C3E50' }}>
                    {profileData.phone}
                  </p>
                )}
              </div>

              {/* Role (Read-only) */}
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: '#2C3E50' }}>
                  Role
                </label>
                <p 
                  className="inline-block px-4 py-2 rounded-full text-sm font-semibold shadow-md"
                  style={{ backgroundColor: '#2C3E50', color: '#FFFFFF' }}
                >
                  {profileData.role}
                </p>
              </div>

              {/* Password Change (Only when editing) */}
              {isEditing && (
                <>
                  <div className="border-t pt-4 mt-4" style={{ borderColor: '#E0E0E0' }}>
                    <h3 className="font-semibold mb-3" style={{ color: '#2C3E50' }}>Change Password (Optional)</h3>
                    
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium mb-1" style={{ color: '#2C3E50' }}>
                          Current Password
                        </label>
                        <input
                          type="password"
                          className="w-full px-3 py-2 border-2 rounded-md focus:outline-none"
                          style={{ 
                            borderColor: '#2C3E50',
                            backgroundColor: '#F8F9FA',
                            color: '#2C3E50'
                          }}
                          value={passwordData.current_password}
                          onChange={(e) => setPasswordData({...passwordData, current_password: e.target.value})}
                          placeholder="Enter current password"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-1" style={{ color: '#2C3E50' }}>
                          New Password
                        </label>
                        <input
                          type="password"
                          className="w-full px-3 py-2 border-2 rounded-md focus:outline-none"
                          style={{ 
                            borderColor: '#2C3E50',
                            backgroundColor: '#F8F9FA',
                            color: '#2C3E50'
                          }}
                          value={passwordData.new_password}
                          onChange={(e) => setPasswordData({...passwordData, new_password: e.target.value})}
                          placeholder="Enter new password"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-1" style={{ color: '#2C3E50' }}>
                          Confirm New Password
                        </label>
                        <input
                          type="password"
                          className="w-full px-3 py-2 border-2 rounded-md focus:outline-none"
                          style={{ 
                            borderColor: '#2C3E50',
                            backgroundColor: '#F8F9FA',
                            color: '#2C3E50'
                          }}
                          value={passwordData.confirm_password}
                          onChange={(e) => setPasswordData({...passwordData, confirm_password: e.target.value})}
                          placeholder="Confirm new password"
                        />
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Action Buttons */}
              {isEditing && (
                <div className="flex space-x-3 pt-4">
                  <button
                    onClick={handleSave}
                    disabled={loading || (passwordData.new_password && passwordData.new_password !== passwordData.confirm_password)}
                    className="px-6 py-2 rounded-lg font-semibold transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50"
                    style={{ 
                      backgroundColor: '#2C3E50',
                      color: '#FFFFFF'
                    }}
                  >
                    {loading ? 'Saving...' : '💾 Save Changes'}
                  </button>
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setPreviewImage(null);
                    }}
                    className="px-6 py-2 rounded-md font-medium border-2 transition-all duration-200"
                    style={{ 
                      backgroundColor: 'transparent',
                      color: '#2C3E50',
                      borderColor: '#2C3E50'
                    }}
                  >
                    ❌ Cancel
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Security Section */}
        <div className="mt-6 rounded-lg shadow-lg p-6" style={{ backgroundColor: '#FFFFFF' }}>
          <h2 className="text-xl font-bold mb-4" style={{ color: '#2C3E50' }}>
            🔒 Security Settings
          </h2>
          
          <div className="space-y-4">
            <button
              className="w-full text-left p-4 rounded-md border-2 transition-colors duration-200"
              style={{ 
                backgroundColor: '#F8F9FA',
                borderColor: '#2C3E50',
                color: '#2C3E50'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#2C3E50'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#F8F9FA'}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">🔑 Change Password</p>
                  <p className="text-sm opacity-70">Update your account password</p>
                </div>
                <span>▶</span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Profile;
