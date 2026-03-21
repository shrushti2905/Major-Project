import React, { useState, useEffect, useContext, useRef } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { MessageSquare, Send, User, Clock, Trash2 } from 'lucide-react';

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const { user } = useContext(AuthContext);
  const chatEndRef = useRef(null);

  // Load messages from localStorage to simulate persistence
  useEffect(() => {
    const savedMessages = localStorage.getItem('skillswap_chat_messages');
    if (savedMessages) {
      setMessages(JSON.parse(savedMessages));
    } else {
      setMessages([
        { id: 1, sender: 'System', text: 'Welcome to SkillSwap Chat! Start communicating with your swap partners here.', time: 'Now', isSystem: true }
      ]);
    }
  }, []);

  // Save messages to localStorage whenever they change
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('skillswap_chat_messages', JSON.stringify(messages));
    }
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    
    const newMessage = {
      id: Date.now(),
      senderId: user.id,
      senderName: user.name,
      text: inputText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isSystem: false
    };
    
    setMessages([...messages, newMessage]);
    setInputText('');
  };

  const clearChat = () => {
    if (window.confirm('Are you sure you want to clear your chat history?')) {
      const systemMsg = [{ id: 1, sender: 'System', text: 'Chat history cleared.', time: 'Now', isSystem: true }];
      setMessages(systemMsg);
      localStorage.setItem('skillswap_chat_messages', JSON.stringify(systemMsg));
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-4xl font-black text-white tracking-tight flex items-center gap-3">
          <MessageSquare size={36} className="text-purple-500" />
          Messages <span className="text-xs bg-purple-500/10 text-purple-400 px-3 py-1 rounded-full uppercase tracking-widest border border-purple-500/20">Beta</span>
        </h2>
        <button 
          onClick={clearChat}
          className="flex items-center gap-2 px-4 py-2 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white rounded-xl transition-all text-xs font-bold border border-red-500/20"
        >
          <Trash2 size={14} /> Clear History
        </button>
      </div>
      
      <div className="max-w-4xl mx-auto bg-[#1e293b]/80 backdrop-blur-xl rounded-[2.5rem] shadow-2xl border border-white/5 flex flex-col h-[650px] overflow-hidden">
        {/* Chat Header */}
        <div className="p-6 border-b border-white/5 bg-gradient-to-r from-purple-600 to-indigo-600 flex items-center gap-4">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-md">
            <User size={20} className="text-white" />
          </div>
          <div>
            <p className="font-bold text-white">Global SkillSwap Lounge</p>
            <p className="text-xs text-purple-100 opacity-80 flex items-center gap-1">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" /> {messages.length} messages in history
            </p>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar">
          {messages.map((m) => (
            <div key={m.id} className={`flex flex-col ${m.isSystem ? 'items-center' : m.senderId === user.id ? 'items-end' : 'items-start'}`}>
              {m.isSystem ? (
                <div className="bg-white/5 border border-white/5 px-4 py-1 rounded-full text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-2">
                  {m.text}
                </div>
              ) : (
                <div className="max-w-[80%] space-y-1">
                  <p className={`text-[10px] font-black uppercase tracking-widest mb-1 ${m.senderId === user.id ? 'text-purple-400 text-right' : 'text-slate-500'}`}>
                    {m.senderName}
                  </p>
                  <div className={`p-4 rounded-2xl shadow-lg ${
                    m.senderId === user.id 
                      ? 'bg-purple-600 text-white rounded-tr-none' 
                      : 'bg-[#0f172a] text-slate-200 border border-white/5 rounded-tl-none'
                  }`}>
                    <p className="text-sm font-medium leading-relaxed">{m.text}</p>
                    <div className={`flex items-center gap-1 mt-2 ${m.senderId === user.id ? 'justify-end opacity-60' : 'opacity-40'}`}>
                      <Clock size={10} />
                      <span className="text-[9px] font-bold">{m.time}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>

        {/* Chat Input */}
        <div className="p-6 bg-[#0f172a]/50 border-t border-white/5">
          <form onSubmit={handleSendMessage} className="flex gap-4">
            <input
              type="text"
              className="flex-1 bg-[#1e293b] border border-white/10 rounded-2xl py-4 px-6 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/30 transition-all placeholder:text-slate-700 font-medium"
              placeholder="Type your message to the community..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
            />
            <button className="bg-purple-600 text-white p-4 rounded-2xl hover:bg-purple-700 shadow-xl shadow-purple-500/20 transition-all active:scale-95 group">
              <Send size={24} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </button>
          </form>
          <p className="text-center text-[10px] text-slate-600 font-bold mt-4 uppercase tracking-widest italic">
            Messages are stored locally for this demonstration
          </p>
        </div>
      </div>
    </div>
  );
};

export default Chat;
