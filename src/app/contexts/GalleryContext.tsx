import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { supabase } from '../../lib/supabase';

export interface GalleryItem {
    id: number;
    title: string;
    category: string;
    image: string;
    created_at: string;
}

interface GalleryContextType {
    galleryItems: GalleryItem[];
    loading: boolean;
    refreshGallery: () => Promise<void>;
    addGalleryItem: (item: Omit<GalleryItem, 'id' | 'created_at'>) => Promise<void>;
    updateGalleryItem: (id: number, updates: Partial<GalleryItem>) => Promise<void>;
    deleteGalleryItem: (id: number) => Promise<void>;
}

const GalleryContext = createContext<GalleryContextType | undefined>(undefined);

export function GalleryProvider({ children }: { children: ReactNode }) {
    const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchGallery = useCallback(async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('gallery')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setGalleryItems(data || []);
        } catch (error) {
            console.error('Error fetching gallery:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchGallery();
    }, [fetchGallery]);

    const addGalleryItem = async (item: Omit<GalleryItem, 'id' | 'created_at'>) => {
        try {
            const { error } = await supabase
                .from('gallery')
                .insert([item]);

            if (error) throw error;
            await fetchGallery();
        } catch (error) {
            console.error('Error adding gallery item:', error);
            throw error;
        }
    };

    const updateGalleryItem = async (id: number, updates: Partial<GalleryItem>) => {
        try {
            const { error } = await supabase
                .from('gallery')
                .update(updates)
                .eq('id', id);

            if (error) throw error;
            await fetchGallery();
        } catch (error) {
            console.error('Error updating gallery item:', error);
            throw error;
        }
    };

    const deleteGalleryItem = async (id: number) => {
        try {
            const { error } = await supabase
                .from('gallery')
                .delete()
                .eq('id', id);

            if (error) throw error;
            await fetchGallery();
        } catch (error) {
            console.error('Error deleting gallery item:', error);
            throw error;
        }
    };

    return (
        <GalleryContext.Provider
            value={{
                galleryItems,
                loading,
                refreshGallery: fetchGallery,
                addGalleryItem,
                updateGalleryItem,
                deleteGalleryItem
            }}
        >
            {children}
        </GalleryContext.Provider>
    );
}

export function useGallery() {
    const context = useContext(GalleryContext);
    if (!context) {
        throw new Error('useGallery must be used within GalleryProvider');
    }
    return context;
}
