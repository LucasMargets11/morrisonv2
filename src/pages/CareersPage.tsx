import React, { useState } from 'react';
import { logger } from '../lib/logger';
import { 
  Briefcase, 
  Users, 
  TrendingUp, 
  Heart, 
  MapPin, 
  Clock, 
  DollarSign,
  Send,
  CheckCircle
} from 'lucide-react';

const CareersPage: React.FC = () => {
  const [selectedJob, setSelectedJob] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    position: '',
    experience: '',
    message: '',
    cv: null as File | null
  });

  const benefits = [
    {
      icon: TrendingUp,
      title: 'Crecimiento Profesional',
      description: 'Oportunidades de desarrollo y capacitación continua'
    },
    {
      icon: Users,
      title: 'Ambiente Colaborativo',
      description: 'Trabajo en equipo con profesionales experimentados'
    },
    {
      icon: DollarSign,
      title: 'Compensación Competitiva',
      description: 'Salario base + comisiones + beneficios'
    },
    {
      icon: Heart,
      title: 'Vida Personal',
      description: 'Equilibrio entre trabajo y vida personal'
    }
  ];

  const openPositions = [
    {
      id: 1,
      title: 'Agente Inmobiliario Comercial',
      department: 'Ventas',
      type: 'Tiempo Completo',
      location: 'Posadas, Misiones',
      experience: '2+ años en ventas',
      description: 'Buscamos un agente inmobiliario dinámico para gestionar cartera de clientes y cerrar operaciones de compraventa.',
      requirements: [
        'Experiencia mínima de 2 años en ventas (preferible inmobiliaria)',
        'Excelentes habilidades de comunicación',
        'Orientación al cliente y resultados',
        'Licencia de conducir y vehículo propio',
        'Conocimiento del mercado local'
      ],
      responsibilities: [
        'Atención y asesoramiento a clientes',
        'Gestión de cartera de propiedades',
        'Realización de visitas y tasaciones',
        'Negociación y cierre de operaciones',
        'Mantenimiento de base de datos de clientes'
      ]
    },
    {
      id: 2,
      title: 'Especialista en Alquileres Temporales',
      department: 'Operaciones',
      type: 'Tiempo Completo',
      location: 'Posadas, Misiones',
      experience: '1+ año en atención al cliente',
      description: 'Únete a nuestro equipo de alquileres temporales para gestionar reservas y brindar experiencias excepcionales.',
      requirements: [
        'Experiencia en atención al cliente',
        'Conocimientos de plataformas digitales',
        'Capacidad de trabajo bajo presión',
        'Inglés básico/intermedio',
        'Disponibilidad horaria flexible'
      ],
      responsibilities: [
        'Gestión de reservas y disponibilidad',
        'Atención al cliente pre y post estadía',
        'Coordinación de check-in/check-out',
        'Seguimiento de limpieza y mantenimiento',
        'Resolución de incidencias'
      ]
    },
    {
      id: 3,
      title: 'Asistente Administrativo',
      department: 'Administración',
      type: 'Tiempo Completo',
      location: 'Posadas, Misiones',
      experience: 'Sin experiencia requerida',
      description: 'Buscamos una persona organizada para apoyar las operaciones administrativas de la empresa.',
      requirements: [
        'Estudiante avanzado o graduado en Administración/Contabilidad',
        'Manejo avanzado de Excel y Office',
        'Capacidad de organización y atención al detalle',
        'Buena comunicación escrita y verbal',
        'Proactividad y ganas de aprender'
      ],
      responsibilities: [
        'Gestión de documentación',
        'Apoyo en facturación y cobranzas',
        'Atención telefónica',
        'Actualización de bases de datos',
        'Apoyo general al equipo comercial'
      ]
    }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData(prev => ({ ...prev, cv: file }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Aquí iría la lógica para enviar el formulario
    logger.debug('Aplicación enviada:', formData);
    alert('¡Aplicación enviada exitosamente! Te contactaremos pronto.');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative h-96 bg-gradient-to-r from-blue-900 to-blue-700">
        <div className="absolute inset-0">
          <img
            src="https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg"
            alt="Equipo de trabajo"
            className="w-full h-full object-cover opacity-30"
          />
        </div>
        <div className="relative container mx-auto px-4 h-full flex items-center">
          <div className="text-white max-w-2xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Trabaja con Nosotros
            </h1>
            <p className="text-xl">
              Únete al equipo líder en el mercado inmobiliario de Posadas y desarrolla tu carrera profesional
            </p>
          </div>
        </div>
      </div>

      {/* Why Work With Us */}
      <div className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              ¿Por qué elegir Grupo Bairen?
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Somos más que una inmobiliaria, somos una familia que crece junta
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <div key={index} className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                    <Icon className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {benefit.title}
                  </h3>
                  <p className="text-gray-600">
                    {benefit.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Open Positions */}
      <div className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Posiciones Abiertas
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Encuentra la oportunidad perfecta para desarrollar tu carrera
            </p>
          </div>

          <div className="max-w-4xl mx-auto space-y-6">
            {openPositions.map((job) => (
              <div key={job.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div 
                  className="p-6 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => setSelectedJob(selectedJob === job.id ? null : job.id)}
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div className="mb-4 md:mb-0">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        {job.title}
                      </h3>
                      <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                        <div className="flex items-center">
                          <Briefcase size={16} className="mr-1" />
                          {job.department}
                        </div>
                        <div className="flex items-center">
                          <Clock size={16} className="mr-1" />
                          {job.type}
                        </div>
                        <div className="flex items-center">
                          <MapPin size={16} className="mr-1" />
                          {job.location}
                        </div>
                      </div>
                    </div>
                    <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                      {selectedJob === job.id ? 'Ocultar' : 'Ver Detalles'}
                    </button>
                  </div>
                </div>

                {selectedJob === job.id && (
                  <div className="border-t border-gray-200 p-6 bg-gray-50">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-3">
                          Descripción del Puesto
                        </h4>
                        <p className="text-gray-600 mb-6">{job.description}</p>

                        <h4 className="text-lg font-semibold text-gray-900 mb-3">
                          Requisitos
                        </h4>
                        <ul className="space-y-2">
                          {job.requirements.map((req, index) => (
                            <li key={index} className="flex items-start">
                              <CheckCircle className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                              <span className="text-gray-600">{req}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-3">
                          Responsabilidades
                        </h4>
                        <ul className="space-y-2">
                          {job.responsibilities.map((resp, index) => (
                            <li key={index} className="flex items-start">
                              <div className="w-2 h-2 bg-blue-600 rounded-full mr-3 mt-2.5 flex-shrink-0"></div>
                              <span className="text-gray-600">{resp}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Application Form */}
      <div className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Aplica Ahora
              </h2>
              <p className="text-gray-600">
                Completa el formulario y adjunta tu CV para postularte
              </p>
            </div>

            <form onSubmit={handleSubmit} className="bg-gray-50 rounded-lg p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre Completo *
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Teléfono *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Posición de Interés *
                  </label>
                  <select
                    name="position"
                    required
                    value={formData.position}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Selecciona una posición</option>
                    {openPositions.map((job) => (
                      <option key={job.id} value={job.title}>
                        {job.title}
                      </option>
                    ))}
                    <option value="otro">Otro</option>
                  </select>
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Años de Experiencia
                </label>
                <select
                  name="experience"
                  value={formData.experience}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Selecciona tu experiencia</option>
                  <option value="sin-experiencia">Sin experiencia</option>
                  <option value="1-2">1-2 años</option>
                  <option value="3-5">3-5 años</option>
                  <option value="5+">Más de 5 años</option>
                </select>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  CV/Currículum *
                </label>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-50 file:text-blue-600 hover:file:bg-blue-100"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Formatos aceptados: PDF, DOC, DOCX (máx. 5MB)
                </p>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mensaje Adicional
                </label>
                <textarea
                  name="message"
                  rows={4}
                  value={formData.message}
                  onChange={handleInputChange}
                  placeholder="Cuéntanos por qué quieres trabajar con nosotros..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center"
              >
                <Send className="w-5 h-5 mr-2" />
                Enviar Aplicación
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CareersPage;
