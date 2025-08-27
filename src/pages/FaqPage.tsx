import React, { useState } from 'react';
import { ChevronDown, ChevronUp, HelpCircle, Search } from 'lucide-react';

const FAQPage: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const faqCategories = [
    {
      title: 'Alquiler Temporal',
      faqs: [
        {
          question: '¿Cuáles son los requisitos para alquilar temporalmente?',
          answer: 'No se solicita garantía ni recibo de sueldo. Se requiere un depósito de seguridad equivalente a 2 meses.'
        },
        {
          question: '¿Con cuánto tiempo de anticipación debo reservar?',
          answer: 'Recomendamos al menos 15 días. Para confirmar, se realiza una seña.'
        },
        {
          question: '¿Cómo se puede abonar el alquiler y la seña?',
          answer: 'Pesos argentinos: transferencia o efectivo\nUSD: efectivo\nUSDT (cripto)'
        },
        {
          question: '¿Qué incluye el alquiler temporal?',
          answer: 'Un modelo “all-in”: expensas y servicios incluidos, más limpiezas de cortesía durante la estadía pactada. Además, atención personalizada para cualquier necesidad.'
        },
        {
          question: '¿Puedo cancelar mi reserva?',
          answer: 'Sí. Se puede cancelar; la seña podrá retenerse total o parcialmente según el momento de la cancelación conforme a la política vigente.'
        }
      ]
    },
    {
      title: 'Alquiler Tradicional (Convencional)',
      faqs: [
        {
          question: '¿Cuáles son los requisitos?',
          answer: 'Garantía propietaria CABA o seguro de caución\nRecibos de sueldo con ingresos equivalentes a 3 meses de alquiler\nDepósito de seguridad: 1 mes'
        },
        {
          question: '¿Qué tipos de contratos ofrecen?',
          answer: 'Contratos a 12 o 24 meses.'
        }
      ]
    },
    {
      title: 'Alquiler Vacacional',
      faqs: [
        {
          question: '¿Qué incluye el departamento que reservé?',
          answer: 'Blanquería completa (toallas y sábanas) acorde a la cantidad de huéspedes.'
        },
        {
          question: '¿Aceptan mascotas?',
          answer: 'No se aceptan mascotas para estadías por renta diaria.'
        },
        {
          question: '¿Cuáles son los horarios de check-in y check-out?',
          answer: 'Check-in: de 14:00 a 18:00\nCheck-out: de 08:00 a 10:00\nFuera de ese rango se aplica cargo adicional.'
        },
        {
          question: '¿Cuándo y dónde se abona?',
          answer: 'Al retirar la llave en nuestras oficinas de Las Heras 3331. Si necesitan recepción personalizada, se coordina previamente.'
        }
      ]
    },
    {
      title: 'Servicios Generales',
      faqs: [
        {
          question: '¿Ofrecen limpieza adicional del departamento?',
          answer: 'Sí, puede solicitarse y se cotiza aparte.'
        },
        {
          question: '¿Coordinan traslados?',
          answer: 'Sí, a coordinar según disponibilidad.'
        },
        {
          question: 'Nota',
          answer: 'Las condiciones pueden variar según cada propiedad. Los detalles finales se confirman en la reserva/contrato.'
        }
      ]
    }
  ];

  const allFaqs = faqCategories.flatMap((category, categoryIndex) =>
    category.faqs.map((faq, faqIndex) => ({
      ...faq,
      categoryTitle: category.title,
      globalIndex: categoryIndex * 1000 + faqIndex
    }))
  );

  const filteredFaqs = searchTerm
    ? allFaqs.filter(
        faq =>
          faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
          faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : allFaqs;

  const toggleFAQ = (index: number) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-white rounded-lg shadow-lg mt-8">
          {/* Header, Search Bar, FAQ Content y Contact CTA juntos */}
          <div className="text-center pt-8 px-4">
            <HelpCircle className="w-16 h-16 text-blue-600 mx-auto mb-6" />
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Preguntas Frecuentes
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Encuentra respuestas a las preguntas más comunes sobre nuestros servicios inmobiliarios
            </p>
          </div>

          {/* Search Bar */}
          <div className="mb-8 px-4">
            <div className="relative max-w-md mx-auto">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Buscar preguntas..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* FAQ Content */}
          {!searchTerm ? (
            // Grouped by categories
            faqCategories.map((category, categoryIndex) => (
              <div key={categoryIndex} className="border-b border-gray-200 last:border-b-0">
                <div className="bg-gray-50 px-6 py-4">
                  <h2 className="text-xl font-semibold text-gray-900">{category.title}</h2>
                </div>
                {category.faqs.map((faq, faqIndex) => {
                  const globalIndex = categoryIndex * 1000 + faqIndex;
                  return (
                    <div key={faqIndex} className="border-b border-gray-100 last:border-b-0">
                      <button
                        className="w-full px-6 py-4 text-left hover:bg-gray-50 transition-colors"
                        onClick={() => toggleFAQ(globalIndex)}
                      >
                        <div className="flex justify-between items-center">
                          <h3 className="text-lg font-medium text-gray-900 pr-4">
                            {faq.question}
                          </h3>
                          {activeIndex === globalIndex ? (
                            <ChevronUp className="text-blue-600 flex-shrink-0" size={20} />
                          ) : (
                            <ChevronDown className="text-gray-400 flex-shrink-0" size={20} />
                          )}
                        </div>
                      </button>
                      {activeIndex === globalIndex && (
                        <div className="px-6 pb-4">
                          <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))
          ) : (
            // Search results
            <div>
              <div className="px-6 py-4 bg-gray-50 border-b">
                <h2 className="text-lg font-semibold text-gray-900">
                  Resultados de búsqueda ({filteredFaqs.length})
                </h2>
              </div>
              {filteredFaqs.length > 0 ? (
                filteredFaqs.map((faq) => (
                  <div key={faq.globalIndex} className="border-b border-gray-100 last:border-b-0">
                    <button
                      className="w-full px-6 py-4 text-left hover:bg-gray-50 transition-colors"
                      onClick={() => toggleFAQ(faq.globalIndex)}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <span className="text-sm text-blue-600 font-medium">{faq.categoryTitle}</span>
                          <h3 className="text-lg font-medium text-gray-900 pr-4">
                            {faq.question}
                          </h3>
                        </div>
                        {activeIndex === faq.globalIndex ? (
                          <ChevronUp className="text-blue-600 flex-shrink-0" size={20} />
                        ) : (
                          <ChevronDown className="text-gray-400 flex-shrink-0" size={20} />
                        )}
                      </div>
                    </button>
                    {activeIndex === faq.globalIndex && (
                      <div className="px-6 pb-4">
                        <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="px-6 py-8 text-center">
                  <p className="text-gray-500">No se encontraron resultados para "{searchTerm}"</p>
                </div>
              )}
            </div>
          )}

          {/* Contact CTA dentro del mismo contenedor */}
          <div className="mt-12 text-center rounded-lg p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              ¿No encontraste lo que buscabas?
            </h3>
            <p className="text-gray-600 mb-6">
              Nuestro equipo está aquí para ayudarte con cualquier consulta adicional
            </p>
            <div className="space-y-4 md:space-y-0 md:space-x-4 md:flex md:justify-center">
              <a
                href="tel:+541130454989"
                className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Llamar ahora
              </a>
              <a
                href="mailto:info@grupobairen.com"
                className="inline-block bg-white text-blue-600 border border-blue-600 px-6 py-3 rounded-lg hover:bg-blue-50 transition-colors"
              >
                Enviar email
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQPage;
