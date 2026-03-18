import React, { useEffect, useState } from 'react'
import useToast from '@/core/hooks/useToast';
import { runApiWithLoader } from '@/core/utils/apiLoaderHelper';
import type { EmployeeMasterData, EmployeeReportingCycle, FilterWithPaginationEmployeeMasterRequest, UpdateEmployeeMasterRequest } from '@/features/employeeMaster/models/EmployeeMasterModel';
import * as E from 'fp-ts/Either';
import { LocalStorageHelper } from '@/core/utils/localStorageHelper';
import { employeeMasterService } from '@/features/employeeMaster/services/EmployeeMasterService';
import { Loader } from '@/core/utils/loader';
import { convert_dd_mm_yyyy_To_Yyyy_mm_dd, formatDate_dd_mm_yyyy, formatDate_dd_MonthName_yy, formatDate_dd_MonthName_yy_hh_mm } from '@/core/utils/dateFormat';
import { FieldItem } from '@/ui/components/forms/FieldItem';
import { useNavigate } from 'react-router-dom';
import { useEmployeeListState } from '@/features/employeeMaster/context/EmployeeListStateContext';
import type { EmployeeDocumentData, FilterWithPaginationEmployeeDocumentRequest } from '@/features/employeeMaster/models/EmployeeDocumentModel';
import type { FilterWithPaginationShiftMappingMasterRequest, ShiftMappingMasterData } from '@/features/shiftMappingMaster/models/ShiftMappingMasterModel';
import type { AssetMappingMasterData, FilterWithPaginationAssetMappingMasterRequest } from '@/features/assetMappingMaster/models/AssetMappingMasterModel';
import type { FilterWithPaginationWeekOffMappingMasterRequest, WeekOffMappingMasterData } from '@/features/weekOffMappingMaster/models/WeekOffMappingMasterModel';
import { assetMappingMasterService } from '@/features/assetMappingMaster/services/AssetMappingMasterService';
import { employeeDocumentService } from '@/features/employeeMaster/services/EmployeeDocumentService';
import { shiftMappingMasterService } from '@/features/shiftMappingMaster/services/ShiftMappingMasterService';
import { weekOffMappingMasterService } from '@/features/weekOffMappingMaster/services/WeekOffMappingMasterService';
import Tabs from '@/ui/components/Tab/Tab';
import NoDataView from '@/ui/components/NoDataView/NoDataView';
import HeaderActionBar from '@/ui/components/forms/HeaderActionBar';
import Accordion from '@/ui/components/Card/Accordion';
import type { FilterWithPaginationProjectMasterRequest, ProjectMasterData } from '@/features/projectMaster/models/ProjectMasterModel';
import { projectMasterService } from '@/features/projectMaster/services/ProjectMasterService';
import type { EmployeeEducationDetailsData, FilterWithPaginationEmployeeEducationDetailsRequest, AddUpdateEmployeeEducationDetailsRequest } from '@/features/employeeMaster/models/EmployeeEducationDetailsModel';
import type { EmployeeExperienceDetailsData, FilterWithPaginationEmployeeExperienceDetailsRequest, AddUpdateEmployeeExperienceDetailsRequest } from '@/features/employeeMaster/models/EmployeeExperienceDetailsModal';
import { employeeEducationDetailsService } from '@/features/employeeMaster/services/EmployeeEducationDetailsService';
import { employeeExperienceDetailsService } from '@/features/employeeMaster/services/EmployeeExperienceDetailsService';
import { Modal } from '@/ui/components/Modal/Modal';
import { Input } from '@/ui/components/forms/Input';
import { ConfirmationDialogBox } from '@/core/utils/confirmationDialogBox';
import { Edit, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/ui/components/forms/Button';
import type { DeleteEmployeeEducationDetailsRequest } from '@/features/employeeMaster/models/EmployeeEducationDetailsModel';
import type { DeleteEmployeeExperienceDetailsRequest } from '@/features/employeeMaster/models/EmployeeExperienceDetailsModal';
import type { BranchAssociationsMasterData, FilterWithPaginationBranchAssociationsMasterRequest } from '@/features/branchAssociationsMaster/models/BranchAssociationsMasterModel';
import { branchAssociationsService } from '@/features/branchAssociationsMaster/services/BranchAssociationsMasterService';
import { parseDocumentUrls } from '@/core/utils/documentUtils';
import MultiImageViewer from '@/ui/components/ImageViewer/ImageViewer';
import DatePickerInput from '@/ui/components/forms/Datepicker';

export const Profile: React.FC = () => {

    //#region STATE MANAGEMENT
    const [employeeMasterList, setEmployeeMasterList] = useState<EmployeeMasterData[]>([]);
    const [employeeReportingCycleList, setEmployeeReportingCycleList] = useState<EmployeeReportingCycle[]>([]);
    const [assetMappingMasterList, setAssetMappingMasterList] = useState<AssetMappingMasterData[]>([]);
    const [employeeDocumentList, setEmployeeDocumentList] = useState<EmployeeDocumentData[]>([]);
    const [shiftMappingMasterList, setShiftMappingMasterList] = useState<ShiftMappingMasterData[]>([]);
    const [weekOffMappingMasterList, setWeekOffMappingMasterList] = useState<WeekOffMappingMasterData[]>([]);
    const [employeeEducationDetailsDataList, setEmployeeEducationDetailsDataList] = useState<EmployeeEducationDetailsData[]>([]);
    const [employeeExperienceDetailsDataList, setEmployeeExperienceDetailsDataList] = useState<EmployeeExperienceDetailsData[]>([]);
    const [loadedSections, setLoadedSections] = useState<{
        educationDetails?: boolean;
        experienceDetails?: boolean;
        branchAssociations?: boolean;
    }>({});

    const [branchAssociationsMasterDataList, setBranchAssociationsMasterDataList] = useState<BranchAssociationsMasterData[]>([]);

    const [projectMasterList, setProjectMasterList] = useState<ProjectMasterData[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');

    // Modal states
    const [isEducationModalOpen, setIsEducationModalOpen] = useState(false);
    const [isExperienceModalOpen, setIsExperienceModalOpen] = useState(false);
    const [isEmployeeModalOpen, setIsEmployeeModalOpen] = useState(false);
    const [isEditEducationMode, setIsEditEducationMode] = useState(false);
    const [isEditExperienceMode, setIsEditExperienceMode] = useState(false);
    const [isEditEmployeeMode, setIsEditEmployeeMode] = useState(false);

    // Delete confirmation states
    const [isDeleteEducationDialogOpen, setIsDeleteEducationDialogOpen] = useState(false);
    const [isDeleteExperienceDialogOpen, setIsDeleteExperienceDialogOpen] = useState(false);
    const [selectedEducationItem, setSelectedEducationItem] = useState<EmployeeEducationDetailsData | null>(null);
    const [selectedExperienceItem, setSelectedExperienceItem] = useState<EmployeeExperienceDetailsData | null>(null);

    // Education form state
    const [educationFormData, setEducationFormData] = useState<AddUpdateEmployeeEducationDetailsRequest>({
        EmployeeEducationDetailsId: 0,
        EmployeeId: Number(LocalStorageHelper.getStoredEmployeeData()?.EmployeeId) || 0,
        Qualification: '',
        CollegeName: '',
        Passing: '',
        Uniquekey: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
    });
    const [educationFormErrors, setEducationFormErrors] = useState<{
        Qualification?: string;
        CollegeName?: string;
        Passing?: string;
    }>({});

    // Experience form state
    const [experienceFormData, setExperienceFormData] = useState<AddUpdateEmployeeExperienceDetailsRequest>({
        EmployeeExperienceDetailsId: 0,
        EmployeeId: Number(LocalStorageHelper.getStoredEmployeeData()?.EmployeeId) || 0,
        CompanyName: '',
        Role: '',
        Tenure: '',
        Uniquekey: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
    });
    const [experienceFormErrors, setExperienceFormErrors] = useState<{
        CompanyName?: string;
        Role?: string;
        Tenure?: string;
    }>({});

    // Employee form state
    const [employeeFormData, setEmployeeFormData] = useState<UpdateEmployeeMasterRequest>({
        EmployeeId: 0,
        FirstName: '',
        MiddleName: '',
        LastName: '',
        Gender: '',
        MaritalStatus: '',
        BloodGroup: '',
        DateOfBirth: '',
        EmailId: '',
        PersonalMobileNumber: '',
        CommunicationAddress: '',
        UniqueKey: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
        PermanentAddress: '',
    });
    const [employeeFormErrors, setEmployeeFormErrors] = useState<{
        FFirstName?: string;
        LastName?: string;
        MiddleName?: string
        BloodGroup?: string;
        Gender?: string;
        MaritalStatus?: string;
        DateOfBirth?: string;
        EmailId?: string;
        PersonalMobileNumber?: string;
        PermanentAddress?: string;
        CommunicationAddress?: string
    }>({});

    // TOAST
    const { addToast } = useToast()

    //#endregion

    //#region NAVIGATE PREVIOUS PAGE
    const navigate = useNavigate() // ✅ initialize router navigate
    const { updateListState } = useEmployeeListState();
    //#endregion

    //#region TAB ACTIVITY
    const employeeTabList = [
        { id: "Overview", label: "Overview" },
        { id: "Document", label: "Document" },
        { id: "Assets", label: "Assets" },
        { id: "Project", label: "Project" },
        { id: "Shift Policy", label: "Shift Policy" },
        { id: "Week Off Policy", label: "Week Off Policy" },
    ];

    const [activeTab, setActiveTab] = useState<string>(employeeTabList[0].id);

    //#endregion

    //#region INIT

    useEffect(() => {

        if (activeTab === "Overview") loadEmployee();

        else if (activeTab === "Document") loadEmployeeDocuments()

        else if (activeTab === "Assets") loadAssetMasterMapping();

        else if (activeTab === 'Project') loadProjects();

        else if (activeTab === 'Shift Policy') loadShiftMappings();

        else if (activeTab === 'Week Off Policy') loadWeekOffMappings();


    }, [activeTab]);
    //#endregion

    //#region DATA LOADING | FETCH |  LOAD | SEARCH 

    const loadEmployee = async () => {
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {

                const filterParams: FilterWithPaginationEmployeeMasterRequest = {
                    PageNumber: 1,
                    PageSize: 1,
                    IsCheckPermission: false,
                    EmployeeId: Number(LocalStorageHelper.getStoredEmployeeData()?.EmployeeId)
                }

                const response = await employeeMasterService.apiCallPullEmployeeMaster(filterParams);

                if (E.isRight(response)) {

                    const employeeList = Array.isArray(response.right.Data) ? response.right.Data : []

                    setEmployeeMasterList(employeeList);

                    setEmployeeReportingCycleList(employeeList[0]?.EmployeeReportingCycleData || []);
                } else {

                    addToast({ type: 'error', title: response.left.message });

                }

                return response
            },
            undefined,
            (error: any) => {

                addToast({ type: 'error', title: error.message })
            },
            undefined,
            'Loading Employee'
        )
    }

    //#endregion

    //#region DATA LOAD FOR ASSET MAPPING TO EACH EMPLOYEE

    const loadAssetMasterMapping = async () => {
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {

                const params: FilterWithPaginationAssetMappingMasterRequest = {
                    PageNumber: 1,
                    PageSize: 20,
                    EmployeeId: LocalStorageHelper.getStoredEmployeeData()?.EmployeeId,
                    IsCheckPermission: false

                };

                const response = await assetMappingMasterService.apiCallPullAssetMappingMaster(params);

                if (E.isRight(response)) {

                    setAssetMappingMasterList(response.right.Data);

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
            'Loading Asset'
        );
    };

    //#endregion 

    //#region  LOAD EMPLOYEE DOCUMENT FROM SERVER
    const loadEmployeeDocuments = async () => {
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {


                const params: FilterWithPaginationEmployeeDocumentRequest = {
                    PageNumber: 1,
                    PageSize: 500,
                    IsCheckPermission: true,
                    EmployeeId: Number(LocalStorageHelper.getStoredEmployeeData()?.EmployeeId),
                    DocumentName: undefined
                }

                const response = await getEmployeeDocuments(params);

                if (E.isRight(response)) {

                    setEmployeeDocumentList(response.right.Data);

                } else {

                    addToast({ type: 'error', title: response.left.message });

                }

                return response
            },
            undefined,
            (error: any) => {
                addToast({ type: 'error', title: error.message })
            },
            undefined,
            'Loading Employee Document'
        )
    }

    const getEmployeeDocuments = async (filterParams: FilterWithPaginationEmployeeDocumentRequest) => {

        return await employeeDocumentService.apiCallPullEmployeeDocument(filterParams);
    }
    //#endregion

    //#region  LOAD EMPLOYEE SHIFT POLICY FROM SERVER
    const loadShiftMappings = async () => {
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {

                const params: FilterWithPaginationShiftMappingMasterRequest = {
                    PageNumber: 1,
                    PageSize: 20,
                    DepartmentName: undefined,
                    EmployeeId: LocalStorageHelper.getStoredEmployeeData()?.EmployeeId,
                    IsCheckEmployeeShift: true,
                    IsCheckPermission: false
                }

                const response = await shiftMappingMasterService.apiCallPullShiftMappingMaster(params);

                if (E.isRight(response)) {

                    setShiftMappingMasterList(response.right.Data);


                } else {

                    addToast({ type: 'error', title: response.left.message });
                }
                return response
            },
            undefined,
            (error: any) => {
                addToast({ type: 'error', title: error.message })
            },
            undefined,
            'Loading Shift Mapping Data'
        )
    }
    //#endregion

    //#region LOAD WEEK OFF MAPPING POLICY
    const loadWeekOffMappings = async () => {
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {

                const params: FilterWithPaginationWeekOffMappingMasterRequest = {
                    PageNumber: 1,
                    PageSize: 100,
                    DepartmentName: undefined,
                    EmployeeId: LocalStorageHelper.getStoredEmployeeData()?.EmployeeId,
                    IsCheckEmployeeWeekOffPolicy: true,
                    IsCheckPermission: false
                }

                const response = await weekOffMappingMasterService.apiCallPullWeekOffMappingMaster(params);

                if (E.isRight(response)) {

                    setWeekOffMappingMasterList(response.right.Data);


                } else {

                    addToast({ type: 'error', title: response.left.message });
                }
                return response
            },
            undefined,
            (error: any) => {
                addToast({ type: 'error', title: error.message })
            },
            undefined,
            'Loading Week Off Mapping'
        )
    }
    //#endregion

    //#region LOAD EMPLOYEE EDUCATION DETAILS
    const loadEmployeeEducationDetails = async () => {
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {

                const params: FilterWithPaginationEmployeeEducationDetailsRequest = {
                    PageNumber: 1,
                    PageSize: 100,
                    Qualification: undefined,
                    EmployeeId: LocalStorageHelper.getStoredEmployeeData()?.EmployeeId,
                }

                const response = await employeeEducationDetailsService.apiCallPullEmployeeEducationDetails(params);

                if (E.isRight(response)) {

                    setEmployeeEducationDetailsDataList(response.right.Data);


                } else {

                    addToast({ type: 'error', title: response.left.message });
                }
                return response
            },
            undefined,
            (error: any) => {
                addToast({ type: 'error', title: error.message })
            },
            undefined,
            'Loading Employee Education'
        )
    }
    //#endregion

    //#region LOAD EMPLOYEE EXPERIENCE DETAILS
    const loadEmployeeExperienceDetails = async () => {
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {

                const params: FilterWithPaginationEmployeeExperienceDetailsRequest = {
                    PageNumber: 1,
                    PageSize: 100,
                    CompanyName: undefined,
                    EmployeeId: LocalStorageHelper.getStoredEmployeeData()?.EmployeeId,
                }

                const response = await employeeExperienceDetailsService.apiCallPullEmployeeExperienceDetails(params);

                if (E.isRight(response)) {

                    setEmployeeExperienceDetailsDataList(response.right.Data);


                } else {

                    addToast({ type: 'error', title: response.left.message });
                }
                return response
            },
            undefined,
            (error: any) => {
                addToast({ type: 'error', title: error.message })
            },
            undefined,
            'Loading Employee Experience'
        )
    }
    //#endregion

    //#region LOAD EMPLOYEE BRANCH ASSOCIATIONS
    const loadEmployeeBranchAssociations = async () => {
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {

                const params: FilterWithPaginationBranchAssociationsMasterRequest = {
                    PageNumber: 1,
                    PageSize: 100,
                    EmployeeId: LocalStorageHelper.getStoredEmployeeData()?.EmployeeId,
                    IsCheckPermission: false
                }

                const response = await branchAssociationsService.apiCallPullBranchAssociations(params);

                if (E.isRight(response)) {

                    setBranchAssociationsMasterDataList(response.right.Data);


                } else {

                    addToast({ type: 'error', title: response.left.message });
                }
                return response
            },
            undefined,
            (error: any) => {
                addToast({ type: 'error', title: error.message })
            },
            undefined,
            'Loading Branch Associations'
        )
    }
    //#endregion


    //#region PROJECT MASTER
    const loadProjects = async () => {
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {

                const params: FilterWithPaginationProjectMasterRequest = {
                    PageNumber: 1,
                    PageSize: 1000,
                    IsProjectAccess: false,
                    EmployeeId: LocalStorageHelper.getStoredEmployeeData()?.EmployeeId,
                }

                const response = await projectMasterService.apiCallPullProjectMaster(params);

                if (E.isRight(response)) {

                    setProjectMasterList(response.right.Data);

                } else {
                    addToast({ type: 'error', title: response.left.message });
                }
                return response
            },
            undefined,
            (error: any) => {
                addToast({ type: 'error', title: error.message })
            },
            undefined,
            'Loading Project'
        )
    }

    //#endregion

    //#region EDIT EMPLOYEE DOCUMENT

    const handleEditEmployeeDocument = (row: EmployeeMasterData) => {
        updateListState({
            employeeId: row.EmployeeId!,
            employeeName: row.FullName,
            pageName: 'PROFILE',
        });
        navigate('/employeeMaster/document');
    };


    //#endregion

    //#region EDUCATION MODAL HANDLERS

    const handleOpenEducationModal = (item?: EmployeeEducationDetailsData) => {
        if (item) {
            // Edit mode
            setEducationFormData({
                EmployeeEducationDetailsId: item.EmployeeEducationDetailsId,
                EmployeeId: item.EmployeeId,
                Qualification: item.Qualification || '',
                CollegeName: item.CollegeName || '',
                Passing: item.Passing || '',
                Uniquekey: item.Uniquekey || '3fa85f64-5717-4562-b3fc-2c963f66afa6',
            });
            setIsEditEducationMode(true);
        } else {
            // Add mode
            setEducationFormData({
                EmployeeEducationDetailsId: 0,
                EmployeeId: Number(LocalStorageHelper.getStoredEmployeeData()?.EmployeeId) || 0,
                Qualification: '',
                CollegeName: '',
                Passing: '',
                Uniquekey: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
            });
            setIsEditEducationMode(false);
        }
        setEducationFormErrors({});
        setIsEducationModalOpen(true);
    };

    const handleCloseEducationModal = () => {
        setIsEducationModalOpen(false);
        setIsEditEducationMode(false);
        setEducationFormData({
            EmployeeEducationDetailsId: 0,
            EmployeeId: Number(LocalStorageHelper.getStoredEmployeeData()?.EmployeeId) || 0,
            Qualification: '',
            CollegeName: '',
            Passing: '',
            Uniquekey: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
        });
        setEducationFormErrors({});
    };

    const validateEducationForm = (): boolean => {
        const errors: {
            Qualification?: string;
            CollegeName?: string;
            Passing?: string;
        } = {};

        if (!educationFormData.Qualification?.trim()) {
            errors.Qualification = 'Qualification is required';
        }
        if (!educationFormData.CollegeName?.trim()) {
            errors.CollegeName = 'College Name is required';
        }
        if (!educationFormData.Passing?.trim()) {
            errors.Passing = 'Passing Year is required';
        }

        setEducationFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleEducationFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateEducationForm()) {
            return;
        }

        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {
                const params: AddUpdateEmployeeEducationDetailsRequest = {
                    EmployeeEducationDetailsId: educationFormData.EmployeeEducationDetailsId,
                    EmployeeId: educationFormData.EmployeeId,
                    Qualification: educationFormData.Qualification?.trim() || '',
                    CollegeName: educationFormData.CollegeName?.trim() || '',
                    Passing: educationFormData.Passing?.trim() || '',
                    Uniquekey: educationFormData.Uniquekey || '3fa85f64-5717-4562-b3fc-2c963f66afa6',
                };

                const response = await employeeEducationDetailsService.apiCallAddUpdateEmployeeEducationDetails(params);

                if (E.isRight(response)) {
                    addToast({
                        type: 'success', title: response.right.SuccessMessage[0]
                    });
                    handleCloseEducationModal();
                    loadEmployeeEducationDetails();
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
            'Add Education Details'
        );
    };

    //#endregion

    //#region EDUCATION DELETE HANDLER

    const handleDeleteEducation = (item: EmployeeEducationDetailsData) => {
        setSelectedEducationItem(item);
        setIsDeleteEducationDialogOpen(true);
    };

    const handleConfirmDeleteEducation = async () => {
        if (!selectedEducationItem) return;

        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {
                const params: DeleteEmployeeEducationDetailsRequest = {
                    EmployeeEducationDetailsId: selectedEducationItem.EmployeeEducationDetailsId,
                    UniqueKey: selectedEducationItem.Uniquekey || '',
                    EmployeeId: selectedEducationItem.EmployeeId
                };

                const response = await employeeEducationDetailsService.apiCallDeleteEmployeeEducationDetails(params);

                if (E.isRight(response)) {
                    addToast({ type: 'success', title: response.right.SuccessMessage[0] });
                    setIsDeleteEducationDialogOpen(false);
                    setSelectedEducationItem(null);
                    loadEmployeeEducationDetails();
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
            'Deleting Education Details'
        );
    };

    //#endregion

    //#region EXPERIENCE MODAL HANDLERS

    const handleOpenExperienceModal = (item?: EmployeeExperienceDetailsData) => {
        if (item) {
            // Edit mode
            setExperienceFormData({
                EmployeeExperienceDetailsId: item.EmployeeExperienceDetailsId,
                EmployeeId: item.EmployeeId,
                CompanyName: item.CompanyName || '',
                Role: item.Role || '',
                Tenure: item.Tenure || '',
                Uniquekey: item.Uniquekey || '3fa85f64-5717-4562-b3fc-2c963f66afa6',
            });
            setIsEditExperienceMode(true);
        } else {
            // Add mode
            setExperienceFormData({
                EmployeeExperienceDetailsId: 0,
                EmployeeId: Number(LocalStorageHelper.getStoredEmployeeData()?.EmployeeId) || 0,
                CompanyName: '',
                Role: '',
                Tenure: '',
                Uniquekey: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
            });
            setIsEditExperienceMode(false);
        }
        setExperienceFormErrors({});
        setIsExperienceModalOpen(true);
    };

    const handleCloseExperienceModal = () => {
        setIsExperienceModalOpen(false);
        setIsEditExperienceMode(false);
        setExperienceFormData({
            EmployeeExperienceDetailsId: 0,
            EmployeeId: Number(LocalStorageHelper.getStoredEmployeeData()?.EmployeeId) || 0,
            CompanyName: '',
            Role: '',
            Tenure: '',
            Uniquekey: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
        });
        setExperienceFormErrors({});
    };

    const validateExperienceForm = (): boolean => {
        const errors: {
            CompanyName?: string;
            Role?: string;
            Tenure?: string;
        } = {};

        if (!experienceFormData.CompanyName?.trim()) {
            errors.CompanyName = 'Company Name is required';
        }
        if (!experienceFormData.Role?.trim()) {
            errors.Role = 'Role is required';
        }
        if (!experienceFormData.Tenure?.trim()) {
            errors.Tenure = 'Tenure is required';
        }

        setExperienceFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleExperienceFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateExperienceForm()) {
            return;
        }

        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {
                const params: AddUpdateEmployeeExperienceDetailsRequest = {
                    EmployeeExperienceDetailsId: experienceFormData.EmployeeExperienceDetailsId,
                    EmployeeId: experienceFormData.EmployeeId,
                    CompanyName: experienceFormData.CompanyName?.trim() || '',
                    Role: experienceFormData.Role?.trim() || '',
                    Tenure: experienceFormData.Tenure?.trim() || '',
                    Uniquekey: experienceFormData.Uniquekey || '3fa85f64-5717-4562-b3fc-2c963f66afa6',
                };

                const response = await employeeExperienceDetailsService.apiCallAddUpdateEmployeeExperienceDetails(params);

                if (E.isRight(response)) {
                    addToast({
                        type: 'success',
                        title: response.right.SuccessMessage[0]
                    });
                    handleCloseExperienceModal();
                    loadEmployeeExperienceDetails();
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
            'Add Experience Details'
        );
    };

    //#endregion

    //#region EXPERIENCE DELETE HANDLER

    const handleDeleteExperience = (item: EmployeeExperienceDetailsData) => {
        setSelectedExperienceItem(item);
        setIsDeleteExperienceDialogOpen(true);
    };

    const handleConfirmDeleteExperience = async () => {
        if (!selectedExperienceItem) return;

        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {
                const params: DeleteEmployeeExperienceDetailsRequest = {
                    EmployeeExperienceDetailsId: selectedExperienceItem.EmployeeExperienceDetailsId,
                    UniqueKey: selectedExperienceItem.Uniquekey || '',
                    EmployeeId: selectedExperienceItem.EmployeeId
                };

                const response = await employeeExperienceDetailsService.apiCallDeleteEmployeeExperienceDetails(params);

                if (E.isRight(response)) {
                    addToast({ type: 'success', title: response.right.SuccessMessage[0] });
                    setIsDeleteExperienceDialogOpen(false);
                    setSelectedExperienceItem(null);
                    loadEmployeeExperienceDetails();
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
            'Deleting Experience Details'
        );
    };

    //#endregion

    //#region EMPLOYEE MODAL HANDLERS
    const handleOpenEmployeeModal = (item?: EmployeeMasterData) => {
        if (item) {
            // Edit mode
            setEmployeeFormData({
                EmployeeId: item.EmployeeId,
                UniqueKey: item.UniqueKey || '3fa85f64-5717-4562-b3fc-2c963f66afa6',
                FirstName: item.FirstName || '',
                LastName: item.LastName || '',
                MiddleName: item.MiddleName || '',
                BloodGroup: item.BloodGroup || '',
                Gender: item.Gender || '',
                MaritalStatus: item.MaritalStatus || '',
                DateOfBirth: item.DateOfBirth || '',
                EmailId: item.EmailId || '',
                PersonalMobileNumber: item.PersonalMobileNumber || '',
                CommunicationAddress: item.CommunicationAddress || '',
                PermanentAddress: item.PermanentAddress || '',
            });
            setIsEditEmployeeMode(true);
        }
        setEmployeeFormErrors({});
        setIsEmployeeModalOpen(true);
    };

    const handleCloseEmployeeModal = () => {
        setIsEmployeeModalOpen(false);
        setIsEditEmployeeMode(false);
        setEmployeeFormData({
            EmployeeId: 0,
            FirstName: '',
            MiddleName: '',
            LastName: '',
            BloodGroup: '',
            Gender: '',
            MaritalStatus: '',
            DateOfBirth: '',
            EmailId: '',
            PersonalMobileNumber: '',
            CommunicationAddress: '',
            PermanentAddress: '',
            UniqueKey: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
        });
        setEmployeeFormErrors({});
    };

    const validateEmployeeForm = (): boolean => {
        const errors: {
            FirstName?: string;
            LastName?: string;
            BloodGroup?: string;
            MiddleName?: string;
            MaritalStatus?: string;
            DateOfBirth?: string;
            EmailId?: string;
            PersonalMobileNumber?: string;
            CommunicationAddress?: string;
            PermanentAddress?: string;
            Gender?: string
        } = {};

        if (!employeeFormData.FirstName?.trim()) {
            errors.FirstName = 'First Name is required';
        }
        if (!employeeFormData.LastName?.trim()) {
            errors.LastName = 'Last Name is required';
        }
        if (!employeeFormData.MiddleName?.trim()) {
            errors.MiddleName = 'Middle Name is required';
        }
        if (!employeeFormData.MaritalStatus?.trim()) {
            errors.MaritalStatus = 'Marital Status is required';
        }
        if (!employeeFormData.DateOfBirth) {
            errors.DateOfBirth = 'Date Of Birth is required';
        }
        if (!employeeFormData.BloodGroup) {
            errors.BloodGroup = 'Blood Group is required';
        }
        if (!employeeFormData.EmailId?.trim()) {
            errors.EmailId = 'Email Id is required';
        }
        if (!employeeFormData.PersonalMobileNumber?.trim()) {
            errors.PersonalMobileNumber = 'Personal Mobile Number is required';
        }
        if (!employeeFormData.CommunicationAddress?.trim()) {
            errors.CommunicationAddress = 'Communication Address is required';
        }
        if (!employeeFormData.PermanentAddress?.trim()) {
            errors.PermanentAddress = 'Permanent Address is required';
        }
        if (!employeeFormData.Gender?.trim()) {
            errors.Gender = 'Gender is required';
        }
        setEmployeeFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleEmployeeFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateEmployeeForm()) {
            return;
        }

        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {
                const params: UpdateEmployeeMasterRequest = {
                    EmployeeId: employeeFormData.EmployeeId,
                    UniqueKey: employeeFormData.UniqueKey || '3fa85f64-5717-4562-b3fc-2c963f66afa6',
                    FirstName: employeeFormData.FirstName?.trim() || '',
                    MiddleName: employeeFormData.MiddleName?.trim() || '',
                    LastName: employeeFormData.LastName?.trim() || '',
                    MaritalStatus: employeeFormData.MaritalStatus?.trim() || '',
                    DateOfBirth: employeeFormData.DateOfBirth || '',
                    EmailId: employeeFormData.EmailId?.trim() || '',
                    PersonalMobileNumber: employeeFormData.PersonalMobileNumber?.trim() || '',
                    CommunicationAddress: employeeFormData.CommunicationAddress?.trim() || '',
                    PermanentAddress: employeeFormData.PermanentAddress?.trim() || '',
                    BloodGroup: employeeFormData.BloodGroup?.trim() || '',
                    Gender: employeeFormData.Gender?.trim() || '',
                };

                const response = await employeeMasterService.apiCallUpdateEmployeeMaster(params);

                if (E.isRight(response)) {
                    addToast({
                        type: 'success', title: response.right.SuccessMessage[0]
                    });
                    handleCloseEmployeeModal();
                    loadEmployee();
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
            'Update Employee Details'
        );
    };

    //#endregion

    const employeeData = employeeMasterList.length > 0 ? employeeMasterList[0] : null

    const safe = (value?: any) => (value === null || value === undefined || value === '' ? '-' : value)

    const docsWithUrls = employeeDocumentList.filter(d => {
        const urls = parseDocumentUrls(d.DocumentURL ?? "")
            .filter(x => x?.trim()?.length);

        return urls.length > 0;
    });
    return (

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="space-y-4">
                <HeaderActionBar
                    titleText={'Profile Details'}
                    cancelText="Cancel"
                    EditText={activeTab === "Document" ? "Edit" : ""}
                    onCancel={() => navigate(-1)}
                    canAction={activeTab === "Document"}
                    isLoading={isLoading}
                    onEdit={() => {
                        if (activeTab === "Document") {
                            if (employeeData) handleEditEmployeeDocument(employeeData);
                        }

                    }}
                />

                {/* Loader */}
                <Loader loading={isLoading} title={loadingMessage}>
                    <div />
                </Loader>

                <Tabs
                    tabs={employeeTabList}
                    defaultActive={activeTab}
                    islarge={true}
                    onTabChange={(t) => {

                        setActiveTab(t.id);

                        if (t.id === "Overview") loadEmployee();

                        else if (t.id === "Document") loadEmployeeDocuments()

                        else if (t.id === "Assets") loadAssetMasterMapping();

                        else if (t.id === 'Project') loadProjects();

                        else if (t.id === 'Shift Policy') loadShiftMappings();

                        else if (t.id === 'Week Off Policy') loadWeekOffMappings();

                    }}
                />

                {activeTab === 'Overview' && employeeData && (
                    <>
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                            {/* ================= LEFT SIDE (2/3) ================= */}
                            <div className="lg:col-span-2 space-y-6">

                                {/* ================== BASIC DETAILS ================== */}
                                <section className="bg-white rounded-xl shadow-sm p-6 border-[0.1px] border-[#3333334f]">
                                    <div className='flex justify-between'>
                                        <h4 className="text-lg font-semibold text-gray-900 mb-4">
                                            Basic Details
                                        </h4>

                                        <Button
                                            color="transparent"
                                            size="sm"
                                            style={{ color: "blue", padding: "0px 8px" }}
                                            onClick={() => handleOpenEmployeeModal(employeeData)}
                                            leftIcon={<Edit className="h-4 w-4" />}
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-4">

                                        <div className="lg:col-span-3 border-b border-[#135bec2e] pb-3">
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                <FieldItem label="First Name" value={safe(employeeData!.FirstName)} />
                                                <FieldItem label="Middle Name" value={safe(employeeData!.MiddleName)} />
                                                <FieldItem label="Last Name" value={safe(employeeData!.LastName)} />
                                            </div>
                                        </div>


                                        <div className="lg:col-span-3 border-b border-[#135bec2e] pb-3 pt-3">
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                <FieldItem label="Gender" value={safe(employeeData!.Gender)} />
                                                <FieldItem label="Marital Status" value={safe(employeeData!.MaritalStatus)} />
                                                <FieldItem label="Blood Group" value={safe(employeeData!.BloodGroup)} />
                                            </div>
                                        </div>


                                        <div className="lg:col-span-3 border-b border-[#135bec2e] pb-3 pt-3">
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                <FieldItem label="DOB" value={formatDate_dd_MonthName_yy(safe(employeeData!.DateOfBirth))} />
                                                <FieldItem label="Email ID" value={safe(employeeData!.EmailId)} />
                                                <FieldItem label="Personal Mobile No." value={employeeData?.PersonalMobileNumber
                                                    ? `+91 ${safe(employeeData?.PersonalMobileNumber)}`
                                                    : '-'}
                                                />
                                            </div>
                                        </div>

                                        <div className="lg:col-span-3 border-b border-[#135bec2e] pb-3 pt-3">
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                <FieldItem
                                                    label="Communication Address"
                                                    value={safe(employeeData!.CommunicationAddress)}
                                                />
                                            </div>
                                        </div>
                                        <div className="lg:col-span-3  pt-3">
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                <FieldItem
                                                    label="Permanent Address"
                                                    value={safe(employeeData!.PermanentAddress)}
                                                />
                                            </div>
                                        </div>


                                    </div>


                                </section>
                                {/* ================== ADDRESS ================== */}
                                <section className="bg-white rounded-xl shadow-sm p-6 border-[0.5px] border-[#3333334f]">
                                    <h4 className="text-lg font-semibold text-gray-900 mb-4">
                                        Address
                                    </h4>

                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

                                        <div className="lg:col-span-3 border-b border-[#135bec2e] pb-3">
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">

                                                <FieldItem label="Country" value={safe(employeeData!.CountryName)} />
                                                <FieldItem label="State" value={safe(employeeData!.StateName)} />

                                            </div>
                                        </div>
                                        <div className="lg:col-span-3">
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                                                <FieldItem label="District" value={safe(employeeData!.DistrictName)} />
                                                <FieldItem label="City" value={safe(employeeData!.CityName)} />
                                            </div>
                                        </div>
                                    </div>
                                </section>
                                {/* ================== EMPLOYEE INFO ================== */}
                                <section className="bg-white rounded-xl shadow-sm p-6 border-[0.5px] border-[#3333334f]">
                                    <h4 className="text-lg font-semibold text-gray-900 mb-4">
                                        Employee Information
                                    </h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

                                        <div className="lg:col-span-3 border-b border-[#135bec2e] pb-3">
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                <FieldItem label="Company Name" value={safe(employeeData!.CompanyName)} />
                                                <FieldItem label="Branch" value={safe(employeeData!.Branch)} />
                                                <FieldItem label="Department" value={safe(employeeData!.Department)} />

                                            </div>
                                        </div>
                                        <div className="lg:col-span-3 border-b border-[#135bec2e] pb-3">
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                <FieldItem label="Designation" value={safe(employeeData!.Designation)} />
                                                <FieldItem
                                                    label="Joining Date"
                                                    value={formatDate_dd_MonthName_yy(safe(employeeData!.JoiningDate))}
                                                />
                                                <FieldItem label="Reporting Person" value={safe(employeeData!.ReportPersonName)} />
                                            </div>
                                        </div>
                                        <div className="lg:col-span-3 border-b border-[#135bec2e] pb-3">
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                <FieldItem label="Employment Type" value={safe(employeeData!.EmployeeType)} />

                                                <FieldItem label="Office Number" value={employeeData?.OfficeMobileNumber
                                                    ? `+91 ${safe(employeeData?.OfficeMobileNumber)}`
                                                    : '-'} />

                                                <FieldItem label="Office E-mail ID" value={safe(employeeData!.OfficeEmailId)} />
                                            </div>
                                        </div>
                                        <div className="lg:col-span-3">
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                <FieldItem
                                                    label="Probation Date"
                                                    value={formatDate_dd_MonthName_yy(safe(employeeData!.ProbationDate))}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </section>



                                {/* ================== BANK DETAILS ================== */}
                                <section className="bg-white rounded-xl shadow-sm p-6 border-[0.5px] border-[#3333334f]">
                                    <h4 className="text-lg font-semibold text-gray-900  mb-4">
                                        Bank Details
                                    </h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        <div className="lg:col-span-3 border-b border-[#135bec2e] pb-3">
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                                                <FieldItem label="Bank Name" value={safe(employeeData!.BankName)} />
                                                <FieldItem label="Account Number" value={safe(employeeData!.AccountNo)} />
                                            </div>
                                        </div>
                                        <div className="lg:col-span-3">
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                                                <FieldItem label="Bank Branch Name" value={safe(employeeData!.BankBranchName)} />
                                                <FieldItem label="IFSC Code" value={safe(employeeData!.IFSCCode)} />
                                            </div>
                                        </div>
                                    </div>
                                </section>

                                {/* ================== FAMILY DETAILS ================== */}
                                <section className="bg-white rounded-xl shadow-sm p-6 border-[0.5px] border-[#3333334f]">
                                    <h4 className="text-lg font-semibold text-gray-900 mb-4">
                                        Emergency Contact Details
                                    </h4>

                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

                                        <div className="lg:col-span-3">
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">

                                                <FieldItem label="Relation to Emergency Contact" value={safe(employeeData!.EmergencyContactPersonRelationship)} />
                                                <FieldItem
                                                    label="Emergency Contact Number"
                                                    value={
                                                        employeeData?.EmergencyMobileNumber
                                                            ? `+91 ${safe(employeeData?.EmergencyMobileNumber)}`
                                                            : '-'
                                                    }
                                                />


                                            </div>
                                        </div>

                                    </div>
                                </section>
                                {/* ================== ACTION DETAILS ================== */}
                                <section className="bg-white rounded-xl shadow-sm p-6 border-[0.5px] border-[#3333334f]">
                                    <h4 className="text-lg font-semibold text-gray-900 mb-4">
                                        Action Details
                                    </h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        <div className="lg:col-span-3 border-b border-[#135bec2e] pb-3">
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                                                <FieldItem label="Created By" value={safe(employeeData!.CreatedBy)} />
                                                <FieldItem
                                                    label="Created Date"
                                                    value={formatDate_dd_MonthName_yy(safe(employeeData!.CreatedDate))}
                                                />
                                            </div>
                                        </div>
                                        <div className="lg:col-span-3">
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                                                <FieldItem label="Modified By" value={safe(employeeData!.ModifiedBy)} />
                                                <FieldItem
                                                    label="Modified Date"
                                                    value={formatDate_dd_MonthName_yy_hh_mm(safe(employeeData!.ModifiedDate))}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </section>

                            </div>

                            {/* ================= RIGHT SIDE (1/3) ================= */}
                            <div className="lg:col-span-1 space-y-6">

                                {/* Reporting Structure example block */}
                                <section className="bg-white rounded-xl shadow-sm p-6 border-[0.5px] border-[#3333334f]">

                                    <h4 className="text-lg font-semibold text-gray-900 mb-4">
                                        Reporting Structure
                                    </h4>
                                    <div className="space-y-4">
                                        {employeeReportingCycleList && employeeReportingCycleList.length > 0 ? (
                                            employeeReportingCycleList.map((item, index) => (
                                                <div key={index} className="flex gap-4 relative">

                                                    <div className="flex flex-col items-center">

                                                        <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center text-white font-semibold text-sm">
                                                            {item.FullName!.trim().split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2)}
                                                        </div>

                                                        {index !== employeeReportingCycleList.length - 1 && (

                                                            <div className="w-px bg-gray-500 flex-1 mt-1"></div>
                                                        )}
                                                    </div>

                                                    {/* Content */}
                                                    <div className="flex-1 pb-4">
                                                        <div className="font-semibold text-gray-500">
                                                            {item.FullName || '-'}
                                                            <span className="ml-2 text-xs text-gray-300">
                                                                ({item.EmployeeCode || '-'})
                                                            </span>
                                                        </div>

                                                        <div className="text-sm text-gray-500">
                                                            {item.Designation || '-'}
                                                        </div>
                                                        <div className="text-xs text-gray-400">
                                                            {item.EmailId || '-'} +91 {item.PersonalMobileNumber || '-'}
                                                        </div>

                                                    </div>

                                                </div>
                                            ))
                                        ) : (
                                            <NoDataView message='No Reporting Structure Found' />
                                        )}
                                    </div>

                                </section>


                                {/* ================= FAMILY / EDUCATION / EXPERIENCE ================= */}
                                <Accordion
                                    allowMultipleOpen
                                    items={[
                                        { key: 'Education Details', title: 'Education Details' },
                                        { key: 'Experience Details', title: 'Experience Details' },
                                        { key: 'Branch Associations', title: 'Branch Associations' }
                                    ]}
                                    renderItem={(item, isOpen, toggle) => (
                                        <div>

                                            {/* === HEADER === */}
                                            <div
                                                className="flex justify-between items-center px-4 py-3 cursor-pointer"
                                                onClick={async () => {
                                                    toggle();

                                                    if (item.key === 'Education Details' && !loadedSections.educationDetails) {
                                                        await loadEmployeeEducationDetails();
                                                        setLoadedSections(prev => ({ ...prev, educationDetails: true }));
                                                    }

                                                    if (item.key === 'Experience Details' && !loadedSections.experienceDetails) {
                                                        await loadEmployeeExperienceDetails();
                                                        setLoadedSections(prev => ({ ...prev, experienceDetails: true }));
                                                    }

                                                    if (item.key === 'Branch Associations' && !loadedSections.branchAssociations) {
                                                        await loadEmployeeBranchAssociations();
                                                        setLoadedSections(prev => ({ ...prev, branchAssociations: true }));
                                                    }
                                                }}
                                            >
                                                <h4 className="font-semibold">{item.title}</h4>

                                                {/* ADD BUTTON */}

                                                {item.key !== 'Branch Associations' && (
                                                    <Button
                                                        color='transparent'
                                                        isborderRadius
                                                        size='sm'
                                                        style={{
                                                            color: 'blue',
                                                            padding: '4px 8px'
                                                        }}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            if (item.key === 'Education Details') {
                                                                handleOpenEducationModal()
                                                            }
                                                            else if (item.key === "Experience Details") {
                                                                handleOpenExperienceModal();
                                                            }
                                                        }}
                                                        leftIcon={<Plus className="h-4 w-4" />}
                                                    >
                                                    </Button>
                                                )}
                                            </div>

                                            {/* === BODY === */}
                                            {isOpen && (
                                                <div className="p-4">

                                                    {/* EDUCATION */}
                                                    {item.key === 'Education Details' && (
                                                        employeeEducationDetailsDataList.length === 0
                                                            ? <NoDataView message="No Education Details Found" />
                                                            : employeeEducationDetailsDataList.map(e => (
                                                                <div
                                                                    key={e.Uniquekey}
                                                                    className="border-b last:border-b-0 border-gray-200 py-2 last:border-b-0 last:pb-0"
                                                                >
                                                                    <FieldItem label="Qualification" value={e.Qualification} isRow />
                                                                    <FieldItem label="College" value={e.CollegeName} isRow />
                                                                    <FieldItem label="Passing Year" value={e.Passing} isRow />

                                                                    <div className="flex justify-end gap-2">
                                                                        <Button
                                                                            color='transparent'
                                                                            isborderRadius
                                                                            size='sm'
                                                                            style={{
                                                                                color: 'blue',
                                                                                padding: '4px 8px'
                                                                            }}
                                                                            title="Edit"
                                                                            onClick={() => handleOpenEducationModal(e)}
                                                                            disabled={isLoading}
                                                                            leftIcon={<Edit className="h-4 w-4" />}
                                                                        >
                                                                        </Button>
                                                                        <Button
                                                                            color='transparent'
                                                                            isborderRadius
                                                                            size='sm'
                                                                            style={{
                                                                                color: 'red',
                                                                                padding: '4px 8px'
                                                                            }}
                                                                            title="Delete"
                                                                            onClick={() => handleDeleteEducation(e)}
                                                                            disabled={isLoading}
                                                                            leftIcon={<Trash2 className="h-4 w-4" />}
                                                                        >
                                                                        </Button>
                                                                    </div>
                                                                </div>
                                                            ))
                                                    )}

                                                    {/* EXPERIENCE */}
                                                    {item.key === 'Experience Details' && (
                                                        employeeExperienceDetailsDataList.length === 0
                                                            ? <NoDataView message="No Experience Details Found" />
                                                            : employeeExperienceDetailsDataList.map(e => (
                                                                <div
                                                                    key={e.Uniquekey}
                                                                    className="border-b last:border-b-0 border-gray-200 py-2 last:border-b-0 last:pb-0"
                                                                >
                                                                    <FieldItem label="Company Name" value={e.CompanyName} isRow />
                                                                    <FieldItem label="Role" value={e.Role} isRow />
                                                                    <FieldItem label="Tenure" value={e.Tenure} isRow />

                                                                    <div className="flex justify-end gap-2">
                                                                        <Button
                                                                            color='transparent'
                                                                            isborderRadius
                                                                            size='sm'
                                                                            style={{
                                                                                color: 'blue',
                                                                                padding: '4px 8px'
                                                                            }}
                                                                            title="Edit"
                                                                            onClick={() => handleOpenExperienceModal(e)}
                                                                            disabled={isLoading}
                                                                            leftIcon={<Edit className="h-4 w-4" />}
                                                                        >

                                                                        </Button>
                                                                        <Button
                                                                            color='transparent'
                                                                            isborderRadius
                                                                            size='sm'
                                                                            style={{
                                                                                color: 'red',
                                                                                padding: '4px 8px'
                                                                            }}
                                                                            title="Delete"
                                                                            onClick={() => handleDeleteExperience(e)}
                                                                            leftIcon={<Trash2 className="h-4 w-4" />}
                                                                        >
                                                                        </Button>
                                                                    </div>
                                                                </div>
                                                            ))
                                                    )}

                                                    {item.key === 'Branch Associations' && (
                                                        branchAssociationsMasterDataList.length === 0 ? (
                                                            <NoDataView message="No Branch Associations Details Found" />
                                                        ) : (
                                                            <div className="flex flex-wrap gap-3">
                                                                {branchAssociationsMasterDataList.map(e => (
                                                                    <div key={e.Uniquekey} className="px-5 py-2 bg-gray-100 rounded-full hover:bg-gray-200 transition cursor-pointer">
                                                                        <span className="font-medium text-gray-900 whitespace-nowrap">
                                                                            {e.BranchName}
                                                                        </span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )
                                                    )}

                                                </div>
                                            )}
                                        </div>
                                    )}
                                />


                            </div>

                        </div>
                    </>
                )}


                {activeTab === 'Document' && (

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

                        {docsWithUrls.length === 0 && (
                            <section className="md:col-span-4 bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                                <NoDataView message="No Documents Found" />
                            </section>
                        )}

                        {docsWithUrls.map(d => {
                            const urls = parseDocumentUrls(d.DocumentURL ?? "").filter(x => x?.trim()?.length);

                            return (
                                <div className="border border-gray-200 rounded-lg shadow-sm flex flex-col h-full">

                                    <div className="flex items-start justify-between p-2 gap-2">
                                        <div className="flex flex-col">

                                            <span className="line-clamp-2 break-words font-medium text-gray-900">
                                                {d.DocumentName}
                                            </span>
                                            <span className="text-sm text-gray-500 mt-1">
                                                Document Count : {urls.length}
                                            </span>
                                        </div>

                                        <MultiImageViewer
                                            images={urls}
                                            title={d.DocumentName ?? "Document"}
                                            triggerLabel="View"
                                            isIcon={false}
                                        />


                                    </div>


                                    <div className="flex-grow" />

                                    <div className="bg-gray-50 p-2 mt-auto">
                                        <FieldItem
                                            label="Uploaded By / Date"
                                            value={`${d?.ModifiedBy || d?.CreatedBy || '-'} / ${d?.ModifiedDate
                                                ? formatDate_dd_MonthName_yy_hh_mm(d?.ModifiedDate)
                                                : d?.CreatedDate
                                                    ? formatDate_dd_MonthName_yy_hh_mm(d?.CreatedDate)
                                                    : '-'
                                                }`}
                                        />
                                    </div>

                                </div>

                            );
                        })}

                    </div>

                )}

                {activeTab === 'Assets' && assetMappingMasterList && (
                    <div className="space-y-4">
                        {assetMappingMasterList.length === 0 ? (
                            <section className="bg-white rounded-xl shadow-sm p-6 border-[0.1px] border-[#3333334f]" >
                                <NoDataView message='No Assets Found' />
                            </section>
                        ) : (
                            <div className="space-y-3">
                                {assetMappingMasterList.map((asset) => {

                                    return (
                                        <>

                                            <section className="bg-white rounded-xl shadow-sm p-6 border-[0.1px] border-[#3333334f]" >
                                                <h4 className="text-lg font-semibold text-gray-900 mb-4">
                                                    Asset Details
                                                </h4>
                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-4">

                                                    <div className="lg:col-span-3 border-b border-[#135bec2e] pb-3">
                                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                            <FieldItem label="Asset Name" value={asset.AssetName} />
                                                            <FieldItem label="Asset Code" value={asset.AssetCode} />
                                                            <FieldItem label="Serial Type" value={asset.AssetType} />

                                                        </div>
                                                    </div>

                                                    <div className="lg:col-span-3 border-b border-[#135bec2e] pb-3 pt-3">
                                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                            <FieldItem label="Asset Brand" value={asset.AssetBrand} />
                                                            <FieldItem label="Asset Model" value={asset.AssetModel} />
                                                            <FieldItem label="Serial Number" value={asset.SerialNumber} />

                                                        </div>
                                                    </div>

                                                    <div className="lg:col-span-3 pt-3">
                                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                            <FieldItem label="Assigned Date" value={formatDate_dd_MonthName_yy(asset.AssignedDate || "-")} />
                                                            <FieldItem label="Assigned By" value={asset.CreatedBy || "-"} />
                                                        </div>
                                                    </div>
                                                </div>

                                            </section>
                                        </>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === "Project" && (
                    <div className="space-y-4">
                        {projectMasterList.length === 0 ? (
                            <section className="bg-white rounded-xl shadow-sm p-6 border-[0.1px] border-[#3333334f]" >
                                <NoDataView message='No Project Found' />
                            </section>
                        ) : (
                            <div className="space-y-3">
                                {projectMasterList.map((project) => (
                                    <div key={project.ProjectId} className="border border-gray-200 p-3 rounded bg-white flex justify-between">

                                        <div className="flex items-center gap-4">
                                            <div className="w-14 h-14 bg-gray-100 rounded-full overflow-hidden">
                                                <img
                                                    src={project.ProjectPhotoURL}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>

                                            <div>
                                                <div className="font-semibold">{project.ProjectName}</div>
                                                <div className="text-xs text-gray-500">{project.ProjectLocation}</div>
                                            </div>
                                        </div>

                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'Shift Policy' && shiftMappingMasterList && (
                    <div className="space-y-4">
                        {shiftMappingMasterList.length === 0 ? (
                            <section className="bg-white rounded-xl shadow-sm p-6 border-[0.1px] border-[#3333334f]" >
                                <NoDataView message='No Shift Policy Found' />
                            </section>
                        ) : (
                            <div className="space-y-3">
                                {shiftMappingMasterList.map((shiftMappingPolicy) => {

                                    return (
                                        <>
                                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-3">

                                                {/* ================= LEFT SIDE (2/3) ================= */}
                                                <div className="lg:col-span-2 space-y-6">
                                                    <section className="bg-white rounded-xl shadow-sm p-6 border-[0.1px] border-[#3333334f]">
                                                        <h4 className="text-lg font-semibold text-gray-900 mb-4">
                                                            Basic Shift Details
                                                        </h4>
                                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-4">

                                                            <div className="lg:col-span-3">
                                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                                    <FieldItem label="Shift Begin Time" value={shiftMappingPolicy!.ShiftName} />
                                                                    <FieldItem label="Shift End Time" value={shiftMappingPolicy!.ShiftCode} />

                                                                </div>
                                                            </div>
                                                        </div>
                                                    </section>
                                                    {/* ================= SHIFT DURATION ================= */}
                                                    <section className="bg-white rounded-xl shadow-sm p-6 border-[0.1px] border-[#3333334f]">
                                                        <h4 className="text-lg font-semibold text-gray-900 mb-4">
                                                            Time Details
                                                        </h4>
                                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-4">

                                                            <div className="lg:col-span-3 border-b border-[#135bec2e] pb-3">
                                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                                    <FieldItem label="Shift Begin Time" value={shiftMappingPolicy!.ShiftBeginTime} />
                                                                    <FieldItem label="Shift End Time" value={shiftMappingPolicy!.ShiftEndTime} />
                                                                    <FieldItem label="Shift Duration Time" value={shiftMappingPolicy!.ShiftDurationTime} />

                                                                </div>
                                                            </div>
                                                            <div className="lg:col-span-3 pt-3">
                                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                                    <FieldItem label="Shift Work Duration Time" value={shiftMappingPolicy!.ShiftWorkDurationTime} />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </section>

                                                    {/* ================= HALF DAY AND ABSENCE RULES================= */}
                                                    <section className="bg-white rounded-xl shadow-sm p-6 border-[0.1px] border-[#3333334f]">
                                                        <h4 className="text-lg font-semibold text-gray-900 mb-4">
                                                            Advance Setting
                                                        </h4>
                                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-4">

                                                            <div className="lg:col-span-3 border-b border-[#135bec2e] pb-3 pt-3">
                                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">

                                                                    <FieldItem label="First Half Up To" value={shiftMappingPolicy!.FirstHalfUpTo} />
                                                                </div>
                                                            </div>
                                                            <div className="lg:col-span-3 border-b border-[#135bec2e] pb-3 pt-3">
                                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">

                                                                    <FieldItem label="Calculate Absent if working hours less than" value={shiftMappingPolicy!.AbsentWorkingHours} />
                                                                    <FieldItem label="Calculate Half day working hours less than" value={shiftMappingPolicy!.HalfDayWorkingHours} />
                                                                </div>
                                                            </div>

                                                            <div className="lg:col-span-3 pt-3">
                                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">

                                                                    <FieldItem label="Mark Half Day if Intime After" value={shiftMappingPolicy!.HalfDayInTimeAfter} />
                                                                    <FieldItem label="Mark Half Day if Outtime After" value={shiftMappingPolicy!.HalfDayOutTimeBefore} />

                                                                </div>
                                                            </div>
                                                        </div>
                                                    </section>



                                                </div>

                                                {/* ================= RIGHT SIDE (1/3) ================= */}
                                                <div className="lg:col-span-1 space-y-6">

                                                    {/* ================= BREAK DETAILS ================= */}
                                                    <section className="bg-white rounded-xl border border-gray-300 shadow-sm p-6">

                                                        <h4 className="text-lg font-semibold text-gray-900 mb-4">
                                                            Break Details
                                                        </h4>
                                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-4">
                                                            <div className="lg:col-span-3 border-b border-[#135bec2e] pb-3">
                                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                                                                    <FieldItem label="Break Begin Time" value={shiftMappingPolicy!.BreakBeginTime} />
                                                                    <FieldItem label="Break End Time" value={shiftMappingPolicy!.BreakEndTime} />
                                                                </div>
                                                            </div>

                                                            <div className="lg:col-span-3 pt-3">
                                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                                                                    <FieldItem label="Break Duration Time" value={shiftMappingPolicy!.BreakDurationTime} />

                                                                </div>
                                                            </div>
                                                        </div>
                                                    </section>


                                                    <section className="bg-white rounded-xl shadow-sm p-6 border-[0.1px] border-[#3333334f]">
                                                        <h4 className="text-lg font-semibold text-gray-900 mb-4">
                                                            Time Allowed for Late Entry
                                                        </h4>
                                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-4">

                                                            <div className="lg:col-span-3">
                                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-4">
                                                                    <FieldItem label="Grace Time In Minutes" value={shiftMappingPolicy!.GraceTime} />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </section>

                                                    <section className="bg-white rounded-xl shadow-sm p-6 border-[0.1px] border-[#3333334f]">
                                                        <h4 className="text-lg font-semibold text-gray-900 mb-4">
                                                            Remarks
                                                        </h4>
                                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-4">

                                                            <div className="lg:col-span-3">
                                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-4">
                                                                    <FieldItem label="Remarks" value={shiftMappingPolicy!.Remarks} />

                                                                </div>
                                                            </div>
                                                        </div>
                                                    </section>

                                                </div>

                                            </div>
                                        </>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'Week Off Policy' && weekOffMappingMasterList && (
                    <div className="space-y-4">
                        {weekOffMappingMasterList.length === 0 ? (
                            <section className="bg-white rounded-xl shadow-sm p-6 border-[0.1px] border-[#3333334f]" >
                                <NoDataView message='No Week Off Policy Found' />
                            </section>
                        ) : (
                            <div className="space-y-3">
                                {weekOffMappingMasterList.map((weekOffPolicyMapping) => {

                                    return (
                                        <>

                                            {/* ================= BASIC DETAILS ================= */}
                                            <section className="bg-white rounded-xl shadow-sm p-6 border-[0.1px] border-[#3333334f] mt-3">
                                                <h4 className="text-lg font-semibold text-gray-900 mb-4">
                                                    Week Off Policy Details
                                                </h4>
                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-4">

                                                    <div className="lg:col-span-3 border-b border-[#135bec2e] pb-3">
                                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                            <FieldItem label="Week Off Policy Name" value={weekOffPolicyMapping!.WeekOffPolicyName} />
                                                            <FieldItem label="Week Off Policy Code" value={weekOffPolicyMapping!.WeekOffPolicyCode} />
                                                            <FieldItem label="Week Days" value={weekOffPolicyMapping!.WeekDays} />

                                                        </div>
                                                    </div>
                                                    <div className="lg:col-span-3 pt-3">
                                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                            <FieldItem label="Week Days Starts On" value={weekOffPolicyMapping!.WeekDaysStartsOn} />
                                                        </div>
                                                    </div>
                                                </div>
                                            </section>

                                            {/* ================= WEEK OFF DETAILS ================= */}
                                            <section className="bg-white rounded-xl shadow-sm p-6 border-[0.1px] border-[#3333334f]">
                                                <h4 className="text-lg font-semibold text-gray-900 mb-4">
                                                    Week Off Details
                                                </h4>
                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-4">

                                                    <div className="lg:col-span-3 border-b border-[#135bec2e] pb-3 pt-3">
                                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                            <FieldItem label="Weekly Off" value={weekOffPolicyMapping!.WeeklyOff} />
                                                            <FieldItem label="Weekly Off2" value={weekOffPolicyMapping!.WeeklyOff2} />
                                                            <FieldItem label="Weekly Off2 Type" value={weekOffPolicyMapping!.WeeklyOff2Type} />

                                                        </div>
                                                    </div>

                                                    <div className="lg:col-span-3 pt-3">
                                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-4">
                                                            <FieldItem label="Not Applicable For Months" value={weekOffPolicyMapping!.NotApplicableForMonths} />

                                                        </div>
                                                    </div>
                                                </div>
                                            </section>
                                        </>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}


            </div>

            {/* Education Details Modal */}
            <Modal
                isOpen={isEducationModalOpen}
                onClose={handleCloseEducationModal}
                title={isEditEducationMode ? "Update Education Details" : "Add Education Details"}
                onSubmit={handleEducationFormSubmit}
                saveText={isEditEducationMode ? "Update" : "Add"}
                cancelText="Cancel"
                onCancel={handleCloseEducationModal}
                loading={isLoading}
                size="xl"
            >
                <div className="space-y-4">
                    <Input
                        label="Qualification"
                        value={educationFormData.Qualification || ''}
                        onChange={(e) => setEducationFormData({ ...educationFormData, Qualification: e.target.value })}
                        required
                        error={educationFormErrors.Qualification}
                        placeholder="Enter Qualification"
                    />
                    <Input
                        label="College Name"
                        value={educationFormData.CollegeName || ''}
                        onChange={(e) => setEducationFormData({ ...educationFormData, CollegeName: e.target.value })}
                        required
                        error={educationFormErrors.CollegeName}
                        placeholder="Enter College Name"
                    />
                    <Input
                        label="Passing Year"
                        value={educationFormData.Passing || ''}
                        onChange={(e) => setEducationFormData({ ...educationFormData, Passing: e.target.value })}
                        required
                        error={educationFormErrors.Passing}
                        placeholder="Enter Passing Year"
                    />
                </div>
            </Modal>

            {/* Experience Details Modal */}
            <Modal
                isOpen={isExperienceModalOpen}
                onClose={handleCloseExperienceModal}
                title={isEditExperienceMode ? "Update Experience Details" : "Add Experience Details"}
                onSubmit={handleExperienceFormSubmit}
                saveText={isEditExperienceMode ? "Update" : "Add"}
                cancelText="Cancel"
                onCancel={handleCloseExperienceModal}
                loading={isLoading}
                size="xl"
            >
                <div className="space-y-4">
                    <Input
                        label="Company Name"
                        value={experienceFormData.CompanyName || ''}
                        onChange={(e) => setExperienceFormData({ ...experienceFormData, CompanyName: e.target.value })}
                        required
                        error={experienceFormErrors.CompanyName}
                        placeholder="Enter Company Name"
                    />
                    <Input
                        label="Role"
                        value={experienceFormData.Role || ''}
                        onChange={(e) => setExperienceFormData({ ...experienceFormData, Role: e.target.value })}
                        required
                        error={experienceFormErrors.Role}
                        placeholder="Enter Role"
                    />
                    <Input
                        label="Tenure"
                        value={experienceFormData.Tenure || ''}
                        onChange={(e) => setExperienceFormData({ ...experienceFormData, Tenure: e.target.value })}
                        required
                        error={experienceFormErrors.Tenure}
                        placeholder="Enter Tenure"
                    />
                </div>
            </Modal>

            {/* Employee Details Modal */}
            <Modal
                isOpen={isEmployeeModalOpen}
                onClose={handleCloseEmployeeModal}
                title={isEditEmployeeMode ? "Update Basic Details" : "Add Basic Details"}
                onSubmit={handleEmployeeFormSubmit}
                saveText={isEditEmployeeMode ? "Update" : "Add"}
                cancelText="Cancel"
                onCancel={handleCloseEmployeeModal}
                loading={isLoading}
                size="xl"
            >
                <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                        <Input
                            label="First Name"
                            value={employeeFormData.FirstName || ''}
                            onChange={(e) => setEmployeeFormData({ ...employeeFormData, FirstName: e.target.value })}
                            required
                            placeholder="Enter First Name"
                        />
                        <Input
                            label="Middle Name"
                            value={employeeFormData.MiddleName || ''}
                            onChange={(e) => setEmployeeFormData({ ...employeeFormData, MiddleName: e.target.value })}
                            required
                            error={employeeFormErrors.MiddleName || ''}
                            placeholder="Enter Middle Name"
                        />
                        <Input
                            label="Last Name"
                            value={employeeFormData.LastName || ''}
                            onChange={(e) => setEmployeeFormData({ ...employeeFormData, LastName: e.target.value })}
                            required
                            error={employeeFormErrors.LastName || ''}
                            placeholder="Enter Last Name"
                        />
                        <Input
                            label="Gender"
                            value={employeeFormData.Gender || ''}
                            onChange={(e) => setEmployeeFormData({ ...employeeFormData, Gender: e.target.value })}
                            required
                            error={employeeFormErrors.Gender}
                            placeholder="Enter Gender"
                        />
                        <Input
                            label="Marital Status"
                            value={employeeFormData.MaritalStatus || ''}
                            onChange={(e) => setEmployeeFormData({ ...employeeFormData, MaritalStatus: e.target.value })}
                            required
                            error={employeeFormErrors.MaritalStatus}
                            placeholder="Enter Marital Status"
                        />
                        <Input
                            label="Blood Group"
                            value={employeeFormData.BloodGroup || ''}
                            onChange={(e) => setEmployeeFormData({ ...employeeFormData, BloodGroup: e.target.value })}
                            required
                            error={employeeFormErrors.BloodGroup}
                            placeholder="Enter Blood Group"
                        />
                        <DatePickerInput
                            label="DOB"
                            value={employeeFormData.DateOfBirth ? formatDate_dd_mm_yyyy(employeeFormData.DateOfBirth) : ''}
                            onChange={(val) => setEmployeeFormData(prev => ({ ...prev, DateOfBirth: val ? convert_dd_mm_yyyy_To_Yyyy_mm_dd(val) ?? '' : '' }))}
                            required
                            error={employeeFormErrors.DateOfBirth}
                        />
                        <Input
                            label="Email Id"
                            value={employeeFormData.EmailId || ''}
                            onChange={(e) => setEmployeeFormData({ ...employeeFormData, EmailId: e.target.value })}
                            required
                            error={employeeFormErrors.EmailId || ''}
                            placeholder="Enter Email Id"
                        />
                        <Input
                            label="Personal Mobile No"
                            value={employeeFormData.PersonalMobileNumber || ''}
                            onChange={(e) => setEmployeeFormData({ ...employeeFormData, PersonalMobileNumber: e.target.value })}
                            required
                            error={employeeFormErrors.PersonalMobileNumber}
                            placeholder="Enter Personal Mobile Number"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-1 gap-2">

                        <Input
                            label="Communication Address"
                            value={employeeFormData.CommunicationAddress || ''}
                            onChange={(e) => setEmployeeFormData({ ...employeeFormData, CommunicationAddress: e.target.value })}
                            required
                            error={employeeFormErrors.CommunicationAddress}
                            placeholder="Enter Communication Address"
                        />
                        <Input
                            label="Permanent Address"
                            value={employeeFormData.PermanentAddress || ''}
                            onChange={(e) => setEmployeeFormData({ ...employeeFormData, PermanentAddress: e.target.value })}
                            required
                            error={employeeFormErrors.PermanentAddress}
                            placeholder="Enter Permanent Address"
                        />
                    </div>
                </div>
            </Modal>

            {/* Delete Confirmation Dialogs */}
            <ConfirmationDialogBox
                isOpen={isDeleteEducationDialogOpen}
                onClose={() => {
                    setIsDeleteEducationDialogOpen(false);
                    setSelectedEducationItem(null);
                }}
                onConfirm={handleConfirmDeleteEducation}
                title="Delete Education Details"
                message={`Are you sure you want to delete this education detail? This action cannot be undone.`}
                confirmText="Delete"
                cancelText="Cancel"
                loading={isLoading}
                variant="danger"
            />

            <ConfirmationDialogBox
                isOpen={isDeleteExperienceDialogOpen}
                onClose={() => {
                    setIsDeleteExperienceDialogOpen(false);
                    setSelectedExperienceItem(null);
                }}
                onConfirm={handleConfirmDeleteExperience}
                title="Delete Experience Details"
                message={`Are you sure you want to delete this experience detail? This action cannot be undone.`}
                confirmText="Delete"
                cancelText="Cancel"
                loading={isLoading}
                variant="danger"
            />
        </div >
    )
}

export default Profile
