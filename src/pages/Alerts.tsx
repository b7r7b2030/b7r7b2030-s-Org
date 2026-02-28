import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  AlertCircle, 
  Clock, 
  CheckCircle2, 
  Settings,
  Phone,
  ArrowLeft,
  RefreshCw
} from 'lucide-react';
import { cn } from '../lib/utils';
import { sbFetch } from '../services/supabase';

export const Alerts: React.FC = () => {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'absent' | 'delay'>('all');

  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      const [absentData, envelopeData, manualAlerts] = await Promise.all([
        sbFetch<any>('v_absent_students', 'GET', null, '?select=*'),
        sbFetch<any>('envelopes', 'GET', null, '?status=neq.delivered&select=*,committees(name)'),
        sbFetch<any>('alerts', 'GET', null, '?order=created_at.desc&limit=20')
      ]);

      const formattedAlerts: any[] = [];

      if (absentData) {
        absentData.forEach((a: any) => {
          formattedAlerts.push({
            id: `absent-${a.student_no}`,
            type: 'red',
            category: 'absent',
            title: `غياب: ${a.full_name}`,
            desc: `اللجنة: ${a.committee_name} | الصف: ${a.grade} | الفصل: ${a.classroom}`,
            time: a.recorded_at ? new Date(a.recorded_at).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }) : 'غير محدد',
            phone: a.phone,
            created_at: a.recorded_at
          });
        });
      }

      if (envelopeData) {
        envelopeData.forEach((e: any) => {
          formattedAlerts.push({
            id: `envelope-${e.envelope_no}`,
            type: 'gold',
            category: 'delay',
            title: `تأخر استلام مظروف — ${e.envelope_no}`,
            desc: `اللجنة: ${e.committees?.name || 'غير محدد'} | الحالة: ${e.status === 'pending' ? 'لم يستلم' : 'قيد الاختبار'}`,
            time: e.updated_at ? new Date(e.updated_at).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }) : 'غير محدد',
            created_at: e.updated_at
          });
        });
      }

      if (manualAlerts) {
        manualAlerts.forEach((ma: any) => {
          formattedAlerts.push({
            id: `manual-${ma.id}`,
            type: ma.type,
            category: ma.type === 'red' ? 'absent' : 'delay',
            title: ma.title,
            desc: ma.body,
            time: ma.created_at ? new Date(ma.created_at).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }) : 'غير محدد',
            created_at: ma.created_at
          });
        });
      }

      // Sort by created_at (most recent first)
      const sorted = formattedAlerts.sort((a, b) => {
        return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
      });

      setAlerts(sorted);
    } catch (error) {
      console.error("Error fetching alerts:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredAlerts = alerts.filter(a => {
    if (filter === 'all') return true;
    return a.category === filter;
  });

  const counts = {
    all: alerts.length,
    absent: alerts.filter(a => a.category === 'absent').length,
    delay: alerts.filter(a => a.category === 'delay').length
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex gap-2 overflow-x-auto pb-2">
            <button 
              onClick={() => setFilter('all')}
              className={cn(
                "px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all",
                filter === 'all' ? "bg-accent text-white" : "bg-bg3 text-text3 hover:text-text"
              )}
            >
              الكل ({counts.all})
            </button>
            <button 
              onClick={() => setFilter('absent')}
              className={cn(
                "px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all",
                filter === 'absent' ? "bg-red text-white" : "bg-bg3 text-text3 hover:text-text"
              )}
            >
              غياب ({counts.absent})
            </button>
            <button 
              onClick={() => setFilter('delay')}
              className={cn(
                "px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all",
                filter === 'delay' ? "bg-gold text-black" : "bg-bg3 text-text3 hover:text-text"
              )}
            >
              تأخر مظاريف ({counts.delay})
            </button>
          </div>

          <div className="bg-card border border-border rounded-2xl divide-y divide-border/50 min-h-[400px]">
            {loading ? (
              <div className="flex flex-col items-center justify-center p-20 space-y-4">
                <RefreshCw size={40} className="text-accent animate-spin" />
                <p className="text-sm text-text3">جاري تحديث التنبيهات...</p>
              </div>
            ) : filteredAlerts.length > 0 ? (
              filteredAlerts.map((alert) => (
                <div key={alert.id} className="p-5 flex items-start gap-4 hover:bg-white/5 transition-colors">
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                    alert.type === 'red' && "bg-red/10 text-red",
                    alert.type === 'gold' && "bg-gold/10 text-gold",
                    alert.type === 'blue' && "bg-accent/10 text-accent"
                  )}>
                    {alert.type === 'red' && <AlertCircle size={20} />}
                    {alert.type === 'gold' && <Clock size={20} />}
                    {alert.type === 'blue' && <Settings size={20} />}
                  </div>
                  <div className="flex-1">
                    <h4 className={cn(
                      "text-sm font-bold",
                      alert.type === 'red' && "text-red-300",
                      alert.type === 'gold' && "text-gold-300",
                      alert.type === 'blue' && "text-accent2"
                    )}>{alert.title}</h4>
                    <p className="text-xs text-text3 mt-1 leading-relaxed">{alert.desc}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className="text-[10px] text-text3 font-medium whitespace-nowrap">{alert.time}</span>
                    {alert.type === 'red' && alert.phone && (
                      <a 
                        href={`tel:${alert.phone}`}
                        className="px-3 py-1 bg-bg3 border border-border rounded-lg text-[10px] font-bold text-text2 hover:text-text transition-all flex items-center gap-1"
                      >
                        <Phone size={12} /> تواصل
                      </a>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center p-20 text-center space-y-4 opacity-40">
                <Bell size={64} className="text-text3" />
                <p className="text-sm text-text3 font-medium">لا توجد تنبيهات نشطة حالياً</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6 h-fit">
          <h3 className="font-bold text-sm mb-6 flex items-center gap-2">
            <Settings size={18} className="text-accent" />
            إعدادات التنبيهات
          </h3>
          <div className="space-y-4">
            <div className="p-4 bg-bg3 border border-border rounded-xl flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-text">تنبيه الغياب الفوري</h4>
                <p className="text-[10px] text-text3 mt-0.5">إرسال فوري عند تسجيل غياب</p>
              </div>
              <span className="px-2 py-0.5 bg-green/10 text-green text-[10px] font-bold rounded-md border border-green/20">مفعّل</span>
            </div>
            <div className="p-4 bg-bg3 border border-border rounded-xl flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-text">تأخر المظاريف</h4>
                <p className="text-[10px] text-text3 mt-0.5">تنبيه إذا تأخر الاستلام</p>
              </div>
              <div className="flex items-center gap-2">
                <input className="w-10 bg-bg2 border border-border rounded-md px-1 py-0.5 text-[10px] text-center outline-none focus:border-accent" defaultValue="15" />
                <span className="text-[10px] text-text3">دقيقة</span>
              </div>
            </div>
            <div className="p-4 bg-bg3 border border-border rounded-xl flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-text">تقرير نهاية الجلسة</h4>
                <p className="text-[10px] text-text3 mt-0.5">إرسال ملخص بعد الاختبار</p>
              </div>
              <span className="px-2 py-0.5 bg-green/10 text-green text-[10px] font-bold rounded-md border border-green/20">مفعّل</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
