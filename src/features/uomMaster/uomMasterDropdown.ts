import * as E from 'fp-ts/Either';
import { uomMasterService } from '@/features/uomMaster/services/UOMMasterService';

export const fetchUOMMasterDropdown = async (pageNumber: number, params?: { value?: string }) => {
    try {

        const responseEither = await uomMasterService.apiCallPullUomMaster({
            PageSize: 30,
            PageNumber: pageNumber,
            Uom: params?.value || '',
            IsCheckPermission: false
        });

        if (E.isLeft(responseEither)) {
            return { totalNumberOfRecord: 0, itemList: [] as { label: string; value: string }[] };
        }

        const apiResponse = responseEither.right;

        const itemList = (apiResponse?.Data || []).map((d: any) => ({
            label: d.UomCode,
            value: String(d.UomMasterId)
        }));


        return {
            totalNumberOfRecord: apiResponse?.TotalNumberOfRecord ?? itemList.length,
            itemList
        };

    } catch (err) {
        console.error('FETCH UOM DROPDOWN ERROR', err);
        return { totalNumberOfRecord: 0, itemList: [] as { label: string; value: string }[] };
    }
};
