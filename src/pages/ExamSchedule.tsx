import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Plus, 
  Trash2, 
  Save, 
  Printer, 
  ArrowRight,
  Clock,
  BookOpen,
  ChevronRight,
  ChevronLeft,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { cn } from '../lib/utils';
import { ExamSchedule } from '../types';
import { sbFetch } from '../services/supabase';

const GRADES = ['الأول الثانوي', 'الثاني الثانوي', 'الثالث الثانوي'];

export const ExamSchedulePage: React.FC = () => {
  const [schedules, setSchedules] = useState<ExamSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [printMode, setPrintMode] = useState(false);

  useEffect(() => {
    fetchSchedules();
  }, []);

  const fetchSchedules = async () => {
    setLoading(true);
    const data = await sbFetch<ExamSchedule>('exam_schedules', 'GET', null, '?order=exam_date,period');
    if (data) {
      // Ensure date is in YYYY-MM-DD format for the date input
      const sanitized = data.map(s => ({
        ...s,
        exam_date: s.exam_date.split('T')[0]
      }));
      setSchedules(sanitized);
    }
    setLoading(false);
  };

  const handleAddDay = () => {
    const lastDate = schedules.length > 0 ? schedules[schedules.length - 1].exam_date : new Date().toISOString().split('T')[0];
    const nextDate = new Date(lastDate);
    nextDate.setDate(nextDate.getDate() + 1);
    const dateStr = nextDate.toISOString().split('T')[0];
    const dayName = new Intl.DateTimeFormat('ar-SA', { weekday: 'long' }).format(nextDate);
    
    const newRows: ExamSchedule[] = GRADES.map(grade => ({
      exam_date: dateStr,
      day_name: dayName,
      grade,
      period: 1,
      subject: '',
      start_time: '07:30',
      end_time: '09:30',
      duration: 'ساعتان'
    }));
    
    setSchedules([...schedules, ...newRows]);
  };

  const handleAddPeriod = (date: string, grade: string) => {
    const dayName = schedules.find(s => s.exam_date === date)?.day_name || '';
    const existingPeriods = schedules.filter(s => s.exam_date === date && s.grade === grade);
    const nextPeriod = existingPeriods.length + 1;

    const newRow: ExamSchedule = {
      exam_date: date,
      day_name: dayName,
      grade,
      period: nextPeriod,
      subject: '',
      start_time: nextPeriod === 1 ? '07:30' : '10:00',
      end_time: nextPeriod === 1 ? '09:30' : '12:00',
      duration: 'ساعتان'
    };

    setSchedules([...schedules, newRow]);
  };

  const handleUpdate = (index: number, field: keyof ExamSchedule, value: any) => {
    if (!schedules[index]) return;
    
    const updated = [...schedules];
    const oldDate = schedules[index].exam_date;
    
    if (field === 'exam_date') {
      if (!value) return;
      // Use T00:00:00 to ensure the date is parsed correctly in local time
      const date = new Date(value + 'T00:00:00');
      const dayName = isNaN(date.getTime()) ? '' : new Intl.DateTimeFormat('ar-SA', { weekday: 'long' }).format(date);
      
      // Update all rows that had the old date
      updated.forEach((s, i) => {
        if (s.exam_date === oldDate) {
          updated[i] = { ...updated[i], exam_date: value, day_name: dayName };
        }
      });
    } else {
      updated[index] = { ...updated[index], [field]: value };
    }
    
    setSchedules(updated);
  };

  const handleRemoveDate = (date: string) => {
    if (!date) return;
    setSchedules(schedules.filter(s => s.exam_date !== date));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Delete all existing and insert new (simple sync for now)
      await sbFetch('exam_schedules', 'DELETE', null, '?id=neq.00000000-0000-0000-0000-000000000000');
      
      if (schedules.length > 0) {
        const toSave = schedules.map(({ id, ...rest }) => rest);
        const res = await sbFetch('exam_schedules', 'POST', toSave);
        
        if (res) {
          alert('تم حفظ الجدول بنجاح');
          fetchSchedules();
        } else {
          alert('حدث خطأ أثناء الحفظ');
        }
      } else {
        alert('تم مسح الجدول بنجاح');
      }
    } catch (error) {
      console.error("Save error:", error);
      alert('حدث خطأ غير متوقع أثناء الحفظ');
    }
    setSaving(false);
  };

  const groupedByDate = schedules.reduce((acc, curr) => {
    if (!curr || !curr.exam_date) return acc;
    if (!acc[curr.exam_date]) acc[curr.exam_date] = { dayName: curr.day_name || '', grades: {} };
    if (!acc[curr.exam_date].grades[curr.grade]) acc[curr.exam_date].grades[curr.grade] = [];
    acc[curr.exam_date].grades[curr.grade].push(curr);
    return acc;
  }, {} as Record<string, { dayName: string, grades: Record<string, ExamSchedule[]> }>);

  const sortedDates = Object.keys(groupedByDate).sort();

  if (printMode) {
    return (
      <div className="bg-white min-h-screen p-0 text-black print:p-0 font-sans" dir="rtl">
        <div className="fixed top-4 right-4 flex gap-2 print:hidden z-50">
          <button 
            onClick={() => setPrintMode(false)}
            className="bg-red text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2 shadow-lg"
          >
            <ArrowRight size={18} /> إغلاق المعاينة
          </button>
          <button 
            onClick={() => window.print()}
            className="bg-accent text-white px-6 py-2 rounded-xl font-bold flex items-center gap-2 shadow-lg"
          >
            <Printer size={18} /> طباعة الآن
          </button>
        </div>

        <div className="p-8 max-w-[210mm] mx-auto border border-gray-200 bg-white shadow-2xl print:shadow-none print:border-none">
          {/* Header */}
          <div className="w-full flex justify-between items-center mb-6 border-b-2 border-black pb-4">
            <div className="text-right space-y-0.5">
              <p className="font-bold text-sm">المملكة العربية السعودية</p>
              <p className="font-bold text-xs">وزارة التعليم</p>
              <p className="font-bold text-xs">الإدارة العامة للتعليم بمحافظة جدة</p>
              <p className="font-bold text-xs">ثانوية الأمير عبدالمجيد الأولى</p>
            </div>
            <div className="w-24 h-16 flex items-center justify-center">
              <img 
                src="https://upload.wikimedia.org/wikipedia/ar/1/17/Saudi_Ministry_of_Education_Logo_2025.png" 
                alt="شعار الوزارة" 
                className="max-h-full max-w-full object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>

          <div className="text-center mb-6">
            <h1 className="text-xl font-black underline decoration-double underline-offset-4">جدول الاختبارات النهائية للفصل الدراسي الأول لعام 1447 هـ</h1>
            <p className="text-lg font-bold mt-2">جدول الاختبارات التحريرية</p>
          </div>

          <table className="w-full border-collapse border-2 border-black text-center text-xs">
            <thead>
              <tr className="bg-gray-100">
                <th className="border-2 border-black p-2 w-20" rowSpan={2}>اليوم</th>
                <th className="border-2 border-black p-2 w-24" rowSpan={2}>التاريخ</th>
                <th className="border-2 border-black p-2 w-12" rowSpan={2}>الفترة</th>
                {GRADES.map(grade => (
                  <th key={grade} className="border-2 border-black p-2" colSpan={2}>{grade}</th>
                ))}
              </tr>
              <tr className="bg-gray-100">
                {GRADES.map(grade => (
                  <React.Fragment key={grade}>
                    <th className="border-2 border-black p-1">المادة</th>
                    <th className="border-2 border-black p-1">الزمن</th>
                  </React.Fragment>
                ))}
              </tr>
            </thead>
            <tbody>
              {sortedDates.map(date => {
                const day = groupedByDate[date];
                const maxPeriods = Math.max(...GRADES.map(g => day.grades[g]?.length || 0));
                
                return Array.from({ length: maxPeriods }).map((_, pIdx) => (
                  <tr key={`${date}-${pIdx}`}>
                    {pIdx === 0 && (
                      <>
                        <td className="border-2 border-black p-2 font-bold" rowSpan={maxPeriods}>{day.dayName}</td>
                        <td className="border-2 border-black p-2 font-mono" rowSpan={maxPeriods}>{date}</td>
                      </>
                    )}
                    <td className="border-2 border-black p-1 font-bold">{pIdx === 0 ? 'الأولى' : 'الثانية'}</td>
                    {GRADES.map(grade => {
                      const slot = day.grades[grade]?.[pIdx];
                      return (
                        <React.Fragment key={grade}>
                          <td className="border-2 border-black p-1 font-bold h-10">{slot?.subject || '------'}</td>
                          <td className="border-2 border-black p-1">{slot?.duration || '-----'}</td>
                        </React.Fragment>
                      );
                    })}
                  </tr>
                ));
              })}
            </tbody>
          </table>

          {/* Instructions */}
          <div className="mt-8 text-right space-y-2">
            <p className="font-bold text-red-600">ملاحظة :</p>
            <ul className="list-disc list-inside text-xs space-y-1 pr-4">
              <li>ضرورة الحضور قبل موعد الاختبار بـ ( 15 دقيقة ) على الأقل .</li>
              <li>يبدأ الاختبار في تمام الساعة ( 7:30 صباحاً ) .</li>
              <li>استخدام القلم الرصاص (2HB) فقط في ورقة الإجابة ( لا يسمح باستخدام القلم ) .</li>
            </ul>
            <p className="text-center font-bold mt-4">مع تمنياتي للجميع بالتفوق و النجاح .</p>
          </div>

          {/* Signatures */}
          <div className="mt-12 grid grid-cols-3 text-center text-xs font-bold">
            <div className="space-y-8">
              <p>وكيل شؤون الطلاب</p>
              <p>أ. محمد القرني</p>
            </div>
            <div className="space-y-4">
              <p>المرشد الطلابي :</p>
              <p>أ. ماجد السفري</p>
              <p>أ. هزاع الشمراني</p>
            </div>
            <div className="space-y-8">
              <p>مدير المدرسة :</p>
              <p>أ. نايف بن أحمد الشهري</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-display font-black flex items-center gap-3">
            <Calendar className="text-purple" />
            معالج جدول الاختبارات
          </h2>
          <p className="text-text3 text-sm mt-1">قم بإعداد وتوزيع المواد على الأيام والفترات لكل مرحلة</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setPrintMode(true)}
            className="flex items-center gap-2 bg-bg3 border border-border text-text px-4 py-2 rounded-xl font-bold hover:bg-card transition-all"
          >
            <Printer size={18} />
            معاينة الطباعة
          </button>
          <button 
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 bg-purple text-white px-6 py-2 rounded-xl font-bold shadow-lg shadow-purple/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
          >
            {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
            حفظ الجدول
          </button>
        </div>
      </div>

      <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-sm">
            <thead className="bg-bg3 text-text3 text-[10px] font-bold uppercase tracking-wider">
              <tr>
                <th className="px-4 py-4 w-40">التاريخ / اليوم</th>
                <th className="px-4 py-4 w-32">المرحلة</th>
                <th className="px-4 py-4 w-24">الفترة</th>
                <th className="px-4 py-4">المادة</th>
                <th className="px-4 py-4 w-32">بداية الاختبار</th>
                <th className="px-4 py-4 w-32">نهاية الاختبار</th>
                <th className="px-4 py-4 w-32">المدة</th>
                <th className="px-4 py-4 w-16"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {loading ? (
                <tr>
                  <td colSpan={8} className="p-20 text-center">
                    <Loader2 className="mx-auto animate-spin text-purple mb-4" size={40} />
                    <p className="text-text3">جاري تحميل الجدول...</p>
                  </td>
                </tr>
              ) : schedules.map((row, idx) => (
                <tr key={idx} className="hover:bg-white/5 transition-colors group">
                  <td className="px-4 py-3">
                    {idx === 0 || schedules[idx-1].exam_date !== row.exam_date ? (
                      <div className="space-y-1">
                        <div className="relative group">
                          <input 
                            type="date" 
                            value={row.exam_date}
                            onChange={(e) => handleUpdate(idx, 'exam_date', e.target.value)}
                            onClick={(e) => (e.target as any).showPicker?.()}
                            className="bg-bg border border-border rounded-lg px-2 py-2 text-xs w-full outline-none focus:border-purple cursor-pointer appearance-none"
                            style={{ colorScheme: 'dark' }}
                          />
                        </div>
                        <div className="text-[10px] font-bold text-purple px-2">{row.day_name}</div>
                      </div>
                    ) : (
                      <div className="text-transparent">.</div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="px-2 py-1 bg-purple/10 text-purple text-[10px] font-bold rounded-md border border-purple/20">
                        {row.grade}
                      </span>
                      <button 
                        onClick={() => handleAddPeriod(row.exam_date, row.grade)}
                        className="p-1 bg-accent/10 text-accent rounded-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-accent hover:text-white"
                        title="إضافة فترة ثانية لهذه المرحلة"
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        "w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold",
                        row.period === 1 ? "bg-blue-500/20 text-blue-400" : "bg-gold/20 text-gold"
                      )}>
                        {row.period}
                      </span>
                      <select 
                        value={row.period}
                        onChange={(e) => handleUpdate(idx, 'period', parseInt(e.target.value))}
                        className="bg-bg border border-border rounded-lg px-2 py-1 text-xs outline-none focus:border-purple"
                      >
                        <option value={1}>الأولى</option>
                        <option value={2}>الثانية</option>
                        <option value={3}>الثالثة</option>
                      </select>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <input 
                      type="text" 
                      placeholder="اسم المادة..."
                      value={row.subject}
                      onChange={(e) => handleUpdate(idx, 'subject', e.target.value)}
                      className="bg-bg border border-border rounded-lg px-3 py-1.5 text-xs w-full outline-none focus:border-purple font-bold"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <input 
                      type="time" 
                      value={row.start_time}
                      onChange={(e) => handleUpdate(idx, 'start_time', e.target.value)}
                      className="bg-bg border border-border rounded-lg px-2 py-1 text-xs w-full outline-none focus:border-purple"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <input 
                      type="time" 
                      value={row.end_time}
                      onChange={(e) => handleUpdate(idx, 'end_time', e.target.value)}
                      className="bg-bg border border-border rounded-lg px-2 py-1 text-xs w-full outline-none focus:border-purple"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <input 
                      type="text" 
                      placeholder="ساعتان..."
                      value={row.duration}
                      onChange={(e) => handleUpdate(idx, 'duration', e.target.value)}
                      className="bg-bg border border-border rounded-lg px-2 py-1 text-xs w-full outline-none focus:border-purple"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <button 
                      onClick={() => {
                        const updated = [...schedules];
                        updated.splice(idx, 1);
                        setSchedules(updated);
                      }}
                      className="p-2 text-red hover:bg-red/10 rounded-lg transition-all"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="p-6 bg-bg3/50 border-t border-border flex justify-between items-center">
          <button 
            onClick={handleAddDay}
            className="flex items-center gap-2 bg-accent text-white px-6 py-2.5 rounded-xl font-bold shadow-lg shadow-accent/20 hover:scale-105 active:scale-95 transition-all"
          >
            <Plus size={18} />
            إضافة يوم جديد (لجميع المراحل)
          </button>
          
          <div className="flex items-center gap-4 text-xs text-text3">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-blue-500"></div>
              <span>فترة أولى</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-gold"></div>
              <span>فترة ثانية</span>
            </div>
            <div className="flex items-center gap-2 text-gold">
              <AlertCircle size={14} />
              يمكنك إضافة فترات إضافية لكل مرحلة عبر زر (+) عند تمرير الماوس
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
