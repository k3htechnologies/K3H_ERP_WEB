import { useNavigate, useParams } from "react-router-dom";
import { Input } from "@/ui/components/forms/Input";
import { DatePickerInput } from "@/ui/components/forms/Datepicker";
import * as E from "fp-ts/Either";
import { runApiWithLoader } from "@/core/utils";
import { useToast } from "@/core/hooks/useToast";
import { SinglePageSelection } from "@/ui/components/DropDown/SinglePageSelection";
import { Loader } from "@/core/utils/loader";
import { BUSINESS_CATEGORY, PROJECT_CATEGORY, PROJECT_SCHEME, PROJECT_STATUS_OPTIONS, PROJECT_SUB_SCHEME_BMC, PROJECT_SUB_SCHEME_MHADA, PROJECT_SUB_SCHEME_SRA, TENDER_PAYMENT_MODE } from "@/core/constants/staticData";
import { useEffect, useState } from "react";
import { useCountryStateCityDistrictVillageData } from "@/core/hooks/useCountryStateCityDistrictVillage";
import React from "react";
import { convert_date_yy_mm_dd_To_dd_mm_yyyy, convert_dd_mm_yyyy_To_Yyyy_mm_dd, formatDate_dd_mm_yyyy } from "@/core/utils/dateFormat";
import { filterAPF, filterGoogleMapsUrl, filterMobile, filterNumbers, filterNumbersWithDecimal, filterRERA, hasAnyDocumentFile, isValidGoogleMapsUrl, isValidMobile, isValidRERA } from "@/core/utils/fileValidation";
import type { AddUpdateProjectMasterRequest, FilterWithPaginationProjectMasterRequest } from "@/features/projectMaster/models/ProjectMasterModel";
import { projectMasterService } from "@/features/projectMaster/services/ProjectMasterService";
import Checkbox from "@/ui/components/forms/Checkbox";
import { MultiFilePicker } from "@/ui/components/ImagePicker/MultiFilePicker";
import { useMenuPermissions } from "@/features/menu/hooks/useMenuPermissions";
import BottomActionBar from "@/ui/components/forms/BottomActionBar";
import { IndianRupee, MapPin, Phone } from "lucide-react";
import { TextArea } from "@/ui/components/forms/Textarea";
import { isToDateGreaterOrEqualFromDate } from "@/core/utils/comman";
import { MultiSelectDropdown } from "@/ui/components/DropDown/MultiSelectDropdown";

