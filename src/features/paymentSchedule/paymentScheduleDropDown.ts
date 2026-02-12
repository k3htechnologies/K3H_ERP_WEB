import * as E from 'fp-ts/Either';
import { bookingService } from '@/features/booking/services/BookingService';

export const fetchPaymentScheduleDropdown = async (params?: { value?: number, projectId?: number }) => {
    try {
        const responseEither = await bookingService.apiCallPullPaymentScheduleStages({
            ProjectId: Number(params?.projectId),
            InventoryFlatFloorBasementPodiumWingId: params?.value,
        });

        if (E.isLeft(responseEither)) {
            return { totalNumberOfRecord: 0, itemList: [] as { label: string; value: string }[] };
        }

        const apiResponse = responseEither.right;

        const itemList = (apiResponse?.Data || []).map((d: any) => ({
            label: `${d.Stages}`,
            value: `${d.Stages}`,
        }));


        return {
            totalNumberOfRecord: apiResponse?.TotalNumberOfRecord ?? itemList.length,
            itemList
        };

    } catch (err) {
        console.error('FETCH PAYMENT SCHEDULE DROPDOWN ERROR', err);
        return { totalNumberOfRecord: 0, itemList: [] as { label: string; value: string }[] };
    }
};
