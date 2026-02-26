import React, { useState, useEffect } from 'react';
import { 
  School, 
  Plus, 
  Calendar, 
  Clock, 
  UserSquare2, 
  Search,
  Edit,
  Trash2,
  QrCode,
  Printer,
  RefreshCw,
  ArrowRight,
  CheckCircle2,
  FileText
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { cn } from '../lib/utils';
import { Committee, Student } from '../types';
import { sbFetch } from '../services/supabase';

export const Committees: React.FC = () => {
  const [committees, setCommittees] = useState<Committee[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [printMode, setPrintMode] = useState<'none' | 'door' | 'envelope'>('none');
  const [selectedCommittee, setSelectedCommittee] = useState<Committee | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const [cData, sData] = await Promise.all([
      sbFetch<Committee>('committees', 'GET', null, '?select=*&order=name'),
      sbFetch<Student>('students', 'GET', null, '?select=*')
    ]);
    
    if (cData) setCommittees(cData);
    if (sData) setStudents(sData);
    setLoading(false);
  };

  const handleSyncCommittees = async () => {
    setSyncing(true);
    try {
      // Extract unique committee names from students
      const uniqueCommitteeNames = Array.from(new Set(students.map(s => s.committee_name).filter(Boolean)));
      
      // For each unique name, if it doesn't exist in committees, create it
      for (const name of uniqueCommitteeNames) {
        const exists = committees.find(c => c.name === name);
        if (!exists) {
          const newCommittee = {
            name: name!,
            subject: 'غير محدد',
            exam_date: new Date().toISOString().split('T')[0],
            start_time: '08:00',
            end_time: '10:00',
            status: 'scheduled'
          };
          await sbFetch('committees', 'POST', newCommittee);
        }
      }
      await fetchData();
      alert('تمت مزامنة اللجان بناءً على بيانات الطلاب بنجاح');
    } catch (error) {
      console.error("Sync error:", error);
    } finally {
      setSyncing(false);
    }
  };

  const getStudentCount = (committeeName: string) => {
    return students.filter(s => s.committee_name === committeeName).length;
  };

  const getGradeCounts = (committeeName: string) => {
    const committeeStudents = students.filter(s => s.committee_name === committeeName);
    return {
      first: committeeStudents.filter(s => s.grade.includes('الأول')).length,
      second: committeeStudents.filter(s => s.grade.includes('الثاني')).length,
      third: committeeStudents.filter(s => s.grade.includes('الثالث')).length
    };
  };

  const handlePrint = () => {
    window.print();
  };

  if (printMode !== 'none') {
    const committeesToPrint = selectedCommittee ? [selectedCommittee] : committees;

    return (
      <div className="bg-white min-h-screen p-0 m-0 text-black print:p-0 font-sans" dir="rtl">
        <div className="fixed top-4 right-4 flex gap-2 print:hidden z-50">
          <button 
            onClick={() => setPrintMode('none')}
            className="bg-red text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2 shadow-lg"
          >
            <ArrowRight size={18} /> إغلاق المعاينة
          </button>
          <button 
            onClick={handlePrint}
            className="bg-accent text-white px-6 py-2 rounded-xl font-bold flex items-center gap-2 shadow-lg"
          >
            <Printer size={18} /> طباعة الآن
          </button>
        </div>

        <div className="space-y-0 p-0">
          {committeesToPrint.map((c, idx) => {
            const counts = getGradeCounts(c.name);
            return (
              <div key={idx} className="page-break-after-always border-[12px] border-double border-black p-8 h-[1050px] flex flex-col items-center justify-between text-center relative overflow-hidden bg-white">
                {/* Header Section */}
                <div className="w-full flex justify-between items-center mb-2 border-b-2 border-black pb-4">
                  <div className="text-right space-y-0.5">
                    <p className="font-bold text-lg">المملكة العربية السعودية</p>
                    <p className="font-bold text-base">وزارة التعليم</p>
                    <p className="font-bold text-base">الإدارة العامة للتعليم بمحافظة جدة</p>
                    <p className="font-bold text-base">ثانوية الأمير عبدالمجيد الأولى</p>
                  </div>
                  <div className="w-32 h-20 flex items-center justify-center">
                    <img 
                      src="https://upload.wikimedia.org/wikipedia/ar/1/17/Saudi_Ministry_of_Education_Logo_2025.png" 
                      alt="شعار الوزارة" 
                      className="max-h-full max-w-full object-contain"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 flex flex-col items-center justify-center space-y-8 w-full">
                  <div className="space-y-2">
                    <h1 className="text-5xl font-black tracking-widest">لجنة</h1>
                    <div className="bg-black text-white py-4 px-12 rounded-[30px] inline-block shadow-xl">
                      <span className="text-[100px] font-black leading-none">{c.name}</span>
                    </div>
                  </div>
                  
                  {/* Grade Counts Section */}
                  <div className="w-full max-w-2xl grid grid-cols-3 gap-4 mt-6">
                    <div className="border-2 border-black p-4 rounded-[24px] bg-gray-50 flex flex-col items-center justify-center">
                      <p className="text-lg font-bold mb-2 border-b border-black pb-1 w-full">أول ثانوي</p>
                      <p className="text-5xl font-black">{counts.first}</p>
                    </div>
                    <div className="border-2 border-black p-4 rounded-[24px] bg-gray-50 flex flex-col items-center justify-center">
                      <p className="text-lg font-bold mb-2 border-b border-black pb-1 w-full">ثاني ثانوي</p>
                      <p className="text-5xl font-black">{counts.second}</p>
                    </div>
                    <div className="border-2 border-black p-4 rounded-[24px] bg-gray-50 flex flex-col items-center justify-center">
                      <p className="text-lg font-bold mb-2 border-b border-black pb-1 w-full">ثالث ثانوي</p>
                      <p className="text-5xl font-black">{counts.third}</p>
                    </div>
                  </div>

                  {/* QR Code Section */}
                  <div className="mt-4 p-6 border-2 border-black rounded-[30px] bg-white flex flex-col items-center gap-2 shadow-lg">
                    <QRCodeSVG 
                      value={JSON.stringify({ type: 'committee', id: c.id, name: c.name })} 
                      size={200}
                      level="H"
                      includeMargin={true}
                    />
                    <p className="font-black text-xl mt-1">نظام التحضير الذكي</p>
                  </div>
                </div>

                {/* Footer */}
                <div className="w-full mt-4 pt-4 border-t-2 border-black flex justify-between items-end">
                  <div className="text-right">
                    <p className="font-bold text-base">المعلم المراقب:</p>
                    <p className="text-xl font-black mt-2 border-b border-dotted border-black w-48 pb-1">
                      {c.teacher_name || ''}
                    </p>
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-base">مدير المدرسة:</p>
                    <p className="text-lg font-black mt-2">................................</p>
                  </div>
                </div>

                {/* Background Decoration */}
                <div className="absolute inset-0 opacity-[0.02] pointer-events-none flex items-center justify-center">
                  <img 
                    src="https://upload.wikimedia.org/wikipedia/ar/1/17/Saudi_Ministry_of_Education_Logo_2025.png" 
                    alt="" 
                    className="w-[800px] grayscale"
                    referrerPolicy="no-referrer"
                  />
                </div>
              </div>
            );
          })}
        </div>
        
        <style dangerouslySetInnerHTML={{ __html: `
          @media print {
            body { background: white !important; }
            .page-break-after-always { page-break-after: always; }
          }
        `}} />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Stats & Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-2xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
            <School size={24} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-text3 uppercase tracking-wider">إجمالي اللجان</p>
            <p className="text-2xl font-black text-text">{committees.length}</p>
          </div>
        </div>
        
        <div className="md:col-span-2 flex items-center gap-3">
          <button 
            onClick={handleSyncCommittees}
            disabled={syncing}
            className="flex-1 bg-accent text-white font-bold h-full rounded-2xl hover:bg-accent/90 transition-all flex items-center justify-center gap-2 shadow-lg shadow-accent/20"
          >
            {syncing ? <RefreshCw size={20} className="animate-spin" /> : <RefreshCw size={20} />}
            مزامنة اللجان من بيانات الطلاب
          </button>
          <button 
            onClick={() => setPrintMode('door')}
            className="px-6 bg-gold text-black font-bold h-full rounded-2xl hover:bg-gold/90 transition-all flex items-center justify-center gap-2 shadow-lg shadow-gold/20"
          >
            <Printer size={20} />
            طباعة لوحات الأبواب
          </button>
        </div>
      </div>

      {/* Committees List */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-border flex items-center justify-between">
          <h3 className="font-bold text-sm">إدارة اللجان والاختبارات</h3>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-text3" size={16} />
              <input 
                type="text" 
                placeholder="بحث عن لجنة..." 
                className="bg-bg3 border border-border rounded-xl pr-10 pl-4 py-2 text-xs outline-none focus:border-accent w-48"
              />
            </div>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-20 text-center">
              <Loader2 className="mx-auto animate-spin text-accent mb-4" size={40} />
              <p className="text-text3 text-sm">جاري تحميل اللجان...</p>
            </div>
          ) : (
            <table className="w-full text-right text-sm">
              <thead className="bg-bg3/50 text-text3 text-[10px] font-bold uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3">اللجنة</th>
                  <th className="px-6 py-3">المادة</th>
                  <th className="px-6 py-3">المعلم المراقب</th>
                  <th className="px-6 py-3">عدد الطلاب</th>
                  <th className="px-6 py-3">التاريخ والوقت</th>
                  <th className="px-6 py-3">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {committees.map((c, i) => (
                  <tr key={i} className="hover:bg-white/5 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-bg3 flex items-center justify-center font-black text-accent border border-border group-hover:border-accent/50 transition-all">
                          {c.name}
                        </div>
                        <span className="font-bold text-text">لجنة {c.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-text2 font-medium">{c.subject}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-text3">
                        <UserSquare2 size={14} />
                        <span className="text-xs">{c.teacher_name || 'لم يحدد'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="inline-flex items-center gap-2 px-3 py-1 bg-accent/10 text-accent rounded-full text-xs font-bold">
                        {getStudentCount(c.name)} طالب
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 text-xs text-text2">
                          <Calendar size={12} />
                          {c.exam_date}
                        </div>
                        <div className="flex items-center gap-1 text-[10px] text-text3">
                          <Clock size={12} />
                          {c.start_time} - {c.end_time}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => {
                            setSelectedCommittee(c);
                            setPrintMode('door');
                          }}
                          className="p-2 bg-bg3 text-text3 rounded-xl hover:text-accent hover:bg-accent/10 transition-all"
                          title="طباعة لوحة الباب"
                        >
                          <Printer size={16} />
                        </button>
                        <button 
                          onClick={() => {
                            setSelectedCommittee(c);
                            setPrintMode('envelope');
                          }}
                          className="p-2 bg-bg3 text-text3 rounded-xl hover:text-gold hover:bg-gold/10 transition-all"
                          title="طباعة ملصق المظروف"
                        >
                          <FileText size={16} />
                        </button>
                        <button className="p-2 bg-bg3 text-text3 rounded-xl hover:text-accent transition-all"><Edit size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {committees.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-10 text-center">
                      <div className="max-w-xs mx-auto space-y-3">
                        <div className="w-16 h-16 bg-bg3 rounded-full flex items-center justify-center mx-auto text-text3">
                          <School size={32} />
                        </div>
                        <p className="text-text3 text-sm">لا توجد لجان حالياً. قم بمزامنة اللجان من بيانات الطلاب المستوردة.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

const Loader2 = ({ className, size }: { className?: string, size?: number }) => (
  <RefreshCw className={cn("animate-spin", className)} size={size} />
);
