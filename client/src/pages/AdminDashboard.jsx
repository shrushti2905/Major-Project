import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Users, FileText, ShieldAlert, ShieldCheck, Trash2, Ban, CheckCircle, Search, TrendingUp, Activity, BarChart3, AlertTriangle, UserMinus, ChevronLeft, ChevronRight, ArrowUpDown, Clock } from 'lucide-react';
import { TableRowSkeleton } from '../components/Skeleton';

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Pagination & Sorting State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(8);
  const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' });

  const { user } = useContext(AuthContext);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [usersRes, reqsRes] = await Promise.all([
        axios.get('/api/admin/users'),
        axios.get('/api/admin/requests')
      ]);
      setUsers(usersRes.data);
      setRequests(reqsRes.data);
    } catch (err) {
      console.error('Fetch admin data error:', err);
      alert('Failed to fetch admin data');
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedUsers = [...users].sort((a, b) => {
    if (a[sortConfig.key] < b[sortConfig.key]) {
      return sortConfig.direction === 'asc' ? -1 : 1;
    }
    if (a[sortConfig.key] > b[sortConfig.key]) {
      return sortConfig.direction === 'asc' ? 1 : -1;
    }
    return 0;
  });

  const filteredUsers = sortedUsers.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination Logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

  const handleBlockUser = async (userId, isBlocked) => {
    try {
      await axios.put('/api/admin/block-user', { userId, isBlocked });
      fetchAdminData();
      alert(`User ${isBlocked ? 'blocked' : 'unblocked'} successfully.`);
    } catch (err) {
      alert('Failed to update user status');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('CRITICAL ACTION: Are you sure you want to PERMANENTLY DELETE this user? This action cannot be undone and will remove all their swap history.')) return;
    try {
      await axios.delete(`/api/admin/user/${userId}`);
      fetchAdminData();
      alert('User purged from system successfully.');
    } catch (err) {
      alert('Failed to delete user');
    }
  };

  if (user?.role !== 'admin') return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
      <div className="p-4 bg-red-500/10 rounded-full text-red-500">
        <ShieldAlert size={48} />
      </div>
      <h2 className="text-2xl font-black text-white">Unauthorized Access</h2>
      <p className="text-slate-400">This area is restricted to system administrators only.</p>
    </div>
  );

  const stats = [
    { label: 'Total Users', value: users.length, icon: Users, color: 'text-blue-400', bg: 'bg-blue-400/10' },
    { label: 'Active Swaps', value: requests.filter(r => r.status === 'accepted').length, icon: Activity, color: 'text-green-400', bg: 'bg-green-400/10' },
    { label: 'Pending Requests', value: requests.filter(r => r.status === 'pending').length, icon: Clock, color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
    { label: 'Blocked Accounts', value: users.filter(u => u.isBlocked).length, icon: Ban, color: 'text-red-400', bg: 'bg-red-400/10' },
  ];

  return (
    <div className="space-y-10 max-w-7xl mx-auto pb-20">
      {/* Admin Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h2 className="text-4xl font-black text-white tracking-tight flex items-center gap-3">
            <ShieldCheck size={36} className="text-red-500" />
            System Administration
          </h2>
          <p className="text-slate-400 font-medium">Manage platform security, users, and global activity.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={fetchAdminData}
            className="px-6 py-2.5 bg-[#1e293b] hover:bg-[#334155] text-white rounded-xl text-sm font-bold border border-white/5 transition-all flex items-center gap-2"
          >
            <Activity size={16} className="text-green-400" /> Refresh Data
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((s, i) => (
          <div key={i} className="bg-[#1e293b]/50 border border-white/5 p-6 rounded-3xl shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-2xl ${s.bg} ${s.color}`}>
                <s.icon size={20} />
              </div>
              <TrendingUp size={16} className="text-slate-600" />
            </div>
            <p className="text-slate-500 text-xs font-black uppercase tracking-widest">{s.label}</p>
            <h3 className="text-3xl font-black text-white mt-1">{s.value}</h3>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
        {/* User Management Table */}
        <div className="xl:col-span-2 space-y-6">
          <div className="bg-[#1e293b]/50 border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl">
            <div className="p-8 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Users size={20} className="text-purple-500" />
                User Directory
              </h3>
              <div className="relative w-full md:w-64">
                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                <input 
                  type="text" 
                  placeholder="Search users..."
                  className="w-full bg-[#0f172a] border border-white/10 rounded-xl py-2 pl-11 pr-4 text-sm text-white focus:outline-none focus:ring-1 focus:ring-purple-500/50 transition-all"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-[#0f172a]/50 text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">
                  <tr>
                    <th className="px-8 py-4 cursor-pointer hover:text-white transition-colors group" onClick={() => handleSort('name')}>
                      <div className="flex items-center gap-2">
                        User <ArrowUpDown size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </th>
                    <th className="px-8 py-4">Status</th>
                    <th className="px-8 py-4 cursor-pointer hover:text-white transition-colors group" onClick={() => handleSort('role')}>
                      <div className="flex items-center gap-2">
                        Role <ArrowUpDown size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </th>
                    <th className="px-8 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {loading ? (
                    [...Array(5)].map((_, i) => <TableRowSkeleton key={i} />)
                  ) : (
                    currentUsers.map(u => (
                      <tr key={u._id} className="hover:bg-white/[0.02] transition-colors group">
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white shadow-lg ${u.role === 'admin' ? 'bg-red-600' : 'bg-purple-600'}`}>
                              {u.name.charAt(0)}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-white">{u.name}</p>
                              <p className="text-xs text-slate-500">{u.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-5">
                          {u.isBlocked ? (
                            <span className="flex items-center gap-1.5 text-red-400 text-[10px] font-black uppercase">
                              <Ban size={12} /> Blocked
                            </span>
                          ) : (
                            <span className="flex items-center gap-1.5 text-green-400 text-[10px] font-black uppercase">
                              <CheckCircle size={12} /> Active
                            </span>
                          )}
                        </td>
                        <td className="px-8 py-5">
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded-md border ${u.role === 'admin' ? 'text-red-400 border-red-500/20 bg-red-500/5' : 'text-slate-400 border-white/10 bg-white/5'}`}>
                            {u.role.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-8 py-5 text-right">
                          <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                              onClick={() => handleBlockUser(u._id, !u.isBlocked)}
                              className={`p-2 rounded-lg transition-all ${u.isBlocked ? 'text-green-400 hover:bg-green-400/10' : 'text-orange-400 hover:bg-orange-400/10'}`}
                              title={u.isBlocked ? 'Unblock User' : 'Block User'}
                            >
                              <Ban size={18} />
                            </button>
                            {u.role !== 'admin' && (
                              <button 
                                onClick={() => handleDeleteUser(u._id)}
                                className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
                                title="Delete User"
                              >
                                <UserMinus size={18} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            
            {/* Pagination Controls */}
            {!loading && totalPages > 1 && (
              <div className="px-8 py-4 bg-[#0f172a]/30 border-t border-white/5 flex items-center justify-between">
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                  Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredUsers.length)} of {filteredUsers.length} users
                </p>
                <div className="flex gap-2">
                  <button 
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(prev => prev - 1)}
                    className="p-2 bg-white/5 rounded-lg text-slate-400 hover:text-white disabled:opacity-30 transition-all border border-white/5"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button 
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(prev => prev + 1)}
                    className="p-2 bg-white/5 rounded-lg text-slate-400 hover:text-white disabled:opacity-30 transition-all border border-white/5"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Global Activity Table */}
        <div className="space-y-6">
          <div className="bg-[#1e293b]/50 border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl">
            <div className="p-8 border-b border-white/5">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <BarChart3 size={20} className="text-blue-500" />
                Global Swap Activity
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-[#0f172a]/50 text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">
                  <tr>
                    <th className="px-8 py-4">Parties</th>
                    <th className="px-8 py-4">Skills</th>
                    <th className="px-8 py-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {loading ? (
                    [...Array(5)].map((_, i) => <TableRowSkeleton key={i} />)
                  ) : (
                    requests.slice(0, 10).map(r => (
                      <tr key={r._id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-3">
                            <span className="text-xs font-bold text-white">{r.senderId?.name?.split(' ')[0]}</span>
                            <ArrowRight size={10} className="text-slate-600" />
                            <span className="text-xs font-bold text-white">{r.receiverId?.name?.split(' ')[0]}</span>
                          </div>
                        </td>
                        <td className="px-8 py-5">
                          <p className="text-[10px] font-bold text-purple-400">{r.skillOffered}</p>
                          <p className="text-[10px] font-bold text-blue-400">{r.skillRequested}</p>
                        </td>
                        <td className="px-8 py-5">
                          <span className={`text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-widest ${
                            r.status === 'accepted' ? 'bg-green-500/10 text-green-400 border border-green-500/10' :
                            r.status === 'rejected' ? 'bg-red-500/10 text-red-400 border border-red-500/10' :
                            'bg-blue-500/10 text-blue-400 border border-blue-500/10'
                          }`}>
                            {r.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Security Notice */}
          <div className="p-8 bg-red-500/5 rounded-[2.5rem] border border-red-500/10 space-y-4">
            <h4 className="text-sm font-black text-red-400 flex items-center gap-2">
              <AlertTriangle size={16} /> Security Notice
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed font-medium italic">
              All administrative actions are logged. Ensure user privacy and platform integrity when performing delete or block operations.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
