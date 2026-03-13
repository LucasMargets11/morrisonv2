import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { useDropzone } from 'react-dropzone';
import { ArrowLeft, Upload, X, Loader2, Home, MapPin, DollarSign, Bed, Bath, Square, Calendar } from 'lucide-react';
import { adminApi } from '../../lib/admin';
import Button from '../../components/UI/Button';
import { lazy, Suspense } from 'react';
const PropertyCalendar = lazy(() => import('../../components/admin/PropertyCalendar'));
import { Property, PropertyImage } from '../../types/admin';
import { presignUpload, putToS3, registerImage } from '../../lib/s3';

type PropertyFormData = Omit<Property, 'id' | 'created_at' | 'updated_at' | 'media'>;

// Nueva agrupación de features / equipamiento solicitada
const FEATURE_CATEGORIES: { title: string; items: string[] }[] = [
  {
    title: 'Cocina',
    items: [
      'Cocina equipada',
      'Utensilios de cocina',
      'Cafetera / pava eléctrica',
      'Tostadora',
    ],
  },
  {
    title: 'Electrodomésticos y confort',
    items: [
      'Smart TV',
      'Aire acondicionado',
      'Calefacción',
      'WiFi / Internet',
      'Lavarropas',
      'Plancha / tabla de planchar',
      'Secador de pelo',
    ],
  },
  {
    title: 'Espacios exteriores y amenities',
    items: [
      'Parrilla / Quincho',
      'Pileta',
      'SUM',
      'Estacionamiento propio o asignado',
    ],
  },
  {
    title: 'Ropa blanca y mobiliario',
    items: [
      'Blanquería completa',
      'Cuna o cama adicional bajo pedido',
    ],
  },
  {
    title: 'Seguridad',
    items: [
      'Caja fuerte',
      'Cerradura electrónica',
      'Alarma / cámaras de seguridad',
    ],
  },
];

const PropertyFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [images, setImages] = useState<(string | PropertyImage)[]>([]);
  const [removedImageIds, setRemovedImageIds] = useState<number[]>([]);

  const { register, handleSubmit, formState: { errors }, reset, setValue, watch } = useForm<PropertyFormData>({
    defaultValues: {
      status: 'draft',
      is_featured: false,
      property_type: 'house'
    }
  });
  // Estado para features seleccionadas y campo "Otros"
  const [selectedFeatures, setSelectedFeatures] = useState<Set<string>>(new Set());
  const [otrosInput, setOtrosInput] = useState('');
  const [otrosFeatures, setOtrosFeatures] = useState<string[]>([]);

  // Conjunto de features conocidas para detectar "otros" al editar
  const KNOWN_FEATURES = useMemo(() => new Set(FEATURE_CATEGORIES.flatMap(c => c.items)), []);
  const selectedCity = watch('city');

  // Códigos postales por ciudad
  const postalCodes = {
    'Recoleta': '1425',
    'Palermo': '1414',
    'Belgrano': '1426',
    'San Telmo': '1300',
    'Microcentro': '1000',
    'Nuñez': '1429',
    'Cañitas': '1426',
    'Caballito': '1406',
    'Villa Crespo': '1414',
    'Chacarita': '1427',
    'Colegiales': '1426',
    'Palermo soho': '1414',
    'Palermo chico': '1425',
    'Palermo viejo': '1414',
    'Monserrat': '1081',
    'San Nicolás': '1012',
    'San Cristobal': '1255',
    'Puerto Madero': '1107',
    'Almagro': '1181',
    'San Isidro': '1642',
    'Olivos': '1636'
  };

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
      setImages(property.images || []);

      // Pre-cargar features existentes (solo lectura en edición si backend no soporta update)
      if (property.features) {
        const names = property.features.map(f => f.name);
        const unknown: string[] = [];
        const newSet = new Set<string>();
        names.forEach(n => {
          if (KNOWN_FEATURES.has(n)) newSet.add(n); else unknown.push(n);
        });
        setSelectedFeatures(newSet);
        if (unknown.length) {
          setOtrosFeatures(unknown);
        }
      }
    }
  }, [property, reset]);

  // Auto-completar código postal cuando se selecciona la ciudad
  useEffect(() => {
    if (selectedCity && postalCodes[selectedCity as keyof typeof postalCodes]) {
      setValue('zip_code', postalCodes[selectedCity as keyof typeof postalCodes]);
    }
  }, [selectedCity, setValue]);

  const createMutation = useMutation({
    mutationFn: async (data: PropertyFormData) => {
      try {
        const property = await adminApi.createProperty(data, []);
        // Direct-to-S3 upload flow
        if (uploadedFiles.length > 0) {
          setIsUploading(true);
          let order = images.length ? images.length : 0;
          for (let i = 0; i < uploadedFiles.length; i++) {
            const file = uploadedFiles[i];
            if (!file.type.startsWith('image/')) {
              console.warn('Skipping non-image file', file.name);
              continue;
            }
            // size guard
            if (file.size > 15 * 1024 * 1024) {
              console.warn('File too large (>15MB), consider compressing', file.name);
            }
            const presign = await presignUpload({ property_id: property.id, filename: file.name, content_type: file.type });
            await putToS3(presign.upload_url, file, presign.headers);
            await registerImage(property.id, { s3_key: presign.s3_key, is_primary: order === 0, order });
            order += 1;
          }
          setIsUploading(false);
        }
        return property;
      } catch (error) {
        console.error('Error creating property:', error);
        throw error;
      }
    },
    onSuccess: (data) => {
      // Invalidar cache de admin y público
      queryClient.invalidateQueries({ queryKey: ['admin', 'properties'] });
      queryClient.invalidateQueries({ queryKey: ['properties'] }); // Web pública (listados)
      navigate('/admin/properties');
    },
    onError: (error: any) => {
      setUploadError(error.message || 'Error al crear la propiedad');
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: PropertyFormData) => {
      try {
        const updatedProperty = await adminApi.updateProperty(id!, data);
        if (uploadedFiles.length > 0) {
          setIsUploading(true);
          let order = images.length ? images.length : 0;
          for (let i = 0; i < uploadedFiles.length; i++) {
            const file = uploadedFiles[i];
            if (!file.type.startsWith('image/')) continue;
            if (file.size > 15 * 1024 * 1024) {
              console.warn('File too large (>15MB), consider compressing', file.name);
            }
            const presign = await presignUpload({ property_id: updatedProperty.id, filename: file.name, content_type: file.type });
            await putToS3(presign.upload_url, file, presign.headers);
            await registerImage(updatedProperty.id, { s3_key: presign.s3_key, is_primary: order === 0, order });
            order += 1;
          }
          setIsUploading(false);
        }
        return updatedProperty;
      } catch (error) {
        console.error('Error updating property:', error);
        throw error;
      }
    },
    onSuccess: (data) => {
      // Invalidar listados admin
      queryClient.invalidateQueries({ queryKey: ['admin', 'properties'] });
      // Invalidar detalle admin
      if (data && data.id) {
         queryClient.invalidateQueries({ queryKey: ['admin', 'property', String(data.id)] });
         // Invalidar detalle PÚBLICO (esta es la clave del bug)
         queryClient.invalidateQueries({ queryKey: ['property', String(data.id)] });
         queryClient.invalidateQueries({ queryKey: ['property', Number(data.id)] });
      }
      navigate('/admin/properties');
    },
    onError: (error: any) => {
      setUploadError(error.message || 'Error al actualizar la propiedad');
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
  onDropRejected: () => {
      setUploadError('Tipo de archivo inválido o tamaño excedido (máx 5MB)');
    },
  });

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleRemoveImage = (idx: number) => {
    const imgToRemove = images[idx];
    if (typeof imgToRemove !== 'string' && (imgToRemove as any).id) {
       setRemovedImageIds(prev => [...prev, Number((imgToRemove as any).id)]);
    }
    const newImages = images.filter((_, i) => i !== idx);
    setImages(newImages);
    setValue('images', newImages.filter(img => typeof img !== 'string') as PropertyFormData['images']);
  };

  const handleMoveImage = (from: number, to: number) => {
    const newImages = [...images];
    const [moved] = newImages.splice(from, 1);
    newImages.splice(to, 0, moved);
    setImages(newImages);
    setValue('images', newImages.filter(img => typeof img !== 'string') as PropertyFormData['images']);
  };

  const handleSetMainImage = (idx: number) => {
    const newImages = [...images];
    const [main] = newImages.splice(idx, 1);
    newImages.unshift(main);
    setImages(newImages);
    setValue('images', newImages.filter(img => typeof img !== 'string') as PropertyFormData['images']);
  };

  const onSubmit = async (data: PropertyFormData) => {
    try {
      // Construir feature_list antes de enviar (solo creación por ahora)
  const feature_list: string[] = Array.from(selectedFeatures);
  otrosFeatures.forEach(of => feature_list.push(`Otros Feature: ${of}`));
      (data as any).feature_list = feature_list;

      const orderedImages = images.map((img, idx) => {
        if (typeof img === 'string') {
          return { image: img, is_primary: idx === 0, order: idx };
        } else {
          return { ...img, is_primary: idx === 0, order: idx };
        }
      });
      data.images = orderedImages as any;

      if (id) {
        // En update, enviamos lista de IDs para borrar y nuevo orden
        const updatePayload = { ...data, removed_image_ids: removedImageIds };
        // Construir images_order solo con los IDs existentes (los nuevos van por upload aparte o logic de create)
        const imagesOrder = images
            .map(img => (typeof img !== 'string' ? (img as any).id : null))
            .filter(Boolean);
        (updatePayload as any).images_order = imagesOrder;

        await updateMutation.mutateAsync(updatePayload);
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
    <div className="mt-16 min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header con botón de regreso mejorado */}
        <div className="mb-8">
          <Button 
            variant="outline" 
            onClick={() => navigate('/admin/properties')}
            className="flex items-center gap-2 mb-4 px-4 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium rounded-lg shadow-sm transition-all duration-200"
          >
            <ArrowLeft size={18} />
            Volver a Propiedades
          </Button>
          
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 rounded-lg p-3">
                <Home size={24} className="text-blue-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {id ? 'Editar Propiedad' : 'Nueva Propiedad'}
                </h1>
                <p className="text-gray-600 mt-1">
                  {id ? 'Modifica los datos de tu propiedad' : 'Completa la información para agregar una nueva propiedad'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Alert de error */}
        {uploadError && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-400 rounded-lg">
            <div className="flex">
              <div className="ml-3">
                <p className="text-sm text-red-700">{uploadError}</p>
              </div>
            </div>
          </div>
        )}

        {/* Formulario principal */}
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <form onSubmit={handleSubmit(onSubmit)} className="divide-y divide-gray-200">
            
            {/* Sección: Información Básica */}
            <div className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-blue-100 rounded-lg p-2">
                  <Home size={20} className="text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Información Básica</h2>
                  <p className="text-sm text-gray-600">Datos principales de la propiedad</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Título de la Propiedad *
                  </label>
                  <input
                    type="text"
                    {...register('title', { required: 'El título es obligatorio' })}
                    placeholder="Hermoso departamento en Palermo"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                  {errors.title && (
                    <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo de Propiedad *
                  </label>
                  <select
                    {...register('property_type', { required: 'El tipo de propiedad es obligatorio' })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  >
                    <option value="">Selecciona un tipo</option>
                    <option value="temporal">⏰ Alquiler Temporal</option>
                    <option value="vacacional">🏖️ Alquiler Vacacional</option>
                    <option value="tradicional">🏠 Alquiler Tradicional</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    Temporal: estadías de mediano plazo • Vacacional: turismo / corta estadía • Tradicional: contrato estándar
                  </p>
                  {errors.property_type && (
                    <p className="mt-1 text-sm text-red-600">{errors.property_type.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <DollarSign size={16} className="inline mr-1" />
                    Precio *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    {...register('price', { 
                      required: 'El precio es obligatorio',
                      min: { value: 0, message: 'El precio debe ser positivo' }
                    })}
                    placeholder="150000"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                  <p className="text-xs text-gray-500 mt-1">Ingresa el precio en USD</p>
                  {errors.price && (
                    <p className="mt-1 text-sm text-red-600">{errors.price.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Estado de Publicación
                  </label>
                  <select
                    {...register('status')}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  >
                    <option value="draft">📝 Borrador</option>
                    <option value="published">✅ Publicado</option>
                    <option value="archived">📦 Archivado</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">Los borradores no son visibles al público</p>
                </div>
              </div>
            </div>

            {/* Sección: Ubicación */}
            <div className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-green-100 rounded-lg p-2">
                  <MapPin size={20} className="text-green-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Ubicación</h2>
                  <p className="text-sm text-gray-600">Dirección y localización de la propiedad</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Dirección *
                  </label>
                  <input
                    type="text"
                    {...register('address', { required: 'La dirección es obligatoria' })}
                    placeholder="Mansilla 2730"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                  <p className="text-xs text-gray-500 mt-1">Calle y número de la propiedad</p>
                  {errors.address && (
                    <p className="mt-1 text-sm text-red-600">{errors.address.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Barrio/Zona *
                  </label>
                  <select
                    {...register('city', { required: 'El barrio es obligatorio' })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  >
                    <option value="">Selecciona un barrio</option>
                    <option value="Recoleta">📍 Recoleta</option>
                    <option value="Palermo">🌳 Palermo</option>
                    <option value="Palermo soho">🍸 Palermo soho</option>
                    <option value="Palermo chico">🎨 Palermo chico</option>
                    <option value="Palermo viejo">🏘️ Palermo viejo</option>
                    <option value="Belgrano">🏛️ Belgrano</option>
                    <option value="Nuñez">⚽ Nuñez</option>
                    <option value="Cañitas">🍷 Cañitas</option>
                    <option value="Colegiales">🏘️ Colegiales</option>
                    <option value="San Telmo">🎭 San Telmo</option>
                    <option value="Microcentro">🏙️ Microcentro</option>
                    <option value="Caballito">🐴 Caballito</option>
                    <option value="Villa Crespo">🎪 Villa Crespo</option>
                    <option value="Chacarita">🌿 Chacarita</option>
                    <option value="Monserrat">🏛️ Monserrat</option>
                    <option value="San Nicolás">📍 San Nicolás</option>
                    <option value="San Cristobal">⛪ San Cristobal</option>
                    <option value="Puerto Madero">🌉 Puerto Madero</option>
                    <option value="Almagro">🏘️ Almagro</option>
                    <option value="San Isidro">🏛️ San Isidro</option>
                    <option value="Olivos">⛵ Olivos</option>
                  </select>
                  {errors.city && (
                    <p className="mt-1 text-sm text-red-600">{errors.city.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Provincia/Estado *
                  </label>
                  <input
                    type="text"
                    {...register('state', { required: 'La provincia es obligatoria' })}
                    placeholder="Buenos Aires"
                    defaultValue="Buenos Aires"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                  <p className="text-xs text-gray-500 mt-1">Provincia o estado donde se ubica</p>
                  {errors.state && (
                    <p className="mt-1 text-sm text-red-600">{errors.state.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Código Postal *
                  </label>
                  <input
                    type="text"
                    {...register('zip_code', { required: 'El código postal es obligatorio' })}
                    placeholder={selectedCity ? postalCodes[selectedCity as keyof typeof postalCodes] : '1000'}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {selectedCity ? `Código postal sugerido para ${selectedCity}` : 'Se completa automáticamente al seleccionar el barrio'}
                  </p>
                  {errors.zip_code && (
                    <p className="mt-1 text-sm text-red-600">{errors.zip_code.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Sección: Características */}
            <div className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-purple-100 rounded-lg p-2">
                  <Square size={20} className="text-purple-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Características</h2>
                  <p className="text-sm text-gray-600">Detalles técnicos de la propiedad</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Bed size={16} className="inline mr-1" />
                    Dormitorios *
                  </label>
                  <input
                    type="number"
                    {...register('bedrooms', { required: 'El número de dormitorios es obligatorio' })}
                    placeholder="3"
                    min="0"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                  {errors.bedrooms && (
                    <p className="mt-1 text-sm text-red-600">{errors.bedrooms.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Bath size={16} className="inline mr-1" />
                    Baños *
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    {...register('bathrooms', { required: 'El número de baños es obligatorio' })}
                    placeholder="2"
                    min="0"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                  <p className="text-xs text-gray-500 mt-1">Puedes usar decimales (ej. 2.5)</p>
                  {errors.bathrooms && (
                    <p className="mt-1 text-sm text-red-600">{errors.bathrooms.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Square size={16} className="inline mr-1" />
                    Metros Cuadrados *
                  </label>
                  <input
                    type="number"
                    {...register('square_feet', { required: 'Los metros cuadrados son obligatorios' })}
                    placeholder="85"
                    min="0"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                  <p className="text-xs text-gray-500 mt-1">Superficie total en m²</p>
                  {errors.square_feet && (
                    <p className="mt-1 text-sm text-red-600">{errors.square_feet.message}</p>
                  )}
                </div>

                <div className="md:col-span-2 lg:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Calendar size={16} className="inline mr-1" />
                    Año de Construcción
                  </label>
                  <input
                    type="number"
                    {...register('year_built')}
                    placeholder="2020"
                    min="1900"
                    max={new Date().getFullYear()}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                  <p className="text-xs text-gray-500 mt-1">Opcional</p>
                </div>
              </div>
            </div>

            {/* Sección: Features / Equipamiento */}
            <div className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-indigo-100 rounded-lg p-2">
                  <Square size={20} className="text-indigo-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Equipamiento / Features</h2>
                  <p className="text-sm text-gray-600">Selecciona los elementos disponibles en la propiedad</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {FEATURE_CATEGORIES.map(cat => (
                  <div key={cat.title} className="border rounded-lg p-4 bg-gray-50">
                    <h3 className="font-medium text-gray-800 mb-3 text-sm tracking-wide">{cat.title}</h3>
                    <div className="space-y-2">
                      {cat.items.map(item => {
                        const checked = selectedFeatures.has(item);
                        return (
                          <label key={item} className="flex items-start gap-2 cursor-pointer group">
                            <input
                              type="checkbox"
                              className="mt-0.5 h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                              checked={checked}
                              onChange={() => {
                                setSelectedFeatures(prev => {
                                  const next = new Set(prev);
                                  if (next.has(item)) next.delete(item); else next.add(item);
                                  return next;
                                });
                              }}
                              disabled={!!id} // deshabilitar edición hasta que backend soporte update
                            />
                            <span className="text-sm text-gray-700 group-hover:text-gray-900">{item}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                ))}
                {/* Otros Features (uno por uno) */}
                <div className="border rounded-lg p-4 bg-gray-50 flex flex-col">
                  <h3 className="font-medium text-gray-800 mb-3 text-sm tracking-wide">Otros Features</h3>
                  <div className="flex gap-2 mb-3">
                    <input
                      type="text"
                      value={otrosInput}
                      onChange={e => setOtrosInput(e.target.value)}
                      placeholder="Ej: Jacuzzi"
                      className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      disabled={!!id}
                      onKeyDown={e => {
                        if (e.key === 'Enter' && otrosInput.trim()) {
                          e.preventDefault();
                          setOtrosFeatures(prev => prev.includes(otrosInput.trim()) ? prev : [...prev, otrosInput.trim()]);
                          setOtrosInput('');
                        }
                      }}
                    />
                    <button
                      type="button"
                      disabled={!otrosInput.trim() || !!id}
                      onClick={() => {
                        if (!otrosInput.trim()) return;
                        setOtrosFeatures(prev => prev.includes(otrosInput.trim()) ? prev : [...prev, otrosInput.trim()]);
                        setOtrosInput('');
                      }}
                      className="px-3 py-2 text-sm bg-indigo-600 disabled:bg-gray-300 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                      Agregar
                    </button>
                  </div>
                  {otrosFeatures.length > 0 && (
                    <ul className="space-y-2 mb-2 max-h-40 overflow-y-auto pr-1">
                      {otrosFeatures.map(of => (
                        <li key={of} className="flex items-center justify-between bg-white border border-gray-200 rounded-md px-3 py-1 text-sm">
                          <span className="text-gray-700 truncate">{of}</span>
                          {!id && (
                            <button
                              type="button"
                              onClick={() => setOtrosFeatures(prev => prev.filter(x => x !== of))}
                              className="ml-2 text-red-500 hover:text-red-700 text-xs font-medium"
                            >
                              Quitar
                            </button>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                  <p className="mt-1 text-xs text-gray-500">Presiona Enter o "Agregar". Se guardan como "Otros Feature:"</p>
                </div>
              </div>
              {id && (
                <p className="mt-4 text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded px-3 py-2">Edición de features existente no soportada aún. (Solo lectura)</p>
              )}
            </div>

            {/* Sección: Descripción */}
            <div className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-orange-100 rounded-lg p-2">
                  <Upload size={20} className="text-orange-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Descripción</h2>
                  <p className="text-sm text-gray-600">Información adicional sobre la propiedad</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descripción Detallada
                </label>
                <textarea
                  {...register('description')}
                  rows={4}
                  placeholder="Describe las características destacadas, ubicación, amenities y cualquier información relevante para los potenciales compradores..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
                <p className="text-xs text-gray-500 mt-1">Esta descripción aparecerá en la página de detalle de la propiedad</p>
              </div>
            </div>

            {/* Sección: Imágenes */}
            <div className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-pink-100 rounded-lg p-2">
                  <Upload size={20} className="text-pink-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Galería de Imágenes</h2>
                  <p className="text-sm text-gray-600">Sube hasta 6 imágenes de la propiedad</p>
                </div>
              </div>

              <div
                {...getRootProps()}
                className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 hover:bg-blue-50 transition-all cursor-pointer"
              >
                <input {...getInputProps()} />
                <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <Upload size={24} className="text-blue-600" />
                </div>
                <p className="text-lg font-medium text-gray-700 mb-2">
                  Arrastra y suelta imágenes aquí
                </p>
                <p className="text-gray-500 mb-4">
                  O haz clic para seleccionar archivos
                </p>
                <div className="flex justify-center gap-4 text-sm text-gray-500">
                  <span>📸 JPEG, PNG, WEBP</span>
                  <span>📏 Máximo 5MB</span>
                  <span>🖼️ Hasta 6 imágenes</span>
                </div>
              </div>

              {uploadedFiles.length > 0 && (
                <div className="mt-6">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Archivos pendientes:</h4>
                  <div className="space-y-2">
                    {uploadedFiles.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between bg-blue-50 p-3 rounded-lg border border-blue-200"
                      >
                        <div className="flex items-center gap-3">
                          <div className="bg-blue-100 rounded p-1">
                            <Upload size={16} className="text-blue-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-700">{file.name}</p>
                            <p className="text-xs text-gray-500">
                              {(file.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFile(index)}
                          className="text-red-500 hover:text-red-700 p-1"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Galería de imágenes ya subidas */}
              {images && images.length > 0 && (
                <div className="mt-8">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-sm font-medium text-gray-700">Imágenes añadidas ({images.length})</h4>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {images.map((img, idx) => {
                      const imgKey = (typeof img === 'string' ? img : (img as any).id) || `temp-${idx}`;
                      const imgUrl = typeof img === 'string' ? img : ((img as any).url || (img as any).image);
                      const isBroken = !imgUrl;

                      return (
                      <div
                        key={imgKey}
                        className={`relative border-2 rounded-xl overflow-hidden group transition-all ${
                          idx === 0 ? 'ring-2 ring-blue-500 border-blue-500' : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                         {/* Fallback para imagen rota o vacía */}
                         {imgUrl ? (
                            <img
                              src={imgUrl}
                              alt={`Imagen ${idx + 1}`}
                              className="w-full h-32 object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x300?text=No+Image';
                              }}
                            />
                         ) : (
                            <div className="w-full h-32 bg-gray-200 flex items-center justify-center text-gray-400 text-xs">
                                Sin imagen
                            </div>
                         )}
                        
                        {/* Badge de imagen principal */}
                        {idx === 0 && (
                          <div className="absolute top-2 left-2 bg-blue-500 text-white px-2 py-1 rounded text-xs font-bold shadow z-10">
                            Principal
                          </div>
                        )}
                        
                        {/* Botones de control */}
                        <div className={`absolute inset-0 bg-black/50 flex items-center justify-center gap-2 transition-opacity ${isBroken ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                          {/* Mover izquierda */}
                          {idx > 0 && (
                            <button
                              type="button"
                              onClick={() => handleMoveImage(idx, idx - 1)}
                              className="bg-white/90 hover:bg-white rounded-full p-2 text-gray-700 transition"
                              title="Mover a la izquierda"
                            >
                              ←
                            </button>
                          )}
                          
                          {/* Marcar como principal */}
                          {idx !== 0 && (
                            <button
                              type="button"
                              onClick={() => handleSetMainImage(idx)}
                              className="bg-blue-500 hover:bg-blue-600 text-white rounded-full px-3 py-2 text-xs font-bold transition"
                              title="Marcar como principal"
                            >
                              Principal
                            </button>
                          )}
                          
                          {/* Mover derecha */}
                          {idx < images.length - 1 && idx < 5 && (
                            <button
                              type="button"
                              onClick={() => handleMoveImage(idx, idx + 1)}
                              className="bg-white/90 hover:bg-white rounded-full p-2 text-gray-700 transition"
                              title="Mover a la derecha"
                            >
                              →
                            </button>
                          )}
                          
                          {/* Eliminar (Siempre disponible) */}
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(idx)}
                            className="bg-red-500 hover:bg-red-600 text-white rounded-full p-2 transition"
                            title="Eliminar imagen"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      </div>
                    );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Botones de acción */}
            <div className="p-6 bg-gray-50">
              <div className="flex justify-end gap-4">
                <Button
                  variant="outline"
                  onClick={() => navigate('/admin/properties')}
                  disabled={isSubmitting}
                  className="px-6 py-3"
                >
                  Cancelar
                </Button>
                <Button
                  variant="primary"
                  type="submit"
                  disabled={isSubmitting}
                  className="px-8 py-3"
                >
                  {isSubmitting ? (
                    <div className="flex items-center gap-2">
                      <Loader2 size={20} className="animate-spin" />
                      {isUploading ? 'Subiendo imágenes...' : 'Guardando...'}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Home size={20} />
                      {id ? 'Actualizar Propiedad' : 'Crear Propiedad'}
                    </div>
                  )}
                </Button>
              </div>
            </div>
          </form>
        </div>

        {/* Calendario (solo en modo edición) */}
        {property && (
          <div className="mt-8">
            <Suspense fallback={<div>Cargando calendario…</div>}>
              <PropertyCalendar property={property} />
            </Suspense>
          </div>
        )}
      </div>
    </div>
  );
};

export default PropertyFormPage;