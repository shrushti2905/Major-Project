import React, { useContext, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { AuthContext, AuthProvider } from './context/AuthContext';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Requests from './pages/Requests';
import AdminDashboard from './pages/AdminDashboard';
import Chat from './pages/Chat';
import { 
  LayoutGrid, 
  MessageSquare, 
  User as UserIcon, 
  LogOut, 
  ShieldCheck, 
  Search, 
  Menu, 
  X, 
  Bell, 
  Settings,
  ChevronRight,
  Sparkles
} from 'lucide-react';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  if (loading) return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
        <p className="text-slate-400 font-medium animate-pulse text-sm uppercase tracking-widest">System Booting...</p>
      </div>
    </div>
  );
  return user ? children : <Navigate to="/login" />;
};

const Layout = ({ children }) => {
  const { user, logout } = useContext(AuthContext);
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutGrid, role: 'user' },
    { name: 'Discover', path: '/discover', icon: Search, role: 'user' },
    { name: 'My Requests', path: '/requests', icon: MessageSquare, role: 'user' },
    { name: 'Profile Settings', path: '/profile', icon: UserIcon, role: 'both' },
    { name: 'Messages', path: '/chat', icon: MessageSquare, role: 'user' },
    { name: 'Administration', path: '/admin', icon: ShieldCheck, role: 'admin' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 flex overflow-hidden">
      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-72 bg-[#1e293b] border-r border-white/5 transition-transform duration-300 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} shadow-2xl shadow-black/50`}>
        <div className="h-full flex flex-col p-6">
          {/* Logo Section */}
          <div className="flex items-center gap-4 mb-12 px-2">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/20">
              <span className="text-white font-black text-2xl">SS</span>
            </div>
            <div>
              <h1 className="text-2xl font-black text-white tracking-tighter">SkillSwap</h1>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-none">Pro Edition</p>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden ml-auto text-slate-400">
              <X size={24} />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-2">
            {navItems.filter(item => item.role === 'both' || item.role === user?.role).map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl font-bold text-sm transition-all group ${
                  isActive(item.path) 
                  ? 'bg-purple-600 text-white shadow-xl shadow-purple-500/20' 
                  : 'text-slate-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                <item.icon size={20} className={isActive(item.path) ? 'text-white' : 'text-purple-500 group-hover:text-purple-400 transition-colors'} />
                <span className="flex-1">{item.name}</span>
                {isActive(item.path) && <ChevronRight size={16} />}
              </Link>
            ))}
          </nav>

          {/* Bottom Section: Profile Summary */}
          <div className="mt-auto pt-6 border-t border-white/5 space-y-4">
            <div className="p-4 bg-white/5 rounded-2xl border border-white/5 flex items-center gap-4 group">
              <div className="w-10 h-10 bg-purple-600/20 rounded-xl flex items-center justify-center text-purple-400 font-black border border-purple-500/20 group-hover:scale-110 transition-transform">
                {user?.name?.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-white truncate">{user?.name}</p>
                <p className="text-[10px] text-slate-500 font-black uppercase truncate">{user?.role}</p>
              </div>
            </div>
            <button 
              onClick={logout}
              className="w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl font-bold text-sm text-red-400 hover:bg-red-500 hover:text-white transition-all border border-red-500/10"
            >
              <LogOut size={20} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top Navbar */}
        <header className="h-20 bg-[#1e293b]/50 backdrop-blur-xl border-b border-white/5 flex items-center justify-between px-8 z-40">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-slate-400">
              <Menu size={24} />
            </button>
            <div className="relative group hidden sm:block">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-purple-500 transition-colors" />
              <input 
                type="text" 
                placeholder="Quick search across platform..."
                className="w-64 md:w-96 bg-[#0f172a]/50 border border-white/10 rounded-full py-2.5 pl-12 pr-6 text-xs text-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-500/30 transition-all placeholder:text-slate-600"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button className="p-2.5 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white rounded-xl transition-all border border-white/5 relative">
              <Bell size={20} />
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-[#1e293b]" />
            </button>
            <button className="p-2.5 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white rounded-xl transition-all border border-white/5">
              <Settings size={20} />
            </button>
            <div className="h-8 w-[1px] bg-white/10 mx-2 hidden sm:block" />
            <div className="hidden sm:flex flex-col items-end">
              <p className="text-xs font-bold text-white leading-none mb-1">{user?.name}</p>
              <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">{user?.role} Account</p>
            </div>
          </div>
        </header>

        {/* Scrollable Viewport */}
        <main className="flex-1 overflow-y-auto custom-scrollbar p-8 lg:p-12">
          {children}
        </main>
      </div>
    </div>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/" element={
            <PrivateRoute>
              <Layout><Home /></Layout>
            </PrivateRoute>
          } />
          <Route path="/discover" element={
            <PrivateRoute>
              <Layout><Dashboard /></Layout>
            </PrivateRoute>
          } />
          <Route path="/profile" element={
            <PrivateRoute>
              <Layout><Profile /></Layout>
            </PrivateRoute>
          } />
          <Route path="/requests" element={
            <PrivateRoute>
              <Layout><Requests /></Layout>
            </PrivateRoute>
          } />
          <Route path="/chat" element={
            <PrivateRoute>
              <Layout><Chat /></Layout>
            </PrivateRoute>
          } />
          <Route path="/admin" element={
            <PrivateRoute>
              <Layout><AdminDashboard /></Layout>
            </PrivateRoute>
          } />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
