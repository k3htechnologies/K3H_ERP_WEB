
import * as E from 'fp-ts/Either';
import type { Failure } from "@/core/api/FailureResponse";
import { AopAchievementReportDatasourceImpl } from '@/features/aopAchievement/datasources/AopAchievementReportDatasource';
import type { AOP_BookingReportListResponse, AOP_IBMOBMReportListResponse, AOP_WalkinsRevisitReportListResponse, ChannelPartnerAOPListResponse, FilterWithPaginationAopAchievementRequest, FilterWithPaginationClickAchievementRequest } from '@/features/aopAchievement/models/AopAchievementReportModel';

const AopAchievementReportDatasource = new AopAchievementReportDatasourceImpl();

export const aopAchievementReportService = {

    apiCallPullAOPAchievementReport: async (params: FilterWithPaginationAopAchievementRequest, options?: { signal?: AbortSignal }): Promise<E.Either<Failure, ChannelPartnerAOPListResponse>> => {

        try {
            return E.right(await AopAchievementReportDatasource.pullAOPAchievementReport(params, options?.signal));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });
        }
    },

    apiCallPullWalkinsRevisitReport: async (params: FilterWithPaginationClickAchievementRequest, options?: { signal?: AbortSignal }): Promise<E.Either<Failure, AOP_WalkinsRevisitReportListResponse>> => {

        try {
            return E.right(await AopAchievementReportDatasource.pullWalkinsRevisitReport(params, options?.signal));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });
        }
    },

    apiCallPullBookingReport: async (params: FilterWithPaginationClickAchievementRequest, options?: { signal?: AbortSignal }): Promise<E.Either<Failure, AOP_BookingReportListResponse>> => {

        try {
            return E.right(await AopAchievementReportDatasource.pullBookingReport(params, options?.signal));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });
        }
    },

    apiCallPullIBMOBMReport: async (params: FilterWithPaginationClickAchievementRequest, options?: { signal?: AbortSignal }): Promise<E.Either<Failure, AOP_IBMOBMReportListResponse>> => {

        try {
            return E.right(await AopAchievementReportDatasource.pullIBMOBMReport(params, options?.signal));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });
        }
    },
}