import { sbFetch } from './supabase';

export type LogCategory = 'auth' | 'attendance' | 'envelope' | 'data' | 'system';
export type LogSeverity = 'info' | 'warning' | 'error';

export async function logAction(
  userId: string | undefined,
  action: string,
  category: LogCategory,
  details: any = {},
  severity: LogSeverity = 'info'
) {
  try {
    await sbFetch('system_logs', 'POST', {
      user_id: userId,
      action,
      category,
      details,
      severity,
      created_at: new Date().toISOString()
    });
  } catch (error) {
    console.error('Failed to log action:', error);
  }
}
