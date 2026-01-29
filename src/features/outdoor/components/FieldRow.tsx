import React from 'react';

interface FieldRowProps {
  label: string;
  value: React.ReactNode;
}

export const FieldRow: React.FC<FieldRowProps> = ({ label, value }) => (
  <div className="flex items-start gap-2.5 p-3">
    <div className="flex-1">
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-0.5">{label}</p>
      <div className="text-sm font-medium text-gray-900">{value}</div>
    </div>
  </div>
);








