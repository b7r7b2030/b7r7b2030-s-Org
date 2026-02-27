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
  AlertCircle
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
    if (cData) setCommittees(cData);
    if (aData) setAssignments(aData);
    if (sData) {
      setSchedules(sData);
      if (sData.length > 0) {
        setSelectedDate(sData[0].exam_date);
      }
    }
    setLoading(false);
  };

  const uniqueDates = Array.from(new Set(schedules.map(s => s.exam_date))).sort();

  const handleAssign = (teacherId: string, committeeId: string) => {
    const existingIndex = assignments.findIndex(
      a => a.exam_date === selectedDate && a.period === selectedPeriod && a.committee_id === committeeId
    );

    const newAssignments = [...assignments];
    const assignment: Assignment = {
      teacher_id: teacherId,
      committee_id: committeeId,
      exam_date: selectedDate,
      period: selectedPeriod
    };

    if (existingIndex >= 0) {
      newAssignments[existingIndex] = assignment;
    } else {
      newAssignments.push(assignment);
    }

    setAssignments(newAssignments);
  };

  const handleRemove = (committeeId: string) => {
    setAssignments(assignments.filter(
      a => !(a.exam_date === selectedDate && a.period === selectedPeriod && a.committee_id === committeeId)
    ));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Clear current assignments for this date/period and re-insert
      // In a real app, we'd use a more surgical approach
      await sbFetch('teacher_assignments', 'DELETE', null, `?exam_date=eq.${selectedDate}&period=eq.${selectedPeriod}`);
      
      const toSave = assignments
        .filter(a => a.exam_date === selectedDate && a.period === selectedPeriod)
        .map(({ id, ...rest }) => rest);

      if (toSave.length > 0) {
        await sbFetch('teacher_assignments', 'POST', toSave);
      }
      
      alert('تم حفظ توزيع المعلمين بنجاح');
      fetchData();
    } catch (error) {
      console.error("Save error:", error);
      alert('حدث خطأ أثناء الحفظ');
    }
    setSaving(false);
  };

  const getAssignedTeacherId = (committeeId: string) => {
    return assignments.find(
      a => a.exam_date === selectedDate && a.period === selectedPeriod && a.committee_id === committeeId
    )?.teacher_id;
  };

  const isTeacherAssignedElsewhere = (teacherId: string, currentCommitteeId: string) => {
    return assignments.some(
      a => a.exam_date === selectedDate && a.period === selectedPeriod && a.teacher_id === teacherId && a.committee_id !== currentCommitteeId
    );
  };

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

            <button 
              onClick={handleSave}
              disabled={saving}
              className="mt-auto bg-accent text-white font-bold px-6 py-2.5 rounded-xl hover:bg-accent/90 transition-all flex items-center gap-2 shadow-lg shadow-accent/20"
            >
              {saving ? <RefreshCw size={18} className="animate-spin" /> : <Save size={18} />}
              حفظ التوزيع
            </button>
          </div>
        </div>
      </div>

      {/* Assignment Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Committees List */}
        <div className="xl:col-span-2 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {committees.map(committee => {
              const assignedTeacherId = getAssignedTeacherId(committee.id!);
              const teacher = teachers.find(t => t.id === assignedTeacherId);

              return (
                <div 
                  key={committee.id}
                  className={cn(
                    "bg-card border rounded-2xl p-5 transition-all group",
                    assignedTeacherId ? "border-accent/30 bg-accent/5" : "border-border hover:border-accent/50"
                  )}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-12 h-12 rounded-xl flex items-center justify-center font-black text-lg border transition-all",
                        assignedTeacherId ? "bg-accent text-white border-accent" : "bg-bg3 text-text3 border-border"
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
                    {assignedTeacherId && (
                      <button 
                        onClick={() => handleRemove(committee.id!)}
                        className="p-2 text-text3 hover:text-red hover:bg-red/10 rounded-lg transition-all"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-bold text-text3 uppercase flex items-center gap-1">
                      <Users size={10} /> المعلم المراقب
                    </label>
                    <select 
                      value={assignedTeacherId || ''}
                      onChange={(e) => handleAssign(e.target.value, committee.id!)}
                      className={cn(
                        "w-full bg-bg3 border border-border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-accent transition-all",
                        assignedTeacherId && "border-accent bg-white"
                      )}
                    >
                      <option value="">اختر معلماً...</option>
                      {teachers.map(t => (
                        <option 
                          key={t.id} 
                          value={t.id}
                          disabled={isTeacherAssignedElsewhere(t.id!, committee.id!)}
                        >
                          {t.full_name} {isTeacherAssignedElsewhere(t.id!, committee.id!) ? '(موزع)' : ''}
                        </option>
                      ))}
                    </select>
                  </div>

                  {teacher && (
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
