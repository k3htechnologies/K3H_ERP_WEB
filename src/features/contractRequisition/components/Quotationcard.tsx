import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  AlertCircle, Check, ChevronDown, ChevronRight, Copy, Info, Loader2, Pencil, Save, X
} from 'lucide-react'

import { useViewportHeight } from '@/core/utils/useViewportHeight'
import NoDataView from '@/ui/components/NoDataView/NoDataView'
import { useHorizontalScroll } from '@/ui/components/DataTable/useHorizontalScroll'
import ApprovalActions from '@/features/modulesWorkflowApproval/components/ApprovalActionsButton'

/*                        API field mapping (edit here only)                  */
export const LINE_FIELDS = {
  code: 'WBSCode',
  parent: 'ParentWBSCode',
  unit: 'Uom',
  qty: 'Quantity',
  labour: 'LabourCost',
  material: 'MaterialCost',
  pnm: 'PMCost',
  contractRate: 'TotalRate',
  budget: 'BudgetAmount',
  remarks: 'Remark',
  cgst: 'CGST',
  sgst: 'SGST',
  ugst: 'UGST',
  igst: 'IGST'
} as const

/** Alternative API names for a field: the first one present on a row is used (and written back to). */
export const LINE_ALIASES: Partial<Record<keyof typeof LINE_FIELDS, readonly string[]>> = {
  contractRate: ['Rate'] // some endpoints return "Rate" instead of "TotalRate"
}

/** Written on save only if the row has it (= contract amount before tax). */
export const LINE_AMOUNT_KEY = 'Amount'

/**
 * Used to build the hierarchy when rows have NO WBSCode: the id path LevelId1 > LevelId2 > LevelId3 > LevelId4
 * (stops at the first 0). A row's parent is the row whose path is the same without the last id.
 */
export const LEVEL_ID_KEYS = ['LevelId1', 'LevelId2', 'LevelId3', 'LevelId4'] as const

/** Sibling order when rows have no WBSCode: first of these that is > 0, else order of appearance. */
export const ORDER_KEYS = ['OrderBy', 'ContractRequisitionBOQId'] as const

/** Filled from boqLineItems (matched by BudgetId) when a saved row is missing them. */
export const ENRICH_KEYS = ['WBSCode', 'CategoryName', 'Uom', 'BudgetAmount'] as const

/** A row's display name = first non-empty of these (deepest level first). */
export const LINE_NAME_KEYS = [
  'Level4Name', 'Level4MaterialName', 'Level3Name', 'Level2Name', 'Level1Name', 'CategoryName'
] as const

export const QUOTATION_FIELDS = {
  terms: 'ContractRequisitionQuotationTermsData',
  lines: 'ContractRequisitionQuotationData',
  total: 'Total'
} as const

/** Terms-level fields (same level as Total / VendorId). */
export const TERM_FIELDS = {
  completion: 'ExpectedCompletionInDays',
  payment: 'ExpectedPaymentInDays'
} as const

export interface QuotationLineLike {
  BudgetId?: number | null
  ContractRequisitionBOQId?: number | null
  LevelType?: string | null
  LevelId1?: number | null
  LevelId2?: number | null
  LevelId3?: number | null
  LevelId4?: number | null
  OrderBy?: number | null
  Rate?: number | null
  Amount?: number | null
  WBSCode?: string | null
  CategoryName?: string | null
  Level1Name?: string | null
  Level2Name?: string | null
  Level3Name?: string | null
  Level4Name?: string | null
  Level4MaterialName?: string | null
  Uom?: string | null
  Quantity?: number | null
  LabourCost?: number | null
  MaterialCost?: number | null
  PMCost?: number | null
  TotalRate?: number | null
  BudgetAmount?: number | null
  Remark?: string | null
  CGST?: number | null
  SGST?: number | null
  UGST?: number | null
  IGST?: number | null
  /** Rows with IsSelected === false are not shown. */
  IsSelected?: boolean
}

export interface QuotationTermsLike {
  ContractRequisitionQuotationTermsId?: number
  Uniquekey?: string
  VendorId?: number
  Total?: number | null
  ExpectedCompletionInDays?: number | null
  ExpectedPaymentInDays?: number | null
  ContractRequisitionQuotationData?: QuotationLineLike[] | null
}

export interface VendorQuotationLike {
  VendorId?: number | string
  UniqueKey?: string
  SystemGeneratedCode?: string
  VendorName?: string
  CompanyName?: string
  VerifiedNonVerified?: string
  IsApproval?: boolean
  IsFinalized?: boolean
  VendorFinalizationApproval?: string | null
  ContractRequisitionQuotationTermsData?: QuotationTermsLike[] | null
  /** Optional overrides - not part of the current API response. */
  QuotationStatus?: string
  ValidTill?: string | null
  /** Default GST split into CGST/SGST for rows that have no tax fields. */
  GSTPercentage?: number | null
}

export interface QuotationSavePatch {
  /** ContractRequisitionQuotationTermsData[0].ContractRequisitionQuotationTermsId (0 if the vendor has no terms yet) */
  ContractRequisitionQuotationTermsId: number
  /** All rows (items updated, groups untouched). 0 is written for "not entered". */
  ContractRequisitionQuotationData: QuotationLineLike[]
  /** Grand contract value (taxable amount + all taxes) */
  Total: number
  /** Whole days; 0 = not entered */
  ExpectedCompletionInDays: number
  ExpectedPaymentInDays: number
  summary: { taxable: number; cgst: number; sgst: number; ugst: number; igst: number; grandTotal: number }
}

/** Merges a save patch into the vendor object (handy for local state / optimistic updates). */
export function applyQuotationPatch<V extends VendorQuotationLike>(vendor: V, patch: QuotationSavePatch): V {
  const [first, ...rest] = vendor.ContractRequisitionQuotationTermsData ?? []
  return {
    ...vendor,
    ContractRequisitionQuotationTermsData: [
      {
        ...(first ?? {}),
        ContractRequisitionQuotationData: patch.ContractRequisitionQuotationData,
        Total: patch.Total,
        ExpectedCompletionInDays: patch.ExpectedCompletionInDays,
        ExpectedPaymentInDays: patch.ExpectedPaymentInDays
      },
      ...rest
    ]
  }
}

const aliasKeys = (f: keyof typeof LINE_FIELDS): string[] => [LINE_FIELDS[f], ...(LINE_ALIASES[f] ?? [])]

/** Reads a field using its primary name or any alias. */
const rd = (l: Record<string, unknown>, f: keyof typeof LINE_FIELDS): unknown => {
  for (const k of aliasKeys(f)) if (l[k] !== undefined) return l[k]
  return undefined
}

/**
 * Fills missing WBSCode / CategoryName / Uom / BudgetAmount on saved rows from the BOQ line items,
 * matched by BudgetId. Existing values are never overridden. Returns new objects; the originals
 * stay untouched so the save patch does not contain borrowed fields.
 */
function enrichLines(lines: QuotationLineLike[], boq?: QuotationLineLike[] | null): QuotationLineLike[] {
  if (!boq || boq.length === 0) return lines
  const byBudget = new Map<string, Record<string, unknown>>()
  boq.forEach(b => {
    if (b.BudgetId != null && !byBudget.has(String(b.BudgetId))) byBudget.set(String(b.BudgetId), b as Record<string, unknown>)
  })
  return lines.map(l => {
    const src = l.BudgetId != null ? byBudget.get(String(l.BudgetId)) : undefined
    if (!src) return l
    const out = { ...l } as Record<string, unknown>
    ENRICH_KEYS.forEach(k => {
      const cur = out[k]
      if ((cur === undefined || cur === null || cur === '') && src[k] !== undefined) out[k] = src[k]
    })
    return out as QuotationLineLike
  })
}

/** Saved rows if the vendor has any, otherwise the fallback (e.g. BOQ line items) - same row shape. */
function getQuotationLines(
  terms: QuotationTermsLike[] | null | undefined,
  fallback?: QuotationLineLike[] | null
): QuotationLineLike[] {
  const saved = terms?.[0]?.ContractRequisitionQuotationData
  return (saved && saved.length > 0 ? saved : fallback ?? []).filter(r => r.IsSelected !== false)
}

export type EditableField =
  | 'labour' | 'material' | 'pnm' | 'contractRate'
  | 'cgst' | 'sgst' | 'ugst' | 'igst'

export type FieldErrors = Partial<Record<EditableField, string>>
type Draft = Record<EditableField, string>
type LeafValues = Record<EditableField, number | null>

