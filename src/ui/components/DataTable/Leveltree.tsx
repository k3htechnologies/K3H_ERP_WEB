import React from 'react'
import { ChevronRight, ChevronDown, AlertTriangle, CheckCircle2 } from 'lucide-react'
import { isDevelopment } from '@/core/config'
import type { TableColumn } from '@/ui/components/DataTable/DataTable'
import NoDataView from '../NoDataView/NoDataView'

export interface LevelFieldPair {
  idKey: string
  nameKey: string
}

export interface LevelTreeConfig<T> {
  idKey?: keyof T & string
  levels?: LevelFieldPair[]
  depthKey?: keyof T & string
  parseDepth?: (value: unknown) => number | null
  titleKey?: (keyof T & string) | ((row: T) => React.ReactNode)
  codeKey?: keyof T & string
}

type AnyRow = Record<string, any>
type CheckState = 'checked' | 'unchecked' | 'indeterminate'
export type RowId = string | number

interface ResolvedLevelConfig<T extends AnyRow> {
  levels: LevelFieldPair[]
  getId: (row: T) => RowId
  getDepth: (row: T) => number
  getTitle: (row: T) => React.ReactNode
  getCode: (row: T) => string
}

interface LevelNode<T> {
  row: T
  id: RowId
  code: string
  depth: number
  title: React.ReactNode
  index: number
  children: LevelNode<T>[]
  leafIds: RowId[]
}

interface StickyOffsets {
  left: Map<string, number>
  right: Map<string, number>
}

const LEVEL_ID_RE = /^LevelId(\d+)$/
const LEVEL_NAME_RE = /^Level(\d+)Name$/
const TRAILING_DIGITS_RE = /(\d+)\s*$/
const TITLE_FALLBACK_FIELDS = ['CategoryName', 'Name', 'Title', 'Label']
const ACTION_COLUMN_KEY = 'Actions'
const DEFAULT_LEVEL_ROW_COLORS = ['#F3F4F6', '#F9FAFB', '#FFFFFF']
const LEVEL_TEXT = ['font-semibold text-gray-900', 'font-medium text-gray-800', 'text-gray-700']
const INDENT_BASE_PX = 8
const INDENT_STEP_PX = 20
const CHECKBOX_COL_WIDTH = 40
const DEFAULT_COLUMN_WIDTH = '120px'
const DEFAULT_COLUMN_WIDTH_PX = 120
const DEFAULT_ACTION_WIDTH = '96px'
const DEFAULT_ACTION_WIDTH_PX = 96

const detectLevels = (sample: AnyRow): LevelFieldPair[] => {
  const idByNum = new Map<number, string>()
  const nameByNum = new Map<number, string>()

  for (const key of Object.keys(sample)) {
    const idMatch = key.match(LEVEL_ID_RE)
    if (idMatch) idByNum.set(Number(idMatch[1]), key)
    const nameMatch = key.match(LEVEL_NAME_RE)
    if (nameMatch) nameByNum.set(Number(nameMatch[1]), key)
  }

  const nums = Array.from(idByNum.keys())
    .filter((n) => nameByNum.has(n))
    .sort((a, b) => a - b)

  return nums.map((n) => ({ idKey: idByNum.get(n)!, nameKey: nameByNum.get(n)! }))
}

const detectIdKey = (sample: AnyRow, levels: LevelFieldPair[]): string | null => {
  const levelIdKeys = new Set(levels.map((l) => l.idKey))
  const preferred = ['Id', 'ItemId', 'RowId', 'RecordId', 'UniqueKey']
  for (const key of preferred) {
    if (key in sample) return key
  }
  return Object.keys(sample).find((k) => /Id$/.test(k) && !levelIdKeys.has(k)) ?? null
}

const defaultParseDepth = (value: unknown): number | null => {
  if (typeof value === 'number') return value
  const match = String(value ?? '').match(TRAILING_DIGITS_RE)
  return match ? Number(match[1]) : null
}

const isPopulated = (value: unknown): boolean => {
  if (value === null || value === undefined || value === '') return false
  if (typeof value === 'number') return value !== 0
  return true
}

