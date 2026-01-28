import React, { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Input } from "@/ui/components/forms/Input";
import { Loader } from "@/core/utils/loader";
import { useToast } from "@/core/hooks/useToast";
import { OutDoorService } from "@/features/outdoor/services/OutDoorDataService";
import type { OutDoorMasterData, AddUpdateOutDoor } from "../models/OutDoorModel";
import * as E from "fp-ts/Either";
import { DatePickerInput } from "@/ui/components/forms/Datepicker";
import { TimePicker } from "@/ui/components/TimePicker/TimePicker";
import SingleSelectDropdownWithPagination from "@/ui/components/DropDown/SingleSelectDropdownWithPagination";
import { fetchDepartmentMasterDropdown } from "@/features/departmentMaster/departmentMasterDropdown";
import { createDropdownInitialValue } from "@/core/utils/createDropdownInitialValue";
import { MultiFilePicker, type FileValue } from "@/ui/components/ImagePicker/MultiFilePicker";
import MultiSelectPagination from "@/ui/components/DropDown/Multiselectpagination";
import { fetchEmployeeMasterDropdown } from "@/features/employeeMaster/employeeMasterDropDown";
import { convert_dd_mm_yyyy_To_Yyyy_mm_dd, formatDate_dd_mm_yyyy } from "@/core/utils/dateFormat";
import { runApiWithLoader } from '@/core/utils';
import { parseDocumentUrls } from '@/core/utils/documentUtils';
import { useMultiSelectDropdown } from '@/core/hooks/useMultiSelectDropdown';
import BottomActionBar from "@/ui/components/forms/BottomActionBar";
import { useMenuPermissions } from "@/features/menu/hooks/useMenuPermissions";

const initialFormState = (): AddUpdateOutDoor => ({
  OutdoorId: 0,
  Uniquekey: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  OutDoorDate: new Date().toISOString().split("T")[0],
  OutDoorTime: "00:00",
  AccompaniedById: "",
  DepartmentId: 0,
  CompanyName: "",
  CompanyAddress: "",
  VisitingCardURL: "",
  Purpose: "",
  Conclusion: "",
  PunchIn: "",
  PunchOut: "",
  PunchInAddress: "",
  PunchOutAddress: "",
});