interface QuotationCardProps {
  vendor: VendorQuotationLike
  checked?: boolean
  checkDisabled?: boolean
  canApprove?: boolean
  onApprove?: (vendor: VendorQuotationLike) => void
  onReject?: (vendor: VendorQuotationLike) => void
  onApprovalHistory?: (vendor: VendorQuotationLike) => void
  onCheckedChange?: (checked: boolean, vendor: VendorQuotationLike) => void
  expanded?: boolean
  defaultExpanded?: boolean
  onExpandedChange?: (expanded: boolean) => void
  onSave?: (patch: QuotationSavePatch) => void | Promise<void>
  loadTerms?: (vendor: VendorQuotationLike) => Promise<QuotationTermsLike[] | QuotationTermsLike | null | undefined>
  boqLineItems?: QuotationLineLike[] | null
  fallbackLines?: QuotationLineLike[] | null
  loading?: boolean
  readOnly?: boolean
  editableStatuses?: string[]
  emptyMessage?: string
  className?: string
  maxHeight?: string
  defaultExpandedDepth?: number
}

const EDITABLE_FIELDS: EditableField[] = [
  'labour', 'material', 'pnm', 'contractRate', 'cgst', 'sgst', 'ugst', 'igst'
]
const TAX_FIELDS: EditableField[] = ['cgst', 'sgst', 'ugst', 'igst']
const BREAKUP_FIELDS: EditableField[] = ['labour', 'material', 'pnm']

const MAX_TAX_PCT = 40
const MONEY_INPUT = /^\d{0,9}(\.\d{0,2})?$/
const TAX_INPUT = /^\d{0,2}(\.\d{0,2})?$/
const MAX_AMOUNT = 999_999_999.99

const FIELD_LABEL: Record<EditableField, string> = {
  labour: 'Labour', material: 'Material', pnm: 'P&M', contractRate: 'Contract rate',
  cgst: 'CGST', sgst: 'SGST', ugst: 'UGST', igst: 'IGST'
}

type GroupKey = 'item' | 'boq' | 'contract' | 'tax' | 'summary'

interface ColumnDef {
  key: string
  label: string
  group: GroupKey
  width: string
  align: 'left' | 'center' | 'right'
}

const GROUPS: { key: GroupKey; label: string; bg: string }[] = [
  { key: 'item', label: 'ITEM INFORMATION', bg: '#12284C' },
  { key: 'boq', label: 'BOQ', bg: '#1E3A6E' },
  { key: 'contract', label: 'CONTRACT PRICING', bg: '#12284C' },
  { key: 'tax', label: 'TAX BREAKDOWN', bg: '#1E3A6E' },
  { key: 'summary', label: 'SUMMARY', bg: '#12284C' }
]

const COLUMNS: ColumnDef[] = [
  { key: 'wbs', label: 'WBS / DESCRIPTION', group: 'item', width: '340px', align: 'left' },
  { key: 'unit', label: 'UNIT', group: 'item', width: '80px', align: 'center' },
  { key: 'quantity', label: 'QTY', group: 'item', width: '90px', align: 'right' },
  { key: 'labour', label: 'LABOUR (₹)', group: 'boq', width: '120px', align: 'right' },
  { key: 'material', label: 'MATERIAL (₹)', group: 'boq', width: '120px', align: 'right' },
  { key: 'pnm', label: 'P&M (₹)', group: 'boq', width: '120px', align: 'right' },
  { key: 'contractRate', label: 'CONTRACT RATE (₹)', group: 'contract', width: '140px', align: 'right' },
  { key: 'cgst', label: 'CGST', group: 'tax', width: '90px', align: 'center' },
  { key: 'sgst', label: 'SGST', group: 'tax', width: '90px', align: 'center' },
  { key: 'ugst', label: 'UGST', group: 'tax', width: '90px', align: 'center' },
  { key: 'igst', label: 'IGST', group: 'tax', width: '90px', align: 'center' },
  { key: 'contractAmount', label: 'CONTRACT AMOUNT (WITH TAX) (₹)', group: 'summary', width: '190px', align: 'right' },
  { key: 'variance', label: 'VAR. VS BOQ', group: 'summary', width: '110px', align: 'right' }
]

const HEADER_ROW_1 = 32

const STATUS_STYLE: Record<string, string> = {
  Submitted: 'bg-green-50 text-green-700 border-green-200',
  Pending: 'bg-amber-50 text-amber-700 border-amber-200',
  Finalized: 'bg-blue-50 text-blue-700 border-blue-200'
}

const round2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100
const isNum = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v)
const n0 = (v: unknown) => (isNum(v) ? v : 0)

const toNum = (v: unknown): number | null => {
  if (isNum(v)) return v
  if (typeof v === 'string' && v.trim() !== '') {
    const n = Number(v)
    return Number.isFinite(n) ? n : null
  }
  return null
}

const pos = (v: unknown): number | null => {
  const n = toNum(v)
  return n !== null && n > 0 ? n : null
}

const formatCurrency = (v: number | null | undefined) =>
  isNum(v)
    ? `₹${v.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    : '—'

const formatMoney = (v: number | null | undefined) =>
  isNum(v)
    ? `₹${v.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`
    : '—'

const formatQty = (v: number | null | undefined) => (isNum(v) ? v.toLocaleString('en-IN') : '—')
const formatPct = (v: number | null | undefined) => (isNum(v) ? `${parseFloat(v.toFixed(2))}%` : '—')

const formatDate = (iso?: string | null) => {
  if (!iso) return '—'
  const d = new Date(iso)
  return Number.isNaN(d.getTime())
    ? '—'
    : d.toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })
}

const variance = (boq: number, contract: number): number | null =>
  boq > 0 ? Math.round(((contract - boq) / boq) * 1000) / 10 : null

const varianceText = (v: number | null) => (v === null ? '—' : `${v > 0 ? '+' : ''}${v.toFixed(1)}%`)
const varianceClass = (v: number | null) =>
  v === null || v === 0 ? 'text-gray-500' : v > 0 ? 'text-red-600' : 'text-green-600'

interface LineNode {
  key: string
  pathKey: string
  parentPathKey: string
  order: number | null
  index: number
  code: string
  name: string
  unit: string | null
  qty: number | null
  budget: number
  remarks: string | null
  values: LeafValues
  children: LineNode[]
  isGroup: boolean
  parentKey: string | null
}

interface TreeModel {
  roots: LineNode[]
  byKey: Map<string, LineNode>
  keyByIndex: string[]
  depths: Map<string, number>
  leafKeys: string[]
  groupKeys: string[]
}

const naturalCompare = (a: string, b: string) => {
  const pa = a.split('.'), pb = b.split('.')
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const x = pa[i], y = pb[i]
    if (x === undefined) return -1
    if (y === undefined) return 1
    const nx = Number(x), ny = Number(y)
    const c = Number.isFinite(nx) && Number.isFinite(ny) ? nx - ny : x.localeCompare(y)
    if (c !== 0) return c
  }
  return 0
}

function buildTree(lines: QuotationLineLike[], gstPct: number | null): TreeModel {
  const raw = lines as unknown as Record<string, unknown>[]
  const str = (v: unknown) => (typeof v === 'string' ? v.trim() : v == null ? '' : String(v).trim())

  const gst = toNum(gstPct)
  const defaultTax: Pick<LeafValues, 'cgst' | 'sgst' | 'ugst' | 'igst'> =
    gst !== null && gst > 0
      ? { cgst: round2(gst / 2), sgst: round2(gst / 2), ugst: null, igst: null }
      : { cgst: null, sgst: null, ugst: null, igst: null }

  const seen = new Set<string>()
  const nodes: LineNode[] = raw.map((l, index) => {
    const code = str(rd(l, 'code'))
    const ids: number[] = []
    for (const k of LEVEL_ID_KEYS) {
      const id = pos(l[k])
      if (id === null) break
      ids.push(id)
    }
    const pathKey = ids.length ? `L:${ids.join('-')}` : ''
    const parentPathKey = ids.length > 1 ? `L:${ids.slice(0, -1).join('-')}` : ''
    let key = code || pathKey || `line-${index}`
    if (seen.has(key)) key = `${key}#${index}`
    seen.add(key)

    const labour = pos(rd(l, 'labour'))
    const material = pos(rd(l, 'material'))
    const pnm = pos(rd(l, 'pnm'))
    const breakup = n0(labour) + n0(material) + n0(pnm)
    const ownRate = pos(rd(l, 'contractRate'))
    const hasOwnTax = (['cgst', 'sgst', 'ugst', 'igst'] as const).some(k => rd(l, k) !== undefined)

    return {
      key, index, code, pathKey, parentPathKey,
      order: ORDER_KEYS.map(k => pos(l[k])).find(v => v !== null) ?? null,
      name: LINE_NAME_KEYS.map(k => str(l[k])).find(Boolean) || '(Untitled)',
      unit: str(rd(l, 'unit')) || null,
      qty: pos(rd(l, 'qty')),
      budget: Math.max(0, n0(toNum(rd(l, 'budget')))),
      remarks: str(rd(l, 'remarks')) || null,
      values: {
        labour, material, pnm,
        contractRate: ownRate ?? (breakup > 0 ? round2(breakup) : null),
        cgst: hasOwnTax ? pos(rd(l, 'cgst')) : defaultTax.cgst,
        sgst: hasOwnTax ? pos(rd(l, 'sgst')) : defaultTax.sgst,
        ugst: hasOwnTax ? pos(rd(l, 'ugst')) : defaultTax.ugst,
        igst: hasOwnTax ? pos(rd(l, 'igst')) : defaultTax.igst
      },
      children: [],
      isGroup: false,
      parentKey: null
    }
  })

  const byCode = new Map<string, LineNode>()
  nodes.forEach(n => { if (n.code && !byCode.has(n.code)) byCode.set(n.code, n) })
  const byPath = new Map<string, LineNode>()
  nodes.forEach(n => { if (n.pathKey && !byPath.has(n.pathKey)) byPath.set(n.pathKey, n) })

  nodes.forEach(n => {
    const explicit = str(rd(raw[n.index], 'parent'))
    const derived = n.code.includes('.') ? n.code.slice(0, n.code.lastIndexOf('.')) : ''
    const candidate =
      (explicit && explicit !== n.code && byCode.get(explicit)) ||
      (derived && byCode.get(derived)) ||
      (n.parentPathKey && byPath.get(n.parentPathKey)) ||
      null
    if (!candidate || candidate === n) return
    let cur: LineNode | null = candidate
    let steps = 0
    while (cur && steps++ <= nodes.length) {
      if (cur === n) return
      cur = cur.parentKey ? nodes.find(x => x.key === cur!.parentKey) ?? null : null
    }
    n.parentKey = candidate.key
  })

  const byKey = new Map(nodes.map(n => [n.key, n]))
  const roots: LineNode[] = []
  nodes.forEach(n => (n.parentKey ? byKey.get(n.parentKey)!.children : roots).push(n))
  const compare = (a: LineNode, b: LineNode) =>
    a.code && b.code
      ? naturalCompare(a.code, b.code)
      : a.order !== null && b.order !== null && a.order !== b.order
        ? a.order - b.order
        : a.index - b.index
  const sortRec = (list: LineNode[]) => {
    list.sort(compare)
    list.forEach(c => sortRec(c.children))
  }
  sortRec(roots)

  const assignCodes = (list: LineNode[], prefix: string) =>
    list.forEach((n, i) => {
      if (!n.code) n.code = prefix ? `${prefix}.${i + 1}` : `${i + 1}`
      assignCodes(n.children, n.code)
    })
  assignCodes(roots, '')

  nodes.forEach(n => {
    const v = n.values
    const hasData = n.qty !== null || n.unit !== null || BREAKUP_FIELDS.concat('contractRate').some(f => v[f] !== null)
    n.isGroup = n.children.length > 0 || !hasData
  })

  const model: TreeModel = {
    roots, byKey, keyByIndex: nodes.map(n => n.key), depths: new Map(), leafKeys: [], groupKeys: []
  }
  const walk = (list: LineNode[], depth: number) =>
    list.forEach(n => {
      model.depths.set(n.key, depth)
        ; (n.isGroup ? model.groupKeys : model.leafKeys).push(n.key)
      walk(n.children, depth + 1)
    })
  walk(roots, 0)
  return model
}

