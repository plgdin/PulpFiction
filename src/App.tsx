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
  const isHome = location.pathname === '/' || location.pathname === '/research' || location.pathname === '/contact';

  return (
    <div className="min-h-screen bg-[#f5f5f4] text-black selection:bg-neutral-900 selection:text-neutral-100 antialiased">
      <Navbar />

      <main className={`relative z-[2] ${isHome ? '' : 'pt-24 px-4 md:px-8 pb-12'}`}>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/research" element={<Index />} />
          <Route path="/about" element={<About />} />
          {/* Index as backdrop behind contact modal */}
          <Route path="/contact" element={<Index />} />
        </Routes>
      </main>

      <Footer />

      {/* Contact Modal Overlay */}
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
