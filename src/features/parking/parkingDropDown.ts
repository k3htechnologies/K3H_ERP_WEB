import * as E from 'fp-ts/Either';
import { parkingService } from '@/features/parking/services/ParkingService';

export const fetchParkingDropdown = async (pageNumber: number, params?: { value?: string; projectId?: number }) => {
    try {
        const responseEither = await parkingService.apiCallPullParkingWithPagination({
            PageSize: 20,
            PageNumber: pageNumber,
            ProjectId: params?.projectId || 0,
            ParkingNumber: params?.value || ""
        });

        if (E.isLeft(responseEither)) {
            return { totalNumberOfRecord: 0, itemList: [] as { label: string; value: string }[] };
        }

        const apiResponse = responseEither.right;

        const itemList = (apiResponse?.Data || []).map((d: any) => ({
            label: d.ParkingNumber,
            value: String(d.ParkingId)
        }));


        return {
            totalNumberOfRecord: apiResponse?.TotalNumberOfRecord ?? itemList.length,
            itemList
        };

    } catch (err) {
        console.error('FETCH PARKING DROPDOWN ERROR', err);
        return { totalNumberOfRecord: 0, itemList: [] as { label: string; value: string }[] };
    }
};
