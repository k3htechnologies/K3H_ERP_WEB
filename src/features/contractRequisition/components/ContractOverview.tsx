import React, { useState } from "react";
import { ChevronDown, Eye, FileX2, Inbox } from "lucide-react";

import type { ContractRequisitionData } from "@/features/contractRequisition/models/ContractRequisitionModel";

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

interface ContractView {
  contractCode?: string | null;
  status?: string | null;
  contractType?: string | null; // "Direct" badge
  estimatedStartDate?: string | null;
  documentUrl?: string | null;
  remark?: string | null;

  boq?: {
    categories?: number | null;
    items?: number | null;
    totalQty?: number | null;
    totalValue?: number | null;
  } | null;

  levels?: LevelOne[] | null;

  vendor?: {
    companyName?: string | null;
    contactName?: string | null;
    vendorId?: string | null;
    finalizedAmount?: number | null;
  } | null;

  workOrder?: {
    documentUrl?: string | null;
    date?: string | null;
    remark?: string | null;
  } | null;

  invoices?: {
    count?: number | null;
    totalFinalised?: number | null;
    invoiced?: number | null;
    paid?: number | null;
    outstanding?: number | null;
    last?: {
      number?: string | null;
      amount?: number | null;
      date?: string | null;
    } | null;
  } | null;

  audit?: {
    createdBy?: string | null;
    createdDate?: string | null;
    modifiedBy?: string | null;
    modifiedDate?: string | null;
  } | null;
}

/** Single place to map API data -> view model. Edit field names here. */
const toViewModel = (data: ContractRequisitionData | null): ContractView | null => {
  if (!data) return null;
  // Replace this cast with explicit field mapping once the model is final.
  return data as unknown as ContractView;
};

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                   */
/* -------------------------------------------------------------------------- */

const EMPTY = "—";

const isNum = (v: unknown): v is number => typeof v === "number" && Number.isFinite(v);

const inr = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const formatCurrency = (v?: number | null) => (isNum(v) ? inr.format(v) : EMPTY);
const formatNumber = (v?: number | null) => (isNum(v) ? new Intl.NumberFormat("en-IN").format(v) : EMPTY);

const formatDate = (value?: string | null, month: "long" | "short" = "long") => {
  if (!value) return EMPTY;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return EMPTY;
  return d.toLocaleDateString("en-GB", { day: "numeric", month, year: "numeric" });
};

const text = (v?: string | null) => (v && v.trim() ? v.trim() : EMPTY);

const initials = (name?: string | null) => {
  const parts = (name ?? "").trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "?";
  return (parts[0][0] + (parts[1]?.[0] ?? "")).toUpperCase();
};

const percent = (part?: number | null, whole?: number | null) => {
  if (!isNum(part) || !isNum(whole) || whole <= 0) return null;
  return Math.max(0, Math.min(100, Math.round((part / whole) * 100)));
};

const statusStyles = (status?: string | null) => {
  const s = (status ?? "").toLowerCase().replace(/[\s_-]/g, "");
  if (s === "inprogress") return "bg-blue-50 text-blue-600 border-blue-100";
  if (s === "completed" || s === "approved") return "bg-emerald-50 text-emerald-700 border-emerald-100";
  if (s === "pending" || s === "draft") return "bg-amber-50 text-amber-700 border-amber-100";
  if (s === "cancelled" || s === "rejected") return "bg-red-50 text-red-600 border-red-100";
  return "bg-slate-100 text-slate-600 border-slate-200";
};

/* -------------------------------------------------------------------------- */
/*  Small building blocks                                                     */
/* -------------------------------------------------------------------------- */

const Field: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div className="min-w-0">
    <p className="text-xs text-slate-500">{label}</p>
    <div className="mt-1 text-sm font-medium text-slate-900 break-words">{children}</div>
  </div>
);

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

const DocumentLink: React.FC<{ url?: string | null; label?: string; variant?: "link" | "button" }> = ({
  url,
  label = "View",
  variant = "link",
}) => {
  if (!url) return <span className="text-slate-400">No document</span>;

  const base =
    variant === "button"
      ? "inline-flex items-center gap-2 rounded-md border border-sky-300 bg-white px-3 py-1.5 text-sm text-sky-700 hover:bg-sky-50"
      : "inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:underline";

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={`${base} focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500`}
    >
      {label}
      <Eye className="h-4 w-4" aria-hidden />
    </a>
  );
};

