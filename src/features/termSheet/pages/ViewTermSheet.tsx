import { useNavigate } from "react-router-dom";
import { FieldItem } from "@/ui/components/forms/FieldItem";
import { convert_dd_mm_yyyy_To_Yyyy_mm_dd, formatDate_dd_mm_yyyy, formatDate_dd_MonthName_yy, formatDate_dd_MonthName_yy_hh_mm } from "@/core/utils/dateFormat";
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
import type { AddUpdateTermSheetDirectSellingAgentRequest, AddUpdateTermSheetDisbursedAmountDetailsRequest, AddUpdateTermSheetRepayLedgerRequest, AddUpdateTermSheetSweepRadioDetailsRequest, DeleteTermSheetRepayLedgerRequest, FinalizeTermSheetDetails, TermSheetDetailsData, TermSheetDirectSellingAgentData, TermSheetDisbursedAmountDetailsData, TermSheetRepayLedgerData, TermSheetSweepRadioDetailsData, TermSheetViewData } from "@/features/termSheet/models/TermSheetModel";
import type { FilterWithPaginationTermSheetDocumentRequest, TermSheetDocumentData } from "@/features/termSheet/models/TermSheetDocumentModel";
import { termSheetDocumentService } from "@/features/termSheet/services/TermSheetDocumentService";
import { formatCurrency } from "@/core/utils/comman";
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
import { Edit, Trash2 } from "lucide-react";
import { projectMasterService } from "@/features/projectMaster/services/ProjectMasterService";
import type { CompanyMasterData } from "@/features/companyMaster/models/CompanyMasterModel";

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
        ...(["APPROVED", "CLOSED"].includes(listState?.ApprovalStatus?.toUpperCase() ?? "") ? [{ id: "Document", label: "Document" }] : []),
    ];

    const [activeTab, setActiveTab] = useState<string>(termSheetTabList[0].id);
    const [companyMasterList, setCompanyMasterList] = useState<CompanyMasterData[]>([]);
    const [isConfirmationDialogBoxOpen, setIsConfirmationDialogBoxOpen] = useState(false);
    const [finalizeTermSheetDetailsData, setFinalizeTermSheetDetailsData] = useState<{ TermSheetId: number; ProjectId: number } | null>(null);
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
    });

    const [disbursedAmountFormData, setDisbursedAmountFormData] = useState<AddUpdateTermSheetDisbursedAmountDetailsRequest>(initialDisbursedAmountFormData());

    const [errorsDisbursedAmount, setErrorsDisbursedAmount] = useState<{ [key: string]: string }>({});

    // =======================================================================================================================================

    const [isSweepRadioModalOpen, setIsSweepRadioModalOpen] = useState(false);

    const [isDeleteSweepRadioDialogOpen, setIsDeleteSweepRadioDialogOpen] = useState(false);

    const [selectedSweepRadioItem, setSelectedSweepRadioItem] = useState<any | null>(null);

    const initialSweepRadioFormData = (): AddUpdateTermSheetSweepRadioDetailsRequest => ({
        TermSheetSweepRadioDetailsId: 0,
        Uniquekey: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
        TermSheetId: Number(listState.TermSheetId),
        TermSheetDetailsId: Number(listState.TermSheetDetailsId),
        ProjectId: Number(listState.ProjectId),
        OwnSweepRadioInPercentage: 0,
        LenderSweepRadioInPercentage: 0,
        Date: "",
    });
    const [sweepRadioFormData, setSweepRadioFormData] = useState<AddUpdateTermSheetSweepRadioDetailsRequest>(initialSweepRadioFormData());


    const [errorsSweepRadio, setErrorsSweepRadio] = useState<{ [key: string]: string }>({});

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
    });

    const [repayLedgerFormData, setRepayLedgerFormData] = useState<AddUpdateTermSheetRepayLedgerRequest>(initialRepayLedgerFormData());

    const [errorsRepayLedger, setErrorsRepayLedger] = useState<{ [key: string]: string }>({});
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
            approvalActionType === "approve" ? "Approving Booking" : "Rejecting Booking"
        );
    };


    const handleFinalizeConfirmation = () => {
        setFinalizeTermSheetDetailsData({
            TermSheetId: listState.TermSheetId ?? 0,
            ProjectId: listState.ProjectId ?? 0,
        });

        setIsConfirmationDialogBoxOpen(true);
    };

    const handleSubmitFinalizeTermSheetDetails = async () => {

        if (!finalizeTermSheetDetailsData) return;

        await runApiWithLoader(
            setIsLoading,

            setLoadingMessage,
            async () => {
                const payload: FinalizeTermSheetDetails = {
                    TermSheetId: listState.TermSheetId ?? 0,
                    ProjectId: listState.ProjectId ?? 0,
                    ActionType: isClosedFlag ? "CLOSED" : "FINAL APPROVAL"
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

            "Finalize Term Sheet",
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

        if (newTotalDisbursed > facilityAmount) {
            newErrors.DisbursedAmount = `Total Disbursed Amount cannot be greater than Facility Amount (${formatCurrency(facilityAmount)}).`;
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

    const handleOpenSweepRadioModal = (item?: Partial<TermSheetSweepRadioDetailsData>) => {
        setErrorsSweepRadio({});

        if (item) {

            setSweepRadioFormData({
                TermSheetSweepRadioDetailsId: item.TermSheetSweepRadioDetailsId ?? 0,

                Uniquekey: item.Uniquekey || "3fa85f64-5717-4562-b3fc-2c963f66afa6",

                TermSheetId: Number(listState.TermSheetId),

                TermSheetDetailsId: Number(item.TermSheetDetailsId ?? listState.TermSheetDetailsId),

                ProjectId: Number(listState.ProjectId),

                OwnSweepRadioInPercentage: item.OwnSweepRadioInPercentage ?? 0,

                LenderSweepRadioInPercentage: item.LenderSweepRadioInPercentage ?? 0,

                Date: item.Date || "",
            });
        } else {
            setSweepRadioFormData(initialSweepRadioFormData());
        }

        setIsSweepRadioModalOpen(true);
    };

    const handleSweepRadioModal = () => {
        setIsSweepRadioModalOpen(false);

        setSweepRadioFormData(initialSweepRadioFormData());

        setErrorsSweepRadio({});
    };

    const handleSweepRadioFieldChange = (field: keyof AddUpdateTermSheetSweepRadioDetailsRequest, value: any) => {
        setSweepRadioFormData((prev) => ({
            ...prev,
            [field]: value,
        }));

        if (errorsSweepRadio[field]) {
            setErrorsSweepRadio((prev) => ({
                ...prev,
                [field]: "",
            }));
        }
    };

    const validateSweepRadioForm = (): { isValid: boolean; errors: { [key: string]: string } } => {

        const newErrors: { [key: string]: string } = {};

        if (!sweepRadioFormData.Date?.trim()) {
            newErrors.Date = "Date is required.";
        }

        const ownSweep = Number(sweepRadioFormData.OwnSweepRadioInPercentage);
        const lenderSweep = Number(sweepRadioFormData.LenderSweepRadioInPercentage);

        if (sweepRadioFormData.OwnSweepRadioInPercentage === undefined ||
            sweepRadioFormData.OwnSweepRadioInPercentage === null ||
            ownSweep <= 0 ||
            ownSweep > 100
        ) {
            newErrors.OwnSweepRadioInPercentage = "Own Sweep Radio must be between 1 and 100%.";
        }

        if (sweepRadioFormData.LenderSweepRadioInPercentage === undefined ||
            sweepRadioFormData.LenderSweepRadioInPercentage === null ||
            lenderSweep <= 0 ||
            lenderSweep > 100) {
            newErrors.LenderSweepRadioInPercentage = "Lender Sweep Radio must be between 1 and 100%.";
        }

        if (ownSweep > 0 &&
            ownSweep <= 100 &&
            lenderSweep > 0 &&
            lenderSweep <= 100 &&
            ownSweep + lenderSweep !== 100) {
            newErrors.OwnSweepRadioInPercentage = "Own Sweep Radio and Lender Sweep Radio together must total 100%.";
            newErrors.LenderSweepRadioInPercentage = "Own Sweep Radio and Lender Sweep Radio together must total 100%.";
        }

        return {
            isValid: Object.keys(newErrors).length === 0,
            errors: newErrors,
        };
    };

    const handleAddUpdateSweepRadio = async (
        e: React.FormEvent
    ) => {

        e.preventDefault();

        setErrorsSweepRadio({});

        const validation = validateSweepRadioForm();

        if (!validation.isValid) {
            setErrorsSweepRadio(validation.errors);

            return;
        }

        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,

            async () => {

                const payload: AddUpdateTermSheetSweepRadioDetailsRequest =
                {
                    TermSheetSweepRadioDetailsId: sweepRadioFormData.TermSheetSweepRadioDetailsId ?? 0,

                    Uniquekey: sweepRadioFormData.Uniquekey ?? "3fa85f64-5717-4562-b3fc-2c963f66afa6",

                    TermSheetId: Number(listState.TermSheetId),

                    TermSheetDetailsId: Number(listState.TermSheetDetailsId),

                    ProjectId: Number(listState.ProjectId),

                    OwnSweepRadioInPercentage: Number(sweepRadioFormData.OwnSweepRadioInPercentage ?? 0),

                    LenderSweepRadioInPercentage: Number(sweepRadioFormData.LenderSweepRadioInPercentage ?? 0),

                    Date: sweepRadioFormData.Date || null,
                };

                const response = await termSheetService.apiCallAddUpdateTermSheetSweepRadioDetails(payload);

                if (E.isRight(response)) {

                    addToast({ type: "success", title: response.right.SuccessMessage?.[0] });

                    setIsSweepRadioModalOpen(false);

                    setSweepRadioFormData(initialDisbursedAmountFormData());

                    await fetchTermSheetDetails();

                } else {

                    addToast({ type: "error", title: response.left.message });

                }

                return response;
            },

            undefined,

            (error: any) => {
                addToast({
                    type: "error",
                    title: error.message,
                });
            },

            undefined,

            sweepRadioFormData.TermSheetSweepRadioDetailsId ? "Updating Sweep Radio Details" : "Adding Sweep Radio Details"
        );
    };

    const handleConfirmDeleteSweepRadio = (item: TermSheetSweepRadioDetailsData) => {
        setSelectedSweepRadioItem(item);
        setIsDeleteSweepRadioDialogOpen(true);
    };

    const handleDeleteSweepRadio = async () => {

        if (!selectedSweepRadioItem)
            return;

        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,

            async () => {

                const params = {
                    TermSheetSweepRadioDetailsId: selectedSweepRadioItem.TermSheetSweepRadioDetailsId ?? 0,

                    Uniquekey: selectedSweepRadioItem.Uniquekey ?? "",

                    TermSheetId: Number(listState.TermSheetId),

                    TermSheetDetailsId: Number(listState.TermSheetDetailsId),

                    ProjectId: Number(listState.ProjectId),
                };

                const response = await termSheetService.apiCallDeleteTermSheetSweepRadioDetails(params);

                if (E.isRight(response)) {

                    addToast({ type: "success", title: response.right.SuccessMessage?.[0] });

                    setIsDeleteSweepRadioDialogOpen(false);

                    setSelectedSweepRadioItem(null);

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

            "Deleting Sweep Radio Details"
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

        if (repayLedgerFormData.Amount === undefined || repayLedgerFormData.Amount === null || Number(repayLedgerFormData.Amount) <= 0) {
            newErrors.Amount = "Amount is required.";
        }

        if (!repayLedgerFormData.PaymentDate?.trim()) {
            newErrors.PaymentDate = "Payment Date is required.";
        }

        const facilityAmount = Number(termSheetViewData?.TermSheetDetailsData?.find(x => Number(x.TermSheetDetailsId) === Number(listState.TermSheetDetailsId))?.FacilityAmount ?? 0);

        const termSheetDetails = termSheetViewData?.TermSheetDetailsData?.find(item => Number(item.TermSheetDetailsId) === Number(listState.TermSheetDetailsId));

        const existingRepayAmount = termSheetDetails?.TermSheetRepayLedgerData?.reduce((total, item) => {

            if (Number(item.TermSheetRepayLedgerId) === Number(repayLedgerFormData.TermSheetRepayLedgerId)) {
                return total;
            }

            return total + Number(item.Amount ?? 0);
        }, 0) ?? 0;

        const newTotalRepay = existingRepayAmount + Number(repayLedgerFormData.Amount ?? 0);

        if (newTotalRepay > facilityAmount) {
            newErrors.Amount = `Total Repay Amount cannot be greater than Facility Amount (${formatCurrency(facilityAmount)}).`;
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
            repayLedgerFormData.TermSheetRepayLedgerId ? "Updating Repay Ledger" : "Adding Repay Ledger"
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

    const loadProjectMasterWithCompany = async () => {
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {

                const response = await projectMasterService.apiCallPullProjectMasterWithCompany(Number(listState.ProjectId));

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
                    islarge={true}
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

                                <section key={i} className="relative overflow-hidden bg-white rounded-2xl border border-gray-200 shadow-sm p-5">

                                    <h4 className="text-lg font-semibold text-gray-900 mb-4">
                                        {c.CompanyName ?? "-"}
                                    </h4>

                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        <FieldItem label="Firms Type" value={c.FirmsType ?? "-"} />
                                        <FieldItem label="Contact Person" value={c.ContactPerson ?? "-"} />
                                        <FieldItem label="Mobile Number" value={`+91 ${c.MobileNumber ?? "-"}`} />
                                        <FieldItem label="E-Mail ID" value={c.EmailId ?? "-"} />
                                        <FieldItem label="PAN Number" value={c?.PANNumber ?? '-'} urls={c?.PanCardURL} isIcon />
                                        <FieldItem label="GST Number" value={c?.GSTNumber ?? '-'} urls={c?.GSTCertificateURL} isIcon />
                                        <FieldItem label="CIN Number" value={c?.CINNumber ?? '-'} urls={c?.CINURL} isIcon />
                                        <FieldItem label="TAN Number" value={c?.TANNumber ?? '-'} urls={c?.TANURL} isIcon />
                                        <FieldItem label="City" value={c.CityName ?? "-"} />
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

                                    <section className="relative bg-white rounded-2xl border border-gray-200 shadow-sm mb-5 overflow-hidden">

                                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#2563EB]" />

                                        <div className="flex items-center w-full bg-[#F8FAFC] border-b border-gray-200 px-5 py-4">

                                            <div className="flex items-center gap-4 min-w-0">

                                                <h4 className="text-lg font-semibold text-gray-900 whitespace-nowrap">
                                                    {b.NameOfInstitutionBankNBFC}
                                                </h4>

                                                {b.TermSheetURL && (
                                                    <div className="inline-flex items-center gap-1 px-2 py-1 border border-blue-500 text-blue-600 rounded text-sm font-medium hover:bg-blue-50 transition">
                                                        <span>Term Sheet</span>

                                                        <MultiImageViewer
                                                            images={parseDocumentUrls(b.TermSheetURL)}
                                                            title={`Term Sheet - ${b.NameOfInstitutionBankNBFC ?? ""}`}
                                                            isIcon={false}
                                                            triggerLabel="Document"
                                                        />
                                                    </div>
                                                )}

                                            </div>

                                            <div className="ml-auto flex items-center">
                                                <ApprovalActions
                                                    approvalStatus={b.ApprovalStatus || "-"}
                                                    showApproval={b.IsApproval}
                                                    isIcons={false}
                                                    onHistory={() => handleApprovalLog(b)}
                                                    onApprove={() => handleApproveRejectDocument(b, "approve")}
                                                    onReject={() => handleApproveRejectDocument(b, "reject")}
                                                />
                                            </div>

                                        </div>

                                        <div className="p-5">
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

                                                <div>
                                                    <p className="text-sm font-medium text-[#1D1D1D80] pb-1">
                                                        Loan Taken By
                                                    </p>

                                                    <span className="inline-block px-2 py-1 rounded text-sm font-medium bg-[#EFF6FF] text-[#1D4ED8]">
                                                        {b.LoanTakenBy ?? "-"}
                                                    </span>
                                                </div>

                                                <FieldItem label="Type" value={b.Type ?? "-"} />
                                                <FieldItem label="Term Sheet / Sanction Date" value={b.TermSheetSanctionDate ? formatDate_dd_MonthName_yy(b.TermSheetSanctionDate) : ""} />
                                                <FieldItem label="Facility Amount" value={formatCurrency(b.FacilityAmount ?? "-")} />
                                                <FieldItem label="Rate Of Interest (%)" value={`${b.RateOfInterestInPercentage ?? 0} %`} />
                                                <FieldItem label="Processing Fees (%)" value={`${b.ProcessingFeesInPercentage ?? 0} %`} />
                                                <FieldItem label="Legal & Doumentation (₹)" value={formatCurrency(b.LegalAndDoumentationFees ?? 0)} />
                                                <FieldItem label="Monotorium Period (Months)" value={b.MonotoriumPeriodInMonth ?? 0} />
                                                <FieldItem label="Loan Tenure (Months)" value={b.LoanTenureInMonth ?? 0} />
                                                <FieldItem label="Minimum Selling Price MSP (₹)" value={formatCurrency(b.MinimumSellingPrice ?? 0)} />
                                                <FieldItem label="Start Date" value={b.LoanStartDate ? formatDate_dd_MonthName_yy(b.LoanStartDate) : ""} />
                                                <FieldItem label="End Date" value={b.LoanEndDate ? formatDate_dd_MonthName_yy(b.LoanEndDate) : ""} />
                                                <FieldItem label="Total Disbursed Amount (₹)" value={formatCurrency(b.TotalDisbursedAmount ?? 0)} />
                                                <FieldItem label="Total Repay Ledger Amount (₹)" value={formatCurrency(b.TotalRepayLedgerAmount ?? 0)} />

                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-1 gap-4 pt-5">
                                                <FieldItem label="Other Important Terms If Any" value={b.OtherImportantTermsIfAny ?? "-"} />
                                                <FieldItem label="Remark" value={b.Remark ?? "-"} />

                                            </div>
                                        </div>
                                    </section>

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
                                                                    className={`relative grid grid-cols-1 md:grid-cols-3 gap-4 p-3 pr-24 ${index !== b.TermSheetDisbursedAmountDetailsData.length - 1
                                                                        ? "border-b border-gray-200"
                                                                        : ""
                                                                        }`} >

                                                                    <FieldItem label="Disbursed Amount" value={formatCurrency(d.DisbursedAmount ?? 0)} />

                                                                    <FieldItem label="Disbursed Date" value={d.DisbursedDate ? formatDate_dd_MonthName_yy(d.DisbursedDate) : "-"} />

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

                                            <section className="bg-white rounded-2xl border border-gray-200 shadow-sm mb-5 overflow-hidden">


                                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 w-full bg-[#F8FAFC] border-b border-gray-200 px-5 py-4">

                                                    <h4 className="text-lg font-semibold text-gray-900">
                                                        Sweep Radio Details
                                                    </h4>

                                                    <div className="w-full sm:w-auto">

                                                        <Button
                                                            color="blue"
                                                            size="sm"
                                                            onClick={() => {
                                                                if (!canAction || isClosed) return;
                                                                handleOpenSweepRadioModal();
                                                            }}
                                                            disabled={!canAction || isClosed}
                                                        >
                                                            Add
                                                        </Button>

                                                    </div>

                                                </div>

                                                <div className="p-5">

                                                    {b.TermSheetSweepRadioDetailsData?.length > 0 ? (

                                                        <div className="space-y-3">

                                                            {b.TermSheetSweepRadioDetailsData.map((d, index) => (
                                                                <div key={d.TermSheetSweepRadioDetailsId}
                                                                    className={`relative grid grid-cols-1 md:grid-cols-3 gap-4 p-3 pr-24 ${index !== b.TermSheetSweepRadioDetailsData.length - 1
                                                                        ? "border-b border-gray-200"
                                                                        : ""
                                                                        }`} >

                                                                    <FieldItem label="Own Sweep Radio (%)" value={`${d.OwnSweepRadioInPercentage ?? 0} %`} />
                                                                    <FieldItem label="Lender Sweep Radio (%)" value={`${d.LenderSweepRadioInPercentage ?? 0} %`} />
                                                                    <FieldItem label="Date" value={d.Date ? formatDate_dd_MonthName_yy(d.Date) : "-"} />
                                                                    <FieldItem label="Last Modified By" value={d!.ModifiedBy === "" ? d!.CreatedBy : d!.ModifiedBy} />

                                                                    <FieldItem
                                                                        label="Last Modified Date"
                                                                        value={d!.ModifiedBy === "" ?
                                                                            d!.CreatedDate ? formatDate_dd_MonthName_yy_hh_mm(d!.CreatedDate) : "-"
                                                                            :
                                                                            d!.ModifiedDate ? formatDate_dd_MonthName_yy_hh_mm(d!.ModifiedDate) : "-"
                                                                        }

                                                                    />
                                                                    {index === b.TermSheetSweepRadioDetailsData.length - 1 && !isClosed && (
                                                                        <div className="flex items-center gap-1 md:absolute md:right-3 md:top-1/2 md:-translate-y-1/2 md:flex-row  w-full md:w-auto justify-end  mt-3 md:mt-0">

                                                                            <Button
                                                                                onClick={(e) => {
                                                                                    e.preventDefault()
                                                                                    e.stopPropagation()
                                                                                    if (!canAction || isClosed) return;
                                                                                    handleOpenSweepRadioModal(d)
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
                                                                                    handleConfirmDeleteSweepRadio(d)
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
                                                        <NoDataView message="No Sweep Radio Details Found" />
                                                    )}

                                                </div>

                                            </section>

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
                                                                    <div key={d.TermSheetDirectSellingAgentId} className={`relative grid  grid-cols-1 md:grid-cols-3 gap-4  p-3 md:pr-24 ${index !== b.TermSheetDirectSellingAgentData.length - 1 ? "border-b border-gray-200" : ""}`} >

                                                                        <FieldItem label="Name of Consultant" value={d.NameOfConsultant ?? "-"} />
                                                                        <FieldItem label="Commission (%)" value={`${d.CommissionInPercentage ?? 0} %`} />
                                                                        <FieldItem label="Amount (₹)" value={formatCurrency(d.Amount ?? 0)} />
                                                                        <FieldItem label="Payment Date" value={d.PaymentDate ? formatDate_dd_MonthName_yy(d.PaymentDate) : "-"} />
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

                                            <section className="bg-white rounded-2xl border border-gray-200 shadow-sm mb-5 overflow-hidden">

                                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 w-full bg-[#F8FAFC] border-b border-gray-200 px-5 py-4">

                                                    <div>
                                                        <h4 className="text-lg font-semibold text-gray-900">
                                                            Repay Ledger Details
                                                        </h4>

                                                        <div className="mt-1 text-sm font-medium text-gray-600">
                                                            Total Repay Amount:
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

                                                                <div key={d.TermSheetRepayLedgerId} className={`relative grid grid-cols-1 md:grid-cols-3 gap-4 p-3 pr-24 ${index !== b.TermSheetRepayLedgerData.length - 1 ? "border-b border-gray-200" : ""}`} >

                                                                    <FieldItem label="Amount" value={formatCurrency(d.Amount ?? 0)} />

                                                                    <FieldItem label="Payment Date" value={d.PaymentDate ? formatDate_dd_MonthName_yy(d.PaymentDate) : "-"} />

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
                                         <FieldItem label="Collected Original Date"  value={`${d?.CollectedOriginalDocumentDate ? formatDate_dd_MonthName_yy_hh_mm(d?.CollectedOriginalDocumentDate) : "-"}`} isRow={true}/>
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
                isOpen={isSweepRadioModalOpen}
                title={sweepRadioFormData.TermSheetSweepRadioDetailsId ? "Update Sweep Radio Details" : "Add Sweep Radio Details"}
                onClose={handleSweepRadioModal}
                onSubmit={handleAddUpdateSweepRadio}
                saveText={Number(sweepRadioFormData.TermSheetSweepRadioDetailsId) > 0 ? "Update" : "Add"}
                loading={isLoading}

                size="lg"
            >

                <div className="space-y-6 p-6 bg-blue-100">
                    <Input
                        value={sweepRadioFormData.OwnSweepRadioInPercentage ?? ""}
                        label="Own Sweep Radio (%)"
                        required
                        error={errorsSweepRadio.OwnSweepRadioInPercentage}
                        placeholder="Enter Own Sweep Radio"
                        onChange={(e) => {
                            const val = allowPercentage(e.target.value);
                            if (val !== null) {
                                handleSweepRadioFieldChange("OwnSweepRadioInPercentage", filterNumbersWithDecimal(e.target.value));
                            }
                        }}

                        rightIcon="%"
                    />
                    <Input
                        value={sweepRadioFormData.LenderSweepRadioInPercentage ?? ""}
                        label="Lender Sweep Radio (%)"
                        required
                        error={errorsSweepRadio.LenderSweepRadioInPercentage}
                        placeholder="Enter Lender Sweep Radio"
                        onChange={(e) => {
                            const val = allowPercentage(e.target.value);
                            if (val !== null) {
                                handleSweepRadioFieldChange("LenderSweepRadioInPercentage", filterNumbersWithDecimal(e.target.value));
                            }
                        }}

                        rightIcon="%"
                    />

                    <DatePickerInput
                        label="Date"
                        value={formatDate_dd_mm_yyyy(sweepRadioFormData.Date ?? "")}
                        onChange={(val) => handleSweepRadioFieldChange("Date", convert_dd_mm_yyyy_To_Yyyy_mm_dd(val))}
                        required
                        error={errorsSweepRadio.Date}
                    />

                </div>

            </Modal>

            <DeleteDialog
                isOpen={isDeleteSweepRadioDialogOpen}
                onClose={() => {
                    setIsDeleteSweepRadioDialogOpen(false);
                    setSelectedSweepRadioItem(null);
                }}
                onConfirm={handleDeleteSweepRadio}
                loading={isLoading}
                pageName="Term Sheet Sweep Radio"
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
                title={repayLedgerFormData.TermSheetRepayLedgerId ? "Update Repay Ledger" : "Add Repay Ledger"}
                onClose={handleRepayLedgerModal}
                onSubmit={handleAddUpdateRepayLedger}
                saveText={Number(repayLedgerFormData.TermSheetRepayLedgerId) > 0 ? "Update" : "Add"}
                loading={isLoading}
                size="lg"
            >
                <div className="space-y-6 p-6 bg-blue-100">
                    <Input
                        value={repayLedgerFormData.Amount ?? ""}
                        label="Repay Amount (₹)"
                        required
                        error={errorsRepayLedger.Amount}
                        placeholder="Enter Repay Amount"
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
                pageName="Term Sheet Repay Ledger"
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
        </div>
    );
};

export default ViewTermSheet;
