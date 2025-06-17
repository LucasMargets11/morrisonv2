export interface Property {
  media: any;
  id: string;
  title: string;
  description: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  property_type: string;
  bedrooms: number;
  bathrooms: number;
  square_feet: number;
  year_built?: number;
  price: number;
  is_featured: boolean;
  status: PropertyStatus;
  created_by: string;
  created_at: string;
  updated_at: string;
  images: PropertyImage[];
  features: PropertyFeature[];
  maintenance_events?: MaintenanceEvent[];

}
export interface PropertyPricing {
  id: number;
  property: number;
  start_date: string;
  end_date: string;
  price: number; // <-- asegúrate de que esté este campo
  min_nights?: number;
  max_nights?: number;
  price_type?: string;
  currency?: string;
}
export interface PropertyImage {
  id: string;
  image: string;
  is_primary: boolean;
  created_at: string;
}

export interface PropertyFeature {
  id: string;
  name: string;
}

export interface Booking {
  id: string;
  property_id: string;
  guest_id: string;
  check_in_date: string;
  check_out_date: string;
  guest_count: number;
  total_amount: number;
  status: BookingStatus;
  special_requests?: string;
  created_at: string;
  updated_at: string;
}

export interface MaintenanceEvent {
  id: string;
  property_id: string;
  title: string;
  description?: string | Date;
  start_date: string | Date;
  end_date: string;
  status: MaintenanceStatus;
  priority: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export type PropertyStatus = 'draft' | 'published' | 'archived';
export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';
export type MaintenanceStatus = 'scheduled' | 'in-progress' | 'completed' | 'cancelled';