import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Activity, 
  Database, 
  Server, 
  Cpu, 
  HardDrive,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Search,
  Users
} from 'lucide-react';
import { sbFetch } from '../services/supabase';
import { cn } from '../lib/utils';

export const Diagnostics: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState<any[]>([]);
  const [health, setHealth] = useState({
    db: 'checking',
    version: '2.1.0-PRO',
    uptime: '99.9%',
    latency: '...'
  });
  const [stats, setStats] = useState({
    totalLogs: 0,
    authLogs: 0,
    errorLogs: 0
  });

  useEffect(() => {
    fetchDiagnostics();
  }, []);

  const fetchDiagnostics = async () => {
    setLoading(true);
    const start = Date.now();
    try {
      const [allLogs, logCount] = await Promise.all([
        sbFetch<any>('system_logs', 'GET', null, '?order=created_at.desc&limit=50&select=*,staff(full_name)'),
        sbFetch<any>('system_logs', 'GET', null, '?select=id,category,severity')
      ]);

      const end = Date.now();
      
      if (allLogs) setLogs(allLogs);
      
      if (logCount) {
        setStats({
          totalLogs: logCount.length,
          authLogs: logCount.filter((l: any) => l.category === 'auth').length,
          errorLogs: logCount.filter((l: any) => l.severity === 'error').length
        });
      }

      setHealth(h => ({
        ...h,
        db: 'online',
        latency: `${end - start}ms`
      }));
    } catch (error) {
      setHealth(h => ({ ...h, db: 'error' }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-2xl p-5 flex items-center gap-4">
          <div className={cn(
            "w-12 h-12 rounded-xl flex items-center justify-center",
            health.db === 'online' ? "bg-green/10 text-green" : "bg-red/10 text-red"
          )}>
            <Database size={24} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-text3 uppercase">قاعدة البيانات</p>
            <p className="text-sm font-black text-text">{health.db === 'online' ? 'متصلة' : 'خطأ بالاتصال'}</p>
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 bg-accent/10 text-accent rounded-xl flex items-center justify-center">
            <Activity size={24} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-text3 uppercase">زمن الاستجابة</p>
            <p className="text-sm font-black text-text">{health.latency}</p>
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 bg-purple/10 text-purple rounded-xl flex items-center justify-center">
            <Server size={24} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-text3 uppercase">إصدار النظام</p>
            <p className="text-sm font-black text-text">{health.version}</p>
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 bg-gold/10 text-gold rounded-xl flex items-center justify-center">
            <ShieldCheck size={24} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-text3 uppercase">استقرار الخدمة</p>
            <p className="text-sm font-black text-text">{health.uptime}</p>
          </div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-border flex items-center justify-between bg-bg3/30">
          <div className="flex items-center gap-3">
            <ShieldCheck className="text-accent" size={20} />
            <h3 className="font-bold text-sm">سجل الرقابة الشامل (Audit Trail)</h3>
          </div>
          <button 
            onClick={fetchDiagnostics}
            className="p-2 hover:bg-bg3 rounded-lg transition-all text-text3 hover:text-accent"
          >
            <RefreshCw size={18} className={cn(loading && "animate-spin")} />
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-right text-sm">
            <thead className="bg-bg3/50 text-text3 text-[10px] font-bold uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3">الوقت</th>
                <th className="px-6 py-3">المستخدم</th>
                <th className="px-6 py-3">العملية</th>
                <th className="px-6 py-3">التصنيف</th>
                <th className="px-6 py-3">الحالة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {logs.length > 0 ? logs.map((log) => (
                <tr key={log.id} className="hover:bg-white/5 transition-colors group">
                  <td className="px-6 py-4 text-[11px] text-text3 font-medium">
                    {new Date(log.created_at).toLocaleString('ar-SA')}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-bg3 flex items-center justify-center text-text3 group-hover:bg-accent/10 group-hover:text-accent transition-colors">
                        <Users size={14} />
                      </div>
                      <span className="font-bold text-text text-xs">{log.staff?.full_name || 'النظام'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs text-text2 leading-relaxed">
                    {log.action}
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "px-2 py-0.5 rounded-lg text-[9px] font-bold border capitalize",
                      log.category === 'attendance' && "bg-green/10 text-green border-green/20",
                      log.category === 'envelope' && "bg-blue/10 text-blue border-blue/20",
                      log.category === 'auth' && "bg-purple/10 text-purple border-purple/20",
                      log.category === 'data' && "bg-gold/10 text-gold border-gold/20"
                    )}>
                      {log.category}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5">
                      <div className={cn(
                        "w-1.5 h-1.5 rounded-full",
                        log.severity === 'error' ? "bg-red animate-pulse" : 
                        log.severity === 'warning' ? "bg-gold" : "bg-green"
                      )}></div>
                      <span className="text-[10px] font-bold text-text3 capitalize">{log.severity}</span>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={5} className="p-20 text-center">
                    <div className="max-w-xs mx-auto space-y-3 opacity-30">
                      <Search size={48} className="mx-auto" />
                      <p className="text-sm">لا توجد سجلات حالياً</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
