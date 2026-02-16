import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

export interface Achievement {
    id: number;
    name: string;
    class_name: string;
    achievement: string;
    level: string;
    year: string;
    category: 'akademik' | 'non-akademik';
    type: 'student' | 'teacher';
    image?: string;
    created_at: string;
}

interface AchievementContextType {
    achievements: Achievement[];
    loading: boolean;
    addAchievement: (achievement: Omit<Achievement, 'id' | 'created_at'>) => Promise<void>;
    updateAchievement: (id: number, updates: Partial<Achievement>) => Promise<void>;
    deleteAchievement: (id: number) => Promise<void>;
    refreshAchievements: () => Promise<void>;
}

const AchievementContext = createContext<AchievementContextType | undefined>(undefined);

export function AchievementProvider({ children }: { children: React.ReactNode }) {
    const [achievements, setAchievements] = useState<Achievement[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchAchievements = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('achievements')
                .select('*')
                .order('year', { ascending: false });

            if (error) throw error;
            setAchievements(data || []);
        } catch (error) {
            console.error('Error fetching achievements:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAchievements();
    }, []);

    const addAchievement = async (achievement: Omit<Achievement, 'id' | 'created_at'>) => {
        try {
            const { error } = await supabase
                .from('achievements')
                .insert([achievement]);
            if (error) throw error;
            await fetchAchievements();
        } catch (error) {
            console.error('Error adding achievement:', error);
            throw error;
        }
    };

    const updateAchievement = async (id: number, updates: Partial<Achievement>) => {
        try {
            const { error } = await supabase
                .from('achievements')
                .update(updates)
                .eq('id', id);
            if (error) throw error;
            await fetchAchievements();
        } catch (error) {
            console.error('Error updating achievement:', error);
            throw error;
        }
    };

    const deleteAchievement = async (id: number) => {
        try {
            const { error } = await supabase
                .from('achievements')
                .delete()
                .eq('id', id);
            if (error) throw error;
            await fetchAchievements();
        } catch (error) {
            console.error('Error deleting achievement:', error);
            throw error;
        }
    };

    return (
        <AchievementContext.Provider value={{
            achievements,
            loading,
            addAchievement,
            updateAchievement,
            deleteAchievement,
            refreshAchievements: fetchAchievements
        }}>
            {children}
        </AchievementContext.Provider>
    );
}

export function useAchievements() {
    const context = useContext(AchievementContext);
    if (context === undefined) {
        throw new Error('useAchievements must be used within an AchievementProvider');
    }
    return context;
}
