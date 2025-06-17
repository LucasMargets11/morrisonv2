import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Filter, Trash2, Edit, Eye, Home } from 'lucide-react';
import { adminApi } from '../../lib/admin';
import Button from '../../components/UI/Button';
import Badge from '../../components/UI/Badge';
import { Property, PropertyStatus } from '../../types/admin';

const PropertyListPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<PropertyStatus | 'all'>('all');
  const [sortField, setSortField] = useState<keyof Property>('created_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const { data: properties = [], isLoading } = useQuery<Property[]>({
    queryKey: ['admin', 'properties'],
    queryFn: async () => {
      return await adminApi.getProperties();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminApi.deleteProperty(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'properties'] }),
  });

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

  const filtered = React.useMemo(() => {
    return properties
      .filter(p => {
        const matchesText = [p.title, p.address, p.city]
          .some(val => val.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
        return matchesText && matchesStatus;
      })
      .sort((a, b) => {
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
  }, [properties, searchTerm, statusFilter, sortField, sortDirection]);

  const featuredCount = properties.filter(p => p.is_featured).length;

  const handleToggleFeatured = (propertyId: string, newValue: boolean) => {
    if (newValue && featuredCount >= 3) return;
    adminApi.updatePropertyFeatured(propertyId, { is_featured: newValue }).then(() => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'properties'] });
    });
  };

  // Ejemplo típico de filtro

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
        <h1 className="text-3xl font-semibold text-gray-900">Properties</h1>
        <div className="flex gap-2 mt-4 sm:mt-0">
          <Button
            variant="outline"
            onClick={() => navigate('/admin/calendar')}
            className="flex items-center gap-2"
          >
            {/* Puedes usar un icono de calendario si quieres */}
            <span role="img" aria-label="Agenda">📅</span> Agenda
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

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative">
          <Search size={20} className="absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Search by title, address, city"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter size={20} className="text-gray-500" />
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value as any)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="archived">Archived</option>
          </select>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleSort('title')}
            className="flex-1"
          >
            Title {sortField === 'title' && (sortDirection === 'asc' ? '↑' : '↓')}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleSort('city')}
            className="flex-1"
          >
            City {sortField === 'city' && (sortDirection === 'asc' ? '↑' : '↓')}
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="min-w-full">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-4 py-3 text-left text-gray-600">Property</th>
              <th className="px-4 py-3 text-left text-gray-600">Location</th>
              <th className="px-4 py-3 text-left text-gray-600">Details</th>
              <th className="px-4 py-3 text-left text-gray-600">Status</th>
              <th className="px-4 py-3 text-right text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(p => (
              <tr key={p.id} className="border-b hover:bg-gray-50">
                <td className="px-4 py-4 flex items-center gap-3">
                  {p.media?.[0]?.url ? (
                    <img src={p.media[0].url} alt={p.title} className="w-10 h-10 rounded object-cover" />
                  ) : (
                    <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center">
                      <Home size={16} className="text-gray-400" />
                    </div>
                  )}
                  <div>
                    <p className="font-medium text-gray-900">{p.title}</p>
                    <p className="text-sm text-gray-500">{p.address}</p>
                  </div>
                </td>
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
                  }>{p.status}</Badge>
                </td>
                <td className="px-4 py-4 text-right flex justify-end gap-2">
                  <Button variant="text" size="sm" onClick={() => navigate(`/property/${p.id}`)}>
                    <Eye size={18} />
                  </Button>
                  <Button variant="text" size="sm" onClick={() => navigate(`/admin/properties/${p.id}/edit`)}>
                    <Edit size={18} />
                  </Button>
                  <Button variant="text" size="sm" className="text-red-600 hover:text-red-700" onClick={() => handleDelete(p.id)}>
                    <Trash2 size={18} />
                  </Button>
                </td>
                <td>
                  <input
                    type="checkbox"
                    checked={p.is_featured}
                    disabled={!p.is_featured && featuredCount >= 3}
                    onChange={() => handleToggleFeatured(p.id, !p.is_featured)}
                  />
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                  No properties found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PropertyListPage;
