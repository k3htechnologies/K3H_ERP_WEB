import React, { useMemo } from 'react';
import { DataTable, type PaginationInfo, type SortInfo, type TableColumn } from '@/ui/components/DataTable/DataTable';
import TooltipText from '@/ui/components/Tooltip/TooltipText';
import { Bell, LogIn, LogOut, Trash2 } from 'lucide-react';
import { Button } from '@/ui/components/forms';
import type { GatePassData } from '@/features/gatePass/models/GatePassModel';
import { formatDate_dd_MonthName_yy_hh_mm } from '@/core/utils/dateFormat';
import FieldInfoTooltip from '@/ui/components/forms/FieldInfoTooltip';
import { getStatusColor } from '../utils/Status';
import { getNameInitials } from '@/core/utils/getNameInitials';

interface GetPassTableProps {
    data: GatePassData[];
    columns: TableColumn[];
    pagination: PaginationInfo;
    sortInfo?: SortInfo;
    onSort: (sort: SortInfo) => void;
    onView: (row: GatePassData) => void;
    onEdit: (row: GatePassData) => void;
    onDelete: (row: GatePassData) => void;
    onLogin?: (row: GatePassData) => void;
    onLogout: (row: GatePassData) => void;
    onBell: (row: GatePassData) => void;
    canAction: boolean;
    loading: boolean;
    lastUpdatedRow?: string | number | null;
}

