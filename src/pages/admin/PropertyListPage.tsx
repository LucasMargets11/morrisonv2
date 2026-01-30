import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Plus, Search, Filter, Trash2, Edit, Eye, Home, Star } from 'lucide-react';
import { adminApi } from '../../lib/admin';
import Button from '../../components/UI/Button';
import Badge from '../../components/UI/Badge';
import { Property, PropertyStatus } from '../../types/admin';

const PropertyListPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  
  // Initialize status from URL or default to 'all'
  const statusFilter = (searchParams.get('status') as PropertyStatus | 'all') || 'all';
  
  const setStatusFilter = (newStatus: PropertyStatus | 'all') => {
    const newParams = new URLSearchParams(searchParams);
    if (newStatus === 'all') {
      newParams.delete('status');
    } else {
      newParams.set('status', newStatus);
    }
    setSearchParams(newParams);
  };

  const [zoneFilter, setZoneFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<keyof Property>('created_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Estados para autocompletado
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);

  const { data: properties = [], isLoading } = useQuery<Property[]>({
    queryKey: ['admin', 'properties', statusFilter],
    queryFn: async () => {
      return await adminApi.getProperties({ status: statusFilter });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminApi.deleteProperty(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'properties'] }),
  });

  const featuredMutation = useMutation({
    mutationFn: ({ id, is_featured }: { id: string; is_featured: boolean }) => 
      adminApi.updatePropertyFeatured(Number(id), { is_featured }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'properties'] });
    },
  });

  // Generar sugerencias de títulos
  const titleSuggestions = useMemo(() => {
    return Array.from(new Set(properties.map(p => p.title).filter(Boolean))).sort();
  }, [properties]);

  // Generar zonas únicas
  const uniqueZones = useMemo(() => {
    return Array.from(new Set(properties.map(p => p.city).filter(Boolean))).sort();
  }, [properties]);

  // Manejar búsqueda con autocompletado
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);

    if (value.length > 0) {
      const filtered = titleSuggestions.filter(title =>
        title.toLowerCase().includes(value.toLowerCase())
      ).slice(0, 5);
      setFilteredSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
    } else {
      setFilteredSuggestions([]);
      setShowSuggestions(false);
    }
  };

  // Seleccionar sugerencia
  const handleSuggestionClick = (suggestion: string) => {
    setSearchTerm(suggestion);
    setShowSuggestions(false);
    setFilteredSuggestions([]);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this property?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleSort = (field: keyof Property) => {
    if (field === sortField) {
      setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleToggleFeatured = (propertyId: string, newValue: boolean) => {
    const featuredCount = properties.filter(p => p.is_featured).length;
    
    if (newValue && featuredCount >= 3) {
      alert('Solo puedes tener un máximo de 3 propiedades destacadas. Desmarca una propiedad destacada primero.');
      return;
    }
    
    featuredMutation.mutate({ id: propertyId, is_featured: newValue });
  };

  const filtered = React.useMemo(() => {
    const baseFiltered = properties
      .filter(p => {
        const matchesTitle = !searchTerm || p.title.toLowerCase().includes(searchTerm.toLowerCase());
        // El filtrado por status ya se hace en el backend
        const matchesZone = zoneFilter === 'all' || p.city === zoneFilter;
        return matchesTitle && matchesZone;
      });

    // Ordenar: destacadas primero, luego por el campo seleccionado
    return baseFiltered.sort((a, b) => {
      // Primero ordenar por destacadas
      if (a.is_featured !== b.is_featured) {
        return b.is_featured ? 1 : -1; // Destacadas van primero
      }
      
      // Luego por el campo seleccionado
      const aVal = a[sortField];
      const bVal = b[sortField];
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortDirection === 'asc'
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
      }
      return 0;
    });
  }, [properties, searchTerm, statusFilter, zoneFilter, sortField, sortDirection]);

  const featuredCount = properties.filter(p => p.is_featured).length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="mt-16 min-h-screen bg-gray-50 p-6">
      {/* Page Title & Add Button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900">Properties</h1>
          <p className="text-sm text-gray-600 mt-1">
            Propiedades destacadas: {featuredCount}/3
            {featuredCount >= 3 && (
              <span className="ml-2 text-amber-600 font-medium">
                ⚠️ Límite alcanzado
              </span>
            )}
          </p>
        </div>
        <div className="flex gap-2 mt-4 sm:mt-0">
          <Button
            variant="outline"
            onClick={() => navigate('/admin/calendar')}
            className="flex items-center gap-2"
          >
            📅 Agenda
          </Button>
          <Button
            variant="primary"
            onClick={() => navigate('/admin/properties/new')}
            className="flex items-center gap-2"
          >
            <Plus size={20} /> New Property
          </Button>
        </div>
      </div>

      {/* Filters - Reorganizados */}
      <div className="bg-white p-4 rounded-lg shadow mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Búsqueda por título con autocompletado */}
        <div className="relative md:col-span-2">
          <Search size={18} className="absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por título..."
            value={searchTerm}
            onChange={handleSearchChange}
            onFocus={() => {
              if (filteredSuggestions.length > 0) {
                setShowSuggestions(true);
              }
            }}
            onBlur={() => {
              // Delay para permitir click en sugerencias
              setTimeout(() => setShowSuggestions(false), 150);
            }}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          
          {/* Sugerencias */}
          {showSuggestions && filteredSuggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-b-lg shadow-lg z-50 max-h-48 overflow-y-auto">
              {filteredSuggestions.map((suggestion, index) => (
                <button
                  key={index}
                  type="button"
                  className="w-full px-4 py-2 text-left hover:bg-blue-50 text-gray-700 text-sm border-b border-gray-100 last:border-b-0"
                  onMouseDown={() => handleSuggestionClick(suggestion)}
                >
                  <span className="flex items-center gap-2">
                    <Search size={14} className="text-gray-400" />
                    {suggestion}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Status Filter - Más compacto */}
        <div>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value as any)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">📋 Todos los estados</option>
            <option value="published">✅ Published</option>
            <option value="draft">📝 Draft</option>
            <option value="archived">📦 Archived</option>
          </select>
        </div>

        {/* Zone Filter */}
        <div>
          <select
            value={zoneFilter}
            onChange={e => setZoneFilter(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">🌍 Todas las zonas</option>
            {uniqueZones.map(zone => (
              <option key={zone} value={zone}>📍 {zone}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Sorting & Stats Bar */}
      <div className="bg-white p-3 rounded-lg shadow mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Filter size={16} />
          <span>
            Mostrando {filtered.length} de {properties.length} propiedades
          </span>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleSort('title')}
            className="text-xs"
          >
            Título {sortField === 'title' && (sortDirection === 'asc' ? '↑' : '↓')}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleSort('city')}
            className="text-xs"
          >
            Ciudad {sortField === 'city' && (sortDirection === 'asc' ? '↑' : '↓')}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleSort('created_at')}
            className="text-xs"
          >
            Fecha {sortField === 'created_at' && (sortDirection === 'asc' ? '↑' : '↓')}
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="min-w-full">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-4 py-3 text-left text-gray-600">
                <div className="flex items-center gap-2">
                  <Star size={16} className="text-amber-500" />
                  Destacada
                </div>
              </th>
              <th className="px-4 py-3 text-left text-gray-600">Property</th>
              <th className="px-4 py-3 text-left text-gray-600">Location</th>
              <th className="px-4 py-3 text-left text-gray-600">Details</th>
              <th className="px-4 py-3 text-left text-gray-600">Status</th>
              <th className="px-4 py-3 text-right text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(p => (
              <tr 
                key={p.id} 
                className={`border-b hover:bg-gray-50 transition-colors ${
                  p.is_featured ? 'bg-amber-50 border-amber-200' : ''
                }`}
              >
                {/* Columna de Destacada */}
                <td className="px-4 py-4">
                  <div className="flex items-center justify-center">
                    <button
                      onClick={() => handleToggleFeatured(p.id, !p.is_featured)}
                      disabled={!p.is_featured && featuredCount >= 3}
                      className={`relative group transition-all duration-200 ${
                        !p.is_featured && featuredCount >= 3 
                          ? 'cursor-not-allowed opacity-50' 
                          : 'cursor-pointer hover:scale-110'
                      }`}
                      title={
                        p.is_featured 
                          ? 'Quitar de destacadas' 
                          : featuredCount >= 3 
                            ? 'Máximo 3 propiedades destacadas'
                            : 'Marcar como destacada'
                      }
                    >
                      <Star
                        size={20}
                        className={`transition-all duration-200 ${
                          p.is_featured
                            ? 'fill-amber-400 text-amber-400 drop-shadow-sm'
                            : 'text-gray-300 hover:text-amber-300'
                        }`}
                      />
                      {p.is_featured && (
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-amber-500 rounded-full border-2 border-white"></div>
                      )}
                    </button>
                  </div>
                </td>

                {/* Columna de Property */}
                <td className="px-4 py-4">
                  <div className="flex items-center gap-3">
                    {(() => {
                      const first = Array.isArray(p.images) && p.images.length > 0 ? p.images[0] as any : null;
                      const thumb = typeof first === 'string' ? first : (first?.url || first?.image);
                      return thumb ? (
                      <div className="relative">
                        <img 
                          src={thumb} 
                          alt={p.title} 
                          className="w-12 h-12 rounded-lg object-cover shadow-sm" 
                        />
                        {p.is_featured && (
                          <div className="absolute -top-1 -right-1">
                            <Star 
                              size={12} 
                              className="fill-amber-400 text-amber-400 drop-shadow-sm" 
                            />
                          </div>
                        )}
                      </div>
                      ) : (
                      <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                        <Home size={20} className="text-gray-400" />
                      </div>
                      );
                    })()}
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-gray-900">{p.title}</p>
                        {p.is_featured && (
                          <Badge variant="warning" className="text-xs px-2 py-1">
                            Destacada
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-500">{p.address}</p>
                    </div>
                  </div>
                </td>

                {/* Resto de columnas igual */}
                <td className="px-4 py-4">
                  <p className="text-gray-700">{p.city}, {p.state}</p>
                  <p className="text-sm text-gray-500">{p.zip_code}</p>
                </td>
                <td className="px-4 py-4">
                  <p className="text-gray-700">{p.bedrooms} beds • {p.bathrooms} baths</p>
                  <p className="text-sm text-gray-500">{p.square_feet} sq ft</p>
                </td>
                <td className="px-4 py-4">
                  <Badge variant={
                    p.status === 'published' ? 'success' :
                    p.status === 'draft' ? 'warning' : 'secondary'
                  }>
                    {p.status === 'published' ? 'Publicado' : 
                     p.status === 'draft' ? 'Borrador' : 
                     p.status === 'archived' ? 'Archivado' : p.status}
                  </Badge>
                </td>
                <td className="px-4 py-4 text-right">
                  <div className="flex justify-end gap-1">
                    <span title="Ver propiedad">
                      <Button 
                        variant="text" 
                        size="sm" 
                        onClick={() => navigate(`/property/${p.id}`)}
                      >
                        <Eye size={16} />
                      </Button>
                    </span>
                    <span title="Editar propiedad">
                      <Button 
                        variant="text" 
                        size="sm" 
                        onClick={() => navigate(`/admin/properties/${p.id}/edit`)}
                      >
                        <Edit size={16} />
                      </Button>
                    </span>
                    <span title="Eliminar propiedad">
                      <Button 
                        variant="text" 
                        size="sm" 
                        className="text-red-600 hover:text-red-700" 
                        onClick={() => handleDelete(p.id)}
                      >
                        <Trash2 size={16} />
                      </Button>
                    </span>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                  <div className="flex flex-col items-center gap-2">
                    <Search size={24} className="text-gray-300" />
                    <p>No se encontraron propiedades con los filtros seleccionados.</p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSearchTerm('');
                        setStatusFilter('all');
                        setZoneFilter('all');
                      }}
                    >
                      Limpiar filtros
                    </Button>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Información adicional */}
      {featuredCount > 0 && (
        <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="flex items-center gap-2 text-amber-800">
            <Star size={16} className="fill-amber-500 text-amber-500" />
            <span className="text-sm font-medium">
              {featuredCount === 3 
                ? 'Tienes el máximo de 3 propiedades destacadas'
                : `${featuredCount} de 3 propiedades destacadas seleccionadas`
              }
            </span>
          </div>
          <p className="text-xs text-amber-700 mt-1">
            Las propiedades destacadas aparecen al inicio de la lista y son priorizadas en el sitio web.
          </p>
        </div>
      )}
    </div>
  );
};

export default PropertyListPage;
