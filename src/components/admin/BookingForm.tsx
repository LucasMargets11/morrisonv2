import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { format } from 'date-fns';
import { X } from 'lucide-react';
import Button from '../UI/Button';
import { Property, Booking } from '../../types/admin';
import { adminApi } from '../../lib/admin';
import BlockForm from './BlockForm';

interface BookingFormProps {
  property: Property;
  onClose: () => void;
  onSuccess: () => void;
}

type BookingFormData = Omit<Booking, 'id' | 'created_at' | 'updated_at'>;

const BookingForm: React.FC<BookingFormProps> = ({ property, onClose, onSuccess }) => {
  const { register, handleSubmit, formState: { errors } } = useForm<BookingFormData>();
  const [showBlockForm, setShowBlockForm] = useState(false);
  const [blockRange, setBlockRange] = useState<{ start: Date; end: Date } | null>(null);

  const onSubmit = async (data: BookingFormData) => {
    try {
      await adminApi.createBooking({
        ...data,
        special_requests: data.special_requests ?? '',
        property_id: property.id,
        currency: 'USD',
      });
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error creating booking:', error);
    }
  };

  const handleBookingSuccess = () => {
    setShowBlockForm(false);
    onSuccess();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">New Booking</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Check-in Date
            </label>
            <input
              type="date"
              min={format(new Date(), 'yyyy-MM-dd')}
              {...register('check_in_date', { required: 'Check-in date is required' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.check_in_date && (
              <p className="mt-1 text-sm text-red-600">{errors.check_in_date.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Check-out Date
            </label>
            <input
              type="date"
              min={format(new Date(), 'yyyy-MM-dd')}
              {...register('check_out_date', { required: 'Check-out date is required' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.check_out_date && (
              <p className="mt-1 text-sm text-red-600">{errors.check_out_date.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Number of Guests
            </label>
            <input
              type="number"
              min="1"
              {...register('guest_count', { 
                required: 'Number of guests is required',
                min: { value: 1, message: 'Must have at least 1 guest' }
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.guest_count && (
              <p className="mt-1 text-sm text-red-600">{errors.guest_count.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Total Amount
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              {...register('total_amount', { 
                required: 'Total amount is required',
                min: { value: 0, message: 'Amount must be positive' }
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.total_amount && (
              <p className="mt-1 text-sm text-red-600">{errors.total_amount.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Special Requests
            </label>
            <textarea
              {...register('special_requests')}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Create Booking
            </Button>
          </div>
        </form>

        {showBlockForm && (
          <BlockForm
            property={property}
            range={blockRange}
            onClose={() => setShowBlockForm(false)}
            onSuccess={handleBookingSuccess}
          />
        )}
      </div>
    </div>
  );
};

export default BookingForm;