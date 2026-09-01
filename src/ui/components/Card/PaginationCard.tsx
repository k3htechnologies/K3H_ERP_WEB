import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import NoDataView from "@/ui/components/NoDataView/NoDataView";
import { useViewportHeight } from "@/core/utils/useViewportHeight";

export interface CardPaginationInfo {
    currentPage: number;
    totalPages: number;
    totalRecords: number;
    pageSize: number;
    onPageChange: (page: number) => void;
}

export interface CardColumn {
    key: string;
    label: string;
    render?: (value: any, row: any, index: number) => React.ReactNode;
}

interface Props {
    data: any[];
    loading?: boolean;
    pagination?: CardPaginationInfo;
    emptyMessage?: string;
    className?: string;
    header?: (row: any, index: number) => React.ReactNode;
    footer?: (row: any, index: number) => React.ReactNode;
    maxHeight?: string;
    rowKey?: string;
    selectedRowKey?: string | number | null;
    onRowClick?: (row: any) => void;
    isUsedForOther?: boolean;
}

const PaginationCard: React.FC<Props> = ({
    data,
    loading = false,
    pagination,
    emptyMessage = "No data available",
    className = "",
    header,
    maxHeight = useViewportHeight(255, 350, 900),
    rowKey = "BookingId",
    selectedRowKey,
    onRowClick,
    isUsedForOther = true
}) => {


    const renderPagination = () => {
    if (!pagination) return null;

    const {
        currentPage,
        totalPages,
        totalRecords,
        pageSize,
        onPageChange,
    } = pagination;

    if (totalRecords === 0) return null;

    const startRecord = (currentPage - 1) * pageSize + 1;
    const endRecord = Math.min(
        currentPage * pageSize,
        totalRecords
    );

    const getPageNumbers = () => {
        const pages: (number | string)[] = [];

        // Small number of pages
        if (totalPages <= 7) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }

            return pages;
        }

        // Beginning
        if (currentPage <= 4) {
            pages.push(1, 2, 3, 4, 5);
            pages.push("...");
            pages.push(totalPages);

            return pages;
        }

        // End
        if (currentPage >= totalPages - 3) {
            pages.push(1);
            pages.push("...");

            for (
                let i = totalPages - 4;
                i <= totalPages;
                i++
            ) {
                pages.push(i);
            }

            return pages;
        }

        // Middle
        pages.push(1);
        pages.push("...");
        pages.push(
            currentPage - 1,
            currentPage,
            currentPage + 1
        );
        pages.push("...");
        pages.push(totalPages);

        return pages;
    };

    const pageNumbers = getPageNumbers();

    return (
        <div
            className={`flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 ${
                isUsedForOther ? "bg-white" : ""
            }`}
        >
            {/* Records information */}
            <div className="text-sm text-gray-700">
                    Showing {startRecord} to {endRecord} of{" "}
                    {totalRecords} entries 
                </div>

            {/* Pagination */}
            <div className="flex items-center gap-1">

                {/* Previous */}
                <button
                    type="button"
                    onClick={() =>
                        onPageChange(currentPage - 1)
                    }
                    disabled={currentPage === 1}
                    className="p-2 border border-gray-200 rounded-md
                        disabled:opacity-40
                        disabled:cursor-not-allowed
                        hover:bg-gray-100"
                >
                    <ChevronLeft size={16} />
                </button>

                {/* Page numbers */}
                {pageNumbers.map((page, index) => {

                    if (page === "...") {
                        return (
                            <span
                                key={`ellipsis-${index}`}
                                className="px-2 py-1 text-gray-500"
                            >
                                ...
                            </span>
                        );
                    }

                    return (
                        <button
                            type="button"
                            key={page}
                            onClick={() =>
                                onPageChange(page as number)
                            }
                            className={`min-w-[32px] px-2 py-1 rounded-md text-sm
                                ${
                                    currentPage === page
                                        ? "bg-blue-500 text-white"
                                        : "hover:bg-gray-100 text-gray-700"
                                }`}
                        >
                            {page}
                        </button>
                    );
                })}

                {/* Next */}
                <button
                    type="button"
                    onClick={() =>
                        onPageChange(currentPage + 1)
                    }
                    disabled={
                        currentPage === totalPages ||
                        totalPages === 0
                    }
                    className="p-2 border border-gray-200 rounded-md
                        disabled:opacity-40
                        disabled:cursor-not-allowed
                        hover:bg-gray-100"
                >
                    <ChevronRight size={16} />
                </button>
            </div>
        </div>
    );
};
    // const renderPagination = () => {
    //     if (!pagination) return null;

    //     const {
    //         currentPage,
    //         totalPages,
    //         totalRecords,
    //         pageSize,
    //         onPageChange,
    //     } = pagination;

    //     const startRecord = totalRecords === 0 ? 0 : (currentPage - 1) * pageSize + 1;

    //     const endRecord = Math.min(currentPage * pageSize, totalRecords);

    //     return (
    //         <div className={`flex flex-col sm:flex-row items-center justify-between gap-2 px-4 py-2 ${isUsedForOther && "bg-white"}`}>

    //             <div className="text-sm text-gray-700">
    //                 Showing {startRecord} to {endRecord} of{" "}
    //                 {totalRecords} entries 
    //             </div>

    //             <div className="flex items-center space-x-2">

    //                 <button
    //                     onClick={() =>
    //                         onPageChange(currentPage - 1)
    //                     }
    //                     disabled={currentPage === 1}
    //                     className="p-2 border border-gray-200 rounded"
    //                 >
    //                     <ChevronLeft size={16} />
    //                 </button>

    //                 {Array.from({
    //                     length: totalPages,
    //                 }).map((_, i) => (
    //                     <button
    //                         key={i}
    //                         onClick={() =>
    //                             onPageChange(i + 1)
    //                         }
    //                         className={`px-3 py-1 rounded ${currentPage === i + 1 ? "bg-blue-500 text-white" : "hover:bg-gray-100"}`}
    //                     >
    //                         {i + 1}
    //                     </button>
    //                 ))}

    //                 <button
    //                     onClick={() =>
    //                         onPageChange(currentPage + 1)
    //                     }
    //                     disabled={
    //                         currentPage === totalPages
    //                     }
    //                     className="p-2 border border-gray-200 rounded"
    //                 >
    //                     <ChevronRight size={16} />
    //                 </button>

    //             </div>
    //         </div>
    //     );
    // };

    return (
        <div className={`rounded-lg  flex flex-col ${className}`}>

            <div className="flex-1 overflow-y-auto thin-scroll space-y-4 pr-1" style={{ maxHeight }}>

                {!loading && data.length === 0 ? (

                    <section className="bg-white rounded-xl p-6 border-[0.1px] border-[#3333334f]">
                        <NoDataView message={emptyMessage} />
                    </section>

                ) : (
                    data.map((row, index) => {

                        const isSelected = selectedRowKey === row[rowKey];
                        if (isUsedForOther) {
                            return (

                                <div
                                    key={row[rowKey] ?? index}
                                    onClick={() => onRowClick?.(row)}
                                    className={`relative rounded-xl border p-2 transition-all duration-200 cursor-pointer
                                    ${isSelected ? "bg-[#EDF5FF] border-[#EDF5FF]" : "bg-white border border-transparent"}`}>
                                    {header?.(row, index)}

                                    {index !== data.length - 1 && (
                                        <div className="absolute bottom-0 left-4 right-4 border-b border-[#ECECEC]" />
                                    )}

                                </div>

                            );
                        }
                        else {

                            return (

                                <div
                                    key={row[rowKey] ?? index}
                                    onClick={() => onRowClick?.(row)}
                                    className={`relative rounded-xl transition-all duration-200 cursor-pointer`}>
                                    {header?.(row, index)}
                                </div>

                            );

                        }
                    })
                )}
            </div>
            {pagination && renderPagination()}
        </div>
    );
};

export default PaginationCard;