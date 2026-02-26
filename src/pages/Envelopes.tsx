import React from 'react';
import { 
  Package, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  ArrowRight,
  Search,
  Filter
} from 'lucide-react';
import { cn } from '../lib/utils';

const stats = [
  { label: 'إجمالي المظاريف', value: '12', icon: Package, color: 'text3' },
  { label: 'لم يُستلم بعد', value: '2', icon: AlertCircle, color: 'gold' },
  { label: 'تم الاستلام', value: '5', icon: Clock, color: 'accent2' },
  { label: 'تم التسليم للكنترول', value: '5', icon: CheckCircle2, color: 'green' },
];

const EnvelopeTrack: React.FC<{ status: string }> = ({ status }) => {
  const steps = [
    { id: 'create', label: 'إنشاء' },
    { id: 'receive', label: 'استلام' },
    { id: 'progress', label: 'جارٍ' },
    { id: 'deliver', label: 'تسليم' },
  ];

  const getStepStatus = (stepId: string) => {
    if (status === 'delivered') return 'done';
    if (status === 'in_progress') {
      if (['create', 'receive'].includes(stepId)) return 'done';
      if (stepId === 'progress') return 'active';
      return 'pending';
    }
    if (status === 'received') {
      if (stepId === 'create') return 'done';
      if (stepId === 'receive') return 'active';
      return 'pending';
    }
    if (status === 'pending') {
      if (stepId === 'create') return 'done';
      return 'pending';
    }
    return 'pending';
  };

  return (
    <div className="flex items-center justify-between relative py-2">
      <div className="absolute top-1/2 left-4 right-4 h-0.5 bg-border -translate-y-1/2 z-0"></div>
      {steps.map((step, i) => {
        const s = getStepStatus(step.id);
        return (
          <div key={step.id} className="flex flex-col items-center gap-1 z-10">
            <div className={cn(
              "w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border-2 transition-all",
              s === 'done' && "bg-green border-green text-white",
              s === 'active' && "bg-accent border-accent text-white animate-pulse",
              s === 'pending' && "bg-bg3 border-border text-text3"
            )}>
              {s === 'done' ? '✓' : i + 1}
            </div>
            <span className="text-[8px] font-bold text-text3 uppercase">{step.label}</span>
          </div>
        );
      })}
    </div>
  );
};

export const Envelopes: React.FC = () => {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className="bg-card border border-border rounded-2xl p-5 flex items-center gap-4">
            <div className={cn(
              "w-12 h-12 rounded-xl flex items-center justify-center",
              stat.color === 'text3' && "bg-bg3 text-text3",
              stat.color === 'gold' && "bg-gold/10 text-gold",
              stat.color === 'accent2' && "bg-accent/10 text-accent2",
              stat.color === 'green' && "bg-green/10 text-green"
            )}>
              <stat.icon size={24} />
            </div>
            <div>
              <h3 className={cn("font-display font-extrabold text-2xl leading-none", `text-${stat.color}`)}>{stat.value}</h3>
              <p className="text-xs text-text3 font-medium">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Envelopes List */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-border flex items-center justify-between">
          <h3 className="font-bold text-sm">تتبع المظاريف — خط زمني</h3>
          <div className="flex gap-2">
            <button className="px-3 py-1 bg-accent text-white rounded-lg text-[10px] font-bold">الكل</button>
            <button className="px-3 py-1 bg-bg3 text-text3 rounded-lg text-[10px] font-bold hover:text-text">لم يُستلم</button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-right text-sm">
            <thead className="bg-bg3/50 text-text3 text-[10px] font-bold uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3">رقم المظروف</th>
                <th className="px-6 py-3">اللجنة</th>
                <th className="px-6 py-3">المادة</th>
                <th className="px-6 py-3 w-48">رحلة المظروف</th>
                <th className="px-6 py-3">المعلم</th>
                <th className="px-6 py-3">وقت الاستلام</th>
                <th className="px-6 py-3">وقت التسليم</th>
                <th className="px-6 py-3">الحالة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {[
                { id: 'ENV-001', comm: '1A', sub: 'اللغة العربية', teacher: 'أحمد السيد', rTime: '08:02 ص', dTime: '10:05 ص', status: 'delivered' },
                { id: 'ENV-002', comm: '2B', sub: 'الرياضيات', teacher: 'خالد الأحمدي', rTime: '08:05 ص', dTime: '—', status: 'in_progress' },
                { id: 'ENV-003', comm: '4A', sub: 'الإنجليزية', teacher: 'سعد الغامدي', rTime: '—', dTime: '—', status: 'pending' },
              ].map((row, i) => (
                <tr key={i} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4 font-bold text-text">{row.id}</td>
                  <td className="px-6 py-4 text-text2">{row.comm}</td>
                  <td className="px-6 py-4 text-text2">{row.sub}</td>
                  <td className="px-6 py-4">
                    <EnvelopeTrack status={row.status} />
                  </td>
                  <td className="px-6 py-4 text-text2">{row.teacher}</td>
                  <td className="px-6 py-4 text-text3 text-xs">{row.rTime}</td>
                  <td className="px-6 py-4 text-text3 text-xs">{row.dTime}</td>
                  <td className="px-6 py-4">
                    {row.status === 'delivered' && <span className="px-2 py-1 bg-green/10 text-green text-[10px] font-bold rounded-md border border-green/20">مكتمل</span>}
                    {row.status === 'in_progress' && <span className="px-2 py-1 bg-accent/10 text-accent2 text-[10px] font-bold rounded-md border border-accent/20">جارٍ الاختبار</span>}
                    {row.status === 'pending' && <span className="px-2 py-1 bg-red/10 text-red text-[10px] font-bold rounded-md border border-red/20">⚠️ تأخر</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
