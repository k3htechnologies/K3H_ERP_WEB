import { useNavigate } from "react-router-dom";
import { FieldItem } from "@/ui/components/forms/FieldItem";
import { convert_date_yy_mm_dd_To_dd_mm_yyyy, convert_dd_mm_yyyy_To_Yyyy_mm_dd, formatDate_dd_mm_yyyy, formatDate_dd_MonthName_yy, formatDate_dd_MonthName_yy_hh_mm } from "@/core/utils/dateFormat";
import HeaderActionBar from "@/ui/components/forms/HeaderActionBar";
import { useMenuPermissions } from "@/features/menu/hooks/useMenuPermissions";
import { Fragment, useEffect, useState } from "react";
import useToast from "@/core/hooks/useToast";
import * as E from "fp-ts/Either";
import { runApiWithLoader } from "@/core/utils";
import { Loader } from "@/core/utils/loader";
import { parseDocumentUrls } from "@/core/utils/documentUtils";
import MultiImageViewer from "@/ui/components/ImageViewer/ImageViewer";
import { useTermSheetListState } from "@/features/termSheet/context/TermSheetListStateContext";
import Tabs from "@/ui/components/Tab/Tab";
import { termSheetService } from "@/features/termSheet/services/TermSheetService";
import NoDataView from "@/ui/components/NoDataView/NoDataView";
import type { AddUpdateTermSheetDebtServiceReserveAccountRequest, AddUpdateTermSheetDirectSellingAgentRequest, AddUpdateTermSheetDisbursedAmountDetailsRequest, AddUpdateTermSheetRepayLedgerRequest, AddUpdateTermSheetSweepRatioDetailsRequest, DeleteTermSheetDebtServiceReserveAccountRequest, DeleteTermSheetRepayLedgerRequest, FinalizeTermSheetDetails, TermSheetDebtServiceReserveAccountData, TermSheetDetailsData, TermSheetDirectSellingAgentData, TermSheetDisbursedAmountDetailsData, TermSheetRepayLedgerData, TermSheetSweepRatioDetailsData, TermSheetViewData } from "@/features/termSheet/models/TermSheetModel";
import type { FilterWithPaginationTermSheetDocumentRequest, TermSheetDocumentData } from "@/features/termSheet/models/TermSheetDocumentModel";
import { termSheetDocumentService } from "@/features/termSheet/services/TermSheetDocumentService";
import { formatCurrency, formatToKLCr, isToDateGreaterOrEqualFromDate } from "@/core/utils/comman";
import ApprovalActions from "@/features/modulesWorkflowApproval/components/ApprovalActionsButton";
import type { ModulesApprovalStatusRequest, UpdateModulesWorkflowApprovalRequest } from "@/features/modulesWorkflowApproval/models/ModulesWorkflowApprovalModel";
import { ApprovalLogModal } from "@/features/modulesWorkflowApproval/components/ApprovalLogModal";
import ApprovalActionModal from "@/features/modulesWorkflowApproval/components/ApprovalActionModal";
import { modulesWorkflowApprovalService } from "@/features/modulesWorkflowApproval/services/ModulesWorkflowApprovalService";
import { Button } from "@/ui/components/forms/Button";
import { Modal } from "@/ui/components/Modal/Modal";
import DatePickerInput from "@/ui/components/forms/Datepicker";
import { Input } from "@/ui/components/forms";
import { DeleteDialog } from "@/ui/components/forms/DeleteDialog";
import { allowPercentage, filterNumbersWithDecimal } from "@/core/utils/fileValidation";
import { Building2, Edit, Trash2 } from "lucide-react";
import { projectMasterService } from "@/features/projectMaster/services/ProjectMasterService";
import type { CompanyMasterData } from "@/features/companyMaster/models/CompanyMasterModel";
import { TextArea } from "@/ui/components/forms/Textarea";
import { TERM_SHEET_DSRA_TERM_OPTIONS } from "@/core/constants";
import { SinglePageSelection } from "@/ui/components/DropDown/SinglePageSelection";

import FieldInfoTooltip from "@/ui/components/forms/FieldInfoTooltip";

