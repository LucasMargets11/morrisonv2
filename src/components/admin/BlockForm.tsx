import React from 'react';
import { useForm } from 'react-hook-form';
import { format } from 'date-fns';
import Button from '../UI/Button';
import { Property } from '../../types/admin';
import { adminApi } from '../../lib/admin';

interface BlockFormProps {
  property: Property;
  range?: { start: Date; end: Date } | null;
  onClose: () => void;
  onSuccess: () => void;
}

type BlockFormData = {
  start_date: string;
  end_date: string;
  reason?: string;
};

const BlockForm: React.FC<BlockFormProps> = ({ property, range, onClose, onSuccess }) => {
  const { register, handleSubmit, formState: { errors } } = useForm<BlockFormData>({
    defaultValues: {
      start_date: range ? format(range.start, 'yyyy-MM-dd') : '',
      end_date: range ? format(range.end, 'yyyy-MM-dd') : '',
    }
  });

  const onSubmit = async (data: BlockFormData) => {
    try {
      await adminApi.createBlock({
        property: property.id,
        check_in_date: data.start_date,
        check_out_date: data.end_date,
        guest_count: 0,
        total_amount: 0,
        reason: data.reason,
      });
      onSuccess();
      onClose();
    } catch (error) {
      // Manejo de error
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
        <h2 className="text-lg font-bold mb-4 text-gray-900">Bloquear Fechas</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Desde</label>
            <input
              type="date"
              {...register('start_date', { required: 'Fecha de inicio requerida' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
            {errors.start_date && <p className="text-red-600 text-sm">{errors.start_date.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Hasta</label>
            <input
              type="date"
              {...register('end_date', { required: 'Fecha de fin requerida' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
            {errors.end_date && <p className="text-red-600 text-sm">{errors.end_date.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Motivo (opcional)</label>
            <input
              type="text"
              {...register('reason')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <Button variant="outline" onClick={onClose}>Cancelar</Button>
            <Button type="submit" variant="primary">Bloquear</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BlockForm;