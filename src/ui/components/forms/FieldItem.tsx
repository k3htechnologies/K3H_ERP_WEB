export const FieldItem: React.FC<{ label: string; value?: any, isRow?: boolean, className?: string, withBorder?: boolean }> = ({ label, value, isRow, className, withBorder }) => {

  const displayValue = value && value !== '' ? value : '-';
  const borderClass = withBorder ? 'border-b border-gray-200' : '';
  
  if (isRow) {
    // Row Layout
    return (
      <div className={`flex justify-between items-start py-2 ${borderClass}`}>
        <span className="text-sm font-medium text-gray-700">{label}</span>
        <span className={`text-sm text-blue-600 font-medium text-left break-words whitespace-normal max-w-[400px] ${className}`}>
          {displayValue}
        </span>
      </div>
    );
  }

  // Column Layout
  return (
    <div className="flex flex-col">
      <span className="text-md font-medium text-gray-500">{label}</span>
      <span className={`mt-1 text-sm text-blue-600 font-medium ${className}`}>
        {displayValue}
      </span>
    </div>
  );
}
