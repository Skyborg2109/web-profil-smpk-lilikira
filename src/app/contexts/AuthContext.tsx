import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { supabase } from '../../lib/supabase';

export type UserRole = 'admin' | 'operator' | 'student';

export interface User {
    id: string;
    username: string;
    name: string; // Changed name to match full_name in profile if preferred, kept name for consistency
    role: UserRole;
    email: string;
    phone?: string;
    address?: string;
    avatar_url?: string;
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (identifier: string, password: string) => Promise<User | null>;
    logout: () => Promise<void>;
    updateProfile: (updates: Partial<User>) => Promise<void>;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchProfile = useCallback(async (userId: string, email: string, metadata?: any) => {
        console.log('Auth: Fetching profile for', userId);
        try {
            // Peningkatan timeout agar lebih toleran terhadap koneksi lambat (10 detik)
            const { data, error } = await Promise.race([
                supabase.from('profiles').select('*').eq('id', userId).maybeSingle(),
                new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout profil')), 10000))
            ]) as any;

            if (error) {
                console.warn('Auth: Gagal ambil profil:', error.message);
                return null;
            }

            // Jika profil belum ada, coba buatkan profil baru menggunakan metadata
            if (!data && metadata) {
                console.log('Auth: Profil tidak ditemukan, mencoba membuat profil baru...');
                const { data: newProfile, error: insertError } = await supabase
                    .from('profiles')
                    .insert([
                        {
                            id: userId,
                            email: email,
                            full_name: metadata.full_name || 'User',
                            role: metadata.role || 'student',
                            username: email.split('@')[0],
                            updated_at: new Date().toISOString()
                        }
                    ])
                    .select()
                    .maybeSingle();

                if (insertError) {
                    console.error('Auth: Gagal membuat profil baru:', insertError.message);
                    // Jika gagal karena RLS (tidak ada kebijakan INSERT), kita tetap kembalikan null
                    // tapi setidaknya kita sudah mencoba.
                    return null;
                }

                if (newProfile) {
                    const userData: User = {
                        id: newProfile.id,
                        username: newProfile.username || email.split('@')[0],
                        name: newProfile.full_name || 'User',
                        role: newProfile.role as UserRole,
                        email: newProfile.email || email,
                        phone: newProfile.phone,
                        address: newProfile.address,
                        avatar_url: newProfile.avatar_url,
                    };
                    setUser(userData);
                    return userData;
                }
            }

            if (data) {
                const userData: User = {
                    id: data.id,
                    username: data.username || email.split('@')[0],
                    name: data.full_name || 'User',
                    role: data.role as UserRole,
                    email: data.email || email,
                    phone: data.phone,
                    address: data.address,
                    avatar_url: data.avatar_url,
                };
                setUser(userData);
                return userData;
            }

            // Fallback: Jika profil tidak ada di DB, tapi ada metadata role (biasanya disetel saat create user)
            if (metadata && metadata.role) {
                console.log('Auth: Menggunakan role dari metadata karena profil DB tidak ditemukan');
                const userData: User = {
                    id: userId,
                    username: email.split('@')[0],
                    name: metadata.full_name || 'User',
                    role: (metadata.role as UserRole) || 'student',
                    email: email,
                };
                setUser(userData);
                return userData;
            }
        } catch (error) {
            console.error('Auth: Error di fetchProfile:', error);
        }
        return null;
    }, []);

    useEffect(() => {
        let mounted = true;

        const handleAuth = async (session: any) => {
            if (session?.user) {
                await fetchProfile(session.user.id, session.user.email || '', session.user.user_metadata);
            } else {
                setUser(null);
            }
            if (mounted) setLoading(false);
        };

        // Get initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (mounted) {
                handleAuth(session);
            }
        });

        // Listen for changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (mounted) {
                handleAuth(session);
            }
        });

        return () => {
            mounted = false;
            subscription.unsubscribe();
        };
    }, [fetchProfile]);

    const login = async (identifier: string, password: string): Promise<User | null> => {
        setLoading(true);
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email: identifier,
                password: password,
            });

            if (error) throw error;

            if (data.user) {
                const profile = await fetchProfile(data.user.id, data.user.email || '', data.user.user_metadata);
                // profile is User | null
                if (!profile) throw new Error('Profil tidak ditemukan di tabel "profiles".');
                return profile;
            }
            return null;
        } catch (error: any) {
            setLoading(false);
            throw error;
        }
    };

    const logout = async () => {
        try {
            await supabase.auth.signOut();
            setUser(null);
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    const updateProfile = async (updates: Partial<User>) => {
        if (!user) return;

        try {
            const { error } = await supabase
                .from('profiles')
                .update({
                    full_name: updates.name,
                    phone: updates.phone,
                    address: updates.address,
                    avatar_url: updates.avatar_url,
                    updated_at: new Date().toISOString()
                })
                .eq('id', user.id);

            if (error) throw error;

            setUser(prev => prev ? { ...prev, ...updates } : null);
        } catch (error) {
            console.error('Update profile error:', error);
            throw error;
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                login,
                logout,
                updateProfile,
                isAuthenticated: !!user,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
