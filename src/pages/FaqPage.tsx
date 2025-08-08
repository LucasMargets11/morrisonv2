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
          question: '¿Cuáles son los requisitos para alquilar una propiedad temporal?',
          answer: 'Para alquilar una propiedad temporal necesitas: documento de identidad vigente, comprobantes de ingresos, depósito de garantía equivalente al 50% del valor total de la estadía, y completar el formulario de huéspedes.'
        },
        {
          question: '¿Cuánto tiempo de anticipación debo reservar?',
          answer: 'Recomendamos reservar con al menos 15 días de anticipación, especialmente en temporada alta (diciembre-febrero). Para estadías de más de 30 días, sugerimos reservar con 30 días de anticipación.'
        },
        {
          question: '¿Qué incluye el alquiler temporal?',
          answer: 'Nuestros alquileres incluyen: servicios básicos (luz, agua, gas), WiFi, ropa de cama y toallas, utensilios de cocina básicos, y limpieza inicial. Los gastos extraordinarios van por cuenta del huésped.'
        },
        {
          question: '¿Puedo cancelar mi reserva?',
          answer: 'Sí, las cancelaciones con más de 30 días de anticipación tienen reembolso del 90%. Entre 15-30 días: 50% de reembolso. Menos de 15 días: sin reembolso. Condiciones especiales pueden aplicar según la propiedad.'
        }
      ]
    },
    {
      title: 'Compra y Venta',
      faqs: [
        {
          question: '¿Cuál es el proceso para comprar una propiedad?',
          answer: 'El proceso incluye: 1) Asesoramiento y búsqueda, 2) Visitas a propiedades, 3) Negociación de precio, 4) Verificación legal y técnica, 5) Firma de boleto de compraventa, 6) Escrituración ante escribano.'
        },
        {
          question: '¿Qué documentación necesito para vender mi propiedad?',
          answer: 'Necesitas: escritura original, planos aprobados, certificado de libre deuda municipal y provincial, certificado de dominio actualizado, y documentación personal del propietario.'
        },
        {
          question: '¿Cuánto tiempo demora una operación de compraventa?',
          answer: 'Una operación típica demora entre 30-60 días desde la firma del boleto hasta la escritura, dependiendo de la documentación y financiación involucrada.'
        },
        {
          question: '¿Cuáles son los gastos de una compraventa?',
          answer: 'Los gastos incluyen: escribanía (1-2% del valor), impuesto de sellos (1.2%), gastos de gestoría, y comisión inmobiliaria (3% + IVA para cada parte).'
        }
      ]
    },
    {
      title: 'Servicios Generales',
      faqs: [
        {
          question: '¿En qué zonas de Posadas trabajan?',
          answer: 'Trabajamos en toda la ciudad de Posadas y alrededores: centro, Villa Cabello, Villa Sarita, Itaembé Miní, San Lorenzo, Candelaria, y otras localidades de la zona metropolitana.'
        },
        {
          question: '¿Ofrecen servicios de administración de propiedades?',
          answer: 'Sí, ofrecemos administración integral: cobro de alquileres, mantenimiento preventivo, gestión de inquilinos, rendición mensual de cuentas, y atención de emergencias 24/7.'
        },
        {
          question: '¿Realizan tasaciones?',
          answer: 'Sí, realizamos tasaciones profesionales para compraventa, alquiler, sucesiones, divorcios, y fines judiciales. Nuestras tasaciones están respaldadas por nuestra matrícula profesional.'
        },
        {
          question: '¿Qué garantías ofrecen en sus servicios?',
          answer: 'Ofrecemos garantía total en nuestros servicios: asesoramiento legal gratuito, seguro de responsabilidad civil, y respaldo de nuestra matrícula profesional en todos los trámites.'
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
