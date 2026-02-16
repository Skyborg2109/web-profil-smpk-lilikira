import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

export interface Message {
    id: number;
    name: string;
    email: string;
    phone: string;
    subject: string;
    message: string;
    is_read: boolean;
    created_at: string;
}

interface MessageContextType {
    messages: Message[];
    loading: boolean;
    sendMessage: (message: Omit<Message, 'id' | 'created_at' | 'is_read'>) => Promise<void>;
    markAsRead: (id: number) => Promise<void>;
    deleteMessage: (id: number) => Promise<void>;
    refreshMessages: () => Promise<void>;
}

const MessageContext = createContext<MessageContextType | undefined>(undefined);

export function MessageProvider({ children }: { children: React.ReactNode }) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchMessages = React.useCallback(async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('messages')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setMessages(data || []);
        } catch (error) {
            console.error('Error fetching messages:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchMessages();
    }, []);

    const sendMessage = async (message: Omit<Message, 'id' | 'created_at' | 'is_read'>) => {
        try {
            const { error } = await supabase
                .from('messages')
                .insert([message]);
            if (error) throw error;
        } catch (error) {
            console.error('Error sending message:', error);
            throw error;
        }
    };

    const markAsRead = async (id: number) => {
        try {
            const { error } = await supabase
                .from('messages')
                .update({ is_read: true })
                .eq('id', id);
            if (error) throw error;
            await fetchMessages();
        } catch (error) {
            console.error('Error marking message as read:', error);
            throw error;
        }
    };

    const deleteMessage = async (id: number) => {
        try {
            const { error } = await supabase
                .from('messages')
                .delete()
                .eq('id', id);
            if (error) throw error;
            await fetchMessages();
        } catch (error) {
            console.error('Error deleting message:', error);
            throw error;
        }
    };

    return (
        <MessageContext.Provider value={{
            messages,
            loading,
            sendMessage,
            markAsRead,
            deleteMessage,
            refreshMessages: fetchMessages
        }}>
            {children}
        </MessageContext.Provider>
    );
}

export function useMessages() {
    const context = useContext(MessageContext);
    if (context === undefined) {
        throw new Error('useMessages must be used within a MessageProvider');
    }
    return context;
}
