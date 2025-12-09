import React, { useState } from 'react';
import { Loader } from '@/core/utils/loader';
import { FieldItem } from '@/ui/components/forms/FieldItem';
import { useLocation, useNavigate } from 'react-router-dom';
import type { VendorData } from '../models/VendorModel';
import { formatDate_dd_MonthName_yy_hh_mm } from '@/core/utils/dateFormat';
import { MultiImageViewer } from '@/ui/components/ImageViewer/ImageViewer';
import { ArrowLeft, Edit } from 'lucide-react';
import { Button } from '@/ui/components/forms';
import Accordion from '@/ui/components/Card/Accordion';

export const ViewVendor: React.FC = () => {
  const [isLoading] = useState(false);
  const [loadingMessage] = useState('');
  
  const navigate = useNavigate();
  const location = useLocation() as {
    state?: {
      editVendorData?: VendorData | null;
      fromList?: boolean;
      listState?: {
        page: number;
        filters: Record<string, unknown>;
      };
    };
  };

  const editVendorData = (location.state?.editVendorData ?? null) as VendorData | null;

  // Handle edit navigation
  const handleEditVendor = () => {
    if (editVendorData) {
      navigate(`/vendor/add/${editVendorData.VendorId}`, {
        state: {
          editVendorData: editVendorData,
          fromList: true,
        },
      });
    }
  };

  // Handle back navigation
  const handleBack = () => {
    navigate(-1);
  };

  if (!editVendorData) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="text-center py-8">
          <p className="text-gray-500">No vendor data available</p>
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
        {/* Left column: profile card */}
        <div className="col-span-5">
          <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
            <div className="pt-10 px-6 pb-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900">
                  {editVendorData.VendorName || 'Vendor'} 
                  <span className={`inline-block ml-2 ${editVendorData.IsApproval ? 'text-green-500' : 'text-yellow-500'}`}>●</span>
                </h3>
                <div className="mt-2 flex justify-center gap-2">
                  <span className="text-xs bg-gray-100 px-2 py-1 rounded-full text-gray-700">
                    {editVendorData.CompanyName || 'N/A'}
                  </span>
                  <span className={`text-xs px-2 py-1 rounded-full text-xs font-medium ${editVendorData.IsApproval ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                    {editVendorData.IsApproval ? 'Approved' : 'Pending'}
                  </span>
                </div>
              </div>

              {/* Basic Info box */}
              <div className="mt-6 rounded">
                <h4 className="font-semibold text-sm text-gray-800 mb-3">Basic Information</h4>
                <FieldItem label="Mobile Number" value={editVendorData.MobileNumber || 'N/A'} isRow />
                <FieldItem label="Email ID" value={editVendorData.EmailId || 'N/A'} isRow />
                <FieldItem label="Company Type" value={editVendorData.CompanyType || 'N/A'} isRow />
                <FieldItem label="GST Number" value={editVendorData.GSTNumber || 'N/A'} isRow />
                <FieldItem label="Aadhar Card Number" value={editVendorData.AadharCardNumber || 'N/A'} isRow />
                <FieldItem label="PAN Card Number" value={editVendorData.PanCardNumber || 'N/A'} isRow />
              </div>

              <div className="mt-4 flex gap-3">
                <Button
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    handleEditVendor()
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

              {/* Company Information */}
              <div className="mt-6 rounded">
                <h4 className="font-semibold text-sm text-gray-800 mb-3">Company Information</h4>
                <FieldItem label="Vendor Name" value={editVendorData.VendorName || 'N/A'} isRow />
                <FieldItem label="Company Name" value={editVendorData.CompanyName || 'N/A'} isRow />
                <FieldItem label="System Generated Code" value={editVendorData.SystemGeneratedCode || 'N/A'} isRow />
                {editVendorData.ProjectName && (
                  <FieldItem label="Project Name" value={editVendorData.ProjectName} isRow />
                )}
              </div>

              {/* ADDRESS */}
              <div className="mt-6 rounded">
                <h4 className="font-semibold text-sm text-gray-800 mb-3">Address Details</h4>
                <FieldItem
                  label="Address"
                  value={editVendorData.Address || 'N/A'}
                  isRow={false}
                />
                <FieldItem label="Country" value={editVendorData.CountryName || 'N/A'} isRow />
                <FieldItem label="State" value={editVendorData.StateName || 'N/A'} isRow />
                <FieldItem label="District" value={editVendorData.DistrictName || 'N/A'} isRow />
                <FieldItem label="City" value={editVendorData.CityName || 'N/A'} isRow />
              </div>
            </div>
          </div>
        </div>

        {/* Right column: details and accordions */}
        <div className="col-span-7 space-y-4">
          {/* top-right quick panels */}
          <div className="grid grid-cols-1 gap-4">
            {/* Documents */}
            {(editVendorData.AadharCardURL || editVendorData.PanCardURL || editVendorData.GSTCertificateURL) && (
              <div className="bg-white border border-gray-200 rounded p-4 shadow-sm">
                <h4 className="font-semibold mb-3">Documents</h4>
                <div className="space-y-4">
                  {editVendorData.AadharCardURL && (
                    <div>
                      <h5 className="text-sm font-medium text-gray-700 mb-2">Aadhar Card</h5>
                      <div className="flex justify-center">
                        <MultiImageViewer
                          images={[editVendorData.AadharCardURL]}
                          title="Aadhar Card"
                          size="large-half"
                        />
                      </div>
                    </div>
                  )}
                  {editVendorData.PanCardURL && (
                    <div>
                      <h5 className="text-sm font-medium text-gray-700 mb-2">PAN Card</h5>
                      <div className="flex justify-center">
                        <MultiImageViewer
                          images={[editVendorData.PanCardURL]}
                          title="PAN Card"
                          size="large-half"
                        />
                      </div>
                    </div>
                  )}
                  {editVendorData.GSTCertificateURL && (
                    <div>
                      <h5 className="text-sm font-medium text-gray-700 mb-2">GST Certificate</h5>
                      <div className="flex justify-center">
                        <MultiImageViewer
                          images={[editVendorData.GSTCertificateURL]}
                          title="GST Certificate"
                          size="large-half"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* accordion cards */}
          <div className="space-y-3">
            <Accordion
              items={[
                {
                  key: "materials",
                  title: "Materials & Contracts",
                  defaultOpen: false,
                  content: (
                    <div className="grid grid-cols-1 gap-4">
                      {editVendorData.AvailableMaterialList && (
                        <FieldItem 
                          label="Available Materials" 
                          value={editVendorData.AvailableMaterialList} 
                          isRow={false} 
                        />
                      )}
                      {editVendorData.AvailableContractList && (
                        <FieldItem 
                          label="Available Contracts" 
                          value={editVendorData.AvailableContractList} 
                          isRow={false} 
                        />
                      )}
                    </div>
                  )
                },
                {
                  key: "action",
                  title: "Action Details",
                  defaultOpen: false,
                  content: (
                    <div className="grid grid-cols-1 gap-4">
                      <FieldItem label="Created By" value={editVendorData.CreatedBy || 'N/A'} isRow />
                      <FieldItem 
                        label="Created Date" 
                        value={formatDate_dd_MonthName_yy_hh_mm(editVendorData.CreatedDate || '-')} 
                        isRow 
                      />
                      {editVendorData.ModifiedBy && (
                        <>
                          <FieldItem label="Modified By" value={editVendorData.ModifiedBy} isRow />
                          <FieldItem 
                            label="Modified Date" 
                            value={formatDate_dd_MonthName_yy_hh_mm(editVendorData.ModifiedDate || '-')} 
                            isRow 
                          />
                        </>
                      )}
                    </div>
                  )
                }
              ]}
            />
          </div>
        </div>
      </div>
    </div>
  );
};




