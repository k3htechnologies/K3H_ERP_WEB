
import * as E from 'fp-ts/Either';
import type { Failure } from "@/core/api/FailureResponse";
import { BrokerageInvoiceDatasourceImpl } from '@/features/brokerage/datasources/BrokerageInvoiceDatasource';
import type { BrokerageBookingListResponse, BrokerageInvoiceDeleteResponse, BrokerageInvoiceListResponse, BrokerageInvoiceSaveResponse, DeleteBrokerageInvoiceRequest, FilterWithPaginationBrokerageBookingRequest, FilterWithPaginationBrokerageInvoiceRequest } from "@/features/brokerage/models/BrokerageInvoiceModel";

const BrokerageInvoiceDatasource = new BrokerageInvoiceDatasourceImpl();

export const brokerageInvoiceService = {

    apiCallPullBrokerageBooking: async (params: FilterWithPaginationBrokerageBookingRequest, options?: { signal?: AbortSignal }): Promise<E.Either<Failure, BrokerageBookingListResponse>> => {

        try {
            return E.right(await BrokerageInvoiceDatasource.pullBrokerageBooking(params, options?.signal));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });
        }
    },

     apiCallPullBrokerageInvoice: async (params: FilterWithPaginationBrokerageInvoiceRequest, options?: { signal?: AbortSignal }): Promise<E.Either<Failure, BrokerageInvoiceListResponse>> => {
    
            try {
                return E.right(await BrokerageInvoiceDatasource.pullBrokerageInvoice(params, options?.signal));
    
            } catch (error: any) {
    
                return E.left({ message: error.message, code: error.code });
            }
        },
    
        apiCallAddUpdateBrokerageInvoice: async (formData: FormData): Promise<E.Either<Failure, BrokerageInvoiceSaveResponse>> => {
            try {
    
                return E.right(await BrokerageInvoiceDatasource.addUpdateBrokerageInvoice(formData));
    
            } catch (error: any) {
    
                return E.left({ message: error.message, code: error.code });
    
            }
        },
    

        apiCallDeleteBrokerageInvoice: async (params: DeleteBrokerageInvoiceRequest): Promise<E.Either<Failure, BrokerageInvoiceDeleteResponse>> => {
            try {
    
                return E.right(await BrokerageInvoiceDatasource.deleteBrokerageInvoice(params));
    
            } catch (error: any) {
    
                return E.left({ message: error.message, code: error.code });
    
            }
        },
}