export const GatePassTable: React.FC<GetPassTableProps> = ({
    data,
    columns,
    pagination,
    sortInfo,
    onSort,
    onView,
    onDelete,
    onLogin,
    onLogout,
    onBell,
    canAction,
    loading,
    lastUpdatedRow
}) => {

    const tableColumns = useMemo<TableColumn[]>(() => {

        return columns.map(col => {

            if (col.key === 'Actions') {
                return {
                    ...col,

                    render: (_value: any, row: GatePassData) => {

                        const isDeleteDisabled = !canAction || !row.IsDelete;
                        const isInDisabled = !row?.IsApproval;
                        const isOutDisabled = !row?.IsCheckOutEnabled;
                        const isBellDisabled = !(row?.IsNoticationEnabled ?? row?.IsNotificationEnabled);

                        return (
                            <div className="flex items-center justify-center gap-2">

                                <Button
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();

                                        if (isDeleteDisabled) return;

                                        onDelete(row);
                                    }}
                                    color="transparent"
                                    isborderRadius
                                    disabled={isDeleteDisabled}
                                    size="sm"
                                    style={{
                                        color: isDeleteDisabled ? "#9CA3AF" : "red",
                                        padding: "4px 8px",
                                        cursor: isDeleteDisabled
                                            ? "not-allowed"
                                            : "pointer",
                                        opacity: isDeleteDisabled ? 0.5 : 1,
                                    }}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>

                                <Button
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();

                                        if (isInDisabled) return;

                                        onLogin?.(row);
                                    }}
                                    color="transparent"
                                    isborderRadius
                                    disabled={isInDisabled}
                                    size="sm"
                                    style={{
                                        color: isInDisabled ? "#9CA3AF" : "#16A34A", 
                                        padding: "4px 8px",
                                        cursor: isInDisabled
                                            ? "not-allowed"
                                            : "pointer",
                                        opacity: isInDisabled ? 0.5 : 1,
                                    }}
                                >
                                    <LogIn className="h-4 w-4" />
                                </Button>

                                <Button
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();

                                        if (isOutDisabled) return;

                                        onLogout(row);
                                    }}
                                    color="transparent"
                                    isborderRadius
                                    disabled={isOutDisabled}
                                    size="sm"
                                    style={{
                                        color: isOutDisabled ? "#9CA3AF" : "red",
                                        padding: "4px 8px",
                                        cursor: isOutDisabled
                                            ? "not-allowed"
                                            : "pointer",
                                        opacity: isOutDisabled ? 0.5 : 1,
                                    }}
                                >
                                    <LogOut className="h-4 w-4" />
                                </Button>

                                <Button
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();

                                        if (isBellDisabled) return;

                                        onBell(row);
                                    }}
                                    color="transparent"
                                    isborderRadius
                                    disabled={isBellDisabled}
                                    size="sm"
                                    style={{
                                        color: isBellDisabled ? "#9CA3AF" : "red",
                                        padding: "4px 8px",
                                        cursor: isBellDisabled
                                            ? "not-allowed"
                                            : "pointer",
                                        opacity: isBellDisabled ? 0.5 : 1,
                                    }}
                                >
                                    <Bell className="h-4 w-4" />
                                </Button>

                            </div>
                        );
                    },
                };
            }

            if (col.key === "FullName") {
                return {
                    ...col,
                    render: (value, row) => {

                        const fullName = (row?.FullName ?? "").trim();

                        const initials = getNameInitials(fullName);

                        const profilePhotoURL = row?.PhotoURL;

                        const hasProfile =
                            profilePhotoURL &&
                            profilePhotoURL !== "" &&
                            profilePhotoURL !== "—";

                        const displayName = value
                            ? `${value}${Number(row.NoOfParticipants) > 0 ? ` +${row.NoOfParticipants}` : ""}`
                            : "-";

                        return (
                            <div className={`flex items-center ${canAction ? "justify-between" : "justify-start"} gap-3`}>
                                <div className="flex items-center gap-3 min-w-0">
                                    {hasProfile ? (
                                        <img
                                            src={profilePhotoURL}
                                            alt={fullName}
                                            className="w-7 h-7 rounded-full object-cover border border-gray-300 shrink-0"
                                        />
                                    ) : (
                                        <div
                                            className="w-7 h-7 rounded-full
                                            bg-blue-200
                                            flex items-center justify-center
                                            text-gray-800 font-medium text-xs
                                            border border-gray-300 shrink-0"
                                            title={fullName || "-"}
                                        >
                                            {initials}
                                        </div>
                                    )}

                                    <TooltipText
                                        text={displayName}
                                        maxWidth="300px"
                                        tooltipThreshold={40}
                                        onClick={() => onView(row)}
                                    />


                                </div>
                            </div>
                        );
                    },
                };
            }

            if (col.key === 'PassDateTime') {
                return {
                    ...col,
                    render: (_value: any, row: GatePassData) => (
                        <span>{formatDate_dd_MonthName_yy_hh_mm(row.PassDateTime)}</span>
                    ),
                };
            }

            if (col.key === 'ApprovalStatus') {
                return {
                    ...col,
                    render: (value: any, row: GatePassData) => {
                        const status = String(value || row?.ApprovalStatus || '').trim();
                        const approvalRemark = row?.ApprovalRemark ? String(row.ApprovalRemark).trim() : '';

                        if (!status) {
                            return (
                                <div className="flex items-center gap-1.5 whitespace-nowrap">
                                    <span className="text-gray-400">-</span>
                                    {approvalRemark && (
                                        <FieldInfoTooltip value={approvalRemark} />
                                    )}
                                </div>
                            );
                        }

                        const upper = status.toUpperCase();
                        let badgeClass = 'bg-gray-100 text-gray-700';

                        if (upper.includes('PENDING')) {
                            badgeClass = 'bg-orange-100 text-orange-700';
                        } else if (upper.includes('APPROV') || upper === 'ACCEPT') {
                            badgeClass = 'bg-green-100 text-green-700';
                        } else if (upper.includes('REJECT')) {
                            badgeClass = 'bg-red-100 text-red-700';
                        }

                        return (
                            <div className="flex items-center gap-1.5 whitespace-nowrap">
                                <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${badgeClass}`}>
                                    {status}
                                </span>
                                {approvalRemark && (
                                    <FieldInfoTooltip value={approvalRemark} />
                                )}
                            </div>
                        );
                    },
                };
            }

            if (col.key === 'OutDateTime') {
                return {
                    ...col,
                    render: (_value: any, row: GatePassData) => (
                        <span>{formatDate_dd_MonthName_yy_hh_mm(row.OutDateTime)}</span>
                    ),
                };
            }

            if (col.key === 'Address') {
                return {
                    ...col,
                    render: (value) => (
                        <div className={`flex items-center ${canAction ? 'justify-between' : 'justify-start'}`}>
                            <TooltipText
                                text={value || '-'}
                                maxWidth="300px"
                                tooltipThreshold={40}
                            />
                        </div>
                    )
                };
            }

            if (col.key === 'Remark') {
                return {
                    ...col,
                    render: (value: any) => (
                        <FieldInfoTooltip value={value} />
                    ),
                };
            }


            if (col.key === 'MobileNumber') {
                return {
                    ...col,
                    render: (value: any) => (
                        <span>
                            {value ? `+91 ${value}` : '-'}
                        </span>
                    ),
                };
            }

            if (col.key === 'Purpose') {
                return {
                    ...col,
                    render: (value) => {
                        const { bg, text } = getStatusColor(value);

                        return (
                            <span
                                className="inline-block px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap"
                                style={{
                                    backgroundColor: bg,
                                    color: text
                                }}
                            >
                                {value || "-"}
                            </span>
                        );
                    }
                };
            }



            return col;
        });

    }, [columns, canAction, onView, onDelete]);

    return (
        <DataTable
            data={data}
            columns={tableColumns}
            pagination={pagination}
            rowKey="ExternalId"
            emptyMessage="No Gate Pass Data Found"
            fixedHeight={true}
            recordsPerPage={20}
            className="flex-1"
            sortInfo={sortInfo}
            onSort={onSort}
            loading={loading}
            lastUpdatedRow={lastUpdatedRow}
        />
    );
};

