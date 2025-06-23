import React from 'react';
import { GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api';
import { Property } from '../../types';

interface PropertyMapProps {
  property: Property;
  apiKey: string;
}

const containerStyle = {
  width: '100%',
  height: '400px',
};

const PropertyMap: React.FC<PropertyMapProps> = ({ property, apiKey }) => {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: apiKey,
  });

  // Si tu propiedad tiene lat/lng reales, usa esos valores
  const center = {
    lat: property.location?.lat || -34.6037, // valor por defecto (Buenos Aires)
    lng: property.location?.lng || -58.3816,
  };

  if (!isLoaded) return <div>Cargando mapa...</div>;

  return (
    <GoogleMap mapContainerStyle={containerStyle} center={center} zoom={15}>
      <Marker position={center} />
    </GoogleMap>
  );
};

export default PropertyMap;