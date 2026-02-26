import React, { useState } from 'react';
import { 
  Users, 
  Upload, 
  Download, 
  Search, 
  Plus, 
  Trash2, 
  Edit, 
  Phone,
  Filter,
  MoreVertical,
  Info
} from 'lucide-react';
import { cn } from '../lib/utils';
import { Student } from '../types';

const initialStudents: Student[] = [
  { student_no: '20241001', full_name: 'أحمد محمد علي السعيد', grade: 'الرابع', classroom: 'A', phone: '0512345678' },
  { student_no: '20241002', full_name: 'خالد سعد الدوسري', grade: 'الرابع', classroom: 'A', phone: '0523456789' },
  { student_no: '20241003', full_name: 'فيصل عبدالله القحطاني', grade: 'الرابع', classroom: 'A', phone: '0534567890' },
  { student_no: '20241004', full_name: 'عمر ناصر الغامدي', grade: 'الثالث', classroom: 'B', phone: '0545678901' },
  { student_no: '20241005', full_name: 'يوسف علي المالكي', grade: 'الثالث', classroom: 'B', phone: '0556789012' },
];

export const Students: React.FC = () => {
  const [students, setStudents] = useState<Student[]>(initialStudents);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('الكل');

  const filteredStudents = students.filter(s => {
    const matchesSearch = s.full_name.includes(search) || s.student_no.includes(search);
    const matchesFilter = filter === 'الكل' || s.grade === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Import Section */}
        <div className="bg-card border border-border rounded-2xl p-6">
          <h3 className="font-bold text-sm mb-4 flex items-center gap-2">
            <Upload size={18} className="text-accent" />
            استيراد بيانات الطلاب
          </h3>
          <div className="border-2 border-dashed border-border rounded-2xl p-10 text-center cursor-pointer hover:bg-accent/5 hover:border-accent transition-all group">
            <div className="w-16 h-16 bg-bg3 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
              <Upload size={32} className="text-text3 group-hover:text-accent" />
            </div>
            <h4 className="font-bold text-text mb-2">رفع ملف Excel أو CSV</h4>
            <p className="text-xs text-text3 max-w-xs mx-auto">الحقول المطلوبة: رقم الطالب، اسم الطالب، الصف، الفصل، رقم الجوال</p>
          </div>
          
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-border"></span></div>
            <div className="relative flex justify-center text-xs uppercase"><span className="bg-card px-2 text-text3">أو إضافة يدوية</span></div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-text2">رقم الطالب *</label>
              <input className="w-full bg-bg3 border border-border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-accent" placeholder="مثال: 20241001" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-text2">اسم الطالب *</label>
              <input className="w-full bg-bg3 border border-border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-accent" placeholder="الاسم الرباعي" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-text2">الصف *</label>
              <select className="w-full bg-bg3 border border-border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-accent">
                <option>الأول</option><option>الثاني</option><option>الثالث</option>
                <option>الرابع</option><option>الخامس</option><option>السادس</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-text2">الفصل *</label>
              <input className="w-full bg-bg3 border border-border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-accent" placeholder="مثال: A" />
            </div>
            <div className="col-span-2 space-y-1.5">
              <label className="text-xs font-bold text-text2">رقم الجوال</label>
              <input className="w-full bg-bg3 border border-border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-accent" placeholder="+966 5xxxxxxxx" />
            </div>
          </div>
          <button className="w-full mt-6 bg-accent text-white font-bold py-3 rounded-xl hover:bg-accent/90 transition-all flex items-center justify-center gap-2">
            <Plus size={18} />
            إضافة طالب
          </button>
        </div>

        {/* Instructions */}
        <div className="bg-card border border-border rounded-2xl p-6">
          <h3 className="font-bold text-sm mb-4 flex items-center gap-2">
            <Info size={18} className="text-gold" />
            تعليمات الاستيراد
          </h3>
          <div className="bg-accent/5 border border-accent/10 rounded-xl p-4 mb-6">
            <h4 className="text-xs font-bold text-accent2 flex items-center gap-2 mb-1">
              <Info size={14} />
              ترتيب أعمدة Excel
            </h4>
            <p className="text-[11px] text-text2">يجب أن تكون الأعمدة بالترتيب التالي في الملف لضمان الاستيراد الصحيح.</p>
          </div>
          
          <div className="overflow-hidden border border-border rounded-xl">
            <table className="w-full text-right text-xs">
              <thead className="bg-bg3 text-text3 font-bold">
                <tr>
                  <th className="px-4 py-2">العمود</th>
                  <th className="px-4 py-2">اسم الحقل</th>
                  <th className="px-4 py-2">مثال</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {[
                  { col: 'A', name: 'رقم الطالب', ex: '20241001' },
                  { col: 'B', name: 'اسم الطالب', ex: 'أحمد محمد علي' },
                  { col: 'C', name: 'الصف', ex: 'الرابع' },
                  { col: 'D', name: 'الفصل', ex: 'A' },
                  { col: 'E', name: 'رقم الجوال', ex: '0512345678' },
                ].map((row, i) => (
                  <tr key={i}>
                    <td className="px-4 py-2 font-bold text-accent">{row.col}</td>
                    <td className="px-4 py-2 text-text">{row.name}</td>
                    <td className="px-4 py-2 text-text3">{row.ex}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <button className="w-full mt-6 bg-bg3 border border-border text-text2 font-bold py-3 rounded-xl hover:bg-card hover:text-text transition-all flex items-center justify-center gap-2">
            <Download size={18} />
            تحميل قالب Excel
          </button>
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-border flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h3 className="font-bold text-sm">قائمة الطلاب</h3>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex bg-bg3 p-1 rounded-xl border border-border">
              {['الكل', 'الأول', 'الثاني', 'الثالث', 'الرابع'].map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={cn(
                    "px-4 py-1.5 rounded-lg text-xs font-bold transition-all",
                    filter === f ? "bg-accent text-white shadow-lg" : "text-text3 hover:text-text"
                  )}
                >
                  {f}
                </button>
              ))}
            </div>
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-text3" size={16} />
              <input 
                type="text" 
                placeholder="بحث..." 
                className="bg-bg3 border border-border rounded-xl pr-10 pl-4 py-2 text-sm outline-none focus:border-accent w-64"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-right text-sm">
            <thead className="bg-bg3/50 text-text3 text-[10px] font-bold uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3">رقم الطالب</th>
                <th className="px-6 py-3">اسم الطالب</th>
                <th className="px-6 py-3">الصف</th>
                <th className="px-6 py-3">الفصل</th>
                <th className="px-6 py-3">رقم الجوال</th>
                <th className="px-6 py-3">اللجنة</th>
                <th className="px-6 py-3">الحالة</th>
                <th className="px-6 py-3">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {filteredStudents.map((s, i) => (
                <tr key={i} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4 font-bold text-text">{s.student_no}</td>
                  <td className="px-6 py-4 text-text2">{s.full_name}</td>
                  <td className="px-6 py-4 text-text2">{s.grade}</td>
                  <td className="px-6 py-4 text-text2">{s.classroom}</td>
                  <td className="px-6 py-4 text-text3 font-mono text-xs" dir="ltr">{s.phone}</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-bg3 text-text3 text-[10px] font-bold rounded-md border border-border">غير محدد</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="flex items-center gap-1.5 text-green text-xs font-bold">
                      <div className="w-1.5 h-1.5 rounded-full bg-green"></div>
                      نشط
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
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
