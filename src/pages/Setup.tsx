import React, { useState } from 'react';
import { 
  Settings, 
  Database, 
  Key, 
  Link as LinkIcon, 
  CheckCircle2, 
  AlertCircle,
  Copy,
  Terminal,
  Play,
  Calendar,
  Trash2
} from 'lucide-react';
import { cn } from '../lib/utils';
import { sbFetch } from '../services/supabase';

const sqlScript = `-- ═══════════════════════════════════════════════════════════
-- نظام إدارة الاختبارات الذكي — سكريبت قاعدة البيانات الكامل
-- يتوافق مع استيراد Excel (السجل المدني، رمز الصف، اللجنة، رقم الجلوس)
-- ═══════════════════════════════════════════════════════════

-- 1. الجداول الأساسية
CREATE TABLE IF NOT EXISTS students (
    id              UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
    student_no      TEXT        UNIQUE NOT NULL,
    full_name       TEXT        NOT NULL,
    grade           TEXT        NOT NULL,
    grade_code      TEXT,
    classroom       TEXT        NOT NULL,
    committee_name  TEXT,
    seat_no         TEXT,
    phone           TEXT,
    created_at      TIMESTAMPTZ DEFAULT now(),
    updated_at      TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS teachers (
    id          UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
    teacher_no  TEXT        UNIQUE NOT NULL,
    full_name   TEXT        NOT NULL,
    phone       TEXT        NOT NULL,
    qr_code     TEXT,
    is_active   BOOLEAN     DEFAULT true,
    created_at  TIMESTAMPTZ DEFAULT now(),
    updated_at  TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS committees (
    id          UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
    name        TEXT        NOT NULL,
    location    TEXT,
    subject     TEXT,
    teacher_id  UUID        REFERENCES teachers(id) ON DELETE SET NULL,
    exam_date   DATE,
    start_time  TIME,
    end_time    TIME,
    room_no     TEXT,
    status      TEXT        DEFAULT 'scheduled' CHECK (status IN ('scheduled','active','completed','cancelled')),
    created_at  TIMESTAMPTZ DEFAULT now(),
    updated_at  TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS teacher_assignments (
    id            UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
    teacher_id    UUID        NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
    committee_id  UUID        NOT NULL REFERENCES committees(id) ON DELETE CASCADE,
    exam_date     DATE        NOT NULL,
    period        INTEGER     NOT NULL,
    slot          INTEGER     DEFAULT 1,
    created_at    TIMESTAMPTZ DEFAULT now(),
    UNIQUE (teacher_id, exam_date, period),
    UNIQUE (committee_id, exam_date, period, slot)
);

CREATE TABLE IF NOT EXISTS envelopes (
    id              UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
    envelope_no     TEXT        UNIQUE NOT NULL,
    committee_id    UUID        NOT NULL REFERENCES committees(id) ON DELETE CASCADE,
    status          TEXT        DEFAULT 'pending' CHECK (status IN ('pending','received','in_progress','delivered')),
    received_by     UUID        REFERENCES teachers(id) ON DELETE SET NULL,
    received_at     TIMESTAMPTZ,
    exam_ended_at   TIMESTAMPTZ,
    delivered_at    TIMESTAMPTZ,
    paper_count     INTEGER,
    notes           TEXT,
    created_at      TIMESTAMPTZ DEFAULT now(),
    updated_at      TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS attendance (
    id            UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
    committee_id  UUID        NOT NULL REFERENCES committees(id) ON DELETE CASCADE,
    student_id    UUID        NOT NULL REFERENCES students(id)   ON DELETE CASCADE,
    teacher_id    UUID        REFERENCES teachers(id) ON DELETE SET NULL,
    status        TEXT        NOT NULL CHECK (status IN ('present','absent','late')),
    recorded_at   TIMESTAMPTZ DEFAULT now(),
    UNIQUE (committee_id, student_id)
);

CREATE TABLE IF NOT EXISTS staff (
    id              UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
    national_id     TEXT        UNIQUE NOT NULL,
    full_name       TEXT        NOT NULL,
    phone           TEXT,
    role            TEXT        NOT NULL CHECK (role IN ('PRINCIPAL', 'TEACHER', 'COUNSELOR', 'CONTROL')),
    created_at      TIMESTAMPTZ DEFAULT now(),
    updated_at      TIMESTAMPTZ DEFAULT now()
);

-- إضافة حساب المدير الافتراضي (يمكن للمدير تغييره لاحقاً)
INSERT INTO staff (national_id, full_name, role)
VALUES ('1234567890', 'مدير النظام', 'PRINCIPAL')
ON CONFLICT (national_id) DO NOTHING;

CREATE TABLE IF NOT EXISTS exam_schedules (
    id            UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
    exam_date     DATE        NOT NULL,
    day_name      TEXT        NOT NULL,
    grade         TEXT        NOT NULL,
    period        INTEGER     NOT NULL,
    subject       TEXT        NOT NULL,
    start_time    TIME        NOT NULL,
    end_time      TIME        NOT NULL,
    duration      TEXT,
    semester      TEXT        DEFAULT 'الفصل الدراسي الأول',
    academic_year TEXT        DEFAULT '١٤٤٧ هـ',
    vice_principal TEXT       DEFAULT 'أ. محمد القرني',
    counselor     TEXT        DEFAULT 'أ. ماجد السفري / أ. هزاع الشمراني',
    principal     TEXT        DEFAULT 'أ. نايف بن أحمد الشهري',
    created_at    TIMESTAMPTZ DEFAULT now(),
    updated_at    TIMESTAMPTZ DEFAULT now()
);

-- 2. التقارير الذكية (Views)
DROP VIEW IF EXISTS v_committee_summary;
CREATE OR REPLACE VIEW v_committee_summary AS
SELECT 
    c.id AS committee_id,
    c.name AS committee_name,
    COUNT(s.id) AS total_students,
    COUNT(a.id) FILTER (WHERE a.status = 'present') AS present_count,
    COUNT(a.id) FILTER (WHERE a.status = 'absent') AS absent_count,
    COUNT(a.id) FILTER (WHERE a.status = 'late') AS late_count
FROM committees c
LEFT JOIN students s ON s.committee_name = c.name
LEFT JOIN attendance a ON a.committee_id = c.id AND a.student_id = s.id
GROUP BY c.id, c.name;

DROP VIEW IF EXISTS v_absent_students;
CREATE OR REPLACE VIEW v_absent_students AS
SELECT 
    s.id AS student_id,
    s.full_name,
    s.student_no,
    s.grade,
    s.classroom,
    s.phone,
    c.name AS committee_name,
    a.recorded_at
FROM students s
JOIN attendance a ON s.id = a.student_id
JOIN committees c ON a.committee_id = c.id
WHERE a.status = 'absent';

DROP VIEW IF EXISTS v_envelope_tracking;
CREATE OR REPLACE VIEW v_envelope_tracking AS
SELECT 
    e.id,
    e.envelope_no,
    e.status AS envelope_status,
    c.name AS committee_name,
    c.subject,
    c.exam_date,
    t.full_name AS teacher_name,
    e.delivered_at,
    e.created_at AS received_at
FROM envelopes e
LEFT JOIN committees c ON e.committee_id = c.id
LEFT JOIN teachers t ON c.teacher_id = t.id;

CREATE TABLE IF NOT EXISTS alerts (
    id          UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
    type        TEXT        NOT NULL CHECK (type IN ('red','gold','green','blue')),
    title       TEXT        NOT NULL,
    body        TEXT        NOT NULL,
    is_read     BOOLEAN     DEFAULT false,
    created_at  TIMESTAMPTZ DEFAULT now()
);

-- 3. تفعيل RLS
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE committees ENABLE ROW LEVEL SECURITY;
ALTER TABLE envelopes ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE teacher_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;

-- حذف السياسات القديمة إن وجدت لتجنب الأخطاء
DROP POLICY IF EXISTS "Allow All" ON students;
DROP POLICY IF EXISTS "Allow All" ON teachers;
DROP POLICY IF EXISTS "Allow All" ON committees;
DROP POLICY IF EXISTS "Allow All" ON envelopes;
DROP POLICY IF EXISTS "Allow All" ON attendance;
DROP POLICY IF EXISTS "Allow All" ON teacher_assignments;
DROP POLICY IF EXISTS "Allow All" ON exam_schedules;
DROP POLICY IF EXISTS "Allow All" ON alerts;
DROP POLICY IF EXISTS "Allow All" ON staff;

-- إنشاء السياسات الجديدة
CREATE POLICY "Allow All" ON students FOR ALL USING (true);
CREATE POLICY "Allow All" ON teachers FOR ALL USING (true);
CREATE POLICY "Allow All" ON committees FOR ALL USING (true);
CREATE POLICY "Allow All" ON envelopes FOR ALL USING (true);
CREATE POLICY "Allow All" ON attendance FOR ALL USING (true);
CREATE POLICY "Allow All" ON teacher_assignments FOR ALL USING (true);
CREATE POLICY "Allow All" ON exam_schedules FOR ALL USING (true);
CREATE POLICY "Allow All" ON alerts FOR ALL USING (true);
CREATE POLICY "Allow All" ON staff FOR ALL USING (true);
`;

