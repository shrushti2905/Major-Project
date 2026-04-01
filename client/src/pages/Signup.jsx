import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { UserPlus, Mail, Lock, User, Sparkles, BookOpen, Loader2, AlertCircle, Eye, EyeOff } from 'lucide-react';

const Signup = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    skillsOffered: '',
    skillsWanted: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    try {
      await axios.post('/api/auth/signup', {
        ...formData,
        skillsOffered: formData.skillsOffered.split(',').map(s => s.trim()).filter(s => s),
        skillsWanted: formData.skillsWanted.split(',').map(s => s.trim()).filter(s => s),
      });
      navigate('/login');
    } catch (err) {
      console.error('Signup error details:', err);
      setError(err.response?.data?.message || 'Signup failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-[#0f172a] py-12">
      {/* Background Particles Decoration */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute bg-white/10 rounded-full"
            style={{
              width: Math.random() * 4 + 'px',
              height: Math.random() * 4 + 'px',
              top: Math.random() * 100 + '%',
              left: Math.random() * 100 + '%',
              animation: `float ${Math.random() * 10 + 5}s infinite linear`
            }}
          />
        ))}
      </div>

      <div className="max-w-xl w-full relative z-10 px-4">
        <div className="bg-[#1e293b]/80 backdrop-blur-xl p-8 rounded-3xl border border-white/10 shadow-2xl">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-lg shadow-white/10">
              <span className="text-[#0f172a] font-black text-xl">SS</span>
            </div>
          </div>

          <h1 className="text-3xl font-bold text-white text-center mb-8">Join SkillSwap</h1>

          {/* Tab Toggle */}
          <div className="flex bg-[#0f172a]/50 p-1 rounded-2xl mb-8 border border-white/5">
            <Link 
              to="/login" 
              className="flex-1 py-2.5 text-center text-sm font-bold rounded-xl text-slate-400 hover:text-white transition-all"
            >
              Sign In
            </Link>
            <Link 
              to="/signup" 
              className="flex-1 py-2.5 text-center text-sm font-bold rounded-xl bg-white text-[#0f172a] shadow-lg transition-all"
            >
              Sign Up
            </Link>
          </div>

          {error && (
            <div className="mb-6 flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-2xl text-sm animate-in fade-in slide-in-from-top-2">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p>{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Full Name</label>
                <input
                  name="name"
                  type="text"
                  required
                  className="w-full px-5 py-3.5 bg-[#0f172a]/50 border border-white/10 text-white rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all text-center placeholder:text-slate-600"
                  placeholder="Your Name"
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Email Address</label>
                <input
                  name="email"
                  type="email"
                  required
                  className="w-full px-5 py-3.5 bg-[#0f172a]/50 border border-white/10 text-white rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all text-center placeholder:text-slate-600"
                  placeholder="Your Email"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Password</label>
              <div className="relative group">
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  className="w-full px-5 py-3.5 bg-[#0f172a]/50 border border-white/10 text-white rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all text-center placeholder:text-slate-600"
                  placeholder="Create a password"
                  value={formData.password}
                  onChange={handleChange}
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1 flex items-center justify-center gap-2">
                  <Sparkles size={14} className="text-purple-400" />
                  Skills You Can Teach
                </label>
                <input
                  name="skillsOffered"
                  type="text"
                  className="w-full px-5 py-3.5 bg-[#0f172a]/50 border border-white/10 text-white rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all text-center placeholder:text-slate-600"
                  placeholder="React, Design, Cooking..."
                  value={formData.skillsOffered}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1 flex items-center justify-center gap-2">
                  <BookOpen size={14} className="text-purple-400" />
                  Skills You Want to Learn
                </label>
                <input
                  name="skillsWanted"
                  type="text"
                  className="w-full px-5 py-3.5 bg-[#0f172a]/50 border border-white/10 text-white rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all text-center placeholder:text-slate-600"
                  placeholder="Python, UI/UX, Guitar..."
                  value={formData.skillsWanted}
                  onChange={handleChange}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#8b5cf6] hover:bg-[#7c3aed] disabled:bg-purple-400/50 text-white font-bold py-4 rounded-2xl shadow-xl shadow-purple-500/20 transition-all flex items-center justify-center gap-2 group mt-4"
            >
              {isSubmitting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <span>Create Account</span>
                  <UserPlus className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Signup;