interface FlatRow { key: string; node: LineNode; depth: number }

function flattenVisible(list: LineNode[], expanded: Set<string>, depth = 0, out: FlatRow[] = []): FlatRow[] {
  list.forEach(node => {
    out.push({ key: node.key, node, depth })
    if (node.isGroup && expanded.has(node.key)) flattenVisible(node.children, expanded, depth + 1, out)
  })
  return out
}

interface Totals {
  qty: number; labour: number; material: number; pnm: number; contractRate: number
  boq: number // full BOQ budget
  boqQuoted: number // BOQ budget of items the vendor actually priced (like-for-like variance)
  contractBase: number // pre-tax
  cgst: number; sgst: number; ugst: number; igst: number // tax AMOUNTS
  contract: number // base + taxes
}
const emptyTotals = (): Totals => ({
  qty: 0, labour: 0, material: 0, pnm: 0, contractRate: 0, boq: 0, boqQuoted: 0,
  contractBase: 0, cgst: 0, sgst: 0, ugst: 0, igst: 0, contract: 0
})
const addTotals = (a: Totals, b: Totals): Totals => {
  const out = emptyTotals()
    ; (Object.keys(out) as (keyof Totals)[]).forEach(k => { out[k] = round2(a[k] + b[k]) })
  return out
}

const parseDraft = (d: Draft): LeafValues => {
  const out = {} as LeafValues
  EDITABLE_FIELDS.forEach(f => {
    const n = d[f].trim() === '' ? NaN : Number(d[f])
    out[f] = Number.isFinite(n) ? n : null
  })
  return out
}

const toDraft = (v: LeafValues): Draft => {
  const d = {} as Draft
  EDITABLE_FIELDS.forEach(f => { d[f] = isNum(v[f]) ? String(v[f]) : '' })
  return d
}

function leafTotals(node: LineNode, v: LeafValues): Totals {
  const qty = Math.max(0, n0(node.qty))
  const rate = n0(v.contractRate)
  const base = round2(qty * rate)
  const tax = (pct: number | null) => round2((base * n0(pct)) / 100)
  const cgst = tax(v.cgst), sgst = tax(v.sgst), ugst = tax(v.ugst), igst = tax(v.igst)
  return {
    qty, labour: n0(v.labour), material: n0(v.material), pnm: n0(v.pnm), contractRate: rate,
    boq: node.budget,
    boqQuoted: rate > 0 ? node.budget : 0,
    contractBase: base, cgst, sgst, ugst, igst,
    contract: round2(base + cgst + sgst + ugst + igst)
  }
}

function buildTotals(
  list: LineNode[], drafts: Record<string, Draft>, out = new Map<string, Totals>()
): Map<string, Totals> {
  list.forEach(node => {
    if (node.isGroup) {
      buildTotals(node.children, drafts, out)
      out.set(node.key, node.children.reduce((s, c) => addTotals(s, out.get(c.key)!), emptyTotals()))
    } else {
      out.set(node.key, leafTotals(node, drafts[node.key] ? parseDraft(drafts[node.key]) : node.values))
    }
  })
  return out
}

const isTaxField = (f: EditableField) => TAX_FIELDS.includes(f)

/** Blocks non-numeric keystrokes / pastes so a faulty string never enters state. */
const isAllowedInput = (f: EditableField, raw: string) =>
  raw === '' || (isTaxField(f) ? TAX_INPUT : MONEY_INPUT).test(raw)

function validateLeaf(d: Draft): FieldErrors {
  const errors: FieldErrors = {}
  const val: Partial<Record<EditableField, number>> = {}

  EDITABLE_FIELDS.forEach(f => {
    const raw = d[f].trim()
    if (raw === '') return
    const n = Number(raw)
    if (!Number.isFinite(n) || raw === '.') { errors[f] = 'Enter a valid number'; return }
    if (n < 0) { errors[f] = 'Cannot be negative'; return }
    if (isTaxField(f) && n > MAX_TAX_PCT) { errors[f] = `Max ${MAX_TAX_PCT}%`; return }
    if (!isTaxField(f) && n > MAX_AMOUNT) { errors[f] = 'Value too large'; return }
    val[f] = n
  })

  const anyRate = (['labour', 'material', 'pnm', 'contractRate'] as EditableField[]).some(f => d[f].trim() !== '')
  if (anyRate && !errors.contractRate) {
    if (d.contractRate.trim() === '') errors.contractRate = 'Required'
    else if (!(val.contractRate! > 0)) errors.contractRate = 'Must be above 0'
    else if (!BREAKUP_FIELDS.some(f => errors[f]) && BREAKUP_FIELDS.some(f => d[f].trim() !== '')) {
      const sum = round2(BREAKUP_FIELDS.reduce((s, f) => s + n0(val[f]), 0))
      if (Math.abs(sum - val.contractRate!) > 0.005) errors.contractRate = `Breakup adds up to ${formatCurrency(sum)}`
    }
  }

  const cgst = n0(val.cgst), sgst = n0(val.sgst), ugst = n0(val.ugst), igst = n0(val.igst)
  if (!errors.igst && igst > 0 && (cgst > 0 || sgst > 0 || ugst > 0)) {
    errors.igst = 'IGST cannot be combined with CGST/SGST/UGST'
  }
  if (!errors.ugst && !errors.sgst && sgst > 0 && ugst > 0) errors.ugst = 'Use either SGST or UGST'
  return errors
}

