import baseClient from "@/core/config/baseClient";
import { TokenExpiredException } from "@/core/config/baseClientexceptions";
import { PayTrackBookingFilesApi } from "@/features/crmPayTrack/api/PayTrackBookingFilesApi";
import type {

    BankDocumentsPayTrackBookingFilesDeleteResponse,
    BankDocumentsPayTrackBookingFilesListResponse,
    BankDocumentsPayTrackBookingFilesSaveResponse,
    DeleteBankDocumentsPayTrackBookingFilesRequest,
    FilterWithPaginationBankDocumentsPayTrackBookingFiles

} from "@/features/crmPayTrack/models/BankDocumentsPayTrackBookingFilesModel";

export abstract class PayTrackBookingFilesDatasource {

    abstract pullPayTrackBookingFiles(params: FilterWithPaginationBankDocumentsPayTrackBookingFiles, signal?: AbortSignal): Promise<BankDocumentsPayTrackBookingFilesListResponse>;
    abstract addUpdatePayTrackBookingFiles(data: FormData): Promise<BankDocumentsPayTrackBookingFilesSaveResponse>;
    abstract deletePayTrackBookingFiles(params: DeleteBankDocumentsPayTrackBookingFilesRequest): Promise<BankDocumentsPayTrackBookingFilesDeleteResponse>;
}

export class PayTrackBookingFilesDatasourceImpl implements PayTrackBookingFilesDatasource {
    private get k3hHttpClient() {
        return baseClient;
    }

    async pullPayTrackBookingFiles(params: FilterWithPaginationBankDocumentsPayTrackBookingFiles, signal?: AbortSignal): Promise<BankDocumentsPayTrackBookingFilesListResponse> {
        try {
            const queryParams = new URLSearchParams({
                pageSize: String(params.PageSize ?? 10),
                pageNumber: String(params.PageNumber ?? 1),
            });

            if (params.BookingId) queryParams.append("BookingId", params.BookingId.toString());
            if (params.ProjectId) queryParams.append("ProjectId", params.ProjectId.toString());
            if (params.FileType?.trim()) queryParams.append("FileType", params.FileType.trim());
            if (params.FileName?.trim()) queryParams.append("FileName", params.FileName.trim());
            if (params.SortBy?.trim()) queryParams.append("SortBy", params.SortBy.trim());
            if (params.ExportType) queryParams.append("ExportType", params.ExportType);

            const response = await this.k3hHttpClient.getRequestWithAuthentication(
                `${PayTrackBookingFilesApi.PULL}?${queryParams.toString().replace(/\+/g, '%20')}`, { signal }
            )
            return response

        } catch (error: any) {

            console.error("ERROR: PULL PAYTRACK BOOKING FILES :", error);

            if (error instanceof TokenExpiredException) {
                return await this.pullPayTrackBookingFiles(params);
            }
            throw error;
        }
    }

    async addUpdatePayTrackBookingFiles(formData: FormData): Promise<BankDocumentsPayTrackBookingFilesSaveResponse> {
        try {
            const response = await this.k3hHttpClient.multipartRequestWithAuthentication(
                PayTrackBookingFilesApi.ADD_UPDATE,
                formData
            )
            return response
        } catch (error: any) {
            console.error("ERROR: ADD UPDATE PAYTRACK BOOKING FILES :", error);

            if (error instanceof TokenExpiredException) {
                return await this.addUpdatePayTrackBookingFiles(formData);
            }
            throw error;
        }
    }

    async deletePayTrackBookingFiles(params: DeleteBankDocumentsPayTrackBookingFilesRequest): Promise<BankDocumentsPayTrackBookingFilesDeleteResponse> {
        try {

            const queryParams = new URLSearchParams({
                PayTrackBookingFilesId: (params.PayTrackBookingFilesId ?? 0).toString(),
                BookingId: (params.BookingId ?? 0).toString(),
                ProjectId: (params.ProjectId ?? 0).toString(),
                UniqueKey: params.Uniquekey ?? "",
            });

            const response = await this.k3hHttpClient.deleteRequestWithAuthentication(
                `${PayTrackBookingFilesApi.DELETE}?${queryParams.toString()}`
            )
            return response

        } catch (error) {


            console.error("ERROR: DELETE PAYTRACK BOOKING FILES :", error);
            if (error instanceof TokenExpiredException) {
                return await this.deletePayTrackBookingFiles(params);
            }
            throw error;
        }
    }
}
