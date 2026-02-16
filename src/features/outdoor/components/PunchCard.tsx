import React from 'react';
import { MapPin } from 'lucide-react';
import { formatTimeFromDateTime } from '@/core/utils/dateFormat';

interface PunchCardProps {
  type: 'in' | 'out';
  time: string | null;
  address: string | null;
}

export const PunchCard: React.FC<PunchCardProps> = ({ type, time, address }) => {
  const isPunchIn = type === 'in';
  const bgColor = isPunchIn ? 'bg-green-50' : 'bg-blue-50';
  const borderColor = isPunchIn ? 'border-green-100' : 'border-blue-100';
  const dotColor = isPunchIn ? 'bg-green-500' : 'bg-blue-500';
  const textColor = isPunchIn ? 'text-green-700' : 'text-blue-700';
  const label = isPunchIn ? 'Punch In' : 'Punch Out';

  return (
    <div className={`p-3 ${bgColor} rounded-lg border ${borderColor}`}>
      <div className="flex items-center gap-2 mb-1">
        <div className={`w-2 h-2 ${dotColor} rounded-full`}></div>
        <p className={`text-xs font-semibold ${textColor} uppercase`}>{label}</p>
      </div>
      <p className="text-sm font-medium text-gray-900 mb-1">
        {formatTimeFromDateTime(time) || '-'}
      </p>
      {address && (
        <p className="text-xs text-gray-600 flex items-start gap-1">
          <MapPin className="w-3 h-3 mt-0.5 flex-shrink-0" />
          <span className="line-clamp-2">{address}</span>
        </p>
      )}
    </div>
  );
};








