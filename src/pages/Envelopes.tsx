import React, { useState, useEffect } from 'react';
import { 
  Package, 
  Search, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  User,
  Loader2,
  ArrowLeftRight,
  History,
  School
} from 'lucide-react';
import { cn } from '../lib/utils';
import { sbFetch } from '../services/supabase';

interface EnvelopeTracking {
  envelope_no: string;
  envelope_status: 'pending' | 'received' | 'in_progress' | 'delivered';
  committee_name: string;
  subject: string;
  exam_date: string;
  teacher_name: string;
  received_at: string;
  exam_ended_at: string;
  delivered_at: string;
  paper_count: number;
  notes: string;
}

const EnvelopeTrackSteps: React.FC<{ status: string }> = ({ status }) => {
  const steps = [
    { id: 'pending', label: 'انتظار' },
    { id: 'received', label: 'استلام' },
    { id: 'in_progress', label: 'اختبار' },
    { id: 'delivered', label: 'تسليم' },
  ];

  const getStepStatus = (stepId: string) => {
    if (status === 'delivered') return 'done';
    if (status === 'in_progress') {
      if (['pending', 'received'].includes(stepId)) return 'done';
      if (stepId === 'in_progress') return 'active';
      return 'pending';
    }
    if (status === 'received') {
      if (stepId === 'pending') return 'done';
      if (stepId === 'received') return 'active';
      return 'pending';
    }
    if (status === 'pending') {
      if (stepId === 'pending') return 'active';
      return 'pending';
    }
    return 'pending';
  };

  return (
    <div className="flex items-center justify-between relative py-2 w-full max-w-[200px]">
      <div className="absolute top-1/2 left-2 right-2 h-0.5 bg-border -translate-y-1/2 z-0"></div>
      {steps.map((step, i) => {
        const s = getStepStatus(step.id);
        return (
          <div key={step.id} className="flex flex-col items-center gap-1 z-10">
            <div className={cn(
              "w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold border-2 transition-all",
              s === 'done' && "bg-green border-green text-white",
              s === 'active' && "bg-accent border-accent text-white animate-pulse",
              s === 'pending' && "bg-bg3 border-border text-text3"
            )}>
              {s === 'done' ? '✓' : i + 1}
            </div>
            <span className="text-[7px] font-bold text-text3 uppercase">{step.label}</span>
          </div>
        );
      })}
    </div>
  );
};

