import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { usePagination } from '@/core/hooks/usePagination';
import { DataTable, type FilterInfo, type PaginationInfo, type SortInfo, type TableColumn } from '@/ui/components/DataTable/DataTable';
import { runApiWithLoader } from '@/core/utils';
import * as E from 'fp-ts/Either';
import { useToast } from '@/core/hooks/useToast';

import TooltipText from '@/ui/components/Tooltip/TooltipText';
import { Loader } from '@/core/utils/loader';
import { Modal } from '@/ui/components/Modal/Modal';
import { LocalStorageHelper } from '@/core/utils/localStorageHelper';
import { useMenuPermissions } from '@/features/menu/hooks/useMenuPermissions';
import { useDebouncedCallback } from '@/core/hooks/useDebouncedCallback';
import TableActionToolbar from '@/ui/components/TableAction/TableActionToolbar';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button, Input } from '@/ui/components/forms';
import { updateFilter } from '@/core/utils/filterHelper';
import { Trash2 } from 'lucide-react';
import ConfirmationDialogBox from '@/core/utils/confirmationDialogBox';
import type { AddUpdateApprovedBankWithFolderRequest, ApprovedBankWithFolderData, DeleteApprovedBankWithFolderRequest, FilterWithPaginationApprovedBankWithFolderRequest } from '@/features/approvedBank/models/ApprovedBankModel';
import { approvedBankWithFolderService } from '@/features/approvedBank/services/ApprovedBankService';
import { useProject } from '@/features/projectMaster/context/ProjectContext';
import SingleSelectDropdownWithPagination from '@/ui/components/DropDown/SingleSelectDropdownWithPagination';
import { createDropdownInitialValue } from '@/core/utils/createDropdownInitialValue';
import { fetchBankListMasterDropdown } from '@/features/bankListMaster/bankListMasterDropDown';


const initialFormState = (): AddUpdateApprovedBankWithFolderRequest => ({
    ApprovedBankFolderId: 0,
    Uniquekey: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    BankListMasterId: 0,
    ProjectId: 0
});

