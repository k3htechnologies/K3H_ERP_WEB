import * as E from 'fp-ts/Either';
import { contractMasterService } from '@/features/contractMaster/services/ContractMasterService';

export const fetchContractMasterDropdown = async (pageNumber: number, params?: { value?: string }) => {
    try {

        const responseEither = await contractMasterService.apiCallPullContractMaster({
            PageSize: 50,
            PageNumber: pageNumber,
            ContractName: params?.value || '',
            IsCheckPermission: false
        });

        if (E.isLeft(responseEither)) {
            return { totalNumberOfRecord: 0, itemList: [] as { label: string; value: string }[] };
        }

        const apiResponse = responseEither.right;

        const itemList = (apiResponse?.Data || []).map((d: any) => ({
            label: d.ContractName,
            value: String(d.ContractMasterId)
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
