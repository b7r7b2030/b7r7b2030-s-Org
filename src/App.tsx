import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Topbar } from './components/Topbar';
import { Modal } from './components/Modal';
import { RoleSelector } from './components/RoleSelector';
import { Dashboard } from './pages/Dashboard';
import { TeacherDashboard } from './pages/TeacherDashboard';
import { Students } from './pages/Students';
import { Teachers } from './pages/Teachers';
import { Committees } from './pages/Committees';
import { Envelopes } from './pages/Envelopes';
import { Attendance } from './pages/Attendance';
import { QRCodes } from './pages/QRCodes';
import { Alerts } from './pages/Alerts';
import { Reports } from './pages/Reports';
import { Analytics } from './pages/Analytics';
import { Setup } from './pages/Setup';
import { ExamSchedulePage } from './pages/ExamSchedule';
import { TeacherAssignment } from './pages/TeacherAssignment';
import { 
  Users, 
  UserSquare2, 
  School, 
  Package,
  CheckCircle2,
  AlertCircle,
  Calendar as CalendarIcon
} from 'lucide-react';
import { cn } from './lib/utils';
import { UserRole } from './types';

export default function App() {
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [activePage, setActivePage] = useState('dashboard');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [alertCount, setAlertCount] = useState(4);

  // Listen for custom navigation events
  useEffect(() => {
    const handleNavigate = (e: any) => {
      const page = e.detail;
      if (!page) return;

      // Counselor restrictions
      if (userRole === UserRole.COUNSELOR) {
        if (!['dashboard', 'students', 'reports', 'analytics', 'attendance'].includes(page)) {
          setActivePage('dashboard');
          return;
        }
      }

      setActivePage(page);
    };
    window.addEventListener('navigate', handleNavigate);
    return () => window.removeEventListener('navigate', handleNavigate);
  }, [userRole]);

  // If no role is selected, show role selector
  if (!userRole) {
    return <RoleSelector onSelect={(role) => setUserRole(role)} />;
  }

  // Page title mapping
  const pageInfo: Record<string, { title: string; subtitle: string }> = {
    dashboard: { title: 'لوحة التحكم', subtitle: 'نظرة شاملة على عمليات الاختبارات' },
    alerts: { title: 'مركز التنبيهات', subtitle: 'جميع التنبيهات والإشعارات الفورية' },
    students: { title: 'إدارة الطلاب', subtitle: 'استيراد وإدارة بيانات الطلاب وربطهم باللجان' },
    teachers: { title: 'إدارة المعلمين', subtitle: 'إدارة بيانات المعلمين المراقبين ورموز QR' },
    committees: { title: 'إدارة اللجان', subtitle: 'إنشاء وإدارة لجان الاختبارات وربطها بالمعلمين والطلاب' },
    envelopes: { title: 'تتبع المظاريف', subtitle: 'خط زمني كامل لكل مظروف من الإنشاء حتى التسليم النهائي' },
    attendance: { title: 'الحضور والغياب', subtitle: 'سجلات حضور وغياب الطلاب مع إمكانية الإشعار الفوري' },
    qrcodes: { title: 'إدارة رموز QR', subtitle: 'إنشاء وطباعة رموز QR للمعلمين والمظاريف واللجان' },
    reports: { title: 'التقارير الذكية', subtitle: 'تقارير شاملة وقابلة للتصدير لجميع عمليات الاختبارات' },
    analytics: { title: 'التحليلات المتقدمة', subtitle: 'رؤى ذكية لتحسين العملية التعليمية' },
    setup: { title: 'إعداد النظام', subtitle: 'إعداد قاعدة البيانات السحابية وإنشاء الجداول' },
    examschedule: { title: 'جدول الاختبارات', subtitle: 'إعداد وتوزيع المواد على الأيام والفترات' },
    teacherassignment: { title: 'توزيع المعلمين', subtitle: 'توزيع المراقبين على اللجان لكل يوم وفترة' },
  };

  const renderPage = () => {
    // Special case for teacher dashboard
    if (userRole === UserRole.TEACHER && activePage === 'dashboard') {
      return <TeacherDashboard />;
    }

    // Special case for control dashboard
    if (userRole === UserRole.CONTROL && activePage === 'dashboard') {
      return <Dashboard />; // For now, use the main dashboard for control
    }

    switch (activePage) {
      case 'dashboard': return <Dashboard />;
      case 'students': return <Students />;
      case 'teachers': return <Teachers />;
      case 'committees': return <Committees />;
      case 'envelopes': return <Envelopes userRole={userRole} />;
      case 'attendance': 
        return (userRole === UserRole.TEACHER || userRole === UserRole.CONTROL) ? <TeacherDashboard /> : <Attendance userRole={userRole} />;
      case 'qrcodes': return <QRCodes />;
      case 'alerts': return <Alerts />;
      case 'reports': return <Reports />;
      case 'analytics': return <Analytics />;
      case 'setup': return <Setup />;
      case 'examschedule': return <ExamSchedulePage />;
      case 'teacherassignment': return <TeacherAssignment />;
      default: return <Dashboard />;
    }
  };

  const addOptions = [
    { id: 'students', label: 'طالب جديد', icon: Users, color: 'accent', roles: [UserRole.PRINCIPAL, UserRole.COUNSELOR] },
    { id: 'teachers', label: 'معلم جديد', icon: UserSquare2, color: 'gold', roles: [UserRole.PRINCIPAL] },
    { id: 'committees', label: 'لجنة جديدة', icon: School, color: 'purple', roles: [UserRole.PRINCIPAL] },
    { id: 'envelopes', label: 'مظروف جديد', icon: Package, color: 'green', roles: [UserRole.PRINCIPAL] },
  ];

  const filteredAddOptions = addOptions.filter(opt => opt.roles.includes(userRole));

  return (
    <div className="min-h-screen bg-bg text-text selection:bg-accent/30" dir="rtl">
      {/* Background Glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 print:hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-accent/5 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple/5 blur-[120px] rounded-full"></div>
        <div className="absolute top-[40%] left-[40%] w-[20%] h-[20%] bg-gold/5 blur-[100px] rounded-full"></div>
      </div>

      <div className={cn("print:hidden", (userRole === UserRole.TEACHER && activePage === 'dashboard') && "hidden lg:block")}>
        <Sidebar 
          activePage={activePage} 
          setActivePage={setActivePage} 
          alertCount={alertCount} 
          userRole={userRole}
          onLogout={() => setUserRole(null)}
        />
      </div>

      <main className={cn(
        "lg:mr-64 min-h-screen flex flex-col relative z-10 pb-20 lg:pb-0 print:mr-0 print:pb-0",
        (userRole === UserRole.TEACHER && activePage === 'dashboard') && "pb-0 lg:pb-0"
      )}>
        <div className={cn("print:hidden", (userRole === UserRole.TEACHER && activePage === 'dashboard') && "hidden lg:block")}>
          <Topbar 
            title={pageInfo[activePage]?.title || activePage}
            subtitle={pageInfo[activePage]?.subtitle || ''}
            onAddClick={() => setIsAddModalOpen(true)}
            onAlertsClick={() => setActivePage('alerts')}
            alertCount={alertCount}
            showAddButton={filteredAddOptions.length > 0}
          />
        </div>

        <div className={cn(
          "flex-1 p-8 max-w-7xl mx-auto w-full print:p-0 print:max-w-none",
          (userRole === UserRole.TEACHER && activePage === 'dashboard') && "p-0 lg:p-8 max-w-none"
        )}>
          {renderPage()}
        </div>

        <footer className="p-8 border-t border-border text-center print:hidden">
          <p className="text-xs text-text3 font-medium">
            © {new Date().getFullYear()} نظام إدارة الاختبارات الذكي — جميع الحقوق محفوظة
          </p>
        </footer>
      </main>

      {/* Add New Modal */}
      <Modal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        title="إضافة جديد"
      >
        <div className="grid grid-cols-2 gap-4">
          {filteredAddOptions.map((opt) => (
            <button
              key={opt.id}
              onClick={() => {
                setActivePage(opt.id);
                setIsAddModalOpen(false);
              }}
              className="group p-6 bg-bg3 border border-border rounded-2xl text-center hover:border-accent hover:bg-accent/5 transition-all"
            >
              <div className={cn(
                "w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform",
                opt.color === 'accent' && "bg-accent/10 text-accent",
                opt.color === 'gold' && "bg-gold/10 text-gold",
                opt.color === 'purple' && "bg-purple/10 text-purple",
                opt.color === 'green' && "bg-green/10 text-green"
              )}>
                <opt.icon size={28} />
              </div>
              <h4 className="font-bold text-sm text-text">{opt.label}</h4>
            </button>
          ))}
        </div>
      </Modal>
    </div>
  );
}
