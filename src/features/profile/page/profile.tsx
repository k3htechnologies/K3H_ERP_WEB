import React, { useEffect, useState } from 'react'
import useToast from '@/core/hooks/useToast';
import { runApiWithLoader } from '@/core/utils/apiLoaderHelper';
import type { EmployeeMasterData, EmployeeReportingCycle, FilterWithPaginationEmployeeMasterRequest, UpdateEmployeeMasterRequest, UpdateEmployeeProfilePhoto } from '@/features/employeeMaster/models/EmployeeMasterModel';
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
import type { FilterWithPaginationProjectMasterRequest, ProjectMasterData } from '@/features/projectMaster/models/ProjectMasterModel';
import { projectMasterService } from '@/features/projectMaster/services/ProjectMasterService';
import type { EmployeeEducationDetailsData, FilterWithPaginationEmployeeEducationDetailsRequest, AddUpdateEmployeeEducationDetailsRequest } from '@/features/employeeMaster/models/EmployeeEducationDetailsModel';
import type { EmployeeExperienceDetailsData, FilterWithPaginationEmployeeExperienceDetailsRequest, AddUpdateEmployeeExperienceDetailsRequest } from '@/features/employeeMaster/models/EmployeeExperienceDetailsModal';
import { employeeEducationDetailsService } from '@/features/employeeMaster/services/EmployeeEducationDetailsService';
import { employeeExperienceDetailsService } from '@/features/employeeMaster/services/EmployeeExperienceDetailsService';
import { Modal } from '@/ui/components/Modal/Modal';
import { Input } from '@/ui/components/forms/Input';
import { ConfirmationDialogBox } from '@/core/utils/confirmationDialogBox';
import { BriefcaseBusiness, ChevronDown, Contact, ContactRound, Edit, Edit2, GitBranch, History, IdCardIcon, Landmark, Mail, MapPin, Phone, Plus, School, Trash2 } from 'lucide-react';
import { Button } from '@/ui/components/forms/Button';
import type { DeleteEmployeeEducationDetailsRequest } from '@/features/employeeMaster/models/EmployeeEducationDetailsModel';
import type { DeleteEmployeeExperienceDetailsRequest } from '@/features/employeeMaster/models/EmployeeExperienceDetailsModal';
import type { BranchAssociationsMasterData, FilterWithPaginationBranchAssociationsMasterRequest } from '@/features/branchAssociationsMaster/models/BranchAssociationsMasterModel';
import { branchAssociationsService } from '@/features/branchAssociationsMaster/services/BranchAssociationsMasterService';
import { parseDocumentUrls } from '@/core/utils/documentUtils';
import MultiImageViewer from '@/ui/components/ImageViewer/ImageViewer';
import DatePickerInput from '@/ui/components/forms/Datepicker';
import { filterAadhaar, filterDrivingLicenseNumber, filterMobile, filterPAN, filterPassportNumber, filterVoterId, isValidAadhaar, isValidDrivingLicenseNumber, isValidPAN, isValidPassportNumber, isValidVoterId } from '@/core/utils/fileValidation';
import { SinglePageSelection } from '@/ui/components/DropDown/SinglePageSelection';
import { BLOOD_GROUP_OPTIONS, GENDER_OPTIONS, MARITAL_STATUS_OPTIONS } from '@/core/constants';
import { TextArea } from '@/ui/components/forms/Textarea';
import { getNameInitials } from '@/core/utils/getNameInitials';
import { sendEmail } from '@/core/utils/comman';
import Accordion from '@/ui/components/Card/Accordion';
import ProfilePhotoUploader from '@/ui/components/ImagePicker/ProfilePhotoUploader';

