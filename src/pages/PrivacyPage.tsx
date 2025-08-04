import React from 'react';
import { Shield, Eye, Lock, UserCheck } from 'lucide-react';

const PrivacyPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <Shield className="w-16 h-16 text-blue-600 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Política de Privacidad
            </h1>
            <p className="text-gray-600">
              Última actualización: {new Date().toLocaleDateString()}
            </p>
          </div>

          <div className="prose max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
                <UserCheck className="w-6 h-6 mr-2 text-blue-600" />
                Información que Recopilamos
              </h2>
              <p className="text-gray-600 mb-4">
                En Grupo Bairen recopilamos la siguiente información:
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li>Información de contacto (nombre, email, teléfono)</li>
                <li>Preferencias de búsqueda de propiedades</li>
                <li>Historial de consultas y transacciones</li>
                <li>Información técnica (IP, navegador, dispositivo)</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
                <Eye className="w-6 h-6 mr-2 text-blue-600" />
                Cómo Usamos su Información
              </h2>
              <p className="text-gray-600 mb-4">
                Utilizamos su información para:
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li>Proporcionar servicios inmobiliarios personalizados</li>
                <li>Comunicarnos sobre propiedades de interés</li>
                <li>Mejorar nuestros servicios y experiencia del usuario</li>
                <li>Enviar newsletters (solo con su consentimiento)</li>
                <li>Cumplir con obligaciones legales</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
                <Lock className="w-6 h-6 mr-2 text-blue-600" />
                Protección de Datos
              </h2>
              <p className="text-gray-600 mb-4">
                Implementamos medidas de seguridad para proteger su información:
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li>Encriptación SSL en todas las transmisiones</li>
                <li>Acceso restringido a información personal</li>
                <li>Capacitación regular del personal en privacidad</li>
                <li>Auditorías periódicas de seguridad</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Sus Derechos
              </h2>
              <p className="text-gray-600 mb-4">
                Conforme a la Ley de Protección de Datos Personales, usted tiene derecho a:
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li>Acceder a sus datos personales</li>
                <li>Rectificar información incorrecta</li>
                <li>Solicitar la eliminación de sus datos</li>
                <li>Oponerse al procesamiento</li>
                <li>Portabilidad de datos</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Contacto
              </h2>
              <p className="text-gray-600">
                Para consultas sobre privacidad, contáctenos en:
              </p>
              <div className="bg-gray-50 p-4 rounded-lg mt-4">
                <p className="text-gray-700">
                  <strong>Email:</strong> privacidad@grupobairen.com<br />
                  <strong>Teléfono:</strong> +54 11 3045-4989<br />
                  <strong>Dirección:</strong> La Rioja 1578, Posadas, Misiones
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPage;
