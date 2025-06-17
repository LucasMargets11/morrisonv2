import React, { useState } from 'react';
import { Search, MapPin, Phone, Mail, Filter } from 'lucide-react';
import { agents } from '../data/agents';
import AgentCard from '../components/AgentCard';

const AgentsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [specialtyFilter, setSpecialtyFilter] = useState('all');

  // Get unique specialties from all agents
  const specialties = Array.from(
    new Set(agents.flatMap(agent => agent.specialties))
  );

  const filteredAgents = agents.filter(agent => {
    const matchesSearch = 
      agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agent.bio.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agent.specialties.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesSpecialty = specialtyFilter === 'all' || agent.specialties.includes(specialtyFilter);

    return matchesSearch && matchesSpecialty;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative h-[400px] bg-gradient-to-r from-blue-900 to-blue-700">
        <div className="absolute inset-0">
          <img 
            src="https://images.pexels.com/photos/1560065/pexels-photo-1560065.jpeg"
            alt="Real estate team"
            className="w-full h-full object-cover opacity-20"
          />
        </div>
        <div className="relative container mx-auto px-4 h-full flex flex-col items-center justify-center text-white">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-center">
            Meet Our Expert Real Estate Agents
          </h1>
          <p className="text-xl text-center mb-8 max-w-2xl">
            Our team of experienced professionals is here to help you find your perfect property
          </p>
          
          {/* Search Bar */}
          <div className="w-full max-w-4xl bg-white rounded-lg shadow-lg p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search agents by name or specialty..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center gap-2">
                <Filter size={20} className="text-gray-500" />
                <select
                  value={specialtyFilter}
                  onChange={(e) => setSpecialtyFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Specialties</option>
                  {specialties.map(specialty => (
                    <option key={specialty} value={specialty}>{specialty}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Agents Grid */}
      <div className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900">
            {filteredAgents.length} Agents Available
          </h2>
          <p className="text-gray-600">
            Find the perfect agent to help with your real estate needs
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredAgents.map(agent => (
            <AgentCard key={agent.id} agent={agent} />
          ))}
          {filteredAgents.length === 0 && (
            <div className="col-span-full py-12 text-center text-gray-500">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                <Search size={24} className="text-gray-400" />
              </div>
              <p className="text-xl font-medium mb-2">No agents found</p>
              <p>Try adjusting your search criteria</p>
            </div>
          )}
        </div>
      </div>

      {/* Contact Section */}
      <section className="bg-gray-900 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Join Our Team</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Are you a real estate professional looking to take your career to the next level? 
              We're always looking for talented agents to join our team.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <Phone size={32} className="mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Call Us</h3>
              <p className="text-gray-400">(555) 123-4567</p>
            </div>
            <div className="text-center">
              <Mail size={32} className="mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Email Us</h3>
              <p className="text-gray-400">careers@premierestates.com</p>
            </div>
            <div className="text-center">
              <MapPin size={32} className="mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Visit Us</h3>
              <p className="text-gray-400">123 Real Estate Blvd, New York, NY</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AgentsPage;