const resolveLevelConfig = <T extends AnyRow>(
  sample: T | undefined,
  config: LevelTreeConfig<T> | undefined
): ResolvedLevelConfig<T> | null => {
  if (!sample) return null
  const isDevelopmentMode = isDevelopment()

  const levels = config?.levels?.length ? config.levels : detectLevels(sample)
  if (levels.length === 0) {
    if (isDevelopmentMode) {
      console.warn('LevelTree: could not detect any hierarchy levels. Pass config.levels explicitly.')
    }
    return null
  }

  const idKey = config?.idKey ?? detectIdKey(sample, levels) ?? undefined
  const parseDepth = config?.parseDepth ?? defaultParseDepth
  const depthKey = config?.depthKey

  const getAutoDepth = (row: T): number => {
    let depth = 1
    for (let i = 0; i < levels.length; i++) {
      if (isPopulated((row as AnyRow)[levels[i].idKey])) depth = i + 1
    }
    return depth
  }

  const getDepth = (row: T): number => {
    if (depthKey) {
      const parsed = parseDepth((row as AnyRow)[depthKey])
      if (parsed && parsed >= 1) return Math.min(parsed, levels.length)
    }
    return getAutoDepth(row)
  }

  const getCode = (row: T): string => {
    if (config?.codeKey) return String((row as AnyRow)[config.codeKey] ?? '')
    const depth = getDepth(row)
    return levels
      .slice(0, depth)
      .map((l) => String((row as AnyRow)[l.idKey]))
      .join('.')
  }

  const getTitle = (row: T): React.ReactNode => {
    if (typeof config?.titleKey === 'function') return config.titleKey(row)
    if (config?.titleKey) return (row as AnyRow)[config.titleKey]

    const depth = getDepth(row)
    for (let i = depth - 1; i >= 0; i--) {
      const name = (row as AnyRow)[levels[i].nameKey]
      if (isPopulated(name)) return name
    }
    for (const field of TITLE_FALLBACK_FIELDS) {
      if (isPopulated((row as AnyRow)[field])) return (row as AnyRow)[field]
    }
    return getCode(row)
  }

  const getId = (row: T): RowId => {
    if (idKey && isPopulated((row as AnyRow)[idKey])) return (row as AnyRow)[idKey]
    return getCode(row)
  }

  return { levels, getId, getDepth, getTitle, getCode }
}

const parentCode = (code: string): string | null => {
  const parts = code.split('.')
  if (parts.length <= 1) return null
  return parts.slice(0, -1).join('.')
}

const buildLevelTree = <T extends AnyRow>(
  rows: T[] | null | undefined,
  resolved: ResolvedLevelConfig<T> | null
): LevelNode<T>[] => {
  if (!Array.isArray(rows) || rows.length === 0 || !resolved) return []

  const byCode = new Map<string, LevelNode<T>>()
  const roots: LevelNode<T>[] = []

  rows.forEach((row, index) => {
    const code = resolved.getCode(row)
    if (!code || byCode.has(code)) return
    byCode.set(code, {
      row,
      id: resolved.getId(row),
      code,
      depth: resolved.getDepth(row),
      title: resolved.getTitle(row),
      index,
      children: [],
      leafIds: []
    })
  })

  for (const node of byCode.values()) {
    const parent = parentCode(node.code)
    const parentNode = parent ? byCode.get(parent) : undefined
    if (parentNode) parentNode.children.push(node)
    else roots.push(node)
  }

  const codeCompare = (a: LevelNode<T>, b: LevelNode<T>) => a.code.localeCompare(b.code, undefined, { numeric: true })

  const finalize = (node: LevelNode<T>): RowId[] => {
    node.children.sort(codeCompare)
    node.leafIds = node.children.length === 0 ? [node.id] : node.children.flatMap(finalize)
    return node.leafIds
  }
  roots.sort(codeCompare)
  roots.forEach(finalize)

  return roots
}

