import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { useDropzone } from 'react-dropzone';
import { ArrowLeft, Upload, X, Loader2 } from 'lucide-react';
import { adminApi } from '../../lib/admin';
import Button from '../../components/UI/Button';
import PropertyCalendar from '../../components/admin/PropertyCalendar';
import { Property } from '../../types/admin';

type PropertyFormData = Omit<Property, 'id' | 'created_at' | 'updated_at' | 'media'>;

const PropertyFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm<PropertyFormData>();

  const { data: property, isLoading: isLoadingProperty } = useQuery({
    queryKey: ['admin', 'property', id],
    queryFn: () => adminApi.getProperty(id!),
    enabled: !!id,
  });

  useEffect(() => {
    if (property) {
      reset({
        ...property,
        features: property.features || [],
      });
    }
  }, [property, reset]);

  const createMutation = useMutation({
    mutationFn: async (data: PropertyFormData) => {
      try {
        const property = await adminApi.createProperty(data, uploadedFiles);
        if (uploadedFiles.length > 0) {
          setIsUploading(true);
          for (const file of uploadedFiles) {
            await adminApi.uploadMedia(property.id, file);
          }
          setIsUploading(false);
        }
        return property;
      } catch (error) {
        console.error('Error creating property:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'properties'] });
      navigate('/admin/properties');
    },
    onError: (error: any) => {
      setUploadError(error.message || 'Failed to create property');
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: PropertyFormData) => {
      try {
        const updatedProperty = await adminApi.updateProperty(id!, data);
        if (uploadedFiles.length > 0) {
          setIsUploading(true);
          for (const file of uploadedFiles) {
            await adminApi.uploadMedia(updatedProperty.id, file);
          }
          setIsUploading(false);
        }
        return updatedProperty;
      } catch (error) {
        console.error('Error updating property:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'properties'] });
      navigate('/admin/properties');
    },
    onError: (error: any) => {
      setUploadError(error.message || 'Failed to update property');
    },
  });

  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp'],
    },
    maxSize: 5242880, // 5MB
    onDrop: (acceptedFiles) => {
      setUploadedFiles(prev => [...prev, ...acceptedFiles]);
      setUploadError(null);
    },
    onDropRejected: (rejectedFiles) => {
      setUploadError('Invalid file type or size exceeded (max 5MB)');
    },
  });

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: PropertyFormData) => {
    try {
      if (id) {
        await updateMutation.mutateAsync(data);
      } else {
        await createMutation.mutateAsync(data);
      }
    } catch (error) {
      console.error('Error saving property:', error);
    }
  };

  if (isLoadingProperty) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const isSubmitting = createMutation.isPending || updateMutation.isPending || isUploading;

  return (
    <div className="container mx-auto px-4 py-8">
      <Button 
        variant="text" 
        className="mb-6"
        onClick={() => navigate('/admin/properties')}
      >
        <ArrowLeft size={18} className="mr-1" />
        Back to properties
      </Button>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          {id ? 'Edit Property' : 'Add New Property'}
        </h1>

        {uploadError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
            {uploadError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                Property Type
              </label>
              <select
                {...register('property_type', { required: 'Property type is required' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select type</option>
                <option value="house">House</option>
                <option value="apartment">Apartment</option>
                <option value="condo">Condo</option>
                <option value="townhouse">Townhouse</option>
                <option value="land">Land</option>
              </select>
              {errors.property_type && (
                <p className="mt-1 text-sm text-red-600">{errors.property_type.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Price
              </label>
              <input
                type="number"
                step="0.01"
                {...register('price', { 
                  required: 'Price is required',
                  min: { value: 0, message: 'Price must be positive' }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.price && (
                <p className="mt-1 text-sm text-red-600">{errors.price.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                {...register('status')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address
              </label>
              <input
                type="text"
                {...register('address', { required: 'Address is required' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.address && (
                <p className="mt-1 text-sm text-red-600">{errors.address.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                City
              </label>
              <input
                type="text"
                {...register('city', { required: 'City is required' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.city && (
                <p className="mt-1 text-sm text-red-600">{errors.city.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                State
              </label>
              <input
                type="text"
                {...register('state', { required: 'State is required' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.state && (
                <p className="mt-1 text-sm text-red-600">{errors.state.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ZIP Code
              </label>
              <input
                type="text"
                {...register('zip_code', { required: 'ZIP code is required' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.zip_code && (
                <p className="mt-1 text-sm text-red-600">{errors.zip_code.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bedrooms
              </label>
              <input
                type="number"
                {...register('bedrooms', { required: 'Number of bedrooms is required' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.bedrooms && (
                <p className="mt-1 text-sm text-red-600">{errors.bedrooms.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bathrooms
              </label>
              <input
                type="number"
                step="0.5"
                {...register('bathrooms', { required: 'Number of bathrooms is required' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.bathrooms && (
                <p className="mt-1 text-sm text-red-600">{errors.bathrooms.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Square Feet
              </label>
              <input
                type="number"
                {...register('square_feet', { required: 'Square footage is required' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.square_feet && (
                <p className="mt-1 text-sm text-red-600">{errors.square_feet.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Year Built
              </label>
              <input
                type="number"
                {...register('year_built')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              {...register('description')}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Media
            </label>
            <div
              {...getRootProps()}
              className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors cursor-pointer"
            >
              <input {...getInputProps()} />
              <Upload size={24} className="mx-auto mb-2 text-gray-400" />
              <p className="text-gray-600">
                Drag & drop files here, or click to select files
              </p>
              <p className="text-sm text-gray-500">
                Supported formats: JPEG, PNG, WEBP (max 5MB)
              </p>
            </div>

            {uploadedFiles.length > 0 && (
              <div className="mt-4 space-y-2">
                {uploadedFiles.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between bg-gray-50 p-2 rounded"
                  >
                    <span className="text-sm text-gray-600">{file.name}</span>
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-4">
            <Button
              variant="outline"
              onClick={() => navigate('/admin/properties')}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <div className="flex items-center">
                  <Loader2 size={20} className="animate-spin mr-2" />
                  {isUploading ? 'Uploading...' : 'Saving...'}
                </div>
              ) : (
                'Save Property'
              )}
            </Button>
          </div>
        </form>
      </div>

      {property && (
        <div className="mt-8">
          <PropertyCalendar property={property} />
        </div>
      )}
    </div>
  );
};

export default PropertyFormPage;