const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

const headers = {
  'Content-Type': 'application/json',
  'apikey': SUPABASE_KEY,
  'Authorization': `Bearer ${SUPABASE_KEY}`,
  'Prefer': 'return=representation'
};

export async function sbFetch<T>(table: string, method: string = 'GET', body: any = null, params: string = ''): Promise<T[] | null> {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error("Supabase credentials missing. Please check your environment variables.");
    return null;
  }

  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}${params}`, {
      method,
      headers,
      ...(body ? { body: JSON.stringify(body) } : {})
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(errorText);
    }

    if (method === 'DELETE') return [] as T[];
    
    const contentType = res.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await res.json();
    }
    
    return [] as T[];
  } catch (error) {
    console.error(`Supabase Error (${table}):`, error);
    return null;
  }
}
