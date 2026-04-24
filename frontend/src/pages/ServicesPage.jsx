import React, { useState, useEffect, useRef } from 'react';
import { apiRequest } from '../services/api';
import ServiceCard from '../components/ServiceCard';
import { cn } from '../lib/utils';

const ServicesPage = () => {
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const fetchedRef = useRef(false);

  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;

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
        console.error("Failed to fetch services data:", err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredServices = selectedCategory === 'all' 
    ? services 
    : services.filter(s => (s.category?._id || s.category) === selectedCategory);

  if (loading) {
    return (
      <div className="pt-32 pb-24 min-h-screen bg-brand-pink/10 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-accent"></div>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-24 min-h-screen bg-brand-pink/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-serif font-bold text-gray-900 mb-4">Services & Pricing</h1>
          <p className="text-gray-600">Find the perfect set for your style and budget.</p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-4 mb-16">
          <button 
            onClick={() => setSelectedCategory('all')}
            className={cn(
              "px-6 py-2 rounded-full text-sm font-bold transition-all",
              selectedCategory === 'all' ? "bg-brand-accent text-white shadow-lg" : "bg-white text-gray-600 border border-gray-100"
            )}
          >
            All Services
          </button>
          {categories.map(cat => (
            <button 
              key={cat._id}
              onClick={() => setSelectedCategory(cat._id)}
              className={cn(
                "px-6 py-2 rounded-full text-sm font-bold transition-all",
                selectedCategory === cat._id ? "bg-brand-accent text-white shadow-lg" : "bg-white text-gray-600 border border-gray-100"
              )}
            >
              {cat.name}
            </button>
          ))}
        </div>

        <div className="space-y-12">
          {filteredServices.length === 0 ? (
            <div className="text-center py-20 bg-white/50 rounded-3xl border border-dashed border-gray-200">
              <p className="text-gray-500 italic">No services found in this category.</p>
            </div>
          ) : (
            filteredServices.map((service, idx) => (
              <ServiceCard key={service._id || idx} service={service} idx={idx} />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ServicesPage;
