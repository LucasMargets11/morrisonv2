import React from 'react';
import { agents } from '../data/agents';
import AgentCard from './AgentCard';
import Button from './UI/Button';

const AgentsSection: React.FC = () => {
  // Display only the first 3 agents
  const displayedAgents = agents.slice(0, 3);

  return (
    <section className="py-16 container mx-auto px-4">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Meet Our Top Agents</h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Our experienced professionals are here to help you find your dream property
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {displayedAgents.map(agent => (
          <AgentCard key={agent.id} agent={agent} />
        ))}
      </div>
      
      <div className="text-center mt-12">
        <Button variant="outline">
          View All Agents
        </Button>
      </div>
    </section>
  );
};

export default AgentsSection;