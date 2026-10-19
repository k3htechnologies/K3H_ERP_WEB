import { useCallback, useEffect, useMemo, useState } from "react";
import type { CostToCompanyData, FilterWithPaginationCostToCompanyRequest } from "../models/CostToCompanyModel";
import useToast from "@/core/hooks/useToast";
import usePagination from "@/core/hooks/usePagination";
import { DataTable, type FilterInfo, type PaginationInfo, type SortInfo, type TableColumn } from "@/ui/components/DataTable/DataTable";
import { runApiWithLoader } from "@/core/utils";
import { getSortByParam } from "@/core/constants/sortingColumnDetails";
import { CostToCompanyService } from "../services/CostToCompanyService";
import * as E from "fp-ts/Either";
import { Loader } from "@/core/utils/loader";
import TableActionToolbar from "@/ui/components/TableAction/TableActionToolbar";
import { useMenuPermissions } from "@/features/menu/hooks/useMenuPermissions";
import { useNavigate } from "react-router-dom";
import { formatDate_dd_MonthName_yy } from "@/core/utils/dateFormat";
import { formatCurrency } from "@/core/utils/comman";
import { useCostToCompanyListState } from "../context/CostToCompanyListStateContext";
import TooltipText from "@/ui/components/Tooltip/TooltipText";

export const CostToCompany: React.FC = () => {

    const [costToCompanyList, setCostToCompanyList] = useState<CostToCompanyData[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState("");
    const { addToast } = useToast();
    const { pagination, setPagination } = usePagination(20);
    const navigate = useNavigate();
    const { canAction } = useMenuPermissions();
    const { listState, updateListState, resetFilters, clearLitigationContext } = useCostToCompanyListState();

    useEffect(() => {
        loadCostToCompanyData(1, {});
    }, []);

    const loadCostToCompanyData = async (page: number = pagination.currentPage, filterParams: FilterInfo, sort?: SortInfo, searchText?: string,) => {
        runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {
                const params: FilterWithPaginationCostToCompanyRequest = {
                    PageNumber: page,
                    PageSize: pagination.pageSize,
                    CostToCompanyId: filterParams.CostToCompanyId ? Number(filterParams.CostToCompanyId) : undefined,
                    IsCheckPermission: false,
                    EmployeeName: searchText ?? filterParams.EmployeeName ?? undefined,
                    SortBy: getSortByParam(sort ?? null, CostToCompanyColumns),
                }

                const response = await CostToCompanyService.apiCallPullCostToCompany(params);

                if (E.isRight(response)) {

                    setCostToCompanyList(response.right.Data);

                    setPagination({
                        currentPage: page,
                        totalRecords: response.right.TotalNumberOfRecord,
                        totalPages: Math.ceil(response.right.TotalNumberOfRecord / pagination.pageSize),
                    });
                } else {
                    addToast({ type: 'error', title: response.left.message });
                }
            },
            undefined,
            (error: any) =>
                addToast({ type: "error", title: error.message }),
            undefined,
            "Loading Cost To Company "
        )
    }

    const handleViewCostToCompany = useCallback((row: CostToCompanyData) => {
        updateListState({
            CostToCompanyId: row.CostToCompanyId ?? 0,
            EmployeeName: row.EmployeeName ?? ""
        })
        navigate("/costToCompany/view")
    }, [navigate, updateListState])

    const CostToCompanyColumns = useMemo<TableColumn[]>(() => [
        {
            key: 'EmployeeName',
            label: 'Employee',
            width: '15',
            sortable: false,
            fixed: 'left',
            align: 'left',
            render: (value, row) => (
                <TooltipText
                    text={value || "-"}
                    maxWidth="250px"
                    tooltipThreshold={25}
                    onClick={() => handleViewCostToCompany(row)}
                />
            ),
        },
        {
            key: 'AnnualCTC',
            label: 'Annual CTC (₹)',
            width: '15',
            sortable: false,
            fixed: 'left',
            align: 'left',
            render: value => value ? formatCurrency(value) : '0'
        },
        {
            key: 'MonthlyCTC',
            label: 'Monthly CTC (₹)',
            width: '15',
            sortable: false,
            fixed: 'left',
            align: 'left',
            render: value => value ? formatCurrency(value) : '0'
        },
        {
            key: 'EffectiveFromDate',
            label: 'Effective From Date',
            width: '15',
            sortable: false,
            align: 'left',
            render: (value?: string) =>
                value ? formatDate_dd_MonthName_yy(value) : "-",
        },
        {
            key: 'EffectiveToDate',
            label: 'Effective To Date',
            width: '15',
            sortable: false,
            align: 'left',
            render: (value?: string) =>
                value ? formatDate_dd_MonthName_yy(value) : "-",
        },
    ], [])

    const handleAddUpdateCostToCompanyModal = () => {
        navigate("/costToCompany/add")
    }

    const handlePageChange = (page: number) => {
        setPagination({ currentPage: page });
        loadCostToCompanyData(page, {});
    };

    const CostToCompanyPaginationInfo: PaginationInfo = useMemo(
        () => ({
            currentPage: pagination.currentPage,
            totalPages: pagination.totalPages,
            totalRecords: pagination.totalRecords,
            pageSize: pagination.pageSize,
            onPageChange: handlePageChange
        }),
        [pagination, handlePageChange]
    )
    const CostToCompanyForTable = useMemo(() => costToCompanyList, [costToCompanyList]);

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
            <Loader loading={isLoading} title={loadingMessage}> <div /></Loader>

            <TableActionToolbar
                isShowAddButton={canAction}
                addTitle="Add"
                onAdd={handleAddUpdateCostToCompanyModal}
            />

            <DataTable
                columns={CostToCompanyColumns}
                data={CostToCompanyForTable}
                pagination={CostToCompanyPaginationInfo}
                emptyMessage="No Cost To Company Data found"
            />

        </div>
    )
}
export default CostToCompany;