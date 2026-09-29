import type { Failure } from '@/core/api/FailureResponse';
import { TaskDatasourceImpl } from '@/features/task/datasources/TaskDatasource';
import type {
    DeleteTaskDetailsRequest,
    FilterWithPaginationTaskDetailsRequest,
    FilterWithPaginationTaskTagRequest,
    TaskDeleteResponse,
    TaskInitialStatusListResponse,
    TaskListResponse,
    TaskPriorityListResponse,
    TaskSaveResponse,
    TaskTagListResponse,
} from '@/features/task/models/TaskModel';

import * as E from 'fp-ts/Either';

const taskDatasource = new TaskDatasourceImpl();

export const taskService = {

    apiCallPullTaskPriority: async (options?: { signal?: AbortSignal }): Promise<E.Either<Failure, TaskPriorityListResponse>> => {
        try {

            return E.right(await taskDatasource.pullTaskPriority(options?.signal));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },

    apiCallPullTaskInitialState: async (options?: { signal?: AbortSignal }): Promise<E.Either<Failure, TaskInitialStatusListResponse>> => {
        try {

            return E.right(await taskDatasource.pullTaskInitialState(options?.signal));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },

    apiCallPullTask: async (params: FilterWithPaginationTaskDetailsRequest, options?: { signal?: AbortSignal }): Promise<E.Either<Failure, TaskListResponse>> => {
        try {

            return E.right(await taskDatasource.pullTask(params, options?.signal));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },

    apiCallPullTaskTag: async (params: FilterWithPaginationTaskTagRequest, options?: { signal?: AbortSignal }): Promise<E.Either<Failure, TaskTagListResponse>> => {
        try {

            return E.right(await taskDatasource.pullTaskTag(params, options?.signal));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },

    apiCallAddUpdateTask: async (params: FormData): Promise<E.Either<Failure, TaskSaveResponse>> => {
        try {

            return E.right(await taskDatasource.addUpdateTask(params));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },

    apiCallDeleteTask: async (params: DeleteTaskDetailsRequest): Promise<E.Either<Failure, TaskDeleteResponse>> => {
        try {

            return E.right(await taskDatasource.deleteTask(params));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },
};
