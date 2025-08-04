import React from 'react';
import { useForm } from 'react-hook-form';
import { Mail, Phone, MapPin, MessageCircle } from 'lucide-react';
import Button from '../components/UI/Button';

interface ContactFormData {
  fullName: string;
  email: string;
  phone: string;
  investmentType: string;
}

const ContactPage: React.FC = () => {
  const { register, handleSubmit, formState: { errors } } = useForm<ContactFormData>();

  const onSubmit = (data: ContactFormData) => {
    const message = `Name: ${data.fullName}, Email: ${data.email}, Phone: ${data.phone}, Investment Type: ${data.investmentType}`;
    const whatsappUrl = `https://wa.me/1130454989?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="relative h-screen">
        <div className="absolute inset-0">
          <img 
            src="https://images.pexels.com/photos/323705/pexels-photo-323705.jpeg"
            alt="Contact us"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/60" />
        </div>

        <div className="relative container mx-auto px-4 h-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full items-center">
            {/* Contact Information - Rediseñadas */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Email Card */}
              <div className="group relative overflow-hidden bg-white/15 backdrop-blur-md border border-white/20 rounded-2xl p-6 text-center hover:bg-white/20 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-2xl">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative">
                  <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:bg-white/30 transition-colors duration-300">
                    <Mail className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2 group-hover:text-blue-100 transition-colors">
                    Email
                  </h3>
                  <p className="text-white/70 text-sm mb-3">
                    Escríbenos y te responderemos
                  </p>
                  <a 
                    href="mailto:info@grupobairen.com" 
                    className="text-white/90 hover:text-white text-sm font-medium break-all transition-colors duration-200 border-b border-white/30 hover:border-white/60 pb-1"
                  >
                    info@grupobairen.com
                  </a>
                </div>
              </div>

              {/* Phone Card */}
              <div className="group relative overflow-hidden bg-white/15 backdrop-blur-md border border-white/20 rounded-2xl p-6 text-center hover:bg-white/20 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-2xl">
                <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative">
                  <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:bg-white/30 transition-colors duration-300">
                    <Phone className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2 group-hover:text-green-100 transition-colors">
                    Teléfono
                  </h3>
                  <p className="text-white/70 text-sm mb-3">
                    Llámanos directamente
                  </p>
                  <a 
                    href="tel:+541130454989" 
                    className="text-white/90 hover:text-white font-semibold text-lg transition-colors duration-200 border-b border-white/30 hover:border-white/60 pb-1"
                  >
                    +54 11 3045-4989
                  </a>
                </div>
              </div>

              {/* Address Card */}
              <div className="group relative overflow-hidden bg-white/15 backdrop-blur-md border border-white/20 rounded-2xl p-6 text-center hover:bg-white/20 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-2xl">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative">
                  <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:bg-white/30 transition-colors duration-300">
                    <MapPin className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2 group-hover:text-purple-100 transition-colors">
                    Dirección
                  </h3>
                  <p className="text-white/70 text-sm mb-3">
                    Visítanos en persona
                  </p>
                  <p className="text-white/90 font-medium text-sm leading-relaxed">
                    La Rioja 1578<br />
                    Posadas, Misiones<br />
                    <span className="text-white/70">Argentina</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="bg-gray-900/90 backdrop-blur-sm border border-white/10 p-8 rounded-2xl max-w-md mx-auto w-full shadow-2xl">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-white mb-2">Contáctanos ahora</h2>
                <p className="text-gray-400">Completa el formulario y te responderemos pronto</p>
              </div>
              
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-white mb-2">
                    NOMBRE COMPLETO
                  </label>
                  <input
                    type="text"
                    {...register('fullName', { required: 'El nombre es requerido' })}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Juan Rodríguez"
                  />
                  {errors.fullName && (
                    <p className="mt-2 text-sm text-red-400">{errors.fullName.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-white mb-2">
                    CORREO ELECTRÓNICO
                  </label>
                  <input
                    type="email"
                    {...register('email', { 
                      required: 'El email es requerido',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Email inválido'
                      }
                    })}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="juan.rodriguez@email.com"
                  />
                  {errors.email && (
                    <p className="mt-2 text-sm text-red-400">{errors.email.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-white mb-2">
                    TELÉFONO
                  </label>
                  <input
                    type="tel"
                    {...register('phone', { 
                      required: 'El teléfono es requerido',
                      pattern: {
                        value: /^[0-9-+() ]*$/,
                        message: 'Número de teléfono inválido'
                      }
                    })}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="11 3045-4989"
                  />
                  {errors.phone && (
                    <p className="mt-2 text-sm text-red-400">{errors.phone.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-white mb-2">
                    ¿QUÉ ESTÁS BUSCANDO?
                  </label>
                  <select
                    {...register('investmentType')}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all appearance-none cursor-pointer"
                    style={{ colorScheme: 'dark' }}
                  >
                    <option value="vivienda" className="bg-gray-800 text-white">🏠 Busco una vivienda</option>
                    <option value="inversion" className="bg-gray-800 text-white">💼 Quiero invertir</option>
                    <option value="alquiler" className="bg-gray-800 text-white">🏖️ Alquiler temporal</option>
                    <option value="venta" className="bg-gray-800 text-white">📋 Vender mi propiedad</option>
                    <option value="consulta" className="bg-gray-800 text-white">💬 Consulta general</option>
                  </select>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white py-4 rounded-xl font-bold text-lg shadow-lg transform transition-all hover:scale-105 flex items-center justify-center gap-3"
                >
                  <MessageCircle className="w-5 h-5" />
                  ENVIAR POR WHATSAPP
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
