export const FieldItem: React.FC<{ label: string; value?: any }> = ({ label, value }) => (
  <div className="flex flex-col">
    <span className="text-xs font-medium text-gray-500">{label}</span>
    <span className="mt-1 text-sm text-gray-900 font-medium">
      {value && value !== '' ? value : '-'}
    </span>
  </div>
)
