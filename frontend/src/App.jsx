import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';

// Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Pages
import Home from './pages/Home';
import ServicesPage from './pages/ServicesPage';
import BookingPage from './pages/BookingPage';
import MyBookings from './pages/MyBookings';
import PaymentStatus from './pages/PaymentStatus';
import SuccessPage from './pages/SuccessPage';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';

export default function App() {
  const [connStatus, setConnStatus] = useState('Checking...');

  useEffect(() => {
    console.log("🛠️ CURRENT LOCATION:", window.location.href);
    fetch('/api/connection')
      .then(async r => {
        if (!r.ok) {
          const text = await r.text();
          throw new Error(`HTTP ${r.status}: ${text.substring(0, 50)}`);
        }
        const contentType = r.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          return r.json();
        }
        throw new Error("Received non-JSON response from /api/connection");
      })
      .then(d => {
        console.log('🚀 CONNECTION OK:', d);
        setConnStatus(`Connected ✅ (DB: ${d.database || '?'})`);
      })
      .catch(e => {
        console.error('🚀 CONNECTION FAILED:', e);
        setConnStatus('Connection Failed ❌');
      });
  }, []);

  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <div className="fixed top-0 left-0 right-0 z-[100] bg-black text-white text-[10px] px-2 py-1 flex justify-between items-center opacity-50 hover:opacity-100 transition-opacity">
          <span>{connStatus}</span>
          <span>{window.location.host}</span>
        </div>
        <Navbar />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/services" element={<ServicesPage />} />
            <Route path="/book" element={<BookingPage />} />
            <Route path="/my-bookings" element={<MyBookings />} />
            <Route path="/payment-status" element={<PaymentStatus />} />
            <Route path="/success" element={<SuccessPage />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
          </Routes>
        </main>
        <Footer />
        <Toaster position="top-center" richColors />
      </div>
    </Router>
  );
}
