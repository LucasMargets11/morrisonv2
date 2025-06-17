import React from 'react';
import { useForm } from 'react-hook-form';
import { format } from 'date-fns';
import { X } from 'lucide-react';
import Button from '../UI/Button';
import { Property, MaintenanceEvent } from '../../types/admin'; // adjust path if needed
import { adminApi } from '../../lib/admin';

interface MaintenanceFormProps {
  property: Property;
  onClose: () => void;
  onSuccess: () => void;
}

type MaintenanceFormData = Omit<MaintenanceEvent, 'id' | 'created_at' | 'updated_at' | 'created_by'>;

const MaintenanceForm: React.FC<MaintenanceFormProps> = ({ property, onClose, onSuccess }) => {
  const { register, handleSubmit, formState: { errors } } = useForm<MaintenanceFormData>();

  const onSubmit = async (data: MaintenanceFormData) => {
    try {
      await adminApi.createMaintenanceEvent({
        ...data,
        property_id: String(property.id),
        status: 'scheduled',
        title: '',
        start_date: '',
        end_date: '',
        priority: ''
      });
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error creating maintenance event:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">Schedule Maintenance</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title
            </label>
            <input
              type="text"
              {...register('title', { required: 'Title is required' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              {...register('description')}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Date & Time
            </label>
            <input
              type="datetime-local"
              min={format(new Date(), "yyyy-MM-dd'T'HH:mm")}
              {...register('start_date', { required: 'Start date is required' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.start_date && (
              <p className="mt-1 text-sm text-red-600">{errors.start_date.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              End Date & Time
            </label>
            <input
              type="datetime-local"
              min={format(new Date(), "yyyy-MM-dd'T'HH:mm")}
              {...register('end_date', { required: 'End date is required' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.end_date && (
              <p className="mt-1 text-sm text-red-600">{errors.end_date.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Priority
            </label>
            <select
              {...register('priority')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="low">Low</option>
              <option value="normal">Normal</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Schedule Maintenance
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MaintenanceForm;