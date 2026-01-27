import api from './api';
import { logger } from './logger';

export type PresignPayload = {
  property_id: number | string;

  filename: string;
  content_type: string;
};

export type PresignResult = {
  upload_url: string;
  s3_key: string;
  headers: Record<string, string>;
};

export async function presignUpload(payload: PresignPayload): Promise<PresignResult> {
  // console.group('S3 upload');
  logger.debug('presign.request', payload);
  const { data } = await api.post<PresignResult>('/uploads/presign/', payload);
  logger.debug('presign.response', data);
  return data;
}

export async function putToS3(url: string, file: File, headers: Record<string, string>, onProgress?: (p: number) => void): Promise<number> {
  logger.debug('put.headers', headers);
  try {
    const axios = (await import('axios')).default;
    const res = await axios.put(url, file, {
      headers,
      withCredentials: false, // never send cookies to S3
      onUploadProgress: (evt) => {
        if (evt.total) {
          const percent = Math.round((evt.loaded * 100) / evt.total);
          onProgress?.(percent);
        }
      },
      // avoid axios baseURL interfering
      transformRequest: [(data) => data],
    });
    logger.debug('put.status', res.status);
    return res.status;
  } catch (err: any) {
    logger.error('put.error', err?.response || err);
    // helpful hint for expired/signature mismatch
    if (err?.response?.status === 403) {
      logger.warn('S3 403 (SignatureDoesNotMatch/Expired). Try requesting a new presigned URL and retry.');
    }
    throw err;
  } finally {
    console.groupEnd();
  }
}

export async function registerImage(propertyId: number | string, payload: { s3_key: string; is_primary?: boolean; order?: number }) {
  const { data } = await api.post(`/properties/${propertyId}/images/`, payload);
  return data;
}