const initialFormState = (): UpdateEmployeeProfilePhoto => ({
    EmployeeId: 0,
    ProfilePhotoURL: null,
    RemoveProfilePhotoURL: null,
});

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
        UniqueKey: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
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
        PermanentAddress: '',

        AadharCardNumber: '',
        PassportNumber: '',
        PanCardNumber: '',
        DrivingLicenceNumber: '',
        VoterCardNumber: '',
    });
    const [employeeFormErrors, setEmployeeFormErrors] = useState<{
        FirstName?: string;
        LastName?: string;
        MiddleName?: string
        BloodGroup?: string;
        Gender?: string;
        MaritalStatus?: string;
        DateOfBirth?: string;
        EmailId?: string;
        PersonalMobileNumber?: string;
        PermanentAddress?: string;
        CommunicationAddress?: string,
        AadharCardNumber?: string,
        PassportNumber?: string,
        PanCardNumber?: string,
        DrivingLicenceNumber?: string,
        VoterCardNumber?: string,
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

    const [formData, setFormData] = useState<UpdateEmployeeProfilePhoto>(() => initialFormState());
    const [errors, setErrors] = useState<{ [k: string]: string }>({});
    const [editingEmployeeProfilePhotoData, setEditingEmployeeProfilePhotoData] = useState<UpdateEmployeeProfilePhoto | null>(null);
    const [isAddUpdateModalOpen, setIsAddUpdateModalOpen] = useState(false);
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

    useEffect(() => {
        if (!isAddUpdateModalOpen) return;

        if (editingEmployeeProfilePhotoData) {
            setFormData({
                EmployeeId: editingEmployeeProfilePhotoData.EmployeeId || 0,
                ProfilePhotoURL: editingEmployeeProfilePhotoData.ProfilePhotoURL || null,
                RemoveProfilePhotoURL: null,
            });
        } else {

            const employeeId = Number(LocalStorageHelper.getStoredEmployeeData()?.EmployeeId ?? 0);

            setFormData({
                EmployeeId: employeeId,
                ProfilePhotoURL: null,
                RemoveProfilePhotoURL: null,
            });
        }
        setErrors({});
    }, [isAddUpdateModalOpen, editingEmployeeProfilePhotoData,]);

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
                AadharCardNumber: item.AadharCardNumber || '',
                PassportNumber: item.PassportNumber || '',
                PanCardNumber: item.PanCardNumber || '',
                DrivingLicenceNumber: item.DrivingLicenceNumber || '',
                VoterCardNumber: item.VoterCardNumber || '',
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
            UniqueKey: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
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

            AadharCardNumber: '',
            PassportNumber: '',
            PanCardNumber: '',
            DrivingLicenceNumber: '',
            VoterCardNumber: '',

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
            Gender?: string;
            AadharCardNumber?: string,
            PassportNumber?: string,
            PanCardNumber?: string,
            DrivingLicenceNumber?: string,
            VoterCardNumber?: string,
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
        if (!employeeFormData.MaritalStatus) {
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
        if (!employeeFormData.Gender) {
            errors.Gender = 'Gender is required';
        }

        if (!employeeFormData.AadharCardNumber?.trim()) {
            errors.AadharCardNumber = "Aadhaar Card Number is required";
        } else if (!isValidAadhaar(employeeFormData.AadharCardNumber?.trim())) {
            errors.AadharCardNumber = "Enter a valid Aadhaar Card Number";
        }

        if (!employeeFormData.PanCardNumber?.trim()) {
            errors.PanCardNumber = "PAN Card Number is required";
        } else if (!isValidPAN(employeeFormData.PanCardNumber?.trim())) {
            errors.PanCardNumber = "Enter a valid PAN Card Number";
        }

        if (employeeFormData.PassportNumber?.trim() !== "" && !isValidPassportNumber(employeeFormData.PassportNumber?.trim())) {
            errors.PassportNumber = "Enter a valid Passport Number";
        }

        if (employeeFormData.DrivingLicenceNumber?.trim() !== "" && !isValidDrivingLicenseNumber(employeeFormData.DrivingLicenceNumber?.trim())) {
            errors.DrivingLicenceNumber = "Enter a valid Driving Licence Number";
        }

        if (employeeFormData.VoterCardNumber?.trim() !== "" && !isValidVoterId(employeeFormData.VoterCardNumber?.trim())) {
            errors.VoterCardNumber = "Enter a valid Voter Card Number";
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

                    AadharCardNumber: employeeFormData.AadharCardNumber?.trim() || '',
                    PassportNumber: employeeFormData.PassportNumber?.trim() || '',
                    PanCardNumber: employeeFormData.PanCardNumber?.trim() || '',
                    DrivingLicenceNumber: employeeFormData.DrivingLicenceNumber?.trim() || '',
                    VoterCardNumber: employeeFormData.VoterCardNumber?.trim() || '',
                };

                const response = await employeeMasterService.apiCallUpdateEmployeeMaster(params);

                if (E.isRight(response)) {

                    addToast({ type: 'success', title: response.right.SuccessMessage[0] });

                    handleCloseEmployeeModal();

                    setEmployeeMasterList(response.right.Data);

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

    const employeeId = Number(LocalStorageHelper.getStoredEmployeeData()?.EmployeeId ?? 0);
    const emp = LocalStorageHelper.getStoredEmployeeData?.() ?? null;
    const profilePhotoURL = emp?.ProfilePhotoURL ?? '—';

    const handleAddEmployeeProfilePhotoModal = () => {
        setEditingEmployeeProfilePhotoData(null);
        setFormData({
            EmployeeId: employeeId,
            ProfilePhotoURL: null,
            RemoveProfilePhotoURL: null,
        });
        setErrors({});
        setIsAddUpdateModalOpen(true);
    };

    const handleEditEmployeeProfilePhotoModal = () => {

        const existingProfilePhotoURL = employeeData?.ProfilePhotoURL ?? '';

        setEditingEmployeeProfilePhotoData({
            EmployeeId: employeeId,
            ProfilePhotoURL: existingProfilePhotoURL || null,
            RemoveProfilePhotoURL: null,
        });
        setFormData({
            EmployeeId: employeeId,
            ProfilePhotoURL: existingProfilePhotoURL || null,
            RemoveProfilePhotoURL: null,
        });
        setErrors({});
        setIsAddUpdateModalOpen(true);
    };

    const PushEmployeeProfilePhotoFormData = (file: File): FormData => {

        const fd = new FormData();

        fd.append('EmployeeId', String(formData.EmployeeId));
        fd.append('ProfilePhotoURL', file, file.name);
        fd.append('RemoveProfilePhotoURL', '');

        return fd;
    };

    const handleAddUpdateEmployeeProfilePhoto = async (file: File | null) => {
        if (!file) return;

        setErrors({});

        if (!['image/jpeg', 'image/jpg', 'image/png',].includes(file.type)
        ) {
            setErrors({ ProfilePhotoURL: 'Only JPG, JPEG or PNG files are allowed.', });
            return;
        }

        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,

            async () => {

                const payload = PushEmployeeProfilePhotoFormData(file);

                const response = await employeeMasterService.apiCallUpdateEmployeeProfilePhoto(payload);

                if (E.isRight(response)) {

                    const newProfilePhotoURL = response.right.SuccessMessage?.[0] ?? '';

                    addToast({ type: 'success', title: 'Profile photo Uploaded successfully', });

                    const employeeData = LocalStorageHelper.getStoredEmployeeData();

                    if (employeeData) {
                        LocalStorageHelper.storeEmployeeData({
                            ...employeeData,
                            ProfilePhotoURL: newProfilePhotoURL,
                        });
                    }

                    setIsAddUpdateModalOpen(false);
                    setEditingEmployeeProfilePhotoData(null);
                    setErrors({});
                    setFormData(initialFormState());

                } else {
                    addToast({ type: 'error', title: response.left?.message || 'Profile Photo upload failed', });
                }
                return response;
            },
            undefined,
            (error: any) => {
                addToast({ type: 'error', title: error?.message || 'Profile Photo upload failed', });
            },
            undefined,
            'Update Profile Photo'
        );
    };

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">

            <HeaderActionBar
                titleText={'Profile Details : '}
                subTitleText={employeeData?.FirstName}
                subSubTitleText={employeeData?.EmployeeCode}
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

            <div className='pt-3'>
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
            </div>

            {activeTab === 'Overview' && employeeData && (
                <>
                    <div className="grid grid-cols-12 gap-6">

                        <div className="col-span-6 space-y-6 pt-5">

                            <section className="bg-white rounded-3xl border border-gray-200 shadow-sm p-5">
                                <div className='flex justify-between'>

                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="relative flex-shrink-0">

                                                {profilePhotoURL && profilePhotoURL !== '—' ? (
                                                    <img
                                                        src={profilePhotoURL}
                                                        alt="Profile"
                                                        className="w-12 h-12 rounded-full object-cover border border-gray-200"
                                                    />
                                                ) : (
                                                    <div className="w-12 h-12 rounded-full bg-gray-600 flex items-center justify-center text-white font-semibold text-sm">
                                                        {getNameInitials(
                                                            `${employeeData?.FirstName} ${employeeData?.LastName}`
                                                        )}
                                                    </div>
                                                )}

                                                <div className="absolute -bottom-1 -right-1 bg-white rounded-full border border-gray-200 shadow-sm">
                                                    <Button
                                                        color="transparent"
                                                        size="sm"
                                                        style={{
                                                            color: 'blue',
                                                            padding: '0px',
                                                            minWidth: '22px',
                                                            width: '22px',
                                                            height: '22px',
                                                        }}
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            e.stopPropagation();

                                                            const employeeData = LocalStorageHelper.getStoredEmployeeData();

                                                            const existingProfilePhotoURL = employeeData?.ProfilePhotoURL ?? '';

                                                            if (existingProfilePhotoURL) {
                                                                handleEditEmployeeProfilePhotoModal();

                                                            } else {
                                                                handleAddEmployeeProfilePhotoModal();
                                                            }
                                                        }}
                                                        leftIcon={<Edit2 className="h-3.5 w-3.5" />}
                                                    />
                                                </div>
                                            </div>

                                            <div className="min-w-0">
                                                <div className="flex items-center gap-3 flex-wrap">

                                                    <h1 className="text-xl font-bold text-slate-800">
                                                        {employeeData?.FirstName}{' '}
                                                        {employeeData?.MiddleName}{' '}
                                                        {employeeData?.LastName}
                                                    </h1>

                                                    <span className="px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-2 border bg-[#E0E7FF] text-[#4338CA] border-blue-200">
                                                        {safe(employeeData!.EmployeeCode)}
                                                    </span>

                                                </div>
                                            </div>

                                        </div>
                                    </div>

                                    <Button
                                        color="transparent"
                                        size="sm"
                                        style={{ color: "blue", padding: "0px 8px" }}
                                        onClick={() => handleOpenEmployeeModal(employeeData)}
                                        leftIcon={<Edit className="h-4 w-4" />}
                                    />
                                </div>

                                <div className="pt-5">
                                    <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-xs">
                                        <FieldItem label="Mobile" value={`+91 ${employeeData!.PersonalMobileNumber || "-"}`} />
                                        <FieldItem
                                            label="Email Id"
                                            value={
                                                <a
                                                    href={`mailto:${employeeData.EmailId}`}
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        sendEmail(employeeData.EmailId || '');
                                                    }}
                                                    className="text-blue-600 text-sm underline truncate"
                                                >
                                                    {employeeData.EmailId ?? '-'}
                                                </a>
                                            }
                                        />

                                        <FieldItem label="DOB" value={employeeData.DateOfBirth ? formatDate_dd_MonthName_yy(employeeData.DateOfBirth) : "-"} />
                                        <FieldItem label="Gender" value={employeeData.Gender || "-"} />
                                        <FieldItem label="Blood Group" value={employeeData.BloodGroup || "-"} />
                                        <FieldItem label="Marital Status" value={employeeData.MaritalStatus || "-"} />
                                    </div>

                                    <div className="border-t border-gray-200 my-3" />

                                    <h3 className="text-md font-medium text-[#1D1D1D80] truncate pb-4">Identity Documents</h3>

                                    <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-xs">
                                        <div className="text-sm font-medium text-[#1D1D1D80] truncate">
                                            Aadhaar :
                                            <span className="inline-block ml-2 rounded-lg bg-[#EEF3FF] px-3 py-1 text-md text-gray-900">
                                                {employeeData.AadharCardNumber || "-"}
                                            </span>
                                        </div>

                                        <div className="text-sm font-medium text-[#1D1D1D80] truncate">
                                            PAN :
                                            <span className="inline-block ml-2 rounded-lg bg-[#EEF3FF] px-3 py-1 text-md text-gray-900">
                                                {employeeData.PanCardNumber || "-"}
                                            </span>
                                        </div>

                                        <div className="text-sm font-medium text-[#1D1D1D80] truncate">
                                            Passport :
                                            <span className="inline-block ml-2 rounded-lg bg-[#EEF3FF] px-3 py-1 text-md text-gray-900">
                                                {employeeData.PassportNumber || "-"}
                                            </span>
                                        </div>

                                        <div className="text-sm font-medium text-[#1D1D1D80] truncate">
                                            Voter ID :
                                            <span className="inline-block ml-2 rounded-lg bg-[#EEF3FF] px-3 py-1 text-md text-gray-900">
                                                {employeeData.VoterCardNumber || "-"}
                                            </span>
                                        </div>

                                        <div className="col-span-2 text-sm font-medium text-[#1D1D1D80]">
                                            Driving Licence:
                                            <span className="inline-block ml-2 rounded-lg bg-[#EEF3FF] px-3 py-1 text-md text-gray-900 break-all">
                                                {employeeData.DrivingLicenceNumber || "-"}
                                            </span>
                                        </div>

                                    </div>
                                </div>
                            </section>

                            {/* Address Details */}
                            <section className="bg-white rounded-3xl border border-gray-200 shadow-sm p-5 h-[455px] flex flex-col overflow-hidden ">
                                <div className="flex items-center gap-3 mb-5 shrink-0">
                                    <div className="w-11 h-11 rounded-xl bg-[#FFFBEB] flex items-center justify-center">
                                        <MapPin className="w-5 h-5 text-[#D97706]" />
                                    </div>

                                    <h2 className="text-[16px] font-semibold text-slate-800">
                                        Address Details
                                    </h2>
                                </div>

                                <div className="flex-1 overflow-y-auto thin-scroll pr-2">
                                    <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-xs">
                                        <FieldItem label="Country" value={employeeData.CountryName || "-"} />
                                        <FieldItem label="State" value={employeeData.StateName || "-"} />
                                        <FieldItem label="District" value={employeeData.DistrictName || "-"} />
                                        <FieldItem label="City" value={employeeData.CityName || "-"} />
                                        <FieldItem label="Village / Area" value={employeeData.VillageName || "-"} />
                                    </div>

                                    <div className="border-t border-gray-200 my-3" />

                                    <div className="grid grid-cols-1 gap-y-3 text-xs pt-2">
                                        <FieldItem label="Permanent Address" value={employeeData.PermanentAddress || "-"} />
                                    </div>

                                    <div className="grid grid-cols-1 gap-y-3 text-xs pt-4">
                                        <FieldItem label="Communication Address" value={employeeData.CommunicationAddress || "-"} />
                                    </div>
                                </div>
                            </section>

                            {/* Emergency Contact */}
                            <section className="bg-white rounded-3xl border border-gray-200 shadow-sm p-5">
                                <div className="flex items-center gap-3 mb-5">
                                    <div className="w-11 h-11 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
                                        <Contact className="w-5 h-5 text-emerald-600" />
                                    </div>

                                    <h2 className="text-[16px] font-semibold text-slate-800">
                                        Emergency Contact
                                    </h2>
                                </div>

                                <div className="mt-3 rounded-lg bg-[#EEF3FF] p-3">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <div className="text-sm font-medium text-[#1D1D1D80]">
                                                Relation :
                                                <span className="ml-1 text-md text-gray-900">
                                                    {employeeData.EmergencyContactPersonRelationship}
                                                </span>
                                            </div>

                                            <div className="mt-1 text-sm font-medium text-[#111C2D]">
                                                +91 {employeeData.EmergencyMobileNumber}
                                            </div>
                                        </div>

                                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#2563EB33]">
                                            <Phone className="h-4 w-4 text-[#004AC6]" />
                                        </div>
                                    </div>
                                </div>
                            </section>
                        </div>

                        <div className="col-span-6 space-y-6 pt-5">

                            {/* Employee Information */}
                            <section className="bg-white rounded-3xl border border-gray-200 shadow-sm p-5">
                                <div className="flex items-center gap-3 mb-5">
                                    <div className="w-11 h-11 rounded-xl bg-emerald-100 flex items-center justify-center">
                                        <ContactRound className="w-5 h-5 text-emerald-700" />
                                    </div>

                                    <h2 className="text-[16px] font-semibold text-slate-800">
                                        Employee Information
                                    </h2>
                                </div>

                                <div className="grid grid-cols-1 gap-y-3 gap-x-4 text-xs pb-4">
                                    <FieldItem label="Company" value={employeeData.CompanyName || "-"} />
                                </div>

                                <div className="grid grid-cols-2 gap-y-4 gap-x-4">
                                    <FieldItem label="Branch" value={employeeData.Branch || "-"} />
                                    <FieldItem label="Department" value={employeeData.Department || "-"} />
                                    <FieldItem label="Designation" value={employeeData.Designation || "-"} />
                                    <div className="grid grid-cols-1 gap-y-3 gap-x-4 text-gray-900 pb-0">
                                        <FieldItem
                                            label="Employee Type"
                                            value={
                                                <span className="inline-block font-medium rounded-lg bg-[#EEF3FF] px-2 py-1 text-gray-900 text-sm">
                                                    {employeeData.EmployeeType || "-"}
                                                </span>
                                            }
                                        />
                                    </div>

                                    <FieldItem label="Joining Date" value={formatDate_dd_MonthName_yy(safe(employeeData!.JoiningDate))} />
                                    <FieldItem label="Probation Date" value={formatDate_dd_MonthName_yy(safe(employeeData!.ProbationDate))} />
                                    <FieldItem label="Office Mobile Number" value={`+91 ${employeeData.OfficeMobileNumber || "-"} `} />
                                    <FieldItem
                                        label="Office Email Id"
                                        value={
                                            <a
                                                href={`mailto:${employeeData.OfficeEmailId}`}
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    sendEmail(employeeData.OfficeEmailId || '');
                                                }}
                                                className="text-blue-600 text-sm underline truncate"
                                            >
                                                {employeeData.OfficeEmailId ?? '-'}
                                            </a>
                                        }
                                    />
                                    <FieldItem label="Report Person" value={employeeData.ReportPersonName || "-"} />
                                    <FieldItem label="Id Card Issued Date" value={formatDate_dd_MonthName_yy(safe(employeeData!.IdCardIssuedDate))} />
                                </div>
                            </section>

                            {/* Reporting Structure */}
                            <section className="bg-white rounded-3xl border border-gray-200 shadow-sm p-5 h-[630px]">
                                <div className="flex items-center gap-3 mb-5">
                                    <div className="w-11 h-11 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0">
                                        <Contact className="w-5 h-5 text-indigo-600" />
                                    </div>

                                    <h2 className="text-[16px] font-semibold text-slate-800">
                                        Reporting Structure
                                    </h2>
                                </div>

                                <div className="h-[610px] overflow-y-auto thin-scroll pr-2">
                                    {employeeReportingCycleList && employeeReportingCycleList.length > 0 ? (
                                        employeeReportingCycleList.map((item, index) => (
                                            <div key={index} className="flex gap-4 relative">

                                                <div className="flex flex-col items-center">

                                                    {(() => {

                                                        const fullName = item?.FullName?.trim();

                                                        const profilePhotoURL = item?.ProfilePhotoURL;

                                                        const hasProfile =
                                                            profilePhotoURL &&
                                                            profilePhotoURL !== "" &&
                                                            profilePhotoURL !== "—";

                                                        return hasProfile ? (
                                                            <img
                                                                src={profilePhotoURL}
                                                                alt={fullName}
                                                                className="w-10 h-10 rounded-full object-cover border border-gray-300"
                                                                onError={(e) => (e.currentTarget.style.display = "none")}
                                                            />
                                                        ) : (
                                                            <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center text-white font-semibold text-sm">
                                                                {getNameInitials(fullName)}
                                                            </div>
                                                        );
                                                    })()}

                                                    {index !== employeeReportingCycleList.length - 1 && (
                                                        <div className="w-px bg-gray-500 flex-1 mt-1"></div>
                                                    )}

                                                </div>

                                                <div className="flex-1 pb-4">
                                                    <div className="flex justify-between">
                                                        <span className="font-semibold text-gray-500">{item.FullName || '-'}</span>
                                                        <span className="ml-2 text-sm text-gray-500">
                                                            ({item.EmployeeCode || '-'})
                                                        </span>
                                                    </div>

                                                    <div className="text-sm text-gray-500 pt-2">
                                                        {item.Designation || '-'}
                                                    </div>
                                                    <div className="text-sm text-gray-400 pt-2">
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

                        </div>
                    </div>

                    {/* Bank Details */}
                    <section className="bg-white rounded-3xl border border-gray-200 shadow-sm mt-6 p-5">
                        <div className="flex items-center gap-3 mb-5">
                            <div className="w-11 h-11 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0">
                                <Landmark className="w-5 h-5 text-indigo-600" />
                            </div>

                            <h2 className="text-[16px] font-semibold text-slate-800">
                                Bank Details
                            </h2>
                        </div>

                        <div className="grid grid-cols-4 gap-y-3 gap-x-4">
                            <FieldItem label="Bank Name" value={employeeData.BankName || "-"} />
                            <FieldItem
                                label="Account No"
                                value={
                                    <span className="inline-block  font-medium rounded-lg bg-[#EEF3FF] px-2 py-1 text-gray-900 text-sm">
                                        {employeeData.AccountNo || "-"}
                                    </span>
                                }
                            />
                            <FieldItem label="Branch" value={employeeData.BankBranchName || "-"} />
                            <FieldItem label="IFSC Code" value={employeeData.IFSCCode || "-"} />
                        </div>
                    </section>

                    <Accordion
                        allowMultipleOpen
                        className="grid grid-cols-3 gap-4 pt-6 items-start"
                        items={[
                            { key: "Education Details", title: "Education Details" },
                            { key: "Experience Details", title: "Experience Details" },
                            { key: "Branch Associations", title: "Branch Associations" },
                        ]}
                        renderItem={(item, isOpen, toggle) => (
                            <section >

                                <div className="flex items-center justify-between p-5 cursor-pointer"
                                    onClick={async () => {
                                        toggle();

                                        if (
                                            item.key === "Education Details" &&
                                            !loadedSections.educationDetails
                                        ) {
                                            await loadEmployeeEducationDetails();
                                            setLoadedSections(prev => ({
                                                ...prev,
                                                educationDetails: true,
                                            }));
                                        }

                                        if (
                                            item.key === "Experience Details" &&
                                            !loadedSections.experienceDetails
                                        ) {
                                            await loadEmployeeExperienceDetails();
                                            setLoadedSections(prev => ({
                                                ...prev,
                                                experienceDetails: true,
                                            }));
                                        }

                                        if (
                                            item.key === "Branch Associations" &&
                                            !loadedSections.branchAssociations
                                        ) {
                                            await loadEmployeeBranchAssociations();
                                            setLoadedSections(prev => ({
                                                ...prev,
                                                branchAssociations: true,
                                            }));
                                        }
                                    }}
                                >
                                    <div className="flex items-center gap-3">
                                        <div
                                            className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${item.key === "Branch Associations"
                                                ? "bg-violet-50"
                                                : "bg-indigo-50"
                                                }`}
                                        >
                                            {item.key === "Education Details" && (
                                                <School className="w-5 h-5 text-indigo-600" />
                                            )}

                                            {item.key === "Experience Details" && (
                                                <BriefcaseBusiness className="w-5 h-5 text-indigo-600" />
                                            )}

                                            {item.key === "Branch Associations" && (
                                                <GitBranch className="w-5 h-5 text-violet-600" />
                                            )}
                                        </div>

                                        <h2 className="text-[16px] font-semibold text-slate-800">
                                            {item.title}
                                        </h2>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        {item.key !== "Branch Associations" && (
                                            <Button
                                                color="transparent"
                                                isborderRadius
                                                size="sm"
                                                style={{
                                                    color: "blue",
                                                    padding: "4px 8px",
                                                }}
                                                onClick={(e) => {
                                                    e.stopPropagation();

                                                    if (item.key === "Education Details") {
                                                        handleOpenEducationModal();
                                                    } else if (item.key === "Experience Details") {
                                                        handleOpenExperienceModal();
                                                    }
                                                }}
                                                leftIcon={<Plus className="h-4 w-4" />}
                                            />
                                        )}

                                        <ChevronDown
                                            className={`w-5 h-5 text-gray-500 transition-transform duration-300 ${isOpen ? "rotate-180" : ""
                                                }`}
                                        />
                                    </div>
                                </div>

                                {isOpen && (
                                    <div className="px-5 pb-5">

                                        {/* Education */}
                                        {item.key === "Education Details" && (
                                            employeeEducationDetailsDataList.length === 0 ? (
                                                <div className="h-[120px] flex items-center justify-center text-gray-500">
                                                    No Education Details Found
                                                </div>
                                            ) : (
                                                <div className="h-[220px] overflow-y-auto thin-scroll pr-2">
                                                    {employeeEducationDetailsDataList.map((e) => (
                                                        <div
                                                            key={e.Uniquekey}
                                                            className="border-b border-gray-200 mb-4 last:border-0 last:pb-0 last:mb-0"
                                                        >
                                                            <div className="flex items-start justify-between pb-3">
                                                                <div className="flex-1">
                                                                    <h3 className="text-sm font-semibold text-slate-800">
                                                                        {e.Qualification}
                                                                    </h3>

                                                                    <p className="mt-1 text-sm text-gray-500">
                                                                        {e.CollegeName}
                                                                    </p>

                                                                    <span className="mt-3 inline-flex rounded-full bg-[#FFFBEB] px-3 py-1 text-sm font-medium text-[#D97706]">
                                                                        Passing Year : {e.Passing}
                                                                    </span>
                                                                </div>

                                                                <div className="flex items-center gap-2 ml-4">
                                                                    <Button
                                                                        color="transparent"
                                                                        isborderRadius
                                                                        size="sm"
                                                                        style={{
                                                                            color: "blue",
                                                                            padding: "4px 8px",
                                                                        }}
                                                                        title="Edit"
                                                                        onClick={() => handleOpenEducationModal(e)}
                                                                        disabled={isLoading}
                                                                        leftIcon={<Edit className="h-4 w-4" />}
                                                                    />

                                                                    <Button
                                                                        color="transparent"
                                                                        isborderRadius
                                                                        size="sm"
                                                                        style={{
                                                                            color: "red",
                                                                            padding: "4px 8px",
                                                                        }}
                                                                        title="Delete"
                                                                        onClick={() => handleDeleteEducation(e)}
                                                                        disabled={isLoading}
                                                                        leftIcon={<Trash2 className="h-4 w-4" />}
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )
                                        )}

                                        {/* Experience */}
                                        {item.key === "Experience Details" && (
                                            employeeExperienceDetailsDataList.length === 0 ? (
                                                <div className="h-[120px] flex items-center justify-center text-gray-500">
                                                    No Experience Details Found
                                                </div>
                                            ) : (
                                                <div className="h-[220px] overflow-y-auto thin-scroll pr-2">
                                                    {employeeExperienceDetailsDataList.map((e) => (
                                                        <div
                                                            key={e.Uniquekey}
                                                            className="border-b border-gray-200 mb-4 last:border-0 last:mb-0"
                                                        >
                                                            <div className="flex items-start justify-between pb-3">
                                                                <div className="flex-1">
                                                                    <h3 className="text-sm font-semibold text-slate-800">
                                                                        {e.CompanyName}
                                                                    </h3>

                                                                    <p className="mt-1 text-sm text-gray-500">
                                                                        {e.Role}
                                                                    </p>

                                                                    <span className="mt-3 inline-flex rounded-full bg-[#FFFBEB] px-3 py-1 text-sm font-medium text-[#D97706]">
                                                                        {e.Tenure}
                                                                    </span>
                                                                </div>

                                                                <div className="ml-4 flex items-center gap-2">
                                                                    <Button
                                                                        color="transparent"
                                                                        isborderRadius
                                                                        size="sm"
                                                                        style={{
                                                                            color: "blue",
                                                                            padding: "4px 8px",
                                                                        }}
                                                                        title="Edit"
                                                                        onClick={() => handleOpenExperienceModal(e)}
                                                                        disabled={isLoading}
                                                                        leftIcon={<Edit className="h-4 w-4" />}
                                                                    />

                                                                    <Button
                                                                        color="transparent"
                                                                        isborderRadius
                                                                        size="sm"
                                                                        style={{
                                                                            color: "red",
                                                                            padding: "4px 8px",
                                                                        }}
                                                                        title="Delete"
                                                                        onClick={() => handleDeleteExperience(e)}
                                                                        disabled={isLoading}
                                                                        leftIcon={<Trash2 className="h-4 w-4" />}
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )
                                        )}

                                        {/* Branch */}
                                        {item.key === "Branch Associations" && (
                                            branchAssociationsMasterDataList.length === 0 ? (
                                                <div className="h-[120px] flex items-center justify-center text-gray-500">
                                                    No Branch Associations Found
                                                </div>
                                            ) : (
                                                <div className="h-[220px] overflow-y-auto pr-2">
                                                    <div className="flex flex-wrap gap-3">
                                                        {branchAssociationsMasterDataList.map((e) => (
                                                            <div
                                                                key={e.Uniquekey}
                                                                className="px-4 py-2 rounded-full bg-gray-100 hover:bg-gray-200 transition"
                                                            >
                                                                {e.BranchName}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )
                                        )}
                                    </div>
                                )}
                            </section>
                        )}
                    />

                    {/* Action Details */}
                    <section className="bg-white rounded-3xl border border-gray-200 shadow-sm mt-3 p-5">
                        <div className="flex items-center gap-3 mb-5">
                            <div className="w-11 h-11 rounded-xl bg-slate-50 flex items-center justify-center">
                                <History className="w-5 h-5 text-slate-600" />
                            </div>

                            <h2 className="text-[16px] font-semibold text-slate-800">
                                Action Details
                            </h2>
                        </div>

                        <div className="grid grid-cols-4 gap-6">
                            <FieldItem label="Created By" value={employeeData?.CreatedBy} />
                            <FieldItem label="Created Date" value={employeeData?.CreatedDate ? formatDate_dd_MonthName_yy_hh_mm(employeeData?.CreatedDate) : ""} />
                            {employeeData?.ModifiedBy && (
                                <>
                                    <FieldItem label="Modified By" value={employeeData?.ModifiedBy} />
                                    <FieldItem label="Modified Date" value={employeeData?.ModifiedDate ? formatDate_dd_MonthName_yy_hh_mm(employeeData?.ModifiedDate) : ""} />
                                </>
                            )}

                        </div>
                    </section>
                </>
            )}

            {activeTab === 'Document' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-5">

                    {docsWithUrls.length === 0 && (
                        <section className="md:col-span-4 bg-white rounded-xl shadow-sm p-6 border-[0.1px] border-[#3333334f]">
                            <NoDataView message="No Documents Found" />
                        </section>
                    )}

                    {docsWithUrls.map(d => {
                        const urls = parseDocumentUrls(d.DocumentURL ?? "")
                            .filter(x => x?.trim()?.length);

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
                <div className="space-y-4 pt-5">
                    {assetMappingMasterList.length === 0 ? (
                        <section className="bg-white rounded-xl shadow-sm p-6 border border-[#3333334f]">
                            <NoDataView message="No Assets Found" />
                        </section>
                    ) : (
                        <div className="space-y-3">
                            {assetMappingMasterList.map((asset) => (
                                <section
                                    key={asset.AssetCode}
                                    className="relative mb-5 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm"
                                >
                                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#2563EB]" />

                                    <div className="flex items-center justify-between border-b border-gray-200 bg-[#F8FAFC] px-6 py-4">
                                        <h4 className="text-base font-semibold text-gray-800">
                                            {asset.AssetName}
                                        </h4>

                                        <div className="text-sm font-medium text-gray-500">
                                            Asset Code :
                                            <span className="ml-1 font-semibold text-gray-900">
                                                {asset.AssetCode ?? "-"}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 gap-4 p-6 md:grid-cols-2 lg:grid-cols-3">
                                        <FieldItem label="Serial Type" value={asset.AssetType} />
                                        <FieldItem label="Asset Brand" value={asset.AssetBrand} />
                                        <FieldItem label="Asset Model" value={asset.AssetModel} />
                                        <FieldItem label="Serial Number" value={asset.SerialNumber} />
                                        <FieldItem
                                            label="Assigned Date"
                                            value={
                                                asset.AssignedDate
                                                    ? formatDate_dd_MonthName_yy(asset.AssignedDate)
                                                    : "-"
                                            }
                                        />
                                        <FieldItem label="Assigned By" value={asset.CreatedBy || "-"} />
                                    </div>
                                </section>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {activeTab === "Project" && (
                <div className="space-y-4 pt-5">
                    {projectMasterList.length === 0 ? (
                        <section className="bg-white rounded-xl shadow-sm p-6 border-[0.1px] border-[#3333334f]" >
                            <NoDataView message='No Project Found' />
                        </section>
                    ) : (
                        <div className="grid grid-cols-4 gap-3">
                            {projectMasterList.map((project) => (
                                <div key={project.ProjectId} className="border border-gray-200 p-3 rounded-xl bg-white flex justify-between">

                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-gray-100 rounded-full overflow-hidden">
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
                                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-5">

                                            {/* ================= LEFT SIDE (2/3) ================= */}
                                            <div className="lg:col-span-2 space-y-6">
                                                <section className="border border-[#33333321] rounded-xl overflow-hidden">
                                                    {/* Header */}
                                                    <div className="bg-[#E7F2FF] px-4 py-2 border-b border-[#D0D7DE]">
                                                        <h4 className="text-sm font-semibold text-[#1D4ED8]">
                                                            Basic Information
                                                        </h4>
                                                    </div>

                                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 p-4 border-b border-[#135bec2e]">
                                                        <FieldItem label="Shift Name" value={shiftMappingPolicy!.ShiftName} />
                                                        <FieldItem label="Shift Code" value={shiftMappingPolicy!.ShiftCode} />
                                                    </div>
                                                </section>
                                                {/* ================= SHIFT DURATION ================= */}
                                                <section className="border border-[#33333321] rounded-xl overflow-hidden">
                                                    <div className="bg-[#EAFCFF] px-4 py-2 border-b border-[#D0D7DE]">
                                                        <h4 className="text-sm font-semibold text-[#12A3DD]">
                                                            Time Details
                                                        </h4>
                                                    </div>

                                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 p-4 border-b border-[#135bec2e]">
                                                        <FieldItem label="Shift Begin Time" value={shiftMappingPolicy!.ShiftBeginTime} />
                                                        <FieldItem label="Shift End Time" value={shiftMappingPolicy!.ShiftEndTime} />
                                                    </div>

                                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 p-4 border-b border-[#135bec2e]">
                                                        <FieldItem label="Shift Duration Time" value={shiftMappingPolicy!.ShiftDurationTime} />
                                                        <FieldItem label="Shift Work Duration Time" value={shiftMappingPolicy!.ShiftWorkDurationTime} />
                                                    </div>
                                                </section>

                                                {/* ================= HALF DAY AND ABSENCE RULES================= */}
                                                <section className="border border-[#33333321] rounded-xl overflow-hidden">
                                                    <div className="bg-[#FFF6EB] px-4 py-2 border-b border-[#D0D7DE]">
                                                        <h4 className="text-sm font-semibold text-[#C2410C]">
                                                            Advance Setting
                                                        </h4>
                                                    </div>

                                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 border-b border-[#135bec2e]">
                                                        <FieldItem label="First Half Up To" value={shiftMappingPolicy!.FirstHalfUpTo} />
                                                    </div>

                                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 p-4 border-b border-[#135bec2e]">
                                                        <FieldItem label="Calculate Absent if working hours less than" value={shiftMappingPolicy!.AbsentWorkingHours} />
                                                        <FieldItem label="Calculate Half day working hours less than" value={shiftMappingPolicy!.HalfDayWorkingHours} />
                                                    </div>

                                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 p-4 border-b border-[#135bec2e]">
                                                        <FieldItem label="Mark Half Day if Intime After" value={shiftMappingPolicy!.HalfDayInTimeAfter} />
                                                        <FieldItem label="Mark Half Day if Outtime After" value={shiftMappingPolicy!.HalfDayOutTimeBefore} />
                                                    </div>
                                                </section>
                                            </div>

                                            {/* ================= RIGHT SIDE (1/3) ================= */}
                                            <div className="lg:col-span-1 space-y-6">

                                                {/* ================= BREAK DETAILS ================= */}
                                                <section className="border border-[#33333321] rounded-xl overflow-hidden">
                                                    <div className="bg-[#FFFFE4] px-4 py-2 border-b border-[#D0D7DE]">
                                                        <h4 className="text-sm font-semibold text-[#7B6B28]">
                                                            Break Details
                                                        </h4>
                                                    </div>

                                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 p-4 border-b border-[#135bec2e]">
                                                        <FieldItem label="Break Begin Time" value={shiftMappingPolicy!.BreakBeginTime} />
                                                        <FieldItem label="Break End Time" value={shiftMappingPolicy!.BreakEndTime} />
                                                    </div>

                                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 p-4 border-b border-[#135bec2e]">
                                                        <FieldItem label="Break Duration Time" value={shiftMappingPolicy!.BreakDurationTime} />
                                                    </div>
                                                </section>

                                                <section className="border border-[#33333321] rounded-xl overflow-hidden">
                                                    <div className="bg-[#E6FFE6] px-4 py-2 border-b border-[#D0D7DE]">
                                                        <h4 className="text-sm font-semibold text-[#00A800]">
                                                            Time Allowed for Late Entry
                                                        </h4>
                                                    </div>


                                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 p-4 border-b border-[#135bec2e]">
                                                        <FieldItem label="Grace Time In Minutes" value={shiftMappingPolicy!.GraceTime} />
                                                    </div>
                                                </section>

                                                <section className="border border-[#33333321] rounded-xl overflow-hidden">
                                                    <div className="bg-[#E1E2E4] px-4 py-2 border-b border-[#D0D7DE]">
                                                        <h4 className="text-sm font-semibold text-[#333333]">
                                                            Remarks
                                                        </h4>
                                                    </div>


                                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 border-b border-[#135bec2e]">
                                                        <FieldItem label="Remarks" value={shiftMappingPolicy!.Remarks} />
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
                <div className="space-y-4 pt-5">
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
                                        <section className="relative bg-white rounded-2xl border border-gray-200 shadow-sm p-5 mb-5 overflow-hidden">
                                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#2563EB]" />
                                            <h4 className="text-lg font-semibold text-gray-900 mb-4">
                                                Week Off Policy Details
                                            </h4>

                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                                <FieldItem label="Week Off Policy Name" value={weekOffPolicyMapping!.WeekOffPolicyName} />
                                                <FieldItem label="Week Off Policy Code" value={weekOffPolicyMapping!.WeekOffPolicyCode} />
                                                <FieldItem label="Week Days" value={weekOffPolicyMapping!.WeekDays} />
                                                <FieldItem label="Week Days Starts On" value={weekOffPolicyMapping!.WeekDaysStartsOn} />
                                            </div>
                                        </section>

                                        {/* ================= WEEK OFF DETAILS ================= */}
                                        <section className="relative bg-white rounded-2xl border border-gray-200 shadow-sm p-5 mb-5 overflow-hidden">
                                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#2563EB]" />
                                            <h4 className="text-lg font-semibold text-gray-900 mb-4">
                                                Week Off Details
                                            </h4>

                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                                <FieldItem label="Weekly Off" value={weekOffPolicyMapping!.WeeklyOff} />
                                                <FieldItem label="Weekly Off2" value={weekOffPolicyMapping!.WeeklyOff2} />
                                                <FieldItem label="Weekly Off2 Type" value={weekOffPolicyMapping!.WeeklyOff2Type} />
                                                <FieldItem label="Not Applicable For Months" value={weekOffPolicyMapping!.NotApplicableForMonths} />

                                            </div>
                                        </section>
                                    </>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}

            {/* Education Details Modal */}
            <Modal
                isOpen={isEducationModalOpen}
                onClose={handleCloseEducationModal}
                title={isEditEducationMode ? "Update Education Details" : "Add Education Details"}
                onSubmit={handleEducationFormSubmit}
                saveText={isEditEducationMode ? "Update" : "Add"}
                loading={isLoading}
                size="xl"
            >
                <div className="space-y-4">
                    <div>
                        <Input
                            label="Qualification"
                            value={educationFormData.Qualification || ''}
                            onChange={(e) => setEducationFormData({ ...educationFormData, Qualification: e.target.value })}
                            required
                            maxLength={50}
                            error={educationFormErrors.Qualification}
                            placeholder="Enter Qualification"
                        />
                    </div>
                    <div>
                        <Input
                            label="School / College Name"
                            value={educationFormData.CollegeName || ''}
                            onChange={(e) => setEducationFormData({ ...educationFormData, CollegeName: e.target.value })}
                            required
                            maxLength={50}
                            error={educationFormErrors.CollegeName}
                            placeholder="Enter School / College Name"
                        />

                    </div>
                    <div>
                        <Input
                            label="Passing Year"
                            value={educationFormData.Passing || ''}
                            onChange={(e) => setEducationFormData({ ...educationFormData, Passing: e.target.value })}
                            required
                            maxLength={7}
                            error={educationFormErrors.Passing}
                            placeholder="Enter Passing Year"
                        />
                    </div>
                </div>
            </Modal>

            {/* Experience Details Modal */}
            <Modal
                isOpen={isExperienceModalOpen}
                onClose={handleCloseExperienceModal}
                title={isEditExperienceMode ? "Update Experience Details" : "Add Experience Details"}
                onSubmit={handleExperienceFormSubmit}
                saveText={isEditExperienceMode ? "Update" : "Add"}
                loading={isLoading}
                size="xl"
            >
                <div className="space-y-4">
                    <div>
                        <Input
                            label="Company Name"
                            value={experienceFormData.CompanyName || ''}
                            onChange={(e) => setExperienceFormData({ ...experienceFormData, CompanyName: e.target.value })}
                            required
                            maxLength={50}
                            error={experienceFormErrors.CompanyName}
                            placeholder="Enter Company Name"
                        />
                    </div>
                    <div>
                        <Input
                            label="Role"
                            value={experienceFormData.Role || ''}
                            onChange={(e) => setExperienceFormData({ ...experienceFormData, Role: e.target.value })}
                            required
                            maxLength={50}
                            error={experienceFormErrors.Role}
                            placeholder="Enter Role"
                        />
                    </div>
                    <div>
                        <Input
                            label="Tenure"
                            value={experienceFormData.Tenure || ''}
                            onChange={(e) => setExperienceFormData({ ...experienceFormData, Tenure: e.target.value })}
                            required
                            maxLength={50}
                            error={experienceFormErrors.Tenure}
                            placeholder="Enter Tenure (e.g.  2 years)"
                        />
                    </div>
                </div>
            </Modal>

            {/* Employee Details Modal */}
            <Modal
                isOpen={isEmployeeModalOpen}
                onClose={handleCloseEmployeeModal}
                title={isEditEmployeeMode ? "Update Basic Details" : "Add Basic Details"}
                onSubmit={handleEmployeeFormSubmit}
                saveText={isEditEmployeeMode ? "Update" : "Add"}
                loading={isLoading}
                size="xxl"
            >
                <div className="space-y-4">

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Input
                            label="First Name"
                            value={employeeFormData.FirstName || ''}
                            onChange={(e) => setEmployeeFormData({ ...employeeFormData, FirstName: e.target.value })}
                            required
                            maxLength={50}
                            error={employeeFormErrors.FirstName}
                            placeholder="Enter First Name"
                        />
                        <Input
                            label="Middle Name"
                            value={employeeFormData.MiddleName || ''}
                            onChange={(e) => setEmployeeFormData({ ...employeeFormData, MiddleName: e.target.value })}
                            required
                            maxLength={50}
                            error={employeeFormErrors.MiddleName || ''}
                            placeholder="Enter Middle Name"
                        />
                        <Input
                            label="Last Name"
                            value={employeeFormData.LastName || ''}
                            onChange={(e) => setEmployeeFormData({ ...employeeFormData, LastName: e.target.value })}
                            required
                            maxLength={50}
                            error={employeeFormErrors.LastName || ''}
                            placeholder="Enter Last Name"
                        />
                        <Input
                            label="E-mail Id"
                            placeholder="Enter E-mail Id"
                            rightIcon={<Mail className="h-6 w-6 text-gray-400" />}
                            value={employeeFormData.EmailId || ''}
                            onChange={(e) => setEmployeeFormData({ ...employeeFormData, EmailId: e.target.value })}
                            required
                            error={employeeFormErrors.EmailId || ''}
                        />
                        <Input
                            leftIcon="+91"
                            label="Personal Mobile Number"
                            placeholder="Enter Personal Mobile Number"
                            required
                            disabled
                            value={employeeFormData.PersonalMobileNumber}
                            rightIcon={<Phone className="h-4 w-4 text-gray-400" />}
                            onChange={(e) => setEmployeeFormData({ ...employeeFormData, PersonalMobileNumber: filterMobile(e.target.value) })}
                            error={employeeFormErrors.PersonalMobileNumber} />

                        <SinglePageSelection
                            label="Gender"
                            placeholder="Select Gender"
                            required
                            value={employeeFormData.Gender}
                            onChange={(e) => setEmployeeFormData({ ...employeeFormData, Gender: String(e) })}
                            options={GENDER_OPTIONS.map((opt) => ({ label: opt.name, value: opt.id }))}
                            error={employeeFormErrors.Gender} />
                        <DatePickerInput
                            label="DOB"
                            value={employeeFormData.DateOfBirth ? formatDate_dd_mm_yyyy(employeeFormData.DateOfBirth) : ''}
                            onChange={(val) => setEmployeeFormData(prev => ({ ...prev, DateOfBirth: val ? convert_dd_mm_yyyy_To_Yyyy_mm_dd(val) ?? '' : '' }))}
                            required
                            error={employeeFormErrors.DateOfBirth}
                        />
                        <SinglePageSelection
                            label="Marital Status"
                            placeholder="Select Marital Status"
                            value={employeeFormData.MaritalStatus}
                            onChange={(val) => setEmployeeFormData({ ...employeeFormData, MaritalStatus: String(val) })}
                            options={MARITAL_STATUS_OPTIONS.map((opt) => ({ label: opt.name, value: opt.id }))}
                            required
                            error={employeeFormErrors.MaritalStatus} />
                        <SinglePageSelection
                            value={employeeFormData.BloodGroup}
                            label="Blood Group"
                            placeholder="Select Blood Group"
                            onChange={(val) => setEmployeeFormData({ ...employeeFormData, BloodGroup: String(val) })}
                            required
                            options={BLOOD_GROUP_OPTIONS.map((opt) => ({ label: opt.name, value: opt.id }))}
                            error={employeeFormErrors.BloodGroup} />
                        <Input
                            label="Aadhaar Number"
                            error={employeeFormErrors.AadharCardNumber}
                            required
                            type="text"
                            value={employeeFormData.AadharCardNumber ?? ""}
                            maxLength={12}
                            onChange={(e) =>
                                setEmployeeFormData({
                                    ...employeeFormData,
                                    AadharCardNumber: filterAadhaar(e.target.value)
                                })
                            }
                            placeholder="Enter Aadhaar Number"
                            rightIcon={<IdCardIcon />} />
                        <Input
                            label="PAN Number"
                            required error={employeeFormErrors.PanCardNumber}
                            type="text"
                            value={employeeFormData.PanCardNumber ?? ""}
                            maxLength={10}
                            onChange={(e) =>
                                setEmployeeFormData({
                                    ...employeeFormData,
                                    PanCardNumber: filterPAN(e.target.value).toUpperCase()
                                })
                            }
                            placeholder="Enter PAN Number"
                            rightIcon={<IdCardIcon />} />
                        <Input
                            label="Passport Number"
                            error={employeeFormErrors.PassportNumber}
                            type="text"
                            value={employeeFormData.PassportNumber ?? ""}
                            maxLength={8}
                            onChange={(e) =>
                                setEmployeeFormData({
                                    ...employeeFormData,
                                    PassportNumber: filterPassportNumber(e.target.value).toUpperCase()
                                })
                            }
                            placeholder="Enter Passport Number"
                            rightIcon={<IdCardIcon />} />

                        <Input label="Driving License Number"
                            error={employeeFormErrors.DrivingLicenceNumber}
                            type="text" value={employeeFormData.DrivingLicenceNumber ?? ""}
                            maxLength={15}
                            onChange={(e) =>
                                setEmployeeFormData({
                                    ...employeeFormData,
                                    DrivingLicenceNumber: filterDrivingLicenseNumber(e.target.value).toUpperCase()
                                })
                            }
                            placeholder="Enter Driving License Number"
                            rightIcon={<IdCardIcon />} />

                        <Input label="Voting Card Number"
                            error={employeeFormErrors.VoterCardNumber}
                            type="text"
                            value={employeeFormData.VoterCardNumber ?? ""}
                            maxLength={10}
                            onChange={(e) =>
                                setEmployeeFormData({
                                    ...employeeFormData,
                                    VoterCardNumber: filterVoterId(e.target.value).toUpperCase()
                                })
                            }
                            placeholder="Enter Voting Card Number"
                            rightIcon={<IdCardIcon />} />

                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-1 gap-2">

                        <TextArea
                            label="Communication Address"
                            className="thin-scroll"
                            value={employeeFormData.CommunicationAddress || ''}
                            onChange={(e) => setEmployeeFormData({ ...employeeFormData, CommunicationAddress: e.target.value })}
                            required
                            error={employeeFormErrors.CommunicationAddress}
                            placeholder="Enter Communication Address"
                        />
                        <TextArea
                            label="Permanent Address"
                            className="thin-scroll"
                            value={employeeFormData.PermanentAddress || ''}
                            onChange={(e) => setEmployeeFormData({ ...employeeFormData, PermanentAddress: e.target.value })}
                            required
                            error={employeeFormErrors.PermanentAddress}
                            placeholder="Enter Permanent Address"
                        />
                    </div>
                </div>
            </Modal >

            <Modal
                isOpen={isAddUpdateModalOpen}
                onClose={() => {
                    setIsAddUpdateModalOpen(false);
                    setEditingEmployeeProfilePhotoData(null);
                    setFormData(initialFormState());
                    setErrors({});
                }}
                onCancel={() => {
                    setIsAddUpdateModalOpen(false);
                    setEditingEmployeeProfilePhotoData(null);
                    setFormData(initialFormState());
                    setErrors({});
                }}
                title="Update Profile Photo"
                size="xl"
            >
                <div className="p-6 bg-blue-100">
                    <ProfilePhotoUploader
                        label="Profile Photo"
                        required
                        uploadText="Upload Profile Photo"
                        error={errors.ProfilePhotoURL}
                        onChange={handleAddUpdateEmployeeProfilePhoto}
                    />
                </div>
            </Modal>

            {/* Delete Confirmation Dialogs */}
            < ConfirmationDialogBox
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
