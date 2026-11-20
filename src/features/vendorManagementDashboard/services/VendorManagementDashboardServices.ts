import type { Failure } from '@/core/api/FailureResponse';
import * as E from 'fp-ts/Either';
import { VendorManagementDashboardDatasourceImpl } from '@/features/vendorManagementDashboard/datasources/VendorManagementDashboardDatasource';
import type { VendorManagementResponse } from '@/features/vendorManagementDashboard/models/VendorManagementDashboardModel';

const vendorManagementDashboardDatasource = new VendorManagementDashboardDatasourceImpl();

export const vendorManagementDashboardServices = {

    apiCallPullVendorManagementDashboard: async (signal?: AbortSignal): Promise<E.Either<Failure, VendorManagementResponse>> => {
        try {

            const response = await vendorManagementDashboardDatasource.pullVendorManagementDashboard(signal);
            return E.right(response);

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });
        }

    }

}