import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Printer, 
  Check, 
  X, 
  User, 
  Users, 
  Calendar, 
  AlertTriangle, 
  UserX, 
  ListOrdered, 
  BookOpen,
  ArrowRight,
  ClipboardList
} from 'lucide-react';
import { sbFetch } from '../services/supabase';
import { cn } from '../lib/utils';

// Official A4 Control Forms types
type ControlFormType = 'cheating' | 'absence' | 'flow' | 'receipt';

interface OfficialControlReportsProps {
  searchDate: string;
  setSearchDate: (date: string) => void;
}

export const OfficialControlReports: React.FC<OfficialControlReportsProps> = ({ searchDate, setSearchDate }) => {
  const [activeForm, setActiveForm] = useState<ControlFormType>('receipt');
  const [printMode, setPrintMode] = useState(false);

  // Database States
  const [students, setStudents] = useState<any[]>([]);
  const [staff, setStaff] = useState<any[]>([]);
  const [committees, setCommittees] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [schedules, setSchedules] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Active School Core settings (can fallback if none in settings)
  const [schoolInfo, setSchoolInfo] = useState({
    school_name: 'ثانوية الأمير عبدالمجيد الأولى',
    district: 'الإدارة العامة للتعليم بمحافظة جدة',
    principal: 'نايف بن أحمد الشهري',
    vice_principal: 'محمد عبدالرحمن القرني',
    academic_year: '1447هـ'
  });

  // 1. CHEATING REPORT STATE
  const [cheatStudentId, setCheatStudentId] = useState('');
  const [cheatSubject, setCheatSubject] = useState('');
  const [cheatDate, setCheatDate] = useState(searchDate);
  const [cheatSemester, setCheatSemester] = useState('الأول');
  const [cheatDescription, setCheatDescription] = useState('أثناء مروري بالقاعة، لوحظ محاولة الطالب الاستعانة بقصاصة ورقية مخبأة بها ملخص قوانين المادة المجرى فيها الاختبار، وتم اتخاذ قرار الكنترول بالتحفظ على دليل الغش وإخراجه وتحرير هذا المحضر تمهيداً لحجب الدرجة.');
  const [cheatEvidence, setCheatEvidence] = useState('قصاصة ورقية صغيرة مكتوبة بخط اليد ومخبأة أسفل ورقة الإجابة وبها ملخص المنهج الدراسي.');
  const [cheatAction, setCheatAction] = useState('تحريز وسيلة الغش المذكورة، تحرير محضر إثبات الواقعة، إحالة الطالب إلى لجنة التحقيق بالكنترول مع استكمال حل ورقة إجابته المعتمدة.');
  const [cheatCommitteeHead, setCheatCommitteeHead] = useState('أ. محمد عبدالرحمن القرني');
  const [cheatObserver, setCheatObserver] = useState('');

  // 2. ABSENCE REPORT STATE
  const [absentStudentId, setAbsentStudentId] = useState('');
  const [absentSubject, setAbsentSubject] = useState('');
  const [absentPeriod, setAbsentPeriod] = useState('الأولى');
  const [absentObserver1, setAbsentObserver1] = useState('');
  const [absentObserver2, setAbsentObserver2] = useState('');

  // 3. ANSWER SHEET FLOW STATE
  const [selectedGrade, setSelectedGrade] = useState<'الصف الأول الثانوي' | 'الصف الثاني الثانوي' | 'الصف الثالث الثانوي'>('الصف الأول الثانوي');
  const [weeklySubjects, setWeeklySubjects] = useState<Record<string, { subject: string; count: number; corrName: string; controlName: string }>>({
    'الأحد': { subject: 'الرياضيات 1', count: 120, corrName: 'أ. سامي الزهراني', controlName: 'أ. فيصل الحربي' },
    'الاثنين': { subject: 'اللغة الإنجليزية 1', count: 118, corrName: 'أ. خالد الشهري', controlName: 'أ. فيصل الحربي' },
    'الثلاثاء': { subject: 'الفيزياء 1', count: 119, corrName: 'أ. مروان العتيبي', controlName: 'أ. عبدالله العمري' },
    'الأربعاء': { subject: 'الكيمياء 1', count: 120, corrName: 'أ. بكر فلاته', controlName: 'أ. عبدالله العمري' },
    'الخميس': { subject: 'الدراسات الاجتماعية', count: 121, corrName: 'أ. فهد اليوبي', controlName: 'أ. محمد الزهراني' },
  });

  // 4. RECEIPT CHECKLIST DATA (populated dynamically)
  const [receiptRows, setReceiptRows] = useState<any[]>([]);

  // Fetch Data on mount or searchDate change
  useEffect(() => {
    fetchCoreData();
  }, [searchDate]);

  const fetchCoreData = async () => {
    setLoading(true);
    try {
      // Fetch school settings to show real info
      const settingsRes = await sbFetch<{ data: any }>('settings', 'GET', null, '?id=eq.school_info');
      if (settingsRes && settingsRes.length > 0) {
        setSchoolInfo({
          school_name: settingsRes[0].data.school_name || 'ثانوية الأمير عبدالمجيد الأولى',
          district: settingsRes[0].data.district || 'الإدارة العامة للتعليم بمحافظة جدة',
          principal: settingsRes[0].data.principal || 'نايف بن أحمد الشهري',
          vice_principal: settingsRes[0].data.principal_assist || 'محمد عبدالرحمن القرني',
          academic_year: '1447هـ'
        });
      }

      const [stData, staffData, comData, attData, schData] = await Promise.all([
        sbFetch<any>('students', 'GET'),
        sbFetch<any>('staff', 'GET'),
        sbFetch<any>('committees', 'GET'),
        sbFetch<any>('attendance', 'GET', null, `?recorded_at=like.${searchDate}%`),
        sbFetch<any>('exam_schedules', 'GET')
      ]);

      if (stData) setStudents(stData);
      if (staffData) {
        setStaff(staffData);
        // Default some signature names
        const observerList = staffData.filter(s => s.role === 'TEACHER');
        if (observerList.length > 0) {
          setCheatObserver(observerList[0].full_name);
          setAbsentObserver1(observerList[0].full_name);
          if (observerList.length > 1) {
            setAbsentObserver2(observerList[1].full_name);
          }
        }
      }
      if (comData) setCommittees(comData);
      if (attData) setAttendance(attData);
      if (schData) setSchedules(schData);

      // Auto populate current cheating or absence selections if any
      if (stData && stData.length > 0) {
        setCheatStudentId(stData[0].id);
        const absentFromToday = stData.filter(student => {
          const record = attData?.find(a => a.student_id === student.id);
          return record && record.status === 'absent';
        });
        if (absentFromToday.length > 0) {
          setAbsentStudentId(absentFromToday[0].id);
        } else {
          setAbsentStudentId(stData[0].id);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // Populate dynamic weekly items from schedules if available of chosen Grade
  useEffect(() => {
    if (schedules.length > 0) {
      const dbGradeMap: Record<string, string> = {
        'الصف الأول الثانوي': 'الأول الثانوي',
        'الصف الثاني الثانوي': 'الثاني الثانوي',
        'الصف الثالث الثانوي': 'الثالث الثانوي'
      };
      
      const targetGrade = dbGradeMap[selectedGrade] || selectedGrade;
      const targetSchedules = schedules.filter(s => s.grade === targetGrade);

      const daysOfWeekMap: Record<string, string> = {
        'الأحد': 'Sunday',
        'الاثنين': 'Monday',
        'الثلاثاء': 'Tuesday',
        'الأربعاء': 'Wednesday',
        'الخميس': 'Thursday'
      };

      const updatedWeekly = { ...weeklySubjects };

      Object.keys(updatedWeekly).forEach(day => {
        const item = targetSchedules.find(s => s.day_name === day || s.day_name?.includes(day));
        if (item) {
          updatedWeekly[day].subject = item.subject || updatedWeekly[day].subject;
          // Count active students in this grade
          const activeSms = students.filter(s => s.grade === targetGrade).length;
          updatedWeekly[day].count = activeSms > 0 ? activeSms : updatedWeekly[day].count;
        }
      });

      setWeeklySubjects(updatedWeekly);
    }
  }, [selectedGrade, schedules, students]);

  // Compute Committee Receipt Rows (Form 4)
  useEffect(() => {
    if (committees.length > 0 && students.length > 0) {
      const rows = committees.map((committee) => {
        // Students in this specific committee
        const committeeStudents = students.filter(s => s.committee_name === committee.name);
        
        // Split by grade counts
        const firstGrade = committeeStudents.filter(s => s.grade?.includes('الأول')).length;
        const secondGrade = committeeStudents.filter(s => s.grade?.includes('الثاني')).length;
        const thirdGrade = committeeStudents.filter(s => s.grade?.includes('الثالث')).length;
        
        const totalCap = committeeStudents.length;

        // Absents in this committee on this date
        const absents = attendance.filter(att => 
          att.status === 'absent' && 
          committeeStudents.some(s => s.id === att.student_id)
        ).length;

        const presents = totalCap - absents;

        // Assigned teacher/invigilator name
        const teacherName = committee.teacher_name || 'أ. مغلـق';

        return {
          id: committee.id,
          name: committee.name,
          firstGrade,
          secondGrade,
          thirdGrade,
          presents,
          absents,
          totalCap,
          teacherName,
          notes: absents > 0 ? `غياب ${absents} طلاب` : 'كامل الحضور'
        };
      });

      // Sort committees naturally by name number
      rows.sort((a, b) => {
        const numA = parseInt(a.name.replace(/\D/g, '')) || 0;
        const numB = parseInt(b.name.replace(/\D/g, '')) || 0;
        return numA - numB;
      });

      setReceiptRows(rows);
    }
  }, [committees, students, attendance]);

  // Interactive hooks for auto-population
  const currentCheatStudent = students.find(s => s.id === cheatStudentId);
  const currentAbsentStudent = students.find(s => s.id === absentStudentId);

  // Auto detect subject on selecting cheat/absence dates
  useEffect(() => {
    if (currentCheatStudent) {
      const scheduleOnDay = schedules.find(s => 
        (s.grade === currentCheatStudent.grade || currentCheatStudent.grade?.includes(s.grade)) &&
        s.exam_date === cheatDate
      );
      if (scheduleOnDay) {
        setCheatSubject(scheduleOnDay.subject);
      } else {
        setCheatSubject('اللغة العربية 1');
      }
    }
  }, [cheatStudentId, cheatDate, schedules, students]);

  useEffect(() => {
    if (currentAbsentStudent) {
      const scheduleOnDay = schedules.find(s => 
        (s.grade === currentAbsentStudent.grade || currentAbsentStudent.grade?.includes(s.grade)) &&
        s.exam_date === searchDate
      );
      if (scheduleOnDay) {
        setAbsentSubject(scheduleOnDay.subject);
      } else {
        setAbsentSubject('الرياضيات المتقدمة');
      }
    }
  }, [absentStudentId, searchDate, schedules, students]);

  // Printing Trigger
  const handlePrint = () => {
    setPrintMode(true);
    setTimeout(() => {
      window.print();
    }, 400);
  };

  const getDayNameFromDate = (dateStr: string) => {
    if (!dateStr) return 'الأحد';
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? 'الأحد' : new Intl.DateTimeFormat('ar-SA', { weekday: 'long' }).format(d);
  };

  if (loading) {
    return (
      <div className="bg-card border-2 border-border p-12 rounded-[32px] text-center animate-pulse text-text3">
        <ClipboardList className="mx-auto text-accent mb-4 animate-bounce" size={48} />
        <p className="font-bold text-sm">جاري جلب بيانات الكنترول الرسمية ومزامنة اللجان...</p>
      </div>
    );
  }

  // --- RENDERING ACTUAL CODES & UI ---
  return (
    <div className="space-y-8">
      {/* 1. PRINT PREVIEW CONTAINER (ONLY RENDERS WHEN IS_PRINT_MODE === TRUE) */}
      {printMode && (
        <div className="fixed inset-0 bg-white z-[99999] overflow-y-auto text-black p-[2cm] dir-rtl font-sans antialiased bill-layout print:p-0 print:m-0 print:absolute">
          {/* Action floating bar on screen inside printMode */}
          <div className="fixed top-6 right-6 flex gap-4 print:hidden z-[100000] no-print">
            <button 
              onClick={() => setPrintMode(false)}
              className="px-6 py-3 bg-red text-white text-sm font-black rounded-xl shadow-xl shadow-red/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
            >
              <X size={16} />
              إغلاق المعاينة والرجوع
            </button>
            <button 
              onClick={() => window.print()}
              className="px-6 py-3 bg-green text-white text-sm font-black rounded-xl shadow-xl shadow-green/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
            >
              <Printer size={16} />
              طباعة الآن (PDF)
            </button>
          </div>

          <div className="w-[21cm] min-h-[29.7cm] mx-auto bg-white text-black p-8 print:p-0 print:w-full">
            {/* Ministry Logo Headers / Outer Double Frame */}
            <div className="border-4 double border-black p-6 min-h-[28cm] flex flex-col justify-between">
              <div>
                {/* Standard Saudi Ministry Structure */}
                <div className="grid grid-cols-3 items-center mb-8 border-b-2 border-black pb-4">
                  <div className="text-right text-xs font-bold space-y-1">
                    <p>المملكة العربية السعودية</p>
                    <p>وزارة التعليم</p>
                    <p>{schoolInfo.district}</p>
                    <p>{schoolInfo.school_name}</p>
                  </div>
                  <div className="text-center flex flex-col items-center">
                    <img 
                      src="https://upload.wikimedia.org/wikipedia/ar/1/17/Saudi_Ministry_of_Education_Logo_2025.png" 
                      alt="شعار الوزارة" 
                      className="h-16 w-auto object-contain mb-2"
                      referrerPolicy="no-referrer"
                    />
                    <span className="text-[10px] text-gray-500 font-bold">مكتب التعليم بوسط جدة</span>
                  </div>
                  <div className="text-left text-xs space-y-1 font-mono tracking-tight" dir="ltr">
                    <p>Date: {new Date().toLocaleDateString('en-US')}</p>
                    <p>Year: 1447 H</p>
                    <p>Class: Control A4</p>
                  </div>
                </div>

                {/* Switch to specific printable content */}
                {activeForm === 'cheating' && (
                  <div className="space-y-6">
                    <div className="flex justify-between items-center bg-gray-100 p-2 border-2 border-black">
                      <span className="font-bold text-sm">اسم النموذج: محضر غش طالب</span>
                      <span className="font-bold text-sm">سرّي وعاجل</span>
                    </div>

                    <div className="text-center my-4">
                      <h2 className="text-xl font-black underline underline-offset-4 decoration-2">محضر غش طالب في الاختبار</h2>
                      <p className="text-xs font-bold text-gray-600 mt-1">الدور: الأول | الفصل الدراسي: {cheatSemester} | العام الدراسي: {schoolInfo.academic_year}</p>
                    </div>

                    <div className="text-sm leading-8 space-y-4 text-justify pr-2">
                      <p>
                        أنه في يوم <span className="font-bold border-b border-dotted border-black px-4">{getDayNameFromDate(cheatDate)}</span> 
                        الموافق <span className="font-bold border-b border-dotted border-black px-4 font-mono">{cheatDate}</span>،
                        وفي قاعة غش رقم <span className="font-bold border-b border-dotted border-black px-4">{currentCheatStudent?.committee_name || '1'}</span>،
                        تم اكتشاف حالة غش للطالب/ 
                        <span className="font-bold border-b border-black px-3 text-base text-gray-900">{currentCheatStudent?.full_name || '..............................................'}</span>،
                        رقم الجلوس: <span className="font-bold border-b border-black font-mono px-3">{currentCheatStudent?.seat_no || '—'}</span>،
                        في الصف: <span className="font-bold border-b border-dotted border-black px-4">{currentCheatStudent?.grade || '................................'}</span>،
                        في مادة: <span className="font-bold border-b border-black px-3 font-semibold text-gray-905">{cheatSubject || '................................'}</span>.
                      </p>

                      <div className="space-y-2 mt-4">
                        <h4 className="font-bold text-black text-sm">أولاً: وصف الحالة بالتفصيل:</h4>
                        <div className="p-4 border border-black bg-gray-50/50 rounded-lg min-h-[4cm] font-serif text-sm leading-relaxed text-gray-950 whitespace-pre-line">
                          {cheatDescription}
                        </div>
                      </div>

                      <div className="space-y-2 mt-4">
                        <h4 className="font-bold text-black text-sm">وقد تبين لنا ذلك من خلال (دليل وسيلة الغش المرفقة):</h4>
                        <p className="p-3 border border-dashed border-gray-400 bg-gray-50 text-sm italic">
                          {cheatEvidence}
                        </p>
                      </div>

                      <div className="space-y-2 mt-4">
                        <h4 className="font-bold text-black text-sm">ثانياً: بناءً عليه، تم اتخاذ الإجراءات النظامية التالية:</h4>
                        <div className="p-4 border border-black min-h-[3cm] text-sm leading-relaxed whitespace-pre-line">
                          {cheatAction}
                        </div>
                      </div>
                    </div>

                    {/* Official Signatures Panel of the Mockup */}
                    <div className="mt-10">
                      <h4 className="font-bold text-sm mb-2">لجنة الإشراف والملاحظة والمكلفين:</h4>
                      <table className="w-full border-collapse border-2 border-black text-xs text-center">
                        <thead>
                          <tr className="bg-gray-100 font-bold">
                            <th className="border-2 border-black p-2 w-[5%]">م</th>
                            <th className="border-2 border-black p-2 text-right px-4">الاسم الكامل للمعلم المكلف</th>
                            <th className="border-2 border-black p-2 w-[22%]">الصفة في اللجنة</th>
                            <th className="border-2 border-black p-2 w-[25%]">توقيع الموظف</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td className="border border-black p-2 bg-gray-50 font-bold">1</td>
                            <td className="border border-black p-2 text-right px-4 font-bold">{cheatCommitteeHead}</td>
                            <td className="border border-black p-2 text-red-700 font-black">رئيس اللجنة والكنترول</td>
                            <td className="border border-black p-2 min-w-[3cm]"></td>
                          </tr>
                          <tr>
                            <td className="border border-black p-2 bg-gray-50 font-bold">2</td>
                            <td className="border border-black p-2 text-right px-4 font-semibold">{cheatObserver || 'ملاحظ اللجنة الاختيارية'}</td>
                            <td className="border border-black p-2">ملاحظ قاعة الاختبار</td>
                            <td className="border border-black p-2 min-w-[3cm]"></td>
                          </tr>
                          <tr>
                            <td className="border border-black p-2 bg-gray-50 font-bold">3</td>
                            <td className="border border-black p-2 text-right px-4 text-gray-400">................................................</td>
                            <td className="border border-black p-2 text-gray-400">ملاحظ ثان</td>
                            <td className="border border-black p-2 min-w-[3cm]"></td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {activeForm === 'absence' && (
                  <div className="space-y-6">
                    <div className="flex justify-between items-center bg-gray-100 p-2 border-2 border-black">
                      <span className="font-bold text-sm">اسم النموذج: محضر غياب طالب عن الاختبار</span>
                      <span className="font-black text-sm text-red-600">هام جداً للرصد</span>
                    </div>

                    <div className="text-center my-6">
                      <h2 className="text-2xl font-black underline underline-offset-4 decoration-2">محضر غياب طالب عن الاختبار الرسمي</h2>
                      <p className="text-xs font-bold text-gray-600 mt-2">وزارة التعليم — الإدارة العامة للتعليم بمحافظة جدة — الكنترول العام</p>
                    </div>

                    {/* Standard Arabic grid system block mapping image */}
                    <div className="border-2 border-black rounded-lg overflow-hidden my-4 text-sm">
                      <div className="grid grid-cols-2 border-b border-black">
                        <div className="p-3 border-l border-black flex gap-2">
                          <span className="font-bold text-gray-700 w-24">اسم الطالب:</span>
                          <span className="font-black text-black text-base">{currentAbsentStudent?.full_name || 'لا يوجد طالب محدد'}</span>
                        </div>
                        <div className="p-3 flex gap-2">
                          <span className="font-bold text-gray-700 w-24">رقم الجلوس:</span>
                          <span className="font-mono font-bold text-black text-base">{currentAbsentStudent?.seat_no || '—'}</span>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 border-b border-black">
                        <div className="p-3 border-l border-black flex gap-2">
                          <span className="font-bold text-gray-700 w-24">اليوم:</span>
                          <span className="font-bold text-black">{getDayNameFromDate(searchDate)}</span>
                        </div>
                        <div className="p-3 flex gap-2">
                          <span className="font-bold text-gray-700 w-24">التاريخ:</span>
                          <span className="font-mono font-bold text-black">{searchDate}</span>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 border-b border-black">
                        <div className="p-3 border-l border-black flex gap-2">
                          <span className="font-bold text-gray-700 w-24">الفترة:</span>
                          <span className="font-bold text-black">{absentPeriod}</span>
                        </div>
                        <div className="p-3 flex gap-2">
                          <span className="font-bold text-gray-700 w-24">اللجنة:</span>
                          <span className="font-bold text-black">{currentAbsentStudent?.committee_name || 'اللجنة العامة'}</span>
                        </div>
                      </div>
                      <div className="grid grid-cols-2">
                        <div className="p-3 border-l border-black flex gap-2">
                          <span className="font-bold text-gray-700 w-24">المادة:</span>
                          <span className="font-bold text-black text-base">{absentSubject}</span>
                        </div>
                        <div className="p-3 flex gap-2">
                          <span className="font-bold text-gray-700 w-24">الصف:</span>
                          <span className="font-bold text-black">{currentAbsentStudent?.grade || 'الأول الثانوي'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-6 border-2 border-dashed border-gray-400 bg-gray-50/50 rounded-xl my-6 space-y-4">
                      <h4 className="font-bold text-sm text-black">المصادقة الرسمية على الغياب المذكور:</h4>
                      <p className="text-xs leading-relaxed text-gray-700">
                        نحن الملاحظون أدناه المكلفون بهذه اللجنة نشهد بأن الطالب المذكور أعلاه قد تخلّف وغاب عن حضور جلسة اختبار المادة المشار إليها في وقتها المحدد طوال الفترة، وعليه حررنا هذا إثباتاً للواقعة للرصد في نظام نور والكنترول.
                      </p>

                      <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-gray-300 text-xs">
                        <div className="space-y-2">
                          <p><span className="font-bold">اسم الملاحظ (1):</span> {absentObserver1 || '..............................................'}</p>
                          <p><span className="font-bold">التوقيع:</span> ......................................................</p>
                        </div>
                        <div className="space-y-2">
                          <p><span className="font-bold">اسم الملاحظ (2):</span> {absentObserver2 || '..............................................'}</p>
                          <p><span className="font-bold">التوقيع:</span> ......................................................</p>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-gray-300 text-xs text-right">
                        <p><span className="font-bold">اسم رئيس لجنة الإشراف والملاحظة بالكنترول:</span> {schoolInfo.vice_principal}</p>
                        <p className="mt-2"><span className="font-bold">التوقيع والمصادقة:</span> ......................................................</p>
                      </div>
                    </div>

                    <div className="bg-red-50 text-red-900 p-4 border border-red-300 rounded-lg text-xs space-y-1">
                      <p className="font-bold">تنبيهات مشددة للكنترول للعمل بموجبها:</p>
                      <ul className="list-disc list-inside space-y-1 pr-4">
                        <li>يوضع محضر الغياب حسب رقم جلوس الطالب في تسلسل أوراق الإجابة ويسلم مع المظروف.</li>
                        <li>يسجل هذا الغياب فوراً في بيان الكنترول العام وسجل الغائبين ونظام نور الإلكتروني لإرسال الإشعار لولي أمره.</li>
                      </ul>
                    </div>
                  </div>
                )}

                {activeForm === 'flow' && (
                  <div className="space-y-6">
                    <div className="flex justify-between items-center bg-gray-100 p-2 border-2 border-black text-sm font-bold">
                      <span>نموذج متابعة لجان سير أوراق الإجابة</span>
                      <span> {selectedGrade} </span>
                    </div>

                    <div className="text-center my-6">
                      <h2 className="text-2xl font-black underline underline-offset-4 decoration-2">متابعة سير وحركة أوراق الإجابة</h2>
                      <p className="text-xs font-bold text-gray-500 mt-2">خطوات الاستلام والتصحيح والتدقيق في اللجان الفنية بالكنترول</p>
                    </div>

                    <table className="w-full border-collapse border-2 border-black text-[11px] text-center">
                      <thead>
                        <tr className="bg-cyan-50 font-bold">
                          <th className="border-2 border-black p-2 w-[14%]" rowSpan={2}>اليوم / التاريخ</th>
                          <th className="border-2 border-black p-2 w-[18%]" rowSpan={2}>المادة</th>
                          <th className="border-2 border-black p-2 w-[10%]" rowSpan={2}>عدد الأوراق المستلمة</th>
                          <th className="border-2 border-black p-2" colSpan={3}>لجنة التصحيح والرصد الفني</th>
                          <th className="border-2 border-black p-2" rowSpan={2}>لجنة التحكم والضبط (الاستلام النهائي والحفظ)</th>
                        </tr>
                        <tr className="bg-cyan-50 font-bold">
                          <th className="border-2 border-black p-2 w-[22%]">الاستلام من لجنة الضبط</th>
                          <th className="border-2 border-black p-2 w-[6%]">تصحيح</th>
                          <th className="border-2 border-black p-2 w-[6%]">تدقيق</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Object.entries(weeklySubjects).map(([day, val], idx) => {
                          const item = val as { subject: string; count: number; corrName: string; controlName: string };
                          return (
                            <tr key={idx} className="h-20">
                              <td className="border-2 border-black p-1 font-bold bg-gray-50">{day}</td>
                              <td className="border-2 border-black p-1 font-bold">{item.subject}</td>
                              <td className="border-2 border-black p-1 font-bold bg-gray-50 font-mono">{item.count}</td>
                              <td className="border-2 border-black p-1 text-right text-[10px] space-y-1">
                                <p><span className="font-bold">الاسم:</span> {item.corrName}</p>
                                <p><span className="font-bold">التوقيع:</span> ..........................</p>
                              </td>
                              <td className="border-2 border-black p-1 text-[16px] font-bold">✓</td>
                              <td className="border-2 border-black p-1 text-[16px] font-bold">✓</td>
                              <td className="border-2 border-black p-1 text-right text-[10px] space-y-1 bg-gray-50">
                                <p><span className="font-bold">الاسم:</span> {item.controlName}</p>
                                <p><span className="font-bold">التوقيع:</span> ..........................</p>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}

                {activeForm === 'receipt' && (
                  <div className="space-y-6">
                    <div className="flex justify-between items-center bg-gray-100 p-2 border-2 border-black text-sm font-bold">
                      <span>اسم النموذج: كشف استلام أوراق الإجابة من اللجان</span>
                      <span>تاريخ اليوم: {searchDate}</span>
                    </div>

                    <div className="text-center my-4">
                      <h2 className="text-2xl font-black underline underline-offset-4 decoration-2">كشف وحصر استلام أوراق الإجابة من لجان القاعات</h2>
                      <p className="text-xs font-bold text-gray-500 mt-2">متابعة إحصاء أعداد الطلاب الحاضرين والغائبين والمجموع الكلي لكل لجنة</p>
                    </div>

                    <table className="w-full border-collapse border-2 border-black text-[10px] text-center">
                      <thead>
                        <tr className="bg-gray-100 font-bold text-xs h-10">
                          <th className="border-2 border-black p-2 w-[7%]" rowSpan={2}>رقم اللجنة</th>
                          <th className="border-2 border-black p-2" colSpan={3}>الصف والمرحلة</th>
                          <th className="border-2 border-black p-2 w-[8%]" rowSpan={2}>الحاضرون</th>
                          <th className="border-2 border-black p-2 w-[8%]" rowSpan={2}>الغائبون</th>
                          <th className="border-2 border-black p-2 w-[8%]" rowSpan={2}>المجموع</th>
                          <th className="border-2 border-black p-2 w-[11%]" rowSpan={2}>استلام المناداة</th>
                          <th className="border-2 border-black p-2 w-[8%]" rowSpan={2}>عدد المحاضر</th>
                          <th className="border-2 border-black p-2 text-right px-3" rowSpan={2}>اسم الملاحظ</th>
                          <th className="border-2 border-black p-2 w-[16%]" rowSpan={2}>توقيع الملاحظ</th>
                        </tr>
                        <tr className="bg-gray-100 font-bold text-[9px]">
                          <th className="border-2 border-black p-1 w-[6%]">أول ثانوي</th>
                          <th className="border-2 border-black p-1 w-[6%]">ثاني ثانوي</th>
                          <th className="border-2 border-black p-1 w-[6%]">ثالث ثانوي</th>
                        </tr>
                      </thead>
                      <tbody>
                        {receiptRows.map((row, idx) => (
                          <tr key={idx} className="h-10 text-xs font-bold">
                            <td className="border border-black p-1 bg-gray-50 font-bold">{row.name}</td>
                            <td className="border border-black p-1 font-mono">{row.firstGrade || '0'}</td>
                            <td className="border border-black p-1 font-mono">{row.secondGrade || '0'}</td>
                            <td className="border border-black p-1 font-mono">{row.thirdGrade || '0'}</td>
                            <td className="border border-black p-1 text-green-700 bg-green-50 font-mono">{row.presents}</td>
                            <td className="border border-black p-1 text-red-600 bg-red-50 font-mono">{row.absents}</td>
                            <td className="border border-black p-1 font-mono bg-cyan-50/50">{row.totalCap}</td>
                            <td className="border border-black p-1 text-cyan-800">[✓] نعم</td>
                            <td className="border border-black p-1 font-mono">{row.absents > 0 ? '1' : '0'}</td>
                            <td className="border border-black p-1 text-right px-2 text-[10px] font-normal">{row.teacherName}</td>
                            <td className="border border-black p-1 min-w-[2cm]"></td>
                          </tr>
                        ))}
                        {/* Cumulative total row calculated on the fly representing high quality math */}
                        <tr className="h-10 text-xs font-black bg-gray-200">
                          <td className="border border-black p-1">المجموع الكلي</td>
                          <td className="border border-black p-1 font-mono">
                            {receiptRows.reduce((a, b) => a + b.firstGrade, 0)}
                          </td>
                          <td className="border border-black p-1 font-mono">
                            {receiptRows.reduce((a, b) => a + b.secondGrade, 0)}
                          </td>
                          <td className="border border-black p-1 font-mono">
                            {receiptRows.reduce((a, b) => a + b.thirdGrade, 0)}
                          </td>
                          <td className="border border-black p-1 text-green-700 font-mono">
                            {receiptRows.reduce((a, b) => a + b.presents, 0)}
                          </td>
                          <td className="border border-black p-1 text-red-600 font-mono">
                            {receiptRows.reduce((a, b) => a + b.absents, 0)}
                          </td>
                          <td className="border border-black p-1 font-mono">
                            {receiptRows.reduce((a, b) => a + b.totalCap, 0)}
                          </td>
                          <td className="border border-black p-1 text-center" colSpan={4}>
                            مطابقة للبيانات الرسمية المستلمة في الكنترول 
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Bottom Standard Signature Line layout matching Saudi formal sheets */}
              <div className="border-t border-black pt-4 grid grid-cols-2 text-center text-xs font-extrabold text-black">
                <div className="space-y-4">
                  <p>المستلم الفني وضابط الكنترول الاسم/</p>
                  <p className="text-gray-400">....................................................................</p>
                  <p>التوقيع: ............................</p>
                </div>
                <div className="space-y-4">
                  <p>رئيس لجنة الكنترول ومدير المدرسة:</p>
                  <p className="text-gray-900 border-b border-dotted border-black inline-block px-4">{schoolInfo.principal}</p>
                  <p>التوقيع الرسمي: ............................</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. ON-SCREEN INTERACTIVE DESKTOP INTERFACE */}
      <div className="no-print space-y-6">
        {/* Top visual introduction stating focus solely on control feature */}
        <div className="bg-linear-to-r from-accent/90 to-purple/90 text-white p-8 rounded-[32px] shadow-xl relative overflow-hidden">
          <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-white/10 to-transparent pointer-events-none rounded-full blur-3xl" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <span className="bg-white/20 text-white rounded-full px-4 py-1 text-xs font-extrabold uppercase tracking-widest leading-none mb-3 inline-block">صلاحية الكنترول العام</span>
              <h1 className="text-3xl font-display font-black text-white">إصدار الوثائق ونماذج الكنترول الورقية الرسمية A4</h1>
              <p className="text-sm text-white/80 mt-2 leading-relaxed max-w-2xl">
                بصفتك ضابط لجنة الكنترول، يمكنك هنا طباعة وتحرير المحاضر والكشوف التنظيمية الكبرى محاكاة ومربوطة ببيانات الطلاب والغيابات والمعلمين المكلفين بلجان الاختبارات بدقة بالغة.
              </p>
            </div>
          </div>
        </div>

        {/* Dynamic form selector tabs with badges */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { id: 'receipt', title: 'كشف استلام الأوراق من اللجان', desc: 'حصر حضور وغياب الطلاب والمناداة لكل لجنة وقاعة', icon: Users, color: 'text-green bg-green/10 border-green/20' },
            { id: 'flow', title: 'بيان متابعة سير أوراق الإجابة', desc: 'تتبع حركة مظاريف أوراق الإجابة والتصحيح والتدقيق', icon: ClipboardList, color: 'text-accent bg-accent/10 border-accent/20' },
            { id: 'absence', title: 'محضر غياب طالب عن الاختبار', desc: 'تحرير وتوثيق محضر غياب رسمي لطالب لربطه بملفه', icon: UserX, color: 'text-red bg-red/10 border-red/20' },
            { id: 'cheating', title: 'محضر غش طالب في قاعة الاختبار', desc: 'محضر إثبات ضبط غش طالب مع تفاصيل ودليل الواقعة', icon: AlertTriangle, color: 'text-gold bg-gold/10 border-gold/20' },
          ].map((form) => (
            <button
              key={form.id}
              onClick={() => setActiveForm(form.id as ControlFormType)}
              className={cn(
                "p-5 rounded-3xl border-2 transition-all text-right group relative overflow-hidden flex flex-col justify-between h-36",
                activeForm === form.id 
                  ? "bg-card border-accent text-text shadow-xl shadow-accent/10 scale-[1.02]" 
                  : "bg-card border-border text-text hover:border-accent/40"
              )}
            >
              <div className="flex justify-between items-start w-full">
                <div className={cn("w-10 h-10 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110", form.color)}>
                  <form.icon size={20} />
                </div>
                {activeForm === form.id && (
                  <span className="w-2.5 h-2.5 rounded-full bg-accent animate-ping" />
                )}
              </div>
              <div>
                <h3 className="font-extrabold text-xs lg:text-sm mb-1 text-text">{form.title}</h3>
                <p className="text-[10px] text-text3 leading-tight line-clamp-2">{form.desc}</p>
              </div>
            </button>
          ))}
        </div>

        {/* Dynamic configuration side-by-side workspace: interactive controls on left, preview A4 zoom-page on right */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
          
          {/* Work Control Form Inputs (Left: 5 cols) */}
          <div className="xl:col-span-5 space-y-6">
            <div className="bg-card border-2 border-border p-6 rounded-3xl space-y-6">
              <div className="flex justify-between items-center pb-4 border-b border-border">
                <span className="text-xs font-black text-text3 uppercase">خيارات التحكم والتحرير</span>
                <span className="bg-accent/10 text-accent font-bold px-3 py-1 text-[10px] rounded-lg">إدخالات مباشرة</span>
              </div>

              {/* Form 1: Cheating Report inputs */}
              {activeForm === 'cheating' && (
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-text3">البحث واختيار الطالب لملء المحضر:</label>
                    <select
                      value={cheatStudentId}
                      onChange={(e) => setCheatStudentId(e.target.value)}
                      className="w-full bg-bg3 border border-border rounded-xl px-4 py-3 text-xs outline-none focus:border-accent font-semibold"
                    >
                      {students.map(s => (
                        <option key={s.id} value={s.id}>{s.full_name} ({s.grade || 'أول ثانوي'}) - جلوس: {s.seat_no || 'بدون'}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-text3 font-mono">تاريخ اختبار الطلاب:</label>
                    <input 
                      type="date" 
                      value={cheatDate}
                      onChange={(e) => setCheatDate(e.target.value)}
                      className="w-full bg-bg3 border border-border rounded-xl px-4 py-3 text-xs outline-none focus:border-accent font-bold"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-text3">اسم المادة:</label>
                      <input 
                        value={cheatSubject}
                        onChange={(e) => setCheatSubject(e.target.value)}
                        className="w-full bg-bg3 border border-border rounded-xl px-4 py-3 text-xs outline-none focus:border-accent"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-text3">الفصل الدراسي:</label>
                      <select 
                        value={cheatSemester}
                        onChange={(e) => setCheatSemester(e.target.value)}
                        className="w-full bg-bg3 border border-border rounded-xl px-4 py-3 text-xs outline-none focus:border-accent"
                      >
                        <option value="الأول">الفصل الأول</option>
                        <option value="الثاني">الفصل الثاني</option>
                        <option value="الثالث">الفصل الثالث</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-text3">اسم ملاحظ القاعة المتواجد:</label>
                    <input 
                      value={cheatObserver}
                      onChange={(e) => setCheatObserver(e.target.value)}
                      placeholder="أو اختر من المعلمين..."
                      className="w-full bg-bg3 border border-border rounded-xl px-4 py-3 text-xs outline-none focus:border-accent"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-text3">وصف حالة الغش والتحريث:</label>
                    <textarea 
                      value={cheatDescription}
                      onChange={(e) => setCheatDescription(e.target.value)}
                      rows={4}
                      className="w-full bg-bg3 border border-border rounded-xl px-4 py-3 text-xs outline-none focus:border-accent font-serif leading-relaxed"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-text3">وسيلة دليل الغش المستخدمة:</label>
                    <input 
                      value={cheatEvidence}
                      onChange={(e) => setCheatEvidence(e.target.value)}
                      className="w-full bg-bg3 border border-border rounded-xl px-4 py-3 text-xs outline-none focus:border-accent"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-text3">القرار والإجراء المتخذ فوراً:</label>
                    <textarea 
                      value={cheatAction}
                      onChange={(e) => setCheatAction(e.target.value)}
                      rows={2}
                      className="w-full bg-bg3 border border-border rounded-xl px-4 py-3 text-xs outline-none focus:border-accent"
                    />
                  </div>
                </div>
              )}

              {/* Form 2: Absence inputs */}
              {activeForm === 'absence' && (
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-text3">اختر الطالب الغائب من الطلاب الفعليين:</label>
                    <select
                      value={absentStudentId}
                      onChange={(e) => setAbsentStudentId(e.target.value)}
                      className="w-full bg-bg3 border border-border rounded-xl px-4 py-3 text-xs outline-none focus:border-accent font-semibold"
                    >
                      {students.map(s => (
                        <option key={s.id} value={s.id}>{s.full_name} ({s.student_no}) - {s.committee_name || 'بدون قاعة'}</option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-text3">الفترة:</label>
                      <select 
                        value={absentPeriod}
                        onChange={(e) => setAbsentPeriod(e.target.value)}
                        className="w-full bg-bg3 border border-border rounded-xl px-4 py-3 text-xs outline-none focus:border-accent"
                      >
                        <option value="الأولى">الأولى (صباحاً)</option>
                        <option value="الثانية">الثانية (ظهراً)</option>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-text3">المادة المتغيب عنها:</label>
                      <input 
                        value={absentSubject}
                        onChange={(e) => setAbsentSubject(e.target.value)}
                        className="w-full bg-bg3 border border-border rounded-xl px-4 py-3 text-xs outline-none focus:border-accent font-bold"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-text3">معلم الملاحظة الأول المكلف بالقاعة:</label>
                    <input 
                      value={absentObserver1}
                      onChange={(e) => setAbsentObserver1(e.target.value)}
                      className="w-full bg-bg3 border border-border rounded-xl px-4 py-3 text-xs outline-none focus:border-accent"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-text3">معلم الملاحظة الثاني المكلف بالقاعة:</label>
                    <input 
                      value={absentObserver2}
                      onChange={(e) => setAbsentObserver2(e.target.value)}
                      className="w-full bg-bg3 border border-border rounded-xl px-4 py-3 text-xs outline-none focus:border-accent"
                    />
                  </div>

                  <div className="bg-accent/5 p-4 rounded-xl border border-accent/20 text-[11px] text-text2 leading-relaxed">
                    <p className="font-bold text-accent mb-1">دعم رصد تلقائي في نظام الكنترول:</p>
                    سيتم ملء كشف الحاضرين والغائبين العام تلقائياً للتحقق من سلامة الأرقام الإجمالية ومطابقتها للمظاريف عند إنهاء تسليم أوراق الإجابة.
                  </div>
                </div>
              )}

              {/* Form 3: Flow inputs */}
              {activeForm === 'flow' && (
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-text3">الصف وتوزيع المرحلة المعنية لمتابعة السير:</label>
                    <select
                      value={selectedGrade}
                      onChange={(e) => setSelectedGrade(e.target.value as any)}
                      className="w-full bg-bg3 border border-border rounded-xl px-4 py-3 text-xs outline-none focus:border-accent font-black"
                    >
                      <option value="الصف الأول الثانوي">أول ثانوي (الصف الأول الثانوي)</option>
                      <option value="الصف الثاني الثانوي">ثاني ثانوي (الصف الثاني الثانوي)</option>
                      <option value="الصف الثالث الثانوي">ثالث ثانوي (الصف الثالث الثانوي)</option>
                    </select>
                  </div>

                  <div className="border border-border rounded-2xl overflow-hidden divide-y divide-border">
                    <div className="p-3 bg-bg3 text-[10px] font-bold text-text3 flex justify-between">
                      <span>اليوم</span>
                      <span>اسم المادة بالاختبار</span>
                    </div>
                    {Object.entries(weeklySubjects).map(([day, val]) => {
                      const item = val as { subject: string; count: number; corrName: string; controlName: string };
                      return (
                        <div key={day} className="p-3 grid grid-cols-12 gap-2 items-center text-xs">
                          <span className="col-span-3 font-bold text-text">{day}</span>
                          <input
                            value={item.subject}
                            onChange={(e) => {
                              const updated = { ...weeklySubjects };
                              updated[day].subject = e.target.value;
                              setWeeklySubjects(updated);
                            }}
                            className="col-span-9 bg-bg h-8 rounded-lg px-2 border border-border outline-none text-xs text-text focus:border-accent font-bold"
                          />
                        </div>
                      );
                    })}
                  </div>

                  <div className="bg-bg3 p-4 rounded-xl text-xs text-text3">
                    <p className="font-bold mb-1">تعليمات الضبط والتصحيح:</p>
                    يساعد هذا البيان أعضاء الكنترول في مراجعة التواقيع وسرعة رصد الدرجات وإحالتها للمدققين في نظام نور للتثبيت النهائي.
                  </div>
                </div>
              )}

              {/* Form 4: Receipt inputs */}
              {activeForm === 'receipt' && (
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-text3">التاريخ المالي والرقابي للرصد اليومي المتكامل:</label>
                    <input 
                      type="date" 
                      value={searchDate}
                      onChange={(e) => setSearchDate(e.target.value)}
                      className="w-full bg-bg3 border border-border rounded-xl px-4 py-3 text-xs outline-none focus:border-accent font-black text-center"
                    />
                  </div>

                  <div className="p-4 bg-green/10 text-green-900 dark:text-green-300 rounded-2xl border border-green/20 text-xs">
                    <p className="font-bold text-sm mb-1">عمل تلقائي ذكي ومترابط:</p>
                    <p className="leading-relaxed">
                      يتم حساب كشف استلام الأوراق من اللجان تلقائياً وحساب الإجماليات والنسب ومطابقتها مع غيابات اللجان المسجلة في هذا اليوم للتأكيد والحصر.
                    </p>
                  </div>

                  <div className="space-y-2 opacity-90 max-h-56 overflow-y-auto border border-border rounded-2xl p-2 bg-bg2">
                    <p className="text-[10px] font-bold text-text3 px-2 mb-2">اللجان المكتشفة بالجدول الفعلي:</p>
                    {receiptRows.map((r, i) => (
                      <div key={i} className="flex justify-between items-center bg-bg3 p-2 rounded-xl text-xs">
                        <span className="font-bold text-text">{r.name}</span>
                        <span className="text-[10px] text-text3">
                          أوراق: <strong className="text-text font-bold">{r.totalCap}</strong> | غياب: 
                          <span className={cn(r.absents > 0 ? "text-red font-black" : "text-text3")}> {r.absents} </span>
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <button
                onClick={handlePrint}
                className="w-full bg-accent text-white py-4 px-6 rounded-2xl font-black shadow-xl shadow-accent/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
              >
                <Printer size={20} />
                معاينة وتحضير للطباعة (A4)
              </button>
            </div>
          </div>

          {/* Interactive Screen Preview (Right: 7 cols) */}
          <div className="xl:col-span-7 flex flex-col items-center">
            <span className="text-xs font-bold text-accent mb-2 flex items-center gap-1.5 self-start">
              <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
              ورقة معاينة A4 التفاعلية (تقريبي)
            </span>

            <div className="w-full max-w-[620px] aspect-[1/1.414] bg-white border border-border text-black shadow-2xl p-6 overflow-y-auto leading-relaxed text-right dir-rtl font-sans text-[11px] rounded-[24px]">
              {/* Inside Interactive Mini Frame simulating standard layout */}
              <div className="border border-gray-400 p-4 h-full flex flex-col justify-between">
                
                {/* Header Mockup */}
                <div className="grid grid-cols-12 items-center border-b border-black pb-2 mb-4">
                  <div className="col-span-4 text-[8px] space-y-0.5 leading-tight">
                    <p className="font-bold">المملكة العربية السعودية</p>
                    <p>وزارة التعليم</p>
                    <p className="text-[7px] text-gray-500">{schoolInfo.district}</p>
                    <p className="font-bold">{schoolInfo.school_name}</p>
                  </div>
                  <div className="col-span-4 text-center flex flex-col items-center">
                    <img 
                      src="https://upload.wikimedia.org/wikipedia/ar/1/17/Saudi_Ministry_of_Education_Logo_2025.png" 
                      alt="Logo" 
                      className="h-10 w-auto object-contain mx-auto"
                      referrerPolicy="no-referrer"
                    />
                    <span className="text-[7px] font-bold">الكنترول المدرسي</span>
                  </div>
                  <div className="col-span-4 text-left font-mono text-[7px]" dir="ltr">
                    <p>Date: {searchDate}</p>
                    <p>M-H: A4 Form</p>
                  </div>
                </div>

                {/* Simulated Content Body */}
                <div className="flex-1 overflow-y-auto">
                  {activeForm === 'cheating' && (
                    <div className="space-y-2">
                      <div className="bg-gray-100 p-1.5 text-center font-bold text-[9px] border border-black mb-2">محضر غش طالب في قاعة الاختبار</div>
                      <p>
                        أنه في يوم <span className="font-bold underline">{getDayNameFromDate(cheatDate)}</span> 
                        الموافق <span className="font-bold">{cheatDate}</span>،
                        في قاعة الاختبارات، سجل الطالب/ <strong className="text-gray-900 border-b border-black px-1">{currentCheatStudent?.full_name || '...................'}</strong>،
                        جلوس: <span className="font-mono">{currentCheatStudent?.seat_no || '—'}</span>،
                        في الصف: <span className="font-bold">{currentCheatStudent?.grade || 'الأول الثانوي'}</span>،
                        مادة: <span className="underline font-bold">{cheatSubject}</span>.
                      </p>

                      <div className="space-y-0.5">
                        <span className="font-bold block text-[8px] text-gray-600">وصف الواقعة والضبط:</span>
                        <p className="p-2 bg-gray-50 border border-gray-300 font-serif text-[10px] whitespace-pre-line leading-normal">{cheatDescription}</p>
                      </div>

                      <div className="space-y-0.5">
                        <span className="font-bold block text-[8px] text-gray-600">الدليل والوسيلة المصادرة:</span>
                        <p className="p-2 border border-dashed border-gray-400 bg-gray-50 text-[10px] italic">{cheatEvidence}</p>
                      </div>
                    </div>
                  )}

                  {activeForm === 'absence' && (
                    <div className="space-y-2">
                      <div className="bg-gray-100 p-1.5 text-center font-bold text-[9px] border border-black mb-2">محضر غياب طالب عن الاختبار</div>
                      
                      <div className="grid grid-cols-2 gap-2 border border-black p-2 rounded text-[10px] bg-gray-50/50">
                        <p><span className="font-bold">اسم الطالب:</span> {currentAbsentStudent?.full_name || 'يجب تحديد طالب'}</p>
                        <p><span className="font-bold">رقم الجلوس:</span> <span className="font-mono font-bold">{currentAbsentStudent?.seat_no || '—'}</span></p>
                        <p><span className="font-bold">التاريخ:</span> <span className="font-mono">{searchDate}</span></p>
                        <p><span className="font-bold">اللجنة والصف:</span> {currentAbsentStudent?.committee_name || 'شمال'} ({currentAbsentStudent?.grade || 'الأول'})</p>
                        <p colSpan={2} className="col-span-2"><span className="font-bold">مادة الاختبار:</span> {absentSubject}</p>
                      </div>

                      <div className="border border-dashed border-gray-300 p-2 text-[9px] leading-relaxed mt-2 text-gray-600">
                        يشهد المكلفون بملاحظة لجنة الاختبار بأن الطالب المسجل بياناته أعلاه لم يسجل تواجده في القاعة طوال جلسة تفريغ أوراق الإجابة. وبالرجوع إليه تبين غيابه، وبموجبه حررنا هذا المحضر.
                      </div>
                    </div>
                  )}

                  {activeForm === 'flow' && (
                    <div className="space-y-2">
                      <div className="bg-gray-100 p-1.5 text-center font-bold text-[9px] border border-black mb-2">دورة متابعة وتصحيح سير الأوراق — {selectedGrade}</div>
                      <table className="w-full border-collapse border border-black text-[9px] text-center">
                        <thead>
                          <tr className="bg-cyan-50 font-bold">
                            <th className="border border-black p-1">اليوم</th>
                            <th className="border border-black p-1">المادة</th>
                            <th className="border border-black p-1">أوراق</th>
                            <th className="border border-black p-1">لجنة التصحيح</th>
                            <th className="border border-black p-1">كنترول الاستلام</th>
                          </tr>
                        </thead>
                        <tbody>
                          {Object.entries(weeklySubjects).map(([day, val], idx) => {
                            const item = val as { subject: string; count: number; corrName: string; controlName: string };
                            return (
                              <tr key={idx} className="h-10 text-[9px]">
                                <td className="border border-black p-1 font-bold">{day}</td>
                                <td className="border border-black p-1">{item.subject}</td>
                                <td className="border border-black p-1 font-mono">{item.count}</td>
                                <td className="border border-black p-1 text-[8px] leading-tight font-normal">
                                  {item.corrName}
                                </td>
                                <td className="border border-black p-1 text-[8px] leading-tight font-normal">
                                  {item.controlName}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {activeForm === 'receipt' && (
                    <div className="space-y-2">
                      <div className="bg-gray-100 p-1.5 text-center font-bold text-[9px] border border-black mb-2">مسير حصر وتسلم الأوراق من اللجان والقاعات</div>
                      <table className="w-full border-collapse border border-black text-[8px] text-center">
                        <thead>
                          <tr className="bg-gray-100 font-bold">
                            <th className="border border-black p-1">اللجنة</th>
                            <th className="border border-black p-1">1ث</th>
                            <th className="border border-black p-1">2ث</th>
                            <th className="border border-black p-1">3ث</th>
                            <th className="border border-black p-1">حاضر</th>
                            <th className="border border-black p-1">غائب</th>
                            <th className="border border-black p-1">مجموع</th>
                            <th className="border border-black p-1 text-right px-1">الملاحظ</th>
                          </tr>
                        </thead>
                        <tbody>
                          {receiptRows.slice(0, 7).map((row, idx) => (
                            <tr key={idx} className="h-6">
                              <td className="border border-black p-0.5 font-bold bg-gray-50">{row.name}</td>
                              <td className="border border-black p-0.5">{row.firstGrade}</td>
                              <td className="border border-black p-0.5">{row.secondGrade}</td>
                              <td className="border border-black p-0.5">{row.thirdGrade}</td>
                              <td className="border border-black p-0.5 text-green bg-green-50/50">{row.presents}</td>
                              <td className="border border-black p-0.5 text-red bg-red-50/50 font-black">{row.absents}</td>
                              <td className="border border-black p-0.5 bg-gray-50">{row.totalCap}</td>
                              <td className="border border-black p-0.5 text-right px-1 truncate max-w-[2.2cm]">{row.teacherName}</td>
                            </tr>
                          ))}
                          {receiptRows.length > 7 && (
                            <tr className="h-6">
                              <td className="border border-black p-0.5 text-center text-[7px] text-gray-500 font-bold" colSpan={8}>
                                ... يظهر ({receiptRows.length - 7}) لجان إضافية في الإصدار الكامل للطباعة ...
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* Signatures footer */}
                <div className="border-t border-black pt-2 mt-4 grid grid-cols-2 text-center text-[8px] font-bold">
                  <div>
                    <p>أمين الكنترول الفني:</p>
                    <p className="text-gray-400 mt-2">التوقيع: .....................</p>
                  </div>
                  <div>
                    <p>مدير المدرسة ورئيس اللجنة:</p>
                    <p className="font-semibold text-gray-800">{schoolInfo.principal}</p>
                    <p className="text-gray-400 mt-0.5">التوقيع: .....................</p>
                  </div>
                </div>

              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
