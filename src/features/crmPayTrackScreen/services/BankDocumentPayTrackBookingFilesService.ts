import { PayTrackBookingFilesDatasourceImpl } from "@/features/crmPayTrackScreen/datasources/PayTrackBookingFilesDatasource";
import type {

    BankDocumentsPayTrackBookingFilesDeleteResponse,
    BankDocumentsPayTrackBookingFilesListResponse,
    BankDocumentsPayTrackBookingFilesSaveResponse,
    DeleteBankDocumentsPayTrackBookingFilesRequest,
    FilterWithPaginationBankDocumentsPayTrackBookingFiles

} from "@/features/crmPayTrackScreen/models/BankDocumentsPayTrackBookingFiles";
import * as E from 'fp-ts/Either';
import type { Failure } from "@/core/api/FailureResponse";


const PayTrackBookingFilesDatasource = new PayTrackBookingFilesDatasourceImpl();

export const bankDocumentPayTrackBookingFilesService = {

    apiCallPullBankDocumentsPayTrackBookingFiles: async (params: FilterWithPaginationBankDocumentsPayTrackBookingFiles, options?: { signal?: AbortSignal }): Promise<E.Either<Failure, BankDocumentsPayTrackBookingFilesListResponse>> => {

        try {
            return E.right(await PayTrackBookingFilesDatasource.pullPayTrackBookingFiles(params, options?.signal));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });
        }
    },

    apiCallAddUpdateBankDocumentsPayTrackBookingFiles: async (data: FormData): Promise<E.Either<Failure, BankDocumentsPayTrackBookingFilesSaveResponse>> => {

        try {

            return E.right(await PayTrackBookingFilesDatasource.addUpdatePayTrackBookingFiles(data));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });
        }
    },

    apiCallDeleteBankDocumentsPayTrackBookingFiles: async (params: DeleteBankDocumentsPayTrackBookingFilesRequest): Promise<E.Either<Failure, BankDocumentsPayTrackBookingFilesDeleteResponse>> => {
        try {

            return E.right(await PayTrackBookingFilesDatasource.deletePayTrackBookingFiles(params));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code })
        }
    }
}