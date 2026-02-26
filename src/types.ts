export enum UserRole {
  PRINCIPAL = 'PRINCIPAL',
  TEACHER = 'TEACHER',
  COUNSELOR = 'COUNSELOR'
}

export interface User {
  id: string;
  name: string;
  role: UserRole;
  teacher_id?: string; // For teachers to link to their records
}

export interface ExamSchedule {
  id: string;
  grade: string;
  days_count: number;
  committees_count: number;
  subjects: {
    name: string;
    start_time: string;
    end_time: string;
  }[];
}

export interface Student {
  id?: string;
  student_no: string;
  full_name: string;
  grade: string;
  classroom: string;
  phone?: string;
  created_at?: string;
}

export interface Teacher {
  id?: string;
  teacher_no: string;
  full_name: string;
  phone: string;
  qr_code?: string;
  created_at?: string;
}

export interface Committee {
  id?: string;
  name: string;
  subject: string;
  teacher_id?: string;
  teacher_name?: string;
  exam_date: string;
  start_time: string;
  end_time: string;
  student_count?: number;
  present_count?: number;
  created_at?: string;
}

export interface Envelope {
  id?: string;
  envelope_no: string;
  committee_id: string;
  committee_name?: string;
  subject?: string;
  status: 'pending' | 'received' | 'in_progress' | 'delivered';
  received_by?: string;
  teacher_name?: string;
  received_at?: string;
  delivered_at?: string;
  created_at?: string;
}

export interface AttendanceRecord {
  id?: string;
  committee_id: string;
  student_id: string;
  student_name?: string;
  status: 'present' | 'absent' | 'late';
  recorded_at?: string;
  notes?: string;
}

export interface Alert {
  id: string;
  type: 'red' | 'gold' | 'green' | 'blue';
  title: string;
  body: string;
  is_read: boolean;
  created_at: string;
}
