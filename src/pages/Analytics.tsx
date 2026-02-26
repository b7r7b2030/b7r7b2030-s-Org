import React from 'react';
import { 
  TrendingUp, 
  BarChart, 
  PieChart as PieIcon, 
  Calendar, 
  Trophy,
  ArrowUpRight,
  ArrowDownRight
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

const absenceData = [
  { name: 'العربية', غياب: 8 },
  { name: 'الرياضيات', غياب: 12 },
  { name: 'العلوم', غياب: 5 },
  { name: 'الإنجليزية', غياب: 9 },
  { name: 'التاريخ', غياب: 6 },
  { name: 'الفيزياء', غياب: 11 },
];

const weeklyTrend = [
  { name: 'الأسبوع 1', نسبة: 91 },
  { name: 'الأسبوع 2', نسبة: 88 },
  { name: 'الأسبوع 3', نسبة: 94 },
  { name: 'الأسبوع 4', نسبة: 92 },
  { name: 'الأسبوع 5', نسبة: 95 },
];

const rankings = [
  { id: '1A', sub: 'اللغة العربية', score: 100, color: 'green', icon: '🥇' },
  { id: '2B', sub: 'الرياضيات', score: 96, color: 'accent', icon: '🥈' },
  { id: '3C', sub: 'العلوم', score: 94, color: 'gold', icon: '🥉' },
];

export const Analytics: React.FC = () => {
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
