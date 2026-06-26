import { useNavigate } from "react-router-dom";
import type { ChannelPartnerSourcingData, AddUpdateChannelPartnerSourcingRequest } from "../models/ChannelPartnerSourcingModel";
import { FieldItem } from "@/ui/components/forms/FieldItem";
import HeaderActionBar from "@/ui/components/forms/HeaderActionBar";
import { useMenuPermissions } from "@/features/menu/hooks/useMenuPermissions";
import { useEffect, useState } from "react";
import { runApiWithLoader } from "@/core/utils";
import * as E from "fp-ts/Either";
import { useToast } from "@/core/hooks/useToast";
import { Loader } from "@/core/utils/loader";
import type { FilterWithPaginationChannelPartnerSourcingRequest } from "@/features/ChannelPartnerSourcing/models/ChannelPartnerSourcingModel";
import { ChannelPartnerSourcingService } from "@/features/ChannelPartnerSourcing/services/ChannelPartnerSourcingService";
import { useChannelPartnerSourcingListState } from "@/features/ChannelPartnerSourcing/context/ChannelPartnerSourcingListStateContext";
import { useProject } from "@/features/projectMaster/context/ProjectContext";
import { fetchChannelPartnerById } from "@/features/ChannelPartner/channelPartnerDropDown";
import { Button } from "@/ui/components/forms/Button";
import { Modal } from "@/ui/components/Modal/Modal";
import { TextArea } from "@/ui/components/forms/Textarea";
import RadioPill from "@/ui/components/forms/RadioPill";
import { formatDate_dd_MonthName_yy, formatDate_dd_MonthName_yy_hh_mm } from "@/core/utils/dateFormat";
import { Edit, Trash2 } from "lucide-react";
import NoDataView from "@/ui/components/NoDataView/NoDataView";
import { Tabs, type TabItem } from "@/ui/components/Tab/Tab";
import { DeleteDialog } from "@/ui/components/forms/DeleteDialog";
import { SinglePageSelection } from "@/ui/components/DropDown/SinglePageSelection";
import { SUPPORT_TYPE_OPTIONS } from "@/core/constants";
import { isDateWithinPastDays } from "@/core/utils/comman";
import type { ChannelPartnerData } from "@/features/ChannelPartner/models/ChannelPartnerModel";

const initialFormState = (): AddUpdateChannelPartnerSourcingRequest => ({
  ChannelPartnerSourcingId: 0,
  Uniquekey: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  ChannelPartnerId: 0,
  ProjectId: 0,
  SourcingRemark: "",
  Support: "",
  IBM_OBM: "IBM",
  OTP: "",
});


