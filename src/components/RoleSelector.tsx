import React from 'react';
import { UserRole } from '../types';
import { 
  ShieldCheck, 
  UserSquare2, 
  HeartHandshake,
  ArrowRight
} from 'lucide-react';
import { cn } from '../lib/utils';

interface RoleSelectorProps {
  onSelect: (role: UserRole) => void;
}

export const RoleSelector: React.FC<RoleSelectorProps> = ({ onSelect }) => {
  const roles = [
    { 
      id: UserRole.PRINCIPAL, 
      title: 'مدير المدرسة', 
      desc: 'صلاحيات كاملة لإدارة النظام والتقارير والتحليلات', 
      icon: ShieldCheck, 
      color: 'accent' 
    },
    { 
      id: UserRole.TEACHER, 
      title: 'المعلم المراقب', 
      desc: 'تسجيل الحضور، مسح المظاريف، وإدارة اللجان المسندة', 
      icon: UserSquare2, 
      color: 'gold' 
    },
    { 
      id: UserRole.COUNSELOR, 
      title: 'المرشد الطلابي', 
      desc: 'متابعة غياب الطلاب، التواصل مع أولياء الأمور، والتقارير السلوكية', 
      icon: HeartHandshake, 
      color: 'purple' 
    },
  ];

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-6 relative overflow-hidden" dir="rtl">
      {/* Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-accent/5 blur-[120px] rounded-full"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple/5 blur-[120px] rounded-full"></div>

      <div className="max-w-4xl w-full space-y-8 relative z-10">
        <div className="text-center space-y-4">
          <div className="w-20 h-20 bg-linear-to-br from-accent to-purple rounded-3xl flex items-center justify-center text-white shadow-2xl shadow-accent/20 mx-auto mb-6">
            <ShieldCheck size={40} />
          </div>
          <h1 className="font-display font-black text-4xl text-text tracking-tight">نظام إدارة الاختبارات الذكي</h1>
          <p className="text-text3 text-lg max-w-lg mx-auto">الرجاء اختيار نوع الحساب للمتابعة إلى لوحة التحكم الخاصة بك</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          {roles.map((role) => (
            <button
              key={role.id}
              onClick={() => onSelect(role.id)}
              className="group relative bg-card border border-border rounded-3xl p-8 text-right hover:border-accent hover:bg-accent/5 transition-all duration-300 hover:-translate-y-2 shadow-xl hover:shadow-accent/10"
            >
              <div className={cn(
                "w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform",
                role.color === 'accent' && "bg-accent/10 text-accent",
                role.color === 'gold' && "bg-gold/10 text-gold",
                role.color === 'purple' && "bg-purple/10 text-purple"
              )}>
                <role.icon size={28} />
              </div>
              <h3 className="font-display font-bold text-xl text-text mb-2">{role.title}</h3>
              <p className="text-xs text-text3 leading-relaxed mb-6">{role.desc}</p>
              <div className="flex items-center gap-2 text-accent font-bold text-sm">
                دخول <ArrowRight size={16} className="group-hover:translate-x-[-4px] transition-transform" />
              </div>
            </button>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-xs text-text3">بالمتابعة، أنت توافق على شروط الاستخدام وسياسة الخصوصية الخاصة بالنظام</p>
        </div>
      </div>
    </div>
  );
};
