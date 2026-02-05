import React, { useEffect, useState } from 'react';
import { Loader } from '@/core/utils/loader';
import { FieldItem } from '@/ui/components/forms/FieldItem';
import { useNavigate } from 'react-router-dom';
import type { FilterWithPaginationVendorRequest, VendorData } from '@/features/vendor/models/VendorModel';
import { formatDate_dd_MonthName_yy_hh_mm } from '@/core/utils/dateFormat';
import HeaderActionBar from '@/ui/components/forms/HeaderActionBar';
import { useMenuPermissions } from '@/features/menu/hooks/useMenuPermissions';
import { useVendorListState } from '../context/VendorListStateContext';
import useToast from '@/core/hooks/useToast';
import { runApiWithLoader } from '@/core/utils';
import * as E from 'fp-ts/Either';
import { vendorService } from '@/features/vendor/services/VendorService';
import NoDataView from '@/ui/components/NoDataView/NoDataView';
import Tabs from '@/ui/components/Tab/Tab';

export const ViewVendor: React.FC = () => {
  //#region  LOADING STATE MANAGEMENT
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');

  //LOCATION
  const navigate = useNavigate();
  const { listState } = useVendorListState();
  const vendorName = listState.vendorName || '';
  const { addToast } = useToast();
  const { canAction } = useMenuPermissions('/vendor');
  const [editVendorMasterData, setEditVendorMasterData] = useState<VendorData | null>(null);
  const [activeTab, setActiveTab] = useState("material");

  useEffect(() => {
    if (listState.vendorId) {
      loadVendorMasterData();
    }
  }, [listState.vendorId]);

  const loadVendorMasterData = async () => {
    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {

        const params: FilterWithPaginationVendorRequest = {
          PageNumber: 1,
          PageSize: 1,
          VendorId: listState.vendorId
        };

        const response = await vendorService.apiCallPullVendor(params);

        if (E.isRight(response)) {

          setEditVendorMasterData(response.right.Data[0]);

        } else {

          addToast({ type: 'error', title: response.left.message });
        }
      },

      undefined,
      (error: any) => {
        addToast({ type: 'error', title: error.message });
      },

      undefined,

      'Loading Shift Data'
    );
  };

  const handleEditVendor = (row: VendorData) => {
    if (!row?.VendorId) return;
    navigate(`/vendor/add/${row.VendorId}`);
  };


  const navigateBackToList = () => {
    navigate('/vendor');
  };

  return (

    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">

      <Loader loading={isLoading} title={loadingMessage}> <div></div> </Loader>

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

      {editVendorMasterData && (
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

          {/* ================= MATERIALS & CONTRACTS ================= */}
         <div className="lg:col-span-3 space-y-4 pb-3">
            <h3 className="text-lg font-semibold border-b border-gray-300 pb-2">
              Material and Contract Management
            </h3>

            <Tabs
              tabs={[
                { id: "material", label: "Material" },
                { id: "contract", label: "Contract" },
              ]}

              defaultActive={activeTab}
              onTabChange={(tab) => setActiveTab(tab.id)}
              islarge
            />

            {/* Material Tab Content */}
            {activeTab === "material" && (
              <div className="space-y-4">

                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-3 h-[400px] flex flex-col">

                  <div className="space-y-2 flex-1 overflow-y-auto thin-scroll">
                    
                    {editVendorMasterData.SubMaterialMasterData.length > 0 ? (
                      editVendorMasterData.SubMaterialMasterData.map((item) => {
                        return (
                          <div
                            key={item.SubMaterialMasterId}
                            className="bg-white rounded-lg p-1 flex justify-between items-center"
                          >
                            <div>
                              <p className="font-medium text-gray-900">{item.SubMaterialName}</p>
                              <p className="text-xs text-gray-500">{item.MaterialName}</p>
                            </div>

                          </div>
                        );
                      })
                    ) : (
                      <div className="text-center text-gray-400 py-12">
                        <NoDataView />
                      </div>
                    )}
                  </div>

                </div>

              </div>
            )}



            {activeTab === "contract" && (
              <div className="space-y-4">

                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-3" style={{ minHeight: "400px", maxHeight: "400px", display: "flex", flexDirection: "column" }}>

                  <div className="flex-1 overflow-y-auto flex items-center justify-center">
                    <NoDataView />
                  </div>
                </div>
              </div>
            )}
          </div>

        </div>
      )}
    </div>

  );
};




