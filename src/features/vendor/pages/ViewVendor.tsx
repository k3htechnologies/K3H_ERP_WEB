import React, { useState } from 'react';
import { Loader } from '@/core/utils/loader';
import { FieldItem } from '@/ui/components/forms/FieldItem';
import {  useNavigate } from 'react-router-dom';
import type { VendorData } from '../models/VendorModel';
import { formatDate_dd_MonthName_yy_hh_mm } from '@/core/utils/dateFormat';
import HeaderActionBar from '@/ui/components/forms/HeaderActionBar';
import { useMenuPermissions } from '@/features/menu/hooks/useMenuPermissions';
import { useVendorListState } from '../context/VendorListStateContext';

export const ViewVendor: React.FC = () => {
  //#region STATE MANAGEMENT
  const [isLoading] = useState(false);
  const [loadingMessage] = useState('');

  //LOCATION
  const navigate = useNavigate();
  const { listState } = useVendorListState();
  const vendorName = listState.vendorName || '';

  const { canAction } = useMenuPermissions('/vendor');

  //#region Get VENDOR DATA - Will be loaded from API if needed
  const editVendorMasterData = null as VendorData | null;

  //#endregion

  //#region EDIT VENDOR MASTER

  const handleEditVendor = (row: VendorData) => {
    if (!row?.VendorId) return;
    navigate(`/vendor/add/${row.VendorId}`);
  };

  //#endregion

  //#region BACK  VENDOR PAGE
  const navigateBackToList = () => {
    navigate('/vendor');
  };
  //#endregion

  return (

    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">

      <Loader loading={isLoading} title={loadingMessage}>
        <div></div>
      </Loader>

      <HeaderActionBar
        titleText={'Vendor Details : '}
        subTitleText={vendorName}
        cancelText="Cancel"
        EditText="Edit"
        onCancel={() => navigateBackToList()}
        canAction={canAction}
        onEdit={() => {

          if (editVendorMasterData) handleEditVendor(editVendorMasterData!);

        }}
        isLoading={isLoading}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-5">

        {/* ================= LEFT (2/3 WIDTH) ================= */}
        <div className="lg:col-span-2 space-y-6">

          {/* ================= BASIC DETAILS ================= */}
          <section className="bg-white rounded-xl shadow-sm p-6 border border-[#3333334f]">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">
              Basic Information
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <FieldItem label="Vendor Name" value={editVendorMasterData?.VendorName ?? '-'} />
              <FieldItem label="Company Name" value={editVendorMasterData?.CompanyName ?? '-'} />
              <FieldItem label="Company Type" value={editVendorMasterData?.CompanyType ?? '-'} />
              <FieldItem label="Mobile Number" value={editVendorMasterData?.MobileNumber ?? '-'} />
              <FieldItem label="Email ID" value={editVendorMasterData?.EmailId ?? '-'} />
            </div>
          </section>

          {/* ================= GOVERNMENT IDENTIFIERS ================= */}
          <section className="bg-white rounded-xl shadow-sm p-6 border border-[#3333334f]">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">
              Government Identifiers
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <FieldItem
                label="PAN Number"
                value={editVendorMasterData?.PanCardNumber ?? '-'}
                urls={editVendorMasterData?.PanCardURL} isIcon
              />
              <FieldItem
                label="GST Number"
                value={editVendorMasterData?.GSTNumber ?? '-'}
                urls={editVendorMasterData?.GSTCertificateURL} isIcon
              />
              <FieldItem
                label="Aadhar Card Number"
                value={editVendorMasterData?.AadharCardNumber ?? '-'}
                urls={editVendorMasterData?.AadharCardURL} isIcon
              />
            </div>
          </section>

          {/* ================= ADDRESS DETAILS ================= */}
          <section className="bg-white rounded-xl shadow-sm p-6 border border-[#3333334f]">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">
              Address Details
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-3">
                <FieldItem
                  label="Address"
                  value={editVendorMasterData?.Address ?? '-'}
                />
              </div>
              <FieldItem label="Country" value={editVendorMasterData?.CountryName ?? '-'} />
              <FieldItem label="State" value={editVendorMasterData?.StateName ?? '-'} />
              <FieldItem label="District" value={editVendorMasterData?.DistrictName ?? '-'} />
              <FieldItem label="City" value={editVendorMasterData?.CityName ?? '-'} />
            </div>
          </section>

          {/* ================= MATERIALS & CONTRACTS ================= */}
          <section className="bg-white rounded-xl shadow-sm p-6 border border-[#3333334f]">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">
              Materials & Contracts
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FieldItem
                label="Available Materials"
                value={editVendorMasterData?.AvailableMaterialList ?? '-'}
              />
              <FieldItem
                label="Available Contracts"
                value={editVendorMasterData?.AvailableContractList ?? '-'}
              />
            </div>
          </section>


        </div>

        {/* ================= RIGHT (1/3 WIDTH) ================= */}
        <div className="lg:col-span-1 space-y-6">

          {/* ================= QUICK ACTIONS ================= */}
          <section className="bg-white rounded-xl shadow-sm p-6 border border-[#3333334f]">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">
              Action Details
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
              <FieldItem label="Created By" value={editVendorMasterData?.CreatedBy ?? '-'} />
              <FieldItem
                label="Created Date"
                value={formatDate_dd_MonthName_yy_hh_mm(editVendorMasterData?.CreatedDate ?? '-')}
              />
              <FieldItem label="Modified By" value={editVendorMasterData?.ModifiedBy ?? '-'} />
              <FieldItem
                label="Modified Date"
                value={formatDate_dd_MonthName_yy_hh_mm(editVendorMasterData?.ModifiedDate ?? '-')}
              />
            </div>
          </section>
        </div>

      </div>

    </div>

  );
};