export const Envelopes: React.FC = () => {
  const [envelopes, setEnvelopes] = useState<EnvelopeTracking[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('الكل');

  useEffect(() => {
    fetchEnvelopes();
  }, []);

  const fetchEnvelopes = async () => {
    setLoading(true);
    try {
      const data = await sbFetch<EnvelopeTracking>('v_envelope_tracking', 'GET');
      if (data) {
        setEnvelopes(data);
      }
    } catch (error) {
      console.error('Error fetching envelopes:', error);
    }
    setLoading(false);
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'pending':
        return { label: 'بانتظار الاستلام', color: 'text-text3 bg-bg3', icon: Clock };
      case 'received':
        return { label: 'تم الاستلام', color: 'text-blue-400 bg-blue-500/10', icon: Package };
      case 'in_progress':
        return { label: 'قيد الاختبار', color: 'text-gold bg-gold/10', icon: ArrowLeftRight };
      case 'delivered':
        return { label: 'سُلِّم للكنترول', color: 'text-green bg-green/10', icon: CheckCircle2 };
      default:
        return { label: status, color: 'text-text3 bg-bg3', icon: AlertCircle };
    }
  };

  const filteredEnvelopes = envelopes.filter(e => {
    const matchesSearch = (e.envelope_no || '').includes(search) || 
                         (e.committee_name || '').includes(search) || 
                         (e.subject || '').includes(search);
    const matchesStatus = statusFilter === 'الكل' || getStatusInfo(e.envelope_status).label === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: envelopes.length,
    delivered: envelopes.filter(e => e.envelope_status === 'delivered').length,
    pending: envelopes.filter(e => e.envelope_status === 'pending').length,
    active: envelopes.filter(e => ['received', 'in_progress'].includes(e.envelope_status)).length,
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'إجمالي المظاريف', value: stats.total, icon: Package, color: 'accent' },
          { label: 'سُلِّمت للكنترول', value: stats.delivered, icon: CheckCircle2, color: 'green' },
          { label: 'قيد العمل', value: stats.active, icon: ArrowLeftRight, color: 'gold' },
          { label: 'بانتظار الاستلام', value: stats.pending, icon: Clock, color: 'purple' },
        ].map((stat, i) => (
          <div key={i} className="bg-card border border-border rounded-2xl p-4 md:p-6">
            <div className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center mb-4",
              stat.color === 'accent' && "bg-accent/10 text-accent",
              stat.color === 'green' && "bg-green/10 text-green",
              stat.color === 'gold' && "bg-gold/10 text-gold",
              stat.color === 'purple' && "bg-purple/10 text-purple"
            )}>
              <stat.icon size={20} />
            </div>
            <div className="text-2xl font-black text-text">{stat.value}</div>
            <div className="text-[10px] font-bold text-text3 uppercase tracking-wider">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-card border border-border rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex bg-bg3 p-1 rounded-xl border border-border w-full md:w-auto overflow-x-auto">
          {['الكل', 'بانتظار الاستلام', 'تم الاستلام', 'قيد الاختبار', 'سُلِّم للكنترول'].map(f => (
            <button
              key={f}
              onClick={() => setStatusFilter(f)}
              className={cn(
                "px-4 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap",
                statusFilter === f ? "bg-accent text-white shadow-lg" : "text-text3 hover:text-text"
              )}
            >
              {f}
            </button>
          ))}
        </div>
        <div className="relative w-full md:w-64">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-text3" size={16} />
          <input 
            type="text" 
            placeholder="بحث برقم المظروف أو اللجنة..." 
            className="w-full bg-bg3 border border-border rounded-xl pr-10 pl-4 py-2 text-sm outline-none focus:border-accent"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Envelopes Table */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-border flex items-center justify-between bg-bg3/30">
          <h3 className="font-bold text-sm flex items-center gap-2">
            <History size={18} className="text-accent" />
            تتبع المظاريف — خط زمني
          </h3>
          <button 
            onClick={fetchEnvelopes}
            className="text-[10px] font-bold text-accent hover:underline"
          >
            تحديث البيانات
          </button>
        </div>
        
        {loading ? (
          <div className="p-20 text-center">
            <Loader2 className="mx-auto animate-spin text-accent mb-4" size={40} />
            <p className="text-text3 text-sm">جاري تحميل بيانات المظاريف...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-sm">
              <thead className="bg-bg3/50 text-text3 text-[10px] font-bold uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3">رقم المظروف</th>
                  <th className="px-6 py-3">اللجنة</th>
                  <th className="px-6 py-3">المادة</th>
                  <th className="px-6 py-3">المعلم</th>
                  <th className="px-6 py-3 w-48">رحلة المظروف</th>
                  <th className="px-6 py-3">الحالة</th>
                  <th className="px-6 py-3">آخر تحديث</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {filteredEnvelopes.length > 0 ? filteredEnvelopes.map((env, i) => {
                  const status = getStatusInfo(env.envelope_status);
                  return (
                    <tr key={i} className="hover:bg-white/5 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-accent/10 text-accent rounded-lg flex items-center justify-center">
                            <Package size={14} />
                          </div>
                          <span className="font-bold text-text">#{env.envelope_no}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 text-text2">
                          <School size={14} className="text-text3" />
                          {env.committee_name}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-text2">{env.subject}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 text-text2">
                          <User size={14} className="text-text3" />
                          {env.teacher_name || '—'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <EnvelopeTrackSteps status={env.envelope_status} />
                      </td>
                      <td className="px-6 py-4">
                        <span className={cn("px-2 py-1 rounded-md text-[10px] font-bold border", status.color, "border-current/20")}>
                          {status.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-text3 text-[10px]">
                        {env.delivered_at ? new Date(env.delivered_at).toLocaleString('ar-SA') : 
                         env.received_at ? new Date(env.received_at).toLocaleString('ar-SA') : '—'}
                      </td>
                    </tr>
                  );
                }) : (
                  <tr>
                    <td colSpan={7} className="px-6 py-20 text-center">
                      <Package className="mx-auto text-text3 mb-4 opacity-20" size={64} />
                      <p className="text-text3 text-sm">لا توجد مظاريف مطابقة للبحث</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
