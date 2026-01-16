import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Input } from "@/ui/components/forms/Input";
import { DatePickerInput } from "@/ui/components/forms/Datepicker";
import * as E from "fp-ts/Either";
import { runApiWithLoader } from "@/core/utils";
import { useToast } from "@/core/hooks/useToast";
import { SinglePageSelection } from "@/ui/components/DropDown/SinglePageSelection";
import { Loader } from "@/core/utils/loader";
import { BUSINESS_CATEGORY, PROJECT_SCHEME, PROJECT_STATUS_OPTIONS, PROJECT_SUB_SCHEME } from "@/core/constants/staticData";
import { useEffect, useState } from "react";
import { useCountryStateCityDistrictVillageData } from "@/core/hooks/useCountryStateCityDistrictVillage";
import React from "react";
import { convert_dd_mm_yyyy_To_Yyyy_mm_dd, formatDate_dd_mm_yyyy } from "@/core/utils/dateFormat";
import { filterGoogleMapsUrl, filterMobile, filterNumbers, filterRERA, isValidGoogleMapsUrl, isValidMobile, isValidRERA } from "@/core/utils/fileValidation";
import type { AddUpdateProjectMasterRequest, FilterWithPaginationProjectMasterRequest } from "@/features/projectMaster/models/ProjectMasterModel";
import { ProjectMasterService } from "../services/ProjectMasterService";
import Checkbox from "@/ui/components/forms/Checkbox";
import { MultiFilePicker } from "@/ui/components/ImagePicker/MultiFilePicker";
import { useMenuPermissions } from "@/features/menu/hooks/useMenuPermissions";
import BottomActionBar from "@/ui/components/forms/BottomActionBar";
import { IndianRupee, MapPin, Phone } from "lucide-react";

const initialFormState = (): AddUpdateProjectMasterRequest => ({
    ProjectId: 0,
    Uniquekey: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
    ProjectName: '',
    ProjectLocation: '',
    ProjectPhotoURL: null,
    RemoveProjectPhotoURL: '',
    CTSNumber: '',
    IsRedevelopment: 0,
    BussinessCategory: '',
    ProjectShortName: '',
    CountryMasterId: 0,
    DistrictMasterId: 0,
    StateMasterId: 0,
    CityMasterId: 0,
    ZipCode: '',
    ProjectScope: '',
    ProjectEstimateCost: 0,
    ProjectAreaInSqft: 0,
    OnGoingBudgetCost: 0,
    SurveyDate: null,
    ExpectedStartDate: null,
    ExecutionStartDate: null,
    SiteContactMobileNumber: '',
    SiteContactName: '',
    ProjectStatus: '',
    RERANumber: '',
    RERACertificateDate: null,
    RERAComplitionDate: null,
    ProjectScheme: '',
    ProjectSubScheme: '',
    GoogleLocation: ''
});

