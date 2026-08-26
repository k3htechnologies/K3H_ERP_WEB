import { useNavigate } from "react-router-dom";
import HeaderActionBar from "@/ui/components/forms/HeaderActionBar";
import { useMenuPermissions } from "@/features/menu/hooks/useMenuPermissions";
import { Fragment, useEffect, useState } from "react";
import useToast from "@/core/hooks/useToast";
import * as E from "fp-ts/Either";
import { runApiWithLoader } from "@/core/utils";
import { Loader } from "@/core/utils/loader";
import { useTermSheetListState } from "@/features/termSheet/context/TermSheetListStateContext";
import { termSheetService } from "@/features/termSheet/services/TermSheetService";
import NoDataView from "@/ui/components/NoDataView/NoDataView";
import type { FinalizeTermSheetDetails, TermSheetDetailsData, TermSheetViewData } from "@/features/termSheet/models/TermSheetModel";
import { formatCurrency } from "@/core/utils/comman";
import ApprovalActions from "@/features/modulesWorkflowApproval/components/ApprovalActionsButton";
import type { ModulesApprovalStatusRequest, UpdateModulesWorkflowApprovalRequest } from "@/features/modulesWorkflowApproval/models/ModulesWorkflowApprovalModel";
import { ApprovalLogModal } from "@/features/modulesWorkflowApproval/components/ApprovalLogModal";
import ApprovalActionModal from "@/features/modulesWorkflowApproval/components/ApprovalActionModal";
import { modulesWorkflowApprovalService } from "@/features/modulesWorkflowApproval/services/ModulesWorkflowApprovalService";
import { parseDocumentUrls } from "@/core/utils/documentUtils";
import MultiImageViewer from "@/ui/components/ImageViewer/ImageViewer";
import { Button } from "@/ui/components/forms/Button";
import { projectMasterService } from "@/features/projectMaster/services/ProjectMasterService";
import type { CompanyMasterData } from "@/features/companyMaster/models/CompanyMasterModel";
import { FieldItem } from "@/ui/components/forms/FieldItem";
import { DeleteDialog } from "@/ui/components/forms/DeleteDialog";
import { Building2 } from "lucide-react";

