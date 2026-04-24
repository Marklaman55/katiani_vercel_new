import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Lock, User as UserIcon, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { apiRequest } from '../services/api';

const AdminLogin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await apiRequest('/api/admin/login', {
        method: 'POST',
        body: JSON.stringify({ username, password })
      });
      localStorage.setItem('adminToken', res.token);
      toast.success("Welcome back, Admin!");
      navigate('/admin/dashboard');
    } catch (err) {
      toast.error("Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-32 pb-24 bg-brand-pink/20 flex items-center justify-center px-4">
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="glass-card p-8 sm:p-12 max-w-md w-full"
      >
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-brand-accent text-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Lock size={32} />
          </div>
          <h1 className="text-3xl font-serif font-bold text-gray-900">Admin Portal</h1>
          <p className="text-gray-500 mt-2">Secure access for studio management</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
              <UserIcon size={16} /> Username
            </label>
            <input 
              required
              type="text" 
              className="input-field"
              value={username}
              onChange={e => setUsername(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
              <Lock size={16} /> Password
            </label>
            <input 
              required
              type="password" 
              className="input-field"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </div>
          <button 
            disabled={loading}
            className="w-full btn-primary py-4 text-lg font-bold flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" /> : null}
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default AdminLogin;
