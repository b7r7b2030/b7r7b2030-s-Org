import React, { useState, useEffect, useRef } from 'react';
import { 
  UserSquare2, 
  Upload, 
  Search, 
  Plus, 
  Trash2, 
  Edit, 
  QrCode,
  Smartphone,
  Info,
  Loader2,
  RefreshCw,
  ShieldCheck,
  ClipboardCheck,
  HeartHandshake,
  User as UserIcon
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import * as XLSX from 'xlsx';
import { cn } from '../lib/utils';
import { Staff, UserRole } from '../types';
import { sbFetch } from '../services/supabase';

export const Teachers: React.FC = () => {
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [importing, setImporting] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
  const [formData, setFormData] = useState({
    national_id: '',
    full_name: '',
    phone: '',
    role: UserRole.TEACHER as UserRole
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    setLoading(true);
    const data = await sbFetch<Staff>('staff', 'GET', null, '?select=*');
    if (data) {
      setStaffList(data);
    }
    setLoading(false);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);
    const reader = new FileReader();

    reader.onload = async (event) => {
      try {
        const data = new Uint8Array(event.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];

        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];

        if (jsonData.length === 0) {
          alert('الملف فارغ أو لا يحتوي على بيانات صحيحة');
          setImporting(false);
          return;
        }

        const normalizeArabic = (str: string) => {
          if (!str) return '';
          return String(str)
            .trim()
            .replace(/[أإآ]/g, 'ا')
            .replace(/ة/g, 'ه')
            .replace(/\s+/g, ' ')
            .toLowerCase();
        };

        let headerRowIndex = 0;
        let maxScore = -1;
        const keywords = ['اسم', 'معلم', 'موظف', 'طاقم', 'سجل', 'هويه', 'هوية', 'جوال', 'هاتف', 'وطني', 'تليفون', 'موبايل', 'اسم المعلم', 'رقم الجوال'];

        for (let r = 0; r < Math.min(6, jsonData.length); r++) {
          const row = jsonData[r] || [];
          let score = 0;
          for (const cell of row) {
            const cellStr = normalizeArabic(String(cell || ''));
            if (keywords.some(kw => cellStr.includes(kw))) {
              score++;
            }
          }
          if (score > maxScore && score >= 1) {
            maxScore = score;
            headerRowIndex = r;
          }
        }

        const headerRow = jsonData[headerRowIndex] || [];

        let colIndices = {
          national_id: -1,
          full_name: -1,
          phone: -1
        };

        headerRow.forEach((cell, idx) => {
          const val = normalizeArabic(String(cell || ''));
          if (!val) return;

          if (val.includes('جوال') || val.includes('هاتف') || val.includes('تليفون') || val.includes('موبايل')) {
            colIndices.phone = idx;
          } else if (val.includes('اسم') && (val.includes('طالب') || val.includes('معلم') || val.includes('موظف') || val === 'الاسم' || val === 'اسم' || val.includes('طاقم'))) {
            colIndices.full_name = idx;
          } else if (val.includes('سجل') || val.includes('هويه') || val.includes('هوية') || val.includes('وطني') || val.includes('اكاديمي') || val.includes('رقم المعلم') || val.includes('رقم الموظف') || val.includes('كود') || val === 'الكود' || val.includes('رقم الدخول') || val.includes('رقم')) {
            colIndices.national_id = idx;
          }
        });

        if (colIndices.full_name === -1) {
          colIndices.full_name = headerRow.findIndex(cell => {
            const v = normalizeArabic(String(cell || ''));
            return v.includes('اسم');
          });
        }
        if (colIndices.national_id === -1) {
          colIndices.national_id = headerRow.findIndex(cell => {
            const v = normalizeArabic(String(cell || ''));
            return v.includes('سجل') || v.includes('هويه') || v.includes('رقم') || v.includes('كود') || v.includes('هوية');
          });
        }
        if (colIndices.phone === -1) {
          colIndices.phone = headerRow.findIndex(cell => {
            const v = normalizeArabic(String(cell || ''));
            return v.includes('جوال') || v.includes('هاتف') || v.includes('موبايل');
          });
        }

        if (colIndices.full_name === -1 && colIndices.national_id === -1) {
          colIndices = {
            national_id: 0,
            full_name: 1,
            phone: 2
          };
        }

        const rawRows = jsonData.slice(headerRowIndex + 1);

        const staffToImport = rawRows.map(row => {
          const getVal = (idx: number) => {
            if (idx === -1 || idx >= row.length) return '';
            return String(row[idx] ?? '').trim();
          };

          return {
            national_id: getVal(colIndices.national_id),
            full_name: getVal(colIndices.full_name),
            phone: getVal(colIndices.phone),
            role: UserRole.TEACHER as UserRole
          };
        }).filter(s => s.national_id && s.full_name);

        if (staffToImport.length === 0) {
          alert('الملف فارغ أو لا يحتوي على بيانات صحيحة للموظفين');
          setImporting(false);
          return;
        }

        const existingData = await sbFetch<Staff>('staff', 'GET', null, '?select=national_id');
        const existingIds = new Set(existingData?.map(e => e.national_id) || []);

        const uniqueStaffToImport = staffToImport.filter(s => !existingIds.has(s.national_id));

        if (uniqueStaffToImport.length === 0) {
          alert('جميع الموظفين في الملف مسجلون مسبقاً بالفعل');
          setImporting(false);
          return;
        }

        let successCount = 0;
        for (const staffMember of uniqueStaffToImport) {
          const res = await sbFetch('staff', 'POST', staffMember);
          if (res) successCount++;
        }

        alert(`تم استيراد عدد ${successCount} موظف/معلم بنجاح كمعلمين افتراضياً.`);
        fetchStaff();
      } catch (error) {
        console.error('Error importing staff:', error);
        alert('حدث خطأ أثناء قراءة ملف Excel');
      } finally {
        setImporting(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };

    reader.readAsArrayBuffer(file);
  };

  const handleAddStaff = async () => {
    if (!formData.national_id || !formData.full_name || !formData.role) {
      alert('يرجى تعبئة جميع الحقول الإلزامية');
      return;
    }

    setAdding(true);
    console.log('Attempting to add staff:', formData);
    try {
      const res = await sbFetch<Staff>('staff', 'POST', formData);
      console.log('Response from sbFetch:', res);
      if (res && res.length > 0) {
        alert('تم إضافة الموظف بنجاح');
        setFormData({ national_id: '', full_name: '', phone: '', role: UserRole.TEACHER });
        fetchStaff();
      } else {
        alert('حدث خطأ أثناء إضافة الموظف. قد يكون السجل المدني مسجلاً مسبقاً أو هناك مشكلة في الاتصال بالخادم.');
      }
    } catch (error) {
      console.error(error);
      alert('حدث خطأ غير متوقع');
    } finally {
      setAdding(false);
    }
  };

  const handleUpdateStaff = async () => {
    if (!editingStaff || !editingStaff.id) return;
    if (!formData.national_id || !formData.full_name || !formData.role) {
      alert('يرجى تعبئة جميع الحقول الإلزامية');
      return;
    }

    setAdding(true);
    try {
      const res = await sbFetch<Staff>('staff', 'PATCH', formData, `?id=eq.${editingStaff.id}`);
      if (res) {
        alert('تم تعديل بيانات الموظف بنجاح');
        setEditingStaff(null);
        setFormData({ national_id: '', full_name: '', phone: '', role: UserRole.TEACHER });
        fetchStaff();
      } else {
        alert('حدث خطأ أثناء تعديل بيانات الموظف.');
      }
    } catch (error) {
      console.error(error);
      alert('حدث خطأ غير متوقع');
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا الموظف؟')) return;
    const res = await sbFetch('staff', 'DELETE', null, `?id=eq.${id}`);
    if (res) {
      fetchStaff();
      if (selectedStaff?.id === id) setSelectedStaff(null);
    }
  };

  const getRoleInfo = (role: UserRole) => {
    switch (role) {
      case UserRole.PRINCIPAL: return { label: 'مدير', icon: ShieldCheck, color: 'text-accent bg-accent/10' };
      case UserRole.CONTROL: return { label: 'كنترول', icon: ClipboardCheck, color: 'text-green bg-green/10' };
      case UserRole.COUNSELOR: return { label: 'مرشد', icon: HeartHandshake, color: 'text-purple bg-purple/10' };
      case UserRole.TEACHER: return { label: 'معلم', icon: UserIcon, color: 'text-gold bg-gold/10' };
      default: return { label: role, icon: UserIcon, color: 'text-text3 bg-bg3' };
    }
  };

  const filteredStaff = staffList.filter(s => 
    s.full_name.includes(search) || s.national_id.includes(search)
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Add/Import Section */}
        <div className="bg-card border border-border rounded-2xl p-6">
          {editingStaff ? (
            <div className="flex items-center justify-between mb-4 border-b border-border pb-3">
              <h3 className="font-bold text-sm flex items-center gap-2 text-accent">
                <Edit size={18} />
                تعديل بيانات العضو | {editingStaff.full_name}
              </h3>
              <button 
                onClick={() => {
                  setEditingStaff(null);
                  setFormData({ national_id: '', full_name: '', phone: '', role: UserRole.TEACHER });
                }}
                className="text-xs bg-bg3 border border-border px-3 py-1.5 rounded-lg text-text2 hover:text-red hover:border-red/30 transition-all font-bold"
              >
                إلغاء التعديل
              </button>
            </div>
          ) : (
            <h3 className="font-bold text-sm mb-4 flex items-center gap-2">
              <Upload size={18} className="text-accent" />
              إدارة طاقم العمل (المستخدمين)
            </h3>
          )}

          {!editingStaff && (
            <>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileUpload} 
                accept=".xlsx, .xls, .csv" 
                className="hidden" 
              />
              <div 
                onClick={() => !importing && fileInputRef.current?.click()}
                className={cn(
                  "border-2 border-dashed border-border rounded-2xl p-8 text-center cursor-pointer hover:bg-accent/5 hover:border-accent transition-all group",
                  importing && "pointer-events-none opacity-50"
                )}
              >
                <div className="w-14 h-14 bg-bg3 rounded-2xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                  {importing ? (
                    <Loader2 size={28} className="text-accent animate-spin" />
                  ) : (
                    <Upload size={28} className="text-text3 group-hover:text-accent" />
                  )}
                </div>
                <h4 className="font-bold text-text text-sm mb-1">
                  {importing ? 'جاري الاستيراد...' : 'رفع ملف Excel للطاقم'}
                </h4>
                <p className="text-[10px] text-text3">اسم المعلم، السجل المدني، رقم الجوال (يتم التعيين كمعلم افتراضياً)</p>
              </div>
              
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-border"></span></div>
                <div className="relative flex justify-center text-[10px] uppercase font-bold"><span className="bg-card px-2 text-text3 tracking-widest">أو إضافة يدوية</span></div>
              </div>
            </>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-text2">السجل المدني (كود الدخول) *</label>
              <input 
                className="w-full bg-bg3 border border-border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-accent" 
                placeholder="مثال: 1234567890" 
                value={formData.national_id}
                onChange={(e) => setFormData({...formData, national_id: e.target.value})}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-text2">الاسم الكامل *</label>
              <input 
                className="w-full bg-bg3 border border-border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-accent" 
                placeholder="الاسم الرباعي" 
                value={formData.full_name}
                onChange={(e) => setFormData({...formData, full_name: e.target.value})}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-text2">رقم الجوال</label>
              <input 
                className="w-full bg-bg3 border border-border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-accent" 
                placeholder="+966 5xxxxxxxx" 
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-text2">الصلاحية (الدور) *</label>
              <select 
                className="w-full bg-bg3 border border-border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-accent appearance-none"
                value={formData.role}
                onChange={(e) => setFormData({...formData, role: e.target.value as UserRole})}
              >
                <option value={UserRole.TEACHER}>معلم مراقب</option>
                <option value={UserRole.CONTROL}>كنترول الاختبارات</option>
                <option value={UserRole.COUNSELOR}>مرشد طلابي</option>
                <option value={UserRole.PRINCIPAL}>مدير المدرسة</option>
              </select>
            </div>
          </div>

          {editingStaff ? (
            <button 
              onClick={handleUpdateStaff}
              disabled={adding}
              className="w-full mt-6 bg-accent text-white font-bold py-3 rounded-xl hover:bg-accent/90 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {adding ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  جاري تعديل بيانات الموظف...
                </>
              ) : (
                <>
                  <ClipboardCheck size={18} />
                  تحديث بيانات عضو الطاقم
                </>
              )}
            </button>
          ) : (
            <button 
              onClick={handleAddStaff}
              disabled={adding}
              className="w-full mt-6 bg-accent text-white font-bold py-3 rounded-xl hover:bg-accent/90 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {adding ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  جاري الإضافة...
                </>
              ) : (
                <>
                  <Plus size={18} />
                  إضافة للطاقم وتفعيل الكود
                </>
              )}
            </button>
          )}
        </div>

        {/* QR Preview */}
        <div className="bg-card border border-border rounded-2xl p-6 flex flex-col items-center justify-center text-center">
          <h3 className="font-bold text-sm mb-6 w-full text-right flex items-center gap-2">
            <QrCode size={18} className="text-gold" />
            رمز QR الدخول السريع
          </h3>
          
          {selectedStaff ? (
            <div className="animate-in zoom-in duration-300">
              <div className="bg-white p-6 rounded-2xl shadow-2xl shadow-black/50 mb-6">
                <QRCodeSVG 
                  value={selectedStaff.national_id} 
                  size={180}
                  level="H"
                  includeMargin={false}
                />
              </div>
              <h4 className="font-display font-extrabold text-lg text-text">{selectedStaff.full_name}</h4>
              <p className="text-sm text-text3 mt-1">{getRoleInfo(selectedStaff.role).label} | {selectedStaff.national_id}</p>
              <button className="mt-6 px-8 py-2.5 bg-bg3 border border-border rounded-xl text-text2 font-bold hover:text-text transition-all">
                🖨️ طباعة بطاقة الدخول
              </button>
            </div>
          ) : (
            <div className="py-12 opacity-40">
              <Smartphone size={64} className="mx-auto mb-4 text-text3" />
              <p className="text-sm text-text3 font-medium">اختر موظفاً من القائمة لعرض رمز الدخول الخاص به</p>
            </div>
          )}
        </div>
      </div>

      {/* Staff Table */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-border flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <h3 className="font-bold text-sm">قائمة طاقم العمل</h3>
          </div>
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-text3" size={16} />
            <input 
              type="text" 
              placeholder="بحث عن موظف..." 
              className="bg-bg3 border border-border rounded-xl pr-10 pl-4 py-2 text-sm outline-none focus:border-accent w-64"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-right text-sm">
            <thead className="bg-bg3/50 text-text3 text-[10px] font-bold uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3">السجل المدني</th>
                <th className="px-6 py-3">الاسم</th>
                <th className="px-6 py-3">الجوال</th>
                <th className="px-6 py-3">الصلاحية</th>
                <th className="px-6 py-3">تاريخ الإضافة</th>
                <th className="px-6 py-3">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-10 text-center">
                    <Loader2 className="mx-auto animate-spin text-accent mb-2" size={32} />
                    <p className="text-xs text-text3">جاري تحميل بيانات الطاقم...</p>
                  </td>
                </tr>
              ) : filteredStaff.length > 0 ? filteredStaff.map((s, i) => {
                const roleInfo = getRoleInfo(s.role);
                return (
                  <tr 
                    key={s.id || i} 
                    className={cn(
                      "hover:bg-white/5 transition-colors cursor-pointer",
                      selectedStaff?.id === s.id && "bg-accent/5"
                    )}
                    onClick={() => setSelectedStaff(s)}
                  >
                    <td className="px-6 py-4 font-bold text-text">{s.national_id}</td>
                    <td className="px-6 py-4 text-text2">{s.full_name}</td>
                    <td className="px-6 py-4 text-text3 font-mono text-xs" dir="ltr">{s.phone || '—'}</td>
                    <td className="px-6 py-4">
                      <div className={cn("inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-[10px] font-bold border border-current/20", roleInfo.color)}>
                        <roleInfo.icon size={12} />
                        {roleInfo.label}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-text3 text-[10px]">
                      {s.created_at ? new Date(s.created_at).toLocaleDateString('ar-SA') : '—'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingStaff(s);
                            setFormData({
                              national_id: s.national_id,
                              full_name: s.full_name,
                              phone: s.phone || '',
                              role: s.role
                            });
                          }}
                          className="p-1.5 bg-bg3 text-text3 rounded-lg hover:text-accent transition-colors"
                          title="تعديل بيانات الموظف"
                        >
                          <Edit size={14} />
                        </button>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            if (s.id) handleDelete(s.id);
                          }}
                          className="p-1.5 bg-bg3 text-text3 rounded-lg hover:text-red transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              }) : (
                <tr>
                  <td colSpan={6} className="p-10 text-center text-text3">لا يوجد طاقم عمل مسجل حالياً</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
