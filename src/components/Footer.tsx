import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Linkedin, Mail, Phone, MapPin, Building2, Send, Clock } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useTranslation } from '../translations';

const Footer: React.FC = () => {
  const { language } = useLanguage();
  useTranslation(language);
  const [email, setEmail] = useState('');
  const logoUrl = `${import.meta.env.BASE_URL}logo_transparentweb.svg`;

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Newsletter subscription:', email);
    setEmail('');
  };

  return (
    <footer className="bg-gray-900 text-white pt-16 pb-8">
      <div className="container mx-auto px-4">
        {/* Grid principal */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 md:gap-8 mb-12">
          {/* Identidad + Newsletter + RRSS (ocupa 2 col en desktop) */}
            <div className="lg:col-span-2 min-w-[180px] pb-8 md:border-b-0 md:pb-0 md:border-r md:border-gray-800 md:pr-8">
            {/* Mobile: solo logo, nombre y redes */}
            <div className="block md:hidden text-center mb-6">
              <div className="flex flex-col items-center justify-center">
                <img
                  src={logoUrl}
                  alt="Grupo Bairen"
                  className="w-14 h-14 mb-2"
                />
                <span className="text-2xl font-extrabold tracking-wide font-title uppercase" style={{ letterSpacing: '0.05em' }}>GRUPOBAIREN</span>
              </div>
              <div className="flex justify-center space-x-6 mt-4">
                <a href="https://facebook.com/grupobairen" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-[#D4AF37] focus:text-[#D4AF37] transition-colors" aria-label="Facebook">
                  <Facebook size={22} />
                </a>
                <a href="https://instagram.com/grupobairen" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-[#D4AF37] focus:text-[#D4AF37] transition-colors" aria-label="Instagram">
                  <Instagram size={22} />
                </a>
                <a href="https://linkedin.com/company/grupobairen" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-[#D4AF37] focus:text-[#D4AF37] transition-colors" aria-label="LinkedIn">
                  <Linkedin size={22} />
                </a>
              </div>
              <div className="md:hidden mx-auto mt-6 h-px w-full border-b border-[#D4AF37] mb-8" />
            </div>
            {/* Desktop/Tablet: logo, nombre, descripción, newsletter, redes */}
            <div className="hidden md:block">
              <div className="flex items-center mb-4">
                <img
                  src={logoUrl}
                  alt="Grupo Bairen"
                  className="w-12 h-12"
                />
                <span className="ml-2 text-xl md:text-2xl font-bold">Grupo Bairen</span>
              </div>
              <p className="text-white/80 mb-6 leading-relaxed text-sm md:text-base">
                Calidad y experiencia aseguradas. Especialistas en alquiler temporal, vacacional y tradicional, administración, asesoramiento y tasaciones. Hospitalidad para el huésped; excelencia para el propietario.
              </p>

              {/* Newsletter */}
              <div className="mb-6">
                <h4 className="text-base md:text-lg font-semibold mb-3">Recibe nuestras novedades</h4>
                <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Tu email"
                    className="w-full sm:flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg sm:rounded-r-none focus:outline-none focus:ring-2 focus:ring-blue-500 text-white mb-3 sm:mb-0"
                    required
                  />
                  <button
                    type="submit"
                    className="group relative w-full sm:w-auto px-5 py-2.5 rounded-lg sm:rounded-l-none font-medium inline-flex items-center justify-center text-gray-900
                      bg-gradient-to-br from-[#F9E27A] via-[#E8C74E] to-[#D4AF37]
                      shadow-[0_2px_8px_-1px_rgba(212,175,55,0.4)]
                      transition-all duration-300
                      hover:brightness-105 hover:shadow-[0_4px_16px_-2px_rgba(212,175,55,0.55)]
                      focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#D4AF37] focus:ring-offset-gray-900
                      active:scale-[0.97]"
                    aria-label="Suscribirse al newsletter"
                  >
                    <span className="absolute inset-0 rounded-lg bg-gradient-to-br from-white/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                    <Send size={18} className="mr-2 hidden sm:inline text-gray-900" />
                    <span className="tracking-wide">Suscribirme</span>
                  </button>
                </form>
              </div>

              {/* Social */}
              <div className="flex space-x-4">
                <a href="https://facebook.com/grupobairen" target="_blank" rel="noopener noreferrer" className="text-white/80 hover:text-[#D4AF37] focus:text-[#D4AF37] transition-colors" aria-label="Facebook">
                  <Facebook size={20} />
                </a>
                <a href="https://instagram.com/grupobairen" target="_blank" rel="noopener noreferrer" className="text-white/80 hover:text-[#D4AF37] focus:text-[#D4AF37] transition-colors" aria-label="Instagram">
                  <Instagram size={20} />
                </a>
                <a href="https://linkedin.com/company/grupobairen" target="_blank" rel="noopener noreferrer" className="text-white/80 hover:text-[#D4AF37] focus:text-[#D4AF37] transition-colors" aria-label="LinkedIn">
                  <Linkedin size={20} />
                </a>
              </div>
            </div>
          </div>

          {/* Wrapper para agrupar Servicios + Enlaces útiles en tablet; en desktop se “desenvuelve” */}
          <div className="md:grid md:grid-cols-2 md:gap-8 lg:contents">
            {/* Servicios */}
            <div className="pb-8 border-b border-gray-800 md:border-b-0 md:pb-0 md:border-r md:pr-8">
              <h3 className="text-lg font-bold mb-4 flex items-center">
                <Building2 size={20} className="mr-2" />
                Servicios
              </h3>
              <ul className="space-y-3">
                <li>
                  <Link to="/properties?propertyType=temporal" className="text-gray-400 hover:text-white transition-colors font-semibold">
                    Alquiler Temporal
                  </Link>
                </li>
                <li>
                  <Link to="/properties?propertyType=vacacional" className="text-gray-400 hover:text-white transition-colors font-semibold">
                    Alquiler Vacacional
                  </Link>
                </li>
                <li>
                  <Link to="/properties?propertyType=tradicional" className="text-gray-400 hover:text-white transition-colors font-semibold">
                    Alquiler Tradicional
                  </Link>
                </li>
                <li>
                  <Link to="/contacto" className="text-gray-400 hover:text-white transition-colors">
                    Administración
                  </Link>
                </li>
                <li>
                  <Link to="/contacto" className="text-gray-400 hover:text-white transition-colors">
                    Asesoramiento
                  </Link>
                </li>
                <li>
                  <Link to="/contacto" className="text-gray-400 hover:text-white transition-colors">
                    Tasaciones
                  </Link>
                </li>
              </ul>
            </div>

            {/* Enlaces útiles */}
            <div className="pb-8 border-b border-gray-800 md:border-b-0 md:pb-0 lg:border-r lg:pr-8">
              <h3 className="text-lg font-bold mb-4">Enlaces Útiles</h3>
              <ul className="space-y-3">
                <li>
                  <Link to="/about" className="text-gray-400 hover:text-white transition-colors">
                    Sobre Nosotros
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
              </ul>
            </div>
          </div>

          {/* Contacto + Legal (en tablet ocupa todo el ancho para legibilidad) */}
          <div className="md:col-span-2 lg:col-span-1 pt-8 md:pt-0">
            <h3 className="text-lg font-bold mb-4">Contacto</h3>
            <div className="space-y-3 mb-6">
              <div className="flex items-start">
                <MapPin size={18} className="text-gray-400 mr-2 mt-1 flex-shrink-0" />
                <p className="text-gray-400 text-sm">
                  Las Heras 3331<br />
                  Palermo, CABA, Argentina
                </p>
              </div>
              <div className="flex items-center">
                <Phone size={18} className="text-gray-400 mr-2 flex-shrink-0" />
                <a href="tel:+5491123106629" className="text-gray-400 hover:text-white transition-colors text-sm">
                  +54 9 11 2310-6629
                </a>
              </div>
              <div className="flex items-center">
                <Mail size={18} className="text-gray-400 mr-2 flex-shrink-0" />
                <a href="mailto:Grupobairen@gmail.com" className="text-gray-400 hover:text-white transition-colors text-sm break-all">
                  Grupobairen@gmail.com
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

            {/* Legal */}
            <div className="border-t border-gray-800 pt-4">
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
              </ul>
            </div>
          </div>
        </div>

        <hr className="border-b border-[#D4AF37] mb-8" />

        {/* Barra inferior */}
        <div className="flex flex-col md:flex-row justify-between items-center text-gray-500 text-sm gap-2">
          <p className="text-center md:text-left">
            © {new Date().getFullYear()} Grupo Bairen. 
          </p>

          <p className="text-center md:text-right">
            Desarrollado por{" "}
            <a
              href="https://instagram.com/estudio.vizion"
              target="_blank"
              rel="noopener noreferrer nofollow"
              aria-label="Ir al Instagram de Estudio Vizion"
              className="font-semibold bg-gradient-to-r from-indigo-400 via-sky-400 to-cyan-400 bg-clip-text text-transparent hover:underline underline-offset-4 transition"
            >
              Estudio Vizion
            </a>
          </p>
        </div>

      </div>
    </footer>
  );
};

export default Footer;