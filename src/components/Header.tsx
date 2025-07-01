import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { User, Menu, X, LogOut, LayoutDashboard, ChevronDown } from 'lucide-react';
import Button from './UI/Button';
import LoginModal from './Auth/LoginModal';
import LanguageSwitcher from './LanguageSwitcher';
import { authApi, logout } from '../lib/api';
import { useLanguage } from '../contexts/LanguageContext';
import { useTranslation } from '../translations';

const Header: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  type UserType = { email: string } | null;
  const [user, setUser] = useState<UserType>(null);
  const [loading, setLoading] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { language } = useLanguage();
  const t = useTranslation(language);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await authApi.getMe();
        setUser(response.data);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 30);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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

  const handleLogin = async (email: string, password: string) => {
    try {
      const response = await authApi.login(email, password);
      setUser(response.user);
      setLoginModalOpen(false);
    } catch (error) {
      throw error;
    }
  };

  const handleLogout = () => {
    logout();
    setUser(null);
    setDropdownOpen(false);
    navigate('/');
  };

  const toggleDropdown = () => setDropdownOpen(open => !open);

  const navLinkClass = 'text-sm font-medium px-3 py-2 transition-colors duration-200';
  const activeNavClass = 'text-blue-900';
  const inactiveNavClass = isScrolled
    ? 'text-gray-800 hover:text-blue-900'
    : 'text-white hover:text-blue-100';

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
          <div className="flex justify-between items-center relative">
            {/* Logo */}
            <Link to="/" className="flex items-center">
              <img
                src="/logo_transparent para web-01.svg"
                alt="GrupoBairen"
                className="w-8 h-8 transition-filter duration-300"
                style={{ filter: isScrolled ? 'none' : '' }}
              />
              <span
                className={`ml-2 text-xl font-bold transition-colors duration-300 ${
                  isScrolled ? 'text-gray-900' : 'text-white'
                }`}
              >
                
              </span>
            </Link>

            {/* Nav centrado */}
            <nav className="hidden md:flex items-center space-x-1 absolute left-1/2 -translate-x-1/2">
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
                to="/agents"
                className={({ isActive }) =>
                  `${navLinkClass} ${isActive ? activeNavClass : inactiveNavClass}`
                }
              >
                {t('nav.agents')}
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
              {user && (
                <NavLink
                  to="/admin/properties"
                  className={({ isActive }) =>
                    `${navLinkClass} ${
                      isActive ? activeNavClass : inactiveNavClass
                    } flex items-center`
                  }
                >
                  <LayoutDashboard size={16} className="mr-1" />
                  {t('nav.admin')}
                </NavLink>
              )}
            </nav>

            {/* Idioma y usuario */}
            <div className="hidden md:flex items-center space-x-4">
              <LanguageSwitcher />
              {user ? (
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
                    <span className="max-w-[150px] truncate">{user.email}</span>
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
                          {user.email}
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
              ) : (
                <Button
                  variant="text"
                  className={`${
                    isScrolled
                      ? 'text-gray-800 hover:bg-gray-100'
                      : 'text-white hover:bg-white/10'
                  } px-4 py-2 rounded-lg transition-colors duration-200 flex items-center gap-2`}
                  onClick={() => setLoginModalOpen(true)}
                >
                  <User size={18} />
                  {t('auth.signIn')}
                </Button>
              )}
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
                  `py-3 border-b border-gray-100 ${
                    isActive ? 'text-blue-900 font-medium' : 'text-gray-800'
                  }`
                }
                onClick={() => setMobileMenuOpen(false)}
              >
                {t('nav.home')}
              </NavLink>
              <NavLink
                to="/properties"
                className={({ isActive }) =>
                  `py-3 border-b border-gray-100 ${
                    isActive ? 'text-blue-900 font-medium' : 'text-gray-800'
                  }`
                }
                onClick={() => setMobileMenuOpen(false)}
              >
                {t('nav.properties')}
              </NavLink>
              <NavLink
                to="/agents"
                className={({ isActive }) =>
                  `py-3 border-b border-gray-100 ${
                    isActive ? 'text-blue-900 font-medium' : 'text-gray-800'
                  }`
                }
                onClick={() => setMobileMenuOpen(false)}
              >
                {t('nav.agents')}
              </NavLink>
              <NavLink
                to="/about"
                className={({ isActive }) =>
                  `py-3 border-b border-gray-100 ${
                    isActive ? 'text-blue-900 font-medium' : 'text-gray-800'
                  }`
                }
                onClick={() => setMobileMenuOpen(false)}
              >
                {t('nav.about')}
              </NavLink>
              <NavLink
                to="/contact"
                className={({ isActive }) =>
                  `py-3 border-b border-gray-100 ${
                    isActive ? 'text-blue-900 font-medium' : 'text-gray-800'
                  }`
                }
                onClick={() => setMobileMenuOpen(false)}
              >
                {t('nav.contact')}
              </NavLink>
              {user && (
                <NavLink
                  to="/admin/properties"
                  className={({ isActive }) =>
                    `py-3 border-b border-gray-100 flex items-center ${
                      isActive ? 'text-blue-900 font-medium' : 'text-gray-800'
                    }`
                  }
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <LayoutDashboard size={16} className="mr-2" />
                  {t('nav.admin')}
                </NavLink>
              )}
              <div className="py-3 border-b border-gray-100">
                <LanguageSwitcher />
              </div>
              <div className="flex mt-4">
                {user ? (
                  <Button variant="outline" size="sm" className="flex-1" onClick={handleLogout}>
                    <LogOut size={16} className="mr-1" />
                    {t('auth.signOut')}
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      setLoginModalOpen(true);
                    }}
                  >
                    <User size={16} className="mr-1" />
                    {t('auth.signIn')}
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </header>

      <LoginModal
        isOpen={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
        onLogin={handleLogin}
      />
    </div>
  );
};

export default Header;