const getCheckState = (leafIds: RowId[], selected: Set<RowId>): CheckState => {
  if (leafIds.length === 0) return 'unchecked'
  let selectedCount = 0
  for (const id of leafIds) {
    if (selected.has(id)) selectedCount++
  }
  if (selectedCount === 0) return 'unchecked'
  if (selectedCount === leafIds.length) return 'checked'
  return 'indeterminate'
}

const setsAreEqual = <V,>(a: Set<V>, b: Set<V>): boolean => {
  if (a.size !== b.size) return false
  for (const v of a) {
    if (!b.has(v)) return false
  }
  return true
}

const dedupeColumns = (columns: TableColumn[] | undefined): TableColumn[] => {
  if (!columns || columns.length === 0) return []
  const seen = new Set<string>()
  const result: TableColumn[] = []
  const isDevelopmentMode = isDevelopment()
  for (const col of columns) {
    if (seen.has(col.key)) {
      if (isDevelopmentMode) console.warn(`LevelTree: duplicate column key "${col.key}" - only the first was kept.`)
      continue
    }
    seen.add(col.key)
    result.push(col)
  }
  return result
}

const splitActionColumn = (columns: TableColumn[]): { columns: TableColumn[]; actionColumn: TableColumn | undefined } => {
  const actionColumn = columns.find((c) => c.key === ACTION_COLUMN_KEY)
  if (!actionColumn) return { columns, actionColumn: undefined }
  return { columns: columns.filter((c) => c.key !== ACTION_COLUMN_KEY), actionColumn }
}

const parseWidthPx = (width: string | undefined, fallback: number): number => {
  if (!width) return fallback
  const parsed = parseFloat(width)
  return Number.isFinite(parsed) ? parsed : fallback
}

const computeStickyOffsets = (columns: TableColumn[], selectable: boolean, actionColumn: TableColumn | undefined): StickyOffsets => {
  const left = new Map<string, number>()
  let leftOffset = selectable ? CHECKBOX_COL_WIDTH : 0
  for (const col of columns) {
    if (col.fixed === 'left') {
      left.set(col.key, leftOffset)
      leftOffset += parseWidthPx(col.width, DEFAULT_COLUMN_WIDTH_PX)
    }
  }

  const right = new Map<string, number>()
  let rightOffset = actionColumn ? parseWidthPx(actionColumn.width, DEFAULT_ACTION_WIDTH_PX) : 0
  for (let i = columns.length - 1; i >= 0; i--) {
    const col = columns[i]
    if (col.fixed === 'right') {
      right.set(col.key, rightOffset)
      rightOffset += parseWidthPx(col.width, DEFAULT_COLUMN_WIDTH_PX)
    }
  }

  return { left, right }
}

const alignClassName = (align: TableColumn['align'], fallback: 'left' | 'center' | 'right' = 'left'): string => {
  const resolved = align ?? fallback
  return resolved === 'right' ? 'text-right' : resolved === 'center' ? 'text-center' : 'text-left'
}

const depthRowColor = (depth: number, colors: string[]): string => colors[Math.min(depth - 1, colors.length - 1)]
const depthText = (depth: number): string => LEVEL_TEXT[Math.min(depth - 1, LEVEL_TEXT.length - 1)]
const depthIndentPx = (depth: number): number => INDENT_BASE_PX + (depth - 1) * INDENT_STEP_PX

const renderCellValue = (column: TableColumn, row: AnyRow, index: number): React.ReactNode => {
  const value = row[column.key]
  const content = column.render ? column.render(value, row, index) : value
  return (
    <div
      className={`${column.truncate !== false ? 'truncate whitespace-nowrap' : ''} max-w-full`}
      style={{ maxWidth: column.maxWidth || column.width || '200px' }}
    >
      {content}
    </div>
  )
}

interface CellErrorBoundaryProps {
  children: React.ReactNode
}

interface CellErrorBoundaryState {
  hasError: boolean
}

