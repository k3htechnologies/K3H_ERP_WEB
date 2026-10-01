import React, { useEffect, useMemo, useState } from 'react';
import * as E from 'fp-ts/Either';
import { Paperclip } from 'lucide-react';

import { Loader } from '@/core/utils/loader';
import { formatDate_dd_MonthName_yy_hh_mm } from '@/core/utils/dateFormat';
import { getDocumentNameFromUrl, parseDocumentUrls } from '@/core/utils/documentUtils';
import { getNameInitials } from '@/core/utils/getNameInitials';
import MultiImageViewer from '@/ui/components/ImageViewer/ImageViewer';
import { runApiWithLoader } from '@/core/utils';
import useToast from '@/core/hooks/useToast';
import type { AgendaData } from '@/features/meeting/models/AgendaModel';
import type { TaskDetails } from '@/features/task/models/TaskModel';
import type { DiscussionSortOrder, FilterWithPaginationTaskDiscussionRequest, TaskDiscussionData } from '@/features/task/models/TaskDiscussionModel';
import { taskDiscussionService } from '@/features/task/services/TaskDiscussionService';
import { DISCUSSION_PAGE_SIZE, DISCUSSION_SORT_OPTIONS } from '@/features/task/constants/taskConstants';
import { extractMentionUsers, splitTextWithMentions } from '@/features/task/utils/taskDiscussionUtils';
import { TaskMentionInput } from '@/features/task/components/TaskMentionInput';
import { Button } from '@/ui/components/forms';
import { SinglePageSelection } from '@/ui/components/DropDown/SinglePageSelection';

interface Props {
    task?: TaskDetails | null;
    agenda?: AgendaData | null;
    subTasks?: TaskDetails[];
    agendaSubTasks?: AgendaData[];
    maxVisibleComments?: number;
    onViewAllDiscussions?: () => void;
    onCommentsCountChange?: (count: number) => void;
}

