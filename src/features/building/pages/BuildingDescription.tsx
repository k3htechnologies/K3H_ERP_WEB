import { useLocation, useNavigate } from "react-router-dom";
import { Input } from "@/ui/components/forms/Input";
import * as E from "fp-ts/Either";
import { runApiWithLoader } from "@/core/utils";
import { buildingService } from "@/features/building/services/BuildingService";
import { useToast } from "@/core/hooks/useToast";
import { Loader } from "@/core/utils/loader";
import { useEffect, useState } from "react";
import React from "react";
import { filterNumbersWithDecimal, filterMobile, filterEmail, filterLetters, filterNumbers } from "@/core/utils/fileValidation";
import type { AddUpdateBuildingDetailsRequest, FilterWithPaginationBuildingDetailsRequest, BuildingKeyContactDetails } from "@/features/building/models/BuildingModel";
import BottomActionBar from "@/ui/components/forms/BottomActionBar";
import { useMenuPermissions } from "@/features/menu/hooks/useMenuPermissions";


const initialFormState = (): AddUpdateBuildingDetailsRequest => ({
  BuildingId: 0,
  ProjectId: 0,
  GrossPlotAreaSqFt: 0,
  PlotAreaPhysicalSurveySqFt: undefined,
  PlotAreaOldApprovedPlanSqFt: undefined,
  PlotAreaConveyanceSqFt: undefined,
  PlotAreaPRCardSqFt: undefined,
  TotalBuiltUpAreaSqFt: 0,
  TotalResidentialUnits: undefined,
  TotalResidentialCarpetAreaSqFt: undefined,
  TotalCommercialUnits: undefined,
  TotalCommercialCarpetAreaSqFt: undefined,
  BuildingKeyContactDetailsJSON: undefined
});

