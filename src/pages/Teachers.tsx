import React, { useState } from 'react';
import { 
  UserSquare2, 
  Upload, 
  Search, 
  Plus, 
  Trash2, 
  Edit, 
  QrCode,
  Smartphone,
  Info
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { cn } from '../lib/utils';
import { Teacher } from '../types';

const initialTeachers: Teacher[] = [
  { teacher_no: 'T001', full_name: 'أحمد محمد السيد', phone: '0501234567' },
  { teacher_no: 'T002', full_name: 'خالد سعد الأحمدي', phone: '0502345678' },
  { teacher_no: 'T003', full_name: 'محمد علي العتيبي', phone: '0503456789' },
  { teacher_no: 'T004', full_name: 'سعد عمر الغامدي', phone: '0504567890' },
  { teacher_no: 'T005', full_name: 'عمر ناصر الشهري', phone: '0505678901' },
];

export const Teachers: React.FC = () => {
  const [teachers, setTeachers] = useState<Teacher[]>(initialTeachers);
  const [search, setSearch] = useState('');
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);

  const filteredTeachers = teachers.filter(t => 
    t.full_name.includes(search) || t.teacher_no.includes(search)
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Add/Import Section */}
        <div className="bg-card border border-border rounded-2xl p-6">
          <h3 className="font-bold text-sm mb-4 flex items-center gap-2">
            <Upload size={18} className="text-accent" />
            استيراد بيانات المعلمين
          </h3>
          <div className="border-2 border-dashed border-border rounded-2xl p-8 text-center cursor-pointer hover:bg-accent/5 hover:border-accent transition-all group">
            <div className="w-14 h-14 bg-bg3 rounded-2xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
              <Upload size={28} className="text-text3 group-hover:text-accent" />
            </div>
            <h4 className="font-bold text-text text-sm mb-1">رفع ملف Excel</h4>
            <p className="text-[10px] text-text3">رقم المعلم، الاسم، رقم الجوال</p>
          </div>
          
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-border"></span></div>
            <div className="relative flex justify-center text-[10px] uppercase font-bold"><span className="bg-card px-2 text-text3 tracking-widest">أو إضافة يدوية</span></div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-text2">رقم المعلم *</label>
              <input className="w-full bg-bg3 border border-border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-accent" placeholder="مثال: T001" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-text2">اسم المعلم *</label>
              <input className="w-full bg-bg3 border border-border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-accent" placeholder="الاسم الرباعي" />
            </div>
            <div className="col-span-2 space-y-1.5">
              <label className="text-xs font-bold text-text2">رقم الجوال *</label>
              <input className="w-full bg-bg3 border border-border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-accent" placeholder="+966 5xxxxxxxx" />
            </div>
          </div>
          <button className="w-full mt-6 bg-accent text-white font-bold py-3 rounded-xl hover:bg-accent/90 transition-all flex items-center justify-center gap-2">
            <Plus size={18} />
            إضافة معلم وإنشاء QR
          </button>
        </div>

        {/* QR Preview */}
        <div className="bg-card border border-border rounded-2xl p-6 flex flex-col items-center justify-center text-center">
          <h3 className="font-bold text-sm mb-6 w-full text-right flex items-center gap-2">
            <QrCode size={18} className="text-gold" />
            رمز QR المعلم
          </h3>
          
          {selectedTeacher ? (
            <div className="animate-in zoom-in duration-300">
              <div className="bg-white p-6 rounded-2xl shadow-2xl shadow-black/50 mb-6">
                <QRCodeSVG 
                  value={JSON.stringify({ 
                    type: 'teacher', 
                    no: selectedTeacher.teacher_no, 
                    name: selectedTeacher.full_name, 
                    phone: selectedTeacher.phone 
                  })} 
                  size={180}
                  level="H"
                  includeMargin={false}
                />
              </div>
              <h4 className="font-display font-extrabold text-lg text-text">{selectedTeacher.full_name}</h4>
              <p className="text-sm text-text3 mt-1">{selectedTeacher.teacher_no} | {selectedTeacher.phone}</p>
              <button className="mt-6 px-8 py-2.5 bg-bg3 border border-border rounded-xl text-text2 font-bold hover:text-text transition-all">
                🖨️ طباعة الرمز
              </button>
            </div>
          ) : (
            <div className="py-12 opacity-40">
              <Smartphone size={64} className="mx-auto mb-4 text-text3" />
              <p className="text-sm text-text3 font-medium">اختر معلماً من القائمة لعرض رمز QR الخاص به</p>
            </div>
          )}
        </div>
      </div>

      {/* Teachers Table */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-border flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h3 className="font-bold text-sm">قائمة المعلمين</h3>
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-text3" size={16} />
            <input 
              type="text" 
              placeholder="بحث عن معلم..." 
              className="bg-bg3 border border-border rounded-xl pr-10 pl-4 py-2 text-sm outline-none focus:border-accent w-64"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-right text-sm">
            <thead className="bg-bg3/50 text-text3 text-[10px] font-bold uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3">رقم المعلم</th>
                <th className="px-6 py-3">الاسم</th>
                <th className="px-6 py-3">الجوال</th>
                <th className="px-6 py-3">اللجان المسندة</th>
                <th className="px-6 py-3">آخر نشاط</th>
                <th className="px-6 py-3">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {filteredTeachers.map((t, i) => (
                <tr 
                  key={i} 
                  className={cn(
                    "hover:bg-white/5 transition-colors cursor-pointer",
                    selectedTeacher?.teacher_no === t.teacher_no && "bg-accent/5"
                  )}
                  onClick={() => setSelectedTeacher(t)}
                >
                  <td className="px-6 py-4 font-bold text-text">{t.teacher_no}</td>
                  <td className="px-6 py-4 text-text2">{t.full_name}</td>
                  <td className="px-6 py-4 text-text3 font-mono text-xs" dir="ltr">{t.phone}</td>
                  <td className="px-6 py-4">
                    <div className="flex gap-1">
                      <span className="px-2 py-0.5 bg-bg3 border border-border rounded-md text-[10px] text-text3">لجنة 1A</span>
                      <span className="px-2 py-0.5 bg-bg3 border border-border rounded-md text-[10px] text-text3">لجنة 2B</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-green/10 text-green text-[10px] font-bold rounded-md border border-green/20">اليوم</span>
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
