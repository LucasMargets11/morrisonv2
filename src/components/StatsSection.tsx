import React from 'react';
import { Home, Users, Award, MapPin } from 'lucide-react';

const StatsSection: React.FC = () => {
  return (
    <section className="py-20 bg-blue-900 text-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Why Choose Premier Estates?</h2>
          <p className="max-w-2xl mx-auto text-blue-100">
            With our expertise and dedication, we've helped thousands of clients find their perfect property
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="text-center">
            <div className="bg-blue-800 rounded-full p-5 w-20 h-20 flex items-center justify-center mx-auto mb-4">
              <Home size={30} />
            </div>
            <h3 className="text-2xl font-bold mb-2">10,000+</h3>
            <p className="text-blue-100">Properties Listed</p>
          </div>
          
          <div className="text-center">
            <div className="bg-blue-800 rounded-full p-5 w-20 h-20 flex items-center justify-center mx-auto mb-4">
              <Users size={30} />
            </div>
            <h3 className="text-2xl font-bold mb-2">8,500+</h3>
            <p className="text-blue-100">Happy Customers</p>
          </div>
          
          <div className="text-center">
            <div className="bg-blue-800 rounded-full p-5 w-20 h-20 flex items-center justify-center mx-auto mb-4">
              <Award size={30} />
            </div>
            <h3 className="text-2xl font-bold mb-2">15+</h3>
            <p className="text-blue-100">Years of Experience</p>
          </div>
          
          <div className="text-center">
            <div className="bg-blue-800 rounded-full p-5 w-20 h-20 flex items-center justify-center mx-auto mb-4">
              <MapPin size={30} />
            </div>
            <h3 className="text-2xl font-bold mb-2">200+</h3>
            <p className="text-blue-100">Locations Nationwide</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default StatsSection;