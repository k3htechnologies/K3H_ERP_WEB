import baseClient from '@/core/config/baseClient'
import { TokenExpiredException } from '@/core/config/baseClientexceptions'
import { BookingApi } from '@/features/booking/api/BookingApi'
import type {
    FilterWithPaginationBookingRequest,
    BookingListResponse,
    BookingSaveResponse,
    CancelBookingRequest,
    BookingDeleteResponse,
    FilterWithPaginationChannelPartnerBookingRequest,
    FilterPaymentScheduleStagesRequest,
    PaymentScheduleStagesResponse,
    BookingUpdateegistrationDateParkingResponse,
} from '@/features/booking/models/BookingModel'

export abstract class BookingDatasource {
    abstract pullBooking(params: FilterWithPaginationBookingRequest, signal?: AbortSignal): Promise<BookingListResponse>;
    abstract addUpdateBooking(data: FormData): Promise<BookingSaveResponse>;
    abstract cancelBooking(params: CancelBookingRequest): Promise<BookingDeleteResponse>;
    abstract pullChannelPartnerBooking(params: FilterWithPaginationChannelPartnerBookingRequest, signal?: AbortSignal): Promise<BookingListResponse>;
    abstract pullPaymentScheduleStages(params: FilterPaymentScheduleStagesRequest): Promise<PaymentScheduleStagesResponse>;
    abstract updatePayTrackBookingRegistrationDateParking(formData: FormData): Promise<BookingUpdateegistrationDateParkingResponse>;
}

export class BookingDatasourceImpl implements BookingDatasource {
    private get k3hHttpClient() {
        return baseClient
    }

    async pullBooking(params: FilterWithPaginationBookingRequest, signal?: AbortSignal): Promise<BookingListResponse> {
        try {
            const queryParams = new URLSearchParams({
                PageSize: (params.PageSize ?? 10).toString(),
                PageNumber: (params.PageNumber ?? 1).toString(),
                IsCheckPermission: (params.IsCheckPermission ?? true).toString(),
            })

            if (params.BookingId) queryParams.append('BookingId', params.BookingId.toString());
            if (params.ProjectId) queryParams.append('ProjectId', params.ProjectId.toString());
            if (params.ApplicantMobileNumber?.trim()) queryParams.append('ApplicantMobileNumber', params.ApplicantMobileNumber.trim());
            if (params.ApplicantName?.trim()) queryParams.append('ApplicantName', params.ApplicantName.trim());
            if (params.FromDate) queryParams.append('FromDate', params.FromDate);
            if (params.ToDate) queryParams.append('ToDate', params.ToDate);
            if (params.Wing?.trim()) queryParams.append('Wing', params.Wing.trim());
            if (params.Flat?.trim()) queryParams.append('Flat', params.Flat.trim());
            if (params.Floor?.trim()) queryParams.append('Floor', params.Floor.trim());
            if (params.Source) queryParams.append('Source', params.Source);
            if (params.SubSource) queryParams.append('SubSource', params.SubSource);
            if (params.SubSubSource) queryParams.append('SubSubSource', params.SubSubSource);
            if (params.AgreementValue) queryParams.append('AgreementValue', params.AgreementValue.toString());
            if (params.BookingType?.trim()) queryParams.append('BookingType', params.BookingType.trim());
            if (params.SortBy?.trim()) queryParams.append('SortBy', params.SortBy.trim());
            if (params.ExportType) queryParams.append('ExportType', params.ExportType);

            const response = await this.k3hHttpClient.getRequestWithAuthentication(
                `${BookingApi.PULL}?${queryParams.toString()}`,
                { signal }
            )

            return response
        } catch (error) {
            console.error('Error: Pull BOOKING:', error);

           if (error instanceof TokenExpiredException) {

                return await this.pullBooking(params, signal);
            }

            throw error
        }
    }

    async addUpdateBooking(data: FormData): Promise<BookingSaveResponse> {
        try {
            const response = await this.k3hHttpClient.multipartRequestWithAuthentication(
                BookingApi.ADD_UPDATE,
                data
            )

            return response
        } catch (error) {
            console.error('Error: Add Update BOOKING:', error)

           if (error instanceof TokenExpiredException) {

                return  await this.addUpdateBooking(data);
            }

            throw error
        }
    }

