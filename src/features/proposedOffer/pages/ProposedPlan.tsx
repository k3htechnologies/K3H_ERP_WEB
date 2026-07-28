import React, { useEffect, useRef, useState } from 'react';
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
import ConfirmationDialogBox from '@/core/utils/confirmationDialogBox';
import { Modal } from '@/ui/components/Modal/Modal';
import MultiSelectPagination from '@/ui/components/DropDown/Multiselectpagination';

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
  BuildingId: ""
});

export const ProposedPlan: React.FC = () => {

  const ProposedPlanTabList = [
    { id: 'BasicDetails', label: 'Basic Details' },
    { id: 'Documents', label: 'Documents' },
    { id: 'ParkingDetails', label: 'Parking Details' },
    { id: 'Ammenities', label: 'Ammenities' },
  ];

  const [activeBuilding, setActiveBuilding] = useState('Building 1');
  const [activeTab, setActiveTab] = useState(ProposedPlanTabList[0].id);
  const [isDuplicateModalOpen, setIsDuplicateModalOpen] = useState(false);
  const [selectedDuplicateTargets, setSelectedDuplicateTargets] = useState<(string | number)[]>([]);
  const [_proposedPlanData, setProposedPlanData] = useState<ProposedOfferProposedPlanData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');

  const totalBuildingInputRef = useRef<HTMLInputElement>(null);

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

  const { addToast } = useToast();

  const [errorsProposedPlan, setErrorsProposedPlan] = useState<{ [k: string]: string }>({});

  const [formDataProposedPlan, setFormDataProposedPlan] = useState<AddUpdateBuildingProposedPlanRequest>(() => initialFormStateProposedPlan());

  const [isProposedPlanUpdateDialogOpen, setIsProposedPlanUpdateDialogOpen] = useState(false);

  const [wingsFormData, setWingsFormData] = useState<{ [key: number]: WingProposedPlanData }>({});
  const [savedWingsData, setSavedWingsData] = useState<{ [key: number]: WingProposedPlanData }>({});

  const [wingsErrors, setWingsErrors] = useState<{ [key: number]: { [k: string]: string } }>({});

  const { canAction } = useMenuPermissions();

  const { projectId } = useProject();

  const [formData, setFormData] = useState<AddUpdateProposedPlanRequest>(() => initialFormState());

  const [buildingTabs, setBuildingTabs] = useState<{ id: string; label: string }[]>([]);

  const [buildingPlanDataMap, setBuildingPlanDataMap] = useState<Record<string, BuildingProposedPlanData>>({});

  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingTotalBuildingsRef = useRef<number>(0);

  const isBuildingSelected = Number(formData.TotalNumberOfBuilding) > 0;

  useEffect(() => {
    if (!projectId) return;
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

  const handleFieldChangeProposedPlan = (field: keyof AddUpdateBuildingProposedPlanRequest, value: any) => {
    setFormDataProposedPlan((prev) => ({ ...prev, [field]: value }));

    if (errorsProposedPlan[field]) {
      setErrorsProposedPlan((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleField = (field: keyof AddUpdateProposedPlanRequest, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

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

  const handleAddDuplicateBuilding = async (e?: React.FormEvent) => {
    e?.preventDefault();

    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {
        const payload = PushDuplicateData();

        const response = await proposedOfferService.apiCallCopyProposedPlan(payload);

        if (E.isRight(response)) {

          setIsDuplicateModalOpen(false);

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

    setFormData({
      ProposedOfferProposedPlanId: data.ProposedOfferProposedPlanId,
      ProjectId: currentProjectId,
      TotalNumberOfBuilding: data.TotalNumberOfBuilding,
      Uniquekey: data.Uniquekey
    });

    const buildings = data.BuildingProposedPlanData ?? [];
    
    const tabs = buildings.map((b) => ({ id: b.BuildingId!, label: b.BuildingId! }));

    setBuildingTabs(tabs);

    const map: Record<string, BuildingProposedPlanData> = {};
    buildings.forEach((b) => { if (b.BuildingId) map[b.BuildingId] = b; });

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

  const handleAddUpdateProposedPlan = async (totalBuildings?: number) => {

    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {
        const Payload: AddUpdateProposedPlanRequest = {
          ProposedOfferProposedPlanId: formData.ProposedOfferProposedPlanId,
          Uniquekey: formData.Uniquekey,
          TotalNumberOfBuilding: totalBuildings ?? formData.TotalNumberOfBuilding,
          ProjectId: Number(projectId),
        };

        const response = await proposedOfferService.apiCallAddUpdateProposedPlan(Payload);

        if (E.isRight(response)) {

          addToast({ type: 'success', title: response.right.SuccessMessage[0] });

          const data = response.right.Data?.[0] || null;
          if (data) {
            applyBuildingResponseData(data, Number(projectId), true);
            setIsProposedPlanUpdateDialogOpen(false);
          }

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
      Number(formData.ProposedOfferProposedPlanId) === 0 ? 'Add Proposed Plan' : 'Update Proposed Plan'
    )
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
      CopyBuildingProposedPlanId: Number(selectedDuplicateTargets[0]),
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

  const handleTotalBuildingChange = (value: string) => {
    const cleanedDigits = filterNumbers(value);
    const totalBuildings = Number(cleanedDigits) || 0;

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }

    if (!cleanedDigits || totalBuildings <= 0) {
      handleField("TotalNumberOfBuilding", 0);
      return;
    }

    handleField("TotalNumberOfBuilding", totalBuildings);

    if (totalBuildings !== formData.TotalNumberOfBuilding) {
      pendingTotalBuildingsRef.current = totalBuildings;

      debounceTimerRef.current = setTimeout(() => {
        totalBuildingInputRef.current?.blur();
        setIsProposedPlanUpdateDialogOpen(true);
      }, 500);
    }
  };

  const fetchDuplicateToBuildings = async (
    _pageNumber: number = 1,
    params?: { value?: string }
  ) => {
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


  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-10">
      <Loader loading={isLoading} title={loadingMessage}>
        <div></div>
      </Loader>

      <h3 className="text-lg font-semibold text-gray-900 border-b border-[#c6c6c6] pb-2">Plan Details</h3>

      <div className='mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4'>
        <Input
          label="Total Buildings"
          type="text"
          ref={totalBuildingInputRef}
          value={formData.TotalNumberOfBuilding || ""}
          onChange={(e) => handleTotalBuildingChange(e.target.value)}
          placeholder="Enter Total Buildings"
          maxLength={2}
        />
      </div>

      <div className="mt-4 flex items-center justify-between gap-3">
        <div className="flex-1 overflow-x-auto thin-scroll">
          <div className="flex flex-nowrap min-w-max">
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
                    ProjectId: Number(projectId)
                  });
                  setWingsFormData({});
                  setSavedWingsData({});
                  setErrorsProposedPlan({});
                }
              }}
            />
          </div>
        </div>


        {Number(formData.TotalNumberOfBuilding) > 1 && (
          <div className="shrink-0">
            <Button
              color="blue"
              size="mxs"
              variant="solid"
              colorMode="gradient_dark"
              defineWidth
              onClick={handleDuplicateBuilding}
            >
              Duplicate
            </Button>
          </div>
        )}
      </div>

      <div className="border-b border-[#c6c6c6] mt-5"></div>

      <div className="mt-5">
        <Tabs
          tabs={ProposedPlanTabList}
          defaultActive={activeTab}
          key={activeBuilding}
          islarge={false}
          isChips={true}
          onTabChange={(t) => setActiveTab(t.id)}
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
                      disabled={!isBuildingSelected}
                      type="text"
                      value={formDataProposedPlan.TotalNumberOfWing || ''}
                      onChange={(e) => {
                        const filteredVal = filterNumbers(e.target.value);
                        const newWingCount = filteredVal ? Number(filteredVal) : 0;
                        handleFieldChangeProposedPlan('TotalNumberOfWing', newWingCount);
                        setWingsFormData({});
                        setSavedWingsData({});
                        setWingsErrors({});
                      }}
                      placeholder="Enter Total Wings"
                      maxLength={2}
                      error={errorsProposedPlan.TotalNumberOfWing}
                    />
                  </div>
                </div>
                <div>
                  <Input
                    label="Number Of Podium"
                    type="text"
                    disabled={!isBuildingSelected}
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
                            {currentFormData.BuildingId
                              ? `Building ${currentFormData.BuildingId} Wing Details`
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
                                />
                              </div>

                              <div>
                                <Input
                                  label="Total Number of Lifts"
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
                                  label="Total No. of Units For Member"
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
                                  label="Total Number of Units For Sale"
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
                                  value={currentFormData.TotalNumberOfAreaForMemberSqFt || ""}
                                  onChange={(e) =>
                                    handleFieldChangeWingPlan(
                                      wingNumber,
                                      "TotalNumberOfAreaForMemberSqFt",
                                      filterNumbersWithDecimal(e.target.value)
                                    )
                                  }
                                  placeholder="Enter Total Area For Member"
                                />
                              </div>

                              <div>
                                <Input
                                  type="text"
                                  label="Total Area For Sale (SqFt)"
                                  value={currentFormData.TotalNumberOfAreaForSaleSqFt || ""}
                                  onChange={(e) =>
                                    handleFieldChangeWingPlan(
                                      wingNumber,
                                      "TotalNumberOfAreaForSaleSqFt",
                                      filterNumbersWithDecimal(e.target.value)
                                    )
                                  }
                                  placeholder="Enter Total Area For Sale"
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

                          <ConfirmationDialogBox
                            title='Add Building'
                            message='Are you sure you want to Add Building'
                            isOpen={isProposedPlanUpdateDialogOpen}
                            onClose={() => {
                              setIsProposedPlanUpdateDialogOpen(false);
                            }}
                            onConfirm={handleAddUpdateProposedPlan}
                            confirmText="Yes"
                            cancelText="No"
                            loading={isLoading}
                            variant='logout'
                          />
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
                  disabled={!isBuildingSelected}
                  value={planDocumentFiles}
                  onChange={setPlanDocumentFiles}
                  availableFilesURL={planDocumentURL ?? ""}
                  allowedTypes={["image/jpeg", "image/png", "image/jpg"]}
                  onRemoveExisting={(removedUrl) => {
                    setRemovedPlanDocumentUrls((prev) => [...prev, removedUrl]);
                  }}
                />

                <MultiFilePicker
                  label="Upload 3D View"
                  placeholder="Upload 3D View"
                  disabled={!isBuildingSelected}
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
                  disabled={!isBuildingSelected}
                  value={walkThroughViewFiles}
                  onChange={setWalkThroughViewFiles}
                  availableFilesURL={walkThroughViewURL ?? ""}
                  onRemoveExisting={(removedUrl) => {
                    setRemovedWalkThroughViewUrls((prev) => [...prev, removedUrl]);
                  }}
                  allowedTypes={["image/jpeg", "image/png", "image/jpg"]}
                />

                <MultiFilePicker
                  label="Upload Sales Plan Document"
                  placeholder="Upload Sales Plan Document"
                  disabled={!isBuildingSelected}
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
                <p className="mt-1 text-md  text-[#18536d] font-medium border border-gray-300 rounded-md px-3 py-2 bg-blue-50 text-gray-900">
                  {finalTotalParkingCount}
                </p>
              </div>
              <h2 className='text-md font-semibold mt-3'>Sales Parking</h2>
              <div className='grid grid-cols-1 md:grid-cols-4 gap-6 mt-5'>
                <div>
                  <Input
                    label="Residential"
                    type="text"
                    disabled={!isBuildingSelected}

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
                    disabled={!isBuildingSelected}
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
                    disabled={!isBuildingSelected}
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
                    disabled={!isBuildingSelected}
                    value={formDataProposedPlan.MemberResidentialParking ?? 0}
                    onChange={(e) => handleFieldChangeProposedPlan('MemberResidentialParking', filterNumbers(e.target.value))}
                    maxLength={3}
                  />
                </div>

                <div>
                  <Input
                    label="Commercial"
                    type="text"
                    disabled={!isBuildingSelected}
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
                    disabled={!isBuildingSelected}
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
                  label="Select Amenities"
                  placeholder="Search Amenities"
                  options={AMENITIES_BY_CATEGORY}
                  disabled={!isBuildingSelected}
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

      <ConfirmationDialogBox
        title="Add / Update Building Details"
        message={`Are you sure you want to generate ${pendingTotalBuildingsRef.current} building(s)?`}
        isOpen={isProposedPlanUpdateDialogOpen}
        onClose={() => setIsProposedPlanUpdateDialogOpen(false)}
        onConfirm={() => handleAddUpdateProposedPlan(pendingTotalBuildingsRef.current)}
        confirmText="Yes"
        cancelText="No"
        loading={isLoading}
        variant="generate"
      />

      <Modal
        isOpen={isDuplicateModalOpen}
        onClose={() => {
          setIsDuplicateModalOpen(false);
          setSelectedDuplicateTargets([]);
        }}
        onCancel={() => {
          setIsDuplicateModalOpen(false);
          setSelectedDuplicateTargets([]);
        }}
        title="Duplicate Building Details"
        onSubmit={handleAddDuplicateBuilding}
        saveText="Copy"
        loading={isLoading}
        size='xl'
      >
        <div className="space-y-4 p-6 bg-blue-100 rounded-lg w-full box-border">
          <div>
            <Input
              label="Duplicate From"
              value={buildingPlanDataMap[activeBuilding]?.BuildingId ?? activeBuilding}
              disabled
            />
          </div>
          <div>
            <MultiSelectPagination
              label="Duplicate To"
              key={activeBuilding}
              dataFetchCallBack={fetchDuplicateToBuildings}
              required
              selectedValues={selectedDuplicateTargets}
              onChange={(values) => {
                setSelectedDuplicateTargets(values);
              }}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ProposedPlan; 