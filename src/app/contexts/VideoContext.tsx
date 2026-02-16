import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { supabase } from '../../lib/supabase';

export interface VideoItem {
    id: number;
    title: string;
    description: string;
    video_url: string;
    thumbnail_url?: string;
    created_at: string;
}

interface VideoContextType {
    videos: VideoItem[];
    loading: boolean;
    refreshVideos: () => Promise<void>;
    addVideo: (video: Omit<VideoItem, 'id' | 'created_at'>) => Promise<void>;
    updateVideo: (id: number, updates: Partial<VideoItem>) => Promise<void>;
    deleteVideo: (id: number) => Promise<void>;
}

const VideoContext = createContext<VideoContextType | undefined>(undefined);

export function VideoProvider({ children }: { children: ReactNode }) {
    const [videos, setVideos] = useState<VideoItem[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchVideos = useCallback(async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('videos')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setVideos(data || []);
        } catch (error) {
            console.error('Error fetching videos:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchVideos();
    }, [fetchVideos]);

    const addVideo = async (video: Omit<VideoItem, 'id' | 'created_at'>) => {
        try {
            const { error } = await supabase
                .from('videos')
                .insert([video]);

            if (error) throw error;
            await fetchVideos();
        } catch (error) {
            console.error('Error adding video:', error);
            throw error;
        }
    };

    const updateVideo = async (id: number, updates: Partial<VideoItem>) => {
        try {
            const { error } = await supabase
                .from('videos')
                .update(updates)
                .eq('id', id);

            if (error) throw error;
            await fetchVideos();
        } catch (error) {
            console.error('Error updating video:', error);
            throw error;
        }
    };

    const deleteVideo = async (id: number) => {
        try {
            const { error } = await supabase
                .from('videos')
                .delete()
                .eq('id', id);

            if (error) throw error;
            await fetchVideos();
        } catch (error) {
            console.error('Error deleting video:', error);
            throw error;
        }
    };

    return (
        <VideoContext.Provider
            value={{
                videos,
                loading,
                refreshVideos: fetchVideos,
                addVideo,
                updateVideo,
                deleteVideo
            }}
        >
            {children}
        </VideoContext.Provider>
    );
}

export function useVideos() {
    const context = useContext(VideoContext);
    if (!context) {
        throw new Error('useVideos must be used within VideoProvider');
    }
    return context;
}
