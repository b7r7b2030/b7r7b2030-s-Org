import React, { useState, useEffect } from 'react';
import { 
  QrCode, 
  Printer, 
  Smartphone, 
  Package, 
  UserSquare2, 
  School,
  Download,
  Info,
  RefreshCw,
  ClipboardCheck
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { cn } from '../lib/utils';
import { sbFetch } from '../services/supabase';
import { Teacher, Committee } from '../types';

export const QRCodes: React.FC = () => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [committees, setCommittees] = useState<Committee[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTeacher, setSelectedTeacher] = useState('');
  const [selectedCommittee, setSelectedCommittee] = useState('');
  const [selectedEnvelope, setSelectedEnvelope] = useState('');

  // States for native printing
  const [printingItem, setPrintingItem] = useState<{ qrValue: string; title: string; subtitle?: string } | null>(null);
  const [bulkPrintItems, setBulkPrintItems] = useState<{ qrValue: string; title: string; subtitle?: string }[] | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  // Trigger browser print when printing elements are rendered in DOM
  useEffect(() => {
    if (printingItem || bulkPrintItems) {
      const timer = setTimeout(() => {
        window.print();
        setPrintingItem(null);
        setBulkPrintItems(null);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [printingItem, bulkPrintItems]);

  const fetchData = async () => {
    setLoading(true);
    const [tData, cData] = await Promise.all([
      sbFetch<any>('staff', 'GET', null, '?select=*&order=full_name'),
      sbFetch<Committee>('committees', 'GET', null, '?select=*&order=name')
    ]);
    if (tData) {
      // Map staff to teacher structure for compatibility
      const mappedTeachers = tData.map((s: any) => ({
        id: s.id,
        teacher_no: s.national_id,
        full_name: s.full_name,
        phone: s.phone
      }));
      setTeachers(mappedTeachers);
    }
    if (cData) {
      const sorted = [...cData].sort((a, b) => 
        a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' })
      );
      setCommittees(sorted);
    }
    setLoading(false);
  };

  // Helper to trigger single print
  const handleSinglePrint = (rawValue: string, title: string, subtitle?: string) => {
    if (!rawValue) return;
    setPrintingItem({ qrValue: rawValue, title, subtitle });
  };

  // Helper to trigger bulk printing for teachers
  const handleBulkPrintTeachers = () => {
    if (teachers.length === 0) {
      alert('لا توجد بيانات معلمين لطباعتها.');
      return;
    }
    const items = teachers.map(t => ({
      qrValue: JSON.stringify({ type: 'teacher', no: t.teacher_no, name: t.full_name }),
      title: t.full_name,
      subtitle: `رقم المعلم: ${t.teacher_no}`
    }));
    setBulkPrintItems(items);
  };

  // Helper to trigger bulk printing for committee/envelopes
  const handleBulkPrintEnvelopes = () => {
    if (committees.length === 0) {
      alert('لا توجد لجان أو مظاريف لطباعتها.');
      return;
    }
    const items = committees.map(c => ({
      qrValue: JSON.stringify({ type: 'committee', id: c.id, name: c.name }),
      title: `مظروف لجنة ${c.name}`,
      subtitle: c.subject ? `المادة: ${c.subject}` : 'ملف اللجنة الثابت'
    }));
    setBulkPrintItems(items);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Dynamic Style Sheet injected for perfect, standard system printing layout */}
      {(printingItem || bulkPrintItems) && (
        <style dangerouslySetInnerHTML={{ __html: `
          @media print {
            /* Hide the complete app structure */
            #root, .space-y-6, header, nav, aside, footer, div[class*="main-layout"] {
              display: none !important;
            }
            body, html {
              background: #fff !important;
              color: #000 !important;
              margin: 0 !important;
              padding: 0 !important;
              direction: rtl !important;
              font-family: inherit !important;
            }
            .system-print-wrapper {
              display: block !important;
              width: 100% !important;
              height: auto !important;
              background: #fff !important;
            }
            .print-grid {
              display: grid !important;
              grid-template-columns: repeat(2, 1fr) !important;
              gap: 20px !important;
              padding: 20px !important;
            }
            .print-card-box {
              border: 2px dashed #000 !important;
              border-radius: 12px !important;
              padding: 24px 16px !important;
              text-align: center !important;
              page-break-inside: avoid !important;
              display: flex !important;
              flex-direction: column !important;
              align-items: center !important;
              justify-content: center !important;
              background: #fff !important;
              color: #000 !important;
            }
            .print-card-box h4 {
              margin: 0 0 4px 0 !important;
              font-size: 16px !important;
              font-weight: bold !important;
              color: #000 !important;
            }
            .print-card-box p {
              margin: 0 0 12px 0 !important;
              font-size: 12px !important;
              color: #555 !important;
            }
            .print-card-single {
              display: flex !important;
              flex-direction: column !important;
              align-items: center !important;
              justify-content: center !important;
              height: 100vh !important;
              background: #fff !important;
              padding: 40px !important;
              text-align: center !important;
            }
            .print-card-single h4 {
              margin-top: 16px !important;
              font-size: 24px !important;
              font-weight: bold !important;
              color: #000 !important;
            }
            .print-card-single p {
              margin-top: 6px !important;
              font-size: 14px !important;
              color: #555 !important;
            }
          }
        `}} />
      )}

      {/* Rendering DOM Area for Printer Capture */}
      {printingItem && (
        <div className="hidden system-print-wrapper">
          <div className="print-card-single">
            <div style={{ background: '#fff', padding: '16px', borderRadius: '12px', border: '1px solid #000' }}>
              <QRCodeSVG value={printingItem.qrValue} size={250} />
            </div>
            <h4>{printingItem.title}</h4>
            {printingItem.subtitle && <p>{printingItem.subtitle}</p>}
          </div>
        </div>
      )}

      {bulkPrintItems && (
        <div className="hidden system-print-wrapper">
          <div className="print-grid">
            {bulkPrintItems.map((item, idx) => (
              <div key={idx} className="print-card-box">
                <div style={{ background: '#fff', padding: '8px', borderRadius: '8px', marginBottom: '10px' }}>
                  <QRCodeSVG value={item.qrValue} size={110} />
                </div>
                <h4>{item.title}</h4>
                {item.subtitle && <p>{item.subtitle}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center p-20">
          <RefreshCw size={48} className="text-accent animate-spin mb-4" />
          <p className="text-text3">جاري تحميل البيانات...</p>
        </div>
      ) : (
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
                  value={selectedTeacher}
                  onChange={(e) => setSelectedTeacher(e.target.value)}
                >
                  <option value="">— اختر —</option>
                  {teachers.map(t => (
                    <option key={t.id} value={JSON.stringify({ type: 'teacher', no: t.teacher_no, name: t.full_name })}>
                      {t.teacher_no} - {t.full_name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="flex-1 flex flex-col items-center justify-center min-h-[200px] border border-border/50 rounded-2xl bg-bg/50">
                {selectedTeacher ? (
                  <div className="animate-in zoom-in duration-300 text-center">
                    <div className="bg-white p-4 rounded-xl mb-3">
                      <QRCodeSVG value={selectedTeacher} size={120} />
                    </div>
                    <span className="text-[10px] font-bold text-text2">{JSON.parse(selectedTeacher).name}</span>
                  </div>
                ) : (
                  <div className="text-center opacity-30">
                    <Smartphone size={48} className="mx-auto mb-2" />
                    <p className="text-[10px] font-medium">اختر معلماً أولاً</p>
                  </div>
                )}
              </div>
            </div>
            <button 
              disabled={!selectedTeacher}
              onClick={() => {
                const parsed = JSON.parse(selectedTeacher);
                handleSinglePrint(selectedTeacher, parsed.name, `رقم المعلم: ${parsed.no}`);
              }}
              className="w-full mt-6 py-2.5 bg-bg3 border border-border rounded-xl text-xs font-bold text-text2 hover:text-text disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
            >
              <Printer size={16} />
              طباعة الرمز
            </button>
          </div>

          {/* Committee QR */}
          <div className="bg-card border border-border rounded-2xl p-6 flex flex-col">
            <h3 className="font-bold text-sm mb-6 flex items-center gap-2">
              <School size={18} className="text-accent" />
              QR لجنة
            </h3>
            <div className="space-y-4 flex-1">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-text2">اختر اللجنة</label>
                <select 
                  className="w-full bg-bg3 border border-border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-accent"
                  value={selectedCommittee}
                  onChange={(e) => setSelectedCommittee(e.target.value)}
                >
                  <option value="">— اختر —</option>
                  {committees.map(c => (
                    // Unified type to: committee so it produces the exact same QR code as the envelope
                    <option key={c.id} value={JSON.stringify({ type: 'committee', id: c.id, name: c.name })}>
                      لجنة {c.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="flex-1 flex flex-col items-center justify-center min-h-[200px] border border-border/50 rounded-2xl bg-bg/50">
                {selectedCommittee ? (
                  <div className="animate-in zoom-in duration-300 text-center">
                    <div className="bg-white p-4 rounded-xl mb-3">
                      <QRCodeSVG value={selectedCommittee} size={120} />
                    </div>
                    <span className="text-[10px] font-bold text-text2">لجنة {JSON.parse(selectedCommittee).name}</span>
                  </div>
                ) : (
                  <div className="text-center opacity-30">
                    <School size={48} className="mx-auto mb-2" />
                    <p className="text-[10px] font-medium">اختر لجنة أولاً</p>
                  </div>
                )}
              </div>
            </div>
            <button 
              disabled={!selectedCommittee}
              onClick={() => {
                const parsed = JSON.parse(selectedCommittee);
                handleSinglePrint(selectedCommittee, `لجنة ${parsed.name}`, "بطاقة اللجنة الرسمية");
              }}
              className="w-full mt-6 py-2.5 bg-bg3 border border-border rounded-xl text-xs font-bold text-text2 hover:text-text disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
            >
              <Printer size={16} />
              طباعة الرمز
            </button>
          </div>

          {/* Envelope QR */}
          <div className="bg-card border border-border rounded-2xl p-6 flex flex-col">
            <h3 className="font-bold text-sm mb-6 flex items-center gap-2">
              <Package size={18} className="text-gold" />
              QR مظروف ثابت
            </h3>
            <div className="space-y-4 flex-1">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-text2">اختر اللجنة التابع لها المظروف</label>
                <select 
                  className="w-full bg-bg3 border border-border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-accent"
                  value={selectedEnvelope}
                  onChange={(e) => setSelectedEnvelope(e.target.value)}
                >
                  <option value="">— اختر —</option>
                  {committees.map(c => (
                    // Identical payload represents the envelope tied permanently to the committee 
                    <option key={c.id} value={JSON.stringify({ type: 'committee', id: c.id, name: c.name })}>
                      مظروف لجنة {c.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="flex-1 flex flex-col items-center justify-center min-h-[200px] border border-border/50 rounded-2xl bg-bg/50">
                {selectedEnvelope ? (
                  <div className="animate-in zoom-in duration-300 text-center">
                    <div className="bg-white p-4 rounded-xl mb-3">
                      {/* Notice how the QR image looks exactly identical to the committee's QR, because they are indeed the same! */}
                      <QRCodeSVG value={selectedEnvelope} size={120} />
                    </div>
                    <span className="text-[10px] font-bold text-gold">ملصق ملف/مظروف لجنة {JSON.parse(selectedEnvelope).name}</span>
                  </div>
                ) : (
                  <div className="text-center opacity-30">
                    <Package size={48} className="mx-auto mb-2" />
                    <p className="text-[10px] font-medium">اختر لجنة المظروف أولاً</p>
                  </div>
                )}
              </div>
            </div>
            <button 
              disabled={!selectedEnvelope}
              onClick={() => {
                const parsed = JSON.parse(selectedEnvelope);
                handleSinglePrint(selectedEnvelope, `مظروف لجنة ${parsed.name}`, "ملف اللجنة الثابت - أوراق الأسئلة والإجابة");
              }}
              className="w-full mt-6 py-2.5 bg-bg3 border border-border rounded-xl text-xs font-bold text-text2 hover:text-text disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
            >
              <Printer size={16} />
              طباعة الرمز
            </button>
          </div>

          {/* Bulk Printing */}
          <div className="bg-card border border-border rounded-2xl p-6">
            <h3 className="font-bold text-sm mb-6 flex items-center gap-2">
              <Printer size={18} className="text-purple" />
              طباعة دفعية مجمعة
            </h3>
            <p className="text-xs text-text3 leading-relaxed mb-6">
              اطبع رموز QR لجميع المعلمين أو جميع المظاريف الثابتة للجان دفعة واحدة بتنسيق شبكي جاهز مباشرة للطباعة.
            </p>
            <div className="space-y-3">
              <button 
                onClick={handleBulkPrintTeachers}
                className="w-full py-3 bg-accent text-white font-bold rounded-xl hover:bg-accent/90 transition-all flex items-center justify-center gap-2 shadow-sm"
              >
                <UserSquare2 size={18} />
                طباعة QR كل المعلمين
              </button>
              <button 
                onClick={handleBulkPrintEnvelopes}
                className="w-full py-3 bg-gold text-black font-bold rounded-xl hover:bg-gold/90 transition-all flex items-center justify-center gap-2 shadow-sm"
              >
                <Package size={18} />
                طباعة QR كل المظاريف الثابتة
              </button>
            </div>
            <div className="mt-6 p-4 bg-gold/5 border border-gold/10 rounded-xl flex items-start gap-3">
              <Info size={16} className="text-gold shrink-0 mt-0.5" />
              <p className="text-[10px] text-text2 leading-relaxed">
                تنزيل وطباعة رموز المظاريف على ملصقات لاصقة (Stickers) وإلصاقها بملفات اللجان الدائمة لتهيئة فرز واستلام آلي وسريع.
              </p>
            </div>
          </div>

          {/* Control Handover QR */}
          <div className="bg-card border border-border rounded-2xl p-6 flex flex-col">
            <h3 className="font-bold text-sm mb-6 flex items-center gap-2">
              <ClipboardCheck size={18} className="text-green" />
              QR استلام الكنترول
            </h3>
            <div className="space-y-4 flex-1">
              <p className="text-[10px] text-text3 leading-relaxed">
                يتم عرض هذا الرمز في مكتب الكنترول ليقوم المعلم بمسحه عند تسليم المظروف لتأكيد الاستلام آلياً.
              </p>
              
              <div className="flex-1 flex flex-col items-center justify-center min-h-[200px] border border-border/50 rounded-2xl bg-bg/50">
                <div className="animate-in zoom-in duration-300 text-center">
                  <div className="bg-white p-4 rounded-xl mb-3">
                    <QRCodeSVG value={JSON.stringify({ type: 'control_handover', timestamp: new Date().toISOString() })} size={120} />
                  </div>
                  <span className="text-[10px] font-bold text-text2">رمز استلام الكنترول الرسمي</span>
                </div>
              </div>
            </div>
            <button 
              onClick={() => handleSinglePrint(JSON.stringify({ type: 'control_handover', timestamp: new Date().toISOString() }), "رمز استلام الكنترول الرسمي", "يُعلق في مكتب لجنة الكنترول والمراقبة")}
              className="w-full mt-6 py-2.5 bg-bg3 border border-border rounded-xl text-xs font-bold text-text2 hover:text-text transition-all flex items-center justify-center gap-2"
            >
              <Printer size={16} />
              طباعة الرمز للمكتب
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