export const ApprovedBank: React.FC = () => {

    //#region STATE MANAGEMENT
    const [ApprovedBankList, setApprovedBankList] = useState<ApprovedBankWithFolderData[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setIsLoadingMessage] = useState('');

    // USE NAVIGATE
    const navigate = useNavigate();

    // PAGINATION STATE
    const { pagination, setPagination } = usePagination(20);

    //TABLE SORT INFO
    const [sortInfo, setSortInfo] = useState<SortInfo | undefined>();

    const { projectId } = useProject();
    // TOAST
    const { addToast } = useToast();

    // SINGLE SEARCH TEXT BOX
    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearch = useDebouncedCallback((value: string) => {
        searchApprovedBank(value)
    }, 350);

    //FILTER STATES
    const [showFilterPopup, setShowFilterPopup] = useState(false);
    const [filters, setFilters] = useState<FilterInfo>({});
    const [tempFilters, setTempFilters] = useState<FilterInfo>({});

    //DELETE  APPROVED BANK  
    const [isConfirmationDialogBoxOpen, setIsConfirmationDialogBoxOpen] = useState(false)
    const [deleteApprovedBankData, setDeleteApprovedBankData] = useState<ApprovedBankWithFolderData | null>(null)

    //ERROR SET UP
    const [errors, setErrors] = useState<{ [k: string]: string }>({});

    // EDIT APPROVED BANK 
    const [editingApprovedBankData, setEditingApprovedBankData] = useState<ApprovedBankWithFolderData | null>(null);
    const [isAddUpdateModalOpen, setIsAddUpdateModalOpen] = useState(false);

    //ADD UPDATE APPROVED BANK 
    const [formData, setFormData] = useState<AddUpdateApprovedBankWithFolderRequest>(() => initialFormState());

    //DROP DOWN RESET KEY
    const [dropdownResetKey, setDropdownResetKey] = useState(0);

    const [dropdownLabels, setDropdownLabels] = useState<{
        bankName?: string;
    }>({});
    //#endregion

    //#region MENU PERMISSIONS
    const { canAction } = useMenuPermissions();
    //#endregion

    const location = useLocation() as any;
    //#endregion

    //#region INIT
    useEffect(() => {
        const incoming = location.state?.listState;
        const listState = incoming ?? {
            page: 1, filters: {} as FilterInfo, sortInfo: undefined, searchTerm: ''
        };

        setPagination({ currentPage: listState.page ?? pagination.currentPage });

        setSortInfo(listState.sortInfo);

        setFilters(listState.filters ?? {});

        setTempFilters(listState.filters ?? {});

        setSearchTerm(listState.searchTerm ?? '');

        if (listState.searchTerm && String(listState.searchTerm).trim()) {
            loadApprovedBank(listState.page ?? 1, { BankName: String(listState.searchTerm).trim() });
            return;
        }

        loadApprovedBank(listState.page ?? 1, listState.filters ?? {});
    }, [location.state]);

    //#region CLEANUP PENDING DEBOUNCED CALLBACK ON UNMOUNT
    useEffect(() => {
        return () => {
            debouncedSearch.cancel?.()
        }
    }, [debouncedSearch])
    //#endregion

    //#region DATA LOADING | FETCH |  LOAD | SEARCH 
    const fetchApprovedBankList = async (page: number = pagination.currentPage, sort?: SortInfo) => {
        return await loadApprovedBank(page, filters, sort);
    }

    const loadApprovedBank = async (page: number, filterParams: FilterInfo, sortInfo?: SortInfo) => {
        await runApiWithLoader(
            setIsLoading,
            setIsLoadingMessage,
            async () => {
                let sortByParam = undefined;

                if (sortInfo) {

                    const column = ApprovedBankColumns.find(col => col.key === sortInfo.column);
                    if (column) {
                        sortByParam = `${column.label} ${sortInfo.direction.toUpperCase()}`;
                    }
                }
                const params: FilterWithPaginationApprovedBankWithFolderRequest = {
                    PageNumber: page,
                    PageSize: pagination.pageSize,
                    ProjectId: Number(projectId),
                    ApprovedBankFolderId: filterParams.ApprovedBankFolderId ? Number(filterParams.ApprovedBankFolderId) : undefined,
                    BankName: filterParams.BankName?.trim() || undefined,
                    SortBy: sortByParam
                };

                const response = await approvedBankWithFolderService.apiCallPullApprovedBankWithFolder(params);
                if (E.isRight(response)) {

                    setApprovedBankList(response.right.Data);
                    setPagination({
                        currentPage: page,
                        totalRecords: response.right.TotalNumberOfRecord,
                        totalPages: Math.ceil(response.right.TotalNumberOfRecord / pagination.pageSize),
                    });

                } else {
                    addToast({ type: 'error', title: response.left.message });
                    return response;
                }
            },
            undefined,
            (error: any) => addToast({ type: 'error', title: error.message }),
            undefined,
            'Loading Approved Bank'
        );
    };
    //#endregion

    //#region INIT
    useEffect(() => {
        if (!projectId) return;

    }, [projectId])
    //#region SEARCH & CLEAR
    const searchApprovedBank = async (searchValue: string) => {

        setSearchTerm(searchValue);

        if (searchValue.trim() === '') {

            fetchApprovedBankList();
            return
        }
        const filterParams: FilterInfo = {
            BankName: searchValue.trim(),
        };
        await loadApprovedBank(1, filterParams);
    };
    //#endregion

    //#region CLEAR 
    const clearSearchApprovedBank = () => {
        setSearchTerm('');

        debouncedSearch.cancel?.();
        setFilters({});
        setTempFilters({});
        setPagination({ currentPage: 1 });
        loadApprovedBank(1, {});
        try {
            navigate(location.pathname, { replace: true, state: {} });
        } catch {
        }
    };
    //#endregion

    //#region HANDLE PAGE CHNAGE EVENT
    const handlePageChange = useCallback((page: number) => {
        fetchApprovedBankList(page);
    }, []);

    //#region TABLE SORT COLUMN
    const handleSortColumn = useCallback((sort: SortInfo) => {

        setSortInfo(sort);
        loadApprovedBank(1, filters, sort);

    }, [filters]);
    //#endregion

    //#region TABLE PAGINATION INFO
    const ApprovedBankPaginationInfo: PaginationInfo = useMemo(
        () => ({
            currentPage: pagination.currentPage,
            totalPages: pagination.totalPages,
            totalRecords: pagination.totalRecords,
            pageSize: pagination.pageSize,
            onPageChange: handlePageChange
        }),
        [pagination, handlePageChange]
    );
    const ApprovedBankForTable = useMemo(() => ApprovedBankList, [ApprovedBankList]);
    //#endregion

    //#region NAVIGATE TO  VIEW ApprovedBank
    const handleNavigateToView = (row: ApprovedBankWithFolderData) => {
        navigate('/approvedBank/view', {
            state: {
                ApprovedBankData: row,
                listState: {
                    page: pagination.currentPage,
                    filters,
                    sortInfo,
                    searchTerm,
                    BankName: row.BankName
                }
            }
        });
    };
    //#endregion

    //#region CONFIRMATION DIALOG BOX
    const handleConfirmationDialogBoxOpen = useCallback((row: ApprovedBankWithFolderData) => {
        setDeleteApprovedBankData(row)
        setIsConfirmationDialogBoxOpen(true)
    }, [])
    //#endregion

    //#region TABLE COLUMNS
    const ApprovedBankColumns = useMemo<TableColumn[]>(() => [
        {
            key: 'BankName',
            label: 'Bank Name',
            width: '20',
            sortable: true,
            fixed: 'left',
            align: 'left',
            render: (value, row) => (
                <TooltipText
                    text={value || 'N/A'}
                    maxWidth="250px"
                    tooltipThreshold={25}
                    onClick={() => handleNavigateToView(row)}
                />
            )
        },
        {
            key: 'actions',
            label: 'Actions',
            width: '12',
            fixed: 'right',
            align: 'center',
            render: (_value, row) => (
                canAction ? (
                    <div className="flex items-center justify-center gap-2">

                        <Button
                            onClick={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                handleConfirmationDialogBoxOpen(row)
                            }}
                            color='transparent'
                            isborderRadius
                            size='sm'
                            style={{
                                color: 'red',
                                padding: '4px 8px'
                            }}
                            title="Delete Approved Bank"
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                ) : null
            )
        }

    ], [handleNavigateToView, handleConfirmationDialogBoxOpen]);

    //#endregion

    //#region COLUMN CUSTOMIZATION
    const requiredApprovedBankColumnKeys: string[] = ['BankName'];

    const allApprovedBankColumnKeys: string[] = ApprovedBankColumns.map(c => c.key);

    const [selectedApprovedBankColumnKeys, setSelectedApprovedBankColumnKeys] = useState<string[]>(() => {
        try {

            const saved = LocalStorageHelper.getApprovedBankTableColumns?.();

            if (saved) {
                
                const parsed = JSON.parse(saved) as string[]
                const withRequired = Array.from(new Set([...parsed, ...requiredApprovedBankColumnKeys]));

                return withRequired.filter(k => allApprovedBankColumnKeys.includes(k));
            }
        } catch { }
        return allApprovedBankColumnKeys;
    });

    useEffect(() => {
        setSelectedApprovedBankColumnKeys(prev => Array.from(new Set([...prev, ...requiredApprovedBankColumnKeys])).filter(k => allApprovedBankColumnKeys.includes(k)));
    }, [ApprovedBankColumns.length])

    const visibleApprovedBankColumns = useMemo(
        () => ApprovedBankColumns.filter(col => selectedApprovedBankColumnKeys.includes(col.key)),
        [ApprovedBankColumns, selectedApprovedBankColumnKeys]
    );
    //#endregion

    //#region FILTER MODAL HELPERS
    const applyFilters = () => {
        setFilters(tempFilters);

        loadApprovedBank(1, tempFilters);

        setShowFilterPopup(false);
    };
    //#endregion

    //#region CLEAR FILTER
    const clearFilters = () => {
        setTempFilters({});
        setFilters({});

        // reset page
        setPagination({ currentPage: 1 });

        // load empty filters
        loadApprovedBank(1, {});

        setShowFilterPopup(false);
        navigate(location.pathname, { replace: true, state: {} });

    };
    //#endregion

    //#region HANDLE FILTER CHNAGE
    const handleFilterChange = (key: string, value: string) => {
        setTempFilters(prev => updateFilter(prev, key, value));
    }
    //#endregion

    //#region INITIALIZATION
    const hasFetchedInitialBranchAssociations = useRef(false)

    useEffect(() => {

        if (hasFetchedInitialBranchAssociations.current) return

        hasFetchedInitialBranchAssociations.current = true;
        fetchApprovedBankList()
    }, [])

    //CLEANUP PENDING DEBOUNCED CALLBACK ON UNMOUNT
    useEffect(() => {
        return () => {
            debouncedSearch.cancel?.()
        }
    }, [debouncedSearch])

    useEffect(() => {
        if (isAddUpdateModalOpen) {
            if (editingApprovedBankData) {
                setFormData({
                    ApprovedBankFolderId: editingApprovedBankData.ApprovedBankFolderId,
                    Uniquekey: editingApprovedBankData.Uniquekey || initialFormState().Uniquekey,
                    BankListMasterId: editingApprovedBankData.BankListMasterId,
                    ProjectId: Number(projectId)
                });
                setDropdownLabels({
                    bankName: editingApprovedBankData.BankName || "",
                });
            } else {
                setFormData(initialFormState());
            }
            setErrors({});
        }
    }, [isAddUpdateModalOpen, editingApprovedBankData]);
    //#endregion

    const handleFieldChange = (field: keyof AddUpdateApprovedBankWithFolderRequest, value: any) => {

        setFormData((prev) => ({ ...prev, [field]: value }));

        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: "" }));
        }
    };

    // RESET FORM DATA
    const handleResetForm = () => {
        setFormData(initialFormState());
        setDropdownLabels({});
        setErrors({});
        setDropdownResetKey(prev => prev + 1);
    };
    //#endregion

    const handleAddApprovedBank = () => {
        setDeleteApprovedBankData(null);
        setFormData(initialFormState());
        setErrors({});
        setIsAddUpdateModalOpen(true);
    }

    // ============================================================= [VALIDATION FUNCTION] =============================================================================================
    const validateAddApprovedBankForm = (): {

        isValid: boolean
        errors: { [key: string]: string }

    } => {

        const newErrors: { [key: string]: string } = {}
        if (formData.BankListMasterId === 0) {
            newErrors.BankListMasterId = "Bank is required"
        }

        return {
            isValid: Object.keys(newErrors).length === 0,
            errors: newErrors
        }
    }

    //PUSH FORM DATA
    const PushApprovedBankFormData = (): AddUpdateApprovedBankWithFolderRequest => {
        return {

            BankListMasterId: formData.BankListMasterId,
            Uniquekey: formData.Uniquekey,
            ApprovedBankFolderId: formData.ApprovedBankFolderId,
            ProjectId: formData.ProjectId,
        };
    };

    // ADD UPDATE APPROVED BANK
    const handleAddUpdateApprovedBank = async (e: React.FormEvent) => {
        e.preventDefault();

        setErrors({})
        const validation = validateAddApprovedBankForm()

        if (!validation.isValid) {
            setErrors(validation.errors)

            return
        }

        await runApiWithLoader(
            setIsLoading,

            setIsLoadingMessage,
            async () => {

                const payload = PushApprovedBankFormData();

                const response = await approvedBankWithFolderService.apiCallAddUpdateApprovedBankWithFolder(payload);

                if (E.isRight(response)) {

                    setIsAddUpdateModalOpen(false);

                    const isAdd = formData.ApprovedBankFolderId === 0;

                    if (isAdd) {

                        const newRecord = response.right.Data[0] as ApprovedBankWithFolderData
                        setApprovedBankList(prevData => [newRecord, ...prevData]);

                        setPagination({
                            currentPage: pagination.currentPage,
                            totalRecords: pagination.totalRecords + 1,
                            totalPages: Math.ceil((pagination.totalRecords + 1) / pagination.pageSize)
                        });

                        addToast({ type: 'success', title: response.right.SuccessMessage[0] })

                    } else {

                        const updatedRecord = response.right.Data[0] as ApprovedBankWithFolderData;

                        setApprovedBankList(prevData =>
                            prevData.map(item =>
                                item.ApprovedBankFolderId === formData.ApprovedBankFolderId
                                    ? updatedRecord
                                    : item
                            )
                        )

                        addToast({ type: 'success', title: response.right.SuccessMessage[0] })
                    }
                    setEditingApprovedBankData(null);
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
            Number(formData.ApprovedBankFolderId) === 0 ? 'Add' : 'Update'
        )

    };
    //#region  DELETE APPROVED BANK MASTER  EVENT
    const handleDeleteApprovedBank = async () => {

        setIsConfirmationDialogBoxOpen(false);

        if (!deleteApprovedBankData) return;

        await runApiWithLoader(

            setIsLoading,

            setIsLoadingMessage,
            async () => {
                const params: DeleteApprovedBankWithFolderRequest = {

                    ApprovedBankFolderId: deleteApprovedBankData.ApprovedBankFolderId || 0,

                    Uniquekey: deleteApprovedBankData.Uniquekey || "",

                    ProjectId: deleteApprovedBankData.ProjectId || 0
                };

                const response = await approvedBankWithFolderService.apiCallDeleteApprovedBankWithFolder(params);

                if (E.isRight(response)) {

                    setApprovedBankList(prevData => prevData.filter(item => item.ApprovedBankFolderId !== deleteApprovedBankData.ApprovedBankFolderId));

                    setPagination({
                        currentPage: pagination.currentPage,
                        totalRecords: pagination.totalRecords - 1,
                        totalPages: Math.ceil((pagination.totalRecords - 1) / pagination.pageSize)
                    });
                    addToast({ type: 'success', title: response.right.SuccessMessage?.[0] })

                    setIsConfirmationDialogBoxOpen(false);

                    setDeleteApprovedBankData(null);

                } else {

                    addToast({ type: 'error', title: response.left.message });
                    setIsConfirmationDialogBoxOpen(false);

                }
                return response;
            },
            undefined,
            (error: any) => addToast({ type: "error", title: error.message }),
            undefined,
            "Deleting Approved Bank"
        );
    };

    //#endregion

    return (

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">

            {/* // LOADER */}

            <Loader loading={isLoading} title={loadingMessage} > <div></div> </Loader>

            {/* ACTION TOOLBAR */}

            <TableActionToolbar
                isShowSearchBar
                searchTerm={searchTerm}
                searchPlaceholder="Search By Bank Name"
                onSearchChange={v => {
                    setSearchTerm(v);
                    debouncedSearch(v);
                }}
                onClearSearch={clearSearchApprovedBank}
                isShowFilterButton
                filters={filters}
                onOpenFilter={() => {
                    setTempFilters(filters);
                    setShowFilterPopup(true);
                }}
                // ADD
                isShowAddButton={canAction}
                addTitle="Add"
                onAdd={handleAddApprovedBank}
            />

            {/* DATA TABLE ApprovedBank*/}

            <DataTable
                data={ApprovedBankForTable}
                columns={visibleApprovedBankColumns}
                pagination={ApprovedBankPaginationInfo}
                emptyMessage="No Approved Bank Found"
                fixedHeight
                recordsPerPage={20}
                className="flex-1"
                sortInfo={sortInfo}
                onSort={handleSortColumn}
            />

            {/* FILTER MODAL */}

            <Modal
                isOpen={showFilterPopup}
                onClose={() => setShowFilterPopup(false)}
                title="Filter - Approved Bank"
                onSubmit={e => {
                    e.preventDefault();
                    applyFilters();
                }}
                saveText="Apply Filter"
                cancelText="Clear Filter"
                onCancel={() => clearFilters()}
                resetText=''
                size="small-half"
            >
                <div className="space-y-6">
                    <div className="space-y-4">
                        <Input type="text"
                            label='Bank Name'
                            value={tempFilters?.BankName ?? ''}
                            onChange={e => handleFilterChange('BankName', e.target.value)}
                            placeholder="Enter Bank Name" />
                    </div>
                </div>
            </Modal>

            {/* ADD BRANCH ASSOCIATIONS MODAL */}

            <Modal
                isOpen={isAddUpdateModalOpen}
                onClose={() => {
                    setIsAddUpdateModalOpen(false)
                    setEditingApprovedBankData(null)
                    setFormData(initialFormState());
                    setErrors({})
                }}
                onCancel={() => {
                    setIsAddUpdateModalOpen(false)
                    setEditingApprovedBankData(null)
                    setFormData(initialFormState());
                    setErrors({})
                }}
                title={editingApprovedBankData ? 'Update' : 'Add'}
                onSubmit={handleAddUpdateApprovedBank}
                saveText={editingApprovedBankData ? 'Update' : 'Add'}
                resetText='Reset'
                onreset={handleResetForm}
                loading={isLoading}
                size='xl'
            >
                <div className="space-y-10 p-6 bg-blue-100">
                    <div className="space-y-4" >

                        <div>
                            <SingleSelectDropdownWithPagination
                                label="Bank"
                                key={dropdownResetKey}
                                title="Select Bank"
                                size="lg"
                                required
                                dataFetchCallBack={fetchBankListMasterDropdown}
                                onSelected={(item) => handleFieldChange("BankListMasterId", Number(item.value))}
                                initialValue={createDropdownInitialValue(formData.BankListMasterId, dropdownLabels.bankName)}
                                error={errors.BankListMasterId}
                            />
                        </div>
                    </div>
                </div>

            </Modal>
            {/* DELETE CONFIRMATION MODAL */}
            <ConfirmationDialogBox
                isOpen={isConfirmationDialogBoxOpen}
                onClose={() => {
                    setIsConfirmationDialogBoxOpen(false)
                    setDeleteApprovedBankData(null)
                }}
                onConfirm={handleDeleteApprovedBank}
                title="You are about to delete a Approved Bank?"
                message="Deleting this Approved Bank will permanently remove its contents."
                confirmText="Delete"
                cancelText="Cancel"
                loading={isLoading}
                variant="danger"
            />

        </div>
    );
};

export default ApprovedBank;
