import React from 'react';
import { Bell, Plus, Search, Wifi } from 'lucide-react';
import { cn } from '../lib/utils';

interface TopbarProps {
  title: string;
  subtitle: string;
  onAddClick: () => void;
  onAlertsClick: () => void;
  alertCount: number;
  showAddButton?: boolean;
}

export const Topbar: React.FC<TopbarProps> = ({ 
  title, 
  subtitle, 
  onAddClick, 
  onAlertsClick, 
  alertCount,
  showAddButton = true
}) => {
  return (
    <header className="sticky top-0 z-40 h-16 bg-bg2/80 backdrop-blur-xl border-b border-border px-8 flex items-center justify-between">
      <div>
        <h1 className="font-display font-extrabold text-xl text-text">{title}</h1>
        <span className="text-xs text-text3">{subtitle}</span>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-bg3 rounded-lg border border-border text-xs text-text3">
          <Wifi size={14} className="text-green" />
          <span>متصل بـ Supabase</span>
        </div>

        <div className="relative">
          <button 
            onClick={onAlertsClick}
            className="w-10 h-10 bg-card2 border border-border rounded-xl flex items-center justify-center text-text2 hover:border-accent hover:text-accent transition-all"
          >
            <Bell size={20} />
          </button>
          {alertCount > 0 && (
            <span className="absolute -top-1 -left-1 w-5 h-5 bg-red border-2 border-bg2 rounded-full flex items-center justify-center text-[10px] font-bold text-white">
              {alertCount}
            </span>
          )}
        </div>

        {showAddButton && (
          <button 
            onClick={onAddClick}
            className="flex items-center gap-2 bg-linear-to-br from-accent to-purple text-white px-5 py-2 rounded-xl text-sm font-bold shadow-lg shadow-accent/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            <Plus size={18} />
            <span>إضافة جديد</span>
          </button>
        )}
      </div>
    </header>
  );
};
