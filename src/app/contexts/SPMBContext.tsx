import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { supabase } from '../../lib/supabase';

export interface SPMBApplication {
    id: number;
    name: string;
    email: string;
    phone: string;
    gender: string;
    birth_date: string;
    address: string;
    previous_school: string;
    parents_name: string;
    parents_phone: string;
    status: 'pending' | 'approved' | 'rejected';
    submitted_date: string;
    created_at: string;
    documents?: {
        photo?: string;
        birth_certificate?: string;
        report_card?: string;
    };
}

export interface SPMBSchedule {
    id: number;
    event_name: string;
    date_range: string;
    description: string;
    is_active: boolean;
}

export interface SPMBRequirement {
    id: number;
    description: string;
}

interface NewsContextType {
    applications: SPMBApplication[];
    schedules: SPMBSchedule[];
    requirements: SPMBRequirement[];
    loading: boolean;
    refreshApplications: () => Promise<void>;
    addApplication: (
        application: Omit<SPMBApplication, 'id' | 'status' | 'submitted_date' | 'created_at' | 'documents'>,
        files?: { photo: File | null; birth_certificate: File | null; report_card: File | null }
    ) => Promise<void>;
    updateApplicationStatus: (id: number, status: 'approved' | 'rejected') => Promise<void>;
    deleteApplication: (id: number) => Promise<void>;
    // Schedule methods
    addSchedule: (schedule: Omit<SPMBSchedule, 'id'>) => Promise<void>;
    updateSchedule: (id: number, schedule: Partial<SPMBSchedule>) => Promise<void>;
    deleteSchedule: (id: number) => Promise<void>;
    // Requirement methods
    addRequirement: (requirement: Omit<SPMBRequirement, 'id'>) => Promise<void>;
    updateRequirement: (id: number, requirement: Partial<SPMBRequirement>) => Promise<void>;
    deleteRequirement: (id: number) => Promise<void>;
}

const SPMBContext = createContext<NewsContextType | undefined>(undefined);

export function SPMBProvider({ children }: { children: ReactNode }) {
    const [applications, setApplications] = useState<SPMBApplication[]>([]);
    const [schedules, setSchedules] = useState<SPMBSchedule[]>([]);
    const [requirements, setRequirements] = useState<SPMBRequirement[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchAllData = useCallback(async () => {
        try {
            setLoading(true);
            const [appsRes, scheduleRes, reqsRes] = await Promise.all([
                supabase.from('spmb_applications').select('*').order('created_at', { ascending: false }),
                supabase.from('spmb_schedule').select('*').order('id', { ascending: true }),
                supabase.from('spmb_requirements').select('*').order('id', { ascending: true })
            ]);

            if (appsRes.error) throw appsRes.error;
            if (scheduleRes.error) throw scheduleRes.error;
            if (reqsRes.error) throw reqsRes.error;

            setApplications(appsRes.data || []);
            setSchedules(scheduleRes.data || []);
            setRequirements(reqsRes.data || []);
        } catch (error) {
            console.error('Error fetching SPMB data:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAllData();
    }, [fetchAllData]);

    const addApplication = async (
        application: Omit<SPMBApplication, 'id' | 'status' | 'submitted_date' | 'created_at' | 'documents'>,
        files?: { photo: File | null; birth_certificate: File | null; report_card: File | null }
    ) => {
        try {
            const documents: any = {};

            if (files) {
                const uploadFile = async (file: File, path: string) => {
                    const fileExt = file.name.split('.').pop();
                    const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
                    const filePath = `${path}/${fileName}`;

                    const { error: uploadError } = await supabase.storage
                        .from('files')
                        .upload(filePath, file);

                    if (uploadError) throw uploadError;

                    const { data } = supabase.storage
                        .from('files')
                        .getPublicUrl(filePath);

                    return data.publicUrl;
                };

                if (files.photo) {
                    documents.photo = await uploadFile(files.photo, 'spmb/photos');
                }
                if (files.birth_certificate) {
                    documents.birth_certificate = await uploadFile(files.birth_certificate, 'spmb/documents');
                }
                if (files.report_card) {
                    documents.report_card = await uploadFile(files.report_card, 'spmb/documents');
                }
            }

            const newApp = {
                ...application,
                submitted_date: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
                status: 'pending' as const,
                documents: Object.keys(documents).length > 0 ? documents : null
            };

            const { error } = await supabase
                .from('spmb_applications')
                .insert([newApp]);

            if (error) throw error;
            await fetchAllData();
        } catch (error) {
            console.error('Error adding application:', error);
            throw error;
        }
    };

    const updateApplicationStatus = async (id: number, status: 'approved' | 'rejected') => {
        try {
            const { error } = await supabase
                .from('spmb_applications')
                .update({ status })
                .eq('id', id);

            if (error) throw error;
            await fetchAllData();
        } catch (error) {
            console.error('Error updating status:', error);
            throw error;
        }
    };

    const deleteApplication = async (id: number) => {
        try {
            const { error } = await supabase.from('spmb_applications').delete().eq('id', id);
            if (error) throw error;
            await fetchAllData();
        } catch (error) {
            console.error('Error deleting application:', error);
            throw error;
        }
    };

    const addSchedule = async (schedule: Omit<SPMBSchedule, 'id'>) => {
        try {
            const { error } = await supabase.from('spmb_schedule').insert([schedule]);
            if (error) throw error;
            await fetchAllData();
        } catch (error) {
            console.error('Error adding schedule:', error);
            throw error;
        }
    };

    const updateSchedule = async (id: number, updates: Partial<SPMBSchedule>) => {
        try {
            const { error } = await supabase.from('spmb_schedule').update(updates).eq('id', id);
            if (error) throw error;
            await fetchAllData();
        } catch (error) {
            console.error('Error updating schedule:', error);
            throw error;
        }
    };

    const deleteSchedule = async (id: number) => {
        try {
            const { error } = await supabase.from('spmb_schedule').delete().eq('id', id);
            if (error) throw error;
            await fetchAllData();
        } catch (error) {
            console.error('Error deleting schedule:', error);
            throw error;
        }
    };

    const addRequirement = async (requirement: Omit<SPMBRequirement, 'id'>) => {
        try {
            const { error } = await supabase.from('spmb_requirements').insert([requirement]);
            if (error) throw error;
            await fetchAllData();
        } catch (error) {
            console.error('Error adding requirement:', error);
            throw error;
        }
    };

    const updateRequirement = async (id: number, updates: Partial<SPMBRequirement>) => {
        try {
            const { error } = await supabase.from('spmb_requirements').update(updates).eq('id', id);
            if (error) throw error;
            await fetchAllData();
        } catch (error) {
            console.error('Error updating requirement:', error);
            throw error;
        }
    };

    const deleteRequirement = async (id: number) => {
        try {
            const { error } = await supabase.from('spmb_requirements').delete().eq('id', id);
            if (error) throw error;
            await fetchAllData();
        } catch (error) {
            console.error('Error deleting requirement:', error);
            throw error;
        }
    };

    return (
        <SPMBContext.Provider
            value={{
                applications,
                schedules,
                requirements,
                loading,
                refreshApplications: fetchAllData,
                addApplication,
                updateApplicationStatus,
                deleteApplication,
                addSchedule,
                updateSchedule,
                deleteSchedule,
                addRequirement,
                updateRequirement,
                deleteRequirement
            }}
        >
            {children}
        </SPMBContext.Provider>
    );
}

export function useSPMB() {
    const context = useContext(SPMBContext);
    if (!context) {
        throw new Error('useSPMB must be used within SPMBProvider');
    }
    return context;
}
