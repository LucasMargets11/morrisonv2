import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Menu, X, LogOut, LayoutDashboard } from 'lucide-react';
import Button from './UI/Button';
import LanguageSwitcher from './LanguageSwitcher';
import { useAuth } from '../hooks/useAuth';
import { useLanguage } from '../contexts/LanguageContext';
import { useTranslation } from '../translations';

const Header: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  
  const { user, loading, logout } = useAuth();
  const { language } = useLanguage();
  const t = useTranslation(language);
  const navigate = useNavigate();

  console.log('Header - User:', user);
  console.log('Header - Loading:', loading);
  console.log('Header - Is Staff:', user?.is_staff);
  console.log('Header - Role:', user?.role);

  // Detectar scroll para cambiar estilo
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 30);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);


  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navLinkClass = 'text-sm font-medium px-3 py-2 transition-all duration-200 transform';
  const activeNavClass = isScrolled 
    ? 'text-blue-900 scale-125 font-semibold' 
    : 'text-white scale-125 font-semibold';
  const inactiveNavClass = isScrolled
    ? 'text-gray-800 hover:text-blue-900 hover:scale-110'
    : 'text-white hover:text-blue-100 hover:scale-110';

  const logoUrl = `${import.meta.env.BASE_URL}logo_transparentweb.svg`;

  return (
  <div className="fixed top-0 left-0 right-0 z-[60]">
      <header
        className={`relative transition-all duration-300 ${
          isScrolled
            ? 'bg-white shadow-md py-3'
            : 'bg-gradient-to-b from-black/50 to-transparent backdrop-blur-sm py-5'
        }`}
      >
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center">
            {/* Logo a la izquierda */}
            <Link to="/" className="flex items-center">
              <img
                src={logoUrl}
                alt="GrupoBairen"
                className="w-10 h-10 -my-1 transition-filter duration-300"
                style={{ filter: isScrolled ? 'none' : 'invert(0)' }}
              />
              <span
                className={`ml-2 text-xl font-bold transition-colors duration-300 ${
                  isScrolled ? 'text-gray-900' : 'text-white'
                }`}
              >
                Grupo Bairen
              </span>
            </Link>

            {/* Navbar en el centro */}
            <nav className="hidden md:flex items-center space-x-1">
              <NavLink
                to="/"
                end
                className={({ isActive }) =>
                  `${navLinkClass} ${isActive ? activeNavClass : inactiveNavClass}`
                }
              >
                {t('nav.home')}
              </NavLink>
              <NavLink
                to="/properties"
                className={({ isActive }) =>
                  `${navLinkClass} ${isActive ? activeNavClass : inactiveNavClass}`
                }
              >
                {t('nav.properties')}
              </NavLink>
              <NavLink
                to="/about"
                className={({ isActive }) =>
                  `${navLinkClass} ${isActive ? activeNavClass : inactiveNavClass}`
                }
              >
                {t('nav.about')}
              </NavLink>
              <NavLink
                to="/contact"
                className={({ isActive }) =>
                  `${navLinkClass} ${isActive ? activeNavClass : inactiveNavClass}`
                }
              >
                {t('nav.contact')}
              </NavLink>
            </nav>

            {/* Right side actions */}
            <div className="hidden md:flex items-center gap-3 relative">
              {user && (user.is_staff || user.role === 'admin') && (
                <NavLink
                  to="/admin/properties"
                  className={({ isActive }) => `flex items-center gap-1 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200
                    ${isActive ? 'bg-blue-600 text-white shadow-sm' : isScrolled ? 'bg-blue-50 text-blue-700 hover:bg-blue-100' : 'bg-white/15 text-white hover:bg-white/25'}
                  `}
                >
                  <LayoutDashboard size={16} />
                  <span>Admin</span>
                </NavLink>
              )}
              <LanguageSwitcher />
            </div>

            {/* Botón menú hamburguesa solo en mobile */}
            <button
              className="md:hidden"
              onClick={() => setMobileMenuOpen(open => !open)}
            >
              {mobileMenuOpen ? (
                <X size={24} className={isScrolled ? 'text-gray-900' : 'text-white'} />
              ) : (
                <Menu size={24} className={isScrolled ? 'text-gray-900' : 'text-white'} />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-white shadow-lg border-t">
            <div className="container mx-auto px-4 py-3 flex flex-col">
              <NavLink
                to="/"
                end
                className={({ isActive }) =>
                  `py-4 border-b border-gray-100 transition-all duration-200 whitespace-nowrap overflow-hidden text-center ${
                    isActive ? 'text-blue-900 font-semibold bg-blue-50' : 'text-gray-800 hover:text-blue-900'
                  }`
                }
                onClick={() => setMobileMenuOpen(false)}
              >
                {t('nav.home')}
              </NavLink>
              <NavLink
                to="/properties"
                className={({ isActive }) =>
                  `py-4 border-b border-gray-100 transition-all duration-200 whitespace-nowrap overflow-hidden text-center ${
                    isActive ? 'text-blue-900 font-semibold bg-blue-50' : 'text-gray-800 hover:text-blue-900'
                  }`
                }
                onClick={() => setMobileMenuOpen(false)}
              >
                {t('nav.properties')}
              </NavLink>
              <NavLink
                to="/about"
                className={({ isActive }) =>
                  `py-4 border-b border-gray-100 transition-all duration-200 whitespace-nowrap overflow-hidden text-center ${
                    isActive ? 'text-blue-900 font-semibold bg-blue-50' : 'text-gray-800 hover:text-blue-900'
                  }`
                }
                onClick={() => setMobileMenuOpen(false)}
              >
                {t('nav.about')}
              </NavLink>
              <NavLink
                to="/contact"
                className={({ isActive }) =>
                  `py-4 border-b border-gray-100 transition-all duration-200 whitespace-nowrap overflow-hidden text-center ${
                    isActive ? 'text-blue-900 font-semibold bg-blue-50' : 'text-gray-800 hover:text-blue-900'
                  }`
                }
                onClick={() => setMobileMenuOpen(false)}
              >
                {t('nav.contact')}
              </NavLink>
              
              {/* Mobile Panel Admin */}
              {user && (user.is_staff || user.role === 'admin') && (
                <NavLink
                  to="/admin/properties"
                  className={({ isActive }) =>
                    `py-3 border-b border-gray-100 flex items-center transition-all duration-200 ${
                      isActive ? 'text-blue-900 font-semibold transform scale-110' : 'text-gray-800 hover:text-blue-900'
                    }`
                  }
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <LayoutDashboard size={16} className="mr-2" />
                  Admin
                </NavLink>
              )}
              
              <div className="py-3 border-b border-gray-100">
                <LanguageSwitcher />
              </div>
              
              {/* Mobile User Actions - Solo si está autenticado */}
              {user && (
                <div className="flex mt-4">
                  <Button variant="outline" size="sm" className="flex-1" onClick={handleLogout}>
                    <LogOut size={16} className="mr-1" />
                    {t('auth.signOut')}
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </header>
    </div>
  );
};

export default Header;
