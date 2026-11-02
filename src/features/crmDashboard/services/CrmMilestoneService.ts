import type { Failure } from '@/core/api/FailureResponse';
import * as E from 'fp-ts/Either';
import { CrmMilestoneDatasourceImpl } from '@/features/crmDashboard/datasources/CrmMilestoneDatasource';
import type { CrmMilestoneCollectionDataResponse, CrmMilestoneSummaryResponse } from '@/features/crmDashboard/models/CrmMilestoneModel';

const CrmMilestoneDatasource = new CrmMilestoneDatasourceImpl();

export const crmMilestoneService = {

    apiCallPullCrmMilestoneCollectionTrend: async (ProjectId: number, FilterType?: string, FromDate?: string | null, ToDate?: string | null, ExportType?: string, signal?: AbortSignal): Promise<E.Either<Failure, CrmMilestoneCollectionDataResponse>> => {
        try {

            const response = await CrmMilestoneDatasource.pullCrmMilestoneDashboardData(ProjectId, FilterType, FromDate, ToDate, ExportType, signal);

            return E.right(response);

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },

    apiCallPullCrmMilestoneCollectionSummary: async (ProjectId: number, FilterType?: string, FromDate?: string | null, ToDate?: string | null, ExportType?: string, signal?: AbortSignal): Promise<E.Either<Failure, CrmMilestoneSummaryResponse>> => {
        try {

            const response = await CrmMilestoneDatasource.pullCrmMilestoneSummary(ProjectId, FilterType, FromDate, ToDate, ExportType, signal);

            return E.right(response);

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    }
}




