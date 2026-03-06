import { supabase } from './supabase';

const BUCKET_NAME = 'attachments';

/**
 * Upload a file to Supabase Storage and return the public URL.
 * Falls back to base64 data URL if the upload fails (offline resilience).
 */
export async function uploadFileToStorage(file: File | Blob, fileName?: string): Promise<string> {
    const name = fileName || (file instanceof File ? file.name : `file-${Date.now()}`);
    const ext = name.split('.').pop() || 'bin';
    const uniquePath = `${crypto.randomUUID()}.${ext}`;

    try {
        const { data, error } = await supabase.storage
            .from(BUCKET_NAME)
            .upload(uniquePath, file, {
                cacheControl: '31536000', // 1 year cache
                upsert: false,
            });

        if (error) {
            console.error('Storage upload error:', error);
            return fallbackToBase64(file);
        }

        // Get public URL
        const { data: urlData } = supabase.storage
            .from(BUCKET_NAME)
            .getPublicUrl(data.path);

        return urlData.publicUrl;
    } catch (e) {
        console.error('Storage upload failed, falling back to base64:', e);
        return fallbackToBase64(file);
    }
}

/**
 * Delete a file from Supabase Storage by its public URL.
 */
export async function deleteFileFromStorage(publicUrl: string): Promise<void> {
    // Only process Supabase Storage URLs (skip base64 or external URLs)
    if (!publicUrl.includes('/storage/v1/object/public/')) return;

    try {
        // Extract path from URL: .../storage/v1/object/public/attachments/uuid.ext
        const parts = publicUrl.split(`/storage/v1/object/public/${BUCKET_NAME}/`);
        if (parts.length < 2) return;

        const filePath = parts[1];
        const { error } = await supabase.storage
            .from(BUCKET_NAME)
            .remove([filePath]);

        if (error) {
            console.error('Storage delete error:', error);
        }
    } catch (e) {
        console.error('Storage delete failed:', e);
    }
}

/**
 * Fallback: convert file/blob to base64 data URL (for offline or when storage fails).
 */
function fallbackToBase64(file: File | Blob): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = () => reject(new Error('Failed to read file as base64'));
        reader.readAsDataURL(file);
    });
}
