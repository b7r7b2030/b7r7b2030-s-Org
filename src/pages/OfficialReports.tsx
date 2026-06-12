import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Printer, 
  Search, 
  Calendar,
  Layers,
  Users,
  CheckCircle2,
  XCircle,
  Package,
  History,
  ShieldCheck,
  ClipboardList
} from 'lucide-react';
import { sbFetch } from '../services/supabase';
import { PrintLayout } from '../components/PrintLayout';
import { OfficialControlReports } from '../components/OfficialControlReports';
import { cn } from '../lib/utils';

type ReportType = 'attendance_daily' | 'committee_status' | 'absent_list' | 'system_audit' | 'teacher_attendance';

export const OfficialReports: React.FC = () => {
  // Tab Switcher between A4 Control Mockups and general Quick Reports
  const [activeTab, setActiveTab] = useState<'control_a4' | 'general_logs'>('control_a4');
  
  const [activeReport, setActiveReport] = useState<ReportType>('attendance_daily');
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchDate, setSearchDate] = useState(new Date().toISOString().split('T')[0]);
  const [isPrinting, setIsPrinting] = useState(false);

  const reports = [
    { id: 'attendance_daily', title: 'تقرير الحضور والغياب اليومي', icon: FileText, desc: 'كشف الحضور والغياب لجميع اللجان في يوم محدد' },
    { id: 'committee_status', title: 'تقرير حالة اللجان (المظاريف)', icon: Package, desc: 'تتبع استلام وتسليم المظاريف وحالة القاعات' },
    { id: 'absent_list', title: 'كشف الغياب الرسمي (للمرشد)', icon: XCircle, desc: 'قائمة بيانات الطلاب الغائبين وأرقام التواصل' },
    { id: 'system_audit', title: 'سجل العمليات اليومي (Audit Trail)', icon: History, desc: 'توثيق رسمي لجميع الحركات التي تمت في النظام' },
  ];

  useEffect(() => {
    if (activeTab === 'general_logs') {
      fetchReportData();
    }
  }, [activeReport, searchDate, activeTab]);

  const fetchReportData = async () => {
    setLoading(true);
    try {
      let result;
      switch (activeReport) {
        case 'attendance_daily':
          result = await sbFetch('attendance', 'GET', null, `?select=*,students(full_name,student_no,grade,classroom),committees(name),staff(full_name)`);
          break;
        case 'committee_status':
          result = await sbFetch('v_envelope_tracking', 'GET');
          break;
        case 'absent_list':
          result = await sbFetch('v_absent_students', 'GET');
          break;
        case 'system_audit':
          result = await sbFetch('system_logs', 'GET', null, `?order=created_at.desc&limit=100&select=*,staff(full_name)`);
          break;
      }
      if (result) setData(result);
    } catch (error) {
      console.error("Report fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    setIsPrinting(true);
    setTimeout(() => {
      window.print();
      setIsPrinting(false);
    }, 500);
  };

  const renderTable = () => {
    if (loading) return <div className="p-20 text-center animate-pulse">جاري تحضير البيانات الرسمية...</div>;
    if (data.length === 0) return <div className="p-20 text-center text-gray-400">لا توجد بيانات لهذا التاريخ</div>;

    switch (activeReport) {
      case 'attendance_daily': {
        const filteredRows = data.filter(row => {
          // Filter ONLY absent students
          if (row.status !== 'absent') return false;
          // Filter by date
          if (!row.recorded_at) return true;
          const rowDate = row.recorded_at.split('T')[0];
          return rowDate === searchDate;
        });

        if (filteredRows.length === 0) {
          return <div className="p-20 text-center text-text3 text-sm">لا يوجد طلاب غائبين مسجلين في هذا اليوم ({searchDate})</div>;
        }

        return (
          <table className="w-full border-collapse border-2 border-black text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="border-2 border-black p-2 w-[5%]">م</th>
                <th className="border-2 border-black p-2 text-right px-4">اسم الطالب الغائب</th>
                <th className="border-2 border-black p-2 w-[18%]">رقم الجلوس</th>
                <th className="border-2 border-black p-2 w-[15%] font-bold">اللجنة</th>
                <th className="border-2 border-black p-2 w-[15%]">الحالة</th>
                <th className="border-2 border-black p-2 w-[22%]">التوقيع / الإجراء</th>
              </tr>
            </thead>
            <tbody>
              {filteredRows.map((row, idx) => (
                <tr key={idx} className="text-center">
                  <td className="border border-black p-2">{idx + 1}</td>
                  <td className="border border-black p-2 text-right px-4 font-bold">{row.students?.full_name}</td>
                  <td className="border border-black p-2">{row.students?.student_no}</td>
                  <td className="border border-black p-2 font-bold">{row.committees?.name}</td>
                  <td className="border border-black p-2 font-black text-red-600">
                    غائب
                  </td>
                  <td className="border border-black p-2 min-w-[3cm]"></td>
                </tr>
              ))}
            </tbody>
          </table>
        );
      }
      case 'committee_status': {
        const filteredRows = data.filter(row => {
          if (!row.exam_date) return true;
          return row.exam_date === searchDate;
        });

        if (filteredRows.length === 0) {
          return <div className="p-20 text-center text-text3 text-sm">لا توجد مظاريف مسجلة لهذا التاريخ ({searchDate})</div>;
        }

        return (
          <table className="w-full border-collapse border-2 border-black text-sm text-center">
            <thead>
              <tr className="bg-gray-100">
                <th className="border-2 border-black p-2">رقم المظروف</th>
                <th className="border-2 border-black p-2">اسم اللجنة</th>
                <th className="border-2 border-black p-2">المادة</th>
                <th className="border-2 border-black p-2">المعلم المستلم</th>
                <th className="border-2 border-black p-2">وقت التسليم للكنترول</th>
                <th className="border-2 border-black p-2">الحالة</th>
              </tr>
            </thead>
            <tbody>
              {filteredRows.map((row, idx) => (
                <tr key={idx}>
                  <td className="border border-black p-2 font-bold">{row.envelope_no}</td>
                  <td className="border border-black p-2">{row.committee_name}</td>
                  <td className="border border-black p-2">{row.subject}</td>
                  <td className="border border-black p-2">{row.teacher_name}</td>
                  <td className="border border-black p-2" dir="ltr">{row.delivered_at ? new Date(row.delivered_at).toLocaleTimeString('ar-SA') : '—'}</td>
                  <td className="border border-black p-2">{row.envelope_status === 'delivered' ? 'مكتمل' : 'تحت العمل'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        );
      }

      case 'absent_list': {
        const filteredRows = data.filter(row => {
          if (!row.recorded_at) return true;
          const rowDate = row.recorded_at.split('T')[0];
          return rowDate === searchDate;
        });

        if (filteredRows.length === 0) {
          return <div className="p-20 text-center text-text3 text-sm">لا توجد غيابات مسجلة لهذا التاريخ ({searchDate})</div>;
        }

        return (
          <table className="w-full border-collapse border-2 border-black text-sm text-center">
            <thead>
              <tr className="bg-gray-100">
                <th className="border-2 border-black p-2">اسم الطالب الغائب</th>
                <th className="border-2 border-black p-2">الصف</th>
                <th className="border-2 border-black p-2">رقم الجلوس</th>
                <th className="border-2 border-black p-2">اسم اللجنة</th>
                <th className="border-2 border-black p-2">رقم ولي الأمر</th>
                <th className="border-2 border-black p-2">الإجراء المتخذ</th>
              </tr>
            </thead>
            <tbody>
              {filteredRows.map((row, idx) => (
                <tr key={idx}>
                  <td className="border border-black p-2 text-right px-4 font-bold">{row.full_name}</td>
                  <td className="border border-black p-2">{row.grade}</td>
                  <td className="border border-black p-2 font-mono">{row.student_no}</td>
                  <td className="border border-black p-2">{row.committee_name}</td>
                  <td className="border border-black p-2 font-mono" dir="ltr">{row.phone || '—'}</td>
                  <td className="border border-black p-2 min-w-[4cm]"></td>
                </tr>
              ))}
            </tbody>
          </table>
        );
      }

      default:
        return <div className="p-10">هذا التقرير قيد التطوير</div>;
    }
  };

  return (
    <div className="space-y-8">
      {/* Tab Selector - Hidden during print */}
      <div className="no-print flex border-b border-border/80 pb-1 gap-4">
        <button
          onClick={() => setActiveTab('control_a4')}
          className={cn(
            "pb-4 px-4 font-display font-black text-sm transition-all relative flex items-center gap-2",
            activeTab === 'control_a4' 
              ? "text-accent border-b-2 border-accent" 
              : "text-text3 hover:text-text"
          )}
        >
          <ShieldCheck size={18} />
          محاضر ونماذج الكنترول الرسمية (A4)
        </button>
        <button
          onClick={() => setActiveTab('general_logs')}
          className={cn(
            "pb-4 px-4 font-display font-black text-sm transition-all relative flex items-center gap-2",
            activeTab === 'general_logs' 
              ? "text-accent border-b-2 border-accent" 
              : "text-text3 hover:text-text"
          )}
        >
          <ClipboardList size={18} />
          السجلات والبيانات السريعة للمدرسة
        </button>
      </div>

      {activeTab === 'control_a4' ? (
        /* Render newly created, premium high-fidelity control forms */
        <OfficialControlReports 
          searchDate={searchDate}
          setSearchDate={setSearchDate}
        />
      ) : (
        /* Original Interactive Desktop Workspace of General Logs */
        <div className="space-y-8">
          <div className="no-print space-y-8">
            {/* Selector UI - Visible only on screen */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {reports.map((report) => (
                <button
                  key={report.id}
                  onClick={() => setActiveReport(report.id as ReportType)}
                  className={cn(
                    "p-6 rounded-3xl border-2 transition-all text-right group relative overflow-hidden",
                    activeReport === report.id 
                      ? "bg-accent border-accent text-white shadow-xl shadow-accent/20" 
                      : "bg-card border-border text-text hover:border-accent/40"
                  )}
                >
                  <div className={cn(
                    "w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110",
                    activeReport === report.id ? "bg-white/20 text-white" : "bg-accent/10 text-accent"
                  )}>
                    <report.icon size={24} />
                  </div>
                  <h3 className="font-bold text-sm mb-1">{report.title}</h3>
                  <p className={cn(
                    "text-[10px] leading-relaxed",
                    activeReport === report.id ? "text-white/70" : "text-text3"
                  )}>{report.desc}</p>
                </button>
              ))}
            </div>

            {/* Control Bar - Visible only on screen */}
            <div className="bg-card border-2 border-border p-6 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4 w-full md:w-auto">
                <div className="relative flex-1 md:flex-none">
                  <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 text-accent" size={18} />
                  <input 
                    type="date" 
                    className="bg-bg3 border-2 border-border rounded-xl pr-12 pl-4 py-3 text-sm font-bold w-full outline-none focus:border-accent"
                    value={searchDate}
                    onChange={(e) => setSearchDate(e.target.value)}
                  />
                </div>
                <button 
                  onClick={fetchReportData}
                  className="p-3.5 bg-bg3 border-2 border-border rounded-xl text-text2 hover:text-accent transition-all"
                >
                  <Search size={20} />
                </button>
              </div>

              <button 
                onClick={handlePrint}
                className="w-full md:w-auto bg-green text-white px-10 py-4 rounded-2xl font-black shadow-xl shadow-green/30 flex items-center justify-center gap-3 hover:scale-105 active:scale-95 transition-all"
              >
                <Printer size={22} />
                طباعة التقرير الرسمي (A4)
              </button>
            </div>

            {/* Hidden Print Content View (Visible on print or inside a special container) */}
            <div className="flex justify-center border-4 border-dashed border-border p-8 bg-bg2/50 rounded-[40px] overflow-x-auto">
              <div className="scale-75 origin-top md:scale-90 lg:scale-100">
                <PrintLayout 
                  title={reports.find(r => r.id === activeReport)?.title || ''}
                  subtitle={`بيانات الاختبارات المنعقدة بتاريخ: ${searchDate}`}
                >
                  {renderTable()}
                </PrintLayout>
              </div>
            </div>
          </div>

          {/* Actual Unscaled Perfect Print Layout (Hidden on screen, shown ONLY on print) */}
          <div className="hidden print:block">
            <PrintLayout 
              title={reports.find(r => r.id === activeReport)?.title || ''}
              subtitle={`بيانات الاختبارات المنعقدة بتاريخ: ${searchDate}`}
            >
              {renderTable()}
            </PrintLayout>
          </div>
        </div>
      )}
    </div>
  );
};

