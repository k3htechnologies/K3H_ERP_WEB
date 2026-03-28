import * as E from 'fp-ts/Either';
import { LeaveService } from '@/features/leave/services/LeaveService';

export const fetchLeaveConfiguredDropdown = async (pageNumber: number, params?: { value?: string }) => {
    try {
        const responseEither = await LeaveService.apiCallPullLeaveConfigured({
            PageSize: 100,
            PageNumber: pageNumber,
            LeaveType: params?.value || ''
        });

        if (E.isLeft(responseEither)) {
            return { totalNumberOfRecord: 0, itemList: [] as { label: string; value: string }[] };
        }

        const apiResponse = responseEither.right;

        const itemList = (apiResponse?.Data || []).map((d: any) => ({
            label: d.LeaveType,
            value: String(d.LeaveTypeMasterId)
        }));

        return {
            totalNumberOfRecord: apiResponse?.TotalNumberOfRecord ?? itemList.length,
            itemList
        };

    } catch (err) {
        console.error('FETCH LEAVE TYPE CONFIGURED DROPDOWN ERROR', err);
        return { totalNumberOfRecord: 0, itemList: [] as { label: string; value: string }[] };
    }
};

