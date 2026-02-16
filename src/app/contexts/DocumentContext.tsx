import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

export interface Document {
    id: number;
    title: string;
    category: string;
    file_url: string;
    file_size?: string;
    file_type?: string;
    created_at: string;
}

interface DocumentContextType {
    documents: Document[];
    loading: boolean;
    addDocument: (document: Omit<Document, 'id' | 'created_at'>) => Promise<void>;
    deleteDocument: (id: number, filePath: string) => Promise<void>;
    refreshDocuments: () => Promise<void>;
}

const DocumentContext = createContext<DocumentContextType | undefined>(undefined);

export function DocumentProvider({ children }: { children: React.ReactNode }) {
    const [documents, setDocuments] = useState<Document[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchDocuments = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('documents')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setDocuments(data || []);
        } catch (error) {
            console.error('Error fetching documents:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDocuments();
    }, []);

    const addDocument = async (document: Omit<Document, 'id' | 'created_at'>) => {
        try {
            const { error } = await supabase
                .from('documents')
                .insert([document]);
            if (error) throw error;
            await fetchDocuments();
        } catch (error) {
            console.error('Error adding document:', error);
            throw error;
        }
    };

    const deleteDocument = async (id: number, filePath: string) => {
        try {
            // Delete record from DB
            const { error: dbError } = await supabase
                .from('documents')
                .delete()
                .eq('id', id);

            if (dbError) throw dbError;

            // Delete file from Storage if it exists and is in our bucket
            if (filePath.includes('documents/')) {
                const storagePath = filePath.split('documents/')[1];
                await supabase.storage
                    .from('files')
                    .remove([`documents/${storagePath}`]);
            }

            await fetchDocuments();
        } catch (error) {
            console.error('Error deleting document:', error);
            throw error;
        }
    };

    return (
        <DocumentContext.Provider value={{
            documents,
            loading,
            addDocument,
            deleteDocument,
            refreshDocuments: fetchDocuments
        }}>
            {children}
        </DocumentContext.Provider>
    );
}

export function useDocuments() {
    const context = useContext(DocumentContext);
    if (context === undefined) {
        throw new Error('useDocuments must be used within a DocumentProvider');
    }
    return context;
}
