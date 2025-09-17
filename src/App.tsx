import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider, useIsFetching } from '@tanstack/react-query';
import { LanguageProvider } from './contexts/LanguageContext';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import PropertiesPage from './pages/PropertiesPage';
import PropertyDetailsPage from './pages/PropertyDetailsPage'; // <-- Cambiado
import AgentsPage from './pages/AgentsPage';
import ContactPage from './pages/ContactPage';
import AboutPage from './pages/AboutPage';
import PrivacyPage from './pages/PrivacyPage';
import TermsPage from './pages/TermsPage';
import FAQPage from './pages/FaqPage';
import TestimonialsPage from './pages/TestimonialsPage';
import CareersPage from './pages/CareersPage';

// Admin Pages
import AdminLoginPage from './pages/admin/AdminLoginPage';
import ProtectedRoute from './components/admin/ProtectedRoute';
import PropertyListPage from './pages/admin/PropertyListPage';
import PropertyFormPage from './pages/admin/PropertyFormPage';

const queryClient = new QueryClient();

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function useGlobalLoading() {
  const isFetching = useIsFetching();
  const [show, setShow] = React.useState(false);
  const [fade, setFade] = React.useState(false);

  React.useEffect(() => {
    if (isFetching > 0) {
      setShow(true);
      setFade(false);
    } else if (show) {
      setFade(true);
      const timeout = setTimeout(() => setShow(false), 400);
      return () => clearTimeout(timeout);
    }
  }, [isFetching, show]);

  return { show, fade };
}

function GlobalLoader() {
  const { show, fade } = useGlobalLoading();
  const [firstLoad, setFirstLoad] = React.useState(true);
  const [dotCount, setDotCount] = React.useState(0);

  React.useEffect(() => {
    // Cuando el loader desaparece por primera vez, ya no es la carga inicial
    if (!show && firstLoad) {
      setFirstLoad(false);
    }
  }, [show, firstLoad]);

  React.useEffect(() => {
    if (!show) return;
    const interval = setInterval(() => {
      setDotCount((prev) => (prev + 1) % 4);
    }, 400);
    return () => clearInterval(interval);
  }, [show]);

  if (!show) return null;
  return (
    <div
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center transition-opacity duration-400 ${fade ? 'opacity-0' : 'opacity-100'}`}
      style={{ background: '#fff' }} // fondo blanco
    >
      <span className="text-blue-700 text-1xl md:text-2xl font-bold tracking-wide drop-shadow text-center select-none">
        {firstLoad ? 'Cargando la experiencia Bairen' : 'Cargando'}
        {'.'.repeat(dotCount)}
      </span>
    </div>
  );
}

function App() {
  return (
    <LanguageProvider>
      <QueryClientProvider client={queryClient}>
        <Router>
          <ScrollToTop />
          <div className="min-h-screen flex flex-col">
            <GlobalLoader />
            <Routes>
              {/* Admin Login (sin header/footer) */}
              <Route path="/admin/login" element={<AdminLoginPage />} />
              
              {/* Rutas con Header/Footer */}
              <Route path="/*" element={
                <HeaderFooterLayout />
              } />
            </Routes>
          </div>
        </Router>
      </QueryClientProvider>
    </LanguageProvider>
  );
}

function HeaderFooterLayout() {
  const { show: loading } = useGlobalLoading();
  return (
    <>
      {!loading && <Header />}
      <main className="flex-1">
        <Routes>
          {/* Rutas públicas */}
          <Route path="/" element={<HomePage />} />
          <Route path="/properties" element={<PropertiesPage />} />
          <Route path="/property/:id" element={<PropertyDetailsPage />} />
          <Route path="/agents" element={<AgentsPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/contacto" element={<ContactPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/faq" element={<FAQPage />} />
          <Route path="/testimonials" element={<TestimonialsPage />} />
          <Route path="/careers" element={<CareersPage />} />
          
          {/* Rutas protegidas de admin */}
          <Route path="/admin/*" element={
            <ProtectedRoute>
              <Routes>
                <Route path="properties" element={<PropertyListPage />} />
                <Route path="properties/new" element={<PropertyFormPage />} />
                <Route path="properties/:id/edit" element={<PropertyFormPage />} />
                {/* Agregar más rutas de admin aquí */}
              </Routes>
            </ProtectedRoute>
          } />
        </Routes>
      </main>
      <Footer />
    </>
  );
}

export default App;
