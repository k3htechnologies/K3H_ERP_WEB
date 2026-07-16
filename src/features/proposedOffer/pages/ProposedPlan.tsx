import React, { useEffect, useState } from 'react';
import { runApiWithLoader } from '@/core/utils';
import * as E from 'fp-ts/Either';
import { useToast } from '@/core/hooks/useToast';
import type {

    ProposedOfferProposedPlanData,
    FilterWithPaginationProposedOfferProposedPlanRequest,
    AddUpdateProposedOfferProposedPlanRequest,
    ProposedPlanWingWiseData
} from '@/features/proposedOffer/models/ProposedOfferModel';

import { proposedOfferService } from '@/features/proposedOffer/services/ProposedOfferService';
import { Loader } from '@/core/utils/loader';
import { Input } from '@/ui/components/forms';
import { useMenuPermissions } from '@/features/menu/hooks/useMenuPermissions';
import { useProject } from '@/features/projectMaster/context/ProjectContext';
import { filterNumbers, filterNumbersWithDecimal } from '@/core/utils/fileValidation';
import BottomActionBar from '@/ui/components/forms/BottomActionBar';
import { AMENITIES_BY_CATEGORY } from '@/core/constants';
import MultiFilePicker from '@/ui/components/ImagePicker/MultiFilePicker';
import MultiSelectCheckBoxWithCategory from '@/ui/components/forms/MultiSelectCheckBoxWithCategory';
import { ExpandableCard } from '@/ui/components/Card/ExpandableCard';

//#region INITIAL FORM STATE - PROPOSED PLAN
const initialFormStateProposedPlan = (): AddUpdateProposedOfferProposedPlanRequest => ({
    ProposedOfferProposedPlanId: 0,
    Uniquekey: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
    ProjectId: 0,

    TotalNumberOfBuilding: 0,
    TotalNumberOfWing: 0,
    TotalPodium: 0,
    TotalUnits: 0,
    TotalParking: 0,

    PlanDocumentURL: null,
    RemovePlanDocumentURL: '',

    ThreeDViewURL: null,
    RemoveThreeDViewURL: '',

    WalkthroughViewURL: null,
    RemoveWalkthroughViewURL: '',

    SalesPlanURL: null,
    RemoveSalesPlanURL: '',

    Amenities: '',
    ProposedOfferProposedPlanJSON: null,


    // Check With Sir
    TotalNumberOfFloors: 0,
    TotalAmmenitiesAreaSqFt: 0,
    MinEntranceLobbyAreaSqFt: 0,
    NumberOfLiftsWingWise: 0
});

//#region INITIAL FORM STATE - WING PLAN
const initialFormStateWingPlan = (): ProposedPlanWingWiseData => ({
    ProposedPlanWingWiseId: 0,
    Wings: '',
    MainEntranceLobbyAreaSqFt: 0,
    TotalNumberOfLifts: 0,
    TotalNumberOfUnits: 0,
    TotalNumberOfUnitsForMember: 0,
    TotalNumberOfUnitsForSale: 0,
    TotalNumberOfAreaForMemberSqFt: 0,
    TotalNumberOfAreaForSaleSqFt: 0
});
//#endregion

