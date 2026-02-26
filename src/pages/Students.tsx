import React, { useState, useEffect, useRef } from 'react';
import * as XLSX from 'xlsx';
import { 
  Users, 
  Upload, 
  Download, 
  Search, 
  Plus, 
  Trash2, 
  Edit, 
  Phone,
  Filter,
  MoreVertical,
  Info,
  Loader2,
  FileSpreadsheet
} from 'lucide-react';
import { cn } from '../lib/utils';
import { Student } from '../types';
import { sbFetch } from '../services/supabase';

export const Students: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('الكل');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form state
  const [formData, setFormData] = useState({
    student_no: '',
    full_name: '',
    grade: 'الأول',
    classroom: '',
    phone: ''
  });

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    setLoading(true);
    const data = await sbFetch<Student>('students', 'GET', null, '?select=*&order=full_name');
    if (data) {
      setStudents(data);
    }
    setLoading(false);
  };

  const handleAddStudent = async () => {
    if (!formData.student_no || !formData.full_name) {
      alert('يرجى تعبئة الحقول الإلزامية');
      return;
    }

    const res = await sbFetch<Student>('students', 'POST', formData);
    if (res) {
      alert('تم إضافة الطالب بنجاح');
      setFormData({ student_no: '', full_name: '', grade: 'الأول', classroom: '', phone: '' });
      fetchStudents();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا الطالب؟')) return;
    const res = await sbFetch('students', 'DELETE', null, `?id=eq.${id}`);
    if (res) {
      fetchStudents();
    }
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
        
        // Convert sheet to JSON (array of arrays)
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];
        
        // Skip header row and map data
        const studentsToImport = jsonData.slice(1).map(row => ({
          student_no: String(row[1] || '').trim(), // السجل المدني (Column B)
          full_name: String(row[2] || '').trim(), // اسم الطالب (Column C)
          grade: String(row[3] || '').trim(), // الصف (Column D)
          grade_code: String(row[4] || '').trim(), // رمز الصف (Column E)
          classroom: String(row[5] || '').trim(), // الفصل (Column F)
          committee_name: String(row[6] || '').trim(), // اللجنة (Column G)
          seat_no: String(row[7] || '').trim(), // رقم الجلوس (Column H)
        })).filter(s => s.student_no && s.full_name);

        if (studentsToImport.length === 0) {
          alert('الملف فارغ أو لا يحتوي على بيانات صحيحة');
          setImporting(false);
          return;
        }

        let successCount = 0;
        // Batch insert would be better, but sbFetch currently does single POST
        // Let's do them in chunks or one by one for now as per previous logic
        for (const student of studentsToImport) {
          const res = await sbFetch('students', 'POST', student);
          if (res) successCount++;
        }

        alert(`تم استيراد ${successCount} طالب بنجاح من أصل ${studentsToImport.length}`);
      } catch (error) {
        console.error("Excel parsing error:", error);
        alert('حدث خطأ أثناء قراءة ملف Excel. تأكد من الصيغة الصحيحة.');
      } finally {
        setImporting(false);
        fetchStudents();
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };

    reader.readAsArrayBuffer(file);
  };

  const filteredStudents = students.filter(s => {
    const matchesSearch = s.full_name.includes(search) || s.student_no.includes(search);
    const matchesFilter = filter === 'الكل' || s.grade === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Import Section */}
        <div className="bg-card border border-border rounded-2xl p-6">
          <h3 className="font-bold text-sm mb-4 flex items-center gap-2">
            <FileSpreadsheet size={18} className="text-accent" />
            استيراد بيانات الطلاب (Excel)
          </h3>
          
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
            accept=".xlsx, .xls, .csv" 
            className="hidden" 
          />

          <div 
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              "border-2 border-dashed border-border rounded-2xl p-10 text-center cursor-pointer hover:bg-accent/5 hover:border-accent transition-all group",
              importing && "pointer-events-none opacity-50"
            )}
          >
            <div className="w-16 h-16 bg-bg3 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
              {importing ? (
                <Loader2 size={32} className="text-accent animate-spin" />
              ) : (
                <FileSpreadsheet size={32} className="text-text3 group-hover:text-accent" />
              )}
            </div>
            <h4 className="font-bold text-text mb-2">
              {importing ? 'جاري الاستيراد...' : 'رفع ملف Excel (XLSX)'}
            </h4>
            <p className="text-xs text-text3 max-w-xs mx-auto">يدعم ملفات .xlsx و .xls و .csv</p>
          </div>
          
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-border"></span></div>
            <div className="relative flex justify-center text-xs uppercase"><span className="bg-card px-2 text-text3">أو إضافة يدوية</span></div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-text2">رقم الطالب *</label>
              <input 
                className="w-full bg-bg3 border border-border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-accent" 
                placeholder="مثال: 20241001"
                value={formData.student_no}
                onChange={(e) => setFormData({...formData, student_no: e.target.value})}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-text2">اسم الطالب *</label>
              <input 
                className="w-full bg-bg3 border border-border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-accent" 
                placeholder="الاسم الرباعي"
                value={formData.full_name}
                onChange={(e) => setFormData({...formData, full_name: e.target.value})}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-text2">الصف *</label>
              <select 
                className="w-full bg-bg3 border border-border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-accent"
                value={formData.grade}
                onChange={(e) => setFormData({...formData, grade: e.target.value})}
              >
                <option>الأول</option><option>الثاني</option><option>الثالث</option>
                <option>الرابع</option><option>الخامس</option><option>السادس</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-text2">الفصل *</label>
              <input 
                className="w-full bg-bg3 border border-border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-accent" 
                placeholder="مثال: A"
                value={formData.classroom}
                onChange={(e) => setFormData({...formData, classroom: e.target.value})}
              />
            </div>
            <div className="col-span-2 space-y-1.5">
              <label className="text-xs font-bold text-text2">رقم الجوال</label>
              <input 
                className="w-full bg-bg3 border border-border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-accent" 
                placeholder="+966 5xxxxxxxx"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
              />
            </div>
          </div>
          <button 
            onClick={handleAddStudent}
            className="w-full mt-6 bg-accent text-white font-bold py-3 rounded-xl hover:bg-accent/90 transition-all flex items-center justify-center gap-2"
          >
            <Plus size={18} />
            إضافة طالب
          </button>
        </div>

        {/* Instructions */}
        <div className="bg-card border border-border rounded-2xl p-6">
          <h3 className="font-bold text-sm mb-4 flex items-center gap-2">
            <Info size={18} className="text-gold" />
            تعليمات الاستيراد
          </h3>
          <div className="bg-accent/5 border border-accent/10 rounded-xl p-4 mb-6">
            <h4 className="text-xs font-bold text-accent2 flex items-center gap-2 mb-1">
              <Info size={14} />
              ترتيب أعمدة Excel
            </h4>
            <p className="text-[11px] text-text2">يجب أن تكون الأعمدة بالترتيب التالي في الملف لضمان الاستيراد الصحيح.</p>
          </div>
          
          <div className="overflow-hidden border border-border rounded-xl">
            <table className="w-full text-right text-xs">
              <thead className="bg-bg3 text-text3 font-bold">
                <tr>
                  <th className="px-4 py-2">العمود</th>
                  <th className="px-4 py-2">اسم الحقل</th>
                  <th className="px-4 py-2">مثال</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {[
                  { col: 'A', name: 'م', ex: '1' },
                  { col: 'B', name: 'السجل المدني', ex: '1023456789' },
                  { col: 'C', name: 'اسم الطالب', ex: 'أحمد محمد علي' },
                  { col: 'D', name: 'الصف', ex: 'الأول الثانوي' },
                  { col: 'E', name: 'رمز الصف', ex: '101' },
                  { col: 'F', name: 'الفصل', ex: '1' },
                  { col: 'G', name: 'اللجنة', ex: 'لجنة 1' },
                  { col: 'H', name: 'رقم الجلوس', ex: '5001' },
                ].map((row, i) => (
                  <tr key={i}>
                    <td className="px-4 py-2 font-bold text-accent">{row.col}</td>
                    <td className="px-4 py-2 text-text">{row.name}</td>
                    <td className="px-4 py-2 text-text3">{row.ex}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <button className="w-full mt-6 bg-bg3 border border-border text-text2 font-bold py-3 rounded-xl hover:bg-card hover:text-text transition-all flex items-center justify-center gap-2">
            <Download size={18} />
            تحميل قالب Excel
          </button>
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-border flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h3 className="font-bold text-sm">قائمة الطلاب</h3>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex bg-bg3 p-1 rounded-xl border border-border">
              {['الكل', 'الأول', 'الثاني', 'الثالث', 'الرابع'].map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={cn(
                    "px-4 py-1.5 rounded-lg text-xs font-bold transition-all",
                    filter === f ? "bg-accent text-white shadow-lg" : "text-text3 hover:text-text"
                  )}
                >
                  {f}
                </button>
              ))}
            </div>
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-text3" size={16} />
              <input 
                type="text" 
                placeholder="بحث..." 
                className="bg-bg3 border border-border rounded-xl pr-10 pl-4 py-2 text-sm outline-none focus:border-accent w-64"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-20 text-center">
              <Loader2 className="mx-auto animate-spin text-accent mb-4" size={40} />
              <p className="text-text3 text-sm">جاري تحميل بيانات الطلاب...</p>
            </div>
          ) : (
            <table className="w-full text-right text-sm">
              <thead className="bg-bg3/50 text-text3 text-[10px] font-bold uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3">السجل المدني</th>
                  <th className="px-6 py-3">اسم الطالب</th>
                  <th className="px-6 py-3">الصف</th>
                  <th className="px-6 py-3">الفصل</th>
                  <th className="px-6 py-3">اللجنة</th>
                  <th className="px-6 py-3">رقم الجلوس</th>
                  <th className="px-6 py-3">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {filteredStudents.length > 0 ? filteredStudents.map((s, i) => (
                  <tr key={i} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 font-bold text-text">{s.student_no}</td>
                    <td className="px-6 py-4 text-text2">{s.full_name}</td>
                    <td className="px-6 py-4 text-text2">{s.grade}</td>
                    <td className="px-6 py-4 text-text2">{s.classroom}</td>
                    <td className="px-6 py-4 text-text2">{s.committee_name || '—'}</td>
                    <td className="px-6 py-4 text-accent font-bold">{s.seat_no || '—'}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button className="p-1.5 bg-bg3 text-text3 rounded-lg hover:text-accent transition-colors"><Edit size={14} /></button>
                        <button 
                          onClick={() => s.id && handleDelete(s.id)}
                          className="p-1.5 bg-bg3 text-text3 rounded-lg hover:text-red transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={7} className="p-10 text-center text-text3">لا يوجد طلاب مسجلين حالياً</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
