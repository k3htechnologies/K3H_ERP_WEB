import React, { useState } from 'react';
import { Loader } from '@/core/utils/loader';
import { FieldItem } from '@/ui/components/forms/FieldItem';
import { useLocation, useNavigate } from 'react-router-dom';
import type { VendorData } from '../models/VendorModel';
import { formatDate_dd_MonthName_yy_hh_mm } from '@/core/utils/dateFormat';
import { ArrowLeft, Edit } from 'lucide-react';
import { Button } from '@/ui/components/forms';
import Accordion from '@/ui/components/Card/Accordion';

export const ViewVendor: React.FC = () => {
  //#region STATE MANAGEMENT
  const [isLoading] = useState(false);
  const [loadingMessage] = useState('');
  
  //LOCATION
  const navigate = useNavigate();

  const location = useLocation() as {
    state?: {
      editVendorData?: VendorData | null;
      fromList?: boolean;
      listState?: {
        page: number;
        filters: any;
        sortInfo?: any;
        searchTerm?: string;
      };
    };
  };
  const preservedListState = location.state?.listState;

  //#region Get VENDOR DATA FROM LOCATION STATE

  const editVendorMasterData = (location.state?.editVendorData ?? null) as VendorData | null;

  //#endregion

  //#region EDIT VENDOR MASTER

  const handleEditVendor = (row: VendorData) => {
    if (!row?.VendorId) return;
    navigate(`/vendor/add/${row.VendorId}`, {
      state: {
        editVendorData: row,
        fromList: true,
        listState: preservedListState ?? { page: 1, filters: {}, sortInfo: undefined, searchTerm: '' }
      }
    });
  };

  //#endregion

  //#region BACK  VENDOR PAGE
  const navigateBackToList = () => {
    navigate('/vendor', {
      state: { listState: preservedListState ?? { page: 1, filters: {}, sortInfo: undefined, searchTerm: '' } }
    });
  };
  //#endregion

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
                    {editVendorMasterData?.VendorName || 'Vendor'}
                  </h3>
                  <div className="mt-2 flex justify-center gap-2">
                    <span className="text-xs bg-gray-100 px-2 py-1 rounded-full text-gray-700">
                      {editVendorMasterData?.CompanyName || 'N/A'}
                    </span>

                  </div>
                </div>

                {/* Basic Info box */}
                <div className="mt-6 rounded">
                  <h4 className="font-semibold text-sm text-gray-800 mb-3">Basic Information</h4>
                  <FieldItem label="Mobile Number" value={editVendorMasterData?.MobileNumber || '-'} isRow />
                  <FieldItem label="Email ID" value={editVendorMasterData?.EmailId || '-'} isRow />
                  <FieldItem label="Company Type" value={editVendorMasterData?.CompanyType || '-'} isRow />

                </div>

                <div className="mt-4 flex gap-3">
                  <Button
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      handleEditVendor(editVendorMasterData!)
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
                      navigateBackToList()
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
                  <h4 className="font-semibold text-sm text-gray-800 mb-3">Government Identifiers</h4>

                  <FieldItem label="PAN Number" value={editVendorMasterData?.PanCardNumber ?? '-'} urls={editVendorMasterData?.PanCardURL} isRow />
                  <FieldItem label="GST Number" value={editVendorMasterData?.GSTNumber ?? '-'} urls={editVendorMasterData?.GSTCertificateURL} isRow />
                  <FieldItem label="Aadhar Card Number" value={editVendorMasterData?.AadharCardNumber ?? '-'} urls={editVendorMasterData?.AadharCardURL} isRow />
                </div>

                {/* ADDRESS */}
                <div className="mt-6 rounded">
                  <h4 className="font-semibold text-sm text-gray-800 mb-3">Address Details</h4>
                  <FieldItem
                    label="Address"
                    value={editVendorMasterData?.Address || 'N/A'}
                    isRow={false}
                  />
                  <FieldItem label="Country" value={editVendorMasterData?.CountryName || 'N/A'} isRow />
                  <FieldItem label="State" value={editVendorMasterData?.StateName || 'N/A'} isRow />
                  <FieldItem label="District" value={editVendorMasterData?.DistrictName || 'N/A'} isRow />
                  <FieldItem label="City" value={editVendorMasterData?.CityName || 'N/A'} isRow />
                </div>
              </div>
            </div>
          </div>

          {/* Right column: details and accordions */}
          <div className="col-span-7 space-y-4">

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
                        {editVendorMasterData?.AvailableMaterialList && (
                          <FieldItem
                            label="Available Materials"
                            value={editVendorMasterData?.AvailableMaterialList}
                            isRow={false}
                          />
                        )}
                        {editVendorMasterData?.AvailableContractList && (
                          <FieldItem
                            label="Available Contracts"
                            value={editVendorMasterData?.AvailableContractList}
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
                        <FieldItem label="Created By" value={editVendorMasterData?.CreatedBy || 'N/A'} isRow />
                        <FieldItem
                          label="Created Date"
                          value={formatDate_dd_MonthName_yy_hh_mm(editVendorMasterData?.CreatedDate || '-')}
                          isRow
                        />
                        {editVendorMasterData?.ModifiedBy && (
                          <>
                            <FieldItem label="Modified By" value={editVendorMasterData?.ModifiedBy} isRow />
                            <FieldItem
                              label="Modified Date"
                              value={formatDate_dd_MonthName_yy_hh_mm(editVendorMasterData?.ModifiedDate || '-')}
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




