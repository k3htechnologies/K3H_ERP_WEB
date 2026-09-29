import type { Failure } from '@/core/api/FailureResponse';
import { TaskDiscussionDatasourceImpl } from '@/features/task/datasources/TaskDiscussionDatasource';
import type {
    FilterWithPaginationTaskDiscussionRequest,
    TaskDiscussionListResponse,
    TaskDiscussionSaveResponse,
} from '@/features/task/models/TaskDiscussionModel';

import * as E from 'fp-ts/Either';

const taskDiscussionDatasource = new TaskDiscussionDatasourceImpl();

export const taskDiscussionService = {

    apiCallPullTaskDiscussion: async (params: FilterWithPaginationTaskDiscussionRequest, options?: { signal?: AbortSignal }): Promise<E.Either<Failure, TaskDiscussionListResponse>> => {
        try {

            return E.right(await taskDiscussionDatasource.pullTaskDiscussion(params, options?.signal));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },

    apiCallAddUpdateTaskDiscussion: async (params: FormData): Promise<E.Either<Failure, TaskDiscussionSaveResponse>> => {
        try {

            return E.right(await taskDiscussionDatasource.addUpdateTaskDiscussion(params));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },
};