function isFieldDisabled(f: EditableField, d: Draft): boolean {
  if (!isTaxField(f) || Number(d[f]) > 0) return false
  const has = (k: EditableField) => Number(d[k]) > 0
  if (f === 'igst') return has('cgst') || has('sgst') || has('ugst')
  if (has('igst')) return true
  if (f === 'sgst') return has('ugst')
  if (f === 'ugst') return has('sgst')
  return false
}

interface EditableCellProps {
  value: string
  error?: string
  disabled?: boolean
  placeholder?: string
  ariaLabel: string
  onChange: (v: string) => void
  onBlur: () => void
}

const EditableCell: React.FC<EditableCellProps> = ({
  value, error, disabled, placeholder = '0.00', ariaLabel, onChange, onBlur
}) => (
  <div className="w-full">
    <input
      type="text"
      inputMode="decimal"
      autoComplete="off"
      value={value}
      disabled={disabled}
      placeholder={placeholder}
      aria-label={ariaLabel}
      aria-invalid={!!error}
      title={error}
      onFocus={(e) => e.target.select()}
      onChange={(e) => onChange(e.target.value)}
      onBlur={onBlur}
      className={`h-8 w-full rounded-md border px-2 text-right text-xs tabular-nums outline-none transition-colors
        ${error
          ? 'border-red-500 bg-red-50 focus:ring-1 focus:ring-red-400'
          : 'border-gray-300 bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-400'}
        ${disabled ? 'cursor-not-allowed bg-gray-100 text-gray-400' : 'text-gray-900'}`}
    />
    {error && <p className="mt-0.5 text-left text-[10px] leading-3 text-red-600">{error}</p>}
  </div>
)

const CodeBadge: React.FC<{ code: string; depth: number }> = ({ code, depth }) => (
  <span
    className={`inline-flex min-w-5 shrink-0 items-center justify-center rounded border px-1 text-[11px] font-semibold leading-5
      ${depth === 0
        ? 'border-blue-200 bg-blue-50 text-blue-700'
        : depth === 1
          ? 'border-sky-200 bg-sky-50 text-sky-600'
          : 'border-gray-300 bg-white text-gray-700'}`}
  >
    {code}
  </span>
)

interface TaxSummaryProps {
  taxable: number
  cgst: number
  sgst: number
  ugst: number
  igst: number
  grandTotal: number
}

