import { Loader } from "@/core/utils/loader";
import { Input } from "@/ui/components/forms";
import { useState } from "react";
import type { AddUpdateVisitorManagementRequest } from "@/features/visitorManagement/models/VisitorManagementModel";
import { filterLetters } from "@/core/utils/fileValidation";
import MobileNumberInput from "@/ui/components/forms/MobileNumberInput";
import { runApiWithLoader } from "@/core/utils";
import { Clock } from "lucide-react";
import { TimePickerCustomize } from "@/ui/components/TimePicker/TimePickerCustomize";
import { SinglePageSelection } from "@/ui/components/DropDown/SinglePageSelection";
import { PURPOSE_OPTIONS } from "@/core/constants";
import { useMultiSelectDropdown } from "@/core/hooks/useMultiSelectDropdown";
import { fetchEmployeeMasterDropdown } from "@/features/employeeMaster/employeeMasterDropDown";
import MultiSelectPagination from "@/ui/components/DropDown/Multiselectpagination";
import DatePickerInput from "@/ui/components/forms/Datepicker";
import { convert_dd_mm_yyyy_To_Yyyy_mm_dd, formatDate_dd_mm_yyyy } from "@/core/utils/dateFormat";
import BottomActionBar from "@/ui/components/forms/BottomActionBar";
import { useNavigate } from "react-router-dom";
import { useMenuPermissions } from "@/features/menu/hooks/useMenuPermissions";

const initialFormState = (): AddUpdateVisitorManagementRequest => ({
    MobileNumber: "",
    VisitorName: "",
    EmployeeId: "",
    AppointmentDate: null,
    AppointmentTime: "00:00",
    VisitorId: 0,
    Uniquekey: "",
    MobileNumberCountryCode: "+91",
    Address: "",
    Reason: ""
})


