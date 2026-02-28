import React, { useState } from 'react';
import { UserRole, User, Staff } from '../types';
import { 
  ShieldCheck, 
  ArrowRight,
  Loader2,
  Lock,
  AlertCircle
} from 'lucide-react';
import { cn } from '../lib/utils';
import { sbFetch } from '../services/supabase';

interface RoleSelectorProps {
  onSelect: (user: User) => void;
}

export const RoleSelector: React.FC<RoleSelectorProps> = ({ onSelect }) => {
  const [nationalId, setNationalId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nationalId) return;

    setLoading(true);
    setError(null);

    try {
      // Check if the national ID exists in the staff table
      const data = await sbFetch<Staff>('staff', 'GET', null, `?national_id=eq.${nationalId}`);
      
      if (data && data.length > 0) {
        const staff = data[0];
        onSelect({
          id: staff.id || '',
          name: staff.full_name,
          role: staff.role,
          national_id: staff.national_id,
          phone: staff.phone
        });
      } else {
        setError('عذراً، هذا الكود غير مسجل بالنظام. يرجى مراجعة الإدارة.');
      }
    } catch (err: any) {
      console.error('Login error:', err);
      if (err.message?.includes('PGRST205') || err.message?.includes('staff')) {
        setError('خطأ في قاعدة البيانات: لم يتم العثور على جدول الموظفين. يرجى التوجه لصفحة الإعداد وتشغيل سكريبت التهيئة.');
      } else {
        setError('حدث خطأ أثناء محاولة الدخول. يرجى المحاولة مرة أخرى.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-6 relative overflow-hidden" dir="rtl">
      {/* Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-accent/5 blur-[120px] rounded-full"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple/5 blur-[120px] rounded-full"></div>

      <div className="max-w-md w-full space-y-8 relative z-10">
        <div className="text-center space-y-4">
          <div className="w-20 h-20 bg-linear-to-br from-accent to-purple rounded-3xl flex items-center justify-center text-white shadow-2xl shadow-accent/20 mx-auto mb-6">
            <ShieldCheck size={40} />
          </div>
          <h1 className="font-display font-black text-4xl text-text tracking-tight">نظام إدارة الاختبارات الذكي</h1>
          <p className="text-text3 text-lg">بوابة الكود الموحد</p>
        </div>

        <div className="bg-card border border-border rounded-3xl p-8 shadow-2xl">
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-text2 flex items-center gap-2">
                <Lock size={16} className="text-accent" />
                كود الدخول (السجل المدني)
              </label>
              <input 
                type="text"
                value={nationalId}
                onChange={(e) => setNationalId(e.target.value)}
                placeholder="أدخل رقم السجل المدني الخاص بك"
                className="w-full bg-bg3 border border-border rounded-2xl px-6 py-4 text-lg font-bold text-center tracking-widest outline-none focus:border-accent focus:ring-4 focus:ring-accent/10 transition-all"
                autoFocus
              />
            </div>

            {error && (
              <div className="bg-red/10 border border-red/20 text-red p-4 rounded-2xl flex items-center gap-3 animate-in fade-in zoom-in duration-300">
                <AlertCircle size={20} className="shrink-0" />
                <p className="text-xs font-bold">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !nationalId}
              className="w-full bg-linear-to-r from-accent to-purple text-white py-4 rounded-2xl font-black text-lg shadow-xl shadow-accent/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-3"
            >
              {loading ? (
                <Loader2 size={24} className="animate-spin" />
              ) : (
                <>
                  دخول للنظام
                  <ArrowRight size={20} />
                </>
              )}
            </button>
          </form>
        </div>

        <div className="text-center space-y-4">
          <p className="text-xs text-text3">
            في حال واجهت مشكلة في الدخول، يرجى التواصل مع مدير النظام لتفعيل كودك الخاص.
          </p>
          {error && (error.includes('قاعدة البيانات') || error.includes('staff')) && (
            <button 
              onClick={() => onSelect({ id: 'setup', name: 'إعداد النظام', role: UserRole.PRINCIPAL, national_id: '0' })}
              className="text-xs font-bold text-accent hover:underline"
            >
              دخول اضطراري لصفحة الإعداد لتهيئة قاعدة البيانات
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
