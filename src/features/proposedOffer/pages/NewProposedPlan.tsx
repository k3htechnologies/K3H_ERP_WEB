import React, { useEffect, useState } from 'react';
import { runApiWithLoader } from '@/core/utils';
import * as E from 'fp-ts/Either';
import { useToast } from '@/core/hooks/useToast';
import type {
    ProposedOfferProposedPlanData,
    FilterWithPaginationProposedOfferProposedPlanRequest,
    AddUpdateProposedPlanRequest,
    AddUpdateBuildingProposedPlanRequest,
    WingProposedPlanData,
    BuildingProposedPlanData,
    CopyProposedPlanRequest
} from '@/features/proposedOffer/models/ProposedOfferModel';
import { proposedOfferService } from '@/features/proposedOffer/services/ProposedOfferService';
import { Loader } from '@/core/utils/loader';
import { Button, Input } from '@/ui/components/forms';
import { useMenuPermissions } from '@/features/menu/hooks/useMenuPermissions';
import { useProject } from '@/features/projectMaster/context/ProjectContext';
import { filterNumbers, filterNumbersWithDecimal } from '@/core/utils/fileValidation';
import BottomActionBar from '@/ui/components/forms/BottomActionBar';
import { AMENITIES_BY_CATEGORY } from '@/core/constants';
import MultiFilePicker from '@/ui/components/ImagePicker/MultiFilePicker';
import MultiSelectCheckBoxWithCategory from '@/ui/components/forms/MultiSelectCheckBoxWithCategory';
import { ExpandableCard } from '@/ui/components/Card/ExpandableCard';
import Tabs from '@/ui/components/Tab/Tab';
import { Modal } from '@/ui/components/Modal/Modal';
import MultiSelectPagination from '@/ui/components/DropDown/Multiselectpagination';
import NoDataView from '@/ui/components/NoDataView/NoDataView';

const initialFormStateProposedPlan = (): AddUpdateBuildingProposedPlanRequest => ({
    ProposedOfferProposedPlanId: 0,
    Uniquekey: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
    ProjectId: 0,
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
    WingProposedPlanJSON: null,
    SalesResidentialParking: 0,
    SalesCommercialParking: 0,
    SalesVisitorsParking: 0,
    MemberResidentialParking: 0,
    MemberCommercialParking: 0,
    MemberVisitorsParking: 0,
});

const initialFormState = (): AddUpdateProposedPlanRequest => ({
    ProposedOfferProposedPlanId: 0,
    Uniquekey: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
    ProjectId: 0,
    TotalNumberOfBuilding: 0
});

const initialFormStateWingPlan = (): WingProposedPlanData => ({
    ProposedPlanWingWiseId: 0,
    Wings: '',
    MainEntranceLobbyAreaSqFt: 0,
    TotalNumberOfLifts: 0,
    TotalNumberOfUnits: 0,
    TotalNumberOfUnitsForMember: 0,
    TotalNumberOfUnitsForSale: 0,
    TotalNumberOfAreaForMemberSqFt: 0,
    TotalNumberOfAreaForSaleSqFt: 0,
    BuildingName: ""
});

