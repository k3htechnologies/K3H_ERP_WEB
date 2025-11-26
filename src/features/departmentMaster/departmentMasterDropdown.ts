import * as E from 'fp-ts/Either';
import { departmentMasterService } from '@/features/departmentMaster/services/DepartmentMasterService';

export const fetchDepartmentMasterDropdown = async (pageNumber: number, params?: { value?: string }) => {
    try {
        const responseEither = await departmentMasterService.apiCallPullDepartmentMaster({
            PageSize: 10,
            PageNumber: pageNumber,
            DepartmentName: params?.value || '',
            IsCheckPermission: true
        });

        if (E.isLeft(responseEither)) {
            return { totalNumberOfRecord: 0, itemList: [] as { label: string; value: string }[] };
        }

        const apiResponse = responseEither.right;

        const itemList = (apiResponse?.Data || []).map((d: any) => ({
            label: d.DepartmentName,
            value: String(d.DepartmentMasterId)
        }));


        return {
            totalNumberOfRecord: apiResponse?.TotalNumberOfRecord ?? itemList.length,
            itemList
        };
        
    } catch (err) {
        console.error('FETCH DEPARTMENT DROPDOWN ERROR', err);
        return { totalNumberOfRecord: 0, itemList: [] as { label: string; value: string }[] };
    }
};
