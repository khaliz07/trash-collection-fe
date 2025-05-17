import React from 'react';

interface ReportSidebarProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export function ReportSidebar({ open, onClose, title, children }: ReportSidebarProps) {
  return (
    <div className={`fixed inset-0 z-50 transition-all ${open ? '' : 'pointer-events-none'}`}>
      {/* Overlay */}
      <div
        className={`absolute inset-0 bg-black/30 transition-opacity duration-300 ${open ? 'opacity-100' : 'opacity-0'}`}
        onClick={onClose}
      />
      {/* Sidebar */}
      <div
        className={`absolute right-0 top-0 h-full w-full sm:w-[900px] bg-white shadow-lg transition-transform duration-300 ${open ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="flex items-center justify-between p-4 border-b">
          <div className="font-semibold text-lg">{title}</div>
          <button onClick={onClose} className="text-gray-500 hover:text-primary text-xl">×</button>
        </div>
        <div className="p-4 overflow-y-auto h-[calc(100%-56px)]">{children}</div>
      </div>
    </div>
  );
}