export const ProposedPlan: React.FC = () => {

    //#region STATE
    const [, setProposedPlanData] = useState<ProposedOfferProposedPlanData | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');

    const [planDocumentFiles, setPlanDocumentFiles] = useState<(File | string)[]>([]);
    const [removedPlanDocumentUrls, setRemovedPlanDocumentUrls] = useState<string[]>([]);
    const [planDocumentURL, setPlanDocumentURL] = useState<string>();

    // 3D View Document 
    const [threeDViewFiles, setThreeDViewFiles] = useState<(File | string)[]>([]);
    const [removedThreeDViewUrls, setRemovedThreeDViewUrls] = useState<string[]>([]);
    const [threeDViewURL, setThreeDViewURL] = useState<string>();

    // Walk Through View Document
    const [walkThroughViewFiles, setWalkThroughViewFiles] = useState<(File | string)[]>([]);
    const [removedWalkThroughViewUrls, setRemovedWalkThroughViewUrls] = useState<string[]>([]);
    const [walkThroughViewURL, setWalkThroughViewURL] = useState<string>();

    // Sales Plan Document
    const [salesPlanDocumentFiles, setSalesPlanDocumentFiles] = useState<(File | string)[]>([]);
    const [removedSalesPlanDocumentUrls, setRemovedSalesPlanDocumentUrls] = useState<string[]>([]);
    const [salesPlanDocumentURL, setSalesPlanDocumentURL] = useState<string>();

    // TOAST
    const { addToast } = useToast();

    //ERROR SET UP
    const [errorsProposedPlan, setErrorsProposedPlan] = useState<{ [k: string]: string }>({});

    // ADD UPDATE PROPOSED PLAN
    const [formDataProposedPlan, setFormDataProposedPlan] = useState<AddUpdateProposedOfferProposedPlanRequest>(() => initialFormStateProposedPlan());

    // ADD UPDATE WING PLAN
    const [wingsFormData, setWingsFormData] = useState<{ [key: number]: ProposedPlanWingWiseData }>({});
    const [savedWingsData, setSavedWingsData] = useState<{ [key: number]: ProposedPlanWingWiseData }>({});

    // Error WingPlan
    const [wingsErrors, setWingsErrors] = useState<{ [key: number]: { [k: string]: string } }>({});



    //#endregion

    //#region MENU PERMISSIONS
    const { canAction } = useMenuPermissions();
    //#endregion

    //#region PROJECT SELECTION GET ID
    const { projectId } = useProject();
    //#endregion

    //#region INIT

    useEffect(() => {
        if (!projectId) return;

        setPlanDocumentFiles([]);
        setPlanDocumentURL("")
        setRemovedPlanDocumentUrls([]);

        setThreeDViewFiles([]);
        setThreeDViewURL("")
        setRemovedThreeDViewUrls([]);

        setWalkThroughViewFiles([]);
        setWalkThroughViewURL("")
        setRemovedWalkThroughViewUrls([]);

        // Sales Plan Document
        setSalesPlanDocumentFiles([]);
        setSalesPlanDocumentURL("")
        setRemovedSalesPlanDocumentUrls([]);



        fetchProposedPlanData();
        setErrorsProposedPlan({});
    }, [projectId]);


    //#endregion

    //#region HANDLE FIELD CHANGE EVENT - PROPOSED PLAN
    const handleFieldChangeProposedPlan = (field: keyof AddUpdateProposedOfferProposedPlanRequest, value: any) => {
        setFormDataProposedPlan((prev) => ({ ...prev, [field]: value }));

        if (errorsProposedPlan[field]) {
            setErrorsProposedPlan((prev) => ({ ...prev, [field]: "" }));
        }
    };
    //#endregion

    //#region HANDLE FIELD CHANGE EVENT - WING PLAN
    const handleFieldChangeWingPlan = (wingNumber: number, field: keyof ProposedPlanWingWiseData, value: any) => {
        setWingsFormData((prev) => ({
            ...prev,
            [wingNumber]: {
                ...(prev[wingNumber] || initialFormStateWingPlan()),
                [field]: value
            }
        }));

        if (wingsErrors[wingNumber]?.[field]) {
            setWingsErrors((prev) => ({
                ...prev,
                [wingNumber]: {
                    ...prev[wingNumber],
                    [field]: ""
                }
            }));
        }
    };

    const validateWingPlanForm = (wingNumber: number): boolean => {
        const data = wingsFormData[wingNumber] || initialFormStateWingPlan();
        const newErrors: { [key: string]: string } = {};

        if (!data.Wings) newErrors.Wings = "Wing Name is required";
        if (!data.TotalNumberOfLifts) newErrors.TotalNumberOfLifts = "Required";
        if (!data.TotalNumberOfUnits) newErrors.TotalNumberOfUnits = "Required";
        if (!data.TotalNumberOfUnitsForMember) newErrors.TotalNumberOfUnitsForMember = "Required";
        if (!data.TotalNumberOfUnitsForSale) newErrors.TotalNumberOfUnitsForSale = "Required";
        if (!data.TotalNumberOfAreaForMemberSqFt) newErrors.TotalNumberOfAreaForMemberSqFt = "Required";
        if (!data.TotalNumberOfAreaForSaleSqFt) newErrors.TotalNumberOfAreaForSaleSqFt = "Required";

        setWingsErrors(prev => ({
            ...prev,
            [wingNumber]: newErrors
        }));

        if (Object.keys(newErrors).length > 0) {
            addToast({ type: "error", title: "Please fill the required fields" });
        }

        return Object.keys(newErrors).length === 0;
    };

    const handleSaveWingPlan = (wingNumber: number) => {
        if (validateWingPlanForm(wingNumber)) {
            const dataToSave = wingsFormData[wingNumber] || initialFormStateWingPlan();
            setSavedWingsData(prev => ({
                ...prev,
                [wingNumber]: dataToSave
            }));
            addToast({ type: "success", title: `Wing ${wingNumber} details saved locally` });
        }
    };

    const handleEditWingPlan = (wingNumber: number) => {
        setSavedWingsData(prev => {
            const newData = { ...prev };
            delete newData[wingNumber];
            return newData;
        });
    };
    //#endregion

    //#region PROPOSED PLAN

    const fetchProposedPlanData = async () => {
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {
                const params: FilterWithPaginationProposedOfferProposedPlanRequest = {
                    ProjectId: projectId ?? undefined,
                };

                const response = await proposedOfferService.apiCallPullProposedPlan(params);

                if (E.isRight(response)) {
                    const data = response.right.Data?.[0] || null;
                    setProposedPlanData(data);

                    if (data) {
                        setFormDataProposedPlan({
                            ProposedOfferProposedPlanId: data.ProposedOfferProposedPlanId || 0,
                            Uniquekey: data.Uniquekey || initialFormStateProposedPlan().Uniquekey,
                            ProjectId: Number(projectId),
                            TotalNumberOfFloors: data.TotalNumberOfFloors ?? 0,
                            TotalUnits: data.TotalUnits ?? 0,
                            PlanDocumentURL: null,
                            RemovePlanDocumentURL: '',
                            TotalParking: data.TotalParking ?? 0,
                            Amenities: data.Amenities || ''
                        });
                        setPlanDocumentFiles([]);
                        setPlanDocumentURL(data.PlanDocumentURL)
                        setRemovedPlanDocumentUrls([]);
                    } else {
                        setFormDataProposedPlan({
                            ...initialFormStateProposedPlan(),
                            ProjectId: Number(projectId)
                        });
                    }
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
            'Loading Proposed Plan'
        );
    };

    const PushProposedPlanFormData = (): FormData => {

        const form = new FormData();
        form.append('ProposedOfferProposedPlanId', formDataProposedPlan.ProposedOfferProposedPlanId?.toString() || '');
        form.append('Uniquekey', formDataProposedPlan.Uniquekey || '');
        form.append('ProjectId', String(projectId));
        form.append('TotalNumberOfFloors', String(formDataProposedPlan.TotalNumberOfFloors ?? 0));
        form.append('TotalUnits', String(formDataProposedPlan.TotalUnits ?? 0));
        form.append('TotalParking', String(formDataProposedPlan.TotalParking ?? 0));
        //  form.append('MaterialRequisitionDetailJSON', JSON.stringify(materialList) ?? '');
        form.append('Amenities', Array.isArray(formDataProposedPlan.Amenities)
            ? formDataProposedPlan.Amenities.join(",")
            : formDataProposedPlan.Amenities || '');

        planDocumentFiles.forEach(file => {
            if (file instanceof File) {
                form.append('PlanDocumentURL', file);
            }
        });
        form.append('RemovePlanDocumentURL', removedPlanDocumentUrls.join(','));


        // New Upload Files Fields
        threeDViewFiles.forEach(file => {
            if (file instanceof File) {
                form.append('ThreeDViewURL', file);
            }
        });
        form.append('RemoveThreeDViewURL', removedThreeDViewUrls.join(','));

        walkThroughViewFiles.forEach(file => {
            if (file instanceof File) {
                form.append('WalkthroughViewURL', file);
            }
        });
        form.append('RemoveWalkthroughViewURL', removedWalkThroughViewUrls.join(','));

        salesPlanDocumentFiles.forEach(file => {
            if (file instanceof File) {
                form.append('SalesPlanDocumentURL', file);
            }
        });
        form.append('RemoveSalesPlanDocumentURL', removedSalesPlanDocumentUrls.join(','));

        return form;



    }

    const validateProposedPlanForm = (): {
        isValid: boolean
        errors: { [key: string]: string }
    } => {
        const newErrors: { [key: string]: string } = {}

        if (!formDataProposedPlan.TotalNumberOfBuilding) {
            newErrors.TotalNumberOfBuilding = "Total Number of Building is required"
        }

        if (!formDataProposedPlan.TotalNumberOfWing) {
            newErrors.TotalNumberOfWing = "Total Number of Wing is required"
        }

        if (!formDataProposedPlan.TotalPodium) {
            newErrors.TotalPodium = "Total Number of Podium is required"
        }


        if (!formDataProposedPlan.TotalNumberOfFloors) {
            newErrors.TotalNumberOfFloors = "Total Number of Floors is required"
        }

        if (!formDataProposedPlan.TotalUnits) {
            newErrors.TotalUnits = "Total Units is required"
        }

        if (!formDataProposedPlan.TotalParking) {
            newErrors.TotalParking = "Total Parking is required"
        }

        if (!formDataProposedPlan.TotalAmmenitiesAreaSqFt) {
            newErrors.TotalAmmenitiesAreaSqFt = "Total Amenities Area is required"
        }

        if (!formDataProposedPlan.MinEntranceLobbyAreaSqFt) {
            newErrors.MinEntranceLobbyAreaSqFt = "Min Entrance Lobby Area is required"
        }

        if (!formDataProposedPlan.NumberOfLiftsWingWise) {
            newErrors.NumberOfLiftsWingWise = "Number Of Lift (Wing Wise) is required"
        }

        return {
            isValid: Object.keys(newErrors).length === 0,
            errors: newErrors
        }
    }


    const handleSaveProposedPlan = async () => {
        setErrorsProposedPlan({})

        const validation = validateProposedPlanForm()

        if (!validation.isValid) {
            setErrorsProposedPlan(validation.errors)
            return
        }

        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {
                
                const formDataPayload = PushProposedPlanFormData();

                const response = await proposedOfferService.apiCallAddUpdateProposedPlan(formDataPayload);

                if (E.isRight(response)) {

                    addToast({ type: 'success', title: response.right.SuccessMessage[0] });

                    await fetchProposedPlanData();

                    setPlanDocumentFiles([]);
                    setRemovedPlanDocumentUrls([]);

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
            Number(formDataProposedPlan.ProposedOfferProposedPlanId) === 0 ? 'Add Proposed Plan' : 'Update Proposed Plan'
        )
    };
    //#endregion

    //#region AMENITIES COUNT

    const amenitiesCount = Array.isArray(formDataProposedPlan.Amenities)
        ? formDataProposedPlan.Amenities.length
        : typeof formDataProposedPlan.Amenities === "string" && formDataProposedPlan.Amenities.length > 0
            ? formDataProposedPlan.Amenities.split(",").length
            : 0;
    //#endregion

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
            <Loader loading={isLoading} title={loadingMessage}>
                <div></div>
            </Loader>

            <div className="space-y-6 pb-5">
                {/* Proposed Plan Details Section */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-500 pb-2">
                        Proposed Plan Details
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div>
                            <Input
                                label="Total Buildings"
                                type="text"
                                // disabled={!canAction}
                                value={formDataProposedPlan.TotalNumberOfBuilding || ''}
                                onChange={(e) => handleFieldChangeProposedPlan('TotalNumberOfBuilding', filterNumbers(e.target.value) ? Number(filterNumbers(e.target.value)) : 0)}
                                placeholder="Enter Total Buildings"
                                error={errorsProposedPlan.TotalNumberOfBuilding}
                            />
                        </div>
                        <div>
                            <Input
                                label="Total Wings"
                                type="text"
                                // disabled={!canAction}
                                value={formDataProposedPlan.TotalNumberOfWing || ''}
                                onChange={(e) => handleFieldChangeProposedPlan('TotalNumberOfWing', filterNumbers(e.target.value) ? Number(filterNumbers(e.target.value)) : 0)}
                                placeholder="Enter Total Wings"
                                error={errorsProposedPlan.TotalNumberOfWing}
                            />
                        </div>
                        <div>
                            <Input
                                label="Number Of Podium"
                                type="text"
                                // disabled={!canAction}
                                value={formDataProposedPlan.TotalPodium || ''}
                                onChange={(e) => handleFieldChangeProposedPlan('TotalPodium', filterNumbers(e.target.value) ? Number(filterNumbers(e.target.value)) : 0)}
                                placeholder="Enter Number Of Podium"
                                error={errorsProposedPlan.TotalPodium}
                            />
                        </div>
                        <div>
                            <Input
                                label="Total Number of Floors"
                                required
                                type="text"
                                // disabled={!canAction}
                                value={formDataProposedPlan.TotalNumberOfFloors || ''}
                                onChange={(e) => handleFieldChangeProposedPlan('TotalNumberOfFloors', filterNumbers(e.target.value) ? Number(filterNumbers(e.target.value)) : 0)}
                                // maxLength={9}
                                placeholder="Enter Total Number of Floors"
                                error={errorsProposedPlan.TotalNumberOfFloors}
                            />
                        </div>
                        <div>
                            <Input
                                label="Total Units"
                                required
                                type="text"
                                //     disabled={!canAction}
                                value={formDataProposedPlan.TotalUnits || ''}
                                onChange={(e) => handleFieldChangeProposedPlan('TotalUnits', filterNumbers(e.target.value) ? Number(filterNumbers(e.target.value)) : 0)}
                                // maxLength={9}
                                placeholder="Enter Total Units"
                                error={errorsProposedPlan.TotalUnits}
                            />
                        </div>
                        <div>
                            <Input
                                label="Total Parking"
                                required
                                type="text"
                                // disabled={!canAction}
                                value={formDataProposedPlan.TotalParking || ''}
                                onChange={(e) => handleFieldChangeProposedPlan('TotalParking', filterNumbers(e.target.value) ? Number(filterNumbers(e.target.value)) : 0)}
                                error={errorsProposedPlan.TotalParking}
                                // maxLength={9}
                                placeholder="Enter Total Parking"
                            />
                        </div>
                        <div>
                            <Input
                                label="Total Ammenities Area (SqFt)"
                                value={formDataProposedPlan.TotalAmmenitiesAreaSqFt ?? ''}
                                onChange={(e) => handleFieldChangeProposedPlan("TotalAmmenitiesAreaSqFt", filterNumbers(e.target.value))}
                                placeholder="Enter Total Ammenities Area"
                                rightIcon="SqFt"
                                error={errorsProposedPlan.TotalAmmenitiesAreaSqFt}
                            />
                        </div>
                        <div>
                            <Input
                                label="Main Entrance Lobby Area (SqFt)"
                                value={formDataProposedPlan.MinEntranceLobbyAreaSqFt ?? ''}
                                onChange={(e) => handleFieldChangeProposedPlan("MinEntranceLobbyAreaSqFt", filterNumbers(e.target.value))}
                                placeholder="Enter Main Entrance Lobby Area"
                                rightIcon="SqFt"
                                error={errorsProposedPlan.MinEntranceLobbyAreaSqFt}
                            />
                        </div>
                        <div>
                            <Input
                                label="Number Of Lifts Wing Wise"
                                type="text"
                                // disabled={!canAction}
                                value={formDataProposedPlan.NumberOfLiftsWingWise || ''}
                                onChange={(e) => handleFieldChangeProposedPlan('NumberOfLiftsWingWise', filterNumbers(e.target.value) ? Number(filterNumbers(e.target.value)) : 0)}
                                placeholder="Enter Number Of Lift Wing Wise"
                                error={errorsProposedPlan.NumberOfLiftsWingWise}
                            />
                        </div>
                        <div>
                            <MultiFilePicker
                                label="Upload Plan"
                                placeholder="Upload Plan"
                                error={errorsProposedPlan.PlanDocumentURL}
                                value={planDocumentFiles}
                                onChange={setPlanDocumentFiles}
                                availableFilesURL={planDocumentURL ?? ""}
                                allowedTypes={["image/jpeg", "image/png", "image/jpg"]}
                                onRemoveExisting={(url) => {
                                    setRemovedPlanDocumentUrls((prev) => [...prev, url])
                                }}
                            />
                        </div>
                        <div>
                            <MultiFilePicker
                                label="Upload 3D View"
                                placeholder="Upload 3D View"
                                error={errorsProposedPlan.ThreeDViewURL}
                                value={threeDViewFiles}
                                onChange={setThreeDViewFiles}
                                availableFilesURL={threeDViewURL ?? ""}
                                allowedTypes={["image/jpeg", "image/png", "image/jpg"]}
                                onRemoveExisting={(url) => {
                                    setRemovedThreeDViewUrls((prev) => [...prev, url])
                                }}
                            />
                        </div>
                        <div>
                            <MultiFilePicker
                                label="Upload Walkthrough View "
                                placeholder="Upload Walkthrough View"
                                error={errorsProposedPlan.WalkthroughViewURL}
                                value={walkThroughViewFiles}
                                onChange={setWalkThroughViewFiles}
                                availableFilesURL={walkThroughViewURL ?? ""}
                                allowedTypes={["image/jpeg", "image/png", "image/jpg"]}
                                onRemoveExisting={(url) => {
                                    setRemovedWalkThroughViewUrls((prev) => [...prev, url])
                                }}
                            />
                        </div>
                        <div>
                            <MultiFilePicker
                                label="Upload Sales Plan Document"
                                placeholder="Upload Sales Plan Document"
                                error={errorsProposedPlan.SalesPlanDocumentURL}
                                value={salesPlanDocumentFiles}
                                onChange={setSalesPlanDocumentFiles}
                                availableFilesURL={salesPlanDocumentURL ?? ""}
                                allowedTypes={["image/jpeg", "image/png", "image/jpg"]}
                                onRemoveExisting={(url) => {
                                    setRemovedSalesPlanDocumentUrls((prev) => [...prev, url])
                                }}
                            />
                        </div>
                    </div>
                    {/* Dynamic Expandable Cards Layout for Wings */}
                    <div className="space-y-4 mt-4">
                        {Array.from({ length: Number(formDataProposedPlan.TotalNumberOfWing) || 0 }).map((_, index) => {
                            const wingNumber = index + 1;
                            const isSaved = !!savedWingsData[wingNumber];
                            const currentFormData = wingsFormData[wingNumber] || initialFormStateWingPlan();
                            const currentErrors = wingsErrors[wingNumber] || {};

                            return (
                                <ExpandableCard
                                    key={wingNumber}
                                    expandedheight={isSaved ? 400 : 600}
                                    showline={false}
                                    onClick={(isOpen) => {
                                        if (isOpen) {
                                            console.log(`Wing ${wingNumber} expanded`);
                                        }
                                    }}
                                    title={
                                        <div className="font-medium text-md flex items-center gap-2">
                                            <span>Wing {wingNumber} Details {isSaved ? `- ${savedWingsData[wingNumber].Wings}` : ''}</span>
                                            {isSaved && (
                                                <span className="text-green-600 bg-green-50 px-2 py-0.5 rounded text-xs font-semibold border border-green-200">Saved</span>
                                            )}
                                        </div>
                                    }
                                    child={
                                        <div className="p-4 bg-white rounded-b-lg">
                                            {isSaved ? (
                                                <div className="space-y-4">
                                                    <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                                                        <h3 className="text-lg font-medium text-gray-900">Wing Details</h3>
                                                        {canAction && (
                                                            <button
                                                                onClick={(e) => {
                                                                    e.preventDefault();
                                                                    handleEditWingPlan(wingNumber);
                                                                }}
                                                                className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center"
                                                            >
                                                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                                                                Edit
                                                            </button>
                                                        )}
                                                    </div>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                                        <div>
                                                            <p className="text-xs text-gray-500">Wing Name</p>
                                                            <p className="font-medium text-sm">{savedWingsData[wingNumber].Wings}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-xs text-gray-500">Main Entrance Lobby Area (Sq. Ft)</p>
                                                            <p className="font-medium text-sm">{savedWingsData[wingNumber].MainEntranceLobbyAreaSqFt || '-'}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-xs text-gray-500">Total Lifts</p>
                                                            <p className="font-medium text-sm">{savedWingsData[wingNumber].TotalNumberOfLifts}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-xs text-gray-500">Total Units</p>
                                                            <p className="font-medium text-sm">{savedWingsData[wingNumber].TotalNumberOfUnits}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-xs text-gray-500">Units For Member</p>
                                                            <p className="font-medium text-sm">{savedWingsData[wingNumber].TotalNumberOfUnitsForMember}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-xs text-gray-500">Units For Sale</p>
                                                            <p className="font-medium text-sm">{savedWingsData[wingNumber].TotalNumberOfUnitsForSale}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-xs text-gray-500">Area For Member (Sq. Ft)</p>
                                                            <p className="font-medium text-sm">{savedWingsData[wingNumber].TotalNumberOfAreaForMemberSqFt}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-xs text-gray-500">Area For Sale (Sq. Ft)</p>
                                                            <p className="font-medium text-sm">{savedWingsData[wingNumber].TotalNumberOfAreaForSaleSqFt}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="flex-1 space-y-2">
                                                    <form onSubmit={(e) => { e.preventDefault(); handleSaveWingPlan(wingNumber); }}>
                                                        <div className="space-y-4 pb-3">
                                                            <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Wing Details</h3>
                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                                <div>
                                                                    <Input
                                                                        type="text"
                                                                        required
                                                                        label='Wing Name'
                                                                        value={currentFormData.Wings || ""}
                                                                        onChange={(e) => handleFieldChangeWingPlan(wingNumber, "Wings", e.target.value)}
                                                                        placeholder="Enter Wing Name"
                                                                        maxLength={250}
                                                                        error={currentErrors.Wings}
                                                                    />
                                                                </div>
                                                                <div>
                                                                    <Input
                                                                        label='Main Entrance Lobby Area (Sq. Ft)'
                                                                        value={currentFormData.MainEntranceLobbyAreaSqFt || ""}
                                                                        type="text"
                                                                        onChange={(e) => handleFieldChangeWingPlan(wingNumber, 'MainEntranceLobbyAreaSqFt', filterNumbersWithDecimal(e.target.value))}
                                                                        placeholder="Enter Main Entrance Lobby Area (Sq. Ft)"
                                                                        error={currentErrors.MainEntranceLobbyAreaSqFt}
                                                                    />
                                                                </div>
                                                                <div>
                                                                    <Input
                                                                        label='Total Number of Lifts'
                                                                        required
                                                                        placeholder="Enter Total Number of Lifts"
                                                                        type="text"
                                                                        value={currentFormData.TotalNumberOfLifts || ""}
                                                                        onChange={(e) => handleFieldChangeWingPlan(wingNumber, 'TotalNumberOfLifts', filterNumbersWithDecimal(e.target.value))}
                                                                        error={currentErrors.TotalNumberOfLifts}
                                                                    />
                                                                </div>
                                                                <div>
                                                                    <Input
                                                                        label='Total Number of Units'
                                                                        required
                                                                        placeholder="Enter Total Number of Units"
                                                                        type="text"
                                                                        value={currentFormData.TotalNumberOfUnits || ""}
                                                                        onChange={(e) => handleFieldChangeWingPlan(wingNumber, 'TotalNumberOfUnits', filterNumbersWithDecimal(e.target.value))}
                                                                        error={currentErrors.TotalNumberOfUnits}
                                                                    />
                                                                </div>
                                                                <div>
                                                                    <Input
                                                                        type="text"
                                                                        required
                                                                        label='Total Number of Units For Member'
                                                                        value={currentFormData.TotalNumberOfUnitsForMember || ""}
                                                                        onChange={(e) => handleFieldChangeWingPlan(wingNumber, "TotalNumberOfUnitsForMember", filterNumbersWithDecimal(e.target.value))}
                                                                        placeholder="Enter Total Number of Units For Member"
                                                                        error={currentErrors.TotalNumberOfUnitsForMember}
                                                                    />
                                                                </div>
                                                                <div>
                                                                    <Input
                                                                        type="text"
                                                                        required
                                                                        label='Total Number of Units For Sale'
                                                                        value={currentFormData.TotalNumberOfUnitsForSale || ""}
                                                                        onChange={(e) => handleFieldChangeWingPlan(wingNumber, "TotalNumberOfUnitsForSale", filterNumbersWithDecimal(e.target.value))}
                                                                        placeholder="Enter Total Number of Units For Sale"
                                                                        error={currentErrors.TotalNumberOfUnitsForSale}
                                                                    />
                                                                </div>
                                                                <div>
                                                                    <Input
                                                                        type="text"
                                                                        required
                                                                        label='Total Number of Area For Member'
                                                                        value={currentFormData.TotalNumberOfAreaForMemberSqFt || ""}
                                                                        onChange={(e) => handleFieldChangeWingPlan(wingNumber, "TotalNumberOfAreaForMemberSqFt", filterNumbersWithDecimal(e.target.value))}
                                                                        placeholder="Enter Total Number of Area For Member"
                                                                        error={currentErrors.TotalNumberOfAreaForMemberSqFt}
                                                                    />
                                                                </div>
                                                                <div>
                                                                    <Input
                                                                        type="text"
                                                                        required
                                                                        label='Total Number of Area For Sale'
                                                                        value={currentFormData.TotalNumberOfAreaForSaleSqFt || ""}
                                                                        onChange={(e) => handleFieldChangeWingPlan(wingNumber, "TotalNumberOfAreaForSaleSqFt", filterNumbersWithDecimal(e.target.value))}
                                                                        placeholder="Enter Total Number of Area For Sale"
                                                                        error={currentErrors.TotalNumberOfAreaForSaleSqFt}
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </form>
                                                    <BottomActionBar
                                                        saveText={currentFormData.ProposedPlanWingWiseId ? "Update" : "Save "}
                                                        canAction={canAction}
                                                        onSave={() => handleSaveWingPlan(wingNumber)}
                                                        isLoading={isLoading}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    }
                                />
                            );
                        })}
                    </div>
                    <div>

                        <MultiSelectCheckBoxWithCategory
                            label={`Select Amenities (${amenitiesCount})`}
                            placeholder="Search Amenities"
                            options={AMENITIES_BY_CATEGORY}
                            // disabled={!canAction}
                            value={
                                Array.isArray(formDataProposedPlan.Amenities)
                                    ? formDataProposedPlan.Amenities
                                    : formDataProposedPlan.Amenities
                                        ? formDataProposedPlan.Amenities.split(",")
                                        : []
                            }
                            onChange={(values) =>
                                handleFieldChangeProposedPlan("Amenities", values)
                            }
                        />
                    </div>


                </div>
            </div>

            <BottomActionBar
                saveText={(formDataProposedPlan.ProposedOfferProposedPlanId && formDataProposedPlan.ProposedOfferProposedPlanId > 0) ? 'Update' : 'Add'}
                // saveText="Add"
                canAction={canAction && Number(projectId) > 0}
                // canAction={canAction}
                onSave={handleSaveProposedPlan}
                isLoading={isLoading}
            />

        </div>
    );
};

export default ProposedPlan;