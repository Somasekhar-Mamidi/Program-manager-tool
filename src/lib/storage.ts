import { supabase } from './supabase';

export const storage = {
    /**
     * Uploads a file to the 'msc-assets' bucket.
     * @param file The file object to upload.
     * @param path The optional path/folder within the bucket (default: 'uploads').
     * @returns The public URL of the uploaded file.
     */
    uploadFile: async (file: File, path: string = 'uploads'): Promise<string | null> => {
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${path}/${crypto.randomUUID()}.${fileExt}`;

            const { data, error } = await supabase.storage
                .from('msc-assets')
                .upload(fileName, file, {
                    cacheControl: '3600',
                    upsert: false
                });

            if (error) {
                console.error("Storage upload failed:", error);
                throw error;
            }

            const { data: { publicUrl } } = supabase.storage
                .from('msc-assets')
                .getPublicUrl(fileName);

            return publicUrl;
        } catch (e) {
            console.error("Upload error:", e);
            return null;
        }
    },

    /**
     * Returns the public URL for a given path.
     */
    getPublicUrl: (path: string) => {
        const { data } = supabase.storage
            .from('msc-assets')
            .getPublicUrl(path);
        return data.publicUrl;
    }
}
