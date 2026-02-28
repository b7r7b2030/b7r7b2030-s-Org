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
  RefreshCw,
  QrCode,
  ClipboardCheck
} from 'lucide-react';
import { cn } from '../lib/utils';
import { QRScanner } from '../components/QRScanner';
import { Student, Committee, AttendanceRecord } from '../types';
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

  const [isDelivering, setIsDelivering] = useState(false);
  const [alertSent, setAlertSent] = useState(false);

  // Check for 15-minute late students
  useEffect(() => {
    if (!committee || students.length === 0 || alertSent) return;

    const checkLateStudents = async () => {
      const now = new Date();
      const startTimeStr = committee.start_time; // e.g., "08:00"
      if (!startTimeStr) return;

      const [hours, minutes] = startTimeStr.split(':').map(Number);
      const examStartTime = new Date();
      examStartTime.setHours(hours, minutes, 0, 0);

      const diffInMinutes = (now.getTime() - examStartTime.getTime()) / (1000 * 60);

      if (diffInMinutes >= 15) {
        const absentStudents = students.filter(s => attendance[s.id!] === 'absent');
        if (absentStudents.length > 0) {
          // Send alert to counselor
          await sbFetch('alerts', 'POST', {
            type: 'red',
            title: `تنبيه غياب متأخر - لجنة ${committee.name}`,
            body: `يوجد عدد ${absentStudents.length} طلاب غائبين بعد مرور 15 دقيقة من بداية الاختبار في لجنة ${committee.name}.`,
            created_at: new Date().toISOString()
          });
          setAlertSent(true);
          console.log("Late alert sent to counselor");
        }
      }
    };

    const timer = setInterval(checkLateStudents, 60000); // Check every minute
    return () => clearInterval(timer);
  }, [committee, students, attendance, alertSent]);

  const [attendanceRecords, setAttendanceRecords] = useState<Record<string, AttendanceRecord>>({});

  const handleScan = async (data: string) => {
    setLoading(true);
    setIsScanning(false);
    
    try {
      let parsed;
      try {
        parsed = JSON.parse(data);
      } catch (e) {
        throw new Error('رمز QR غير صالح. يرجى استخدام الرموز المولدة من النظام.');
      }

      // Handle Envelope Handover to Control
      if (isDelivering) {
        if (parsed.type === 'control_handover') {
          if (!committee) throw new Error('يرجى مسح اللجنة أولاً.');
          
          // Update envelope status in DB
          const envRes = await sbFetch('envelopes', 'POST', {
            committee_id: committee.id,
            status: 'delivered',
            delivered_at: new Date().toISOString(),
            notes: 'تم التسليم للكنترول عبر المسح'
          });

          if (envRes) {
            alert('تم تسليم المظروف للكنترول بنجاح. شكراً لك.');
            setCommittee(null);
            setStudents([]);
            setIsDelivering(false);
            return;
          }
        } else {
          throw new Error('يرجى مسح رمز "استلام الكنترول" الخاص بمكتب الكنترول.');
        }
      }

      if (parsed.type === 'teacher_committee' || parsed.type === 'envelope' || parsed.type === 'committee') {
        const committeeId = parsed.id;
        const committeeName = parsed.name || parsed.committee;

        if (!committeeId && !committeeName) {
          throw new Error('بيانات اللجنة ناقصة في رمز QR.');
        }

        // Fetch committee details
        let query = committeeId ? `?id=eq.${committeeId}` : `?name=eq.${committeeName}`;
        const cData = await sbFetch<Committee>('committees', 'GET', null, query);
        
        if (cData && cData.length > 0) {
          const currentCommittee = cData[0];
          setCommittee(currentCommittee);
          
          // Fetch students for this committee
          const sData = await sbFetch<Student>('students', 'GET', null, `?committee_name=eq.${currentCommittee.name}`);
          if (sData) {
            const sorted = [...sData].sort((a, b) => {
              const orderA = gradeOrder[a.grade] || 99;
              const orderB = gradeOrder[b.grade] || 99;
              if (orderA !== orderB) return orderA - orderB;
              return parseInt(a.seat_no || '0') - parseInt(b.seat_no || '0');
            });
            setStudents(sorted);
            
            // Fetch existing attendance
            const aData = await sbFetch<AttendanceRecord>('attendance', 'GET', null, `?committee_id=eq.${currentCommittee.id}`);
            const attMap: Record<string, string> = {};
            const recordMap: Record<string, AttendanceRecord> = {};
            
            if (aData && aData.length > 0) {
              aData.forEach((a) => {
                attMap[a.student_id] = a.status;
                recordMap[a.student_id] = a;
              });
            } else {
              // Default all to present if no attendance recorded yet
              sorted.forEach(s => {
                if (s.id) attMap[s.id] = 'present';
              });
              
              const defaultAttendance = sorted.map(s => ({
                student_id: s.id,
                committee_id: currentCommittee.id,
                status: 'present',
                recorded_at: new Date().toISOString()
              }));
              
              const saved = await sbFetch<AttendanceRecord>('attendance', 'POST', defaultAttendance);
              if (saved) {
                saved.forEach(a => recordMap[a.student_id] = a);
              }
            }
            setAttendance(attMap);
            setAttendanceRecords(recordMap);
          } else {
            setStudents([]);
          }
        } else {
          throw new Error('اللجنة غير موجودة في قاعدة البيانات. يرجى التأكد من مزامنة اللجان.');
        }
      } else {
        throw new Error('نوع رمز QR غير مدعوم في هذه الصفحة. يرجى مسح رمز اللجنة أو المظروف.');
      }
    } catch (error: any) {
      console.error("Scan error:", error);
      alert(error.message || 'خطأ في قراءة رمز QR. تأكد من جودة الصورة والبيانات.');
      setIsScanning(true);
    } finally {
      setLoading(false);
    }
  };

  const handleAttendance = async (studentId: string, status: 'present' | 'absent' | 'late') => {
    if (!committee) return;
    
    const existingRecord = attendanceRecords[studentId];
    
    // Optimistic update
    setAttendance(prev => ({ ...prev, [studentId]: status }));

    let res;
    if (existingRecord?.id) {
      // Update existing record
      res = await sbFetch<AttendanceRecord>('attendance', 'PATCH', {
        status: status,
        recorded_at: new Date().toISOString()
      }, `?id=eq.${existingRecord.id}`);
    } else {
      // Create new record
      res = await sbFetch<AttendanceRecord>('attendance', 'POST', {
        student_id: studentId,
        committee_id: committee.id,
        status: status,
        recorded_at: new Date().toISOString()
      });
    }

    if (res && res.length > 0) {
      setAttendanceRecords(prev => ({ ...prev, [studentId]: res![0] }));
    } else if (!res) {
      // Rollback on failure
      alert('فشل تحديث الحالة. يرجى المحاولة مرة أخرى.');
      // Re-fetch to sync
    }
  };

  const presentCount = Object.values(attendance).filter(v => v === 'present').length;
  const absentCount = students.length - presentCount;

  if (isScanning) {
    return (
      <QRScanner 
        title={isDelivering ? "مسح رمز استلام الكنترول" : "مسح رمز اللجنة"} 
        onScan={handleScan} 
        onClose={() => {
          setIsScanning(false);
          setIsDelivering(false);
        }} 
      />
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] space-y-6 px-6">
        <div className="relative">
          <RefreshCw size={64} className="text-accent animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 bg-accent rounded-full animate-pulse"></div>
          </div>
        </div>
        <div className="text-center space-y-2">
          <p className="text-xl font-black text-text">جاري التحضير الذكي...</p>
          <p className="text-text3 text-sm">يتم الآن جلب بيانات الطلاب وتعيين الحالة الافتراضية (حاضر)</p>
        </div>
      </div>
    );
  }

  if (!committee) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] space-y-8 px-6">
        <div className="relative">
          <div className="w-32 h-32 bg-accent/10 text-accent rounded-full flex items-center justify-center animate-pulse">
            <School size={64} />
          </div>
          <div className="absolute -top-2 -right-2 w-10 h-10 bg-gold text-black rounded-full flex items-center justify-center shadow-lg">
            <QrCode size={20} />
          </div>
        </div>
        <div className="text-center space-y-3">
          <h2 className="text-3xl font-display font-black text-text">مرحباً بك، أيها المعلم</h2>
          <p className="text-text3 max-w-xs mx-auto leading-relaxed">
            لبدء عملية تحضير الطلاب، يرجى مسح رمز QR الموجود على باب اللجنة أو المظروف.
          </p>
        </div>
        <button 
          onClick={() => setIsScanning(true)}
          className="w-full max-w-xs flex items-center justify-center gap-3 bg-accent text-white py-5 rounded-3xl font-black text-lg shadow-2xl shadow-accent/40 active:scale-95 transition-all"
        >
          <Camera size={24} />
          ابدأ المسح الآن
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-bg -m-8 pb-24">
      {/* App-like Header */}
      <div className="sticky top-0 z-40 bg-card/80 backdrop-blur-xl border-b border-border px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-accent/10 text-accent rounded-2xl flex items-center justify-center">
            <School size={20} />
          </div>
          <div>
            <h3 className="font-black text-sm">لجنة {committee.name}</h3>
            <p className="text-[10px] text-text3 font-bold">{committee.subject}</p>
          </div>
        </div>
        <button 
          onClick={() => {
            setCommittee(null);
            setStudents([]);
            setIsScanning(true);
          }}
          className="p-2 bg-bg3 text-text3 rounded-xl hover:text-red transition-colors"
        >
          <RefreshCw size={18} />
        </button>
      </div>

      {/* Stats Bar */}
      <div className="px-6 py-6">
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-card border border-border rounded-2xl p-4 text-center">
            <div className="text-2xl font-black text-text">{students.length}</div>
            <div className="text-[9px] uppercase font-bold text-text3">الطلاب</div>
          </div>
          <div className="bg-green/5 border border-green/20 rounded-2xl p-4 text-center">
            <div className="text-2xl font-black text-green">{presentCount}</div>
            <div className="text-[9px] uppercase font-bold text-green/60">حاضر</div>
          </div>
          <div className="bg-red/5 border border-red/20 rounded-2xl p-4 text-center">
            <div className="text-2xl font-black text-red">{absentCount}</div>
            <div className="text-[9px] uppercase font-bold text-red/60">غائب</div>
          </div>
        </div>
      </div>

      {/* Student List - Mobile Cards */}
      <div className="px-6 space-y-4">
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-black text-sm flex items-center gap-2">
            <Users size={16} className="text-accent" />
            قائمة التحضير
          </h4>
          <span className="text-[10px] font-bold text-text3 bg-bg3 px-2 py-1 rounded-lg">
            الكل حاضر افتراضياً
          </span>
        </div>

        <div className="space-y-3">
          {students.map((s, i) => (
            <div 
              key={i} 
              className={cn(
                "bg-card border rounded-2xl p-4 flex items-center justify-between transition-all active:scale-[0.98]",
                attendance[s.id!] === 'absent' ? "border-red/30 bg-red/5" : "border-border"
              )}
            >
              <div className="flex items-center gap-4">
                <div className={cn(
                  "w-12 h-12 rounded-xl flex flex-col items-center justify-center font-black text-xs",
                  (s.grade.includes('الأول')) && "bg-blue-500/10 text-blue-400",
                  (s.grade.includes('الثاني')) && "bg-purple-500/10 text-purple-400",
                  (s.grade.includes('الثالث')) && "bg-gold/10 text-gold"
                )}>
                  <span>{s.seat_no || s.student_no}</span>
                  <span className="text-[8px] opacity-60">مقعد</span>
                </div>
                <div>
                  <h5 className="font-bold text-sm text-text">{s.full_name}</h5>
                  <p className="text-[10px] text-text3">{s.grade} — {s.classroom}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button 
                  onClick={() => s.id && handleAttendance(s.id, 'absent')}
                  className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
                    attendance[s.id!] === 'absent' 
                      ? "bg-red text-white shadow-lg shadow-red/30" 
                      : "bg-red/10 text-red hover:bg-red/20"
                  )}
                >
                  <XCircle size={20} />
                </button>
                <button 
                  onClick={() => s.id && handleAttendance(s.id, 'present')}
                  className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
                    attendance[s.id!] === 'present' 
                      ? "bg-green text-white shadow-lg shadow-green/30" 
                      : "bg-green/10 text-green hover:bg-green/20"
                  )}
                >
                  <CheckCircle2 size={20} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Floating Action Button */}
      <div className="fixed bottom-6 left-6 right-6 z-50">
        <button 
          onClick={() => {
            setIsDelivering(true);
            setIsScanning(true);
          }}
          className="w-full bg-linear-to-r from-accent to-purple text-white py-4 rounded-2xl font-black text-base shadow-2xl shadow-accent/30 flex items-center justify-center gap-2 active:scale-95 transition-all"
        >
          <Package size={20} />
          تسليم المظروف للكنترول
        </button>
      </div>
    </div>
  );
};
