import * as E from 'fp-ts/Either';
import { bookingService } from '@/features/booking/services/BookingService';

export const fetchPaymentScheduleDropdown = async (params?: { 
    projectId?: number;
<<<<<<< HEAD
    buildingId?: number;
=======
    inventoryBuildingId?: number;
>>>>>>> 7f4395cbb8c7bc2ef1b02113b66c1a603b5e137a
    wing?: string;
}) => {
    try {
        const responseEither = await bookingService.apiCallPullPaymentScheduleStages({
            ProjectId: Number(params?.projectId),
<<<<<<< HEAD
            InventoryBuildingId: Number(params?.buildingId),
=======
            InventoryBuildingId: Number(params?.inventoryBuildingId),
>>>>>>> 7f4395cbb8c7bc2ef1b02113b66c1a603b5e137a
            Wing: params?.wing,
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