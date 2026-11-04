import React, { useEffect, useState } from "react";
import { ChevronDown, FileX2, Inbox } from "lucide-react";
import * as E from "fp-ts/Either";

import type { ContractRequisitionOverview, PullContractOverviewRequest } from "@/features/contractRequisition/models/ContractRequisitionModel";
import { useProject } from "@/features/projectMaster/context/ProjectContext";
import { useContractRequisitionListState } from "../context/ContractRequisitionListStateContext";
import { runApiWithLoader } from "@/core/utils";
import { contractRequisitionService } from "../services/ContractRequisitionService";
import MultiImageViewer from "@/ui/components/ImageViewer/ImageViewer";
import { parseDocumentUrls } from "@/core/utils/documentUtils";
import { FieldItem } from "@/ui/components/forms/FieldItem";
import { getNameInitials } from "@/core/utils/getNameInitials";
import { formatDate_dd_MonthName_yy } from "@/core/utils/dateFormat";
import { formatCurrency } from "@/core/utils/comman";

interface LevelTwoItem {
  id?: string | number;
  name?: string | null;
  description?: string | null;
  quantity?: number | null;
  unit?: string | null;
  rate?: number | null;
  amount?: number | null;
}

interface LevelOne {
  id?: string | number;
  name?: string | null;
  description?: string | null;
  children?: LevelTwoItem[] | null;
}

const EMPTY = "—";

const isNum = (v: unknown): v is number => typeof v === "number" && Number.isFinite(v);

const formatNumber = (v?: number | null) => (isNum(v) ? new Intl.NumberFormat("en-IN").format(v) : EMPTY);

const text = (v?: string | null) => (v && v.trim() ? v.trim() : EMPTY);

const percent = (part?: number | null, whole?: number | null) => {
  if (!isNum(part) || !isNum(whole) || whole <= 0) return null;
  return Math.max(0, Math.min(100, Math.round((part / whole) * 100)));
};

const statusStyles = (status?: string | null) => {
  const s = (status ?? "").toLowerCase().replace(/[\s_-]/g, "");
  if (s === "ongoing") return "bg-blue-50 text-blue-600 border-blue-100";
  if (s === "completed" || s === "approved") return "bg-emerald-50 text-emerald-700 border-emerald-100";
  if (s === "pending") return "bg-amber-50 text-amber-700 border-amber-100";
  if (s === "cancelled" || s === "rejected") return "bg-red-50 text-red-600 border-red-100";
  return "bg-slate-100 text-slate-600 border-slate-200";
};

const StatusBadge: React.FC<{ status?: string | null }> = ({ status }) => {
  if (!status || !status.trim()) return <>{EMPTY}</>;
  return (
    <span
      className={`inline-block rounded border px-2 py-0.5 text-[11px] font-medium capitalize ${statusStyles(status)}`}
    >
      {status.replace(/[_-]/g, " ").toLowerCase()}
    </span>
  );
};

const renderDocuments = (url: string | null | undefined, title: string) => {
  const docs = url && url.trim() ? parseDocumentUrls(url) : [];
  if (!docs || docs.length === 0) return <span className="text-slate-400">No document</span>;
  return <MultiImageViewer images={docs} title={title} triggerLabel="View" />;
};

const SectionCard: React.FC<{
  title: string;
  headerClass: string;
  titleClass: string;
  className?: string;
  right?: React.ReactNode;
  children: React.ReactNode;
}> = ({ title, headerClass, titleClass, className = "", right, children }) => (
  <section className={`overflow-hidden rounded-lg border border-slate-200 bg-white ${className}`}>
    <header className={`flex items-center justify-between px-4 py-2.5 ${headerClass}`}>
      <h3 className={`text-sm font-semibold ${titleClass}`}>{title}</h3>
      {right}
    </header>
    <div className="p-4">{children}</div>
  </section>
);

const EmptyState: React.FC<{ message: string; icon?: React.ReactNode }> = ({ message, icon }) => (
  <div className="flex flex-col items-center justify-center gap-2 rounded-md border border-dashed border-slate-200 bg-slate-50/60 px-4 py-6 text-center">
    <span className="text-slate-400">{icon ?? <Inbox className="h-5 w-5" aria-hidden />}</span>
    <p className="text-sm text-slate-500">{message}</p>
  </div>
);

