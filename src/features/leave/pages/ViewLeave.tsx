import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import type { LeaveData } from '@/features/leave/models/LeaveModel';
import { FieldItem } from '@/ui/components/forms/FieldItem';
import { Button } from '@/ui/components/forms/Button';
import { formatDate_dd_MonthName_yy_hh_mm } from '@/core/utils/dateFormat';
import { ChevronLeft, Edit, Calendar } from 'lucide-react';
import { MultiImageViewer } from '@/ui/components/ImageViewer/ImageViewer';
import { parseDocumentUrls } from '@/core/utils/documentUtils';

const formatDateWithWeekday = (dateString: string | null): string => {
  if (!dateString) return '-';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '-';
    
    const day = date.getDate();
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    const month = monthNames[date.getMonth()];
    const year = date.getFullYear();
    const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const weekday = weekdays[date.getDay()];
    
    return `${day} ${month} ${year}, ${weekday}`;
  } catch {
    return '-';
  }
};

const ViewLeave: React.FC = () => {
  const location = useLocation() as { state?: { data?: LeaveData | null } };
  const navigate = useNavigate();
  const data = location.state?.data ?? null;

  if (!data) {
    return (
      <div className="p-6">
        <div className="bg-white border border-gray-200 rounded p-6 shadow-sm text-center">
          <p className="text-gray-600 mb-4">No leave record to view.</p>
          <Button onClick={() => navigate(-1)} color="blue" size="sm">
            Back
          </Button>
        </div>
      </div>
    );
  }

  const handleEdit = () => {
    navigate(`/leave/add/${data.LeaveId}`, {
      state: { data: data },
    });
  };

  return (
    <div className="p-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <ChevronLeft 
              className="w-6 h-6 text-blue-600 cursor-pointer hover:text-blue-800 transition-colors"
              onClick={() => navigate(-1)}
            />
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">Leave</h2>
              <p className="text-sm text-gray-500 mt-1">Manage and organize company leave records</p>
            </div>
          </div>
        </div>

        {/* Leave Section */}
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          {/* Section Header */}
          <div className="flex items-center justify-between p-4 bg-gray-50 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold text-gray-900">Leave</h3>
              <ChevronLeft className="w-4 h-4 text-gray-400 rotate-90" />
            </div>
          </div>

          {/* Date Display */}
          {data.StartDate && (
            <div className="px-4 pt-4 pb-3 flex items-center gap-2 text-gray-600">
              <Calendar className="w-4 h-4" />
              <span className="text-sm">{formatDateWithWeekday(data.StartDate)}</span>
            </div>
          )}

          {/* Two Column Grid */}
          <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-4">
              <FieldItem 
                label="Leave Type" 
                value={data.LeaveType || '-'} 
                isRow={false}
              />
              <FieldItem 
                label="Start Date" 
                value={formatDateWithWeekday(data.StartDate)} 
                isRow={false}
              />
              <FieldItem 
                label="Start Duration" 
                value={data.StartDateLeaveDuration || '-'} 
                isRow={false}
              />
              <FieldItem 
                label="No Of Days" 
                value={data.NoOfDays?.toString() || '0'} 
                isRow={false}
              />
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              <FieldItem 
                label="Leave Type Code" 
                value={data.LeaveTypeCode || '-'} 
                isRow={false}
              />
              <FieldItem 
                label="End Date" 
                value={formatDateWithWeekday(data.EndDate)} 
                isRow={false}
              />
              <FieldItem 
                label="End Duration" 
                value={data.EndDateLeaveDuration || '-'} 
                isRow={false}
              />
              <FieldItem 
                label="Reason" 
                value={data.Reason || '-'} 
                isRow={false}
              />
            </div>
          </div>

          {/* Leave Documents */}
          {data.LeaveDocumentURL && (
            <div className="px-4 pb-4">
              <FieldItem 
                label="Leave Documents" 
                value="" 
                isRow={false}
              />
              <div className="mt-2">
                <MultiImageViewer
                  images={parseDocumentUrls(data.LeaveDocumentURL)}
                  title="Leave Documents"
                  size="lg"
                />
              </div>
            </div>
          )}

          {/* Action Details */}
          <div className="px-4 pb-4 pt-4 border-t border-gray-200">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">Action Details</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FieldItem
                label="Created By"
                value={data.CreatedBy || '-'}
                isRow={false}
              />
              <FieldItem
                label="Created Date"
                value={formatDate_dd_MonthName_yy_hh_mm(data.CreatedDate || '-')}
                isRow={false}
              />
              {data.ModifiedBy && (
                <>
                  <FieldItem
                    label="Modified By"
                    value={data.ModifiedBy}
                    isRow={false}
                  />
                  <FieldItem
                    label="Modified Date"
                    value={formatDate_dd_MonthName_yy_hh_mm(data.ModifiedDate || '-')}
                    isRow={false}
                  />
                </>
              )}
            </div>
          </div>

          {/* Edit Button */}
          <div className="px-4 pb-4 flex justify-end">
            <Button
              onClick={handleEdit}
              color="blue"
              size="sm"
              leftIcon={<Edit className="w-4 h-4" />}
            >
              Edit
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewLeave;
