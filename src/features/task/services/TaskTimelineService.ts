import type { Failure } from '@/core/api/FailureResponse';
import { TaskTimelineDatasourceImpl } from '@/features/task/datasources/TaskTimelineDatasource';
import type {
    FilterWithPaginationTaskTimelineRequest,
    TaskTimelineListResponse,
} from '@/features/task/models/TaskTimelineModel';

import * as E from 'fp-ts/Either';

const taskTimelineDatasource = new TaskTimelineDatasourceImpl();

export const taskTimelineService = {

    apiCallPullTaskTimeline: async (params: FilterWithPaginationTaskTimelineRequest, options?: { signal?: AbortSignal }): Promise<E.Either<Failure, TaskTimelineListResponse>> => {
        try {

            return E.right(await taskTimelineDatasource.pullTaskTimeline(params, options?.signal));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },
};
