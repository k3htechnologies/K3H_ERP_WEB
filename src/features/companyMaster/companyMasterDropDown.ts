import * as E from 'fp-ts/Either';
import { companyMasterService } from '@/features/companyMaster/services/CompanyMasterService';

export const fetchCompanyMasterDropdown = async (pageNumber: number, params?: { value?: string }) => {
    try {
        const responseEither = await companyMasterService.apiCallPullCompanyMaster({
            PageSize: 10,
            PageNumber: pageNumber,
            CompanyName: params?.value || "",
            IsCheckPermission: false,
        });

        if (E.isLeft(responseEither)) {
            return { totalNumberOfRecord: 0, itemList: [] as { label: string; value: string }[] };
        }

        const apiResponse = responseEither.right;

        const itemList = (apiResponse?.Data || []).map((d: any) => ({
            label: d.CompanyName,
            value: String(d.CompanyId)
        }));


        return {
            totalNumberOfRecord: apiResponse?.TotalNumberOfRecord ?? itemList.length,
            itemList
        };

    } catch (err) {
        console.error('FETCH COMPANY MASTER DROPDOWN ERROR', err);
        return { totalNumberOfRecord: 0, itemList: [] as { label: string; value: string }[] };
    }
};
