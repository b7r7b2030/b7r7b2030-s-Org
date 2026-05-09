import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  MapPin, 
  User, 
  Save, 
  Settings as SettingsIcon,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { sbFetch } from '../services/supabase';
import { cn } from '../lib/utils';

export const GeneralSettings: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [schoolInfo, setSchoolInfo] = useState({
    school_name: '',
    district: '',
    principal: '',
    logo_url: ''
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    const res = await sbFetch<{data: any}>('settings', 'GET', null, '?id=eq.school_info');
    if (res && res.length > 0) {
      setSchoolInfo(res[0].data);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    setSaveStatus('saving');
    try {
      const res = await sbFetch('settings', 'PATCH', {
        data: schoolInfo,
        updated_at: new Date().toISOString()
      }, '?id=eq.school_info');
      
      if (res) {
        setSaveStatus('success');
        setTimeout(() => setSaveStatus('idle'), 3000);
      } else {
        setSaveStatus('error');
      }
    } catch (error) {
      setSaveStatus('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="bg-card border-2 border-border rounded-[2.5rem] overflow-hidden shadow-sm">
        <div className="p-8 border-b border-border bg-bg3/30 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-accent/10 text-accent rounded-2xl flex items-center justify-center">
              <Building2 size={24} />
            </div>
            <div>
              <h2 className="text-xl font-black text-text">بيانات المنشأة التعليمية</h2>
              <p className="text-sm text-text3 font-medium">تخصيص البيانات التي تظهر في جميع التقارير والمحاضر الرسمية</p>
            </div>
          </div>
          
          <button
            onClick={handleSave}
            disabled={loading}
            className={cn(
              "flex items-center gap-2 px-8 py-3 rounded-2xl font-bold transition-all shadow-lg active:scale-95 disabled:opacity-50",
              saveStatus === 'success' ? "bg-green text-white" : "bg-accent text-white shadow-accent/20 hover:scale-105"
            )}
          >
            {saveStatus === 'saving' ? <SettingsIcon className="animate-spin" /> : 
             saveStatus === 'success' ? <CheckCircle2 /> : <Save size={20} />}
            {saveStatus === 'saving' ? 'جاري الحفظ...' : 
             saveStatus === 'success' ? 'تم الحفظ بنجاح' : 'حفظ التعديلات'}
          </button>
        </div>

        <div className="p-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-xs font-black text-text3 uppercase px-1">اسم المدرسة</label>
              <div className="relative group">
                <Building2 className="absolute right-4 top-1/2 -translate-y-1/2 text-text3 group-focus-within:text-accent transition-colors" size={20} />
                <input
                  type="text"
                  value={schoolInfo.school_name}
                  onChange={(e) => setSchoolInfo({...schoolInfo, school_name: e.target.value})}
                  className="w-full bg-bg3 border-2 border-border rounded-2xl pr-12 pl-4 py-4 font-bold outline-none focus:border-accent transition-all"
                  placeholder="مثال: مدرسة التميز الثانوية"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-text3 uppercase px-1">إدارة التعليم / المنطقة</label>
              <div className="relative group">
                <MapPin className="absolute right-4 top-1/2 -translate-y-1/2 text-text3 group-focus-within:text-accent transition-colors" size={20} />
                <input
                  type="text"
                  value={schoolInfo.district}
                  onChange={(e) => setSchoolInfo({...schoolInfo, district: e.target.value})}
                  className="w-full bg-bg3 border-2 border-border rounded-2xl pr-12 pl-4 py-4 font-bold outline-none focus:border-accent transition-all"
                  placeholder="مثال: إدارة تعليم منطقة الرياض"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-text3 uppercase px-1">اسم مدير المدرسة</label>
              <div className="relative group">
                <User className="absolute right-4 top-1/2 -translate-y-1/2 text-text3 group-focus-within:text-accent transition-colors" size={20} />
                <input
                  type="text"
                  value={schoolInfo.principal}
                  onChange={(e) => setSchoolInfo({...schoolInfo, principal: e.target.value})}
                  className="w-full bg-bg3 border-2 border-border rounded-2xl pr-12 pl-4 py-4 font-bold outline-none focus:border-accent transition-all"
                  placeholder="مثال: أ. محمد بن خالد"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-text3 uppercase px-1">رابط الشعار الرسمي</label>
              <div className="relative group">
                <ImageIcon className="absolute right-4 top-1/2 -translate-y-1/2 text-text3 group-focus-within:text-accent transition-colors" size={20} />
                <input
                  type="text"
                  value={schoolInfo.logo_url}
                  onChange={(e) => setSchoolInfo({...schoolInfo, logo_url: e.target.value})}
                  className="w-full bg-bg3 border-2 border-border rounded-2xl pr-12 pl-4 py-4 font-bold outline-none focus:border-accent transition-all"
                  placeholder="رابط صورة PNG للشعار"
                />
              </div>
            </div>
          </div>

          <div className="p-6 bg-gold/5 border-2 border-gold/20 rounded-3xl flex items-start gap-4">
            <AlertCircle className="text-gold shrink-0 mt-1" size={20} />
            <div className="space-y-1">
              <p className="text-sm font-bold text-text">تنبيه مهني</p>
              <p className="text-xs text-text3 leading-relaxed">
                هذه البيانات يتم تضمينها تلقائياً في الجزء العلوي من كافة الفواتير، الكشوف، والمحاضر التي يتم طباعتها. تأكد من دقة البيانات لضمان رسمية المستندات المستخرجة.
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-card border-2 border-border p-8 rounded-[2.5rem] space-y-4">
          <h3 className="font-black text-lg">تحويل النظام إلى تطبيق (PWA)</h3>
          <p className="text-sm text-text3 leading-relaxed">
            يمكنك تثبيت النظام على سطح المكتب أو الجوال ليعمل كتطبيق مستقل. هذا يضمن وصولاً أسرع واستقراراً أعلى في الأداء.
          </p>
          <div className="pt-2">
            <button className="px-6 py-3 bg-bg3 border-2 border-border rounded-xl text-xs font-bold hover:border-accent transition-all">تفعيل الإشعارات المكتبية</button>
          </div>
        </div>
        
        <div className="bg-card border-2 border-border p-8 rounded-[2.5rem] space-y-4">
          <h3 className="font-black text-lg">النسخ الاحتياطي السحابي</h3>
          <p className="text-sm text-text3 leading-relaxed">
            يتم تشفير وتخزين البيانات سحابياً بشكل لحظي. يمكنك استيراد قاعدة البيانات بالكامل بصيغة JSON لأغراض الأرشفة الورقية.
          </p>
          <div className="pt-2">
            <button className="px-6 py-3 bg-bg3 border-2 border-border rounded-xl text-xs font-bold hover:border-accent transition-all">تصدير كافة البيانات (Excel/JSON)</button>
          </div>
        </div>
      </div>
    </div>
  );
};
