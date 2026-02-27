import React, { useState, useEffect } from 'react';
import { 
  Users, 
  School, 
  Calendar as CalendarIcon, 
  Clock, 
  Plus, 
  Trash2, 
  Save, 
  RefreshCw,
  Search,
  CheckCircle2,
  AlertCircle,
  Printer,
  ArrowRight,
  FileText
} from 'lucide-react';
import { cn } from '../lib/utils';
import { Teacher, Committee, TeacherAssignment as Assignment, ExamSchedule } from '../types';
import { sbFetch } from '../services/supabase';

export const TeacherAssignment: React.FC = () => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [committees, setCommittees] = useState<Committee[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [schedules, setSchedules] = useState<ExamSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [selectedPeriod, setSelectedPeriod] = useState<number>(1);
  const [printMode, setPrintMode] = useState(false);
  const [semester, setSemester] = useState('الفصل الدراسي الأول');
  const [academicYear, setAcademicYear] = useState('١٤٤٧ هـ');
  const [vicePrincipal, setVicePrincipal] = useState('أ. محمد القرني');
  const [principal, setPrincipal] = useState('أ. نايف بن أحمد الشهري');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const [tData, cData, aData, sData] = await Promise.all([
      sbFetch<Teacher>('teachers', 'GET', null, '?select=*&order=full_name'),
      sbFetch<Committee>('committees', 'GET', null, '?select=*&order=name'),
      sbFetch<Assignment>('teacher_assignments', 'GET', null, '?select=*'),
      sbFetch<ExamSchedule>('exam_schedules', 'GET', null, '?select=*')
    ]);
    
    if (tData) setTeachers(tData);
    if (cData) {
      const sorted = [...cData].sort((a, b) => 
        a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' })
      );
      setCommittees(sorted);
    }
    if (aData) setAssignments(aData);
    if (sData) {
      setSchedules(sData);
      if (sData.length > 0) {
        setSelectedDate(sData[0].exam_date);
        if (sData[0].semester) setSemester(sData[0].semester);
        if (sData[0].academic_year) setAcademicYear(sData[0].academic_year);
        if (sData[0].vice_principal) setVicePrincipal(sData[0].vice_principal);
        if (sData[0].principal) setPrincipal(sData[0].principal);
      }
    }
    setLoading(false);
  };

  const uniqueDates = Array.from(new Set(schedules.map(s => s.exam_date))).sort();

  const handleAssign = (teacherId: string, committeeId: string, slot: number) => {
    const existingIndex = assignments.findIndex(
      a => a.exam_date === selectedDate && a.period === selectedPeriod && a.committee_id === committeeId && a.slot === slot
    );

    const newAssignments = [...assignments];
    const assignment: Assignment = {
      teacher_id: teacherId,
      committee_id: committeeId,
      exam_date: selectedDate,
      period: selectedPeriod,
      slot: slot
    };

    if (existingIndex >= 0) {
      newAssignments[existingIndex] = assignment;
    } else {
      newAssignments.push(assignment);
    }

    setAssignments(newAssignments);
  };

  const handleRemove = (committeeId: string, slot: number) => {
    setAssignments(assignments.filter(
      a => !(a.exam_date === selectedDate && a.period === selectedPeriod && a.committee_id === committeeId && a.slot === slot)
    ));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Clear current assignments for this date/period and re-insert
      await sbFetch('teacher_assignments', 'DELETE', null, `?exam_date=eq.${selectedDate}&period=eq.${selectedPeriod}`);
      
      const toSave = assignments
        .filter(a => a.exam_date === selectedDate && a.period === selectedPeriod)
        .map(({ id, ...rest }) => rest);

      if (toSave.length > 0) {
        await sbFetch('teacher_assignments', 'POST', toSave);
      }

      // Update semester/year in schedules for this date
      const scheduleIds = schedules.filter(s => s.exam_date === selectedDate).map(s => s.id);
      for (const id of scheduleIds) {
        await sbFetch('exam_schedules', 'PATCH', { 
          semester, 
          academic_year: academicYear,
          vice_principal: vicePrincipal,
          principal: principal
        }, `?id=eq.${id}`);
      }
      
      alert('تم حفظ توزيع المعلمين بنجاح');
      fetchData();
    } catch (error) {
      console.error("Save error:", error);
      alert('حدث خطأ أثناء الحفظ');
    }
    setSaving(false);
  };

  const getAssignedTeacherId = (committeeId: string, slot: number) => {
    return assignments.find(
      a => a.exam_date === selectedDate && a.period === selectedPeriod && a.committee_id === committeeId && a.slot === slot
    )?.teacher_id;
  };

  const isTeacherAssignedElsewhere = (teacherId: string, currentCommitteeId: string, currentSlot: number) => {
    return assignments.some(
      a => a.exam_date === selectedDate && 
           a.period === selectedPeriod && 
           a.teacher_id === teacherId && 
           !(a.committee_id === currentCommitteeId && a.slot === currentSlot)
    );
  };

  const handlePrint = () => {
    window.print();
  };

  if (printMode) {
    const currentDaySchedules = schedules.filter(s => s.exam_date === selectedDate && s.period === selectedPeriod);
    const dayName = currentDaySchedules[0]?.day_name || '—';
    
    // Group teachers by committee for the report
    const reportData: any[] = [];
    committees.forEach(c => {
      const slot1TeacherId = getAssignedTeacherId(c.id!, 1);
      const slot2TeacherId = getAssignedTeacherId(c.id!, 2);
      
      if (slot1TeacherId) {
        const t = teachers.find(t => t.id === slot1TeacherId);
        reportData.push({
          teacherName: t?.full_name || '—',
          committeeName: c.name,
          location: c.location || '—',
          subjects: currentDaySchedules.map(s => s.subject).join(' / ')
        });
      }
      if (slot2TeacherId) {
        const t = teachers.find(t => t.id === slot2TeacherId);
        reportData.push({
          teacherName: t?.full_name || '—',
          committeeName: c.name,
          location: c.location || '—',
          subjects: currentDaySchedules.map(s => s.subject).join(' / ')
        });
      }
    });

    return (
      <div className="bg-white min-h-screen p-0 m-0 text-black print:p-0 font-sans" dir="rtl">
        <style dangerouslySetInnerHTML={{ __html: `
          @media print {
            @page { 
              size: A4; 
              margin: 0mm; 
            }
            body { 
              background: white !important; 
              margin: 0;
              padding: 0;
              -webkit-print-color-adjust: exact;
            }
            .fixed { display: none !important; }
            .print-container {
              width: 210mm;
              min-height: 297mm;
              padding: 15mm;
              margin: 0 auto;
              box-sizing: border-box;
              position: relative;
            }
            /* Hide browser headers/footers */
            header, footer, .no-print { display: none !important; }
            
            /* Dynamic font scaling based on row count */
            table { 
              width: 100%;
              font-size: ${reportData.length > 25 ? '7pt' : reportData.length > 20 ? '8pt' : '9pt'};
            }
            th, td { padding: 4px !important; border-width: 1.5pt !important; }
            h2 { font-size: 14pt !important; }
          }
          .print-container {
            background: white;
            width: 210mm;
            margin: 0 auto;
            padding: 15mm;
          }
        `}} />

        <div className="fixed top-4 right-4 flex gap-2 print:hidden z-50">
          <button 
            onClick={() => setPrintMode(false)}
            className="bg-red text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2 shadow-lg"
          >
            <ArrowRight size={18} /> إغلاق المعاينة
          </button>
          <button 
            onClick={handlePrint}
            className="bg-accent text-white px-6 py-2 rounded-xl font-bold flex items-center gap-2 shadow-lg"
          >
            <Printer size={18} /> طباعة التقرير
          </button>
        </div>

        <div className="print-container shadow-2xl print:shadow-none">
          {/* Header */}
          <div className="flex justify-between items-start mb-6 border-b-2 border-black pb-4">
            <div className="text-right space-y-1">
              <p className="font-bold text-lg">المملكة العربية السعودية</p>
              <p className="font-bold text-base">الإدارة العامة للتعليم بمحافظة جدة</p>
              <p className="font-bold text-base">ثانوية الأمير عبدالمجيد الأولى</p>
            </div>
            <div className="text-center">
              <img 
                src="https://upload.wikimedia.org/wikipedia/ar/1/17/Saudi_Ministry_of_Education_Logo_2025.png" 
                alt="Logo" 
                className="h-20 object-contain mx-auto"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>

          <div className="text-center mb-6">
            <h2 className="text-xl font-black mb-2">توزيع الملاحظين أثناء اختبار نهاية {semester} لعام {academicYear}</h2>
            <div className="bg-gray-100 py-2 px-4 rounded-lg inline-block border border-black">
              <p className="font-bold">اليوم: {dayName} - التاريخ: {selectedDate}</p>
            </div>
          </div>

          <div className="mb-4 bg-gray-200 py-1 text-center font-black border border-black">
            الفترة {selectedPeriod === 1 ? 'الأولى' : selectedPeriod === 2 ? 'الثانية' : 'الثالثة'}
          </div>

          {reportData.length === 0 ? (
            <div className="p-20 text-center border-2 border-dashed border-gray-300 rounded-2xl">
              <p className="text-gray-500 font-bold">لا يوجد معلمين مكلفين لهذه الفترة حالياً</p>
            </div>
          ) : (
            <table className="w-full border-collapse border-2 border-black text-center">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border-2 border-black p-2 w-12">#</th>
                  <th className="border-2 border-black p-2">اسم المعلم</th>
                  <th className="border-2 border-black p-2 w-20">اللجنة</th>
                  <th className="border-2 border-black p-2">مقر اللجنة</th>
                  <th className="border-2 border-black p-2 w-32">التوقيع</th>
                  <th className="border-2 border-black p-2">مواد الاختبار</th>
                </tr>
              </thead>
              <tbody>
                {reportData.map((row, idx) => (
                  <tr key={idx}>
                    <td className="border border-black p-2 text-center">{idx + 1}</td>
                    <td className="border border-black p-2 font-bold">{row.teacherName}</td>
                    <td className="border border-black p-2 text-center font-black">{row.committeeName}</td>
                    <td className="border border-black p-2 text-center">{row.location}</td>
                    <td className="border border-black p-2 h-10"></td>
                    <td className="border border-black p-2 text-xs">{row.subjects}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          <div className="mt-12 flex justify-between px-12">
            <div className="text-center">
              <p className="font-bold mb-8">وكيل شؤون الطلاب</p>
              <p className="font-black">{vicePrincipal}</p>
            </div>
            <div className="text-center">
              <p className="font-bold mb-8">مدير المدرسة</p>
              <p className="font-black">{principal}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-20">
        <RefreshCw size={48} className="text-accent animate-spin mb-4" />
        <p className="text-text3">جاري تحميل البيانات...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header & Filters */}
      <div className="bg-card border border-border rounded-3xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <h2 className="text-xl font-black text-text flex items-center gap-2">
              <Users className="text-accent" />
              توزيع المعلمين على اللجان
            </h2>
            <p className="text-xs text-text3">قم بتوزيع المراقبين على اللجان لكل يوم وفترة بشكل مستقل.</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-text3 uppercase px-1">الفصل الدراسي</label>
              <select 
                value={semester}
                onChange={(e) => setSemester(e.target.value)}
                className="bg-bg3 border border-border rounded-xl px-4 py-2 text-sm outline-none focus:border-accent"
              >
                <option value="الفصل الدراسي الأول">الفصل الدراسي الأول</option>
                <option value="الفصل الدراسي الثاني">الفصل الدراسي الثاني</option>
                <option value="الفصل الدراسي الثالث">الفصل الدراسي الثالث</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-text3 uppercase px-1">العام الدراسي</label>
              <input 
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value)}
                placeholder="مثال: ١٤٤٧ هـ"
                className="bg-bg3 border border-border rounded-xl px-4 py-2 text-sm outline-none focus:border-accent w-32"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-text3 uppercase px-1">وكيل شؤون الطلاب</label>
              <input 
                value={vicePrincipal}
                onChange={(e) => setVicePrincipal(e.target.value)}
                className="bg-bg3 border border-border rounded-xl px-4 py-2 text-sm outline-none focus:border-accent w-48"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-text3 uppercase px-1">مدير المدرسة</label>
              <input 
                value={principal}
                onChange={(e) => setPrincipal(e.target.value)}
                className="bg-bg3 border border-border rounded-xl px-4 py-2 text-sm outline-none focus:border-accent w-48"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-text3 uppercase px-1">اليوم والتاريخ</label>
              <select 
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-bg3 border border-border rounded-xl px-4 py-2 text-sm outline-none focus:border-accent min-w-[180px]"
              >
                {uniqueDates.map(date => (
                  <option key={date} value={date}>{date}</option>
                ))}
                {uniqueDates.length === 0 && <option value="">لا يوجد تواريخ مجدولة</option>}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-text3 uppercase px-1">الفترة</label>
              <div className="flex bg-bg3 p-1 rounded-xl border border-border">
                {[1, 2, 3].map(p => (
                  <button
                    key={p}
                    onClick={() => setSelectedPeriod(p)}
                    className={cn(
                      "px-4 py-1.5 rounded-lg text-xs font-bold transition-all",
                      selectedPeriod === p ? "bg-accent text-white shadow-lg" : "text-text3 hover:text-text"
                    )}
                  >
                    الفترة {p}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-2 mt-auto">
              <button 
                onClick={handleSave}
                disabled={saving}
                className="bg-accent text-white font-bold px-6 py-2.5 rounded-xl hover:bg-accent/90 transition-all flex items-center gap-2 shadow-lg shadow-accent/20"
              >
                {saving ? <RefreshCw size={18} className="animate-spin" /> : <Save size={18} />}
                حفظ التوزيع
              </button>
              <button 
                onClick={() => setPrintMode(true)}
                className="bg-gold text-black font-bold px-6 py-2.5 rounded-xl hover:bg-gold/90 transition-all flex items-center gap-2 shadow-lg shadow-gold/20"
              >
                <Printer size={18} />
                طباعة التقرير
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Assignment Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Committees List */}
        <div className="xl:col-span-2 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {committees.map(committee => {
              const teacher1Id = getAssignedTeacherId(committee.id!, 1);
              const teacher2Id = getAssignedTeacherId(committee.id!, 2);
              const teacher1 = teachers.find(t => t.id === teacher1Id);
              const teacher2 = teachers.find(t => t.id === teacher2Id);

              return (
                <div 
                  key={committee.id}
                  className={cn(
                    "bg-card border rounded-2xl p-5 transition-all group",
                    (teacher1Id || teacher2Id) ? "border-accent/30 bg-accent/5" : "border-border hover:border-accent/50"
                  )}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-12 h-12 rounded-xl flex items-center justify-center font-black text-lg border transition-all",
                        (teacher1Id || teacher2Id) ? "bg-accent text-white border-accent" : "bg-bg3 text-text3 border-border"
                      )}>
                        {committee.name}
                      </div>
                      <div>
                        <h4 className="font-bold text-text">لجنة {committee.name}</h4>
                        <p className="text-[10px] text-text3 flex items-center gap-1">
                          <School size={10} /> {committee.location || 'بدون مقر'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] font-bold text-text3 uppercase flex items-center gap-1">
                          <Users size={10} /> المراقب الأول
                        </label>
                        {teacher1Id && (
                          <button 
                            onClick={() => handleRemove(committee.id!, 1)}
                            className="text-text3 hover:text-red transition-all"
                          >
                            <Trash2 size={12} />
                          </button>
                        )}
                      </div>
                      <select 
                        value={teacher1Id || ''}
                        onChange={(e) => handleAssign(e.target.value, committee.id!, 1)}
                        className={cn(
                          "w-full bg-bg3 border border-border rounded-xl px-4 py-2 text-sm outline-none focus:border-accent transition-all",
                          teacher1Id && "border-accent bg-white"
                        )}
                      >
                        <option value="">اختر معلماً...</option>
                        {teachers.map(t => (
                          <option 
                            key={t.id} 
                            value={t.id}
                            disabled={isTeacherAssignedElsewhere(t.id!, committee.id!, 1)}
                          >
                            {t.full_name} {isTeacherAssignedElsewhere(t.id!, committee.id!, 1) ? '(موزع)' : ''}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] font-bold text-text3 uppercase flex items-center gap-1">
                          <Users size={10} /> المراقب الثاني (اختياري)
                        </label>
                        {teacher2Id && (
                          <button 
                            onClick={() => handleRemove(committee.id!, 2)}
                            className="text-text3 hover:text-red transition-all"
                          >
                            <Trash2 size={12} />
                          </button>
                        )}
                      </div>
                      <select 
                        value={teacher2Id || ''}
                        onChange={(e) => handleAssign(e.target.value, committee.id!, 2)}
                        className={cn(
                          "w-full bg-bg3 border border-border rounded-xl px-4 py-2 text-sm outline-none focus:border-accent transition-all",
                          teacher2Id && "border-accent bg-white"
                        )}
                      >
                        <option value="">اختر معلماً...</option>
                        {teachers.map(t => (
                          <option 
                            key={t.id} 
                            value={t.id}
                            disabled={isTeacherAssignedElsewhere(t.id!, committee.id!, 2)}
                          >
                            {t.full_name} {isTeacherAssignedElsewhere(t.id!, committee.id!, 2) ? '(موزع)' : ''}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {(teacher1 || teacher2) && (
                    <div className="mt-4 pt-4 border-t border-accent/10 flex items-center gap-2 text-accent">
                      <CheckCircle2 size={14} />
                      <span className="text-xs font-bold">تم التكليف بنجاح</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Teachers Status Sidebar */}
        <div className="space-y-6">
          <div className="bg-card border border-border rounded-3xl p-6 sticky top-6">
            <h3 className="font-bold text-sm mb-4 flex items-center gap-2">
              <Users size={18} className="text-accent" />
              حالة المعلمين
            </h3>
            
            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
              {teachers.map(teacher => {
                const isAssigned = assignments.some(
                  a => a.exam_date === selectedDate && a.period === selectedPeriod && a.teacher_id === teacher.id
                );
                const assignment = assignments.find(
                  a => a.exam_date === selectedDate && a.period === selectedPeriod && a.teacher_id === teacher.id
                );
                const committee = committees.find(c => c.id === assignment?.committee_id);

                return (
                  <div 
                    key={teacher.id}
                    className={cn(
                      "p-3 rounded-xl border transition-all flex items-center justify-between",
                      isAssigned ? "bg-accent/5 border-accent/20" : "bg-bg3/50 border-border"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold",
                        isAssigned ? "bg-accent text-white" : "bg-text3/10 text-text3"
                      )}>
                        {teacher.full_name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-text">{teacher.full_name}</p>
                        {isAssigned && (
                          <p className="text-[10px] text-accent font-medium">لجنة {committee?.name}</p>
                        )}
                      </div>
                    </div>
                    {isAssigned ? (
                      <CheckCircle2 size={16} className="text-accent" />
                    ) : (
                      <AlertCircle size={16} className="text-text3 opacity-30" />
                    )}
                  </div>
                );
              })}
            </div>

            <div className="mt-6 pt-6 border-t border-border">
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="text-text3">تم توزيعهم:</span>
                <span className="font-bold text-accent">
                  {teachers.filter(t => assignments.some(a => a.exam_date === selectedDate && a.period === selectedPeriod && a.teacher_id === t.id)).length}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-text3">المتبقي:</span>
                <span className="font-bold text-text">
                  {teachers.length - teachers.filter(t => assignments.some(a => a.exam_date === selectedDate && a.period === selectedPeriod && a.teacher_id === t.id)).length}
                </span>
              </div>
              <div className="mt-4 h-2 bg-bg3 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-accent transition-all duration-500"
                  style={{ width: `${(teachers.filter(t => assignments.some(a => a.exam_date === selectedDate && a.period === selectedPeriod && a.teacher_id === t.id)).length / teachers.length) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
