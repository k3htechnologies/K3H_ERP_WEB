import { DataTable, type FilterInfo, type PaginationInfo, type SortInfo, type TableColumn } from '@/ui/components/DataTable/DataTable';
import { useCallback, useEffect, useMemo } from 'react';
import { useMenuPermissions } from '@/features/menu/hooks/useMenuPermissions';
import TableActionToolbar from '@/ui/components/TableAction/TableActionToolbar';
import { Modal } from '@/ui/components/Modal/Modal';
import { useState } from 'react';
import { Button, Input } from '@/ui/components/forms';
import MultiFilePicker from '@/ui/components/ImagePicker/MultiFilePicker';
import { useProject } from '@/features/projectMaster/context/ProjectContext';
import usePagination from '@/core/hooks/usePagination';
import { runApiWithLoader } from '@/core/utils';
import type { BankDocumentsPayTrackBookingFilesData, FilterWithPaginationBankDocumentsPayTrackBookingFiles, AddUpdateBankDocumentsPayTrackBookingFilesRequest, DeleteBankDocumentsPayTrackBookingFilesRequest } from "@/features/crmPayTrack/models/BankDocumentsPayTrackBookingFilesModel";
import useToast from '@/core/hooks/useToast';
import { getSortByParam } from '@/core/constants/sortingColumnDetails';
import { bankDocumentPayTrackBookingFilesService } from "@/features/crmPayTrack/services/BankDocumentPayTrackBookingFilesService";
import * as E from 'fp-ts/Either';
import { formatDate_dd_MonthName_yy } from '@/core/utils/dateFormat';
import { Loader } from '@/core/utils/loader';
import { Edit, Trash2 } from 'lucide-react';
import { DeleteDialog } from '@/ui/components/forms/DeleteDialog';
import { MultiImageViewer } from "@/ui/components/ImageViewer/ImageViewer";
import { parseDocumentUrls } from '@/core/utils/documentUtils';
import { usePayTrackBookingListState } from '@/features/crmPayTrack/context/PayTrackBookingListStateContext';
import TooltipText from '@/ui/components/Tooltip/TooltipText';
import useDebouncedCallback from '@/core/hooks/useDebouncedCallback';
import { hasAnyDocumentFile } from '@/core/utils/fileValidation';

const initialFormState = (): AddUpdateBankDocumentsPayTrackBookingFilesRequest => ({
    PayTrackBookingFilesId: 0,
    Uniquekey: '345f2698-c51e-f111-af70-a0b9bd2bb8fe',
    BookingId: 0,
    ProjectId: 0,
    FileName: '',
    FileType: '',
    IsMaster: 0,
    PayTrackBookingFilesURL: null,
    RemovePayTrackBookingFilesURL: ''
})

interface BankDocumentsProps {
    fileType: string;
    pageName?: string;
}

