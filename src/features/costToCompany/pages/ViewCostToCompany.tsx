import { useEffect, useState } from "react"
import type { CostToCompanyData, CostToCompanyDeductionData, CostToCompanyEarningData, FilterWithPaginationCostToCompanyById } from "@/features/costToCompany/models/CostToCompanyModel";
import { useCostToCompanyListState } from "@/features/costToCompany/context/CostToCompanyListStateContext";
import { useNavigate, useParams } from "react-router-dom";
import useToast from "@/core/hooks/useToast";
import { runApiWithLoader } from "@/core/utils";
import { costToCompanyService } from "@/features/costToCompany/services/CostToCompanyService";
import * as E from "fp-ts/Either";
import { Loader } from "@/core/utils/loader";
import HeaderActionBar from "@/ui/components/forms/HeaderActionBar";
import { formatCurrency } from "@/core/utils/comman";
import { useMenuPermissions } from "@/features/menu/hooks/useMenuPermissions";
import { FieldItem } from "@/ui/components/forms/FieldItem";
import { formatDate_dd_MonthName_yy } from "@/core/utils/dateFormat";
import { handleExportFile } from "@/core/utils/exportFile";
import { Button } from "@/ui/components/forms";
import { Download } from "lucide-react";

export const ViewCostToCompany: React.FC = () => {

    const [costToCompanyData, setCostToCompanyData] = useState<CostToCompanyData | null>(null);
    const { addToast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState("");
    const [costToCompanyEarningData, setCostToCompanyEarningData] = useState<CostToCompanyEarningData[]>([]);
    const [costToCompanyDeductionData, setCostToCompanyDeductionData] = useState<CostToCompanyDeductionData[]>([]);
    const { canAction, canExport } = useMenuPermissions();

    const { CostToCompanyId } = useParams<{ CostToCompanyId?: string }>();
    const { listState } = useCostToCompanyListState();
    const currentCostToCompanyId = CostToCompanyId ? Number(CostToCompanyId) : listState.CostToCompanyId;
    const navigate = useNavigate();

    useEffect(() => {
        if (!currentCostToCompanyId || currentCostToCompanyId === 0) return;

        fetchCostToCompany();
    }, [currentCostToCompanyId, addToast]);

    const fetchCostToCompany = async () => {
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {

                const params: FilterWithPaginationCostToCompanyById = {
                    CostToCompanyId: Number(currentCostToCompanyId),
                };

                const response = await costToCompanyService.apiCallPullCostToCompanyById(params);

                if (E.isRight(response)) {

                    const data = response.right.Data;

                    const costToCompany = Array.isArray(data)
                        ? data[0] ?? null
                        : data;

                    setCostToCompanyData(costToCompany);

                    setCostToCompanyEarningData(
                        costToCompany?.CostToCompanyEarningData ?? []
                    );

                    setCostToCompanyDeductionData(
                        costToCompany?.CostToCompanyDeductionData ?? []
                    );

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
            "Loading Cost To Company",
        );
    };

    const handleBackToListCostToCompany = () => {
        navigate("/costToCompany");
    };

    const totalMonthlyEarnings = costToCompanyEarningData.reduce(
        (total, item) => total + Number(item.MonthlyAmount ?? 0),
        0
    );

    const totalYearlyEarnings = costToCompanyEarningData.reduce(
        (total, item) => total + Number(item.YearlyAmount ?? 0),
        0
    );

    const totalMonthlyDeductions = costToCompanyDeductionData.reduce(
        (total, item) => total + Number(item.MonthlyAmount ?? 0),
        0
    );

    const totalYearlyDeductions = costToCompanyDeductionData.reduce(
        (total, item) => total + Number(item.YearlyAmount ?? 0),
        0
    );

    const handleEditCostToCompany = (row: CostToCompanyData) => {
        navigate(`/costToCompany/add/${row.CostToCompanyId}`, {
            state: {
                fromList: true
            }
        });
    };

    const handleExportCostToCompanyById = async (exportType: 'Excel' | 'PDF') => {
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {
                const params: FilterWithPaginationCostToCompanyById = {
                    CostToCompanyId: Number(currentCostToCompanyId),
                    ExportType: exportType,
                };

                const response = await costToCompanyService.apiCallPullCostToCompanyById(params);

                handleExportFile(response, exportType, "Cost To Company", addToast);

                return response;
            },
            undefined,
            (error: any) =>
                addToast({ type: "error", title: error.message || "Export failed" }),
            undefined,
            "Preparing Export",
        );
    }

    const handleExportCostToCompanyByIdPdf = () => handleExportCostToCompanyById("PDF");

    return (
        <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
            <Loader loading={isLoading} title={loadingMessage}> <div />   </Loader>

            <div className="flex justify-between">
                <HeaderActionBar
                    titleText={costToCompanyData?.EmployeeName ?? ""}
                    cancelText="Cancel"
                    onCancel={handleBackToListCostToCompany}
                    isLoading={false}
                />

                <div className="flex justify-between gap-2">
                    {canAction && (
                        <Button
                            color="blue"
                            size="sm"
                            onClick={() => {
                                if (costToCompanyData) handleEditCostToCompany(costToCompanyData)
                            }}
                        >
                            Edit
                        </Button>
                    )}

                    {canExport && (
                        <Button
                            type="button"
                            size="sm"
                            color="blue"
                            colorMode="gradient_light"
                            leftIcon={<Download className="h-4 w-4" />}
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleExportCostToCompanyByIdPdf();
                            }}
                        >
                            PDF
                        </Button>
                    )}
                </div>

            </div>

            <div className="mt-5 overflow-hidden rounded-sm border border-[#9aafd0] bg-white">

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-x-4 p-4 gap-4">
                    <FieldItem label="Employee Code" value={costToCompanyData?.EmployeeCode} isRow />
                    <FieldItem label="Department" value={costToCompanyData?.Department} isRow />
                     <FieldItem label="Joining Date" value={formatDate_dd_MonthName_yy(costToCompanyData?.JoiningDate ?? "-")} isRow />
                    <FieldItem label="Designation" value={costToCompanyData?.Designation} isRow />
                    <FieldItem label="Pan Card No." value={costToCompanyData?.PanCardNumber} isRow />
                    <FieldItem label="Branch" value={costToCompanyData?.Branch} isRow />
                    <FieldItem label="Bank Name" value={costToCompanyData?.BankName} isRow />
                    <FieldItem label="Account No." value={costToCompanyData?.AccountNo} isRow />
                    <FieldItem label="Monthly" value={formatCurrency(costToCompanyData?.MonthlyCTC)} isRow />
                    <FieldItem label="Annual" value={formatCurrency(costToCompanyData?.AnnualCTC)} isRow />
                    <FieldItem label="From Date" value={formatDate_dd_MonthName_yy(costToCompanyData?.EffectiveFromDate ?? "-")} isRow />
                    <FieldItem label="To Date" value={formatDate_dd_MonthName_yy(costToCompanyData?.EffectiveToDate ?? "-")} isRow />
                    <FieldItem label="Provident Fund" value={costToCompanyData?.IsProvidentFund === true ? "Yes" : "No"} isRow />
                    <FieldItem label="ESIC" value={costToCompanyData?.EmployeesStateInsuranceCorporation === true ? "Yes" : "No"} isRow />
                </div>

                <div className="overflow-hidden">
                    <div className="grid grid-cols-[2fr_1fr_1fr] bg-[#193b7d] text-sm font-semibold text-white">
                        <div className="px-4 py-3">Earning</div>
                        <div className="px-3 py-3">Monthly</div>
                        <div className="px-3 py-3">Yearly</div>
                    </div>

                    <div className="bg-[#f2f7fd] text-sm text-gray-800">
                        {costToCompanyEarningData.length > 0 ? (
                            costToCompanyEarningData.map((item, index) => (
                                <div key={`${item.EarningName}-${index}`}
                                    className="grid grid-cols-[2fr_1fr_1fr] items-center border-b border-[#d5e0ef] last:border-b-0"
                                >
                                    <div className="px-4 py-2">{item.EarningName}</div>

                                    <div className="px-3 py-2">
                                        {formatCurrency(Number(item.MonthlyAmount ?? 0))}
                                    </div>

                                    <div className="px-3 py-2">
                                        {formatCurrency(Number(item.YearlyAmount ?? 0))}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="px-4 py-6 text-center text-gray-500">
                                No earnings found
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-[2fr_1fr_1fr] bg-[#193b7d] text-sm font-semibold text-white">
                        <div className="px-4 py-3">Total Earnings</div>

                        <div className="px-3 py-3">
                            {formatCurrency(totalMonthlyEarnings)}
                        </div>

                        <div className="px-3 py-3">
                            {formatCurrency(totalYearlyEarnings)}
                        </div>
                    </div>
                </div>

                <div className="h-1 border-y border-[#9aafd0] bg-white" />

                <div className="overflow-hidden">
                    <div className="grid grid-cols-[2fr_1fr_1fr] bg-[#193b7d] text-sm font-semibold text-white">
                        <div className="px-4 py-3">Deduction</div>
                        <div className="px-3 py-3">Monthly</div>
                        <div className="px-3 py-3">Yearly</div>
                    </div>

                    <div className=" bg-[#f2f7fd] text-sm text-gray-800">
                        {costToCompanyDeductionData.length > 0 ? (
                            costToCompanyDeductionData.map((item, index) => (
                                <div key={`${item.DeductionName}-${index}`}
                                    className="grid grid-cols-[2fr_1fr_1fr] items-center border-b border-[#d5e0ef] last:border-b-0"
                                >
                                    <div className="px-4 py-2">{item.DeductionName}</div>

                                    <div className="px-3 py-2">
                                        {formatCurrency(Number(item.MonthlyAmount ?? 0))}
                                    </div>

                                    <div className="px-3 py-2">
                                        {formatCurrency(Number(item.YearlyAmount ?? 0))}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="px-4 py-6 text-center text-gray-500">
                                No deductions found
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-[2fr_1fr_1fr] bg-[#193b7d] text-sm font-semibold text-white">
                        <div className="px-4 py-3">Total Deductions</div>

                        <div className="px-3 py-3">
                            {formatCurrency(totalMonthlyDeductions)}
                        </div>

                        <div className="px-3 py-3">
                            {formatCurrency(totalYearlyDeductions)}
                        </div>

                    </div>
                </div>

            </div>

        </div>
    );

}
export default ViewCostToCompany;