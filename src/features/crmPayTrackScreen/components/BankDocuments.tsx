import { DataTable, type FilterInfo, type SortInfo, type TableColumn } from '@/ui/components/DataTable/DataTable';
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
import type { BankDocumentsPayTrackBookingFilesData, FilterWithPaginationBankDocumentsPayTrackBookingFiles, AddUpdateBankDocumentsPayTrackBookingFilesRequest, DeleteBankDocumentsPayTrackBookingFilesRequest } from "@/features/crmPayTrackScreen/models/BankDocumentsPayTrackBookingFiles";
import useToast from '@/core/hooks/useToast';
import { getSortByParam } from '@/core/constants/sortingColumnDetails';
import { bankDocumentPayTrackBookingFilesService } from "@/features/crmPayTrackScreen/services/BankDocumentPayTrackBookingFilesService";
import { useParams } from 'react-router-dom';
import * as E from 'fp-ts/Either';
import { formatDate_dd_MonthName_yy } from '@/core/utils/dateFormat';
import { Loader } from '@/core/utils/loader';
import { Edit, Trash2 } from 'lucide-react';
import { DeleteDialog } from '@/ui/components/forms/DeleteDialog';
import { MultiImageViewer } from "@/ui/components/ImageViewer/ImageViewer";


const initialFormState = (): AddUpdateBankDocumentsPayTrackBookingFilesRequest => ({
    PayTrackBookingFilesId: 0,
    Uniquekey: '345f2698-c51e-f111-af70-a0b9bd2bb8fe',
    BookingId: 0,
    ProjectId: 0,
    FileName: '',
    FileType: '',
    IsMaster: 0,
    PayTrackBookingFilesURL: '',
    RemovePayTrackBookingFilesURL: ''
})

