import type { Failure } from "@/core/api/FailureResponse";
import type { AddUpdateSnagChecklistRequest, FilterWithPaginationSnagChecklistRequset, SnagChecklistResponse, SnagChecklistSaveResponse } from "@/features/crmPayTrack/models/SnagCheckListModel";
import * as E from 'fp-ts/Either';
import { SnagChecklistDataSourceImpl } from "@/features/crmPayTrack/datasources/SnagCheckListDatasource";

const SnagChecklistDataSource = new SnagChecklistDataSourceImpl();

export const snagChecklistService = {

    apiCallSnagChecklist: async (params: FilterWithPaginationSnagChecklistRequset, options?: { signal?: AbortSignal }): Promise<E.Either<Failure, SnagChecklistResponse>> => {

        try {

            return E.right(await SnagChecklistDataSource.pullSnagChecklist(params, options?.signal));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });
        }
    },

    apiCallAddUpdateSnagChecklist: async (data: AddUpdateSnagChecklistRequest): Promise<E.Either<Failure, SnagChecklistSaveResponse>> => {

        try {

            return E.right(await SnagChecklistDataSource.addUpdateSnagChecklist(data));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });
        }
    }
}