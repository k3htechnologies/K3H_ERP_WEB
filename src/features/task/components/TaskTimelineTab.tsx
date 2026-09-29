import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import * as E from 'fp-ts/Either';
import { runApiWithLoader } from '@/core/utils';
import { formatDate_dd_MonthName_yy, formatDate_MonthName_yy } from '@/core/utils/dateFormat';
import { Loader } from '@/core/utils/loader';
import { useToast } from '@/core/hooks/useToast';
import usePagination from '@/core/hooks/usePagination';
import type { FilterWithPaginationTaskTimelineRequest, TaskTimelineData } from '@/features/task/models/TaskTimelineModel';
import { taskTimelineService } from '@/features/task/services/TaskTimelineService';
import { TIMELINE_ACTIVITY_WIDTH, TIMELINE_COLUMN_WIDTH, TIMELINE_ROW_HEIGHT } from '@/features/task/constants/taskConstants';
import { formatTimelineFieldValue, getTimelineEventDateKey, getTimelinePillClasses, getTimelineRangeEnd, getTimelineValueSummary, parseTimelineJson, toTimelineDateKey } from '@/features/task/utils/taskTimelineUtils';
import type { PaginationInfo } from '@/ui/components/DataTable/DataTable';
import { Modal } from '@/ui/components/Modal/Modal';
import { Pagination } from '@/ui/components/Pagination/Pagination';
import { Button } from '@/ui/components/forms';
import { FieldItem } from '@/ui/components/forms/FieldItem';

interface Props {
    taskId: number;
}

