import { useEffect, useMemo, useState } from "react"
import type { CostToCompanyData, CostToCompanyDeductionData, CostToCompanyEarningData, FilterWithPaginationCostToCompanyById } from "../models/CostToCompanyModel";
import { useCostToCompanyListState } from "../context/CostToCompanyListStateContext";
import { useNavigate, useParams } from "react-router-dom";
import useToast from "@/core/hooks/useToast";
import { runApiWithLoader } from "@/core/utils";
import { CostToCompanyService } from "../services/CostToCompanyService";
import * as E from "fp-ts/Either";
import { DataTable, type TableColumn } from "@/ui/components/DataTable/DataTable";
import { Loader } from "@/core/utils/loader";
import HeaderActionBar from "@/ui/components/forms/HeaderActionBar";

export const ViewCostToCompany: React.FC = () => {

    const [costToCompanyById, setCostToCompanyById] = useState<CostToCompanyData | null>(null);
    const { addToast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState("");
    const [costToCompanyEarningData, setCostToCompanyEarningData] = useState<CostToCompanyEarningData[]>([]);
    const [costToCompanyDeductionData, setCostToCompanyDeductionData] = useState<CostToCompanyDeductionData[]>([]);

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

                const response = await CostToCompanyService.apiCallPullCostToCompanyById(params);

                if (E.isRight(response)) {

                    const data = response.right.Data;

                    const costToCompany = Array.isArray(data)
                        ? data[0] ?? null
                        : data;

                    setCostToCompanyById(costToCompany);

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

    const CostToCompanyEarningColumns = useMemo<TableColumn[]>(() => [
        {
            key: "EarningName",
            label: "Earning Name",
            width: "20",
            sortable: false,
            align: "left",
            render: value => value || "",
        },
        {
            key: "Appliable",
            label: "Appliable",
            width: "15",
            sortable: false,
            align: "left",
            render: value => value || "",
        },
        {
            key: "Value",
            label: "Value",
            width: "15",
            sortable: false,
            align: "right",
            render: value => value ?? 0,
        },
        {
            key: "MonthlyAmount",
            label: "Monthly Amount",
            width: "15",
            sortable: false,
            align: "right",
            render: value => value ?? 0,
        },
        {
            key: "YearlyAmount",
            label: "Yearly Amount",
            width: "15",
            sortable: false,
            align: "right",
            render: value => value ?? 0,
        },
    ], []);

    const CostToCompanyDeductionColumns = useMemo<TableColumn[]>(() => [
        {
            key: "DeductionName",
            label: "Deduction Name",
            width: "20",
            sortable: false,
            align: "left",
            render: value => value || "",
        },
        {
            key: "Appliable",
            label: "Appliable",
            width: "15",
            sortable: false,
            align: "left",
            render: value => value || "",
        },
        {
            key: "Value",
            label: "Value",
            width: "15",
            sortable: false,
            align: "right",
            render: value => value ?? 0,
        },
        {
            key: "MonthlyAmount",
            label: "Monthly Amount",
            width: "15",
            sortable: false,
            align: "right",
            render: value => value ?? 0,
        },
        {
            key: "YearlyAmount",
            label: "Yearly Amount",
            width: "15",
            sortable: false,
            align: "right",
            render: value => value ?? 0,
        },
    ], []);

    const handleBackToListCostToCompany = () => {
        navigate("/costToCompany");
    };

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
            <Loader loading={isLoading} title={loadingMessage}> <div /></Loader>

            <HeaderActionBar
                titleText={costToCompanyById?.EmployeeName ?? ""}
                cancelText="Cancel"
                onCancel={() => handleBackToListCostToCompany()}
            />

            <div className="flex flex-col gap-4 pt-4">
                <DataTable
                    data={costToCompanyEarningData}
                    columns={CostToCompanyEarningColumns}
                    emptyMessage="No Cost To Company Earning Data Found"
                />

                <DataTable
                    data={costToCompanyDeductionData}
                    columns={CostToCompanyDeductionColumns}
                    emptyMessage="No Cost To Company Deduction Data Found"
                />
            </div>

        </div>
    )
}
export default ViewCostToCompany;