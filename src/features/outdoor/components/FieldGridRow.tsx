import React from 'react';

interface FieldGridRowProps {
  children: React.ReactNode;
  withBorder?: boolean;
}

export const FieldGridRow: React.FC<FieldGridRowProps> = ({ children, withBorder = true }) => (
  <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 ${withBorder ? 'border-b border-gray-200' : ''}`}>
    {children}
  </div>
);