export const TaskTimelineTab: React.FC<Props> = ({ taskId }) => {

    const [rangeStart, setRangeStart] = useState(() => {
        const now = new Date();
        return new Date(now.getFullYear(), now.getMonth(), 1);
    });
    const [timelineEvents, setTimelineEvents] = useState<TaskTimelineData[]>([]);
    const [hasAutoRanged, setHasAutoRanged] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState<TaskTimelineData | null>(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');

    const { pagination, setPagination } = usePagination(20);
    const { addToast } = useToast();

    const loadTaskTimeline = async (id: number, pageNum: number) => {
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {
                const params: FilterWithPaginationTaskTimelineRequest = {
                    PageSize: pagination.pageSize,
                    PageNumber: pageNum,
                    TaskId: id,
                };

                const response = await taskTimelineService.apiCallPullTaskTimeline(params);

                if (E.isRight(response)) {
                    setTimelineEvents(response.right.Data || []);
                    setHasAutoRanged(false);

                    setPagination({
                        currentPage: pageNum,
                        totalRecords: response.right.TotalNumberOfRecord,
                        totalPages: Math.ceil(response.right.TotalNumberOfRecord / pagination.pageSize),
                    });
                } else {
                    addToast({ type: 'error', title: response.left.message });
                    setTimelineEvents([]);
                }

                return response;
            },
            undefined,
            (error: any) => {
                addToast({ type: 'error', title: error.message });
            },
            undefined,
            'Loading Timeline',
        );
    };

    useEffect(() => {
        if (!taskId) return;

        loadTaskTimeline(taskId, pagination.currentPage);
    }, [taskId, pagination.currentPage]);

    useEffect(() => {
        if (hasAutoRanged || timelineEvents.length === 0) return;

        const startKey = toTimelineDateKey(rangeStart);
        const endKey = toTimelineDateKey(getTimelineRangeEnd(rangeStart));

        const hasVisible = timelineEvents.some((event) => {
            const dateKey = getTimelineEventDateKey(event.CreatedDate);
            return !!dateKey && dateKey >= startKey && dateKey <= endKey;
        });

        if (hasVisible) {
            setHasAutoRanged(true);
            return;
        }

        const dateKeys = timelineEvents
            .map((event) => getTimelineEventDateKey(event.CreatedDate))
            .filter(Boolean)
            .sort();

        const latestKey = dateKeys[dateKeys.length - 1];
        if (!latestKey) {
            setHasAutoRanged(true);
            return;
        }

        const [year, month] = latestKey.split('-').map(Number);
        setRangeStart(new Date(year, month - 1, 1));
        setHasAutoRanged(true);
    }, [timelineEvents, rangeStart, hasAutoRanged]);

    const rangeEnd = useMemo(() => getTimelineRangeEnd(rangeStart), [rangeStart]);

    const rangeLabel = useMemo(
        () => `${formatDate_MonthName_yy(rangeStart)} - ${formatDate_MonthName_yy(rangeEnd)}`,
        [rangeStart, rangeEnd],
    );

    const sortedEvents = useMemo(() => {
        return [...timelineEvents].sort((first, second) => {
            const firstKey = getTimelineEventDateKey(first.CreatedDate);
            const secondKey = getTimelineEventDateKey(second.CreatedDate);

            if (firstKey === secondKey) {
                return (first.TaskTimelineId || 0) - (second.TaskTimelineId || 0);
            }

            return firstKey.localeCompare(secondKey);
        });
    }, [timelineEvents]);

    const visibleEvents = useMemo(() => {
        const startKey = toTimelineDateKey(rangeStart);
        const endKey = toTimelineDateKey(rangeEnd);

        return sortedEvents.filter((event) => {
            const dateKey = getTimelineEventDateKey(event.CreatedDate);
            if (!dateKey) return false;
            return dateKey >= startKey && dateKey <= endKey;
        });
    }, [sortedEvents, rangeStart, rangeEnd]);

    const columns = useMemo(() => {
        const timestamps = new Set<number>();
        const cursor = new Date(rangeStart);

        while (cursor <= rangeEnd) {
            timestamps.add(cursor.getTime());
            cursor.setDate(cursor.getDate() + 1);
        }

        return Array.from(timestamps)
            .filter((timestamp) => !Number.isNaN(timestamp))
            .sort((first, second) => first - second)
            .map((timestamp) => new Date(timestamp));
    }, [rangeStart, rangeEnd]);

    const todayKey = toTimelineDateKey(new Date());
    const todayColumnIndex = columns.findIndex(
        (column) => toTimelineDateKey(column) === todayKey,
    );
    const gridWidth = columns.length * TIMELINE_COLUMN_WIDTH;
    const bodyHeight = visibleEvents.length * TIMELINE_ROW_HEIGHT;

    const handlePageChange = useCallback(
        (page: number) => {
            setPagination({ currentPage: page });
        },
        [setPagination],
    );

    const timelinePaginationInfo: PaginationInfo = useMemo(
        () => ({
            currentPage: pagination.currentPage,
            totalPages: pagination.totalPages,
            totalRecords: pagination.totalRecords,
            pageSize: pagination.pageSize,
            onPageChange: handlePageChange,
        }),
        [pagination.currentPage, pagination.totalPages, pagination.totalRecords, pagination.pageSize, handlePageChange],
    );

    const handlePrevious = () => {
        setRangeStart((current) => {
            const next = new Date(current);
            next.setMonth(next.getMonth() - 1);
            return next;
        });
    };

    const handleNext = () => {
        setRangeStart((current) => {
            const next = new Date(current);
            next.setMonth(next.getMonth() + 1);
            return next;
        });
    };

    const handleToday = () => {
        const now = new Date();
        setRangeStart(new Date(now.getFullYear(), now.getMonth(), 1));
    };

    const handleEventClick = (event: TaskTimelineData) => {
        setSelectedEvent(event);
        setIsDetailModalOpen(true);
    };

    const closeDetailModal = () => {
        setIsDetailModalOpen(false);
        setSelectedEvent(null);
    };

    return (
        <div className="space-y-4">
            <Loader loading={isLoading} title={loadingMessage}>
                <div />
            </Loader>

            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                    <Button
                        color="transparent"
                        size="sm"
                        isborderRadius
                        title="Previous period"
                        onClick={handlePrevious}
                        className="rounded-md p-1.5"
                        leftIcon={<ChevronLeft className="h-4 w-4 text-gray-600" />}
                    />

                    <h3 className="min-w-[180px] text-center text-base font-semibold text-[#262626]">
                        {rangeLabel}
                    </h3>

                    <Button
                        color="transparent"
                        size="sm"
                        isborderRadius
                        title="Next period"
                        onClick={handleNext}
                        className="rounded-md p-1.5"
                        leftIcon={<ChevronRight className="h-4 w-4 text-gray-600" />}
                    />
                </div>

                <Button
                    color="transparent"
                    size="sm"
                    onClick={handleToday}
                    className="rounded-md border border-[#D9D9D9] px-3 py-1.5 text-sm font-medium text-[#595959]"
                >
                    Today
                </Button>
            </div>

            {visibleEvents.length === 0 ? (
                <div className="rounded-xl border border-dashed border-[#D9D9D9] p-10 text-center text-sm text-[#8C8C8C]">
                    No timeline activity for this period
                </div>
            ) : (
                <div className="overflow-hidden rounded-xl border border-[#E8EBF0] bg-white">
                    <div className="overflow-x-auto thin-scroll">
                        <div
                            className="relative min-w-full"
                            style={{ minWidth: TIMELINE_ACTIVITY_WIDTH + gridWidth }}
                        >
                            {todayColumnIndex >= 0 && (
                                <div
                                    className="pointer-events-none absolute top-0 bottom-0 z-10 w-px bg-[#722ED1]"
                                    style={{
                                        left:
                                            TIMELINE_ACTIVITY_WIDTH +
                                            todayColumnIndex * TIMELINE_COLUMN_WIDTH +
                                            TIMELINE_COLUMN_WIDTH / 2,
                                    }}
                                />
                            )}

                            <div className="flex border-b border-[#E8EBF0] bg-[#FAFAFA]">
                                <div
                                    className="sticky left-0 z-20 shrink-0 border-r border-[#E8EBF0] bg-[#FAFAFA] px-4 py-3.5 text-sm font-semibold uppercase tracking-wide text-[#8C8C8C]"
                                    style={{ width: TIMELINE_ACTIVITY_WIDTH }}
                                >
                                    Activity
                                </div>

                                <div className="relative" style={{ width: gridWidth }}>
                                    <div className="flex">
                                        {columns.map((column) => {
                                            const columnKey = toTimelineDateKey(column);

                                            return (
                                                <div
                                                    key={columnKey}
                                                    className={`shrink-0 border-r border-[#E8EBF0] px-2 py-3.5 text-center text-sm font-medium ${
                                                        columnKey === todayKey
                                                            ? 'text-[#722ED1]'
                                                            : 'text-[#595959]'
                                                    }`}
                                                    style={{ width: TIMELINE_COLUMN_WIDTH }}
                                                >
                                                    {column.toLocaleDateString('en-GB', {
                                                        day: 'numeric',
                                                        month: 'short',
                                                    })}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>

                            <div className="relative">
                                <svg
                                    className="pointer-events-none absolute inset-0 z-[5]"
                                    style={{
                                        width: TIMELINE_ACTIVITY_WIDTH + gridWidth,
                                        height: bodyHeight,
                                    }}
                                >
                                    {visibleEvents.slice(1).map((event, index) => {
                                        const fromDateKey = getTimelineEventDateKey(
                                            visibleEvents[index].CreatedDate,
                                        );
                                        const toDateKey = getTimelineEventDateKey(
                                            event.CreatedDate,
                                        );
                                        const fromColumn = columns.findIndex(
                                            (column) =>
                                                toTimelineDateKey(column) === fromDateKey,
                                        );
                                        const toColumn = columns.findIndex(
                                            (column) =>
                                                toTimelineDateKey(column) === toDateKey,
                                        );

                                        if (fromColumn < 0 || toColumn < 0) return null;

                                        return (
                                            <line
                                                key={event.TaskTimelineId}
                                                x1={
                                                    TIMELINE_ACTIVITY_WIDTH +
                                                    fromColumn * TIMELINE_COLUMN_WIDTH +
                                                    TIMELINE_COLUMN_WIDTH / 2
                                                }
                                                y1={index * TIMELINE_ROW_HEIGHT + TIMELINE_ROW_HEIGHT / 2}
                                                x2={
                                                    TIMELINE_ACTIVITY_WIDTH +
                                                    toColumn * TIMELINE_COLUMN_WIDTH +
                                                    TIMELINE_COLUMN_WIDTH / 2
                                                }
                                                y2={(index + 1) * TIMELINE_ROW_HEIGHT + TIMELINE_ROW_HEIGHT / 2}
                                                stroke="#BFBFBF"
                                                strokeWidth="2"
                                                strokeDasharray="5 5"
                                            />
                                        );
                                    })}
                                </svg>

                                {visibleEvents.map((event) => {
                                    const dateKey = getTimelineEventDateKey(event.CreatedDate);
                                    const columnIndex = columns.findIndex(
                                        (column) => toTimelineDateKey(column) === dateKey,
                                    );
                                    const isSelected =
                                        selectedEvent?.TaskTimelineId === event.TaskTimelineId;
                                    const newSummary = getTimelineValueSummary(event.NewValue);
                                    const oldSummary = getTimelineValueSummary(event.OldValue);
                                    const summaryText =
                                        oldSummary && newSummary
                                            ? `${oldSummary} → ${newSummary}`
                                            : newSummary || oldSummary;

                                    return (
                                        <div
                                            key={event.TaskTimelineId}
                                            className={`flex border-b border-[#F0F0F0] last:border-b-0 ${
                                                isSelected ? 'bg-[#E6F4FF]' : ''
                                            }`}
                                            style={{ minHeight: TIMELINE_ROW_HEIGHT }}
                                        >
                                            <Button
                                                color="transparent"
                                                className={`sticky left-0 z-10 shrink-0 border-r border-[#F0F0F0] px-4 py-3 text-left transition-colors hover:bg-[#F5F5F5] ${
                                                    isSelected ? 'bg-[#E6F4FF]' : 'bg-white'
                                                }`}
                                                style={{
                                                    width: TIMELINE_ACTIVITY_WIDTH,
                                                    height: 'auto',
                                                    minHeight: TIMELINE_ROW_HEIGHT,
                                                    justifyContent: 'flex-start',
                                                    alignItems: 'flex-start',
                                                    padding: '16px',
                                                }}
                                                onClick={() => handleEventClick(event)}
                                            >
                                                <span className="block w-full text-left">
                                                    <p className="text-base font-medium text-[#262626]">
                                                        {event.ActivityTitle}
                                                    </p>
                                                    {summaryText ? (
                                                        <p className="mt-1 min-w-0 break-words text-sm text-[#1890FF] [overflow-wrap:anywhere] line-clamp-2">
                                                            {summaryText}
                                                        </p>
                                                    ) : null}
                                                    <p className="mt-1.5 text-xs text-[#8C8C8C]">
                                                        {dateKey
                                                            ? formatDate_dd_MonthName_yy(dateKey)
                                                            : '-'}
                                                    </p>
                                                </span>
                                            </Button>

                                            <div className="relative" style={{ width: gridWidth }}>
                                                <div className="flex h-full">
                                                    {columns.map((column, index) => (
                                                        <div
                                                            key={`${event.TaskTimelineId}-${toTimelineDateKey(column)}`}
                                                            className="relative flex shrink-0 items-center justify-center border-r border-[#F5F5F5] px-3 py-4"
                                                            style={{ width: TIMELINE_COLUMN_WIDTH }}
                                                        >
                                                            {index === columnIndex && (
                                                                <div
                                                                    role="button"
                                                                    tabIndex={0}
                                                                    onClick={() =>
                                                                        handleEventClick(event)
                                                                    }
                                                                    onKeyDown={(e) => {
                                                                        if (e.key === 'Enter' || e.key === ' ') {
                                                                            e.preventDefault();
                                                                            handleEventClick(event);
                                                                        }
                                                                    }}
                                                                    className={`inline-flex max-w-full cursor-pointer truncate rounded-full border px-3 py-1.5 text-sm font-semibold leading-5 transition-opacity hover:opacity-90 ${getTimelinePillClasses(event.ActivityType ?? '')}`}
                                                                >
                                                                    {event.ActivityTitle}
                                                                </div>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <Pagination pagination={timelinePaginationInfo} />

            {selectedEvent && (
                <Modal
                    isOpen={isDetailModalOpen}
                    onClose={closeDetailModal}
                    title={selectedEvent.ActivityTitle || ''}
                    size="md"
                    cancelText=""
                    saveText=""
                >
                    <div className="space-y-4 py-2">
                        {selectedEvent.OldValue ? (
                            <div className="space-y-3">
                                <h4 className="text-sm font-semibold text-gray-800">
                                    Previous Value
                                </h4>
                                {parseTimelineJson(selectedEvent.OldValue) ? (
                                    Object.entries(parseTimelineJson(selectedEvent.OldValue) ?? {}).map(([key, fieldValue]) => (
                                        <FieldItem key={key} label={key} isRow value={formatTimelineFieldValue(fieldValue)} />
                                    ))
                                ) : (
                                    <FieldItem label="Value" isRow value={selectedEvent.OldValue || '-'} />
                                )}
                            </div>
                        ) : null}

                        {selectedEvent.NewValue ? (
                            <div className="space-y-3">
                                <h4 className="text-sm font-semibold text-gray-800">
                                    Updated Value
                                </h4>
                                {parseTimelineJson(selectedEvent.NewValue) ? (
                                    Object.entries(parseTimelineJson(selectedEvent.NewValue) ?? {}).map(([key, fieldValue]) => (
                                        <FieldItem key={key} label={key} isRow value={formatTimelineFieldValue(fieldValue)} />
                                    ))
                                ) : (
                                    <FieldItem label="Value" isRow value={selectedEvent.NewValue || '-'} />
                                )}
                            </div>
                        ) : null}

                        <FieldItem
                            label="Created by"
                            isRow
                            value={
                                selectedEvent.CreatedByName ||
                                selectedEvent.CreatedBy ||
                                '-'
                            }
                        />
                        <FieldItem
                            label="Created Date"
                            isRow
                            value={
                                selectedEvent.CreatedDate
                                    ? formatDate_dd_MonthName_yy(selectedEvent.CreatedDate)
                                    : '-'
                            }
                        />
                    </div>
                </Modal>
            )}
        </div>
    );
};
