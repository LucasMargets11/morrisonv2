import React from 'react';
import { useForm } from 'react-hook-form';
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
            {/* Contact Information */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white/10 backdrop-blur-sm p-4 rounded-lg text-center">
                <img 
                  src="https://raw.githubusercontent.com/lucide-icons/lucide/main/icons/mail.svg" 
                  alt="Email"
                  className="w-8 h-8 invert mx-auto mb-2"
                />
                <h3 className="text-lg font-semibold text-white mb-1">Email</h3>
                <a 
                  href="mailto:singular@inmobiliariamasingenieria.com.ar" 
                  className="text-white/80 hover:text-white text-sm break-all"
                >
                  singular@inmobiliariamasingenieria.com.ar
                </a>
              </div>

              <div className="bg-white/10 backdrop-blur-sm p-4 rounded-lg text-center">
                <img 
                  src="https://raw.githubusercontent.com/lucide-icons/lucide/main/icons/phone.svg" 
                  alt="Phone"
                  className="w-8 h-8 invert mx-auto mb-2"
                />
                <h3 className="text-lg font-semibold text-white mb-1">Teléfono</h3>
                <a 
                  href="tel:03764724379" 
                  className="text-white/80 hover:text-white"
                >
                  1130454989
                </a>
              </div>

              <div className="bg-white/10 backdrop-blur-sm p-4 rounded-lg text-center">
                <img 
                  src="https://raw.githubusercontent.com/lucide-icons/lucide/main/icons/map-pin.svg" 
                  alt="Address"
                  className="w-8 h-8 invert mx-auto mb-2"
                />
                <h3 className="text-lg font-semibold text-white mb-1">Dirección</h3>
                <p className="text-white/80">
                  La Rioja 1578 - Posadas, Misiones
                </p>
              </div>
            </div>

            {/* Contact Form */}
            <div className="bg-gray-900/80 backdrop-blur-sm p-6 rounded-lg max-w-md mx-auto w-full">
              <h2 className="text-2xl font-bold text-white mb-6">Contáctanos ahora</h2>
              
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-white mb-1">
                    NOMBRE COMPLETO
                  </label>
                  <input
                    type="text"
                    {...register('fullName', { required: 'Full name is required' })}
                    className="w-full px-3 py-1.5 bg-white/10 border border-white/20 rounded text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 text-sm"
                    placeholder="Juan Rodriguez.."
                  />
                  {errors.fullName && (
                    <p className="mt-1 text-xs text-red-400">{errors.fullName.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-white mb-1">
                    CORREO ELECTRÓNICO
                  </label>
                  <input
                    type="email"
                    {...register('email', { 
                      required: 'Email is required',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Invalid email address'
                      }
                    })}
                    className="w-full px-3 py-1.5 bg-white/10 border border-white/20 rounded text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 text-sm"
                    placeholder="juanrodriguez99@email.com..."
                  />
                  {errors.email && (
                    <p className="mt-1 text-xs text-red-400">{errors.email.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-white mb-1">
                    TELÉFONO
                  </label>
                  <input
                    type="tel"
                    {...register('phone', { 
                      required: 'Phone number is required',
                      pattern: {
                        value: /^[0-9-+() ]*$/,
                        message: 'Invalid phone number'
                      }
                    })}
                    className="w-full px-3 py-1.5 bg-white/10 border border-white/20 rounded text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 text-sm"
                    placeholder="981 123 456"
                  />
                  {errors.phone && (
                    <p className="mt-1 text-xs text-red-400">{errors.phone.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-white mb-1">
                    ¿INVERSIÓN O VIVIENDA?
                  </label>
                  <select
                    {...register('investmentType')}
                    className="w-full px-3 py-1.5 bg-gray-800 border border-white/20 rounded text-white focus:outline-none focus:ring-2 focus:ring-white/50 text-sm appearance-none"
                    style={{ colorScheme: 'dark' }}
                  >
                    <option value="vivienda" className="bg-gray-800 text-white">Quiero una vivienda</option>
                    <option value="inversion" className="bg-gray-800 text-white">Busco invertir</option>
                  </select>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  fullWidth
                  className="bg-green-500 hover:bg-green-600 text-white flex items-center justify-center mt-6"
                >
                  <img 
                    src="https://raw.githubusercontent.com/lucide-icons/lucide/main/icons/message-circle.svg"
                    alt="WhatsApp"
                    className="w-4 h-4 mr-2 invert"
                  />
                  CONTACTAR
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