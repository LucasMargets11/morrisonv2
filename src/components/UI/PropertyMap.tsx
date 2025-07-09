// src/components/UI/PropertyMap.tsx
import React, { useState, useEffect } from 'react';
import {
  GoogleMap,
  Marker,
  InfoWindow,
  useJsApiLoader
} from '@react-google-maps/api';
import { useNavigate } from 'react-router-dom';
import { MapPin, Tag } from 'lucide-react';

interface LocationPin {
  id: string;
  address: string;
  price: number | string;
  title: string;
  imageUrl: string;
  zone?: string;
  propertyType?: string;
  latitude?: number; // <-- agrega esto
  longitude?: number; // <-- y esto
}

interface PropertyMapProps {
  locations: LocationPin[];
  apiKey: string;
}

const containerStyle = { width: '100%', height: '100%' };
const defaultCenter = { lat: -34.5883, lng: -58.3933 }; // Recoleta

// Genera un “pill” SVG con el precio
const getPinIcon = (price: string) => {
  const padding = 10;
  const fontSize = 14;
  const charWidth = fontSize * 0.6;
  const textWidth = price.length * charWidth;
  const width = Math.ceil(textWidth + padding * 2);
  const height = Math.ceil(fontSize * 1.8);
  const rx = height / 2;

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
      <rect x="0" y="0" rx="${rx}" ry="${rx}"
            width="${width}" height="${height}" fill="#2563EB"/>
      <text x="${width/2}" y="${height/2 + fontSize/3}"
            text-anchor="middle" font-size="${fontSize}" fill="#fff" font-family="Arial">
        ${price}
      </text>
    </svg>`.trim();

  return {
    url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`,
    size: new window.google.maps.Size(width, height),
    anchor: new window.google.maps.Point(width / 2, height)
  };
};

const useGoogleMaps = import.meta.env.VITE_USE_GOOGLE_MAPS === 'true';

const PropertyMap: React.FC<PropertyMapProps> = ({ locations, apiKey }) => {
  const navigate = useNavigate();
  const { isLoaded } = useJsApiLoader({ googleMapsApiKey: apiKey });
  const [markers, setMarkers] = useState<
    { position: google.maps.LatLngLiteral; data: LocationPin }[]
  >([]);
  const [activeIdx, setActiveIdx] = useState<number | null>(null);

  useEffect(() => {
    if (!isLoaded) return;
    // Usa las coordenadas guardadas
    const markersWithCoords = locations
      .filter(loc => loc.latitude && loc.longitude)
      .map(loc => ({
        position: { lat: Number(loc.latitude), lng: Number(loc.longitude) },
        data: loc
      }));
    setMarkers(markersWithCoords);
  }, [isLoaded, locations]);

  if (!isLoaded) return <div>Cargando mapa…</div>;

  if (!useGoogleMaps) {
    return (
      <div style={{
        width: '100%',
        height: 400,
        background: '#e5e7eb',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#555',
        borderRadius: 8
      }}>
        <span>Mapa desactivado en desarrollo</span>
      </div>
    );
  }

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={markers[0]?.position || defaultCenter}
      zoom={13}
    >
      {markers.map((marker, i) => {
        const icon = getPinIcon(`$${marker.data.price}`);
        return (
          <Marker
            key={marker.data.id}
            position={marker.position}
            icon={{
              url: icon.url,
              scaledSize: icon.size,
              anchor: icon.anchor
            }}
            onClick={() => setActiveIdx(i)}
          />
        );
      })}

      {activeIdx !== null && (
        <InfoWindow
          position={markers[activeIdx].position}
          onCloseClick={() => setActiveIdx(null)}
          options={{
            pixelOffset: new window.google.maps.Size(0, -40)
          }}
        >
          <div
            onClick={() => navigate(`/property/${markers[activeIdx].data.id}`)}
            style={{
              width: 280,
              background: '#fff',
              borderRadius: 8,
              overflow: 'hidden',
              boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
              cursor: 'pointer'
            }}
          >
            {/* Imagen al tope, solo esquinas superiores redondeadas */}
            <img
              src={markers[activeIdx].data.imageUrl}
              alt={markers[activeIdx].data.title}
              style={{
                display: 'block',
                width: '100%',
                height: 150,
                objectFit: 'cover',
                borderTopLeftRadius: 8,
                borderTopRightRadius: 8
              }}
            />

            {/* Contenido */}
            <div style={{ padding: '12px 16px' }}>
              <h3 style={{
                margin: 0,
                fontSize: 16,
                fontWeight: 600,
                textTransform: 'uppercase'
              }}>
                {markers[activeIdx].data.title}
              </h3>
              <p style={{
                margin: '4px 0',
                fontSize: 14,
                fontWeight: 'bold'
              }}>
                Starting at ${markers[activeIdx].data.price}
              </p>
              <div style={{
                display: 'flex',
                gap: 16,
                marginTop: 8
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  fontSize: 12,
                  color: '#555'
                }}>
                  <MapPin size={16} />
                  <span>{markers[activeIdx].data.zone}</span>
                </div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  fontSize: 12,
                  color: '#555'
                }}>
                  <Tag size={16} />
                  <span>{markers[activeIdx].data.propertyType}</span>
                </div>
              </div>
            </div>
          </div>
        </InfoWindow>
      )}
    </GoogleMap>
  );
};

export default PropertyMap;
