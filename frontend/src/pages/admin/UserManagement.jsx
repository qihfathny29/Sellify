import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import api from '../../api/axios';

const UserManagement = () => {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    phone: '',
    password: '',
    role: 'kasir',
    status: 'active',
    permissions: {
      processSales: true,
      viewProducts: true,
      applyDiscounts: false,
      editPrices: false,
      deleteTransactions: false,
      viewReports: false,
      manageUsers: false
    }
  });

  // Mock data for development
  const mockUsers = [
    {
      id: 1,
      name: 'Siti Nurjana',
      username: 'siti123',
      email: 'siti@warung.com',
      phone: '08123456789',
      role: 'kasir',
      status: 'active',
      lastLogin: '2025-10-18 14:30',
      createdAt: '2025-10-15',
      totalTransactions: 145,
      totalRevenue: 15500000,
      avgTransaction: 35000,
      permissions: {
        processSales: true,
        viewProducts: true,
        applyDiscounts: true,
        editPrices: false,
        deleteTransactions: false,
        viewReports: false,
        manageUsers: false
      }
    },
    {
      id: 2,
      name: 'Budi Santoso',
      username: 'budi456',
      email: 'budi@warung.com',
      phone: '08234567890',
      role: 'kasir',
      status: 'blocked',
      lastLogin: '2025-10-17 16:20',
      createdAt: '2025-10-10',
      totalTransactions: 89,
      totalRevenue: 8900000,
      avgTransaction: 28000,
      permissions: {
        processSales: true,
        viewProducts: true,
        applyDiscounts: false,
        editPrices: false,
        deleteTransactions: false,
        viewReports: false,
        manageUsers: false
      }
    },
    {
      id: 3,
      name: 'Maya Sari',
      username: 'maya789',
      email: 'maya@warung.com',
      phone: '08345678901',
      role: 'supervisor',
      status: 'active',
      lastLogin: '2025-10-18 15:45',
      createdAt: '2025-10-12',
      totalTransactions: 67,
      totalRevenue: 7200000,
      avgTransaction: 42000,
      permissions: {
        processSales: true,
        viewProducts: true,
        applyDiscounts: true,
        editPrices: true,
        deleteTransactions: true,
        viewReports: true,
        manageUsers: false
      }
    }
  ];

  // Fetch users data
  const fetchUsers = async () => {
    setLoading(true);
    try {
      // TODO: Replace with real API call
      await new Promise(resolve => setTimeout(resolve, 1000)); // Mock delay
      setUsers(mockUsers);
      setFilteredUsers(mockUsers);
    } catch (error) {
      console.error('Failed to fetch users:', error);
      setUsers(mockUsers);
      setFilteredUsers(mockUsers);
    } finally {
      setLoading(false);
    }
  };

  // Filter users
  useEffect(() => {
    let filtered = users;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(user => 
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Role filter
    if (roleFilter !== 'all') {
      filtered = filtered.filter(user => user.role === roleFilter);
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(user => user.status === statusFilter);
    }

    setFilteredUsers(filtered);
  }, [users, searchTerm, roleFilter, statusFilter]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const resetForm = () => {
    setFormData({
      name: '',
      username: '',
      email: '',
      phone: '',
      password: '',
      role: 'kasir',
      status: 'active',
      permissions: {
        processSales: true,
        viewProducts: true,
        applyDiscounts: false,
        editPrices: false,
        deleteTransactions: false,
        viewReports: false,
        manageUsers: false
      }
    });
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // TODO: API call to add user
      const newUser = {
        id: users.length + 1,
        ...formData,
        lastLogin: 'Never',
        createdAt: new Date().toISOString().split('T')[0],
        totalTransactions: 0,
        totalRevenue: 0,
        avgTransaction: 0
      };
      
      setUsers([...users, newUser]);
      setShowAddModal(false);
      resetForm();
      alert('User added successfully!');
    } catch (error) {
      alert('Failed to add user: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEditUser = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // TODO: API call to update user
      const updatedUsers = users.map(user => 
        user.id === selectedUser.id ? { ...user, ...formData } : user
      );
      
      setUsers(updatedUsers);
      setShowEditModal(false);
      setSelectedUser(null);
      resetForm();
      alert('User updated successfully!');
    } catch (error) {
      alert('Failed to update user: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        // TODO: API call to delete user
        const updatedUsers = users.filter(user => user.id !== userId);
        setUsers(updatedUsers);
        alert('User deleted successfully!');
      } catch (error) {
        alert('Failed to delete user: ' + error.message);
      }
    }
  };

  const handleToggleStatus = async (userId, currentStatus) => {
    try {
      // TODO: API call to toggle status
      const newStatus = currentStatus === 'active' ? 'blocked' : 'active';
      const updatedUsers = users.map(user => 
        user.id === userId ? { ...user, status: newStatus } : user
      );
      
      setUsers(updatedUsers);
      alert(`User ${newStatus === 'active' ? 'activated' : 'blocked'} successfully!`);
    } catch (error) {
      alert('Failed to update user status: ' + error.message);
    }
  };

  const openEditModal = (user) => {
    setSelectedUser(user);
    setFormData({
      name: user.name,
      username: user.username,
      email: user.email,
      phone: user.phone,
      password: '',
      role: user.role,
      status: user.status,
      permissions: user.permissions
    });
    setShowEditModal(true);
  };

  const getStatusBadge = (status) => {
    return (
      <span 
        className="px-2 py-1 rounded-full text-xs font-medium"
        style={{ 
          backgroundColor: status === 'active' ? '#4CAF50' : '#FF5722',
          color: 'white'
        }}
      >
        {status === 'active' ? '✅ Active' : '❌ Blocked'}
      </span>
    );
  };

  const getRoleBadge = (role) => {
    return (
      <span 
        className="px-2 py-1 rounded-full text-xs font-medium"
        style={{ 
          backgroundColor: role === 'admin' ? '#9C27B0' : role === 'supervisor' ? '#FF9800' : '#2196F3',
          color: 'white'
        }}
      >
        {role === 'admin' && '👑 Admin'}
        {role === 'supervisor' && '👨‍💼 Supervisor'}
        {role === 'kasir' && '👤 Kasir'}
      </span>
    );
  };

  if (loading && !showAddModal && !showEditModal) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: '#E9C46A' }}></div>
            <p style={{ color: '#3E3E3E' }}>Loading users...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold" style={{ color: '#3E3E3E' }}>👥 User Management</h1>
            <p className="opacity-70 mt-1" style={{ color: '#3E3E3E' }}>
              Manage kasir accounts and permissions
            </p>
          </div>
          
          <button
            onClick={() => {
              resetForm();
              setShowAddModal(true);
            }}
            className="px-6 py-2 rounded-md font-medium transition-colors duration-200"
            style={{ 
              backgroundColor: '#E9C46A',
              color: '#3E3E3E'
            }}
          >
            ➕ Add New User
          </button>
        </div>

        {/* Filters */}
        <div className="rounded-lg shadow-lg p-6" style={{ backgroundColor: '#F7E9A0' }}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#3E3E3E' }}>
                🔍 Search Users
              </label>
              <input
                type="text"
                placeholder="Name, username, or email..."
                className="w-full px-3 py-2 border-2 rounded-md focus:outline-none"
                style={{ 
                  borderColor: '#E9C46A',
                  backgroundColor: '#FFFCF2',
                  color: '#3E3E3E'
                }}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Role Filter */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#3E3E3E' }}>
                👤 Role
              </label>
              <select
                className="w-full px-3 py-2 border-2 rounded-md focus:outline-none"
                style={{ 
                  borderColor: '#E9C46A',
                  backgroundColor: '#FFFCF2',
                  color: '#3E3E3E'
                }}
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
              >
                <option value="all">All Roles</option>
                <option value="admin">Admin</option>
                <option value="supervisor">Supervisor</option>
                <option value="kasir">Kasir</option>
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#3E3E3E' }}>
                📊 Status
              </label>
              <select
                className="w-full px-3 py-2 border-2 rounded-md focus:outline-none"
                style={{ 
                  borderColor: '#E9C46A',
                  backgroundColor: '#FFFCF2',
                  color: '#3E3E3E'
                }}
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="blocked">Blocked</option>
              </select>
            </div>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6 pt-6 border-t" style={{ borderColor: '#E9C46A' }}>
            <div className="text-center">
              <p className="text-2xl font-bold" style={{ color: '#3E3E3E' }}>
                {filteredUsers.length}
              </p>
              <p className="text-sm opacity-70" style={{ color: '#3E3E3E' }}>Total Users</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold" style={{ color: '#3E3E3E' }}>
                {filteredUsers.filter(u => u.status === 'active').length}
              </p>
              <p className="text-sm opacity-70" style={{ color: '#3E3E3E' }}>Active</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold" style={{ color: '#3E3E3E' }}>
                {filteredUsers.filter(u => u.role === 'kasir').length}
              </p>
              <p className="text-sm opacity-70" style={{ color: '#3E3E3E' }}>Kasir</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold" style={{ color: '#3E3E3E' }}>
                {filteredUsers.filter(u => u.role === 'supervisor').length}
              </p>
              <p className="text-sm opacity-70" style={{ color: '#3E3E3E' }}>Supervisors</p>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="rounded-lg shadow-lg overflow-hidden" style={{ backgroundColor: '#F7E9A0' }}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead style={{ backgroundColor: '#E9C46A' }}>
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-medium" style={{ color: '#3E3E3E' }}>
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium" style={{ color: '#3E3E3E' }}>
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium" style={{ color: '#3E3E3E' }}>
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium" style={{ color: '#3E3E3E' }}>
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium" style={{ color: '#3E3E3E' }}>
                    Performance
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium" style={{ color: '#3E3E3E' }}>
                    Last Login
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium" style={{ color: '#3E3E3E' }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user, index) => (
                  <tr key={user.id} className={index % 2 === 0 ? '' : 'bg-opacity-50'} style={{ backgroundColor: index % 2 === 0 ? 'transparent' : '#FFFCF2' }}>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div 
                          className="w-10 h-10 rounded-full flex items-center justify-center mr-3"
                          style={{ backgroundColor: '#E9C46A' }}
                        >
                          <span className="font-bold" style={{ color: '#3E3E3E' }}>
                            {user.name.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium" style={{ color: '#3E3E3E' }}>{user.name}</p>
                          <p className="text-sm opacity-70" style={{ color: '#3E3E3E' }}>@{user.username}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p style={{ color: '#3E3E3E' }}>{user.email}</p>
                      <p className="text-sm opacity-70" style={{ color: '#3E3E3E' }}>{user.phone}</p>
                    </td>
                    <td className="px-6 py-4">
                      {getRoleBadge(user.role)}
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(user.status)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <p style={{ color: '#3E3E3E' }}>{user.totalTransactions} transactions</p>
                        <p className="opacity-70" style={{ color: '#3E3E3E' }}>Rp {user.totalRevenue.toLocaleString()}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm" style={{ color: '#3E3E3E' }}>{user.lastLogin}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => openEditModal(user)}
                          className="px-3 py-1 text-xs rounded-md transition-colors duration-200"
                          style={{ 
                            backgroundColor: '#E9C46A',
                            color: '#3E3E3E'
                          }}
                        >
                          ✏️ Edit
                        </button>
                        <button
                          onClick={() => handleToggleStatus(user.id, user.status)}
                          className="px-3 py-1 text-xs rounded-md transition-colors duration-200"
                          style={{ 
                            backgroundColor: user.status === 'active' ? '#FF5722' : '#4CAF50',
                            color: 'white'
                          }}
                        >
                          {user.status === 'active' ? '❌ Block' : '✅ Activate'}
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          className="px-3 py-1 text-xs rounded-md transition-colors duration-200"
                          style={{ 
                            backgroundColor: '#F44336',
                            color: 'white'
                          }}
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredUsers.length === 0 && (
            <div className="text-center py-8">
              <p className="text-xl" style={{ color: '#3E3E3E' }}>👥</p>
              <p style={{ color: '#3E3E3E' }}>No users found</p>
              <p className="text-sm opacity-70" style={{ color: '#3E3E3E' }}>
                Try adjusting your filters
              </p>
            </div>
          )}
        </div>

        {/* Add User Modal */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="max-w-2xl w-full max-h-screen overflow-y-auto rounded-lg shadow-xl" style={{ backgroundColor: '#F7E9A0' }}>
              <form onSubmit={handleAddUser} className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold" style={{ color: '#3E3E3E' }}>
                    ➕ Add New User
                  </h2>
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="text-2xl hover:opacity-75"
                    style={{ color: '#3E3E3E' }}
                  >
                    ✕
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: '#3E3E3E' }}>
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      className="w-full px-3 py-2 border-2 rounded-md focus:outline-none"
                      style={{ 
                        borderColor: '#E9C46A',
                        backgroundColor: '#FFFCF2',
                        color: '#3E3E3E'
                      }}
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: '#3E3E3E' }}>
                      Username *
                    </label>
                    <input
                      type="text"
                      required
                      className="w-full px-3 py-2 border-2 rounded-md focus:outline-none"
                      style={{ 
                        borderColor: '#E9C46A',
                        backgroundColor: '#FFFCF2',
                        color: '#3E3E3E'
                      }}
                      value={formData.username}
                      onChange={(e) => setFormData({...formData, username: e.target.value})}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: '#3E3E3E' }}>
                      Email *
                    </label>
                    <input
                      type="email"
                      required
                      className="w-full px-3 py-2 border-2 rounded-md focus:outline-none"
                      style={{ 
                        borderColor: '#E9C46A',
                        backgroundColor: '#FFFCF2',
                        color: '#3E3E3E'
                      }}
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: '#3E3E3E' }}>
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      required
                      className="w-full px-3 py-2 border-2 rounded-md focus:outline-none"
                      style={{ 
                        borderColor: '#E9C46A',
                        backgroundColor: '#FFFCF2',
                        color: '#3E3E3E'
                      }}
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: '#3E3E3E' }}>
                      Password *
                    </label>
                    <input
                      type="password"
                      required
                      className="w-full px-3 py-2 border-2 rounded-md focus:outline-none"
                      style={{ 
                        borderColor: '#E9C46A',
                        backgroundColor: '#FFFCF2',
                        color: '#3E3E3E'
                      }}
                      value={formData.password}
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: '#3E3E3E' }}>
                      Role *
                    </label>
                    <select
                      required
                      className="w-full px-3 py-2 border-2 rounded-md focus:outline-none"
                      style={{ 
                        borderColor: '#E9C46A',
                        backgroundColor: '#FFFCF2',
                        color: '#3E3E3E'
                      }}
                      value={formData.role}
                      onChange={(e) => setFormData({...formData, role: e.target.value})}
                    >
                      <option value="kasir">Kasir</option>
                      <option value="supervisor">Supervisor</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                </div>

                {/* Permissions */}
                <div className="mb-6">
                  <h3 className="text-lg font-bold mb-3" style={{ color: '#3E3E3E' }}>
                    🔐 Permissions
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {Object.entries(formData.permissions).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between p-3 rounded-md" style={{ backgroundColor: '#FFFCF2' }}>
                        <span className="text-sm" style={{ color: '#3E3E3E' }}>
                          {key === 'processSales' && '💰 Process Sales'}
                          {key === 'viewProducts' && '📦 View Products'}
                          {key === 'applyDiscounts' && '🏷️ Apply Discounts'}
                          {key === 'editPrices' && '💱 Edit Prices'}
                          {key === 'deleteTransactions' && '🗑️ Delete Transactions'}
                          {key === 'viewReports' && '📊 View Reports'}
                          {key === 'manageUsers' && '👥 Manage Users'}
                        </span>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={value}
                            onChange={(e) => setFormData({
                              ...formData,
                              permissions: {
                                ...formData.permissions,
                                [key]: e.target.checked
                              }
                            })}
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-6 py-2 rounded-md font-medium border-2 transition-colors duration-200"
                    style={{ 
                      backgroundColor: 'transparent',
                      color: '#3E3E3E',
                      borderColor: '#E9C46A'
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2 rounded-md font-medium transition-colors duration-200 disabled:opacity-50"
                    style={{ 
                      backgroundColor: '#E9C46A',
                      color: '#3E3E3E'
                    }}
                  >
                    {loading ? 'Adding...' : '➕ Add User'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit User Modal */}
        {showEditModal && selectedUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="max-w-2xl w-full max-h-screen overflow-y-auto rounded-lg shadow-xl" style={{ backgroundColor: '#F7E9A0' }}>
              <form onSubmit={handleEditUser} className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold" style={{ color: '#3E3E3E' }}>
                    ✏️ Edit User - {selectedUser.name}
                  </h2>
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="text-2xl hover:opacity-75"
                    style={{ color: '#3E3E3E' }}
                  >
                    ✕
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: '#3E3E3E' }}>
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      className="w-full px-3 py-2 border-2 rounded-md focus:outline-none"
                      style={{ 
                        borderColor: '#E9C46A',
                        backgroundColor: '#FFFCF2',
                        color: '#3E3E3E'
                      }}
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: '#3E3E3E' }}>
                      Username *
                    </label>
                    <input
                      type="text"
                      required
                      className="w-full px-3 py-2 border-2 rounded-md focus:outline-none"
                      style={{ 
                        borderColor: '#E9C46A',
                        backgroundColor: '#FFFCF2',
                        color: '#3E3E3E'
                      }}
                      value={formData.username}
                      onChange={(e) => setFormData({...formData, username: e.target.value})}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: '#3E3E3E' }}>
                      Email *
                    </label>
                    <input
                      type="email"
                      required
                      className="w-full px-3 py-2 border-2 rounded-md focus:outline-none"
                      style={{ 
                        borderColor: '#E9C46A',
                        backgroundColor: '#FFFCF2',
                        color: '#3E3E3E'
                      }}
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: '#3E3E3E' }}>
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      required
                      className="w-full px-3 py-2 border-2 rounded-md focus:outline-none"
                      style={{ 
                        borderColor: '#E9C46A',
                        backgroundColor: '#FFFCF2',
                        color: '#3E3E3E'
                      }}
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: '#3E3E3E' }}>
                      New Password (leave blank to keep current)
                    </label>
                    <input
                      type="password"
                      className="w-full px-3 py-2 border-2 rounded-md focus:outline-none"
                      style={{ 
                        borderColor: '#E9C46A',
                        backgroundColor: '#FFFCF2',
                        color: '#3E3E3E'
                      }}
                      value={formData.password}
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                      placeholder="Enter new password"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: '#3E3E3E' }}>
                      Role *
                    </label>
                    <select
                      required
                      className="w-full px-3 py-2 border-2 rounded-md focus:outline-none"
                      style={{ 
                        borderColor: '#E9C46A',
                        backgroundColor: '#FFFCF2',
                        color: '#3E3E3E'
                      }}
                      value={formData.role}
                      onChange={(e) => setFormData({...formData, role: e.target.value})}
                    >
                      <option value="kasir">Kasir</option>
                      <option value="supervisor">Supervisor</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                </div>

                {/* Permissions */}
                <div className="mb-6">
                  <h3 className="text-lg font-bold mb-3" style={{ color: '#3E3E3E' }}>
                    🔐 Permissions
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {Object.entries(formData.permissions).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between p-3 rounded-md" style={{ backgroundColor: '#FFFCF2' }}>
                        <span className="text-sm" style={{ color: '#3E3E3E' }}>
                          {key === 'processSales' && '💰 Process Sales'}
                          {key === 'viewProducts' && '📦 View Products'}
                          {key === 'applyDiscounts' && '🏷️ Apply Discounts'}
                          {key === 'editPrices' && '💱 Edit Prices'}
                          {key === 'deleteTransactions' && '🗑️ Delete Transactions'}
                          {key === 'viewReports' && '📊 View Reports'}
                          {key === 'manageUsers' && '👥 Manage Users'}
                        </span>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={value}
                            onChange={(e) => setFormData({
                              ...formData,
                              permissions: {
                                ...formData.permissions,
                                [key]: e.target.checked
                              }
                            })}
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="px-6 py-2 rounded-md font-medium border-2 transition-colors duration-200"
                    style={{ 
                      backgroundColor: 'transparent',
                      color: '#3E3E3E',
                      borderColor: '#E9C46A'
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2 rounded-md font-medium transition-colors duration-200 disabled:opacity-50"
                    style={{ 
                      backgroundColor: '#E9C46A',
                      color: '#3E3E3E'
                    }}
                  >
                    {loading ? 'Updating...' : '💾 Update User'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default UserManagement;