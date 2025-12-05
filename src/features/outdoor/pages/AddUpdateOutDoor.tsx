
import { useNavigate, useParams } from "react-router-dom";
import { Input } from "@/ui/components/forms/Input";
import { Button } from "@/ui/components/forms/Button";
import { Loader } from "@/core/utils/loader";
import ToastContainer from "@/ui/components/Toast/ToastContainer";
import { useToast } from "@/core/hooks/useToast";
import { OutDoorDataService } from "@/features/outdoor/services/OutDoorDataService";
import type { OutDoorMasterData, AddUpdateOutDoor } from "../models/OutDoorModel";
import * as E from "fp-ts/Either";
import { useEffect, useState, useRef, useCallback } from "react";
import React from "react";
import { DatePickerInput } from "@/ui/components/forms/Datepicker";
import { TimePicker } from "@/ui/components/TimePicker/TimePicker";
import SingleSelectDropdownWithPagination from "@/ui/components/DropDown/SingleSelectDropdownWithPagination";
import { fetchDepartmentMasterDropdown } from "@/features/departmentMaster/departmentMasterDropdown";
import { createDropdownInitialValue } from "@/core/utils/createDropdownInitialValue";
import { MultiFilePicker, type FileValue } from "@/ui/components/ImagePicker/MultiFilePicker";
import MultiSelectPagination, { type DropdownOptions } from "@/ui/components/DropDown/Multiselectpagination";
import { fetchEmployeeMasterDropdown } from "@/features/employeeMaster/employeeMasterDropDown";
import { employeeMasterService } from "@/features/employeeMaster/services/EmployeeMasterService";
import { convert_dd_mm_yyyy_To_Yyyy_mm_dd, formatDate_dd_mm_yyyy } from "@/core/utils/dateFormat";
import { runApiWithLoader } from '@/core/utils';
import { parseDocumentUrls } from '@/core/utils/documentUtils';

