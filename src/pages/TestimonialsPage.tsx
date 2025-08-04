import React, { useState } from 'react';
import { Star, Quote, ChevronLeft, ChevronRight, Users, Award } from 'lucide-react';

const TestimonialsPage: React.FC = () => {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  const testimonials = [
    {
      id: 1,
      name: 'María González',
      location: 'Posadas, Misiones',
      service: 'Alquiler Temporal',
      rating: 5,
      text: 'Excelente atención desde el primer contacto. Alquilé un departamento por 3 meses y todo fue perfecto. La propiedad estaba impecable y el equipo de Grupo Bairen estuvo siempre disponible para cualquier consulta.',
      avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg',
      date: 'Febrero 2024'
    },
    {
      id: 2,
      name: 'Carlos Ruiz',
      location: 'Buenos Aires',
      service: 'Compra de Propiedad',
      rating: 5,
      text: 'Compré mi casa de fin de semana en Posadas a través de Grupo Bairen. El proceso fue transparente y profesional. Me asesoraron en cada paso y logramos cerrar la operación en tiempo récord.',
      avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg',
      date: 'Enero 2024'
    },
    {
      id: 3,
      name: 'Ana Martínez',
      location: 'Oberá, Misiones',
      service: 'Venta de Propiedad',
      rating: 5,
      text: 'Vendí mi departamento con Grupo Bairen y superó todas mis expectativas. El precio obtenido fue mejor que otras propuestas y el tiempo de venta fue muy rápido. Altamente recomendables.',
      avatar: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg',
      date: 'Diciembre 2023'
    },
    {
      id: 4,
      name: 'Roberto Silva',
      location: 'Puerto Iguazú, Misiones',
      service: 'Administración',
      rating: 5,
      text: 'Confío la administración de mis propiedades de alquiler a Grupo Bairen desde hace 2 años. Son serios, puntuales con los pagos y mantienen las propiedades en perfecto estado.',
      avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg',
      date: 'Noviembre 2023'
    },
    {
      id: 5,
      name: 'Laura Fernández',
      location: 'Eldorado, Misiones',
      service: 'Alquiler Temporal',
      rating: 5,
      text: 'Mi familia y yo pasamos las vacaciones en una casa hermosa que encontramos a través de Grupo Bairen. La atención fue excepcional y la propiedad superó nuestras expectativas.',
      avatar: 'https://images.pexels.com/photos/1181424/pexels-photo-1181424.jpeg',
      date: 'Octubre 2023'
    },
    {
      id: 6,
      name: 'Diego Morales',
      location: 'Garupá, Misiones',
      service: 'Asesoramiento',
      rating: 5,
      text: 'Como inversor inmobiliario, el asesoramiento de Grupo Bairen ha sido fundamental. Me ayudaron a identificar las mejores oportunidades y maximizar el retorno de mis inversiones.',
      avatar: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg',
      date: 'Septiembre 2023'
    }
  ];

  const stats = [
    { number: '500+', label: 'Clientes Satisfechos' },
    { number: '4.9/5', label: 'Calificación Promedio' },
    { number: '98%', label: 'Recomendación' },
    { number: '15+', label: 'Años de Experiencia' }
  ];

  const nextTestimonial = () => {
    setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-5 h-5 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative h-96 bg-gradient-to-r from-blue-900 to-blue-700">
        <div className="absolute inset-0">
          <img
            src="https://images.pexels.com/photos/3184338/pexels-photo-3184338.jpeg"
            alt="Clientes satisfechos"
            className="w-full h-full object-cover opacity-30"
          />
        </div>
        <div className="relative container mx-auto px-4 h-full flex items-center">
          <div className="text-white max-w-2xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Lo que Dicen Nuestros Clientes
            </h1>
            <p className="text-xl">
              Testimonios reales de personas que confiaron en nosotros para sus necesidades inmobiliarias
            </p>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-blue-600 mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Featured Testimonial */}
      <div className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 relative">
              <Quote className="absolute top-6 left-6 w-12 h-12 text-blue-100" />
              
              <div className="text-center mb-8">
                <img
                  src={testimonials[currentTestimonial].avatar}
                  alt={testimonials[currentTestimonial].name}
                  className="w-20 h-20 rounded-full mx-auto mb-4 object-cover"
                />
                <div className="flex justify-center mb-4">
                  {renderStars(testimonials[currentTestimonial].rating)}
                </div>
              </div>

              <blockquote className="text-lg md:text-xl text-gray-700 text-center mb-8 leading-relaxed">
                "{testimonials[currentTestimonial].text}"
              </blockquote>

              <div className="text-center">
                <div className="font-semibold text-gray-900 text-lg">
                  {testimonials[currentTestimonial].name}
                </div>
                <div className="text-gray-600">
                  {testimonials[currentTestimonial].location}
                </div>
                <div className="text-blue-600 font-medium">
                  {testimonials[currentTestimonial].service}
                </div>
                <div className="text-sm text-gray-500 mt-2">
                  {testimonials[currentTestimonial].date}
                </div>
              </div>

              {/* Navigation */}
              <div className="flex justify-between items-center mt-8">
                <button
                  onClick={prevTestimonial}
                  className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                  <ChevronLeft className="w-6 h-6 text-gray-600" />
                </button>
                
                <div className="flex space-x-2">
                  {testimonials.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentTestimonial(index)}
                      className={`w-3 h-3 rounded-full transition-colors ${
                        index === currentTestimonial ? 'bg-blue-600' : 'bg-gray-300'
                      }`}
                    />
                  ))}
                </div>

                <button
                  onClick={nextTestimonial}
                  className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                  <ChevronRight className="w-6 h-6 text-gray-600" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* All Testimonials Grid */}
      <div className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Todos los Testimonios
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Lee todas las experiencias de nuestros clientes satisfechos
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {testimonials.map((testimonial) => (
              <div key={testimonial.id} className="bg-gray-50 rounded-lg p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center mb-4">
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full object-cover mr-4"
                  />
                  <div>
                    <div className="font-semibold text-gray-900">{testimonial.name}</div>
                    <div className="text-sm text-gray-600">{testimonial.location}</div>
                  </div>
                </div>

                <div className="flex mb-3">
                  {renderStars(testimonial.rating)}
                </div>

                <p className="text-gray-700 mb-4 line-clamp-4">
                  "{testimonial.text}"
                </p>

                <div className="flex justify-between items-center text-sm">
                  <span className="text-blue-600 font-medium">{testimonial.service}</span>
                  <span className="text-gray-500">{testimonial.date}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-16 bg-blue-600">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-2xl mx-auto">
            <Users className="w-16 h-16 text-white mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-white mb-4">
              ¿Quieres ser nuestro próximo cliente satisfecho?
            </h2>
            <p className="text-blue-100 mb-8 text-lg">
              Únete a más de 500 clientes que ya confiaron en nosotros para sus necesidades inmobiliarias
            </p>
            <div className="space-y-4 md:space-y-0 md:space-x-4 md:flex md:justify-center">
              <a
                href="/contact"
                className="inline-block bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                Contactar Ahora
              </a>
              <a
                href="/properties"
                className="inline-block border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors"
              >
                Ver Propiedades
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestimonialsPage;
