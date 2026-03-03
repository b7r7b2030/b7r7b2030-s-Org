import React, { useState, useEffect } from 'react';
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
  School,
  RefreshCw
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
} from 'recharts';
import { cn } from '../lib/utils';
import { sbFetch } from '../services/supabase';

export const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<any[]>([]);
  const [committeeStats, setCommitteeStats] = useState<any[]>([]);
  const [filterStatus, setFilterStatus] = useState<'all' | 'active'>('all');
  const [envelopeStats, setEnvelopeStats] = useState<any[]>([
    { name: 'تم التسليم', value: 0, color: '#10b981' },
    { name: 'جارٍ الاختبار', value: 0, color: '#3b82f6' },
    { name: 'لم يُستلم', value: 0, color: '#ef4444' },
  ]);
  const [attendanceHistory, setAttendanceHistory] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const fetchStats = async () => {
    const [sData, tData, aData, cStats, eData, absentData, allStudents] = await Promise.all([
      sbFetch<any>('students', 'GET', null, '?select=id'),
      sbFetch<any>('staff', 'GET', null, '?select=id'),
      sbFetch<any>('attendance', 'GET', null, '?select=id,student_id,status,recorded_at'),
      sbFetch<any>('v_committee_summary', 'GET', null, '?select=*'),
      sbFetch<any>('envelopes', 'GET', null, '?select=status,committee_id,envelope_no,updated_at,committees(name)'),
      sbFetch<any>('v_absent_students', 'GET', null, '?select=*&limit=5'),
      sbFetch<any>('students', 'GET', null, '?select=id,committee_name')
    ]);

    const totalStudents = sData?.length || 0;
    const totalStaff = tData?.length || 0;
    
    // Calculate real-time attendance based on active committees
    const activeCommitteeIds = eData?.filter((e: any) => e.status === 'in_progress').map((e: any) => e.committee_id) || [];
    const activeCommitteeNames = eData?.filter((e: any) => e.status === 'in_progress').map((e: any) => e.committees?.name).filter(Boolean) || [];

    const attendanceMap: Record<string, string> = {};
    aData?.forEach((a: any) => attendanceMap[a.student_id] = a.status);

    let calculatedPresent = 0;
    let calculatedAbsent = 0;

    allStudents?.forEach((s: any) => {
      const status = attendanceMap[s.id];
      const isCommitteeActive = activeCommitteeNames.includes(s.committee_name);

      if (status === 'absent') {
        calculatedAbsent++;
      } else if (status === 'present' || (isCommitteeActive && !status)) {
        calculatedPresent++;
      }
    });

    setStats([
      { label: 'إجمالي الطلاب', value: totalStudents.toLocaleString(), icon: Users, color: 'blue', change: 'محدث', trend: 'up' },
      { label: 'طاقم العمل', value: totalStaff.toLocaleString(), icon: UserSquare2, color: 'gold', change: 'نشط', trend: 'up' },
      { label: 'الحاضرون اليوم', value: calculatedPresent.toLocaleString(), icon: CheckCircle2, color: 'green', change: `${totalStudents > 0 ? Math.round((calculatedPresent/totalStudents)*100) : 0}%`, trend: 'up' },
      { label: 'الغائبون اليوم', value: calculatedAbsent.toLocaleString(), icon: XCircle, color: 'red', change: `${totalStudents > 0 ? Math.round((calculatedAbsent/totalStudents)*100) : 0}%`, trend: 'down' },
    ]);

    if (cStats) {
      const updatedCommitteeStats = cStats.map((c: any) => {
        const isCommitteeActive = activeCommitteeNames.includes(c.committee_name);
        if (isCommitteeActive) {
          // If active, present count is total - absent
          return {
            ...c,
            present_count: c.total_students - c.absent_count
          };
        }
        return c;
      });

      const sortedStats = [...updatedCommitteeStats].sort((a, b) => {
        const nameA = a.committee_name || '';
        const nameB = b.committee_name || '';
        return nameA.localeCompare(nameB, undefined, { numeric: true, sensitivity: 'base' });
      });
      setCommitteeStats(sortedStats);
    }

    if (eData) {
      const delivered = eData.filter((e: any) => e.status === 'delivered').length;
      const inProgress = eData.filter((e: any) => e.status === 'in_progress' || e.status === 'received').length;
      const pending = eData.filter((e: any) => e.status === 'pending').length;
      setEnvelopeStats([
        { name: 'تم التسليم', value: delivered, color: '#10b981' },
        { name: 'جارٍ الاختبار', value: inProgress, color: '#3b82f6' },
        { name: 'لم يُستلم', value: pending, color: '#ef4444' },
      ]);
    }

    // Combine alerts
    const combinedAlerts: any[] = [];
    if (absentData) {
      absentData.forEach((a: any) => {
        combinedAlerts.push({
          id: `absent-${a.student_no}`,
          type: 'error',
          title: `غياب طالب: ${a.full_name}`,
          desc: `لجنة ${a.committee_name} — ${a.grade}`,
          time: a.recorded_at ? new Date(a.recorded_at).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }) : 'الآن',
          icon: XCircle
        });
      });
    }
    if (eData) {
      eData.filter((e: any) => e.status !== 'delivered').forEach((e: any) => {
        combinedAlerts.push({
          id: `env-${e.envelope_no}`,
          type: 'warning',
          title: `تأخر مظروف: ${e.envelope_no}`,
          desc: `لجنة ${e.committees?.name || '—'} — الحالة: ${e.status}`,
          time: e.updated_at ? new Date(e.updated_at).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }) : 'الآن',
          icon: Package
        });
      });
    }
    setAlerts(combinedAlerts.slice(0, 5));

    if (aData) {
      const days = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس'];
      const history = days.map(day => {
        const today = new Date().toLocaleDateString('ar-SA', { weekday: 'long' });
        if (today.includes(day)) {
          return { name: day, حضور: calculatedPresent, غياب: calculatedAbsent };
        }
        return { name: day, حضور: 0, غياب: 0 };
      });
      setAttendanceHistory(history);
    }

    setLoading(false);
  };

  const envelopeData = [
    { name: 'تم التسليم', value: 5, color: '#10b981' },
    { name: 'جارٍ الاختبار', value: 5, color: '#3b82f6' },
    { name: 'لم يُستلم', value: 2, color: '#ef4444' },
  ];

  const attendanceData = [
    { name: 'الأحد', حضور: 145, غياب: 12 },
    { name: 'الاثنين', حضور: 138, غياب: 19 },
    { name: 'الثلاثاء', حضور: 152, غياب: 5 },
    { name: 'الأربعاء', حضور: 140, غياب: 17 },
    { name: 'الخميس', حضور: 148, غياب: 9 },
  ];

  const activity = [
    { id: 1, type: 'success', title: 'تم تسجيل حضور 28 طالب', desc: 'لجنة 4A — الرياضيات', time: 'الآن', icon: CheckCircle2 },
    { id: 2, type: 'info', title: 'مسح QR المظروف', desc: 'المعلم: سعد الغامدي — لجنة 3B', time: '3 د', icon: Package },
    { id: 3, type: 'error', title: 'تسجيل غياب: فيصل الدوسري', desc: 'لجنة 1C — اللغة العربية', time: '7 د', icon: XCircle },
    { id: 4, type: 'warning', title: 'إنشاء مظاريف دورة الفصل الثاني', desc: '12 مظروف — 6 لجان', time: '1 س', icon: Package },
  ];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <RefreshCw size={48} className="text-accent animate-spin" />
        <p className="text-text3 font-bold">جاري تحميل الإحصائيات المباشرة...</p>
      </div>
    );
  }

  const filteredCommittees = committeeStats.filter(c => {
    if (filterStatus === 'all') return true;
    // Active means has students assigned
    return c.total_students > 0;
  });

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
            {alerts.length > 0 ? alerts.map((alert) => (
              <div key={alert.id} className="flex items-start gap-3 p-3 rounded-xl bg-bg3/50 border border-border/50">
                <div className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                  alert.type === 'success' && "bg-green/10 text-green",
                  alert.type === 'info' && "bg-accent/10 text-accent",
                  alert.type === 'error' && "bg-red/10 text-red",
                  alert.type === 'warning' && "bg-gold/10 text-gold"
                )}>
                  <alert.icon size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-bold text-text truncate">{alert.title}</h4>
                  <p className="text-[10px] text-text3 truncate">{alert.desc}</p>
                </div>
                <span className="text-[9px] font-bold text-text3 whitespace-nowrap">{alert.time}</span>
              </div>
            )) : (
              <div className="flex flex-col items-center justify-center h-full text-text3 py-10">
                <Clock size={32} className="mb-2 opacity-20" />
                <p className="text-xs">لا توجد تنبيهات جديدة حالياً</p>
              </div>
            )}
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
                  data={envelopeStats}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {envelopeStats.map((entry, index) => (
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
            {envelopeStats.map((item, i) => (
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
              <BarChart data={attendanceHistory}>
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
            {alerts.length > 0 ? alerts.map((item) => (
              <div key={item.id} className="flex items-center gap-3">
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                  item.type === 'success' && "bg-green/10 text-green",
                  item.type === 'info' && "bg-accent/10 text-accent",
                  item.type === 'error' && "bg-red/10 text-red",
                  item.type === 'warning' && "bg-gold/10 text-gold"
                )}>
                  <item.icon size={14} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-text truncate">{item.title}</p>
                  <p className="text-[10px] text-text3 truncate">{item.time}</p>
                </div>
              </div>
            )) : (
              <div className="flex flex-col items-center justify-center py-10 text-text3">
                <RefreshCw size={24} className="mb-2 opacity-20" />
                <p className="text-xs">لا يوجد نشاط مسجل</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Committees Table */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-border flex items-center justify-between">
          <h3 className="font-bold text-sm flex items-center gap-2">
            <School size={18} className="text-accent" />
            ملخص اللجان — الجلسة الحالية (مباشر)
          </h3>
          <div className="flex gap-2">
            <button 
              onClick={() => setFilterStatus('all')}
              className={cn(
                "px-3 py-1 rounded-lg text-[10px] font-bold transition-all",
                filterStatus === 'all' ? "bg-accent text-white" : "bg-bg3 text-text3 hover:text-text"
              )}
            >
              الكل
            </button>
            <button 
              onClick={() => setFilterStatus('active')}
              className={cn(
                "px-3 py-1 rounded-lg text-[10px] font-bold transition-all",
                filterStatus === 'active' ? "bg-accent text-white" : "bg-bg3 text-text3 hover:text-text"
              )}
            >
              نشطة
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-right text-sm">
            <thead className="bg-bg3/50 text-text3 text-[10px] font-bold uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3">اللجنة</th>
                <th className="px-6 py-3">الطلاب</th>
                <th className="px-6 py-3">الحضور</th>
                <th className="px-6 py-3">الغياب</th>
                <th className="px-6 py-3">النسبة</th>
                <th className="px-6 py-3">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {filteredCommittees.map((row, i) => (
                <tr key={i} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4 font-bold text-text">{row.committee_name}</td>
                  <td className="px-6 py-4 text-text2">{row.total_students}</td>
                  <td className="px-6 py-4 text-green font-bold">{row.present_count}</td>
                  <td className="px-6 py-4 text-red font-bold">{row.absent_count}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-bg3 rounded-full overflow-hidden w-24">
                        <div 
                          className="h-full bg-accent" 
                          style={{ width: `${row.total_students > 0 ? (row.present_count/row.total_students)*100 : 0}%` }}
                        />
                      </div>
                      <span className="text-[10px] font-bold text-text3">
                        {row.total_students > 0 ? Math.round((row.present_count/row.total_students)*100) : 0}%
                      </span>
                    </div>
                  </td>
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
