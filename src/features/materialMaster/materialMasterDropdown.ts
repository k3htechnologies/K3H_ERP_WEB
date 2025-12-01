import * as E from 'fp-ts/Either';
import { materialMasterService } from '@/features/materialMaster/services/MaterialMasterService';

export const fetchMaterialMasterDropdown = async (pageNumber: number, params?: { value?: string }) => {
    try {

        const responseEither = await materialMasterService.apiCallPullMaterialMaster({
            PageSize: 10,
            PageNumber: pageNumber,
            MaterialName: params?.value || '',
            IsCheckPermission: false
        });

        if (E.isLeft(responseEither)) {
            return { totalNumberOfRecord: 0, itemList: [] as { label: string; value: string }[] };
        }

        const apiResponse = responseEither.right;

        const itemList = (apiResponse?.Data || []).map((d: any) => ({
            label: d.MaterialName,
            value: String(d.MaterialMasterId)
        }));


        return {
            totalNumberOfRecord: apiResponse?.TotalNumberOfRecord ?? itemList.length,
            itemList
        };

    } catch (err) {
        console.error('FETCH MAYERIAL MASTER DROPDOWN ERROR', err);
        return { totalNumberOfRecord: 0, itemList: [] as { label: string; value: string }[] };
    }
};
