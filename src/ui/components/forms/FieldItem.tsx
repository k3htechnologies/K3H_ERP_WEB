export const FieldItem: React.FC<{ label: string; value?: any, isRow?: boolean,className?:string }> = ({ label, value, isRow,className }) => {

  const displayValue = value && value !== '' ? value : '-';

  if (isRow) {
    // Row Layout
    return (
      <div className="flex justify-between items-start py-2 border-b border-gray-200">
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
      <span className={`mt-1 text-sm text-gray-900 font-medium ${className}`}>
        {displayValue}
      </span>
    </div>
  );
}
