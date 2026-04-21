import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, X, History } from 'lucide-react';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-brand-pink-dark">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-2xl font-serif font-bold text-brand-accent">katiani.Styles</span>
            <div className="w-2 h-2 rounded-full bg-brand-gold" />
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            {!isAdmin ? (
              <>
                <Link to="/" className="text-gray-600 hover:text-brand-accent transition-colors">Home</Link>
                <Link to="/services" className="text-gray-600 hover:text-brand-accent transition-colors">Services</Link>
                <Link to="/my-bookings" className="text-gray-600 hover:text-brand-accent transition-colors flex items-center gap-1">
                  <History size={16} /> My Bookings
                </Link>
                <Link to="/book" className="btn-primary py-2 text-sm">Book Now</Link>
              </>
            ) : (
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Admin Control Panel</span>
            )}
          </div>

          {!isAdmin && (
            <button onClick={() => setIsOpen(!isOpen)} className="md:hidden text-gray-600">
              {isOpen ? <X /> : <Menu />}
            </button>
          )}
        </div>
      </div>

      <AnimatePresence>
        {isOpen && !isAdmin && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-b border-brand-pink-dark overflow-hidden"
          >
            <div className="px-4 pt-2 pb-6 space-y-4">
              <Link to="/" onClick={() => setIsOpen(false)} className="block text-lg text-gray-600">Home</Link>
              <Link to="/services" onClick={() => setIsOpen(false)} className="block text-lg text-gray-600">Services</Link>
              <Link to="/book" onClick={() => setIsOpen(false)} className="block btn-primary text-center">Book Now</Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
