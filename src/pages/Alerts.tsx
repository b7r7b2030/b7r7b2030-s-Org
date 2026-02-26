import React from 'react';
import { 
  Bell, 
  AlertCircle, 
  Clock, 
  CheckCircle2, 
  Settings,
  Phone,
  ArrowLeft
} from 'lucide-react';
import { cn } from '../lib/utils';

const alerts = [
  { id: 1, type: 'red', title: 'غياب: أحمد محمد علي', desc: 'اللجنة: 3A | المادة: اللغة العربية | المعلم: سعد الغامدي', time: 'منذ 2 دقيقة' },
  { id: 2, type: 'red', title: 'غياب: فيصل عبدالله القحطاني', desc: 'اللجنة: 1C | المادة: الرياضيات | المعلم: محمد العتيبي', time: 'منذ 7 دقائق' },
  { id: 3, type: 'gold', title: 'تأخر استلام مظروف — ENV-003', desc: 'لجنة 4A — الإنجليزية — تأخر عن الموعد بـ 18 دقيقة', time: 'منذ 5 دقائق' },
  { id: 4, type: 'blue', title: 'تحديث قاعدة البيانات', desc: 'تمت مزامنة 156 سجل بنجاح مع Supabase', time: 'منذ 1 ساعة' },
];

export const Alerts: React.FC = () => {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex gap-2 overflow-x-auto pb-2">
            <button className="px-4 py-1.5 bg-accent text-white rounded-full text-xs font-bold whitespace-nowrap">الكل (4)</button>
            <button className="px-4 py-1.5 bg-bg3 text-text3 rounded-full text-xs font-bold whitespace-nowrap hover:text-text">غياب (2)</button>
            <button className="px-4 py-1.5 bg-bg3 text-text3 rounded-full text-xs font-bold whitespace-nowrap hover:text-text">تأخر مظاريف (1)</button>
          </div>

          <div className="bg-card border border-border rounded-2xl divide-y divide-border/50">
            {alerts.map((alert) => (
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
                  {alert.type === 'red' && (
                    <button className="px-3 py-1 bg-bg3 border border-border rounded-lg text-[10px] font-bold text-text2 hover:text-text transition-all flex items-center gap-1">
                      <Phone size={12} /> تواصل
                    </button>
                  )}
                </div>
              </div>
            ))}
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
