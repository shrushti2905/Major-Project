import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { 
  Sparkles, 
  BookOpen, 
  ArrowRight, 
  MessageSquare, 
  Settings, 
  Zap, 
  Users, 
  TrendingUp,
  Clock,
  CheckCircle2,
  ShieldCheck,
  Activity
} from 'lucide-react';
import Skeleton from '../components/Skeleton';

const Home = () => {
  const { user } = useContext(AuthContext);
  const [requests, setRequests] = useState([]);
  const [usersCount, setUsersCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [reqsRes, usersRes] = await Promise.all([
        axios.get('/api/requests/my-requests'),
        axios.get('/api/users/browse')
      ]);
      setRequests(reqsRes.data);
      setUsersCount(usersRes.data.length);
    } catch (err) {
      console.error('Fetch dashboard data error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="space-y-10">
      <Skeleton className="h-40 w-full rounded-[2.5rem]" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Skeleton className="h-64 rounded-[2.5rem]" />
        <Skeleton className="h-64 rounded-[2.5rem]" />
        <Skeleton className="h-64 rounded-[2.5rem]" />
      </div>
    </div>
  );

  const pendingRequests = requests.filter(r => r.status === 'pending' && r.receiverId?._id === user.id);
  const sentRequests = requests.filter(r => r.senderId?._id === user.id);

  return (
    <div className="space-y-10 pb-20">
      {/* Welcome Hero */}
      <section className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-[2.5rem] p-10 lg:p-16 shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-10 opacity-10 group-hover:scale-110 transition-transform duration-700">
          <Sparkles size={200} />
        </div>
        <div className="relative z-10 space-y-4">
          <h2 className="text-4xl lg:text-5xl font-black text-white leading-tight">
            Welcome back, <br/>
            <span className="text-purple-200">{user.name}</span>
          </h2>
          <p className="text-purple-100/80 font-medium max-w-lg">
            You have {pendingRequests.length} pending swap requests waiting for your approval. 
            Keep sharing your expertise to grow the community!
          </p>
          <div className="flex gap-4 pt-4">
            <Link to="/" className="px-6 py-3 bg-white text-purple-600 rounded-xl font-black shadow-lg hover:bg-purple-50 transition-all flex items-center gap-2">
              <TrendingUp size={18} /> Discover Skills
            </Link>
            <Link to="/profile" className="px-6 py-3 bg-white/10 text-white border border-white/20 rounded-xl font-black backdrop-blur-md hover:bg-white/20 transition-all flex items-center gap-2">
              <Settings size={18} /> Edit Profile
            </Link>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Quick Summary */}
        <div className="bg-[#1e293b]/50 border border-white/5 rounded-[2.5rem] p-8 shadow-xl space-y-8">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest">My Expertise</h3>
            <Sparkles size={16} className="text-purple-400" />
          </div>
          <div className="space-y-6">
            <div>
              <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-3">Giving</p>
              <div className="flex flex-wrap gap-2">
                {user.skillsOffered?.slice(0, 3).map(s => (
                  <span key={s} className="px-3 py-1 bg-purple-500/10 text-purple-400 rounded-lg text-xs font-bold border border-purple-500/10">{s}</span>
                ))}
                {user.skillsOffered?.length > 3 && <span className="text-xs text-slate-500 font-bold">+{user.skillsOffered.length - 3} more</span>}
              </div>
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-3">Learning</p>
              <div className="flex flex-wrap gap-2">
                {user.skillsWanted?.slice(0, 3).map(s => (
                  <span key={s} className="px-3 py-1 bg-blue-500/10 text-blue-400 rounded-lg text-xs font-bold border border-blue-500/10">{s}</span>
                ))}
                {user.skillsWanted?.length > 3 && <span className="text-xs text-slate-500 font-bold">+{user.skillsWanted.length - 3} more</span>}
              </div>
            </div>
          </div>
          <Link to="/profile" className="w-full py-3 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white rounded-xl text-xs font-bold border border-white/5 transition-all flex items-center justify-center gap-2">
            Manage Skills <ArrowRight size={14} />
          </Link>
        </div>

        {/* Requests Activity */}
        <div className="bg-[#1e293b]/50 border border-white/5 rounded-[2.5rem] p-8 shadow-xl space-y-8">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest">Recent Activity</h3>
            <Activity size={16} className="text-green-400" />
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-[#0f172a]/50 rounded-2xl border border-white/5">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 text-blue-400 rounded-lg">
                  <Clock size={16} />
                </div>
                <span className="text-xs font-bold text-slate-300">Pending</span>
              </div>
              <span className="text-lg font-black text-white">{pendingRequests.length}</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-[#0f172a]/50 rounded-2xl border border-white/5">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500/10 text-green-400 rounded-lg">
                  <CheckCircle2 size={16} />
                </div>
                <span className="text-xs font-bold text-slate-300">Sent Swaps</span>
              </div>
              <span className="text-lg font-black text-white">{sentRequests.length}</span>
            </div>
          </div>
          <Link to="/requests" className="w-full py-3 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white rounded-xl text-xs font-bold border border-white/5 transition-all flex items-center justify-center gap-2">
            View Requests Hub <ArrowRight size={14} />
          </Link>
        </div>

        {/* Community Quick View */}
        <div className="bg-[#1e293b]/50 border border-white/5 rounded-[2.5rem] p-8 shadow-xl space-y-8">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest">Community</h3>
            <Users size={16} className="text-blue-400" />
          </div>
          <div className="p-6 bg-gradient-to-br from-blue-600/20 to-indigo-600/20 rounded-2xl border border-white/5 text-center space-y-2">
            <h4 className="text-3xl font-black text-white">{usersCount}</h4>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Active Talent Pool</p>
          </div>
          <div className="space-y-4">
            <p className="text-xs text-slate-500 font-medium leading-relaxed">
              New skills like <span className="text-purple-400">React</span>, <span className="text-blue-400">Python</span>, and <span className="text-green-400">Design</span> were added today!
            </p>
            <Link to="/" className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-black shadow-xl shadow-purple-500/20 transition-all flex items-center justify-center gap-2 group">
              Explore Community <Zap size={14} className="group-hover:scale-125 transition-transform" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
