import { runApiWithLoader } from "@/core/utils";
import { Loader } from "@/core/utils/loader";
import { useMenuPermissions } from "@/features/menu/hooks/useMenuPermissions";
import TableActionToolbar from "@/ui/components/TableAction/TableActionToolbar";
import { useCallback, useEffect, useState } from "react";
import type { AddUpdateTaxTrackerRequest, FilterWithPaginationTaxTrackerRequest, TaxTrackerData } from "../models/TaxTrackerModel";
import usePagination from "@/core/hooks/usePagination";
import { useTaxTrackerListState } from "../context/TaxTrackerListStateContext";
import { taxTrackerService } from "../services/TaxTrackerService";
import { handleExportFile } from "@/core/utils/exportFile";
import useToast from "@/core/hooks/useToast";
import SingleSelectDropdownWithPagination from "@/ui/components/DropDown/SingleSelectDropdownWithPagination";
import { fetchCompanyMasterDropdown } from "@/features/companyMaster/companyMasterDropDown";
import { createDropdownInitialValue } from "@/core/utils/createDropdownInitialValue";
import { FINANCIAL_YEAR_OPTIONS } from "@/core/constants";
import { SinglePageSelection } from "@/ui/components/DropDown/SinglePageSelection";
import type { FilterInfo } from "@/ui/components/DataTable/DataTable";
import * as E from 'fp-ts/Either';
import { FieldItem } from "@/ui/components/forms/FieldItem";
import { formatDate_dd_mm_yyyy } from "@/core/utils/dateFormat";
import { useNavigate, useParams } from "react-router-dom";

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
});

