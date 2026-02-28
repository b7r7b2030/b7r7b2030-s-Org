import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Search, 
  Phone, 
  MessageSquare,
  Filter,
  ArrowLeft,
  Loader2,
  School
} from 'lucide-react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer,
  Tooltip
} from 'recharts';
import { cn } from '../lib/utils';
import { Student, Committee, UserRole, User } from '../types';
import { sbFetch } from '../services/supabase';

export const Attendance: React.FC<{ userRole?: UserRole, user: User }> = ({ userRole, user }) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [committees, setCommittees] = useState<Committee[]>([]);
  const [absentStudents, setAbsentStudents] = useState<any[]>([]);
  const [selectedCommittee, setSelectedCommittee] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [attendanceMap, setAttendanceMap] = useState<Record<string, string>>({});

  const gradeOrder: Record<string, number> = {
    'أول ثانوي': 1,
    'الأول الثانوي': 1,
    'الأول': 1,
    'ثاني ثانوي': 2,
    'الثاني الثانوي': 2,
    'الثاني': 2,
    'ثالث ثانوي': 3,
    'الثالث الثانوي': 3,
    'الثالث': 3
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    const [cData, sData, aData, absData] = await Promise.all([
      sbFetch<Committee>('committees', 'GET', null, '?select=*&order=name'),
      sbFetch<Student>('students', 'GET', null, '?select=*'),
      sbFetch<any>('attendance', 'GET', null, '?select=student_id,status'),
      sbFetch<any>('v_absent_students', 'GET', null, '?select=*')
    ]);
    
    if (cData) {
      setCommittees(cData);
      if (cData.length > 0) setSelectedCommittee(cData[0].name);
    }
    if (sData) setStudents(sData);
    if (aData) {
      const map: any = {};
      aData.forEach((a: any) => map[a.student_id] = a.status);
      setAttendanceMap(map);
    }
    if (absData) setAbsentStudents(absData);
    setLoading(false);
  };

  const markStatus = async (studentId: string, status: string) => {
    const committeeId = committees.find(c => c.name === selectedCommittee)?.id;
    if (!committeeId) return;

    const res = await sbFetch('attendance', 'POST', {
      student_id: studentId,
      committee_id: committeeId,
      teacher_id: user.id,
      status: status,
      recorded_at: new Date().toISOString()
    });

    if (res) {
      setAttendanceMap(prev => ({ ...prev, [studentId]: status }));
      fetchInitialData(); // Refresh absent list
    }
  };

  const filteredStudents = students
    .filter(s => s.committee_name === selectedCommittee)
    .filter(s => s.full_name.includes(search) || s.student_no.includes(search))
    .sort((a, b) => {
      const orderA = gradeOrder[a.grade] || 99;
      const orderB = gradeOrder[b.grade] || 99;
      if (orderA !== orderB) return orderA - orderB;
      return parseInt(a.seat_no || '0') - parseInt(b.seat_no || '0');
    });

  const statsData = [
    { name: 'حاضر', value: Object.values(attendanceMap).filter(v => v === 'present').length, color: '#10b981' },
    { name: 'غائب', value: Object.values(attendanceMap).filter(v => v === 'absent').length, color: '#ef4444' },
    { name: 'متأخر', value: Object.values(attendanceMap).filter(v => v === 'late').length, color: '#f59e0b' },
  ];

  if (userRole === UserRole.COUNSELOR) {
    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="p-5 border-b border-border flex items-center justify-between">
            <h3 className="font-bold text-sm flex items-center gap-2">
              <XCircle size={18} className="text-red" />
              قائمة الطلاب الغائبين (متابعة المرشد)
            </h3>
            <div className="text-xs text-text3">إجمالي الغياب: {absentStudents.length}</div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-right text-sm">
              <thead className="bg-bg3/50 text-text3 text-[10px] font-bold uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3">اسم الطالب</th>
                  <th className="px-6 py-3">الصف</th>
                  <th className="px-6 py-3">اللجنة</th>
                  <th className="px-6 py-3">رقم الجوال</th>
                  <th className="px-6 py-3">الإجراء</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {absentStudents.map((s, i) => (
                  <tr key={i} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 font-bold text-text">{s.full_name}</td>
                    <td className="px-6 py-4 text-text2">{s.grade}</td>
                    <td className="px-6 py-4 text-text2">{s.committee_name}</td>
                    <td className="px-6 py-4 text-accent font-bold" dir="ltr">{s.phone || '—'}</td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <a 
                          href={`tel:${s.phone}`}
                          className="p-2 bg-accent/10 text-accent rounded-xl hover:bg-accent hover:text-white transition-all flex items-center gap-2 text-xs font-bold"
                        >
                          <Phone size={14} /> اتصال
                        </a>
                        <a 
                          href={`https://wa.me/${s.phone?.replace('+', '')}`}
                          target="_blank"
                          rel="noreferrer"
                          className="p-2 bg-green/10 text-green rounded-xl hover:bg-green hover:text-white transition-all flex items-center gap-2 text-xs font-bold"
                        >
                          <MessageSquare size={14} /> واتساب
                        </a>
                      </div>
                    </td>
                  </tr>
                ))}
                {absentStudents.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-10 text-center text-text3">لا يوجد غياب مسجل حالياً</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Attendance List */}
        <div className="lg:col-span-2 bg-card border border-border rounded-2xl overflow-hidden">
          <div className="p-5 border-b border-border flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h3 className="font-bold text-sm flex items-center gap-2">
              <CheckCircle2 size={18} className="text-accent" />
              تسجيل الحضور (مرتب حسب المرحلة)
            </h3>
            <div className="flex items-center gap-3">
              <select 
                value={selectedCommittee}
                onChange={(e) => setSelectedCommittee(e.target.value)}
                className="bg-bg3 border border-border rounded-xl px-3 py-1.5 text-xs font-bold outline-none focus:border-accent"
              >
                {committees.map(c => (
                  <option key={c.id} value={c.name}>لجنة {c.name} — {c.subject}</option>
                ))}
              </select>
              <div className="relative">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-text3" size={14} />
                <input 
                  type="text" 
                  placeholder="بحث عن طالب..." 
                  className="bg-bg3 border border-border rounded-xl pr-9 pl-4 py-1.5 text-xs outline-none focus:border-accent w-40"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            {loading ? (
              <div className="p-20 text-center">
                <Loader2 className="mx-auto animate-spin text-accent mb-4" size={40} />
                <p className="text-text3 text-sm">جاري تحميل البيانات...</p>
              </div>
            ) : (
              <table className="w-full text-right text-sm">
                <thead className="bg-bg3/50 text-text3 text-[10px] font-bold uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-3">المرحلة</th>
                    <th className="px-6 py-3">رقم الجلوس</th>
                    <th className="px-6 py-3">اسم الطالب</th>
                    <th className="px-6 py-3">الحالة</th>
                    <th className="px-6 py-3">الإجراء</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {filteredStudents.map((s, i) => (
                    <tr key={i} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4">
                        <span className={cn(
                          "px-2 py-0.5 text-[10px] font-bold rounded-md border",
                          gradeOrder[s.grade] === 1 && "bg-blue-500/10 text-blue-400 border-blue-500/20",
                          gradeOrder[s.grade] === 2 && "bg-purple-500/10 text-purple-400 border-purple-500/20",
                          gradeOrder[s.grade] === 3 && "bg-gold/10 text-gold border-gold/20"
                        )}>
                          {s.grade}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-bold text-text">{s.seat_no}</td>
                      <td className="px-6 py-4 text-text2">{s.full_name}</td>
                      <td className="px-6 py-4">
                        <span className={cn(
                          "px-2 py-0.5 text-[10px] font-bold rounded-full",
                          attendanceMap[s.id!] === 'present' ? "bg-green/10 text-green" : 
                          attendanceMap[s.id!] === 'absent' ? "bg-red/10 text-red" : "text-text3"
                        )}>
                          {attendanceMap[s.id!] === 'present' ? 'حاضر' : 
                           attendanceMap[s.id!] === 'absent' ? 'غائب' : 'بانتظار التحضير'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button 
                            onClick={() => s.id && markStatus(s.id, 'present')}
                            className={cn(
                              "p-1.5 rounded-lg transition-all",
                              attendanceMap[s.id!] === 'present' ? "bg-green text-white" : "bg-green/10 text-green hover:bg-green hover:text-white"
                            )}
                          >
                            <CheckCircle2 size={14} />
                          </button>
                          <button 
                            onClick={() => s.id && markStatus(s.id, 'absent')}
                            className={cn(
                              "p-1.5 rounded-lg transition-all",
                              attendanceMap[s.id!] === 'absent' ? "bg-red text-white" : "bg-red/10 text-red hover:bg-red hover:text-white"
                            )}
                          >
                            <XCircle size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredStudents.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-10 text-center text-text3">لا يوجد طلاب في هذه اللجنة</td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
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