const CompareTermSheet: React.FC = () => {
    const { listState } = useTermSheetListState();
    const [termSheetViewData, setTermSheetViewDataData] = useState<TermSheetViewData | null>(null);
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

    const [companyMasterList, setCompanyMasterList] = useState<CompanyMasterData[]>([]);
    const [isConfirmationDialogBoxOpen, setIsConfirmationDialogBoxOpen] = useState(false);

    const [finalizeTermSheetDetailsData, setFinalizeTermSheetDetailsData] = useState<{ TermSheetId: number; ProjectId: number } | null>(null);

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


    const handleBackToListTermSheet = () => {
        navigate("/termSheet");
    };

    const handleEditTermSheet = (row: TermSheetViewData) => {
        if (!row?.TermSheetId) return;
        navigate(`/termSheet/add/${row.TermSheetId}`);
    };


    const handleApprovalLog = (row: TermSheetDetailsData) => {
        const request: ModulesApprovalStatusRequest = {
            ModuleName: "TERM SHEET APPROVAL",
            Id: row.TermSheetDetailsId ?? 0,
            ProjectId: row.ProjectId ?? 0,
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


    const comparisonSections = [
        {
            title: "CORE FINANCIALS",
            rows: [
                {
                    label: "Type",
                    type: "",
                    getValue: (b: TermSheetDetailsData) => b.Type ?? "",
                    compare: "lower",
                },
                {
                    label: "Facility Amount (₹)",
                    type: "",
                    getValue: (b: TermSheetDetailsData) => formatCurrency(b.FacilityAmount ?? 0),
                    compare: "lower",
                },
                {
                    label: "Rate of Interest (ROI) (%)",
                    type: "",
                    getValue: (b: TermSheetDetailsData) => `${(b.RateOfInterestInPercentage ?? 0).toFixed(2)} %`,
                    compare: "lower",
                },
                {
                    label: "Processing Fee (%)",
                    type: "",
                    getValue: (b: TermSheetDetailsData) => `${(b.ProcessingFeesInPercentage ?? 0).toFixed(2)} %`,
                    compare: "lower",
                },
                {
                    label: "Legal & Documentation Fee",
                    type: "",
                    getValue: (b: TermSheetDetailsData) => formatCurrency(b.LegalAndDocumentationFees ?? 0),
                    compare: "lower",
                },
            ],
        },
        {
            title: "TERM CONDITIONS",
            rows: [
                {
                    label: "Moratorium Period (Months)",
                    type: "",
                    getValue: (b: TermSheetDetailsData) => `${b.MonotoriumPeriodInMonth ?? 0} Months`,
                    compare: "higher",
                },
                {
                    label: "Loan Tenure (Months)",
                    type: "",
                    getValue: (b: TermSheetDetailsData) => `${b.LoanTenureInMonth ?? 0} Months`,
                    compare: "higher",
                },
                {
                    label: "Minimum Selling Price (MSP)",
                    type: "",
                    getValue: (b: TermSheetDetailsData) => formatCurrency(b.MinimumSellingPrice ?? 0),
                    compare: "lower",
                },
                {
                    label: "Other Important Terms If Any",
                    type: "",
                    getValue: (b: TermSheetDetailsData) => b.OtherImportantTermsIfAny ?? "-",
                    compare: "lower",
                },
                {
                    label: "Remark",
                    type: "",
                    getValue: (b: TermSheetDetailsData) => b.Remark ?? "-",
                    compare: "lower",
                },
            ],
        },

        {
            title: "DOCUMENTS",
            rows: [
                {
                    label: "Term Sheet",
                    type: "Document",
                    getValue: (b: TermSheetDetailsData) => b.TermSheetURL ?? "",
                    compare: "none",
                },
            ],
        },
        {
            title: "APPROVAL",
            rows: [
                {
                    label: "Approval Status",
                    type: "Approval",
                    getValue: () => "",
                    compare: "none",
                },
            ],
        },
    ];

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
                    ActionType: "FINAL APPROVAL"
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
    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-300 p-6">

            <Loader loading={isLoading} title={loadingMessage}> {" "}<div></div>{" "}</Loader>

            <HeaderActionBar
                titleText={`${listState?.ProjectName ?? ""} :`}
                subTitleText={listState?.NameOfInstitutionBankNBFC ?? ""}
                subSubSubTitleText={listState?.ApprovalStatus ?? ""}
                cancelText="Cancel"
                EditText="Edit"
                onCancel={() => handleBackToListTermSheet()}
                canAction={listState?.ApprovalStatus?.toUpperCase() !== "APPROVED" && canAction}
                onEdit={() => { handleEditTermSheet(termSheetViewData!) }}
                isLoading={false}
            />

            <div className="space-y-4 pt-5">
                {companyMasterList?.length ? (

                    companyMasterList.map((c, i) => (

                        <section key={i} className="relative overflow-hidden bg-white rounded-2xl border border-gray-200 shadow-sm">

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
            <div className="pt-5">
                {termSheetViewData?.TermSheetDetailsData?.length ? (
                    <section className="bg-white rounded-xl border border-gray-200 box-shadow: 0px 1px 2px 0px #0000000D overflow-hidden">

                        <div className="px-5 py-5 border-b border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-900">
                                Detailed Terms Comparison
                            </h3>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[900px] border-collapse">

                                <thead>
                                    <tr className="bg-[#334155] text-white">

                                        <th className="sticky left-0 z-10 bg-[#1E293B] min-w-[280px] px-5 py-3 text-left text-sm font-medium uppercase tracking-wide">
                                            Term Category & Details
                                        </th>

                                        {termSheetViewData.TermSheetDetailsData.map(
                                            (b) => (
                                                <th key={b.TermSheetDetailsId}
                                                    className="min-w-[250px] px-5 py-3 text-center text-sm font-medium uppercase tracking-wide">
                                                    {b.NameOfInstitutionBankNBFC}
                                                </th>
                                            )
                                        )}

                                    </tr>
                                </thead>

                                <tbody>

                                    {comparisonSections.map((section) => (
                                        <Fragment key={section.title}>

                                            <tr>
                                                <td className="sticky left-0 z-30 bg-[#F8FAFC]  px-5 py-2.5 border-b border-gray-200  text-xs font-semibold  text-[#64748B] uppercase tracking-wide whitespace-nowrap">
                                                    {section.title}
                                                </td>

                                                {termSheetViewData.TermSheetDetailsData.map((b) => (
                                                    <td key={b.TermSheetDetailsId} className="bg-[#F8FAFC] border-b border-gray-200" />
                                                ))}
                                            </tr>

                                            {section.rows.map((row) => (
                                                <tr key={row.label} className="border-b border-gray-100" >
                                                    <td className="sticky left-0 bg-white z-10 px-5 py-4 text-sm font-medium text-gray-700">
                                                        {row.label}
                                                    </td>
                                                    {termSheetViewData.TermSheetDetailsData.map((b) => (

                                                        <td key={`${b.TermSheetDetailsId}-${row.label}`} className="px-5 py-4 text-center text-sm text-gray-700">

                                                            {row.type === "Document" ? (

                                                                b.TermSheetURL ? (
                                                                    <div className="flex justify-center">
                                                                        <div className="inline-flex items-center gap-2 px-3 py-2 border border-blue-500 text-blue-600 rounded-md text-sm font-medium hover:bg-blue-50 transition">

                                                                            <span>Term Sheet</span>

                                                                            <MultiImageViewer
                                                                                images={parseDocumentUrls(b.TermSheetURL)}
                                                                                title={`Term Sheet - ${b.NameOfInstitutionBankNBFC ?? ""}`}
                                                                                isIcon={false}
                                                                                triggerLabel="Document"
                                                                            />

                                                                        </div>
                                                                    </div>
                                                                ) : (
                                                                    <span className="text-gray-400">
                                                                        No Document
                                                                    </span>
                                                                )
                                                            ) : row.type === "Approval" ? (

                                                                <div className="flex justify-center">
                                                                    <ApprovalActions
                                                                        approvalStatus={b.ApprovalStatus || "-"}
                                                                        showApproval={b.IsApproval}
                                                                        isIcons={true}
                                                                        onHistory={() => handleApprovalLog(b)}
                                                                        onApprove={() => handleApproveRejectDocument(b, "approve")}
                                                                        onReject={() => handleApproveRejectDocument(b, "reject")}
                                                                    />
                                                                </div>
                                                            ) : (
                                                                row.getValue(b)
                                                            )}
                                                        </td>
                                                    ))}

                                                </tr>
                                            ))}
                                        </Fragment>
                                    ))}

                                </tbody>

                            </table>
                        </div>
                    </section>


                ) : (
                    <section className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                        <NoDataView message="No Term Sheet Details Found" />
                    </section>
                )}


                {isAnyInstitutionApproved && (
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
                            disabled={isLoading}>
                            Final Approval
                        </Button>
                    </div>
                )}
            </div>

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

            <DeleteDialog
                isOpen={isConfirmationDialogBoxOpen}
                onClose={() => {
                    setIsConfirmationDialogBoxOpen(false);
                    setFinalizeTermSheetDetailsData(null);
                }}
                onConfirm={handleSubmitFinalizeTermSheetDetails}
                loading={isLoading}
                pageName="Final Approval"
                variant="generate"
                title="Final Approval Confirmation"
                message="Are you sure you want to give Final Approval?"
                confirmText="Final Approved"
            />
        </div>
    );
};

export default CompareTermSheet;
