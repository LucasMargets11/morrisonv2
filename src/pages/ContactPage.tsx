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
    const message = `Hola! Soy : ${data.fullName}, mi email es : ${data.email}, mi teléfono es : ${data.phone} y estoy interesado en: ${data.investmentType}`;
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

        <div className="relative container mx-auto px-4 h-full flex items-center justify-center">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 w-full max-w-5xl">
            {/* Cards a la izquierda */}
            <div className="flex flex-col gap-6">
              {/* Email Card */}
              <div className="flex items-center gap-4 bg-white/10 border border-white/20 rounded-2xl p-4 md:p-6 hover:bg-white/20 transition-all duration-300 group w-full shadow-lg">
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 bg-blue-500/20 rounded-xl flex items-center justify-center group-hover:bg-blue-500/30 transition-colors duration-300">
                    <Mail className="w-8 h-8 text-blue-400" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-base md:text-lg font-bold text-white mb-1 group-hover:text-blue-200 transition-colors">Email</h3>
                  <p className="text-white/70 text-xs md:text-sm mb-2">Escríbenos y te responderemos</p>
                  <a 
                    href="mailto:info@grupobairen.com" 
                    className="text-white/90 hover:text-blue-400 text-xs md:text-sm font-medium break-all transition-colors duration-200 border-b border-blue-400/30 hover:border-blue-400/60 pb-1"
                  >
                    info@grupobairen.com
                  </a>
                </div>
              </div>

              {/* Phone Card */}
              <div className="flex items-center gap-4 bg-white/10 border border-white/20 rounded-2xl p-4 md:p-6 hover:bg-white/20 transition-all duration-300 group w-full shadow-lg">
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 bg-green-500/20 rounded-xl flex items-center justify-center group-hover:bg-green-500/30 transition-colors duration-300">
                    <Phone className="w-8 h-8 text-green-400" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-base md:text-lg font-bold text-white mb-1 group-hover:text-green-200 transition-colors">Teléfono</h3>
                  <p className="text-white/70 text-xs md:text-sm mb-2">Llámanos directamente</p>
                  <a 
                    href="tel:+541130454989" 
                    className="text-white/90 hover:text-green-400 font-semibold text-xs md:text-lg transition-colors duration-200 border-b border-green-400/30 hover:border-green-400/60 pb-1"
                  >
                    +54 11 3045-4989
                  </a>
                </div>
              </div>

              {/* Address Card */}
              <div className="flex items-center gap-4 bg-white/10 border border-white/20 rounded-2xl p-4 md:p-6 hover:bg-white/20 transition-all duration-300 group w-full shadow-lg">
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 bg-purple-500/20 rounded-xl flex items-center justify-center group-hover:bg-purple-500/30 transition-colors duration-300">
                    <MapPin className="w-8 h-8 text-purple-400" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-base md:text-lg font-bold text-white mb-1 group-hover:text-purple-200 transition-colors">Dirección</h3>
                  <p className="text-white/70 text-xs md:text-sm mb-2">Visítanos en persona</p>
                  <p className="text-white/90 font-medium text-xs md:text-sm leading-relaxed">
                    La Rioja 1578<br />
                    Posadas, Misiones<br />
                    <span className="text-white/70">Argentina</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Formulario a la derecha */}
            <div className="flex items-center justify-center">
              <div className="bg-gray-900/90 backdrop-blur-sm border border-white/10 p-4 sm:p-6 rounded-2xl w-full max-w-xs sm:max-w-sm mx-auto shadow-2xl">
                <div className="text-center mb-6">
                  <h2 className="text-xl font-bold text-white mb-1">Contáctanos ahora</h2>
                  <p className="text-gray-400 text-sm">Completa el formulario y te responderemos pronto</p>
                </div>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-white mb-1">
                      NOMBRE COMPLETO
                    </label>
                    <input
                      type="text"
                      {...register('fullName', { required: 'El nombre es requerido' })}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
                      placeholder="Juan Rodríguez"
                    />
                    {errors.fullName && (
                      <p className="mt-1 text-xs text-red-400">{errors.fullName.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-white mb-1">
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
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
                      placeholder="juan.rodriguez@email.com"
                    />
                    {errors.email && (
                      <p className="mt-1 text-xs text-red-400">{errors.email.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-white mb-1">
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
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
                      placeholder="11 3045-4989"
                    />
                    {errors.phone && (
                      <p className="mt-1 text-xs text-red-400">{errors.phone.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-white mb-1">
                      ¿QUÉ ESTÁS BUSCANDO?
                    </label>
                    <select
                      {...register('investmentType')}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all appearance-none cursor-pointer text-sm"
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
                    className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white py-3 rounded-xl font-bold text-base shadow-lg transform transition-all hover:scale-105 flex items-center justify-center gap-2"
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
    </div>
  );

};

export default ContactPage;