const initialFormState = (): AddUpdateProjectMasterRequest => ({
    ProjectId: 0,
    Uniquekey: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
    ProjectName: '',
    ProjectLocation: '',
    ProjectPhotoURL: null,
    RemoveProjectPhotoURL: '',
    CTSNumber: '',
    IsRedevelopment: 0,
    FileNumber: '',
    LiasoningArchitectName: '',
    LiasoningArchitectMobileNumber: '',
    DesigningArchitectName: '',
    DesigningArchitectMobileNumber: '',
    RCCConsultantName: '',
    RCCConsultantMobileNumber: '',
    Category: '',

    TenderAmount: 0,
    TenderPurchaseStartDate: null,
    TenderPurchaseEndDate: null,
    TenderAmountPaymentMode: '',
    TenderAmountChequeNumber: '',
    TenderAmountChequeNumberURL: null,
    RemoveTenderAmountChequeNumberURL: '',
    TenderAmountPayorderRemark: '',

    TenderEMDAmount: 0,
    TenderSubmissionDate: null,
    TenderEMDPaymentMode: '',
    TenderEMDChequeNumber: '',
    TenderEMDChequeNumberURL: null,
    RemoveTenderEMDChequeNumberURL: '',
    TenderEMDPayorderRemark: '',

    BussinessCategory: '',
    ProjectShortName: '',
    CountryMasterId: 0,
    DistrictMasterId: 0,
    StateMasterId: 0,
    CityMasterId: 0,
    VillageMasterId: 0,
    ZipCode: '',
    ProjectScope: '',
    ProjectEstimateCost: 0,
    ProjectAreaInSqft: 0,
    ProjectAreaInSqmt: 0,
    OnGoingBudgetCost: 0,
    SurveyDate: null,
    ExpectedStartDate: null,
    ExecutionStartDate: null,
    SiteContactMobileNumber: '',
    SiteContactName: '',
    SiteContactDesignation: '',
    SiteContact2MobileNumber: '',
    SiteContact2Name: '',
    SiteContact2Designation: '',
    SiteContact3MobileNumber: '',
    SiteContact3Name: '',
    SiteContact3Designation: '',
    ProjectStatus: '',
    RERANumber: '',
    APFNumber: '',
    RERACertificateDate: null,
    RERAPossessionDate: null,
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

    const [tenderAmountChequeNumberFiles, setTenderAmountChequeNumberFiles] = useState<(File | string)[]>([]);
    const [removedTenderAmountChequeNumberUrls, setRemovedTenderAmountChequeNumberUrls] = useState<string[]>([]);
    const [tenderAmountChequeNumberURL, setTenderAmountChequeNumberURL] = useState<string>();

    const [tenderEMDChequeNumberFiles, setTenderEMDChequeNumberFiles] = useState<(File | string)[]>([]);
    const [removedTenderEMDChequeNumberUrls, setRemovedTenderEMDChequeNumberUrls] = useState<string[]>([]);
    const [tenderEMDChequeNumberURL, setTenderEMDChequeNumberURL] = useState<string>();

    // NAVIGATE
    const navigate = useNavigate();

    //GET VALUE FROM URL :PROJECTID
    const { projectId } = useParams<{ projectId?: string }>();

    // TOAST
    const { addToast } = useToast();

    //ERROR SET UP
    const [errors, setErrors] = useState<{ [k: string]: string }>({});

    //#endregion

    //#region MENU PERMISSIONS
    const { canAction } = useMenuPermissions('/projectDetails');
    //#endregion

    //#region COUNTRY STATE CITY DISTRICT 
    const {
        isLoading: isLocationLoading,
        countries,
        statesByCountryId,
        districtsByStateId,
        citiesByDistrictId,
        villagesByCityId,
    } = useCountryStateCityDistrictVillageData()

    const [selectedCountryId, setSelectedCountryId] = React.useState<number | null>(1)
    const [selectedStateId, setSelectedStateId] = React.useState<number | null>(null)
    const [selectedDistrictId, setSelectedDistrictId] = React.useState<number | null>(null)
    const [selectedCityId, setSelectedCityId] = React.useState<number | null>(null)
    const [selectedVillageId, setSelectedVillageId] = React.useState<number | null>(null)

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

    const villageOptions =
        selectedCityId != null
            ? (villagesByCityId[selectedCityId] || []).map(c => ({
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

                const response = await projectMasterService.apiCallPullProjectMaster(params);

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
                            FileNumber: row.FileNumber ?? prev.FileNumber ?? '',

                            LiasoningArchitectName: row.LiasoningArchitectName ?? prev.LiasoningArchitectName ?? '',
                            LiasoningArchitectMobileNumber: row.LiasoningArchitectMobileNumber ?? prev.LiasoningArchitectMobileNumber ?? '',
                            DesigningArchitectName: row.DesigningArchitectName ?? prev.DesigningArchitectName ?? '',
                            DesigningArchitectMobileNumber: row.DesigningArchitectMobileNumber ?? prev.DesigningArchitectMobileNumber ?? '',
                            RCCConsultantName: row.RCCConsultantName ?? prev.RCCConsultantName ?? '',
                            RCCConsultantMobileNumber: row.RCCConsultantMobileNumber ?? prev.RCCConsultantMobileNumber ?? '',

                            Category: row.Category ?? prev.Category ?? '',


                            TenderAmount: row.TenderAmount ?? prev.TenderAmount ?? 0,
                            TenderPurchaseStartDate: row.TenderPurchaseStartDate ?? prev.TenderPurchaseStartDate,
                            TenderPurchaseEndDate: row.TenderPurchaseEndDate ?? prev.TenderPurchaseEndDate,
                            TenderAmountPaymentMode: row.TenderAmountPaymentMode ?? prev.TenderAmountPaymentMode ?? '',
                            TenderAmountChequeNumber: row.TenderAmountChequeNumber ?? prev.TenderAmountChequeNumber ?? '',
                            TenderAmountChequeNumberURL: null,
                            RemoveTenderAmountChequeNumberURL: '',
                            TenderAmountPayorderRemark: row.TenderAmountPayorderRemark ?? prev.TenderAmountPayorderRemark ?? '',

                            TenderEMDAmount: row.TenderEMDAmount ?? prev.TenderEMDAmount ?? 0,
                            TenderSubmissionDate: row.TenderSubmissionDate ?? prev.TenderSubmissionDate,
                            TenderEMDPaymentMode: row.TenderEMDPaymentMode ?? prev.TenderEMDPaymentMode ?? '',
                            TenderEMDChequeNumber: row.TenderEMDChequeNumber ?? prev.TenderEMDChequeNumber ?? '',
                            TenderEMDChequeNumberURL: null,
                            RemoveTenderEMDChequeNumberURL: '',
                            TenderEMDPayorderRemark: row.TenderEMDPayorderRemark ?? prev.TenderEMDPayorderRemark ?? '',

                            BussinessCategory: row.BussinessCategory ?? prev.BussinessCategory ?? '',
                            ProjectShortName: row.ProjectShortName ?? prev.ProjectShortName ?? '',
                            CountryMasterId: row.CountryMasterId ?? prev.CountryMasterId ?? 1,
                            DistrictMasterId: row.DistrictMasterId ?? prev.DistrictMasterId ?? 0,
                            StateMasterId: row.StateMasterId ?? prev.StateMasterId ?? 0,
                            CityMasterId: row.CityMasterId ?? prev.CityMasterId ?? 0,
                            VillageMasterId: row.VillageMasterId ?? prev.VillageMasterId ?? 0,
                            ZipCode: row.ZipCode ?? prev.ZipCode ?? '',
                            ProjectScope: row.ProjectScope ?? prev.ProjectScope ?? '',
                            ProjectEstimateCost: row.ProjectEstimateCost ?? prev.ProjectEstimateCost ?? 0,
                            ProjectAreaInSqft: Number(row.ProjectAreaInSqft ?? prev.ProjectAreaInSqft ?? 0),
                            ProjectAreaInSqmt: Number(row.ProjectAreaInSqmt ?? prev.ProjectAreaInSqmt ?? 0),
                            OnGoingBudgetCost: Number(row.OnGoingBudgetCost ?? prev.OnGoingBudgetCost ?? 0),
                            SurveyDate: row.SurveyDate ?? prev.SurveyDate,
                            ExpectedStartDate: row.ExpectedStartDate ?? prev.ExpectedStartDate,
                            ExecutionStartDate: row.ExecutionStartDate ?? prev.ExecutionStartDate,
                            SiteContactMobileNumber: row.SiteContactMobileNumber ?? prev.SiteContactMobileNumber ?? '',
                            SiteContactName: row.SiteContactName ?? prev.SiteContactName ?? '',
                            SiteContactDesignation: row.SiteContactDesignation ?? prev.SiteContactDesignation ?? '',

                            SiteContact2MobileNumber: row.SiteContact2MobileNumber ?? prev.SiteContact2MobileNumber ?? '',
                            SiteContact2Name: row.SiteContact2Name ?? prev.SiteContact2Name ?? '',
                            SiteContact2Designation: row.SiteContact2Designation ?? prev.SiteContact2Designation ?? '',

                            SiteContact3MobileNumber: row.SiteContact3MobileNumber ?? prev.SiteContact3MobileNumber ?? '',
                            SiteContact3Name: row.SiteContact3Name ?? prev.SiteContact3Name ?? '',
                            SiteContact3Designation: row.SiteContact3Designation ?? prev.SiteContact3Designation ?? '',

                            ProjectStatus: row.ProjectStatus ?? prev.ProjectStatus ?? '',
                            RERANumber: row.RERANumber ?? prev.RERANumber ?? '',
                            APFNumber: row.APFNumber ?? prev.APFNumber ?? '',
                            RERACertificateDate: row.RERACertificateDate ?? prev.RERACertificateDate,
                            RERAPossessionDate: row.RERAPossessionDate ?? prev.RERAPossessionDate,
                            ProjectScheme: row.ProjectScheme ?? prev.ProjectScheme ?? '',
                            ProjectSubScheme: row.ProjectSubScheme ?? prev.ProjectSubScheme ?? '',
                            GoogleLocation: row.GoogleLocation ?? prev.GoogleLocation ?? ''
                        }));
                        setProjectPhotoFiles([]);
                        setProjectPhotoURL(row.ProjectPhotoURL)
                        setRemovedProjectPhotoUrls([]);

                        setTenderAmountChequeNumberFiles([]);
                        setTenderAmountChequeNumberURL(row.TenderAmountChequeNumberURL)
                        setRemovedTenderAmountChequeNumberUrls([]);

                        setTenderEMDChequeNumberFiles([]);
                        setTenderEMDChequeNumberURL(row.TenderEMDChequeNumberURL)
                        setRemovedTenderEMDChequeNumberUrls([]);


                        setSelectedCountryId(row.CountryMasterId ?? null);
                        setSelectedStateId(row.StateMasterId ?? null);
                        setSelectedDistrictId(row.DistrictMasterId ?? null);
                        setSelectedCityId(row.CityMasterId ?? null);
                        setSelectedVillageId(row.VillageMasterId ?? null);

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

        if (!formData.Category?.trim()) {
            newErrors.Category = "Category is required.";
        }

        if (formData.Category?.trim().toUpperCase() === "TENDER") {

            if (!formData.TenderAmount) {
                newErrors.TenderAmount = "Amount is required.";
            }

            if (!formData.TenderPurchaseStartDate) {
                newErrors.TenderPurchaseStartDate = "Purchase Start Date is required.";
            }

            if (!formData.TenderPurchaseEndDate) {
                newErrors.TenderPurchaseEndDate = "Purchase End Date is required.";
            }

            const purchaseStartDate = convert_date_yy_mm_dd_To_dd_mm_yyyy(formData.TenderPurchaseStartDate ? new Date(formData.TenderPurchaseStartDate) : undefined);
            const purchaseEndDate = convert_date_yy_mm_dd_To_dd_mm_yyyy(formData.TenderPurchaseEndDate ? new Date(formData.TenderPurchaseEndDate) : undefined);

            if (formData?.TenderPurchaseStartDate && formData.TenderPurchaseEndDate && !isToDateGreaterOrEqualFromDate(purchaseStartDate, purchaseEndDate)) {
                newErrors.TenderPurchaseEndDate = "Purchase Start Date must be greater than or equal to Purchase End Date";
            }

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
        if (!formData.VillageMasterId) {
            newErrors.VillageMasterId = "Village is required";
        }

        if (formData.SiteContactMobileNumber && !isValidMobile(formData.SiteContactMobileNumber)) {
            newErrors.SiteContactMobileNumber = "Enter a valid 10-digit mobile number.";
        }

        if (formData.SiteContact2MobileNumber && !isValidMobile(formData.SiteContact2MobileNumber)) {
            newErrors.SiteContact2MobileNumber = "Enter a valid 10-digit mobile number.";
        }

        if (formData.SiteContact3MobileNumber && !isValidMobile(formData.SiteContact3MobileNumber)) {
            newErrors.SiteContact3MobileNumber = "Enter a valid 10-digit mobile number.";
        }

        if (formData.RERANumber && !isValidRERA(formData.RERANumber)) {
            newErrors.RERANumber = "Enter a valid RERA Number.";
        }

        if (!hasAnyDocumentFile(projectPhotoFiles, projectPhotoURL, removedProjectPhotoUrls)) {
            newErrors.ProjectPhotoURL = "Project Photo is required.";
        }

        if (formData.LiasoningArchitectMobileNumber != "" && !isValidMobile(formData.LiasoningArchitectMobileNumber.trim())) {
            newErrors.LiasoningArchitectMobileNumber = "Enter a valid 10-digit Liasoning Architect Mobile Number";
        }

        if (formData.DesigningArchitectMobileNumber != "" && !isValidMobile(formData.DesigningArchitectMobileNumber.trim())) {
            newErrors.DesigningArchitectMobileNumber = "Enter a valid 10-digit Designing Architect Mobile Number";
        }

        if (formData.RCCConsultantMobileNumber != "" && !isValidMobile(formData.RCCConsultantMobileNumber.trim())) {
            newErrors.RCCConsultantMobileNumber = "Enter a valid 10-digit RCC Consultant Mobile Number";
        }

        return {
            isValid: Object.keys(newErrors).length === 0,
            errors: newErrors
        }
    }
    //#endregion

    //#region ADD UPDATE PROJECT
    const PushProjectMasterFormData = (): FormData => {

        const isTender = formData.Category.toUpperCase() === "TENDER";

        const fd = new FormData();
        fd.append('ProjectId', String(formData.ProjectId ?? 0));
        fd.append('Uniquekey', formData.Uniquekey ?? '');
        fd.append('ProjectName', formData.ProjectName ?? '');
        fd.append('ProjectLocation', formData.ProjectLocation ?? '');
        fd.append('CTSNumber', formData.IsRedevelopment === 1 ? "System Generated CTS Number" : formData.CTSNumber ?? '');
        fd.append('IsRedevelopment', String(formData.IsRedevelopment ?? 0));
        fd.append('FileNumber', formData.FileNumber ?? '');
        fd.append('LiasoningArchitectName', formData.LiasoningArchitectName ?? '');
        fd.append('LiasoningArchitectMobileNumber', formData.LiasoningArchitectMobileNumber ?? '');
        fd.append('DesigningArchitectName', formData.DesigningArchitectName ?? '');
        fd.append('DesigningArchitectMobileNumber', formData.DesigningArchitectMobileNumber ?? '');
        fd.append('RCCConsultantName', formData.RCCConsultantName ?? '');
        fd.append('RCCConsultantMobileNumber', formData.RCCConsultantMobileNumber ?? '');
        fd.append('Category', formData.Category ?? '');

        fd.append('TenderAmount', isTender ? String(formData.TenderAmount ?? 0) : "0");
        fd.append('TenderPurchaseStartDate', isTender ? (formData.TenderPurchaseStartDate ?? '') : "");
        fd.append('TenderPurchaseEndDate', isTender ? (formData.TenderPurchaseEndDate ?? '') : "");
        fd.append('TenderAmountPaymentMode', isTender ? (formData.TenderAmountPaymentMode ?? '') : "");
        fd.append('TenderAmountChequeNumber', isTender ? (formData.TenderAmountChequeNumber ?? '') : "");
        fd.append('TenderAmountPayorderRemark', isTender ? (formData.TenderAmountPayorderRemark ?? '') : "");

        // Tender EMD Details
        fd.append('TenderEMDAmount', isTender ? String(formData.TenderEMDAmount ?? 0) : "0");
        fd.append('TenderSubmissionDate', isTender ? (formData.TenderSubmissionDate ?? '') : "");
        fd.append('TenderEMDPaymentMode', isTender ? (formData.TenderEMDPaymentMode ?? '') : "");
        fd.append('TenderEMDChequeNumber', isTender ? (formData.TenderEMDChequeNumber ?? '') : "");
        fd.append('TenderEMDPayorderRemark', isTender ? (formData.TenderEMDPayorderRemark ?? '') : "");


        fd.append('BussinessCategory', formData.BussinessCategory ?? '');
        fd.append('ProjectShortName', formData.ProjectShortName ?? '');
        fd.append('CountryMasterId', String(formData.CountryMasterId ?? 0));
        fd.append('StateMasterId', String(formData.StateMasterId ?? 0));
        fd.append('DistrictMasterId', String(formData.DistrictMasterId ?? 0));
        fd.append('CityMasterId', String(formData.CityMasterId ?? 0));
        fd.append('VillageMasterId', String(formData.VillageMasterId ?? 0));
        fd.append('ZipCode', formData.ZipCode ?? '');
        fd.append('ProjectScope', formData.ProjectScope ?? '');
        fd.append('ProjectEstimateCost', String(formData.ProjectEstimateCost ?? 0));
        fd.append('ProjectAreaInSqft', String(formData.ProjectAreaInSqft ?? 0));
        fd.append('ProjectAreaInSqmt', String(formData.ProjectAreaInSqmt ?? 0));
        fd.append('OnGoingBudgetCost', String(formData.OnGoingBudgetCost ?? 0));
        fd.append('SurveyDate', formData.SurveyDate ?? '');
        fd.append('ExpectedStartDate', formData.ExpectedStartDate ?? '');
        fd.append('ExecutionStartDate', formData.ExecutionStartDate ?? '');
        fd.append('SiteContactMobileNumber', formData.SiteContactMobileNumber ?? '');
        fd.append('SiteContactName', formData.SiteContactName ?? '');
        fd.append('SiteContactDesignation', formData.SiteContactDesignation ?? '');

        fd.append('SiteContact2MobileNumber', formData.SiteContact2MobileNumber ?? '');
        fd.append('SiteContact2Name', formData.SiteContact2Name ?? '');
        fd.append('SiteContact2Designation', formData.SiteContact2Designation ?? '');

        fd.append('SiteContact3MobileNumber', formData.SiteContact3MobileNumber ?? '');
        fd.append('SiteContact3Name', formData.SiteContact3Name ?? '');
        fd.append('SiteContact3Designation', formData.SiteContact3Designation ?? '');

        fd.append('ProjectStatus', formData.ProjectStatus ?? '');
        fd.append('RERANumber', formData.RERANumber ?? '');
        fd.append('APFNumber', formData.APFNumber ?? '');
        fd.append('RERACertificateDate', formData.RERACertificateDate ?? '');
        fd.append('RERAPossessionDate', formData.RERAPossessionDate ?? '');
        fd.append('ProjectScheme', formData.ProjectScheme ?? '');
        fd.append('ProjectSubScheme', formData.ProjectSubScheme ?? '');
        fd.append('GoogleLocation', formData.GoogleLocation ?? '');

        projectPhotoFiles.forEach(file => {
            if (file instanceof File) {
                fd.append('ProjectPhotoURL', file);
            }
        });

        fd.append('RemoveProjectPhotoURL', removedProjectPhotoUrls.join(','));

        if (isTender) {

            tenderAmountChequeNumberFiles.forEach(file => {
                if (file instanceof File) {
                    fd.append('TenderAmountChequeNumberURL', file);
                }
            });

            tenderEMDChequeNumberFiles.forEach(file => {
                if (file instanceof File) {
                    fd.append('TenderEMDChequeNumberURL', file);
                }
            });

        }

        fd.append('RemoveTenderAmountChequeNumberURL', isTender ? removedTenderAmountChequeNumberUrls.join(',') : "");
        fd.append('RemoveTenderEMDChequeNumberURL', isTender ? removedTenderEMDChequeNumberUrls.join(',') : "");

        return fd;
    }

    const handleSubmit = async () => {

        setErrors({})


        const validation = validateAddProjectMasterForm()

        if (!validation.isValid) {

            setErrors(validation.errors)

            addToast({ type: "error", title: "Please fill the required filed" });

            return
        }

        await runApiWithLoader(
            setIsLoading,

            setLoadingMessage,
            async () => {

                const payload = PushProjectMasterFormData();

                const response = await projectMasterService.apiCallAddUpdateProjectMaster(payload);

                if (E.isRight(response)) {

                    addToast({ type: "success", title: response.right.SuccessMessage[0] });

                    navigate("/projectMaster");


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


        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">

            <Loader loading={isLoading} title={loadingMessage}>  <div></div> </Loader>


            <div className="flex-1 space-y-2 px-6 py-3 overflow-y-auto thin-scroll ">
                <form onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-500 pb-2">Basic Details</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {/* Redevelopment Checkbox */}
                            <div className="space-y-4">
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
                            <div>
                                <Input
                                    label="File Number"
                                    error={errors.FileNumber}
                                    type="text"
                                    maxLength={250}
                                    value={formData.FileNumber}
                                    onChange={(e) => handleFieldChange('FileNumber', e.target.value)}
                                    placeholder="Enter File Number"
                                />
                            </div>


                        </div>
                    </div>

                    {/* Scheme & Scope Details */}
                    <div className="space-y-4 pt-5">
                        <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-300 pb-2">Project Category</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>

                                <SinglePageSelection
                                    required
                                    label="Category"
                                    placeholder="Select Category"
                                    value={formData.Category}
                                    error={errors.Category}

                                    onChange={(item) => {

                                        if (!item) {

                                            handleFieldChange('Category', '');
                                            handleFieldChange('TenderAmount', 0);
                                            handleFieldChange('TenderPurchaseStartDate', null);
                                            handleFieldChange('TenderPurchaseEndDate', null);
                                            handleFieldChange('TenderAmountPaymentMode', "");
                                            handleFieldChange('TenderAmountChequeNumber', "");
                                            if (tenderAmountChequeNumberURL) {
                                                setRemovedTenderAmountChequeNumberUrls(prev => [...prev, tenderAmountChequeNumberURL]);
                                            }
                                            setTenderAmountChequeNumberFiles([]);
                                            setTenderAmountChequeNumberURL("");
                                            handleFieldChange('TenderAmountPayorderRemark', "");

                                            handleFieldChange('TenderEMDAmount', 0);
                                            handleFieldChange('TenderSubmissionDate', null);
                                            handleFieldChange('TenderEMDPaymentMode', "");
                                            handleFieldChange('TenderEMDChequeNumber', "");
                                            if (tenderEMDChequeNumberURL) {
                                                setRemovedTenderEMDChequeNumberUrls(prev => [...prev, tenderEMDChequeNumberURL]);
                                            }
                                            setTenderEMDChequeNumberFiles([]);
                                            setTenderEMDChequeNumberURL("");
                                            handleFieldChange('TenderEMDPayorderRemark', "");

                                            return;
                                        }

                                        handleFieldChange('Category', String(item));
                                        handleFieldChange('TenderAmount', 0);
                                        handleFieldChange('TenderPurchaseStartDate', null);
                                        handleFieldChange('TenderPurchaseEndDate', null);
                                        handleFieldChange('TenderAmountPaymentMode', "");
                                        handleFieldChange('TenderAmountChequeNumber', "");
                                        if (tenderAmountChequeNumberURL) {
                                            setRemovedTenderAmountChequeNumberUrls(prev => [...prev, tenderAmountChequeNumberURL]);
                                        }
                                        setTenderAmountChequeNumberFiles([]);
                                        setTenderAmountChequeNumberURL("");
                                        handleFieldChange('TenderAmountPayorderRemark', "");

                                        handleFieldChange('TenderEMDAmount', 0);
                                        handleFieldChange('TenderSubmissionDate', null);
                                        handleFieldChange('TenderEMDPaymentMode', "");
                                        handleFieldChange('TenderEMDChequeNumber', "");
                                        if (tenderEMDChequeNumberURL) {
                                            setRemovedTenderEMDChequeNumberUrls(prev => [...prev, tenderEMDChequeNumberURL]);
                                        }
                                        setTenderEMDChequeNumberFiles([]);
                                        setTenderEMDChequeNumberURL("");
                                        handleFieldChange('TenderEMDPayorderRemark', "");

                                    }}

                                    options={PROJECT_CATEGORY.map(opt => ({ label: opt.name, value: opt.id }))}
                                />

                            </div>

                        </div>

                    </div>

                    {formData.Category?.toUpperCase() === "TENDER" && (
                        <>
                            <div className="space-y-4 pt-5">
                                <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-300 pb-2">Tender Amount Details</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                                    <div>
                                        <Input
                                            label="Amount (₹)"
                                            type="text"
                                            value={formData.TenderAmount || ''}
                                            onChange={(e) => handleFieldChange('TenderAmount', filterNumbersWithDecimal(e.target.value) || 0)}
                                            placeholder="Enter Amount (₹)"
                                            error={errors.TenderAmount}
                                        />
                                    </div>
                                    <div>
                                        <DatePickerInput
                                            label="Purchase Start Date"
                                            value={formatDate_dd_mm_yyyy(formData.TenderPurchaseStartDate)}
                                            onChange={(val) => handleFieldChange('TenderPurchaseStartDate', convert_dd_mm_yyyy_To_Yyyy_mm_dd(val))}
                                            error={errors.TenderPurchaseStartDate}
                                        />
                                    </div>

                                    <div>
                                        <DatePickerInput
                                            label="Purchase End Date"
                                            value={formatDate_dd_mm_yyyy(formData.TenderPurchaseEndDate)}
                                            error={errors.TenderPurchaseEndDate}
                                            onChange={(val) => handleFieldChange('TenderPurchaseEndDate', convert_dd_mm_yyyy_To_Yyyy_mm_dd(val))}
                                        />
                                    </div>
                                    <div>

                                        <SinglePageSelection
                                            label="Payment Mode"
                                            placeholder="Select Payment Mode"
                                            value={formData.TenderAmountPaymentMode}
                                            onChange={(val) => handleFieldChange('TenderAmountPaymentMode', String(val))}
                                            options={TENDER_PAYMENT_MODE.map(opt => ({ label: opt.name, value: opt.id }))}
                                        />
                                    </div>
                                    <div>
                                        <Input
                                            type="text"
                                            label='Transaction / Cheque / Demand Draft No'
                                            value={formData.TenderAmountChequeNumber ?? ""}
                                            onChange={(e) => handleFieldChange("TenderAmountChequeNumber", e.target.value)}
                                            placeholder="Enter Transaction / Cheque / Demand Draft No"
                                            maxLength={15}
                                            error={errors.TenderAmountChequeNumber}
                                        />
                                    </div>
                                    <div>
                                        <MultiFilePicker
                                            label="Transaction / Cheque / Demand Draft Image"
                                            placeholder="Select Transaction / Cheque / Demand Draft Image"
                                            error={errors.TenderAmountChequeNumberURL}
                                            value={tenderAmountChequeNumberFiles}
                                            onChange={setTenderAmountChequeNumberFiles}
                                            availableFilesURL={tenderAmountChequeNumberURL ?? ""}
                                            allowedTypes={["image/jpeg", "image/png", "image/jpg"]}
                                            maxFiles={5}
                                            onRemoveExisting={(url) => {
                                                setRemovedTenderAmountChequeNumberUrls((prev) => [...prev, url])
                                            }}
                                        />
                                    </div>


                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
                                    <div>
                                        <TextArea
                                            label="Payorder Remark"
                                            placeholder="Enter Payorder Remark"
                                            className="thin-scroll"
                                            value={formData.TenderAmountPayorderRemark}
                                            onChange={(e) => handleFieldChange("TenderAmountPayorderRemark", e.target.value)}
                                            error={errors.TenderAmountPayorderRemark} />
                                    </div>
                                </div>

                            </div>

                            <div className="space-y-4 pt-5">
                                <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-300 pb-2">Tender EMD Details</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div>
                                        <Input
                                            label="EMD Amount (₹)"
                                            type="text"
                                            value={formData.TenderEMDAmount || ''}
                                            onChange={(e) => handleFieldChange('TenderEMDAmount', filterNumbersWithDecimal(e.target.value) || 0)}
                                            placeholder="Enter Tender EMD Amount (₹)"
                                        />
                                    </div>

                                    <div>
                                        <DatePickerInput
                                            label="Submission Date"
                                            value={formatDate_dd_mm_yyyy(formData.TenderSubmissionDate)}
                                            onChange={(val) => handleFieldChange('TenderSubmissionDate', convert_dd_mm_yyyy_To_Yyyy_mm_dd(val))}
                                        />
                                    </div>
                                    <div>

                                        <SinglePageSelection
                                            label="Payment Mode"
                                            placeholder="Select Payment Mode"
                                            value={formData.TenderEMDPaymentMode}
                                            onChange={(val) => handleFieldChange('TenderEMDPaymentMode', String(val))}
                                            options={TENDER_PAYMENT_MODE.map(opt => ({ label: opt.name, value: opt.id }))}
                                        />
                                    </div>
                                    <div>
                                        <Input
                                            type="text"
                                            label='Transaction / Cheque / Demand Draft No'
                                            value={formData.TenderEMDChequeNumber ?? ""}
                                            onChange={(e) => handleFieldChange("TenderEMDChequeNumber", e.target.value)}
                                            placeholder="Enter Transaction / Cheque / Demand Draft No"
                                            maxLength={15}
                                            error={errors.TendorEMDChequeNumber}
                                        />
                                    </div>
                                    <div>
                                        <MultiFilePicker
                                            label="Transaction / Cheque / Demand Draft Image"
                                            placeholder="Select Transaction / Cheque / Demand Draft Image"
                                            error={errors.TenderEMDChequeNumberURL}
                                            value={tenderEMDChequeNumberFiles}
                                            onChange={setTenderEMDChequeNumberFiles}
                                            availableFilesURL={tenderEMDChequeNumberURL ?? ""}
                                            allowedTypes={["image/jpeg", "image/png", "image/jpg"]}
                                            maxFiles={5}
                                            onRemoveExisting={(url) => {
                                                setRemovedTenderEMDChequeNumberUrls((prev) => [...prev, url])
                                            }}
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
                                    <div>
                                        <TextArea
                                            label="Payorder Remark"
                                            placeholder="Enter Payorder Remark"
                                            className="thin-scroll"
                                            value={formData.TenderEMDPayorderRemark}
                                            onChange={(e) => handleFieldChange("TenderEMDPayorderRemark", e.target.value)}
                                            error={errors.TenderEMDPayorderRemark} />
                                    </div>
                                </div>
                            </div>
                        </>

                    )}
                    {/* Scheme & Scope Details */}
                    <div className="space-y-4 pt-5">
                        <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-300 pb-2">Liasoning Architect</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <Input
                                    label="Name"
                                    error={errors.LiasoningArchitectName}
                                    type="text"
                                    maxLength={250}
                                    value={formData.LiasoningArchitectName}
                                    onChange={(e) => handleFieldChange('LiasoningArchitectName', e.target.value)}
                                    placeholder="Enter Name"
                                />
                            </div>
                            <div>
                                <Input leftIcon="+91"
                                    label="Mobile Number"
                                    placeholder="Enter Mobile Number"
                                    value={formData.LiasoningArchitectMobileNumber}
                                    rightIcon={<Phone className="h-4 w-4 text-gray-400" />}
                                    onChange={(e) => handleFieldChange("LiasoningArchitectMobileNumber", filterMobile(e.target.value))}
                                    error={errors.LiasoningArchitectMobileNumber} />
                            </div>

                        </div>
                    </div>
                    <div className="space-y-4 pt-5">
                        <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-300 pb-2">Designing Architect</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                            <div>
                                <Input
                                    label="Name"
                                    error={errors.DesigningArchitectName}
                                    type="text"
                                    maxLength={250}
                                    value={formData.DesigningArchitectName}
                                    onChange={(e) => handleFieldChange('DesigningArchitectName', e.target.value)}
                                    placeholder="Enter Name"
                                />
                            </div>
                            <div>
                                <Input leftIcon="+91"
                                    label="Mobile Number"
                                    placeholder="Enter Mobile Number"
                                    value={formData.DesigningArchitectMobileNumber}
                                    rightIcon={<Phone className="h-4 w-4 text-gray-400" />}
                                    onChange={(e) => handleFieldChange("DesigningArchitectMobileNumber", filterMobile(e.target.value))}
                                    error={errors.DesigningArchitectMobileNumber} />
                            </div>
                        </div>
                    </div>
                    <div className="space-y-4 pt-5">
                        <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-300 pb-2">RCC Consultant</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                            <div>
                                <Input
                                    label="Name"
                                    error={errors.RCCConsultantName}
                                    type="text"
                                    maxLength={250}
                                    value={formData.RCCConsultantName}
                                    onChange={(e) => handleFieldChange('RCCConsultantName', e.target.value)}
                                    placeholder="Enter Name"
                                />
                            </div>
                            <div>
                                <Input leftIcon="+91"
                                    label="Mobile Number"
                                    placeholder="Enter Mobile Number"
                                    value={formData.RCCConsultantMobileNumber}
                                    rightIcon={<Phone className="h-4 w-4 text-gray-400" />}
                                    onChange={(e) => handleFieldChange("RCCConsultantMobileNumber", filterMobile(e.target.value))}
                                    error={errors.RCCConsultantMobileNumber} />
                            </div>
                        </div>
                    </div>

                    {/* Scheme & Scope Details */}
                    <div className="space-y-4 pt-5">
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
                                    label='Country'
                                    placeholder="Select Country"
                                    required
                                    value={selectedCountryId || ''}
                                    error={errors.CountryMasterId}
                                    onChange={(item) => {

                                        if (!item) {
                                            setSelectedCountryId(null);
                                            setSelectedStateId(null);
                                            setSelectedDistrictId(null);
                                            setSelectedCityId(null);
                                            setSelectedVillageId(null);

                                            handleFieldChange('CountryMasterId', 0);
                                            handleFieldChange('StateMasterId', 0);
                                            handleFieldChange('DistrictMasterId', 0);
                                            handleFieldChange('CityMasterId', 0);
                                            handleFieldChange('VillageMasterId', 0);

                                            return;
                                        }

                                        const id = Number(item);

                                        setSelectedCountryId(id);
                                        setSelectedStateId(null);
                                        setSelectedDistrictId(null);
                                        setSelectedCityId(null);
                                        setSelectedVillageId(null);

                                        handleFieldChange('CountryMasterId', id);
                                        handleFieldChange('StateMasterId', 0);
                                        handleFieldChange('DistrictMasterId', 0);
                                        handleFieldChange('CityMasterId', 0);
                                        handleFieldChange('VillageMasterId', 0);
                                    }}
                                    disabled={isLocationLoading}
                                    options={countryOptions}
                                />


                            </div>

                            <div>

                                <SinglePageSelection
                                    label='State'
                                    placeholder="Select State"
                                    required
                                    value={selectedStateId ?? ''}
                                    error={errors.StateMasterId}
                                    onChange={(item) => {

                                        if (!item) {
                                            setSelectedStateId(null);
                                            setSelectedDistrictId(null);
                                            setSelectedCityId(null);
                                            setSelectedVillageId(null);

                                            handleFieldChange("StateMasterId", 0);
                                            handleFieldChange("DistrictMasterId", 0);
                                            handleFieldChange("CityMasterId", 0);
                                            handleFieldChange('VillageMasterId', 0);

                                            return;
                                        }

                                        const id = Number(item);

                                        setSelectedStateId(id);
                                        setSelectedDistrictId(null);
                                        setSelectedCityId(null);
                                        setSelectedVillageId(null);

                                        handleFieldChange("StateMasterId", id);
                                        handleFieldChange("DistrictMasterId", 0);
                                        handleFieldChange("CityMasterId", 0);
                                        handleFieldChange('VillageMasterId', 0);
                                    }}
                                    disabled={!selectedCountryId || stateOptions.length === 0}
                                    options={stateOptions}
                                />


                            </div>

                            <div>

                                <SinglePageSelection
                                    label='District'
                                    placeholder="Select District"
                                    required
                                    value={selectedDistrictId ?? ''}
                                    error={errors.DistrictMasterId}
                                    onChange={(item) => {

                                        if (!item) {
                                            setSelectedDistrictId(null);
                                            setSelectedCityId(null);
                                            setSelectedVillageId(null);

                                            handleFieldChange('DistrictMasterId', 0);
                                            handleFieldChange('CityMasterId', 0);
                                            handleFieldChange('VillageMasterId', 0);
                                            return;
                                        }

                                        const id = Number(item);

                                        setSelectedDistrictId(id);
                                        setSelectedCityId(null);
                                        setSelectedVillageId(null);

                                        handleFieldChange('DistrictMasterId', id);
                                        handleFieldChange('CityMasterId', 0);
                                        handleFieldChange('VillageMasterId', 0);
                                    }}
                                    disabled={!selectedStateId || districtOptions.length === 0}
                                    options={districtOptions}
                                />
                            </div>

                            <div>

                                <SinglePageSelection
                                    label='City'
                                    placeholder="Select City"
                                    required
                                    value={selectedCityId ?? ''}
                                    error={errors.CityMasterId}
                                    onChange={(item) => {

                                        if (!item) {
                                            setSelectedCityId(null);
                                            setSelectedVillageId(null);
                                            handleFieldChange('CityMasterId', 0);
                                            handleFieldChange('VillageMasterId', 0);
                                            return;
                                        }

                                        const id = Number(item);

                                        setSelectedCityId(id);
                                        setSelectedVillageId(null);
                                        handleFieldChange('CityMasterId', id);
                                        handleFieldChange('VillageMasterId', 0);
                                    }}
                                    disabled={!selectedDistrictId || cityOptions.length === 0}
                                    options={cityOptions}
                                />

                            </div>
                            <div>
                                <SinglePageSelection
                                    label="Village"
                                    placeholder="Select Village"
                                    value={selectedVillageId ?? ''}
                                    required
                                    error={errors.VillageMasterId}
                                    onChange={(item) => {

                                        if (!item) {
                                            setSelectedVillageId(null);
                                            handleFieldChange('VillageMasterId', 0);
                                            return;
                                        }

                                        const id = Number(item);

                                        setSelectedVillageId(id);
                                        handleFieldChange('VillageMasterId', id);
                                    }}
                                    disabled={!selectedCityId || villageOptions.length === 0}
                                    options={villageOptions}
                                />

                            </div>
                            <div>
                                <Input
                                    label="PIN Code"
                                    type="text"
                                    maxLength={6}
                                    value={formData.ZipCode}
                                    onChange={(e) => handleFieldChange('ZipCode', filterNumbers(e.target.value))}
                                    placeholder="Enter PIN Code"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Scheme & Scope Details */}
                    <div className="space-y-4 pt-5">
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

                                <MultiSelectDropdown
                                    label="Project Sub Scheme"
                                    placeholder="Select Project Sub Scheme"
                                    options={
                                        formData.ProjectScheme === 'BMC'
                                            ? PROJECT_SUB_SCHEME_BMC.map(opt => ({ label: opt.name, value: opt.id }))
                                            : formData.ProjectScheme === 'MHADA'
                                                ? PROJECT_SUB_SCHEME_MHADA.map(opt => ({ label: opt.name, value: opt.id }))
                                                : formData.ProjectScheme === 'SRA'
                                                    ? PROJECT_SUB_SCHEME_SRA.map(opt => ({ label: opt.name, value: opt.id }))
                                                    : []
                                    }
                                    selectedValues={formData.ProjectSubScheme ? formData.ProjectSubScheme.split(",") : []}
                                    onChange={(values) => handleFieldChange("ProjectSubScheme", values.join(","))}
                                    error={errors.ProjectSubScheme}
                                    disabled={!formData.ProjectScheme}
                                />




                            </div>
                        </div>
                    </div>

                    {/* Project Documentation */}
                    <div className="space-y-4 pt-5">
                        <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-300 pb-2">Project Documentation</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <Input
                                    label="APF Number"
                                    error={errors.APFNumber}
                                    type="text"
                                    value={formData.APFNumber}
                                    onChange={(e) => handleFieldChange('APFNumber', filterAPF(e.target.value))}
                                    placeholder="Enter APF Number"
                                />
                            </div>
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
                                    label="RERA Possession Date"
                                    value={formatDate_dd_mm_yyyy(formData.RERAPossessionDate)}
                                    onChange={(val) => handleFieldChange('RERAPossessionDate', convert_dd_mm_yyyy_To_Yyyy_mm_dd(val))}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Project Financials */}
                    <div className="space-y-4 pt-5">
                        <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-300 pb-2">Project Financials</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <Input
                                    label="Project Estimate Cost"
                                    type="text"
                                    maxLength={16}
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
                                    maxLength={16}
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
                                    onChange={(e) => handleFieldChange('ProjectAreaInSqft', filterNumbersWithDecimal(e.target.value) || 0)}
                                    placeholder="Enter Project Area"
                                    rightIcon="SqFt"
                                />
                            </div>
                            <div>
                                <Input
                                    label="Project Area in (SqMt)"
                                    type="text"
                                    value={formData.ProjectAreaInSqmt || ''}
                                    onChange={(e) => handleFieldChange('ProjectAreaInSqmt', filterNumbersWithDecimal(e.target.value) || 0)}
                                    placeholder="Enter Project Area"
                                    rightIcon="SqMt"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Timeline */}
                    <div className="space-y-4 pt-5">
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
                    <div className="space-y-4 pt-5">
                        <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-300 pb-2">Site Contact Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <Input
                                    label="Name"
                                    type="text"
                                    maxLength={250}
                                    value={formData.SiteContactName}
                                    onChange={(e) => handleFieldChange('SiteContactName', e.target.value)}
                                    placeholder="Enter Site Contact Name"
                                />
                            </div>
                            <div>
                                <Input
                                    label="Mobile Number"
                                    leftIcon="+91"
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
                                <Input
                                    label="Designation"
                                    type="text"
                                    maxLength={250}
                                    value={formData.SiteContactDesignation}
                                    onChange={(e) => handleFieldChange('SiteContactDesignation', e.target.value)}
                                    placeholder="Enter Site Contact Designation"
                                />
                            </div>
                            <div>
                                <Input
                                    label="Name 2"
                                    type="text"
                                    maxLength={250}
                                    value={formData.SiteContact2Name}
                                    onChange={(e) => handleFieldChange('SiteContact2Name', e.target.value)}
                                    placeholder="Enter Site Contact2 Name"
                                />
                            </div>
                            <div>
                                <Input
                                    label="Mobile Number 2"
                                    leftIcon="+91"
                                    error={errors.SiteContact2MobileNumber}
                                    type="text"
                                    value={formData.SiteContact2MobileNumber}
                                    rightIcon={<Phone className="h-4 w-4 text-gray-400" />}
                                    maxLength={10}
                                    onChange={(e) => handleFieldChange('SiteContact2MobileNumber', filterMobile(e.target.value))}
                                    placeholder="Enter Mobile Number"
                                />
                            </div>
                            <div>
                                <Input
                                    label="Designation 2"
                                    type="text"
                                    maxLength={250}
                                    value={formData.SiteContact2Designation}
                                    onChange={(e) => handleFieldChange('SiteContact2Designation', e.target.value)}
                                    placeholder="Enter Designation"
                                />
                            </div>
                            <div>
                                <Input
                                    label="Name 3"
                                    type="text"
                                    maxLength={250}
                                    value={formData.SiteContact3Name}
                                    onChange={(e) => handleFieldChange('SiteContact3Name', e.target.value)}
                                    placeholder="Enter Site Contact3 Name"
                                />
                            </div>
                            <div>
                                <Input
                                    label="Mobile Number 3"
                                    leftIcon="+91"
                                    error={errors.SiteContact3MobileNumber}
                                    type="text"
                                    value={formData.SiteContact3MobileNumber}
                                    rightIcon={<Phone className="h-4 w-4 text-gray-400" />}
                                    maxLength={10}
                                    onChange={(e) => handleFieldChange('SiteContact3MobileNumber', filterMobile(e.target.value))}
                                    placeholder="Enter Mobile Number"
                                />
                            </div>
                            <div>
                                <Input
                                    label="Designation 3"
                                    type="text"
                                    maxLength={250}
                                    value={formData.SiteContact3Designation}
                                    onChange={(e) => handleFieldChange('SiteContact3Designation', e.target.value)}
                                    placeholder="Enter Designation"
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