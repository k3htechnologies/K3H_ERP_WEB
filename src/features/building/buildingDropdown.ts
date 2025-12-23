import * as E from 'fp-ts/Either';
import { buildingService } from '@/features/building/services/BuildingService';

export const fetchBuildingDropdown = async (pageNumber: number, params?: { value?: string ,projectId?: number}) => {
    try {
        const responseEither = await buildingService.apiCallPullBuilding({
            PageSize: 20,
            PageNumber: pageNumber,
            ProjectId: params?.projectId,
            IsCheckPermission: false
        });

        if (E.isLeft(responseEither)) {
            return { totalNumberOfRecord: 0, itemList: [] as { label: string; value: string }[] };
        }

        const apiResponse = responseEither.right;

        const itemList = (apiResponse?.Data || []).map((d: any) => ({
            label: d.BuildingName,
            value: String(d.BuildingId)
        }));


        return {
            totalNumberOfRecord: apiResponse?.TotalNumberOfRecord ?? itemList.length,
            itemList
        };

    } catch (err) {
        console.error('FETCH BUILDING  DROPDOWN ERROR', err);
        return { totalNumberOfRecord: 0, itemList: [] as { label: string; value: string }[] };
    }
};
