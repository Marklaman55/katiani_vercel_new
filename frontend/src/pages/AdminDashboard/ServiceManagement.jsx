import React, { useState, useEffect, useRef } from 'react';
import { Plus, Trash2, Edit, Upload, ImageIcon, Loader2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { apiRequest } from '../../services/api';
import { PLACEHOLDER_IMAGE } from '../../constants';

const ServiceManagement = ({ confirmAction }) => {
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const fetchedRef = useRef(false);
  const [showForm, setShowForm] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    duration: '',
    category: '',
    images: []
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [servicesData, categoriesData] = await Promise.all([
        apiRequest('/api/services'),
        apiRequest('/api/categories')
      ]);
      setServices(Array.isArray(servicesData) ? servicesData : []);
      setCategories(Array.isArray(categoriesData) ? categoriesData : []);
    } catch (err) {
      toast.error("Failed to fetch services data");
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...files]
    }));
  };

  const removeImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    const priceNum = Number(formData.price);
    if (isNaN(priceNum) || priceNum <= 0) {
      toast.error("Price must be a positive number");
      return;
    }

    const durationRegex = /^(\d+h)?\s*(\d+m)?$/;
    if (!durationRegex.test(formData.duration.trim()) || formData.duration.trim() === "") {
      toast.error("Duration must be in format '2h' or '1h 30m'");
      return;
    }

    setSaving(true);

    const submitData = new FormData();
    submitData.append('name', formData.name);
    submitData.append('description', formData.description);
    submitData.append('price', formData.price);
    submitData.append('duration', formData.duration);
    submitData.append('category', formData.category);

    // Handle existing vs new images
    const existingImages = formData.images.filter(img => typeof img === 'string');
    const newImages = formData.images.filter(img => typeof img !== 'string');

    submitData.append('existingImages', JSON.stringify(existingImages));
    newImages.forEach(file => submitData.append('images', file));

    try {
      if (editingService) {
        await apiRequest(`/api/admin/services/${editingService._id}`, {
          method: 'PATCH',
          body: submitData
        });
        toast.success("Service updated");
      } else {
        await apiRequest('/api/admin/services', {
          method: 'POST',
          body: submitData
        });
        toast.success("Service created");
      }
      setShowForm(false);
      setEditingService(null);
      setFormData({ name: '', description: '', price: '', duration: '', category: '', images: [] });
      fetchData();
    } catch (err) {
      toast.error("Failed to save service");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (id) => {
    confirmAction(
      'Delete Service',
      'Are you sure you want to delete this service? This action cannot be undone.',
      async () => {
        try {
          await apiRequest(`/api/admin/services/${id}`, { method: 'DELETE' });
          toast.success("Service deleted");
          fetchData();
        } catch (err) {
          toast.error("Failed to delete service");
          throw err;
        }
      }
    );
  };

  if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-brand-accent" size={40} /></div>;

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-serif font-bold text-gray-900">Services</h2>
        <button 
          onClick={() => {
            setEditingService(null);
            setFormData({ name: '', description: '', price: '', duration: '', category: '', images: [] });
            setShowForm(true);
          }}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={20} /> Add Service
        </button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 mb-8">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-xl font-bold">{editingService ? 'Edit Service' : 'New Service'}</h3>
                <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700">Service Name</label>
                    <input 
                      required
                      className="input-field"
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700">Category</label>
                    <select 
                      required
                      className="input-field"
                      value={formData.category}
                      onChange={e => setFormData({...formData, category: e.target.value})}
                    >
                      <option value="">Select Category</option>
                      {categories.map(cat => (
                        <option key={cat._id} value={cat._id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700">Price (KES)</label>
                    <input 
                      required
                      type="number"
                      className="input-field"
                      value={formData.price}
                      onChange={e => setFormData({...formData, price: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700">Duration (e.g. 2h or 1h 30m)</label>
                    <input 
                      required
                      className="input-field"
                      placeholder="e.g. 1h 30m"
                      value={formData.duration}
                      onChange={e => setFormData({...formData, duration: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">Description</label>
                  <textarea 
                    required
                    className="input-field min-h-[120px]"
                    value={formData.description}
                    onChange={e => setFormData({...formData, description: e.target.value})}
                  />
                </div>

                <div className="space-y-4">
                  <label className="text-sm font-bold text-gray-700">Images</label>
                  <div className="flex flex-wrap gap-4">
                    {formData.images.map((img, i) => (
                      <div key={i} className="relative w-24 h-24 rounded-2xl overflow-hidden border border-gray-100 group">
                        <img 
                          src={typeof img === 'string' ? img : URL.createObjectURL(img)} 
                          className="w-full h-full object-cover"
                          alt="preview"
                        />
                        <button 
                          type="button"
                          onClick={() => removeImage(i)}
                          className="absolute inset-0 bg-red-500/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                    <label className="w-24 h-24 rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400 hover:border-brand-accent hover:text-brand-accent transition-all cursor-pointer">
                      <Upload size={24} />
                      <span className="text-[10px] font-bold mt-1">Upload</span>
                      <input type="file" multiple className="hidden" onChange={handleImageUpload} accept="image/*" />
                    </label>
                  </div>
                </div>

                <div className="flex justify-end gap-4 pt-4">
                  <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
                  <button disabled={saving} className="btn-primary flex items-center gap-2">
                    {saving ? <Loader2 className="animate-spin" size={18} /> : null}
                    {editingService ? 'Update Service' : 'Create Service'}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {services.map((service) => (
          <div key={service._id} className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden group">
            <div className="h-56 relative overflow-hidden">
              <img 
                src={service.images?.[0] || service.image || PLACEHOLDER_IMAGE} 
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                alt={service.name}
              />
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                <button 
                  onClick={() => {
                    setEditingService(service);
                    setFormData({
                      name: service.name,
                      description: service.description,
                      price: service.price,
                      duration: service.duration,
                      category: service.category?._id || service.category,
                      images: service.images || []
                    });
                    setShowForm(true);
                  }}
                  className="p-3 bg-white text-blue-600 rounded-2xl hover:scale-110 transition-transform shadow-lg"
                >
                  <Edit size={20} />
                </button>
                <button 
                  onClick={() => handleDelete(service._id)}
                  className="p-3 bg-white text-red-600 rounded-2xl hover:scale-110 transition-transform shadow-lg"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-xl text-gray-900">{service.name}</h3>
                <span className="bg-brand-pink text-brand-accent px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">
                  {service.category?.name || 'General'}
                </span>
              </div>
              <p className="text-sm text-gray-500 line-clamp-2 mb-4">{service.description}</p>
              <div className="flex justify-between items-center pt-4 border-t border-gray-50">
                <div className="text-lg font-bold text-brand-accent">KES {service.price.toLocaleString()}</div>
                <div className="text-xs font-medium text-gray-400">{service.duration}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ServiceManagement;
