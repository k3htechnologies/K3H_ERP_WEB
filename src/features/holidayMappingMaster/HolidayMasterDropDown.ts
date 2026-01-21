import * as E from 'fp-ts/Either';
import { holidayMasterService } from '../holidayMaster/services/HolidayMasterService';

export const fetchHolidayMasterDropdown = async (pageNumber: number, params?: { value?: string }) => {
    try {
        const responseEither = await holidayMasterService.apiCallPullHolidayMaster({
            PageSize: 20,
            PageNumber: pageNumber,
            HolidayName: params?.value || "",
        });

        if (E.isLeft(responseEither)) {
            return { totalNumberOfRecord: 0, itemList: [] as { label: string; value: string }[] };
        }

        const apiResponse = responseEither.right;

        const itemList = (apiResponse?.Data || []).map((d: any) => ({
            label: d.HolidayName,
            value: String(d.HolidayMasterId)
        }));


        return {
            totalNumberOfRecord: apiResponse?.TotalNumberOfRecord ?? itemList.length,
            itemList
        };

    } catch (err) {
        console.error('FETCH HOLIDAY MASTER DROPDOWN ERROR', err);
        return { totalNumberOfRecord: 0, itemList: [] as { label: string; value: string }[] };
    }
};
