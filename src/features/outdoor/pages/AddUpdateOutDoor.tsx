import React, { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Input } from "@/ui/components/forms/Input";
import { Loader } from "@/core/utils/loader";
import { useToast } from "@/core/hooks/useToast";
import { outDoorService } from "@/features/outdoor/services/OutDoorDataService";
import type { AddUpdateOutDoor, FilterWithPaginationOutDoor } from "../models/OutDoorModel";
import * as E from "fp-ts/Either";
import { DatePickerInput } from "@/ui/components/forms/Datepicker";
import { TimePicker } from "@/ui/components/TimePicker/TimePicker";
import SingleSelectDropdownWithPagination from "@/ui/components/DropDown/SingleSelectDropdownWithPagination";
import { fetchDepartmentMasterDropdown } from "@/features/departmentMaster/departmentMasterDropdown";
import { createDropdownInitialValue } from "@/core/utils/createDropdownInitialValue";
import { MultiFilePicker, type FileValue } from "@/ui/components/ImagePicker/MultiFilePicker";
import MultiSelectPagination from "@/ui/components/DropDown/Multiselectpagination";
import { fetchEmployeeMasterDropdown } from "@/features/employeeMaster/employeeMasterDropDown";
import { convert_dd_mm_yyyy_To_Yyyy_mm_dd, formatDate_dd_mm_yyyy, convert_yy_mm_dd_tt_mm_To_Yyyy_mm_dd, parseTimeFromISO } from "@/core/utils/dateFormat";
import { runApiWithLoader } from '@/core/utils';
import { parseDocumentUrls } from '@/core/utils/documentUtils';
import { useMultiSelectDropdown } from '@/core/hooks/useMultiSelectDropdown';
import BottomActionBar from "@/ui/components/forms/BottomActionBar";
import { useMenuPermissions } from "@/features/menu/hooks/useMenuPermissions";
import { TextArea } from "@/ui/components/forms/Textarea";

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
  RemoveVisitingCardURL: "",
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
  const [loadingMessage, setLoadingMessage] = useState('');

  // NAVIGATE
  const navigate = useNavigate();

  //GET VALUE FROM URL :ID
  const { outdoorId } = useParams<{ outdoorId?: string }>();

  // TOAST
  const { addToast } = useToast();

  //ERROR SET UP
  const [errors, setErrors] = useState<{ [k: string]: string }>({});

  const [selectedTime, setSelectedTime] = useState<string>("00:00");
  const [visitingCardFiles, setVisitingCardFiles] = useState<FileValue[]>([]);
  const [removedVisitingCardUrls, setRemovedVisitingCardUrls] = useState<string[]>([]);
  const [visitingCardURL, setVisitingCardURL] = useState<string>("");
  const initialVisitingCardUrlsRef = useRef<string[]>([]);
  const [dropdownLabels, setDropdownLabels] = useState<{ departmentName?: string; }>({});
  const [selectedDepartmentName, setSelectedDepartmentName] = useState<string>("");
  const [selectedAccompaniedValues, setSelectedAccompaniedValues] = useState<string | number | null>(null);
  //#endregion

  //#region MENU PERMISSIONS
  const { canAction } = useMenuPermissions('/outdoor');
  //#endregion

  //#region HANDLE FILED CHNAGE EVENT
  const handleFieldChange = (field: keyof AddUpdateOutDoor, value: string | number) => {

    setOutdoorFormData((prev) => ({ ...prev, [field]: value }));

    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };
  //#endregion 

  //#region INITIALIZATION

  useEffect(() => {
    if (outdoorId) {
      fetchOutDoorData();
      return;
    }

    setOutdoorFormData(initialFormState());
    setSelectedTime("00:00");
    setSelectedDepartmentName("");
    setSelectedAccompaniedValues(null);
    setDropdownLabels({});
    setVisitingCardFiles([]);
    setVisitingCardURL("");
    initialVisitingCardUrlsRef.current = [];
    setRemovedVisitingCardUrls([]);
    setErrors({});

  }, [outdoorId]);

  //#endregion

  //#region FETCH OUTDOOR DETAILS
  const fetchOutDoorData = async () => {
    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {

        const params: FilterWithPaginationOutDoor = {
          PageNumber: 1,
          PageSize: 1,
          OutdoorId: Number(outdoorId)
        }

        const response = await outDoorService.apiCallPullOutDoor(params);

        if (E.isRight(response)) {

          const e = response.right.Data?.[0];

          if (e) {
            const parsedDate = convert_yy_mm_dd_tt_mm_To_Yyyy_mm_dd(e.OutDoorDate || "") || "";
            const parsedTime = parseTimeFromISO(e.OutDoorTime || "");

            if (e.DepartmentId && e.DepartmentName) {
              const departmentName = e.DepartmentName;
              setSelectedDepartmentName(departmentName);
              setDropdownLabels(prev => ({
                ...prev,
                departmentName: departmentName,
              }));
            }

            setOutdoorFormData(prev => ({
              ...prev,
              OutdoorId: e.OutdoorId ?? prev.OutdoorId,
              Uniquekey: e.Uniquekey ?? prev.Uniquekey,
              OutDoorDate: parsedDate || prev.OutDoorDate,
              OutDoorTime: parsedTime || prev.OutDoorTime,
              AccompaniedById: e.AccompaniedById ?? prev.AccompaniedById,
              DepartmentId: Number(e.DepartmentId) || prev.DepartmentId,
              CompanyName: e.CompanyName ?? prev.CompanyName,
              CompanyAddress: e.CompanyAddress ?? prev.CompanyAddress,
              VisitingCardURL: e.VisitingCardURL ?? prev.VisitingCardURL,
              RemoveVisitingCardURL: "",
              Purpose: e.Purpose ?? prev.Purpose,
              Conclusion: e.Conclusion ?? prev.Conclusion,
              PunchIn: e.PunchIn ?? prev.PunchIn,
              PunchOut: e.PunchOut ?? prev.PunchOut,
              PunchInAddress: e.PunchInAddress ?? prev.PunchInAddress,
              PunchOutAddress: e.PunchOutAddress ?? prev.PunchOutAddress,
            }));

            setSelectedAccompaniedValues(e.AccompaniedById || null);

            const existingUrls = parseDocumentUrls(e.VisitingCardURL || "");
            initialVisitingCardUrlsRef.current = existingUrls;
            setVisitingCardFiles([]);
            setVisitingCardURL(e.VisitingCardURL || "");
            setRemovedVisitingCardUrls([]);
            setSelectedTime(parsedTime);
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
      'Loading Outdoor'
    )
  }
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

  const accompaniedDropdown = useMultiSelectDropdown({
    value: selectedAccompaniedValues,
    fetchCallback: fetchEmployeeMasterDropdownWithDepartment,
    fetchParams: fetchParams,
    autoFetchOptions: true,
  });


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
    setSelectedAccompaniedValues(null);
  }, [handleFieldChange]);
  //#endregion

  //#region OUTDOOR VALIDATION | ADD | UPDATE ACTION
  // ============================================================= [VALIDATION FUNCTION] =============================================================================================
  const validateForm = (): {
    isValid: boolean
    errors: { [key: string]: string }
  } => {
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

    return {
      isValid: Object.keys(newErrors).length === 0,
      errors: newErrors
    };
  };

  const PushOutDoorFormData = (): FormData => {
    const fd = new FormData();
    fd.append('OutdoorId', String(outdoorFormData.OutdoorId ?? 0));
    fd.append('Uniquekey', outdoorFormData.Uniquekey ?? '');
    fd.append('OutDoorDate', outdoorFormData.OutDoorDate);
    fd.append('OutDoorTime', outdoorFormData.OutDoorTime);
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

    const existingUrls = visitingCardFiles
      .filter(x => typeof x === 'string' && String(x).trim().length > 0)
      .map(x => String(x).trim())
      .join(',');

    if (existingUrls) {
      fd.append('VisitingCardURL', existingUrls);
    }

    fd.append('RemoveVisitingCardURL', removedVisitingCardUrls.join(','));

    return fd;
  };

  const handleSubmit = async () => {

    setErrors({})

    const validation = validateForm()

    if (!validation.isValid) {

      setErrors(validation.errors)

      return
    }

    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {
        const pushOutDoorFormData = PushOutDoorFormData();

        const apiResponse = await outDoorService.apiCallAddUpdateOutDoor(pushOutDoorFormData);

        if (E.isRight(apiResponse)) {

          addToast({ type: "success", title: apiResponse.right.SuccessMessage[0] });

          navigate("/outdoor");

        }
        else {
          addToast({
            type: "error",
            title: apiResponse.left.message,
          });
        }

        return apiResponse;
      },
      undefined,
      (error: any) => {

        addToast({ type: 'error', title: error.message })
      },
      undefined,

      Number(outdoorId ?? 0) === 0 ? 'Add Outdoor' : 'Update Outdoor'
    )

  };

  //#endregion


  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <Loader loading={isLoading} title={loadingMessage}>  <div /> </Loader>

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
                  onChange={(values) => {
                    const { idsString } = accompaniedDropdown.handleChange(values);
                    setSelectedAccompaniedValues(idsString || null);
                    handleFieldChange("AccompaniedById", idsString);
                    if (errors.AccompaniedById) {
                      setErrors((prev) => ({ ...prev, AccompaniedById: '' }));
                    }
                  }}
                  disabled={!!outdoorFormData.PunchIn || !outdoorFormData.DepartmentId || outdoorFormData.DepartmentId === 0}
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
              <div>
                <MultiFilePicker
                  label="Upload visiting card"
                  value={visitingCardFiles}
                  onChange={setVisitingCardFiles}
                  availableFilesURL={visitingCardURL ?? ""}
                  allowedTypes={["image/jpeg", "image/png", "application/pdf"]}
                  maxFiles={5}
                  maxSizeMB={10}
                  onRemoveExisting={(url) => {
                    setRemovedVisitingCardUrls((prev) => [...prev, url]);
                  }}
                />
              </div>
            </div>

            <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <TextArea
                  label="Company Address"
                  required
                  value={outdoorFormData.CompanyAddress}
                  disabled={!!outdoorFormData.PunchIn}
                  onChange={(e) => handleFieldChange("CompanyAddress", e.target.value)}
                  error={errors.CompanyAddress}
                />
              </div>

              <div>
                <TextArea
                  label="Purpose"
                  required
                  value={outdoorFormData.Purpose}
                  onChange={(e) => handleFieldChange('Purpose', e.target.value)}
                  error={errors.Purpose}
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