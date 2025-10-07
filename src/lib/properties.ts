import api from './api';

export type PresignFile = { name: string; type: string };
export type PresignUpload = { key: string; uploadUrl: string; contentType: string };

export async function presignImages(files: File[]): Promise<PresignUpload[]> {
  const payload = { files: files.map(f => ({ name: f.name, type: f.type })) };
  const { data } = await api.post('/properties/presign_images/', payload);
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
  const { data } = await api.post('/properties/', input);
  return data;
}

export async function attachImages(propertyId: number, keys: string[]) {
  const { data } = await api.post(`/properties/${propertyId}/attach_images/`, { keys });
  return data;
}

export async function listProperties() {
  const { data } = await api.get('/properties/');
  return data.results ?? data;
}
