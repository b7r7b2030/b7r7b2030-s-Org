import React, { useState } from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Search, 
  Phone, 
  MessageSquare,
  Filter,
  ArrowLeft
} from 'lucide-react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer,
  Tooltip
} from 'recharts';
import { cn } from '../lib/utils';

const students = [
  { id: '001', name: 'أحمد محمد علي', class: 'الرابع A', status: null, time: '—' },
  { id: '002', name: 'خالد سعد الدوسري', class: 'الرابع A', status: 'present', time: '08:05 ص' },
  { id: '003', name: 'فيصل عبدالله القحطاني', class: 'الرابع A', status: 'absent', time: '08:07 ص' },
  { id: '004', name: 'عمر ناصر الغامدي', class: 'الرابع A', status: null, time: '—' },
  { id: '005', name: 'يوسف علي المالكي', class: 'الرابع A', status: 'present', time: '08:03 ص' },
];

const statsData = [
  { name: 'حاضر', value: 28, color: '#10b981' },
  { name: 'غائب', value: 2, color: '#ef4444' },
  { name: 'متأخر', value: 1, color: '#f59e0b' },
];

export const Attendance: React.FC = () => {
  const [list, setList] = useState(students);

  const markStatus = (id: string, status: string) => {
    const time = new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' });
    setList(prev => prev.map(s => s.id === id ? { ...s, status, time } : s));
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Attendance List */}
        <div className="lg:col-span-2 bg-card border border-border rounded-2xl overflow-hidden">
          <div className="p-5 border-b border-border flex items-center justify-between">
            <h3 className="font-bold text-sm flex items-center gap-2">
              <CheckCircle2 size={18} className="text-accent" />
              تسجيل الحضور
            </h3>
            <select className="bg-bg3 border border-border rounded-xl px-3 py-1.5 text-xs font-bold outline-none focus:border-accent">
              <option>لجنة 1A — اللغة العربية</option>
              <option>لجنة 2B — الرياضيات</option>
            </select>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-right text-sm">
              <thead className="bg-bg3/50 text-text3 text-[10px] font-bold uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3">الرقم</th>
                  <th className="px-6 py-3">اسم الطالب</th>
                  <th className="px-6 py-3">الصف</th>
                  <th className="px-6 py-3">الحالة</th>
                  <th className="px-6 py-3">وقت التسجيل</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {list.map((s, i) => (
                  <tr key={i} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 font-bold text-text">{s.id}</td>
                    <td className="px-6 py-4 text-text2">{s.name}</td>
                    <td className="px-6 py-4 text-text3 text-xs">{s.class}</td>
                    <td className="px-6 py-4">
                      {!s.status ? (
                        <div className="flex gap-2">
                          <button 
                            onClick={() => markStatus(s.id, 'present')}
                            className="px-3 py-1 bg-green/10 text-green text-[10px] font-bold rounded-md border border-green/20 hover:bg-green hover:text-white transition-all"
                          >
                            ✅ حاضر
                          </button>
                          <button 
                            onClick={() => markStatus(s.id, 'absent')}
                            className="px-3 py-1 bg-red/10 text-red text-[10px] font-bold rounded-md border border-red/20 hover:bg-red hover:text-white transition-all"
                          >
                            ❌ غائب
                          </button>
                        </div>
                      ) : (
                        <span className={cn(
                          "px-2 py-1 text-[10px] font-bold rounded-md border",
                          s.status === 'present' ? "bg-green/10 text-green border-green/20" : "bg-red/10 text-red border-red/20"
                        )}>
                          {s.status === 'present' ? 'حاضر' : 'غائب'}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-text3 text-xs">{s.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Stats & Notifications */}
        <div className="space-y-6">
          <div className="bg-card border border-border rounded-2xl p-6">
            <h3 className="font-bold text-sm mb-6">📊 إحصائيات الحضور</h3>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statsData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {statsData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#141d35', border: '1px solid #2a3a5c', borderRadius: '8px' }}
                    itemStyle={{ color: '#e2e8f0', fontFamily: 'Cairo' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            <div className="space-y-4 mt-4">
              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-text2">الحضور</span>
                  <span className="font-bold text-green">28 طالب (93%)</span>
                </div>
                <div className="h-1.5 bg-bg3 rounded-full overflow-hidden">
                  <div className="h-full bg-linear-to-r from-green to-cyan-500 rounded-full" style={{ width: '93%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-text2">الغياب</span>
                  <span className="font-bold text-red">2 طلاب (7%)</span>
                </div>
                <div className="h-1.5 bg-bg3 rounded-full overflow-hidden">
                  <div className="h-full bg-red rounded-full" style={{ width: '7%' }}></div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-2xl p-6">
            <h3 className="font-bold text-sm mb-4 flex items-center gap-2">
              <MessageSquare size={18} className="text-accent" />
              الإشعارات الفورية
            </h3>
            <div className="space-y-3">
              <div className="p-4 bg-red/5 border border-red/10 rounded-xl flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-red/10 text-red flex items-center justify-center shrink-0">
                  <Phone size={16} />
                </div>
                <div className="flex-1">
                  <h4 className="text-xs font-bold text-red-300">إشعار غياب مُرسل</h4>
                  <p className="text-[10px] text-text3 mt-1">تم إرسال إشعار لولي أمر فيصل القحطاني</p>
                </div>
              </div>
              <button className="w-full py-2.5 bg-bg3 border border-border rounded-xl text-xs font-bold text-text2 hover:text-text transition-all">
                سجل الإشعارات المرسلة
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