export const TaxTracker: React.FC = () => {

    const [taxTrackerList, setTaxTrackerList] = useState<TaxTrackerData[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState("");
    const navigate = useNavigate();

    const { canAction, canExport } = useMenuPermissions();
    const { pagination, setPagination } = usePagination(20);
    const [errors, setErrors] = useState<{ [k: string]: string }>({});
    const { listState, updateListState } = useTaxTrackerListState();
    const { filters, page } = listState;
    const { addToast } = useToast();

    const { TaxTrackerId } = useParams<{ TaxTrackerId?: string }>();
    const taxTrackerId = TaxTrackerId ? Number(TaxTrackerId) : 0;
    console.log(taxTrackerId, "taxTrackerId");

    // Restore dropdown labels and formData from persisted context (survives back navigation)
    const [dropdownLabels, setDropdownLabels] = useState<{ companyName?: string; }>(() => ({
        companyName: listState.CompanyName || undefined,
    }));
    const [formData, setFormData] = useState<AddUpdateTaxTrackerRequest>(() => ({
        ...initialFormState(),
        CompanyId: listState.CompanyId || 0,
        CompanyName: listState.CompanyName || null,
        FinancialYear: listState.FinancialYear || '',
    }));

    useEffect(() => {
        loadTaxTrackerList(page, filters);
    }, [page, filters]);

    const handleViewTaxTracker = useCallback((item: TaxTrackerData) => {
        updateListState({ TaxTrackerId: item.TaxTrackerId ?? 0, NoticeType: item.NoticeType ?? "", CompanyName: item.CompanyName ?? "", FinancialYear: item.FinancialYear ?? "" });
        navigate('/taxTracker/view');
    }, [navigate, updateListState],);


    const handleAddTaxTracker = useCallback(() => {
        navigate("/taxTracker/add/");
    }, [navigate]);


    const loadTaxTrackerList = async (page: number, filterParams: FilterInfo) => {
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {

                const params: FilterWithPaginationTaxTrackerRequest = {
                    PageNumber: page,
                    PageSize: pagination.pageSize,
                    GovernmentCompliance: filterParams.GovernmentCompliance ?? undefined,
                    CompanyId: filterParams.CompanyId
                        ? Number(filterParams.CompanyId)
                        : 0,
                    CompanyName: filterParams.CompanyName ?? undefined,
                    NoticeSection: filterParams.NoticeSection ?? undefined,
                    FinancialYear: filterParams.FinancialYear ?? undefined,
                    NoticeStatus: filterParams.NoticeStatus ?? undefined,

                }

                const response = await taxTrackerService.apiCallPullTaxTracker(params);

                if (E.isRight(response)) {
                    setTaxTrackerList(response.right.Data || []);
                    setPagination({
                        currentPage: page,
                        totalRecords: response.right.TotalNumberOfRecord,
                        totalPages: Math.ceil(response.right.TotalNumberOfRecord / pagination.pageSize)
                    });

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
            'Loading Tax Tracker Data'
        );
    };

    const handleExportTaxTracker = async (exportType: 'Excel' | 'PDF') => {

        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {
                const params: FilterWithPaginationTaxTrackerRequest = {
                    PageNumber: 1,
                    PageSize: pagination.totalRecords,
                    GovernmentCompliance: filters.GovernmentCompliance || undefined,
                    CompanyName: filters.CompanyName ?? undefined,
                    NoticeSection: filters.NoticeSection || "",
                    FinancialYear: filters.FinancialYear || undefined,
                    NoticeStatus: filters.NoticeStatus || undefined,
                    FromNoticeDate: filters.FromNoticeDate || null,
                    ToNoticeDate: filters.ToNoticeDate || null,
                    ExportType: exportType,
                };

                const response = await taxTrackerService.apiCallPullTaxTracker(params);

                handleExportFile(response, exportType, "Tax Tracker", addToast);

                return response;
            },
            undefined,
            (error: any) =>
                addToast({ type: "error", title: error.message || "Export failed" }),
            undefined,
            "Preparing Export",
        );
    }

    const handleExportTaxTrackerExcel = () => handleExportTaxTracker("Excel");
    const handleExportTaxTrackerPdf = () => handleExportTaxTracker("PDF");

    const handleFieldChange = (field: keyof AddUpdateTaxTrackerRequest, value: any) => {
        setFormData((prev) => ({ ...prev, [field]: value }));

        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: "" }));
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">

            <Loader loading={isLoading} title={loadingMessage}>
                {" "}
                <div></div>{" "}
            </Loader>

            <div className="flex items-end justify-between gap-4 w-full">

                <div className="flex gap-3 flex-1">
                    <div className="w-full">
                        <SingleSelectDropdownWithPagination
                            label="Company"
                            title="Select Company"
                            size="lg"
                            dataFetchCallBack={fetchCompanyMasterDropdown}
                            onSelected={(item) => {
                                console.log('iTEM', item?.label);
                                const companyId = item ? Number(item.value) : 0;
                                const companyName = item?.label || "";
                                console.log('cOMPANY', companyName);

                                handleFieldChange("CompanyId", companyId);

                                setDropdownLabels((prev) => ({
                                    ...prev,
                                    companyName: companyName,
                                }));

                                updateListState({
                                    page: 1,
                                    CompanyId: companyId,
                                    CompanyName: companyName,
                                    filters: {
                                        ...listState.filters,
                                        CompanyId: String(companyId),
                                        CompanyName: companyName,
                                    },
                                });
                            }}
                            initialValue={createDropdownInitialValue(
                                formData.CompanyId,
                                dropdownLabels.companyName
                            )}
                        />
                    </div>

                    <div className="w-full">
                        <SinglePageSelection
                            label="Financial Year"
                            placeholder="Select Financial Year"
                            value={formData.FinancialYear}
                            onChange={(e) => {
                                const year = String(e);

                                handleFieldChange("FinancialYear", year);

                                updateListState({
                                    page: 1,
                                    FinancialYear: year,
                                    filters: {
                                        ...listState.filters,
                                        FinancialYear: year,
                                    },
                                });
                            }}
                            options={FINANCIAL_YEAR_OPTIONS.map((opt) => ({
                                label: opt.name,
                                value: opt.id,
                            }))}
                        />
                    </div>
                </div>

                <TableActionToolbar
                    isShowSearchBar={false}
                    isShowFilterButton={false}
                    isShowAddButton={canAction}
                    addTitle="Add"
                    onAdd={handleAddTaxTracker}
                    isShowImportButton={false}
                    isShowExportButton={canExport}
                    onExportExcel={handleExportTaxTrackerExcel}
                    onExportPdf={handleExportTaxTrackerPdf}
                    exportLoading={isLoading}
                />
            </div>

            <div >
                {taxTrackerList.length > 0 ? (
                    taxTrackerList.map((item, index) => (
                        <div key={index} className="mt-6">
                            <section className="bg-white rounded-xl shadow-sm p-6 border-[0.1px] border-[#3333334f]">
                                <div className="grid grid-cols-6 gap-6">
                                    <span className="col-span-6 text-base text-[#05194c] font-semibold cursor-pointer" onClick={() => handleViewTaxTracker(item)}>Tax Tracker ID : {item.TaxTrackerId}</span>
                                    <FieldItem label="Government Compliance" value={item?.GovernmentCompliance || '-'} />
                                    <FieldItem label="Notice Type" value={item?.NoticeType || '-'} />
                                    <FieldItem label="Authority" value={item?.Authority || '-'} />
                                    <FieldItem label="Notice U/S" value={item?.NoticeSection || '-'} />
                                    <FieldItem label="Notice Date" value={item?.NoticeDate ? formatDate_dd_mm_yyyy(item.NoticeDate) : '-'} />
                                    <FieldItem label="Notice Status" value={item?.NoticeStatus || '-'} />
                                    <FieldItem label="Due Date" value={item?.DueDate ? formatDate_dd_mm_yyyy(item.DueDate) : '-'} />
                                    <FieldItem label="Company Name" value={item?.CompanyName || '-'} />
                                </div>
                            </section>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-8">
                        <p className="text-gray-500 text-lg">No Data Available</p>
                    </div>
                )}
            </div>
        </div>
    )
}

export default TaxTracker;