    async cancelBooking(params: CancelBookingRequest): Promise<BookingDeleteResponse> {
        try {
            const response = await this.k3hHttpClient.postRequestWithAuthentication(
                BookingApi.CANCEL,
                params
            )

            return response
        } catch (error) {
            console.error('Error: Cancel BOOKING:', error)

            if (error instanceof TokenExpiredException) {

                return await this.cancelBooking(params);
            }

            throw error
        }
    }

    async pullChannelPartnerBooking(params: FilterWithPaginationChannelPartnerBookingRequest, signal?: AbortSignal): Promise<BookingListResponse> {
        try {
            const queryParams = new URLSearchParams({
                PageSize: (params.PageSize ?? 10).toString(),
                PageNumber: (params.PageNumber ?? 1).toString(),
            })

            if (params.ChannelPartnerId) queryParams.append('ChannelPartnerId', params.ChannelPartnerId.toString());
            if (params.BookingId) queryParams.append('BookingId', params.BookingId.toString());
            if (params.ProjectId) queryParams.append('ProjectId', params.ProjectId.toString());
            if (params.ApplicantMobileNumber?.trim()) queryParams.append('ApplicantMobileNumber', params.ApplicantMobileNumber.trim());
            if (params.ApplicantName?.trim()) queryParams.append('ApplicantName', params.ApplicantName.trim());
            if (params.FromDate) queryParams.append('FromDate', params.FromDate);
            if (params.ToDate) queryParams.append('ToDate', params.ToDate);
            if (params.Wing?.trim()) queryParams.append('Wing', params.Wing.trim());
            if (params.Flat?.trim()) queryParams.append('Flat', params.Flat.trim());
            if (params.Floor?.trim()) queryParams.append('Floor', params.Floor.trim());
            if (params.Source?.trim()) queryParams.append('Source', params.Source.trim());
            if (params.AgreementValue) queryParams.append('AgreementValue', params.AgreementValue.toString());
            if (params.SortBy?.trim()) queryParams.append('SortBy', params.SortBy.trim());
            if (params.ExportType) queryParams.append('ExportType', params.ExportType);

            const response = await this.k3hHttpClient.getRequestWithAuthentication(
                `${BookingApi.PULL_CHANNEL_PARTNER_BOOKING}?${queryParams.toString()}`,
                { signal }
            )

            return response
        } catch (error) {
            console.error('Error: Pull CHANNEL PARTNER BOOKING:', error);

            if (error instanceof TokenExpiredException) {

                return  await this.pullChannelPartnerBooking(params, signal);
            }

            throw error
        }
    }

    async pullPaymentScheduleStages(params: FilterPaymentScheduleStagesRequest): Promise<PaymentScheduleStagesResponse> {
        try {
            const queryParams = new URLSearchParams();


            if (params.ProjectId) queryParams.append('ProjectId', params.ProjectId.toString());
            if (params.InventoryBuildingId) queryParams.append('InventoryBuildingId', params.InventoryBuildingId.toString());
            if (params.InventoryFlatFloorBasementPodiumWingId) queryParams.append('InventoryFlatFloorBasementPodiumWingId', params.InventoryFlatFloorBasementPodiumWingId.toString());
            if (params.ExportType) queryParams.append('ExportType', params.ExportType);

            const response = await this.k3hHttpClient.getRequestWithAuthentication(
                `${BookingApi.PULL_PAYMENT_SCHEDULE_STAGES}?${queryParams.toString()}`
            )

            return response
        } catch (error) {
            
            console.error('Error: Pull PAYMENT SCHEDULE STAGES:', error);

            if (error instanceof TokenExpiredException) {

                return await this.pullPaymentScheduleStages(params);
            }

            throw error
        }
    }

    async updatePayTrackBookingRegistrationDateParking(formData: FormData): Promise<BookingUpdateegistrationDateParkingResponse> {
        try {
            const response = await this.k3hHttpClient.multipartRequestWithAuthentication(
                BookingApi.UPDATE_BOOKING_REGISTRATIONDATE_PARKING,
                formData
            )

            return response
        } catch (error) {
            console.error('Error: Update BOOKING REGISTRATION DATE AND PARKING:', error)

           if (error instanceof TokenExpiredException) {

                return  await this.updatePayTrackBookingRegistrationDateParking(formData);
            }

            throw error
        }
    }
}

