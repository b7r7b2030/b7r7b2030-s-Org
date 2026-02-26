import React from 'react';
import { cn } from '../lib/utils';
import { UserRole } from '../types';
import { 
  LayoutDashboard, 
  Bell, 
  Users, 
  UserSquare2, 
  School, 
  Package, 
  CheckCircle2, 
  QrCode, 
  BarChart3, 
  TrendingUp, 
  Settings,
  GraduationCap,
  LogOut,
  Menu,
  X,
  Calendar
} from 'lucide-react';

interface SidebarProps {
  activePage: string;
  setActivePage: (page: string) => void;
  alertCount: number;
  userRole: UserRole;
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  activePage, 
  setActivePage, 
  alertCount, 
  userRole,
  onLogout
}) => {
  const [isOpen, setIsOpen] = React.useState(false);

  const navItems = [
    { id: 'dashboard', label: 'الرئيسية', icon: LayoutDashboard, roles: [UserRole.PRINCIPAL, UserRole.TEACHER, UserRole.COUNSELOR] },
    { id: 'alerts', label: 'التنبيهات', icon: Bell, badge: alertCount, roles: [UserRole.PRINCIPAL, UserRole.COUNSELOR] },
    { id: 'students', label: 'الطلاب', icon: Users, roles: [UserRole.PRINCIPAL, UserRole.COUNSELOR] },
    { id: 'teachers', label: 'المعلمون', icon: UserSquare2, roles: [UserRole.PRINCIPAL] },
    { id: 'committees', label: 'اللجان', icon: School, roles: [UserRole.PRINCIPAL, UserRole.TEACHER] },
    { id: 'envelopes', label: 'المظاريف', icon: Package, roles: [UserRole.PRINCIPAL, UserRole.TEACHER] },
    { id: 'attendance', label: 'التحضير', icon: CheckCircle2, roles: [UserRole.TEACHER] },
    { id: 'examschedule', label: 'الجدول', icon: Calendar, roles: [UserRole.PRINCIPAL, UserRole.COUNSELOR] },
    { id: 'qrcodes', label: 'QR', icon: QrCode, roles: [UserRole.PRINCIPAL, UserRole.TEACHER] },
    { id: 'reports', label: 'تقارير', icon: BarChart3, roles: [UserRole.PRINCIPAL, UserRole.COUNSELOR] },
    { id: 'analytics', label: 'تحليل', icon: TrendingUp, roles: [UserRole.PRINCIPAL] },
    { id: 'setup', label: 'إعداد', icon: Settings, roles: [UserRole.PRINCIPAL] },
  ];

  const filteredItems = navItems.filter(item => item.roles.includes(userRole));

  const getRoleLabel = () => {
    switch(userRole) {
      case UserRole.PRINCIPAL: return 'مدير المدرسة';
      case UserRole.TEACHER: return 'معلم مراقب';
      case UserRole.COUNSELOR: return 'مرشد طلابي';
      default: return 'مستخدم';
    }
  };

  const getRoleIcon = () => {
    switch(userRole) {
      case UserRole.PRINCIPAL: return '👑';
      case UserRole.TEACHER: return '👨‍🏫';
      case UserRole.COUNSELOR: return '🤝';
      default: return '👤';
    }
  };

  return (
    <>
      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-bg2/90 backdrop-blur-xl border-t border-border px-4 py-2 flex items-center justify-around z-50 pb-safe">
        {filteredItems.slice(0, 4).map(item => (
          <button
            key={item.id}
            onClick={() => setActivePage(item.id)}
            className={cn(
              "flex flex-col items-center gap-1 p-2 rounded-xl transition-all",
              activePage === item.id ? "text-accent" : "text-text3"
            )}
          >
            <item.icon size={20} />
            <span className="text-[10px] font-bold">{item.label}</span>
          </button>
        ))}
        <button
          onClick={() => setIsOpen(true)}
          className="flex flex-col items-center gap-1 p-2 text-text3"
        >
          <Menu size={20} />
          <span className="text-[10px] font-bold">المزيد</span>
        </button>
      </nav>

      {/* Desktop Sidebar & Mobile Full Menu */}
      <aside className={cn(
        "fixed right-0 top-0 w-64 h-screen bg-bg2 border-l border-border flex flex-col z-[60] transition-all duration-300",
        "lg:translate-x-0",
        isOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0"
      )}>
        <div className="p-6 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-linear-to-br from-accent to-purple rounded-xl flex items-center justify-center text-white shadow-lg">
              <GraduationCap size={20} />
            </div>
            <h2 className="font-display font-extrabold text-sm text-text">نظام الاختبارات</h2>
          </div>
          <button onClick={() => setIsOpen(false)} className="lg:hidden p-2 text-text3">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-4">
          {filteredItems.map(item => (
            <button
              key={item.id}
              onClick={() => {
                setActivePage(item.id);
                setIsOpen(false);
              }}
              className={cn(
                "w-[calc(100%-16px)] mx-2 flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 text-sm font-medium mb-1",
                activePage === item.id 
                  ? "bg-accent/10 text-accent2 border border-accent/20" 
                  : "text-text2 hover:bg-card hover:text-text"
              )}
            >
              <item.icon size={18} className={activePage === item.id ? "text-accent" : "text-text3"} />
              <span>{item.label}</span>
              {item.badge !== undefined && item.badge > 0 && (
                <span className="mr-auto text-[10px] font-bold px-2 py-0.5 rounded-full text-white bg-red">
                  {item.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="p-4 border-t border-border space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-linear-to-br from-gold to-accent rounded-lg flex items-center justify-center text-white font-bold text-lg">
              {getRoleIcon()}
            </div>
            <div className="flex-1 overflow-hidden">
              <h4 className="text-xs font-bold text-text truncate">المستخدم</h4>
              <span className="text-[10px] text-text3">{getRoleLabel()}</span>
            </div>
          </div>
          <button 
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 py-2 bg-red/10 text-red hover:bg-red hover:text-white rounded-xl text-xs font-bold transition-all"
          >
            <LogOut size={14} />
            خروج
          </button>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
};
