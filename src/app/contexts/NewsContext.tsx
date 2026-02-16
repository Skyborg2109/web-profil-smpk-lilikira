import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { supabase } from '../../lib/supabase';

export interface NewsArticle {
    id: number;
    title: string;
    date: string;
    author: string;
    category: string;
    image: string;
    images?: string[];
    excerpt: string;
    content: string;
    published: boolean;
    views: number;
    created_at: string;
}

interface NewsContextType {
    articles: NewsArticle[];
    loading: boolean;
    refreshArticles: () => Promise<void>;
    addArticle: (article: Omit<NewsArticle, 'id' | 'views' | 'created_at'>) => Promise<void>;
    updateArticle: (id: number, article: Partial<NewsArticle>) => Promise<void>;
    deleteArticle: (id: number) => Promise<void>;
    getArticleById: (id: number) => NewsArticle | undefined;
    incrementViews: (id: number) => Promise<void>;
}

const NewsContext = createContext<NewsContextType | undefined>(undefined);

export function NewsProvider({ children }: { children: ReactNode }) {
    const [articles, setArticles] = useState<NewsArticle[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchArticles = useCallback(async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('news')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setArticles(data || []);
        } catch (error) {
            console.error('Error fetching news:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchArticles();
    }, [fetchArticles]);

    const addArticle = async (article: Omit<NewsArticle, 'id' | 'views' | 'created_at'>) => {
        try {
            const { error } = await supabase
                .from('news')
                .insert([article]);

            if (error) throw error;
            await fetchArticles();
        } catch (error) {
            console.error('Error adding article:', error);
            throw error;
        }
    };

    const updateArticle = async (id: number, updates: Partial<NewsArticle>) => {
        try {
            const { error } = await supabase
                .from('news')
                .update(updates)
                .eq('id', id);

            if (error) throw error;
            await fetchArticles();
        } catch (error) {
            console.error('Error updating article:', error);
            throw error;
        }
    };

    const deleteArticle = async (id: number) => {
        try {
            const { error } = await supabase
                .from('news')
                .delete()
                .eq('id', id);

            if (error) throw error;
            await fetchArticles();
        } catch (error) {
            console.error('Error deleting article:', error);
            throw error;
        }
    };

    const getArticleById = (id: number) => {
        return articles.find((article) => article.id === id);
    };

    const incrementViews = async (id: number) => {
        const article = articles.find(a => a.id === id);
        if (article) {
            try {
                const { error } = await supabase
                    .from('news')
                    .update({ views: (article.views || 0) + 1 })
                    .eq('id', id);

                if (error) throw error;
                // Update local state for immediate feedback
                setArticles(prev => prev.map(a => a.id === id ? { ...a, views: (a.views || 0) + 1 } : a));
            } catch (error) {
                console.error('Error incrementing views:', error);
            }
        }
    };

    return (
        <NewsContext.Provider
            value={{
                articles,
                loading,
                refreshArticles: fetchArticles,
                addArticle,
                updateArticle,
                deleteArticle,
                getArticleById,
                incrementViews,
            }}
        >
            {children}
        </NewsContext.Provider>
    );
}

export function useNews() {
    const context = useContext(NewsContext);
    if (context === undefined) {
        throw new Error('useNews must be used within a NewsProvider');
    }
    return context;
}
