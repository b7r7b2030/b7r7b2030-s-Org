import React, { useState, useEffect } from 'react';
import { 
  QrCode, 
  Printer, 
  Smartphone, 
  Package, 
  UserSquare2, 
  School,
  Download,
  Info,
  RefreshCw
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { cn } from '../lib/utils';
import { sbFetch } from '../services/supabase';
import { Teacher, Committee } from '../types';

export const QRCodes: React.FC = () => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [committees, setCommittees] = useState<Committee[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTeacher, setSelectedTeacher] = useState('');
  const [selectedCommittee, setSelectedCommittee] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const [tData, cData] = await Promise.all([
      sbFetch<Teacher>('teachers', 'GET', null, '?select=*&order=full_name'),
      sbFetch<Committee>('committees', 'GET', null, '?select=*&order=name')
    ]);
    if (tData) setTeachers(tData);
    if (cData) {
      const sorted = [...cData].sort((a, b) => 
        a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' })
      );
      setCommittees(sorted);
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {loading ? (
        <div className="flex flex-col items-center justify-center p-20">
          <RefreshCw size={48} className="text-accent animate-spin mb-4" />
          <p className="text-text3">جاري تحميل البيانات...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Teacher QR */}
          <div className="bg-card border border-border rounded-2xl p-6 flex flex-col">
            <h3 className="font-bold text-sm mb-6 flex items-center gap-2">
              <UserSquare2 size={18} className="text-accent" />
              QR معلم
            </h3>
            <div className="space-y-4 flex-1">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-text2">اختر المعلم</label>
                <select 
                  className="w-full bg-bg3 border border-border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-accent"
                  value={selectedTeacher}
                  onChange={(e) => setSelectedTeacher(e.target.value)}
                >
                  <option value="">— اختر —</option>
                  {teachers.map(t => (
                    <option key={t.id} value={JSON.stringify({ type: 'teacher', no: t.teacher_no, name: t.full_name })}>
                      {t.teacher_no} - {t.full_name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="flex-1 flex flex-col items-center justify-center min-h-[200px] border border-border/50 rounded-2xl bg-bg/50">
                {selectedTeacher ? (
                  <div className="animate-in zoom-in duration-300 text-center">
                    <div className="bg-white p-4 rounded-xl mb-3">
                      <QRCodeSVG value={selectedTeacher} size={120} />
                    </div>
                    <span className="text-[10px] font-bold text-text2">{JSON.parse(selectedTeacher).name}</span>
                  </div>
                ) : (
                  <div className="text-center opacity-30">
                    <Smartphone size={48} className="mx-auto mb-2" />
                    <p className="text-[10px] font-medium">اختر معلماً أولاً</p>
                  </div>
                )}
              </div>
            </div>
            <button className="w-full mt-6 py-2.5 bg-bg3 border border-border rounded-xl text-xs font-bold text-text2 hover:text-text transition-all flex items-center justify-center gap-2">
              <Printer size={16} />
              طباعة الرمز
            </button>
          </div>

          {/* Envelope QR */}
          <div className="bg-card border border-border rounded-2xl p-6 flex flex-col">
            <h3 className="font-bold text-sm mb-6 flex items-center gap-2">
              <Package size={18} className="text-gold" />
              QR مظروف
            </h3>
            <div className="space-y-4 flex-1">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-text2">اختر اللجنة</label>
                <select 
                  className="w-full bg-bg3 border border-border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-accent"
                  value={selectedCommittee}
                  onChange={(e) => setSelectedCommittee(e.target.value)}
                >
                  <option value="">— اختر —</option>
                  {committees.map(c => (
                    <option key={c.id} value={JSON.stringify({ type: 'envelope', committee: c.name })}>
                      لجنة {c.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="flex-1 flex flex-col items-center justify-center min-h-[200px] border border-border/50 rounded-2xl bg-bg/50">
                {selectedCommittee ? (
                  <div className="animate-in zoom-in duration-300 text-center">
                    <div className="bg-white p-4 rounded-xl mb-3">
                      <QRCodeSVG value={selectedCommittee} size={120} />
                    </div>
                    <span className="text-[10px] font-bold text-text2">مظروف لجنة {JSON.parse(selectedCommittee).committee}</span>
                  </div>
                ) : (
                  <div className="text-center opacity-30">
                    <Package size={48} className="mx-auto mb-2" />
                    <p className="text-[10px] font-medium">اختر لجنة أولاً</p>
                  </div>
                )}
              </div>
            </div>
            <button className="w-full mt-6 py-2.5 bg-bg3 border border-border rounded-xl text-xs font-bold text-text2 hover:text-text transition-all flex items-center justify-center gap-2">
              <Printer size={16} />
              طباعة الرمز
            </button>
          </div>

          {/* Bulk Printing */}
          <div className="bg-card border border-border rounded-2xl p-6">
            <h3 className="font-bold text-sm mb-6 flex items-center gap-2">
              <Printer size={18} className="text-purple" />
              طباعة دفعية
            </h3>
            <p className="text-xs text-text3 leading-relaxed mb-6">
              اطبع رموز QR لجميع المعلمين أو جميع المظاريف دفعة واحدة بتنسيق جاهز للطباعة.
            </p>
            <div className="space-y-3">
              <button className="w-full py-3 bg-accent text-white font-bold rounded-xl hover:bg-accent/90 transition-all flex items-center justify-center gap-2">
                <UserSquare2 size={18} />
                طباعة QR كل المعلمين
              </button>
              <button className="w-full py-3 bg-gold text-black font-bold rounded-xl hover:bg-gold/90 transition-all flex items-center justify-center gap-2">
                <Package size={18} />
                طباعة QR كل المظاريف
              </button>
            </div>
            <div className="mt-6 p-4 bg-gold/5 border border-gold/10 rounded-xl flex items-start gap-3">
              <Info size={16} className="text-gold shrink-0 mt-0.5" />
              <p className="text-[10px] text-text2 leading-relaxed">
                يُنصح بطباعة QR المظاريف على الورق اللاصق وإلصاقها على المظاريف الفعلية لتسهيل عملية المسح.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
