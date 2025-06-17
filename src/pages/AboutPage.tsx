import React from 'react';
import { Users, Award, Target, Building2, Clock, Shield } from 'lucide-react';
import Button from '../components/UI/Button';

const AboutPage: React.FC = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative h-[500px] bg-gradient-to-r from-blue-900 to-blue-700">
        <div className="absolute inset-0">
          <img 
            src="https://images.pexels.com/photos/1546168/pexels-photo-1546168.jpeg"
            alt="Modern building"
            className="w-full h-full object-cover opacity-20"
          />
        </div>
        <div className="relative container mx-auto px-4 h-full flex flex-col items-center justify-center text-white text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Building Dreams Since 2010
          </h1>
          <p className="text-xl max-w-2xl mx-auto mb-8">
            Premier Estates is more than just a real estate company. We're your partner in finding the perfect place to call home.
          </p>
          <Button variant="secondary" size="lg">
            View Our Properties
          </Button>
        </div>
      </div>

      {/* Mission & Vision */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Mission & Vision</h2>
              <p className="text-gray-600 mb-6 leading-relaxed">
                At Premier Estates, our mission is to transform the real estate experience through innovation, integrity, and exceptional service. We believe everyone deserves their dream home, and we're here to make that dream a reality.
              </p>
              <p className="text-gray-600 leading-relaxed">
                Our vision is to be the most trusted name in real estate, known for our commitment to excellence, personalized service, and the successful outcomes we deliver for our clients.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-gray-50 p-6 rounded-lg">
                <Target className="text-blue-600 mb-4" size={32} />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Our Mission</h3>
                <p className="text-gray-600">Transform real estate through innovation and integrity</p>
              </div>
              <div className="bg-gray-50 p-6 rounded-lg">
                <Award className="text-blue-600 mb-4" size={32} />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Our Vision</h3>
                <p className="text-gray-600">Become the most trusted name in real estate</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Our Core Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-lg shadow-sm text-center">
              <Shield className="mx-auto text-blue-600 mb-4" size={32} />
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Integrity</h3>
              <p className="text-gray-600">
                We conduct our business with the highest ethical standards, ensuring transparency and trust in every transaction.
              </p>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-sm text-center">
              <Users className="mx-auto text-blue-600 mb-4" size={32} />
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Client Focus</h3>
              <p className="text-gray-600">
                Our clients' needs and goals are at the heart of everything we do, driving our commitment to exceptional service.
              </p>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-sm text-center">
              <Building2 className="mx-auto text-blue-600 mb-4" size={32} />
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Excellence</h3>
              <p className="text-gray-600">
                We strive for excellence in every aspect of our work, from property selection to client communication.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* History Timeline */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Our Journey</h2>
          <div className="max-w-3xl mx-auto">
            <div className="space-y-12">
              <div className="flex gap-6">
                <div className="flex-none">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <Clock className="text-blue-600" size={24} />
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">2010 - Foundation</h3>
                  <p className="text-gray-600">
                    Premier Estates was founded with a vision to revolutionize the real estate industry through innovative solutions and exceptional service.
                  </p>
                </div>
              </div>
              
              <div className="flex gap-6">
                <div className="flex-none">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <Building2 className="text-blue-600" size={24} />
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">2015 - Expansion</h3>
                  <p className="text-gray-600">
                    Expanded our operations to multiple cities and established our reputation as a leading luxury real estate agency.
                  </p>
                </div>
              </div>
              
              <div className="flex gap-6">
                <div className="flex-none">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <Award className="text-blue-600" size={24} />
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">2020 - Innovation</h3>
                  <p className="text-gray-600">
                    Launched our digital platform and virtual touring capabilities, setting new standards in the industry.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-blue-900 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Find Your Dream Home?</h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Let our experienced team guide you through your real estate journey
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button variant="secondary" size="lg">
              Browse Properties
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              className="border-white text-white hover:bg-white/10"
            >
              Contact Us
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;