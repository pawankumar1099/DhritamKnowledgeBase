'use client';

export interface CloudinaryUploadResult {
  secureUrl: string;
  publicId: string;
  format: string;
  bytes: number;
  originalFilename: string;
}

export function getCloudinaryConfig(): { cloudName: string; uploadPreset: string } | null {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  if (cloudName && uploadPreset) {
    return { cloudName, uploadPreset };
  }
  return null;
}

export function isCloudinaryConfigured(): boolean {
  return !!getCloudinaryConfig();
}

/**
 * Uploads any file (PDF, image, document, audio, video, raw file) to Cloudinary
 * using an unsigned upload preset. No credit card or server-side secret required.
 */
export async function uploadFileToCloudinary(
  file: File,
  folder = 'dhritam_kb'
): Promise<string | null> {
  const config = getCloudinaryConfig();
  if (!config) return null;

  const { cloudName, uploadPreset } = config;

  // Cloudinary /auto/upload handles images, videos, audio, and pdfs
  const endpoints = [
    `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`,
    `https://api.cloudinary.com/v1_1/${cloudName}/raw/upload`,
  ];

  for (const endpoint of endpoints) {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', uploadPreset);
      formData.append('folder', folder);

      const res = await fetch(endpoint, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.warn(`Cloudinary upload attempt failed at ${endpoint}:`, errorText);
        continue;
      }

      const data = await res.json();
      if (data.secure_url) {
        return data.secure_url;
      }
    } catch (err) {
      console.warn(`Cloudinary upload exception at ${endpoint}:`, err);
    }
  }

  return null;
}