const ViewTermSheet: React.FC = () => {
    const { listState } = useTermSheetListState();
    const [termSheetViewData, setTermSheetViewDataData] = useState<TermSheetViewData | null>(null);
    const [termSheetDocumentList, setTermSheetDocumentList] = useState<TermSheetDocumentData[]>([]);
    const [loadingMessage, setLoadingMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const { canAction } = useMenuPermissions("/termSheet");
    const { addToast } = useToast();

    const [isApprovalLogModalOpen, setIsApprovalLogModalOpen] = useState(false);
    const [approvalLogRequest, setApprovalLogRequest] = useState<ModulesApprovalStatusRequest | null>(null);

    const [nameOfInstitutionBankNBFC, setNameOfInstitutionBankNBFC] = useState<string | null>("");
    const [type, setType] = useState<string | null>("");
    const [facilityAmount, setFacilityAmount] = useState<number | null>(0);

    const [isApprovalActionModalOpen, setIsApprovalActionModalOpen] = useState(false);
    const [approvalActionType, setApprovalActionType] = useState<"approve" | "reject">("approve");
    const [approvalRowData, setApprovalRowData] = useState<TermSheetDetailsData | null>(null);

    const termSheetTabList = [

        { id: "Overview", label: "Overview" },
        ...(["APPROVED", "CLOSED"].includes(listState?.ApprovalStatus?.toUpperCase() ?? "") ? [{ id: "Disbursement", label: "Disbursement" }] : []),
        ...(["APPROVED", "CLOSED"].includes(listState?.ApprovalStatus?.toUpperCase() ?? "") ? [{ id: "Sweep Ratio", label: "Sweep Ratio" }] : []),
        ...(["APPROVED", "CLOSED"].includes(listState?.ApprovalStatus?.toUpperCase() ?? "") ? [{ id: "DSA", label: "DSA" }] : []),
        ...(["APPROVED", "CLOSED"].includes(listState?.ApprovalStatus?.toUpperCase() ?? "") ? [{ id: "Repayment", label: "Repayment" }] : []),
        ...(["APPROVED", "CLOSED"].includes(listState?.ApprovalStatus?.toUpperCase() ?? "") ? [{ id: "DSRA", label: "DSRA" }] : []),
        ...(["APPROVED", "CLOSED"].includes(listState?.ApprovalStatus?.toUpperCase() ?? "") ? [{ id: "Document", label: "Document" }] : []),
    ];

    const [activeTab, setActiveTab] = useState<string>(termSheetTabList[0].id);
    const [companyMasterList, setCompanyMasterList] = useState<CompanyMasterData[]>([]);
    const [isConfirmationDialogBoxOpen, setIsConfirmationDialogBoxOpen] = useState(false);
    const [finalizeTermSheetDetailsData, setFinalizeTermSheetDetailsData] = useState<FinalizeTermSheetDetails | null>(null);;
    const [isClosingModalOpen, setIsClosingModalOpen] = useState(false);

    const [closingFormData, setClosingFormData] = useState({
        ClosingDate: "",
        ClosingRemark: "",
    });

    const [closingErrors, setClosingErrors] = useState<{
        ClosingDate?: string;
        ClosingRemark?: string;
    }>({});
    // =======================================================================================================================================

    const [isDisbursedAmountModalOpen, setIsDisbursedAmountModalOpen] = useState(false);

    const [isDeleteDisbursedAmountDialogOpen, setIsDeleteDisbursedAmountDialogOpen] = useState(false);

    const [selectedDisbursedAmountItem, setSelectedDisbursedAmountItem] = useState<TermSheetDisbursedAmountDetailsData | null>(null);

    const initialDisbursedAmountFormData = (): AddUpdateTermSheetDisbursedAmountDetailsRequest => ({
        TermSheetDisbursedAmountDetailsId: 0,
        Uniquekey: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
        TermSheetId: Number(listState.TermSheetId),
        TermSheetDetailsId: Number(listState.TermSheetDetailsId),
        ProjectId: Number(listState.ProjectId),
        DisbursedAmount: 0,
        DisbursedDate: "",
        Remark: "",
    });

    const [disbursedAmountFormData, setDisbursedAmountFormData] = useState<AddUpdateTermSheetDisbursedAmountDetailsRequest>(initialDisbursedAmountFormData());

    const [errorsDisbursedAmount, setErrorsDisbursedAmount] = useState<{ [key: string]: string }>({});

    // =======================================================================================================================================

    const [isSweepRatioModalOpen, setIsSweepRatioModalOpen] = useState(false);

    const [isDeleteSweepRatioDialogOpen, setIsDeleteSweepRatioDialogOpen] = useState(false);

    const [selectedSweepRatioItem, setSelectedSweepRatioItem] = useState<any | null>(null);

    const initialSweepRatioFormData = (): AddUpdateTermSheetSweepRatioDetailsRequest => ({
        TermSheetSweepRatioDetailsId: 0,
        Uniquekey: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
        TermSheetId: Number(listState.TermSheetId),
        TermSheetDetailsId: Number(listState.TermSheetDetailsId),
        ProjectId: Number(listState.ProjectId),
        OwnSweepRatioInPercentage: 0,
        LenderSweepRatioInPercentage: 0,
        Date: "",
        Remark: "",
    });
    const [sweepRatioFormData, setSweepRatioFormData] = useState<AddUpdateTermSheetSweepRatioDetailsRequest>(initialSweepRatioFormData());


    const [errorsSweepRatio, setErrorsSweepRatio] = useState<{ [key: string]: string }>({});

    // =======================================================================================================================================

    const [isDirectSellingAgentModalOpen, setIsDirectSellingAgentModalOpen] = useState(false);

    const [isDeleteDirectSellingAgentDialogOpen, setIsDeleteDirectSellingAgentDialogOpen] = useState(false);

    const [selectedDirectSellingAgentItem, setSelectedDirectSellingAgentItem] = useState<any | null>(null);


    const initialDirectSellingAgentFormData = (): AddUpdateTermSheetDirectSellingAgentRequest => ({
        TermSheetDirectSellingAgentId: 0,
        Uniquekey: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
        TermSheetId: Number(listState.TermSheetId),
        TermSheetDetailsId: Number(listState.TermSheetDetailsId),
        ProjectId: Number(listState.ProjectId),
        Amount: 0,
        NameOfConsultant: "",
        CommissionInPercentage: 0,
        PaymentDate: "",
        Remark: "",
    });

    const [directSellingAgentFormData, setDirectSellingAgentFormData] = useState<AddUpdateTermSheetDirectSellingAgentRequest>(initialDirectSellingAgentFormData());


    const [errorsDirectSellingAgent, setErrorsDirectSellingAgent] = useState<{ [key: string]: string }>({});
    // =======================================================================================================================================

    const [isRepayLedgerModalOpen, setIsRepayLedgerModalOpen] = useState(false);

    const [isDeleteRepayLedgerDialogOpen, setIsDeleteRepayLedgerDialogOpen] = useState(false);

    const [selectedRepayLedgerItem, setSelectedRepayLedgerItem] = useState<TermSheetRepayLedgerData | null>(null);

    const initialRepayLedgerFormData = (): AddUpdateTermSheetRepayLedgerRequest => ({
        TermSheetRepayLedgerId: 0,
        Uniquekey: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
        TermSheetId: Number(listState.TermSheetId),
        TermSheetDetailsId: Number(listState.TermSheetDetailsId),
        ProjectId: Number(listState.ProjectId),
        Amount: 0,
        PaymentDate: "",
        Remark: "",
    });

    const [repayLedgerFormData, setRepayLedgerFormData] = useState<AddUpdateTermSheetRepayLedgerRequest>(initialRepayLedgerFormData());

    const [errorsRepayLedger, setErrorsRepayLedger] = useState<{ [key: string]: string }>({});

    // ============================================================================================================================================================
    // DSRA
    // ============================================================================================================================================================

    const [isDebtServiceReserveAccountModalOpen, setIsDebtServiceReserveAccountModalOpen] = useState(false);

    const [isDeleteDebtServiceReserveAccountDialogOpen, setIsDeleteDebtServiceReserveAccountDialogOpen] = useState(false);

    const [selectedDebtServiceReserveAccountItem, setSelectedDebtServiceReserveAccountItem] = useState<TermSheetDebtServiceReserveAccountData | null>(null);

    const initialDebtServiceReserveAccountFormData = (): AddUpdateTermSheetDebtServiceReserveAccountRequest => ({
        TermSheetDebtServiceReserveAccountId: 0,
        Uniquekey: "3fa85f64-5717-4562-b3fc-2c963f66afa6",

        TermSheetId: Number(listState.TermSheetId),
        TermSheetDetailsId: Number(listState.TermSheetDetailsId),
        ProjectId: Number(listState.ProjectId),

        Term: "",
        Unit: 0,
        PerUnitRate: 0,
        Amount: 0,
        Date: "",

        RateOfInterestInPercentage: 0,
        RedemptionValue: 0,
        MaturityPeriod: 0,

        WithdrawAmount: 0,
        WithdrawDate: "",

        Remark: ""

    });

    const [debtServiceReserveAccountFormData, setDebtServiceReserveAccountFormData] = useState<AddUpdateTermSheetDebtServiceReserveAccountRequest>(initialDebtServiceReserveAccountFormData());

    const [errorsDebtServiceReserveAccount, setErrorsDebtServiceReserveAccount] = useState<{ [key: string]: string }>({});
    // =======================================================================================================================================
    useEffect(() => {

        if (!listState.ProjectId || listState.TermSheetId === 0) return;

        fetchTermSheetDetails();
        loadProjectMasterWithCompany();

    }, [listState.ProjectId, listState.TermSheetId, addToast]);

    const fetchTermSheetDetails = async () => {
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {

                const response = await termSheetService.apiCallPullTermSheetView({ ProjectId: listState.ProjectId, TermSheetId: listState.TermSheetId });

                if (E.isRight(response)) {

                    const data = response.right.Data;

                    setTermSheetViewDataData(Array.isArray(data) ? (data[0] ?? null) : data);

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
            "Loading Term Sheet",
        );
    };

    const fetchTermSheetDocumentList = async () => {
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {
                const params: FilterWithPaginationTermSheetDocumentRequest = {
                    PageNumber: 1,
                    PageSize: 100,
                    ProjectId: Number(listState.ProjectId),
                    TermSheetId: Number(listState.TermSheetId),
                    TermSheetDetailsId: Number(listState.TermSheetDetailsId),
                };
                const response = await termSheetDocumentService.apiCallPullTermSheetDocument(params);

                if (E.isRight(response)) {
                    setTermSheetDocumentList(response.right.Data);
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
            "Loading Term Sheet Document",
        );
    };

    const handleBackToListTermSheet = () => {
        navigate("/termSheet");
    };

    const handleEditTermSheet = (row: TermSheetViewData) => {
        if (!row?.TermSheetId) return;
        navigate(`/termSheet/add/${row.TermSheetId}`);
    };

    const handleEditTermSheetDocument = (row: TermSheetDocumentData) => {
        if (!row?.TermSheetId) return;
        navigate(`/termSheet/document`);
    };

    const docsWithUrls = termSheetDocumentList.filter((d) => {

        const urls = parseDocumentUrls(d.DocumentURL ?? "").filter((x) => x?.trim()?.length);

        return urls.length > 0;
    });

    const handleApprovalLog = (row: TermSheetDetailsData) => {
        const request: ModulesApprovalStatusRequest = {
            ModuleName: "TERM SHEET APPROVAL",
            Id: row.TermSheetDetailsId ?? 0,
            ProjectId: listState.ProjectId ?? 0,
        };
        setNameOfInstitutionBankNBFC(row.NameOfInstitutionBankNBFC);
        setType(row?.Type)
        setFacilityAmount(row?.FacilityAmount);

        setApprovalLogRequest(request);
        setIsApprovalLogModalOpen(true);
    };

    const handleApproveRejectDocument = (row: TermSheetDetailsData, approvalType: "approve" | "reject") => {

        setApprovalRowData(row);
        setNameOfInstitutionBankNBFC(row.NameOfInstitutionBankNBFC);
        setType(row?.Type);
        setFacilityAmount(row?.FacilityAmount);
        setApprovalActionType(approvalType);
        setIsApprovalActionModalOpen(true);

    };

    const handleApprovalSubmit = async (remark: string) => {

        if (!approvalRowData) return;

        const payload: UpdateModulesWorkflowApprovalRequest = {
            ModuleName: "TERM SHEET APPROVAL",
            Id: approvalRowData.TermSheetDetailsId ?? 0,
            ProjectId: approvalRowData.ProjectId ?? 0,
            IsApproved: approvalActionType === "approve",
            Remarks: remark ?? null
        };

        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {

                const response = await modulesWorkflowApprovalService.apiCallupdateModulesWorkflowApproval(payload);

                if (E.isRight(response)) {

                    addToast({ type: "success", title: response.right.SuccessMessage?.[0] });

                    setIsApprovalActionModalOpen(false);

                    await fetchTermSheetDetails();

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
            approvalActionType === "approve" ? "Approving Term Sheet" : "Rejecting Term Sheet"
        );
    };


    const handleFinalizeConfirmation = () => {

        if (isClosedFlag) {

            setClosingFormData({
                ClosingDate: "",
                ClosingRemark: "",
            });

            setClosingErrors({});
            setIsClosingModalOpen(true);

            return;
        }

        setFinalizeTermSheetDetailsData({
            TermSheetId: listState.TermSheetId ?? 0,
            ProjectId: listState.ProjectId ?? 0,
            ActionType: "FINAL APPROVAL",
        });

        setIsConfirmationDialogBoxOpen(true);
    };

    const handleSubmitFinalizeTermSheetDetails = async () => {

        if (!finalizeTermSheetDetailsData) return;

        if (isClosedFlag) {

            if (!finalizeTermSheetDetailsData.ClosingDate?.trim()) {
                addToast({ type: "error", title: "Closing Date is required." });
                return;
            }

            if (!finalizeTermSheetDetailsData.ClosingRemark?.trim()) {
                addToast({ type: "error", title: "Closing Remarks is required." });
                return;
            }
        }

        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {

                const payload: FinalizeTermSheetDetails = {
                    TermSheetId: listState.TermSheetId ?? 0,
                    ProjectId: listState.ProjectId ?? 0,
                    ActionType: isClosedFlag ? "CLOSED" : "FINAL APPROVAL",
                    ClosingDate: isClosedFlag ? finalizeTermSheetDetailsData.ClosingDate : null,
                    ClosingRemark: isClosedFlag ? finalizeTermSheetDetailsData.ClosingRemark : "",
                };

                const response = await termSheetService.apiCallFinalizeTermSheetDetails(payload);

                if (E.isRight(response)) {

                    addToast({ type: "success", title: response.right?.SuccessMessage[0] });

                    setIsConfirmationDialogBoxOpen(false);
                    setFinalizeTermSheetDetailsData(null);

                    navigate("/termSheet");

                } else {

                    addToast({ type: "error", title: response.left?.message });
                }

                return response;
            },
            undefined,
            (error: any) => {
                addToast({ type: "error", title: error.message });
            },
            undefined,
            "Finalize Term Sheet"
        );
    };

    const handleSubmitFinalizeTermSheetClosing = async (e: React.FormEvent) => {

        e.preventDefault();

        const errors: { ClosingDate?: string; ClosingRemark?: string; } = {};

        if (!closingFormData.ClosingDate?.trim()) {
            errors.ClosingDate = "Closing Date is required.";
        }

        if (!closingFormData.ClosingRemark?.trim()) {
            errors.ClosingRemark = "Closing Remarks is required.";
        }

        if (Object.keys(errors).length > 0) {
            setClosingErrors(errors);
            return;
        }

        setClosingErrors({});

        const payload: FinalizeTermSheetDetails = {
            TermSheetId: listState.TermSheetId ?? 0,
            ProjectId: listState.ProjectId ?? 0,
            ActionType: "CLOSED",
            ClosingDate: closingFormData.ClosingDate,
            ClosingRemark: closingFormData.ClosingRemark.trim(),
        };

        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {

                const response = await termSheetService.apiCallFinalizeTermSheetDetails(payload);

                if (E.isRight(response)) {

                    addToast({ type: "success", title: response.right?.SuccessMessage?.[0], });

                    setIsClosingModalOpen(false);

                    setClosingFormData({ ClosingDate: "", ClosingRemark: "", });

                    setClosingErrors({});

                    navigate("/termSheet");

                } else {

                    addToast({ type: "error", title: response.left?.message });
                }

                return response;
            },
            undefined,
            (error: any) => {
                addToast({ type: "error", title: error.message });
            },
            undefined,
            "Closing Term Sheet"
        );
    };

    const isAnyInstitutionApproved = termSheetViewData?.TermSheetDetailsData?.some((item) => item.ApprovalStatus?.toUpperCase() === "APPROVED") ?? false;

    const isClosed = Boolean(listState?.ApprovalStatus.toUpperCase() === "CLOSED" ? true : false);

    const isClosedFlag = Boolean(termSheetViewData?.IsClosed);

    // ============================================================================================================================================================
    const handleOpenDisbursedAmountModal = (item?: Partial<TermSheetDisbursedAmountDetailsData>) => {
        setErrorsDisbursedAmount({});

        if (item) {
            setDisbursedAmountFormData({
                TermSheetDisbursedAmountDetailsId: item.TermSheetDisbursedAmountDetailsId ?? 0,

                Uniquekey: item.Uniquekey || "3fa85f64-5717-4562-b3fc-2c963f66afa6",

                TermSheetId: Number(listState.TermSheetId),

                TermSheetDetailsId: Number(item.TermSheetDetailsId ?? listState.TermSheetDetailsId),

                ProjectId: Number(listState.ProjectId),

                DisbursedAmount: item.DisbursedAmount ?? 0,

                DisbursedDate: item.DisbursedDate || "",

                Remark: item.Remark || "",

            });
        } else {
            setErrorsDisbursedAmount({});

            setDisbursedAmountFormData(initialDisbursedAmountFormData());
        }

        setIsDisbursedAmountModalOpen(true);
    };

    const handleDisbursedAmountModal = () => {
        setIsDisbursedAmountModalOpen(false);

        setDisbursedAmountFormData(initialDisbursedAmountFormData());

        setErrorsDisbursedAmount({});
    };

    const handleDisbursedAmountFieldChange = (field: keyof AddUpdateTermSheetDisbursedAmountDetailsRequest, value: any) => {
        setDisbursedAmountFormData((prev) => ({ ...prev, [field]: value }));

        if (errorsDisbursedAmount[field]) {
            setErrorsDisbursedAmount((prev) => ({ ...prev, [field]: "" }));
        }
    };

    const validateDisbursedAmountForm = (): { isValid: boolean; errors: { [key: string]: string } } => {

        const newErrors: { [key: string]: string } = {};

        const details = termSheetViewData?.TermSheetDetailsData ?? [];

        if (details.length === 0) {
            addToast({ type: "error", title: "At least one Term Sheet Details is required." });
            return { isValid: false, errors: newErrors };
        }

        for (const item of details) {

            if (!item.SanctionDate?.trim()) {
                addToast({ type: "error", title: `${item.NameOfInstitutionBankNBFC ?? "Institution"}: Sanction Date is required.` });
                return { isValid: false, errors: newErrors };

            }

            if (!item.LoanStartDate?.trim()) {
                addToast({ type: "error", title: `${item.NameOfInstitutionBankNBFC ?? "Institution"}: Loan Start Date is required.` });
                return { isValid: false, errors: newErrors };

            }

            if (!item.LoanEndDate?.trim()) {
                addToast({ type: "error", title: `${item.NameOfInstitutionBankNBFC ?? "Institution"}: Loan End Date is required.` });
                return { isValid: false, errors: newErrors };

            }

            if (item.EMIAmount === undefined || item.EMIAmount === null || Number(item.EMIAmount) <= 0) {
                addToast({ type: "error", title: `${item.NameOfInstitutionBankNBFC ?? "Institution"}: EMI is required.` });
                return { isValid: false, errors: newErrors };

            }
        }

        if (Object.keys(newErrors).length > 0) {
            return { isValid: false, errors: newErrors };
        }


        if (disbursedAmountFormData.DisbursedAmount === undefined || disbursedAmountFormData.DisbursedAmount === null || Number(disbursedAmountFormData.DisbursedAmount) <= 0) {
            newErrors.DisbursedAmount = "Disbursed Amount is required.";
        }

        if (!disbursedAmountFormData.DisbursedDate?.trim()) {
            newErrors.DisbursedDate = "Disbursed Date is required.";
        }

        const facilityAmount = Number(termSheetViewData?.TermSheetDetailsData?.find(x => Number(x.TermSheetDetailsId) === Number(listState.TermSheetDetailsId))?.FacilityAmount ?? 0);

        const termSheetDetails = termSheetViewData?.TermSheetDetailsData?.find(item => Number(item.TermSheetDetailsId) === Number(listState.TermSheetDetailsId));

        const existingDisbursedAmount = termSheetDetails?.TermSheetDisbursedAmountDetailsData?.reduce((total, item) => {

            if (Number(item.TermSheetDisbursedAmountDetailsId) === Number(disbursedAmountFormData.TermSheetDisbursedAmountDetailsId)) {
                return total;
            }

            return total + Number(item.DisbursedAmount ?? 0);
        }, 0) ?? 0;

        const newTotalDisbursed = existingDisbursedAmount + Number(disbursedAmountFormData.DisbursedAmount ?? 0);

        const remaingDisbursedAmount = Number(facilityAmount ?? 0) - existingDisbursedAmount;

        if (newTotalDisbursed > facilityAmount) {
            newErrors.DisbursedAmount = `Total Disbursed Amount cannot be greater than Facility Amount (${formatCurrency(remaingDisbursedAmount)}).`;
        }

        return {
            isValid: Object.keys(newErrors).length === 0,
            errors: newErrors,
        };
    };

    const handleAddUpdateDisbursedAmount = async (e: React.FormEvent) => {
        e.preventDefault();

        setErrorsDisbursedAmount({});

        const validation = validateDisbursedAmountForm();

        if (!validation.isValid) {
            setErrorsDisbursedAmount(validation.errors);
            return;
        }

        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {

                const payload: AddUpdateTermSheetDisbursedAmountDetailsRequest = {

                    TermSheetDisbursedAmountDetailsId: disbursedAmountFormData.TermSheetDisbursedAmountDetailsId ?? 0,

                    Uniquekey: disbursedAmountFormData.Uniquekey ?? "3fa85f64-5717-4562-b3fc-2c963f66afa6",

                    TermSheetId: Number(listState.TermSheetId),

                    TermSheetDetailsId: Number(listState.TermSheetDetailsId),

                    ProjectId: Number(listState.ProjectId),

                    DisbursedAmount: Number(disbursedAmountFormData.DisbursedAmount),

                    DisbursedDate: disbursedAmountFormData.DisbursedDate || null,

                    Remark: disbursedAmountFormData.Remark || "",
                };

                const response = await termSheetService.apiCallAddUpdateTermSheetDisbursedAmountDetails(payload);

                if (E.isRight(response)) {

                    addToast({ type: "success", title: response.right.SuccessMessage?.[0] });

                    setIsDisbursedAmountModalOpen(false);

                    setDisbursedAmountFormData(initialDisbursedAmountFormData());

                    await fetchTermSheetDetails();

                } else {

                    addToast({ type: "error", title: response.left.message });

                }

                return response;
            },
            undefined,
            (error: any) => addToast({ type: "error", title: error.message }),
            undefined,
            disbursedAmountFormData.TermSheetDisbursedAmountDetailsId ? "Updating Disbursed Amount" : "Adding Disbursed Amount"
        );
    };

    const handleConfirmDeleteDisbursedAmount = (item: TermSheetDisbursedAmountDetailsData) => {
        setSelectedDisbursedAmountItem(item);
        setIsDeleteDisbursedAmountDialogOpen(true);
    };

    const handleDeleteDisbursedAmount = async () => {

        if (!selectedDisbursedAmountItem) return;

        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {

                const params = {

                    TermSheetDisbursedAmountDetailsId: selectedDisbursedAmountItem.TermSheetDisbursedAmountDetailsId ?? 0,

                    Uniquekey: selectedDisbursedAmountItem.Uniquekey ?? "",

                    TermSheetId: Number(listState.TermSheetId),

                    TermSheetDetailsId: Number(listState.TermSheetDetailsId),

                    ProjectId: Number(listState.ProjectId),
                };

                const response = await termSheetService.apiCallDeleteTermSheetDisbursedAmountDetails(params);

                if (E.isRight(response)) {

                    addToast({ type: "success", title: response.right.SuccessMessage?.[0] });

                    setIsDeleteDisbursedAmountDialogOpen(false);

                    setSelectedDisbursedAmountItem(null);

                    await fetchTermSheetDetails();

                } else {

                    addToast({ type: "error", title: response.left.message });

                }

                return response;
            },
            undefined,
            (error: any) => addToast({ type: "error", title: error.message }),
            undefined,
            "Deleting Disbursed Amount Details"
        );
    };

    // ============================================================================================================================================================

    const handleOpenSweepRatioModal = (item?: Partial<TermSheetSweepRatioDetailsData>) => {
        setErrorsSweepRatio({});

        if (item) {

            setSweepRatioFormData({
                TermSheetSweepRatioDetailsId: item.TermSheetSweepRatioDetailsId ?? 0,

                Uniquekey: item.Uniquekey || "3fa85f64-5717-4562-b3fc-2c963f66afa6",

                TermSheetId: Number(listState.TermSheetId),

                TermSheetDetailsId: Number(item.TermSheetDetailsId ?? listState.TermSheetDetailsId),

                ProjectId: Number(listState.ProjectId),

                OwnSweepRatioInPercentage: item.OwnSweepRatioInPercentage ?? 0,

                LenderSweepRatioInPercentage: item.LenderSweepRatioInPercentage ?? 0,

                Date: item.Date || "",

                Remark: item.Remark || "",
            });
        } else {
            setSweepRatioFormData(initialSweepRatioFormData());
        }

        setIsSweepRatioModalOpen(true);
    };

    const handleSweepRatioModal = () => {
        setIsSweepRatioModalOpen(false);

        setSweepRatioFormData(initialSweepRatioFormData());

        setErrorsSweepRatio({});
    };

    const handleSweepRatioFieldChange = (field: keyof AddUpdateTermSheetSweepRatioDetailsRequest, value: any) => {
        setSweepRatioFormData((prev) => ({
            ...prev,
            [field]: value,
        }));

        if (errorsSweepRatio[field]) {
            setErrorsSweepRatio((prev) => ({
                ...prev,
                [field]: "",
            }));
        }
    };

    const validateSweepRatioForm = (): { isValid: boolean; errors: { [key: string]: string } } => {

        const newErrors: { [key: string]: string } = {};

        const details = termSheetViewData?.TermSheetDetailsData ?? [];

        if (details.length === 0) {
            addToast({ type: "error", title: "At least one Term Sheet Details is required." });
            return { isValid: false, errors: newErrors };
        }

        for (const item of details) {

            if (!item.SanctionDate?.trim()) {
                addToast({ type: "error", title: `${item.NameOfInstitutionBankNBFC ?? "Institution"}: Sanction Date is required.` });
                return { isValid: false, errors: newErrors };


            }

            if (!item.LoanStartDate?.trim()) {
                addToast({ type: "error", title: `${item.NameOfInstitutionBankNBFC ?? "Institution"}: Loan Start Date is required.` });
                return { isValid: false, errors: newErrors };


            }

            if (!item.LoanEndDate?.trim()) {
                addToast({ type: "error", title: `${item.NameOfInstitutionBankNBFC ?? "Institution"}: Loan End Date is required.` });
                return { isValid: false, errors: newErrors };


            }

            if (item.EMIAmount === undefined || item.EMIAmount === null || Number(item.EMIAmount) <= 0) {
                addToast({ type: "error", title: `${item.NameOfInstitutionBankNBFC ?? "Institution"}: EMI is required.` });
                return { isValid: false, errors: newErrors };


            }
        }

        if (Object.keys(newErrors).length > 0) {
            return { isValid: false, errors: newErrors };
        }


        if (!sweepRatioFormData.Date?.trim()) {
            newErrors.Date = "Date is required.";
        }

        const ownSweep = Number(sweepRatioFormData.OwnSweepRatioInPercentage);
        const lenderSweep = Number(sweepRatioFormData.LenderSweepRatioInPercentage);

        if (sweepRatioFormData.OwnSweepRatioInPercentage === undefined ||
            sweepRatioFormData.OwnSweepRatioInPercentage === null ||
            ownSweep <= 0 ||
            ownSweep > 100
        ) {
            newErrors.OwnSweepRatioInPercentage = "Own Sweep Ratio must be between 1 and 100%.";
        }

        if (sweepRatioFormData.LenderSweepRatioInPercentage === undefined ||
            sweepRatioFormData.LenderSweepRatioInPercentage === null ||
            lenderSweep <= 0 ||
            lenderSweep > 100) {
            newErrors.LenderSweepRatioInPercentage = "Lender Sweep Ratio must be between 1 and 100%.";
        }

        if (ownSweep > 0 &&
            ownSweep <= 100 &&
            lenderSweep > 0 &&
            lenderSweep <= 100 &&
            ownSweep + lenderSweep !== 100) {
            newErrors.OwnSweepRatioInPercentage = "Own Sweep Ratio and Lender Sweep Ratio together must total 100%.";
            newErrors.LenderSweepRatioInPercentage = "Own Sweep Ratio and Lender Sweep Ratio together must total 100%.";
        }

        return {
            isValid: Object.keys(newErrors).length === 0,
            errors: newErrors,
        };
    };

    const handleAddUpdateSweepRatio = async (
        e: React.FormEvent
    ) => {

        e.preventDefault();

        setErrorsSweepRatio({});

        const validation = validateSweepRatioForm();

        if (!validation.isValid) {
            setErrorsSweepRatio(validation.errors);

            return;
        }

        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,

            async () => {

                const payload: AddUpdateTermSheetSweepRatioDetailsRequest =
                {
                    TermSheetSweepRatioDetailsId: sweepRatioFormData.TermSheetSweepRatioDetailsId ?? 0,

                    Uniquekey: sweepRatioFormData.Uniquekey ?? "3fa85f64-5717-4562-b3fc-2c963f66afa6",

                    TermSheetId: Number(listState.TermSheetId),

                    TermSheetDetailsId: Number(listState.TermSheetDetailsId),

                    ProjectId: Number(listState.ProjectId),

                    OwnSweepRatioInPercentage: Number(sweepRatioFormData.OwnSweepRatioInPercentage ?? 0),

                    LenderSweepRatioInPercentage: Number(sweepRatioFormData.LenderSweepRatioInPercentage ?? 0),

                    Date: sweepRatioFormData.Date || null,

                    Remark: sweepRatioFormData.Remark || "",
                };

                const response = await termSheetService.apiCallAddUpdateTermSheetSweepRatioDetails(payload);

                if (E.isRight(response)) {

                    addToast({ type: "success", title: response.right.SuccessMessage?.[0] });

                    setIsSweepRatioModalOpen(false);

                    setSweepRatioFormData(initialDisbursedAmountFormData());

                    await fetchTermSheetDetails();

                } else {

                    addToast({ type: "error", title: response.left.message });

                }

                return response;
            },

            undefined,

            (error: any) => {
                addToast({ type: "error", title: error.message, });
            },

            undefined,

            sweepRatioFormData.TermSheetSweepRatioDetailsId ? "Updating Sweep Ratio Details" : "Adding Sweep Ratio Details"
        );
    };

    const handleConfirmDeleteSweepRatio = (item: TermSheetSweepRatioDetailsData) => {
        setSelectedSweepRatioItem(item);
        setIsDeleteSweepRatioDialogOpen(true);
    };

    const handleDeleteSweepRatio = async () => {

        if (!selectedSweepRatioItem)
            return;

        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,

            async () => {

                const params = {
                    TermSheetSweepRatioDetailsId: selectedSweepRatioItem.TermSheetSweepRatioDetailsId ?? 0,

                    Uniquekey: selectedSweepRatioItem.Uniquekey ?? "",

                    TermSheetId: Number(listState.TermSheetId),

                    TermSheetDetailsId: Number(listState.TermSheetDetailsId),

                    ProjectId: Number(listState.ProjectId),
                };

                const response = await termSheetService.apiCallDeleteTermSheetSweepRatioDetails(params);

                if (E.isRight(response)) {

                    addToast({ type: "success", title: response.right.SuccessMessage?.[0] });

                    setIsDeleteSweepRatioDialogOpen(false);

                    setSelectedSweepRatioItem(null);

                    await fetchTermSheetDetails();

                } else {

                    addToast({ type: "error", title: response.left.message });

                }

                return response;
            },

            undefined,

            (error: any) => {
                addToast({ type: "error", title: error.message, });
            },

            undefined,

            "Deleting Sweep Ratio Details"
        );
    };
    // ============================================================================================================================================================

    const handleOpenDirectSellingAgentModal = (item?: Partial<TermSheetDirectSellingAgentData>) => {

        setErrorsDirectSellingAgent({});
        if (item) {

            setDirectSellingAgentFormData({
                TermSheetDirectSellingAgentId: item.TermSheetDirectSellingAgentId ?? 0,

                Uniquekey: item.Uniquekey || "3fa85f64-5717-4562-b3fc-2c963f66afa6",

                TermSheetId: Number(listState.TermSheetId),

                TermSheetDetailsId: Number(listState.TermSheetDetailsId),

                ProjectId: Number(listState.ProjectId),

                Amount: item.Amount ?? 0,

                NameOfConsultant: item.NameOfConsultant ?? "",

                CommissionInPercentage: item.CommissionInPercentage ?? 0,

                PaymentDate: item.PaymentDate || "",

                Remark: item.Remark || "",
            });

        } else {

            setDirectSellingAgentFormData(initialDirectSellingAgentFormData());
        }

        setIsDirectSellingAgentModalOpen(true);
    };

    const handleDirectSellingAgentModal = () => {

        setIsDirectSellingAgentModalOpen(false);

        setDirectSellingAgentFormData(initialDirectSellingAgentFormData());

        setErrorsDirectSellingAgent({});
    };

    const handleDirectSellingAgentFieldChange = (field: keyof AddUpdateTermSheetDirectSellingAgentRequest, value: any) => {

        setDirectSellingAgentFormData((prev) => ({ ...prev, [field]: value, }));

        if (errorsDirectSellingAgent[field]) {

            setErrorsDirectSellingAgent((prev) => ({ ...prev, [field]: "" }));
        }
    };

    const validateDirectSellingAgentForm = (): { isValid: boolean; errors: { [key: string]: string }; } => {

        const newErrors: {
            [key: string]: string;
        } = {};

        const details = termSheetViewData?.TermSheetDetailsData ?? [];

        if (details.length === 0) {
            addToast({ type: "error", title: "At least one Term Sheet Details is required." });
            return { isValid: false, errors: newErrors };
        }

        for (const item of details) {

            if (!item.SanctionDate?.trim()) {
                addToast({ type: "error", title: `${item.NameOfInstitutionBankNBFC ?? "Institution"}: Sanction Date is required.` });
                return { isValid: false, errors: newErrors };

            }

            if (!item.LoanStartDate?.trim()) {
                addToast({ type: "error", title: `${item.NameOfInstitutionBankNBFC ?? "Institution"}: Loan Start Date is required.` });
                return { isValid: false, errors: newErrors };

            }

            if (!item.LoanEndDate?.trim()) {
                addToast({ type: "error", title: `${item.NameOfInstitutionBankNBFC ?? "Institution"}: Loan End Date is required.` });
                return { isValid: false, errors: newErrors };

            }

            if (item.EMIAmount === undefined || item.EMIAmount === null || Number(item.EMIAmount) <= 0) {
                addToast({ type: "error", title: `${item.NameOfInstitutionBankNBFC ?? "Institution"}: EMI is required.` });
                return { isValid: false, errors: newErrors };

            }
        }

        if (Object.keys(newErrors).length > 0) {
            return { isValid: false, errors: newErrors };
        }

        if (!directSellingAgentFormData.NameOfConsultant?.trim()) {
            newErrors.NameOfConsultant = "Name Of Consultant is required.";
        }

        if (directSellingAgentFormData.CommissionInPercentage === undefined || directSellingAgentFormData.CommissionInPercentage === null || Number(directSellingAgentFormData.CommissionInPercentage) <= 0) {
            newErrors.CommissionInPercentage = "Commission (%) is required.";
        }

        if (directSellingAgentFormData.Amount === undefined || directSellingAgentFormData.Amount === null || Number(directSellingAgentFormData.Amount) <= 0) {
            newErrors.Amount = "Amount is required.";
        }

        if (!directSellingAgentFormData.PaymentDate?.trim()) {
            newErrors.PaymentDate = "Payment Date is required.";
        }

        return {
            isValid: Object.keys(newErrors).length === 0,
            errors: newErrors,
        };
    };

    const handleAddUpdateDirectSellingAgent = async (e: React.FormEvent) => {

        e.preventDefault();

        setErrorsDirectSellingAgent({});

        const validation = validateDirectSellingAgentForm();

        if (!validation.isValid) {

            setErrorsDirectSellingAgent(validation.errors);

            return;
        }

        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,

            async () => {

                const payload: AddUpdateTermSheetDirectSellingAgentRequest =
                {
                    TermSheetDirectSellingAgentId: directSellingAgentFormData.TermSheetDirectSellingAgentId ?? 0,

                    Uniquekey: directSellingAgentFormData.Uniquekey ?? "3fa85f64-5717-4562-b3fc-2c963f66afa6",

                    TermSheetId: Number(listState.TermSheetId),

                    TermSheetDetailsId: Number(listState.TermSheetDetailsId),

                    ProjectId: Number(listState.ProjectId),

                    Amount: Number(directSellingAgentFormData.Amount ?? 0),

                    NameOfConsultant: directSellingAgentFormData.NameOfConsultant ?? "",

                    CommissionInPercentage: Number(directSellingAgentFormData.CommissionInPercentage ?? 0),

                    PaymentDate: directSellingAgentFormData.PaymentDate || null,

                    Remark: directSellingAgentFormData.Remark || "",
                };

                const response = await termSheetService.apiCallAddUpdateTermSheetDirectSellingAgent(payload);

                if (E.isRight(response)) {

                    addToast({ type: "success", title: response.right.SuccessMessage?.[0], });

                    setIsDirectSellingAgentModalOpen(false);

                    setDirectSellingAgentFormData(initialDirectSellingAgentFormData());

                    await fetchTermSheetDetails();

                } else {

                    addToast({ type: "error", title: response.left.message, });
                }

                return response;
            },

            undefined,

            (error: any) => {
                addToast({ type: "error", title: error.message });
            },

            undefined,

            directSellingAgentFormData.TermSheetDirectSellingAgentId ? "Updating Direct Selling Agent" : "Adding Direct Selling Agent"
        );
    };

    const handleConfirmDeleteDirectSellingAgent = (item: TermSheetDirectSellingAgentData) => {

        setSelectedDirectSellingAgentItem(item);

        setIsDeleteDirectSellingAgentDialogOpen(true);
    };

    const handleDeleteDirectSellingAgent = async () => {

        if (!selectedDirectSellingAgentItem) return;

        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,

            async () => {

                const params = {

                    TermSheetDirectSellingAgentId: selectedDirectSellingAgentItem.TermSheetDirectSellingAgentId ?? 0,

                    TermSheetId: Number(listState.TermSheetId),

                    TermSheetDetailsId: Number(listState.TermSheetDetailsId),

                    ProjectId: Number(listState.ProjectId),
                };

                const response = await termSheetService.apiCallDeleteTermSheetDirectSellingAgent(params);

                if (E.isRight(response)) {

                    addToast({ type: "success", title: response.right.SuccessMessage?.[0] });

                    setIsDeleteDirectSellingAgentDialogOpen(false);

                    setSelectedDirectSellingAgentItem(null);

                    await fetchTermSheetDetails();

                } else {

                    addToast({ type: "error", title: response.left.message, });
                }

                return response;
            },

            undefined,

            (error: any) => {
                addToast({ type: "error", title: error.message, });
            },

            undefined,

            "Deleting Direct Selling Agent Details"
        );
    };
    // ============================================================================================================================================================

    const handleOpenRepayLedgerModal = (item?: Partial<TermSheetRepayLedgerData>) => {
        setErrorsRepayLedger({});

        if (item) {
            setRepayLedgerFormData({
                TermSheetRepayLedgerId: item.TermSheetRepayLedgerId ?? 0,
                Uniquekey: item.Uniquekey || "3fa85f64-5717-4562-b3fc-2c963f66afa6",
                TermSheetId: Number(listState.TermSheetId),
                TermSheetDetailsId: Number(listState.TermSheetDetailsId),
                ProjectId: Number(listState.ProjectId),
                Amount: item.Amount ?? 0,
                PaymentDate: item.PaymentDate || "",
                Remark: item.Remark || "",
            });
        } else {
            setRepayLedgerFormData(initialRepayLedgerFormData());
        }

        setIsRepayLedgerModalOpen(true);
    };

    const handleRepayLedgerModal = () => {
        setIsRepayLedgerModalOpen(false);
        setRepayLedgerFormData(initialRepayLedgerFormData());
        setErrorsRepayLedger({});
    };

    const handleRepayLedgerFieldChange = (field: keyof AddUpdateTermSheetRepayLedgerRequest, value: any) => {
        setRepayLedgerFormData((prev) => ({ ...prev, [field]: value }));

        if (errorsRepayLedger[field]) {
            setErrorsRepayLedger((prev) => ({ ...prev, [field]: "" }));
        }
    };

    const validateRepayLedgerForm = (): { isValid: boolean; errors: { [key: string]: string } } => {

        const newErrors: { [key: string]: string } = {};

        const details = termSheetViewData?.TermSheetDetailsData ?? [];

        if (details.length === 0) {
            addToast({ type: "error", title: "At least one Term Sheet Details is required." });
            return { isValid: false, errors: newErrors };
        }

        for (const item of details) {

            if (!item.SanctionDate?.trim()) {
                addToast({ type: "error", title: `${item.NameOfInstitutionBankNBFC ?? "Institution"}: Sanction Date is required.` });
                return { isValid: false, errors: newErrors };

            }

            if (!item.LoanStartDate?.trim()) {
                addToast({ type: "error", title: `${item.NameOfInstitutionBankNBFC ?? "Institution"}: Loan Start Date is required.` });
                return { isValid: false, errors: newErrors };

            }

            if (!item.LoanEndDate?.trim()) {
                addToast({ type: "error", title: `${item.NameOfInstitutionBankNBFC ?? "Institution"}: Loan End Date is required.` });
                return { isValid: false, errors: newErrors };

            }

            if (item.EMIAmount === undefined || item.EMIAmount === null || Number(item.EMIAmount) <= 0) {
                addToast({ type: "error", title: `${item.NameOfInstitutionBankNBFC ?? "Institution"}: EMI is required.` });
                return { isValid: false, errors: newErrors };

            }
        }

        if (Object.keys(newErrors).length > 0) {
            return { isValid: false, errors: newErrors };
        }

        if (repayLedgerFormData.Amount === undefined || repayLedgerFormData.Amount === null || Number(repayLedgerFormData.Amount) <= 0) {
            newErrors.Amount = "Amount is required.";
        }

        if (!repayLedgerFormData.PaymentDate?.trim()) {
            newErrors.PaymentDate = "Payment Date is required.";
        }

        const facilityAmount = Number(termSheetViewData?.TermSheetDetailsData?.find(x => Number(x.TermSheetDetailsId) === Number(listState.TermSheetDetailsId))?.FacilityAmount ?? 0);

        const termSheetDetails = termSheetViewData?.TermSheetDetailsData?.find(item => Number(item.TermSheetDetailsId) === Number(listState.TermSheetDetailsId));

        const existingDisbursedAmount = termSheetDetails?.TermSheetDisbursedAmountDetailsData?.reduce((total, item) => {

            return total + Number(item.DisbursedAmount ?? 0);
        }, 0) ?? 0;

        const existingRepayAmount = termSheetDetails?.TermSheetRepayLedgerData?.reduce((total, item) => {

            if (Number(item.TermSheetRepayLedgerId) === Number(repayLedgerFormData.TermSheetRepayLedgerId)) {
                return total;
            }

            return total + Number(item.Amount ?? 0);
        }, 0) ?? 0;

        const newTotalRepay = existingRepayAmount + Number(repayLedgerFormData.Amount ?? 0);

        if (Number(newTotalRepay) > Number(existingDisbursedAmount)) {
            const remainingAmount = Number(existingDisbursedAmount) - Number(existingRepayAmount);
            newErrors.Amount = `Total Repayment Amount cannot be greater than Disbursed Amount (${formatCurrency(remainingAmount)}).`;
        }
        else if (Number(newTotalRepay) > Number(facilityAmount)) {
            newErrors.Amount = `Total Repayment Amount cannot be greater than Facility Amount (${formatCurrency(facilityAmount)}).`;
        }

        return {
            isValid: Object.keys(newErrors).length === 0,
            errors: newErrors,
        };
    };

    const handleAddUpdateRepayLedger = async (e: React.FormEvent) => {
        e.preventDefault();

        setErrorsRepayLedger({});

        const validation = validateRepayLedgerForm();

        if (!validation.isValid) {
            setErrorsRepayLedger(validation.errors);
            return;
        }

        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {

                const payload: AddUpdateTermSheetRepayLedgerRequest = {

                    TermSheetRepayLedgerId: repayLedgerFormData.TermSheetRepayLedgerId ?? 0,

                    Uniquekey: repayLedgerFormData.Uniquekey ?? "3fa85f64-5717-4562-b3fc-2c963f66afa6",

                    TermSheetId: Number(listState.TermSheetId),

                    TermSheetDetailsId: Number(listState.TermSheetDetailsId),

                    ProjectId: Number(listState.ProjectId),

                    Amount: Number(repayLedgerFormData.Amount ?? 0),

                    PaymentDate: repayLedgerFormData.PaymentDate || null,

                    Remark: repayLedgerFormData.Remark || "",
                };

                const response = await termSheetService.apiCallAddUpdateTermSheetRepayLedger(payload);

                if (E.isRight(response)) {

                    addToast({ type: "success", title: response.right.SuccessMessage?.[0] });

                    setIsRepayLedgerModalOpen(false);

                    setRepayLedgerFormData(initialRepayLedgerFormData());

                    await fetchTermSheetDetails();

                } else {

                    addToast({ type: "error", title: response.left.message });
                }

                return response;
            },
            undefined,
            (error: any) => {
                addToast({ type: "error", title: error.message, });
            },
            undefined,
            repayLedgerFormData.TermSheetRepayLedgerId ? "Updating Repayment" : "Adding Repayment"
        );
    };

    const handleConfirmDeleteRepayLedger = (
        item: TermSheetRepayLedgerData
    ) => {
        setSelectedRepayLedgerItem(item);
        setIsDeleteRepayLedgerDialogOpen(true);
    };

    const handleDeleteRepayLedger = async () => {

        if (!selectedRepayLedgerItem) return;

        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {

                const params: DeleteTermSheetRepayLedgerRequest = {
                    TermSheetRepayLedgerId: selectedRepayLedgerItem.TermSheetRepayLedgerId ?? 0,

                    TermSheetId: Number(listState.TermSheetId),

                    TermSheetDetailsId: Number(listState.TermSheetDetailsId),

                    ProjectId: Number(listState.ProjectId),
                };

                const response = await termSheetService.apiCallDeleteTermSheetRepayLedger(params);

                if (E.isRight(response)) {

                    addToast({ type: "success", title: response.right.SuccessMessage?.[0] });

                    setIsDeleteRepayLedgerDialogOpen(false);
                    setSelectedRepayLedgerItem(null);

                    await fetchTermSheetDetails();

                } else {

                    addToast({ type: "error", title: response.left.message });
                }

                return response;
            },
            undefined,
            (error: any) =>
                addToast({ type: "error", title: error.message, }),
            undefined,
            "Deleting Repay Ledger"
        );
    };

    // ============================================================================================================================================================

    const handleOpenDebtServiceReserveAccountModal = (item?: Partial<TermSheetDebtServiceReserveAccountData>) => {
        setErrorsDebtServiceReserveAccount({});

        if (item) {
            setDebtServiceReserveAccountFormData({
                TermSheetDebtServiceReserveAccountId: item.TermSheetDebtServiceReserveAccountId ?? 0,

                Uniquekey: item.Uniquekey || "3fa85f64-5717-4562-b3fc-2c963f66afa6",

                TermSheetId: Number(listState.TermSheetId),

                TermSheetDetailsId: Number(item.TermSheetDetailsId ?? listState.TermSheetDetailsId),

                ProjectId: Number(listState.ProjectId),

                Term: item.Term ?? "",

                Unit: item.Unit ?? 0,

                PerUnitRate: item.PerUnitRate ?? 0,

                Amount: item.Amount ?? 0,

                Date: item.Date || "",

                RateOfInterestInPercentage: item.RateOfInterestInPercentage ?? 0,

                RedemptionValue: item.RedemptionValue ?? 0,

                MaturityPeriod: item.MaturityPeriod ?? 0,

                WithdrawAmount: item.WithdrawAmount ?? 0,

                WithdrawDate: item.WithdrawDate || "",

                Remark: item.Remark ?? ""
            });
        } else {
            setDebtServiceReserveAccountFormData(initialDebtServiceReserveAccountFormData());
        }

        setIsDebtServiceReserveAccountModalOpen(true);
    };

    const handleDebtServiceReserveAccountModal = () => {
        setIsDebtServiceReserveAccountModalOpen(false);

        setDebtServiceReserveAccountFormData(initialDebtServiceReserveAccountFormData());

        setErrorsDebtServiceReserveAccount({});
    };

    const handleDebtServiceReserveAccountFieldChange = (field: keyof AddUpdateTermSheetDebtServiceReserveAccountRequest, value: any) => {
        setDebtServiceReserveAccountFormData((prev) => ({ ...prev, [field]: value }));

        if (errorsDebtServiceReserveAccount[field]) {
            setErrorsDebtServiceReserveAccount((prev) => ({ ...prev, [field]: "" }));
        }
    };

    const validateDebtServiceReserveAccountForm = (): { isValid: boolean; errors: { [key: string]: string }; } => {
        const newErrors: { [key: string]: string } = {};

        const details = termSheetViewData?.TermSheetDetailsData ?? [];

        if (details.length === 0) {
            addToast({ type: "error", title: "At least one Term Sheet Details is required." });
            return { isValid: false, errors: newErrors };
        }

        for (const item of details) {

            if (!item.SanctionDate?.trim()) {
                addToast({ type: "error", title: `${item.NameOfInstitutionBankNBFC ?? "Institution"}: Sanction Date is required.` });
                return { isValid: false, errors: newErrors };

            }

            if (!item.LoanStartDate?.trim()) {
                addToast({ type: "error", title: `${item.NameOfInstitutionBankNBFC ?? "Institution"}: Loan Start Date is required.` });
                return { isValid: false, errors: newErrors };

            }

            if (!item.LoanEndDate?.trim()) {
                addToast({ type: "error", title: `${item.NameOfInstitutionBankNBFC ?? "Institution"}: Loan End Date is required.` });
                return { isValid: false, errors: newErrors };

            }

            if (item.EMIAmount === undefined || item.EMIAmount === null || Number(item.EMIAmount) <= 0) {
                addToast({ type: "error", title: `${item.NameOfInstitutionBankNBFC ?? "Institution"}: EMI is required.` });
                return { isValid: false, errors: newErrors };

            }
        }

        if (Object.keys(newErrors).length > 0) {
            return { isValid: false, errors: newErrors };
        }

        if (!debtServiceReserveAccountFormData.Term?.trim()) {
            newErrors.Term = "Term is required.";
        }

        if (debtServiceReserveAccountFormData.Term !== "Mutual Fund (MF)" && Number(debtServiceReserveAccountFormData.Amount ?? 0) <= 0) {
            newErrors.Amount = "Amount is required.";
        }

        if (!debtServiceReserveAccountFormData.Date?.trim()) {
            newErrors.Date = "Date is required.";
        }

        // Mutual Fund (MF) Validation
        if (debtServiceReserveAccountFormData.Term === "Mutual Fund (MF)") {

            if (debtServiceReserveAccountFormData.Unit === undefined || debtServiceReserveAccountFormData.Unit === null || Number(debtServiceReserveAccountFormData.Unit) <= 0) {
                newErrors.Unit = "Unit is required.";
            }

            if (debtServiceReserveAccountFormData.PerUnitRate === undefined || debtServiceReserveAccountFormData.PerUnitRate === null || Number(debtServiceReserveAccountFormData.PerUnitRate) <= 0) {
                newErrors.PerUnitRate = "Per Unit Rate is required.";
            }
        }

        // Fixed Deposit (FD) Validation
        if (debtServiceReserveAccountFormData.Term === "Fixed Deposit (FD)") {

            if (debtServiceReserveAccountFormData.RateOfInterestInPercentage === undefined || debtServiceReserveAccountFormData.RateOfInterestInPercentage === null || Number(debtServiceReserveAccountFormData.RateOfInterestInPercentage) <= 0) {
                newErrors.RateOfInterestInPercentage = "Rate Of Interest is required.";
            }

            if (
                debtServiceReserveAccountFormData.RedemptionValue === undefined ||
                debtServiceReserveAccountFormData.RedemptionValue === null ||
                Number(debtServiceReserveAccountFormData.RedemptionValue) <= 0
            ) {
                newErrors.RedemptionValue =
                    "Redemption Value is required.";
            }

            if (
                debtServiceReserveAccountFormData.MaturityPeriod === undefined ||
                debtServiceReserveAccountFormData.MaturityPeriod === null ||
                Number(debtServiceReserveAccountFormData.MaturityPeriod) <= 0
            ) {
                newErrors.MaturityPeriod =
                    "Maturity Period is required.";
            }
        }

        const date = convert_date_yy_mm_dd_To_dd_mm_yyyy(debtServiceReserveAccountFormData.Date ? new Date(debtServiceReserveAccountFormData.Date) : undefined);
        const withdrawDate = convert_date_yy_mm_dd_To_dd_mm_yyyy(debtServiceReserveAccountFormData.WithdrawDate ? new Date(debtServiceReserveAccountFormData.WithdrawDate) : undefined);

        if (debtServiceReserveAccountFormData?.Date && debtServiceReserveAccountFormData.WithdrawDate && !isToDateGreaterOrEqualFromDate(date, withdrawDate)) {
            newErrors.WithdrawDate = "Withdraw Date must be greater than or equal to Date";
        }



        return {
            isValid: Object.keys(newErrors).length === 0,
            errors: newErrors
        };
    };

    const handleAddUpdateDebtServiceReserveAccount = async (e: React.FormEvent) => {
        e.preventDefault();

        setErrorsDebtServiceReserveAccount({});

        const validation = validateDebtServiceReserveAccountForm();

        if (!validation.isValid) {
            setErrorsDebtServiceReserveAccount(validation.errors);
            return;
        }

        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {

                const payload: AddUpdateTermSheetDebtServiceReserveAccountRequest = {

                    TermSheetDebtServiceReserveAccountId: debtServiceReserveAccountFormData.TermSheetDebtServiceReserveAccountId ?? 0,

                    Uniquekey: debtServiceReserveAccountFormData.Uniquekey ?? "3fa85f64-5717-4562-b3fc-2c963f66afa6",

                    TermSheetId: Number(listState.TermSheetId),

                    TermSheetDetailsId: Number(listState.TermSheetDetailsId),

                    ProjectId: Number(listState.ProjectId),

                    Term: debtServiceReserveAccountFormData.Term ?? "",

                    Unit: Number(debtServiceReserveAccountFormData.Unit ?? 0),

                    PerUnitRate: Number(debtServiceReserveAccountFormData.PerUnitRate ?? 0),

                    Amount: debtServiceReserveAccountFormData.Term === "Mutual Fund (MF)" && !isClosed
                        ? (
                            (Number(debtServiceReserveAccountFormData.Unit) || 0) *
                            (Number(debtServiceReserveAccountFormData.PerUnitRate) || 0)
                        )
                        : Number(debtServiceReserveAccountFormData.Amount ?? 0),


                    Date: debtServiceReserveAccountFormData.Date || null,

                    RateOfInterestInPercentage: Number(debtServiceReserveAccountFormData.RateOfInterestInPercentage ?? 0),

                    RedemptionValue: Number(debtServiceReserveAccountFormData.RedemptionValue ?? 0),

                    MaturityPeriod: Number(debtServiceReserveAccountFormData.MaturityPeriod ?? 0),

                    WithdrawAmount: Number(debtServiceReserveAccountFormData.WithdrawAmount ?? 0),

                    WithdrawDate: debtServiceReserveAccountFormData.WithdrawDate || null,

                    Remark: debtServiceReserveAccountFormData.Remark ?? ""
                };

                const response = await termSheetService.apiCallAddUpdateTermSheetDebtServiceReserveAccount(payload);

                if (E.isRight(response)) {

                    addToast({ type: "success", title: response.right.SuccessMessage?.[0] });

                    setIsDebtServiceReserveAccountModalOpen(false);

                    setDebtServiceReserveAccountFormData(initialDebtServiceReserveAccountFormData());

                    await fetchTermSheetDetails();

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

            debtServiceReserveAccountFormData.TermSheetDebtServiceReserveAccountId ? "Updating Debt Service Reserve Account" : "Adding Debt Service Reserve Account"
        );
    };

    const handleConfirmDeleteDebtServiceReserveAccount = (item: TermSheetDebtServiceReserveAccountData) => {
        setSelectedDebtServiceReserveAccountItem(item);

        setIsDeleteDebtServiceReserveAccountDialogOpen(true);
    };

    const handleDeleteDebtServiceReserveAccount = async () => {

        if (!selectedDebtServiceReserveAccountItem)
            return;

        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {

                const params: DeleteTermSheetDebtServiceReserveAccountRequest = {

                    TermSheetDebtServiceReserveAccountId: selectedDebtServiceReserveAccountItem.TermSheetDebtServiceReserveAccountId ?? 0,

                    TermSheetId: Number(listState.TermSheetId),

                    TermSheetDetailsId: Number(listState.TermSheetDetailsId),

                    ProjectId: Number(listState.ProjectId)
                };

                const response = await termSheetService.apiCallDeleteTermSheetDebtServiceReserveAccount(params);

                if (E.isRight(response)) {

                    addToast({ type: "success", title: response.right.SuccessMessage?.[0] });

                    setIsDeleteDebtServiceReserveAccountDialogOpen(false);

                    setSelectedDebtServiceReserveAccountItem(null);

                    await fetchTermSheetDetails();

                } else {

                    addToast({ type: "error", title: response.left.message });
                }

                return response;
            },

            undefined,

            (error: any) =>
                addToast({ type: "error", title: error.message }),

            undefined,

            "Deleting Debt Service Reserve Account"
        );
    };

    // ============================================================================================================================================================
    const loadProjectMasterWithCompany = async () => {
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {

                const response = await projectMasterService.apiCallPullProjectMasterWithCompany(Number(listState.ProjectId), false);

                if (E.isRight(response)) {

                    setCompanyMasterList(response.right.Data);

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
    };
    // ============================================================================================================================================================
    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-300 p-6">

            <Loader loading={isLoading} title={loadingMessage}> {" "}<div></div>{" "}</Loader>

            <HeaderActionBar
                titleText={`${listState?.ProjectName ?? ""} :`}
                subTitleText={listState?.NameOfInstitutionBankNBFC ?? ""}
                subSubSubTitleText={listState?.ApprovalStatus ?? ""}
                cancelText="Cancel"
                EditText={activeTab === "Overview" && isClosedFlag ? "Closed" : "Edit"}

                onCancel={() => handleBackToListTermSheet()}

                canAction={
                    canAction &&
                    (
                        (
                            activeTab === "Overview" && listState?.ApprovalStatus?.toUpperCase() !== "CLOSED"
                        )

                        ||

                        (
                            activeTab === "Document" && ["APPROVED", "CLOSED"].includes(listState?.ApprovalStatus?.toUpperCase() ?? "")
                        )
                    )
                }

                onEdit={() => {

                    if (activeTab === "Overview" && termSheetViewData) {

                        if (isClosedFlag) {
                            handleFinalizeConfirmation();
                        } else {
                            handleEditTermSheet(termSheetViewData);
                        }

                    }
                    else if (activeTab === "Document" && ["APPROVED", "CLOSED"].includes(listState?.ApprovalStatus?.toUpperCase() ?? "") && termSheetViewData) {

                        handleEditTermSheetDocument({ TermSheetId: termSheetViewData.TermSheetId } as TermSheetDocumentData);

                    }
                }}

                isLoading={false}
            />

            <div className="pt-5">

                <Tabs
                    tabs={termSheetTabList}
                    defaultActive={activeTab}
                    islarge={false}
                    isChips
                    onTabChange={(t) => {
                        setActiveTab(t.id);

                        if (t.id === "Overview") {
                            fetchTermSheetDetails();
                        } else if (t.id === "Document") {
                            fetchTermSheetDocumentList();
                        }
                    }}
                />

            </div>

            {activeTab === "Overview" && (
                <>
                    <div className="space-y-4 pt-5">
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
                            <section className="md:col-span-4 bg-white rounded-xl shadow-sm p-6 border-[0.1px] border-[#3333334f]">
                                <NoDataView message="No Company's Found" />
                            </section>
                        )}

                    </div>


                    <div className="space-y-3 pt-5">

                        {termSheetViewData?.TermSheetDetailsData?.length ? (

                            termSheetViewData.TermSheetDetailsData.map((b, i) => (

                                <Fragment key={i}>

                                    <section className="relative bg-white rounded-2xl border border-gray-200 mb-5 overflow-hidden">

                                        <div className="flex items-center w-full bg-[#E7F2FF]  border-b border-gray-200 px-3 py-2">

                                            <div className="flex items-center gap-4 min-w-0">

                                                <h4 className="text-md font-semibold text-[#1D4ED8] whitespace-nowrap">
                                                    {b.NameOfInstitutionBankNBFC}
                                                </h4>

                                            </div>

                                            <div className="ml-auto flex items-center">
                                                <ApprovalActions
                                                    approvalStatus={b.ApprovalStatus || "-"}
                                                    showApproval={b.IsApproval}
                                                    isIcons={true}
                                                    onHistory={() => handleApprovalLog(b)}
                                                    onApprove={() => handleApproveRejectDocument(b, "approve")}
                                                    onReject={() => handleApproveRejectDocument(b, "reject")}
                                                />
                                            </div>

                                        </div>

                                        <div className="p-5">

                                            <div className="space-y-3">
                                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">

                                                    <div className="bg-white border border-gray-100 rounded-lg px-3 py-3">
                                                        <div className="text-md text-gray-500 mb-2">
                                                            Facility (₹)
                                                        </div>
                                                        <div className="text-sm font-semibold text-gray-900">
                                                            {formatToKLCr(b.FacilityAmount ?? "-")}
                                                        </div>
                                                    </div>

                                                    <div className="bg-white border border-gray-100 rounded-lg px-3 py-3">
                                                        <div className="text-md text-gray-500 mb-2">
                                                            Disbursed (₹)
                                                        </div>
                                                        <div className="text-sm font-semibold text-gray-900">
                                                            {formatToKLCr(b.TotalDisbursedAmount ?? 0)}
                                                        </div>
                                                    </div>

                                                    <div className="bg-white border border-gray-100 rounded-lg px-3 py-3">
                                                        <div className="text-md text-gray-500 mb-2">
                                                            Repaid (₹)
                                                        </div>
                                                        <div className="text-sm font-semibold text-gray-900">
                                                            {formatToKLCr(b.TotalRepayLedgerAmount ?? 0)}
                                                        </div>
                                                    </div>

                                                    <div className="bg-white border border-gray-100 rounded-lg px-3 py-3">
                                                        <div className="text-md text-gray-500 mb-2">
                                                            Outstanding (₹)
                                                        </div>
                                                        <div className="text-sm font-semibold text-gray-900">
                                                            {formatToKLCr(b.FacilityAmount - b.TotalDisbursedAmount)}
                                                        </div>
                                                    </div>

                                                    <div className="bg-white border border-gray-100 rounded-lg px-3 py-3">
                                                        <div className="text-md text-gray-500 mb-2">
                                                            Rate Of Interest
                                                        </div>
                                                        <div className="text-sm font-semibold text-gray-900">
                                                            {`${b.RateOfInterestInPercentage ?? 0} %`}
                                                        </div>
                                                    </div>

                                                    <div className="bg-white border border-gray-100 rounded-lg px-3 py-3">
                                                        <div className="text-md text-gray-500 mb-2">
                                                            Loan Tenure
                                                        </div>
                                                        <div className="text-sm font-semibold text-gray-900">
                                                            {`${b.LoanTenureInMonth ?? 0} Months`}
                                                        </div>
                                                    </div>

                                                </div>
                                            </div>

                                            <div className="bg-white">

                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 border-b border-[#135bec2e] pt-5 pb-4">
                                                    <div>
                                                        <p className="text-sm font-medium text-[#1D1D1D80] pb-1">
                                                            Loan Taken By
                                                        </p>
                                                        {b.LoanTakenBy ? (
                                                            <span className="inline-block px-2 py-1 rounded text-sm font-medium bg-[#EFF6FF] text-[#1D4ED8]">
                                                                {b.LoanTakenBy ?? "-"}
                                                            </span>
                                                        ) : '-'}
                                                    </div>
                                                    <FieldItem label="Type" value={b.Type ?? "-"} />

                                                    <FieldItem label="Term Sheet Date" value={b.TermSheetDate ? formatDate_dd_MonthName_yy(b.TermSheetDate) : ""} />

                                                    <FieldItem label="Term Sheet Document" value=" " urls={b.TermSheetURL} />
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 border-b border-[#135bec2e] pb-4 pt-4">
                                                    <FieldItem label="Processing Fees (%)" value={`${b.ProcessingFeesInPercentage ?? 0} %`} />
                                                    <FieldItem label="Legal & Documentation (₹)" value={formatCurrency(b.LegalAndDocumentationFees ?? 0)} />
                                                    <FieldItem label="Monotorium Period (Months)" value={b.MonotoriumPeriodInMonth ?? 0} />
                                                    <FieldItem label="Minimum Selling Price (MSP) (₹)" value={formatCurrency(b.MinimumSellingPrice ?? 0)} />

                                                </div>
                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 border-b border-[#135bec2e] pb-4 pt-4">

                                                    <FieldItem label="Sanction Date" value={b.SanctionDate ? formatDate_dd_MonthName_yy(b.SanctionDate) : ""} />
                                                    <FieldItem label="Loan Start Date" value={b.LoanStartDate ? formatDate_dd_MonthName_yy(b.LoanStartDate) : ""} />
                                                    <FieldItem label="Loan End Date" value={b.LoanEndDate ? formatDate_dd_MonthName_yy(b.LoanEndDate) : ""} />
                                                    <FieldItem label="EMI" value={formatCurrency(b.EMIAmount ?? "-")} />
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 border-b border-[#135bec2e] pb-4 pt-4">

                                                    <FieldItem label="Other Important Terms If Any" value={b.OtherImportantTermsIfAny ?? "-"} />
                                                    <FieldItem label="Remark" value={b.Remark ?? "-"} />

                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-1 pt-4">
                                                    <FieldItem label="Created By" value={b?.CreatedBy} />
                                                    <FieldItem label="Created Date" value={b?.CreatedDate ? formatDate_dd_MonthName_yy_hh_mm(b?.CreatedDate) : ""} />
                                                    {b?.ModifiedBy && (
                                                        <>
                                                            <FieldItem label="Modified By" value={b?.ModifiedBy} />
                                                            <FieldItem label="Modified Date" value={b?.ModifiedDate ? formatDate_dd_MonthName_yy_hh_mm(b?.ModifiedDate) : ""} />
                                                        </>
                                                    )}
                                                </div>




                                            </div>
                                        </div>
                                    </section>

                                    {
                                        isClosed && (
                                            <section className="border-[0.1px] rounded-xl border-[#33333321] rounded-sm overflow-hidden">

                                                <div className="bg-[#E1E2E4] px-3 py-2 border-b border-[#D0D7DE]">
                                                    <h4 className="text-sm font-semibold text-[#333333]">
                                                        Closing Details
                                                    </h4>
                                                </div>
                                                <div className="p-4 bg-white">


                                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                                                        <FieldItem label="Closing Remark" value={(termSheetViewData.ClosingRemark)} />
                                                        <FieldItem
                                                            label="Closing Date"
                                                            value={
                                                                termSheetViewData.ClosingDate
                                                                    ? formatDate_dd_MonthName_yy_hh_mm(termSheetViewData.ClosingDate)
                                                                    : '-'
                                                            }
                                                        />
                                                    </div>


                                                </div>
                                            </section>
                                        )}
                                </Fragment>
                            ))
                        ) : (
                            <section className="md:col-span-4 bg-white rounded-xl shadow-sm p-6 border-[0.1px] border-[#3333334f]">
                                <NoDataView message="No Direct Selling Agent (DSA) Details Found" />
                            </section>
                        )}
                    </div>

                    {!["APPROVED", "CLOSED"].includes(listState?.ApprovalStatus?.toUpperCase() ?? "") && isAnyInstitutionApproved && canAction && (

                        <div className="flex items-center justify-between gap-4 mt-4">

                            <p className="text-sm text-orange-700 bg-orange-50 border border-orange-200 rounded-md px-4 py-3 flex-1 mb-0">
                                <strong>Final Approval Warning:</strong> If any one{" "}
                                <strong>Name of Institution / Bank / NBFC</strong> is approved,
                                clicking <strong>Final Approval</strong> will remove all other
                                pending entries. Only the approved Institution / Bank / NBFC will
                                be retained as a separate entry.
                            </p>

                            <Button
                                color="blue"
                                size="md"
                                onClick={handleFinalizeConfirmation}
                                disabled={isLoading}
                            >
                                Final Approval
                            </Button>

                        </div>
                    )}
                </>
            )}

            {activeTab === "Disbursement" && (
                <div className="space-y-3 pt-5">

                    {termSheetViewData?.TermSheetDetailsData?.length ? (

                        termSheetViewData.TermSheetDetailsData.map((b, i) => (

                            <Fragment key={i}>
                                {["APPROVED", "CLOSED"].includes(listState?.ApprovalStatus?.toUpperCase() ?? "") && (
                                    <>
                                        <section className="bg-white rounded-2xl border border-gray-200 shadow-sm mb-5 overflow-hidden">

                                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 w-full bg-[#F8FAFC] border-b border-gray-200 px-5 py-4">

                                                <div>
                                                    <h4 className="text-lg font-semibold text-gray-900">
                                                        Disbursed Amount Details
                                                    </h4>

                                                    <div className="mt-1 text-sm font-small text-gray-600">
                                                        Total Disbursed Amount:
                                                        <span className="ml-2 text-base font-bold text-gray-900">
                                                            {formatCurrency(b.TermSheetDisbursedAmountDetailsData?.reduce((total, item) => total + Number(item.DisbursedAmount ?? 0), 0) ?? 0)}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="w-full sm:w-auto">
                                                    <Button
                                                        color="blue"
                                                        size="sm"
                                                        onClick={() => {
                                                            if (!canAction || isClosed) return;
                                                            handleOpenDisbursedAmountModal();
                                                        }}
                                                        disabled={isLoading || !canAction || isClosed || Number(b.FacilityAmount ?? 0) <= Number(b.TotalDisbursedAmount ?? 0)} >
                                                        Add
                                                    </Button>
                                                </div>

                                            </div>

                                            <div className="p-5">

                                                {b.TermSheetDisbursedAmountDetailsData?.length > 0 ? (
                                                    <div className="space-y-3">

                                                        {b.TermSheetDisbursedAmountDetailsData.map((d, index) => (
                                                            <div key={d.TermSheetDisbursedAmountDetailsId}
                                                                className={`relative grid grid-cols-1 md:grid-cols-5 gap-4 p-3 pr-24 ${index !== b.TermSheetDisbursedAmountDetailsData.length - 1
                                                                    ? "border-b border-gray-200"
                                                                    : ""
                                                                    }`} >


                                                                <FieldItem label="Disbursed Amount" value={formatCurrency(d.DisbursedAmount ?? 0)} />


                                                                <FieldItem label="Disbursed Date" value={d.DisbursedDate ? formatDate_dd_MonthName_yy(d.DisbursedDate) : "-"} />

                                                                {(d.Remark?.trim()?.length ?? 0) >= 20 ? (
                                                                    <FieldInfoTooltip label="Remark" value={d.Remark} isRow={false} />
                                                                ) : (
                                                                    <FieldItem label="Remark" value={d.Remark ?? "-"} />
                                                                )}

                                                                <FieldItem label="Last Modified By" value={d!.ModifiedBy === "" ? d!.CreatedBy : d!.ModifiedBy} />

                                                                <FieldItem
                                                                    label="Last Modified Date"
                                                                    value={d!.ModifiedBy === "" ?
                                                                        d!.CreatedDate ? formatDate_dd_MonthName_yy_hh_mm(d!.CreatedDate) : "-"
                                                                        :
                                                                        d!.ModifiedDate ? formatDate_dd_MonthName_yy_hh_mm(d!.ModifiedDate) : "-"
                                                                    }

                                                                />

                                                                {index === b.TermSheetDisbursedAmountDetailsData.length - 1 && !isClosed && (
                                                                    <div className="flex items-center gap-1 md:absolute md:right-3 md:top-1/2 md:-translate-y-1/2 md:flex-row  w-full md:w-auto justify-end  mt-3 md:mt-0">
                                                                        <Button
                                                                            onClick={(e) => {
                                                                                e.preventDefault()
                                                                                e.stopPropagation()
                                                                                if (!canAction || isClosed) return;
                                                                                handleOpenDisbursedAmountModal(d)
                                                                            }}
                                                                            color="transparent"
                                                                            isborderRadius
                                                                            disabled={!canAction || isClosed}
                                                                            size="sm"
                                                                            title="Edit"
                                                                            style={{
                                                                                color: canAction && !isClosed ? '' : '#9CA3AF',
                                                                                cursor: canAction && !isClosed ? 'pointer' : 'not-allowed',
                                                                                opacity: canAction && !isClosed ? 1 : 0.5
                                                                            }}
                                                                        >
                                                                            <Edit className="h-4 w-4" />
                                                                        </Button>

                                                                        <Button
                                                                            onClick={(e) => {
                                                                                e.preventDefault()
                                                                                e.stopPropagation()
                                                                                if (!canAction) return;
                                                                                handleConfirmDeleteDisbursedAmount(d)
                                                                            }}
                                                                            color="transparent"
                                                                            isborderRadius
                                                                            disabled={!canAction}
                                                                            size="sm"
                                                                            style={{
                                                                                color: canAction && !isClosed ? 'red' : '#9CA3AF',
                                                                                cursor: canAction && !isClosed ? 'pointer' : 'not-allowed',
                                                                                opacity: canAction && !isClosed ? 1 : 0.5
                                                                            }}
                                                                            title="Delete"
                                                                        >
                                                                            <Trash2 className="h-4 w-4" />
                                                                        </Button>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ))}

                                                    </div>
                                                ) : (
                                                    <NoDataView message="No Disbursed Amount Details Found" />
                                                )}

                                            </div>

                                        </section>

                                    </>
                                )}
                            </Fragment>
                        ))
                    ) : (
                        <section className="md:col-span-4 bg-white rounded-xl shadow-sm p-6 border-[0.1px] border-[#3333334f]">
                            <NoDataView message="No Direct Selling Agent (DSA) Details Found" />
                        </section>
                    )}
                </div>
            )}

            {activeTab === "Sweep Ratio" && (
                <div className="space-y-3 pt-5">

                    {termSheetViewData?.TermSheetDetailsData?.length ? (

                        termSheetViewData.TermSheetDetailsData.map((b, i) => (

                            <Fragment key={i}>



                                {["APPROVED", "CLOSED"].includes(listState?.ApprovalStatus?.toUpperCase() ?? "") && (
                                    <>


                                        <section className="bg-white rounded-2xl border border-gray-200 shadow-sm mb-5 overflow-hidden">


                                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 w-full bg-[#F8FAFC] border-b border-gray-200 px-5 py-4">

                                                <h4 className="text-lg font-semibold text-gray-900">
                                                    Sweep Ratio Details
                                                </h4>

                                                <div className="w-full sm:w-auto">

                                                    <Button
                                                        color="blue"
                                                        size="sm"
                                                        onClick={() => {
                                                            if (!canAction || isClosed) return;
                                                            handleOpenSweepRatioModal();
                                                        }}
                                                        disabled={!canAction || isClosed}
                                                    >
                                                        Add
                                                    </Button>

                                                </div>

                                            </div>

                                            <div className="p-5">

                                                {b.TermSheetSweepRatioDetailsData?.length > 0 ? (

                                                    <div className="space-y-3">

                                                        {b.TermSheetSweepRatioDetailsData.map((d, index) => (
                                                            <div key={d.TermSheetSweepRatioDetailsId}
                                                                className={`relative grid grid-cols-1 md:grid-cols-6 gap-4 p-3 pr-24 ${index !== b.TermSheetSweepRatioDetailsData.length - 1
                                                                    ? "border-b border-gray-200"
                                                                    : ""
                                                                    }`} >

                                                                <FieldItem label="Own (%)" value={`${d.OwnSweepRatioInPercentage ?? 0} %`} />
                                                                <FieldItem label="Lender (%)" value={`${d.LenderSweepRatioInPercentage ?? 0} %`} />
                                                                <FieldItem label="Date" value={d.Date ? formatDate_dd_MonthName_yy(d.Date) : "-"} />
                                                                {(d.Remark?.trim()?.length ?? 0) >= 20 ? (
                                                                    <FieldInfoTooltip label="Remark" value={d.Remark} />
                                                                ) : (
                                                                    <FieldItem label="Remark" value={d.Remark ?? "-"} />
                                                                )}
                                                                <FieldItem label="Last Modified By" value={d!.ModifiedBy === "" ? d!.CreatedBy : d!.ModifiedBy} />

                                                                <FieldItem
                                                                    label="Last Modified Date"
                                                                    value={d!.ModifiedBy === "" ?
                                                                        d!.CreatedDate ? formatDate_dd_MonthName_yy_hh_mm(d!.CreatedDate) : "-"
                                                                        :
                                                                        d!.ModifiedDate ? formatDate_dd_MonthName_yy_hh_mm(d!.ModifiedDate) : "-"
                                                                    }

                                                                />



                                                                {index === b.TermSheetSweepRatioDetailsData.length - 1 && !isClosed && (
                                                                    <div className="flex items-center gap-1 md:absolute md:right-3 md:top-1/2 md:-translate-y-1/2 md:flex-row  w-full md:w-auto justify-end  mt-3 md:mt-0">

                                                                        <Button
                                                                            onClick={(e) => {
                                                                                e.preventDefault()
                                                                                e.stopPropagation()
                                                                                if (!canAction || isClosed) return;
                                                                                handleOpenSweepRatioModal(d)
                                                                            }}
                                                                            color="transparent"
                                                                            isborderRadius
                                                                            disabled={!canAction || isClosed}
                                                                            size="sm"
                                                                            title="Edit"
                                                                            style={{
                                                                                color: canAction && !isClosed ? '' : '#9CA3AF',
                                                                                cursor: canAction && !isClosed ? 'pointer' : 'not-allowed',
                                                                                opacity: canAction && !isClosed ? 1 : 0.5
                                                                            }}
                                                                        >
                                                                            <Edit className="h-4 w-4" />
                                                                        </Button>

                                                                        <Button
                                                                            onClick={(e) => {
                                                                                e.preventDefault()
                                                                                e.stopPropagation()
                                                                                if (!canAction) return;
                                                                                handleConfirmDeleteSweepRatio(d)
                                                                            }}
                                                                            color="transparent"
                                                                            isborderRadius
                                                                            disabled={!canAction}
                                                                            size="sm"
                                                                            style={{
                                                                                color: canAction && !isClosed ? 'red' : '#9CA3AF',
                                                                                cursor: canAction && !isClosed ? 'pointer' : 'not-allowed',
                                                                                opacity: canAction && !isClosed ? 1 : 0.5
                                                                            }}
                                                                            title="Delete"
                                                                        >
                                                                            <Trash2 className="h-4 w-4" />
                                                                        </Button>

                                                                    </div>
                                                                )}
                                                            </div>

                                                        )
                                                        )}

                                                    </div>

                                                ) : (
                                                    <NoDataView message="No Sweep Ratio Details Found" />
                                                )}

                                            </div>

                                        </section>


                                    </>
                                )}
                            </Fragment>
                        ))
                    ) : (
                        <section className="md:col-span-4 bg-white rounded-xl shadow-sm p-6 border-[0.1px] border-[#3333334f]">
                            <NoDataView message="No Direct Selling Agent (DSA) Details Found" />
                        </section>
                    )}
                </div>
            )}

            {activeTab === "DSA" && (
                <div className="space-y-3 pt-5">

                    {termSheetViewData?.TermSheetDetailsData?.length ? (

                        termSheetViewData.TermSheetDetailsData.map((b, i) => (

                            <Fragment key={i}>


                                {["APPROVED", "CLOSED"].includes(listState?.ApprovalStatus?.toUpperCase() ?? "") && (
                                    <>


                                        <section className="bg-white rounded-2xl border border-gray-200 shadow-sm mb-5 overflow-hidden">

                                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 w-full bg-[#F8FAFC] border-b border-gray-200 px-5 py-4">

                                                <h4 className="text-lg font-semibold text-gray-900">
                                                    Direct Selling Agent (DSA) Details
                                                </h4>

                                                <div className="w-full sm:w-auto">

                                                    <Button
                                                        color="blue"
                                                        size="sm"
                                                        onClick={() => {
                                                            if (!canAction || isClosed) return;
                                                            handleOpenDirectSellingAgentModal();
                                                        }}
                                                        disabled={!canAction || isClosed}
                                                    >
                                                        Add
                                                    </Button>


                                                </div>

                                            </div>

                                            <div className="p-5">

                                                {b.TermSheetDirectSellingAgentData?.length > 0 ? (

                                                    <div className="space-y-3">

                                                        {b.TermSheetDirectSellingAgentData.map(
                                                            (d, index) => (

                                                                <div key={d.TermSheetDirectSellingAgentId} className={`relative grid grid-cols-1 md:grid-cols-7 gap-4 p-3 md:pr-24 ${index !== b.TermSheetDirectSellingAgentData.length - 1 ? "border-b border-gray-200" : ""}`} >

                                                                    <FieldItem label="Name of Consultant" value={d.NameOfConsultant ?? "-"} />
                                                                    <FieldItem label="Commission (%)" value={`${d.CommissionInPercentage ?? 0} %`} />
                                                                    <FieldItem label="Amount (₹)" value={formatCurrency(d.Amount ?? 0)} />
                                                                    <FieldItem label="Payment Date" value={d.PaymentDate ? formatDate_dd_MonthName_yy(d.PaymentDate) : "-"} />
                                                                    {(d.Remark?.trim()?.length ?? 0) >= 20 ? (
                                                                        <FieldInfoTooltip label="Remark" value={d.Remark} />
                                                                    ) : (
                                                                        <FieldItem label="Remark" value={d.Remark ?? "-"} />
                                                                    )}
                                                                    <FieldItem label="Last Modified By" value={d!.ModifiedBy === "" ? d!.CreatedBy : d!.ModifiedBy} />

                                                                    <FieldItem
                                                                        label="Last Modified Date"
                                                                        value={d!.ModifiedBy === "" ?
                                                                            d!.CreatedDate ? formatDate_dd_MonthName_yy_hh_mm(d!.CreatedDate) : "-"
                                                                            :
                                                                            d!.ModifiedDate ? formatDate_dd_MonthName_yy_hh_mm(d!.ModifiedDate) : "-"
                                                                        }

                                                                    />



                                                                    {index === b.TermSheetDirectSellingAgentData.length - 1 && !isClosed && (
                                                                        <div className="flex items-center gap-1 md:absolute md:right-3 md:top-1/2 md:-translate-y-1/2 md:flex-row  w-full md:w-auto justify-end  mt-3 md:mt-0">

                                                                            <Button
                                                                                onClick={(e) => {
                                                                                    e.preventDefault()
                                                                                    e.stopPropagation()
                                                                                    if (!canAction || isClosed) return;
                                                                                    handleOpenDirectSellingAgentModal(d)
                                                                                }}
                                                                                color="transparent"
                                                                                isborderRadius
                                                                                disabled={!canAction || isClosed}
                                                                                size="sm"
                                                                                title="Edit"
                                                                                style={{
                                                                                    color: canAction && !isClosed ? '' : '#9CA3AF',
                                                                                    cursor: canAction && !isClosed ? 'pointer' : 'not-allowed',
                                                                                    opacity: canAction && !isClosed ? 1 : 0.5
                                                                                }}
                                                                            >
                                                                                <Edit className="h-4 w-4" />
                                                                            </Button>

                                                                            <Button
                                                                                onClick={(e) => {
                                                                                    e.preventDefault()
                                                                                    e.stopPropagation()
                                                                                    if (!canAction) return;
                                                                                    handleConfirmDeleteDirectSellingAgent(d)
                                                                                }}
                                                                                color="transparent"
                                                                                isborderRadius
                                                                                disabled={!canAction}
                                                                                size="sm"
                                                                                style={{
                                                                                    color: canAction && !isClosed ? 'red' : '#9CA3AF',
                                                                                    cursor: canAction && !isClosed ? 'pointer' : 'not-allowed',
                                                                                    opacity: canAction && !isClosed ? 1 : 0.5
                                                                                }}
                                                                                title="Delete"
                                                                            >
                                                                                <Trash2 className="h-4 w-4" />
                                                                            </Button>

                                                                        </div>
                                                                    )}

                                                                </div>

                                                            )
                                                        )}

                                                    </div>

                                                ) : (

                                                    <NoDataView message="No Direct Selling Agent (DSA) Details Found" />

                                                )}

                                            </div>

                                        </section>


                                    </>
                                )}
                            </Fragment>
                        ))
                    ) : (
                        <section className="md:col-span-4 bg-white rounded-xl shadow-sm p-6 border-[0.1px] border-[#3333334f]">
                            <NoDataView message="No Direct Selling Agent (DSA) Details Found" />
                        </section>
                    )}
                </div>
            )}

            {activeTab === "Repayment" && (
                <div className="space-y-3 pt-5">

                    {termSheetViewData?.TermSheetDetailsData?.length ? (

                        termSheetViewData.TermSheetDetailsData.map((b, i) => (

                            <Fragment key={i}>


                                {["APPROVED", "CLOSED"].includes(listState?.ApprovalStatus?.toUpperCase() ?? "") && (
                                    <>
                                        <section className="bg-white rounded-2xl border border-gray-200 shadow-sm mb-5 overflow-hidden">

                                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 w-full bg-[#F8FAFC] border-b border-gray-200 px-5 py-4">

                                                <div>
                                                    <h4 className="text-lg font-semibold text-gray-900">
                                                        Repayment Details
                                                    </h4>

                                                    <div className="mt-1 text-sm font-medium text-gray-600">
                                                        Total Repayment Amount:
                                                        <span className="ml-2 text-base font-bold text-gray-900">
                                                            {formatCurrency(
                                                                b.TermSheetRepayLedgerData?.reduce((total, item) => total + Number(item.Amount ?? 0), 0) ?? 0
                                                            )}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="w-full sm:w-auto">
                                                    <Button
                                                        color="blue"
                                                        size="sm"
                                                        onClick={() => handleOpenRepayLedgerModal()}
                                                        disabled={isLoading || !canAction || isClosed || Number(b.FacilityAmount ?? 0) <= Number(b.TotalRepayLedgerAmount ?? 0)} >
                                                        Add
                                                    </Button>
                                                </div>

                                            </div>

                                            <div className="p-5">

                                                {b.TermSheetRepayLedgerData?.length > 0 ? (

                                                    <div className="space-y-3">

                                                        {b.TermSheetRepayLedgerData.map((d, index) => (

                                                            <div key={d.TermSheetRepayLedgerId} className={`relative grid grid-cols-1 md:grid-cols-5 gap-4 p-3 pr-24 ${index !== b.TermSheetRepayLedgerData.length - 1 ? "border-b border-gray-200" : ""}`} >

                                                                <FieldItem label="Amount" value={formatCurrency(d.Amount ?? 0)} />

                                                                <FieldItem label="Payment Date" value={d.PaymentDate ? formatDate_dd_MonthName_yy(d.PaymentDate) : "-"} />

                                                                {(d.Remark?.trim()?.length ?? 0) >= 20 ? (
                                                                    <FieldInfoTooltip label="Remark" value={d.Remark} />
                                                                ) : (
                                                                    <FieldItem label="Remark" value={d.Remark ?? "-"} />
                                                                )}

                                                                <FieldItem label="Last Modified By" value={d!.ModifiedBy === "" ? d!.CreatedBy : d!.ModifiedBy} />

                                                                <FieldItem
                                                                    label="Last Modified Date"
                                                                    value={d!.ModifiedBy === "" ?
                                                                        d!.CreatedDate ? formatDate_dd_MonthName_yy_hh_mm(d!.CreatedDate) : "-"
                                                                        :
                                                                        d!.ModifiedDate ? formatDate_dd_MonthName_yy_hh_mm(d!.ModifiedDate) : "-"
                                                                    }

                                                                />


                                                                {index === b.TermSheetRepayLedgerData.length - 1 && !isClosed && (

                                                                    <div className="flex items-center gap-1 md:absolute md:right-3 md:top-1/2 md:-translate-y-1/2 w-full md:w-auto justify-end mt-3 md:mt-0">

                                                                        <Button
                                                                            onClick={(e) => {
                                                                                e.preventDefault()
                                                                                e.stopPropagation()
                                                                                if (!canAction || isClosed) return;
                                                                                handleOpenRepayLedgerModal(d)
                                                                            }}
                                                                            color="transparent"
                                                                            isborderRadius
                                                                            disabled={!canAction || isClosed}
                                                                            size="sm"
                                                                            title="Edit"
                                                                            style={{
                                                                                color: canAction && !isClosed ? '' : '#9CA3AF',
                                                                                cursor: canAction && !isClosed ? 'pointer' : 'not-allowed',
                                                                                opacity: canAction && !isClosed ? 1 : 0.5
                                                                            }}
                                                                        >
                                                                            <Edit className="h-4 w-4" />
                                                                        </Button>

                                                                        <Button
                                                                            onClick={(e) => {
                                                                                e.preventDefault()
                                                                                e.stopPropagation()
                                                                                if (!canAction) return;
                                                                                handleConfirmDeleteRepayLedger(d)
                                                                            }}
                                                                            color="transparent"
                                                                            isborderRadius
                                                                            disabled={!canAction}
                                                                            size="sm"
                                                                            style={{
                                                                                color: canAction && !isClosed ? 'red' : '#9CA3AF',
                                                                                cursor: canAction && !isClosed ? 'pointer' : 'not-allowed',
                                                                                opacity: canAction && !isClosed ? 1 : 0.5
                                                                            }}
                                                                            title="Delete"
                                                                        >
                                                                            <Trash2 className="h-4 w-4" />
                                                                        </Button>


                                                                    </div>
                                                                )}

                                                            </div>
                                                        ))}

                                                    </div>

                                                ) : (
                                                    <NoDataView message="No Repay Ledger Details Found" />
                                                )}

                                            </div>

                                        </section>


                                    </>
                                )}
                            </Fragment>
                        ))
                    ) : (
                        <section className="md:col-span-4 bg-white rounded-xl shadow-sm p-6 border-[0.1px] border-[#3333334f]">
                            <NoDataView message="No Direct Selling Agent (DSA) Details Found" />
                        </section>
                    )}
                </div>
            )}

            {activeTab === "DSRA" && (
                <div className="space-y-3 pt-5">

                    {termSheetViewData?.TermSheetDetailsData?.length ? (

                        termSheetViewData.TermSheetDetailsData.map((b, i) => (

                            <Fragment key={i}>


                                {["APPROVED", "CLOSED"].includes(listState?.ApprovalStatus?.toUpperCase() ?? "") && (
                                    <>
                                        <section className="bg-white rounded-2xl border border-gray-200 shadow-sm mb-5 overflow-hidden">
                                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 w-full bg-[#F8FAFC] border-b border-gray-200 px-5 py-4">
                                                <div>
                                                    <h4 className="text-lg font-semibold text-gray-900">Debt Service Reserve Account (DSRA) Details</h4>

                                                    <div className="mt-1 text-sm font-medium text-gray-600">
                                                        Total DSRA Amount:
                                                        <span className="ml-2 text-base font-bold text-gray-900">
                                                            {formatCurrency(
                                                                b.TermSheetDebtServiceReserveAccountData?.reduce((total, item) => total + Number(item.Amount ?? 0), 0) ??
                                                                0,
                                                            )}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="w-full sm:w-auto">
                                                    <Button
                                                        color="blue"
                                                        size="sm"
                                                        onClick={() => {
                                                            if (!canAction || isClosed) return;

                                                            handleOpenDebtServiceReserveAccountModal();
                                                        }}
                                                        disabled={!canAction || isClosed}
                                                    >
                                                        Add
                                                    </Button>
                                                </div>
                                            </div>

                                            <div className="p-5">
                                                {b.TermSheetDebtServiceReserveAccountData?.length > 0 ? (
                                                    <div className="space-y-3">
                                                        {b.TermSheetDebtServiceReserveAccountData.map((d, index) => (
                                                            <div
                                                                key={d.TermSheetDebtServiceReserveAccountId}
                                                                className={`relative grid grid-cols-1 md:grid-cols-4 gap-4 p-3 pr-24 ${index !== b.TermSheetDebtServiceReserveAccountData.length - 1 ? "border-b border-gray-200" : ""
                                                                    }`}
                                                            >
                                                                <FieldItem label="Term" value={d.Term ?? "-"} />

                                                                {d.Term === "Mutual Fund (MF)" && (
                                                                    <>
                                                                        <FieldItem label="Unit" value={d.Unit ?? 0} />

                                                                        <FieldItem label="Per Unit Rate" value={formatCurrency(d.PerUnitRate ?? 0)} />
                                                                    </>
                                                                )}

                                                                <FieldItem label="Amount" value={formatCurrency(d.Amount ?? 0)} />

                                                                <FieldItem label="Date" value={d.Date ? formatDate_dd_MonthName_yy(d.Date) : "-"} />

                                                                {d.Term === "Fixed Deposit (FD)" && (
                                                                    <>
                                                                        <FieldItem label="Rate Of Interest (%)" value={`${d.RateOfInterestInPercentage ?? 0} %`} />

                                                                        <FieldItem label="Redemption Value" value={formatCurrency(d.RedemptionValue ?? 0)} />

                                                                        <FieldItem label="Maturity Period" value={`${d.MaturityPeriod ?? 0}`} />
                                                                    </>
                                                                )}



                                                                <FieldItem label="Withdraw Amount" value={formatCurrency(d.WithdrawAmount ?? 0)} />

                                                                <FieldItem
                                                                    label="Withdraw Date"
                                                                    value={d.WithdrawDate ? formatDate_dd_MonthName_yy(d.WithdrawDate) : "-"}
                                                                />

                                                                <div className="md:col-span-4">
                                                                    <FieldItem label="Remark" value={d.Remark ?? "-"} />
                                                                </div>

                                                                <FieldItem label="Last Modified By" value={d.ModifiedBy === "" ? d.CreatedBy : d.ModifiedBy} />

                                                                <FieldItem
                                                                    label="Last Modified Date"
                                                                    value={
                                                                        d.ModifiedBy === ""
                                                                            ? d.CreatedDate
                                                                                ? formatDate_dd_MonthName_yy_hh_mm(d.CreatedDate)
                                                                                : "-"
                                                                            : d.ModifiedDate
                                                                                ? formatDate_dd_MonthName_yy_hh_mm(d.ModifiedDate)
                                                                                : "-"
                                                                    }
                                                                />

                                                                {index === b.TermSheetDebtServiceReserveAccountData.length - 1 && !isClosed && (
                                                                    <div className="flex items-center gap-1 md:absolute md:right-3 md:top-1/2 md:-translate-y-1/2 md:flex-row w-full md:w-auto justify-end mt-3 md:mt-0">
                                                                        <Button
                                                                            onClick={(e) => {
                                                                                e.preventDefault();
                                                                                e.stopPropagation();

                                                                                if (!canAction || isClosed) return;

                                                                                handleOpenDebtServiceReserveAccountModal(d);
                                                                            }}
                                                                            color="transparent"
                                                                            isborderRadius
                                                                            disabled={!canAction || isClosed}
                                                                            size="sm"
                                                                            title="Edit"
                                                                            style={{
                                                                                color: canAction && !isClosed ? "" : "#9CA3AF",
                                                                                cursor: canAction && !isClosed ? "pointer" : "not-allowed",
                                                                                opacity: canAction && !isClosed ? 1 : 0.5,
                                                                            }}
                                                                        >
                                                                            <Edit className="h-4 w-4" />
                                                                        </Button>
                                                                        {!isClosed && (
                                                                            <Button
                                                                                onClick={(e) => {
                                                                                    e.preventDefault();
                                                                                    e.stopPropagation();

                                                                                    if (!canAction) return;

                                                                                    handleConfirmDeleteDebtServiceReserveAccount(d);
                                                                                }}
                                                                                color="transparent"
                                                                                isborderRadius
                                                                                disabled={!canAction}
                                                                                size="sm"
                                                                                title="Delete"
                                                                                style={{
                                                                                    color: canAction && !isClosed ? "red" : "#9CA3AF",
                                                                                    cursor: canAction && !isClosed ? "pointer" : "not-allowed",
                                                                                    opacity: canAction && !isClosed ? 1 : 0.5,
                                                                                }}
                                                                            >
                                                                                <Trash2 className="h-4 w-4" />
                                                                            </Button>
                                                                        )}
                                                                    </div>
                                                                )}

                                                                {isClosed && (
                                                                    <div className="flex items-center gap-1 md:absolute md:right-3 md:top-1/2 md:-translate-y-1/2 md:flex-row w-full md:w-auto justify-end mt-3 md:mt-0">
                                                                        <Button
                                                                            onClick={(e) => {
                                                                                e.preventDefault();
                                                                                e.stopPropagation();

                                                                                if (!canAction) return;

                                                                                handleOpenDebtServiceReserveAccountModal(d);
                                                                            }}
                                                                            color="transparent"
                                                                            isborderRadius
                                                                            disabled={!canAction}
                                                                            size="sm"
                                                                            title="Edit"
                                                                            style={{
                                                                                color: canAction ? "" : "#9CA3AF",
                                                                                cursor: canAction ? "pointer" : "not-allowed",
                                                                                opacity: canAction ? 1 : 0.5,
                                                                            }}
                                                                        >
                                                                            <Edit className="h-4 w-4" />
                                                                        </Button>
                                                                    </div>
                                                                )}

                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <NoDataView message="No Debt Service Reserve Account Details Found" />
                                                )}
                                            </div>
                                        </section>
                                    </>
                                )}
                            </Fragment>
                        ))
                    ) : (
                        <section className="md:col-span-4 bg-white rounded-xl shadow-sm p-6 border-[0.1px] border-[#3333334f]">
                            <NoDataView message="No Direct Selling Agent (DSA) Details Found" />
                        </section>
                    )}
                </div>
            )}

            {activeTab === "Document" && (
                <div className="pt-5">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        {docsWithUrls.length === 0 && (
                            <section className="md:col-span-4 bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                                <NoDataView message="No Documents Found" />
                            </section>
                        )}

                        {docsWithUrls.map((d) => {
                            const urls = parseDocumentUrls(d.DocumentURL ?? "").filter((x) => x?.trim()?.length);

                            return (
                                <div className="border border-gray-200 rounded-lg shadow-sm flex flex-col h-full">
                                    <div className="flex items-start justify-between p-2 gap-2">
                                        <div className="flex flex-col">
                                            <span className="line-clamp-2 break-all font-medium text-gray-900">{d.DocumentName}</span>
                                            <span className="text-sm text-gray-500 mt-1">Document Count : {urls.length}</span>
                                        </div>

                                        <MultiImageViewer images={urls} title={d.DocumentName ?? "Document"} triggerLabel="View" isIcon={false} />

                                    </div>
                                    <div className="p-2 mt-auto">
                                        <FieldItem label="Submitted Original" value={d.IsSubmittedOriginalDocument ? 'Yes' : 'No'} isRow={true} />
                                        <FieldItem label="Collected Original" value={d.IsCollectedOriginalDocument ? 'Yes' : 'No'} isRow={true} />
                                        <FieldItem label="Collected Original Date" value={`${d?.CollectedOriginalDocumentDate ? formatDate_dd_MonthName_yy_hh_mm(d?.CollectedOriginalDocumentDate) : "-"}`} isRow={true} />
                                    </div>

                                    <div className="bg-gray-50 p-2 mt-auto">
                                        <FieldItem
                                            label="Uploaded By / Date"
                                            value={`${d?.ModifiedBy || d?.CreatedBy || "-"} / ${d?.ModifiedDate ? formatDate_dd_MonthName_yy_hh_mm(d?.ModifiedDate) : d?.CreatedDate ? formatDate_dd_MonthName_yy_hh_mm(d?.CreatedDate) : "-"}`}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            <ApprovalLogModal
                isOpen={isApprovalLogModalOpen}
                title='Term Sheet'
                titleText={nameOfInstitutionBankNBFC ?? ""}
                subTitleText={type ?? ""}
                subSubTitleText={String(facilityAmount) ?? ""}
                onClose={() => setIsApprovalLogModalOpen(false)}
                request={approvalLogRequest} />

            <ApprovalActionModal
                title="Term Sheet"
                isOpen={isApprovalActionModalOpen}
                onClose={() => setIsApprovalActionModalOpen(false)}
                actionType={approvalActionType}
                titleText={nameOfInstitutionBankNBFC ?? ""}
                subTitleText={type ?? ""}
                subSubTitleText={String(facilityAmount) ?? ""}
                onSubmit={handleApprovalSubmit}
                loading={isLoading}
            />

            {/* ===========================================================================================================================  */}

            <Modal
                isOpen={isDisbursedAmountModalOpen}
                title={disbursedAmountFormData.TermSheetDisbursedAmountDetailsId ? "Update Disbursed Amount" : "Add Disbursed Amount"}
                onClose={handleDisbursedAmountModal}
                onSubmit={handleAddUpdateDisbursedAmount}
                saveText={Number(disbursedAmountFormData.TermSheetDisbursedAmountDetailsId) > 0 ? "Update" : "Add"}
                loading={isLoading}
                size="lg"
            >
                <div className="space-y-6 p-6 bg-blue-100">
                    <div>

                        <Input
                            value={disbursedAmountFormData.DisbursedAmount ?? ''}
                            label='Disbursed Amount (₹)'
                            required
                            error={errorsDisbursedAmount.DisbursedAmount}
                            placeholder="Enter Disbursed Amount"
                            onChange={e => handleDisbursedAmountFieldChange('DisbursedAmount', filterNumbersWithDecimal(e.target.value) || 0)}
                            rightIcon="₹"
                        />
                    </div>

                    <div>
                        <DatePickerInput
                            label="Disbursed Date"
                            value={formatDate_dd_mm_yyyy(disbursedAmountFormData.DisbursedDate ?? "")}
                            onChange={(val) => handleDisbursedAmountFieldChange("DisbursedDate", convert_dd_mm_yyyy_To_Yyyy_mm_dd(val))}
                            required
                            error={errorsDisbursedAmount.DisbursedDate}
                        />
                    </div>
                    <div>
                        <TextArea
                            label="Remark"
                            className='thin-scroll'

                            value={disbursedAmountFormData.Remark ?? ""}
                            placeholder="Enter Remark"
                            onChange={(e) => handleDisbursedAmountFieldChange("Remark", e.target.value)}
                            error={errorsDisbursedAmount.Remark}
                        />
                    </div>
                </div>
            </Modal>


            <DeleteDialog
                isOpen={isDeleteDisbursedAmountDialogOpen}
                onClose={() => {
                    setIsDeleteDisbursedAmountDialogOpen(false);
                    setSelectedDisbursedAmountItem(null);
                }}
                onConfirm={handleDeleteDisbursedAmount}
                loading={isLoading}
                pageName="Term Sheet Disbursed Amount"
            />

            {/* ===========================================================================================================================  */}

            <Modal
                isOpen={isSweepRatioModalOpen}
                title={sweepRatioFormData.TermSheetSweepRatioDetailsId ? "Update Sweep Ratio Details" : "Add Sweep Ratio Details"}
                onClose={handleSweepRatioModal}
                onSubmit={handleAddUpdateSweepRatio}
                saveText={Number(sweepRatioFormData.TermSheetSweepRatioDetailsId) > 0 ? "Update" : "Add"}
                loading={isLoading}

                size="lg"
            >

                <div className="space-y-6 p-6 bg-blue-100">
                    <Input
                        value={sweepRatioFormData.OwnSweepRatioInPercentage ?? ""}
                        label="Own Sweep Ratio (%)"
                        required
                        error={errorsSweepRatio.OwnSweepRatioInPercentage}
                        placeholder="Enter Own Sweep Ratio"
                        onChange={(e) => {
                            const val = allowPercentage(e.target.value);
                            if (val !== null) {
                                handleSweepRatioFieldChange("OwnSweepRatioInPercentage", filterNumbersWithDecimal(e.target.value));
                            }
                        }}

                        rightIcon="%"
                    />
                    <Input
                        value={sweepRatioFormData.LenderSweepRatioInPercentage ?? ""}
                        label="Lender Sweep Ratio (%)"
                        required
                        error={errorsSweepRatio.LenderSweepRatioInPercentage}
                        placeholder="Enter Lender Sweep Ratio"
                        onChange={(e) => {
                            const val = allowPercentage(e.target.value);
                            if (val !== null) {
                                handleSweepRatioFieldChange("LenderSweepRatioInPercentage", filterNumbersWithDecimal(e.target.value));
                            }
                        }}

                        rightIcon="%"
                    />

                    <DatePickerInput
                        label="Date"
                        value={formatDate_dd_mm_yyyy(sweepRatioFormData.Date ?? "")}
                        onChange={(val) => handleSweepRatioFieldChange("Date", convert_dd_mm_yyyy_To_Yyyy_mm_dd(val))}
                        required
                        error={errorsSweepRatio.Date}
                    />

                    <TextArea
                        label="Remark"
                        className='thin-scroll'

                        value={sweepRatioFormData.Remark ?? ""}
                        placeholder="Enter Remark"
                        onChange={(e) => handleSweepRatioFieldChange("Remark", e.target.value)}
                        error={errorsSweepRatio.Remark}
                    />

                </div>

            </Modal>

            <DeleteDialog
                isOpen={isDeleteSweepRatioDialogOpen}
                onClose={() => {
                    setIsDeleteSweepRatioDialogOpen(false);
                    setSelectedSweepRatioItem(null);
                }}
                onConfirm={handleDeleteSweepRatio}
                loading={isLoading}
                pageName="Term Sheet Sweep Ratio"
            />


            {/* ===========================================================================================================================  */}
            <Modal
                isOpen={isDirectSellingAgentModalOpen}
                title={directSellingAgentFormData.TermSheetDirectSellingAgentId ? "Update Direct Selling Agent" : "Add Direct Selling Agent"}
                onClose={handleDirectSellingAgentModal}
                onSubmit={handleAddUpdateDirectSellingAgent}
                saveText={Number(directSellingAgentFormData.TermSheetDirectSellingAgentId) > 0 ? "Update" : "Add"}
                loading={isLoading}
                size="lg"
            >
                <div className="space-y-6 p-6 bg-blue-100">

                    <Input
                        value={directSellingAgentFormData.NameOfConsultant ?? ""}
                        label="Name Of Consultant"
                        required
                        error={errorsDirectSellingAgent.NameOfConsultant}
                        placeholder="Enter Name Of Consultant"
                        maxLength={100}
                        onChange={(e) => handleDirectSellingAgentFieldChange("NameOfConsultant", e.target.value)}
                    />

                    <Input
                        value={directSellingAgentFormData.CommissionInPercentage ?? ""}
                        label="Commission (%)"
                        required
                        error={errorsDirectSellingAgent.CommissionInPercentage}
                        placeholder="Enter Commission"
                        onChange={(e) => {
                            const val = allowPercentage(e.target.value);
                            if (val !== null) {
                                handleDirectSellingAgentFieldChange("CommissionInPercentage", filterNumbersWithDecimal(e.target.value));
                            }
                        }}

                        rightIcon="%"
                    />

                    <Input
                        value={directSellingAgentFormData.Amount ?? ""}
                        label="Amount (₹)"
                        required
                        error={errorsDirectSellingAgent.Amount}
                        placeholder="Enter Amount"
                        onChange={(e) => handleDirectSellingAgentFieldChange("Amount", filterNumbersWithDecimal(e.target.value) || 0)}
                        rightIcon="₹"
                    />

                    <DatePickerInput
                        label="Payment Date"
                        value={formatDate_dd_mm_yyyy(directSellingAgentFormData.PaymentDate ?? "")}
                        onChange={(val) => handleDirectSellingAgentFieldChange("PaymentDate", convert_dd_mm_yyyy_To_Yyyy_mm_dd(val))}
                        required
                        error={errorsDirectSellingAgent.PaymentDate}
                    />

                    <TextArea
                        label="Remark"
                        className='thin-scroll'

                        value={directSellingAgentFormData.Remark ?? ""}
                        placeholder="Enter Remark"
                        onChange={(e) => handleDirectSellingAgentFieldChange("Remark", e.target.value)}
                        error={errorsDirectSellingAgent.Remark}
                    />
                </div>
            </Modal>

            <DeleteDialog
                isOpen={isDeleteDirectSellingAgentDialogOpen}
                onClose={() => {
                    setIsDeleteDirectSellingAgentDialogOpen(false);
                    setSelectedDirectSellingAgentItem(null);
                }}
                onConfirm={handleDeleteDirectSellingAgent}
                loading={isLoading}
                pageName="Term Sheet Direct Selling Agent"
            />
            {/* ===========================================================================================================================  */}
            <Modal
                isOpen={isRepayLedgerModalOpen}
                title={repayLedgerFormData.TermSheetRepayLedgerId ? "Update Repayment" : "Add Repayment"}
                onClose={handleRepayLedgerModal}
                onSubmit={handleAddUpdateRepayLedger}
                saveText={Number(repayLedgerFormData.TermSheetRepayLedgerId) > 0 ? "Update" : "Add"}
                loading={isLoading}
                size="lg"
            >
                <div className="space-y-6 p-6 bg-blue-100">
                    <Input
                        value={repayLedgerFormData.Amount ?? ""}
                        label="Repayment Amount (₹)"
                        required
                        error={errorsRepayLedger.Amount}
                        placeholder="Enter Repayment Amount"
                        onChange={(e) => handleRepayLedgerFieldChange("Amount", filterNumbersWithDecimal(e.target.value) || 0)}
                        rightIcon="₹"
                    />

                    <DatePickerInput
                        label="Payment Date"
                        value={formatDate_dd_mm_yyyy(repayLedgerFormData.PaymentDate ?? "")}
                        onChange={(val) => handleRepayLedgerFieldChange("PaymentDate", convert_dd_mm_yyyy_To_Yyyy_mm_dd(val))}
                        required
                        error={errorsRepayLedger.PaymentDate}
                    />

                    <TextArea
                        label="Remark"
                        className='thin-scroll'

                        value={repayLedgerFormData.Remark ?? ""}
                        placeholder="Enter Remark"
                        onChange={(e) => handleRepayLedgerFieldChange("Remark", e.target.value)}
                        error={errorsRepayLedger.Remark}
                    />
                </div>
            </Modal>

            <DeleteDialog
                isOpen={isDeleteRepayLedgerDialogOpen}
                onClose={() => {
                    setIsDeleteRepayLedgerDialogOpen(false);
                    setSelectedRepayLedgerItem(null);
                }}
                onConfirm={handleDeleteRepayLedger}
                loading={isLoading}
                pageName="Term Sheet Repayment"
            />

            <DeleteDialog
                isOpen={isConfirmationDialogBoxOpen}
                onClose={() => {
                    setIsConfirmationDialogBoxOpen(false);
                    setFinalizeTermSheetDetailsData(null);
                }}
                onConfirm={handleSubmitFinalizeTermSheetDetails}
                loading={isLoading}
                pageName={isClosed ? "Closed" : "Final Approval"}
                variant="generate"
                title={
                    isClosed
                        ? "Close Term Sheet Confirmation"
                        : "Final Approval Confirmation"
                }
                message={
                    isClosed
                        ? "Are you sure you want to close this Term Sheet?"
                        : "Are you sure you want to give Final Approval?"
                }
                confirmText={
                    isClosed
                        ? "Closed"
                        : "Final Approved"
                }
            />
            <Modal
                isOpen={isClosingModalOpen}
                onClose={() => {
                    setIsClosingModalOpen(false);
                    setClosingFormData({ ClosingDate: "", ClosingRemark: "" });
                    setClosingErrors({});
                }}
                onSubmit={handleSubmitFinalizeTermSheetClosing}
                title="Close Term Sheet"
                saveText={"Close"}
                loading={isLoading}
                size="lg"
            >
                <div className="space-y-4">

                    <DatePickerInput
                        label="Closing Date"
                        required
                        value={formatDate_dd_mm_yyyy(closingFormData.ClosingDate ?? "")}
                        error={closingErrors.ClosingDate}
                        onChange={(value) => {
                            setClosingFormData((prev) => ({ ...prev, ClosingDate: convert_dd_mm_yyyy_To_Yyyy_mm_dd(value) ?? "" }));

                            setClosingErrors((prev) => ({ ...prev, ClosingDate: "" }));
                        }}
                    />

                    <TextArea
                        label="Closing Remarks"
                        required
                        placeholder="Enter Closing Remarks"
                        value={closingFormData.ClosingRemark}
                        error={closingErrors.ClosingRemark}
                        onChange={(e) => {
                            setClosingFormData((prev) => ({ ...prev, ClosingRemark: e.target.value }));

                            setClosingErrors((prev) => ({ ...prev, ClosingRemark: "" }));
                        }}
                    />



                </div>
            </Modal>
            {/* ===========================================================================================================================  */}
            <Modal
                isOpen={isDebtServiceReserveAccountModalOpen}
                title={
                    debtServiceReserveAccountFormData.TermSheetDebtServiceReserveAccountId
                        ? "Update Debt Service Reserve Account"
                        : "Add Debt Service Reserve Account"
                }
                onClose={handleDebtServiceReserveAccountModal}
                onSubmit={handleAddUpdateDebtServiceReserveAccount}
                saveText={Number(debtServiceReserveAccountFormData.TermSheetDebtServiceReserveAccountId) > 0 ? "Update" : "Add"}
                loading={isLoading}
                size="lg"
            >
                <div className="space-y-6 p-6 bg-blue-100">

                    <SinglePageSelection
                        label="Term"
                        placeholder="Select Term"
                        required
                        value={debtServiceReserveAccountFormData.Term}
                        onChange={(e) => handleDebtServiceReserveAccountFieldChange('Term', String(e))}
                        options={TERM_SHEET_DSRA_TERM_OPTIONS.map((opt) => ({ label: opt.name, value: opt.id }))}
                        error={errorsDebtServiceReserveAccount.Term}
                        disabled={isClosed || Number(debtServiceReserveAccountFormData.TermSheetDebtServiceReserveAccountId) > 0}
                    />

                    {debtServiceReserveAccountFormData.Term === "Mutual Fund (MF)" && (
                        <>
                            <Input
                                label="Unit"
                                value={debtServiceReserveAccountFormData.Unit ?? ""}
                                required
                                error={errorsDebtServiceReserveAccount.Unit}
                                placeholder="Enter Unit"
                                onChange={(e) => handleDebtServiceReserveAccountFieldChange("Unit", filterNumbersWithDecimal(e.target.value) || 0)}
                                disabled={isClosed}
                            />

                            <Input
                                label="Per Unit Rate (₹)"
                                value={debtServiceReserveAccountFormData.PerUnitRate ?? ""}
                                required
                                error={errorsDebtServiceReserveAccount.PerUnitRate}
                                placeholder="Enter Per Unit Rate"
                                onChange={(e) => handleDebtServiceReserveAccountFieldChange("PerUnitRate", filterNumbersWithDecimal(e.target.value) || 0)}
                                rightIcon="₹"
                                disabled={isClosed}
                            />
                        </>
                    )}

                    <Input
                        label="Amount (₹)"
                        value={
                            debtServiceReserveAccountFormData.Term === "Mutual Fund (MF)"
                                ? (
                                    (Number(debtServiceReserveAccountFormData.Unit) || 0) * (Number(debtServiceReserveAccountFormData.PerUnitRate) || 0)
                                )
                                : (debtServiceReserveAccountFormData.Amount ?? "")
                        }
                        required
                        disabled={debtServiceReserveAccountFormData.Term === "Mutual Fund (MF)" && !isClosed}
                        error={errorsDebtServiceReserveAccount.Amount}
                        placeholder="Enter Amount"
                        onChange={(e) => handleDebtServiceReserveAccountFieldChange("Amount", filterNumbersWithDecimal(e.target.value) || 0)}
                        rightIcon="₹"
                    />

                    <DatePickerInput
                        label="Date"
                        value={formatDate_dd_mm_yyyy(debtServiceReserveAccountFormData.Date ?? "")}
                        onChange={(val) => handleDebtServiceReserveAccountFieldChange("Date", convert_dd_mm_yyyy_To_Yyyy_mm_dd(val))}
                        required
                        error={errorsDebtServiceReserveAccount.Date}
                        disabled={isClosed}
                    />


                    {debtServiceReserveAccountFormData.Term === "Fixed Deposit (FD)" && (
                        <>
                            <Input
                                label="Rate Of Interest (%)"
                                value={debtServiceReserveAccountFormData.RateOfInterestInPercentage ?? ""}
                                required
                                error={errorsDebtServiceReserveAccount.RateOfInterestInPercentage}
                                placeholder="Enter Rate Of Interest"
                                onChange={(e) => {
                                    const val = allowPercentage(e.target.value);
                                    if (val !== null) {
                                        handleDebtServiceReserveAccountFieldChange("RateOfInterestInPercentage", filterNumbersWithDecimal(e.target.value));
                                    }
                                }}
                                rightIcon="%"
                                disabled={isClosed}
                            />

                            <Input
                                label="Redemption Value (₹)"
                                value={debtServiceReserveAccountFormData.RedemptionValue ?? ""}
                                required
                                error={errorsDebtServiceReserveAccount.RedemptionValue}
                                placeholder="Enter Redemption Value"
                                onChange={(e) =>
                                    handleDebtServiceReserveAccountFieldChange("RedemptionValue", filterNumbersWithDecimal(e.target.value) || 0)
                                }
                                rightIcon="₹"
                                disabled={isClosed}
                            />

                            <Input
                                label="Maturity Period"
                                value={debtServiceReserveAccountFormData.MaturityPeriod ?? ""}
                                required
                                error={errorsDebtServiceReserveAccount.MaturityPeriod}
                                placeholder="Enter Maturity Period"
                                onChange={(e) =>
                                    handleDebtServiceReserveAccountFieldChange("MaturityPeriod", filterNumbersWithDecimal(e.target.value) || 0)
                                }
                                disabled={isClosed}
                                maxLength={5}
                            />
                        </>
                    )}

                    <Input
                        label="Withdraw Amount (₹)"
                        value={debtServiceReserveAccountFormData.WithdrawAmount ?? ""}
                        error={errorsDebtServiceReserveAccount.WithdrawAmount}
                        placeholder="Enter Withdraw Amount"
                        onChange={(e) => handleDebtServiceReserveAccountFieldChange("WithdrawAmount", filterNumbersWithDecimal(e.target.value) || 0)}
                        rightIcon="₹"
                        disabled={!isClosed}
                    />

                    <DatePickerInput
                        label="Withdraw Date"
                        value={formatDate_dd_mm_yyyy(debtServiceReserveAccountFormData.WithdrawDate ?? "")}
                        onChange={(val) => handleDebtServiceReserveAccountFieldChange("WithdrawDate", convert_dd_mm_yyyy_To_Yyyy_mm_dd(val))}
                        error={errorsDebtServiceReserveAccount.WithdrawDate}
                        disabled={!isClosed}

                    />

                    <TextArea
                        label="Remark"
                        className='thin-scroll'

                        value={debtServiceReserveAccountFormData.Remark ?? ""}
                        placeholder="Enter Remark"
                        onChange={(e) => handleDebtServiceReserveAccountFieldChange("Remark", e.target.value)}
                        error={errorsDebtServiceReserveAccount.Remark}

                    />
                </div>
            </Modal>
            <DeleteDialog
                isOpen={isDeleteDebtServiceReserveAccountDialogOpen}
                onClose={() => {
                    setIsDeleteDebtServiceReserveAccountDialogOpen(false);
                    setSelectedDebtServiceReserveAccountItem(null);
                }}
                onConfirm={handleDeleteDebtServiceReserveAccount}
                loading={isLoading}
                pageName="Term Sheet Debt Service Reserve Account"
            />
        </div>
    );
};

export default ViewTermSheet;
