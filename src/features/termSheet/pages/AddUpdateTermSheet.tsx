import { useNavigate, useParams } from "react-router-dom";
import { Input } from "@/ui/components/forms/Input";
import * as E from "fp-ts/Either";
import { runApiWithLoader } from "@/core/utils";
import { useToast } from "@/core/hooks/useToast";
import { Loader } from "@/core/utils/loader";
import { useCallback, useEffect, useMemo, useState } from "react";
import React from "react";
import BottomActionBar from "@/ui/components/forms/BottomActionBar";
import { useMenuPermissions } from "@/features/menu/hooks/useMenuPermissions";
import { DataTable, type TableColumn } from "@/ui/components/DataTable/DataTable";
import MultiImageViewer from "@/ui/components/ImageViewer/ImageViewer";
import { parseDocumentUrls } from "@/core/utils/documentUtils";
import { SinglePageSelection } from "@/ui/components/DropDown/SinglePageSelection";
import { Button } from "@/ui/components/forms";
import { Building2, Edit, Plus, Trash2 } from "lucide-react";
import { Modal } from "@/ui/components/Modal/Modal";
import { MultiFilePicker } from "@/ui/components/ImagePicker/MultiFilePicker";
import { useTermSheetListState } from "@/features/termSheet/context/TermSheetListStateContext";
import type { AddUpdateTermSheetDetailsRequest, AddUpdateTermSheetRequest, FilterWithPaginationTermSheetRequest, TermSheetViewData, TermSheetDetailsData } from "@/features/termSheet/models/TermSheetModel";
import { termSheetService } from "@/features/termSheet/services/TermSheetService";
import { allowPercentage, calculateMergedFiles, calculateRemovedFiles, createFileUrlString, filterLetters, filterNumbers, filterNumbersWithDecimal, mergeFiles } from "@/core/utils/fileValidation";
import { LocalStorageHelper } from "@/core/utils/localStorageHelper";
import { DeleteDialog } from "@/ui/components/forms/DeleteDialog";
import DatePickerInput from "@/ui/components/forms/Datepicker";
import { convert_date_yy_mm_dd_To_dd_mm_yyyy, convert_dd_mm_yyyy_To_Yyyy_mm_dd, formatDate_dd_mm_yyyy, formatDate_dd_MonthName_yy, formatDate_dd_MonthName_yy_hh_mm } from "@/core/utils/dateFormat";
import { formatCurrency, isToDateGreaterOrEqualFromDate } from "@/core/utils/comman";
import { TextArea } from "@/ui/components/forms/Textarea";
import { TERM_SHEET_TYPE_OPTIONS } from "@/core/constants";
import TooltipText from "@/ui/components/Tooltip/TooltipText";
import NoDataView from "@/ui/components/NoDataView/NoDataView";
import { FieldItem } from "@/ui/components/forms/FieldItem";
import { projectMasterService } from "@/features/projectMaster/services/ProjectMasterService";
import type { CompanyMasterData } from "@/features/companyMaster/models/CompanyMasterModel";


const initialFormState = (): AddUpdateTermSheetRequest => ({
    TermSheetId: 0,
    Uniquekey: null,
    ProjectId: 0,
    CompanyId: 0,
});

const initialFormStateTermSheetDetails = (): AddUpdateTermSheetDetailsRequest => ({
    TermSheetDetailsId: 0,
    Uniquekey: null,
    TermSheetId: 0,
    ProjectId: 0,
    LoanTakenBy: "",
    NameOfInstitutionBankNBFC: "",
    Type: "",
    TermSheetDate: null,
    SanctionDate: null,
    FacilityAmount: 0,
    RateOfInterestInPercentage: 0,
    ProcessingFeesInPercentage: 0,
    LegalAndDoumentationFees: 0,
    MonotoriumPeriodInMonth: 0,
    LoanTenureInMonth: 0,
    MinimumSellingPrice: 0,
    OtherImportantTermsIfAny: '',
    Remark: '',
    LoanStartDate: null,
    LoanEndDate: null,
    EMIAmount: 0,
    TermSheetURL: null,
    RemoveTermSheetURL: ''
});

type TermSheetDetailsWithFiles = TermSheetDetailsData & {
    _termSheetFiles?: (File | string)[];
    RemoveTermSheetURL?: string;
};

