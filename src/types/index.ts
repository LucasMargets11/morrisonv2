export interface Property {
  longitude: any;
  latitude: any;
  is_featured: unknown;
  property_type: string;
  id: string;
  title: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  squareFeet: number;
  description: string;
  features: string[];
  images: string[];
  isFeatured: boolean;
  isForSale: boolean;
  isForRent: boolean;
  yearBuilt: number;
  location: {
    lat: number;
    lng: number;
  };
}

export interface PropertyFilter {
  minPrice?: number;
  maxPrice?: number;
  minBedrooms?: number;
  minBathrooms?: number;
  propertyType?: string;
  city?: string;
  isForSale?: boolean;
  isForRent?: boolean;
}

export interface Agent {
  id: string;
  name: string;
  email: string;
  phone: string;
  image: string;
  bio: string;
  specialties: string[];
}