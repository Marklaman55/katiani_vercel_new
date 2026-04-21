import React from 'react';
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
  return (
    <Router>
      <div className="flex flex-col min-h-screen">
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