class CellErrorBoundary extends React.Component<CellErrorBoundaryProps, CellErrorBoundaryState> {
  constructor(props: CellErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }
  static getDerivedStateFromError() {
    return { hasError: true }
  }
  componentDidCatch(error: Error, info: React.ErrorInfo) {
    if (isDevelopment()) console.error('LevelTree: a column render() threw.', error, info)
  }
  render() {
    if (this.state.hasError) {
      return (
        <span className="text-red-400 text-xs" title="This cell failed to render">
          —
        </span>
      )
    }
    return this.props.children
  }
}

interface TriStateCheckboxProps {
  state: CheckState
  onChange: () => void
  disabled?: boolean
  label?: string
}

const TriStateCheckbox: React.FC<TriStateCheckboxProps> = ({ state, onChange, disabled, label }) => {
  const ref = React.useRef<HTMLInputElement>(null)
  React.useEffect(() => {
    if (ref.current) ref.current.indeterminate = state === 'indeterminate'
  }, [state])

  return (
    <input
      ref={ref}
      type="checkbox"
      checked={state === 'checked'}
      disabled={disabled}
      onChange={onChange}
      onClick={(e) => e.stopPropagation()}
      aria-label={label}
      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-300 cursor-pointer disabled:cursor-not-allowed disabled:opacity-40"
    />
  )
}

interface LevelTreeRowProps<T extends AnyRow> {
  node: LevelNode<T>
  collapsed: Set<string>
  onToggleCollapse: (code: string) => void
  selectable: boolean
  selected: Set<RowId>
  onToggleSelect: (leafIds: RowId[], nextChecked: boolean) => void
  selectionDisabled: boolean
  columns: TableColumn[]
  actionColumn?: TableColumn
  treeColumnKey?: string
  offsets: StickyOffsets
  levelRowColors: string[]
}

const LevelTreeRow = <T extends AnyRow>({
  node,
  collapsed,
  onToggleCollapse,
  selectable,
  selected,
  onToggleSelect,
  selectionDisabled,
  columns,
  actionColumn,
  treeColumnKey,
  offsets,
  levelRowColors
}: LevelTreeRowProps<T>) => {
  const { row, children, leafIds, depth, code, title, index } = node
  const hasChildren = children.length > 0
  const isCollapsed = collapsed.has(code)
  const rowColor = depthRowColor(depth, levelRowColors)
  const state = selectable ? getCheckState(leafIds, selected) : 'unchecked'

  return (
    <>
      <tr className={`border-b border-gray-100 ${depthText(depth)}`} style={{ backgroundColor: rowColor }}>
        {selectable && (
          <td className="sticky left-0 z-10 py-2 pl-3 pr-1" style={{ width: CHECKBOX_COL_WIDTH, backgroundColor: rowColor }}>
            <TriStateCheckbox
              state={state}
              disabled={selectionDisabled}
              label={`Select ${typeof title === 'string' ? title : code}`}
              onChange={() => onToggleSelect(leafIds, state !== 'checked')}
            />
          </td>
        )}

        {columns.map((col) => {
          const isTreeCol = col.key === treeColumnKey
          const isFixed = col.fixed === 'left' || col.fixed === 'right'
          const cellStyle: React.CSSProperties = {
            width: col.width || DEFAULT_COLUMN_WIDTH,
            minWidth: col.width || DEFAULT_COLUMN_WIDTH,
            ...(col.fixed === 'left' ? { left: offsets.left.get(col.key) } : {}),
            ...(col.fixed === 'right' ? { right: offsets.right.get(col.key) } : {}),
            ...(isTreeCol ? { paddingLeft: depthIndentPx(depth) } : {}),
            ...(isFixed ? { backgroundColor: rowColor } : {})
          }

          return (
            <td
              key={col.key}
              className={`  py-2 px-2   border-r border-gray-200  ${alignClassName(col.align)}  ${isFixed ? 'sticky z-10' : ''}`} style={cellStyle}
            >
              {isTreeCol ? (
                <div className="flex items-center gap-1.5">
                  {hasChildren ? (
                    <button
                      type="button"
                      onClick={() => onToggleCollapse(code)}
                      className="text-gray-400 hover:text-gray-600 shrink-0"
                      aria-label={isCollapsed ? 'Expand' : 'Collapse'}
                    >
                      {isCollapsed ? <ChevronRight size={18} /> : <ChevronDown size={18} />}
                    </button>
                  ) : (
                    <span className="w-3.5 shrink-0" />
                  )}
                  <CellErrorBoundary>{renderCellValue(col, row, index)}</CellErrorBoundary>
                </div>
              ) : (
                <CellErrorBoundary>{renderCellValue(col, row, index)}</CellErrorBoundary>
              )}
            </td>
          )
        })}

        {actionColumn && (
          <td
            className="sticky right-0 z-10 py-2 px-2 border-l border-r border-gray-200"
            style={{ width: actionColumn.width || DEFAULT_ACTION_WIDTH, backgroundColor: rowColor }}
          >
            <div className={alignClassName(actionColumn.align, 'center')}>
              <CellErrorBoundary>{renderCellValue(actionColumn, row, index)}</CellErrorBoundary>
            </div>
          </td>
        )}
      </tr>
      {hasChildren &&
        !isCollapsed &&
        children.map((child) => (
          <LevelTreeRow
            key={child.code}
            node={child}
            collapsed={collapsed}
            onToggleCollapse={onToggleCollapse}
            selectable={selectable}
            selected={selected}
            onToggleSelect={onToggleSelect}
            selectionDisabled={selectionDisabled}
            columns={columns}
            actionColumn={actionColumn}
            treeColumnKey={treeColumnKey}
            offsets={offsets}
            levelRowColors={levelRowColors}
          />
        ))}
    </>
  )
}