const Stat: React.FC<{ label: string; value: string; className?: string; valueClass?: string; labelClass?: string }> = ({
  label,
  value,
  className = "border-slate-200 bg-slate-50",
  valueClass = "text-slate-900",
  labelClass = "text-slate-500",
}) => (
  <div className={`rounded-lg border px-3 py-3 text-center ${className}`}>
    <p className={`text-[11px] font-medium uppercase tracking-wide ${labelClass}`}>{label}</p>
    <p className={`mt-1.5 text-xl font-semibold ${valueClass}`}>{value}</p>
  </div>
);

/* -------------------------------------------------------------------------- */
/*  Contract levels (collapsible, level 2 listing inside)                     */
/* -------------------------------------------------------------------------- */

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
          className={`h-4 w-4 shrink-0 text-slate-500 transition-transform duration-200 motion-reduce:transition-none ${
            open ? "rotate-180" : ""
          }`}
          aria-hidden
        />
      </button>

      {/* grid-rows trick = smooth height animation without measuring */}
      <div
        id={panelId}
        role="region"
        className={`grid transition-[grid-template-rows] duration-200 motion-reduce:transition-none ${
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
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
                    <span
                      className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-sky-400"
                      aria-hidden
                    />
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

/* -------------------------------------------------------------------------- */
/*  Main component                                                            */
/* -------------------------------------------------------------------------- */

interface ContractOverviewProps {
  contractRequisitionData: ContractRequisitionData | null;
}

export const ContractOverview: React.FC<ContractOverviewProps> = ({ contractRequisitionData }) => {
  const [openLevels, setOpenLevels] = useState<Set<number>>(new Set());

  const toggleLevel = (i: number) =>
    setOpenLevels((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });

  const c = toViewModel(contractRequisitionData);

  // Whole payload missing
  if (!c) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-8">
        <EmptyState message="No contract details available." icon={<FileX2 className="h-6 w-6" aria-hidden />} />
      </div>
    );
  }

  const levels = Array.isArray(c.levels) ? c.levels : [];
  const inv = c.invoices ?? null;
  const invoicedPct = percent(inv?.invoiced, inv?.totalFinalised);
  const pendingPct = invoicedPct === null ? null : 100 - invoicedPct;
  const hasInvoices = !!inv && (isNum(inv.totalFinalised) || isNum(inv.invoiced) || (inv.count ?? 0) > 0);

  return (
    <div className="space-y-4 text-slate-900">
      {/* Contract overview */}
      <SectionCard
        title="Contract Overview"
        headerClass="bg-blue-50"
        titleClass="text-blue-700"
        right={
          c.contractType ? (
            <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-[11px] font-medium text-blue-700">
              {c.contractType}
            </span>
          ) : null
        }
      >
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <Field label="Contract Code">{text(c.contractCode)}</Field>
          <Field label="Status">
            {c.status ? (
              <span
                className={`inline-block rounded border px-2 py-0.5 text-[11px] font-medium capitalize ${statusStyles(
                  c.status,
                )}`}
              >
                {c.status.replace(/[_-]/g, " ").toLowerCase()}
              </span>
            ) : (
              EMPTY
            )}
          </Field>
          <Field label="Estimated Start Date">{formatDate(c.estimatedStartDate)}</Field>
          <Field label="Document">
            <DocumentLink url={c.documentUrl} />
          </Field>
        </div>
        <div className="mt-4">
          <Field label="Remark">
            <span className="font-normal text-slate-700">{text(c.remark)}</span>
          </Field>
        </div>
      </SectionCard>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,5fr)_minmax(0,3fr)]">
        {/* Left column */}
        <div className="space-y-4">
          <SectionCard title="BOQ Summary" headerClass="bg-yellow-50" titleClass="text-yellow-800">
            {c.boq ? (
              <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                <Stat label="Categories" value={formatNumber(c.boq.categories)} />
                <Stat label="Items" value={formatNumber(c.boq.items)} />
                <Stat label="Total Qty" value={formatNumber(c.boq.totalQty)} />
                <Stat
                  label="Total BOQ Value"
                  value={formatCurrency(c.boq.totalValue)}
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
            title={`Contract Levels (${levels.length})`}
            headerClass="bg-cyan-50"
            titleClass="text-sky-700"
          >
            {levels.length === 0 ? (
              <EmptyState message="No contract levels have been added." />
            ) : (
              <ul className="space-y-3">
                {levels.map((level, i) => (
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

        {/* Right column */}
        <div className="space-y-4">
          <SectionCard title="Finalized Vendor" headerClass="bg-violet-50" titleClass="text-violet-700">
            {c.vendor ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-violet-200 bg-violet-50 text-sm font-semibold text-violet-700">
                    {initials(c.vendor.companyName)}
                  </span>
                  <p className="min-w-0 break-words text-sm font-semibold text-slate-900">
                    {text(c.vendor.companyName)}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Vendor Name">{text(c.vendor.contactName)}</Field>
                  <Field label="Vendor ID">{text(c.vendor.vendorId)}</Field>
                </div>
                <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2.5">
                  <Field label="Finalized Amount">{formatCurrency(c.vendor.finalizedAmount)}</Field>
                </div>
              </div>
            ) : (
              <EmptyState message="No vendor has been finalized yet." />
            )}
          </SectionCard>

          <SectionCard title="Work Order" headerClass="bg-green-50" titleClass="text-green-700">
            {c.workOrder ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Work Order Document">
                    <DocumentLink url={c.workOrder.documentUrl} label="Document" variant="button" />
                  </Field>
                  <Field label="Date">{formatDate(c.workOrder.date, "short")}</Field>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Remark</p>
                  <p className="mt-1 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
                    {text(c.workOrder.remark)}
                  </p>
                </div>
              </div>
            ) : (
              <EmptyState message="No work order has been issued." />
            )}
          </SectionCard>
        </div>
      </div>

      {/* Invoices */}
      <SectionCard
        title={`Invoices (${inv?.count ?? 0})`}
        headerClass="bg-slate-50"
        titleClass="text-indigo-900"
      >
        {!hasInvoices ? (
          <EmptyState message="No invoices have been generated for this contract." />
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              <Stat
                label="Total Finalised Amount"
                value={formatCurrency(inv?.totalFinalised)}
                labelClass="text-slate-500"
              />
              <Stat label="Invoiced" value={formatCurrency(inv?.invoiced)} />
              <Stat
                label="Paid"
                value={formatCurrency(inv?.paid)}
                className="border-emerald-200 bg-emerald-50"
                labelClass="text-emerald-800"
                valueClass="text-emerald-800"
              />
              <Stat
                label="Outstanding"
                value={formatCurrency(inv?.outstanding)}
                className="border-amber-200 bg-amber-50"
                labelClass="text-amber-800"
                valueClass="text-amber-800"
              />
            </div>

            {/* Progress */}
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

            {/* Last invoice */}
            {inv?.last && (
              <div className="rounded-md border-l-4 border-indigo-500 bg-slate-50 px-3 py-2.5">
                <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
                  Last Generated Invoice
                </p>
                <div className="mt-1 flex flex-wrap items-center gap-x-6 gap-y-1 text-sm">
                  <span className="font-medium text-slate-900">{text(inv.last.number)}</span>
                  <span className="font-medium text-indigo-600">{formatCurrency(inv.last.amount)}</span>
                  <span className="text-slate-600">{formatDate(inv.last.date, "short")}</span>
                </div>
              </div>
            )}
          </div>
        )}
      </SectionCard>

      {/* Action details */}
      <SectionCard title="Action Details" headerClass="bg-slate-50" titleClass="text-slate-800">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <Field label="Created By">{text(c.audit?.createdBy)}</Field>
          <Field label="Created Date">{formatDate(c.audit?.createdDate)}</Field>
          <Field label="Modified By">{text(c.audit?.modifiedBy)}</Field>
          <Field label="Modified Date">{formatDate(c.audit?.modifiedDate)}</Field>
        </div>
      </SectionCard>
    </div>
  );
};