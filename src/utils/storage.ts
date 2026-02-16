import { supabase } from '../lib/supabase';

/**
 * Deletes a file from Supabase storage given its public URL.
 * URL format: https://[project].supabase.co/storage/v1/object/public/[bucket]/[path]
 */
export async function deleteFileFromStorage(url: string) {
    if (!url || !url.includes('/storage/v1/object/public/')) return;

    try {
        // Extract bucket and path from URL
        const parts = url.split('/storage/v1/object/public/');
        if (parts.length < 2) return;

        const pathParts = parts[1].split('/');
        const bucket = pathParts[0];
        const filePath = pathParts.slice(1).join('/');

        const { error } = await supabase.storage.from(bucket).remove([filePath]);
        if (error) {
            console.error('Error deleting file from storage:', error);
        }
    } catch (error) {
        console.error('Failed to parse and delete file from storage:', error);
    }
}
