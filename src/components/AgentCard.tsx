import React from 'react';
import { Mail, Phone } from 'lucide-react';
import { Agent } from '../types';
import Button from './UI/Button';

interface AgentCardProps {
  agent: Agent;
}

const AgentCard: React.FC<AgentCardProps> = ({ agent }) => {
  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300">
      <div className="h-64 overflow-hidden">
        <img 
          src={agent.image} 
          alt={agent.name} 
          className="w-full h-full object-cover"
        />
      </div>
      
      <div className="p-6">
        <h3 className="font-bold text-xl text-gray-900 mb-2">{agent.name}</h3>
        
        <div className="flex flex-wrap gap-2 mb-4">
          {agent.specialties.map((specialty, index) => (
            <span 
              key={index}
              className="text-xs bg-blue-100 text-blue-800 rounded-full px-2 py-1"
            >
              {specialty}
            </span>
          ))}
        </div>
        
        <p className="text-gray-600 mb-6 line-clamp-3">{agent.bio}</p>
        
        <div className="flex flex-col space-y-3">
          <a 
            href={`mailto:${agent.email}`} 
            className="flex items-center text-gray-600 hover:text-blue-900 transition-colors"
          >
            <Mail size={16} className="mr-2" />
            {agent.email}
          </a>
          
          <a 
            href={`tel:${agent.phone}`} 
            className="flex items-center text-gray-600 hover:text-blue-900 transition-colors"
          >
            <Phone size={16} className="mr-2" />
            {agent.phone}
          </a>
        </div>
        
        <Button variant="outline" fullWidth className="mt-6">
          View Profile
        </Button>
      </div>
    </div>
  );
};

export default AgentCard;