const AddUpdateVisitorManagement: React.FC = () => {

    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const [formData, setFormData] = useState<AddUpdateVisitorManagementRequest>(() => initialFormState());
    const [selectedEmployeeValues, setSelectedEmployeeValues] = useState<string | number | null>(null);

    const navigate = useNavigate();

    //#region MENU PERMISSIONS
    const { canAction, canExport } = useMenuPermissions();
    //#endregion

    const [timePickerField, setTimePickerField] = useState<{
        field: keyof AddUpdateVisitorManagementRequest;
        value: string;
    } | null>(null);
    const [isTimePickerOpen, setIsTimePickerOpen] = useState(false);

    const formatLabel = (value: string) =>
        value
            .split(/(?=[A-Z])/)
            .join(" ")
            .trim();

    // ERROR SET UP
    const [errors, setErrors] = useState<{ [k: string]: string }>({});
    //#endregion

    const employeeDropdown = useMultiSelectDropdown({
        value: selectedEmployeeValues,
        fetchCallback: fetchEmployeeMasterDropdown,
        autoFetchOptions: true,
    });

    const handleAddUpdateVisitorManagement = (e: React.FormEvent) => {
        e.preventDefault();
        // api to be called
        console.log('Add Update Visitor Management');
    };

    //#region HANDLE FIELD CHANGE EVENT
    const handleFieldChange = (field: keyof AddUpdateVisitorManagementRequest, value: any) => {
        setFormData((prev) => ({ ...prev, [field]: value }));

        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: "" }));
        }
    };
    //#endregion

    const handleSubmit = () => {
        console.log('Final Submit Api call');
    }

    // const fetchVisitorByMobileNoData = async (mobileNumber: string) => {
    //     await runApiWithLoader(
    //         setIsLoading,
    //         setLoadingMessage,
    //         async () => {
    //             const params: FilterWithPaginationVisitorsByMobileNoRequest = {
    //                 PageNumber: 1,
    //                 PageSize: 1,
    //                 MobileNumber: mobileNumber
    //             };

    //             const response = await inwardOutwardService.apiCallPullSenderReceiverByMobileNo(params);
    //             if (E.isRight(response)) {
    //                 const data = response.right.Data?.[0];

    //                 if (data) {
    //                     setFormData(prev => ({
    //                         ...prev,
    //                         ...(type === "sender" && {
    //                             SenderName: data.Name ?? "",
    //                             SenderEmailId: data.EmailId ?? "",
    //                             SenderAddress: data.Address ?? ""
    //                         }),
    //                         ...(type === "receiver" && {
    //                             ReceiverName: data.Name ?? "",
    //                             ReceiverEmailId: data.EmailId ?? "",
    //                             ReceiverAddress: data.Address ?? ""
    //                         })
    //                     }));
    //                 }
    //             } else {
    //                 addToast({ type: "error", title: response.left.message });
    //             }
    //             return response;
    //         },
    //         undefined,
    //         (error: any) => {
    //             addToast({ type: "error", title: error.message });
    //         },
    //         undefined,
    //         "Loading Data",
    //     );
    // };


    return (

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
            <Loader loading={isLoading} title={loadingMessage}><div></div> </Loader>

            <div className="flex-1 space-y-2 px-6 py-3 overflow-y-auto thin-scroll">
                <form onSubmit={handleAddUpdateVisitorManagement}>
                    <div className="space-y-4 pb-3">
                        <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Visitor's Details</h3>
                        <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 gap-6">

                            <div>
                                <MobileNumberInput
                                    label="Mobile No."
                                    mobileNumber={formData.MobileNumber ?? ''}
                                    countryCode={formData.MobileNumberCountryCode ?? "+91"}
                                    required
                                    onMobileChange={(value) => {
                                        handleFieldChange("MobileNumber", value);

                                        // fetchSenderReceiverByMobileNoData(value, "sender");
                                        setFormData(prev => ({
                                            ...prev,
                                            SenderName: "",
                                            SenderEmailId: "",
                                            SenderAddress: ""
                                        }));
                                    }}
                                    onCountryCodeChange={(value) =>
                                        handleFieldChange("MobileNumberCountryCode", value)
                                    }
                                    error={errors.MobileNumber}

                                />
                            </div>
                            <div>
                                <Input
                                    label="Full Name"
                                    placeholder="Enter Full Name"
                                    value={formData.VisitorName}
                                    required onChange={(e) => handleFieldChange("VisitorName", filterLetters(e.target.value))}
                                    error={errors.VisitorName}
                                />
                            </div>
                            <div>
                                <Input
                                    label="Address"
                                    value={formData.Address ?? ''}
                                    required
                                    onChange={e => handleFieldChange("Address", e.target.value)}
                                    error={errors.Address}
                                    maxLength={100}
                                    placeholder="Enter Address"
                                />
                            </div>

                            {/* Selcet all employees dropdown */}

                            <div>
                                <MultiSelectPagination
                                    label="Employee"
                                    dataFetchCallBack={fetchEmployeeMasterDropdown}
                                    selectedValues={employeeDropdown.selectedValues}
                                    options={employeeDropdown.initialOptions}
                                    onChange={(values) => {
                                        const { idsString } = employeeDropdown.handleChange(values);
                                        setSelectedEmployeeValues(idsString || null);
                                        handleFieldChange("EmployeeId", idsString);
                                        if (errors.EmployeeId) {
                                            setErrors((prev) => ({ ...prev, EmployeeId: "" }));
                                        }
                                    }}
                                />
                            </div>

                            <div>
                                <DatePickerInput
                                    label="Date"
                                    value={formatDate_dd_mm_yyyy(formData.AppointmentDate ?? '')}
                                    onChange={(val) => handleFieldChange('AppointmentDate', convert_dd_mm_yyyy_To_Yyyy_mm_dd(val))}
                                />
                            </div>


                            <Input
                                label="Appointment Time"
                                value={formData.AppointmentTime || ""}
                                onClick={() => {
                                    setTimePickerField({
                                        field: "AppointmentTime",
                                        value: formData.AppointmentTime || "",
                                    });
                                    setIsTimePickerOpen(true);
                                }}
                                leftIcon={<Clock className="h-8 w-8" />}
                            />

                            <div>
                                <SinglePageSelection
                                    label="Purpose"
                                    placeholder="Select Purpose"
                                    value={formData.Purpose}
                                    onChange={(val) => handleFieldChange("Purpose", String(val))}
                                    options={PURPOSE_OPTIONS.map((opt) => ({ label: opt.name, value: opt.id }))}
                                />
                            </div>

                            <div>
                                <Input
                                    label="Reason (Optional)"
                                    placeholder="Enter Reason"
                                    value={formData.Reason || ''}
                                    onChange={(e) => handleFieldChange("Reason", e.target.value)}
                                />
                            </div>

                        </div>

                    </div>


                </form>

                <BottomActionBar
                    cancelText="Cancel"
                    saveText={formData.VisitorId ? "Update" : "Add"}
                    onCancel={() => navigate(-1)}
                    canAction={canAction}
                    onSave={() => {
                        handleSubmit();
                    }}
                    isLoading={isLoading}
                />

                <TimePickerCustomize
                    isOpen={isTimePickerOpen}
                    title={formatLabel(timePickerField?.field || "")}
                    value={timePickerField?.value || "00:00"}
                    onClose={() => {
                        setIsTimePickerOpen(false);
                        setTimePickerField(null);
                    }}
                    onConfirm={(time) => {
                        if (timePickerField) {
                            handleFieldChange(timePickerField.field, time);
                        }
                        setIsTimePickerOpen(false);
                        setTimePickerField(null);
                    }}
                />

            </div>
        </div>
    );
};

export default AddUpdateVisitorManagement;