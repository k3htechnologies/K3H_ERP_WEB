import React, { useState } from "react";
import { ChevronDown, ChevronLeft, ChevronRight, ChevronUp } from "lucide-react";
import NoDataView from "@/ui/components/NoDataView/NoDataView";

export interface CardPaginationInfo {
  currentPage: number;
  totalPages: number;
  totalRecords: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

export interface CardColumn {
  key: string;
  label?: string;
  render?: (value: any, row: any, index: number) => React.ReactNode;
}

interface Props {
  data: any[];

  loading?: boolean;

  pagination?: CardPaginationInfo;

  emptyMessage?: string;

  className?: string;

  fetchExpandedData?: (row: any) => Promise<any>;

  renderExpanded?: (
    expandedData: any,
    row: any
  ) => React.ReactNode;

  header?: (row: any) => React.ReactNode;

  columns?: CardColumn[];
}

export const PaginationCardView: React.FC<Props> = ({
  data,
  loading = false,
  pagination,
  emptyMessage = "No data available",
  className = "",
  fetchExpandedData,
  renderExpanded,
  header,
  columns = [],
}) => {
  const [expandedCard, setExpandedCard] = useState<number | null>(null);

  const [expandedData, setExpandedData] = useState<Record<number, any>>({});

  const [loadingCard, setLoadingCard] = useState<number | null>(null);

  const handleExpand = async (row: any, index: number) => {

    if (expandedCard === index) {
      setExpandedCard(null);
      return;
    }

    setExpandedCard(index);

    if (expandedData[index]) return;

    if (!fetchExpandedData) return;

    try {

      setLoadingCard(index);

      const response =
        await fetchExpandedData(row);

      setExpandedData(prev => ({
        ...prev,
        [index]: response,
      }));
    } finally {
      setLoadingCard(null);
    }
  };

  const renderPagination = () => {
    if (!pagination) return null;

    const {
      currentPage,
      totalPages,
      totalRecords,
      pageSize,
      onPageChange,
    } = pagination;

    const startRecord = totalRecords === 0 ? 0 : (currentPage - 1) * pageSize + 1;

    const endRecord = Math.min(currentPage * pageSize, totalRecords);

    return (
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2 px-4 py-2 bg-white border-t border-gray-200">

        <div className="text-sm text-gray-700">
          Showing {startRecord} to {endRecord} of{" "}
          {totalRecords} entries
        </div>

        <div className="flex items-center space-x-2">

          <button
            onClick={() =>
              onPageChange(currentPage - 1)
            }
            disabled={currentPage === 1}
            className="p-2 border border-gray-200 rounded"
          >
            <ChevronLeft size={16} />
          </button>

          {Array.from({
            length: totalPages,
          }).map((_, i) => (
            <button
              key={i}
              onClick={() =>
                onPageChange(i + 1)
              }
              className={`px-3 py-1 rounded ${currentPage === i + 1 ? "bg-blue-500 text-white" : "hover:bg-gray-100"}`}
            >
              {i + 1}
            </button>
          ))}

          <button
            onClick={() =>
              onPageChange(currentPage + 1)
            }
            disabled={
              currentPage === totalPages
            }
            className="p-2 border border-gray-200 rounded"
          >
            <ChevronRight size={16} />
          </button>

        </div>
      </div>
    );
  };

  return (
    <div className={`bg-white rounded-lg flex flex-col ${className}`}>

      <div className="space-y-4">

        {!loading && data.length === 0 ? (
          <NoDataView message={emptyMessage} />
        ) : (

          data.map((row, index) => (

            <div key={index} className="border border-gray-200 rounded-xl p-4 bg-white shadow-sm">

              <div className="flex">

                <button
                  onClick={() => handleExpand(row, index)}
                  className="w-6 h-6 flex items-center justify-center rounded-md bg-blue-200 hover:bg-blue-200 transition"

                >
                  {expandedCard === index ? (

                    <ChevronDown size={18} className="text-black-600" />
                  ) : (
                    <ChevronUp size={18} className="text-black-600" />
                  )}
                </button>

                <div className="pl-2 flex-1 w-full">
                  {header?.(row)}
                </div>
              </div>

              {/* BODY */}

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

                {columns.map(col => (
                  <div key={col.key}>
                    <div className="text-xs text-gray-500">
                      {col.label}
                    </div>

                    <div className="font-medium">
                      {col.render ? col.render(row[col.key], row, index) : row[col.key]}
                    </div>
                  </div>
                ))}

              </div>

              {/* EXPANDED */}

              {expandedCard === index && (
                <div className="mt-2 pt-2">

                  {loadingCard === index ? (
                    <div className="text-sm text-gray-500"> </div>
                  ) : (

                    renderExpanded?.(expandedData[index], row)
                  )}

                </div>
              )}
            </div>
          ))
        )}
      </div>

      {pagination && renderPagination()}
    </div>
  );
};