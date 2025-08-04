import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin, Building2, Send, Award, Clock } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useTranslation } from '../translations';

const Footer: React.FC = () => {
  const { language } = useLanguage();
  const t = useTranslation(language);
  const [email, setEmail] = useState('');

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Aquí puedes agregar la lógica para suscribir al newsletter
    console.log('Newsletter subscription:', email);
    setEmail('');
    // Mostrar mensaje de éxito
  };

  return (
    <footer className="bg-gray-900 text-white pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
          {/* Company Info */}
          <div className="lg:col-span-2">
            <div className="flex items-center mb-4">
              <img
                src="/logo_transparent para web-01.svg"
                alt="GrupoBairen"
                className="w-12 h-12"
                style={{ filter: 'invert(1)' }}
              />
              <span className="ml-2 text-xl font-bold">Grupo Bairen</span>
            </div>
            <p className="text-gray-400 mb-6 leading-relaxed">
              Más de 15 años de experiencia en el mercado inmobiliario de Posadas y zona. 
              Tu socio de confianza para encontrar la propiedad perfecta.
            </p>
            
            {/* Newsletter */}
            <div className="mb-6">
              <h4 className="text-lg font-semibold mb-3">Recibe nuestras novedades</h4>
              <form onSubmit={handleNewsletterSubmit} className="flex">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Tu email"
                  className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                  required
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-r-lg transition-colors"
                >
                  <Send size={18} />
                </button>
              </form>
            </div>

            {/* Social Media */}
            <div className="flex space-x-4">
              <a href="https://facebook.com/grupobairen" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                <Facebook size={20} />
              </a>
              <a href="https://instagram.com/grupobairen" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                <Instagram size={20} />
              </a>
              <a href="https://linkedin.com/company/grupobairen" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                <Linkedin size={20} />
              </a>
            </div>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-lg font-bold mb-4 flex items-center">
              <Building2 size={20} className="mr-2" />
              Servicios
            </h3>
            <ul className="space-y-3">
              <li>
                <Link to="/properties?type=sale" className="text-gray-400 hover:text-white transition-colors">
                  Venta de Propiedades
                </Link>
              </li>
              <li>
                <Link to="/properties?type=rent" className="text-gray-400 hover:text-white transition-colors">
                  Alquiler Temporal
                </Link>
              </li>
              <li>
                <Link to="/services/administration" className="text-gray-400 hover:text-white transition-colors">
                  Administración
                </Link>
              </li>
              <li>
                <Link to="/services/investment" className="text-gray-400 hover:text-white transition-colors">
                  Asesoramiento
                </Link>
              </li>
              <li>
                <Link to="/services/valuation" className="text-gray-400 hover:text-white transition-colors">
                  Tasaciones
                </Link>
              </li>
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-bold mb-4">Enlaces Útiles</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/about" className="text-gray-400 hover:text-white transition-colors">
                  Sobre Nosotros
                </Link>
              </li>
              <li>
                <Link to="/blog" className="text-gray-400 hover:text-white transition-colors">
                  Blog Inmobiliario
                </Link>
              </li>
              <li>
                <Link to="/testimonials" className="text-gray-400 hover:text-white transition-colors">
                  Testimonios
                </Link>
              </li>
              <li>
                <Link to="/faq" className="text-gray-400 hover:text-white transition-colors">
                  Preguntas Frecuentes
                </Link>
              </li>
              <li>
                <Link to="/careers" className="text-gray-400 hover:text-white transition-colors">
                  Trabaja con Nosotros
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact & Legal */}
          <div>
            <h3 className="text-lg font-bold mb-4">Contacto</h3>
            <div className="space-y-3 mb-6">
              <div className="flex items-start">
                <MapPin size={18} className="text-gray-400 mr-2 mt-1 flex-shrink-0" />
                <p className="text-gray-400 text-sm">
                  La Rioja 1578<br />
                  Posadas, Misiones<br />
                  Argentina
                </p>
              </div>
              <div className="flex items-center">
                <Phone size={18} className="text-gray-400 mr-2 flex-shrink-0" />
                <a href="tel:+541130454989" className="text-gray-400 hover:text-white transition-colors text-sm">
                  +54 11 3045-4989
                </a>
              </div>
              <div className="flex items-center">
                <Mail size={18} className="text-gray-400 mr-2 flex-shrink-0" />
                <a href="mailto:info@grupobairen.com" className="text-gray-400 hover:text-white transition-colors text-sm">
                  info@grupobairen.com
                </a>
              </div>
              <div className="flex items-start">
                <Clock size={18} className="text-gray-400 mr-2 mt-1 flex-shrink-0" />
                <div className="text-gray-400 text-sm">
                  <p>Lun - Vie: 9:00 - 18:00</p>
                  <p>Sáb: 9:00 - 13:00</p>
                </div>
              </div>
            </div>

            {/* Legal Links */}
            <div className="border-t border-gray-700 pt-4">
              <h4 className="text-sm font-semibold mb-2">Legal</h4>
              <ul className="space-y-1 text-sm">
                <li>
                  <Link to="/privacy" className="text-gray-400 hover:text-white transition-colors">
                    Privacidad
                  </Link>
                </li>
                <li>
                  <Link to="/terms" className="text-gray-400 hover:text-white transition-colors">
                    Términos
                  </Link>
                </li>
                <li>
                  <Link to="/cookies" className="text-gray-400 hover:text-white transition-colors">
                    Cookies
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Certifications */}
        <div className="border-t border-gray-700 pt-8 mb-8">
          <div className="flex flex-wrap items-center justify-center gap-6 text-center">
            <div className="flex items-center text-gray-400">
              <Award size={20} className="mr-2" />
              <span className="text-sm">Matriculado CUCICBA</span>
            </div>
            <div className="flex items-center text-gray-400">
              <Award size={20} className="mr-2" />
              <span className="text-sm">Miembro CPI Misiones</span>
            </div>
            <div className="flex items-center text-gray-400">
              <Award size={20} className="mr-2" />
              <span className="text-sm">15+ Años Experiencia</span>
            </div>
          </div>
        </div>

        <hr className="border-gray-700 mb-8" />

        <div className="flex flex-col md:flex-row justify-between items-center text-gray-500 text-sm">
          <p>© {new Date().getFullYear()} Grupo Bairen. Todos los derechos reservados.</p>
          <p className="mt-2 md:mt-0">
            Desarrollado con ❤️ en Posadas, Misiones
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;