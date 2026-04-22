import * as E from 'fp-ts/Either';
import { inventoryService } from '@/features/inventory/services/InventoryServices';

export const fetchFlatListMasterDropdown = async (pageNumber: number, params?: { value?: string; projectId?: number; flatStatus?: string }) => {
    try {
        const responseEither = await inventoryService.apiCallPullPaginatedFlats({
            PageSize: 20,
            PageNumber: pageNumber,
            ProjectId: Number(params?.projectId),
            Flat: params?.value || "",
            FlatStatus: params?.flatStatus || ""
        });

        if (E.isLeft(responseEither)) {
            return { totalNumberOfRecord: 0, itemList: [] as { label: string; value: string }[] };
        }

        const apiResponse = responseEither.right;

        const itemList = (apiResponse?.Data || []).map((d: any) => ({
            label: [d.Wing, d.Flat, d.BuildingNumber].filter(Boolean).join(' - '),
            value: String(d.InventoryFlatId)
        }));


        return {
            totalNumberOfRecord: apiResponse?.TotalNumberOfRecord ?? itemList.length,
            itemList
        };

    } catch (err) {
        console.error('FETCH FLAT LIST MASTER DROPDOWN ERROR', err);
        return { totalNumberOfRecord: 0, itemList: [] as { label: string; value: string }[] };
    }
};
