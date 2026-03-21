import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { User as UserIcon, MessageCircle, Star, MapPin, Users, Zap, CheckCircle2, TrendingUp } from 'lucide-react';
import { CardSkeleton } from '../components/Skeleton';

const Dashboard = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useContext(AuthContext);
  const [requestModal, setRequestModal] = useState(null);
  const [skillOffered, setSkillOffered] = useState('');
  const [skillRequested, setSkillRequested] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = ['All', 'Programming', 'Design', 'Marketing', 'Creative', 'Language', 'Business'];

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await axios.get('/api/users/browse');
      setUsers(res.data);
    } catch (err) {
      console.error('Fetch users error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendRequest = async () => {
    try {
      await axios.post('/api/requests/send', {
        receiverId: requestModal._id,
        skillOffered,
        skillRequested,
      });
      setRequestModal(null);
      setSkillOffered('');
      setSkillRequested('');
      alert('Request sent successfully!');
    } catch (err) {
      alert('Failed to send request');
    }
  };

  if (loading) return (
    <div className="space-y-12">
      <div className="h-80 bg-white/5 rounded-[2.5rem] animate-pulse" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {[...Array(6)].map((_, i) => <CardSkeleton key={i} />)}
      </div>
    </div>
  );

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-[2.5rem] bg-[#1e293b] border border-white/5 p-12 lg:p-20 shadow-2xl">
        <div className="absolute top-0 right-0 w-1/2 h-full opacity-10 pointer-events-none">
          <svg viewBox="0 0 100 100" className="w-full h-full text-white">
            <path d="M0 0 L100 100 M100 0 L0 100" stroke="currentColor" strokeWidth="0.1" fill="none" />
            <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="0.1" fill="none" />
          </svg>
        </div>
        
        <div className="relative z-10 max-w-2xl space-y-6">
          <h1 className="text-5xl lg:text-6xl font-black text-white leading-tight tracking-tight">
            Share Skills, <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-400">Build Community</span>
          </h1>
          <p className="text-lg text-slate-400 leading-relaxed font-medium">
            Connect with talented individuals and exchange knowledge. <br className="hidden md:block"/>
            Learn something new while teaching what you know best.
          </p>
          <div className="flex flex-wrap gap-4 pt-4">
            <button className="px-8 py-4 bg-purple-600 hover:bg-purple-700 text-white rounded-2xl font-bold shadow-xl shadow-purple-500/20 transition-all hover:scale-105 flex items-center gap-2">
              <Zap size={20} fill="currentColor" />
              Post Your Skills
            </button>
            <button className="px-8 py-4 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-2xl font-bold transition-all backdrop-blur-sm">
              Browse Skills
            </button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Active Users', value: users.length + 1, change: '+4%', icon: Users, color: 'text-blue-400' },
          { label: 'Skills Available', value: '120', change: '+12%', icon: Star, color: 'text-yellow-400' },
          { label: 'Successful Swaps', value: '0', change: '0', icon: TrendingUp, color: 'text-green-400' },
          { label: 'Average Rating', value: 'N/A', change: '', icon: CheckCircle2, color: 'text-purple-400' },
        ].map((stat, i) => (
          <div key={i} className="bg-[#1e293b]/50 border border-white/5 p-6 rounded-3xl hover:bg-[#1e293b] transition-all group">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-slate-500 text-sm font-bold uppercase tracking-wider mb-1">{stat.label}</p>
                <h3 className="text-3xl font-black text-white">{stat.value}</h3>
              </div>
              <div className={`p-3 rounded-2xl bg-white/5 ${stat.color} group-hover:scale-110 transition-transform`}>
                <stat.icon size={24} />
              </div>
            </div>
            {stat.change && (
              <p className="text-xs font-bold text-green-400 flex items-center gap-1">
                {stat.change} <span className="text-slate-600 font-medium italic">this month</span>
              </p>
            )}
          </div>
        ))}
      </section>

      {/* Discover Section */}
      <section className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/5 pb-8">
          <div className="space-y-2">
            <h2 className="text-3xl font-black text-white">Discover Skills & People</h2>
            <div className="flex flex-wrap gap-2 pt-2">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-5 py-2 rounded-xl text-sm font-bold transition-all border ${
                    selectedCategory === cat 
                    ? 'bg-purple-600 border-purple-500 text-white shadow-lg shadow-purple-500/20' 
                    : 'bg-white/5 border-white/5 text-slate-400 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
          <div className="w-full md:w-80">
            <input 
              type="text" 
              placeholder="Filter by name or skill..."
              className="w-full bg-[#1e293b] border border-white/10 rounded-2xl py-3 px-5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500/30 transition-all placeholder:text-slate-600"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {users.map(u => (
            <div key={u._id} className="bg-[#1e293b]/80 backdrop-blur-sm border border-white/10 p-8 rounded-[2rem] hover:bg-[#1e293b] transition-all hover:translate-y-[-4px] hover:shadow-2xl hover:shadow-black/40 group relative overflow-hidden">
              {/* Decorative Circle */}
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-purple-500/5 rounded-full group-hover:scale-150 transition-transform duration-700" />
              
              <div className="flex items-center gap-5 mb-8 relative z-10">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-xl shadow-purple-500/20 text-white font-black text-xl">
                  {u.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white group-hover:text-purple-400 transition-colors">{u.name}</h3>
                  <div className="flex items-center gap-2 text-slate-500 text-sm mt-1">
                    <MapPin size={14} className="text-slate-600" />
                    <span>{u.location || 'Unknown Location'}</span>
                  </div>
                  <div className="flex items-center gap-1 mt-2">
                    {[...Array(5)].map((_, i) => <Star key={i} size={12} className="text-slate-700 fill-slate-700" />)}
                    <span className="text-[10px] text-slate-600 font-bold ml-1">(0.0)</span>
                  </div>
                </div>
                <button 
                  onClick={() => setRequestModal(u)}
                  className="ml-auto p-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl shadow-lg shadow-purple-500/20 transition-all hover:scale-110 active:scale-95"
                  title="Request Swap"
                >
                  <MessageCircle size={20} fill="currentColor" />
                </button>
              </div>

              <div className="space-y-6 relative z-10">
                <div>
                  <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-3">Offers:</p>
                  <div className="flex flex-wrap gap-2">
                    {u.skillsOffered.length > 0 ? u.skillsOffered.map(s => (
                      <span key={s} className="bg-purple-500/10 text-purple-400 px-3 py-1 rounded-lg text-xs font-bold border border-purple-500/10">{s}</span>
                    )) : <span className="text-slate-600 text-xs italic">No skills listed</span>}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-3">Wants:</p>
                  <div className="flex flex-wrap gap-2">
                    {u.skillsWanted.length > 0 ? u.skillsWanted.map(s => (
                      <span key={s} className="bg-blue-500/10 text-blue-400 px-3 py-1 rounded-lg text-xs font-bold border border-blue-500/10">{s}</span>
                    )) : <span className="text-slate-600 text-xs italic">No skills listed</span>}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Request Modal */}
      {requestModal && (
        <div className="fixed inset-0 bg-[#0f172a]/90 backdrop-blur-sm flex justify-center items-center z-[100] px-4">
          <div className="bg-[#1e293b] p-10 rounded-[2.5rem] border border-white/10 shadow-2xl w-full max-w-md animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-lg">
                {requestModal.name.charAt(0)}
              </div>
              <h3 className="text-2xl font-black text-white">Swap with {requestModal.name}</h3>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">What skill will you teach?</label>
                <input 
                  type="text" 
                  className="w-full bg-[#0f172a] border border-white/10 rounded-2xl py-4 px-6 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/30 transition-all placeholder:text-slate-700 font-medium"
                  placeholder="e.g. JavaScript"
                  value={skillOffered}
                  onChange={(e) => setSkillOffered(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">What skill do you want to learn?</label>
                <input 
                  type="text" 
                  className="w-full bg-[#0f172a] border border-white/10 rounded-2xl py-4 px-6 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/30 transition-all placeholder:text-slate-700 font-medium"
                  placeholder="e.g. Python"
                  value={skillRequested}
                  onChange={(e) => setSkillRequested(e.target.value)}
                />
              </div>
              <div className="flex gap-4 pt-4">
                <button 
                  onClick={handleSendRequest} 
                  className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-black py-4 rounded-2xl shadow-xl shadow-purple-500/20 transition-all active:scale-95"
                >
                  Send Request
                </button>
                <button 
                  onClick={() => setRequestModal(null)} 
                  className="px-6 py-4 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white rounded-2xl font-bold transition-all border border-white/5"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
