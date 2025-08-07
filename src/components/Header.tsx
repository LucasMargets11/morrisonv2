import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Menu, X, ChevronDown, User, LogOut, LayoutDashboard } from 'lucide-react';
import Button from './UI/Button';
import LanguageSwitcher from './LanguageSwitcher';
import { useAuth } from '../hooks/useAuth';
import { useLanguage } from '../contexts/LanguageContext';
import { useTranslation } from '../translations';

const Header: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
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

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const dropdown = document.getElementById('user-dropdown');
      const button = document.getElementById('user-dropdown-button');
      if (
        dropdown &&
        button &&
        !dropdown.contains(event.target as Node) &&
        !button.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    navigate('/');
  };

  const toggleDropdown = () => setDropdownOpen(open => !open);

  const navLinkClass = 'text-sm font-medium px-3 py-2 transition-all duration-200 transform';
  const activeNavClass = isScrolled 
    ? 'text-blue-900 scale-125 font-semibold' 
    : 'text-white scale-125 font-semibold';
  const inactiveNavClass = isScrolled
    ? 'text-gray-800 hover:text-blue-900 hover:scale-110'
    : 'text-white hover:text-blue-100 hover:scale-110';

  return (
    <div className="fixed top-0 left-0 right-0 z-[var(--z-header)]">
      <header
        className={`relative transition-all duration-300 ${
          isScrolled
            ? 'bg-white shadow-md py-3'
            : 'bg-gradient-to-b from-black/50 to-transparent backdrop-blur-sm py-5'
        }`}
      >
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <Link to="/" className="flex items-center">
              <img
                src="/logo_transparent para web-01.svg"
                alt="GrupoBairen"
                className="w-8 h-8 transition-filter duration-300"
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

            {/* Mobile Menu Button */}
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

            {/* Desktop Navigation */}
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
              
              <div className="ml-2">
                <LanguageSwitcher />
              </div>
            </nav>

            {/* Right Section: Solo Panel Admin + User (si está autenticado) */}
            <div className="hidden md:flex items-center space-x-4">
              {loading ? (
                <div className="w-8 h-8 animate-pulse bg-gray-300 rounded-full"></div>
              ) : user ? (
                <div className="flex items-center space-x-4">
                  {/* Panel Admin - Solo si es admin */}
                  {(user.is_staff || user.role === 'admin') && (
                    <NavLink
                      to="/admin/properties"
                      className={({ isActive }) =>
                        `${navLinkClass} ${
                          isActive ? activeNavClass : inactiveNavClass
                        } flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                          isScrolled 
                            ? 'hover:bg-gray-100' 
                            : 'hover:bg-white/10'
                        }`
                      }
                    >
                      <LayoutDashboard size={16} />
                      <span className="font-medium">Admin</span>
                    </NavLink>
                  )}
                  
                  {/* User Dropdown */}
                  <div className="relative">
                    <button
                      id="user-dropdown-button"
                      onClick={toggleDropdown}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                        isScrolled
                          ? 'text-gray-800 hover:bg-gray-100'
                          : 'text-white hover:bg-white/10'
                      }`}
                    >
                      <User size={18} />
                      <span className="max-w-[150px] truncate text-sm font-medium">
                        {user.first_name || user.email}
                      </span>
                      <ChevronDown
                        size={16}
                        className={`transition-transform duration-200 ${
                          dropdownOpen ? 'rotate-180' : ''
                        }`}
                      />
                    </button>

                    {dropdownOpen && (
                      <div
                        id="user-dropdown"
                        className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg py-2 z-[var(--z-dropdown)]"
                      >
                        <div className="px-4 py-2 border-b border-gray-100">
                          <p className="text-sm text-gray-600">Signed in as</p>
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {user.first_name || user.email}
                          </p>
                        </div>
                        <button
                          onClick={handleLogout}
                          className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center"
                        >
                          <LogOut size={16} className="mr-2" />
                          {t('auth.signOut')}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ) : null}
              {/* Sin usuario autenticado: no mostrar nada */}
            </div>
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
                  `py-3 border-b border-gray-100 transition-all duration-200 ${
                    isActive ? 'text-blue-900 font-semibold transform scale-110' : 'text-gray-800 hover:text-blue-900'
                  }`
                }
                onClick={() => setMobileMenuOpen(false)}
              >
                {t('nav.home')}
              </NavLink>
              <NavLink
                to="/properties"
                className={({ isActive }) =>
                  `py-3 border-b border-gray-100 transition-all duration-200 ${
                    isActive ? 'text-blue-900 font-semibold transform scale-110' : 'text-gray-800 hover:text-blue-900'
                  }`
                }
                onClick={() => setMobileMenuOpen(false)}
              >
                {t('nav.properties')}
              </NavLink>
              <NavLink
                to="/about"
                className={({ isActive }) =>
                  `py-3 border-b border-gray-100 transition-all duration-200 ${
                    isActive ? 'text-blue-900 font-semibold transform scale-110' : 'text-gray-800 hover:text-blue-900'
                  }`
                }
                onClick={() => setMobileMenuOpen(false)}
              >
                {t('nav.about')}
              </NavLink>
              <NavLink
                to="/contact"
                className={({ isActive }) =>
                  `py-3 border-b border-gray-100 transition-all duration-200 ${
                    isActive ? 'text-blue-900 font-semibold transform scale-110' : 'text-gray-800 hover:text-blue-900'
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