export const BookingFlatHandoverFile: React.FC<BankDocumentsProps> = ({ fileType, pageName }) => {

    const [bankDocumentList, setBankDocumentList] = useState<BankDocumentsPayTrackBookingFilesData[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');

    const [formData, setFormData] = useState<AddUpdateBankDocumentsPayTrackBookingFilesRequest>(() => initialFormState());

    const [documentFiles, setDocumentFiles] = useState<(File | string)[]>([]);
    const [removedDocumentURLs, setRemovedDocumentURLs] = useState<string[]>([]);
    const [documentURL, setDocumentURL] = useState<string>();


    const [editingBankDocumentPayTrackBookingFilesData, setEditingBankDocumentPayTrackBookingFilesData] = useState<BankDocumentsPayTrackBookingFilesData | null>(null);
    const [isAddUpdateModalOpen, setIsAddUpdateModalOpen] = useState(false);

    const [isConfirmationDialogBoxOpen, setIsConfirmationDialogBoxOpen] = useState(false)
    const [deleteBankDocumentPayTrackDetailsData, setDeleteBankDocumentPayTrackDetailsData] = useState<BankDocumentsPayTrackBookingFilesData | null>(null)

    const { pagination, setPagination } = usePagination(20);

    const [sortInfo, setSortInfo] = useState<SortInfo | undefined>();

    const [filters] = useState<FilterInfo>({});

    const [errors, setErrors] = useState<{ [k: string]: string }>({});

    const { canAction } = useMenuPermissions(fileType==="FLAT HANDOVER" ? "/flatHandover" : "/files");

    const { listState } = usePayTrackBookingListState();
    const { bookingId ,bookingApprovalStatus} = listState;

    const { projectId } = useProject();

    const { addToast } = useToast();

    const [searchTerm, setSearchTerm] = useState("");

    const debouncedSearch = useDebouncedCallback((value: string) => {
        searchDocuments(value);
    }, 350);

     
    useEffect(() => {
        loadBankDoucumentsPayTrackBookingFiles(1, {});
    }, [projectId, bookingId]);

     useEffect(() => {
        if (isAddUpdateModalOpen) {
          if (editingBankDocumentPayTrackBookingFilesData) {
            setFormData({
              PayTrackBookingFilesId: editingBankDocumentPayTrackBookingFilesData.PayTrackBookingFilesId,
              Uniquekey: editingBankDocumentPayTrackBookingFilesData.Uniquekey || initialFormState().Uniquekey,
              BookingId: editingBankDocumentPayTrackBookingFilesData.BookingId || 0,
              ProjectId: Number(projectId),
              FileName: editingBankDocumentPayTrackBookingFilesData.FileName || "",
              FileType: fileType.toUpperCase(),
            });
    
            setDocumentFiles([]);
            setDocumentURL(editingBankDocumentPayTrackBookingFilesData.PayTrackBookingFilesURL || "");
            setRemovedDocumentURLs([]);
          } else {
            setFormData(initialFormState());
          }
          setErrors({});
        }
      }, [isAddUpdateModalOpen, editingBankDocumentPayTrackBookingFilesData, projectId]);
    

    const fetchBankDoucumentsPayTrackBookingFiles = async (page: number = pagination.currentPage, sort?: SortInfo) => {
        return await loadBankDoucumentsPayTrackBookingFiles(page, filters, sort ?? sortInfo);
    };

    const loadBankDoucumentsPayTrackBookingFiles = async (page: number, filterParams: FilterInfo,sortInfo?: SortInfo, searchtext?: string) => {
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {
                const params: FilterWithPaginationBankDocumentsPayTrackBookingFiles = {
                    PageNumber: page,
                    PageSize: pagination.pageSize,
                    ProjectId: Number(projectId),
                    BookingId: bookingId,
                    FileType: fileType.toUpperCase(),
                    FileName:searchtext ?? filterParams.DepartmentName ?? undefined,
                    SortBy: getSortByParam(sortInfo ?? null, bankDocumentColumns),

                };

                const response = await bankDocumentPayTrackBookingFilesService.apiCallPullBankDocumentsPayTrackBookingFiles(params);

                if (E.isRight(response)) {

                    setBankDocumentList(response.right.Data);

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
                addToast({ type: 'error', title: error.message }),
            undefined,
            `Loading ${pageName}`
        );

    };

    const searchDocuments = async (searchValue: string) => {
        setSearchTerm(searchValue);

        if (searchValue.trim() === "") {
            fetchBankDoucumentsPayTrackBookingFiles();

            return;
        }
        await loadBankDoucumentsPayTrackBookingFiles(1,filters, sortInfo, searchValue);
    };

    const clearsearchDocumnets = () => {
        setSearchTerm("");
        debouncedSearch.cancel?.();
        fetchBankDoucumentsPayTrackBookingFiles();
    };

    const handlePageChange = useCallback(
        (page: number) => {
            loadBankDoucumentsPayTrackBookingFiles(page,filters, sortInfo,searchTerm);
        },
        [loadBankDoucumentsPayTrackBookingFiles],
    );


    const handleSortColumn = (sortInfo: SortInfo) => {
        setSortInfo(sortInfo);

        fetchBankDoucumentsPayTrackBookingFiles(1);
    };

    const bankDocumentPaginationInfo: PaginationInfo = useMemo(
        () => ({
            currentPage: pagination.currentPage,
            totalPages: pagination.totalPages,
            totalRecords: pagination.totalRecords,
            pageSize: pagination.pageSize,
            onPageChange: handlePageChange,
        }),
        [pagination.currentPage, pagination.totalPages, pagination.totalRecords, pagination.pageSize, handlePageChange],
    );

    const bankDocumentListForTable = useMemo(() => bankDocumentList, [bankDocumentList]);

    const handleEditBankDocumentPayTrackDetails = useCallback((row: BankDocumentsPayTrackBookingFilesData) => {
        setEditingBankDocumentPayTrackBookingFilesData({
            ...row,
            FileName: row.FileName || "",
        });
        setIsAddUpdateModalOpen(true)
    }, [])

    const handleConfirmationDialogBoxOpen = useCallback((row: BankDocumentsPayTrackBookingFilesData) => {
        setDeleteBankDocumentPayTrackDetailsData(row)
        setIsConfirmationDialogBoxOpen(true)
    }, [])

    const bankDocumentColumns = useMemo<TableColumn[]>(
        () => [

            {
                key: "FileName",
                label: "File Name",
                width: "15",
                sortable: true,
                align: "left",
                render: (value: string, row: any) => {
                    return (
                        <div className="flex items-center justify-between w-full">
                            <div className="truncate max-w-[400px]">
                                <MultiImageViewer images={parseDocumentUrls(row.PayTrackBookingFilesURL)} title="Document" triggerLabel={value || "-"} />
                            </div>
                        </div>
                    );
                },
            },

            {
                key: "ModifiedBy",
                label: "Last Modified By",
                width: "33",
                sortable: false,
                align: "left",
                render: (value, row) => <TooltipText text={value || row.CreatedBy || "-"} maxWidth="180px" tooltipThreshold={18} />,
            },
            {
                key: "ModifiedDate",
                label: "Last Modified Date",
                width: "33",
                sortable: false,
                align: "left",
                render: (value, row) =>
                    value ? formatDate_dd_MonthName_yy(value) : row.CreatedDate ? formatDate_dd_MonthName_yy(row.CreatedDate) : "-",
            },
            {
                key: "Actions",
                label: "Actions",
                width: "12",
                align: "center",
                fixed: "right",
                render: (_value, row) => {

                    const showEdit = canAction &&  bookingApprovalStatus?.toUpperCase() === 'APPROVED';
                    const showDelete = canAction  &&  bookingApprovalStatus?.toUpperCase() === 'APPROVED' && pageName!="Flat Handover" ? true :false;

                    return (
                        <div className="flex items-center justify-end ml-2 gap-1">

                            <div className="flex-shrink-0 ml-2">

                                <Button
                                    type="button"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        if (!showEdit) return;
                                        handleEditBankDocumentPayTrackDetails(row);
                                    }}
                                    color="transparent"
                                    isborderRadius
                                    disabled={!showEdit}
                                    size="sm"
                                    style={{
                                        color: showEdit ? '' : '#9CA3AF',
                                        cursor: showEdit ? 'pointer' : 'not-allowed',
                                        opacity: showEdit ? 1 : 0.5
                                    }}
                                    title="Edit"
                                >
                                    <Edit className="h-4 w-4" />
                                </Button>

                            </div>

                            <div className="w-[34px] flex justify-center">

                                <Button
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        if (!showDelete) return;
                                        handleConfirmationDialogBoxOpen(row);
                                    }}
                                    color="transparent"
                                    isborderRadius
                                    disabled={!showDelete}
                                    size="sm"
                                    style={{
                                        color: showDelete ? 'red' : '#9CA3AF',
                                        cursor: showDelete ? 'pointer' : 'not-allowed',
                                        opacity: showDelete ? 1 : 0.5
                                    }}
                                    title="Delete"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>

                            </div>

                        </div>
                    );
                },
            },

        ], [canAction, handleConfirmationDialogBoxOpen, handleEditBankDocumentPayTrackDetails]
    );

    const handleFieldChange = (field: keyof AddUpdateBankDocumentsPayTrackBookingFilesRequest, value: any) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: "" }));
        }
    };

    const handleBankDocumentsModal = useCallback(() => {
        setEditingBankDocumentPayTrackBookingFilesData(null);
        setFormData(initialFormState());
        setErrors({});
        setIsAddUpdateModalOpen(true);
      }, []);


    const validateAddBankDocumentPayTrackBookingFiles = (): {
        isValid: boolean;
        errors: { [key: string]: string };
    } => {
        const newErrors: { [key: string]: string } = {};

        if (!formData.FileName?.trim()) {
            newErrors.FileName = 'File Name is required';
        }
       
        if (!hasAnyDocumentFile(documentFiles, documentURL, removedDocumentURLs)) {
            newErrors.documentFiles = "File is required.";
        }

        return {
            isValid: Object.keys(newErrors).length === 0,
            errors: newErrors
        };
    };


    //#region PUSH FORM DATA
    const PushBankDocumentPayTrackBookingFiles = (): FormData => {

        const fd = new FormData();
        fd.append('PayTrackBookingFilesId', formData.PayTrackBookingFilesId?.toString() ?? '');
        fd.append('Uniquekey', formData.Uniquekey ?? '');
        fd.append('ProjectId', String(projectId));
        fd.append('BookingId', String(bookingId));
        fd.append('FileName', formData.FileName ?? '');
        fd.append('FileType', fileType.toUpperCase());
        fd.append('IsMaster', String(formData.IsMaster ?? 0));

        documentFiles.forEach(file => {
            if (file instanceof File) {
                fd.append('PayTrackBookingFilesURL', file);
            }
        });

        fd.append('RemovePayTrackBookingFilesURL', removedDocumentURLs.join(','));
        return fd;
    };

    //#region ADD UPDATE BANK DOCUMENTS
    const handleAddUpdateBankDocumentPayTrackBookingFiles = async (e: React.FormEvent) => {
        e.preventDefault();

        setErrors({})
        const validation = validateAddBankDocumentPayTrackBookingFiles();

        if (!validation.isValid) {
            setErrors(validation.errors);
            return;
        }
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {

                const payload = PushBankDocumentPayTrackBookingFiles();

                const response = await bankDocumentPayTrackBookingFilesService.apiCallAddUpdateBankDocumentsPayTrackBookingFiles(payload);
                if (E.isRight(response)) {

                    setIsAddUpdateModalOpen(false);

                    const isAdd = formData.PayTrackBookingFilesId === 0;

                    if (isAdd) {
                        const newRecord = response.right.Data[0] as BankDocumentsPayTrackBookingFilesData
                        setBankDocumentList(prevData => [newRecord, ...prevData]);
                        setPagination({
                            currentPage: pagination.currentPage,
                            totalRecords: pagination.totalRecords + 1,
                            totalPages: Math.ceil((pagination.totalRecords + 1) / pagination.pageSize)
                        });
                        addToast({ type: 'success', title: response.right.SuccessMessage[0] })

                    } else {

                        const updatedRecord = response.right.Data[0] as BankDocumentsPayTrackBookingFilesData;
                        setBankDocumentList(prevData =>
                            prevData.map(item =>
                                item.PayTrackBookingFilesId === formData.PayTrackBookingFilesId
                                    ? updatedRecord
                                    : item
                            )
                        )
                        addToast({ type: 'success', title: response.right.SuccessMessage[0] })

                    }

                    setFormData(initialFormState());
                    setErrors({});
                    setDocumentFiles([]);
                    setDocumentURL('');
                    setRemovedDocumentURLs([]);

                    setEditingBankDocumentPayTrackBookingFilesData(null);

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
            `Add ${pageName}`
        )
    };
    // #endregion

    const handleDeleteDialogClose = useCallback(() => {
        setIsConfirmationDialogBoxOpen(false);
        setDeleteBankDocumentPayTrackDetailsData(null);
    }, [setIsConfirmationDialogBoxOpen, setDeleteBankDocumentPayTrackDetailsData]);



    //#region DELETE BANK DOCUMENT PAY TRACK BOOKING FILES
    const handleDeleteBankDocumentPayTrackDetails = async () => {

        setIsConfirmationDialogBoxOpen(false);

        if (!deleteBankDocumentPayTrackDetailsData) return;

        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {
                const params: DeleteBankDocumentsPayTrackBookingFilesRequest = {

                    PayTrackBookingFilesId: deleteBankDocumentPayTrackDetailsData?.PayTrackBookingFilesId || 0,

                    Uniquekey: deleteBankDocumentPayTrackDetailsData?.Uniquekey || '',

                    ProjectId: deleteBankDocumentPayTrackDetailsData?.ProjectId || 0,

                    BookingId: deleteBankDocumentPayTrackDetailsData.BookingId || 0
                };

                const response = await bankDocumentPayTrackBookingFilesService.apiCallDeleteBankDocumentsPayTrackBookingFiles(params);

                if (E.isRight(response)) {

                    const newTotalRecords = pagination.totalRecords - 1;

                    const newTotalPages = Math.max(1, Math.ceil(newTotalRecords / pagination.pageSize));

                    let pageToShow = pagination.currentPage;

                    if (pagination.currentPage > newTotalPages) {
                        pageToShow = newTotalPages;
                    }

                    else if (bankDocumentList.length === 1 && pagination.currentPage > 1) {
                        pageToShow = pagination.currentPage - 1;
                    }

                    setPagination({
                        currentPage: pageToShow,
                        totalRecords: newTotalRecords,
                        totalPages: newTotalPages
                    });

                    await loadBankDoucumentsPayTrackBookingFiles(pageToShow, filters, sortInfo);

                    addToast({ type: 'success', title: response.right.SuccessMessage?.[0] })
                    setIsConfirmationDialogBoxOpen(false);
                    setDeleteBankDocumentPayTrackDetailsData(null);

                } else {
                    addToast({ type: 'error', title: response.left.message });
                    setIsConfirmationDialogBoxOpen(false);
                }
                return response;
            },
            undefined,
            (error: any) => addToast({ type: "error", title: error.message }),
            undefined,
            `Deleting ${pageName}`
        );
    };
    //#endregion

    return (
        <div className="pt-5">

            {/* LOADER */}

            <Loader loading={isLoading} title={loadingMessage} > <div></div> </Loader>

            <TableActionToolbar
                searchTerm={searchTerm}
                searchPlaceholder="Search By File Name"
                onSearchChange={(v) => {
                    setSearchTerm(v);
                    debouncedSearch(v);
                }}
                onClearSearch={clearsearchDocumnets}
                isShowFilterButton={false}
                isShowCustomizeButton={false}
                // Add
                isShowAddButton={canAction &&  bookingApprovalStatus?.toUpperCase() === 'APPROVED' && pageName!="Flat Handover" ? true :false}
                addTitle="Add"
                onAdd={handleBankDocumentsModal}
            />

            <DataTable
                columns={bankDocumentColumns}
                emptyMessage={`No ${pageName} Found`}
                fixedHeight
                className="flex-1"
                data={bankDocumentListForTable}
                pagination={bankDocumentPaginationInfo}
                sortInfo={sortInfo}
                onSort={handleSortColumn}

            />
            <Modal
                title={editingBankDocumentPayTrackBookingFilesData ? `Update ${pageName}` : `Add ${pageName}`}
                isOpen={isAddUpdateModalOpen}
                onClose={() => {
                    setIsAddUpdateModalOpen(false);
                    setFormData(initialFormState());
                    setErrors({});
                    setDocumentFiles([]);
                    setDocumentURL('');
                    setRemovedDocumentURLs([]);
                    setEditingBankDocumentPayTrackBookingFilesData(null);
                }}
                onCancel={() => {
                    setIsAddUpdateModalOpen(false);
                    setFormData(initialFormState());
                    setErrors({});
                    setDocumentFiles([]);
                    setDocumentURL('');
                    setRemovedDocumentURLs([]);
                    setEditingBankDocumentPayTrackBookingFilesData(null);
                }}
                onSubmit={handleAddUpdateBankDocumentPayTrackBookingFiles}
                saveText={editingBankDocumentPayTrackBookingFilesData ? 'Update' : 'Add'}
                loading={isLoading}
                size='xl'
            >
                <div className="space-y-10 p-6 bg-blue-100">
                    <div className="space-y-4" >
                        <div>
                            <Input
                                label="File Name"
                                placeholder="Enter File Name"
                                type="text"
                                disabled={pageName!="Flat Handover" ? false :true}
                                value={formData.FileName ?? ''}
                                onChange={(e) => handleFieldChange('FileName', e.target.value)}
                                error={errors.FileName}
                                required
                            />
                        </div>
                        <div>
                            <MultiFilePicker
                                label="Upload File"
                                placeholder='Files'
                                required
                                value={documentFiles}
                                onChange={(files) => {
                                    setDocumentFiles(files);
                                    if (errors.documentFiles) {
                                        setErrors((prev) => ({ ...prev, documentFiles: "" }));
                                    }
                                }}
                                availableFilesURL={documentURL ?? ""}
                                allowedTypes={['image/jpeg', 'image/png', 'application/pdf']}
                                onRemoveExisting={(url) => {
                                    setRemovedDocumentURLs((prev) => [...prev, url])
                                }}
                                error={errors.documentFiles}
                            />
                        </div>
                    </div>
                </div>
            </Modal>

            {/* DELETE CONFIRMATION MODAL */}

            <DeleteDialog
                isOpen={isConfirmationDialogBoxOpen}
                onClose={handleDeleteDialogClose}
                onConfirm={handleDeleteBankDocumentPayTrackDetails}
                loading={isLoading}
                pageName={pageName}
            />
        </div>
    )
}

export default BookingFlatHandoverFile