import { ApprovedBankFileDatasourceImpl } from "@/features/approvedBank/datasources/ApprovedBankFileDatasource";
import type {

    ApprovedBankFileDeleteResponse,
    ApprovedBankFileListResponse,
    ApprovedBankFileSaveResponse,
    DeleteApprovedBankFileRequest,
    FilterWithPaginationApprovedBankFileRequest

} from "@/features/approvedBank/models/ApprovedBankFileModel";
import * as E from 'fp-ts/Either';
import type { Failure } from "@/core/api/FailureResponse";


const ApprovedBankFileDatasource = new ApprovedBankFileDatasourceImpl();

export const approvedBankFileService = {

    apiCallPullApprovedBankFile: async (params: FilterWithPaginationApprovedBankFileRequest, options?: { signal?: AbortSignal }): Promise<E.Either<Failure, ApprovedBankFileListResponse>> => {

        try {
            return E.right(await ApprovedBankFileDatasource.pullApprovedBankFile(params, options?.signal));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });
        }
    },

    apiCallAddUpdateApprovedBankFile: async (data: FormData): Promise<E.Either<Failure, ApprovedBankFileSaveResponse>> => {

        try {

            return E.right(await ApprovedBankFileDatasource.addUpdateApprovedBankFile(data));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });
        }
    },

    apiCallDeleteApprovedBankFile: async (params: DeleteApprovedBankFileRequest): Promise<E.Either<Failure, ApprovedBankFileDeleteResponse>> => {
        try {

            return E.right(await ApprovedBankFileDatasource.deleteApprovedBankFile(params));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code })
        }
    }
}