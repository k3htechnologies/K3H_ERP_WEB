import { useNavigate } from "react-router-dom";
import { FieldItem } from "@/ui/components/forms/FieldItem";
import HeaderActionBar from "@/ui/components/forms/HeaderActionBar";
import { useEffect, useState } from "react";
import { runApiWithLoader } from "@/core/utils";
import * as E from "fp-ts/Either";
import { useToast } from "@/core/hooks/useToast";
import { Loader } from "@/core/utils/loader";
import type { AddUpdateChannelPartnerUniverseAdditionalInformationRequest, ChannelPartnerUniverseAdditionalInformationData, ChannelPartnerUniverseData, FilterWithPaginationChannelPartnerUniverseAdditionalInformation, FilterWithPaginationChannelPartnerUniverseRequest } from '@/features/channelPartnerUniverse/models/ChannelPartnerUniverseModel';
import { channelPartnerUniverseService } from '@/features/channelPartnerUniverse/services/ChannelPartneUniverseService';
import { useChannelPartnerUniverseListState } from '@/features/channelPartnerUniverse/context/ChannelPartnerUniverseListStateContext';
import { formatDate_dd_MonthName_yy, formatDate_dd_MonthName_yy_hh_mm } from "@/core/utils/dateFormat";
import { getActiveInactiveStatuscolor } from "../utils/Status";
import { formatCurrency, isDateWithinPastDays } from "@/core/utils/comman";
import { Modal } from "@/ui/components/Modal/Modal";
import { TextArea } from "@/ui/components/forms/Textarea";
import { DeleteDialog } from "@/ui/components/forms/DeleteDialog";
import NoDataView from "@/ui/components/NoDataView/NoDataView";
import { Button } from "@/ui/components/forms";
import { useMenuPermissions } from "@/features/menu/hooks/useMenuPermissions";
import { Edit, Trash2 } from "lucide-react";
import { SinglePageSelection } from "@/ui/components/DropDown/SinglePageSelection";
import { REASON_FOR_INAACTIVITY } from "@/core/constants";
import ToggleSwitch from "@/ui/components/forms/ToggleSwitch";

const initialFormState = (): AddUpdateChannelPartnerUniverseAdditionalInformationRequest => ({
  ChannelPartnerUniverseAdditionalInformationId: 0,
  Uniquekey: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  ChannelPartnerId: 0,
  ReasonForInactivity: "",
  Remarks: "",
  AdditonalSupportRequired: "",
  AdditionalSupportProvided: "",
});

