import * as E from 'fp-ts/Either';
import { subMaterialMasterService } from '@/features/subMaterialMaster/services/SubMaterialMasterService';

export const fetchSubMaterialMasterDropdown = async (pageNumber: number, params?: { value?: string }) => {
    try {

        const responseEither = await subMaterialMasterService.apiCallPullSubMaterialMaster({
            PageSize: 50,
            PageNumber: pageNumber,
            SubMaterialName: params?.value || '',
            IsCheckPermission: false
        });

        if (E.isLeft(responseEither)) {
            return { totalNumberOfRecord: 0, itemList: [] as { label: string; value: string }[] };
        }

        const apiResponse = responseEither.right;

        const itemList = (apiResponse?.Data || []).map((d: any) => ({
            label: d.SubMaterialName,
            value: String(d.SubMaterialMasterId),
            MaterialMasterId: d.MaterialMasterId,
            MaterialCode: d.MaterialCode,
            MaterialName: d.MaterialName,
            SubMaterialName: d.SubMaterialName,
            UomMasterId: d.UomMasterId,
            UomCode: d.UomCode,
            Uom: d.Uom,
            LeadTimeInDays: d.LeadTimeInDays,
            IsTolerant: d.IsTolerant
        }));



        return {
            totalNumberOfRecord: apiResponse?.TotalNumberOfRecord ?? itemList.length,
            itemList
        };

    } catch (err) {
        console.error('FETCH SUB MATERIAL MASTER DROPDOWN ERROR', err);
        return { totalNumberOfRecord: 0, itemList: [] as { label: string; value: string }[] };
    }
};

export const fetchSubMaterialMasterById = async (subMaterialId: number) => {
    const responseEither = await subMaterialMasterService.apiCallPullSubMaterialMaster({
        PageSize: 1,
        PageNumber: 1,
        SubMaterialMasterId: subMaterialId,
        IsCheckPermission: false,
    });

    if (E.isLeft(responseEither)) return null;

    return responseEither.right.Data?.[0] || null;
};
