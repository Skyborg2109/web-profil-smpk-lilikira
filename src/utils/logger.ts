import { supabase } from '../lib/supabase';

export const logActivity = async (
    userName: string,
    action: string,
    target: string,
    description: string
) => {
    try {
        const { error } = await supabase.from('activity_logs').insert([
            {
                user_name: userName,
                action,
                target,
                description,
            },
        ]);
        if (error) throw error;
    } catch (error) {
        console.error('Failed to log activity:', error);
    }
};
