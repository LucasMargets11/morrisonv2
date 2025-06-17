import React from 'react';
import Button from './UI/Button';

const CTASection: React.FC = () => {
  return (
    <section className="py-20 bg-gradient-to-r from-blue-900 to-blue-700 text-white">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl font-bold mb-4">Ready to Find Your Dream Home?</h2>
        <p className="max-w-2xl mx-auto mb-8 text-blue-100">
          Take the first step toward homeownership today. Our agents are ready to help you find the perfect property that meets all your needs.
        </p>
        
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Button
            variant="secondary"
            size="lg"
            className="min-w-44"
          >
            Browse Properties
          </Button>
          
          <Button
            variant="outline"
            size="lg"
            className="min-w-44 bg-transparent border-white text-white hover:bg-white/10"
          >
            Contact an Agent
          </Button>
        </div>
      </div>
    </section>
  );
};

export default CTASection;