import React from 'react';
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Index from './pages/Index';
import About from './pages/About';
import ContactModal from './components/ContactModal';
import { CmsProvider } from './context/CmsContext';

function AppContent() {
  const location = useLocation();
  const navigate = useNavigate();

  const isContactOpen = location.pathname === '/contact';

  return (
    <div className="min-h-screen bg-[#fafafa] text-black selection:bg-black selection:text-white antialiased">
      <Navbar />
      
      <main className="relative z-[2] pt-[9rem] px-4 md:px-8 pb-12">
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/research" element={<Index />} />
          <Route path="/about" element={<About />} />
          {/* Render Index as the backdrop background when contact modal is active */}
          <Route path="/contact" element={<Index />} />
        </Routes>
      </main>

      <Footer />

      {/* Floating Contact Modal Backdrop */}
      {isContactOpen && (
        <ContactModal onClose={() => navigate('/')} />
      )}
    </div>
  );
}

export default function App() {
  return (
    <CmsProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </CmsProvider>
  );
}