const ViewChannelPartnerSourcing: React.FC = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { canAction } = useMenuPermissions('sourcing');

  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [editChannelPartnerData, setEditChannelPartnerData] = useState<ChannelPartnerData | null>(null);

  const [sourcingDataList, setSourcingDataList] = useState<ChannelPartnerSourcingData[]>([]);
  const [activeTab, setActiveTab] = useState<"ALL" | "IBM" | "OBM">("ALL");
  const [isRemarkModalOpen, setIsRemarkModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedRemark, setSelectedRemark] = useState<ChannelPartnerSourcingData | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const [formData, setFormData] = useState<AddUpdateChannelPartnerSourcingRequest>(() => initialFormState());

  const [errors, setErrors] = useState<{ [k: string]: string }>({});

  const [ibmobm, setIbmObm] = useState<string>("IBM");

  const { listState } = useChannelPartnerSourcingListState();

  const { projectId } = useProject();

  useEffect(() => {
    if (listState.channelPartnerId) {
      loadSourcingDetails();
    }
  }, [listState.channelPartnerId, activeTab]);

  useEffect(() => {
    const channelPartnerId = listState.channelPartnerId || 0;


    fetchChannelPartnerById(Number(channelPartnerId), Number(projectId)).then(channelPartner => {

      if (!channelPartner) return;

      setEditChannelPartnerData(channelPartner);
    });

  }, [listState.channelPartnerId]);

  const loadSourcingDetails = async () => {
    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {

        const params: FilterWithPaginationChannelPartnerSourcingRequest = {
          PageNumber: 1,
          PageSize: 100,
          ChannelPartnerId: listState.channelPartnerId || undefined,
          ProjectId: projectId || undefined,
        };

        const response = await ChannelPartnerSourcingService.apiCallPullChannelPartnerSourcing(params);

        if (E.isRight(response)) {

          let filteredData = response.right.Data || [];


          if (activeTab !== "ALL") {

            filteredData = filteredData.filter(item => item.IBM_OBM === activeTab);
          }

          // Always sort (ALL or filtered)
          filteredData.sort((a, b) => {
            const dateA = a.CreatedDate ? new Date(a.CreatedDate).getTime() : 0;
            const dateB = b.CreatedDate ? new Date(b.CreatedDate).getTime() : 0;
            return dateB - dateA;
          });

          setSourcingDataList(filteredData);

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
      "Loading Channel Partner Sourcing"
    );
  };

  const handleBackToList = () => {
    navigate("/sourcing");
  };

  //#region HANDLE FILED CHNAGE EVENT
  const handleFieldChange = (field: keyof AddUpdateChannelPartnerSourcingRequest, value: any) => {

    setFormData((prev) => ({ ...prev, [field]: value }));

    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };
  //#endregion

  const handleOpenRemarkModal = (item?: ChannelPartnerSourcingData) => {
    const ibmObmValue = activeTab === "ALL" ? "IBM" : activeTab;

    if (item) {
      setFormData({
        ChannelPartnerSourcingId: item.ChannelPartnerSourcingId,
        Uniquekey: item.Uniquekey || "3fa85f64-5717-4562-b3fc-2c963f66afa6",
        ChannelPartnerId: item.ChannelPartnerId,
        ProjectId: projectId || 0,
        SourcingRemark: item.SourcingRemark || "",
        Support: item.Support || "",
        IBM_OBM: item.IBM_OBM || ibmObmValue
      });
      setIbmObm(item.IBM_OBM || ibmObmValue);
      setIsEditMode(true);
      setSelectedRemark(item);
    } else {
      setFormData({
        ChannelPartnerSourcingId: 0,
        Uniquekey: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
        ChannelPartnerId: listState.channelPartnerId || 0,
        ProjectId: projectId || 0,
        SourcingRemark: "",
        Support: "",
        IBM_OBM: ibmObmValue
      });
      setIbmObm(ibmObmValue);
      setIsEditMode(false);
      setSelectedRemark(null);
    }
    setErrors({});
    setIsRemarkModalOpen(true);
  };

  const handleCloseRemarkModal = () => {
    setIsRemarkModalOpen(false);
    setIsEditMode(false);
    setSelectedRemark(null);
    setFormData({
      ChannelPartnerSourcingId: 0,
      Uniquekey: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      ChannelPartnerId: 0,
      ProjectId: 0,
      SourcingRemark: "",
      Support: "",
      IBM_OBM: activeTab
    });
    setErrors({});
  };

  const validateRemarkForm = (): boolean => {
    const errors: { SourcingRemark?: string; IBM_OBM?: string } = {};

    if (!formData.SourcingRemark?.trim()) {
      errors.SourcingRemark = "Remark is required";
    } else if (formData.SourcingRemark.trim().length < 25) {
      errors.SourcingRemark = "Remark must be at least 25 characters";
    }

    if (!formData.IBM_OBM?.trim()) {
      errors.IBM_OBM = "IBM / OBM selection is required";
    }

    if (formData.IBM_OBM?.trim() === "ALL") {
      addToast({ type: "error", title: "IBM / OBM selection is required" });
    }

    setErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleRemarkFormSubmit = async (e: React.FormEvent) => {

    e.preventDefault();

    if (!validateRemarkForm()) {

      return;

    }

    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {
        const params: AddUpdateChannelPartnerSourcingRequest = {
          ChannelPartnerSourcingId: formData.ChannelPartnerSourcingId,
          Uniquekey: formData.Uniquekey || "3fa85f64-5717-4562-b3fc-2c963f66afa6",
          ChannelPartnerId: editChannelPartnerData?.ChannelPartnerId || 0,
          ProjectId: projectId || 0,
          SourcingRemark: formData.SourcingRemark?.trim() || "",
          Support: formData.Support?.trim() || "",
          IBM_OBM: formData.IBM_OBM
        };

        const response = await ChannelPartnerSourcingService.apiCallAddUpdateChannelPartnerSourcing(params);

        if (E.isRight(response)) {

          addToast({ type: "success", title: response.right.SuccessMessage?.[0] });
          handleCloseRemarkModal();
          loadSourcingDetails();

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
      isEditMode ? "Updating Remark" : "Adding Remark"
    );
  };

  const handleDeleteRemark = (item: ChannelPartnerSourcingData) => {
    setSelectedRemark(item);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDeleteRemark = async () => {
    if (!selectedRemark) return;

    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {
        const response = await ChannelPartnerSourcingService.apiCallDeleteChannelPartnerSourcing({
          ChannelPartnerSourcingId: selectedRemark.ChannelPartnerSourcingId,
          Uniquekey: selectedRemark.Uniquekey || ""
        });

        if (E.isRight(response)) {

          addToast({ type: "success", title: response.right.SuccessMessage?.[0] });

          setIsDeleteDialogOpen(false);

          setSelectedRemark(null);

          loadSourcingDetails();

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
      "Deleting Remark"
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-300 p-6">
      <Loader loading={isLoading} title={loadingMessage}>
        <div></div>
      </Loader>

      <HeaderActionBar
        titleText="Channel Partner : "
        subTitleText={listState.channelPartnerName || ''}
        subSubTitleText={editChannelPartnerData?.SystemGeneratedCode || ''}
        cancelText="Back"
        EditText="Edit"
        onCancel={handleBackToList}
        isLoading={false}
      />

      <div className="grid grid-cols-12 gap-4 pt-5">
        <div className="col-span-5">
          <div className="bg-white rounded-lg border border-gray-300 shadow-sm p-4">

            {/* HEADER DETAILS */}
            <div className="pl-4 pb-4 border-b-2 border-gray-300">
              <div className="flex flex-col gap-2">

                <div className="flex items-start">
                  <span className="text-gray-500 font-medium text-sm w-[140px]">
                    Company Name
                  </span>
                  <span className="text-gray-500 font-medium text-sm px-2">:</span>
                  <span className="text-black text-sm break-all">
                    {editChannelPartnerData?.CompanyName || '-'}
                  </span>
                </div>

                <div className="flex items-start">
                  <span className="text-gray-500 font-medium text-sm w-[140px]">
                    Firms Type
                  </span>
                  <span className="text-gray-500 font-medium text-sm px-2">:</span>
                  <span className="text-black text-sm break-all">
                    {editChannelPartnerData?.FirmsType || '-'}
                  </span>
                </div>

              </div>
            </div>

            {/* BASIC DETAILS */}
            <section className="p-4">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">
                Basic Details
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FieldItem label="CP Code" value={editChannelPartnerData?.SystemGeneratedCode || '-'} />
                <FieldItem label="Full Name" value={editChannelPartnerData?.Name || '-'} />
                <FieldItem label="E-mail Id" value={editChannelPartnerData?.EmailId || '-'} />
                <FieldItem label="DOB" value={formatDate_dd_MonthName_yy(editChannelPartnerData?.DateOfBirth ?? "-")} />
                <FieldItem label="Mobile No" value={!editChannelPartnerData?.MobileNumber ? "-" :  `${editChannelPartnerData?.MobileNumberCountryCode ?? "+91"}  ${editChannelPartnerData?.MobileNumber}`} />
                
                <FieldItem label="Designation" value={editChannelPartnerData?.Designation || '-'} />
                <FieldItem label="Speciality" value={editChannelPartnerData?.Speciality || '-'} />
                <FieldItem label="CP Type" value={editChannelPartnerData?.Type || '-'} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-1 pb-4 pt-4">
                <div className="text-sm font-medium text-[#1D1D1D80] truncate">
                  Website URL
                </div>
                {editChannelPartnerData?.WebsiteURL !== "" ?
                  <span className="text-blue-600 underline cursor-pointer break-all whitespace-normal"
                    onClick={() => window.open(editChannelPartnerData?.WebsiteURL, "_blank")}>
                    {editChannelPartnerData?.WebsiteURL}
                  </span> : "-"}
              </div>
            </section>

            <hr className="border-t border-gray-200" />

            {/* RERA DETAILS */}
            <section className="p-4">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">
                RERA Details
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FieldItem
                  label="Available RERA Number"
                  value={editChannelPartnerData?.RERANumber != "" ? 'Yes' : 'No'}
                />
                <FieldItem
                  label="RERA Number"
                  value={editChannelPartnerData?.RERANumber || '-'}
                />
              </div>
            </section>

            <hr className="border-t border-gray-200" />

            {/* ADDRESS DETAILS */}
            
              <section className="p-4">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">
                  Address
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                  <FieldItem label="Country" value={editChannelPartnerData?.CountryName ?? '-'} />
                  <FieldItem label="State" value={editChannelPartnerData?.StateName ?? '-'} />
                  <FieldItem label="District" value={editChannelPartnerData?.DistrictName ?? '-'} />
                  <FieldItem label="City" value={editChannelPartnerData?.CityName ?? '-'} />
                  <FieldItem label="Village" value={editChannelPartnerData?.VillageName ?? '-'} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-4 pt-5">
                  <FieldItem label="Office Address" value={editChannelPartnerData?.OfficeAddress} />
                </div>
              </section>

            <hr className="border-t border-gray-200" />

            <section className="p-4">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">
                Document Details
              </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                  <FieldItem label="PAN Number" value={editChannelPartnerData?.PanNumber} urls={editChannelPartnerData?.PanCardURL} isIcon />
                  <FieldItem label="Aadhaar Number" value={editChannelPartnerData?.AadharCardNumber} urls={editChannelPartnerData?.AadharCardURL} isIcon />
                  <FieldItem label="GST Number" value={editChannelPartnerData?.GSTNumber} urls={editChannelPartnerData?.GSTCertificateURL} isIcon />
                </div>
            </section>

            <hr className="border-t border-gray-200" />
            <section className="p-4">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">
                IBM & OBM  Details
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                <FieldItem label="No Of IBM" value={editChannelPartnerData?.NoOfIbm} />
                <FieldItem label="No Of OBM" value={editChannelPartnerData?.NoOfObm} />
              </div>
            </section>

            <hr className="border-t border-gray-200" />
            <section className="p-4">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">
                Primary & Secondary Project Portfolio
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-1 gap-4">
                <FieldItem label="Primary" value={editChannelPartnerData?.PrimaryProjectPortfolio} />
                <FieldItem label="Secondary" value={editChannelPartnerData?.SecondaryProjectPortfolio} />
                <FieldItem label="Micromarket Proximity" value={editChannelPartnerData?.MicromarketProximity} />
              </div>
            </section>

            <hr className="border-t border-gray-200" />
            <section className="p-4">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">
                Action Details
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                <FieldItem label="Created By" value={editChannelPartnerData?.CreatedBy} />
                <FieldItem label="Created Date" value={editChannelPartnerData?.CreatedDate ? formatDate_dd_MonthName_yy_hh_mm(editChannelPartnerData?.CreatedDate) : ""} />
                {editChannelPartnerData?.ModifiedBy && (
                  <>
                    <FieldItem label="Modified By" value={editChannelPartnerData?.ModifiedBy} />
                    <FieldItem label="Modified Date" value={editChannelPartnerData?.ModifiedDate ? formatDate_dd_MonthName_yy_hh_mm(editChannelPartnerData?.ModifiedDate) : ""} />
                  </>
                )}
              </div>
            </section>

          </div>

        </div>

        <div className="col-span-7">
          <div className="bg-white rounded-lg border border-gray-300 shadow-sm p-4 h-full">
            <div className="border-b pb-2 mt-1">
              <div className="flex items-start justify-between">
                <h1 className="text-lg font-semibold text-black">
                  Remark & Activity
                </h1>
                {canAction && (
                  <div className="flex items-center gap-2">
                    <Button
                      color="blue"
                      size="sm"
                      onClick={() => handleOpenRemarkModal()}
                      title="Add Remark"
                    >
                      Add Remark
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* IBM/OBM Tabs */}
            <div className="mt-4">
              <Tabs

                tabs={[
                  { id: "ALL", label: "ALL" },
                  { id: "IBM", label: "IBM" },
                  { id: "OBM", label: "OBM" }
                ]}
                defaultActive={activeTab}
                onTabChange={(tab: TabItem) => {
                  setActiveTab(tab.id as "ALL" | "IBM" | "OBM");
                }}
                isChips={true}
              />
            </div>

            {/* Timeline */}
            <div className="mt-3">

              {sourcingDataList?.length > 0 ? (
                sourcingDataList.map((item, index) => {
                  const isModified = !!(item.ModifiedBy && item.ModifiedDate);

                  return (

                    <div key={item.ChannelPartnerSourcingId} className="grid grid-cols-[24px_1fr] gap-3">
                      {/* LEFT — DOT + LINE */}
                      <div className="flex flex-col items-center">
                        <div className="h-4 w-4 rounded-full bg-blue-600"></div>

                        {index !== sourcingDataList.length - 1 && (
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

                          {index === 0 && canAction && item.IsAction && isDateWithinPastDays(item.CreatedDate, 2) ? (

                            <div className="flex items-center gap-1 ml-auto">

                              <div className="flex items-center gap-1 ml-auto">
                                <div
                                  className={`flex h-[25px] w-[67px]
                                              rounded-[6px]
                                              items-center justify-center
                                              font-bold text-sm
                                              ${item.IBM_OBM === "IBM"
                                      ? "bg-[#8A38F5]/15 text-[#8A38F5]"
                                      : item.IBM_OBM === "OBM"
                                        ? "bg-[#FFF2E2] text-[#FF9F2D]"
                                        : ""
                                    } `}
                                >
                                  {item.IBM_OBM || "-"}
                                </div>
                              </div>

                              <Button
                                color="transparent"
                                isborderRadius
                                size="sm"
                                title="Edit"
                                onClick={() => handleOpenRemarkModal(item)}
                                disabled={isLoading}
                                leftIcon={<Edit className="h-4 w-4" />}
                              />

                              <Button
                                color="transparent"
                                isborderRadius
                                size="sm"
                                style={{ color: "red", padding: "4px 8px" }}
                                title="Delete"
                                onClick={() => handleDeleteRemark(item)}
                                disabled={isLoading}
                                leftIcon={<Trash2 className="h-4 w-4" />}
                              />

                            </div>
                          ) :
                            <div className="flex items-center gap-1 ml-auto">
                              <div className={`flex h-[25px] w-[67px]
                                              rounded-[6px]
                                              items-center justify-center
                                              font-bold text-sm
                                              ${item.IBM_OBM === "IBM"
                                  ? "bg-[#8A38F5]/15 text-[#8A38F5]"
                                  : item.IBM_OBM === "OBM"
                                    ? "bg-[#FFF2E2] text-[#FF9F2D]"
                                    : ""
                                } `}


                              >
                                {item.IBM_OBM || "-"}
                              </div>
                            </div>

                          }
                        </div>

                        {item.Support?.toLowerCase() !== "" && (
                          <span className="block mt-1 text-xs text-gray-500 italic">
                            Support: {item.Support || "-"}
                          </span>
                        )}
                        <p className="mt-2 text-sm text-gray-700 leading-relaxed pb-5">
                          {item.SourcingRemark || "-"}
                        </p>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <NoDataView message={`No remarks found for ${activeTab}`} />
                </div>
              )}

            </div>
          </div>
        </div>
      </div>

      {/* Add/Edit Remark Modal */}
      <Modal
        isOpen={isRemarkModalOpen}
        onClose={handleCloseRemarkModal}
        title={isEditMode ? "Update Remark" : "Add Remark"}
        onSubmit={handleRemarkFormSubmit}
        saveText={isEditMode ? "Update" : "Add"}
        loading={isLoading}
        size="xl"
      >
        <div className="space-y-4 p-6 bg-blue-100">
          <div className="flex gap-3">
            <RadioPill
              name="IBM_OBM"
              label="IBM"
              value={formData.IBM_OBM ?? ''}
              checked={ibmobm === "IBM"}
              onChange={() => {
                setIbmObm("IBM");
                handleFieldChange("IBM_OBM", "IBM");
              }}

            />

            <RadioPill
              name="IBM_OBM"
              label="OBM"
              value={formData.IBM_OBM ?? ''}
              checked={ibmobm === "OBM"}
              onChange={() => {
                setIbmObm("OBM");
                handleFieldChange("IBM_OBM", "OBM");
              }}

            />

          </div>

          <TextArea
            label="Remark"
            placeholder="Enter Remark"
            required
            className='thin-scroll'
            value={formData.SourcingRemark}
            onChange={(e) => handleFieldChange("SourcingRemark", e.target.value)}
            error={errors.SourcingRemark} />



          <SinglePageSelection
            label='Support'
            placeholder="Select Support"
            error={errors.Support}
            value={formData.Support}
            onChange={(e) => {
              handleFieldChange('Support', String(e))
            }}

            options={SUPPORT_TYPE_OPTIONS.map((opt) => ({ label: opt.name, value: opt.id }))} />

        </div>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <DeleteDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setSelectedRemark(null);
        }}
        onConfirm={handleConfirmDeleteRemark}
        loading={isLoading}
        pageName='Remark'
      />
    </div>
  );
};

export default ViewChannelPartnerSourcing;