export const NewProposedPlan: React.FC = () => {
    const ProposedPlanTabList = [
        { id: 'BasicDetails', label: 'Basic Details' },
        { id: 'Documents', label: 'Documents' },
        { id: 'ParkingDetails', label: 'Parking Details' },
        { id: 'Ammenities', label: 'Ammenities' },
    ];

    const [buildingCount, setBuildingCount] = useState("");
    const [activeBuilding, setActiveBuilding] = useState('Building 1');
    const [activeTab, setActiveTab] = useState(ProposedPlanTabList[0].id);
    const [isDuplicateModalOpen, setIsDuplicateModalOpen] = useState(false);
    const [selectedDuplicateTargets, setSelectedDuplicateTargets] = useState<(string | number)[]>([]);
    const [proposedPlanData, setProposedPlanData] = useState<ProposedOfferProposedPlanData | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const [planDocumentFiles, setPlanDocumentFiles] = useState<(File | string)[]>([]);
    const [removedPlanDocumentUrls, setRemovedPlanDocumentUrls] = useState<string[]>([]);
    const [planDocumentURL, setPlanDocumentURL] = useState<string>();
    const [threeDViewFiles, setThreeDViewFiles] = useState<(File | string)[]>([]);
    const [removedThreeDViewUrls, setRemovedThreeDViewUrls] = useState<string[]>([]);
    const [threeDViewURL, setThreeDViewURL] = useState<string>();
    const [walkThroughViewFiles, setWalkThroughViewFiles] = useState<(File | string)[]>([]);
    const [removedWalkThroughViewUrls, setRemovedWalkThroughViewUrls] = useState<string[]>([]);
    const [walkThroughViewURL, setWalkThroughViewURL] = useState<string>();
    const [salesPlanDocumentFiles, setSalesPlanDocumentFiles] = useState<(File | string)[]>([]);
    const [removedSalesPlanDocumentUrls, setRemovedSalesPlanDocumentUrls] = useState<string[]>([]);
    const [salesPlanDocumentURL, setSalesPlanDocumentURL] = useState<string>();
    const [errorsProposedPlan, setErrorsProposedPlan] = useState<{ [k: string]: string }>({});
    const [formDataProposedPlan, setFormDataProposedPlan] = useState<AddUpdateBuildingProposedPlanRequest>(() => initialFormStateProposedPlan());
    const [wingsFormData, setWingsFormData] = useState<{ [key: number]: WingProposedPlanData }>({});
    const [savedWingsData, setSavedWingsData] = useState<{ [key: number]: WingProposedPlanData }>({});
    const [wingsErrors, setWingsErrors] = useState<{ [key: number]: { [k: string]: string } }>({});
    const [formData, setFormData] = useState<AddUpdateProposedPlanRequest>(() => initialFormState());
    const [_previousBuildingCount, setPreviousBuildingCount] = useState<number>();
    const [buildingTabs, setBuildingTabs] = useState<{ id: string; label: string }[]>([]);
    const [buildingPlanDataMap, setBuildingPlanDataMap] = useState<Record<string, BuildingProposedPlanData>>({});
    const [addBuildingModal, setAddBuildingModal] = useState(false);
    const [duplicateErrors, setDuplicateErrors] = useState<{ [k: string]: string }>({});

    const { addToast } = useToast();
    const { canAction } = useMenuPermissions();
    const { projectId } = useProject();

    const isBuildingSelected = Number(formData.TotalNumberOfBuilding) > 0;
    const buildingsCount = proposedPlanData?.BuildingProposedPlanData?.length;
    const amenitiesCount = Array.isArray(formDataProposedPlan.Amenities)
        ? formDataProposedPlan.Amenities.length
        : typeof formDataProposedPlan.Amenities === "string" && formDataProposedPlan.Amenities.length > 0
            ? formDataProposedPlan.Amenities.split(",").length
            : 0;

    useEffect(() => {
        if (!projectId) return;

        setActiveBuilding("Building 1");
        setActiveTab(ProposedPlanTabList[0].id);

        setFormData(initialFormState());
        setBuildingTabs([]);
        setBuildingPlanDataMap({});
        setFormDataProposedPlan({
            ...initialFormStateProposedPlan(),
            ProjectId: Number(projectId),
        });

        setWingsFormData({});
        setSavedWingsData({});
        fetchProposedPlanData();
    }, [projectId]);

    const fetchProposedPlanData = async () => {
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {

                const params: FilterWithPaginationProposedOfferProposedPlanRequest = {
                    ProjectId: Number(projectId),
                };

                const response = await proposedOfferService.apiCallPullProposedPlan(params);

                if (E.isRight(response)) {

                    const data = response.right.Data?.[0] || null;

                    if (data) {
                        setProposedPlanData(data);
                        applyBuildingResponseData(data, Number(projectId));

                    } else {

                        setProposedPlanData(null);
                        setBuildingTabs([]);
                        setBuildingPlanDataMap({});
                        setFormDataProposedPlan({
                            ...initialFormStateProposedPlan(),
                            ProjectId: Number(projectId)
                        });
                        setWingsFormData({});
                        setSavedWingsData({});
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

    const fetchDuplicateToBuildings = async (_pageNumber: number = 1, params?: { value?: string }) => {
        const search = params?.value || '';

        let otherBuildings = buildingTabs.filter((b) => b.id !== activeBuilding);

        if (search.trim()) {
            const query = search.toLowerCase();
            otherBuildings = otherBuildings.filter((b) =>
                b.label.toLowerCase().includes(query)
            );
        }

        const itemList = otherBuildings.map((b) => {
            const buildingData = buildingPlanDataMap[b.id];
            return {
                label: b.label,
                value: buildingData?.BuildingProposedPlanId ?? b.id,
            };
        });

        return {
            totalNumberOfRecord: itemList.length,
            itemList: itemList,
        };
    };

    const handleFieldChangeProposedPlan = (field: keyof AddUpdateBuildingProposedPlanRequest, value: any) => {
        setFormDataProposedPlan((prev) => ({ ...prev, [field]: value }));

        if (errorsProposedPlan[field]) {
            setErrorsProposedPlan((prev) => ({ ...prev, [field]: "" }));
        }
    };

    const handleFieldChangeWingPlan = (wingNumber: number, field: keyof WingProposedPlanData, value: any) => {
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

    const handleSaveWingPlan = (wingNumber: number) => {

        const currentWingData = wingsFormData[wingNumber] || initialFormStateWingPlan();
        const currentWingName = currentWingData.Wings?.trim()?.toLowerCase();

        if (!currentWingName) {
            addToast({ type: "error", title: "Please enter a Wing Name." });
            return;
        }

        const isDuplicateName = Object.entries(wingsFormData).some(([key, wing]) => {
            const otherWingNumber = Number(key);
            return (
                otherWingNumber !== wingNumber &&
                wing.Wings?.trim()?.toLowerCase() === currentWingName
            );
        });

        if (isDuplicateName) {
            addToast({
                type: "error",
                title: "Same Wing Names are not allowed.",
            });
            return;
        }

        setWingsErrors(prev => ({
            ...prev,
            [wingNumber]: {}
        }));

        const dataToSave = wingsFormData[wingNumber] || initialFormStateWingPlan();

        setSavedWingsData(prev => ({
            ...prev,
            [wingNumber]: dataToSave
        }));
        addToast({ type: "success", title: `Wing ${wingNumber} details saved.` });
    };


    const bindBuildingData = (building: BuildingProposedPlanData) => {
        setFormDataProposedPlan({
            ...initialFormStateProposedPlan(),
            ProposedOfferProposedPlanId: building.ProposedOfferProposedPlanId ?? 0,
            BuildingProposedPlanId: building.BuildingProposedPlanId ?? 0,
            Uniquekey: building.Uniquekey ?? '',
            ProjectId: building.ProjectId ?? Number(projectId),
            TotalNumberOfWing: building.TotalNumberOfWing ?? 0,
            TotalPodium: building.TotalPodium ?? 0,
            TotalUnits: building.TotalUnits ?? 0,
            TotalParking: building.TotalParking ?? 0,
            SalesResidentialParking: building.SalesResidentialParking ?? 0,
            SalesCommercialParking: building.SalesCommercialParking ?? 0,
            SalesVisitorsParking: building.SalesVisitorsParking ?? 0,
            MemberResidentialParking: building.MemberResidentialParking ?? 0,
            MemberCommercialParking: building.MemberCommercialParking ?? 0,
            MemberVisitorsParking: building.MemberVisitorsParking ?? 0,
            Amenities: building.Amenities ?? '',
        });

        setPlanDocumentURL(building.PlanDocumentURL ?? '');
        setPlanDocumentFiles([]);
        setRemovedPlanDocumentUrls([]);

        setThreeDViewURL(building.ThreeDViewURL ?? '');
        setThreeDViewFiles([]);
        setRemovedThreeDViewUrls([]);

        setWalkThroughViewURL(building.WalkthroughViewURL ?? '');
        setWalkThroughViewFiles([]);
        setRemovedWalkThroughViewUrls([]);

        setSalesPlanDocumentURL(building.SalesPlanURL ?? '');
        setSalesPlanDocumentFiles([]);
        setRemovedSalesPlanDocumentUrls([]);

        const wingMap: { [key: number]: WingProposedPlanData } = {};
        (building.WingProposedPlanData ?? []).forEach((w, idx) => {
            wingMap[idx + 1] = w;
        });
        setWingsFormData(wingMap);
        setSavedWingsData(wingMap);
        setWingsErrors({});
        setErrorsProposedPlan({});
    };

    const handleAddBuilding = () => {
        if (Number(projectId) <= 0) {
            addToast({
                type: "error",
                title: "Please select a project first."
            });
            return;
        }

        setBuildingCount(String(formData.TotalNumberOfBuilding ?? ""));
        setAddBuildingModal(true);
    };

    const handleAddDuplicateBuilding = async (e?: React.FormEvent) => {
        e?.preventDefault();

        const validation = validateDuplicateFormData();
        if (!validation.isValid) {
            setDuplicateErrors(validation.errors);
            return;
        }

        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {
                const payload = PushDuplicateData();

                const response = await proposedOfferService.apiCallCopyProposedPlan(payload);

                if (E.isRight(response)) {

                    setIsDuplicateModalOpen(false);
                    setSelectedDuplicateTargets([]);
                    setDuplicateErrors({});

                    addToast({ type: "success", title: response.right.SuccessMessage[0] });

                    await fetchProposedPlanData();

                } else {

                    addToast({ type: "error", title: response.left?.message });
                }
                return response;
            },

            undefined,
            (error: any) => {

                addToast({ type: "error", title: error.message });

            },
            undefined,

            "Copy Proposed Plan"
        );
    };

    const applyBuildingResponseData = (
        data: ProposedOfferProposedPlanData,
        currentProjectId: number,
        resetTab: boolean = false
    ) => {
        setProposedPlanData(data);

        setPreviousBuildingCount(data.TotalNumberOfBuilding);

        setFormData({
            ProposedOfferProposedPlanId: data.ProposedOfferProposedPlanId,
            ProjectId: currentProjectId,
            TotalNumberOfBuilding: data.TotalNumberOfBuilding,
            Uniquekey: data.Uniquekey
        });

        const buildings = data.BuildingProposedPlanData ?? [];
        const tabs = buildings.map((b) => ({ id: b.BuildingName!, label: b.BuildingName! }));
        setBuildingTabs(tabs);

        const map: Record<string, BuildingProposedPlanData> = {};
        buildings.forEach((b) => { if (b.BuildingName) map[b.BuildingName] = b; });
        setBuildingPlanDataMap(map);

        if (tabs.length > 0) {
            const firstId = tabs[0].id;
            setActiveBuilding((prevBuilding) => {
                const targetBuilding = resetTab ? firstId : prevBuilding;
                const resolvedBuilding = map[targetBuilding] ? targetBuilding : firstId;
                if (map[resolvedBuilding]) bindBuildingData(map[resolvedBuilding]);
                return resolvedBuilding;
            });
            if (resetTab) {
                setActiveTab(ProposedPlanTabList[0].id);
            }
        }
    };

    const handleDuplicateBuilding = () => {
        setIsDuplicateModalOpen(true);
    }

    // const handleAddUpdateProposedPlan = async (eOrTotalBuildings?: React.FormEvent | number) => {
    //     if (typeof eOrTotalBuildings === 'object' && eOrTotalBuildings !== null && 'preventDefault' in eOrTotalBuildings) {
    //         eOrTotalBuildings.preventDefault();
    //     }

    //     const totalBuildings = typeof eOrTotalBuildings === 'number'
    //         ? eOrTotalBuildings
    //         : formData.TotalNumberOfBuilding;

    //     await runApiWithLoader(
    //         setIsLoading,
    //         setLoadingMessage,
    //         async () => {
    //             const Payload: AddUpdateProposedPlanRequest = {
    //                 ProposedOfferProposedPlanId: formData.ProposedOfferProposedPlanId,
    //                 Uniquekey: formData.Uniquekey,
    //                 TotalNumberOfBuilding: totalBuildings,
    //                 ProjectId: Number(projectId),
    //             };

    //             const response = await proposedOfferService.apiCallAddUpdateProposedPlan(Payload);

    //             if (E.isRight(response)) {
    //                 addToast({ type: 'success', title: response.right.SuccessMessage[0] });

    //                 const data = response.right.Data?.[0] || null;
    //                 if (data) {
    //                     applyBuildingResponseData(data, Number(projectId), true);
    //                     setAddBuildingModal(false);
    //                     setPreviousBuildingCount(totalBuildings);
    //                 }
    //             } else {
    //                 addToast({ type: "error", title: response.left?.message });
    //             }
    //             return response;
    //         },
    //         undefined,
    //         (error: any) => {
    //             addToast({ type: 'error', title: error.message });
    //         },
    //         undefined,
    //         Number(formData.ProposedOfferProposedPlanId) === 0 ? 'Add Proposed Plan' : 'Update Proposed Plan'
    //     );
    // };

    const handleAddUpdateProposedPlan = async (eOrTotalBuildings?: React.FormEvent | number) => {
        if (typeof eOrTotalBuildings === 'object' && eOrTotalBuildings !== null && 'preventDefault' in eOrTotalBuildings) {
            eOrTotalBuildings.preventDefault();
        }

        const totalBuildings = typeof eOrTotalBuildings === 'number'
            ? eOrTotalBuildings
            : Number(formData.TotalNumberOfBuilding);

        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {
                const Payload: AddUpdateProposedPlanRequest = {
                    ProposedOfferProposedPlanId: formData.ProposedOfferProposedPlanId,
                    Uniquekey: formData.Uniquekey,
                    TotalNumberOfBuilding: totalBuildings,
                    ProjectId: Number(projectId),
                };

                const response = await proposedOfferService.apiCallAddUpdateProposedPlan(Payload);

                if (E.isRight(response)) {
                    addToast({ type: 'success', title: response.right.SuccessMessage[0] });

                    const data = response.right.Data?.[0] || null;
                    if (data) {
                        applyBuildingResponseData(data, Number(projectId), true);
                    } else if (totalBuildings === 0) {
                        // Reset states when total buildings becomes 0
                        setFormData(prev => ({ ...prev, TotalNumberOfBuilding: 0 }));
                        setProposedPlanData(null);
                        setBuildingTabs([]);
                        setBuildingPlanDataMap({});
                        setFormDataProposedPlan({
                            ...initialFormStateProposedPlan(),
                            ProjectId: Number(projectId)
                        });
                        setWingsFormData({});
                        setSavedWingsData({});
                    }

                    // Modal force close on successful API execution
                    setAddBuildingModal(false);
                    setPreviousBuildingCount(totalBuildings);
                } else {
                    addToast({ type: "error", title: response.left?.message });
                }
                return response;
            },
            undefined,
            (error: any) => {
                addToast({ type: 'error', title: error.message });
            },
            undefined,
            Number(formData.ProposedOfferProposedPlanId) === 0 ? 'Add Proposed Plan' : 'Update Proposed Plan'
        );
    };

    const PushProposedPlanFormData = (): FormData => {

        const form = new FormData();

        form.append('ProposedOfferProposedPlanId', formDataProposedPlan.ProposedOfferProposedPlanId?.toString() || '');
        form.append('Uniquekey', formDataProposedPlan.Uniquekey || '');
        form.append('ProjectId', String(projectId));
        form.append('TotalNumberOfWing', String(formDataProposedPlan.TotalNumberOfWing ?? 0));
        form.append('TotalPodium', String(formDataProposedPlan.TotalPodium ?? 0));
        form.append('SalesResidentialParking', String(formDataProposedPlan.SalesResidentialParking ?? 0));
        form.append('SalesCommercialParking', String(formDataProposedPlan.SalesCommercialParking ?? 0));
        form.append('SalesVisitorsParking', String(formDataProposedPlan.SalesVisitorsParking ?? 0));
        form.append('MemberResidentialParking', String(formDataProposedPlan.MemberResidentialParking ?? 0));
        form.append('MemberCommercialParking', String(formDataProposedPlan.MemberCommercialParking ?? 0));
        form.append('MemberVisitorsParking', String(formDataProposedPlan.MemberVisitorsParking ?? 0));
        form.append("BuildingProposedPlanId", String(formDataProposedPlan.BuildingProposedPlanId));
        form.append("TotalParking", String(finalTotalParkingCount));
        form.append(
            "TotalUnits",
            String(
                Object.values(savedWingsData).reduce(
                    (sum, wing) =>
                        sum +
                        Number(wing.TotalNumberOfUnitsForMember || 0) +
                        Number(wing.TotalNumberOfUnitsForSale || 0),
                    0
                )
            )
        );

        const savedWingsArray = Object.values(savedWingsData).map(wing => ({
            ...wing,
            BuildingName: activeBuilding,
            TotalNumberOfUnits:
                Number(wing.TotalNumberOfUnitsForMember || 0) +
                Number(wing.TotalNumberOfUnitsForSale || 0),
        }));

        form.append('WingProposedPlanJSON', JSON.stringify(savedWingsArray));
        form.append('Amenities', Array.isArray(formDataProposedPlan.Amenities)
            ? formDataProposedPlan.Amenities.join(",")
            : formDataProposedPlan.Amenities || '');

        planDocumentFiles.forEach(file => {
            if (file instanceof File) {
                form.append('PlanDocumentURL', file);
            }
        });
        form.append('RemovePlanDocumentURL', removedPlanDocumentUrls.join(','));

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
                form.append('SalesPlanURL', file);
            }
        });

        form.append('RemoveSalesPlanURL', removedSalesPlanDocumentUrls.join(','));
        return form;
    }

    const PushDuplicateData = (): CopyProposedPlanRequest => {

        const sourceBuilding = buildingPlanDataMap[activeBuilding];

        return {
            ProjectId: Number(projectId),
            ProposedOfferProposedPlanId: formData.ProposedOfferProposedPlanId,
            SourceBuildingProposedPlanId: sourceBuilding.BuildingProposedPlanId!,
            CopyBuildingProposedPlanId: selectedDuplicateTargets.join(","),
        };
    };

    const validateDuplicateFormData = (): {
        isValid: boolean;
        errors: { [key: string]: string };
    } => {
        const newErrors: { [key: string]: string } = {};

        if (selectedDuplicateTargets.length === 0) {
            newErrors.copyBuildingProposedPlanId = 'Duplicate To is required.';
        }

        return {
            isValid: Object.keys(newErrors).length === 0,
            errors: newErrors
        };
    };

    const handleSaveProposedPlan = async () => {

        setErrorsProposedPlan({});

        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {

                const formDataPayload = PushProposedPlanFormData();

                const response = await proposedOfferService.apiCallAddUpdateBuildingProposedPlanRequest(formDataPayload);

                if (E.isRight(response)) {

                    addToast({
                        type: 'success',
                        title: response.right.SuccessMessage[0]
                    });

                    await fetchProposedPlanData();
                    setPlanDocumentFiles([]);
                    setRemovedPlanDocumentUrls([]);
                    setThreeDViewFiles([]);
                    setRemovedThreeDViewUrls([]);
                    setWalkThroughViewFiles([]);
                    setRemovedWalkThroughViewUrls([]);
                    setSalesPlanDocumentFiles([]);
                    setRemovedSalesPlanDocumentUrls([]);

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
            formDataProposedPlan.BuildingProposedPlanId ? "Update Proposed Plan" : "Add Proposed Plan"
        );
    };

    const finalTotalParkingCount =
        Number(formDataProposedPlan.SalesResidentialParking || 0) +
        Number(formDataProposedPlan.SalesCommercialParking || 0) +
        Number(formDataProposedPlan.SalesVisitorsParking || 0) +
        Number(formDataProposedPlan.MemberResidentialParking || 0) +
        Number(formDataProposedPlan.MemberCommercialParking || 0) +
        Number(formDataProposedPlan.MemberVisitorsParking || 0);

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-10">
            <Loader loading={isLoading} title={loadingMessage}>
                <div></div>
            </Loader>

            <div className="flex items-center justify-between border-b border-[#c6c6c6] pb-2">
                <h3 className="text-lg font-semibold text-gray-900">Plan Details</h3>
                {canAction && (
                    <>
                        <Button
                            color="blue"
                            size="mxs"
                            variant="solid"
                            colorMode="gradient_dark"
                            defineWidth
                            onClick={handleAddBuilding}
                        >
                            + Add Building
                        </Button>
                    </>
                )}

            </div>

            <div className='mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4'>
                <Input
                    label="Total Number Of Buildings"
                    type="text"
                    value={formData.TotalNumberOfBuilding ?? ""}
                    disabled

                />
            </div>

            {isBuildingSelected && buildingTabs.length > 0 && (
                <div className="mt-4 flex items-center justify-between gap-3">

                    <div className="flex-1 overflow-x-auto thin-scroll min-w-0 pb-2">
                        <div
                            className="flex flex-nowrap min-w-max items-center gap-2 [&>*]:flex-shrink-0 [&>*]:flex-row [&_div]:flex-nowrap"
                            style={{ display: 'flex', flexWrap: 'nowrap', whiteSpace: 'wrap' }}
                        >
                            <Tabs
                                tabs={buildingTabs}
                                defaultActive={activeBuilding}
                                islarge
                                isChips={false}
                                onTabChange={(tab) => {
                                    setActiveBuilding(tab.id);
                                    setActiveTab(ProposedPlanTabList[0].id);

                                    const buildingData = buildingPlanDataMap[tab.id];

                                    if (buildingData) {
                                        bindBuildingData(buildingData);
                                    } else {
                                        setFormDataProposedPlan({
                                            ...initialFormStateProposedPlan(),
                                            ProjectId: Number(projectId),
                                        });

                                        setWingsFormData({});
                                        setSavedWingsData({});
                                        setErrorsProposedPlan({});
                                    }
                                }}
                            />
                        </div>
                    </div>

                    {buildingTabs.length > 1 && (
                        <div className="shrink-0">
                            {canAction && (
                                <>
                                    <Button
                                        color="blue"
                                        size="mxs"
                                        variant="solid"
                                        defineWidth
                                        onClick={handleDuplicateBuilding}
                                    >
                                        Duplicate
                                    </Button>
                                </>
                            )}

                        </div>
                    )}

                </div>
            )}

            {buildingsCount ? (
                <>
                    <div className="mt-5">
                        <Tabs
                            tabs={ProposedPlanTabList}
                            defaultActive={activeTab}
                            key={activeBuilding}
                            islarge={false}
                            isChips={true}
                            onTabChange={(t) => {
                                setActiveTab(t.id);
                                const currentBuildingData = buildingPlanDataMap[activeBuilding];
                                if (currentBuildingData) {
                                    bindBuildingData(currentBuildingData);
                                }
                            }}
                        />
                    </div>

                    <div>
                        <div className="space-y-4 p-5 -ml-5">
                            {activeTab === 'BasicDetails' && (
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 border-b border-[#c6c6c6] pb-2">
                                        Details
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mt-4">

                                        <div>
                                            <div>
                                                <Input
                                                    label="Total Wings"

                                                    disabled={!isBuildingSelected || !canAction}
                                                    placeholder="Enter Number Of Wings"
                                                    type="text"
                                                    value={formDataProposedPlan.TotalNumberOfWing ?? ''}
                                                    onChange={(e) => {
                                                        const filteredVal = filterNumbers(e.target.value);
                                                        const newWingCount = filteredVal !== '' ? Number(filteredVal) : null;
                                                        handleFieldChangeProposedPlan("TotalNumberOfWing", newWingCount);
                                                        setWingsFormData((prev) => {
                                                            const updated = { ...prev };
                                                            for (let i = 1; i <= (newWingCount ?? 0); i++) {
                                                                if (!updated[i]) {
                                                                    updated[i] = initialFormStateWingPlan();
                                                                }
                                                            }
                                                            return updated;
                                                        });
                                                        setSavedWingsData((prev) => {
                                                            const updated = { ...prev };
                                                            for (let i = 1; i <= (newWingCount ?? 0); i++) {
                                                                if (!updated[i]) {
                                                                    updated[i] = initialFormStateWingPlan();
                                                                }
                                                            }
                                                            return updated;
                                                        });
                                                        setWingsErrors((prev) => {
                                                            const updated = { ...prev };
                                                            for (let i = 1; i <= (newWingCount ?? 0); i++) {
                                                                if (!updated[i]) {
                                                                    updated[i] = {};
                                                                }
                                                            }
                                                            return updated;
                                                        });
                                                    }}

                                                    maxLength={2}
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <Input
                                                label="Number Of Podium"
                                                type="text"
                                                disabled={!isBuildingSelected || !canAction}
                                                value={formDataProposedPlan.TotalPodium || ''}
                                                onChange={(e) => handleFieldChangeProposedPlan('TotalPodium', filterNumbers(e.target.value))}
                                                placeholder="Enter Number Of Podium"
                                                error={errorsProposedPlan.TotalPodium}
                                                maxLength={2}
                                            />
                                        </div>
                                        <div>
                                            <Input
                                                label="Total Units"
                                                type="text"
                                                value={formDataProposedPlan.TotalUnits ?? 0}
                                                disabled
                                                placeholder="0"
                                            />
                                        </div>

                                    </div>

                                    <div className="space-y-4 mt-4">
                                        {Array.from({ length: Number(formDataProposedPlan.TotalNumberOfWing) || 0 }).map((_, index) => {
                                            const wingNumber = index + 1;
                                            const isSaved = !!savedWingsData[wingNumber];
                                            const currentFormData = wingsFormData[wingNumber] || initialFormStateWingPlan();

                                            return (
                                                <ExpandableCard
                                                    key={wingNumber}
                                                    expandedheight={isSaved ? 400 : 600}
                                                    showline={false}
                                                    title={
                                                        <div className="font-medium text-md flex items-center gap-2 ">
                                                            <span>
                                                                {currentFormData.BuildingName
                                                                    ? `Building ${currentFormData.BuildingName} Wing Details`
                                                                    : `Wing ${wingNumber} Details`}
                                                                {currentFormData.Wings ? ` - ${currentFormData.Wings}` : ''}
                                                            </span>
                                                        </div>
                                                    }
                                                    child={
                                                        <div className="">
                                                            <div className='bg-white'>
                                                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-5 p-5 ">
                                                                    <div>
                                                                        <Input
                                                                            type="text"
                                                                            label="Wing Name"
                                                                            disabled={!canAction}
                                                                            value={currentFormData.Wings || ""}
                                                                            onChange={(e) =>
                                                                                handleFieldChangeWingPlan(
                                                                                    wingNumber,
                                                                                    "Wings",
                                                                                    e.target.value
                                                                                )
                                                                            }
                                                                            placeholder="Enter Wing Name"
                                                                            maxLength={25}
                                                                        />
                                                                    </div>

                                                                    <div>
                                                                        <Input
                                                                            label="Main Entrance Lobby Area (SqFt)"
                                                                            disabled={!canAction}
                                                                            value={currentFormData.MainEntranceLobbyAreaSqFt || ""}
                                                                            type="text"
                                                                            onChange={(e) =>
                                                                                handleFieldChangeWingPlan(
                                                                                    wingNumber,
                                                                                    "MainEntranceLobbyAreaSqFt",
                                                                                    filterNumbersWithDecimal(e.target.value)
                                                                                )
                                                                            }
                                                                            placeholder="Enter Main Entrance Lobby Area (SqFt)"
                                                                            maxLength={7}
                                                                        />
                                                                    </div>

                                                                    <div>
                                                                        <Input
                                                                            label="Total Number of Lifts"
                                                                            disabled={!canAction}
                                                                            placeholder="Enter Total Number of Lifts"
                                                                            type="text"
                                                                            value={currentFormData.TotalNumberOfLifts || ""}
                                                                            onChange={(e) =>
                                                                                handleFieldChangeWingPlan(
                                                                                    wingNumber,
                                                                                    "TotalNumberOfLifts",
                                                                                    filterNumbers(e.target.value)
                                                                                )
                                                                            }
                                                                            maxLength={2}
                                                                        />
                                                                    </div>

                                                                    <div>
                                                                        <Input
                                                                            type="text"
                                                                            disabled={!canAction}
                                                                            label="Total No. Of Units For Member"
                                                                            value={currentFormData.TotalNumberOfUnitsForMember || ""}
                                                                            onChange={(e) =>
                                                                                handleFieldChangeWingPlan(
                                                                                    wingNumber,
                                                                                    "TotalNumberOfUnitsForMember",
                                                                                    filterNumbers(e.target.value)
                                                                                )
                                                                            }
                                                                            maxLength={4}
                                                                            placeholder="Enter Total Number of Units For Member"
                                                                        />
                                                                    </div>

                                                                    <div>
                                                                        <Input
                                                                            type="text"
                                                                            label="Total No. Of Units For Sale"
                                                                            disabled={!canAction}
                                                                            value={currentFormData.TotalNumberOfUnitsForSale || ""}
                                                                            onChange={(e) =>
                                                                                handleFieldChangeWingPlan(
                                                                                    wingNumber,
                                                                                    "TotalNumberOfUnitsForSale",
                                                                                    filterNumbers(e.target.value)
                                                                                )
                                                                            }
                                                                            maxLength={4}
                                                                            placeholder="Enter Total Number of Units For Sale"
                                                                        />
                                                                    </div>
                                                                    <div>
                                                                        <Input
                                                                            label="Total Number Of Units"
                                                                            value={(
                                                                                Number(currentFormData?.TotalNumberOfUnitsForMember) +
                                                                                Number(currentFormData?.TotalNumberOfUnitsForSale || 0)
                                                                            )}
                                                                            disabled
                                                                        />
                                                                    </div>

                                                                    <div>
                                                                        <Input
                                                                            type="text"
                                                                            label="Total Area For Member (SqFt)"
                                                                            disabled={!canAction}
                                                                            value={currentFormData.TotalNumberOfAreaForMemberSqFt || ""}
                                                                            onChange={(e) =>
                                                                                handleFieldChangeWingPlan(
                                                                                    wingNumber,
                                                                                    "TotalNumberOfAreaForMemberSqFt",
                                                                                    filterNumbersWithDecimal(e.target.value)
                                                                                )
                                                                            }
                                                                            placeholder="Enter Total Area For Member"
                                                                            maxLength={7}

                                                                        />
                                                                    </div>

                                                                    <div>
                                                                        <Input
                                                                            type="text"
                                                                            label="Total Area For Sale (SqFt)"
                                                                            disabled={!canAction}
                                                                            value={currentFormData.TotalNumberOfAreaForSaleSqFt || ""}
                                                                            onChange={(e) =>
                                                                                handleFieldChangeWingPlan(
                                                                                    wingNumber,
                                                                                    "TotalNumberOfAreaForSaleSqFt",
                                                                                    filterNumbersWithDecimal(e.target.value)
                                                                                )
                                                                            }
                                                                            placeholder="Enter Total Area For Sale"
                                                                            maxLength={7}
                                                                        />
                                                                    </div>
                                                                    <div>
                                                                        <Input
                                                                            label="Total Area (SqFt)"
                                                                            value={(
                                                                                Number(currentFormData?.TotalNumberOfAreaForMemberSqFt) +
                                                                                Number(currentFormData?.TotalNumberOfAreaForSaleSqFt || 0)
                                                                            ).toFixed(2)}
                                                                            disabled
                                                                        />
                                                                    </div>

                                                                </div>
                                                            </div>

                                                            <div className="mt-6 flex justify-end ">
                                                                <BottomActionBar
                                                                    saveText={
                                                                        currentFormData.ProposedPlanWingWiseId
                                                                            ? "Update"
                                                                            : "Save"
                                                                    }
                                                                    canAction={canAction}
                                                                    onSave={() => handleSaveWingPlan(wingNumber)}
                                                                    isLoading={isLoading}
                                                                />
                                                            </div>
                                                        </div>
                                                    }
                                                />
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {activeTab === 'Documents' && (
                                <div className="mt-5">
                                    <h3 className="text-lg font-semibold text-gray-900 border-b border-[#c6c6c6] pb-2">
                                        Document Uploads
                                    </h3>

                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-4">
                                        <MultiFilePicker
                                            label="Upload Plan"
                                            placeholder="Upload Plan"
                                            disabled={!isBuildingSelected || !canAction}
                                            value={planDocumentFiles}
                                            onChange={setPlanDocumentFiles}
                                            availableFilesURL={planDocumentURL ?? ""}
                                            allowedTypes={["image/jpeg", "image/png", "image/jpg", "application/pdf"]}
                                            onRemoveExisting={(removedUrl) => {
                                                setRemovedPlanDocumentUrls((prev) => [...prev, removedUrl]);
                                            }}
                                        />

                                        <MultiFilePicker
                                            label="Upload 3D View"
                                            placeholder="Upload 3D View"
                                            disabled={!isBuildingSelected || !canAction}
                                            value={threeDViewFiles}
                                            onChange={setThreeDViewFiles}
                                            availableFilesURL={threeDViewURL ?? ""}
                                            onRemoveExisting={(removedUrl) => {
                                                setRemovedThreeDViewUrls((prev) => [...prev, removedUrl]);
                                            }}
                                            allowedTypes={["image/jpeg", "image/png", "image/jpg"]}

                                        />

                                        <MultiFilePicker
                                            label="Upload Walkthrough View"
                                            placeholder="Upload Walkthrough View"
                                            disabled={!isBuildingSelected || !canAction}
                                            value={walkThroughViewFiles}
                                            onChange={setWalkThroughViewFiles}
                                            availableFilesURL={walkThroughViewURL ?? ""}
                                            onRemoveExisting={(removedUrl) => {
                                                setRemovedWalkThroughViewUrls((prev) => [...prev, removedUrl]);
                                            }}
                                            allowedTypes={["image/jpeg", "image/png", "image/jpg"]}
                                        />

                                        <MultiFilePicker
                                            label="Upload Sales Plan"
                                            placeholder="Upload Sales Plan"
                                            disabled={!isBuildingSelected || !canAction}
                                            value={salesPlanDocumentFiles}
                                            onChange={setSalesPlanDocumentFiles}
                                            availableFilesURL={salesPlanDocumentURL ?? ""}
                                            onRemoveExisting={(removedUrl) => {
                                                setRemovedSalesPlanDocumentUrls((prev) => [...prev, removedUrl]);
                                            }}
                                            allowedTypes={["image/jpeg", "image/png", "image/jpg"]}
                                        />
                                    </div>
                                </div>
                            )}

                            {activeTab === 'ParkingDetails' && (
                                <div className='mt-5'>
                                    <h3 className="text-lg font-semibold text-gray-900 border-b border-[#c6c6c6] pb-2">
                                        Parking Details
                                    </h3>

                                    <div className='mt-3'>
                                        <label className="text-sm font-medium text-gray-500 ">Overall Parking (Sales Parking + Members Parking)</label>
                                        <p className="mt-1 text-md text-[#18536d] font-medium border border-gray-300 rounded-md px-3 py-2 bg-blue-50 text-gray-900">
                                            {formDataProposedPlan.TotalParking ?? 0}
                                        </p>
                                    </div>
                                    <h2 className='text-md font-semibold mt-3'>Sales Parking</h2>
                                    <div className='grid grid-cols-1 md:grid-cols-4 gap-6 mt-5'>
                                        <div>
                                            <Input
                                                label="Residential"
                                                type="text"
                                                disabled={!isBuildingSelected || !canAction}
                                                placeholder="Enter Residential"
                                                value={formDataProposedPlan.SalesResidentialParking ?? 0}
                                                onChange={(e) => handleFieldChangeProposedPlan('SalesResidentialParking', filterNumbers(e.target.value))}
                                                maxLength={3}
                                            />
                                        </div>
                                        <div>
                                            <Input
                                                label="Commercial"
                                                type="text"
                                                disabled={!isBuildingSelected || !canAction}
                                                placeholder="Enter Commercial"
                                                value={formDataProposedPlan.SalesCommercialParking ?? 0}
                                                onChange={(e) => handleFieldChangeProposedPlan('SalesCommercialParking', filterNumbers(e.target.value))}
                                                maxLength={3}
                                                error={errorsProposedPlan.SalesCommercialParking}
                                            />
                                        </div>
                                        <div>
                                            <Input
                                                label="Visitors"
                                                type="text"
                                                disabled={!isBuildingSelected || !canAction}
                                                placeholder="Enter Visitors"
                                                value={formDataProposedPlan.SalesVisitorsParking ?? 0}
                                                onChange={(e) => handleFieldChangeProposedPlan('SalesVisitorsParking', filterNumbers(e.target.value))}
                                                maxLength={3}
                                            />
                                        </div>
                                        <div>
                                            <Input
                                                label="Total Sales Parking"
                                                value={(Number(formDataProposedPlan.SalesResidentialParking) + Number(formDataProposedPlan.SalesCommercialParking) + Number(formDataProposedPlan.SalesVisitorsParking)) || '0'}
                                                disabled
                                            />
                                        </div>
                                    </div>

                                    <h2 className='text-md font-semibold mt-3'>Members Parking</h2>

                                    <div className='grid grid-cols-1 md:grid-cols-4 gap-6 mt-5'>
                                        <div>
                                            <Input
                                                label="Residential"
                                                type="text"
                                                placeholder="Enter Residential"
                                                disabled={!isBuildingSelected || !canAction}
                                                value={formDataProposedPlan.MemberResidentialParking ?? 0}
                                                onChange={(e) => handleFieldChangeProposedPlan('MemberResidentialParking', filterNumbers(e.target.value))}
                                                maxLength={3}
                                            />
                                        </div>

                                        <div>
                                            <Input
                                                label="Commercial"
                                                type="text"
                                                disabled={!isBuildingSelected || !canAction}
                                                placeholder="Enter Commercial"
                                                value={formDataProposedPlan.MemberCommercialParking ?? 0}
                                                onChange={(e) => handleFieldChangeProposedPlan('MemberCommercialParking', filterNumbers(e.target.value))}
                                                maxLength={3}
                                            />
                                        </div>
                                        <div>
                                            <Input
                                                label="Visitors"
                                                type="text"
                                                disabled={!isBuildingSelected || !canAction}
                                                placeholder="Enter Visitors"
                                                value={formDataProposedPlan.MemberVisitorsParking ?? 0}
                                                onChange={(e) => handleFieldChangeProposedPlan('MemberVisitorsParking', filterNumbers(e.target.value))}
                                                maxLength={3}
                                            />
                                        </div>
                                        <div>
                                            <Input
                                                label="Total Members Parking"
                                                value={(Number(formDataProposedPlan.MemberResidentialParking) + Number(formDataProposedPlan.MemberCommercialParking) + Number(formDataProposedPlan.MemberVisitorsParking)) || '0'}
                                                disabled
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'Ammenities' && (
                                <>
                                    <div>
                                        <MultiSelectCheckBoxWithCategory
                                            label={`Select Amenities (${amenitiesCount})`}
                                            placeholder="Search Amenities"
                                            options={AMENITIES_BY_CATEGORY}
                                            disabled={!isBuildingSelected || !canAction}
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
                                </>
                            )}

                        </div>
                    </div>

                    <BottomActionBar
                        saveText={
                            formDataProposedPlan.BuildingProposedPlanId
                                ? "Update"
                                : "Add"
                        }
                        canAction={canAction && Number(projectId) > 0}
                        onSave={handleSaveProposedPlan}
                        isLoading={isLoading}
                    />

                </>
            )
                : (
                    <section className="md:col-span-4 bg-white rounded-xl shadow-sm p-6 border-[0.1px] border-[#3333334f] mt-5">
                        <NoDataView message="No Data Found" />
                    </section>
                )}
            <Modal
                isOpen={isDuplicateModalOpen}
                onClose={() => {
                    setIsDuplicateModalOpen(false);
                    setSelectedDuplicateTargets([]);
                    setDuplicateErrors({});
                }}
                onCancel={() => {
                    setIsDuplicateModalOpen(false);
                    setSelectedDuplicateTargets([]);
                    setDuplicateErrors({});
                }}
                title="Duplicate Building Configurations"
                onSubmit={handleAddDuplicateBuilding}
                saveText="Duplicate"
                loading={isLoading}
                size='xl'
            >
                <div className="space-y-4 p-6 bg-blue-100 rounded-lg w-full box-border">
                    <div>
                        <Input
                            label="Source Building"
                            value={buildingPlanDataMap[activeBuilding]?.BuildingName ?? activeBuilding}
                            disabled
                        />
                    </div>
                    <div>
                        <MultiSelectPagination
                            label="Applicable Buildings"
                            key={activeBuilding}
                            dataFetchCallBack={fetchDuplicateToBuildings}
                            required
                            error={duplicateErrors.copyBuildingProposedPlanId}
                            selectedValues={selectedDuplicateTargets}
                            onChange={(values) => {
                                setSelectedDuplicateTargets(values);
                                setDuplicateErrors({ copyBuildingProposedPlanId: '' });
                            }}
                        />
                    </div>
                </div>
            </Modal>

            <Modal
                isOpen={addBuildingModal}
                onClose={() => {
                    setAddBuildingModal(false);
                }}
                onCancel={() => {
                    setAddBuildingModal(false);
                }}
                title="Add Building"
                onSubmit={(e) => {
                    if (e && typeof e === 'object' && 'preventDefault' in e) e.preventDefault();

                    const trimmedCount = buildingCount.trim();
                    const count = Number(trimmedCount);


                    if (trimmedCount === '' || Number.isNaN(count) || count < 0) {
                        addToast({ type: 'error', title: 'Please enter a valid non-negative number.' });
                        return;
                    }

                    handleAddUpdateProposedPlan(count);
                }}
                saveText="Add"
                loading={isLoading}
                size='xl'
            >
                <div className="space-y-4 p-6 bg-blue-100 rounded-lg w-full box-border">
                    <div>
                        <Input
                            label="Total Number Of Buildings"
                            type="text"
                            value={buildingCount}
                            onChange={(e) => setBuildingCount(e.target.value)}
                            placeholder="Enter Total Number Of Buildings"
                            maxLength={2}
                        />
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default NewProposedPlan; 