import React from 'react';
import { 
  Users, 
  UserSquare2, 
  CheckCircle2, 
  XCircle,
  TrendingUp,
  TrendingDown,
  Clock,
  Package,
  ArrowLeft,
  School
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area
} from 'recharts';
import { cn } from '../lib/utils';

const stats = [
  { label: 'إجمالي الطلاب', value: '1,240', icon: Users, color: 'blue', change: '+12 هذا الأسبوع', trend: 'up' },
  { label: 'المعلمون المراقبون', value: '86', icon: UserSquare2, color: 'gold', change: 'نشط', trend: 'up' },
  { label: 'الحاضرون اليوم', value: '1,142', icon: CheckCircle2, color: 'green', change: '92%', trend: 'up' },
  { label: 'الغائبون اليوم', value: '98', icon: XCircle, color: 'red', change: '8%', trend: 'down' },
];

const attendanceData = [
  { name: 'الأحد', حضور: 145, غياب: 12 },
  { name: 'الاثنين', حضور: 138, غياب: 19 },
  { name: 'الثلاثاء', حضور: 152, غياب: 5 },
  { name: 'الأربعاء', حضور: 140, غياب: 17 },
  { name: 'الخميس', حضور: 148, غياب: 9 },
];

const envelopeData = [
  { name: 'تم التسليم', value: 5, color: '#10b981' },
  { name: 'جارٍ الاختبار', value: 5, color: '#3b82f6' },
  { name: 'لم يُستلم', value: 2, color: '#ef4444' },
];

const activity = [
  { id: 1, type: 'success', title: 'تم تسجيل حضور 28 طالب', desc: 'لجنة 4A — الرياضيات', time: 'الآن', icon: CheckCircle2 },
  { id: 2, type: 'info', title: 'مسح QR المظروف', desc: 'المعلم: سعد الغامدي — لجنة 3B', time: '3 د', icon: Package },
  { id: 3, type: 'error', title: 'تسجيل غياب: فيصل الدوسري', desc: 'لجنة 1C — اللغة العربية', time: '7 د', icon: XCircle },
  { id: 4, type: 'warning', title: 'إنشاء مظاريف دورة الفصل الثاني', desc: '12 مظروف — 6 لجان', time: '1 س', icon: Package },
];