export const BankDocuments: React.FC = () => {

    const [bankDocumentList, setBankDocumentList] = useState<BankDocumentsPayTrackBookingFilesData[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');

    const [formData, setFormData] = useState<AddUpdateBankDocumentsPayTrackBookingFilesRequest>(() => initialFormState());

    //FILE STATES
    const [documentFiles, setDocumentFiles] = useState<(File | string)[]>([]);
    const [removedDocumentURLs, setRemovedDocumentURLs] = useState<string[]>([]);
    const [documentURL, setDocumentURL] = useState<string>();

    // ADD EDIT BANK DOCUMENT PAY TRACK BOOKING FILES
    const [editingBankDocumentPayTrackBookingFilesData, setEditingBankDocumentPayTrackBookingFilesData] = useState<BankDocumentsPayTrackBookingFilesData | null>(null);
    const [isAddUpdateModalOpen, setIsAddUpdateModalOpen] = useState(false);

    //DELETE BANK DOCUMENT PAY TRACK BOOKING FILES 
    const [isConfirmationDialogBoxOpen, setIsConfirmationDialogBoxOpen] = useState(false)
    const [deleteBankDocumentPayTrackDetailsData, setDeleteBankDocumentPayTrackDetailsData] = useState<BankDocumentsPayTrackBookingFilesData | null>(null)

    // PAGINATION
    const { pagination, setPagination } = usePagination(20);

    //ERROR SET UP
    const [errors, setErrors] = useState<{ [k: string]: string }>({});

    const { canAction } = useMenuPermissions("/payTrack");

    //#region PROJECT SELECTION GET ID
    const { projectId } = useProject();
    //#endregion

    const { BookingId } = useParams<{ BookingId?: string }>();
    const bookingId = BookingId ? Number(BookingId) : 0;

    // TOAST
    const { addToast } = useToast();    

    const handleBankDocumentsModal = () => {
        setIsAddUpdateModalOpen(true);
    }

    useEffect(() => {
        loadBankDoucumentsPayTrackBookingFiles(1, {});
    }, [projectId, bookingId]);

    //#region DATA LOADING | FETCH |  LOAD | SEARCH
    const loadBankDoucumentsPayTrackBookingFiles = useCallback(async (page: number = pagination.currentPage, filterParams: FilterInfo, sort?: SortInfo) => {
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {
                const params: FilterWithPaginationBankDocumentsPayTrackBookingFiles = {
                    PageNumber: page,
                    PageSize: pagination.pageSize,
                    ProjectId: Number(projectId),
                    BookingId: bookingId,
                    FileType: filterParams.FileType || `BANK DOCUMENT`,
                    SortBy: getSortByParam(sort ?? null, bankDocumentColumns),

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
            'Loading Call Log'
        );

    }, [])


    const bankDocumentColumns = useMemo<TableColumn[]>(
        () => [
            {
                key: 'FileName',
                label: 'Document Name',
                width: '14',
                align: 'left',
                render: (value, row: BankDocumentsPayTrackBookingFilesData) => {
                    // Extract file name from the URL or fallback to user input
                    let fileNameFromUrl = row.PayTrackBookingFilesURL?.split(/[/\\]/).pop();
                    if (fileNameFromUrl && fileNameFromUrl.includes('?')) {
                        fileNameFromUrl = fileNameFromUrl.split('?')[0];
                    }
                    const displayText = fileNameFromUrl || value || '-';

                    return (
                        <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                                <div className="min-w-0">
                                    <MultiImageViewer
                                        images={[row.PayTrackBookingFilesURL]}
                                        triggerLabel={displayText}
                                        size="sm"

                                    />
                                </div>
                            </div>
                        </div>
                    );
                }
            },
            {
                key: 'CreatedBy',
                label: 'Created By',
                width: '14',
                align: 'left',
                render: value => value || '-'

            },
            {
                key: 'CreatedDate',
                label: 'Created Date',
                width: '14',
                align: 'left',
                render: value => formatDate_dd_MonthName_yy(value) || '-'

            },
            {
                key: 'Action',
                label: 'Actions',
                width: '14',
                align: 'left',
                render: (_value, row: BankDocumentsPayTrackBookingFilesData) => (
                    canAction && !(row as any).DocumentCount ? (
                        <div className="flex items-center justify-center gap-2">

                            <Button
                                onClick={(e) => {
                                    e.preventDefault()
                                    e.stopPropagation()
                                    //#region  EDIT DIALOG BOX
                                    handleEditBankDocumentPayTrackDetails(row)
                                    //#endregion
                                }}
                                color='transparent'
                                isborderRadius
                                size='sm'
                                style={{
                                    color: 'blue',
                                    padding: '4px 8px'
                                }}
                                title="Delete Approval Document Category"
                            >
                                <Edit className="h-4 w-4" />
                            </Button>

                            <Button
                                onClick={(e) => {
                                    e.preventDefault()
                                    e.stopPropagation()
                                    //#region CONFIRMATION DIALOG BOX
                                    handleConfirmationDialogBoxOpen(row)
                                    //#endregion
                                }}
                                color='transparent'
                                isborderRadius
                                size='sm'
                                style={{
                                    color: 'red',
                                    padding: '4px 8px'
                                }}
                                title="Delete Approval Document Category"
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    ) : null
                )

            },
        ], []
    );

    const handleFieldChange = (field: keyof AddUpdateBankDocumentsPayTrackBookingFilesRequest, value: any) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: "" }));
        }
    };

    const validateAddBankDocumentPayTrackBookingFiles = (): {
        isValid: boolean;
        errors: { [key: string]: string };
    } => {
        const newErrors: { [key: string]: string } = {};

        if (!formData.FileName?.trim()) {
            newErrors.FileName = 'Document Name is required';
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
        fd.append('FileType', formData.FileType || 'BANK DOCUMENT');
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
                    setEditingBankDocumentPayTrackBookingFilesData(null)
                    setDocumentFiles([])
                    setDocumentURL('')
                    setRemovedDocumentURLs([])
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
            'Add Bank Document File'
        )
    };
    // #endregion

    const handleDeleteDialogClose = useCallback(() => {
        setIsConfirmationDialogBoxOpen(false);
        setDeleteBankDocumentPayTrackDetailsData(null);
    }, [setIsConfirmationDialogBoxOpen, setDeleteBankDocumentPayTrackDetailsData]);

    //#region CONFIRMATION DIALOG BOX
    const handleConfirmationDialogBoxOpen = useCallback((row: BankDocumentsPayTrackBookingFilesData) => {
        setDeleteBankDocumentPayTrackDetailsData(row)
        setIsConfirmationDialogBoxOpen(true)
    }, [])
    //#endregion
    //#region EDIT BANK DOCUMENT PAY TRACK BOOKING FILES
    const handleEditBankDocumentPayTrackDetails = useCallback((row: BankDocumentsPayTrackBookingFilesData) => {
        setEditingBankDocumentPayTrackBookingFilesData(row)
        setFormData({
            PayTrackBookingFilesId: row.PayTrackBookingFilesId,
            Uniquekey: row.Uniquekey,
            BookingId: row.BookingId,
            ProjectId: row.ProjectId,
            FileName: row.FileName,
            FileType: row.FileType,
            IsMaster: row.IsMaster,
            PayTrackBookingFilesURL: '',
            RemovePayTrackBookingFilesURL: ''
        });
        setDocumentURL(row.PayTrackBookingFilesURL ?? '');
        setIsAddUpdateModalOpen(true)
    }, [])
    //#endregion

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
                    await loadBankDoucumentsPayTrackBookingFiles(pageToShow, {});

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
            "Deleting Bank Document"
        );
    };
    //#endregion

    return (
        <div className="mt-6">

            {/* LOADER */}

            <Loader loading={isLoading} title={loadingMessage} > <div></div> </Loader>

            <TableActionToolbar
                isShowSearchBar={false}
                // Add
                isShowAddButton={canAction}
                addTitle="Add"
                onAdd={handleBankDocumentsModal}
            />

            <DataTable
                columns={bankDocumentColumns}
                emptyMessage="No Bank Documents Found"
                fixedHeight
                className="flex-1"
                data={bankDocumentList}

            />
            <Modal
                title={editingBankDocumentPayTrackBookingFilesData ? 'Update' : 'Add Booking File'}
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
                saveText='Save'
                loading={isLoading}
                size='xl'
            >
                <div>
                    <Input
                        label="File Name"
                        placeholder="File Name"
                        type="text"
                        value={formData.FileName ?? ''}
                        onChange={(e) => handleFieldChange('FileName', e.target.value)}
                        error={errors.FileName}
                        required
                    />
                </div>
                <div>
                    <MultiFilePicker
                        label="Upload File"
                        placeholder='No Selected Files'
                        required
                        value={documentFiles}
                        onChange={setDocumentFiles}
                        availableFilesURL={documentURL ?? ""}
                        allowedTypes={['image/jpeg', 'image/png', 'application/pdf']}
                        maxFiles={5}
                        maxSizeMB={10}
                        onRemoveExisting={(url) => {
                            setRemovedDocumentURLs((prev) => [...prev, url])
                        }}

                    />
                </div>
            </Modal>

            {/* DELETE CONFIRMATION MODAL */}

            <DeleteDialog
                isOpen={isConfirmationDialogBoxOpen}
                onClose={handleDeleteDialogClose}
                onConfirm={handleDeleteBankDocumentPayTrackDetails}
                loading={isLoading}
                pageName='Bank Document'
            />
        </div>
    )
}

export default BankDocuments