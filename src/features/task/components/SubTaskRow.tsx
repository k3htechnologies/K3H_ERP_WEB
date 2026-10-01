import { Calendar, MessageSquare, MoreVertical } from 'lucide-react';
import { formatDate_dd_MonthName_yy } from '@/core/utils/dateFormat';
import { getNameInitials } from '@/core/utils/getNameInitials';
import { getTaskStatusColor } from '@/features/task/utils/taskUtils';
import { Button } from '@/ui/components/forms';

interface Props {
    title: string;
    statusLabel: string;
    dueDate?: string | null;
    assigneeName?: string;
    commentCount?: number;
    onMenuClick?: () => void;
}

export const SubTaskRow: React.FC<Props> = ({ title, statusLabel, dueDate, assigneeName, commentCount, onMenuClick }) => {
    const statusColors = statusLabel && statusLabel !== '-' ? getTaskStatusColor(statusLabel) : null;

    return (
        <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 p-3">
            <div className="min-w-0 flex-1">
                <p className="font-semibold text-gray-800">{title}</p>
            </div>
            {assigneeName && (
                <div className="hidden shrink-0 items-center gap-2 sm:flex">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full border border-gray-300 bg-blue-100 text-[10px] font-medium text-gray-800">
                        {getNameInitials(assigneeName)}
                    </div>
                    <span className="text-sm text-gray-800">{assigneeName}</span>
                </div>
            )}
            {dueDate && (
                <div className="hidden shrink-0 items-center gap-1.5 text-sm text-gray-500 md:flex">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>{formatDate_dd_MonthName_yy(dueDate)}</span>
                </div>
            )}
            {statusColors && (
                <span
                    className="inline-block px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap"
                    style={{ backgroundColor: statusColors.bg, color: statusColors.text }}
                >
                    {statusLabel}
                </span>
            )}
            <div className="flex shrink-0 items-center gap-1 text-sm text-gray-500">
                <MessageSquare className="h-3.5 w-3.5" />
                <span>{commentCount ?? 0}</span>
            </div>
            {onMenuClick && (
                <Button
                    color="transparent"
                    size="sm"
                    isborderRadius
                    className="shrink-0"
                    title="Sub-task actions"
                    onClick={onMenuClick}
                    leftIcon={<MoreVertical className="h-4 w-4 text-gray-400" />}
                />
            )}
        </div>
    );
};