const BuildingDescription: React.FC = () => {
  //#region STATE MANAGEMENT
  const [formData, setFormData] = useState<AddUpdateBuildingDetailsRequest>(() => initialFormState());
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');

  // NAVIGATE
  const navigate = useNavigate();
  const location = useLocation();

  const locationStateDetails = useLocation() as {
    state?: {
      buildingId?: number;
      projectId?: number;
      listState?: {
        page?: number;
        filters?: any;
        sortInfo?: any;
        searchTerm?: string;
        buildingId?: number;
        projectId?: number;
        buildingName?: string;
      };
    };
  };

  const preservedListState = locationStateDetails.state?.listState;
  const buildingId = preservedListState?.buildingId || 0;
  const projectId = preservedListState?.projectId || 0;
  const buildingName = preservedListState?.buildingName || 0;

  // TOAST
  const { addToast } = useToast();

  //ERROR SET UP
  const [errors, setErrors] = useState<{ [k: string]: string }>({});

  //#region BUILDING KEY CONTACT DETAILS
  const [contactDetailsList, setContactDetailsList] = useState<Omit<BuildingKeyContactDetails, 'BuildingId' | 'ProjectId' | 'CreatedById' | 'CreatedBy' | 'CreatedDate' | 'ModifiedById' | 'ModifiedBy' | 'ModifiedDate' | 'LastModifiedBy' | 'LastModifiedDate'>[]>([]);
  const [contactDetailsErrors, setContactDetailsErrors] = useState<{ [key: number]: { [k: string]: string } }>({});

  //#endregion

  //#region MENU PERMISSIONS
  const { canAction } = useMenuPermissions('/building');
  //#endregion

  //#region HANDLE FILED CHNAGE EVENT
  const handleFieldChange = (field: keyof AddUpdateBuildingDetailsRequest, value: any) => {

    setFormData((prev) => ({ ...prev, [field]: value }));

    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };
  //#endregion

  //#region INITIALIZATION
  useEffect(() => {
    if (buildingId && buildingId > 0) {
      fetchBuildingDetailsDetails();
      return;
    }


  }, [buildingId]);
  //#endregion

  //#region FETCH BUILDING DETAILS DETAILS
  const fetchBuildingDetailsDetails = async () => {
    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {

        const params: FilterWithPaginationBuildingDetailsRequest = {
          ProjectId: projectId,
          BuildingId: buildingId
        }

        const response = await buildingService.apiCallPullBuildingDetails(params);

        if (E.isRight(response)) {

          const row = response.right.Data?.[0];

          if (row) {
            setFormData(prev => ({
              ...prev,
              BuildingId: buildingId,
              ProjectId: projectId,
              GrossPlotAreaSqFt: row.GrossPlotAreaSqFt ?? prev.GrossPlotAreaSqFt ?? 0,
              PlotAreaPhysicalSurveySqFt: row.PlotAreaPhysicalSurveySqFt ?? prev.PlotAreaPhysicalSurveySqFt,
              PlotAreaOldApprovedPlanSqFt: row.PlotAreaOldApprovedPlanSqFt ?? prev.PlotAreaOldApprovedPlanSqFt,
              PlotAreaConveyanceSqFt: row.PlotAreaConveyanceSqFt ?? prev.PlotAreaConveyanceSqFt,
              PlotAreaPRCardSqFt: row.PlotAreaPRCardSqFt ?? prev.PlotAreaPRCardSqFt,
              TotalBuiltUpAreaSqFt: row.TotalBuiltUpAreaSqFt ?? prev.TotalBuiltUpAreaSqFt ?? 0,
              TotalResidentialUnits: row.TotalResidentialUnits ?? prev.TotalResidentialUnits,
              TotalResidentialCarpetAreaSqFt: row.TotalResidentialCarpetAreaSqFt ?? prev.TotalResidentialCarpetAreaSqFt,
              TotalCommercialUnits: row.TotalCommercialUnits ?? prev.TotalCommercialUnits,
              TotalCommercialCarpetAreaSqFt: row.TotalCommercialCarpetAreaSqFt ?? prev.TotalCommercialCarpetAreaSqFt
            }));

            // Parse contact details from JSON
            if (row.BuildingKeyContactDetailsData && row.BuildingKeyContactDetailsData.length > 0) {

              const contacts = row.BuildingKeyContactDetailsData.map(contact => ({
                BuildingKeyContactDetailsId: contact.BuildingKeyContactDetailsId ?? 0,
                Uniquekey: contact.Uniquekey ?? null,
                ContactType: contact.ContactType ?? '',
                ContactName: contact.ContactName ?? '',
                MobileNumber: contact.MobileNumber ?? '',
                EmailId: contact.EmailId ?? ''
              }));

              setContactDetailsList(contacts);

            } else {

              setContactDetailsList([]);
            }
          }
        } else {

          addToast({ type: 'error', title: response.left.message });

        }

        return response
      },
      undefined,
      (error: any) => {
        addToast({ type: 'error', title: error.message })
      },
      undefined,
      'Loading Building Details'
    )
  }
  //#endregion

  //#region [VALIDATION FUNCTION]

  const validateAddBuildingDetailsForm = (): {

    isValid: boolean

    errors: { [key: string]: string }

  } => {

    const newErrors: { [key: string]: string } = {}

    if (formData.GrossPlotAreaSqFt === null || formData.GrossPlotAreaSqFt === undefined || formData.GrossPlotAreaSqFt <= 0) {
      newErrors.GrossPlotAreaSqFt = "Gross Plot Area is required.";
    }

    if (formData.TotalBuiltUpAreaSqFt === null || formData.TotalBuiltUpAreaSqFt === undefined || formData.TotalBuiltUpAreaSqFt <= 0) {
      newErrors.TotalBuiltUpAreaSqFt = "Total Built Up Area is required.";
    }

    return {
      isValid: Object.keys(newErrors).length === 0,
      errors: newErrors
    }
  }
  //#endregion

  //#region ADD UPDATE BUILDING DETAILS
  const PushBuildingDetailsFormData = (): AddUpdateBuildingDetailsRequest => {
    // Convert contact details list to JSON string
    const contactDetailsJSON = contactDetailsList.length > 0
      ? JSON.stringify(contactDetailsList.map(contact => ({
        BuildingKeyContactDetailsId: contact.BuildingKeyContactDetailsId ?? 0,
        Uniquekey: contact.Uniquekey ?? null,
        ContactType: contact.ContactType ?? '',
        ContactName: contact.ContactName ?? '',
        MobileNumber: contact.MobileNumber ?? '',
        EmailId: contact.EmailId ?? ''
      })))
      : '';

    return {
      BuildingId: buildingId,
      ProjectId: projectId,
      GrossPlotAreaSqFt: formData.GrossPlotAreaSqFt ?? 0,
      PlotAreaPhysicalSurveySqFt: formData.PlotAreaPhysicalSurveySqFt ?? undefined,
      PlotAreaOldApprovedPlanSqFt: formData.PlotAreaOldApprovedPlanSqFt ?? undefined,
      PlotAreaConveyanceSqFt: formData.PlotAreaConveyanceSqFt ?? undefined,
      PlotAreaPRCardSqFt: formData.PlotAreaPRCardSqFt ?? undefined,
      TotalBuiltUpAreaSqFt: formData.TotalBuiltUpAreaSqFt ?? 0,
      TotalResidentialUnits: formData.TotalResidentialUnits ?? undefined,
      TotalResidentialCarpetAreaSqFt: formData.TotalResidentialCarpetAreaSqFt ?? undefined,
      TotalCommercialUnits: formData.TotalCommercialUnits ?? undefined,
      TotalCommercialCarpetAreaSqFt: formData.TotalCommercialCarpetAreaSqFt ?? undefined,
      BuildingKeyContactDetailsJSON: contactDetailsJSON
    };

  };

  const handleSubmit = async () => {

    setErrors({})


    const validation = validateAddBuildingDetailsForm()

    if (!validation.isValid) {

      setErrors(validation.errors)

      return
    }

    await runApiWithLoader(
      setIsLoading,

      setLoadingMessage,
      async () => {

        const payload = PushBuildingDetailsFormData();

        const response = await buildingService.apiCallAddUpdateBuildingDetails(payload);

        if (E.isRight(response)) {

          addToast({ type: "success", title: formData.BuildingId && formData.BuildingId > 0 ? "Building details updated successfully" : "Building details added successfully" });

          const locationState = location.state as {
            listState?: {
              page?: number;
              filters?: any;
              sortInfo?: any;
              searchTerm?: string;
              buildingId?: number;
              buildingName?: string;
              projectId?: number
            };
          } | null;

          const listState = locationState?.listState || {
            page: 1,
            filters: {},
            sortInfo: undefined,
            searchTerm: '',
            buildingId: buildingId,
            buildingName: buildingName,
            projectId: projectId
          };

          navigate("/building", {
            state: { listState }
          });


        } else {

          addToast({ type: "error", title: response.left?.message });

        }
        return response;
      },
      undefined,
      (error: any) => {

        addToast({ type: 'error', title: error.message })
      },
      undefined,

      formData.BuildingId && formData.BuildingId > 0 ? 'Update Building Details' : 'Add Building Details'
    )

  };

  //#endregion

  return (


    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">

      <Loader loading={isLoading} title={loadingMessage}>  <div></div> </Loader>


      <div className="flex-1 space-y-2 px-6 py-3 overflow-y-auto thin-scroll ">
        <form onSubmit={handleSubmit}>
          {/* ============================================================= [BUILDING PLOT AREA] ============================================================================================= */}
          <div className="space-y-4 pb-3">
            <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-300 pb-2">Building Plot Area</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <Input
                  label="Gross Plot Area (SqFt)"
                  required
                  error={errors.GrossPlotAreaSqFt}
                  type="text"
                  value={formData.GrossPlotAreaSqFt || ''}
                  onChange={(e) => handleFieldChange('GrossPlotAreaSqFt', filterNumbersWithDecimal(e.target.value) || 0)}
                  placeholder="Enter gross plot Area"
                  rightIcon="SqFt"
                />
              </div>
              <div>
                <Input
                  label="Plot Area Physical Survey (SqFt)"
                  type="text"
                  value={formData.PlotAreaPhysicalSurveySqFt || ''}
                  onChange={(e) => handleFieldChange('PlotAreaPhysicalSurveySqFt', filterNumbersWithDecimal(e.target.value) || 0)}
                  placeholder="Enter Physical Survey Area"
                  rightIcon="SqFt"
                />
              </div>
              <div>
                <Input
                  label="Plot Area Old Approved Plan (SqFt)"
                  type="text"
                  value={formData.PlotAreaOldApprovedPlanSqFt || ''}
                  onChange={(e) => handleFieldChange('PlotAreaOldApprovedPlanSqFt', filterNumbersWithDecimal(e.target.value) || 0)}
                  placeholder="Enter Old Approved Plan Area"
                  rightIcon="SqFt"
                />
              </div>
              <div>
                <Input
                  label="Plot Area Conveyance (SqFt)"
                  type="text"
                  value={formData.PlotAreaConveyanceSqFt || ''}
                  onChange={(e) =>

                    handleFieldChange('PlotAreaConveyanceSqFt', filterNumbersWithDecimal(e.target.value) || 0)}

                  placeholder="Enter Conveyance Area"
                  rightIcon="SqFt"
                />
              </div>
              <div>
                <Input
                  label="Plot Area PR Card (SqFt)"
                  type="text"
                  value={formData.PlotAreaPRCardSqFt || ''}
                  onChange={(e) => handleFieldChange('PlotAreaPRCardSqFt', filterNumbersWithDecimal(e.target.value) || 0)}
                  placeholder="Enter PR Card Area"
                  rightIcon="SqFt"
                />
              </div>
            </div>
          </div>

          {/* ============================================================= [BUILDING CONSTRUCTION DETAILS] ============================================================================================= */}
          <div className="space-y-4 pb-3 pt-3">
            <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-300 pb-2">Building Construction Details</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <Input
                  label="Total Built Up Area (SqFt)"
                  required
                  error={errors.TotalBuiltUpAreaSqFt}
                  type="text"
                  value={formData.TotalBuiltUpAreaSqFt || ''}
                  onChange={(e) => handleFieldChange('TotalBuiltUpAreaSqFt', filterNumbersWithDecimal(e.target.value) || 0)}
                  placeholder="Enter Total Built Up Area"
                  rightIcon="SqFt"
                />
              </div>
              <div>
                <Input
                  label="Total Residential Units"
                  type="text"
                  value={formData.TotalResidentialUnits || ''}
                  maxLength={9}
                  onChange={(e) => handleFieldChange('TotalResidentialUnits', filterNumbers(e.target.value) || 0)}
                  placeholder="Enter Residential Units"
                />
              </div>
              <div>
                <Input
                  label="Total Residential Carpet Area (SqFt)"
                  type="text"
                  value={formData.TotalResidentialCarpetAreaSqFt || ''}
                  onChange={(e) => handleFieldChange('TotalResidentialCarpetAreaSqFt', filterNumbersWithDecimal(e.target.value) || 0)}
                  placeholder="Enter Residential Carpet Area"
                  rightIcon="SqFt"
                />
              </div>
              <div>
                <Input
                  label="Total Commercial Units"
                  type="text"
                  maxLength={9}
                  value={formData.TotalCommercialUnits || ''}
                  onChange={(e) => handleFieldChange('TotalCommercialUnits', filterNumbers(e.target.value) || 0)}
                  placeholder="Enter Commercial Units"
                />
              </div>
              <div>
                <Input
                  label="Total Commercial Carpet Area (SqFt)"
                  type="text"
                  value={formData.TotalCommercialCarpetAreaSqFt || ''}
                  onChange={(e) => handleFieldChange('TotalCommercialCarpetAreaSqFt', filterNumbersWithDecimal(e.target.value) || 0)}
                  placeholder="Enter Commercial Carpet Area"
                  rightIcon="SqFt"
                />
              </div>
            </div>
          </div>

          {/* ============================================================= [BUILDING KEY CONTACT DETAILS] ============================================================================================= */}
          <div className="space-y-4 pb-3 pt-3">
            <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-300 pb-2">Building Key Contact Details</h3>

            <div className="space-y-6">
              {contactDetailsList.map((contact, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-200">

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div>
                      <Input
                        label="Contact Type"
                        type="text"
                        disabled
                        value={contact.ContactType || ''}
                        onChange={(e) => {
                          const updatedList = [...contactDetailsList];
                          updatedList[index] = { ...updatedList[index], ContactType: filterLetters(e.target.value) };
                          setContactDetailsList(updatedList);
                          if (contactDetailsErrors[index]?.ContactType) {
                            setContactDetailsErrors(prev => ({
                              ...prev,
                              [index]: { ...prev[index], ContactType: '' }
                            }));
                          }
                        }}
                        placeholder="e.g., Chairman, Secretary"
                        error={contactDetailsErrors[index]?.ContactType}
                      />
                    </div>
                    <div>
                      <Input
                        label="Contact Name"
                        type="text"
                        value={contact.ContactName || ''}
                        onChange={(e) => {
                          const updatedList = [...contactDetailsList];
                          updatedList[index] = { ...updatedList[index], ContactName: filterLetters(e.target.value) };
                          setContactDetailsList(updatedList);
                          if (contactDetailsErrors[index]?.ContactName) {
                            setContactDetailsErrors(prev => ({
                              ...prev,
                              [index]: { ...prev[index], ContactName: '' }
                            }));
                          }
                        }}
                        placeholder="Enter Contact Name"
                        error={contactDetailsErrors[index]?.ContactName}
                      />
                    </div>
                    <div>
                      <Input
                        label="Mobile Number"
                        type="text"
                        value={contact.MobileNumber || ''}
                        onChange={(e) => {
                          const updatedList = [...contactDetailsList];
                          updatedList[index] = { ...updatedList[index], MobileNumber: filterMobile(e.target.value) };
                          setContactDetailsList(updatedList);
                          if (contactDetailsErrors[index]?.MobileNumber) {
                            setContactDetailsErrors(prev => ({
                              ...prev,
                              [index]: { ...prev[index], MobileNumber: '' }
                            }));
                          }
                        }}
                        placeholder="Enter Mobile Number"
                        maxLength={10}
                        leftIcon="+91"
                        error={contactDetailsErrors[index]?.MobileNumber}
                      />
                    </div>
                    <div className="md:col-span-2 lg:col-span-1">
                      <Input
                        label="Email ID"
                        type="text"
                        value={contact.EmailId || ''}
                        onChange={(e) => {
                          const updatedList = [...contactDetailsList];
                          updatedList[index] = { ...updatedList[index], EmailId: filterEmail(e.target.value) };

                          setContactDetailsList(updatedList);

                          if (contactDetailsErrors[index]?.EmailId) {

                            setContactDetailsErrors(prev => ({

                              ...prev,

                              [index]: { ...prev[index], EmailId: '' }

                            }));
                          }
                        }}
                        placeholder="Enter Email Id"
                        error={contactDetailsErrors[index]?.EmailId}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </form>
      </div>

      <BottomActionBar
        cancelText="Cancel"
        saveText={formData.BuildingId && formData.BuildingId > 0 ? "Update" : "Add"}
        onCancel={() => navigate(-1)}
        canAction={canAction}
        onSave={() => {
          handleSubmit();
        }}
        isLoading={isLoading}
      />


    </div>
  );
};

export default BuildingDescription;
