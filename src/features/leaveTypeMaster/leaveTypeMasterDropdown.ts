import * as E from 'fp-ts/Either';
import { LeaveTypeMasterService } from '@/features/leaveTypeMaster/services/LeaveTypeMasterService';

export const fetchLeaveTypeMasterDropdown = async (
  pageNumber: number,
  params?: { value?: string; LeaveType?: string; leaveType?: string },
) => {
  try {
    const responseEither = await LeaveTypeMasterService.apiCallPullLeaveTypeMaster({
      PageSize: 10,
      PageNumber: pageNumber,
      LeaveType: params?.LeaveType ?? params?.leaveType ?? params?.value ?? '',
    });

    if (E.isLeft(responseEither)) {
      return { totalNumberOfRecord: 0, itemList: [] as { label: string; value: string }[] };
    }

    const apiResponse = responseEither.right;

    const itemList = (apiResponse?.Data || []).map((d: any) => ({
      label: d.LeaveType,
      value: String(d.LeaveTypeMasterId),
    }));

    return {
      totalNumberOfRecord: apiResponse?.TotalNumberOfRecord ?? itemList.length,
      itemList,
    };
  } catch (err) {
    console.error('FETCH LEAVE TYPE MASTER DROPDOWN ERROR', err);
    return { totalNumberOfRecord: 0, itemList: [] as { label: string; value: string }[] };
  }
};