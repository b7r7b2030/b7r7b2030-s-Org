import React, { useState, useEffect } from 'react';
import { 
  Package, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Users, 
  ArrowRight,
  Camera,
  School,
  Calendar,
  AlertCircle,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { cn } from '../lib/utils';
import { QRScanner } from '../components/QRScanner';
import { Student, Committee } from '../types';
import { sbFetch } from '../services/supabase';

export const TeacherDashboard: React.FC = () => {
  const [isScanning, setIsScanning] = useState(true);
  const [loading, setLoading] = useState(false);
  const [committee, setCommittee] = useState<Committee | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [attendance, setAttendance] = useState<Record<string, 'present' | 'absent' | 'late'>>({});

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

  const handleScan = async (data: string) => {
    setLoading(true);
    setIsScanning(false);
    
    try {
      const parsed = JSON.parse(data);
      if (parsed.type === 'committee' || parsed.type === 'envelope') {
        // Fetch committee details
        const cData = await sbFetch<Committee>('committees', 'GET', null, `?id=eq.${parsed.id}`);
        if (cData && cData.length > 0) {
          setCommittee(cData[0]);
          
          // Fetch students for this committee
          const sData = await sbFetch<Student>('students', 'GET', null, `?committee_name=eq.${cData[0].name}`);
          if (sData) {
            const sorted = [...sData].sort((a, b) => {
              const orderA = gradeOrder[a.grade] || 99;
              const orderB = gradeOrder[b.grade] || 99;
              if (orderA !== orderB) return orderA - orderB;
              return parseInt(a.seat_no || '0') - parseInt(b.seat_no || '0');
            });
            setStudents(sorted);
            
            // Fetch existing attendance
            const aData = await sbFetch<any>('attendance', 'GET', null, `?committee_id=eq.${cData[0].id}`);
            if (aData) {
              const attMap: any = {};
              aData.forEach((a: any) => attMap[a.student_id] = a.status);
              setAttendance(attMap);
            }
          }
        } else {
          alert('لجنة غير موجودة في قاعدة البيانات');
          setIsScanning(true);
        }
      } else {
        alert('رمز QR غير صالح');
        setIsScanning(true);
      }
    } catch (error) {
      console.error("Scan error:", error);
      alert('خطأ في قراءة رمز QR. تأكد من جودة الصورة.');
      setIsScanning(true);
    } finally {
      setLoading(false);
    }
  };

  const handleAttendance = async (studentId: string, status: 'present' | 'absent' | 'late') => {
    if (!committee) return;
    
    const res = await sbFetch('attendance', 'POST', {
      student_id: studentId,
      committee_id: committee.id,
      status: status,
      recorded_at: new Date().toISOString()
    });

    if (res) {
      setAttendance(prev => ({ ...prev, [studentId]: status }));
    }
  };

  const presentCount = Object.values(attendance).filter(v => v === 'present').length;

  if (isScanning) {
    return (
      <QRScanner 
        title="مسح رمز اللجنة" 
        onScan={handleScan} 
        onClose={() => setIsScanning(false)} 
      />
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <RefreshCw size={48} className="text-accent animate-spin" />
        <p className="text-text3 font-bold">جاري تحميل بيانات اللجنة والطلاب...</p>
      </div>
    );
  }

  if (!committee) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
        <div className="w-24 h-24 bg-accent/10 text-accent rounded-full flex items-center justify-center">
          <School size={48} />
        </div>
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-display font-bold">بانتظار مسح رمز اللجنة</h2>
          <p className="text-text3">يرجى مسح رمز QR الموجود على باب اللجنة لبدء التحضير</p>
        </div>
        <button 
          onClick={() => setIsScanning(true)}
          className="flex items-center gap-2 bg-accent text-white px-8 py-3 rounded-2xl font-bold shadow-lg shadow-accent/20"
        >
          <Camera size={20} />
          فتح الكاميرا للمسح
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Session Header */}
      <div className="bg-linear-to-br from-accent to-purple rounded-3xl p-8 text-white shadow-xl shadow-accent/20">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-white/80 text-sm font-bold">
              <School size={18} />
              لجنة {committee?.name} — {committee?.subject}
            </div>
            <h2 className="text-3xl font-display font-black">جلسة الاختبار نشطة</h2>
            <div className="flex items-center gap-4 text-white/70 text-xs font-medium pt-2">
              <span className="flex items-center gap-1"><Calendar size={14} /> {committee?.exam_date}</span>
              <span className="flex items-center gap-1"><Clock size={14} /> {committee?.start_time} - {committee?.end_time}</span>
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 flex items-center gap-4">
            <div className="text-center">
              <div className="text-2xl font-black">{students.length}</div>
              <div className="text-[10px] uppercase font-bold opacity-60">إجمالي الطلاب</div>
            </div>
            <div className="w-px h-8 bg-white/20"></div>
            <div className="text-center">
              <div className="text-2xl font-black text-green-400">{presentCount}</div>
              <div className="text-[10px] uppercase font-bold opacity-60">حاضر</div>
            </div>
            <div className="w-px h-8 bg-white/20"></div>
            <div className="text-center">
              <div className="text-2xl font-black text-red-400">{students.length - presentCount}</div>
              <div className="text-[10px] uppercase font-bold opacity-60">غائب</div>
            </div>
          </div>
        </div>
      </div>

      {/* Student List */}
      <div className="bg-card border border-border rounded-3xl overflow-hidden">
        <div className="p-6 border-b border-border flex items-center justify-between">
          <h3 className="font-bold text-sm flex items-center gap-2">
            <Users size={18} className="text-accent" />
            قائمة طلاب اللجنة (مرتبة حسب المرحلة)
          </h3>
          <div className="flex items-center gap-2 text-xs text-text3 bg-bg3 px-3 py-1.5 rounded-lg border border-border">
            <AlertCircle size={14} className="text-gold" />
            يتم الترتيب تلقائياً: أول ← ثاني ← ثالث
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-right text-sm">
            <thead className="bg-bg3/50 text-text3 text-[10px] font-bold uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">المرحلة</th>
                <th className="px-6 py-4">رقم الطالب</th>
                <th className="px-6 py-4">اسم الطالب</th>
                <th className="px-6 py-4">الفصل</th>
                <th className="px-6 py-4">الحالة</th>
                <th className="px-6 py-4">الإجراء</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {students.map((s, i) => (
                <tr key={i} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4">
                    <span className={cn(
                      "px-2 py-1 text-[10px] font-bold rounded-md border",
                      (s.grade.includes('الأول')) && "bg-blue-500/10 text-blue-400 border-blue-500/20",
                      (s.grade.includes('الثاني')) && "bg-purple-500/10 text-purple-400 border-purple-500/20",
                      (s.grade.includes('الثالث')) && "bg-gold/10 text-gold border-gold/20"
                    )}>
                      {s.grade}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-bold text-text">{s.student_no}</td>
                  <td className="px-6 py-4 text-text2">{s.full_name}</td>
                  <td className="px-6 py-4 text-text3 text-xs">{s.classroom}</td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "text-[10px] font-bold px-2 py-1 rounded-full",
                      attendance[s.id!] === 'present' ? "bg-green/10 text-green" : 
                      attendance[s.id!] === 'absent' ? "bg-red/10 text-red" : "text-text3"
                    )}>
                      {attendance[s.id!] === 'present' ? 'حاضر' : 
                       attendance[s.id!] === 'absent' ? 'غائب' : 'بانتظار التحضير'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button 
                        onClick={() => s.id && handleAttendance(s.id, 'present')}
                        className={cn(
                          "p-2 rounded-xl transition-all",
                          attendance[s.id!] === 'present' ? "bg-green text-white" : "bg-green/10 text-green hover:bg-green hover:text-white"
                        )}
                      >
                        <CheckCircle2 size={16} />
                      </button>
                      <button 
                        onClick={() => s.id && handleAttendance(s.id, 'absent')}
                        className={cn(
                          "p-2 rounded-xl transition-all",
                          attendance[s.id!] === 'absent' ? "bg-red text-white" : "bg-red/10 text-red hover:bg-red hover:text-white"
                        )}
                      >
                        <XCircle size={16} />
                      </button>
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