export const AddUpdateOutDoorPage: React.FC = () => {
  //#region STATE MANAGEMENT
  const [outdoorFormData, setOutdoorFormData] = useState<AddUpdateOutDoor>(() => initialFormState());
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [selectedTime, setSelectedTime] = useState<string>("00:00");
  const [visitingCardFiles, setVisitingCardFiles] = useState<FileValue[]>([]);
  const [removedVisitingCardUrls, setRemovedVisitingCardUrls] = useState<string[]>([]);
  const initialVisitingCardUrlsRef = useRef<string[]>([]);
  const [dropdownLabels, setDropdownLabels] = useState<{ departmentName?: string; }>({});
  const [selectedDepartmentName, setSelectedDepartmentName] = useState<string>("");
  const hasFetchedOutDoor = useRef(false);

  // NAVIGATE
  const navigate = useNavigate();

  //GET VALUE FROM URL :ID
  const { outdoorId } = useParams<{ outdoorId?: string }>();

  // TOAST
  const { addToast } = useToast();

  //#region MENU PERMISSIONS
  const { canAction } = useMenuPermissions('/outdoor');
  //#endregion

  //#region HANDLE CHNAGE EVENT WHEN INPUT BOX ANY OTHER
  const handleFieldChange = useCallback((field: keyof AddUpdateOutDoor, value: string | number) => {
    setOutdoorFormData(prev => ({ ...prev, [field]: value }));
    setErrors(prev => {
      if (prev[field]) {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      }
      return prev;
    });
  }, []);
  //#endregion 

  //#region INITIALIZATION
  useEffect(() => {
    hasFetchedOutDoor.current = false;
  }, [outdoorId]);
  //#endregion

  //#region INIT
  const fetchOutDoorData = useCallback(async () => {
    if (!outdoorId || hasFetchedOutDoor.current) return;

    hasFetchedOutDoor.current = true;

    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {
        const apiResponse = await OutDoorService.apiCallPullOutDoorData({
          PageNumber: 1,
          PageSize: 1000,
        });

        if (E.isRight(apiResponse)) {
          const outdoor = apiResponse.right.Data?.find((o: OutDoorMasterData) => o.OutdoorId === Number(outdoorId));
          if (outdoor) {
            const parseDateFromISO = (isoString: string): string => {
              if (!isoString) return "";
              if (/^\d{4}-\d{2}-\d{2}$/.test(isoString)) {
                return isoString;
              }
              const dateMatch = isoString.match(/^(\d{4}-\d{2}-\d{2})/);
              return dateMatch ? dateMatch[1] : isoString;
            };

            const parseTimeFromISO = (isoString: string): string => {
              if (!isoString) return "00:00";
              if (/^\d{2}:\d{2}$/.test(isoString)) {
                return isoString;
              }
              const timeMatch = isoString.match(/T(\d{2}):(\d{2})/);
              return timeMatch ? `${timeMatch[1]}:${timeMatch[2]}` : "00:00";
            };

            const parsedDate = parseDateFromISO(outdoor.OutDoorDate || "");
            const parsedTime = parseTimeFromISO(outdoor.OutDoorTime || "");

            // Set department first, then form data, to ensure hook can fetch options correctly
            if (outdoor.DepartmentId && outdoor.DepartmentName) {
              const departmentName = outdoor.DepartmentName;
              setSelectedDepartmentName(departmentName);
              setDropdownLabels(prev => ({
                ...prev,
                departmentName: departmentName,
              }));
            }

            setOutdoorFormData({
              OutdoorId: outdoor.OutdoorId,
              Uniquekey: outdoor.Uniquekey,
              OutDoorDate: parsedDate,
              OutDoorTime: parsedTime,
              AccompaniedById: outdoor.AccompaniedById || "",
              DepartmentId: Number(outdoor.DepartmentId) || 0,
              CompanyName: outdoor.CompanyName || "",
              CompanyAddress: outdoor.CompanyAddress || "",
              VisitingCardURL: outdoor.VisitingCardURL || "",
              Purpose: outdoor.Purpose || "",
              Conclusion: outdoor.Conclusion || "",
              PunchIn: outdoor.PunchIn || "",
              PunchOut: outdoor.PunchOut || "",
              PunchInAddress: outdoor.PunchInAddress || "",
              PunchOutAddress: outdoor.PunchOutAddress || "",
            });

            initialVisitingCardUrlsRef.current = parseDocumentUrls(outdoor.VisitingCardURL || "");
            setRemovedVisitingCardUrls([]);
            setSelectedTime(parsedTime);

          } else {
            addToast({ type: "error", title: apiResponse.right.ErrorMessage?.[0] });
          }
        } else {
          addToast({ type: "error", title: apiResponse.left.message });
        }

        return apiResponse;
      },
      undefined,
      (error: any) => {
        addToast({ type: "error", title: error?.message });
      },
      undefined,
      'Loading Outdoor Data'
    );
  }, [outdoorId, addToast]);
  //#endregion

  useEffect(() => {
    if (outdoorId && initialVisitingCardUrlsRef.current.length > 0) {
      const currentUrls = parseDocumentUrls(outdoorFormData.VisitingCardURL || "");
      const removed = initialVisitingCardUrlsRef.current.filter(
        url => !currentUrls.includes(url)
      );
      setRemovedVisitingCardUrls(removed);
    }
  }, [outdoorFormData.VisitingCardURL, outdoorId]);

  useEffect(() => {
    if (outdoorId) {
      fetchOutDoorData();
    } else {
      // Reset form when in add mode
      setOutdoorFormData(initialFormState());
      setSelectedTime("00:00");
      setSelectedDepartmentName("");
      setDropdownLabels({});
      initialVisitingCardUrlsRef.current = [];
      setRemovedVisitingCardUrls([]);
      setErrors({});
    }
  }, [outdoorId, fetchOutDoorData]);

  //#endregion

  //#region FETCH EMPLOYEE DROPDOWN WITH DEPARTMENT
  const fetchEmployeeMasterDropdownWithDepartment = useCallback(
    async (pageNumber: number, params?: { value?: string }) => {
      return fetchEmployeeMasterDropdown(pageNumber, {
        ...params,
        departmentName: selectedDepartmentName || "",
      });
    },
    [selectedDepartmentName]
  );
  //#endregion

  // Memoize fetchParams to prevent unnecessary re-renders and API loops
  const fetchParams = useMemo(() => ({ 
    departmentName: selectedDepartmentName || "" 
  }), [selectedDepartmentName]);

  // Use multi-select dropdown hook for Accompanied By (moved after fetchEmployeeMasterDropdownWithDepartment)
  const hasDepartment = !!(selectedDepartmentName && outdoorFormData.DepartmentId && outdoorFormData.DepartmentId > 0);
  const accompaniedDropdown = useMultiSelectDropdown({
    value: outdoorFormData.AccompaniedById,
    fetchCallback: fetchEmployeeMasterDropdownWithDepartment,
    fetchParams: fetchParams,
    autoFetchOptions: hasDepartment && !!outdoorFormData.AccompaniedById,
  });

  // Note: The hook's autoFetchOptions will handle fetching when:
  // 1. The value (AccompaniedById) changes
  // 2. The fetchParams (departmentName) changes (via fetchOptionsForSelected dependency)
  // No manual refresh needed to avoid API loops

  //#region HANDLE ACCOMPANIED CHANGE
  const handleAccompaniedChange = useCallback((values: (string | number)[]) => {
    const { idsString } = accompaniedDropdown.handleChange(values);
    handleFieldChange("AccompaniedById", idsString);
  }, [handleFieldChange, accompaniedDropdown]);
  //#endregion

  //#region HANDLE DEPARTMENT SELECTED
  const handleDepartmentSelected = useCallback((item: { label: string; value: string | number | null }) => {
    const departmentId = item.value ? Number(item.value) : 0;
    const departmentName = item.label || "";

    handleFieldChange("DepartmentId", departmentId);
    setSelectedDepartmentName(departmentName);

    setDropdownLabels(prev => ({
      ...prev,
      departmentName: departmentName,
    }));

    setOutdoorFormData(prev => {
      if (prev.AccompaniedById) {
        return { ...prev, AccompaniedById: "" };
      }
      return prev;
    });
    // Options will reload automatically via useEffect when selectedDepartmentName changes
  }, [handleFieldChange]);
  //#endregion

  //#region VALIDATION
  const validateForm = (): { isValid: boolean; errors: { [key: string]: string } } => {
    const newErrors: { [key: string]: string } = {};

    if (!outdoorFormData.OutDoorDate?.trim()) {
      newErrors.OutDoorDate = "Outdoor date is required";
    }
    if (!outdoorFormData.OutDoorTime?.trim()) {
      newErrors.OutDoorTime = "Outdoor time is required";
    }

    if (!outdoorFormData.CompanyName?.trim()) {
      newErrors.CompanyName = "Company name is required";
    }

    if (!outdoorFormData.CompanyAddress?.trim()) {
      newErrors.CompanyAddress = "Company address is required";
    }

    if (!outdoorFormData.Purpose?.trim()) {
      newErrors.Purpose = "Purpose is required";
    }

    if (!outdoorFormData.DepartmentId || outdoorFormData.DepartmentId === 0) {
      newErrors.DepartmentId = "Department is required";
    }

    if (!outdoorFormData.AccompaniedById?.trim()) {
      newErrors.AccompaniedById = "Accompanied by field is required.";
    }

    return { isValid: Object.keys(newErrors).length === 0, errors: newErrors };
  };
  //#endregion

  //#region PUSH OUTDOOR FORM DATA
  const PushOutDoorFormData = (): FormData => {
    const fd = new FormData();

    const toIsoDateTime = (date: string, time: string): string => {
      if (!date || !time) return "";
      const [hh, mm] = time.split(":");
      const seconds = "00";
      const milliseconds = "513";
      return `${date}T${hh}:${mm}:${seconds}.${milliseconds}`;
    };

    const outDoorDateIso = toIsoDateTime(outdoorFormData.OutDoorDate, outdoorFormData.OutDoorTime);
    const outDoorTimeIso = toIsoDateTime(outdoorFormData.OutDoorDate, outdoorFormData.OutDoorTime);

    fd.append('OutdoorId', String(outdoorFormData.OutdoorId ?? 0));
    fd.append('Uniquekey', outdoorFormData.Uniquekey ?? '');
    fd.append('OutDoorDate', outDoorDateIso);
    fd.append('OutDoorTime', outDoorTimeIso);
    fd.append('AccompaniedById', outdoorFormData.AccompaniedById ?? '');
    fd.append('DepartmentId', String(outdoorFormData.DepartmentId ?? 0));
    fd.append('CompanyName', outdoorFormData.CompanyName ?? '');
    fd.append('CompanyAddress', outdoorFormData.CompanyAddress ?? '');
    fd.append('Purpose', outdoorFormData.Purpose ?? '');
    fd.append('Conclusion', outdoorFormData.Conclusion ?? '');
    fd.append('PunchIn', outdoorFormData.PunchIn ?? '');
    fd.append('PunchOut', outdoorFormData.PunchOut ?? '');
    fd.append('PunchInAddress', outdoorFormData.PunchInAddress ?? '');
    fd.append('PunchOutAddress', outdoorFormData.PunchOutAddress ?? '');

    visitingCardFiles.forEach(file => {
      if (file instanceof File) {
        fd.append('VisitingCardURL', file);
      }
    });

    fd.append('RemoveVisitingCardURL', removedVisitingCardUrls.join(','));

    return fd;
  };
  //#endregion

  //#region ADD UPDATE OUTDOOR
  const handleSubmit = async () => {
    setErrors({});
    const validation = validateForm();

    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {
        const pushOutDoorFormData = PushOutDoorFormData();

        const apiResponse = await OutDoorService.apiCallAddUpdateOutDoor(pushOutDoorFormData);

        if (E.isRight(apiResponse)) {
          const response = apiResponse.right;

          // Check backend ErrorMessage first
          if (response.ErrorMessage && response.ErrorMessage.length > 0) {
            addToast({
              type: "error",
              title: response.ErrorMessage[0]
            });
          } else if (response.WarningMessage && response.WarningMessage.length > 0) {
            addToast({
              type: "warning",
              title: response.WarningMessage[0]
            });
            navigate("/outdoor", {
              state: {
                listState: {
                  page: 1,
                  filters: {},
                  sortInfo: undefined,
                  searchTerm: ''
                }
              }
            });
          } else {
            // Success - use backend SuccessMessage
            addToast({
              type: 'success',
              title: response.SuccessMessage?.[0]
            });
            navigate("/outdoor", {
              state: {
                listState: {
                  page: 1,
                  filters: {},
                  sortInfo: undefined,
                  searchTerm: ''
                }
              }
            });
          }
        } else {
          addToast({
            type: "error",
            title: apiResponse.left.message,
          });
        }

        return apiResponse;
      },
      undefined,
      (error: any) => {
        addToast({
          type: "error",
          title: error.message
        });
      },
      undefined,
      outdoorFormData.OutdoorId === 0 ? 'Adding Outdoor Data...' : 'Updating Outdoor Data...'
    );
  };
  //#endregion


  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <Loader loading={isLoading} title={loadingMessage}>
        <div />
      </Loader>

      <div className="flex-1 space-y-2 px-6 py-3 overflow-y-auto thin-scroll">
        <form onSubmit={handleSubmit}>
          {/* ============================================================= [OUTDOOR DETAILS] ============================================================================================= */}
          <div className="space-y-4 pb-3">
            <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-500 pb-2">Outdoor Details</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <DatePickerInput
                  label="OutDoor Date"
                  value={formatDate_dd_mm_yyyy(outdoorFormData.OutDoorDate)}
                  onChange={(val) => handleFieldChange('OutDoorDate', convert_dd_mm_yyyy_To_Yyyy_mm_dd(val) || '')}
                  required
                  disabled={!!outdoorFormData.PunchIn}
                  error={errors.OutDoorDate}
                />
              </div>

              <div>
                <TimePicker
                  label="Meeting Time"
                  required
                  size="sm"
                  format={24}
                  value={selectedTime}
                  onChange={(val) => {
                    setSelectedTime(val);
                    handleFieldChange("OutDoorTime", val);
                  }}
                  disabled={!!outdoorFormData.PunchIn}
                  error={errors.OutDoorTime}
                />
              </div>

              <div>
                <SingleSelectDropdownWithPagination
                  label="Department"
                  title="Select Department"
                  size="md"
                  dataFetchCallBack={fetchDepartmentMasterDropdown}
                  onSelected={handleDepartmentSelected}
                  initialValue={createDropdownInitialValue(outdoorFormData.DepartmentId, dropdownLabels.departmentName)}
                  error={errors.DepartmentId}
                  required
                  disabled={!!outdoorFormData.PunchIn}
                />
              </div>

              <div className="space-y-1">
                <MultiSelectPagination
                  label="Accompanied By"
                  required
                  dataFetchCallBack={fetchEmployeeMasterDropdownWithDepartment}
                  selectedValues={accompaniedDropdown.selectedValues}
                  options={accompaniedDropdown.initialOptions}
                  onChange={handleAccompaniedChange}
                  disabled={!!outdoorFormData.PunchIn || !outdoorFormData.DepartmentId || outdoorFormData.DepartmentId === 0}
                />
                {errors.AccompaniedById && (
                  <p className="text-xs text-red-600">{errors.AccompaniedById}</p>
                )}
              </div>

              <div>
                <Input
                  label="Purpose"
                  required
                  size="md"
                  value={outdoorFormData.Purpose}
                  onChange={(e) => handleFieldChange('Purpose', e.target.value)}
                  error={errors.Purpose}
                />
              </div>

              <div>
                <Input
                  label="Company Name"
                  required
                  size="md"
                  value={outdoorFormData.CompanyName}
                  onChange={(e) => handleFieldChange('CompanyName', e.target.value)}
                  error={errors.CompanyName}
                  disabled={!!outdoorFormData.PunchIn}
                />
              </div>

              <div className="md:col-span-2">
                <Input
                  label="Company Address"
                  required
                  size="md"
                  value={outdoorFormData.CompanyAddress}
                  disabled={!!outdoorFormData.PunchIn}
                  onChange={(e) => handleFieldChange("CompanyAddress", e.target.value)}
                  error={errors.CompanyAddress}
                />
              </div>

              <div>
                <MultiFilePicker
                  label="Upload visiting card"
                  value={visitingCardFiles}
                  onChange={setVisitingCardFiles}
                  availableFilesURL={outdoorFormData?.VisitingCardURL ?? ""}
                  allowedTypes={["image/jpeg", "image/png", "application/pdf"]}
                  maxFiles={5}
                  maxSizeMB={10}
                />
              </div>
            </div>
          </div>
        </form>
      </div>

      <BottomActionBar
        cancelText="Cancel"
        saveText={outdoorFormData.OutdoorId && outdoorFormData.OutdoorId > 0 ? "Update" : "Add"}
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