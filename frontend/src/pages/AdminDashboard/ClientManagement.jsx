import React, { useState, useEffect } from 'react';
import { Search, Filter, Download, Trash2, Edit, Phone, Mail, User as UserIcon, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import api from '../../services/api';
import { cn, formatKenyanNumber } from '../../lib/utils';

const ClientManagement = ({ confirmAction }) => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/admin/clients');
      setClients(res.data);
    } catch (err) {
      toast.error("Failed to fetch clients");
    } finally {
      setLoading(false);
    }
  };

  const deleteClient = async (id) => {
    confirmAction(
      'Delete Client',
      'Are you sure you want to delete this client? This will remove all their booking history.',
      async () => {
        try {
          await api.delete(`/api/admin/clients/${id}`);
          toast.success("Client deleted");
          fetchClients();
        } catch (err) {
          toast.error("Failed to delete client");
          throw err;
        }
      }
    );
  };

  const filteredClients = clients
    .filter(client => 
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.phone.includes(searchTerm) ||
      (client.email && client.email.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    .sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'bookings') return (b.bookingCount || 0) - (a.bookingCount || 0);
      if (sortBy === 'recent') return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      return 0;
    });

  const exportClients = () => {
    const headers = ['Name', 'Phone', 'Email', 'Total Bookings', 'Last Visit'];
    const rows = filteredClients.map(c => [
      c.name,
      `254${c.phone}`,
      c.email || 'N/A',
      c.bookingCount || 0,
      c.lastBookingDate ? new Date(c.lastBookingDate).toLocaleDateString() : 'N/A'
    ]);
    
    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `clients_${new Date().toLocaleDateString()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-brand-accent" size={40} /></div>;

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-3xl font-serif font-bold text-gray-900">Client Management</h2>
        <button 
          onClick={exportClients}
          className="btn-secondary flex items-center gap-2"
        >
          <Download size={20} /> Export CSV
        </button>
      </div>

      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4">
        <div className="flex-grow flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-xl border border-gray-100">
          <Search size={18} className="text-gray-400" />
          <input 
            type="text" 
            placeholder="Search by name, phone or email..." 
            className="bg-transparent border-none outline-none text-sm w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-xl border border-gray-100">
          <Filter size={18} className="text-gray-400" />
          <select 
            className="bg-transparent border-none outline-none text-sm font-medium text-gray-600"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="name">Sort by Name</option>
            <option value="bookings">Most Bookings</option>
            <option value="recent">Recently Active</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredClients.map((client) => (
          <div key={client._id} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 group relative">
            <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button 
                onClick={() => deleteClient(client._id)}
                className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
              >
                <Trash2 size={18} />
              </button>
            </div>

            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 rounded-2xl bg-brand-pink flex items-center justify-center text-brand-accent text-xl font-bold">
                {client.name[0]}
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-lg">{client.name}</h3>
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <Phone size={12} /> +254 {formatKenyanNumber(client.phone)}
                </div>
              </div>
            </div>

            <div className="space-y-3 mb-6">
              {client.email && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Mail size={14} className="text-gray-400" />
                  <span className="truncate">{client.email}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <UserIcon size={14} className="text-gray-400" />
                <span>{client.bookingCount || 0} Total Bookings</span>
              </div>
            </div>

            <div className="flex gap-3">
              <a 
                href={`https://wa.me/254${client.phone}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 py-2 bg-green-50 text-green-600 rounded-xl text-xs font-bold hover:bg-green-100 transition-all"
              >
                <Phone size={14} /> WhatsApp
              </a>
              <button 
                onClick={() => toast.info("Client details feature coming soon")}
                className="flex-1 py-2 bg-gray-50 text-gray-600 rounded-xl text-xs font-bold hover:bg-gray-100 transition-all"
              >
                View History
              </button>
            </div>
          </div>
        ))}
        {filteredClients.length === 0 && (
          <div className="col-span-full text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
            <p className="text-gray-500">No clients found matching your search.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientManagement;
