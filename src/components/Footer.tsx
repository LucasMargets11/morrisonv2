import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin, Building2 } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useTranslation } from '../translations';

const Footer: React.FC = () => {
  const { language } = useLanguage();
  const t = useTranslation(language);

  return (
    <footer className="bg-gray-900 text-white pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Company Info */}
          <div>
            <div className="flex items-center mb-4">
              <img
                src="/logo_transparent.png"
                alt="GrupoBairen"
                className="w-16 h-16 transition-colors duration-300"
              />
              <span className="ml-2 text-xl font-bold">GrupoBairen</span>
            </div>
            <p className="text-gray-400 mb-4">
              {t('footer.company')}
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Facebook size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Twitter size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Instagram size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Linkedin size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-bold mb-4">{t('footer.links')}</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/buy" className="text-gray-400 hover:text-white transition-colors">
                  {t('properties.forSale')}
                </Link>
              </li>
              <li>
                <Link to="/rent" className="text-gray-400 hover:text-white transition-colors">
                  {t('properties.forRent')}
                </Link>
              </li>
              <li>
                <Link to="/agents" className="text-gray-400 hover:text-white transition-colors">
                  {t('agents.title')}
                </Link>
              </li>
              <li>
                <Link to="/mortgage" className="text-gray-400 hover:text-white transition-colors">
                  {t('footer.mortgage')}
                </Link>
              </li>
              <li>
                <Link to="/blog" className="text-gray-400 hover:text-white transition-colors">
                  {t('footer.blog')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-lg font-bold mb-4">{t('footer.support')}</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/faq" className="text-gray-400 hover:text-white transition-colors">
                  {t('footer.faq')}
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-gray-400 hover:text-white transition-colors">
                  {t('footer.privacy')}
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-gray-400 hover:text-white transition-colors">
                  {t('footer.terms')}
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-gray-400 hover:text-white transition-colors">
                  {t('footer.about')}
                </Link>
              </li>
              <li>
                <Link to="/careers" className="text-gray-400 hover:text-white transition-colors">
                  {t('footer.careers')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-bold mb-4">{t('footer.contact')}</h3>
            <div className="space-y-3">
              <div className="flex items-start">
                <MapPin size={18} className="text-gray-400 mr-2 mt-1" />
                <p className="text-gray-400">
                  La Rioja 1578 - Posadas, Misiones
                </p>
              </div>
              <div className="flex items-center">
                <Phone size={18} className="text-gray-400 mr-2" />
                <a href="tel:+1234567890" className="text-gray-400 hover:text-white transition-colors">
                  1130454989
                </a>
              </div>
              <div className="flex items-center">
                <Mail size={18} className="text-gray-400 mr-2" />
                <a href="mailto:info@grupobairen.com" className="text-gray-400 hover:text-white transition-colors">
                  info@grupobairen.com
                </a>
              </div>
            </div>
          </div>
        </div>

        <hr className="border-gray-700 mb-8" />

        <div className="text-center text-gray-500 text-sm">
          <p>© {new Date().getFullYear()} GrupoBairen. {t('footer.rights')}</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;