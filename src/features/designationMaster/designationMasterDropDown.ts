import * as E from 'fp-ts/Either';
import { DesignationMasterService } from '@/features/designationMaster/services/DesignationMasterService';

export const fetchDesignationMasterDropdown = async (pageNumber: number, params?: { value?: string }) => {
    try {
        const responseEither = await DesignationMasterService.apiCallPullDesignationMaster({
            PageSize: 10,
            PageNumber: pageNumber,
            DesignationName: params?.value || '',
            IsCheckPermission: true
        });

        if (E.isLeft(responseEither)) {
            return { totalNumberOfRecord: 0, itemList: [] as { label: string; value: string }[] };
        }

        const apiResponse = responseEither.right;

        const itemList = (apiResponse?.Data || []).map((d: any) => ({
            label: d.DesignationName,
            value: String(d.DesignationMasterId)
        }));


        return {
            totalNumberOfRecord: apiResponse?.TotalNumberOfRecord ?? itemList.length,
            itemList
        };
        
    } catch (err) {
        console.error('FETCH DESIGNATION MASTER DROPDOWN ERROR', err);
        return { totalNumberOfRecord: 0, itemList: [] as { label: string; value: string }[] };
    }
};