export const Dashboard: React.FC = () => {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className={cn(
            "relative overflow-hidden bg-card border border-border rounded-2xl p-5 transition-all hover:-translate-y-1 hover:shadow-xl",
            "before:absolute before:top-0 before:left-0 before:right-0 before:h-1",
            stat.color === 'blue' && "before:bg-linear-to-r before:from-accent before:to-purple",
            stat.color === 'gold' && "before:bg-linear-to-r before:from-gold before:to-orange-500",
            stat.color === 'green' && "before:bg-linear-to-r before:from-green before:to-cyan-500",
            stat.color === 'red' && "before:bg-linear-to-r before:from-red before:to-orange-600"
          )}>
            <div className={cn(
              "w-11 h-11 rounded-xl flex items-center justify-center mb-4",
              stat.color === 'blue' && "bg-accent/10 text-accent",
              stat.color === 'gold' && "bg-gold/10 text-gold",
              stat.color === 'green' && "bg-green/10 text-green",
              stat.color === 'red' && "bg-red/10 text-red"
            )}>
              <stat.icon size={22} />
            </div>
            <div className="space-y-1">
              <h3 className="font-display font-extrabold text-3xl text-text leading-none">{stat.value}</h3>
              <p className="text-xs text-text3 font-medium">{stat.label}</p>
            </div>
            <div className={cn(
              "absolute top-5 left-5 text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1",
              stat.trend === 'up' ? "bg-green/10 text-green" : "bg-red/10 text-red"
            )}>
              {stat.trend === 'up' ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
              {stat.change}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Live Alerts */}
        <div className="lg:col-span-2 bg-card border border-border rounded-2xl overflow-hidden flex flex-col">
          <div className="p-5 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-accent animate-pulse"></div>
              <h3 className="font-bold text-sm">أحدث التنبيهات الفورية</h3>
            </div>
            <button className="text-xs font-bold text-accent hover:underline flex items-center gap-1">
              عرض الكل <ArrowLeft size={14} />
            </button>
          </div>
          <div className="p-5 space-y-3 flex-1">
            <div className="flex items-start gap-4 p-4 bg-red/5 border border-red/10 rounded-xl">
              <div className="w-10 h-10 rounded-lg bg-red/10 text-red flex items-center justify-center shrink-0">
                <XCircle size={20} />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-bold text-red-300">غياب طالب</h4>
                <p className="text-xs text-text2 mt-1">أحمد محمد علي — لجنة 3A — اللغة العربية</p>
              </div>
              <span className="text-[10px] text-text3 font-medium whitespace-nowrap">منذ 2 دقيقة</span>
            </div>
            <div className="flex items-start gap-4 p-4 bg-gold/5 border border-gold/10 rounded-xl">
              <div className="w-10 h-10 rounded-lg bg-gold/10 text-gold flex items-center justify-center shrink-0">
                <Clock size={20} />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-bold text-gold-300">تأخر استلام مظروف</h4>
                <p className="text-xs text-text2 mt-1">لجنة 5B — الرياضيات — تأخر 18 دقيقة</p>
              </div>
              <span className="text-[10px] text-text3 font-medium whitespace-nowrap">منذ 5 دقائق</span>
            </div>
            <div className="flex items-start gap-4 p-4 bg-green/5 border border-green/10 rounded-xl">
              <div className="w-10 h-10 rounded-lg bg-green/10 text-green flex items-center justify-center shrink-0">
                <CheckCircle2 size={20} />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-bold text-green-300">تم استلام المظروف</h4>
                <p className="text-xs text-text2 mt-1">لجنة 2C — العلوم — المعلم: خالد الأحمدي</p>
              </div>
              <span className="text-[10px] text-text3 font-medium whitespace-nowrap">منذ 12 دقيقة</span>
            </div>
          </div>
        </div>

        {/* Envelope Status Chart */}
        <div className="bg-card border border-border rounded-2xl p-5 flex flex-col">
          <h3 className="font-bold text-sm mb-6 flex items-center gap-2">
            <Package size={18} className="text-accent" />
            حالة المظاريف
          </h3>
          <div className="flex-1 min-h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={envelopeData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {envelopeData.map((entry, index) => (
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
          <div className="grid grid-cols-3 gap-2 mt-4">
            {envelopeData.map((item, i) => (
              <div key={i} className="text-center">
                <div className="text-[10px] text-text3 mb-1">{item.name}</div>
                <div className="text-sm font-bold" style={{ color: item.color }}>{item.value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Attendance Chart */}
        <div className="bg-card border border-border rounded-2xl p-5">
          <h3 className="font-bold text-sm mb-6">📊 نسب الحضور اليومية</h3>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={attendanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a3a5c" vertical={false} />
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                  contentStyle={{ backgroundColor: '#141d35', border: '1px solid #2a3a5c', borderRadius: '8px' }}
                />
                <Bar dataKey="حضور" fill="#10b981" radius={[4, 4, 0, 0]} barSize={20} />
                <Bar dataKey="غياب" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-card border border-border rounded-2xl p-5">
          <h3 className="font-bold text-sm mb-6 flex items-center gap-2">
            <Clock size={18} className="text-accent" />
            النشاط الأخير
          </h3>
          <div className="space-y-4">
            {activity.map((item) => (
              <div key={item.id} className="flex items-center gap-4 group">
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110",
                  item.type === 'success' && "bg-green/10 text-green",
                  item.type === 'info' && "bg-accent/10 text-accent",
                  item.type === 'error' && "bg-red/10 text-red",
                  item.type === 'warning' && "bg-gold/10 text-gold"
                )}>
                  <item.icon size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold text-text truncate">{item.title}</h4>
                  <p className="text-xs text-text3 truncate">{item.desc}</p>
                </div>
                <span className="text-[10px] text-text3 font-medium">{item.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Committees Table */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-border flex items-center justify-between">
          <h3 className="font-bold text-sm flex items-center gap-2">
            <School size={18} className="text-accent" />
            ملخص اللجان — الجلسة الحالية
          </h3>
          <div className="flex gap-2">
            <button className="px-3 py-1 bg-accent text-white rounded-lg text-[10px] font-bold">الكل</button>
            <button className="px-3 py-1 bg-bg3 text-text3 rounded-lg text-[10px] font-bold hover:text-text">نشطة</button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-right text-sm">
            <thead className="bg-bg3/50 text-text3 text-[10px] font-bold uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3">اللجنة</th>
                <th className="px-6 py-3">المادة</th>
                <th className="px-6 py-3">المعلم المراقب</th>
                <th className="px-6 py-3">الطلاب</th>
                <th className="px-6 py-3">الحضور</th>
                <th className="px-6 py-3">حالة المظروف</th>
                <th className="px-6 py-3">الوقت</th>
                <th className="px-6 py-3">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {[
                { id: '1A', sub: 'اللغة العربية', teacher: 'أحمد السيد', total: 30, present: 28, status: 'delivered', time: '08:00 – 10:00' },
                { id: '2B', sub: 'الرياضيات', teacher: 'خالد الأحمدي', total: 28, present: 27, status: 'received', time: '08:00 – 10:00' },
                { id: '3C', sub: 'العلوم', teacher: 'محمد العتيبي', total: 32, present: 30, status: 'delivered', time: '10:30 – 12:30' },
                { id: '4A', sub: 'الإنجليزية', teacher: 'سعد الغامدي', total: 25, present: 0, status: 'pending', time: '10:30 – 12:30' },
              ].map((row, i) => (
                <tr key={i} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4 font-bold text-text">{row.id}</td>
                  <td className="px-6 py-4 text-text2">{row.sub}</td>
                  <td className="px-6 py-4 text-text2">{row.teacher}</td>
                  <td className="px-6 py-4 text-text2">{row.total}</td>
                  <td className="px-6 py-4">
                    <span className="font-bold text-green">{row.present}</span>
                    <span className="text-text3">/{row.total}</span>
                  </td>
                  <td className="px-6 py-4">
                    {row.status === 'delivered' && <span className="px-2 py-1 bg-green/10 text-green text-[10px] font-bold rounded-md border border-green/20">تم التسليم</span>}
                    {row.status === 'received' && <span className="px-2 py-1 bg-accent/10 text-accent2 text-[10px] font-bold rounded-md border border-accent/20">تم الاستلام</span>}
                    {row.status === 'pending' && <span className="px-2 py-1 bg-gold/10 text-gold text-[10px] font-bold rounded-md border border-gold/20">لم يُستلم</span>}
                  </td>
                  <td className="px-6 py-4 text-text3 text-xs">{row.time}</td>
                  <td className="px-6 py-4">
                    <button className="text-accent hover:underline font-bold text-xs">تفاصيل</button>
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
