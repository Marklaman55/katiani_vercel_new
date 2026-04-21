import React from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Facebook, MapPin, Phone, Mail } from 'lucide-react';

const Footer = () => (
  <footer className="bg-brand-pink pt-16 pb-8 border-t border-brand-pink-dark">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
        <div className="col-span-1 md:col-span-2">
          <h2 className="text-3xl font-serif font-bold text-brand-accent mb-4">katiani.Styles</h2>
          <p className="text-gray-600 max-w-md mb-6">
            Elevating your natural beauty with premium lash extensions. Experience luxury, comfort, and perfection in every set.
          </p>
          <div className="flex space-x-4">
            <a href="https://www.tiktok.com/@katianistyles?_r=1&_t=ZS-950bWqb1bwj" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-brand-accent shadow-sm hover:bg-brand-accent hover:text-white transition-all">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" fill="currentColor" width="20" height="20">
                <path d="M448,209.91a210.06,210.06,0,0,1-122.77-39.25V349.38A162.55,162.55,0,1,1,185,188.31V278.2a74.62,74.62,0,1,0,52.23,71.18V0l88,0a121.18,121.18,0,0,0,1.86,22.32h0A122.18,122.18,0,0,0,381,102.39a121.43,121.43,0,0,0,67,20.14Z"/>
              </svg>
            </a>
            <a href="https://www.instagram.com/katiani.styles/" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-brand-accent shadow-sm hover:bg-brand-accent hover:text-white transition-all">
              <Instagram size={20} />
            </a>
            <a href="#" className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-brand-accent shadow-sm hover:bg-brand-accent hover:text-white transition-all">
              <Facebook size={20} />
            </a>
          </div>
        </div>
        <div>
          <h3 className="font-bold text-gray-800 mb-4">Quick Links</h3>
          <ul className="space-y-2 text-gray-600">
            <li><Link to="/">Home</Link></li>
            <li><Link to="/services">Services</Link></li>
            <li><Link to="/book">Book Appointment</Link></li>
            <li><Link to="/admin/login">Admin Portal</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="font-bold text-gray-800 mb-4">Contact</h3>
          <ul className="space-y-2 text-gray-600">
            <li className="flex items-center space-x-2"><MapPin size={16} /> <span>Nairobi | Waiyaki way | Uthuli Arcade B8</span></li>
            <li className="flex items-center space-x-2">
              <Phone size={16} /> 
              <a href="https://wa.me/254788605695" target="_blank" rel="noopener noreferrer" className="hover:text-brand-accent transition-colors">
                +254 788 605 695 (WhatsApp)
              </a>
            </li>
            <li className="flex items-center space-x-2">
              <Phone size={16} /> 
              <a href="tel:+254704531783" className="hover:text-brand-accent transition-colors">
                +254 704 531 783 (Calls)
              </a>
            </li>
            <li className="flex items-center space-x-2"><Mail size={16} /> <span>hello@katianistyles.com</span></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-brand-pink-dark pt-8 text-center text-gray-500 text-sm">
        © {new Date().getFullYear()} katiani.Styles. All rights reserved.
      </div>
    </div>
  </footer>
);

export default Footer;
