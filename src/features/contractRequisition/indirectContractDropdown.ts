import * as E from 'fp-ts/Either';
import { contractRequisitionService } from '@/features/contractRequisition/services/ContractRequisitionService';

export const fetchIndirectContractDropdown = async (pageNumber: number, projectId: number) => {
    try {

        const responseEither = await contractRequisitionService.apiCallPullIndirectContractRequisition({
            PageSize: 50,
            PageNumber: pageNumber,
            ProjectId: projectId
        });

        if (E.isLeft(responseEither)) {
            return { totalNumberOfRecord: 0, itemList: [] as { label: string; value: string }[] };
        }

        const apiResponse = responseEither.right;

        const itemList = (apiResponse?.Data || []).map((d: any) => ({
            label: d.CategoryName,
            value: String(d.SpecificationMasterId)
        }));


        return {
            totalNumberOfRecord: apiResponse?.TotalNumberOfRecord ?? itemList.length,
            itemList
        };

    } catch (err) {
        console.error('FETCH INDIRECT CONTRACT DROPDOWN ERROR', err);
        return { totalNumberOfRecord: 0, itemList: [] as { label: string; value: string }[] };
    }
};
