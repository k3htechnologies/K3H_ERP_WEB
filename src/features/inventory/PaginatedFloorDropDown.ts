import * as E from 'fp-ts/Either';
import { inventoryService } from '@/features/inventory/services/InventoryServices';

export const fetchPaginatedFloorDropdown = async (pageNumber: number, params?: { value?: string, projectId?: number, BuildingNumberWingFloor?:string  })=> {
    
    try {
        const responseEither = await inventoryService.apiCallPullPaginatedFloor({
            PageSize: 1000,
            PageNumber: pageNumber,
            ProjectId: Number(params?.projectId),
            BuildingNumberWingFloor: params?.BuildingNumberWingFloor?.trim() || "",
            ApprovalStatus:"APPROVED",
        });

        if (E.isLeft(responseEither)) {
            return { totalNumberOfRecord: 0, itemList: [] as { label: string; value: string }[] };
        }

        const apiResponse = responseEither.right;

        const itemList = (apiResponse?.Data || []).map((d: any) => {

            const label = [d.BuildingNumber,d.Wing,d.Floor].filter(Boolean).join(' - ');

            return {
                label,
                value: String(d.InventoryFloorId),
            };
        });

        return {
            totalNumberOfRecord: apiResponse?.TotalNumberOfRecord ?? itemList.length,
            itemList
        };

    } catch (err) {
        console.error('FETCH PAGINATED FLOOR DROPDOWN ERROR', err);
        return { totalNumberOfRecord: 0, itemList: [] as { label: string; value: string }[] };
    }
};