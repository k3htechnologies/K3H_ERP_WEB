
import * as E from 'fp-ts/Either';
import type { Failure } from "@/core/api/FailureResponse";
import { PaidBrokerageBookingDatasourceImpl } from '../datasources/PaidBrokerageBookingDatasource';
import type { DeletePaidBrokerageBookingRequest, FilterWithPaginationPaidBrokerageBookingRequest, PaidBrokerageBookingDeleteResponse, PaidBrokerageBookingListResponse, PaidBrokerageBookingSaveResponse } from '../models/PaidBrokerageBookingModel';

const PaidBrokerageBookingDatasource = new PaidBrokerageBookingDatasourceImpl();

export const PaidBrokerageBookingService = {

   
     apiCallPullPaidBrokerageBooking: async (params: FilterWithPaginationPaidBrokerageBookingRequest, options?: { signal?: AbortSignal }): Promise<E.Either<Failure, PaidBrokerageBookingListResponse>> => {
    
            try {
                return E.right(await PaidBrokerageBookingDatasource.pullPaidBrokerageBooking(params, options?.signal));
    
            } catch (error: any) {
    
                return E.left({ message: error.message, code: error.code });
            }
        },
    
        apiCallAddUpdatePaidBrokerageBooking: async (formData: FormData): Promise<E.Either<Failure, PaidBrokerageBookingSaveResponse>> => {
            try {
    
                return E.right(await PaidBrokerageBookingDatasource.addUpdatePaidBrokerageBooking(formData));
    
            } catch (error: any) {
    
                return E.left({ message: error.message, code: error.code });
    
            }
        },
    
        apiCallDeletePaidBrokerageBooking: async (params: DeletePaidBrokerageBookingRequest): Promise<E.Either<Failure, PaidBrokerageBookingDeleteResponse>> => {
            try {
    
                return E.right(await PaidBrokerageBookingDatasource.deletePaidBrokerageBooking(params));
    
            } catch (error: any) {
    
                return E.left({ message: error.message, code: error.code });
    
            }
        },
}