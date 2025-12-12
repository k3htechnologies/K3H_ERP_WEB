import * as E from 'fp-ts/Either';
import { ShiftMasterService } from '../shiftMaster/services/ShiftMasterService';

export const fetchShiftMasterDropdown = async (pageNumber: number, params?: { value?: string }) => {
    try {
        const responseEither = await ShiftMasterService.apiCallPullShiftMaster({
            PageSize: 10,
            PageNumber: pageNumber,
            ShiftName: params?.value || "",
        });

        if (E.isLeft(responseEither)) {
            return { totalNumberOfRecord: 0, itemList: [] as { label: string; value: string }[] };
        }

        const apiResponse = responseEither.right;

        const itemList = (apiResponse?.Data || []).map((d: any) => ({
            label: d.ShiftName,
            value: String(d.ShiftManagementMasterId)
        }));


        return {
            totalNumberOfRecord: apiResponse?.TotalNumberOfRecord ?? itemList.length,
            itemList
        };

    } catch (err) {
        console.error('FETCH SHIFT MASTER DROPDOWN ERROR', err);
        return { totalNumberOfRecord: 0, itemList: [] as { label: string; value: string }[] };
    }
};
