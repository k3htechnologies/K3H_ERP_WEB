import React from 'react';
import { Loader } from '@/core/utils/loader';
import { FieldItem } from '@/ui/components/forms/FieldItem';
import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import type { OutDoorMasterData } from '../models/OutDoorModel';
import { formatDate_dd_MonthName_yy_hh_mm } from '@/core/utils/dateFormat';
import { MultiImageViewer } from '@/ui/components/ImageViewer/ImageViewer';
import { ArrowLeft, Edit } from 'lucide-react';
import { Button } from '@/ui/components/forms';

export const ViewOutDoor: React.FC = () => {
  const [isLoading] = useState(false);
  const [loadingMessage] = useState('');
  
  const navigate = useNavigate();
  const location = useLocation() as {
    state?: {
      editOutDoorData?: OutDoorMasterData | null;
      fromList?: boolean;
      listState?: {
        page: number;
        filters: Record<string, unknown>;
      };
    };
  };

  const editOutDoorData = (location.state?.editOutDoorData ?? null) as OutDoorMasterData | null;

  const handleEditOutDoor = () => {
    if (editOutDoorData) {
      navigate(`/outDoor/add/${editOutDoorData.OutdoorId}`, {
        state: {
          editOutDoorData: editOutDoorData,
          fromList: true,
        },
      });
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  if (!editOutDoorData) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="text-center py-8">
          <p className="text-gray-500">No outdoor data available</p>
          <Button
            color="blue"
            size="md"
            onClick={handleBack}
            className="mt-4"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to List
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <Loader loading={isLoading} title={loadingMessage}>
        <div></div>
      </Loader>

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-5">
          <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
            <div className="pt-10 px-6 pb-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900">
                  {editOutDoorData.CompanyName || 'OutDoor Visit'} 
                  <span className="inline-block ml-2 text-green-500">●</span>
                </h3>
                <div className="mt-2 flex justify-center gap-2">
                  <span className="text-xs bg-gray-100 px-2 py-1 rounded-full text-gray-700">
                    {editOutDoorData.OutDoorDate || 'N/A'}
                  </span>
                  <span className="text-xs bg-gray-100 px-2 py-1 rounded-full text-gray-700">
                    {editOutDoorData.OutDoorTime || 'N/A'}
                  </span>
                </div>
              </div>

              <div className="mt-6 rounded">
                <h4 className="font-semibold text-sm text-gray-800 mb-3">Basic Information</h4>
                <FieldItem label="OutDoor Date" value={editOutDoorData.OutDoorDate || 'N/A'} isRow />
                <FieldItem label="OutDoor Time" value={editOutDoorData.OutDoorTime || 'N/A'} isRow />
                <FieldItem label="Company Name" value={editOutDoorData.CompanyName || 'N/A'} isRow />
                <FieldItem label="Company Address" value={editOutDoorData.CompanyAddress || 'N/A'} isRow />
                <FieldItem label="Purpose" value={editOutDoorData.Purpose || 'N/A'} isRow />
                <FieldItem label="Conclusion" value={editOutDoorData.Conclusion || 'N/A'} isRow />
              </div>

              <div className="mt-4 flex gap-3">
                <Button
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    handleEditOutDoor()
                  }}
                  color='blue'
                  fullWidth
                  size='sm'
                  title="Edit Info">
                  <Edit className="w-4 h-4" /> Edit Info
                </Button>
                <Button 
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    handleBack()
                  }}
                  color='transparent'
                  variant='transparent_border'
                  fullWidth
                  size='sm'
                  title="Back">
                  <ArrowLeft className="w-4 h-4" /> Cancel
                </Button>
              </div>

              <div className="mt-6 rounded">
                <h4 className="font-semibold text-sm text-gray-800 mb-3">Team Details</h4>
                <FieldItem label="Department" value={editOutDoorData .DepartmentName|| 'N/A'} isRow />
                <FieldItem label="Accompanied By" value={editOutDoorData.AccompaniedById || 'N/A'} isRow />
              </div>

              <div className="mt-6 rounded">
                <h4 className="font-semibold text-sm text-gray-800 mb-3">Action Details</h4>
                <FieldItem label="Created By" value={editOutDoorData.CreatedBy || 'N/A'} isRow />
                <FieldItem 
                  label="Created Date" 
                  value={formatDate_dd_MonthName_yy_hh_mm(editOutDoorData.CreatedDate || '-')} 
                  isRow 
                />
                {editOutDoorData.ModifiedBy && (
                  <>
                    <FieldItem label="Modified By" value={editOutDoorData.ModifiedBy} isRow />
                    <FieldItem 
                      label="Modified Date" 
                      value={formatDate_dd_MonthName_yy_hh_mm(editOutDoorData.ModifiedDate || '-')} 
                      isRow 
                    />
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="col-span-7 space-y-4">
          {editOutDoorData.VisitingCardURL ? (
            <div className="bg-white border border-gray-200 rounded p-4 shadow-sm">
              <h4 className="font-semibold mb-3">Visiting Card</h4>
              <div className="flex justify-center">
                <MultiImageViewer
                  images={[editOutDoorData.VisitingCardURL]}
                  title="Visiting Card"
                  size="large-half"
                />
              </div>
            </div>
          ) : (
            <div className="bg-white border border-gray-200 rounded p-4 shadow-sm">
              <h4 className="font-semibold mb-3">Visiting Card</h4>
              <div className="text-center py-8 text-gray-500 text-sm">
                No visiting card available
              </div>
            </div>
          )}

          {/* <div className="bg-white border border-gray-200 rounded p-4 shadow-sm">
            <h4 className="font-semibold mb-3">Punch Details</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <h5 className="text-sm font-medium text-gray-700">Punch In</h5>
                <FieldItem label="Time" value={editOutDoorData.PunchIn || 'N/A'} isRow={false} />
                <FieldItem label="Address" value={editOutDoorData.PunchInAddress || 'N/A'} isRow={false} />
              </div>
              <div className="space-y-3">
                <h5 className="text-sm font-medium text-gray-700">Punch Out</h5>
                <FieldItem label="Time" value={editOutDoorData.PunchOut || 'N/A'} isRow={false} />
                <FieldItem label="Address" value={editOutDoorData.PunchOutAddress || 'N/A'} isRow={false} />
              </div>
            </div>
          </div> */}
        </div>
      </div>
    </div>
  );
};