import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { LanguageProvider } from './contexts/LanguageContext';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import PropertiesPage from './pages/PropertiesPage';
import PropertyDetailsPage from './pages/PropertyDetailsPage';
import PropertyListPage from './pages/admin/PropertyListPage';
import PropertyFormPage from './pages/admin/PropertyFormPage';
import GeneralCalendarPage from './pages/admin/GeneralCalendarPage';
import ContactPage from './pages/ContactPage';
import AgentsPage from './pages/AgentsPage';
import AboutPage from './pages/AboutPage';

const queryClient = new QueryClient();

function App() {
  return (
    <LanguageProvider>
      <QueryClientProvider client={queryClient}>
        <Router>
          <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-grow">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/properties" element={<PropertiesPage />} />
                <Route path="/property/:id" element={<PropertyDetailsPage />} />
                <Route path="/admin/properties" element={<PropertyListPage />} />
                <Route path="/admin/properties/new" element={<PropertyFormPage />} />
                <Route path="/admin/properties/:id/edit" element={<PropertyFormPage />} />
                <Route path="/admin/calendar" element={<GeneralCalendarPage />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/agents" element={<AgentsPage />} />
                <Route path="/about" element={<AboutPage />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </Router>
      </QueryClientProvider>
    </LanguageProvider>
  );
}

export default App;
