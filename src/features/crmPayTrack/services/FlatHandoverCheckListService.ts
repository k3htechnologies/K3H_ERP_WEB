import type { Failure } from "@/core/api/FailureResponse";
import * as E from 'fp-ts/Either';
import { FlatHandoverChecklistDataSourceImpl } from "@/features/crmPayTrack/datasources/FlatHandoverCheckListDatasource";
import type { AddUpdateFlatHandoverChecklistRequest, FilterWithPaginationFlatHandoverChecklist, FlatHandoverChecklistResponse, FlatHandoverChecklistSaveResponse } from "@/features/crmPayTrack/models/FlatHandoverCheckListModel";

const FlatHandoverChecklistDataSource = new FlatHandoverChecklistDataSourceImpl();

export const flatHandoverChecklistService = {

    apiCallFlatHandoverChecklist: async (params: FilterWithPaginationFlatHandoverChecklist, options?: { signal?: AbortSignal }): Promise<E.Either<Failure, FlatHandoverChecklistResponse>> => {

        try {

            return E.right(await FlatHandoverChecklistDataSource.pullFlatHandoverChecklist(params, options?.signal));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });
        }
    },

    apiCallAddUpdateFlatHandoverChecklist: async (data: AddUpdateFlatHandoverChecklistRequest): Promise<E.Either<Failure, FlatHandoverChecklistSaveResponse>> => {

        try {

            return E.right(await FlatHandoverChecklistDataSource.addUpdateFlatHandoverChecklist(data));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });
        }
    }
}