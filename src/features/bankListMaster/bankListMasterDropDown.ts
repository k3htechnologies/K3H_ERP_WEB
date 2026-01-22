import * as E from 'fp-ts/Either';
import { BankListMasterService } from '@/features/bankListMaster/services/BankListMasterService';

export const fetchBankListMasterDropdown = async (pageNumber: number, params?: { value?: string }) => {
    try {
        const responseEither = await BankListMasterService.apiCallPullBankListMaster({
            PageSize: 200,
            PageNumber: pageNumber,
            BankName: params?.value || ""
        });

        if (E.isLeft(responseEither)) {
            return { totalNumberOfRecord: 0, itemList: [] as { label: string; value: string }[] };
        }

        const apiResponse = responseEither.right;

        const itemList = (apiResponse?.Data || []).map((d: any) => ({
            label: d.BankNameWithCode,
            value: String(d.BankListMasterId)
        }));


        return {
            totalNumberOfRecord: apiResponse?.TotalNumberOfRecord ?? itemList.length,
            itemList
        };

    } catch (err) {
        console.error('FETCH BANK LIST MASTER DROPDOWN ERROR', err);
        return { totalNumberOfRecord: 0, itemList: [] as { label: string; value: string }[] };
    }
};
