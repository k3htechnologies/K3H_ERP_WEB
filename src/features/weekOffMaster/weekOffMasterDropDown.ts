import { weekOffMasterService } from '@/features/weekOffMaster/services/WeekOffMasterService';
import * as E from 'fp-ts/Either';

export const fetchWeekOffMasterDropdown = async (pageNumber: number, params?: { value?: string }) => {
    try {
        const responseEither = await weekOffMasterService.apiCallPullWeekOffMaster({
            PageSize: 20,
            PageNumber: pageNumber,
            WeekOffPolicyName: params?.value || "",
        });

        if (E.isLeft(responseEither)) {
            return { totalNumberOfRecord: 0, itemList: [] as { label: string; value: string }[] };
        }

        const apiResponse = responseEither.right;

        const itemList = (apiResponse?.Data || []).map((d: any) => ({
            label: d.WeekOffPolicyName,
            value: String(d.WeekOffPolicyMasterId)
        }));


        return {
            totalNumberOfRecord: apiResponse?.TotalNumberOfRecord ?? itemList.length,
            itemList
        };

    } catch (err) {
        console.error('FETCH WEEK OFF MASTER DROPDOWN ERROR', err);
        return { totalNumberOfRecord: 0, itemList: [] as { label: string; value: string }[] };
    }
};
