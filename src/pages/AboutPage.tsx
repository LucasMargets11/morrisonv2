import React from 'react';
import { Award, Users, Home, TrendingUp, CheckCircle } from 'lucide-react';
import Button from '../components/UI/Button';

const AboutPage: React.FC = () => {
  const stats = [
    { icon: Home, value: '50+', label: 'Propiedades Administradas' },
    { icon: Users, value: '3000+', label: 'Clientes Satisfechos' },
    { icon: Award, value: '2+', label: 'Años de Experiencia' },
    { icon: TrendingUp, value: '95%', label: 'Éxito en Ventas' },
  ];

  const values = [
    {
      title: 'Transparencia',
      description: 'Información clara y honesta en cada transacción.',
    },
    {
      title: 'Experiencia',
      description: 'Reflejada en cada detalle: conocimiento, eficiencia y compromiso real.',
    },
    {
      title: 'Confianza',
      description: 'Relaciones duraderas basadas en la confianza mutua.',
    },
    {
      title: 'Innovación',
      description: 'Tecnología de vanguardia para mejores resultados.',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative h-96 bg-gradient-to-r from-blue-900 to-blue-700">
        <div className="absolute inset-0">
          <img
            src="https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg"
            alt="Equipo Grupo Bairen"
            className="w-full h-full object-cover opacity-30"
          />
        </div>
        <div className="relative container mx-auto px-4 h-full flex items-center">
          <div className="text-white max-w-2xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Sobre Grupo Bairen
            </h1>
            <p className="text-xl">
              Tu socio de confianza en el mercado inmobiliario.
            </p>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                    <Icon className="w-8 h-8 text-blue-600" />
                  </div>
                  <div className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</div>
                  <div className="text-gray-600">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Story Section */}
      <div className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Nuestra Historia
              </h2>
              <div className="space-y-4 text-gray-600">
                <p>
                  Fundado en 2023, Grupo Bairen nació en la Ciudad de Buenos Aires con la visión de transformar la experiencia inmobiliaria, integrando hospitalidad, innovación y gestión profesional.
                  Desde el inicio, nos propusimos ofrecer una nueva forma de habitar, invertir y disfrutar cada propiedad, con la intención de expandir nuestro modelo a todo el territorio argentino.
                </p>
                <p>
                  Nuestra pasión por la hospitalidad y el compromiso con cada propietario e inquilino nos impulsaron a crecer, incorporando tecnología, diseño y servicios premium que redefinen el concepto de alquiler urbano.
                </p>
                <p>
                  Hoy, Grupo Bairen combina tradición y modernidad:
                  administramos propiedades en zonas estratégicas como Palermo y Recoleta, brindamos asesoramiento personalizado, y acompañamos tanto a huéspedes como a inversores con una gestión basada en confianza, innovación y resultados medibles.
                </p>
              </div>
            </div>
            <div>
              <img
                src="https://images.pexels.com/photos/3184339/pexels-photo-3184339.jpeg"
                alt="Oficina Grupo Bairen"
                className="rounded-lg shadow-lg w-full"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Values Section */}
      <div className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Nuestros Valores
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Los principios que guían cada una de nuestras acciones y decisiones
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div key={index} className="text-center">
                <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {value.title}
                </h3>
                <p className="text-gray-600">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;