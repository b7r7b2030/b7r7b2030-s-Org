import React from 'react';
import { 
  School, 
  Plus, 
  Calendar, 
  Clock, 
  UserSquare2, 
  Search,
  Edit,
  Trash2,
  QrCode
} from 'lucide-react';
import { cn } from '../lib/utils';
import { Committee } from '../types';

const initialCommittees: Committee[] = [
  { id: '1', name: '1A', subject: 'اللغة العربية', teacher_name: 'أحمد السيد', exam_date: '2024-05-15', start_time: '08:00', end_time: '10:00', student_count: 30, present_count: 28 },
  { id: '2', name: '2B', subject: 'الرياضيات', teacher_name: 'خالد الأحمدي', exam_date: '2024-05-15', start_time: '08:00', end_time: '10:00', student_count: 28, present_count: 27 },
  { id: '3', name: '3C', subject: 'العلوم', teacher_name: 'محمد العتيبي', exam_date: '2024-05-16', start_time: '10:30', end_time: '12:30', student_count: 32, present_count: 30 },
  { id: '4', name: '4A', subject: 'الإنجليزية', teacher_name: 'سعد الغامدي', exam_date: '2024-05-16', start_time: '10:30', end_time: '12:30', student_count: 25, present_count: 0 },
];

export const Committees: React.FC = () => {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Create Committee */}
      <div className="bg-card border border-border rounded-2xl p-6">
        <h3 className="font-bold text-sm mb-6 flex items-center gap-2">
          <Plus size={18} className="text-accent" />
          إنشاء لجنة جديدة
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-text2">رقم/اسم اللجنة *</label>
            <input className="w-full bg-bg3 border border-border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-accent" placeholder="مثال: 1A" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-text2">المادة الدراسية *</label>
            <input className="w-full bg-bg3 border border-border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-accent" placeholder="مثال: الفيزياء" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-text2">المعلم المراقب *</label>
            <select className="w-full bg-bg3 border border-border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-accent">
              <option>اختر المعلم...</option>
              <option>أحمد السيد</option>
              <option>خالد الأحمدي</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-text2">تاريخ الاختبار *</label>
            <input type="date" className="w-full bg-bg3 border border-border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-accent" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-text2">وقت البداية *</label>
            <input type="time" className="w-full bg-bg3 border border-border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-accent" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-text2">وقت النهاية *</label>
            <input type="time" className="w-full bg-bg3 border border-border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-accent" />
          </div>
        </div>
        <button className="mt-6 bg-accent text-white font-bold px-8 py-3 rounded-xl hover:bg-accent/90 transition-all flex items-center gap-2">
          <School size={18} />
          إنشاء اللجنة
        </button>
      </div>

      {/* Committees List */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-border flex items-center justify-between">
          <h3 className="font-bold text-sm">قائمة اللجان</h3>
          <button className="px-4 py-2 bg-gold text-black text-xs font-bold rounded-xl hover:bg-gold/90 transition-all flex items-center gap-2">
            <QrCode size={16} />
            إنشاء QR للكل
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-right text-sm">
            <thead className="bg-bg3/50 text-text3 text-[10px] font-bold uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3">اللجنة</th>
                <th className="px-6 py-3">المادة</th>
                <th className="px-6 py-3">المعلم</th>
                <th className="px-6 py-3">عدد الطلاب</th>
                <th className="px-6 py-3">التاريخ</th>
                <th className="px-6 py-3">الوقت</th>
                <th className="px-6 py-3">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {initialCommittees.map((c, i) => (
                <tr key={i} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4 font-bold text-text">{c.name}</td>
                  <td className="px-6 py-4 text-text2">{c.subject}</td>
                  <td className="px-6 py-4 text-text2">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center text-accent text-[10px]">
                        <UserSquare2 size={12} />
                      </div>
                      {c.teacher_name}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-text2 font-bold">{c.student_count}</td>
                  <td className="px-6 py-4 text-text3 text-xs">
                    <div className="flex items-center gap-1">
                      <Calendar size={12} />
                      {c.exam_date}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-text3 text-xs">
                    <div className="flex items-center gap-1">
                      <Clock size={12} />
                      {c.start_time} - {c.end_time}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button className="p-1.5 bg-bg3 text-text3 rounded-lg hover:text-accent transition-colors"><QrCode size={14} /></button>
                      <button className="p-1.5 bg-bg3 text-text3 rounded-lg hover:text-accent transition-colors"><Edit size={14} /></button>
                      <button className="p-1.5 bg-bg3 text-text3 rounded-lg hover:text-red transition-colors"><Trash2 size={14} /></button>
                    </div>
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
