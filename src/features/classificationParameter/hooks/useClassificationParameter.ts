import { useCallback, useEffect, useMemo, useState } from 'react';
import { usePagination } from '@/core/hooks/usePagination';
import type { TableColumn } from '@/ui/components/DataTable/DataTable';
import { runApiWithLoader } from '@/core/utils';
import * as E from 'fp-ts/Either';
import { useToast } from '@/core/hooks/useToast';
import type { AddUpdateClassificationParameterRequest, ClassificationParameterData, DeleteClassificationParameterRequest, FilterWithPaginationClassificationParameter } from '@/features/classificationParameter/models/ClassificationParameterModel';
import { classificationParameterService } from '@/features/classificationParameter/services/ClassificationParamterService'
import { useMenuPermissions } from '@/features/menu/hooks/useMenuPermissions';
import { useProject } from "@/features/projectMaster/context/ProjectContext";
import { getInitialFormState, getClassificationParameterColumns } from '@/features/classificationParameter/constants/classificationParameterConstants';
import { handleExportFile } from '@/core/utils/exportFile';
import { useMultiSelectDropdown } from '@/core/hooks/useMultiSelectDropdown';
import { fetchVillageDropdown } from '@/features/technical/villageDropDown';


export const useClassificationParameter = () => {
    //#region STATE MANAGEMENT
    const [classificationParameterList, setClassificationParameterList] = useState<ClassificationParameterData[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const { pagination, setPagination } = usePagination(20);
    const [viewClassificationParameterDetailsData, setViewClassificationParameterDetailsData] = useState<ClassificationParameterData | null>(null);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const { addToast } = useToast();

    //ERROR SET UP
    const [errors, setErrors] = useState<{ [k: string]: string }>({});

    // EDIT CLASSIFICATION PARAMETER
    const [editingClassificationParameterData, setEditingClassificationParameterData] = useState<ClassificationParameterData | null>(null);
    const [isAddUpdateModalOpen, setIsAddUpdateModalOpen] = useState(false);

    //ADD UPDATE CLASSIFICATION PARAMETER
    const [formData, setFormData] = useState<AddUpdateClassificationParameterRequest>(() => getInitialFormState());

    //DELETE CLASSIFICATION PARAMETER STATES
    const [isConfirmationDialogBoxOpen, setIsConfirmationDialogBoxOpen] = useState(false)
    const [deleteClassificationParameterDetailsData, setDeleteClassificationParameterDetailsData] = useState<ClassificationParameterData | null>(null)
    const [villageValue, setVillageValue] = useState<string | number | null>(null);
    const [dropdownResetKey, setDropdownResetKey] = useState(0);

    //#region MENU PERMISSIONS
    const { canAction, canExport } = useMenuPermissions();
    //#endregion

    const { projectId } = useProject();

    //#region FETCH VILLAGE DROPDOWN
    const villageDropdown = useMultiSelectDropdown({
        value: villageValue,
        fetchCallback: fetchVillageDropdown,
        autoFetchOptions: true,
    });
    //#endregion

    useEffect(() => {
        if (!projectId) return;

        fetchClassificationParameterList();

    }, [projectId]);


    useEffect(() => {

        if (isAddUpdateModalOpen) {

            if (editingClassificationParameterData) {
                
                setVillageValue(editingClassificationParameterData.VillageMasterId || "");

            } else {

                setFormData(getInitialFormState());

                setVillageValue(""); 

                setDropdownResetKey(prev => prev + 1);
            }

            setErrors({});
        }
    }, [isAddUpdateModalOpen, editingClassificationParameterData]);

    //#region TABLE COLUMN DEFINITION
    const classificationParameterColumns = useMemo<TableColumn[]>(() => getClassificationParameterColumns(), []);
    //#endregion


    //#region DATA LOADING | FETCH |  LOAD | SEARCH
    const fetchClassificationParameterList = async (page: number = pagination.currentPage) => {
        return await loadClassificationParameter(page);
    };

    const loadClassificationParameter = useCallback(
        async (page: number) => {
            await runApiWithLoader(
                setIsLoading,
                setLoadingMessage,
                async () => {
                    const params: FilterWithPaginationClassificationParameter = {
                        PageNumber: page,
                        PageSize: pagination.pageSize,
                        IsCheckPermission: true,
                        ProjectId: Number(projectId)

                    };

                    const response = await classificationParameterService.apiCallPullClassificationParameter(params);

                    if (E.isRight(response)) {
                        setClassificationParameterList(response.right.Data);

                        setPagination({
                            currentPage: page,
                            totalRecords: response.right.TotalNumberOfRecord,
                            totalPages: Math.ceil(response.right.TotalNumberOfRecord / pagination.pageSize),
                        });
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
                "Loading Classification Parameter",
            );
        },
        [projectId],
    );

    const handleAddUpdateClassificationParameter = async (e: React.FormEvent) => {
        e.preventDefault();

        setErrors({})

        const validation = validateAddClassificationParameterForm()

        if (!validation.isValid) {
            setErrors(validation.errors)
            return
        }

        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {

                const payload = PushClassificationParameterFormData();

                const response = await classificationParameterService.apiCallAddUpdateClassificationParameter(payload);

                if (E.isRight(response)) {

                    setIsAddUpdateModalOpen(false);

                    const isAdd = formData.ClassificationParameterId === 0;

                    if (isAdd) {

                        const newRecord = response.right.Data[0] as ClassificationParameterData

                        setClassificationParameterList(prevData => [newRecord, ...prevData]);

                        setPagination({
                            currentPage: pagination.currentPage,
                            totalRecords: pagination.totalRecords + 1,
                            totalPages: Math.ceil((pagination.totalRecords + 1) / pagination.pageSize)
                        });

                        addToast({ type: 'success', title: response.right.SuccessMessage[0] })

                    } else {

                        const updatedRecord = response.right.Data[0] as ClassificationParameterData;

                        setClassificationParameterList(prevData =>
                            prevData.map(item =>
                                item.ClassificationParameterId === formData.ClassificationParameterId
                                    ? updatedRecord
                                    : item
                            )
                        )

                        addToast({ type: 'success', title: response.right.SuccessMessage[0] })
                    }

                    setEditingClassificationParameterData(null);
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
            Number(formData.ClassificationParameterId) === 0 ? 'Add Classification Parameter' : 'Update Classification Parameter'
        )
    };
    //#endregion

    //#region VIEW EDIT
    const handleViewClassificationParameterDetails = useCallback((row: ClassificationParameterData) => {

        setViewClassificationParameterDetailsData(row);

        setIsViewModalOpen(true);

    }, [])
    //#endregion

    //#region EDIT CLASSIFICATION PARAMETER
    const handleEditClassificationParameterDetails = useCallback((row: ClassificationParameterData) => {
        setEditingClassificationParameterData({
            ...row,
        });

        setVillageValue(row.VillageMasterId ?? "");

        setFormData({
            ClassificationParameterId: row.ClassificationParameterId ?? 0,
            Uniquekey: row.Uniquekey || '3fa85f64-5717-4562-b3fc-2c963f66afa6',
            ProjectId: row.ProjectId || Number(projectId),
            MinBudget: row.MinBudget,
            PossessionType: row.PossessionType,
            Requirement: row.Requirement,
            RequirementType: row.RequirementType,
            TimeLine: row.TimeLine,
            VillageMasterId: row.VillageMasterId,
        });

        setIsAddUpdateModalOpen(true);

    }, [projectId])
    //#endregion

    //#region CONFIRMATION DIALOG BOX
    const handleConfirmationDialogBoxOpen = useCallback((row: ClassificationParameterData) => {
        setDeleteClassificationParameterDetailsData(row)
        setIsConfirmationDialogBoxOpen(true)
    }, [])
    //#endregion



    //#region EXPORT EXCEL | PDF
    const handleExportClassificationParameter = async (exportType: 'Excel' | 'PDF') => {
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {

                const params: FilterWithPaginationClassificationParameter = {
                    PageNumber: 1,
                    PageSize: pagination.totalRecords,
                    IsCheckPermission: true,
                    ProjectId: Number(projectId),
                    ExportType: exportType
                }

                const response = await classificationParameterService.apiCallPullClassificationParameter(params);
                handleExportFile(response, exportType, 'Classification Parameter', addToast)
                return response;
            },
            undefined,
            (error: any) => {
                addToast({ type: 'error', title: error.message })
            },
            undefined,
            'Preparing Export'
        )
    }

    const handleExportClassificationParameterExcel = () => handleExportClassificationParameter('Excel')
    const handleExportClassificationParameterPdf = () => handleExportClassificationParameter('PDF')
    //#endregion

    //#region HANDLE PAGE CHANGE
    const handlePageChange = (page: number) => {
        fetchClassificationParameterList(page);
    };
    //#endregion

    const handleAddClassificationParameterModal = () => {
        setEditingClassificationParameterData(null);
        setFormData(getInitialFormState());
        setErrors({});
        setVillageValue(null);
        setDropdownResetKey(prev => prev + 1);
        setIsAddUpdateModalOpen(true);
    }

    const validateAddClassificationParameterForm = (): {
        isValid: boolean
        errors: { [key: string]: string }
    } => {
        const newErrors: { [key: string]: string } = {}

        if (formData.PossessionType?.trim() === "") {
            newErrors.PossessionType = "Possession Type is required";
        }

        if (formData.Requirement?.trim() === "") {
            newErrors.Requirement = "Requirement is required";
        }

        if (formData.Requirement?.trim() !== "" && formData.RequirementType?.trim() === "") {
            newErrors.RequirementType = `${formData.Requirement} Type is required`;
        }

        if (!formData.TimeLine || formData.TimeLine.trim() === "") {
            newErrors.TimeLine = "Timeline is required";
        }

        if (!formData.VillageMasterId || formData.VillageMasterId.trim() === "") {
            newErrors.VillageMasterId = "Location is required";
        }

        return {
            isValid: Object.keys(newErrors).length === 0,
            errors: newErrors
        }
    }

    const PushClassificationParameterFormData = (): AddUpdateClassificationParameterRequest => {
        const villageIdsString = villageDropdown.selectedValues.length > 0 ? villageDropdown.selectedValues.join(",") : "";

        return {
            ClassificationParameterId: formData.ClassificationParameterId || 0,
            Uniquekey: formData.Uniquekey,
            ProjectId: formData.ProjectId || Number(projectId),
            MinBudget: formData.MinBudget === "" ? "<1" : formData.MinBudget,
            PossessionType: formData.PossessionType || '',
            Requirement: formData.Requirement || '',
            RequirementType: formData.RequirementType ?? '',
            TimeLine: formData.TimeLine ?? '',
            VillageMasterId: villageIdsString,
        };
    };

    //#region ADD UPDATE EDIT CLASSIFICATION PARAMETER
    const handleFieldChange = (field: keyof AddUpdateClassificationParameterRequest, value: any) => {

        setFormData((prev) => ({ ...prev, [field]: value }));

        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: "" }));
        }
    };

    //#region DELETE CLASSIFICATION PARAMETER
    const handleDeleteClassificationParameter = async () => {

        setIsConfirmationDialogBoxOpen(false);

        if (!deleteClassificationParameterDetailsData) return

        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {

                const params: DeleteClassificationParameterRequest =
                {

                    ClassificationParameterId: deleteClassificationParameterDetailsData.ClassificationParameterId || 0,
                    Uniquekey: deleteClassificationParameterDetailsData.Uniquekey,
                    ProjectId: deleteClassificationParameterDetailsData.ProjectId
                }

                const response = await classificationParameterService.apiCallDeleteClassificationParameter(params);

                if (E.isRight(response)) {

                    const newTotalRecords = pagination.totalRecords - 1;

                    const newTotalPages = Math.max(1, Math.ceil(newTotalRecords / pagination.pageSize));

                    let pageToShow = pagination.currentPage;

                    if (pagination.currentPage > newTotalPages) {
                        pageToShow = newTotalPages;
                    }

                    else if (classificationParameterList.length === 1 && pagination.currentPage > 1) {
                        pageToShow = pagination.currentPage - 1;
                    }

                    setPagination({
                        currentPage: pageToShow,
                        totalRecords: newTotalRecords,
                        totalPages: newTotalPages
                    });

                    await loadClassificationParameter(pageToShow);

                    addToast({ type: 'success', title: response.right.SuccessMessage[0] })

                    setIsConfirmationDialogBoxOpen(false);

                    setDeleteClassificationParameterDetailsData(null);

                } else {

                    addToast({ type: 'error', title: response.left.message });

                    setIsConfirmationDialogBoxOpen(false);
                }

                return response
            },
            undefined,
            (error: any) => {
                addToast({ type: 'error', title: error.message })
            },
            undefined,
            'Delete Classification Parameter'
        )
    }
    //#endregion
    return {
        classificationParameterList,
        canAction,
        isLoading,
        loadingMessage,
        errors,
        pagination,
        viewClassificationParameterDetailsData,
        isViewModalOpen,
        editingClassificationParameterData,
        isAddUpdateModalOpen,
        isConfirmationDialogBoxOpen,
        deleteClassificationParameterDetailsData,
        formData,
        canExport,
        villageDropdown,
        villageValue,
        classificationParameterColumns,
        dropdownResetKey,

        setVillageValue,
        setDropdownResetKey,
        //setters
        setErrors,
        setFormData,
        setIsAddUpdateModalOpen,
        setEditingClassificationParameterData,
        handleAddUpdateClassificationParameter,
        setDeleteClassificationParameterDetailsData,
        setIsConfirmationDialogBoxOpen,
        setIsViewModalOpen,
        setViewClassificationParameterDetailsData,

        //Actions
        handlePageChange,
        handleViewClassificationParameterDetails,
        handleEditClassificationParameterDetails,
        handleConfirmationDialogBoxOpen,
        handleAddClassificationParameterModal,
        handleFieldChange,
        handleDeleteClassificationParameter,
        handleExportClassificationParameterExcel,
        handleExportClassificationParameterPdf

    }

}



