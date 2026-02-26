import React, { useState } from 'react';
import { 
  QrCode, 
  Printer, 
  Smartphone, 
  Package, 
  UserSquare2, 
  School,
  Download,
  Info
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { cn } from '../lib/utils';

export const QRCodes: React.FC = () => {
  const [teacher, setTeacher] = useState('');
  const [envelope, setEnvelope] = useState('');

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Teacher QR */}
        <div className="bg-card border border-border rounded-2xl p-6 flex flex-col">
          <h3 className="font-bold text-sm mb-6 flex items-center gap-2">
            <UserSquare2 size={18} className="text-accent" />
            QR معلم
          </h3>
          <div className="space-y-4 flex-1">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-text2">اختر المعلم</label>
              <select 
                className="w-full bg-bg3 border border-border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-accent"
                value={teacher}
                onChange={(e) => setTeacher(e.target.value)}
              >
                <option value="">— اختر —</option>
                <option value="T001|أحمد السيد">T001 - أحمد السيد</option>
                <option value="T002|خالد الأحمدي">T002 - خالد الأحمدي</option>
              </select>
            </div>
            
            <div className="flex-1 flex flex-col items-center justify-center min-h-[200px] border border-border/50 rounded-2xl bg-bg/50">
              {teacher ? (
                <div className="animate-in zoom-in duration-300 text-center">
                  <div className="bg-white p-4 rounded-xl mb-3">
                    <QRCodeSVG value={teacher} size={120} />
                  </div>
                  <span className="text-[10px] font-bold text-text2">{teacher.split('|')[1]}</span>
                </div>
              ) : (
                <div className="text-center opacity-30">
                  <Smartphone size={48} className="mx-auto mb-2" />
                  <p className="text-[10px] font-medium">اختر معلماً أولاً</p>
                </div>
              )}
            </div>
          </div>
          <button className="w-full mt-6 py-2.5 bg-bg3 border border-border rounded-xl text-xs font-bold text-text2 hover:text-text transition-all flex items-center justify-center gap-2">
            <Printer size={16} />
            طباعة الرمز
          </button>
        </div>

        {/* Envelope QR */}
        <div className="bg-card border border-border rounded-2xl p-6 flex flex-col">
          <h3 className="font-bold text-sm mb-6 flex items-center gap-2">
            <Package size={18} className="text-gold" />
            QR مظروف
          </h3>
          <div className="space-y-4 flex-1">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-text2">اختر اللجنة</label>
              <select 
                className="w-full bg-bg3 border border-border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-accent"
                value={envelope}
                onChange={(e) => setEnvelope(e.target.value)}
              >
                <option value="">— اختر —</option>
                <option value="ENV-001|1A">ENV-001 - لجنة 1A</option>
                <option value="ENV-002|2B">ENV-002 - لجنة 2B</option>
              </select>
            </div>
            
            <div className="flex-1 flex flex-col items-center justify-center min-h-[200px] border border-border/50 rounded-2xl bg-bg/50">
              {envelope ? (
                <div className="animate-in zoom-in duration-300 text-center">
                  <div className="bg-white p-4 rounded-xl mb-3">
                    <QRCodeSVG value={envelope} size={120} />
                  </div>
                  <span className="text-[10px] font-bold text-text2">مظروف لجنة {envelope.split('|')[1]}</span>
                </div>
              ) : (
                <div className="text-center opacity-30">
                  <Package size={48} className="mx-auto mb-2" />
                  <p className="text-[10px] font-medium">اختر لجنة أولاً</p>
                </div>
              )}
            </div>
          </div>
          <button className="w-full mt-6 py-2.5 bg-bg3 border border-border rounded-xl text-xs font-bold text-text2 hover:text-text transition-all flex items-center justify-center gap-2">
            <Printer size={16} />
            طباعة الرمز
          </button>
        </div>

        {/* Bulk Printing */}
        <div className="bg-card border border-border rounded-2xl p-6">
          <h3 className="font-bold text-sm mb-6 flex items-center gap-2">
            <Printer size={18} className="text-purple" />
            طباعة دفعية
          </h3>
          <p className="text-xs text-text3 leading-relaxed mb-6">
            اطبع رموز QR لجميع المعلمين أو جميع المظاريف دفعة واحدة بتنسيق جاهز للطباعة.
          </p>
          <div className="space-y-3">
            <button className="w-full py-3 bg-accent text-white font-bold rounded-xl hover:bg-accent/90 transition-all flex items-center justify-center gap-2">
              <UserSquare2 size={18} />
              طباعة QR كل المعلمين
            </button>
            <button className="w-full py-3 bg-gold text-black font-bold rounded-xl hover:bg-gold/90 transition-all flex items-center justify-center gap-2">
              <Package size={18} />
              طباعة QR كل المظاريف
            </button>
          </div>
          <div className="mt-6 p-4 bg-gold/5 border border-gold/10 rounded-xl flex items-start gap-3">
            <Info size={16} className="text-gold shrink-0 mt-0.5" />
            <p className="text-[10px] text-text2 leading-relaxed">
              يُنصح بطباعة QR المظاريف على الورق اللاصق وإلصاقها على المظاريف الفعلية لتسهيل عملية المسح.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
