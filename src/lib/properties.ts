import api from './api';

export type PresignFile = { name: string; type: string };
export type PresignUpload = { key: string; uploadUrl: string; contentType: string };

export async function presignImages(files: File[]): Promise<PresignUpload[]> {
  const payload = { files: files.map(f => ({ name: f.name, type: f.type })) };
  const { data } = await api.post('properties/presign_images/', payload);
  return data.uploads;
}

export async function uploadToS3(uploads: PresignUpload[], files: File[]) {
  await Promise.all(uploads.map((u, i) =>
    fetch(u.uploadUrl, {
      method: 'PUT',
      headers: { 'Content-Type': u.contentType },
      body: files[i],
    }).then(r => { if (!r.ok) throw new Error(`S3 upload failed: ${r.status}`); })
  ));
  return uploads.map(u => u.key);
}

export async function createProperty(input: any & { image_keys?: string[] }) {
  const { data } = await api.post('properties/', input);
  return data;
}

export async function attachImages(propertyId: number, keys: string[]) {
  const { data } = await api.post(`properties/${propertyId}/attach_images/`, { keys });
  return data;
}

export async function listProperties() {
  const { data } = await api.get('properties/');
  return data.results ?? data;
}

// Normalize backend payload to frontend Property shape
export function normalizeProperty(data: any) {
  return {
    ...data,
    id: String(data.id),
    squareFeet: data.square_feet ?? data.squareFeet,
    yearBuilt: data.year_built ?? data.yearBuilt,
    zipCode: data.zip_code ?? data.zipCode,
    features: Array.isArray(data.features)
      ? data.features.map((f: any) => (typeof f === 'string' ? f : f.name))
      : [],
    images: Array.isArray(data.images)
      ? data.images.map((img: any) => {
          if (typeof img === 'string') return img;
          if (img.derived480Url || img.derived768Url) {
            return {
              ...img,
              url: img.url || img.image,
              originalUrl: img.url || img.image
            };
          }
          return img.url || img.image;
        })
      : [],
  };
}

export async function fetchPropertyById(id: string | number) {
  const { data } = await api.get(`properties/${id}/`);
  return normalizeProperty(data);
}