interface LevelTreeProps<T extends AnyRow> {
  response: T[] | null | undefined
  config?: LevelTreeConfig<T>
  title?: string
  columns: TableColumn[]
  treeColumnKey?: string
  levelRowColors?: string[]
  selectable?: boolean
  initialSelectedIds?: RowId[]
  onSelectionChange?: (selectedIds: RowId[]) => void
  onSave?: (selectedIds: RowId[]) => Promise<void>
  loading?: boolean
  emptyMessage?: string
}

export const LevelTree = <T extends AnyRow>({
  response,
  config,
  title,
  columns: columnsProp,
  treeColumnKey,
  levelRowColors = DEFAULT_LEVEL_ROW_COLORS,
  selectable = false,
  initialSelectedIds,
  onSelectionChange,
  onSave,
  loading = false,
  emptyMessage = 'No data available'
}: LevelTreeProps<T>) => {
  const rows = response ?? []
  const isDevelopmentMode = isDevelopment()

  const { columns, actionColumn } = React.useMemo(() => {
    const deduped = dedupeColumns(columnsProp)
    return splitActionColumn(deduped)
  }, [columnsProp])

  const resolvedTreeColumnKey = treeColumnKey ?? columns[0]?.key

  if (isDevelopmentMode) {
    if (columns.length === 0) {
      console.warn('LevelTree: no columns were provided - nothing will render.')
    } else if (treeColumnKey && !columns.some((c) => c.key === treeColumnKey)) {
      console.warn(`LevelTree: treeColumnKey "${treeColumnKey}" does not match any column key. Falling back to the first column.`)
    }
    if (!selectable && (initialSelectedIds || onSave || onSelectionChange)) {
      console.warn('LevelTree: initialSelectedIds/onSave/onSelectionChange were passed but selectable is false.')
    }
  }

  const offsets = React.useMemo(() => computeStickyOffsets(columns, selectable, actionColumn), [columns, selectable, actionColumn])
  const resolved = React.useMemo(() => resolveLevelConfig(rows?.[0], config), [rows, config])
  const tree = React.useMemo(() => buildLevelTree(rows, resolved), [rows, resolved])
  const allLeafIds = React.useMemo(() => tree.flatMap((n) => n.leafIds), [tree])
  const validIds = React.useMemo(() => new Set(allLeafIds), [allLeafIds])

  const seedSelection = React.useCallback((): Set<RowId> => {
    if (!selectable || !initialSelectedIds || initialSelectedIds.length === 0) return new Set()
    const ids = new Set<RowId>()
    for (const id of initialSelectedIds) {
      if (validIds.has(id)) ids.add(id)
    }
    return ids
  }, [selectable, initialSelectedIds, validIds])

  const [selected, setSelected] = React.useState<Set<RowId>>(() => seedSelection())
  const [baseline, setBaseline] = React.useState<Set<RowId>>(() => seedSelection())
  const [collapsed, setCollapsed] = React.useState<Set<string>>(() => new Set())
  const [saving, setSaving] = React.useState(false)
  const [saveError, setSaveError] = React.useState<string | null>(null)
  const [savedJustNow, setSavedJustNow] = React.useState(false)

  const seededForRef = React.useRef<T[] | null | undefined>(undefined)
  React.useEffect(() => {
    if (seededForRef.current === response) return
    seededForRef.current = response
    const seeded = seedSelection()
    setSelected(seeded)
    setBaseline(seeded)
    setSaveError(null)
    setSavedJustNow(false)
  }, [response, seedSelection])

  const droppedPreviousCount = selectable
    ? (initialSelectedIds?.length ?? 0) - (initialSelectedIds ?? []).filter((id) => validIds.has(id)).length
    : 0

  const onToggleCollapse = React.useCallback((code: string) => {
    setCollapsed((prev) => {
      const next = new Set(prev)
      next.has(code) ? next.delete(code) : next.add(code)
      return next
    })
  }, [])

  const emitSelectionChange = React.useCallback(
    (nextSet: Set<RowId>) => {
      if (!onSelectionChange) return
      onSelectionChange(Array.from(nextSet))
    },
    [onSelectionChange]
  )

  const onToggleSelect = React.useCallback(
    (leafIds: RowId[], nextChecked: boolean) => {
      setSelected((prev) => {
        const next = new Set(prev)
        leafIds.forEach((id) => (nextChecked ? next.add(id) : next.delete(id)))
        emitSelectionChange(next)
        return next
      })
      setSaveError(null)
      setSavedJustNow(false)
    },
    [emitSelectionChange]
  )

  const masterState = selectable ? getCheckState(allLeafIds, selected) : 'unchecked'
  const onToggleSelectAll = React.useCallback(() => {
    onToggleSelect(allLeafIds, masterState !== 'checked')
  }, [allLeafIds, masterState, onToggleSelect])

  const isDirty = !setsAreEqual(selected, baseline)
  const selectedCount = selected.size
  const totalLeafCount = allLeafIds.length
  const showSaveBar = selectable && !!onSave

  const handleSave = async () => {
    if (!onSave) return
    setSaving(true)
    setSaveError(null)
    try {
      await onSave(Array.from(selected))
      setBaseline(new Set(selected))
      setSavedJustNow(true)
      setTimeout(() => setSavedJustNow(false), 3000)
    } catch (err: any) {
      setSaveError(err?.message || 'Could not save the selection. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="animate-pulse space-y-2 p-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-8 bg-gray-100 rounded" />
        ))}
      </div>
    )
  }

  if (rows.length > 0 && !resolved) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-gray-400 gap-2">
        <AlertTriangle size={28} />
        <p className="text-sm text-gray-500">
          Could not detect a hierarchy in this data. Pass <code>config.levels</code> to tell LevelTree which fields to use.
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-white rounded-lg border border-gray-200">
      {(title || selectable) && (
        <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-gray-200">
          <div>
            <h2 className="text-base font-semibold text-gray-900">{title || 'Items'}</h2>
            {selectable && (
              <p className="text-xs text-gray-500 mt-0.5">
                {selectedCount} of {totalLeafCount} item{totalLeafCount === 1 ? '' : 's'} selected
              </p>
            )}
          </div>
        </div>
      )}

      {selectable && droppedPreviousCount > 0 && (
        <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 border-b border-amber-100 text-xs text-amber-700">
          <AlertTriangle size={14} className="shrink-0" />
          {droppedPreviousCount} previously selected item{droppedPreviousCount === 1 ? '' : 's'} no longer{' '}
          {droppedPreviousCount === 1 ? 'exists' : 'exist'} in this list and {droppedPreviousCount === 1 ? 'was' : 'were'} dropped.
        </div>
      )}

      <div className="overflow-auto flex-1 thin-scroll"
        style={{
          maxHeight: 'calc(10 * 2.5rem + 2.5rem)'
        }}
      >
        <table className="border-collapse text-sm" style={{ width: 'max-content', minWidth: '100%' }}>
          <thead>
            <tr className="text-[14px] text-gray-300 tracking-wide">
              {selectable && (
                <th
                  className="sticky top-0 left-0 z-30 bg-white py-2 pl-3 pr-1"
                  style={{ width: CHECKBOX_COL_WIDTH }}
                >
                  <TriStateCheckbox
                    state={masterState}
                    onChange={onToggleSelectAll}
                    disabled={saving}
                    label="Select all"
                  />
                </th>
              )}

              {columns.map((col) => {
                const isFixed = col.fixed === 'left' || col.fixed === 'right'

                return (
                  <th
                    key={col.key}
                    className={` sticky top-0 bg-gray-50  py-3 px-3  font-semibold text-gray-700  border-b border-r border-gray-200
                    ${isFixed ? 'z-30' : 'z-20'}
                    ${alignClassName(col.align)}`}
                    style={{
                      width: col.width || DEFAULT_COLUMN_WIDTH,
                      minWidth: col.width || DEFAULT_COLUMN_WIDTH,
                      ...(col.fixed === 'left'
                        ? { left: offsets.left.get(col.key) }
                        : {}),
                      ...(col.fixed === 'right'
                        ? { right: offsets.right.get(col.key) }
                        : {})
                    }}
                  >
                    {col.label}
                  </th>
                )
              })}

              {actionColumn && (
                <th
                  className="
                  sticky top-0 right-0 z-30
                  bg-gray-50
                  py-3 px-3
                  font-semibold text-gray-700
                  border-b border-l border-gray-200  "
                  style={{
                    width: actionColumn.width || DEFAULT_ACTION_WIDTH
                  }}
                >
                  <div className={alignClassName(actionColumn.align, 'center')}>
                    {actionColumn.label || ''}
                  </div>
                </th>
              )}
            </tr>
          </thead>

          <tbody>
            {tree.length > 0 ? (
              tree.map((node) => (
                <LevelTreeRow
                  key={node.code}
                  node={node}
                  collapsed={collapsed}
                  onToggleCollapse={onToggleCollapse}
                  selectable={selectable}
                  selected={selected}
                  onToggleSelect={onToggleSelect}
                  selectionDisabled={saving}
                  columns={columns}
                  actionColumn={actionColumn}
                  treeColumnKey={resolvedTreeColumnKey}
                  offsets={offsets}
                  levelRowColors={levelRowColors}
                />
              ))
            ) : (
              <tr>
                <td
                  colSpan={
                    columns.length +
                    (selectable ? 1 : 0) +
                    (actionColumn ? 1 : 0)
                  }
                  className="py-12 text-center text-gray-500"
                >
                  <div className="flex flex-col items-center justify-center gap-2">
                    <p className="text-sm text-gray-500">
                      <NoDataView message={emptyMessage} />
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showSaveBar && (
        <div className="flex items-center justify-between gap-3 px-4 py-3 border-t border-gray-200">
          <div className="text-xs">
            {saveError ? (
              <span className="flex items-center gap-1.5 text-red-600">
                <AlertTriangle size={14} /> {saveError}
              </span>
            ) : savedJustNow ? (
              <span className="flex items-center gap-1.5 text-green-600">
                <CheckCircle2 size={14} /> Selection saved.
              </span>
            ) : isDirty ? (
              <span className="text-amber-600">You have unsaved changes.</span>
            ) : (
              <span className="text-gray-400">No changes to save.</span>
            )}
          </div>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || !isDirty}
            className="px-4 py-2 text-sm font-medium rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {saving ? 'Saving…' : 'Save selection'}
          </button>
        </div>
      )}
    </div>
  )
}