import { useState } from "react";
import Tabs from "@/ui/components/Tab/Tab";
import TableActionToolbar from '@/ui/components/TableAction/TableActionToolbar';
import type { FilterInfo } from '@/ui/components/DataTable/DataTable';
import useDebouncedCallback from '@/core/hooks/useDebouncedCallback';
import ClosingTarget from "@/features/target/components/ClosingTarget";
import SourcingTarget from "@/features/target/components/SourcingTarget";
import { Modal } from "@/ui/components/Modal/Modal";
import DatePickerInput from '@/ui/components/forms/Datepicker';
import ExportImport from '@/ui/components/ExcelImport/ExcelImport';
import { technicalService } from '@/features/technical/services/TechnicalService';
import { handleExportFile } from '@/core/utils/exportFile';
import useToast from "@/core/hooks/useToast";
import { useProject } from "@/features/projectMaster/context/ProjectContext";
import { Loader } from "@/core/utils/loader";
import { runApiWithLoader } from "@/core/utils";
import * as E from 'fp-ts/Either';
import type { FilterPullExcelSample } from "@/features/technical/models/TechnicalModel";

export const Target: React.FC = () => {

    const [searchTerm, setSearchTerm] = useState<string>("");
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState<string>("");
    const [filters, setFilters] = useState<FilterInfo>({});
    const [tempFilters, setTempFilters] = useState<FilterInfo>({});
    const [showFilterPopup, setShowFilterPopup] = useState(false);

    const { projectId } = useProject();
    const { addToast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const [showImportModal, setShowImportModal] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);




    const debouncedSearch = useDebouncedCallback((value: string) => {
        setDebouncedSearchTerm(value);
    }, 350);

    const TargetTabList = [
        { id: 'Sourcing Target', label: 'Sourcing Target' },
        { id: 'Closing Target', label: 'Closing Target' },
    ];

    const [activeTab, setActiveTab] = useState(TargetTabList[0].id);

    const handleFilterChange = (key: string, value: string) => {
        setTempFilters({ ...tempFilters, [key]: value });
    };

    const clearFilters = () => {
        setTempFilters({});
        setFilters({});
    };

    // const applyFilters = () => {
    //     setFilters(tempFilters);
    //     setPagination({ currentPage: 1 });

    //     loadSourcingTarget(1, tempFilters);
    //     setShowFilterPopup(false);
    // };

    const downloadExcelSampleTarget = async () => {
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {
                const tableName =
                    activeTab === 'Closing Target'
                        ? `SALES TARGET CLOSING`
                        : `SALES TARGET SOURCING`;
                const params: FilterPullExcelSample = {
                    TableName: tableName
                }
                const response = await technicalService.apiCallPullExcelSample(params);
                handleExportFile(response, 'Excel', tableName, addToast, 'Sample file download successfully')
                return response;
            },
            undefined,
            (error: any) => {
                addToast({ type: 'error', title: error.message || 'Export failed' })
            },
            undefined,
            'Preparing Downloading'
        )
    };

    const uploadExcel = async (file: File, mergeExisting: string) => {
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {
                const tableName =
                    activeTab === 'Closing Target'
                        ? `SALES TARGET CLOSING`
                        : `SALES TARGET SOURCING`;
                const fd = new FormData();
                fd.append("ExcelFile", file);
                fd.append("IsAllDelete", mergeExisting);
                fd.append("TableName", tableName);
                fd.append("ProjectId", String(projectId));

                const response = await technicalService.apiCallExcelImport(fd);

                if (E.isRight(response)) {
                    addToast({ type: 'success', title: "Excel imported sucessfully" })
                    setRefreshKey(prev => prev + 1);
                } else {
                    addToast({ type: "error", title: response.left.message });
                }

                return response;
            },
            undefined,
            (err: any) => addToast({ type: "error", title: err.message }),
            undefined,
            "Importing Excel"
        );
    };

    //#region CLEAR SERACH Document 
    // const  = () => {
    //     setSearchTerm('');
    //     debouncedSearch.cancel?.();
    //     fetchProjectDocumentList();
    // }
    //#endregion

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <Loader loading={isLoading} title={loadingMessage}><div></div></Loader>

            <TableActionToolbar
                isShowSearchBar
                searchTerm={searchTerm}
                searchPlaceholder="Search by Employee Name"
                onSearchChange={(v) => {
                    setSearchTerm(v);
                    debouncedSearch(v);
                }}
                // onClearSearch={clearsearchDocumnets}

                isShowFilterButton
                filters={filters}
                onOpenFilter={() => {
                    setTempFilters(filters)
                    setShowFilterPopup(true)
                }}

                // Import
                isShowImportButton
                onDownloadSampleExcel={downloadExcelSampleTarget}
                onUploadExcel={() => setShowImportModal(true)}

            />

            {/* Filter Modal for sorting by date */}
            <Modal
                isOpen={showFilterPopup}
                onClose={() => setShowFilterPopup(false)}
                title="Filter - By Date"
                onSubmit={e => {
                    e.preventDefault();
                    // applyFilters();
                }}
                saveText="Apply "
                cancelText="Clear"
                onCancel={() => clearFilters()}
                resetText=""
                size="small-half"
            >

                <div className="space-y-4">
                    <div>
                        <DatePickerInput
                            label='From Date'
                            value={tempFilters.FromDate || ''}
                            onChange={(value) => handleFilterChange('FromDate', value || '')}
                        />
                    </div>
                    <div>
                        <DatePickerInput
                            label='To Date'
                            value={tempFilters.ToDate || ''}
                            onChange={(value) => handleFilterChange('ToDate', value || '')}
                        />
                    </div>
                </div>
            </Modal>

            <div className="pt-3">
                <Tabs
                    tabs={TargetTabList}
                    defaultActive={activeTab}
                    islarge
                    onTabChange={(t) => setActiveTab(t.id)}
                />
            </div>

            {activeTab === 'Closing Target' && <ClosingTarget key={`closing-${refreshKey}`} />}
            {activeTab === 'Sourcing Target' && <SourcingTarget key={`sourcing-${refreshKey}`} />}

            <ExportImport
                open={showImportModal}
                onClose={() => setShowImportModal(false)}
                onUpload={(file, mergeExisting) => {
                    setShowImportModal(false);
                    uploadExcel(file, mergeExisting);
                }}
            />
        </div>
    );
};

export default Target;