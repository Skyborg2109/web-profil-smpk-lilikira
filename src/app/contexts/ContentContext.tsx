import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { supabase } from '../../lib/supabase';

export interface ContentSection {
    id: string; // This corresponds to section_id in DB
    title: string;
    content: string;
    last_updated: string;
}

interface ContentContextType {
    contentSections: ContentSection[];
    loading: boolean;
    refreshContent: () => Promise<void>;
    updateContent: (section_id: string, content: string, title?: string) => Promise<void>;
}

const ContentContext = createContext<ContentContextType | undefined>(undefined);

export function ContentProvider({ children }: { children: ReactNode }) {
    const [contentSections, setContentSections] = useState<ContentSection[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchContent = useCallback(async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('site_content')
                .select('*')
                .order('section_id', { ascending: true });

            if (error) throw error;

            // Map section_id from DB to id for frontend consistency if needed
            const mappedData = (data || []).map(item => ({
                id: item.section_id,
                title: item.title,
                content: item.content,
                last_updated: item.last_updated
            }));

            setContentSections(mappedData);
        } catch (error) {
            console.error('Error fetching site content:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchContent();
    }, [fetchContent]);

    const updateContent = async (section_id: string, content: string, title?: string) => {
        try {
            const updates: any = {
                section_id,
                content,
                last_updated: new Date().toISOString()
            };

            // If title is provided, include it. This helps with new sections like 'fasilitas'.
            if (title) {
                updates.title = title;
            } else {
                // If checking existing, maybe find it? 
                // For simplified 'upsert', we need all non-nullable fields if we are inserting.
                // But if we are updating existing standard sections (visi-misi), title is already there.
                // However, 'upsert' might need title if it's an INSERT. 
                // Let's assume standard sections rely on 'update' logic if we want to be safe, or we fetching title.
                // Actually, let's just use upsert. If it's an existing row and we don't pass title, 
                // Supabase upsert (if matched) usually updates the provided columns.
                // But if it's a NEW row (INSERT), and title is not provided, it fails if title is Not Null.
            }

            const { error } = await supabase
                .from('site_content')
                .upsert(updates, { onConflict: 'section_id' });

            if (error) throw error;
            await fetchContent();
        } catch (error) {
            console.error('Error updating site content:', error);
            throw error;
        }
    };

    return (
        <ContentContext.Provider value={{
            contentSections,
            loading,
            refreshContent: fetchContent,
            updateContent
        }}>
            {children}
        </ContentContext.Provider>
    );
}

export function useContent() {
    const context = useContext(ContentContext);
    if (!context) {
        throw new Error('useContent must be used within ContentProvider');
    }
    return context;
}