const Stat: React.FC<{ label: string; value: string; className?: string; valueClass?: string; labelClass?: string }> = ({
  label,
  value,
  className = "border-slate-200 bg-slate-50",
  valueClass = "text-slate-900",
  labelClass = "text-slate-500",
}) => (
  <div className={`min-w-0 rounded-lg border px-3 py-3 text-center ${className}`}>
    <p className={`text-[11px] font-medium uppercase tracking-wide ${labelClass}`}>{label}</p>
    <p className={`mt-1.5 text-lg font-semibold wrap-break-word ${valueClass}`}>{value}</p>
  </div>
);

const LevelRow: React.FC<{
  index: number;
  level: LevelOne;
  open: boolean;
  onToggle: () => void;
}> = ({ index, level, open, onToggle }) => {
  const children = Array.isArray(level.children) ? level.children : [];
  const panelId = `contract-level-${level.id ?? index}`;

  return (
    <li className="rounded-lg border border-slate-200 bg-white">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        aria-controls={panelId}
        className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
      >
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-sky-50 text-[11px] font-medium text-sky-600">
          {String(index + 1).padStart(2, "0")}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-semibold text-slate-900">{text(level.name)}</span>
          {level.description ? (
            <span className="mt-0.5 block truncate text-xs text-slate-500">{level.description}</span>
          ) : null}
        </span>
        {children.length > 0 && (
          <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-[11px] text-slate-600">
            {children.length} {children.length === 1 ? "item" : "items"}
          </span>
        )}
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-slate-500 transition-transform duration-200 motion-reduce:transition-none ${open ? "rotate-180" : ""
            }`}
          aria-hidden
        />
      </button>

      <div
        id={panelId}
        role="region"
        className={`grid transition-[grid-template-rows] duration-200 motion-reduce:transition-none ${open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
          }`}
      >
        <div className="overflow-hidden">
          <div className="border-t border-slate-100 px-3 pb-3 pt-2">
            {children.length === 0 ? (
              <p className="py-3 text-center text-xs text-slate-500">No level 2 items under this level.</p>
            ) : (
              <ul className="divide-y divide-slate-100">
                {children.map((child, i) => (
                  <li key={child.id ?? i} className="flex items-start gap-3 py-2.5">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-sky-400" aria-hidden />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-slate-800">{text(child.name)}</p>
                      {child.description ? (
                        <p className="mt-0.5 line-clamp-2 text-xs text-slate-500">{child.description}</p>
                      ) : null}
                    </div>
                    <div className="shrink-0 text-right">
                      {(isNum(child.quantity) || child.unit) && (
                        <p className="text-xs text-slate-600">
                          {formatNumber(child.quantity)} {child.unit ?? ""}
                        </p>
                      )}
                      {isNum(child.amount) && (
                        <p className="mt-0.5 text-sm font-semibold text-slate-900">
                          {formatCurrency(child.amount)}
                        </p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </li>
  );
};

export const ContractOverview: React.FC = () => {
  const [_, setLoadingMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [contractRequisitionOverview, setContractRequisitionOverviewData] = useState<ContractRequisitionOverview | null>(null);
  const [openLevels, setOpenLevels] = useState<Set<number>>(new Set());

  const { projectId } = useProject();
  const { listState } = useContractRequisitionListState();
  const { ContractRequisitionId } = listState;

  useEffect(() => {
    if (!projectId || !ContractRequisitionId || ContractRequisitionId === 0) return;
    loadContractOverView();
  }, [projectId, ContractRequisitionId]);

  const loadContractOverView = async () => {
    runApiWithLoader(setIsLoading, setLoadingMessage, async () => {
      const params: PullContractOverviewRequest = {
        ProjectId: Number(projectId),
        ContractRequisitionId: ContractRequisitionId,
      };

      const response = await contractRequisitionService.apiCallPullContractRequisitionOverview(params);

      if (E.isRight(response)) {
        const data = response.right.Data;
        const item = Array.isArray(data) ? data[0] : data;
        setContractRequisitionOverviewData(item ?? null);
      } else {
        setContractRequisitionOverviewData(null);
      }
      return response;
    });
  };

  const toggleLevel = (i: number) =>
    setOpenLevels((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });

  if (!contractRequisitionOverview) {
    if (isLoading) return null;
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-8">
        <EmptyState message="No contract details available." icon={<FileX2 className="h-6 w-6" aria-hidden />} />
      </div>
    );
  }

  const levelList: any[] = [];

  const totalFinalized = contractRequisitionOverview.TotalFinalizedAmount;
  const invoiced = contractRequisitionOverview.TotalInvoiceAmount;
  const paid = contractRequisitionOverview.InvoicePaidAmount;
  const outstanding = contractRequisitionOverview.OutstandingAmount;
  const invoiceCount = isNum(contractRequisitionOverview.TotalInvoiceCount) ? contractRequisitionOverview.TotalInvoiceCount : 0;

  const hasAmounts = [totalFinalized, invoiced, paid, outstanding].some(isNum);
  const invoicedPct = percent(invoiced, totalFinalized);
  const pendingPct = invoicedPct === null ? null : 100 - invoicedPct;
  const hasLastInvoice = !!contractRequisitionOverview.LastInvoiceNumber?.trim();

  return (
    <div className="space-y-4 text-slate-900">
      <SectionCard
        title="Contract Overview"
        headerClass="bg-[#E7F2FF]"
        titleClass="text-[#1D4ED8]"
        right={
          contractRequisitionOverview.ContractType ? (
            <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-[11px] font-medium text-blue-700">
              {contractRequisitionOverview.ContractType}
            </span>
          ) : null
        }
      >
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <FieldItem label="Contract Code" value={contractRequisitionOverview.SystemGeneratedCode} />
          <FieldItem label="Status" value={<StatusBadge status={contractRequisitionOverview.ContractRequisitionStatus} />} />
          <FieldItem label="Estimated Start Date" value={formatDate_dd_MonthName_yy(contractRequisitionOverview.EstimatedDate)} />
          <FieldItem label="Document" value={renderDocuments(contractRequisitionOverview.AttachmentsURL, "Contract Document")} />
        </div>
        <div className="mt-4">
          <FieldItem label="Remark" value={contractRequisitionOverview.ContractRemark} />
        </div>
      </SectionCard>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,5fr)_minmax(0,3fr)]">
        <div className="space-y-4">
          <SectionCard title="BOQ Summary" headerClass="bg-[#FFFFE4]" titleClass="text-[#7B6B28]">
            {(contractRequisitionOverview as any)?.boq ? (
              <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                <Stat label="Categories" value={formatNumber((contractRequisitionOverview as any).boq.categories)} />
                <Stat label="Items" value={formatNumber((contractRequisitionOverview as any).boq.items)} />
                <Stat label="Total Qty" value={formatNumber((contractRequisitionOverview as any).boq.totalQty)} />
                <Stat
                  label="Total BOQ Value"
                  value={formatCurrency((contractRequisitionOverview as any).boq.totalValue)}
                  className="border-amber-300 bg-amber-50"
                  labelClass="text-amber-800"
                  valueClass="text-slate-900"
                />
              </div>
            ) : (
              <EmptyState message="BOQ summary is not available yet." />
            )}
          </SectionCard>
          <SectionCard
            title={`Contract Levels (${levelList.length})`}
            headerClass="bg-[#EAFCFF]"
            titleClass="text-[#12A3DD]"
          >
            {levelList.length === 0 ? (
              <EmptyState message="No contract levels have been added." />
            ) : (
              <ul className="space-y-3">
                {levelList.map((level, i) => (
                  <LevelRow
                    key={level.id ?? i}
                    index={i}
                    level={level}
                    open={openLevels.has(i)}
                    onToggle={() => toggleLevel(i)}
                  />
                ))}
              </ul>
            )}
          </SectionCard>
        </div>

        <div className="space-y-4">
          <SectionCard title="Finalized Vendor" headerClass="bg-[#F3F0FE]" titleClass="text-[finalized vendor]">
            {contractRequisitionOverview.FinalVendorCompanyName && contractRequisitionOverview.FinalizedVendor ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#B641E1] bg-[#DCDBFA] text-sm font-semibold text-[#B641E1]">
                    {getNameInitials(contractRequisitionOverview.FinalVendorCompanyName)}
                  </span>
                  <p className="min-w-0 wrap-break-word text-sm font-semibold text-slate-900">
                    {contractRequisitionOverview.FinalVendorCompanyName}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <FieldItem label="Vendor Name" value={contractRequisitionOverview.FinalizedVendor} />
                  <FieldItem label="Vendor ID" value={contractRequisitionOverview.VendorCode} />
                </div>
                <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2.5">
                  <FieldItem label="Finalized Amount" value={formatCurrency(contractRequisitionOverview.TotalFinalizedAmount)} />
                </div>
              </div>
            ) : (
              <EmptyState message="No vendor has been finalized yet." />
            )}
          </SectionCard>

          <SectionCard title="Work Order" headerClass="bg-[#E6FFE6]" titleClass="text-[#00A800]">
            {contractRequisitionOverview.ContractRequisitionWorkOrderURL ? (
              <div className="grid grid-cols-2 gap-4">
                <FieldItem
                  label="Work Order Document"
                  value={renderDocuments(contractRequisitionOverview.ContractRequisitionWorkOrderURL, "Work Order Document")}
                />
                <FieldItem label="Date" value={formatDate_dd_MonthName_yy(contractRequisitionOverview?.WorkOrderCreatedDate ? contractRequisitionOverview.WorkOrderCreatedDate : "")} />
              </div>
            ) : (
              <EmptyState message="No work order has been issued." />
            )}
          </SectionCard>
        </div>
      </div>

      <SectionCard
        title={`Invoices (${invoiceCount})`}
        headerClass="bg-[#F6F9FF]"
        titleClass="text-[#13367A]"
      >
        {!hasAmounts && invoiceCount === 0 ? (
          <EmptyState message="No invoices have been generated for this contract." />
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              <Stat label="Total Finalised Amount" value={formatCurrency(totalFinalized)} />
              <Stat label="Invoiced" value={formatCurrency(invoiced)} />
              <Stat
                label="Paid"
                value={formatCurrency(paid)}
                className="border-emerald-200 bg-emerald-50"
                labelClass="text-emerald-800"
                valueClass="text-emerald-800"
              />
              <Stat
                label="Outstanding"
                value={formatCurrency(outstanding)}
                className="border-amber-200 bg-amber-50"
                labelClass="text-amber-800"
                valueClass="text-amber-800"
              />
            </div>

            <div>
              <div
                className="flex h-2 w-full overflow-hidden rounded-full bg-slate-200"
                role="progressbar"
                aria-label="Invoiced share of finalised amount"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={invoicedPct ?? 0}
              >
                {invoicedPct !== null && (
                  <>
                    <div className="bg-emerald-500" style={{ width: `${invoicedPct}%` }} />
                    <div className="bg-amber-400" style={{ width: `${pendingPct}%` }} />
                  </>
                )}
              </div>
              <div className="mt-1.5 flex items-center justify-between text-[11px] text-slate-500">
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" aria-hidden />
                  {invoicedPct === null ? EMPTY : `${invoicedPct}%`} Invoiced
                </span>
                <span className="inline-flex items-center gap-1.5">
                  {pendingPct === null ? EMPTY : `${pendingPct}%`} Pending Invoice
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-400" aria-hidden />
                </span>
              </div>
            </div>

            {hasLastInvoice ? (
              <div className="rounded-md border-l-4 border-indigo-500 bg-slate-50 px-3 py-2.5">
                <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
                  Last Generated Invoice
                </p>
                <div className="mt-1 flex flex-wrap items-center gap-x-6 gap-y-1 text-sm">
                  <span className="font-medium text-slate-900">{text(contractRequisitionOverview.LastInvoiceNumber)}</span>
                  <span className="font-medium text-indigo-600">{formatCurrency(contractRequisitionOverview.LastInvoiceAmount)}</span>
                  <span className="text-slate-600">{formatDate_dd_MonthName_yy(contractRequisitionOverview?.LastInvoiceDate ? contractRequisitionOverview.LastInvoiceDate : "")}</span>
                  {contractRequisitionOverview.LastInvoiceApprovalStatus ? <StatusBadge status={contractRequisitionOverview.LastInvoiceApprovalStatus} /> : null}
                  {contractRequisitionOverview.LastInvoiceDocumentURL
                    ? renderDocuments(contractRequisitionOverview.LastInvoiceDocumentURL, "Invoice Document")
                    : null}
                </div>
              </div>
            ) : (
              <p className="rounded-md bg-slate-50 px-3 py-2.5 text-xs text-slate-500">
                No invoice has been generated yet.
              </p>
            )}
          </div>
        )}
      </SectionCard>

      <SectionCard title="Action Details" headerClass="bg-[#FBF9F9]" titleClass="text-[#1D1D1D]">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <FieldItem label="Created By" value={contractRequisitionOverview.CreatedBy} />
          <FieldItem label="Created Date" value={formatDate_dd_MonthName_yy(contractRequisitionOverview.CreatedDate)} />
          <FieldItem label="Modified By" value={contractRequisitionOverview.ModifiedBy} />
          <FieldItem label="Modified Date" value={formatDate_dd_MonthName_yy(contractRequisitionOverview.ModifiedDate)} />
        </div>
      </SectionCard>
    </div>
  );
};