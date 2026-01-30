import React from 'react';
import { Building, Calendar, Briefcase } from 'lucide-react';

export type PropertyType = 'tradicional' | 'temporal' | 'vacacional' | 'all';

interface PropertyTypeSelectorProps {
  value: string;
  onChange: (value: PropertyType) => void;
}

const PROPERTY_TYPES: { value: PropertyType; label: string; icon: React.ElementType }[] = [
  { value: 'tradicional', label: 'Anual', icon: Building },
  { value: 'temporal', label: 'Temporal', icon: Briefcase },
  /* { value: 'vacacional', label: 'Vacacional', icon: Calendar }, */
];

const PropertyTypeSelector: React.FC<PropertyTypeSelectorProps> = ({ value, onChange }) => {
  return (
    <>
      {/* Desktop View: Segmented Control */}
      <div className="hidden md:flex bg-gray-100/80 p-1 rounded-xl mr-2">
        {PROPERTY_TYPES.map((type) => {
          const isSelected = value === type.value;
          const Icon = type.icon;
          return (
            <button
              key={type.value}
              onClick={() => onChange(type.value)}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
                ${isSelected 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'
                }
              `}
            >
              <Icon size={16} />
              <span>{type.label}</span>
            </button>
          );
        })}
      </div>

      {/* Mobile View: Select */}
      <div className="md:hidden w-full mb-2">
        <div className="relative">
          <select
            value={value}
            onChange={(e) => onChange(e.target.value as PropertyType)}
            className="w-full appearance-none bg-white border border-gray-200 text-gray-700 py-3 px-4 pr-8 rounded-xl leading-tight focus:outline-none focus:bg-white focus:border-blue-500"
          >
            {PROPERTY_TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
              <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
            </svg>
          </div>
        </div>
      </div>
    </>
  );
};

export default PropertyTypeSelector;
