import React, { useState } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';

const Profile = () => {
  const [profileData, setProfileData] = useState({
    name: 'Admin',
    email: 'admin@sellify.com',
    phone: '08123456789',
    role: 'Administrator',
    avatar: null
  });

  const [previewImage, setPreviewImage] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

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

  const handleSave = () => {
    // TODO: Save to backend
    alert('Profile updated successfully!');
    setIsEditing(false);
  };

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold" style={{ color: '#3E3E3E' }}>👤 Profile</h1>
          <p className="opacity-70 mt-1" style={{ color: '#3E3E3E' }}>
            Manage your account settings
          </p>
        </div>

        {/* Profile Card */}
        <div className="rounded-lg shadow-lg p-6" style={{ backgroundColor: '#F7E9A0' }}>
          <div className="flex items-start space-x-6">
            {/* Avatar Section */}
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                <div 
                  className="w-32 h-32 rounded-full flex items-center justify-center border-4 overflow-hidden"
                  style={{ borderColor: '#E9C46A', backgroundColor: '#FFFCF2' }}
                >
                  {previewImage ? (
                    <img 
                      src={previewImage} 
                      alt="Profile" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-4xl font-bold" style={{ color: '#3E3E3E' }}>
                      {profileData.name.charAt(0)}
                    </span>
                  )}
                </div>
                
                {isEditing && (
                  <label className="absolute bottom-0 right-0 cursor-pointer">
                    <div 
                      className="w-10 h-10 rounded-full flex items-center justify-center border-2 shadow-lg"
                      style={{ backgroundColor: '#E9C46A', borderColor: '#3E3E3E' }}
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
                  className="px-4 py-2 rounded-md font-medium transition-all duration-200"
                  style={{ 
                    backgroundColor: '#E9C46A',
                    color: '#3E3E3E'
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
                <label className="block text-sm font-medium mb-1" style={{ color: '#3E3E3E' }}>
                  Full Name
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    className="w-full px-3 py-2 border-2 rounded-md focus:outline-none"
                    style={{ 
                      borderColor: '#E9C46A',
                      backgroundColor: '#FFFCF2',
                      color: '#3E3E3E'
                    }}
                    value={profileData.name}
                    onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                  />
                ) : (
                  <p className="text-lg font-medium" style={{ color: '#3E3E3E' }}>
                    {profileData.name}
                  </p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: '#3E3E3E' }}>
                  Email Address
                </label>
                {isEditing ? (
                  <input
                    type="email"
                    className="w-full px-3 py-2 border-2 rounded-md focus:outline-none"
                    style={{ 
                      borderColor: '#E9C46A',
                      backgroundColor: '#FFFCF2',
                      color: '#3E3E3E'
                    }}
                    value={profileData.email}
                    onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                  />
                ) : (
                  <p className="text-lg" style={{ color: '#3E3E3E' }}>
                    {profileData.email}
                  </p>
                )}
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: '#3E3E3E' }}>
                  Phone Number
                </label>
                {isEditing ? (
                  <input
                    type="tel"
                    className="w-full px-3 py-2 border-2 rounded-md focus:outline-none"
                    style={{ 
                      borderColor: '#E9C46A',
                      backgroundColor: '#FFFCF2',
                      color: '#3E3E3E'
                    }}
                    value={profileData.phone}
                    onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                  />
                ) : (
                  <p className="text-lg" style={{ color: '#3E3E3E' }}>
                    {profileData.phone}
                  </p>
                )}
              </div>

              {/* Role (Read-only) */}
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: '#3E3E3E' }}>
                  Role
                </label>
                <p 
                  className="inline-block px-3 py-1 rounded-full text-sm font-medium"
                  style={{ backgroundColor: '#E9C46A', color: '#3E3E3E' }}
                >
                  {profileData.role}
                </p>
              </div>

              {/* Action Buttons */}
              {isEditing && (
                <div className="flex space-x-3 pt-4">
                  <button
                    onClick={handleSave}
                    className="px-6 py-2 rounded-md font-medium transition-all duration-200"
                    style={{ 
                      backgroundColor: '#E9C46A',
                      color: '#3E3E3E'
                    }}
                  >
                    💾 Save Changes
                  </button>
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setPreviewImage(null);
                    }}
                    className="px-6 py-2 rounded-md font-medium border-2 transition-all duration-200"
                    style={{ 
                      backgroundColor: 'transparent',
                      color: '#3E3E3E',
                      borderColor: '#E9C46A'
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
        <div className="mt-6 rounded-lg shadow-lg p-6" style={{ backgroundColor: '#F7E9A0' }}>
          <h2 className="text-xl font-bold mb-4" style={{ color: '#3E3E3E' }}>
            🔒 Security Settings
          </h2>
          
          <div className="space-y-4">
            <button
              className="w-full text-left p-4 rounded-md border-2 transition-colors duration-200"
              style={{ 
                backgroundColor: '#FFFCF2',
                borderColor: '#E9C46A',
                color: '#3E3E3E'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#E9C46A'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#FFFCF2'}
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