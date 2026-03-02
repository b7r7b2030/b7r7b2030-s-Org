import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  BarChart, 
  PieChart as PieIcon, 
  Calendar, 
  Trophy,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw
} from 'lucide-react';
import { 
  BarChart as ReBarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { cn } from '../lib/utils';
import { sbFetch } from '../services/supabase';

export const Analytics: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [absenceData, setAbsenceData] = useState<any[]>([]);
  const [weeklyTrend, setWeeklyTrend] = useState<any[]>([]);
  const [rankings, setRankings] = useState<any[]>([]);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const [summary, schedules, committeesData] = await Promise.all([
        sbFetch<any>('v_committee_summary', 'GET', null, '?select=*'),
        sbFetch<any>('exam_schedules', 'GET', null, '?select=*'),
        sbFetch<any>('committees', 'GET', null, '?select=*')
      ]);

      if (summary && committeesData) {
        // 1. Absence by Subject
        const subjectAbsence: Record<string, number> = {};
        summary.forEach((s: any) => {
          const committee = committeesData.find((c: any) => c.id === s.committee_id);
          const subject = committee?.subject || 'غير محدد';
          subjectAbsence[subject] = (subjectAbsence[subject] || 0) + (s.absent_count || 0);
        });

        const absenceChartData = Object.entries(subjectAbsence).map(([name, count]) => ({
          name,
          غياب: count
        })).slice(0, 6); // Limit to top 6 subjects

        setAbsenceData(absenceChartData.length > 0 ? absenceChartData : [
          { name: 'لا توجد بيانات', غياب: 0 }
        ]);

        // 2. Weekly Trend (Calculated by Date from schedules)
        // We'll group by date and calculate overall attendance %
        const dateAttendance: Record<string, { present: number, total: number }> = {};
        
        // Map committees to dates
        summary.forEach((s: any) => {
          const committee = committeesData.find((c: any) => c.id === s.committee_id);
          const date = committee?.exam_date || 'غير محدد';
          if (!dateAttendance[date]) dateAttendance[date] = { present: 0, total: 0 };
          dateAttendance[date].present += (s.present_count || 0);
          dateAttendance[date].total += (s.total_students || 0);
        });

        const trendData = Object.entries(dateAttendance)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([date, counts]) => ({
            name: date,
            نسبة: counts.total > 0 ? Math.round((counts.present / counts.total) * 100) : 100
          }));

        setWeeklyTrend(trendData.length > 0 ? trendData : [
          { name: 'اليوم 1', نسبة: 100 },
          { name: 'اليوم 2', نسبة: 100 }
        ]);

        // 3. Committee Rankings
        const committeeRankings = summary
          .map((s: any) => {
            const committee = committeesData.find((c: any) => c.id === s.committee_id);
            const score = s.total_students > 0 ? Math.round((s.present_count / s.total_students) * 100) : 100;
            return {
              id: s.committee_name,
              sub: committee?.subject || 'عام',
              score: score
            };
          })
          .sort((a: any, b: any) => b.score - a.score)
          .slice(0, 5)
          .map((rank: any, i: number) => ({
            ...rank,
            color: i === 0 ? 'green' : i === 1 ? 'accent' : 'gold',
            icon: i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : '🎖️'
          }));

        setRankings(committeeRankings);
      }
    } catch (error) {
      console.error("Analytics fetch error:", error);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-40">
        <RefreshCw size={48} className="text-accent animate-spin mb-4" />
        <p className="text-text3">جاري تحليل البيانات...</p>
      </div>
    );
  }
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Absence by Subject */}
        <div className="bg-card border border-border rounded-2xl p-6">
          <h3 className="font-bold text-sm mb-6 flex items-center gap-2">
            <BarChart size={18} className="text-accent" />
            📊 معدل الغياب حسب المادة
          </h3>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <ReBarChart data={absenceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a3a5c" vertical={false} />
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                  contentStyle={{ backgroundColor: '#141d35', border: '1px solid #2a3a5c', borderRadius: '8px' }}
                />
                <Bar dataKey="غياب" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={30} />
              </ReBarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Weekly Trend */}
        <div className="bg-card border border-border rounded-2xl p-6">
          <h3 className="font-bold text-sm mb-6 flex items-center gap-2">
            <TrendingUp size={18} className="text-accent" />
            📅 اتجاه الحضور الأسبوعي
          </h3>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weeklyTrend}>
                <defs>
                  <linearGradient id="colorTrend" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a3a5c" vertical={false} />
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} domain={[80, 100]} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#141d35', border: '1px solid #2a3a5c', borderRadius: '8px' }}
                />
                <Area type="monotone" dataKey="نسبة" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorTrend)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Rankings */}
      <div className="bg-card border border-border rounded-2xl p-6">
        <h3 className="font-bold text-sm mb-6 flex items-center gap-2">
          <Trophy size={18} className="text-gold" />
          🏆 ترتيب اللجان حسب الالتزام
        </h3>
        <div className="space-y-6">
          {rankings.map((rank, i) => (
            <div key={i} className="flex items-center gap-4">
              <div className="text-2xl w-10 text-center">{rank.icon}</div>
              <div className="flex-1">
                <div className="flex justify-between text-xs font-bold mb-1.5">
                  <span className="text-text">لجنة {rank.id} — {rank.sub}</span>
                  <span className={cn(
                    rank.color === 'green' && "text-green",
                    rank.color === 'accent' && "text-accent2",
                    rank.color === 'gold' && "text-gold"
                  )}>{rank.score}%</span>
                </div>
                <div className="h-2 bg-bg3 rounded-full overflow-hidden">
                  <div className={cn(
                    "h-full rounded-full transition-all duration-1000",
                    rank.color === 'green' && "bg-linear-to-r from-green to-cyan-500",
                    rank.color === 'accent' && "bg-linear-to-r from-accent to-purple",
                    rank.color === 'gold' && "bg-linear-to-r from-gold to-orange-500"
                  )} style={{ width: `${rank.score}%` }}></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
