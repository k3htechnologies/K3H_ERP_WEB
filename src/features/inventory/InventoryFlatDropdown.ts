import * as E from 'fp-ts/Either';
import { inventoryService } from '@/features/inventory/services/InventoryServices';
import type { InventoryFlatData } from './models/InventoryMasterModel';

export const fetchPaginatedInventoryFlatDropdown = async (pageNumber: number, params?: { value?: string, projectId?: number, flat?: string, flatStatus?: string }) => {
    try {
        const responseEither = await inventoryService.apiCallPullPaginatedFlats({
            PageSize: 40,
            PageNumber: pageNumber,
            ProjectId: Number(params?.projectId),
            Flat: params?.flat?.trim() || "",
            FlatStatus: params?.flatStatus || ""
        });

        if (E.isLeft(responseEither)) {

            return { totalNumberOfRecord: 0, itemList: [] as { label: string; value: string }[] };
        }

        const apiResponse = responseEither.right;

        const itemList = (apiResponse?.Data || []).map((d: any) => ({
            label: d.Flat,
            value: String(d.InventoryFlatId)
        }));


        return {
            totalNumberOfRecord: apiResponse?.TotalNumberOfRecord ?? itemList.length,
            itemList
        };

    } catch (err) {
        console.error('FETCH PAGINATED INVENTORY FLAT DROPDOWN ERROR', err);
        return { totalNumberOfRecord: 0, itemList: [] as { label: string; value: string }[] };
    }
};

export const fetchInventoryFlatDetails = async (projectId: number, inventoryFlatId?: number): Promise<InventoryFlatData | null> => {

    const responseEither = await inventoryService.apiCallPullPaginatedFlats({
        PageSize: 1,
        PageNumber: 1,
        ProjectId: projectId,
        InventoryFlatId: Number(inventoryFlatId),
    });

    if (E.isLeft(responseEither)) return null;

    return responseEither.right.Data?.[0] ?? null;
};