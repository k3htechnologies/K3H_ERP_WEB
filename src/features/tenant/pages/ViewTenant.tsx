import React, { useEffect, useState } from 'react';
import { Loader } from '@/core/utils/loader';
import type { TenantData, FilterWithPaginationTenantRequest } from '../models/TenantModel';
import { useLocation, useNavigate } from 'react-router-dom';
import { FieldItem } from '@/ui/components/forms/FieldItem';
import Accordion from '@/ui/components/Card/Accordion';
import { runApiWithLoader } from '@/core/utils';
import * as E from 'fp-ts/Either';
import { useToast } from '@/core/hooks/useToast';
import { ArrowLeft, Edit } from 'lucide-react';
import { Button } from '@/ui/components/forms';
import { tenantService } from '../services/TenantService';
var ProjectId = 1;
export const ViewTenant: React.FC = () => {

    //#region STATE MANAGEMENT
    const [tenantData, setTenantData] = useState<TenantData | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setIsLoadingMessage] = useState('');
    // TOAST
    const { addToast } = useToast();

    //LOCATION
    const navigate = useNavigate();

    const location = useLocation() as {
        state?: {
            editTenantData?: TenantData | null;
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
    //#region Get TENANT DATA FROM LOCATION STATE
    const incomingTenantData = (location.state?.editTenantData ?? null) as TenantData | null;
    //#endregion

    //#region INIT
    useEffect(() => {
        if (incomingTenantData) {
            setTenantData(incomingTenantData);
            return;
        }

        loadTenantFromServer();
    }, []);

    //#endregion

    //#region DATA LOAD
    const loadTenantFromServer = async () => {
        if (!preservedListState?.filters?.TenantId) return;
        await runApiWithLoader(
            setIsLoading,
            setIsLoadingMessage,
            async () => {

                const params: FilterWithPaginationTenantRequest = {
                    PageNumber: 1,
                    PageSize: 1,
                    TenantId: preservedListState.filters.TenantId,
                    IsCheckPermission: false,
                    ProjectId: ProjectId
                };

                const response = await tenantService.apiCallPullTenant(params);

                if (E.isRight(response)) {
                    setTenantData(response.right.Data?.[0] ?? null);
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
            'Loading Tenant Data'
        );
    };

    //#endregion 
    //#region EDIT TENANT

    const handleEditTenant = (row: TenantData) => {
        if (!row?.TenantId) return;
        navigate(`/tenant/add/${row.TenantId}`, {
            state: {
                editTenantData: row,
                fromList: true,
                listState: preservedListState ?? { page: 1, filters: {}, sortInfo: undefined, searchTerm: '' }
            }
        });
    };

    //#endregion

    //#region BACK TENANT PAGE
    const handleBackToListTenant = () => {
        navigate('/tenant', {
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
                                <h3 className="text-lg font-semibold text-gray-900">{tenantData?.FlatNumber} <span className="inline-block ml-2 text-green-500">●</span></h3>
                                <div className="mt-2 flex justify-center gap-2">
                                    <span className="text-xs bg-gray-100 px-2 py-1 rounded-full text-gray-700">{tenantData?.FlatType}</span>
                                    <span className="text-xs bg-gray-100 px-2 py-1 rounded-full text-gray-700">{tenantData?.FlatConfiguration}</span>
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
                                    <FieldItem label="Flat Number" value={tenantData?.FlatNumber ?? '-'} isRow />
                                    <FieldItem label="Flat Type" value={tenantData?.FlatType ?? '-'} isRow />
                                    <FieldItem label="Configuration" value={tenantData?.FlatConfiguration ?? '-'} isRow />
                                    <FieldItem label="Facing" value={tenantData?.Facing ?? '-'} isRow />
                                    <FieldItem label="Total Area (sqft)" value={tenantData?.TotalAreaSqFt ?? '-'} isRow />
                                    <FieldItem label="Carpet Area (sqft)" value={tenantData?.FlatCarpetAreaSqFt ?? '-'} isRow />
                                </div>
                            </div>

                            <div className="mt-4 flex gap-3">
                                <Button
                                    onClick={(e) => {
                                        e.preventDefault()
                                        e.stopPropagation()
                                        if (tenantData) {
                                            handleEditTenant(tenantData)
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
                                        handleBackToListTenant()
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
                                    <FieldItem label="Building Number" value={tenantData?.BuildingNumber ?? '-'} isRow />
                                    <FieldItem label="Wing" value={tenantData?.Wing ?? '-'} isRow />
                                    <FieldItem label="Floor" value={tenantData?.Floor ?? '-'} isRow />
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

                            <FieldItem label="Free Area Offered (%)" value={tenantData?.FreeAreaOfferedPercent ?? '-'} isRow withBorder />
                            <FieldItem label="Extra Area Purchased (sqft)" value={tenantData?.ExtraAreaPurchasedSqFt ?? '-'} isRow withBorder />
                            <FieldItem label="RERA Carpet Area (sqft)" value={tenantData?.RERACarpetAreaSqFt ?? '-'} isRow withBorder />
                            <FieldItem label="Inventory Flat Type" value={tenantData?.InventoryFlatType ?? '-'} isRow />
                        </div>
                    </div>

                    {/* accordion cards */}
                    <div className="space-y-3">
                        <Accordion
                            items={[
                                {
                                    key: "parking",
                                    title: "Parking Information",
                                    defaultOpen: true,
                                    content: (
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                            <FieldItem label="Parking Number" value={tenantData?.ParkingNumber ?? '-'} />
                                            <FieldItem label="Parking Id" value={tenantData?.ParkingId ?? '-'} />
                                        </div>
                                    )
                                },
                                {
                                    key: "inventory",
                                    title: "Inventory Details",
                                     defaultOpen: true,
                                    content: (
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                            <FieldItem label="Inventory Flat Id" value={tenantData?.InventoryFlatId ?? '-'} />
                                            <FieldItem label="Inventory Flat Type" value={tenantData?.InventoryFlatType ?? '-'} />
                                            <FieldItem label="Inventory Configuration" value={tenantData?.InventoryFlatConfiguration ?? '-'} />
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

export default ViewTenant;