const AddUpdateProjectMaster: React.FC = () => {

    //#region STATE MANAGEMENT
    const [formData, setFormData] = useState<AddUpdateProjectMasterRequest>(() => initialFormState());
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');

    const [projectPhotoFiles, setProjectPhotoFiles] = useState<(File | string)[]>([]);
    const [removedProjectPhotoUrls, setRemovedProjectPhotoUrls] = useState<string[]>([]);
    const [projectPhotoURL, setProjectPhotoURL] = useState<string>();
    // NAVIGATE
    const navigate = useNavigate();
    const location = useLocation();

    //GET VALUE FROM URL :PROJECTID
    const { projectId } = useParams<{ projectId?: string }>();

    // TOAST
    const { addToast } = useToast();

    //ERROR SET UP
    const [errors, setErrors] = useState<{ [k: string]: string }>({});

    //#endregion

    //#region MENU PERMISSIONS
    const { canAction } = useMenuPermissions('/projectMaster');
    //#endregion

    //#region COUNTRY STATE CITY DISTRICT 
    const {
        isLoading: isLocationLoading,
        countries,
        statesByCountryId,
        districtsByStateId,
        citiesByDistrictId,
    } = useCountryStateCityDistrictVillageData()

    const [selectedCountryId, setSelectedCountryId] = React.useState<number | null>(1)
    const [selectedStateId, setSelectedStateId] = React.useState<number | null>(null)
    const [selectedDistrictId, setSelectedDistrictId] = React.useState<number | null>(null)
    const [selectedCityId, setSelectedCityId] = React.useState<number | null>(null)

    const countryOptions = countries.map(c => ({ label: c.name, value: c.id }))

    const stateOptions =
        selectedCountryId != null
            ? (statesByCountryId[selectedCountryId] || []).map(s => ({
                label: s.name,
                value: s.id,
            }))
            : []

    const districtOptions =
        selectedStateId != null
            ? (districtsByStateId[selectedStateId] || []).map(d => ({
                label: d.name,
                value: d.id,
            }))
            : []

    const cityOptions =
        selectedDistrictId != null
            ? (citiesByDistrictId[selectedDistrictId] || []).map(c => ({
                label: c.name,
                value: c.id,
            }))
            : [];



    //#endregion

    //#region HANDLE CHNAGE EVENT WHEN INPUT BOX ANY OTHER
    const handleFieldChange = (field: keyof AddUpdateProjectMasterRequest, value: any) => {

        setFormData((prev) => ({ ...prev, [field]: value }));

        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: "" }));
        }
    };

    //#endregion 

    //#region INITIALIZATION
    useEffect(() => {

        if (projectId) {

            fetchProjectMasterDetails();
            return;
        }

        setSelectedCountryId(1);
        handleFieldChange('CountryMasterId', 1);
    }, [projectId]);


    //#endregion

    //#region LOAD PROJECT MASTER DATA
    const fetchProjectMasterDetails = async () => {
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {

                const params: FilterWithPaginationProjectMasterRequest = {
                    PageNumber: 1,
                    PageSize: 1,
                    IsProjectAccess: false,
                    ProjectId: Number(projectId)
                }

                const response = await ProjectMasterService.apiCallPullProjectMaster(params);

                if (E.isRight(response)) {

                    const row = response.right.Data?.[0];

                    if (row) {
                        setFormData(prev => ({
                            ...prev,
                            ProjectId: row.ProjectId ?? prev.ProjectId,
                            Uniquekey: row.Uniquekey ?? prev.Uniquekey,
                            ProjectName: row.ProjectName ?? prev.ProjectName,
                            ProjectLocation: row.ProjectLocation ?? prev.ProjectLocation ?? '',
                            ProjectPhotoURL: null,
                            RemoveProjectPhotoURL: '',
                            CTSNumber: row.CTSNumber ?? prev.CTSNumber,
                            IsRedevelopment: row.IsRedevelopment ? 1 : 0,
                            BussinessCategory: row.BussinessCategory ?? prev.BussinessCategory ?? '',
                            ProjectShortName: row.ProjectShortName ?? prev.ProjectShortName ?? '',
                            CountryMasterId: row.CountryMasterId ?? prev.CountryMasterId ?? 1,
                            DistrictMasterId: row.DistrictMasterId ?? prev.DistrictMasterId ?? 0,
                            StateMasterId: row.StateMasterId ?? prev.StateMasterId ?? 0,
                            CityMasterId: row.CityMasterId ?? prev.CityMasterId ?? 0,
                            ZipCode: row.ZipCode ?? prev.ZipCode ?? '',
                            ProjectScope: row.ProjectScope ?? prev.ProjectScope ?? '',
                            ProjectEstimateCost: row.ProjectEstimateCost ?? prev.ProjectEstimateCost ?? 0,
                            ProjectAreaInSqft: Number(row.ProjectAreaInSqft ?? prev.ProjectAreaInSqft ?? 0),
                            OnGoingBudgetCost: Number(row.OnGoingBudgetCost ?? prev.OnGoingBudgetCost ?? 0),
                            SurveyDate: row.SurveyDate ?? prev.SurveyDate,
                            ExpectedStartDate: row.ExpectedStartDate ?? prev.ExpectedStartDate,
                            ExecutionStartDate: row.ExecutionStartDate ?? prev.ExecutionStartDate,
                            SiteContactMobileNumber: row.SiteContactMobileNumber ?? prev.SiteContactMobileNumber ?? '',
                            SiteContactName: row.SiteContactName ?? prev.SiteContactName ?? '',
                            ProjectStatus: row.ProjectStatus ?? prev.ProjectStatus ?? '',
                            RERANumber: row.RERANumber ?? prev.RERANumber ?? '',
                            RERACertificateDate: row.RERACertificateDate ?? prev.RERACertificateDate,
                            RERAComplitionDate: row.RERAComplitionDate ?? prev.RERAComplitionDate,
                            ProjectScheme: row.ProjectScheme ?? prev.ProjectScheme ?? '',
                            ProjectSubScheme: row.ProjectSubScheme ?? prev.ProjectSubScheme ?? '',
                            GoogleLocation: row.GoogleLocation ?? prev.GoogleLocation ?? ''
                        }));
                        setProjectPhotoFiles([]);
                        setProjectPhotoURL(row.ProjectPhotoURL)
                        setRemovedProjectPhotoUrls([]);
                        setSelectedCountryId(row.CountryMasterId ?? null);
                        setSelectedStateId(row.StateMasterId ?? null);
                        setSelectedDistrictId(row.DistrictMasterId ?? null);
                        setSelectedCityId(row.CityMasterId ?? null);

                    }
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
            'Loading Project Data'
        )
    }
    //#endregion

    //#region [VALIDATION FUNCTION]

    const validateAddProjectMasterForm = (): {

        isValid: boolean

        errors: { [key: string]: string }

    } => {

        const newErrors: { [key: string]: string } = {}


        if (!formData.ProjectName?.trim()) {
            newErrors.ProjectName = "Project Name is required.";
        }

        if (formData.IsRedevelopment === 0 && !formData.CTSNumber?.trim()) {
            newErrors.CTSNumber = "CTS Number is required.";
        }

        if (!formData.ProjectLocation?.trim()) {
            newErrors.ProjectLocation = "Project Location is required.";
        }

        if (!formData.GoogleLocation?.trim()) {
            newErrors.GoogleLocation = 'Google Location is required'
        } else if (!isValidGoogleMapsUrl(formData.GoogleLocation.trim())) {
            newErrors.GoogleLocation = 'Enter a valid Google Location'
        }

        if (!formData.StateMasterId) {
            newErrors.StateMasterId = "State is required.";
        }

        if (!formData.DistrictMasterId) {
            newErrors.DistrictMasterId = "District is required.";
        }

        if (!formData.CityMasterId) {
            newErrors.CityMasterId = "City is required.";
        }

        if (formData.SiteContactMobileNumber && !isValidMobile(formData.SiteContactMobileNumber)) {
            newErrors.SiteContactMobileNumber = "Enter a valid 10-digit mobile number.";
        }

        if (formData.RERANumber && !isValidRERA(formData.RERANumber)) {
            newErrors.RERANumber = "Enter a valid RERA Number.";
        }

        if (!projectPhotoFiles.length && !projectPhotoURL) {
            newErrors.ProjectPhotoURL = "Project photo is required.";
        }

        return {
            isValid: Object.keys(newErrors).length === 0,
            errors: newErrors
        }
    }
    //#endregion

    //#region ADD UPDATE PROJECT
    const PushProjectMasterFormData = (): FormData => {
        const fd = new FormData();
        fd.append('ProjectId', String(formData.ProjectId ?? 0));
        fd.append('Uniquekey', formData.Uniquekey ?? '');
        fd.append('ProjectName', formData.ProjectName ?? '');
        fd.append('ProjectLocation', formData.ProjectLocation ?? '');
        fd.append('CTSNumber', formData.IsRedevelopment === 1 ? "System Generated CTS Number" : formData.CTSNumber ?? '');
        fd.append('IsRedevelopment', String(formData.IsRedevelopment ?? 0));
        fd.append('BussinessCategory', formData.BussinessCategory ?? '');
        fd.append('ProjectShortName', formData.ProjectShortName ?? '');
        fd.append('CountryMasterId', String(formData.CountryMasterId ?? 0));
        fd.append('StateMasterId', String(formData.StateMasterId ?? 0));
        fd.append('DistrictMasterId', String(formData.DistrictMasterId ?? 0));
        fd.append('CityMasterId', String(formData.CityMasterId ?? 0));
        fd.append('ZipCode', formData.ZipCode ?? '');
        fd.append('ProjectScope', formData.ProjectScope ?? '');
        fd.append('ProjectEstimateCost', String(formData.ProjectEstimateCost ?? 0));
        fd.append('ProjectAreaInSqft', String(formData.ProjectAreaInSqft ?? 0));
        fd.append('OnGoingBudgetCost', String(formData.OnGoingBudgetCost ?? 0));
        fd.append('SurveyDate', formData.SurveyDate ?? '');
        fd.append('ExpectedStartDate', formData.ExpectedStartDate ?? '');
        fd.append('ExecutionStartDate', formData.ExecutionStartDate ?? '');
        fd.append('SiteContactMobileNumber', formData.SiteContactMobileNumber ?? '');
        fd.append('SiteContactName', formData.SiteContactName ?? '');
        fd.append('ProjectStatus', formData.ProjectStatus ?? '');
        fd.append('RERANumber', formData.RERANumber ?? '');
        fd.append('RERACertificateDate', formData.RERACertificateDate ?? '');
        fd.append('RERAComplitionDate', formData.RERAComplitionDate ?? '');
        fd.append('ProjectScheme', formData.ProjectScheme ?? '');
        fd.append('ProjectSubScheme', formData.ProjectSubScheme ?? '');
        fd.append('GoogleLocation', formData.GoogleLocation ?? '');

        projectPhotoFiles.forEach(file => {
            if (file instanceof File) {
                fd.append('ProjectPhotoURL', file);
            }
        });
        fd.append('RemoveProjectPhotoURL', removedProjectPhotoUrls.join(','));

        return fd;
    }

    const handleSubmit = async () => {

        setErrors({})


        const validation = validateAddProjectMasterForm()

        if (!validation.isValid) {

            setErrors(validation.errors)

            return
        }

        await runApiWithLoader(
            setIsLoading,

            setLoadingMessage,
            async () => {

                const payload = PushProjectMasterFormData();

                const response = await ProjectMasterService.apiCallAddUpdateProjectMaster(payload);

                if (E.isRight(response)) {

                    addToast({ type: "success", title: formData.ProjectId ? "Project details updated successfully" : "New Project added successfully" });


                    // Get list state from navigation if available, otherwise use defaults
                    const locationState = location.state as {
                        listState?: {
                            page?: number;
                            filters?: any;
                            sortInfo?: any;
                            searchTerm?: string;
                        };
                    } | null;

                    const listState = locationState?.listState || {
                        page: 1,
                        filters: {},
                        sortInfo: undefined,
                        searchTerm: '',
                    };

                    navigate("/projectMaster", {
                        state: { listState }
                    });


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

            Number(projectId) === 0 ? 'Add Project' : 'Update Project'
        )

    };

    //#endregion

    return (


        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">

            <Loader loading={isLoading} title={loadingMessage}>  <div></div> </Loader>


            <div className="flex-1 space-y-2 px-6 py-3 overflow-y-auto thin-scroll ">
                <form onSubmit={handleSubmit}>
                    <div className="space-y-4 pb-4">
                        <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-300 pb-2">Basic Details</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {/* Redevelopment Checkbox */}
                            <div className="space-y-4 pb-4">
                                <Checkbox
                                    label="Is This Project a Redevelopment Project?"
                                    checked={formData.IsRedevelopment === 1}
                                    onChange={(e) => handleFieldChange('IsRedevelopment', e.target.checked ? 1 : 0)}
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <div>
                                <Input
                                    label="Project Name"
                                    required
                                    error={errors.ProjectName}
                                    type="text"
                                    value={formData.ProjectName}
                                    onChange={(e) => handleFieldChange('ProjectName', e.target.value)}
                                    placeholder="Enter Project Name"
                                />
                            </div>
                            <div>
                                <Input
                                    label="CTS Number"
                                    required={formData.IsRedevelopment === 1 ? false : true}
                                    error={errors.CTSNumber}
                                    disabled={formData.IsRedevelopment === 1 ? true : false}
                                    type="text"
                                    value={formData.CTSNumber}
                                    onChange={(e) => handleFieldChange('CTSNumber', e.target.value)}
                                    placeholder={formData.IsRedevelopment === 1 ? "System Generated CTS Number" : "Enter CTS Number"}
                                />
                            </div>
                            <div>
                                <MultiFilePicker
                                    label="Project Photo"
                                    placeholder="Select Project Photo"
                                    required
                                    error={errors.ProjectPhotoURL}
                                    value={projectPhotoFiles}
                                    onChange={setProjectPhotoFiles}
                                    availableFilesURL={projectPhotoURL ?? ""}
                                    allowedTypes={["image/jpeg", "image/png", "image/jpg"]}
                                    maxFiles={5}
                                    maxSizeMB={10}
                                    onRemoveExisting={(url) => {
                                        setRemovedProjectPhotoUrls((prev) => [...prev, url])
                                    }}
                                />
                            </div>

                            <div>

                                <SinglePageSelection
                                    label="Business Category"
                                    placeholder="Select Business Category"
                                    value={formData.BussinessCategory}
                                    onChange={(val) => handleFieldChange('BussinessCategory', String(val))}
                                    options={BUSINESS_CATEGORY.map(opt => ({ label: opt.name, value: opt.id }))}
                                />
                            </div>

                        </div>
                    </div>

                    {/* Scheme & Scope Details */}
                    <div className="space-y-4 pb-4">
                        <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-300 pb-2">Location Details</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <Input
                                    label="Project Location"
                                    required
                                    error={errors.ProjectLocation}
                                    type="text"
                                    value={formData.ProjectLocation}
                                    onChange={(e) => handleFieldChange('ProjectLocation', e.target.value)}
                                    placeholder="Enter Project Location"
                                />
                            </div>
                            <div>
                                <Input
                                    label="Google Location"
                                    required
                                    type="text"
                                    value={formData.GoogleLocation}
                                    onChange={e => handleFieldChange('GoogleLocation', filterGoogleMapsUrl(e.target.value))}
                                    rightIcon={<MapPin className="w-4 h-4" />}
                                    error={errors.GoogleLocation}
                                    placeholder="Enter Google Location"
                                />
                            </div>
                            <div>
                                <SinglePageSelection
                                    label="Country"
                                    placeholder="Select Country"
                                    required
                                    value={selectedCountryId || ''}
                                    onChange={(val) => {
                                        const id = Number(val);
                                        setSelectedCountryId(id);
                                        setSelectedStateId(null);
                                        setSelectedDistrictId(null);
                                        setSelectedCityId(null);
                                        handleFieldChange('CountryMasterId', id);
                                    }}
                                    disabled={isLocationLoading}
                                    options={countryOptions}
                                />
                            </div>
                            <div>
                                <SinglePageSelection
                                    label="State"
                                    placeholder="Select State"
                                    required
                                    error={errors.StateMasterId}
                                    value={selectedStateId ?? ''}
                                    onChange={(val) => {
                                        const id = Number(val);
                                        setSelectedStateId(id);
                                        setSelectedDistrictId(null);
                                        setSelectedCityId(null);
                                        handleFieldChange('StateMasterId', id);
                                    }}
                                    disabled={!selectedCountryId || stateOptions.length === 0}
                                    options={stateOptions}
                                />
                            </div>
                            <div>
                                <SinglePageSelection
                                    label="District"
                                    placeholder="Select District"
                                    required
                                    error={errors.DistrictMasterId}
                                    value={selectedDistrictId ?? ''}
                                    onChange={(val) => {
                                        const id = Number(val);
                                        setSelectedDistrictId(id);
                                        setSelectedCityId(null);
                                        handleFieldChange('DistrictMasterId', id);
                                    }}
                                    disabled={!selectedStateId || districtOptions.length === 0}
                                    options={districtOptions}
                                />
                            </div>
                            <div>
                                <SinglePageSelection
                                    label="City"
                                    placeholder="Select City"
                                    required
                                    error={errors.CityMasterId}
                                    value={selectedCityId ?? ''}
                                    onChange={(val) => {
                                        const id = Number(val);
                                        setSelectedCityId(id);
                                        handleFieldChange('CityMasterId', id);
                                    }}
                                    disabled={!selectedDistrictId || cityOptions.length === 0}
                                    options={cityOptions}
                                />
                            </div>
                            <div>
                                <Input
                                    label="PIN Code"
                                    type="text"
                                    value={formData.ZipCode}
                                    onChange={(e) => handleFieldChange('ZipCode', e.target.value)}
                                    placeholder="Enter PIN Code"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Scheme & Scope Details */}
                    <div className="space-y-4 pb-4">
                        <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-300 pb-2">Scheme & Scope Details</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <Input
                                    label="Project Scope"
                                    type="text"
                                    value={formData.ProjectScope}
                                    onChange={(e) => handleFieldChange('ProjectScope', e.target.value)}
                                    placeholder="Enter Project Scope"
                                />
                            </div>
                            <div>
                                <SinglePageSelection
                                    label="Project Scheme"
                                    placeholder="Select Project Scheme"
                                    value={formData.ProjectScheme}
                                    onChange={(val) => handleFieldChange('ProjectScheme', String(val))}
                                    options={PROJECT_SCHEME.map(opt => ({ label: opt.name, value: opt.id }))}
                                />
                            </div>
                            <div>
                                <SinglePageSelection
                                    label="Project Sub Scheme"
                                    placeholder="Select Project Sub Scheme"
                                    value={formData.ProjectSubScheme}
                                    onChange={(val) => handleFieldChange('ProjectSubScheme', String(val))}
                                    options={PROJECT_SUB_SCHEME.map(opt => ({ label: opt.name, value: opt.id }))}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Project Documentation */}
                    <div className="space-y-4 pb-4">
                        <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-300 pb-2">Project Documentation</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <Input
                                    label="RERA Number"
                                    error={errors.RERANumber}
                                    type="text"
                                    value={formData.RERANumber}
                                    onChange={(e) => handleFieldChange('RERANumber', filterRERA(e.target.value))}
                                    placeholder="Enter RERA Number"
                                />
                            </div>
                            <div>
                                <DatePickerInput
                                    label="RERA Certificate Date"
                                    value={formatDate_dd_mm_yyyy(formData.RERACertificateDate)}
                                    onChange={(val) => handleFieldChange('RERACertificateDate', convert_dd_mm_yyyy_To_Yyyy_mm_dd(val))}
                                />
                            </div>
                            <div>
                                <DatePickerInput
                                    label="RERA Completion Date"
                                    value={formatDate_dd_mm_yyyy(formData.RERAComplitionDate)}
                                    onChange={(val) => handleFieldChange('RERAComplitionDate', convert_dd_mm_yyyy_To_Yyyy_mm_dd(val))}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Project Financials */}
                    <div className="space-y-4 pb-4">
                        <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-300 pb-2">Project Financials</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <Input
                                    label="Project Estimate Cost"
                                    type="text"
                                    value={formData.ProjectEstimateCost || ''}
                                    rightIcon={<IndianRupee className="h-6 w-6 text-gray-400" />}
                                    onChange={(e) => handleFieldChange('ProjectEstimateCost', filterNumbers(e.target.value) || 0)}
                                    placeholder="Enter Estimate Cost"
                                />
                            </div>
                            <div>
                                <Input
                                    label="On Going Budget Cost"
                                    type="text"
                                    value={formData.OnGoingBudgetCost || ''}
                                    rightIcon={<IndianRupee className="h-6 w-6 text-gray-400" />}
                                    onChange={(e) => handleFieldChange('OnGoingBudgetCost', filterNumbers(e.target.value) || 0)}
                                    placeholder="Enter Budget Cost"
                                />
                            </div>
                            <div>
                                <Input
                                    label="Project Area in (SqFt)"
                                    type="text"
                                    value={formData.ProjectAreaInSqft || ''}
                                    onChange={(e) => handleFieldChange('ProjectAreaInSqft', filterNumbers(e.target.value) || 0)}
                                    placeholder="Enter Area in (SqFt)"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Timeline */}
                    <div className="space-y-4 pb-4">
                        <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-300 pb-2">Timeline</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <DatePickerInput
                                    label="Survey Date"
                                    value={formatDate_dd_mm_yyyy(formData.SurveyDate)}
                                    onChange={(val) => handleFieldChange('SurveyDate', convert_dd_mm_yyyy_To_Yyyy_mm_dd(val))}
                                />
                            </div>
                            <div>
                                <DatePickerInput
                                    label="Expected Start Date"
                                    value={formatDate_dd_mm_yyyy(formData.ExpectedStartDate)}
                                    onChange={(val) => handleFieldChange('ExpectedStartDate', convert_dd_mm_yyyy_To_Yyyy_mm_dd(val))}
                                />
                            </div>
                            <div>
                                <DatePickerInput
                                    label="Execution Start Date"
                                    value={formatDate_dd_mm_yyyy(formData.ExecutionStartDate)}
                                    onChange={(val) => handleFieldChange('ExecutionStartDate', convert_dd_mm_yyyy_To_Yyyy_mm_dd(val))}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Contact Information */}
                    <div className="space-y-4 pb-4">
                        <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-300 pb-2">Contact Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <Input
                                    label="Site Contact Name"
                                    type="text"
                                    value={formData.SiteContactName}
                                    onChange={(e) => handleFieldChange('SiteContactName', e.target.value)}
                                    placeholder="Enter Site Contact Name"
                                />
                            </div>
                            <div>
                                <Input
                                    label="Site Contact Mobile Number"
                                    error={errors.SiteContactMobileNumber}
                                    type="text"
                                    value={formData.SiteContactMobileNumber}
                                    rightIcon={<Phone className="h-4 w-4 text-gray-400" />}
                                    maxLength={10}
                                    onChange={(e) => handleFieldChange('SiteContactMobileNumber', filterMobile(e.target.value))}
                                    placeholder="Enter Mobile Number"
                                />
                            </div>
                            <div>
                                <SinglePageSelection
                                    label="Project Status"
                                    placeholder="Select Project Status"
                                    value={formData.ProjectStatus}
                                    onChange={(val) => handleFieldChange('ProjectStatus', String(val))}
                                    options={PROJECT_STATUS_OPTIONS.map(opt => ({ label: opt.name, value: opt.id }))}
                                />
                            </div>
                        </div>
                    </div>


                </form>
            </div>

            <BottomActionBar
                cancelText="Cancel"
                saveText={formData.ProjectId ? "Update" : "Add"}
                onCancel={() => navigate(-1)}
                onSave={() => {
                    handleSubmit();
                }}
                canAction={canAction}
                isLoading={isLoading}
            />
        </div>
    );
};

export default AddUpdateProjectMaster;