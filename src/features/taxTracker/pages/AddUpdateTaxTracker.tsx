import { useState } from "react";
import { Loader } from "@/core/utils/loader";
import SingleSelectDropdownWithPagination from "@/ui/components/DropDown/SingleSelectDropdownWithPagination";
import type { AddUpdateTaxTrackerRequest } from "@/features/taxTracker/models/TaxTrackerModel";
import { Input } from "@/ui/components/forms";
import { useTaxTrackerListState } from "@/features/taxTracker/context/TaxTrackerListStateContext";
import { fetchEmployeeMasterDropdown } from "@/features/employeeMaster/employeeMasterDropDown";
import MultiSelectPagination from "@/ui/components/DropDown/Multiselectpagination";
import { useMultiSelectDropdown } from "@/core/hooks/useMultiSelectDropdown";
import { SinglePageSelection } from "@/ui/components/DropDown/SinglePageSelection";
import { AUTHORITY_OPTIONS, NOTICE_TYPE_OPTIONS } from "@/core/constants";
import DatePickerInput from "@/ui/components/forms/Datepicker";
import { convert_dd_mm_yyyy_To_Yyyy_mm_dd, formatDate_dd_mm_yyyy } from "@/core/utils/dateFormat";
import BottomActionBar from "@/ui/components/forms/BottomActionBar";
import { useNavigate } from "react-router-dom";
import { useMenuPermissions } from "@/features/menu/hooks/useMenuPermissions";
import { fetchNoticeSectionDropdown } from "@/features/taxTracker/fetchGovernmentComplianceDopdown";
import MultiFilePicker from "@/ui/components/ImagePicker/MultiFilePicker";
import { runApiWithLoader } from "@/core/utils";
import { taxTrackerService } from "@/features/taxTracker/services/TaxTrackerService";
import * as E from 'fp-ts/Either';
import useToast from "@/core/hooks/useToast";
import { hasAnyDocumentFile } from "@/core/utils/fileValidation";
import { TextArea } from "@/ui/components/forms/Textarea";
import { fetchCompanyMasterDropdown } from "@/features/companyMaster/companyMasterDropDown";
import { createDropdownInitialValue } from "@/core/utils/createDropdownInitialValue";

const initialFormState = (): AddUpdateTaxTrackerRequest => ({
    TaxTrackerId: 0,
    Uniquekey: null,
    GovernmentCompliance: null,
    CompanyId: 0,
    FinancialYear: '',
    ResponsiblePersonId: null,
    NoticeType: null,
    NoticeSectionMasterId: 0,
    Authority: null,
    NoticeDate: null,
    DueDate: null,
    NoticeStatus: null,
    NoticeDocumentURL: [],
    RemoveNoticeDocumentURL: null,
    OfficerName: null,
    OfficerAddress: null,
    NoticeDescription: null,
    ReplyDocumentURL: [],
    RemoveReplyDocumentURL: null,
    RequestType: "Notice"
});