const TaxSummary: React.FC<TaxSummaryProps> = ({ taxable, cgst, sgst, ugst, igst, grandTotal }) => {
  const cells: { label: string; value: number; always?: boolean }[] = [
    { label: 'Taxable Amount', value: taxable, always: true },
    { label: 'CGST', value: cgst },
    { label: 'SGST', value: sgst },
    { label: 'UGST', value: ugst },
    { label: 'IGST', value: igst }
  ]
  return (
    <div className="flex flex-col gap-3 px-4 py-3 lg:flex-row">
      <div className="min-w-0 flex-1 rounded-lg border border-gray-200 bg-white px-4 py-3 shadow-sm">
        <h4 className="text-xs font-medium text-blue-600">Contract Value Summary</h4>
        <div className="mt-2 grid grid-cols-2 gap-y-3 sm:grid-cols-3 lg:grid-cols-5">
          {cells.map((c, i) => (
            <div key={c.label} className={`${i > 0 ? 'lg:border-l lg:border-gray-200 lg:pl-4' : ''} min-w-0`}>
              <p className="text-xs text-gray-400">{c.label}</p>
              <p className="mt-1 truncate text-sm font-semibold tabular-nums text-gray-900">
                {c.always || c.value > 0 ? formatMoney(c.value) : '—'}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between gap-4 rounded-lg border border-blue-100 bg-blue-50 px-6 py-3 lg:min-w-[320px]">
        <span className="whitespace-nowrap text-sm font-medium text-gray-800">Grand Contract Value</span>
        <span className="text-gray-500">:</span>
        <span className="whitespace-nowrap text-xl font-semibold tabular-nums text-blue-600">
          {formatMoney(grandTotal)}
        </span>
      </div>
    </div>
  )
}

const Bar: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`animate-pulse rounded bg-gray-200 ${className}`} />
)

const SKELETON_ROWS: { depth: number; group: boolean; nameW: string }[] = [
  { depth: 0, group: true, nameW: 'w-40' },
  { depth: 1, group: true, nameW: 'w-44' },
  { depth: 2, group: false, nameW: 'w-48' },
  { depth: 2, group: false, nameW: 'w-40' },
  { depth: 2, group: false, nameW: 'w-52' },
  { depth: 1, group: true, nameW: 'w-36' },
  { depth: 0, group: true, nameW: 'w-32' },
  { depth: 0, group: true, nameW: 'w-36' },
  { depth: 0, group: true, nameW: 'w-28' }
]

const skeletonAlign = (a: ColumnDef['align']) =>
  a === 'center' ? 'mx-auto' : a === 'right' ? 'ml-auto' : ''

const skeletonCell = (key: string, group: boolean, align: ColumnDef['align']): React.ReactNode => {
  const a = skeletonAlign(align)
  if (key === 'contractAmount') return <Bar className={`h-3.5 w-24 ${a}`} />
  if (key === 'variance') return <Bar className={`h-3.5 w-10 ${a}`} />
  if (group) return <span className="text-gray-300">—</span>
  switch (key) {
    case 'unit': return <Bar className={`h-3 w-8 ${a}`} />
    case 'quantity': return <Bar className={`h-3 w-10 ${a}`} />
    case 'cgst': case 'sgst': case 'ugst': case 'igst': return <Bar className={`h-3 w-8 ${a}`} />
    default: return <Bar className={`h-3 w-16 ${a}`} />
  }
}

const QuotationTableSkeletonBody: React.FC = () => (
  <>
    {SKELETON_ROWS.map((row, i) => (
      <tr
        key={i}
        className={`border-b border-gray-200 bg-white ${row.group && row.depth === 0 ? 'h-12 border-t border-gray-300' : row.group ? 'h-10' : 'h-12'}`}
      >
        {COLUMNS.map(col => {
          const base = 'px-3 py-2 text-xs border-r border-gray-100 align-middle'
          if (col.key === 'wbs') {
            return (
              <td
                key={col.key}
                className={`${base} sticky left-0 z-20 bg-white shadow-[2px_0_4px_rgba(0,0,0,0.06)]`}
                style={{ width: col.width, minWidth: col.width, paddingLeft: 12 + row.depth * 18 }}
              >
                <div className="flex items-center gap-2">
                  {row.group ? <Bar className="h-3.5 w-3.5 shrink-0" /> : <span className="w-[18px] shrink-0" />}
                  <Bar className="h-5 w-6 shrink-0" />
                  <Bar className={`h-3 ${row.nameW}`} />
                </div>
              </td>
            )
          }
          return (
            <td
              key={col.key}
              className={`${base} ${col.align === 'center' ? 'text-center' : col.align === 'right' ? 'text-right' : 'text-left'}`}
              style={{ width: col.width, minWidth: col.width }}
            >
              {skeletonCell(col.key, row.group, col.align)}
            </td>
          )
        })}
      </tr>
    ))}
  </>
)

const QuotationTableSkeletonFooter: React.FC = () => (
  <tfoot className="sticky bottom-0 z-30">
    <tr className="h-11">
      {COLUMNS.map(col => (
        <td
          key={col.key}
          className={`px-3 ${col.key === 'wbs' ? 'sticky left-0 z-20' : ''}`}
          style={{ backgroundColor: '#12284C', borderTop: '2px solid #2F5BEA' }}
        >
          {col.key !== 'wbs' && col.key !== 'unit' && (
            <div className={`h-3 animate-pulse rounded bg-white/25 ${col.key === 'contractAmount' ? 'w-24' : 'w-10'} ${skeletonAlign(col.align === 'right' ? 'center' : col.align)}`} />
          )}
        </td>
      ))}
    </tr>
  </tfoot>
)

const TaxSummarySkeleton: React.FC = () => (
  <div className="flex flex-col gap-3 px-4 py-3 lg:flex-row" aria-hidden="true">
    <div className="min-w-0 flex-1 rounded-lg border border-gray-200 bg-white px-4 py-3 shadow-sm">
      <Bar className="h-3 w-36" />
      <div className="mt-3 grid grid-cols-2 gap-y-3 sm:grid-cols-3 lg:grid-cols-5">
        {[0, 1, 2, 3, 4].map(i => (
          <div key={i} className={`${i > 0 ? 'lg:border-l lg:border-gray-200 lg:pl-4' : ''}`}>
            <Bar className="h-3 w-16" />
            <Bar className="mt-2 h-4 w-20" />
          </div>
        ))}
      </div>
    </div>
    <div className="flex items-center justify-between gap-4 rounded-lg border border-blue-100 bg-blue-50 px-6 py-3 lg:min-w-[320px]">
      <Bar className="h-4 w-32 bg-blue-100!" />
      <Bar className="h-6 w-28 bg-blue-100!" />
    </div>
  </div>
)

type DayField = 'completion' | 'payment'
type DayDraft = Record<DayField, string>
type DayValues = Record<DayField, number | null>

const MAX_DAYS = 999
const DAYS_INPUT = new RegExp(`^\\d{0,${String(MAX_DAYS).length}}$`)

const DAY_ROWS: { key: DayField; label: string; bg: string }[] = [
  { key: 'completion', label: 'Expected Completion (Days)', bg: 'bg-green-100' },
  { key: 'payment', label: 'Expected Payment (Days)', bg: 'bg-gray-100' }
]

const readDays = (terms: QuotationTermsLike[] | null | undefined): DayValues => {
  const t = (terms?.[0] ?? {}) as Record<string, unknown>
  return { completion: pos(t[TERM_FIELDS.completion]), payment: pos(t[TERM_FIELDS.payment]) }
}

const dayToDraft = (v: number | null) => (v === null ? '' : String(v))
const draftToDays = (v: string): number | null => (v.trim() === '' ? null : Number(v))
const formatDays = (v: number | null) => (v === null ? '—' : `${v} ${v === 1 ? 'Day' : 'Days'}`)

function validateDays(d: DayDraft): Partial<Record<DayField, string>> {
  const out: Partial<Record<DayField, string>> = {}
    ; (['completion', 'payment'] as DayField[]).forEach(f => {
      const raw = d[f].trim()
      if (raw === '') return
      const n = Number(raw)
      if (!Number.isInteger(n)) out[f] = 'Enter whole days'
      else if (n < 1) out[f] = 'Must be at least 1 day'
      else if (n > MAX_DAYS) out[f] = `Max ${MAX_DAYS} days`
    })
  return out
}

interface TermsDaysProps {
  values: DayValues
  editing: boolean
  drafts: DayDraft
  errors: Partial<Record<DayField, string>>
  disabled?: boolean
  onChange: (f: DayField, raw: string) => void
  onBlur: (f: DayField) => void
}

const TermsDays: React.FC<TermsDaysProps> = ({ values, editing, drafts, errors, disabled, onChange, onBlur }) => (
  <div>
    {DAY_ROWS.map(row => (
      <div key={row.key} className={`flex min-h-12 items-center justify-between gap-4 px-6 py-2 ${row.bg}`}>
        <span className="text-sm text-gray-600">{row.label}</span>
        {editing ? (
          <div className="flex flex-col items-end">
            <div className="flex items-center gap-2">
              <input
                type="text"
                inputMode="numeric"
                autoComplete="off"
                value={drafts[row.key]}
                disabled={disabled}
                placeholder="0"
                aria-label={row.label}
                aria-invalid={!!errors[row.key]}
                onFocus={(e) => e.target.select()}
                onChange={(e) => onChange(row.key, e.target.value)}
                onBlur={() => onBlur(row.key)}
                className={`h-8 w-24 rounded-md border px-2 text-right text-sm tabular-nums outline-none transition-colors
                  ${errors[row.key]
                    ? 'border-red-500 bg-red-50 focus:ring-1 focus:ring-red-400'
                    : 'border-gray-300 bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-400'}
                  ${disabled ? 'cursor-not-allowed bg-gray-100 text-gray-400' : 'text-gray-900'}`}
              />
              <span className="text-sm text-gray-600">Days</span>
            </div>
            {errors[row.key] && <p className="mt-0.5 text-[10px] leading-3 text-red-600">{errors[row.key]}</p>}
          </div>
        ) : (
          <span className="text-sm tabular-nums text-gray-700">{formatDays(values[row.key])}</span>
        )}
      </div>
    ))}
  </div>
)

const TermsDaysSkeleton: React.FC = () => (
  <div aria-hidden="true">
    {DAY_ROWS.map(row => (
      <div key={row.key} className={`flex min-h-12 items-center justify-between gap-4 px-6 py-2 ${row.bg}`}>
        <Bar className="h-3.5 w-44 bg-white/70!" />
        <Bar className="h-3.5 w-14 bg-white/70!" />
      </div>
    ))}
  </div>
)

export const QuotationCard: React.FC<QuotationCardProps> = ({
  vendor,
  checked,
  checkDisabled = false,
  canApprove = false,
  onApprove,
  onReject,
  onApprovalHistory,
  onCheckedChange,
  expanded,
  defaultExpanded = false,
  onExpandedChange,
  onSave,
  loadTerms,
  boqLineItems,
  fallbackLines,
  loading = false,
  readOnly = false,
  editableStatuses = ['Pending', 'Submitted'],
  emptyMessage = 'No quotation items available',
  className = '',
  maxHeight,
  defaultExpandedDepth = 2
}) => {
  const scrollRef = useHorizontalScroll()
  const viewportMaxHeight = useViewportHeight(255, 350, 900)
  const tableMaxHeight = maxHeight ?? viewportMaxHeight

  const [innerExpanded, setInnerExpanded] = useState(defaultExpanded)
  const [innerChecked, setInnerChecked] = useState(false)
  const isExpanded = expanded ?? innerExpanded
  const isChecked = checked ?? innerChecked
  const [copied, setCopied] = useState(false)

  const toggleExpanded = () => {
    const next = !isExpanded
    if (expanded === undefined) setInnerExpanded(next)
    onExpandedChange?.(next)
  }
  const collapseCard = () => {
    if (expanded === undefined) setInnerExpanded(false)
    onExpandedChange?.(false)
  }
  const handleChecked = (next: boolean) => {
    if (checked === undefined) setInnerChecked(next)
    onCheckedChange?.(next, vendor)
  }
  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      await navigator.clipboard.writeText(String(vendor.SystemGeneratedCode ?? vendor.VendorId ?? ''))
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
    }
  }

  const vendorTerms = vendor.ContractRequisitionQuotationTermsData
  const vendorHasTerms = (vendorTerms?.length ?? 0) > 0
  const [fetchedTerms, setFetchedTerms] = useState<QuotationTermsLike[] | null>(null)
  const [fetching, setFetching] = useState(false)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [stale, setStale] = useState(false)
  const requestId = useRef(0)
  const needsFetch = !!loadTerms && !vendorHasTerms && (fetchedTerms === null || stale)
  const activeTerms = vendorHasTerms ? vendorTerms : fetchedTerms

  useEffect(() => {
    requestId.current += 1
    setFetchedTerms(null)
    setFetchError(null)
    setFetching(false)
    setStale(false)
  }, [vendor.VendorId])

  const fetchTerms = useCallback(async () => {
    if (!loadTerms) return
    const id = ++requestId.current
    setFetching(true)
    setFetchError(null)
    try {
      const res = await loadTerms(vendor)
      if (id !== requestId.current) return
      setFetchedTerms(Array.isArray(res) ? res : res ? [res] : [])
      setStale(false)
    } catch (err) {
      if (id !== requestId.current) return
      setFetchError(err instanceof Error && err.message ? err.message : 'Could not load the quotation. Try again.')
    } finally {
      if (id === requestId.current) setFetching(false)
    }
  }, [loadTerms, vendor])

  useEffect(() => {
    if (isExpanded && needsFetch && !fetching && !fetchError) void fetchTerms()
  }, [isExpanded, needsFetch, fetching, fetchError, fetchTerms])

  const isTableLoading = loading || fetching || (needsFetch && isExpanded && !fetchError)

  const gstPct = vendor.GSTPercentage ?? null
  const [lines, setLines] = useState<QuotationLineLike[]>(() => getQuotationLines(activeTerms, fallbackLines))
  const [isEditing, setIsEditing] = useState(false)
  const [drafts, setDrafts] = useState<Record<string, Draft>>({})
  const [baseline, setBaseline] = useState<Record<string, Draft>>({})
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [showErrors, setShowErrors] = useState(false)
  const [savedDays, setSavedDays] = useState<DayValues>(() => readDays(activeTerms))
  const [dayDrafts, setDayDrafts] = useState<DayDraft>({ completion: '', payment: '' })
  const [dayBaseline, setDayBaseline] = useState<DayDraft>({ completion: '', payment: '' })

  // Re-sync the table ONLY when the source data really changed (new props / refetched terms).
  // Leaving edit mode alone must not reset it: that used to overwrite the just-saved values
  // with the older, cached terms.
  const syncedSource = useRef({ terms: activeTerms, fallback: fallbackLines })
  useEffect(() => {
    if (isEditing) return
    const prev = syncedSource.current
    if (prev.terms === activeTerms && prev.fallback === fallbackLines) return
    syncedSource.current = { terms: activeTerms, fallback: fallbackLines }
    setLines(getQuotationLines(activeTerms, fallbackLines))
    setSavedDays(readDays(activeTerms))
  }, [activeTerms, fallbackLines, isEditing])

  const viewLines = useMemo(() => enrichLines(lines, boqLineItems), [lines, boqLineItems])
  const tree = useMemo(() => buildTree(viewLines, gstPct), [viewLines, gstPct])

  const status =
    vendor.QuotationStatus ??
    (vendor.IsFinalized
      ? 'Finalized'
      : needsFetch || fetching || fetchError
        ? ''
        : tree.leafKeys.some(k => n0(tree.byKey.get(k)?.values.contractRate) > 0)
          ? 'Submitted'
          : 'Pending')

  const [expandedKeys, setExpandedKeys] = useState<Set<string>>(new Set())
  const seenGroups = useRef<Set<string>>(new Set())
  useEffect(() => {
    const fresh = tree.groupKeys.filter(k => !seenGroups.current.has(k))
    if (fresh.length === 0) return
    fresh.forEach(k => seenGroups.current.add(k))
    setExpandedKeys(prev => {
      const next = new Set(prev)
      fresh.forEach(k => { if ((tree.depths.get(k) ?? 0) < defaultExpandedDepth) next.add(k) })
      return next
    })
  }, [tree, defaultExpandedDepth])

  const toggleNode = (key: string) =>
    setExpandedKeys(prev => {
      const next = new Set(prev)
      next.has(key) ? next.delete(key) : next.add(key)
      return next
    })

  const rows = useMemo(() => flattenVisible(tree.roots, expandedKeys), [tree, expandedKeys])
  const totals = useMemo(() => buildTotals(tree.roots, drafts), [tree, drafts])
  const grand = useMemo(
    () => tree.roots.reduce((s, r) => addTotals(s, totals.get(r.key)!), emptyTotals()),
    [tree, totals]
  )

  const errors = useMemo(() => {
    const out: Record<string, FieldErrors> = {}
    if (!isEditing) return out
    Object.keys(drafts).forEach(key => {
      const e = validateLeaf(drafts[key])
      if (Object.keys(e).length) out[key] = e
    })
    return out
  }, [drafts, isEditing])

  const dayErrors = useMemo(() => (isEditing ? validateDays(dayDrafts) : {}), [dayDrafts, isEditing])

  const errorCount = useMemo(
    () => Object.values(errors).reduce((n, e) => n + Object.keys(e).length, 0) + Object.keys(dayErrors).length,
    [errors, dayErrors]
  )

  const isChanged = useCallback(
    (key: string) => EDITABLE_FIELDS.some(f => drafts[key]?.[f] !== baseline[key]?.[f]),
    [drafts, baseline]
  )
  const isDirty = useMemo(
    () =>
      Object.keys(drafts).some(isChanged) ||
      (['completion', 'payment'] as DayField[]).some(f => dayDrafts[f] !== dayBaseline[f]),
    [drafts, isChanged, dayDrafts, dayBaseline]
  )

  const hasItems = tree.roots.length > 0
  const isLocked = readOnly || !!vendor.IsFinalized || !!vendor.IsApproval || !editableStatuses.includes(status)

  /* ---- edit lifecycle ---- */
  const startEdit = () => {
    const initial: Record<string, Draft> = {}
    tree.leafKeys.forEach(k => { initial[k] = toDraft(tree.byKey.get(k)!.values) })
    setDrafts(initial)
    setBaseline(initial)
    const days: DayDraft = { completion: dayToDraft(savedDays.completion), payment: dayToDraft(savedDays.payment) }
    setDayDrafts(days)
    setDayBaseline(days)
    setSaveError(null)
    setShowErrors(false)
    setIsEditing(true)
  }

  const exitEdit = () => {
    setIsEditing(false)
    setDrafts({})
    setBaseline({})
    setDayDrafts({ completion: '', payment: '' })
    setDayBaseline({ completion: '', payment: '' })
    setSaveError(null)
    setShowErrors(false)
  }

  const cancelEdit = () => {
    exitEdit()
  }

  const revealErrorRows = () => {
    setExpandedKeys(prev => {
      const next = new Set(prev)
      Object.keys(errors).forEach(leaf => {
        let p = tree.byKey.get(leaf)?.parentKey ?? null
        while (p) { next.add(p); p = tree.byKey.get(p)?.parentKey ?? null }
      })
      return next
    })
  }

  const buildPatch = (): QuotationSavePatch => {
    const F = LINE_FIELDS
    const updated = (lines as unknown as Record<string, unknown>[]).map((line, i) => {
      const node = tree.byKey.get(tree.keyByIndex[i])
      if (!node || node.isGroup || !drafts[node.key]) return line
      const v = parseDraft(drafts[node.key])
      const out: Record<string, unknown> = { ...line }
      // Write to the name the row actually uses (e.g. "Rate" vs "TotalRate")
      const kf = (f: keyof typeof LINE_FIELDS) => aliasKeys(f).find(k => k in line) ?? F[f]
      // The API stores 0 for "not entered"; tax is written on every item row
      out[kf('labour')] = v.labour ?? 0
      out[kf('material')] = v.material ?? 0
      out[kf('pnm')] = v.pnm ?? 0
      out[kf('contractRate')] = v.contractRate ?? 0
      TAX_FIELDS.forEach(f => { out[kf(f as 'cgst')] = v[f] ?? 0 })
      if (LINE_AMOUNT_KEY in line) out[LINE_AMOUNT_KEY] = totals.get(node.key)?.contractBase ?? 0
      return out
    })
    return {
      ContractRequisitionQuotationTermsId: n0(activeTerms?.[0]?.ContractRequisitionQuotationTermsId),
      ContractRequisitionQuotationData: updated as unknown as QuotationLineLike[],
      Total: grand.contract,
      ExpectedCompletionInDays: draftToDays(dayDrafts.completion) ?? 0,
      ExpectedPaymentInDays: draftToDays(dayDrafts.payment) ?? 0,
      summary: {
        taxable: grand.contractBase, cgst: grand.cgst, sgst: grand.sgst,
        ugst: grand.ugst, igst: grand.igst, grandTotal: grand.contract
      }
    }
  }

  const handleSave = async () => {
    if (saving) return
    setShowErrors(true)
    if (errorCount > 0) { revealErrorRows(); return }
    if (!isDirty) { exitEdit(); return }

    const patch = buildPatch()
    setSaving(true)
    setSaveError(null)
    try {
      await onSave?.(patch)
      setLines(patch.ContractRequisitionQuotationData)
      setSavedDays({ completion: draftToDays(dayDrafts.completion), payment: draftToDays(dayDrafts.payment) })
      exitEdit()
      if (loadTerms && !vendorHasTerms) setStale(true)
      collapseCard()
    } catch (err) {
      setSaveError(err instanceof Error && err.message ? err.message : 'Could not save changes. Try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleFieldChange = (key: string, field: EditableField, raw: string) => {
    const value = raw.replace(/,/g, '').replace(/\s/g, '')
    if (!isAllowedInput(field, value)) return
    setDrafts(prev => {
      const next: Draft = { ...prev[key], [field]: value }
      // Editing a breakup component keeps the contract rate in sync with the sum
      if (BREAKUP_FIELDS.includes(field)) {
        const sum = round2(BREAKUP_FIELDS.reduce((s, f) => {
          const n = Number(next[f])
          return s + (Number.isFinite(n) ? n : 0)
        }, 0))
        next.contractRate = sum > 0 ? String(sum) : ''
      }
      return { ...prev, [key]: next }
    })
  }

  const handleDayChange = (field: DayField, raw: string) => {
    const value = raw.replace(/\s/g, '')
    if (!DAYS_INPUT.test(value)) return
    setDayDrafts(prev => ({ ...prev, [field]: value }))
  }

  /** "007" -> "7" */
  const handleDayBlur = (field: DayField) =>
    setDayDrafts(prev => {
      const raw = prev[field]
      const clean = raw === '' ? '' : String(Number(raw))
      return clean === raw ? prev : { ...prev, [field]: clean }
    })

  /** Tidies the value on blur: "007." -> "7", "." -> "" */
  const handleFieldBlur = (key: string, field: EditableField) => {
    setDrafts(prev => {
      const raw = prev[key]?.[field] ?? ''
      const n = Number(raw)
      const clean = raw === '' || !Number.isFinite(n) ? '' : String(n)
      return clean === raw ? prev : { ...prev, [key]: { ...prev[key], [field]: clean } }
    })
  }

  /* ---- header stats ---- */
  const totalVar = variance(grand.boqQuoted, grand.contractBase)
  const dash = !hasItems
  const isVerified = vendor.VerifiedNonVerified === 'Verified'
  const showApprovalActions = canApprove && !!vendor.IsFinalized

  /* ---- cell renderers ---- */
  const cellBase = 'px-3 py-2 text-xs text-gray-900 border-r border-gray-100 align-middle'
  const alignClass = (a: ColumnDef['align']) =>
    a === 'center' ? 'text-center' : a === 'right' ? 'text-right' : 'text-left'

  const renderVariance = (t: Totals, quoted = true) => {
    const v = quoted ? variance(t.boqQuoted, t.contractBase) : null
    return <span className={`font-medium ${varianceClass(v)}`}>{varianceText(v)}</span>
  }

  const renderLeafCell = (col: ColumnDef, row: FlatRow) => {
    const field = col.key as EditableField
    const draft = drafts[row.key]

    if (isEditing && draft && EDITABLE_FIELDS.includes(field)) {
      return (
        <EditableCell
          value={draft[field]}
          error={errors[row.key]?.[field]}
          disabled={saving || isFieldDisabled(field, draft)}
          placeholder={isTaxField(field) ? '0' : '0.00'}
          ariaLabel={`${FIELD_LABEL[field]} for ${row.node.name}`}
          onChange={(v) => handleFieldChange(row.key, field, v)}
          onBlur={() => handleFieldBlur(row.key, field)}
        />
      )
    }

    const t = totals.get(row.key)!
    const values = draft ? parseDraft(draft) : row.node.values
    switch (col.key) {
      case 'unit': return row.node.unit || '—'
      case 'quantity': return formatQty(row.node.qty)
      case 'labour':
      case 'material':
      case 'pnm':
      case 'contractRate':
        return isNum(values[field]) ? formatCurrency(values[field]) : '—'
      case 'cgst':
      case 'sgst':
      case 'ugst':
      case 'igst':
        return isNum(values[field]) && values[field]! > 0 ? formatPct(values[field]) : '—'
      case 'contractAmount':
        return <span className="font-semibold">{formatCurrency(t.contract)}</span>
      case 'variance':
        return renderVariance(t, t.contractRate > 0)
      default: return null
    }
  }

  const renderGroupCell = (col: ColumnDef, row: FlatRow) => {
    const t = totals.get(row.key)!
    if (col.key === 'contractAmount') return <span className="font-semibold">{formatCurrency(t.contract)}</span>
    if (col.key === 'variance') return renderVariance(t)
    return <span className="text-gray-400">—</span>
  }

  const renderRow = (row: FlatRow) => {
    const { node } = row
    const rowHasError = !!errors[row.key]
    const isOpen = expandedKeys.has(row.key)
    const rowBg = rowHasError ? 'bg-red-50' : 'bg-white'
    const notQuoted = !node.isGroup && n0(node.qty) > 0 && n0(totals.get(row.key)?.contractRate) === 0

    return (
      <tr
        key={row.key}
        className={`border-b border-gray-200 transition-colors duration-200 ${rowBg}
          ${node.isGroup && row.depth === 0 ? 'h-12 border-t border-gray-300' : node.isGroup ? 'h-10' : 'min-h-12'}`}
      >
        {COLUMNS.map(col => {
          if (col.key === 'wbs') {
            return (
              <td
                key={col.key}
                className={`${cellBase} sticky left-0 z-20 shadow-[2px_0_4px_rgba(0,0,0,0.06)] ${rowBg}`}
                style={{ width: col.width, minWidth: col.width, paddingLeft: 12 + row.depth * 18 }}
              >
                <div className="flex items-center gap-2">
                  {node.isGroup ? (
                    <button
                      type="button"
                      onClick={() => toggleNode(row.key)}
                      aria-expanded={isOpen}
                      aria-label={`${isOpen ? 'Collapse' : 'Expand'} ${node.name}`}
                      disabled={node.children.length === 0}
                      className="shrink-0 rounded p-0.5 text-gray-500 hover:bg-gray-100 disabled:opacity-30"
                    >
                      {isOpen ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
                    </button>
                  ) : (
                    <span className="w-[18px] shrink-0" />
                  )}
                  <CodeBadge code={node.code} depth={node.isGroup ? row.depth : 3} />
                  <span
                    className={`min-w-0 leading-snug ${node.isGroup
                      ? `font-semibold text-gray-900 ${row.depth === 0 ? 'text-[13px]' : ''}`
                      : 'line-clamp-2 text-[11px] text-gray-800'}`}
                    title={node.name}
                  >
                    {node.name}
                  </span>
                  {notQuoted && (
                    <span className="shrink-0 rounded bg-amber-50 px-1 text-[10px] font-medium text-amber-700">
                      Not quoted
                    </span>
                  )}
                  {node.remarks && (
                    <span title={node.remarks} className="shrink-0 text-gray-400">
                      <Info className="h-3.5 w-3.5" aria-label={`Remarks: ${node.remarks}`} />
                    </span>
                  )}
                </div>
              </td>
            )
          }
          return (
            <td
              key={col.key}
              className={`${cellBase} ${alignClass(col.align)} tabular-nums`}
              style={{ width: col.width, minWidth: col.width }}
            >
              {node.isGroup ? renderGroupCell(col, row) : renderLeafCell(col, row)}
            </td>
          )
        })}
      </tr>
    )
  }

  return (
    <div className={`rounded-lg border border-gray-200 bg-white shadow-sm ${className}`}>
      <div
        className="flex cursor-pointer flex-wrap items-center gap-x-6 gap-y-3 px-4 py-3"
        onClick={toggleExpanded}
      >
        <div className="flex min-w-[200px] items-start gap-3" onClick={(e) => e.stopPropagation()}>
          <input
            type="checkbox"
            checked={isChecked}
            disabled={checkDisabled}
            onChange={(e) => handleChecked(e.target.checked)}
            aria-label={`Select ${vendor.VendorName ?? 'vendor'}`}
            className="mt-1 h-4 w-4 cursor-pointer rounded border-gray-300 accent-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
          />
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="truncate text-base font-medium text-gray-900">{vendor.VendorName || '—'}</span>
              <button
                type="button"
                onClick={handleCopy}
                aria-label="Copy quotation code"
                className="rounded p-0.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-green-600" /> : <Copy className="h-3.5 w-3.5" />}
              </button>
            </div>
            <div className="mt-0.5 flex flex-wrap items-center gap-1.5">
              {vendor.CompanyName && <span className="truncate text-xs text-gray-600">{vendor.CompanyName}</span>}
              {status && (
                <span className={`rounded border px-1.5 text-[10px] font-medium leading-4 ${STATUS_STYLE[status] ?? 'border-slate-200 bg-slate-50 text-slate-600'}`}>
                  {status}
                </span>
              )}
              {isVerified && (
                <span className="rounded border border-blue-200 bg-blue-50 px-1.5 text-[10px] font-medium leading-4 text-blue-700">
                  Verified
                </span>
              )}
            </div>
          </div>
        </div>

        {[
          { label: 'Contract Value', value: dash ? '—' : formatCurrency(grand.contract), cls: 'text-blue-600' },
          { label: 'BOQ Base Value', value: dash ? '—' : formatCurrency(grand.boq), cls: 'text-amber-600' },
          { label: 'VAR. VS BOQ', value: dash ? '—' : varianceText(totalVar), cls: dash ? 'text-gray-500' : varianceClass(totalVar) },
          ...(vendor.ValidTill ? [{ label: 'Valid Till', value: formatDate(vendor.ValidTill), cls: 'text-green-700' }] : [])
        ].map(stat => (
          <div key={stat.label} className="min-w-[120px] border-l border-gray-100 pl-4">
            <p className="text-xs text-gray-400">{stat.label}</p>
            {isTableLoading
              ? <div className="mt-1 h-4 w-20 animate-pulse rounded bg-gray-200" />
              : <p className={`mt-1 text-sm font-semibold tabular-nums ${stat.cls}`}>{stat.value}</p>}
          </div>
        ))}

        <div className="ml-auto flex items-center gap-2">
          {showApprovalActions && (
            <div onClick={(e) => e.stopPropagation()}>
              <ApprovalActions
                approvalStatus={vendor.VendorFinalizationApproval ?? undefined}
                onApprove={() => onApprove?.(vendor)}
                onReject={() => onReject?.(vendor)}
                showApproval={vendor.IsApproval === true}
                isIcons={true}
                onHistory={() => onApprovalHistory?.(vendor)}
              />
            </div>
          )}
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); toggleExpanded() }}
            aria-expanded={isExpanded}
            aria-label={isExpanded ? 'Collapse quotation' : 'Expand quotation'}
            className="rounded-md bg-gray-100 p-1 text-gray-700 transition-colors hover:bg-gray-200"
          >
            <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="border-t border-gray-100">
          {/* Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3">
            <h3 className="text-sm font-semibold text-gray-900">Quotation</h3>
            <div className="flex items-center gap-2">
              {isEditing ? (
                <>
                  <button
                    type="button"
                    onClick={cancelEdit}
                    disabled={saving}
                    className="inline-flex h-8 items-center gap-1 rounded-md border border-gray-300 px-3 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <X className="h-3.5 w-3.5" /> Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={saving || !isDirty}
                    className="inline-flex h-8 items-center gap-1 rounded-md bg-blue-600 px-3 text-xs font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                    {saving ? 'Saving…' : 'Save changes'}
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={startEdit}
                  disabled={isLocked || isTableLoading || !!fetchError || tree.leafKeys.length === 0}
                  title={isLocked ? 'This quotation can no longer be edited' : undefined}
                  className="inline-flex h-8 items-center gap-1 rounded-md bg-blue-600 px-5 text-xs font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Pencil className="h-3.5 w-3.5" /> Edit
                </button>
              )}
            </div>
          </div>

          {isEditing && ((errorCount > 0 && showErrors) || saveError) && (
            <div role="alert" className="mx-4 mb-3 flex items-start gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>
                {saveError ?? `Fix ${errorCount} highlighted ${errorCount === 1 ? 'field' : 'fields'} before saving.`}
              </span>
            </div>
          )}
          {isEditing && !(errorCount > 0 && showErrors) && !saveError && (
            <p className="mx-4 mb-3 text-xs text-gray-500">
              Edit rates and tax on item rows, and the expected days below the table. Contract rate follows the Labour + Material + P&amp;M breakup; group totals recalculate as you type.
            </p>
          )}

          <div
            ref={scrollRef}
            className="thin-scroll overflow-auto border-t border-gray-200"
            style={{ maxHeight: tableMaxHeight }}
            aria-busy={isTableLoading}
          >
            {isTableLoading && <span role="status" className="sr-only">Loading quotation…</span>}
            <table className="min-w-full border-collapse">
              <thead>
                <tr style={{ height: HEADER_ROW_1 }}>
                  {GROUPS.map(g => (
                    <th
                      key={g.key}
                      colSpan={COLUMNS.filter(c => c.group === g.key).length}
                      className={`sticky top-0 z-30 border-r border-white/10 px-4 text-xs font-medium tracking-wide text-white
                        ${g.key === 'item' ? 'text-left' : 'text-center'}`}
                      style={{ backgroundColor: g.bg, height: HEADER_ROW_1 }}
                    >
                      {g.label}
                    </th>
                  ))}
                </tr>
                <tr className="h-10">
                  {COLUMNS.map(col => {
                    const group = GROUPS.find(g => g.key === col.group)!
                    const isWbs = col.key === 'wbs'
                    return (
                      <th
                        key={col.key}
                        className={`sticky z-30 whitespace-normal border-r border-white/10 px-3 py-1 text-[11px] font-medium leading-tight text-white
                          ${alignClass(col.align === 'right' ? 'center' : col.align)}
                          ${isWbs ? 'left-0 z-40 shadow-[2px_0_4px_rgba(0,0,0,0.15)]' : ''}`}
                        style={{
                          top: HEADER_ROW_1,
                          width: col.width,
                          minWidth: col.width,
                          backgroundColor: isWbs ? '#1E3A6E' : group.bg
                        }}
                      >
                        {col.label}
                      </th>
                    )
                  })}
                </tr>
              </thead>

              <tbody className="bg-white">
                {isTableLoading ? (
                  <QuotationTableSkeletonBody />
                ) : fetchError ? (
                  <tr>
                    <td colSpan={COLUMNS.length} className="py-10">
                      <div className="mx-auto flex max-w-sm flex-col items-center gap-2 text-center text-sm text-gray-600">
                        <AlertCircle className="h-5 w-5 text-red-500" />
                        <p>{fetchError}</p>
                        <button
                          type="button"
                          onClick={() => setFetchError(null)}
                          className="h-8 rounded-md border border-gray-300 px-4 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-50"
                        >
                          Retry
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : !hasItems ? (
                  <tr>
                    <td colSpan={COLUMNS.length} className="py-10">
                      <NoDataView message={emptyMessage} />
                    </td>
                  </tr>
                ) : (
                  rows.map(renderRow)
                )}
              </tbody>

              {isTableLoading && <QuotationTableSkeletonFooter />}

              {!isTableLoading && hasItems && (
                <tfoot className="sticky bottom-0 z-30">
                  <tr className="h-11 text-xs font-semibold text-white">
                    {COLUMNS.map(col => {
                      let content: React.ReactNode = null
                      switch (col.key) {
                        case 'quantity': content = formatQty(grand.qty); break
                        case 'labour': content = grand.labour > 0 ? formatCurrency(grand.labour) : '—'; break
                        case 'material': content = grand.material > 0 ? formatCurrency(grand.material) : '—'; break
                        case 'pnm': content = grand.pnm > 0 ? formatCurrency(grand.pnm) : '—'; break
                        case 'contractRate': content = grand.contractRate > 0 ? formatCurrency(grand.contractRate) : '—'; break
                        case 'cgst':
                        case 'sgst':
                        case 'ugst':
                        case 'igst': {
                          const pct = grand.contractBase > 0
                            ? (grand[col.key as 'cgst'] / grand.contractBase) * 100
                            : 0
                          content = (
                            <span className="rounded bg-yellow-400/90 px-1.5 py-0.5 text-[11px] text-yellow-950">
                              {formatPct(pct)}
                            </span>
                          )
                          break
                        }
                        case 'contractAmount': content = formatCurrency(grand.contract); break
                        case 'variance':
                          content = (
                            <span className={totalVar === null ? 'text-gray-300' : totalVar > 0 ? 'text-red-400' : 'text-green-400'}>
                              {varianceText(totalVar)}
                            </span>
                          )
                          break
                      }
                      return (
                        <td
                          key={col.key}
                          className={`px-3 tabular-nums ${alignClass(col.align === 'right' ? 'center' : col.align)}
                            ${col.key === 'wbs' ? 'sticky left-0 z-20' : ''}`}
                          style={{ backgroundColor: '#12284C', borderTop: '2px solid #2F5BEA' }}
                        >
                          {content}
                        </td>
                      )
                    })}
                  </tr>
                </tfoot>
              )}
            </table>
          </div>

          {/* Expected completion / payment days */}
          {isTableLoading && <TermsDaysSkeleton />}
          {!isTableLoading && hasItems && (
            <TermsDays
              values={savedDays}
              editing={isEditing}
              drafts={dayDrafts}
              errors={dayErrors}
              disabled={saving}
              onChange={handleDayChange}
              onBlur={handleDayBlur}
            />
          )}

          {/* Tax summary */}
          {isTableLoading && <TaxSummarySkeleton />}
          {!isTableLoading && hasItems && (
            <TaxSummary
              taxable={grand.contractBase}
              cgst={grand.cgst}
              sgst={grand.sgst}
              ugst={grand.ugst}
              igst={grand.igst}
              grandTotal={grand.contract}
            />
          )}
        </div>
      )}
    </div>
  )
}

interface QuotationCardListProps {
  vendors: VendorQuotationLike[]
  onSave?: (vendor: VendorQuotationLike, patch: QuotationSavePatch) => void | Promise<void>
  onSelectionChange?: (selected: VendorQuotationLike[]) => void
  className?: string
}

const vendorKey = (v: VendorQuotationLike, i: number) => String(v.UniqueKey ?? v.VendorId ?? i)

export const QuotationCardList: React.FC<QuotationCardListProps> = ({
  vendors, onSave, onSelectionChange, className = ''
}) => {
  const [selected, setSelected] = useState<Set<string>>(new Set())

  const handleCheck = (key: string, checked: boolean) => {
    const next = new Set(selected)
    checked ? next.add(key) : next.delete(key)
    setSelected(next)
    onSelectionChange?.(vendors.filter((v, i) => next.has(vendorKey(v, i))))
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {vendors.map((vendor, i) => {
        const key = vendorKey(vendor, i)
        return (
          <QuotationCard
            key={key}
            vendor={vendor}
            checked={selected.has(key)}
            onCheckedChange={(c) => handleCheck(key, c)}
            onSave={onSave ? (patch) => onSave(vendor, patch) : undefined}
          />
        )
      })}
    </div>
  )
}

export default QuotationCard