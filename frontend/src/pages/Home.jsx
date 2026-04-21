import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { CheckCircle, Star, MapPin, Phone, ChevronRight } from 'lucide-react';
import { apiRequest } from '../services/api';
import { PLACEHOLDER_IMAGE } from '../constants';

const Home = () => {
  const [services, setServices] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [servicesData, reviewsData] = await Promise.all([
          apiRequest('/services'),
          apiRequest('/reviews')
        ]);
        setServices(servicesData);
        setReviews(reviewsData);
      } catch (err) {
        console.error("Failed to fetch home data:", err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="pt-20">
      {/* Hero Section */}
      <section className="relative h-[80vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&q=80&w=2000" 
            alt="Best Lash Extensions Nairobi - Katiani Styles Studio" 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-brand-pink/90 to-transparent" />
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-xl"
          >
            <span className="text-brand-accent font-medium tracking-widest uppercase mb-4 block">Professional Eyelash Technician in Kenya</span>
            <h1 className="text-5xl md:text-6xl font-serif font-bold text-gray-900 mb-6 leading-tight">
              Expert Lash Extensions in Nairobi - <span className="text-brand-accent">Katiani Styles</span>
            </h1>
            <p className="text-lg text-gray-700 mb-8">
              Experience the ultimate lash transformation with the best lash extensions in Nairobi. 
              Our expert eyelash technician in Kenya provides high-quality beauty services tailored to your unique look.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/book" className="btn-primary text-center flex items-center justify-center gap-2">
                Book Appointment
              </Link>
              <a 
                href="https://wa.me/254103491401" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="bg-[#25D366] text-white px-8 py-4 rounded-full font-bold hover:bg-[#128C7E] transition-all flex items-center justify-center gap-2 shadow-lg"
              >
                <Phone size={20} /> Book via WhatsApp
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-24 bg-brand-pink/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-serif font-bold text-gray-900 mb-4">Why Choose Katiani Styles for Your Lashes?</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">We pride ourselves on being the top choice for beauty services in Nairobi.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="text-center p-8 bg-white rounded-3xl shadow-sm border border-brand-pink-dark">
              <div className="w-16 h-16 bg-brand-pink rounded-full flex items-center justify-center mx-auto mb-6 text-brand-accent">
                <CheckCircle size={32} />
              </div>
              <h3 className="text-xl font-bold mb-4">High-Quality Materials</h3>
              <p className="text-gray-600">We use only premium, medical-grade adhesives and lightweight lashes for long-lasting results and maximum comfort.</p>
            </div>
            <div className="text-center p-8 bg-white rounded-3xl shadow-sm border border-brand-pink-dark">
              <div className="w-16 h-16 bg-brand-pink rounded-full flex items-center justify-center mx-auto mb-6 text-brand-accent">
                <Star size={32} />
              </div>
              <h3 className="text-xl font-bold mb-4">Expert Artistry</h3>
              <p className="text-gray-600">Our certified eyelash technician in Kenya ensures every set is customized to enhance your natural eye shape perfectly.</p>
            </div>
            <div className="text-center p-8 bg-white rounded-3xl shadow-sm border border-brand-pink-dark">
              <div className="w-16 h-16 bg-brand-pink rounded-full flex items-center justify-center mx-auto mb-6 text-brand-accent">
                <MapPin size={32} />
              </div>
              <h3 className="text-xl font-bold mb-4">Luxury Studio</h3>
              <p className="text-gray-600">Enjoy a relaxing, luxury studio experience in the heart of Nairobi. Your comfort is our top priority.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Services Preview */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-serif font-bold text-gray-900 mb-4">Our Signature Lash Sets</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">From natural to dramatic, we offer the best lash extensions in Nairobi for every style.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {services.slice(0, 3).map((service, idx) => (
              <motion.div
                key={service._id || idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="glass-card overflow-hidden group"
              >
                <div className="h-64 overflow-hidden">
                  <img 
                    src={service.images?.[0] || service.image || PLACEHOLDER_IMAGE} 
                    alt={`${service.name} - Lash Extensions Nairobi`} 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="p-8">
                  <h3 className="text-2xl font-serif font-bold mb-2">{service.name}</h3>
                  <p className="text-gray-600 mb-4 line-clamp-2">{service.description}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-xl font-bold text-brand-accent">KES {service.price.toLocaleString()}</span>
                    <Link to="/book" className="text-brand-accent font-medium flex items-center">
                      Book Now <ChevronRight size={16} />
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
          <div className="text-center mt-12">
            <Link to="/services" className="btn-secondary inline-block">View All Beauty Services Nairobi</Link>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-brand-pink/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-serif font-bold text-gray-900 mb-4">Client Love</h2>
            <p className="text-gray-600">Why we are the preferred eyelash technician in Kenya.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {reviews.length > 0 ? (
              reviews.map((t, idx) => (
                <motion.div 
                  key={t._id} 
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-white p-8 rounded-3xl shadow-sm border border-brand-pink-dark"
                >
                  <div className="flex text-brand-gold mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={16} className={i < t.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"} />
                    ))}
                  </div>
                  <p className="text-gray-700 italic mb-6">"{t.comment}"</p>
                  <p className="font-bold text-gray-900">- {t.bookingId?.name || 'Happy Client'}</p>
                </motion.div>
              ))
            ) : (
              [
                { name: "Sarah W.", text: "Best lash extensions Nairobi! The studio is so relaxing and my lashes look incredible.", rating: 5 },
                { name: "Jane M.", text: "I've tried many places, but Katiani Styles is on another level. The retention is amazing!", rating: 5 },
                { name: "Anita K.", text: "Professional, clean, and beautiful results. Highly recommend the Hybrid set.", rating: 5 }
              ].map((t, idx) => (
                <div key={idx} className="bg-white p-8 rounded-3xl shadow-sm border border-brand-pink-dark">
                  <div className="flex text-brand-gold mb-4">
                    {[...Array(t.rating)].map((_, i) => <Star key={i} size={16} fill="currentColor" />)}
                  </div>
                  <p className="text-gray-700 italic mb-6">"{t.text}"</p>
                  <p className="font-bold text-gray-900">- {t.name}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
