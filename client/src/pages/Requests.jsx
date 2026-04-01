import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { ArrowRight, Check, X, Clock, MessageSquare, User, Zap } from 'lucide-react';
import Skeleton from '../components/Skeleton';

const Requests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const res = await axios.get('/api/requests/my-requests');
      setRequests(res.data);
    } catch (err) {
      console.error('Fetch requests error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (requestId, status) => {
    try {
      await axios.put('/api/requests/status', {
        requestId,
        status,
      });
      fetchRequests();
      alert(`Request ${status}`);
    } catch (err) {
      alert('Failed to update status');
    }
  };

  if (loading) return (
    <div className="space-y-10">
      <div className="flex justify-between items-center">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-8 w-32 rounded-full" />
      </div>
      <div className="space-y-6 max-w-5xl mx-auto">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-40 w-full rounded-[2rem]" />
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-10">
      <div className="flex items-center justify-between">
        <h2 className="text-4xl font-black text-white tracking-tight">Swap Requests</h2>
        <div className="flex items-center gap-2 px-4 py-2 bg-purple-500/10 text-purple-400 rounded-full text-xs font-bold border border-purple-500/20">
          <Zap size={14} fill="currentColor" />
          <span>{requests.length} Total Requests</span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 max-w-5xl mx-auto">
        {requests.length === 0 ? (
          <div className="bg-[#1e293b]/50 border border-white/5 p-20 rounded-[2.5rem] text-center space-y-4">
            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-600">
              <MessageSquare size={40} />
            </div>
            <h3 className="text-2xl font-bold text-white">No requests yet</h3>
            <p className="text-slate-500 max-w-sm mx-auto">Start browsing the Discover page to find skills you want to learn!</p>
          </div>
        ) : (
          requests.map(r => (
            <div key={r._id} className="bg-[#1e293b]/80 backdrop-blur-sm border border-white/10 p-8 rounded-[2rem] hover:bg-[#1e293b] transition-all relative overflow-hidden group">
              {/* Status Badge */}
              <div className="absolute top-6 right-8">
                <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                  r.status === 'pending' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                  r.status === 'accepted' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                  'bg-red-500/10 text-red-400 border-red-500/20'
                }`}>
                  {r.status}
                </span>
              </div>

              <div className="flex flex-col md:flex-row items-center gap-10">
                {/* Users involved */}
                <div className="flex items-center gap-6 flex-shrink-0">
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-14 h-14 bg-purple-600 rounded-2xl flex items-center justify-center text-white font-black text-lg shadow-lg">
                      {r.senderId.name.charAt(0)}
                    </div>
                    <span className="text-xs font-bold text-slate-400">{r.senderId.name}</span>
                  </div>
                  <ArrowRight className="text-slate-700" size={24} />
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center text-white font-black text-lg shadow-lg">
                      {r.receiverId.name.charAt(0)}
                    </div>
                    <span className="text-xs font-bold text-slate-400">{r.receiverId.name}</span>
                  </div>
                </div>

                {/* Swap Details */}
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-8 bg-[#0f172a]/50 p-6 rounded-2xl border border-white/5">
                  <div>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2">Giving Skill</p>
                    <p className="text-lg font-bold text-purple-400">{r.skillOffered}</p>
                  </div>
                  <div className="sm:border-l sm:border-white/5 sm:pl-8">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2">Wanting Skill</p>
                    <p className="text-lg font-bold text-blue-400">{r.skillRequested}</p>
                  </div>
                </div>

                {/* Actions */}
                {r.status === 'pending' && (r.receiverId._id === user.id || r.receiverId.id === user.id) && (
                  <div className="flex flex-row md:flex-col gap-3 w-full md:w-auto">
                    <button 
                      onClick={() => handleUpdateStatus(r._id, 'accepted')}
                      className="flex-1 md:w-12 md:h-12 bg-green-500 hover:bg-green-600 text-white rounded-xl flex items-center justify-center shadow-lg shadow-green-500/20 transition-all hover:scale-110"
                      title="Accept"
                    >
                      <Check size={20} strokeWidth={3} />
                    </button>
                    <button 
                      onClick={() => handleUpdateStatus(r._id, 'rejected')}
                      className="flex-1 md:w-12 md:h-12 bg-red-500 hover:bg-red-600 text-white rounded-xl flex items-center justify-center shadow-lg shadow-red-500/20 transition-all hover:scale-110"
                      title="Reject"
                    >
                      <X size={20} strokeWidth={3} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Requests;
