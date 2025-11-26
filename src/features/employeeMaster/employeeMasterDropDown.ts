import * as E from 'fp-ts/Either';
import { employeeMasterService } from '@/features/employeeMaster/services/EmployeeMasterService';

export const fetchEmployeeMasterDropdown = async (pageNumber: number, params?: { value?: string }) => {
    try {
        const responseEither = await employeeMasterService.apiCallPullEmployeeMaster({
            PageSize: 10,
            PageNumber: pageNumber,
            EmployeeName: params?.value || "",
            IsCheckPermission: false,
        });

        if (E.isLeft(responseEither)) {
            return { totalNumberOfRecord: 0, itemList: [] as { label: string; value: string }[] };
        }

        const apiResponse = responseEither.right;

        const itemList = (apiResponse?.Data || []).map((d: any) => ({
            label: d.FullName,
            value: String(d.EmployeeId)
        }));


        return {
            totalNumberOfRecord: apiResponse?.TotalNumberOfRecord ?? itemList.length,
            itemList
        };

    } catch (err) {
        console.error('FETCH EMPLOYEE MASTER DROPDOWN ERROR', err);
        return { totalNumberOfRecord: 0, itemList: [] as { label: string; value: string }[] };
    }
};
