import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

export interface Student {
    id: number;
    created_at: string;
    full_name: string;
    nisn: string;
    class_name: string;
    gender: string;
    birth_place: string;
    birth_date: string;
    address: string;
    parent_name: string;
    phone: string;
}

interface StudentContextType {
    students: Student[];
    loading: boolean;
    addStudent: (student: Omit<Student, 'id' | 'created_at'>) => Promise<void>;
    updateStudent: (id: number, updates: Partial<Student>) => Promise<void>;
    deleteStudent: (id: number) => Promise<void>;
    refreshStudents: () => Promise<void>;
}

const StudentContext = createContext<StudentContextType | undefined>(undefined);

export function StudentProvider({ children }: { children: React.ReactNode }) {
    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchStudents = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('students')
                .select('*')
                .order('full_name', { ascending: true });

            if (error) throw error;
            setStudents(data || []);
        } catch (error: any) {
            console.error('Error fetching students:', error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStudents();
    }, []);

    const addStudent = async (student: Omit<Student, 'id' | 'created_at'>) => {
        const { error } = await supabase.from('students').insert([student]);
        if (error) throw error;
        await fetchStudents();
    };

    const updateStudent = async (id: number, updates: Partial<Student>) => {
        const { error } = await supabase.from('students').update(updates).eq('id', id);
        if (error) throw error;
        await fetchStudents();
    };

    const deleteStudent = async (id: number) => {
        const { error } = await supabase.from('students').delete().eq('id', id);
        if (error) throw error;
        await fetchStudents();
    };

    return (
        <StudentContext.Provider value={{
            students,
            loading,
            addStudent,
            updateStudent,
            deleteStudent,
            refreshStudents: fetchStudents
        }}>
            {children}
        </StudentContext.Provider>
    );
}

export function useStudents() {
    const context = useContext(StudentContext);
    if (context === undefined) {
        throw new Error('useStudents must be used within a StudentProvider');
    }
    return context;
}
