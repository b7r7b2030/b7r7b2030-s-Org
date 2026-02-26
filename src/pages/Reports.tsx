import React from 'react';
import { 
  BarChart3, 
  Download, 
  Printer, 
  CheckCircle2, 
  Package, 
  UserSquare2, 
  Calendar,
  Search,
  Filter
} from 'lucide-react';
import { cn } from '../lib/utils';

const reportTypes = [
  { id: 'attendance', label: 'تقرير الحضور والغياب', icon: CheckCircle2, color: 'green', desc: 'عرض شامل لجميع سجلات الحضور مع إمكانية التصفية' },
  { id: 'envelopes', label: 'تقرير تتبع المظاريف', icon: Package, color: 'blue', desc: 'خط زمني كامل لرحلة كل مظروف من الإنشاء للتسليم' },
  { id: 'teachers', label: 'تقرير أداء المعلمين', icon: UserSquare2, color: 'gold', desc: 'مدى الالتزام بالمواعيد والمهام المسندة لكل معلم' },
];

export const Reports: React.FC = () => {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {reportTypes.map((report) => (
          <div 
            key={report.id} 
            className="bg-card border border-border rounded-2xl p-8 text-center cursor-pointer hover:-translate-y-1 hover:shadow-xl transition-all group"
          >
            <div className={cn(
              "w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform",
              report.color === 'green' && "bg-green/10 text-green",
              report.color === 'blue' && "bg-accent/10 text-accent",
              report.color === 'gold' && "bg-gold/10 text-gold"
            )}>
              <report.icon size={32} />
            </div>
            <h3 className="font-bold text-sm mb-2">{report.label}</h3>
            <p className="text-[11px] text-text3 leading-relaxed mb-6">{report.desc}</p>
            <span className={cn(
              "px-3 py-1 text-[10px] font-bold rounded-full border",
              report.color === 'green' && "bg-green/10 text-green border-green/20",
              report.color === 'blue' && "bg-accent/10 text-accent border-accent/20",
              report.color === 'gold' && "bg-gold/10 text-gold border-gold/20"
            )}>
              متاح للتصدير
            </span>
          </div>
        ))}
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-border flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h3 className="font-bold text-sm flex items-center gap-2">
            <BarChart3 size={18} className="text-accent" />
            📋 تقرير الحضور والغياب — اليوم
          </h3>
          <div className="flex flex-wrap items-center gap-3">
            <input type="date" className="bg-bg3 border border-border rounded-xl px-3 py-1.5 text-xs font-bold outline-none focus:border-accent" defaultValue={new Date().toISOString().split('T')[0]} />
            <button className="px-4 py-2 bg-green text-white text-[10px] font-bold rounded-xl hover:bg-green/90 transition-all flex items-center gap-2">
              <Download size={14} /> تصدير Excel
            </button>
            <button className="px-4 py-2 bg-bg3 border border-border text-text2 text-[10px] font-bold rounded-xl hover:text-text transition-all flex items-center gap-2">
              <Printer size={14} /> طباعة
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-right text-sm">
            <thead className="bg-bg3/50 text-text3 text-[10px] font-bold uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3">رقم الطالب</th>
                <th className="px-6 py-3">اسم الطالب</th>
                <th className="px-6 py-3">الصف/الفصل</th>
                <th className="px-6 py-3">المادة</th>
                <th className="px-6 py-3">اللجنة</th>
                <th className="px-6 py-3">الحالة</th>
                <th className="px-6 py-3">وقت التسجيل</th>
                <th className="px-6 py-3">المعلم</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {[
                { id: '20241003', name: 'أحمد محمد علي', class: 'الرابع A', sub: 'اللغة العربية', comm: '3A', status: 'absent', time: '08:07 ص', teacher: 'سعد الغامدي' },
                { id: '20241018', name: 'فيصل القحطاني', class: 'الرابع A', sub: 'الرياضيات', comm: '1C', status: 'absent', time: '08:10 ص', teacher: 'محمد العتيبي' },
                { id: '20241025', name: 'خالد سعد الدوسري', class: 'الرابع A', sub: 'اللغة العربية', comm: '3A', status: 'present', time: '08:02 ص', teacher: 'سعد الغامدي' },
              ].map((row, i) => (
                <tr key={i} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4 font-bold text-text">{row.id}</td>
                  <td className="px-6 py-4 text-text2">{row.name}</td>
                  <td className="px-6 py-4 text-text3 text-xs">{row.class}</td>
                  <td className="px-6 py-4 text-text2">{row.sub}</td>
                  <td className="px-6 py-4 text-text2">{row.comm}</td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "px-2 py-1 text-[10px] font-bold rounded-md border",
                      row.status === 'present' ? "bg-green/10 text-green border-green/20" : "bg-red/10 text-red border-red/20"
                    )}>
                      {row.status === 'present' ? 'حاضر' : 'غائب'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-text3 text-xs">{row.time}</td>
                  <td className="px-6 py-4 text-text2">{row.teacher}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
