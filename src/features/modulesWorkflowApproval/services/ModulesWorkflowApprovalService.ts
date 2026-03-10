
import * as E from 'fp-ts/Either';
import type { Failure } from "@/core/api/FailureResponse";
import { ModulesWorkflowApprovalDatasourceImpl } from '@/features/modulesWorkflowApproval/datasources/ModulesWorkflowApprovalDatasource';
import type {
  AddUpdateModulesWorkflowApprovalRequest,
  DeleteModulesWorkflowApprovalRequest,
  FilterModulesWorkflowApprovalRequest,
  ModulesApprovalStatusListResponse,
  ModulesApprovalStatusRequest,
  ModulesWorkflowApprovalDeleteResponse,
  ModulesWorkflowApprovalListResponse,
  ModulesWorkflowApprovalSummaryListResponse,
  ModulesWorkflowApprovalSummaryRequest,
  UpdateModulesWorkflowApprovalRequest,
  UpdateModulesWorkflowApprovalResponse,
} from "@/features/modulesWorkflowApproval/models/ModulesWorkflowApprovalModel";
const ModulesWorkflowApprovalDatasource = new ModulesWorkflowApprovalDatasourceImpl();

export const modulesWorkflowApprovalService = {

    apiCallPullModulesWorkflowApproval: async (params: FilterModulesWorkflowApprovalRequest, options?: { signal?: AbortSignal }): Promise<E.Either<Failure, ModulesWorkflowApprovalListResponse>> => {

        try {
            return E.right(await ModulesWorkflowApprovalDatasource.pullModulesWorkflowApproval(params, options?.signal));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });
        }
    },

    apiCallAddUpdateModulesWorkflowApproval: async (params: AddUpdateModulesWorkflowApprovalRequest): Promise<E.Either<Failure, ModulesWorkflowApprovalListResponse>> => {
        try {

            return E.right(await ModulesWorkflowApprovalDatasource.addUpdateModulesWorkflowApproval(params));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },


    apiCallDeleteModulesWorkflowApproval: async (params: DeleteModulesWorkflowApprovalRequest): Promise<E.Either<Failure, ModulesWorkflowApprovalDeleteResponse>> => {
        try {

            return E.right(await ModulesWorkflowApprovalDatasource.deleteModulesWorkflowApproval(params));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },

     apiCallupdateModulesWorkflowApproval: async (params: UpdateModulesWorkflowApprovalRequest): Promise<E.Either<Failure, UpdateModulesWorkflowApprovalResponse>> => {
        try {

            return E.right(await ModulesWorkflowApprovalDatasource.updateModulesWorkflowApproval(params));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },
    apiCallPullModuleApprovalStatus: async (params: ModulesWorkflowApprovalSummaryRequest, options?: { signal?: AbortSignal }): Promise<E.Either<Failure, ModulesApprovalStatusListResponse>> => {

        try {
            return E.right(await ModulesWorkflowApprovalDatasource.pullModuleApprovalStatus(params, options?.signal));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });
        }
    },

    apiCallPullModulesWorkflowApprovalSummary: async (params: ModulesApprovalStatusRequest, options?: { signal?: AbortSignal }): Promise<E.Either<Failure, ModulesWorkflowApprovalSummaryListResponse>> => {

        try {
            return E.right(await ModulesWorkflowApprovalDatasource.pullModulesWorkflowApprovalSummary(params, options?.signal));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });
        }
    },
}