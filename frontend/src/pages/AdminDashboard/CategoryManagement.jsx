import React, { useState, useEffect, useRef } from 'react';
import { Plus, Trash2, Edit, Loader2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { apiRequest } from '../../services/api';

const CategoryManagement = ({ confirmAction }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const fetchedRef = useRef(false);
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const data = await apiRequest('/api/categories');
      setCategories(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error("Failed to fetch categories");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingCategory) {
        await apiRequest(`/api/admin/categories/${editingCategory._id}`, {
          method: 'PATCH',
          body: JSON.stringify(formData)
        });
        toast.success("Category updated");
      } else {
        await apiRequest('/api/admin/categories', {
          method: 'POST',
          body: JSON.stringify(formData)
        });
        toast.success("Category created");
      }
      setShowForm(false);
      setEditingCategory(null);
      setFormData({ name: '', description: '' });
      fetchCategories();
    } catch (err) {
      toast.error("Failed to save category");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (id) => {
    confirmAction(
      'Delete Category',
      'Are you sure you want to delete this category? This will only work if no services are assigned to it.',
      async () => {
        try {
          await apiRequest(`/api/admin/categories/${id}`, { method: 'DELETE' });
          toast.success("Category deleted");
          fetchCategories();
        } catch (err) {
          toast.error(err.response?.data?.message || "Failed to delete category");
          throw err;
        }
      }
    );
  };

  if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-brand-accent" size={40} /></div>;

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-serif font-bold text-gray-900">Categories</h2>
        <button 
          onClick={() => {
            setEditingCategory(null);
            setFormData({ name: '', description: '' });
            setShowForm(true);
          }}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={20} /> Add Category
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
                <h3 className="text-xl font-bold">{editingCategory ? 'Edit Category' : 'New Category'}</h3>
                <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700">Category Name</label>
                    <input 
                      required
                      className="input-field"
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                      placeholder="e.g. Classic Sets"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700">Description</label>
                    <input 
                      className="input-field"
                      value={formData.description}
                      onChange={e => setFormData({...formData, description: e.target.value})}
                      placeholder="Short description..."
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-4 pt-4">
                  <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
                  <button disabled={saving} className="btn-primary flex items-center gap-2">
                    {saving ? <Loader2 className="animate-spin" size={18} /> : null}
                    {editingCategory ? 'Update Category' : 'Create Category'}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((cat) => (
          <div key={cat._id} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex justify-between items-center group">
            <div>
              <h3 className="font-bold text-gray-900 text-lg">{cat.name}</h3>
              <p className="text-sm text-gray-500">{cat.description || 'No description'}</p>
            </div>
            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button 
                onClick={() => {
                  setEditingCategory(cat);
                  setFormData({ name: cat.name, description: cat.description || '' });
                  setShowForm(true);
                }}
                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              >
                <Edit size={18} />
              </button>
              <button 
                onClick={() => handleDelete(cat._id)}
                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
        {categories.length === 0 && (
          <div className="col-span-full text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
            <p className="text-gray-500">No categories found. Add your first category to organize services.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryManagement;