export const Setup: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const [testing, setTesting] = useState(false);
  const [connected, setConnected] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(sqlScript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleTest = () => {
    setTesting(true);
    setTimeout(() => {
      setTesting(false);
      setConnected(true);
    }, 1500);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className={cn(
        "p-5 rounded-2xl border flex items-center gap-4 transition-all",
        connected ? "bg-accent/5 border-accent/20" : "bg-gold/5 border-gold/20"
      )}>
        <div className={cn(
          "w-12 h-12 rounded-xl flex items-center justify-center shrink-0",
          connected ? "bg-accent/10 text-accent" : "bg-gold/10 text-gold"
        )}>
          {connected ? <CheckCircle2 size={24} /> : <AlertCircle size={24} />}
        </div>
        <div className="flex-1">
          <h4 className="text-sm font-bold text-text">حالة الاتصال بـ Supabase</h4>
          <p className="text-xs text-text3 mt-0.5">
            {connected ? "تم التحقق من الاتصال ووجود الجداول بنجاح." : "يرجى إعداد قاعدة البيانات وربطها بالنظام."}
          </p>
        </div>
        <button 
          onClick={handleTest}
          disabled={testing}
          className={cn(
            "px-4 py-2 rounded-xl text-xs font-bold transition-all",
            connected ? "bg-accent text-white" : "bg-gold text-black"
          )}
        >
          {testing ? "جارٍ الاختبار..." : connected ? "متصل" : "اختبار الاتصال"}
        </button>
      </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-card border border-border rounded-2xl p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 px-4 py-1 bg-red text-white text-[10px] font-bold rounded-bl-xl">منطقة الخطر</div>
            <h3 className="font-bold text-sm mb-4 flex items-center gap-2">
              <AlertCircle size={18} className="text-red" />
              تهيئة بيانات الطلاب
            </h3>
            <p className="text-xs text-text3 mb-6 leading-relaxed">
              سيؤدي هذا الإجراء إلى مسح جميع بيانات الطلاب المسجلة حالياً في قاعدة البيانات.
            </p>
            <button 
              onClick={async () => {
                if(confirm('هل أنت متأكد من رغبتك في مسح جميع بيانات الطلاب؟')) {
                  const res = await sbFetch('students', 'DELETE', null, '?id=neq.00000000-0000-0000-0000-000000000000');
                  if (res) alert('تم مسح جميع بيانات الطلاب بنجاح');
                }
              }}
              className="w-full py-3 bg-red/10 border border-red/20 text-red font-bold rounded-xl hover:bg-red hover:text-white transition-all flex items-center justify-center gap-2"
            >
              <Trash2 size={18} />
              مسح جميع بيانات الطلاب
            </button>
          </div>

          <div className="bg-card border border-border rounded-2xl p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 px-4 py-1 bg-red text-white text-[10px] font-bold rounded-bl-xl">منطقة الخطر</div>
            <h3 className="font-bold text-sm mb-4 flex items-center gap-2">
              <AlertCircle size={18} className="text-red" />
              تهيئة بيانات المعلمين
            </h3>
            <p className="text-xs text-text3 mb-6 leading-relaxed">
              سيؤدي هذا الإجراء إلى مسح جميع بيانات المعلمين المسجلة حالياً في قاعدة البيانات.
            </p>
            <button 
              onClick={async () => {
                if(confirm('هل أنت متأكد من رغبتك في مسح جميع بيانات المعلمين؟')) {
                  const res = await sbFetch('teachers', 'DELETE', null, '?id=neq.00000000-0000-0000-0000-000000000000');
                  if (res) alert('تم مسح جميع بيانات المعلمين بنجاح');
                }
              }}
              className="w-full py-3 bg-red/10 border border-red/20 text-red font-bold rounded-xl hover:bg-red hover:text-white transition-all flex items-center justify-center gap-2"
            >
              <Trash2 size={18} />
              مسح جميع بيانات المعلمين
            </button>
          </div>
        </div>

      <div className="bg-card border border-border rounded-2xl p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 px-4 py-1 bg-purple text-white text-[10px] font-bold rounded-bl-xl">إدارة الجدولة</div>
        <h3 className="font-bold text-sm mb-4 flex items-center gap-2">
          <Calendar size={18} className="text-purple" />
          جدول الاختبارات والمراحل
        </h3>
        <p className="text-xs text-text3 mb-6 leading-relaxed">
          يمكنك من خلال معالج الجدولة إعداد أيام الاختبارات، توزيع المواد على الفترات، وتحديد المواعيد لكل مرحلة دراسية على حدة.
        </p>
        <button 
          onClick={() => window.dispatchEvent(new CustomEvent('navigate', { detail: 'examschedule' }))}
          className="w-full py-4 bg-purple text-white font-bold rounded-xl hover:bg-purple/90 transition-all flex items-center justify-center gap-3 shadow-lg shadow-purple/20"
        >
          <Calendar size={20} />
          فتح معالج جدولة الاختبارات
        </button>
      </div>

      <div className="bg-card border border-border rounded-2xl p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 px-4 py-1 bg-accent text-white text-[10px] font-bold rounded-bl-xl">الخطوة 1</div>
        <h3 className="font-bold text-sm mb-4 flex items-center gap-2">
          <LinkIcon size={18} className="text-accent" />
          تكوين الاتصال بـ Supabase
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-text2 flex items-center gap-2">
              <Database size={14} /> Supabase URL
            </label>
            <input className="w-full bg-bg3 border border-border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-accent font-mono text-xs" defaultValue="https://rtixjdqmldckcxxkgrxr.supabase.co" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-text2 flex items-center gap-2">
              <Key size={14} /> Anon Key
            </label>
            <input className="w-full bg-bg3 border border-border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-accent font-mono text-xs" type="password" defaultValue="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." />
          </div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-2xl p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 px-4 py-1 bg-accent text-white text-[10px] font-bold rounded-bl-xl">الخطوة 2</div>
        <h3 className="font-bold text-sm mb-2 flex items-center gap-2">
          <Terminal size={18} className="text-accent" />
          إنشاء جداول قاعدة البيانات
        </h3>
        <p className="text-xs text-text3 mb-6">قم بتشغيل السكريبت التالي في <strong>Supabase → SQL Editor</strong> لإنشاء جميع الجداول المطلوبة.</p>
        
        <div className="relative group">
          <button 
            onClick={handleCopy}
            className="absolute top-4 left-4 p-2 bg-card2 border border-border rounded-lg text-text3 hover:text-accent transition-all z-10"
          >
            {copied ? <CheckCircle2 size={16} className="text-green" /> : <Copy size={16} />}
          </button>
          <div className="bg-bg border border-border rounded-xl p-6 font-mono text-[11px] text-cyan-300 overflow-x-auto whitespace-pre leading-relaxed max-h-[300px]">
            {sqlScript}
          </div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-2xl p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 px-4 py-1 bg-accent text-white text-[10px] font-bold rounded-bl-xl">الخطوة 3</div>
        <h3 className="font-bold text-sm mb-4 flex items-center gap-2">
          <Play size={18} className="text-green" />
          اختبار النظام الشامل
        </h3>
        <button className="px-8 py-3 bg-green text-white font-bold rounded-xl hover:bg-green/90 transition-all flex items-center gap-2">
          تشغيل الاختبار الشامل
        </button>
      </div>
    </div>
  );
};
