import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { LanguageProvider } from './contexts/LanguageContext';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import PropertiesPage from './pages/PropertiesPage';
import PropertyDetailsPage from './pages/PropertyDetailsPage'; // <-- Cambiado
import AgentsPage from './pages/AgentsPage';
import ContactPage from './pages/ContactPage';

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

function App() {
  return (
    <LanguageProvider>
      <QueryClientProvider client={queryClient}>
        <Router>
          <ScrollToTop />
          <div className="min-h-screen flex flex-col">
            <Routes>
              {/* Admin Login (sin header/footer) */}
              <Route path="/admin/login" element={<AdminLoginPage />} />
              
              {/* Rutas con Header/Footer */}
              <Route path="/*" element={
                <>
                  <Header />
                  <main className="flex-1">
                    <Routes>
                      {/* Rutas públicas */}
                      <Route path="/" element={<HomePage />} />
                      <Route path="/properties" element={<PropertiesPage />} />
                      <Route path="/property/:id" element={<PropertyDetailsPage />} /> {/* <-- Cambiado */}
                      <Route path="/agents" element={<AgentsPage />} />
                      <Route path="/contact" element={<ContactPage />} />
                      
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
              } />
            </Routes>
          </div>
        </Router>
      </QueryClientProvider>
    </LanguageProvider>
  );
}

export default App;
