import * as E from 'fp-ts/Either';
import { inventoryService } from '@/features/inventory/services/InventoryServices';

export const fetchPaginatedFlatsDropdown = async (pageNumber: number,params?: { value?: string; projectId?: number; flat?: string; flatStatus?: string }) => {
    
    try {
        const responseEither = await inventoryService.apiCallPullPaginatedFlats({
            PageSize: 1000,
            PageNumber: pageNumber,
            ProjectId: Number(params?.projectId),
            Flat: params?.flat?.trim() || "",
            FlatStatus: params?.flatStatus || "",
        });

        if (E.isLeft(responseEither)) {
            return { totalNumberOfRecord: 0, itemList: [] as { label: string; value: string }[] };
        }

        const apiResponse = responseEither.right;

        const itemList = (apiResponse?.Data || []).map((d: any) => {

            const label = [
                d.BuildingNumber,
                d.Flat
            ].filter(Boolean)
                .join(' - ');

            return {
                label,
                value: String(d.InventoryFlatId),
            };
        });

        return {
            totalNumberOfRecord: apiResponse?.TotalNumberOfRecord ?? itemList.length,
            itemList
        };

    } catch (err) {
        console.error('FETCH PAGINATED FLATS DROPDOWN ERROR', err);
        return { totalNumberOfRecord: 0, itemList: [] as { label: string; value: string }[] };
    }
};

export const fetchPaginatedResidentialFlatsDropdown = async (pageNumber: number, params?: { value?: string, projectId?: number, flat?: string }) => {
    
    try {
        const responseEither = await inventoryService.apiCallPullPaginatedFlats({
            PageSize: 1000,
            PageNumber: pageNumber,
            ProjectId: Number(params?.projectId),
            Flat: params?.flat?.trim() || "",
        });

        if (E.isLeft(responseEither)) {
            return { totalNumberOfRecord: 0, itemList: [] as { label: string; value: string }[] };
        }

        const apiResponse = responseEither.right;

        const itemList = (apiResponse?.Data || []).map((d: any) => {

            const label = [
                d.BuildingNumber,
                d.Flat
            ].filter(Boolean)
                .join(' - ');

            return {
                label,
                value: String(d.InventoryFlatId),
            };
        });

        return {
            totalNumberOfRecord: apiResponse?.TotalNumberOfRecord ?? itemList.length,
            itemList
        };

    } catch (err) {
        console.error('FETCH PAGINATED FLATS DROPDOWN ERROR', err);
        return { totalNumberOfRecord: 0, itemList: [] as { label: string; value: string }[] };
    }
};

export const fetchPaginatedCommercialFlatsDropdown = async (pageNumber: number, params?: { value?: string, projectId?: number, flat?: string })=> {
    
    try {
        const responseEither = await inventoryService.apiCallPullPaginatedFlats({
            PageSize: 1000,
            PageNumber: pageNumber,
            ProjectId: Number(params?.projectId),
            Flat: params?.flat?.trim() || "",
        });

        if (E.isLeft(responseEither)) {
            return { totalNumberOfRecord: 0, itemList: [] as { label: string; value: string }[] };
        }

        const apiResponse = responseEither.right;

        const itemList = (apiResponse?.Data || []).map((d: any) => {

            const label = [
                d.BuildingNumber,
                d.Flat
            ].filter(Boolean)
                .join(' - ');

            return {
                label,
                value: String(d.InventoryFlatId),
            };
        });

        return {
            totalNumberOfRecord: apiResponse?.TotalNumberOfRecord ?? itemList.length,
            itemList
        };

    } catch (err) {
        console.error('FETCH PAGINATED FLATS DROPDOWN ERROR', err);
        return { totalNumberOfRecord: 0, itemList: [] as { label: string; value: string }[] };
    }
};
