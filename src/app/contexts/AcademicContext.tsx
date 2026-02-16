import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { supabase } from '../../lib/supabase';

export interface AcademicSection {
    id: number;
    type: string;
    title: string;
    content: string;
    last_updated_by?: string;
    created_at: string;
}

interface AcademicContextType {
    sections: AcademicSection[];
    loading: boolean;
    refreshSections: () => Promise<void>;
}

const AcademicContext = createContext<AcademicContextType | undefined>(undefined);

export function AcademicProvider({ children }: { children: ReactNode }) {
    const [sections, setSections] = useState<AcademicSection[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchSections = useCallback(async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('academic_sections')
                .select('*')
                .order('id', { ascending: true });

            if (error) throw error;
            setSections(data || []);
        } catch (error) {
            console.error('Error fetching academic sections:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchSections();
    }, [fetchSections]);

    return (
        <AcademicContext.Provider value={{
            sections,
            loading,
            refreshSections: fetchSections
        }}>
            {children}
        </AcademicContext.Provider>
    );
}

export function useAcademic() {
    const context = useContext(AcademicContext);
    if (!context) {
        throw new Error('useAcademic must be used within AcademicProvider');
    }
    return context;
}