export const TaskDiscussionsSection: React.FC<Props> = ({
    task = null,
    agenda = null,
    subTasks = [],
    agendaSubTasks = [],
    maxVisibleComments,
    onViewAllDiscussions,
    onCommentsCountChange,
}) => {
    const [comments, setComments] = useState<TaskDiscussionData[]>([]);
    const [sortOrder, setSortOrder] = useState<DiscussionSortOrder>('Most recent');
    const [isLoadingComments, setIsLoadingComments] = useState(false);
    const [loadingCommentsMessage, setLoadingCommentsMessage] = useState('');
    const [isSubmittingComment, setIsSubmittingComment] = useState(false);
    const [composerKey, setComposerKey] = useState(0);

    const { addToast } = useToast();

    const taskId = agenda ? agenda.AgendaId : Number(task?.TaskId ?? 0);

    const mentionUsers = useMemo(
        () => extractMentionUsers(agenda ?? task, agenda ? agendaSubTasks : subTasks),
        [agenda, agendaSubTasks, task, subTasks],
    );

    const fetchDiscussions = async () => {
        if (!taskId) {
            setComments([]);
            onCommentsCountChange?.(0);
            return;
        }

        await runApiWithLoader(
            setIsLoadingComments,
            setLoadingCommentsMessage,
            async () => {
                const params: FilterWithPaginationTaskDiscussionRequest = {
                    PageNumber: 1,
                    PageSize: DISCUSSION_PAGE_SIZE,
                    TaskId: taskId,
                };

                const response = await taskDiscussionService.apiCallPullTaskDiscussion(params);

                if (E.isRight(response)) {
                    setComments(response.right.Data);
                    onCommentsCountChange?.(response.right.Data.length);
                } else {
                    addToast({ type: 'error', title: response.left.message });
                }

                return response;
            },
            undefined,
            (error: any) => {
                addToast({ type: 'error', title: error.message });
            },
            undefined,
            'Loading discussions',
        );
    };

    useEffect(() => {
        fetchDiscussions();
    }, [taskId]);

    const sortedComments = useMemo(() => {
        if (sortOrder === 'Oldest first') {
            return comments;
        }

        return [...comments].reverse();
    }, [comments, sortOrder]);

    const visibleComments = useMemo(() => {
        if (maxVisibleComments == null) {
            return sortedComments;
        }

        return sortedComments.slice(0, maxVisibleComments);
    }, [sortedComments, maxVisibleComments]);

    const PushDiscussionFormData = (discussion: string, files: File[]): FormData => {
        const fd = new FormData();
        fd.append('TaskDiscussionId', '0');
        fd.append('UniqueKey', '3fa85f64-5717-4562-b3fc-2c963f66afa6');
        fd.append('TaskId', String(taskId));
        fd.append('Discussion', discussion);

        files.forEach((file) => {
            fd.append('DiscussionDocumentURL', file);
        });

        return fd;
    };

    const handleAddComment = async (text: string, files: File[] = []) => {
        const discussionText = text.trim();

        if (!discussionText && files.length === 0) return;
        if (!taskId) return;

        await runApiWithLoader(
            setIsSubmittingComment,
            setLoadingCommentsMessage,
            async () => {
                const response = await taskDiscussionService.apiCallAddUpdateTaskDiscussion(
                    PushDiscussionFormData(discussionText, files),
                );

                if (E.isRight(response)) {
                    addToast({ type: 'success', title: response.right.SuccessMessage?.[0] });
                    await fetchDiscussions();
                    setComposerKey((current) => current + 1);
                } else {
                    addToast({ type: 'error', title: response.left.message });
                }

                return response;
            },
            undefined,
            (error: any) => {
                addToast({ type: 'error', title: error.message });
            },
            undefined,
            'Adding discussion',
        );
    };

    return (
        <section className="rounded-2xl border border-gray-200 bg-white p-6">
            <Loader loading={isLoadingComments} title={loadingCommentsMessage}>
                <div />
            </Loader>

            <div className="mb-4 flex items-center justify-between gap-3">
                <div className="min-w-0">
                    <h4 className="font-medium text-gray-800">Comments & Discussions</h4>
                </div>
                <div className="w-[140px] shrink-0">
                    <SinglePageSelection
                        options={DISCUSSION_SORT_OPTIONS.map((option) => ({
                            label: option.label,
                            value: option.value,
                        }))}
                        value={sortOrder}
                        onChange={(item) => setSortOrder(item as DiscussionSortOrder)}
                        searchable={false}
                        size="md"
                        placeholder="Sort"
                    />
                </div>
            </div>

            <TaskMentionInput
                key={composerKey}
                users={mentionUsers}
                onSubmit={handleAddComment}
                disabled={isSubmittingComment || isLoadingComments}
            />

            <div className="mt-5 space-y-4">
                {!isLoadingComments && visibleComments.length === 0 && (
                    <p className="text-sm text-slate-500">No discussions yet.</p>
                )}

                {visibleComments.map((comment) => {
                    const attachmentUrls = parseDocumentUrls(comment.DiscussionDocumentURL);
                    const discussionText = comment.Discussion ?? '';

                    return (
                        <div key={comment.TaskDiscussionId} className="flex gap-3">
                            {comment.ProfilePhotoURL ? (
                                <img
                                    src={comment.ProfilePhotoURL}
                                    alt={comment.CreatedBy || '-'}
                                    className="w-7 h-7 rounded-full object-cover border border-gray-300 shrink-0"
                                />
                            ) : (
                                <div
                                    className="w-7 h-7 rounded-full bg-blue-200 flex items-center justify-center text-gray-800 font-medium text-xs border border-gray-300 shrink-0"
                                    title={comment.CreatedBy || '-'}
                                >
                                    {getNameInitials(comment.CreatedBy || '-')}
                                </div>
                            )}

                            <div className="min-w-0 flex-1">
                                <div className="flex flex-wrap items-center gap-2">
                                    <span className="font-semibold text-gray-800">
                                        {comment.CreatedBy || '-'}
                                    </span>
                                    <span className="text-xs text-gray-400">
                                        {comment.CreatedDate
                                            ? formatDate_dd_MonthName_yy_hh_mm(comment.CreatedDate)
                                            : '-'}
                                    </span>
                                </div>

                                <div className="mt-2 rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm leading-6 text-gray-800">
                                    {discussionText ? (
                                        <span>
                                            {splitTextWithMentions(discussionText).map((part, index) =>
                                                part.startsWith('@') ? (
                                                    <span key={index} className="font-medium text-blue-500">
                                                        {part}
                                                    </span>
                                                ) : (
                                                    <span key={index}>{part}</span>
                                                ),
                                            )}
                                        </span>
                                    ) : null}
                                    {attachmentUrls.length > 0 && (
                                        <div
                                            className={`flex flex-wrap gap-2 ${discussionText ? 'mt-2' : ''}`}
                                        >
                                            {attachmentUrls.map((attachmentUrl) => {
                                                const attachmentName =
                                                    getDocumentNameFromUrl(attachmentUrl);

                                                return (
                                                    <MultiImageViewer
                                                        key={attachmentUrl}
                                                        images={[attachmentUrl]}
                                                        title={attachmentName}
                                                        isIcon={false}
                                                        triggerLabel={
                                                            <span className="inline-flex max-w-full items-center gap-1 rounded-md border border-gray-200 bg-white px-2 py-1 text-xs font-medium text-blue-600 hover:bg-gray-50">
                                                                <Paperclip className="h-3 w-3 shrink-0" />
                                                                <span className="truncate">
                                                                    {attachmentName}
                                                                </span>
                                                            </span>
                                                        }
                                                    />
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {maxVisibleComments != null &&
                onViewAllDiscussions &&
                comments.length > maxVisibleComments && (
                <Button
                    color="transparent"
                    size="sm"
                    className="mt-4 px-2 py-0 text-blue-600 hover:text-blue-700"
                    onClick={onViewAllDiscussions}
                >
                    View all discussions ({comments.length})
                </Button>
            )}
        </section>
    );
};
