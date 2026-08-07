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
import { getNameInitials } from '@/core/utils/getNameInitials';
import { BadgeCheck, MapPin, History, Phone, Package, FileSignature, Circle } from 'lucide-react';

export const ViewVendor: React.FC = () => {
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

    <div className="bg-[#F9FAFB] rounded-lg shadow-sm border border-gray-300 p-6">

      <Loader loading={isLoading} title={loadingMessage}> <div></div> </Loader>

      <HeaderActionBar
        titleText={'Vendor Details : '}
        subTitleText={vendorName}
        subSubTitleText={editVendorMasterData?.SystemGeneratedCode || ''}
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
        <>
          <div className="grid grid-cols-12 gap-5">
            <div className="col-span-12 lg:col-span-12">

              <div className="bg-white rounded-3xl border border-gray-200  box-shadow: 0px 8px 30px 0px #00000005 px-5 py-5 mt-5">

                <div className="flex items-center justify-between">

                  <div className="flex items-start gap-6">


                    <div className="relative">


                      <div className="w-18 h-18 rounded-full bg-gray-600 flex items-center justify-center text-white font-semibold text-xl flex">
                        {getNameInitials(editVendorMasterData?.VendorName)}
                      </div>

                      <div className="absolute bottom-1 right-1 w-5 h-5 rounded-full bg-indigo-600 border-2 border-white flex items-center justify-center">
                        <BadgeCheck size={14} className="text-white" />
                      </div>
                    </div>

                    <div>

                      <div className="flex items-center gap-3 flex-wrap">

                        <h1 className="text-2xl font-bold text-slate-800">
                          {editVendorMasterData?.VendorName}
                        </h1>
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2 border
                                                                ${editVendorMasterData.VerifiedNonVerified === "Verified"
                              ? "bg-green-50 text-green-700 border-green-200"
                              : "bg-red-50 text-red-700 border-red-200"
                            }`}
                        >
                          <Circle
                            size={8}
                            className={
                              editVendorMasterData.VerifiedNonVerified === "Verified"
                                ? "fill-green-500 text-green-500"
                                : "fill-red-500 text-red-500"
                            }
                          />

                          {editVendorMasterData.VerifiedNonVerified}
                        </span>
                      </div>

                      <p className="text-lg text-gray-500 mt-2">
                        {editVendorMasterData?.CompanyName}
                      </p>

                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EFF4FF] text-[#464554] font-medium text-xs  mt-2">
                        <MapPin className="text-[#4648D4]" size={15} />
                        {editVendorMasterData?.CityName}, {editVendorMasterData?.StateName}
                      </div>

                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 pt-5">

            <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-5">

              <div className="flex items-center gap-3 mb-5">
                <div className="w-11 h-11 rounded-xl bg-indigo-50 flex items-center justify-center">
                  <Phone className="w-5 h-5 text-indigo-600" />
                </div>

                <h2 className="text-[16px] font-semibold text-slate-800">
                  Personal Information
                </h2>
              </div>

              <div className="grid grid-cols-2 gap-6">

                <FieldItem label="Vendor Name" value={editVendorMasterData?.VendorName ?? '-'} />
                <FieldItem label="Company Name" value={editVendorMasterData?.CompanyName ?? '-'} />
                <FieldItem label="Company Type" value={editVendorMasterData?.CompanyType ?? '-'} />
                <FieldItem label="Mobile Number" value={editVendorMasterData?.MobileNumber ? `${editVendorMasterData?.MobileNumberCountryCode || "+91"} ${editVendorMasterData.MobileNumber}` : "-"} />
                <FieldItem label="E-Mail ID" value={editVendorMasterData?.EmailId ?? '-'} />

              </div>

            </div>

            <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-5">

              <div className="flex items-center gap-3 mb-5">
                <div className="w-11 h-11 rounded-xl bg-emerald-50 flex items-center justify-center">
                  <BadgeCheck className="w-5 h-5 text-emerald-600" />
                </div>

                <h2 className="text-[16px] font-semibold text-slate-800">
                  Government Identifiers
                </h2>
              </div>

              <div className="grid grid-cols-2 gap-6">

                <FieldItem label="PAN Number"
                  value={editVendorMasterData?.PanCardNumber ?? '-'}
                  urls={editVendorMasterData?.PanCardURL} isIcon
                />
                <FieldItem
                  label="GST Number"
                  value={editVendorMasterData?.GSTNumber ?? '-'}
                  urls={editVendorMasterData?.GSTCertificateURL} isIcon
                />
                <FieldItem
                  label="Aadhaar Card Number"
                  value={editVendorMasterData?.AadharCardNumber ?? '-'}
                  urls={editVendorMasterData?.AadharCardURL} isIcon
                />
              </div>

            </div>

            <div className="xl:col-span-2 bg-white rounded-3xl border border-gray-200 shadow-sm p-5">

              <div className="flex items-center gap-3 mb-5">
                <div className="w-11 h-11 rounded-xl bg-orange-50 flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-orange-500" />
                </div>

                <h2 className="text-[16px] font-semibold text-slate-800">
                  Address Details
                </h2>
              </div>

              <div className="grid grid-cols-4 gap-x-8 gap-y-6">

                <FieldItem label="Country" value={editVendorMasterData?.CountryName} />

                <FieldItem label="State" value={editVendorMasterData?.StateName} />

                <FieldItem label="District" value={editVendorMasterData?.DistrictName} />

                <FieldItem label="City" value={editVendorMasterData?.CityName} />


                <div className="col-span-3">
                  <FieldItem label="Office Address" value={editVendorMasterData?.Address} />
                </div>

              </div>

            </div>


            {/* ================= MATERIALS & CONTRACTS ================= */}
            <div className="xl:col-span-2 bg-white rounded-3xl border border-gray-200 shadow-sm p-5">

              <div className="flex items-center gap-3 mb-5">
                <div className="w-11 h-11 rounded-xl bg-emerald-50 flex items-center justify-center">
                  <FileSignature className="w-5 h-5 text-emerald-500" />
                </div>

                <h2 className="text-[16px] font-semibold text-slate-800">
                  Material and Contract Management
                </h2>
              </div>

              <Tabs
                tabs={[
                  { id: "material", label: "Material" },
                  { id: "contract", label: "Contract" },
                ]}

                defaultActive={activeTab}
                onTabChange={(tab) => setActiveTab(tab.id)}
                islarge
                isChips
              />


              {activeTab === "material" && (
                <div className="xl:col-span-2 bg-white rounded-3xl pt-5">

                  {editVendorMasterData.SubMaterialMasterData.length === 0 ? (
                    <NoDataView message="No materials available" />
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-4 max-h-[380px] overflow-y-auto thin-scroll pr-1">

                      {editVendorMasterData.SubMaterialMasterData.map((item) => (
                        <div
                          key={item.SubMaterialMasterId}
                          className="border border-gray-200 rounded-xl p-4 hover:border-blue-300"
                        >
                          <div className="flex items-center gap-3">

                            <div className="w-11 h-11 rounded-full bg-blue-100 text-blue-700 font-semibold flex items-center justify-center">
                              <Package size={18} />
                            </div>

                            <div className="min-w-0 flex-1">
                              <h5 className="font-semibold text-gray-900 truncate">
                                {item.SubMaterialName}
                              </h5>

                              <p className="text-xs text-gray-500 truncate">
                                {item.MaterialName}
                              </p>
                            </div>

                          </div>
                        </div>
                      ))}

                    </div>
                  )}

                </div>
              )}

              {activeTab === "contract" && (

                <div className="xl:col-span-2 bg-white rounded-3xl pt-5">


                  <div className="flex-1 overflow-y-auto flex items-center justify-center">
                    <NoDataView />
                  </div>

                </div>

              )}
            </div>

            <div className="xl:col-span-2 bg-white rounded-3xl border border-gray-200 shadow-sm p-5">

              <div className="flex items-center gap-3 mb-5">
                <div className="w-11 h-11 rounded-xl bg-slate-50 flex items-center justify-center">
                  <History className="w-5 h-5 text-slate-600" />
                </div>

                <h2 className="text-[16px] font-semibold text-slate-800">
                  Action Details
                </h2>
              </div>

              <div className="grid grid-cols-2 gap-6">

                <FieldItem label="Created By" value={editVendorMasterData?.CreatedBy} />
                <FieldItem label="Created Date" value={editVendorMasterData?.CreatedDate ? formatDate_dd_MonthName_yy_hh_mm(editVendorMasterData?.CreatedDate) : ""} />
                {editVendorMasterData?.ModifiedBy && (
                  <>
                    <FieldItem label="Modified By" value={editVendorMasterData?.ModifiedBy} />
                    <FieldItem label="Modified Date" value={editVendorMasterData?.ModifiedDate ? formatDate_dd_MonthName_yy_hh_mm(editVendorMasterData?.ModifiedDate) : ""} />
                  </>
                )}

              </div>

            </div>

          </div>


        </>
      )}
    </div>

  );
};




