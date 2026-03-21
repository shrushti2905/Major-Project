import React, { useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { User as UserIcon, Mail, Star, Settings, MapPin, Sparkles, BookOpen, Globe, Palette, Clock, CheckCircle2, Plus, Loader2 } from 'lucide-react';

const Profile = () => {
  const { user, setUser } = useContext(AuthContext);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [location, setLocation] = useState('');
  const [bio, setBio] = useState('');
  const [skillsOffered, setSkillsOffered] = useState('');
  const [skillsWanted, setSkillsWanted] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [selectedTheme, setSelectedTheme] = useState('Indigo');
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      setLocation(user.location || '');
      setBio(user.bio || '');
      setSkillsOffered(Array.isArray(user.skillsOffered) ? user.skillsOffered.join(', ') : '');
      setSkillsWanted(Array.isArray(user.skillsWanted) ? user.skillsWanted.join(', ') : '');
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    try {
      const res = await axios.put('/api/users/profile', {
        name,
        email,
        location,
        bio,
        skillsOffered: skillsOffered.split(',').map(s => s.trim()).filter(s => s),
        skillsWanted: skillsWanted.split(',').map(s => s.trim()).filter(s => s),
      });
      setUser(res.data);
      alert('Profile updated successfully!');
    } catch (err) {
      console.error('Update profile error:', err);
      alert(err.response?.data?.message || 'Update failed');
    } finally {
      setIsUpdating(false);
    }
  };

  if (!user) return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <Loader2 className="w-12 h-12 text-purple-500 animate-spin" />
      <p className="text-slate-400 font-medium animate-pulse">Loading your profile...</p>
    </div>
  );

  return (
    <div className="space-y-10 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <h2 className="text-4xl font-black text-white tracking-tight">My Profile</h2>
        <div className="flex items-center gap-2 px-4 py-2 bg-green-500/10 text-green-400 rounded-full text-xs font-bold border border-green-500/20 shadow-lg shadow-green-500/5">
          <Globe size={14} />
          <span>Public Profile</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Main Info Card */}
        <div className="lg:col-span-2 space-y-10">
          <section className="bg-[#1e293b]/50 backdrop-blur-xl border border-white/5 p-8 lg:p-12 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity pointer-events-none">
              <Settings size={180} />
            </div>
            
            <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] mb-8 flex items-center gap-2">
              <UserIcon size={14} className="text-purple-500" />
              Profile Information
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                  <input
                    type="text"
                    className="w-full bg-[#0f172a]/80 border border-white/10 rounded-2xl py-3.5 px-6 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500/50 transition-all font-semibold"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div className="space-y-3">
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Location</label>
                  <div className="relative group">
                    <MapPin size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-purple-500 transition-colors" />
                    <input
                      type="text"
                      className="w-full bg-[#0f172a]/80 border border-white/10 rounded-2xl py-3.5 pl-12 pr-6 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500/50 transition-all font-semibold"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="e.g. New York, NY"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Professional Bio</label>
                <textarea
                  className="w-full bg-[#0f172a]/80 border border-white/10 rounded-[2rem] py-6 px-8 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500/50 transition-all font-medium resize-none min-h-[140px] leading-relaxed"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell others about your expertise and what you're looking to learn..."
                />
              </div>

              {/* Theme & Visibility Row */}
              <div className="flex flex-wrap items-center justify-between gap-6 p-6 bg-[#0f172a]/30 rounded-2xl border border-white/5">
                <div className="flex items-center gap-4">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Theme</label>
                  <select 
                    className="bg-[#0f172a] border border-white/10 rounded-full py-2 px-6 text-xs font-bold text-white focus:outline-none appearance-none cursor-pointer hover:bg-white/5 transition-all pr-10 relative"
                    value={selectedTheme}
                    onChange={(e) => setSelectedTheme(e.target.value)}
                  >
                    <option>Indigo</option>
                    <option>Purple</option>
                    <option>Emerald</option>
                  </select>
                </div>
                <div className="flex items-center gap-3">
                  <input 
                    type="checkbox" 
                    id="public" 
                    checked={isPublic} 
                    onChange={() => setIsPublic(!isPublic)} 
                    className="w-4 h-4 rounded-md accent-purple-500 bg-[#0f172a] border-white/10 cursor-pointer" 
                  />
                  <label htmlFor="public" className="text-xs font-bold text-slate-400 cursor-pointer hover:text-white transition-colors">Visible to others</label>
                </div>
              </div>

              <button 
                type="submit"
                disabled={isUpdating}
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-black py-4.5 rounded-2xl shadow-xl shadow-purple-500/20 transition-all active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {isUpdating ? <Loader2 size={20} className="animate-spin" /> : <CheckCircle2 size={20} />}
                Save Changes
              </button>
            </form>
          </section>
        </div>

        {/* Sidebar Cards */}
        <div className="space-y-8">
          {/* User Status Card */}
          <section className="bg-gradient-to-br from-purple-600 to-indigo-700 p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
            <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
            <div className="relative z-10 space-y-4">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md shadow-inner border border-white/10">
                <span className="text-white font-black text-2xl">{user.name?.charAt(0)}</span>
              </div>
              <div>
                <h4 className="text-xl font-bold text-white">{user.name}</h4>
                <p className="text-purple-100/70 text-sm flex items-center gap-2 mt-1">
                  <Mail size={14} /> {user.email}
                </p>
              </div>
              <div className="pt-2">
                <span className="px-3 py-1 bg-white/20 text-white rounded-lg text-[10px] font-black uppercase tracking-widest border border-white/10">
                  {user.role} Member
                </span>
              </div>
            </div>
          </section>

          {/* Skills Management */}
          <section className="bg-[#1e293b]/50 backdrop-blur-xl border border-white/5 rounded-[2.5rem] p-8 shadow-xl space-y-8">
            <div>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
                  <Sparkles size={16} className="text-purple-400" />
                  Giving
                </h3>
              </div>
              <textarea 
                className="w-full bg-[#0f172a]/50 border border-white/10 rounded-2xl py-4 px-5 text-sm text-slate-300 focus:outline-none focus:ring-1 focus:ring-purple-500/30 transition-all placeholder:text-slate-700 resize-none"
                placeholder="React, Photography, Cooking..."
                value={skillsOffered}
                onChange={(e) => setSkillsOffered(e.target.value)}
                rows="2"
              />
            </div>

            <div className="h-[1px] bg-white/5" />

            <div>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
                  <BookOpen size={16} className="text-blue-400" />
                  Learning
                </h3>
              </div>
              <textarea 
                className="w-full bg-[#0f172a]/50 border border-white/10 rounded-2xl py-4 px-5 text-sm text-slate-300 focus:outline-none focus:ring-1 focus:ring-purple-500/30 transition-all placeholder:text-slate-700 resize-none"
                placeholder="Python, Guitar, UI Design..."
                value={skillsWanted}
                onChange={(e) => setSkillsWanted(e.target.value)}
                rows="2"
              />
            </div>
          </section>

          {/* Pro Tip */}
          <div className="p-8 bg-white/5 rounded-[2.5rem] border border-white/5 relative group">
            <div className="absolute top-0 right-0 p-6 text-purple-500/10 group-hover:text-purple-500/20 transition-colors">
              <Zap size={48} />
            </div>
            <h4 className="text-sm font-black text-white mb-3 flex items-center gap-2">
              <Sparkles size={16} className="text-yellow-400" />
              Pro Tip
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed font-medium">
              Users with detailed bios and specific skill lists receive 3x more successful swap requests!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
