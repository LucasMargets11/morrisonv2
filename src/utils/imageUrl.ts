function normalizeBase(base?: string | null): string | null {
  if (!base) return null;
  let b = base.trim();
  if (!b) return null;
  if (!/^https?:\/\//i.test(b)) {
    b = `https://${b}`;
  }
  // remove trailing slash
  b = b.replace(/\/+$/, '');
  return b;
}

function encodePathPreservingSlashes(path: string): string {
  // encode only segments to avoid encoding slashes
  return path
    .split('/')
    .map(seg => encodeURIComponent(seg))
    .join('/');
}

export function buildPublicUrl(base: string, key: string): string {
  const b = normalizeBase(base);
  const p = key.replace(/^\/+/, '');
  if (!b) return `/${encodePathPreservingSlashes(p)}`;
  return `${b}/${encodePathPreservingSlashes(p)}`;
}

export function resolvePropertyImageUrl(
  img: { image?: string | null; s3_key?: string | null; url?: string | null } | null | undefined,
  opts?: { preferSigned?: boolean }
): string | null {
  if (!img) return null;
  const preferSigned = !!opts?.preferSigned;
  const rawUrl = (img as any).url as string | null | undefined;
  const s3Key = (img as any).s3_key as string | null | undefined;
  const image = (img as any).image as string | null | undefined;

  if (preferSigned && rawUrl) return rawUrl;
  if (rawUrl) return rawUrl;

  if (s3Key) {
    const base = (import.meta as any).env?.VITE_S3_PUBLIC_BASE as string | undefined;
    if (!base) {
      console.warn('[resolvePropertyImageUrl] VITE_S3_PUBLIC_BASE no definido');
      return null;
    }
    return buildPublicUrl(base, s3Key);
  }

  if (image) {
    // MEDIA base can be host or host/media
    let base = (import.meta as any).env?.VITE_MEDIA_BASE as string | undefined;
    if (!base) {
      console.warn('[resolvePropertyImageUrl] VITE_MEDIA_BASE no definido');
      return null;
    }
    let b = normalizeBase(base);
    if (!b) return null;
    // if base doesn't end with /media and image doesn't start with media, add it
    const needsMedia = !/\/media\/?$/i.test(b) && !/^media\//i.test(image);
    if (needsMedia) b = `${b}/media`;
    return `${b}/${encodePathPreservingSlashes(image.replace(/^\/+/, ''))}`;
  }

  return null;
}