export const AddUpdateOutDoorPage: React.FC = () => {
  //#region STATE MANAGEMENT
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMessage, setIsLoadingMessage] = useState("");
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [selectedTime, setSelectedTime] = useState<string>("00:00");
  const [visitingCardFiles, setVisitingCardFiles] = useState<FileValue[]>([]);
  const [removedVisitingCardUrls, setRemovedVisitingCardUrls] = useState<string[]>([]);
  const initialVisitingCardUrlsRef = useRef<string[]>([]);
  const [dropdownLabels, setDropdownLabels] = useState<{
    departmentName?: string;
  }>({});
  const [accompaniedByInitialValues, setAccompaniedByInitialValues] = useState<{ label: string; value: string | number }[]>([]);
  const [selectedDepartmentName, setSelectedDepartmentName] = useState<string>("");

  const hasFetchedOutDoor = useRef(false);

  const navigate = useNavigate();

  const { outdoorId } = useParams<{ outdoorId?: string }>();

  const { toasts, removeToast, addToast } = useToast();

  //#endregion

  //#region ADD UPDATE OUTDOOR REQUEST
  const [outdoorFormData, setOutdoorFormData] = useState<AddUpdateOutDoor>({
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
  //#endregion

  //#region HANDLE CHANGE EVENT
  const handleFieldChange = (field: keyof AddUpdateOutDoor, value: string | number) => {
    setOutdoorFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  }
  //#endregion

  
  const getAccompaniedByInitialValues = useCallback((): { label: string; value: string | number }[] | null => {
    if (accompaniedByInitialValues.length > 0) {
      return accompaniedByInitialValues;
    }
    if (!outdoorFormData.AccompaniedById) return null;
    const ids = outdoorFormData.AccompaniedById.split(',').map((id: string) => id.trim()).filter((id: string) => id);
    if (ids.length === 0) return null;
    return ids.map((id: string) => ({ label: id, value: id }));
  }, [outdoorFormData.AccompaniedById, accompaniedByInitialValues]);

  const fetchOutDoorData = useCallback(async () => {
    if (!outdoorId || hasFetchedOutDoor.current) return;

    hasFetchedOutDoor.current = true;
    setIsLoading(true);
    setIsLoadingMessage("Loading outdoor data...");

    try {
      const apiResponse = await OutDoorDataService.apiCallPullOutDoorData({
        PageNumber: 1,
        PageSize: 1,
        StartDate: "",
        EndDate: "",
      });

      if (E.isRight(apiResponse)) {
        const outdoor = apiResponse.right.Data.find((o: OutDoorMasterData) => o.OutdoorId === Number(outdoorId));
        if (outdoor) {
          // Parse ISO date format to YYYY-MM-DD for DatePicker
          const parseDateFromISO = (isoString: string): string => {
            if (!isoString) return "";
            // If already in YYYY-MM-DD format, return as is
            if (/^\d{4}-\d{2}-\d{2}$/.test(isoString)) {
              return isoString;
            }
            // If in ISO format (2025-12-03T09:00:50.513), extract date part
            const dateMatch = isoString.match(/^(\d{4}-\d{2}-\d{2})/);
            return dateMatch ? dateMatch[1] : isoString;
          };

          // Parse ISO time format to HH:mm for TimePicker
          const parseTimeFromISO = (isoString: string): string => {
            if (!isoString) return "00:00";
            // If already in HH:mm format, return as is
            if (/^\d{2}:\d{2}$/.test(isoString)) {
              return isoString;
            }
            // If in ISO format (2025-12-03T15:26:50.513), extract time part
            const timeMatch = isoString.match(/T(\d{2}):(\d{2})/);
            return timeMatch ? `${timeMatch[1]}:${timeMatch[2]}` : "00:00";
          };

          const parsedDate = parseDateFromISO(outdoor.OutDoorDate || "");
          const parsedTime = parseTimeFromISO(outdoor.OutDoorTime || "");

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

          // Store initial visiting card URLs for tracking removed files
          initialVisitingCardUrlsRef.current = parseDocumentUrls(outdoor.VisitingCardURL || "");
          setRemovedVisitingCardUrls([]);

          // Set selectedTime for TimePicker display
          setSelectedTime(parsedTime);

          // Set department name from API response (store ID as value, display name as label)
          if (outdoor.DepartmentId && outdoor.DepartmentName) {
            const departmentName = outdoor.DepartmentName;
            setSelectedDepartmentName(departmentName);
            setDropdownLabels(prev => ({
              ...prev,
              departmentName: departmentName,
            }));
          }

          // Fetch employee names for AccompaniedById
          if (outdoor.AccompaniedById) {
            const employeeIds = outdoor.AccompaniedById.split(',').map((id: string) => id.trim()).filter((id: string) => id);
            if (employeeIds.length > 0) {
              // Fetch employee details for each ID
              const fetchEmployeeNames = async () => {
                try {
                  const employeePromises = employeeIds.map(async (id: string) => {
                    const response = await employeeMasterService.apiCallPullEmployeeMaster({
                      PageNumber: 1,
                      PageSize: 1,
                      EmployeeId: Number(id),
                      IsCheckPermission: false,
                    });
                    if (E.isRight(response) && response.right.Data && response.right.Data.length > 0) {
                      const employee = response.right.Data[0];
                      return {
                        label: employee.FullName || id,
                        value: String(employee.EmployeeId || id),
                      };
                    }
                    return { label: id, value: id };
                  });
                  const employeeValues = await Promise.all(employeePromises);
                  setAccompaniedByInitialValues(employeeValues);
                } catch (error) {
                  console.error("Error fetching employee names:", error);
                  // Fallback to IDs as labels
                  setAccompaniedByInitialValues(
                    employeeIds.map((id: string) => ({ label: id, value: id }))
                  );
                }
              };
              fetchEmployeeNames();
            }
          } else {
            setAccompaniedByInitialValues([]);
          }
        }
      }
    } catch (error) {
      console.error("Error fetching outdoor data:", error);
      addToast({ type: "error", title: "Failed to load outdoor data" });
    } finally {
      setIsLoading(false);
      setIsLoadingMessage("");
    }
  }, [outdoorId, addToast]);

  // Track removed visiting card URLs
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
    }
  }, [outdoorId, fetchOutDoorData]);

  const handleAccompaniedBySelected = (items: DropdownOptions[]) => {
    const accompaniedByIdString = items.map(i => String(i.value)).join(",");
    handleFieldChange("AccompaniedById", accompaniedByIdString);
  };

  const fetchEmployeeMasterDropdownWithDepartment = useCallback(
    async (pageNumber: number, params?: { value?: string }) => {
      return fetchEmployeeMasterDropdown(pageNumber, {
        ...params,
        departmentName: selectedDepartmentName || "", 
      });
    },
    [selectedDepartmentName] 
  );

  const handleDepartmentSelected = (item: { label: string; value: string | number | null }) => {
    const departmentId = item.value ? Number(item.value) : 0;
    const departmentName = item.label || "";
    
    handleFieldChange("DepartmentId", departmentId);
    setSelectedDepartmentName(departmentName);
    
    setDropdownLabels(prev => ({
      ...prev,
      departmentName: departmentName,
    }));
    
    if (outdoorFormData.AccompaniedById) {
      handleFieldChange("AccompaniedById", "");
    }
  };

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

    setErrors(newErrors);
    return { isValid: Object.keys(newErrors).length === 0, errors: newErrors };
  };
  //#endregion

  //#region ADD UPDATE OUTDOOR
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

    // Handle visiting card files
    visitingCardFiles.forEach(file => {
      if (file instanceof File) {
        fd.append('VisitingCardURL', file);
      }
    });

    fd.append('RemoveVisitingCardURL', removedVisitingCardUrls.join(','));

    return fd;
  };

  const handleAddUpdateOutDoor = async () => {
    // Clear previous errors
    setErrors({});

    // Validate form
    const validation = validateForm();

    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    await runApiWithLoader(
      setIsLoading,
      setIsLoadingMessage,
      async () => {
        const pushOutDoorFormData = PushOutDoorFormData();
        
        const apiResponse = await OutDoorDataService.apiCallAddUpdateOutDoor(pushOutDoorFormData);

        if (E.isRight(apiResponse)) {
          const isAdd = outdoorFormData.OutdoorId === 0;
          if (isAdd) {
            addToast({ type: 'success', title: 'Outdoor data added successfully' });
          } else {
            addToast({ type: 'success', title: 'Outdoor data updated successfully' });
          }
          navigate("/outdoor");
        } else {
          addToast({
            type: "error",
            title: apiResponse.left.message || "Failed to save outdoor data",
          });
        }

        return apiResponse;
      },
      undefined,
      (error: unknown) => {
        addToast({
          type: "error",
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          title: (error as any)?.message || "Failed to save outdoor data",
        });
      },
      undefined,
      outdoorFormData.OutdoorId === 0 ? 'Add Outdoor Data...' : 'Update Outdoor Data...'
    );
  };
  //#endregion

  //#region CANCEL HANDLER
  const handleCancel = () => {
    navigate("/outdoor");
  };
  //#endregion

  if (isLoading && !hasFetchedOutDoor.current) {
    return <Loader loading={true} title={isLoadingMessage || "Loading..."}>{null}</Loader>;
  }

  return (
    <div className="p-6">
      <ToastContainer toasts={toasts} onRemoveToast={removeToast} />
      
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-semibold text-gray-900">
            {outdoorId ? "Edit Outdoor" : "Add Outdoor"}
          </h2>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); handleAddUpdateOutDoor(); }} className="p-6">
          <div className="space-y-6 bg-[#E4F0FF] p-6 rounded-[12px]">
            <div className="grid grid-cols-2 gap-6">
              <div className="flex flex-col">
                <DatePickerInput
                  label="OutDoor Date"
                  value={formatDate_dd_mm_yyyy(outdoorFormData.OutDoorDate)}
                  onChange={(val) => handleFieldChange('OutDoorDate', convert_dd_mm_yyyy_To_Yyyy_mm_dd(val) || '')}
                  required
                  error={errors.OutDoorDate}
                />
              </div>

              <div className="flex flex-col">
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
                  error={errors.OutDoorTime}
                />
              </div>

              <div className="flex flex-col">
                <Input
                  label="Company Name"
                  required
                  size="md"
                  value={outdoorFormData.CompanyName}
                  onChange={(e) => handleFieldChange('CompanyName', e.target.value)}
                  error={errors.CompanyName}
                />
              </div>

              <div className="flex flex-col">
                <Input
                  label="Company Address"
                  required
                  size="md"
                  value={outdoorFormData.CompanyAddress}
                  onChange={(e) => handleFieldChange("CompanyAddress", e.target.value)}
                  error={errors.CompanyAddress}
                />
              </div>

              <div className="flex flex-col">
                <Input
                  label="Purpose"
                  required
                  size="md"
                  value={outdoorFormData.Purpose}
                  onChange={(e) => handleFieldChange('Purpose', e.target.value)}
                  error={errors.Purpose}
                />
              </div>

              <div className="flex flex-col">
                <SingleSelectDropdownWithPagination
                  label="Department"
                  title="Select Department"
                  size="md"
                  dataFetchCallBack={fetchDepartmentMasterDropdown}
                  onSelected={handleDepartmentSelected}
                  initialValue={createDropdownInitialValue(outdoorFormData.DepartmentId, dropdownLabels.departmentName)}
                  error={errors.DepartmentId}
                  required
                />
              </div>

              <div className="flex flex-col">
                <MultiSelectPagination
                  label="AccompaniedBy"
                  title="Select Accompanied By"
                  size="md"
                  dataFetchCallBack={fetchEmployeeMasterDropdownWithDepartment}
                  onSelected={handleAccompaniedBySelected}
                  initialValues={getAccompaniedByInitialValues()}
                  error={errors.AccompaniedById}
                  required
                  disabled={!selectedDepartmentName || !outdoorFormData.DepartmentId || outdoorFormData.DepartmentId === 0}
                />
              </div>

              <div className="flex flex-col">
                <MultiFilePicker
                  label="Visiting Card"
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

          <div className="flex justify-end gap-4 mt-6 pt-6 border-t border-gray-200">
            <Button
              type="button"
              color="transparent"
              variant="transparent_border"
              size="sm"
              onClick={handleCancel}
              className="px-6"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              color="green"
              size="sm"
              loading={isLoading}
              className="px-6"
            >
              Save
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
