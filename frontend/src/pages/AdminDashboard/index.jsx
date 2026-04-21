import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, Users, Scissors, FolderTree, 
  MessageSquare, Settings, LogOut, Menu, X,
  Bell, Search, Filter, Download, Plus, Trash2, Edit, Phone,
  CheckCircle, XCircle, Clock, TrendingUp, DollarSign, Calendar as CalendarIcon,
  ChevronLeft, ChevronRight, Star, Upload, Image as ImageIcon, QrCode, Database
} from 'lucide-react';
import { toast } from 'sonner';
import { apiRequest } from '../../services/api';
import ConfirmModal from '../../components/ConfirmModal';
import StatsGrid from './StatsGrid';
import ChartsSection from './ChartsSection';
import BookingsTable from './BookingsTable';
import ClientManagement from './ClientManagement';
import ServiceManagement from './ServiceManagement';
import CategoryManagement from './CategoryManagement';
import ReviewManagement from './ReviewManagement';
import SystemConfigTab from './SystemConfigTab';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [bookings, setBookings] = useState([]);
  const [stats, setStats] = useState({
    totalBookings: 0,
    totalRevenue: 0,
    pendingBookings: 0,
    activeClients: 0
  });
  const [loading, setLoading] = useState(true);
  const [whatsappStatus, setWhatsappStatus] = useState('unknown');

  // Confirm Modal State
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
    loading: false
  });

  const confirmAction = (title, message, onConfirm) => {
    setConfirmModal({
      isOpen: true,
      title,
      message,
      onConfirm: async () => {
        setConfirmModal(prev => ({ ...prev, loading: true }));
        try {
          await onConfirm();
          setConfirmModal(prev => ({ ...prev, isOpen: false, loading: false }));
        } catch (err) {
          setConfirmModal(prev => ({ ...prev, loading: false }));
        }
      },
      loading: false
    });
  };

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate('/admin/login');
      return;
    }
    fetchData();
    checkWhatsapp();
    const interval = setInterval(fetchData, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, [navigate]);

  const fetchData = async () => {
    try {
      const [bookingsData, statsData] = await Promise.all([
        apiRequest('/admin/bookings'),
        apiRequest('/admin/stats')
      ]);
      setBookings(bookingsData);
      setStats(statsData);
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.removeItem('adminToken');
        navigate('/admin/login');
      }
      toast.error("Failed to fetch dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const checkWhatsapp = async () => {
    try {
      const data = await apiRequest('/admin/whatsapp-status');
      setWhatsappStatus(data.status);
    } catch (err) {
      setWhatsappStatus('error');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/admin/login');
    toast.success("Logged out successfully");
  };

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'clients', label: 'Clients', icon: Users },
    { id: 'services', label: 'Services', icon: Scissors },
    { id: 'categories', label: 'Categories', icon: FolderTree },
    { id: 'reviews', label: 'Reviews', icon: MessageSquare },
    { id: 'config', label: 'System Config', icon: Settings },
  ];

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-brand-accent mx-auto mb-4"></div>
        <p className="text-gray-500 font-medium">Loading Studio Dashboard...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-gray-100 transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:relative lg:translate-x-0
      `}>
        <div className="h-full flex flex-col">
          <div className="p-8 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-brand-accent rounded-lg flex items-center justify-center text-white font-bold">K</div>
              <span className="text-xl font-serif font-bold text-gray-900">katiani.Admin</span>
            </div>
            <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-gray-400">
              <X size={20} />
            </button>
          </div>

          <nav className="flex-grow px-4 space-y-2">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`
                  w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all
                  ${activeTab === item.id 
                    ? 'bg-brand-pink text-brand-accent font-bold shadow-sm' 
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}
                `}
              >
                <item.icon size={20} />
                {item.label}
              </button>
            ))}
          </nav>

          <div className="p-4 border-t border-gray-50">
            <div className={`flex items-center gap-3 px-4 py-3 rounded-2xl mb-4 text-sm font-medium ${
              whatsappStatus === 'online' ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'
            }`}>
              <div className={`w-2 h-2 rounded-full ${whatsappStatus === 'online' ? 'bg-green-500' : 'bg-red-500'}`} />
              WhatsApp: {whatsappStatus === 'online' ? 'Connected' : 'Disconnected'}
            </div>
            <button 
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-red-500 hover:bg-red-50 transition-all font-bold"
            >
              <LogOut size={20} />
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-grow min-w-0 flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-100 h-20 flex items-center justify-between px-4 sm:px-8 flex-shrink-0">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(true)} className={`lg:hidden p-2 text-gray-500 ${isSidebarOpen ? 'hidden' : 'block'}`}>
              <Menu size={24} />
            </button>
            <h1 className="text-xl font-bold text-gray-900 capitalize">{activeTab}</h1>
          </div>
          
          <div className="flex items-center gap-4 sm:gap-6">
            <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-xl border border-gray-100">
              <Search size={18} className="text-gray-400" />
              <input type="text" placeholder="Search anything..." className="bg-transparent border-none outline-none text-sm w-40 lg:w-64" />
            </div>
            <button className="p-2 text-gray-400 hover:text-gray-600 relative">
              <Bell size={22} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-brand-accent rounded-full border-2 border-white"></span>
            </button>
            <div className="w-10 h-10 rounded-full bg-brand-pink border border-brand-pink-dark flex items-center justify-center text-brand-accent font-bold">
              A
            </div>
          </div>
        </header>

        {/* Scrollable Area */}
        <div className="flex-grow overflow-y-auto p-4 sm:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'dashboard' && (
                <div className="space-y-8">
                  <StatsGrid stats={stats} />
                  <ChartsSection />
                  <BookingsTable bookings={bookings} fetchBookings={fetchData} confirmAction={confirmAction} />
                </div>
              )}
              {activeTab === 'clients' && <ClientManagement confirmAction={confirmAction} />}
              {activeTab === 'services' && <ServiceManagement confirmAction={confirmAction} />}
              {activeTab === 'categories' && <CategoryManagement confirmAction={confirmAction} />}
              {activeTab === 'reviews' && <ReviewManagement confirmAction={confirmAction} />}
              {activeTab === 'config' && <SystemConfigTab />}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      <ConfirmModal 
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
        loading={confirmModal.loading}
      />
    </div>
  );
};

export default AdminDashboard;
