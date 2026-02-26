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
  AlertCircle
} from 'lucide-react';
import { cn } from '../lib/utils';
import { QRScanner } from '../components/QRScanner';
import { Student, Committee } from '../types';

const mockStudents: Student[] = [
  { student_no: '101', full_name: 'أحمد محمد علي', grade: 'الأول', classroom: 'A' },
  { student_no: '102', full_name: 'خالد سعد الدوسري', grade: 'الأول', classroom: 'A' },
  { student_no: '201', full_name: 'فيصل القحطاني', grade: 'الثاني', classroom: 'B' },
  { student_no: '202', full_name: 'يوسف المالكي', grade: 'الثاني', classroom: 'B' },
  { student_no: '301', full_name: 'عمر الغامدي', grade: 'الثالث', classroom: 'C' },
  { student_no: '302', full_name: 'سلمان الزهراني', grade: 'الثالث', classroom: 'C' },
];

export const TeacherDashboard: React.FC = () => {
  const [isScanning, setIsScanning] = useState(true);
  const [envelopeData, setEnvelopeData] = useState<string | null>(null);
  const [committee, setCommittee] = useState<Committee | null>(null);
  const [students, setStudents] = useState<Student[]>([]);

  const handleScan = (data: string) => {
    setEnvelopeData(data);
    setIsScanning(false);
    
    // Simulate fetching committee data for scanned envelope
    setCommittee({
      id: '1',
      name: '1A',
      subject: 'الرياضيات',
      teacher_name: 'أحمد السيد',
      exam_date: '2024-05-26',
      start_time: '08:00',
      end_time: '10:00'
    });

    // Sort students by grade: 1st, 2nd, 3rd
    const gradeOrder = ['الأول', 'الثاني', 'الثالث'];
    const sorted = [...mockStudents].sort((a, b) => {
      return gradeOrder.indexOf(a.grade) - gradeOrder.indexOf(b.grade);
    });
    setStudents(sorted);
  };

  if (isScanning) {
    return (
      <QRScanner 
        title="مسح رمز المظروف" 
        onScan={handleScan} 
        onClose={() => setIsScanning(false)} 
      />
    );
  }

  if (!envelopeData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
        <div className="w-24 h-24 bg-accent/10 text-accent rounded-full flex items-center justify-center">
          <Package size={48} />
        </div>
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-display font-bold">بانتظار مسح المظروف</h2>
          <p className="text-text3">يرجى مسح رمز QR الموجود على المظروف لبدء الجلسة</p>
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
              <div className="text-2xl font-black text-green-400">0</div>
              <div className="text-[10px] uppercase font-bold opacity-60">حاضر</div>
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
                      s.grade === 'الأول' && "bg-blue-500/10 text-blue-400 border-blue-500/20",
                      s.grade === 'الثاني' && "bg-purple-500/10 text-purple-400 border-purple-500/20",
                      s.grade === 'الثالث' && "bg-gold/10 text-gold border-gold/20"
                    )}>
                      {s.grade}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-bold text-text">{s.student_no}</td>
                  <td className="px-6 py-4 text-text2">{s.full_name}</td>
                  <td className="px-6 py-4 text-text3 text-xs">{s.classroom}</td>
                  <td className="px-6 py-4">
                    <span className="text-text3 text-[10px] font-bold">بانتظار التحضير</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button className="p-2 bg-green/10 text-green rounded-xl hover:bg-green hover:text-white transition-all">
                        <CheckCircle2 size={16} />
                      </button>
                      <button className="p-2 bg-red/10 text-red rounded-xl hover:bg-red hover:text-white transition-all">
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
