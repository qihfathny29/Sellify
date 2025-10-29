import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import api from '../../api/axios';
import { FaUsers, FaUser, FaUserTie, FaUserCog, FaSearch, FaChartBar, FaCheck, FaTimes, FaEdit, FaBan, FaCheckCircle, FaTrash, FaPlus, FaLock, FaBox, FaTags, FaMoneyBillWave, FaChartLine, FaSave } from 'react-icons/fa';

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

  // Fetch users data
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await api.get('/users');
      console.log('Users data:', response.data);
      const usersData = response.data.data || [];
      setUsers(usersData);
      setFilteredUsers(usersData);
    } catch (error) {
      console.error('Failed to fetch users:', error);
      alert('Failed to fetch users: ' + (error.response?.data?.message || error.message));
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
        user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.username?.toLowerCase().includes(searchTerm.toLowerCase())
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
      const userData = {
        full_name: formData.name,
        username: formData.username,
        password: formData.password,
        role: formData.role
      };
      
      await api.post('/users', userData);
      
      setShowAddModal(false);
      resetForm();
      fetchUsers(); // Refresh list
      alert('User added successfully!');
    } catch (error) {
      console.error('Add user error:', error);
      alert('Failed to add user: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleEditUser = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const userData = {
        full_name: formData.name,
        username: formData.username,
        role: formData.role,
        is_active: formData.status === 'active' ? 1 : 0
      };
      
      await api.put(`/users/${selectedUser.id_user}`, userData);
      
      setShowEditModal(false);
      setSelectedUser(null);
      resetForm();
      fetchUsers(); // Refresh list
      alert('User updated successfully!');
    } catch (error) {
      console.error('Update user error:', error);
      alert('Failed to update user: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      setLoading(true);
      try {
        await api.delete(`/users/${userId}`);
        fetchUsers(); // Refresh list
        alert('User deleted successfully!');
      } catch (error) {
        console.error('Delete user error:', error);
        alert('Failed to delete user: ' + (error.response?.data?.message || error.message));
      } finally {
        setLoading(false);
      }
    }
  };

  const handleToggleStatus = async (userId, currentStatus) => {
    setLoading(true);
    try {
      const newStatus = currentStatus === 1 || currentStatus === 'active' ? 0 : 1;
      
      // Get user data first
      const user = users.find(u => u.id_user === userId);
      if (!user) return;
      
      await api.put(`/users/${userId}`, {
        full_name: user.full_name,
        username: user.username,
        role: user.role,
        is_active: newStatus
      });
      
      fetchUsers(); // Refresh list
      alert(`User ${newStatus ? 'activated' : 'blocked'} successfully!`);
    } catch (error) {
      console.error('Toggle status error:', error);
      alert('Failed to update status: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = (user) => {
    setSelectedUser(user);
    setFormData({
      name: user.full_name,
      username: user.username,
      email: user.email || '',
      phone: user.phone || '',
      password: '',
      role: user.role,
      status: user.is_active ? 'active' : 'blocked',
      permissions: user.permissions || {
        processSales: true,
        viewProducts: true,
        applyDiscounts: false,
        editPrices: false,
        deleteTransactions: false,
        viewReports: false,
        manageUsers: false
      }
    });
    setShowEditModal(true);
  };

  const getStatusBadge = (status) => {
    const isActive = status === 1 || status === 'active' || status === true;
    return (
      <span 
        className="px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1"
        style={{ 
          backgroundColor: isActive ? '#4CAF50' : '#FF5722',
          color: 'white'
        }}
      >
        {isActive ? <FaCheck className="inline-block" /> : <FaTimes className="inline-block" />}
        {isActive ? 'Active' : 'Blocked'}
      </span>
    );
  };

  const getRoleBadge = (role) => {
    return (
      <span 
        className="px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1"
        style={{ 
          backgroundColor: role === 'admin' ? '#9C27B0' : role === 'supervisor' ? '#FF9800' : '#2196F3',
          color: 'white'
        }}
      >
        {role === 'admin' && <FaUserCog className="inline-block" />}
        {role === 'supervisor' && <FaUserTie className="inline-block" />}
        {role === 'kasir' && <FaUser className="inline-block" />}
        {role.charAt(0).toUpperCase() + role.slice(1)}
      </span>
    );
  };

  if (loading && !showAddModal && !showEditModal) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: '#2C3E50' }}></div>
            <p style={{ color: '#2C3E50' }}>Loading users...</p>
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
            <h1 className="text-3xl font-bold flex items-center gap-2" style={{ color: '#2C3E50' }}><FaUsers /> User Management</h1>
            <p className="opacity-70 mt-1" style={{ color: '#2C3E50' }}>
              Manage kasir accounts and permissions
            </p>
          </div>
          
          <button
            onClick={() => {
              resetForm();
              setShowAddModal(true);
            }}
            className="px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
            style={{ 
              backgroundColor: '#2C3E50',
              color: '#FFFFFF'
            }}
          >
            <FaPlus /> Add New User
          </button>
        </div>

        {/* Filters */}
        <div className="rounded-lg shadow-lg p-6" style={{ backgroundColor: '#FFFFFF' }}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium mb-2 flex items-center gap-1" style={{ color: '#2C3E50' }}>
                <FaSearch /> Search Users
              </label>
              <input
                type="text"
                placeholder="Name, username, or email..."
                className="w-full px-3 py-2 border-2 rounded-md focus:outline-none"
                style={{ 
                  borderColor: '#2C3E50',
                  backgroundColor: '#F8F9FA',
                  color: '#2C3E50'
                }}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Role Filter */}
            <div>
              <label className="block text-sm font-medium mb-2 flex items-center gap-1" style={{ color: '#2C3E50' }}>
                <FaUser /> Role
              </label>
              <select
                className="w-full px-3 py-2 border-2 rounded-md focus:outline-none"
                style={{ 
                  borderColor: '#2C3E50',
                  backgroundColor: '#F8F9FA',
                  color: '#2C3E50'
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
              <label className="block text-sm font-medium mb-2 flex items-center gap-1" style={{ color: '#2C3E50' }}>
                <FaChartBar /> Status
              </label>
              <select
                className="w-full px-3 py-2 border-2 rounded-md focus:outline-none"
                style={{ 
                  borderColor: '#2C3E50',
                  backgroundColor: '#F8F9FA',
                  color: '#2C3E50'
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6 pt-6 border-t" style={{ borderColor: '#2C3E50' }}>
            <div className="text-center">
              <p className="text-2xl font-bold" style={{ color: '#2C3E50' }}>
                {filteredUsers.length}
              </p>
              <p className="text-sm opacity-70" style={{ color: '#2C3E50' }}>Total Users</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold" style={{ color: '#2C3E50' }}>
                {filteredUsers.filter(u => u.status === 'active').length}
              </p>
              <p className="text-sm opacity-70" style={{ color: '#2C3E50' }}>Active</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold" style={{ color: '#2C3E50' }}>
                {filteredUsers.filter(u => u.role === 'kasir').length}
              </p>
              <p className="text-sm opacity-70" style={{ color: '#2C3E50' }}>Kasir</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold" style={{ color: '#2C3E50' }}>
                {filteredUsers.filter(u => u.role === 'supervisor').length}
              </p>
              <p className="text-sm opacity-70" style={{ color: '#2C3E50' }}>Supervisors</p>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="rounded-lg shadow-lg overflow-hidden" style={{ backgroundColor: '#FFFFFF' }}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead style={{ backgroundColor: '#2C3E50' }}>
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-medium" style={{ color: '#ffffff' }}>
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium" style={{ color: '#ffffff' }}>
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium" style={{ color: '#ffffff' }}>
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium" style={{ color: '#ffffff' }}>
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium" style={{ color: '#ffffff' }}>
                    Performance
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium" style={{ color: '#ffffff' }}>
                    Last Login
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium" style={{ color: '#ffffff' }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user, index) => (
                  <tr key={user.id_user} className={index % 2 === 0 ? '' : 'bg-opacity-50'} style={{ backgroundColor: index % 2 === 0 ? 'transparent' : '#F8F9FA' }}>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div 
                          className="w-10 h-10 rounded-full flex items-center justify-center mr-3 font-bold shadow-md"
                          style={{ backgroundColor: '#2C3E50', color: '#FFFFFF' }}
                        >
                          {user.full_name?.charAt(0) || 'U'}
                        </div>
                        <div>
                          <p className="font-medium" style={{ color: '#2C3E50' }}>{user.full_name}</p>
                          <p className="text-sm opacity-70" style={{ color: '#2C3E50' }}>@{user.username}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p style={{ color: '#2C3E50' }}>{user.email || '-'}</p>
                      <p className="text-sm opacity-70" style={{ color: '#2C3E50' }}>{user.phone || '-'}</p>
                    </td>
                    <td className="px-6 py-4">
                      {getRoleBadge(user.role)}
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(user.is_active)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <p style={{ color: '#2C3E50' }}>{user.totalTransactions || 0} transactions</p>
                        <p className="opacity-70" style={{ color: '#2C3E50' }}>Rp {(user.totalRevenue || 0).toLocaleString()}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm" style={{ color: '#2C3E50' }}>{user.lastLogin || 'Never'}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => openEditModal(user)}
                          className="px-3 py-1 text-xs rounded-lg font-semibold transition-colors duration-200 shadow-md flex items-center gap-1"
                          style={{ 
                            backgroundColor: '#2C3E50',
                            color: '#FFFFFF'
                          }}
                        >
                          <FaEdit /> Edit
                        </button>
                        <button
                          onClick={() => handleToggleStatus(user.id_user, user.is_active)}
                          className="px-3 py-1 text-xs rounded-lg font-semibold transition-colors duration-200 shadow-md flex items-center gap-1"
                          style={{ 
                            backgroundColor: user.is_active ? '#FF5722' : '#4CAF50',
                            color: 'white'
                          }}
                        >
                          {user.is_active ? <FaBan /> : <FaCheckCircle />} {user.is_active ? 'Block' : 'Activate'}
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user.id_user)}
                          className="px-3 py-1 text-xs rounded-lg font-semibold transition-colors duration-200 shadow-md flex items-center gap-1"
                          style={{ 
                            backgroundColor: '#F44336',
                            color: 'white'
                          }}
                        >
                          <FaTrash /> Delete
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
              <p className="text-xl flex items-center justify-center" style={{ color: '#2C3E50' }}><FaUsers /></p>
              <p style={{ color: '#2C3E50' }}>No users found</p>
              <p className="text-sm opacity-70" style={{ color: '#2C3E50' }}>
                Try adjusting your filters
              </p>
            </div>
          )}
        </div>

        {/* Add User Modal */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="max-w-2xl w-full max-h-screen overflow-y-auto rounded-lg shadow-xl" style={{ backgroundColor: '#FFFFFF' }}>
              <form onSubmit={handleAddUser} className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold flex items-center gap-2" style={{ color: '#2C3E50' }}>
                    <FaPlus /> Add New User
                  </h2>
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="text-2xl hover:opacity-75"
                    style={{ color: '#2C3E50' }}
                  >
                    <FaTimes />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: '#2C3E50' }}>
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      className="w-full px-3 py-2 border-2 rounded-md focus:outline-none"
                      style={{ 
                        borderColor: '#2C3E50',
                        backgroundColor: '#F8F9FA',
                        color: '#2C3E50'
                      }}
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: '#2C3E50' }}>
                      Username *
                    </label>
                    <input
                      type="text"
                      required
                      className="w-full px-3 py-2 border-2 rounded-md focus:outline-none"
                      style={{ 
                        borderColor: '#2C3E50',
                        backgroundColor: '#F8F9FA',
                        color: '#2C3E50'
                      }}
                      value={formData.username}
                      onChange={(e) => setFormData({...formData, username: e.target.value})}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: '#2C3E50' }}>
                      Email *
                    </label>
                    <input
                      type="email"
                      required
                      className="w-full px-3 py-2 border-2 rounded-md focus:outline-none"
                      style={{ 
                        borderColor: '#2C3E50',
                        backgroundColor: '#F8F9FA',
                        color: '#2C3E50'
                      }}
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: '#2C3E50' }}>
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      required
                      className="w-full px-3 py-2 border-2 rounded-md focus:outline-none"
                      style={{ 
                        borderColor: '#2C3E50',
                        backgroundColor: '#F8F9FA',
                        color: '#2C3E50'
                      }}
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: '#2C3E50' }}>
                      Password *
                    </label>
                    <input
                      type="password"
                      required
                      className="w-full px-3 py-2 border-2 rounded-md focus:outline-none"
                      style={{ 
                        borderColor: '#2C3E50',
                        backgroundColor: '#F8F9FA',
                        color: '#2C3E50'
                      }}
                      value={formData.password}
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: '#2C3E50' }}>
                      Role *
                    </label>
                    <select
                      required
                      className="w-full px-3 py-2 border-2 rounded-md focus:outline-none"
                      style={{ 
                        borderColor: '#2C3E50',
                        backgroundColor: '#F8F9FA',
                        color: '#2C3E50'
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
                  <h3 className="text-lg font-bold mb-3 flex items-center gap-2" style={{ color: '#2C3E50' }}>
                    <FaLock /> Permissions
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {Object.entries(formData.permissions).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between p-3 rounded-md" style={{ backgroundColor: '#F8F9FA' }}>
                        <span className="text-sm flex items-center gap-1" style={{ color: '#2C3E50' }}>
                          {key === 'processSales' && <><FaMoneyBillWave /> Process Sales</>}
                          {key === 'viewProducts' && <><FaBox /> View Products</>}
                          {key === 'applyDiscounts' && <><FaTags /> Apply Discounts</>}
                          {key === 'editPrices' && <><FaChartLine /> Edit Prices</>}
                          {key === 'deleteTransactions' && <><FaTrash /> Delete Transactions</>}
                          {key === 'viewReports' && <><FaChartBar /> View Reports</>}
                          {key === 'manageUsers' && <><FaUsers /> Manage Users</>}
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
                      color: '#2C3E50',
                      borderColor: '#2C3E50'
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2 rounded-md font-medium transition-colors duration-200 disabled:opacity-50 flex items-center gap-2"
                    style={{ 
                      backgroundColor: '#2C3E50',
                      color: '#FFFFFF'
                    }}
                  >
                    {loading ? 'Adding...' : <><FaPlus /> Add User</>}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit User Modal */}
        {showEditModal && selectedUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="max-w-2xl w-full max-h-screen overflow-y-auto rounded-lg shadow-xl" style={{ backgroundColor: '#FFFFFF' }}>
              <form onSubmit={handleEditUser} className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold flex items-center gap-2" style={{ color: '#2C3E50' }}>
                    <FaEdit /> Edit User - {selectedUser.full_name}
                  </h2>
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="text-2xl hover:opacity-75"
                    style={{ color: '#2C3E50' }}
                  >
                    <FaTimes />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: '#2C3E50' }}>
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      className="w-full px-3 py-2 border-2 rounded-md focus:outline-none"
                      style={{ 
                        borderColor: '#2C3E50',
                        backgroundColor: '#F8F9FA',
                        color: '#2C3E50'
                      }}
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: '#2C3E50' }}>
                      Username *
                    </label>
                    <input
                      type="text"
                      required
                      className="w-full px-3 py-2 border-2 rounded-md focus:outline-none"
                      style={{ 
                        borderColor: '#2C3E50',
                        backgroundColor: '#F8F9FA',
                        color: '#2C3E50'
                      }}
                      value={formData.username}
                      onChange={(e) => setFormData({...formData, username: e.target.value})}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: '#2C3E50' }}>
                      Email *
                    </label>
                    <input
                      type="email"
                      required
                      className="w-full px-3 py-2 border-2 rounded-md focus:outline-none"
                      style={{ 
                        borderColor: '#2C3E50',
                        backgroundColor: '#F8F9FA',
                        color: '#2C3E50'
                      }}
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: '#2C3E50' }}>
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      required
                      className="w-full px-3 py-2 border-2 rounded-md focus:outline-none"
                      style={{ 
                        borderColor: '#2C3E50',
                        backgroundColor: '#F8F9FA',
                        color: '#2C3E50'
                      }}
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: '#2C3E50' }}>
                      New Password (leave blank to keep current)
                    </label>
                    <input
                      type="password"
                      className="w-full px-3 py-2 border-2 rounded-md focus:outline-none"
                      style={{ 
                        borderColor: '#2C3E50',
                        backgroundColor: '#F8F9FA',
                        color: '#2C3E50'
                      }}
                      value={formData.password}
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                      placeholder="Enter new password"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: '#2C3E50' }}>
                      Role *
                    </label>
                    <select
                      required
                      className="w-full px-3 py-2 border-2 rounded-md focus:outline-none"
                      style={{ 
                        borderColor: '#2C3E50',
                        backgroundColor: '#F8F9FA',
                        color: '#2C3E50'
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
                  <h3 className="text-lg font-bold mb-3 flex items-center gap-2" style={{ color: '#2C3E50' }}>
                    <FaLock /> Permissions
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {Object.entries(formData.permissions).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between p-3 rounded-md" style={{ backgroundColor: '#F8F9FA' }}>
                        <span className="text-sm flex items-center gap-1" style={{ color: '#2C3E50' }}>
                          {key === 'processSales' && <><FaMoneyBillWave /> Process Sales</>}
                          {key === 'viewProducts' && <><FaBox /> View Products</>}
                          {key === 'applyDiscounts' && <><FaTags /> Apply Discounts</>}
                          {key === 'editPrices' && <><FaChartLine /> Edit Prices</>}
                          {key === 'deleteTransactions' && <><FaTrash /> Delete Transactions</>}
                          {key === 'viewReports' && <><FaChartBar /> View Reports</>}
                          {key === 'manageUsers' && <><FaUsers /> Manage Users</>}
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
                      color: '#2C3E50',
                      borderColor: '#2C3E50'
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2 rounded-md font-medium transition-colors duration-200 disabled:opacity-50 flex items-center gap-2"
                    style={{ 
                      backgroundColor: '#2C3E50',
                      color: '#FFFFFF'
                    }}
                  >
                    {loading ? 'Updating...' : <><FaSave /> Update User</>}
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
