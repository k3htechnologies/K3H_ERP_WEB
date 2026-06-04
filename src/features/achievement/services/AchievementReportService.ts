
import * as E from 'fp-ts/Either';
import type { Failure } from "@/core/api/FailureResponse";
import { AchievementReportDatasourceImpl } from '@/features/achievement/datasources/AchievementReportDatasource';
import type {
    FilterWithPaginationAchievementRequest,
    ProjectAchievementListResponse,
    AchievementClosingListResponse,
    AchievementSourcingListResponse,
    FilterWithPaginationClickAchievementRequest,
    WalkinsRevisitReportListResponse,
    BookingReportListResponse,
    IBMOBMReportListResponse
} from "@/features/achievement/models/AchievementReportModel";


const AchievementReportDatasource = new AchievementReportDatasourceImpl();

export const achievementReportService = {

    apiCallPullProjectAchievementReport: async (params: FilterWithPaginationAchievementRequest, options?: { signal?: AbortSignal }): Promise<E.Either<Failure, ProjectAchievementListResponse>> => {

        try {
            return E.right(await AchievementReportDatasource.pullProjectAchievementReport(params, options?.signal));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });
        }
    },

     apiCallPullAchievementReportSourcing: async (params: FilterWithPaginationAchievementRequest, options?: { signal?: AbortSignal }): Promise<E.Either<Failure, AchievementSourcingListResponse>> => {

        try {
            return E.right(await AchievementReportDatasource.pullSourcingAchievementReport(params, options?.signal));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });
        }
    },

    apiCallPullAchievementReportClosing: async (params: FilterWithPaginationAchievementRequest, options?: { signal?: AbortSignal }): Promise<E.Either<Failure, AchievementClosingListResponse>> => {

        try {
            return E.right(await AchievementReportDatasource.pullClosingAchievementReport(params, options?.signal));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });
        }
    },

    apiCallPullWalkinsRevisitReport: async (params: FilterWithPaginationClickAchievementRequest, options?: { signal?: AbortSignal }): Promise<E.Either<Failure, WalkinsRevisitReportListResponse>> => {

        try {
            return E.right(await AchievementReportDatasource.pullWalkinsRevisitReport(params, options?.signal));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });
        }
    },

    apiCallPullBookingReport: async (params: FilterWithPaginationClickAchievementRequest, options?: { signal?: AbortSignal }): Promise<E.Either<Failure, BookingReportListResponse>> => {

        try {
            return E.right(await AchievementReportDatasource.pullBookingReport(params, options?.signal));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });
        }
    },

    apiCallPullIBMOBMReport: async (params: FilterWithPaginationClickAchievementRequest, options?: { signal?: AbortSignal }): Promise<E.Either<Failure, IBMOBMReportListResponse>> => {

        try {
            return E.right(await AchievementReportDatasource.pullIBMOBMReport(params, options?.signal));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });
        }
    },
}