const AddUpdateTermSheet: React.FC = () => {

    const [formData, setFormData] = useState<AddUpdateTermSheetRequest>(() => initialFormState());
    const [termSheetDetailsList, setTermSheetDetailsList] = useState<TermSheetDetailsWithFiles[]>([]);
    const [companyMasterList, setCompanyMasterList] = useState<CompanyMasterData[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');

    const navigate = useNavigate();

    const { addToast } = useToast();

    const [errors, setErrors] = useState<{ [k: string]: string }>({});

    const { listState } = useTermSheetListState();

    const { TermSheetId } = useParams<{ TermSheetId?: string }>();

    const termSheetIdId = TermSheetId ? Number(TermSheetId) : 0;

    const isAddMode = Number(termSheetIdId) === 0;

    const [formDataForTermSheetDetails, setFormDataForTermSheetDetails] = useState<AddUpdateTermSheetDetailsRequest>(() => initialFormStateTermSheetDetails());

    const [editingTermSheetDetailsData, setEditingTermSheetDetailsData] = useState<{ row: TermSheetDetailsWithFiles; index: number } | null>(null);

    const [isAddUpdateTermSheetDetailsModalOpen, setIsAddUpdateTermSheetDetailsModalOpen] = useState(false)

    const [termSheetFiles, setTermSheetFiles] = useState<(File | string)[]>([]);
    const [removedTermSheetURLs, setRemovedTermSheetURLs] = useState<string[]>([]);
    const [errorsTermSheetDetails, setErrorsTermSheetDetails] = useState<{ [k: string]: string }>({});

    const [isConfirmationDialogBoxOpen, setIsConfirmationDialogBoxOpen] = useState(false)

    const [deleteTermSheetDetailsData, setDeleteTermSheetDetailsData] = useState<{ row: TermSheetDetailsWithFiles; index: number } | null>(null);

    const { canAction } = useMenuPermissions('/tenant');

    const handleFieldChange = (field: keyof AddUpdateTermSheetRequest, value: any) => {

        setFormData((prev) => ({ ...prev, [field]: value }));

        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: "" }));
        }
    };

    useEffect(() => {

        if (!isAddMode) {
            fetchTenantDetails();
        }
    }, [termSheetIdId]);

    const fetchTenantDetails = async () => {
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {

                const params: FilterWithPaginationTermSheetRequest = {
                    PageNumber: 1,
                    PageSize: 1,
                    IsCheckPermission: false,
                    TermSheetId: Number(listState.TermSheetId),
                    ProjectId: Number(listState.ProjectId),
                }

                const response = await termSheetService.apiCallPullTermSheetView(params);

                if (E.isRight(response)) {

                    const termSheet = response.right.Data?.[0] as TermSheetViewData | undefined;

                    if (termSheet) {

                        setFormData(prev => ({
                            ...prev,
                            TermSheetId: termSheet.TermSheetId ?? prev.TermSheetId,
                            Uniquekey: termSheet.Uniquekey ?? prev.Uniquekey,
                            ProjectId: termSheet.ProjectId ?? prev.ProjectId,
                            CompanyId: termSheet.CompanyId ?? prev.CompanyId,
                        }));


                        const termSheetDetailsWithFiles = (termSheet?.TermSheetDetailsData || []).map(a => ({
                            ...a,
                            _termSheetFiles: parseDocumentUrls(a.TermSheetURL ?? ''),
                        }));

                        setTermSheetDetailsList(termSheetDetailsWithFiles);
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
            'Loading Term Sheet Data'
        )
    }

    // ============================================================= [VALIDATION FUNCTION] =============================================================================================
    const validateAddTermSheetForm = (): {

        isValid: boolean

        errors: { [key: string]: string }

    } => {

        const newErrors: { [key: string]: string } = {}


        if (!formData.ProjectId || Number(formData.ProjectId) <= 0) {
            newErrors.ProjectId = 'Project is required';
        }

        else if (!formData.CompanyId || Number(formData.CompanyId) <= 0) {
            addToast({ type: "error", title: "Company is required" });
            return { isValid: false, errors: newErrors };
        }

        else if (termSheetDetailsList.length === 0) {
            addToast({ type: "error", title: "At least one term sheet is required" });
            return { isValid: false, errors: newErrors };
        } else {
            const institutionNames = termSheetDetailsList.map(x => x.NameOfInstitutionBankNBFC?.trim().toUpperCase()).filter(Boolean);

            const hasDuplicateInstitution = institutionNames.length !== new Set(institutionNames).size;

            if (hasDuplicateInstitution) {
                addToast({ type: "error", title: "Name Of Institution / Bank / NBFC cannot be duplicate" });

                return { isValid: false, errors: newErrors };
            }
        }


        return {
            isValid: Object.keys(newErrors).length === 0,
            errors: newErrors
        }
    }

    const handleSubmit = async () => {

        setErrors({})

        const validation = validateAddTermSheetForm()

        if (!validation.isValid) {

            setErrors(validation.errors)

            return
        }

        await runApiWithLoader(
            setIsLoading,

            setLoadingMessage,
            async () => {

                const payload = buildMultipartFormData();

                const response = await termSheetService.apiCallAddUpdateTermSheet(payload);

                if (E.isRight(response)) {

                    addToast({ type: "success", title: response.right.SuccessMessage[0] });

                    navigate("/termSheet", {
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

            isAddMode ? 'Add Term Sheet' : 'Update Term Sheet'
        )

    };

    const handleEditTermSheetDetails = useCallback((row: TermSheetDetailsWithFiles, index: number) => {

        const applicantData: AddUpdateTermSheetDetailsRequest = {

            TermSheetDetailsId: row.TermSheetDetailsId ?? 0,

            Uniquekey: row.Uniquekey ?? "",

            TermSheetId: row.TermSheetId ?? 0,

            ProjectId: row.ProjectId ?? 0,

            LoanTakenBy: row.LoanTakenBy ?? "",

            NameOfInstitutionBankNBFC: row.NameOfInstitutionBankNBFC ?? "",

            Type: row.Type ?? "",

            TermSheetDate: row.TermSheetDate ?? "",

            SanctionDate: row.SanctionDate ?? "",

            FacilityAmount: row.FacilityAmount ?? 0,

            RateOfInterestInPercentage: row.RateOfInterestInPercentage ?? 0,

            ProcessingFeesInPercentage: row.ProcessingFeesInPercentage ?? 0,

            LegalAndDoumentationFees: row.LegalAndDoumentationFees ?? 0,

            MonotoriumPeriodInMonth: row.MonotoriumPeriodInMonth ?? 0,

            LoanTenureInMonth: row.LoanTenureInMonth ?? 0,

            MinimumSellingPrice: row.MinimumSellingPrice ?? 0,

            OtherImportantTermsIfAny: row.OtherImportantTermsIfAny ?? "",

            Remark: row.Remark ?? "",

            LoanStartDate: row.LoanStartDate ?? "",

            LoanEndDate: row.LoanEndDate ?? "",

            EMIAmount: row.EMIAmount ?? 0,

            RemoveTermSheetURL: '',

            TermSheetURL: null,
        };


        setEditingTermSheetDetailsData({ row, index });
        setFormDataForTermSheetDetails(applicantData);

        setTermSheetFiles(row._termSheetFiles ?? []);
        setRemovedTermSheetURLs([]);

        setIsAddUpdateTermSheetDetailsModalOpen(true);
    }, []);

    const handleConfirmationDialogBoxOpen = (row: TermSheetDetailsWithFiles, index: number) => {
        setDeleteTermSheetDetailsData({ row, index });
        setIsConfirmationDialogBoxOpen(true)
    }

    const applicantColumns = useMemo<TableColumn[]>(
        () => [
            {
                key: 'LoanTakenBy',
                label: 'Loan Taken By',
                width: '15',
                sortable: false,
                align: 'left',
                render: value => value || '-'
            },

            {
                key: 'NameOfInstitutionBankNBFC',
                label: 'Name Of Institution / Bank / NBFC',
                width: '20',
                sortable: false,
                align: 'left',
                fixed: 'left',
                render: (value, row) => {
                    return (

                        <MultiImageViewer
                            images={parseDocumentUrls(row.TermSheetURL)}
                            title="Term Sheet Document"
                            triggerLabel={value || '-'}
                            isWrap={false}
                        />

                    );
                }
            },

            {
                key: 'Type',
                label: 'Type',
                width: '12',
                sortable: false,
                align: 'left',
                render: value => value || '-'
            },

            {
                key: 'TermSheetDate',
                label: 'Term Sheet Date',
                width: '15',
                sortable: false,
                align: 'center',
                render: value =>
                    value
                        ? formatDate_dd_MonthName_yy(value)
                        : '-'
            },

            {
                key: 'SanctionDate',
                label: 'Sanction Date',
                width: '15',
                sortable: false,
                align: 'center',
                render: value =>
                    value
                        ? formatDate_dd_MonthName_yy(value)
                        : '-'
            },

            {
                key: 'FacilityAmount',
                label: 'Facility Amount',
                width: '15',
                sortable: false,
                align: 'right',
                render: value =>
                    value != null
                        ? formatCurrency(value)
                        : '-'
            },

            {
                key: 'RateOfInterestInPercentage',
                label: 'Rate Of Interest (%)',
                width: '15',
                sortable: false,
                align: 'right',
                render: value =>
                    value != null
                        ? `${value}%`
                        : '-'
            },

            {
                key: 'ProcessingFeesInPercentage',
                label: 'Processing Fees (%)',
                width: '15',
                sortable: false,
                align: 'right',
                render: value =>
                    value != null
                        ? `${value}%`
                        : '-'
            },

            {
                key: 'LegalAndDoumentationFees',
                label: 'Legal & Documentation Fees',
                width: '18',
                sortable: false,
                align: 'right',
                render: value =>
                    value != null
                        ? formatCurrency(value)
                        : '-'
            },

            {
                key: 'MonotoriumPeriodInMonth',
                label: 'Moratorium Period (Month)',
                width: '15',
                sortable: false,
                align: 'center',
                render: value =>
                    value != null
                        ? `${value} Month`
                        : '-'
            },

            {
                key: 'LoanTenureInMonth',
                label: 'Loan Tenure (Month)',
                width: '15',
                sortable: false,
                align: 'center',
                render: value =>
                    value != null
                        ? `${value} Month`
                        : '-'
            },

            {
                key: 'MinimumSellingPrice',
                label: 'Minimum Selling Price',
                width: '18',
                sortable: false,
                align: 'right',
                render: value =>
                    value != null
                        ? formatCurrency(value)
                        : '-'
            },

            {
                key: 'OtherImportantTermsIfAny',
                label: 'Other Important Terms If Any',
                width: '25',
                sortable: false,
                align: 'left',
                render: (value) => (
                    <TooltipText
                        text={value || "-"}
                        maxWidth="250px"
                        tooltipThreshold={25}
                    />
                ),
            },

            {
                key: 'Remark',
                label: 'Remark',
                width: '20',
                sortable: false,
                align: 'left',
                render: (value) => (
                    <TooltipText
                        text={value || "-"}
                        maxWidth="250px"
                        tooltipThreshold={25}
                    />
                ),
            },

            {
                key: 'LoanStartDate',
                label: 'Loan Start Date',
                width: '15',
                sortable: false,
                align: 'center',
                render: value =>
                    value
                        ? formatDate_dd_MonthName_yy(value)
                        : '-'
            },

            {
                key: 'LoanEndDate',
                label: 'Loan End Date',
                width: '15',
                sortable: false,
                align: 'center',
                render: value =>
                    value
                        ? formatDate_dd_MonthName_yy(value)
                        : '-'
            },

            {
                key: 'EMIAmount',
                label: 'EMI Amount',
                width: '15',
                sortable: false,
                align: 'right',
                render: value =>
                    value != null
                        ? formatCurrency(value)
                        : '-'
            },



            {
                key: 'CreatedBy',
                label: 'Created By',
                width: '15',
                sortable: false,
                align: 'left',
                render: value => value || '-'
            },

            {
                key: 'CreatedDate',
                label: 'Created Date',
                width: '18',
                sortable: false,
                align: 'center',
                render: value =>
                    value
                        ? formatDate_dd_MonthName_yy_hh_mm(value)
                        : '-'
            },

            {
                key: 'ModifiedBy',
                label: 'Last Modified By',
                width: '15',
                sortable: false,
                align: 'left',
                render: (_, row) =>
                    row.ModifiedBy || row.CreatedBy || '-'
            },

            {
                key: 'ModifiedDate',
                label: 'Last Modified Date',
                width: '18',
                sortable: false,
                align: 'center',
                render: (_, row) => {

                    const date =
                        row.ModifiedBy
                            ? row.ModifiedDate
                            : row.CreatedDate;

                    return date
                        ? formatDate_dd_MonthName_yy_hh_mm(date)
                        : '-';
                }
            },
            {
                key: 'ApprovalStatus',
                label: 'Status',
                width: '15',
                sortable: false,
                align: 'right',
                render: (value) => value || '-'
            },
            {
                key: 'actions',
                label: 'Actions',
                width: '12',
                fixed: 'right',
                align: 'center',

                render: (_value, row, index) => {

                    const listApprovalStatus = listState?.ApprovalStatus?.trim().toUpperCase() ?? "";

                    const rowApprovalStatus = row?.ApprovalStatus?.trim().toUpperCase() ?? "";

                    // ================= EDIT =================
                    const canEdit =
                        canAction &&
                        (
                            // PENDING + PENDING → Edit ENABLE
                            (
                                listApprovalStatus === "PENDING" && rowApprovalStatus === "PENDING"
                            )

                            ||

                            // APPROVED + PENDING → Edit ENABLE
                            (
                                listApprovalStatus === "APPROVED" && rowApprovalStatus === "PENDING"
                            )

                            ||

                            // APPROVED + APPROVED → Edit ENABLE
                            (
                                listApprovalStatus === "APPROVED" && rowApprovalStatus === "APPROVED"
                            )
                        );

                    // ================= DELETE =================
                    const canDelete =
                        canAction &&
                        (
                            // PENDING + PENDING → Delete ENABLE
                            (
                                listApprovalStatus === "PENDING" && rowApprovalStatus === "PENDING"
                            )

                            ||

                            // APPROVED + PENDING → Delete ENABLE
                            (
                                listApprovalStatus === "APPROVED" && rowApprovalStatus === "PENDING"
                            )
                        );

                    return (
                        <div className="flex items-center justify-center gap-2">

                            {/* ================= EDIT ================= */}
                            <Button
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();

                                    if (!canEdit) return;

                                    handleEditTermSheetDetails(row, index);
                                }}
                                color="transparent"
                                isborderRadius
                                size="sm"
                                title="Edit Applicant"
                                disabled={!canEdit}
                                style={{
                                    color: canEdit ? "#0B3251" : "#9CA3AF",
                                    cursor: canEdit ? "pointer" : "not-allowed",
                                    opacity: canEdit ? 1 : 0.5
                                }}
                                leftIcon={
                                    <Edit className="h-4 w-4" />
                                }
                            />

                            {/* ================= DELETE ================= */}
                            <Button
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();

                                    if (!canDelete) return;

                                    handleConfirmationDialogBoxOpen(row, index);
                                }}
                                color="transparent"
                                isborderRadius
                                size="sm"
                                title="Delete"
                                disabled={!canDelete}
                                style={{
                                    color: canDelete ? "red" : "#9CA3AF",
                                    cursor: canDelete ? "pointer" : "not-allowed",
                                    opacity: canDelete ? 1 : 0.5
                                }}
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>

                        </div>
                    );
                }
            }

        ],
        [handleEditTermSheetDetails, handleConfirmationDialogBoxOpen, termSheetDetailsList]

    );

    const handleFieldChangeTenantApplicant = (field: keyof AddUpdateTermSheetDetailsRequest, value: any) => {

        setFormDataForTermSheetDetails((prev) => ({ ...prev, [field]: value }));

        if (errorsTermSheetDetails[field]) {
            setErrorsTermSheetDetails((prev) => ({ ...prev, [field]: "" }));
        }
    };

    // ============================================================= [VALIDATION FUNCTION] =============================================================================================
    const validateTermSheetDetailsForm = (): {

        isValid: boolean

        errorsTermSheetDetails: { [key: string]: string }

    } => {
        const newErrorsTermSheetDetails: { [key: string]: string } = {}

        if (!formDataForTermSheetDetails.NameOfInstitutionBankNBFC?.trim()) {
            newErrorsTermSheetDetails.NameOfInstitutionBankNBFC = "Name Of Institution / Bank / NBFC is required";
        }

        if (!formDataForTermSheetDetails.Type?.trim()) {
            newErrorsTermSheetDetails.Type = "Type is required";
        }

        if (!formDataForTermSheetDetails.TermSheetDate) {
            newErrorsTermSheetDetails.TermSheetDate = "Term Sheet Date is required";
        }

        if (formDataForTermSheetDetails.FacilityAmount === undefined || formDataForTermSheetDetails.FacilityAmount === null || Number(formDataForTermSheetDetails.FacilityAmount) <= 0) {
            newErrorsTermSheetDetails.FacilityAmount = "Facility Amount is required";
        }

        if (formDataForTermSheetDetails.RateOfInterestInPercentage === undefined || formDataForTermSheetDetails.RateOfInterestInPercentage === null || Number(formDataForTermSheetDetails.RateOfInterestInPercentage) <= 0) {
            newErrorsTermSheetDetails.RateOfInterestInPercentage = "Rate Of Interest (%) is required";
        }

        if (formDataForTermSheetDetails.ProcessingFeesInPercentage === undefined || formDataForTermSheetDetails.ProcessingFeesInPercentage === null || Number(formDataForTermSheetDetails.ProcessingFeesInPercentage) <= 0) {
            newErrorsTermSheetDetails.ProcessingFeesInPercentage = "Processing Fees (%) is required";
        }

        if (formDataForTermSheetDetails.LegalAndDoumentationFees === undefined || formDataForTermSheetDetails.LegalAndDoumentationFees === null || Number(formDataForTermSheetDetails.LegalAndDoumentationFees) <= 0) {
            newErrorsTermSheetDetails.LegalAndDoumentationFees = "Legal & Documentation Fees is required";
        }

        if (formDataForTermSheetDetails.MonotoriumPeriodInMonth === undefined || formDataForTermSheetDetails.MonotoriumPeriodInMonth === null || Number(formDataForTermSheetDetails.MonotoriumPeriodInMonth) < 0) {
            newErrorsTermSheetDetails.MonotoriumPeriodInMonth = "Moratorium Period is required";
        }

        if (formDataForTermSheetDetails.LoanTenureInMonth === undefined || formDataForTermSheetDetails.LoanTenureInMonth === null || Number(formDataForTermSheetDetails.LoanTenureInMonth) <= 0) {
            newErrorsTermSheetDetails.LoanTenureInMonth = "Loan Tenure is required";
        }

        if (formDataForTermSheetDetails.MinimumSellingPrice === undefined || formDataForTermSheetDetails.MinimumSellingPrice === null || Number(formDataForTermSheetDetails.MinimumSellingPrice) <= 0) {
            newErrorsTermSheetDetails.MinimumSellingPrice = "Minimum Selling Price is required";
        }

        const termSheetDate = convert_date_yy_mm_dd_To_dd_mm_yyyy(formDataForTermSheetDetails.TermSheetDate ? new Date(formDataForTermSheetDetails.TermSheetDate) : undefined);
        const sanctionDate = convert_date_yy_mm_dd_To_dd_mm_yyyy(formDataForTermSheetDetails.SanctionDate ? new Date(formDataForTermSheetDetails.SanctionDate) : undefined);
        const loanStartDate = convert_date_yy_mm_dd_To_dd_mm_yyyy(formDataForTermSheetDetails.LoanStartDate ? new Date(formDataForTermSheetDetails.LoanStartDate) : undefined);
        const loanEndDate = convert_date_yy_mm_dd_To_dd_mm_yyyy(formDataForTermSheetDetails.LoanEndDate ? new Date(formDataForTermSheetDetails.LoanEndDate) : undefined);

        if (formDataForTermSheetDetails?.SanctionDate && formDataForTermSheetDetails.TermSheetDate && !isToDateGreaterOrEqualFromDate(termSheetDate, sanctionDate)) {
            newErrorsTermSheetDetails.SanctionDate = "Sanction Date must be greater than or equal to Term Sheet Date";
        }

        if (formDataForTermSheetDetails.LoanStartDate && !formDataForTermSheetDetails.SanctionDate) {
            newErrorsTermSheetDetails.SanctionDate = "Sanction Date is required when Loan Start Date is entered";
        }

        if (formDataForTermSheetDetails.LoanEndDate && !formDataForTermSheetDetails.LoanStartDate) {
            newErrorsTermSheetDetails.LoanStartDate = "Loan Start Date is required when Loan End Date is entered";
        }

        if (formDataForTermSheetDetails.LoanStartDate && !formDataForTermSheetDetails.LoanEndDate) {
            newErrorsTermSheetDetails.LoanEndDate = "Loan End Date is required when Loan Start Date is entered";
        }

        if (formDataForTermSheetDetails?.SanctionDate && formDataForTermSheetDetails.LoanStartDate && !isToDateGreaterOrEqualFromDate(sanctionDate, loanStartDate)) {
            newErrorsTermSheetDetails.LoanStartDate = "Loan Start Date must be greater than or equal to Sanction Date";
        }

        if (formDataForTermSheetDetails?.LoanStartDate && formDataForTermSheetDetails.LoanEndDate && !isToDateGreaterOrEqualFromDate(loanStartDate, loanEndDate)) {
            newErrorsTermSheetDetails.LoanEndDate = "Loan Start Date must be greater than or equal to Loan End Date";
        }

        const mergedTermSheetFiles = editingTermSheetDetailsData ? calculateMergedFiles(editingTermSheetDetailsData.row._termSheetFiles, termSheetFiles, removedTermSheetURLs) : termSheetFiles.slice();

        if (mergedTermSheetFiles.length === 0) {
            newErrorsTermSheetDetails.TermSheetURL = "Term Sheet is required";
        }


        return {
            isValid: Object.keys(newErrorsTermSheetDetails).length === 0,
            errorsTermSheetDetails: newErrorsTermSheetDetails
        }
    }

    const handleAddUpdateTermSheetDetails = async (e: React.FormEvent) => {

        e.preventDefault();

        setErrorsTermSheetDetails({});

        const validation = validateTermSheetDetailsForm();

        if (!validation.isValid) {

            setErrorsTermSheetDetails(validation.errorsTermSheetDetails);
            return;

        }

        const finalRemovedTermSheetURLs = editingTermSheetDetailsData
            ? calculateRemovedFiles(editingTermSheetDetailsData.row._termSheetFiles, termSheetFiles, removedTermSheetURLs)
            : removedTermSheetURLs;

        const mergedTermSheetFiles = editingTermSheetDetailsData
            ? mergeFiles(editingTermSheetDetailsData.row._termSheetFiles, termSheetFiles, finalRemovedTermSheetURLs)
            : termSheetFiles.slice();

        const termSheetDetailsToSave: TermSheetDetailsData & {
            _termSheetFiles?: (File | string)[];
            RemoveTermSheetURL?: string;
        } = {

            TermSheetDetailsId: editingTermSheetDetailsData?.row.TermSheetDetailsId ?? 0,
            Uniquekey: formDataForTermSheetDetails.Uniquekey ?? "",
            TermSheetId: formDataForTermSheetDetails.TermSheetId ?? 0,
            ProjectId: formDataForTermSheetDetails.ProjectId ?? 0,

            LoanTakenBy: formDataForTermSheetDetails.LoanTakenBy || "",

            NameOfInstitutionBankNBFC: formDataForTermSheetDetails.NameOfInstitutionBankNBFC || "",

            Type: formDataForTermSheetDetails.Type || "",

            TermSheetDate: formDataForTermSheetDetails.TermSheetDate || null,

            SanctionDate: formDataForTermSheetDetails.SanctionDate || null,

            FacilityAmount: formDataForTermSheetDetails.FacilityAmount ?? 0,

            RateOfInterestInPercentage: formDataForTermSheetDetails.RateOfInterestInPercentage ?? 0,

            ProcessingFeesInPercentage: formDataForTermSheetDetails.ProcessingFeesInPercentage ?? 0,

            LegalAndDoumentationFees: formDataForTermSheetDetails.LegalAndDoumentationFees ?? 0,

            MonotoriumPeriodInMonth: formDataForTermSheetDetails.MonotoriumPeriodInMonth ?? 0,

            LoanTenureInMonth: formDataForTermSheetDetails.LoanTenureInMonth ?? 0,

            MinimumSellingPrice: formDataForTermSheetDetails.MinimumSellingPrice ?? 0,

            OtherImportantTermsIfAny: formDataForTermSheetDetails.OtherImportantTermsIfAny || "",

            Remark: formDataForTermSheetDetails.Remark || "",

            LoanStartDate: formDataForTermSheetDetails.LoanStartDate || null,

            LoanEndDate: formDataForTermSheetDetails.LoanEndDate || null,

            EMIAmount: formDataForTermSheetDetails.EMIAmount ?? 0,
            IsApproval: false,
            ApprovalStatus: "Pending",

            TermSheetURL: createFileUrlString(mergedTermSheetFiles),

            TermSheetRepayLedgerData: editingTermSheetDetailsData?.row.TermSheetRepayLedgerData ?? [],

            TotalDisbursedAmount: editingTermSheetDetailsData?.row.TotalDisbursedAmount ?? 0,

            TotalRepayLedgerAmount: editingTermSheetDetailsData?.row.TotalRepayLedgerAmount ?? 0,

            TermSheetDisbursedAmountDetailsData: editingTermSheetDetailsData?.row.TermSheetDisbursedAmountDetailsData ?? [],

            TermSheetSweepRadioDetailsData: editingTermSheetDetailsData?.row.TermSheetSweepRadioDetailsData ?? [],

            TermSheetDirectSellingAgentData: editingTermSheetDetailsData?.row.TermSheetDirectSellingAgentData ?? [],

            TermSheetDebtServiceReserveAccountData: editingTermSheetDetailsData?.row.TermSheetDebtServiceReserveAccountData ?? [],

            CreatedById: 0,
            CreatedBy: '',
            CreatedDate: null,
            ModifiedById: 0,
            ModifiedBy: '',
            ModifiedDate: null,

            _termSheetFiles: mergedTermSheetFiles,

            RemoveTermSheetURL: finalRemovedTermSheetURLs.join(','),

        };


        setTermSheetDetailsList(prev => {
            if (editingTermSheetDetailsData) {
                const updated = [...prev];
                updated[editingTermSheetDetailsData.index] = termSheetDetailsToSave;
                return updated;
            }
            return [...prev, termSheetDetailsToSave];
        });


        setIsAddUpdateTermSheetDetailsModalOpen(false);
        setEditingTermSheetDetailsData(null);
        setFormDataForTermSheetDetails(initialFormStateTermSheetDetails());
        setTermSheetFiles([]);
    };

    const handleDeleteTermSheetDetails = () => {

        if (!deleteTermSheetDetailsData) return;

        const removeIndex = deleteTermSheetDetailsData.index;

        if (removeIndex < 0) {

            setIsConfirmationDialogBoxOpen(false);

            setDeleteTermSheetDetailsData(null);

            addToast({ type: 'error', title: 'Unable to find the selected term sheet details to delete' });

            return;

        }

        setTermSheetDetailsList(prev => prev.filter((_, i) => i !== removeIndex));
        setIsConfirmationDialogBoxOpen(false);
        setDeleteTermSheetDetailsData(null);
        addToast({ type: 'success', title: 'Term Sheet Details Removed' });
    };


    const buildMultipartFormData = (): FormData => {
        const fd = new FormData();

        fd.append('TermSheetId', String(formData.TermSheetId ?? 0));
        fd.append('Uniquekey', String(formData.Uniquekey ?? ''));
        fd.append('ProjectId', String(formData.ProjectId ?? 0));
        fd.append('CompanyId', String(formData.CompanyId ?? 0));
        const addFilesWithExisting = (
            fdLocal: FormData,
            prefix: string,
            fileArray: (File | string)[] | undefined,
            fieldKey: string
        ) => {
            if (!fileArray || fileArray.length === 0) return;

            const existingNames = fileArray
                .filter(x => typeof x === 'string' && String(x).trim().length > 0)
                .map(x => String(x).trim())
                .join(',');

            if (existingNames) {
                fdLocal.append(`${prefix}.${fieldKey}`, existingNames);
            }


            fileArray.forEach(item => {
                if (item instanceof File) {

                    fdLocal.append(`${prefix}.${fieldKey}`, item, item.name);
                }
            });
        };

        termSheetDetailsList.forEach((app, index) => {

            const prefix = `AddUpdateTermSheetDetails[${index}]`;


            fd.append(`${prefix}.TermSheetDetailsId`, String(app.TermSheetDetailsId ?? 0));

            fd.append(`${prefix}.Uniquekey`, app.Uniquekey ?? "");

            fd.append(`${prefix}.TermSheetId`, String(app.TermSheetId ?? formData.TermSheetId ?? 0));

            fd.append(`${prefix}.ProjectId`, String(app.ProjectId ?? listState.ProjectId ?? 0));

            fd.append(`${prefix}.LoanTakenBy`, app.LoanTakenBy ?? "");

            fd.append(`${prefix}.NameOfInstitutionBankNBFC`, app.NameOfInstitutionBankNBFC ?? "");

            fd.append(`${prefix}.Type`, app.Type ?? "");

            fd.append(`${prefix}.TermSheetDate`, app.TermSheetDate ?? "");

            fd.append(`${prefix}.SanctionDate`, app.SanctionDate ?? "");

            fd.append(`${prefix}.FacilityAmount`, String(app.FacilityAmount ?? 0));

            fd.append(`${prefix}.RateOfInterestInPercentage`, String(app.RateOfInterestInPercentage ?? 0));

            fd.append(`${prefix}.ProcessingFeesInPercentage`, String(app.ProcessingFeesInPercentage ?? 0));

            fd.append(`${prefix}.LegalAndDoumentationFees`, String(app.LegalAndDoumentationFees ?? 0));

            fd.append(`${prefix}.MonotoriumPeriodInMonth`, String(app.MonotoriumPeriodInMonth ?? 0));

            fd.append(`${prefix}.LoanTenureInMonth`, String(app.LoanTenureInMonth ?? 0));

            fd.append(`${prefix}.MinimumSellingPrice`, String(app.MinimumSellingPrice ?? 0));

            fd.append(`${prefix}.OtherImportantTermsIfAny`, app.OtherImportantTermsIfAny ?? "");

            fd.append(`${prefix}.Remark`, app.Remark ?? "");

            fd.append(`${prefix}.LoanStartDate`, app.LoanStartDate ?? "");

            fd.append(`${prefix}.LoanEndDate`, app.LoanEndDate ?? "");

            fd.append(`${prefix}.EMIAmount`, String(app.EMIAmount ?? 0));

            fd.append(`${prefix}.RemoveTermSheetURL`, app.RemoveTermSheetURL ?? '');

            const realApp: any = app;

            addFilesWithExisting(fd, prefix, realApp._termSheetFiles, 'TermSheetURL');
        });
        return fd;
    };

    // ============================================================================================================================================================

    const loadProjectMasterWithCompany = useCallback(async (projectId: number) => {

        if (!projectId || projectId <= 0) {
            setCompanyMasterList([]);

            setFormData(prev => ({ ...prev, CompanyId: 0 }));

            return;
        }
        setCompanyMasterList([]);

        setFormData(prev => ({ ...prev, CompanyId: 0 }));

        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {

                const response = await projectMasterService.apiCallPullProjectMasterWithCompany(Number(projectId));

                if (E.isRight(response)) {

                    const companies = response.right.Data ?? [];

                    setCompanyMasterList(companies);

                    if (companies.length > 0) {

                        setFormData(prev => ({ ...prev, CompanyId: Number(companies[0].CompanyId) }));
                    }

                } else {
                    addToast({ type: 'error', title: response.left.message });
                }

                return response;
            },
            undefined,
            (error: any) => {
                addToast({ type: 'error', title: error.message });
            },
            undefined,
            'Loading Company'
        );
    }, [addToast]);

    useEffect(() => {
        const projectId = Number(formData.ProjectId ?? 0);

        loadProjectMasterWithCompany(projectId);
    }, [formData.ProjectId, loadProjectMasterWithCompany]);

    // ============================================================================================================================================================

    const isAnyTermSheetApprovedOrPartialApproved =
        termSheetDetailsList?.some(x => ["APPROVED", "PARTIAL APPROVED"].includes(x?.ApprovalStatus?.trim().toUpperCase() ?? "")) ?? false;

    return (

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">

            <Loader loading={isLoading} title={loadingMessage}>  <div></div> </Loader>


            <div className="flex-1 space-y-2 px-6 py-3">
                <form onSubmit={handleSubmit}>
                    {/* ============================================================= [FLAT DETAILS] ============================================================================================= */}
                    <div className="space-y-4">

                        <div className="flex items-center justify-between border-b border-gray-300 pb-2">

                            <div className="flex items-center gap-2 rounded-lg w-[526px] text-sm text-gray-600">
                                <SinglePageSelection
                                    label="Project"
                                    required
                                    isShowClearSelection={false}
                                    options={(LocalStorageHelper.getStoredEmployeeData?.()?.ProjectData ?? []).map(opt => ({
                                        label: opt.ProjectName,
                                        value: opt.ProjectId
                                    }))}

                                    value={formData.ProjectId ?? 0}
                                    onChange={(value) => handleFieldChange("ProjectId", value)}
                                    placeholder="Select Project"
                                    error={errors.ProjectId}
                                    disabled={isAnyTermSheetApprovedOrPartialApproved}
                                />
                            </div>
                            <div className="pt-8">
                                <Button
                                    type="button"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        if (isAnyTermSheetApprovedOrPartialApproved) return;
                                        setEditingTermSheetDetailsData(null);
                                        setFormDataForTermSheetDetails(initialFormStateTermSheetDetails());

                                        setTermSheetFiles([]);

                                        setRemovedTermSheetURLs([]);

                                        setIsAddUpdateTermSheetDetailsModalOpen(true);

                                    }}
                                    disabled={isAnyTermSheetApprovedOrPartialApproved}
                                    color="blue"
                                    variant="solid"
                                    colorMode="extraLight"
                                    style={{ width: '35px', height: '35px' }}
                                    centerIcon={<Plus className="h-4 w-4" />}
                                    title="Add Term Sheet Details"
                                >
                                </Button>
                            </div>

                        </div>

                        <div className="space-y-4">

                            {companyMasterList?.length ? (

                                companyMasterList.map((c, i) => (

                                    <section key={i} className="relative overflow-hidden bg-white rounded-2xl border border-gray-200">

                                      <div className="p-4 bg-white">

                                       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 border-b border-[#135bec2e] pb-4">
                                    <div className="flex items-center gap-2">
                                        <Building2 className="w-5 h-5 text-[#135bec]" />
                                        <FieldItem label="" value={c.CompanyName ?? "-"} />
                                    </div>
                                    <FieldItem label="City" value={c.CityName ?? "-"} />
                                </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 border-b border-[#135bec2e] pb-4 pt-4">
                                            <FieldItem label="Firms Type" value={c.FirmsType ?? "-"} />
                                            <FieldItem label="Contact Person" value={c.ContactPerson ?? "-"} />
                                            <FieldItem label="Mobile Number" value={`+91 ${c.MobileNumber ?? "-"}`} />
                                            <FieldItem label="E-Mail ID" value={c.EmailId ?? "-"} />
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-1 pt-4">
                                            <FieldItem label="PAN Number" value={c?.PANNumber ?? '-'} urls={c?.PanCardURL} isIcon />
                                            <FieldItem label="GST Number" value={c?.GSTNumber ?? '-'} urls={c?.GSTCertificateURL} isIcon />
                                            <FieldItem label="CIN Number" value={c?.CINNumber ?? '-'} urls={c?.CINURL} isIcon />
                                            <FieldItem label="TAN Number" value={c?.TANNumber ?? '-'} urls={c?.TANURL} isIcon />

                                        </div>

                                    </div>
                                    </section>
                                ))
                            ) : (
                                <section className="md:col-span-4 bg-white rounded-xl p-6 border-[0.1px] border-[#3333334f]">
                                    <NoDataView message="No Company's Found" />
                                </section>
                            )}

                        </div>
                        <DataTable
                            data={termSheetDetailsList}
                            columns={applicantColumns}
                            emptyMessage="No term sheet details found"
                            fixedHeight={false}
                            recordsPerPage={20}
                            className="min-w-full"
                            aria-label="Term Sheet Details list"
                        />
                    </div>




                </form>
            </div >

            <BottomActionBar
                cancelText="Cancel"
                saveText={(formData.TermSheetId && formData.TermSheetId > 0) ? 'Update' : 'Add'}
                onCancel={() => navigate(-1)}
                canAction={canAction}
                onSave={() => {
                    handleSubmit();
                }}
                isLoading={isLoading}
            />


            <Modal
                isOpen={isAddUpdateTermSheetDetailsModalOpen}
                onClose={() => {
                    setIsAddUpdateTermSheetDetailsModalOpen(false)
                    setEditingTermSheetDetailsData(null)
                    setFormDataForTermSheetDetails(initialFormStateTermSheetDetails());
                    setErrorsTermSheetDetails({});
                    setTermSheetFiles([]);

                    setRemovedTermSheetURLs([]);
                }}

                title={editingTermSheetDetailsData ? 'Update Term Sheet' : 'Add Term Sheet'}
                onSubmit={handleAddUpdateTermSheetDetails}
                saveText={editingTermSheetDetailsData ? 'Update' : 'Add'}
                loading={isLoading}
                size='small50'
            >
                <div className="space-y-6">

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Input
                                label="Loan Taken By"
                                error={errorsTermSheetDetails.LoanTakenBy}
                                value={formDataForTermSheetDetails.LoanTakenBy ?? ""}
                                maxLength={100}
                                disabled={!isAddMode && listState?.ApprovalStatus.toUpperCase() === "APPROVED" ? true : false}
                                onChange={(e) => handleFieldChangeTenantApplicant("LoanTakenBy", filterLetters(e.target.value))}
                                placeholder="Enter Loan Taken By"
                            />
                        </div>

                        <div>
                            <Input
                                label="Name Of Institution / Bank / NBFC"
                                required
                                error={errorsTermSheetDetails.NameOfInstitutionBankNBFC}
                                value={formDataForTermSheetDetails.NameOfInstitutionBankNBFC ?? ""}
                                maxLength={100}
                                disabled={!isAddMode && listState?.ApprovalStatus.toUpperCase() === "APPROVED" ? true : false}
                                onChange={(e) => handleFieldChangeTenantApplicant("NameOfInstitutionBankNBFC", filterLetters(e.target.value))}
                                placeholder="Enter Name Of Institution / Bank / NBFC"
                            />
                        </div>

                        <div>

                            <SinglePageSelection
                                label="Type"
                                placeholder="Select Type"
                                required
                                disabled={!isAddMode && listState?.ApprovalStatus.toUpperCase() === "APPROVED" ? true : false}
                                value={formDataForTermSheetDetails?.Type ?? ""}
                                onChange={(e) => handleFieldChangeTenantApplicant('Type', String(e))}
                                options={TERM_SHEET_TYPE_OPTIONS.map((opt) => ({ label: opt.name, value: opt.id }))}
                                error={errorsTermSheetDetails.Type}
                            />
                        </div>

                        <div>
                            <DatePickerInput
                                label="Term Sheet Date"
                                value={formatDate_dd_mm_yyyy(formDataForTermSheetDetails.TermSheetDate ?? "")}
                                onChange={(val) => handleFieldChangeTenantApplicant("TermSheetDate", convert_dd_mm_yyyy_To_Yyyy_mm_dd(val))}
                                error={errorsTermSheetDetails.TermSheetDate}
                                disabled={!isAddMode && listState?.ApprovalStatus.toUpperCase() === "APPROVED" ? true : false}
                                required
                            />
                        </div>

                        

                        <div>
                            <Input
                                value={formDataForTermSheetDetails.FacilityAmount ?? ""}
                                label="Facility Amount (₹)"
                                required
                                error={errorsTermSheetDetails.FacilityAmount}
                                placeholder="Enter Facility Amount"
                                disabled={!isAddMode && listState?.ApprovalStatus.toUpperCase() === "APPROVED" ? true : false}
                                onChange={(e) => handleFieldChangeTenantApplicant("FacilityAmount", filterNumbersWithDecimal(e.target.value) || 0)}
                                rightIcon="₹"
                            />
                        </div>

                        <div>
                            <Input
                                value={formDataForTermSheetDetails.RateOfInterestInPercentage ?? ""}
                                label="Rate Of Interest (%)"
                                required
                                error={errorsTermSheetDetails.RateOfInterestInPercentage}
                                placeholder="Enter Rate Of Interest"
                                onChange={(e) => {
                                    const val = allowPercentage(e.target.value);
                                    if (val !== null) {
                                        handleFieldChangeTenantApplicant("RateOfInterestInPercentage", filterNumbersWithDecimal(e.target.value));
                                    }
                                }}

                                rightIcon="%"
                            />
                        </div>

                        <div>
                            <Input
                                value={formDataForTermSheetDetails.ProcessingFeesInPercentage ?? ""}
                                label="Processing Fees (%)"
                                required
                                error={errorsTermSheetDetails.ProcessingFeesInPercentage}
                                placeholder="Enter Processing Fees"
                                disabled={!isAddMode && listState?.ApprovalStatus.toUpperCase() === "APPROVED" ? true : false}
                                onChange={(e) => {
                                    const val = allowPercentage(e.target.value);
                                    if (val !== null) {
                                        handleFieldChangeTenantApplicant("ProcessingFeesInPercentage", filterNumbersWithDecimal(e.target.value));
                                    }
                                }}
                                rightIcon="%"
                            />
                        </div>

                        <div>
                            <Input
                                value={formDataForTermSheetDetails.LegalAndDoumentationFees ?? ""}
                                label="Legal & Documentation Fees (₹)"
                                required
                                disabled={!isAddMode && listState?.ApprovalStatus.toUpperCase() === "APPROVED" ? true : false}
                                error={errorsTermSheetDetails.LegalAndDoumentationFees}
                                placeholder="Enter Legal & Documentation Fees"
                                onChange={(e) =>
                                    handleFieldChangeTenantApplicant("LegalAndDoumentationFees", filterNumbersWithDecimal(e.target.value) || 0)
                                }
                                rightIcon="₹"
                            />
                        </div>

                        <div>
                            <Input
                                value={formDataForTermSheetDetails.MonotoriumPeriodInMonth ?? ""}
                                label="Moratorium Period (In Month)"
                                disabled={!isAddMode && listState?.ApprovalStatus.toUpperCase() === "APPROVED" ? true : false}
                                required
                                error={errorsTermSheetDetails.MonotoriumPeriodInMonth}
                                placeholder="Enter Moratorium Period"
                                onChange={(e) => handleFieldChangeTenantApplicant("MonotoriumPeriodInMonth", filterNumbers(e.target.value) || 0)}
                                rightIcon="Month"
                            />
                        </div>

                        <div>
                            <Input
                                value={formDataForTermSheetDetails.LoanTenureInMonth ?? ""}
                                label="Loan Tenure (In Month)"
                                disabled={!isAddMode && listState?.ApprovalStatus.toUpperCase() === "APPROVED" ? true : false}
                                required
                                error={errorsTermSheetDetails.LoanTenureInMonth}
                                placeholder="Enter Loan Tenure"
                                onChange={(e) => handleFieldChangeTenantApplicant("LoanTenureInMonth", filterNumbers(e.target.value) || 0)}
                                rightIcon="Month"
                            />
                        </div>

                        <div>
                            <Input
                                value={formDataForTermSheetDetails.MinimumSellingPrice ?? ""}
                                label="Minimum Selling Price (₹)"
                                disabled={!isAddMode && listState?.ApprovalStatus.toUpperCase() === "APPROVED" ? true : false}
                                required
                                error={errorsTermSheetDetails.MinimumSellingPrice}
                                placeholder="Enter Minimum Selling Price"
                                onChange={(e) => handleFieldChangeTenantApplicant("MinimumSellingPrice", filterNumbersWithDecimal(e.target.value) || 0)}
                                rightIcon="₹"
                            />
                        </div>

                         <div>
                            <MultiFilePicker
                                label="Term Sheet"
                                required
                                placeholder="Select Term Sheet"
                                error={errorsTermSheetDetails.TermSheetURL}
                                value={termSheetFiles}
                                disabled={!isAddMode && listState?.ApprovalStatus.toUpperCase() === "APPROVED" ? true : false}
                                onChange={setTermSheetFiles}
                                allowedTypes={['application/pdf']}
                                onRemoveExisting={(url) => setRemovedTermSheetURLs((prev) => [...prev, url])}
                            />
                        </div>
<div>
                            <DatePickerInput
                                label="Sanction Date"
                                value={formatDate_dd_mm_yyyy(formDataForTermSheetDetails.SanctionDate ?? "")}
                                onChange={(val) => handleFieldChangeTenantApplicant("SanctionDate", convert_dd_mm_yyyy_To_Yyyy_mm_dd(val))}
                                error={errorsTermSheetDetails.SanctionDate}
                            />
                        </div>
                        <div>
                            <Input
                                value={formDataForTermSheetDetails.EMIAmount ?? ""}
                                label="EMI Amount (₹)"
                                error={errorsTermSheetDetails.EMIAmount}
                                placeholder="Enter EMI Amount"
                                onChange={(e) => handleFieldChangeTenantApplicant("EMIAmount", filterNumbersWithDecimal(e.target.value) || 0)}
                                rightIcon="₹"
                            />
                        </div>

                        <div>
                            <DatePickerInput
                                label="Loan Start Date"
                                value={formatDate_dd_mm_yyyy(formDataForTermSheetDetails.LoanStartDate ?? "")}
                                onChange={(val) => handleFieldChangeTenantApplicant("LoanStartDate", convert_dd_mm_yyyy_To_Yyyy_mm_dd(val))}
                                error={errorsTermSheetDetails.LoanStartDate}
                            />
                        </div>

                        <div>
                            <DatePickerInput
                                label="Loan End Date"
                                value={formatDate_dd_mm_yyyy(formDataForTermSheetDetails.LoanEndDate ?? "")}
                                onChange={(val) => handleFieldChangeTenantApplicant("LoanEndDate", convert_dd_mm_yyyy_To_Yyyy_mm_dd(val))}
                                error={errorsTermSheetDetails.LoanEndDate}
                            />
                        </div>


                       
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-1 gap-6">

                        <TextArea
                            label="Other Important Terms If Any"
                            maxLength={500}
                            value={formDataForTermSheetDetails.OtherImportantTermsIfAny ?? ""}
                            onChange={(e) => handleFieldChangeTenantApplicant("OtherImportantTermsIfAny", e.target.value)}
                            placeholder="Enter Terms If Any"
                            error={errors.OtherImportantTermsIfAny} />

                        <TextArea
                            label="Remark"
                            maxLength={500}
                            value={formDataForTermSheetDetails.Remark ?? ""}
                            onChange={(e) => handleFieldChangeTenantApplicant("Remark", e.target.value)}
                            placeholder="Enter Remark"
                            error={errors.Remark} />

                    </div>

                </div>
            </Modal>

            <DeleteDialog
                isOpen={isConfirmationDialogBoxOpen}
                onClose={() => {
                    setIsConfirmationDialogBoxOpen(false)
                    setDeleteTermSheetDetailsData(null)
                }}
                onConfirm={handleDeleteTermSheetDetails}
                loading={isLoading}
                pageName='Term Sheet Details'
            />
        </div >
    );
};

export default AddUpdateTermSheet;
