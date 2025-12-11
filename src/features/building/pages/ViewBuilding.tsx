import React, { useEffect, useState } from 'react';
import { Loader } from '@/core/utils/loader';
import type { BuildingData } from '../models/BuildingModel';
import { useLocation, useNavigate } from 'react-router-dom';
import { FieldItem } from '@/ui/components/forms/FieldItem';
import Accordion from '@/ui/components/Card/Accordion';
import { runApiWithLoader } from '@/core/utils';
import * as E from 'fp-ts/Either';
import { useToast } from '@/core/hooks/useToast';
import { ArrowLeft, Edit } from 'lucide-react';
import { Button } from '@/ui/components/forms';
import { employeeMasterService as buildingService } from '@/features/building/services/BuildingService';
import type { FilterWithPaginationBuildingRequest } from '../models/BuildingModel';
var ProjectId = 1;
export const ViewBuilding: React.FC = () => {

    //#region STATE MANAGEMENT
    const [buildingData, setBuildingData] = useState<BuildingData | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setIsLoadingMessage] = useState('');
    // TOAST
    const { addToast } = useToast();

    //LOCATION
    const navigate = useNavigate();

    const location = useLocation() as {
        state?: {
            editBuildingData?: BuildingData | null;
            fromList?: boolean;
            listState?: {
                page: number;
                filters: any;
                sortInfo?: any;
                searchTerm?: string;
            };
        };
    };
    const preservedListState = location.state?.listState;

    //#endregion
    //#region Get BUILDING DATA FROM LOCATION STATE
    const incomingBuildingData = (location.state?.editBuildingData ?? null) as BuildingData | null;
    //#endregion

    //#region INIT
    useEffect(() => {
        if (incomingBuildingData) {
            setBuildingData(incomingBuildingData);
            return;
        }

        loadBuildingFromServer();
    }, []);

    //#endregion

    //#region DATA LOAD
    const loadBuildingFromServer = async () => {
        if (!preservedListState?.filters?.BuildingId) return;
        await runApiWithLoader(
            setIsLoading,
            setIsLoadingMessage,
            async () => {

                const params: FilterWithPaginationBuildingRequest = {
                    PageNumber: 1,
                    PageSize: 1,
                    BuildingId: preservedListState.filters.BuildingId,
                    IsCheckPermission: false,
                    ProjectId:ProjectId
                };

                const response = await buildingService.apiCallPullBuilding(params);

                if (E.isRight(response)) {
                    setBuildingData(response.right.Data?.[0] ?? null);
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
            'Loading Building Data'
        );
    };

    //#endregion 
    //#region EDIT BUILDING

    const handleEditBuilding = (row: BuildingData) => {
        if (!row?.BuildingId) return;
        navigate(`/building/add/${row.BuildingId}`, {
            state: {
                editBuildingData: row,
                fromList: true,
                listState: preservedListState ?? { page: 1, filters: {}, sortInfo: undefined, searchTerm: '' }
            }
        });
    };

    //#endregion

    //#region BACK BUILDING PAGE
    const handleBackToListBuilding = () => {
        navigate('/building', {
            state: { listState: preservedListState ?? { page: 1, filters: {}, sortInfo: undefined, searchTerm: '' } }
        });
    };
    //#endregion
    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <Loader loading={isLoading} title={loadingMessage}>
                <div></div>
            </Loader>

            <div className="grid grid-cols-12 gap-6">
                {/* Left column: profile card */}
                <div className="col-span-5">
                    <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
                        <div className="pt-10 px-2 pb-2">
                            <div className="text-center">
                                <h3 className="text-lg font-semibold text-gray-900">{buildingData?.BuildingName} <span className="inline-block ml-2 text-green-500">●</span></h3>
                                <div className="mt-2 flex justify-center gap-2">
                                    <span className="text-xs bg-gray-100 px-2 py-1 rounded-full text-gray-700">{buildingData?.CTSNumber}</span>
                                </div>
                            </div>

                            {/* Basic Info box */}
                            <div className="mt-6 rounded border border-gray-200">

                                <div className="bg-gray-100 px-4 py-2 border-b border-gray-200">
                                    <h4 className="font-semibold text-sm text-gray-800">
                                        Basic information
                                    </h4>
                                </div>


                                <div className="p-4">
                                    <FieldItem label="Building Name" value={buildingData?.BuildingName ?? '-'} isRow />
                                    <FieldItem label="CTS Number" value={buildingData?.CTSNumber ?? '-'} isRow />
                                    <FieldItem label="Road Width" value={buildingData?.RoadWidth ?? '-'} isRow />
                                    <FieldItem label="Land Ownership" value={buildingData?.LandOwnershipType ?? '-'} isRow />
                                    <FieldItem label="Litigation" value={buildingData?.IsLitigation ? 'Yes' : 'No'} isRow />
                                    <FieldItem label="Litigation Remarks" value={buildingData?.LitigationRemarks ?? '-'} isRow />
                                </div>
                            </div>

                            <div className="mt-4 flex gap-3">
                                <Button
                                    onClick={(e) => {
                                        e.preventDefault()
                                        e.stopPropagation()
                                        if (buildingData) {
                                            handleEditBuilding(buildingData)
                                        }
                                    }}
                                    color='blue'
                                    fullWidth
                                    size='sm'
                                    title="Edit Info">
                                    <Edit className="w-4 h-4" /> Edit Info
                                </Button>
                                <Button

                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        handleBackToListBuilding()
                                    }}
                                    color='transparent'
                                    variant='transparent_border'
                                    fullWidth
                                    size='sm'
                                    title="Back">
                                    <ArrowLeft className="w-4 h-4" />  Cancel
                                </Button>
                            </div>
                            {/* LOCATION */}
                            <div className="mt-6 rounded border border-gray-200">

                                <div className="bg-gray-100 px-4 py-2 border-b border-gray-200">
                                    <h4 className="font-semibold text-sm text-gray-800">
                                        Location Details
                                    </h4>
                                </div>


                                <div className="p-4">
                                    <FieldItem label="Country" value={buildingData?.CountryName ?? '-'} isRow />
                                    <FieldItem label="State" value={buildingData?.StateName ?? '-'} isRow />
                                    <FieldItem label="District" value={buildingData?.DistrictName ?? '-'} isRow />
                                    <FieldItem label="City" value={buildingData?.CityName ?? '-'} isRow />
                                </div>
                            </div>

                        </div>
                    </div>
                </div>

                {/* Right column: details and accordions */}
                <div className="col-span-7 space-y-4">

                    <div className="grid grid-cols-1 gap-4">

                        <div className="bg-white border border-gray-200 rounded p-4 shadow-sm">
                            <h4 className="font-semibold mb-3">Property Information</h4>

                            <FieldItem label="Total Plot Area (sqft)" value={buildingData?.TotalPlotAreaSqFt ?? '-'} isRow withBorder />
                            <FieldItem label="Utilized Area (sqft)" value={buildingData?.TotalUnitsAreaUtilizedSqFt ?? '-'} isRow withBorder />
                            <FieldItem label="Total Units" value={buildingData?.TotalNumberOfUnits ?? '-'} isRow withBorder />
                            <FieldItem label="Floors" value={buildingData?.NumberOfFloors ?? '-'} isRow />
                        </div>
                    </div>

                    {/* accordion cards */}
                    <div className="space-y-3">
                        <Accordion
                            items={[
                                {
                                    key: "garden",
                                    title: "Garden Information",
                                    defaultOpen: true,
                                    content: (
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                            <FieldItem label="Is Garden" value={buildingData?.IsGarden ? 'Yes' : 'No'} />
                                            <FieldItem label="Garden Area (sqft)" value={buildingData?.TotalGardenAreaSqFt ?? '-'} />
                                        </div>
                                    )
                                },
                                {
                                    key: "religious",
                                    title: "Religious Structure",
                                     defaultOpen: true,
                                    content: (
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                            <FieldItem label="Is Religious Structure" value={buildingData?.IsReligiousStructure ? 'Yes' : 'No'} />
                                            <FieldItem label="Structure Area (sqft)" value={buildingData?.TotalReligiousStructureAreaSqFt ?? '-'} />
                                        </div>
                                    )
                                },
                                {
                                    key: "fsi",
                                    title: "FSI / TDR",
                                     defaultOpen: true,
                                    content: (
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                            <FieldItem label="FSI / TDR Utilization (sqft)" value={buildingData?.FSI_TDR_UtilizationSqFt ?? '-'} />
                                            <FieldItem label="Property Age (Years)" value={buildingData?.PropertyAgeYears ?? '-'} />
                                        </div>
                                    )
                                }
                            ]}
                        />

                    </div>

                </div>
            </div>

        </div >
    );
};

export default ViewBuilding;