export const AddUpdateTaxTracker: React.FC = () => {

    const { listState } = useTaxTrackerListState();
    const { canAction } = useMenuPermissions('/taxTracker');
    const { addToast } = useToast();

    const [dropdownLabels, setDropdownLabels] = useState<{ companyName?: string; }>(() => ({
        companyName: listState.CompanyName || undefined,
    }));

    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const [selectedResponsiblePersonesNames, setSelectedResponsiblePersonesNames] = useState<string | number | null>(null);
    const [noticeDocumentURLFiles, setNoticeDocumentURLFiles] = useState<(File | string)[]>([]);
    const [noticeDocumentURL, setNoticeDocumentURL] = useState<string>("");
    const [removedNoticeDocumentURLs, setRemovedNoticeDocumentURLs] = useState<string[]>([]);
    const [formData, setFormData] = useState<AddUpdateTaxTrackerRequest>(() => initialFormState());
    const [errors, setErrors] = useState<{ [k: string]: string }>({});

    const navigate = useNavigate();

    const responsiblePersonNamesDropDown = useMultiSelectDropdown({
        value: selectedResponsiblePersonesNames,
        fetchCallback: fetchEmployeeMasterDropdown,
        autoFetchOptions: true,
    });

    const validateAddTaxTrackerForm = (): {

        isValid: boolean

        errors: { [key: string]: string }

    } => {
        const newErrors: { [key: string]: string } = {};

        if (!formData.GovernmentCompliance) {
            newErrors.GovernmentCompliance = 'Government Compliance is required.';
        }

        if (!formData.ResponsiblePersonId) {
            newErrors.ResponsiblePersonId = 'Responsible Person is required.';
        }
        if (!formData.FinancialYear) {
            newErrors.FinancialYear = 'Financial Year is required.';
        }
        if (!formData.CompanyId) {
            newErrors.CompanyId = 'Company is required.';
        }
        if (!formData.NoticeType) {
            newErrors.NoticeType = 'Notice Type is required.';
        }
        if (!formData.NoticeSectionMasterId) {
            newErrors.NoticeSectionMasterId = 'Notice Section is required.';
        }
        if (!formData.Authority) {
            newErrors.Authority = 'Authority is required.';
        }
        if (!formData.OfficerName) {
            newErrors.OfficerName = 'Officer Name is required.';
        }
        if (!formData.OfficerAddress) {
            newErrors.OfficerAddress = 'Officer Address is required.';
        }
        if (!formData.NoticeDate) {
            newErrors.NoticeDate = 'Notice Date is required.';
        }
        if (!formData.DueDate) {
            newErrors.DueDate = 'Due Date is required.';
        }
        if (formData.DueDate && formData.NoticeDate && formData.DueDate < formData.NoticeDate) {
            newErrors.DueDate = "Due Date should be greater than Notice Date.";
        }
        if (!hasAnyDocumentFile(noticeDocumentURLFiles, noticeDocumentURL, removedNoticeDocumentURLs)) {
            newErrors.NoticeDocumentURL = "Notice Document is required.";
        }
        if (!formData.NoticeDescription) {
            newErrors.NoticeDescription = 'Notice Description is required.';
        }
        return {
            isValid: Object.keys(newErrors).length === 0,
            errors: newErrors
        };

    };

    const PushAddUpdateTaxTrackerData = (): FormData => {

        const fd = new FormData();

        fd.append('TaxTrackerId', String(formData.TaxTrackerId ?? 0));
        fd.append('Uniquekey', formData.Uniquekey || '3fa85f64-5717-4562-b3fc-2c963f66afa6');
        fd.append('GovernmentCompliance', formData.GovernmentCompliance || '');
        fd.append('CompanyId', String(formData.CompanyId ?? 0));
        fd.append('FinancialYear', formData.FinancialYear || '');
        fd.append('ResponsiblePersonId', formData.ResponsiblePersonId || '');
        fd.append('NoticeType', formData.NoticeType || '');
        fd.append('NoticeSectionMasterId', String(formData.NoticeSectionMasterId ?? 0));
        fd.append('Authority', formData.Authority || '');
        fd.append('NoticeDate', formData.NoticeDate || '');
        fd.append('DueDate', formData.DueDate || '');
        fd.append('OfficerName', formData.OfficerName || '');
        fd.append('OfficerAddress', formData.OfficerAddress || '');
        fd.append('NoticeDescription', formData.NoticeDescription || '');
        fd.append("RequestType", formData.RequestType || "Notice");
        fd.append('NoticeStatus', 'Reply Pending');

        noticeDocumentURLFiles.forEach(file => {
            if (file instanceof File) {
                fd.append('NoticeDocumentURL', file);
            }

        });

        const hasExistingFile = noticeDocumentURL && noticeDocumentURL.trim() !== "" && !removedNoticeDocumentURLs.includes(noticeDocumentURL);

        if (hasExistingFile) {
            fd.append('NoticeDocumentURL', noticeDocumentURL);
        }
        fd.append('RemoveNoticeDocumentURL', removedNoticeDocumentURLs.join(','));

        return fd;

    }

    const handleFieldChange = (field: keyof AddUpdateTaxTrackerRequest, value: any) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: "" }));
        }
    };

    const handleAddUpdateTaxTracker = async () => {
        setErrors({});

        const validation = validateAddTaxTrackerForm();

        if (!validation.isValid) {

            setErrors(validation.errors);

            return;
        }

        await runApiWithLoader(

            setIsLoading,
            setLoadingMessage,

            async () => {
                const payload = PushAddUpdateTaxTrackerData();

                const response = await taxTrackerService.apiCallAddUpdateTaxTracker(payload);

                if (E.isRight(response)) {

                    addToast({ type: "success", title: response.right.SuccessMessage[0] });
                    setNoticeDocumentURL("");
                    setNoticeDocumentURLFiles([]);
                    setRemovedNoticeDocumentURLs([]);
                    setSelectedResponsiblePersonesNames(null);
                    setFormData(initialFormState());

                    navigate("/taxTracker");

                } else {
                    addToast({ type: "error", title: response.left?.message });
                }
                return response;
            },

            undefined,

            (error: any) => {
                addToast({ type: 'error', title: error.message });
            },
            undefined,
        );

    }

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
            <Loader loading={isLoading} title={loadingMessage}><div></div></Loader>

            <div className="flex-1 space-y-2 px-6 py-3 overflow-y-auto thin-scroll">
                <form onSubmit={handleAddUpdateTaxTracker}>
                    <div className="space-y-4 pb-3">
                        <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-300 pb-2">Basic Details</h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <div>
                                    <SinglePageSelection
                                        label="Government Compliance"
                                        onChange={(e) => {
                                            handleFieldChange("GovernmentCompliance", String(e));
                                        }}
                                        options={NOTICE_TYPE_OPTIONS.map((opt) => ({ label: opt.name, value: opt.id }))}
                                        value={formData.GovernmentCompliance ?? ''}
                                        placeholder="Select Government Compliance"
                                        required
                                        error={errors.GovernmentCompliance}
                                    />
                                </div>
                            </div>

                            <div>
                                <SingleSelectDropdownWithPagination
                                    label="Company"
                                    title="Select Company"
                                    size="lg"
                                    dataFetchCallBack={fetchCompanyMasterDropdown}
                                    onSelected={(item) => {
                                        const companyId = item ? Number(item.value) : 0;
                                        const companyName = item?.label || "";

                                        handleFieldChange("CompanyId", companyId);

                                        setDropdownLabels((prev) => ({
                                            ...prev,
                                            companyName: companyName,
                                        }));
                                    }}
                                    initialValue={createDropdownInitialValue(
                                        formData.CompanyId,
                                        dropdownLabels.companyName
                                    )}
                                    error={errors.CompanyId}
                                    required
                                />
                            </div>

                            <div>
                                <Input
                                    type="text"
                                    label="Financial Year"
                                    placeholder="Enter Year"
                                    value={formData.FinancialYear}
                                    onChange={(e) => handleFieldChange('FinancialYear', e.target.value)}
                                    error={errors.FinancialYear}
                                    required
                                />
                            </div>

                            <div>
                                <MultiSelectPagination
                                    label="Responsible Person"
                                    required
                                    dataFetchCallBack={fetchEmployeeMasterDropdown}
                                    selectedValues={responsiblePersonNamesDropDown.selectedValues}
                                    options={responsiblePersonNamesDropDown.initialOptions}
                                    onChange={(values) => {
                                        const { idsString } = responsiblePersonNamesDropDown.handleChange(values);
                                        setSelectedResponsiblePersonesNames(idsString || null);
                                        handleFieldChange(
                                            "ResponsiblePersonId",
                                            idsString
                                        );
                                    }}
                                    error={errors.ResponsiblePersonId}
                                />
                            </div>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-300 pb-2">Notice Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <Input type="text" label="Notice Type" placeholder="Notice Type" required value={formData.NoticeType ?? ""} onChange={(e) => handleFieldChange("NoticeType", e.target.value)} error={errors.NoticeType} />
                            </div>

                            <div>
                                <SingleSelectDropdownWithPagination
                                    label="Notice U/S"
                                    title="Select Notice Section"
                                    size="lg"
                                    required
                                    disabled={!formData.GovernmentCompliance}
                                    dataFetchCallBack={(pageNumber) =>
                                        fetchNoticeSectionDropdown(pageNumber, formData.GovernmentCompliance || "")
                                    }
                                    onSelected={(item) => {
                                        if (!item) {
                                            handleFieldChange("NoticeSectionMasterId", 0);
                                            return;
                                        }
                                        handleFieldChange("NoticeSectionMasterId", Number(item.noticeSectionMasterId));
                                    }}
                                    error={errors.NoticeSectionMasterId}
                                />
                            </div>

                            <div>
                                <DatePickerInput label="Notice Date" value={formatDate_dd_mm_yyyy(formData.NoticeDate)} onChange={(val) => handleFieldChange("NoticeDate", convert_dd_mm_yyyy_To_Yyyy_mm_dd(val))} required error={errors.NoticeDate} />
                            </div>
                            <div>
                                <DatePickerInput label="Due Date" value={formatDate_dd_mm_yyyy(formData.DueDate)} onChange={(val) => handleFieldChange("DueDate", convert_dd_mm_yyyy_To_Yyyy_mm_dd(val))} required error={errors.DueDate} />
                            </div>

                        </div>

                        <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-300 pb-2">Authorities Details</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <SinglePageSelection
                                    label="Authority Type"
                                    placeholder='Select Authority Type'
                                    required
                                    value={formData.Authority || ''}
                                    onChange={(e) => handleFieldChange('Authority', String(e))}
                                    options={AUTHORITY_OPTIONS.map((opt) => ({ label: opt.name, value: opt.id }))}
                                    error={errors.Authority}
                                />
                            </div>
                            <div>
                                <Input type="text" label="Officer Name" placeholder="Officer Name" required value={formData.OfficerName ?? ""} onChange={(e) => handleFieldChange("OfficerName", e.target.value)} error={errors.OfficerName} />
                            </div>

                        </div>
                        <div>
                            <TextArea
                                label="Divisional Address"
                                placeholder="Divisional Address"
                                required
                                className='thin-scroll'
                                value={formData.OfficerAddress || ''}
                                onChange={(e) => handleFieldChange("OfficerAddress", e.target.value)}
                                error={errors.OfficerAddress} />
                        </div>

                        <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-300 pb-2">Document Details</h3>
                        <div>
                            <div className="mt-5">
                                <MultiFilePicker
                                    label="Upload Notice Document"
                                    required
                                    placeholder="Select files"
                                    value={noticeDocumentURLFiles}
                                    onChange={setNoticeDocumentURLFiles}
                                    availableFilesURL={noticeDocumentURL ?? ""}
                                    allowedTypes={["image/jpeg", "image/png", "image/jpg"]}
                                    maxFiles={5}
                                    maxSizeMB={10}
                                    onRemoveExisting={(url) => {
                                        setRemovedNoticeDocumentURLs((prev) => [...prev, url]);
                                    }}
                                    error={errors.NoticeDocumentURL}
                                />
                            </div>
                            <div className="mt-5">
                                <TextArea
                                    label="Notice Description"
                                    placeholder="Enter Description"
                                    required
                                    className='thin-scroll'
                                    value={formData.NoticeDescription || ''}
                                    onChange={(e) => handleFieldChange("NoticeDescription", e.target.value)}
                                    error={errors.NoticeDescription} />
                            </div>
                        </div>
                    </div>
                </form>
            </div>

            <BottomActionBar
                cancelText="Cancel"
                saveText={"Add"}
                onCancel={() => navigate(-1)}
                canAction={canAction}
                onSave={() => {
                    handleAddUpdateTaxTracker();
                }}
                isLoading={isLoading}
            />
        </div>
    );
};

export default AddUpdateTaxTracker;