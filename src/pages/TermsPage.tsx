import React from 'react';
import { FileText, AlertTriangle, Scale, Users } from 'lucide-react';

const TermsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <FileText className="w-16 h-16 text-blue-600 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Términos y Condiciones
            </h1>
            <p className="text-gray-600">
              Última actualización: {new Date().toLocaleDateString()}
            </p>
          </div>

          <div className="prose max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
                <Scale className="w-6 h-6 mr-2 text-blue-600" />
                Aceptación de Términos
              </h2>
              <p className="text-gray-600">
                Al acceder y usar este sitio web, usted acepta estar sujeto a estos 
                términos y condiciones de uso y todas las leyes y reglamentos 
                aplicables, y acepta que es responsable del cumplimiento de las 
                leyes locales aplicables.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
                <Users className="w-6 h-6 mr-2 text-blue-600" />
                Servicios Ofrecidos
              </h2>
              <p className="text-gray-600 mb-4">
                Grupo Bairen ofrece los siguientes servicios:
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li>Intermediación en operaciones inmobiliarias</li>
                <li>Alquiler temporal de propiedades</li>
                <li>Asesoramiento en inversiones inmobiliarias</li>
                <li>Administración de propiedades</li>
                <li>Tasaciones y valuaciones</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Responsabilidades del Cliente
              </h2>
              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li>Proporcionar información veraz y actualizada</li>
                <li>Cumplir con los pagos acordados en tiempo y forma</li>
                <li>Usar las propiedades conforme a su destino</li>
                <li>Comunicar cualquier problema o incidencia</li>
                <li>Respetar las normas del edificio o complejo</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
                <AlertTriangle className="w-6 h-6 mr-2 text-blue-600" />
                Limitación de Responsabilidad
              </h2>
              <p className="text-gray-600">
                Grupo Bairen no será responsable por daños directos, indirectos, 
                incidentales, especiales o consecuentes que resulten del uso o la 
                imposibilidad de usar nuestros servicios, excepto en casos de dolo 
                o culpa grave debidamente comprobada.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Comisiones y Honorarios
              </h2>
              <div className="bg-blue-50 p-4 rounded-lg">
                <ul className="list-disc list-inside text-gray-700 space-y-2">
                  <li><strong>Venta:</strong> 3% + IVA sobre el precio de venta</li>
                  <li><strong>Alquiler Anual:</strong> 1 mes de alquiler + IVA</li>
                  <li><strong>Alquiler Temporal:</strong> 10% + IVA sobre el total</li>
                  <li><strong>Administración:</strong> 8% + IVA mensual</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Modificaciones
              </h2>
              <p className="text-gray-600">
                Nos reservamos el derecho de revisar estos términos en cualquier 
                momento. Los cambios entrarán en vigor inmediatamente después de 
                su publicación en este sitio web.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Ley Aplicable
              </h2>
              <p className="text-gray-600">
                Estos términos se rigen por las leyes de la República Argentina. 
                Cualquier disputa será resuelta en los tribunales competentes de 
                la ciudad de Posadas, Misiones.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsPage;
