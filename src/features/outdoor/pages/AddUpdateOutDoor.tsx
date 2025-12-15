
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
  const [selectedDepartmentName, setSelectedDepartmentName] = useState<string>("");
  const [selectedAccompaniedValues, setSelectedAccompaniedValues] = useState<(string | number)[]>([]);
  const hasFetchedOutDoor = useRef(false);

  const navigate = useNavigate();

  const { outdoorId } = useParams<{ outdoorId?: string }>();

  const { toasts, removeToast, addToast } = useToast();

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

  useEffect(() => {
    const ids = outdoorFormData.AccompaniedById
      ? outdoorFormData.AccompaniedById.split(',').map(id => id.trim()).filter(Boolean)
      : [];
    setSelectedAccompaniedValues(ids);
  }, [outdoorFormData.AccompaniedById]);

  useEffect(() => {
    hasFetchedOutDoor.current = false;
  }, [outdoorId]);

  const fetchOutDoorData = useCallback(async () => {
    if (!outdoorId || hasFetchedOutDoor.current) return;

    hasFetchedOutDoor.current = true;
    setIsLoading(true);
    setIsLoadingMessage("Loading outdoor data...");

    try {
      const apiResponse = await OutDoorDataService.apiCallPullOutDoorData({
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

          if (outdoor.DepartmentId && outdoor.DepartmentName) {
            const departmentName = outdoor.DepartmentName;
            setSelectedDepartmentName(departmentName);
            setDropdownLabels(prev => ({
              ...prev,
              departmentName: departmentName,
            }));
          }

        } else {
          addToast({ type: "error", title: "Outdoor record not found" });
        }
      } else {
        addToast({ type: "error", title: "Failed to load outdoor data" });
      }
    } catch (error) {
      console.error("Error fetching outdoor data:", error);
      addToast({ type: "error", title: "Failed to load outdoor data" });
    } finally {
      setIsLoading(false);
      setIsLoadingMessage("");
    }
  }, [outdoorId, addToast]);

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
      setOutdoorFormData({
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
      setSelectedTime("00:00");
      setSelectedDepartmentName("");
      setDropdownLabels({});
      initialVisitingCardUrlsRef.current = [];
      setRemovedVisitingCardUrls([]);
      setErrors({});
    }
  }, [outdoorId, fetchOutDoorData]);

  const handleAccompaniedChange = useCallback((values: (string | number)[]) => {
    setSelectedAccompaniedValues(values);
    handleFieldChange("AccompaniedById", values.join(","));
  }, [handleFieldChange]);

  const fetchEmployeeMasterDropdownWithDepartment = useCallback(
    async (pageNumber: number, params?: { value?: string }) => {
      return fetchEmployeeMasterDropdown(pageNumber, {
        ...params,
        departmentName: selectedDepartmentName || "", 
      });
    },
    [selectedDepartmentName] 
  );

  const handleDepartmentSelected = useCallback((item: { label: string; value: string | number | null }) => {
    const departmentId = item.value ? Number(item.value) : 0;
    const departmentName = item.label || "";
    
    handleFieldChange("DepartmentId", departmentId);
    setSelectedDepartmentName(departmentName);
    setSelectedAccompaniedValues([]);
    
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

  const handleAddUpdateOutDoor = async () => {
    setErrors({});
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

  const handleCancel = () => {
    navigate("/outdoor");
  };

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

        <form onSubmit={(e) => { e.preventDefault(); handleAddUpdateOutDoor(); }} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <DatePickerInput
              label="OutDoor Date"
              value={formatDate_dd_mm_yyyy(outdoorFormData.OutDoorDate)}
              onChange={(val) => handleFieldChange('OutDoorDate', convert_dd_mm_yyyy_To_Yyyy_mm_dd(val) || '')}
              required
              disabled={!!outdoorFormData.PunchIn} 
              error={errors.OutDoorDate}
            />

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

            <div className="space-y-1">
              <MultiSelectPagination
                key={`accompanied-by-${outdoorFormData.DepartmentId}-${selectedDepartmentName}`}
                label="Accompanied By" 
                required
                dataFetchCallBack={fetchEmployeeMasterDropdownWithDepartment}
                selectedValues={selectedAccompaniedValues}
                onChange={handleAccompaniedChange}
                disabled={!outdoorFormData.DepartmentId || outdoorFormData.DepartmentId === 0}
              />
              {errors.AccompaniedById && (
                <p className="text-xs text-red-600">{errors.AccompaniedById}</p>
              )}
            </div>

            <Input
              label="Purpose"
              required
              size="md"
              value={outdoorFormData.Purpose}
              onChange={(e) => handleFieldChange('Purpose', e.target.value)}
              error={errors.Purpose}
            />

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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
