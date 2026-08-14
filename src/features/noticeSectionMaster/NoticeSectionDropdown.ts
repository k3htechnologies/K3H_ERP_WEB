import * as E from 'fp-ts/Either';
import { noticeSectionMasterService } from '@/features/noticeSectionMaster/services/NoticeSectionMasterService';

export const fetchGovernmentComplianceDropdown = async () => {
    try {
        const responseEither =
            await noticeSectionMasterService.apiCallPullNoticeSectionMaster({
                PageSize: 1000,
                PageNumber: 1,
            });

        if (E.isLeft(responseEither)) {
            return {
                totalNumberOfRecord: 0,
                itemList: [] as { label: string; value: string }[],
            };
        }

        const apiResponse = responseEither.right;


        const uniqueCompliance = [
            ...new Set(
                (apiResponse?.Data || [])
                    .map((d: any) => d.GovernmentCompliance?.trim())
                    .filter(Boolean)
            ),
        ];

        const itemList = uniqueCompliance.map((item) => ({
            label: item,
            value: item,
        }));

        console.log(
            apiResponse.Data.map((d: any) => JSON.stringify(d.GovernmentCompliance))
        );

        return {
            totalNumberOfRecord: itemList.length,
            itemList,
        };
    } catch (err) {
        console.error("FETCH GOVERNMENT COMPLIANCE DROPDOWN ERROR", err);

        return {
            totalNumberOfRecord: 0,
            itemList: [] as { label: string; value: string }[],
        };
    }
};