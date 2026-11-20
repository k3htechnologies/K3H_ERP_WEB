import useToast from "@/core/hooks/useToast";
import { runApiWithLoader } from "@/core/utils";
import type { CompanyMasterData, CompanyMasterWithBankDetails, FilterWithPaginationCompanyMasterRequest } from "@/features/companyMaster/models/CompanyMasterModel";
import { companyMasterService } from "@/features/companyMaster/services/CompanyMasterService";
import { useCallback, useEffect, useMemo, useState } from "react";
import * as E from 'fp-ts/Either';
import { DataTable, type FilterInfo, type PaginationInfo, type SortInfo, type TableColumn } from "@/ui/components/DataTable/DataTable";
import { Loader } from "@/core/utils/loader";
import { FieldItem } from "@/ui/components/forms/FieldItem";
import TooltipText from "@/ui/components/Tooltip/TooltipText";
import usePagination from "@/core/hooks/usePagination";
import { getSortByParam } from "@/core/constants/sortingColumnDetails";
import TableActionToolbar from "@/ui/components/TableAction/TableActionToolbar";
import { useNavigate } from "react-router-dom";
import { useCompanyListState } from "@/features/companyMaster/context/CompanyListStateContext";

export const CompanyBankDetails: React.FC = () => {

    const [companyBankList, setCompanyBankList] = useState<CompanyMasterData[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const { addToast } = useToast();
    const { pagination, setPagination } = usePagination(20);
    const [sortInfo, setSortInfo] = useState<SortInfo>();
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();
    const { updateListState } = useCompanyListState();

    useEffect(() => {
        loadCompanyMasterWithBankDetails(1, {}, sortInfo, searchTerm);
    }, []);

    const loadCompanyMasterWithBankDetails = async (page: number, filterParams: FilterInfo, sortInfo?: SortInfo, searchText?: string) => {
        runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {
                const params: FilterWithPaginationCompanyMasterRequest = {
                    PageNumber: page,
                    PageSize: pagination.pageSize,
                    CompanyId: filterParams.CompanyId ? Number(filterParams.CompanyId) : undefined,
                    CompanyName: searchText ?? filterParams.CompanyName,
                    IsDisplayBankDetails: true,
                    IsCheckPermission: true,
                    SortBy: getSortByParam(sortInfo ?? null, CompanyBankDetailsColumns)
                }

                const response = await companyMasterService.apiCallPullCompanyMaster(params);

                if (E.isLeft(response)) {
                    addToast({ type: "error", title: response.left.message });
                    return;
                }

                const data = response.right.Data ?? [];

                const companyList = data.map((item) => ({
                    ...item,
                    id: item.CompanyId,
                    BankCount: item.CompanyWithBankDetailsData?.length ?? 0,
                    BankDetails: item.CompanyWithBankDetailsData ?? [],
                }));

                setCompanyBankList(companyList);
                setPagination({
                    currentPage: page,
                    totalRecords: response.right.TotalNumberOfRecord,
                    totalPages: Math.ceil(response.right.TotalNumberOfRecord / pagination.pageSize),
                });
            },
            undefined,
            (error: any) => addToast({ type: 'error', title: error.message }),
            undefined,
            'Loading Company Bank Details'
        );
    };

    const handleViewCompanyDetails = useCallback((row: CompanyMasterData) => {
        updateListState({ companyId: row.CompanyId, companyName: row.CompanyName });
        navigate('/companyMaster/view');
    }, [navigate, updateListState]);

    const BankCount = useCallback((row: any) => {
        return row.BankDetails?.length ?? 0;
    }, []);

    const CompanyBankDetailsColumns = useMemo<TableColumn[]>(
        () => [
            {
                key: "CompanyName",
                label: "Company Name",
                fixed: "left",
                width: "350px",
                sortable: true,
                render: (value, row) => (
                    <div>
                        <TooltipText
                            text={value || '-'}
                            maxWidth="250px"
                            tooltipThreshold={30}
                            onClick={() => handleViewCompanyDetails(row)}
                        />

                        <div className="pt-2 space-y-2">
                            <FieldItem label="FirmsType" value={row?.FirmsType ?? '-'} isRow={true} isUsedForInventoryFlat />
                            <FieldItem label="PAN Number" value={row?.PANNumber ?? '-'} urls={row?.PanCardURL} isRow={true} isIcon isUsedForInventoryFlat />
                            <FieldItem label="GST Number" value={row?.GSTNumber ?? '-'} urls={row?.GSTCertificateURL} isRow={true} isIcon isUsedForInventoryFlat />
                            <FieldItem label="CIN Number" value={row?.CINNumber ?? '-'} urls={row?.CINURL} isRow isIcon isUsedForInventoryFlat />
                            <FieldItem label="TAN Number" value={row?.TANNumber ?? '-'} urls={row?.TANURL} isRow isIcon isUsedForInventoryFlat />
                        </div>

                        <div className="mt-2 flex items-center gap-2">
                            <span className="inline-flex items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-[#193B7D]">
                                <span>Bank Count : {row.BankCount ?? 0} </span>
                            </span>
                        </div>
                    </div>
                )
            },
            {
                key: "BankDetailsGroup",
                label: "Bank Details",
                align: "left",
                width: "clamp(350px, 65vw, 1200px)",
                sortable: false,
                render: (_value, row) => {

                    const company = row as {
                        BankDetails?: CompanyMasterWithBankDetails[];
                    };

                    return (
                        <div className="flex w-full flex-nowrap items-start gap-3 overflow-x-visible overflow-y-hidden thin-scroll">
                            {company.BankDetails && company.BankDetails.length > 0 ? (
                                company.BankDetails.map((bank, index) => (
                                    <div
                                        key={bank.CompanyWithBankDetailsId ?? index}
                                        className="my-2 box-border flex w-[min(500px,80vw)] min-w-[280px] shrink-0 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white"
                                    >
                                        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-2 border-b border-slate-200 bg-[#F8FAFC] px-4 py-3">
                                            <h4 className="min-w-0 whitespace-normal break-all font-semibold text-[#193B7D]">
                                                {bank.BankName || "-"}
                                            </h4>


                                            <span
                                                className={`shrink-0 whitespace-nowrap rounded-full border px-2 py-1 text-xs font-medium ${bank.Status?.toLowerCase() === "active"
                                                        ? "bg-emerald-100 text-emerald-700 border-emerald-300"
                                                        : bank.Status?.toLowerCase() === "inactive"
                                                            ? "bg-gray-100 text-gray-600 border-gray-300"
                                                            : "bg-red-100 text-red-700 border-red-300"
                                                    }`}
                                            >
                                                {bank.Status || "-"}
                                            </span>


                                        </div>

                                        <div className="grid flex-1 grid-cols-2 content-start gap-x-3 gap-y-5 bg-white p-3">
                                            <FieldItem
                                                label="Beneficiary Name"
                                                value={
                                                    <TooltipText
                                                        text={bank.BeneficiaryAccountHolderName || "-"}
                                                        maxWidth="180px"
                                                        tooltipThreshold={15}
                                                    />
                                                }
                                            />
                                            <FieldItem label="Account Number" value={bank.AccountNumber || "-"} />
                                            <FieldItem label="Branch" value={bank.Branch || "-"} />
                                            <FieldItem label="IFSC Code" value={bank.IFSCCode || "-"} />
                                            <FieldItem label="Account Type" value={bank.AcType || "-"} />
                                            <FieldItem label="Nature Of Account" value={bank.NatureOfAccount || "-"} />
                                        </div>
                                    </div>
                                ))
                            ) : 
                            (
                               <div className="italic text-gray-500 ml-4">No bank details added</div>
                            )}
                        </div>

                    );
                },
            },
        ], [BankCount]);

    const handleSearch = (value: string) => {
        setSearchTerm(value);
        setPagination({ currentPage: 1 });
        loadCompanyMasterWithBankDetails(1, {}, sortInfo, value);
    }

    const handlClearSearch = () => {
        setSearchTerm("")
        setPagination({ currentPage: 1 })
        loadCompanyMasterWithBankDetails(1, {}, sortInfo, "");
    }

    const handleSortColumn = useCallback((sort: SortInfo) => {
        setSortInfo(sort);
        setPagination({ currentPage: 1 });
        loadCompanyMasterWithBankDetails(1, {}, sort, searchTerm);
    }, []);

    const handlePageChange = (page: number) => {
        setPagination({ currentPage: page });
        loadCompanyMasterWithBankDetails(page, {}, sortInfo, searchTerm);
    };

    const CompanyBankDetailsPaginationInfo: PaginationInfo = useMemo(
        () => ({
            currentPage: pagination.currentPage,
            totalPages: pagination.totalPages,
            totalRecords: pagination.totalRecords,
            pageSize: pagination.pageSize,
            onPageChange: handlePageChange
        }),
        [pagination, handlePageChange]
    )
    const CompanyBankDetailsForTable = useMemo(() => companyBankList, [companyBankList]);

   

    return (
        <div >
            <Loader loading={isLoading} title={loadingMessage} > <div></div> </Loader>

            <TableActionToolbar
                searchPlaceholder="Search By Company Name "
                searchTerm={searchTerm}
                onClearSearch={handlClearSearch}
                onSearchChange={handleSearch}

            />
            <div className="w-full overflow-x-auto thin-scroll">
                <DataTable
                    data={CompanyBankDetailsForTable}
                    columns={CompanyBankDetailsColumns}
                    pagination={CompanyBankDetailsPaginationInfo}
                    emptyMessage="No company Bank Data Found"
                    fixedHeight
                    recordsPerPage={20}
                    className="flex-1"
                    sortInfo={sortInfo}
                    onSort={handleSortColumn}
                />
            </div>
        </div>
    )
}
export default CompanyBankDetails;