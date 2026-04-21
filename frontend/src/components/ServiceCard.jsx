import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { PLACEHOLDER_IMAGE } from '../constants';
import { cn } from '../lib/utils';

const ServiceCard = ({ service, idx }) => {
  const images = service.images && service.images.length > 0 ? service.images : [service.image || PLACEHOLDER_IMAGE];
  const [currentImage, setCurrentImage] = useState(0);

  const nextImage = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (images) {
      setCurrentImage((prev) => (prev + 1) % images.length);
    }
  };

  const prevImage = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (images) {
      setCurrentImage((prev) => (prev - 1 + images.length) % images.length);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: idx % 2 === 0 ? -20 : 20 }}
      whileInView={{ opacity: 1, x: 0 }}
      className={cn(
        "flex flex-col md:flex-row gap-8 items-center glass-card p-6 md:p-10",
        idx % 2 !== 0 && "md:flex-row-reverse"
      )}
    >
      <div className="w-full md:w-1/2 h-80 rounded-2xl overflow-hidden relative group">
        <AnimatePresence mode="wait">
          <motion.img 
            key={currentImage}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            src={images && images[currentImage]} 
            alt={`${service.name} - Image ${currentImage + 1}`} 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </AnimatePresence>

        {images && images.length > 1 && (
          <>
            <button 
              onClick={prevImage}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 flex items-center justify-center text-brand-accent shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
            >
              <ChevronLeft size={20} />
            </button>
            <button 
              onClick={nextImage}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 flex items-center justify-center text-brand-accent shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
            >
              <ChevronRight size={20} />
            </button>
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
              {images && images.map((_, i) => (
                <div 
                  key={i}
                  className={cn(
                    "w-2 h-2 rounded-full transition-all",
                    i === currentImage ? "bg-brand-accent w-4" : "bg-white/60"
                  )}
                />
              ))}
            </div>
          </>
        )}
      </div>
      <div className="w-full md:w-1/2 space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-3xl font-serif font-bold text-gray-900">{service.name}</h2>
            <p className="text-xs font-bold text-brand-accent uppercase tracking-widest mt-1">
              {service.category?.name || 'Signature Set'}
            </p>
          </div>
          <span className="bg-brand-pink text-brand-accent px-4 py-1 rounded-full text-sm font-bold">
            {service.duration}
          </span>
        </div>
        <p className="text-lg text-gray-600 leading-relaxed">{service.description}</p>
        <div className="text-3xl font-bold text-brand-accent">KES {service.price.toLocaleString()}</div>
        <Link to={`/book?service=${service.id || service._id}`} className="btn-primary inline-block">Book Now</Link>
      </div>
    </motion.div>
  );
};

export default ServiceCard;