const ViewChannelPartnerUniverse: React.FC = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [channelPartnerMasterList, setChannelPartnerList] = useState<ChannelPartnerUniverseData>();
  const { listState } = useChannelPartnerUniverseListState();
  const channelPartnerId = listState.channelPartnerId;

  const { canAction } = useMenuPermissions('cpUniverse');

  const [channelPartnerUniverseAdditionalInformationList, setChannelPartnerUniverseAdditionalInformationDataList] = useState<ChannelPartnerUniverseAdditionalInformationData[]>([]);
  const [formData, setFormData] = useState<AddUpdateChannelPartnerUniverseAdditionalInformationRequest>(() => initialFormState());
  const [errors, setErrors] = useState<{ [k: string]: string }>({});
  const [isEditMode, setIsEditMode] = useState(false);
  const [isAdditionalInformationModalOpen, setIsAdditionalInformationModalOpen] = useState(false);

  const [editChannelPartnerUniverseAdditionalInformation, setEditChannelPartnerUniverseAdditionalInformation] = useState<ChannelPartnerUniverseAdditionalInformationData | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  useEffect(() => {
    loadChannelPartner();
    loadChannelPartnerUniverseAdditionalInformation();
  }, [listState.channelPartnerId]);

  const loadChannelPartner = async () => {
    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {
        const params: FilterWithPaginationChannelPartnerUniverseRequest = {
          PageNumber: 1,
          PageSize: 1,
          IsCheckPermission: false,
          ChannelPartnerId: Number(listState.channelPartnerId || 0),
        };

        const response = await channelPartnerUniverseService.apiCallPullChannelPartnerUniverse(params);

        if (E.isRight(response)) {

          setChannelPartnerList(response.right.Data[0]);

        } else {
          addToast({ type: 'error', title: response.left.message });
        }
        return response;
      },
      undefined,
      (error: any) => addToast({ type: 'error', title: error.message }),
      undefined,
      'Loading Channel Partner'
    );
  };

  const handleBackToList = () => {
    navigate("/cpUniverse");
  };

  const loadChannelPartnerUniverseAdditionalInformation = async () => {
    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {

        const params: FilterWithPaginationChannelPartnerUniverseAdditionalInformation = {
          PageNumber: 1,
          PageSize: 100,
          ChannelPartnerId: channelPartnerId || undefined,
        };

        const response = await channelPartnerUniverseService.apiCallPullChannelPartnerUniverseAdditionalInformation(params);

        if (E.isRight(response)) {

          let filteredData = response.right.Data || [];

          setChannelPartnerUniverseAdditionalInformationDataList(filteredData);

        } else {
          addToast({ type: "error", title: response.left.message });
        }

        return response;
      },
      undefined,
      (error: any) => {
        addToast({ type: "error", title: error.message });
      },
      undefined,
      "Loading Additional Information"
    );
  };

  const handleFieldChange = (field: keyof AddUpdateChannelPartnerUniverseAdditionalInformationRequest, value: any) => {

    setFormData((prev) => ({ ...prev, [field]: value }));

    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };
  //#endregion

  const handleOpenAdditionalInformationModal = (item?: ChannelPartnerUniverseAdditionalInformationData) => {

    if (item) {

      setFormData({
        ChannelPartnerUniverseAdditionalInformationId: item.ChannelPartnerUniverseAdditionalInformationId,
        Uniquekey: item.Uniquekey || "3fa85f64-5717-4562-b3fc-2c963f66afa6",
        ChannelPartnerId: item.ChannelPartnerId,
        ReasonForInactivity: item.ReasonForInactivity || "",
        Remarks: item.Remarks || "",
        AdditonalSupportRequired: item.AdditonalSupportRequired === "Yes" ? "1" : "0",
        AdditionalSupportProvided: item.AdditionalSupportProvided === "Yes" ? "1" : "0"
      });

      setIsEditMode(true);
      setIsAdditionalInformationModalOpen(true);
      setEditChannelPartnerUniverseAdditionalInformation(item);
    } else {
      setFormData({
        ChannelPartnerUniverseAdditionalInformationId: 0,
        Uniquekey: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
        ChannelPartnerId: listState.channelPartnerId || 0,
        ReasonForInactivity: "",
        Remarks: "",
        AdditonalSupportRequired: "",
        AdditionalSupportProvided: ""
      });
      setIsEditMode(false);
      setEditChannelPartnerUniverseAdditionalInformation(null);
    }
    setErrors({});
    setIsAdditionalInformationModalOpen(true);
  };

  const handleCloseRemarkModal = () => {
    setIsAdditionalInformationModalOpen(false);
    setIsEditMode(false);
    setEditChannelPartnerUniverseAdditionalInformation(null);
    setFormData({
      ChannelPartnerUniverseAdditionalInformationId: 0,
      Uniquekey: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      ChannelPartnerId: 0,
      ReasonForInactivity: "",
      Remarks: "",
      AdditonalSupportRequired: "",
      AdditionalSupportProvided: ""
    });
    setErrors({});
  };

  const validateRemarkForm = (): boolean => {

    const errors: { [key: string]: string } = {};

    if (!formData.ReasonForInactivity?.trim()) {
      errors.ReasonForInactivity = "Reason For Inactivity is required";
    }

    if (!formData.Remarks?.trim()) {
      errors.Remarks = "Remark is required";
    }

    setErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAdditionalInformationFormSubmit = async (e: React.FormEvent) => {

    e.preventDefault();

    if (!validateRemarkForm()) {
      return;
    }

    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {
        const params: AddUpdateChannelPartnerUniverseAdditionalInformationRequest = {
          ChannelPartnerUniverseAdditionalInformationId: formData.ChannelPartnerUniverseAdditionalInformationId,
          Uniquekey: formData.Uniquekey || "3fa85f64-5717-4562-b3fc-2c963f66afa6",
          ChannelPartnerId: channelPartnerId || 0,
          ReasonForInactivity: formData.ReasonForInactivity?.trim() || "",
          Remarks: formData.Remarks?.trim() || "",
          AdditonalSupportRequired: formData.AdditonalSupportRequired?.trim() === "1" ? "Yes" : "No",
          AdditionalSupportProvided: formData.AdditionalSupportProvided?.trim() === "1" ? "Yes" : "No",
        };

        const response = await channelPartnerUniverseService.apiCallAddUpdateChannelPartnerUniverseAdditionalInformation(params);

        if (E.isRight(response)) {

          addToast({ type: "success", title: response.right.SuccessMessage?.[0] });
          handleCloseRemarkModal();
          loadChannelPartnerUniverseAdditionalInformation();

        } else {
          addToast({ type: "error", title: response.left.message });
        }

        return response;
      },
      undefined,
      (error: any) => {
        addToast({ type: "error", title: error.message });
      },
      undefined,
      isEditMode ? "Updating Additional Information" : "Adding Additional Information"
    );
  };

  const handleDeleteAdditionalInformation = (item: ChannelPartnerUniverseAdditionalInformationData) => {
    setEditChannelPartnerUniverseAdditionalInformation(item);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDeleteAdditionalInformation = async () => {
    if (!editChannelPartnerUniverseAdditionalInformation) return;

    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {
        const response = await channelPartnerUniverseService.apiCallDeleteChannelPartnerUniverseAdditionalInformation({
          ChannelPartnerUniverseAdditionalInformationId: editChannelPartnerUniverseAdditionalInformation.ChannelPartnerUniverseAdditionalInformationId || 0,
          Uniquekey: editChannelPartnerUniverseAdditionalInformation.Uniquekey || ""
        });

        if (E.isRight(response)) {

          addToast({ type: "success", title: response.right.SuccessMessage?.[0] });

          setIsDeleteDialogOpen(false);

          setEditChannelPartnerUniverseAdditionalInformation(null);

          loadChannelPartnerUniverseAdditionalInformation();

        } else {
          addToast({ type: "error", title: response.left.message });
        }

        return response;
      },
      undefined,
      (error: any) => {
        addToast({ type: "error", title: error.message });
      },
      undefined,
      "Deleting Additional Information"
    );
  };

  const statusValue = channelPartnerMasterList?.Status || "-";
  const { bg, text } = getActiveInactiveStatuscolor(statusValue);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-300 p-6">
      <Loader loading={isLoading} title={loadingMessage}>  <div></div> </Loader>
      <HeaderActionBar
        titleText="Channel Partner : "
        subTitleText={listState.channelPartnerName || ''}
        subSubTitleText={channelPartnerMasterList?.SystemGeneratedCode || ''}
        cancelText="Back"
        EditText="Edit"
        onCancel={handleBackToList}
        isLoading={false}
      />

      <div className="grid grid-cols-12 gap-4 pt-5">
        <div className="col-span-5">
          <div className="bg-white rounded-lg border border-gray-300 shadow-sm p-4">

            <div className="pl-4 pb-4 border-b-2 border-gray-300">
              <div className="flex flex-col gap-2">
                <div className="flex items-start">
                  <span className="text-gray-500 font-medium text-sm w-[140px]">
                    Company Name
                  </span>
                  <span className="text-gray-500 font-medium text-sm px-2">:</span>
                  <span className="text-black text-sm break-all">
                    {channelPartnerMasterList?.CompanyName || '-'}
                  </span>
                </div>

                <div className="flex items-start">
                  <span className="text-gray-500 font-medium text-sm w-[140px]">
                    Firms Type
                  </span>
                  <span className="text-gray-500 font-medium text-sm px-2">:</span>
                  <span className="text-black text-sm break-all">
                    {channelPartnerMasterList?.FirmsType || '-'}
                  </span>
                </div>
                <div className="flex items-start">
                  <span className="text-gray-500 font-medium text-sm w-[140px]">
                    Status
                  </span>
                  <span className="text-gray-500 font-medium text-sm px-2">:</span>

                  <span className="inline-block px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap" style={{
                    backgroundColor: bg,
                    color: text
                  }}>
                    {channelPartnerMasterList?.Status || '-'}
                  </span>
                </div>
              </div>
            </div>

            <section className="p-4">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">
                Basic Details
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FieldItem label="CP Code" value={channelPartnerMasterList?.SystemGeneratedCode || '-'} />
                <FieldItem label="Full Name" value={channelPartnerMasterList?.Name || '-'} />
                <FieldItem label="DOB" value={formatDate_dd_MonthName_yy(channelPartnerMasterList?.DateOfBirth ?? "-")} />
                <FieldItem label="Mobile No" value={channelPartnerMasterList?.MobileNumber ? `+91 ${channelPartnerMasterList?.MobileNumber}` : '-'} />
                <FieldItem label="Designation" value={channelPartnerMasterList?.Designation || '-'} />
                <FieldItem label="CP Type" value={channelPartnerMasterList?.Type || '-'} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-1 pt-4">
                <div className="text-sm font-medium text-[#1D1D1D80] truncate">
                  Website URL
                </div>
                {channelPartnerMasterList?.WebsiteURL !== "" ?
                  <span className="text-blue-600 underline cursor-pointer break-all whitespace-normal"
                    onClick={() => window.open(channelPartnerMasterList?.WebsiteURL, "_blank")}>
                    {channelPartnerMasterList?.WebsiteURL}
                  </span> : "-"}
              </div>
            </section>

            <hr className="border-t border-gray-200" />

            <section className="p-4">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">
                RERA Details
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FieldItem label="Available RERA Number" value={channelPartnerMasterList?.RERANumber ? 'Yes' : 'No'} />
                <FieldItem label="RERA Number" value={channelPartnerMasterList?.RERANumber || '-'} />
              </div>
            </section>

            <hr className="border-t border-gray-200" />
            <section className="p-4">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">
                Walkins & Booking (Days)
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                <FieldItem label="Gross Walkins" value={channelPartnerMasterList?.NoOfGrossWalkins} />
                <FieldItem label="Net Bookings" value={channelPartnerMasterList?.NoOfNetBooking} />
                <FieldItem label="Net Revenue" value={formatCurrency(channelPartnerMasterList?.NetBookingRevenue)} />
              </div>
            </section>

            <hr className="border-t border-gray-200" />
            <section className="p-4">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">
                Walkins & Booking (Lifetime)
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                <FieldItem label="Gross Walkins" value={channelPartnerMasterList?.NoOfGrossWalkinsLifeTime} />
                <FieldItem label="Net Bookings" value={channelPartnerMasterList?.NoOfNetBookingLifeTime} />
                <FieldItem label="Net Revenue" value={formatCurrency(channelPartnerMasterList?.NetBookingRevenueLifeTime)} />
              </div>
            </section>

            <hr className="border-t border-gray-200" />
            <section className="p-4">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">
                Primary & Secondary Project Portfolio
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-1 gap-4">
                <FieldItem label="Primary" value={channelPartnerMasterList?.PrimaryProjectPortfolio} />
                <FieldItem label="Secondary" value={channelPartnerMasterList?.SecondaryProjectPortfolio} />
                <FieldItem label="Micromarket Proximity" value={channelPartnerMasterList?.MicromarketProximity} />
              </div>
            </section>

            <hr className="border-t border-gray-200" />
            <section className="p-4">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">
                Action Details
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                <FieldItem label="Created By" value={channelPartnerMasterList?.CreatedBy} />
                <FieldItem label="Created Date" value={channelPartnerMasterList?.CreatedDate ? formatDate_dd_MonthName_yy_hh_mm(channelPartnerMasterList?.CreatedDate) : ""} />
              </div>
            </section>

          </div>
        </div>
        <div className="col-span-7">
          <div className="bg-white rounded-lg border border-gray-300 shadow-sm p-4 h-full">
            <div className="border-b pb-2 mt-1">
              <div className="flex items-start justify-between">
                <h1 className="text-lg font-semibold text-black">
                  Additional Information
                </h1>
                {canAction && (
                  <div className="flex items-center gap-2">
                    <Button
                      color="blue"
                      size="sm"
                      onClick={() => handleOpenAdditionalInformationModal()}
                      title="Add Remark"
                    >
                      Add Remark
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Timeline */}
            <div className="mt-3">

              {channelPartnerUniverseAdditionalInformationList?.length > 0 ? (
                channelPartnerUniverseAdditionalInformationList.map((item, index) => {
                  const isModified = !!(item.ModifiedBy && item.ModifiedDate);

                  return (

                    <div key={item.ChannelPartnerUniverseAdditionalInformationId} className="grid grid-cols-[24px_1fr] gap-3">
                      {/* LEFT — DOT + LINE */}
                      <div className="flex flex-col items-center">
                        <div className="h-4 w-4 rounded-full bg-blue-600"></div>

                        {index !== channelPartnerUniverseAdditionalInformationList.length - 1 && (
                          <div className="w-[3px] bg-blue-600 flex-1"></div>
                        )}
                      </div>

                      {/* RIGHT — CONTENT */}
                      <div>

                        <div className="flex items-center gap-3">

                          <span className="font-semibold text-gray-900">

                            {formatDate_dd_MonthName_yy_hh_mm(isModified ? item.ModifiedDate! : item.CreatedDate ?? "")}

                          </span>

                          <span className="font-medium text-gray-400 text-sm">

                            {isModified ? item.ModifiedBy : item.CreatedBy}

                          </span>

                          {index === 0 && canAction && item.IsAction && isDateWithinPastDays(item.CreatedDate, 2) && (

                            <div className="flex items-center gap-1 ml-auto">


                              <Button
                                color="transparent"
                                isborderRadius
                                size="sm"
                                title="Edit"
                                onClick={() => handleOpenAdditionalInformationModal(item)}
                                disabled={isLoading}
                                leftIcon={<Edit className="h-4 w-4" />}
                              />

                              <Button
                                color="transparent"
                                isborderRadius
                                size="sm"
                                style={{ color: "red", padding: "4px 8px" }}
                                title="Delete"
                                onClick={() => handleDeleteAdditionalInformation(item)}
                                disabled={isLoading}
                                leftIcon={<Trash2 className="h-4 w-4" />}
                              />

                            </div>
                          )}
                        </div>

                        <div className="gap-4 p-3">
                          <FieldItem label="Reason For Inactivity" value={item.ReasonForInactivity || "-"} isRow />
                          <FieldItem label="Remarks" value={item.Remarks || "-"} isRow />
                          <FieldItem label="Support Required" value={item.AdditonalSupportRequired || "-"} isRow />
                          <FieldItem label="Support Provided" value={item.AdditionalSupportProvided || "-"} isRow />
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <NoDataView message="No Additional Information Found" />
                </div>
              )}

            </div>
          </div>
        </div>
      </div>

      <Modal
        isOpen={isAdditionalInformationModalOpen}
        onClose={handleCloseRemarkModal}
        title={isEditMode ? "Update Remark" : "Add Remark"}
        onSubmit={handleAdditionalInformationFormSubmit}
        saveText={isEditMode ? "Update" : "Add"}
        loading={isLoading}
        size="xl"
      >
        <div className="space-y-4 p-6 bg-blue-100">

          <SinglePageSelection
            label="Reason For Inactivity"
            placeholder="Select Reason For Inactivity"
            required
            error={errors.ReasonForInactivity}
            value={formData.ReasonForInactivity}
            onChange={(e) => {
              handleFieldChange("ReasonForInactivity", String(e));
            }}
            options={REASON_FOR_INAACTIVITY.map((opt) => ({
              label: opt.name,
              value: opt.id,
            }))}
          />

          <TextArea
            label="Remark"
            placeholder="Enter Remark"
            required
            className='thin-scroll'
            value={formData.Remarks}
            onChange={(e) => handleFieldChange("Remarks", e.target.value)}
            error={errors.Remarks} />

          <ToggleSwitch
            label="Additonal Support Required"
            name="AdditonalSupportRequired"
            value={formData.AdditonalSupportRequired === "1"}
            onChange={(_, value) =>
              handleFieldChange("AdditonalSupportRequired", value ? "1" : "0")
            }
          />

          <ToggleSwitch
            label="Additional Support Provided"
            name="AdditionalSupportProvided"
            value={formData.AdditionalSupportProvided === "1"}
            onChange={(_, value) =>
              handleFieldChange("AdditionalSupportProvided", value ? "1" : "0")
            }
          />

        </div>
      </Modal>

      <DeleteDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setEditChannelPartnerUniverseAdditionalInformation(null);
        }}
        onConfirm={handleConfirmDeleteAdditionalInformation}
        loading={isLoading}
        pageName='Additional Information'
      />

    </div>
  );
};

export default ViewChannelPartnerUniverse;


