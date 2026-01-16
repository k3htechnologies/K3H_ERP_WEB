import * as E from 'fp-ts/Either';
import { branchMasterService } from '@/features/branchMaster/services/BranchMasterService';

export const fetchBranchMasterDropdown = async (pageNumber: number, params?: { value?: string }) => {
    try {
        const responseEither = await branchMasterService.apiCallPullBranchMaster({
            PageSize: 10,
            PageNumber: pageNumber,
            BranchName: params?.value || "",
            IsCheckPermission: false,
        });

        if (E.isLeft(responseEither)) {
            return { totalNumberOfRecord: 0, itemList: [] as { label: string; value: string }[] };
        }

        const apiResponse = responseEither.right;

        const itemList = (apiResponse?.Data || []).map((d: any) => ({
            label: d.BranchName,
            value: String(d.BranchMasterId)
        }));


        return {
            totalNumberOfRecord: apiResponse?.TotalNumberOfRecord ?? itemList.length,
            itemList
        };

    } catch (err) {
        console.error('FETCH BRANCH MASTER DROPDOWN ERROR', err);
        return { totalNumberOfRecord: 0, itemList: [] as { label: string; value: string }[] };
    }
};
