import { Property, PropertyPricing, MaintenanceEvent, Booking } from '../types/admin';
import api from './api';

export const adminApi = {
  // Properties
  async getProperties(filters: Record<string, string | number> = {}): Promise<Property[]> {
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value && value !== 'all') params.append(key, String(value));
      });
      const response = await api.get(`/properties/?${params.toString()}`);
      const results = Array.isArray(response.data)
        ? response.data
        : Array.isArray(response.data.results)
          ? response.data.results
          : [];
      return results.map((p: Property) => ({
        ...p,
        status: p.status,
      }));
    } catch (error) {
      console.error('Error fetching properties:', error);
      return [];
    }
  },

  async getProperty(id: string): Promise<Property> {
    const response = await api.get<Property>(`/properties/${id}/`);
    return response.data;
  },

  async createProperty(property: Partial<Property>, files?: File[]): Promise<Property> {
    const formData = new FormData();

    // Agrega los campos del property al FormData
    Object.entries(property).forEach(([key, value]) => {
      if (value === undefined || value === null) return;
      if (Array.isArray(value)) {
        // feature_list es un ListField: DRF acepta repitiendo la misma key
        if (key === 'feature_list') {
          value.forEach(v => formData.append('feature_list', String(v)));
        } else {
          value.forEach(v => formData.append(`${key}[]`, String(v)));
        }
      } else {
        formData.append(key, String(value));
      }
    });

    // Agrega los archivos (puedes cambiar 'images' por el nombre que espera tu backend)
    if (files && files.length > 0) {
      files.forEach((file) => formData.append('images', file));
    }

    const response = await api.post<Property>('/properties/', formData);
    return response.data;
  },

  async updateProperty(id: string, property: Partial<Property>, files?: File[]): Promise<Property> {
    const formData = new FormData();
    Object.entries(property).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, String(value));
      }
    });
    // Si tienes archivos para actualizar, agrégalos aquí (opcional)
    if (files && files.length > 0) {
      files.forEach((file) => formData.append('media', file));
    }
    const response = await api.put(`/properties/${id}/`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  // Para actualizar toda la propiedad (incluyendo archivos)
  async updatePropertyFull(id: string, property: Partial<Property>, files?: File[]): Promise<Property> {
    const formData = new FormData();
    Object.entries(property).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, String(value));
      }
    });
    if (files && files.length > 0) {
      files.forEach((file) => formData.append('media', file));
    }
    const response = await api.put(`/properties/${id}/`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  // Para actualizar solo algunos campos (PATCH)
  async updatePropertyFeatured(id: number, data: Partial<Property>) {
    // data debe ser un objeto plano, ej: { is_featured: true }
    return api.patch(`/properties/${id}/`, data, {
      headers: { 'Content-Type': 'application/json' }
    });
  },

  async deleteProperty(id: string): Promise<void> {
    await api.delete(`/properties/${id}/`);
  },

  // Media
  async uploadMedia(propertyId: string, file: File) {
    const formData = new FormData();
    formData.append('images', file);
    const response = await api.post<Property['images']>(
      `/properties/${propertyId}/upload_images/`,
      formData
    );
    return response.data[0];
  },

  async deleteMedia(propertyId: string, imageId: string): Promise<void> {
    await api.delete(`/properties/${propertyId}/delete_image/`, { data: { image_id: imageId } });
  },

  // Bookings
  getBookings: async (propertyId: number) => {
    const res = await api.get('/bookings/', { params: { property: propertyId } });
    // Si tu backend responde { results: [...] }
    return Array.isArray(res.data) ? res.data : (res.data.results ?? []);
  },

  // Maintenance events
  async getMaintenance(propertyId: number): Promise<MaintenanceEvent[]> {
    const res = await api.get(`/properties/${propertyId}/maintenance/`);
    return res.data;
  },

  // Pricing
  async getPricing(propertyId: number): Promise<PropertyPricing[]> {
    const res = await api.get(`/properties/${propertyId}/pricing/`);
    return res.data;
  },

  async createPricing(data: {
    property: number;
    start_date: string;
    end_date: string;
    price: number;
    min_nights: number;
    max_nights: number;
    price_type: string;
    currency: string;
  }): Promise<PropertyPricing> {
    const res = await api.post(`/properties/${data.property}/pricing/`, {
      property: data.property,
      start_date: data.start_date,
      end_date: data.end_date,
      price: data.price, // <-- price, no amount
      min_nights: data.min_nights,
      max_nights: data.max_nights,
      price_type: data.price_type,
      currency: data.currency,
    });
    return res.data;
  },

  async createBooking(data: {
    property_id: string;
    check_in_date: string;
    check_out_date: string;
    status: string;
    guest_count: number;
    total_amount: number;
    special_requests: string;
    currency: string;
  }): Promise<Booking> {
    // Replace with your actual API call
    // Use api instance (ensures base URL + auth headers)
    const res = await api.post('bookings/', data);
    return res.data;
  },

  // (Bloqueos de fechas) — Interfaces no definidas aún. Implementar si se requieren.
  async getBlocks(propertyId?: number) {
    // Blocks expuestos como Bookings con status=blocked en endpoint dedicado
  const res = await api.get('blocks/', { params: propertyId ? { property: propertyId } : {} });
    return Array.isArray(res.data) ? res.data : (res.data.results ?? []);
  },

  async createBlock(data: {
    property: string | number;
    check_in_date: string;
    check_out_date: string;
    guest_count: number;
    total_amount: number;
    reason?: string;
  }) {
  // property field expected as FK id
  const res = await api.post('blocks/', data);
    return res.data;
  },

  async updateBlock(id: string | number, data: {
    check_in_date?: string;
    check_out_date?: string;
    reason?: string;
  }) {
  const res = await api.patch(`blocks/${id}/`, data);
    return res.data;
  },

  async deleteBlock(id: string | number) {
  await api.delete(`blocks/${id}/`);
  },

  async createMaintenanceEvent(event: Omit<MaintenanceEvent, 'id' | 'created_at' | 'updated_at' | 'created_by'> & { property_id: string }): Promise<MaintenanceEvent> {
    // Replace with your actual API call logic
    const res = await api.post('maintenance-events/', event);
    return res.data;
  },
};
