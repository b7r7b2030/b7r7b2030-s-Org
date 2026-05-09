import React from 'react';

interface PrintLayoutProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

export const PrintLayout: React.FC<PrintLayoutProps> = ({ title, subtitle, children }) => {
  const today = new Date().toLocaleDateString('ar-SA');

  return (
    <div className="print-container bg-white text-black p-[2cm] min-h-[29.7cm] w-[21cm] mx-auto shadow-sm print:shadow-none print:m-0 print:p-[1.5cm] dir-rtl">
      {/* Official Header */}
      <div className="flex justify-between items-start mb-8 border-b-2 border-black pb-4">
        <div className="text-right space-y-1">
          <p className="font-bold text-lg">المملكة العربية السعودية</p>
          <p className="font-bold">وزارة التعليم</p>
          <p className="text-sm">إدارة التعليم بمحافظة ............</p>
          <p className="text-sm font-bold">مدرسة ........................</p>
        </div>
        <div className="text-center">
          <div className="w-20 h-20 bg-gray-100 border border-dashed border-gray-400 flex items-center justify-center text-[10px] text-gray-400 mb-2 mx-auto">
            شعار الوزارة
          </div>
          <h1 className="font-black text-xl underline underline-offset-8 decoration-2">{title}</h1>
          {subtitle && <p className="text-sm mt-2 text-gray-600 italic">{subtitle}</p>}
        </div>
        <div className="text-left text-sm space-y-1">
          <p><span className="font-bold">التاريخ:</span> {today}</p>
          <p><span className="font-bold">الوقت:</span> {new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}</p>
          <p><span className="font-bold">الصفحة:</span> 1 من 1</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="print-content">
        {children}
      </div>

      {/* Official Footer */}
      <div className="mt-12 grid grid-cols-3 gap-8 text-center text-sm font-bold pt-8 border-t border-gray-200">
        <div className="space-y-4">
          <p>معد التقرير</p>
          <div className="h-10 border-b border-gray-300 w-3/4 mx-auto"></div>
          <p className="text-xs font-normal">توقيع الموظف المختص</p>
        </div>
        <div className="space-y-4">
          <p>وكيل الشؤون التعليمية</p>
          <div className="h-10 border-b border-gray-300 w-3/4 mx-auto"></div>
          <p className="text-xs font-normal">............................</p>
        </div>
        <div className="space-y-4">
          <p>مدير المدرسة</p>
          <div className="h-10 border-b border-gray-300 w-3/4 mx-auto"></div>
          <p className="text-xs font-normal">............................</p>
        </div>
      </div>

      {/* Print Specific CSS */}
      <style>{`
        @media print {
          @page {
            size: A4;
            margin: 0;
          }
          body {
            background-color: white;
            padding: 0;
            margin: 0;
          }
          .no-print {
            display: none !important;
          }
          .print-container {
            width: 100% !important;
            height: auto !important;
            margin: 0 !important;
            padding: 1.5cm !important;
            box-shadow: none !important;
          }
        }
        .dir-rtl {
          direction: rtl;
          font-family: 'Cairo', sans-serif;
        }
      `}</style>
    </div>
  );
};
