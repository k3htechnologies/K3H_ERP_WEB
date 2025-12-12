import React, {
  useCallback,
  useEffect,
  useMemo,
  useState
} from 'react'
import { useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import * as E from 'fp-ts/Either'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { employeeModuleAccessService } from '@/features/employeeModuleAccess/services/EmployeeModuleAccessService'
import type { ModuleData, SubModuleData, SubSubModuleData } from '@/features/menu/models/MenuModel'
import { runApiWithLoader } from '@/core/utils'
import { Loader } from '@/core/utils/loader'
import { useToast } from '@/core/hooks/useToast'
import { Button } from '@/ui/components/forms'
import Checkbox from '@/ui/components/forms/Checkbox'

type PermissionFlags = {
  isAction: boolean
  isView: boolean
  isExport: boolean
}

type PermissionMap = Record<string, PermissionFlags>

type PermissionType = 'select' | 'action' | 'view' | 'export'

const createDefaultFlags = (): PermissionFlags => ({
  isAction: false,
  isView: false,
  isExport: false
})

const buildKey = (moduleId: number, subModuleId: number, subSubModuleId: number) =>
  `${moduleId}|${subModuleId}|${subSubModuleId}`

const clonePermissionMap = (source: PermissionMap): PermissionMap => {
  const next: PermissionMap = {}
  Object.entries(source).forEach(([key, value]) => {
    next[key] = { ...value }
  })
  return next
}

const EmployeeModuleAccess: React.FC = () => {

  //#region STATE MANAGEMENT
  const [modules, setModules] = useState<ModuleData[]>([])
  const [permissions, setPermissions] = useState<PermissionMap>({})
  const [initialPermissions, setInitialPermissions] = useState<PermissionMap>({})
  const [isLoading, setIsLoading] = useState(false)
  const [loadingMessage, setLoadingMessage] = useState('')
  const [expandedModules, setExpandedModules] = useState<Record<number, boolean>>({})
  const [expandedSubModules, setExpandedSubModules] = useState<Record<string, boolean>>({})
  //#endregion

  const { designationMasterId } = useParams(); // DepartmentMasterId from URL
  const location = useLocation();
  const { designationName } = location.state || {};

  //#region TOAST
  const { addToast} = useToast()
  //#endregion

  //#region NAVIGATE
  const navigate = useNavigate();
  //#endregion

  //#region ROUTER | PARAMETERS
  const [searchParams] = useSearchParams()
  const designationId = useMemo(
    () => Number(designationMasterId),
    [searchParams]
  )
  //#endregion

  //#region PERMISSION HELPERS
  const ensureFlags = useCallback(
    (key: string) => permissions[key] ?? createDefaultFlags(),
    [permissions]
  )

  const getSubModuleLeafKeys = useCallback(
    (module: ModuleData, subModule: SubModuleData): string[] => {
      const moduleId = module.ModulesMasterId ?? 0
      const subModuleId = subModule.SubModulesMasterId ?? 0
      if (!subModule.SubSubModuleData || subModule.SubSubModuleData.length === 0) {
        return [buildKey(moduleId, subModuleId, 0)]
      }
      return subModule.SubSubModuleData.map((child) =>
        buildKey(moduleId, subModuleId, child.SubSubModulesMasterId ?? 0)
      )
    },
    []
  )

  const getModuleLeafKeys = useCallback(
    (module: ModuleData): string[] =>
      module.SubModuleData.flatMap((subModule) => getSubModuleLeafKeys(module, subModule)),
    [getSubModuleLeafKeys]
  )

  const aggregateFlags = useCallback(
    (map: PermissionMap, keys: string[]): PermissionFlags => {
      if (keys.length === 0) return createDefaultFlags()

      const entries = keys.map((key) => map[key] ?? createDefaultFlags())

      return {
        isAction: entries.every((entry) => entry.isAction),
        isView: entries.every((entry) => entry.isView),
        isExport: entries.every((entry) => entry.isExport)
      }
    },
    []
  )

  const getSelectAggregate = useCallback(
    (keys: string[]) => {
      if (keys.length === 0) {
        return { checked: false, indeterminate: false }
      }

      const entries = keys.map((key) => permissions[key] ?? createDefaultFlags())

      const checked = entries.every(
        (entry) => entry.isAction && entry.isExport && entry.isView
      )
      const indeterminate =
        !checked && entries.some((entry) => entry.isAction || entry.isView || entry.isExport)

      return { checked, indeterminate }
    },
    [permissions]
  )

  const getPermissionAggregate = useCallback(
    (keys: string[], type: Exclude<PermissionType, 'select'>) => {
      if (keys.length === 0) {
        return { checked: false, indeterminate: false }
      }

      const entries = keys.map((key) => permissions[key] ?? createDefaultFlags())

      const getFlag = (entry: PermissionFlags) => {
        if (type === 'action') return entry.isAction
        if (type === 'export') return entry.isExport
        return entry.isView
      }

      const checked = entries.every(getFlag)
      const indeterminate = !checked && entries.some(getFlag)

      return { checked, indeterminate }
    },
    [permissions]
  )

  const syncSubModuleAggregate = useCallback(

    (map: PermissionMap, module: ModuleData, subModule: SubModuleData) => {

      const moduleId = module.ModulesMasterId ?? 0
      const subModuleId = subModule.SubModulesMasterId ?? 0
      const keys = getSubModuleLeafKeys(module, subModule)
      const aggregate = aggregateFlags(map, keys)
      map[buildKey(moduleId, subModuleId, 0)] = aggregate

    },
    [aggregateFlags, getSubModuleLeafKeys]
  )

  const syncModuleAggregate = useCallback(
    (map: PermissionMap, module: ModuleData) => {
      const moduleId = module.ModulesMasterId ?? 0
      const keys = getModuleLeafKeys(module)
      const aggregate = aggregateFlags(map, keys)
      map[buildKey(moduleId, 0, 0)] = aggregate
    },
    [aggregateFlags, getModuleLeafKeys]
  )

  //#endregion

  //#region PERMISSION MAP BUILDERS

  const buildInitialPermissionMap = useCallback(

    (data: ModuleData[]): PermissionMap => {

      const map: PermissionMap = {}

      data.forEach((module) => {

        const moduleId = module.ModulesMasterId ?? 0;

        map[buildKey(moduleId, 0, 0)] = createDefaultFlags();


        module.SubModuleData.forEach((subModule) => {

          const subModuleId = subModule.SubModulesMasterId ?? 0
          const subModuleKey = buildKey(moduleId, subModuleId, 0)

          map[subModuleKey] = {
            isAction: Boolean(subModule.IsAction),
            isView: Boolean(subModule.IsView),
            isExport: Boolean(subModule.IsExport)
          }

          subModule.SubSubModuleData.forEach((child) => {
            const childKey = buildKey(
              moduleId,
              subModuleId,
              child.SubSubModulesMasterId ?? 0
            )
            map[childKey] = {
              isAction: Boolean(child.IsAction),
              isView: Boolean(child.IsView),
              isExport: Boolean(child.IsExport)
            }
          })
        })
      })

      data.forEach((module) => {
        module.SubModuleData.forEach((subModule) => {
          syncSubModuleAggregate(map, module, subModule)
        })
        syncModuleAggregate(map, module)
      })

      return map
    },
    [syncModuleAggregate, syncSubModuleAggregate]
  )
  //#endregion

  //#endregion

  //#region DATA LOADING | FETCH

  const fetchModules = useCallback(async () => {

    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {

        const response = await employeeModuleAccessService.apiCallPullEmployeeModuleAccess({
          DesignationMasterId: designationId
        })

        if (E.isRight(response)) {

          const moduleList = response.right.Data ?? []

          setModules(moduleList);

          setExpandedModules({});

          setExpandedSubModules({});


          const map = buildInitialPermissionMap(moduleList);

          setPermissions(map);

          setInitialPermissions(clonePermissionMap(map));

        } else {
          addToast({
            type: 'error',
            title: response.left.message ?? 'Failed to load module permissions.'
          })
        }

        return response
      },
      undefined,
      (error: any) => {
        addToast({
          type: 'error',
          title: error?.message ?? 'Failed to load module permissions.'
        })
      },

      undefined,
      'Loading module permissions...'
    )
  }, [addToast, buildInitialPermissionMap, designationId])

  useEffect(() => {
    fetchModules()
  }, [fetchModules])

  //#region DERIVED STATE
  const allLeafKeys = useMemo(() => {
    const keys: string[] = []
    modules.forEach((module) => {
      module.SubModuleData.forEach((subModule) => {
        keys.push(...getSubModuleLeafKeys(module, subModule))
      })
    })
    return keys
  }, [getSubModuleLeafKeys, modules])
  //#endregion

  const hasChanges = useMemo(() => {
    const keys = new Set([
      ...Object.keys(initialPermissions),
      ...Object.keys(permissions)
    ])

    for (const key of keys) {
      const initial = initialPermissions[key] ?? createDefaultFlags()
      const current = permissions[key] ?? createDefaultFlags()

      if (
        initial.isAction !== current.isAction ||
        initial.isView !== current.isView ||
        initial.isExport !== current.isExport
      ) {
        return true
      }
    }

    return false
  }, [initialPermissions, permissions])

  const selectAllState = useMemo(
    () => getSelectAggregate(allLeafKeys),
    [allLeafKeys, getSelectAggregate]
  )

  const isSaveDisabled =
    !designationId || !hasChanges || modules.length === 0
  //#endregion

  //#region PERMISSION MUTATION HANDLERS
  const updateEntry = useCallback(

    (map: PermissionMap, key: string, type: PermissionType, value: boolean) => {

      const current = map[key] ?? createDefaultFlags();

      const next = { ...current }

      if (type === 'select') {
        next.isAction = value
        next.isView = value
        next.isExport = value
      } else if (type === 'action') {
        next.isAction = value
      } else if (type === 'export') {
        next.isExport = value
      } else if (type === 'view') {
        next.isView = value
      }

      map[key] = next
    },

    []
  )

  const handleToggleSelectAll = useCallback(

    (checked: boolean) => {
      if (allLeafKeys.length === 0) return

      setPermissions((prev) => {

        const map: PermissionMap = { ...prev }

        modules.forEach((module) => {

          module.SubModuleData.forEach((subModule) => {

            const moduleId = module.ModulesMasterId ?? 0;

            const subModuleId = subModule.SubModulesMasterId ?? 0;

            const subModuleKey = buildKey(moduleId, subModuleId, 0);

            updateEntry(map, subModuleKey, 'select', checked)

            subModule.SubSubModuleData.forEach((child) => {
              const childKey = buildKey(
                moduleId,
                subModuleId,
                child.SubSubModulesMasterId ?? 0
              )
              updateEntry(map, childKey, 'select', checked)
            })

            syncSubModuleAggregate(map, module, subModule)
          })
          syncModuleAggregate(map, module)
        })

        return { ...map }
      })
    },
    [allLeafKeys.length, modules, syncModuleAggregate, syncSubModuleAggregate, updateEntry]
  )

  const handleToggleModuleSelect = useCallback(
    (module: ModuleData, checked: boolean) => {
      const leafKeys = getModuleLeafKeys(module)
      if (leafKeys.length === 0) return

      setPermissions((prev) => {
        const map: PermissionMap = { ...prev }
        leafKeys.forEach((key) => updateEntry(map, key, 'select', checked))

        module.SubModuleData.forEach((subModule) => {
          syncSubModuleAggregate(map, module, subModule)
        })
        syncModuleAggregate(map, module)
        return { ...map }
      })
    },
    [getModuleLeafKeys, syncModuleAggregate, syncSubModuleAggregate, updateEntry]
  )

  const handleToggleSubModuleSelect = useCallback(
    (module: ModuleData, subModule: SubModuleData, checked: boolean) => {
      const keys = getSubModuleLeafKeys(module, subModule)
      if (keys.length === 0) return

      setPermissions((prev) => {
        const map: PermissionMap = { ...prev }
        keys.forEach((key) => updateEntry(map, key, 'select', checked))
        syncSubModuleAggregate(map, module, subModule)
        syncModuleAggregate(map, module)
        return { ...map }
      })
    },
    [getSubModuleLeafKeys, syncModuleAggregate, syncSubModuleAggregate, updateEntry]
  )

  const handleToggleSubModulePermission = useCallback(
    (
      module: ModuleData,
      subModule: SubModuleData,
      type: Exclude<PermissionType, 'select'>,
      checked: boolean
    ) => {
      const keys = getSubModuleLeafKeys(module, subModule)
      if (keys.length === 0) return

      setPermissions((prev) => {
        const map: PermissionMap = { ...prev }
        keys.forEach((key) => updateEntry(map, key, type, checked))
        syncSubModuleAggregate(map, module, subModule)
        syncModuleAggregate(map, module)
        return { ...map }
      })
    },
    [getSubModuleLeafKeys, syncModuleAggregate, syncSubModuleAggregate, updateEntry]
  )

  const handleToggleLeaf = useCallback(
    (
      module: ModuleData,
      subModule: SubModuleData,
      subSubModule: SubSubModuleData | null,
      type: PermissionType,
      checked: boolean
    ) => {
      const moduleId = module.ModulesMasterId ?? 0
      const subModuleId = subModule.SubModulesMasterId ?? 0
      const subSubModuleId = subSubModule?.SubSubModulesMasterId ?? 0

      const key = buildKey(moduleId, subModuleId, subSubModuleId)

      setPermissions((prev) => {
        const map: PermissionMap = { ...prev }
        updateEntry(map, key, type, checked)
        syncSubModuleAggregate(map, module, subModule)
        syncModuleAggregate(map, module)
        return { ...map }
      })
    },
    [syncModuleAggregate, syncSubModuleAggregate, updateEntry]
  )

  const toggleModuleExpansion = useCallback((moduleId: number) => {
    setExpandedModules((prev) => ({
      ...prev,
      [moduleId]: !prev[moduleId]
    }))
  }, [])

  const toggleSubModuleExpansion = useCallback((moduleId: number, subModuleId: number) => {
    const key = `${moduleId}-${subModuleId}`
    setExpandedSubModules((prev) => ({
      ...prev,
      [key]: !prev[key]
    }))
  }, [])

  //#endregion

  //#region SAVE HANDLERS
  const convertPermissionsToPayload = useCallback(() => {

    const payload: Array<{
      ModulesMasterId: number
      SubModuleMasterId: number
      SubSubModuleMasterId: number
      IsAction: boolean
      IsView: boolean
      IsExport: boolean
    }> = []

    modules.forEach((module) => {
      const moduleId = module.ModulesMasterId ?? 0

      module.SubModuleData.forEach((subModule) => {
        const subModuleId = subModule.SubModulesMasterId ?? 0
        const subModuleKey = buildKey(moduleId, subModuleId, 0)
        const subModuleFlags = ensureFlags(subModuleKey)

        if (subModuleFlags.isAction || subModuleFlags.isView || subModuleFlags.isExport) {
          payload.push({
            ModulesMasterId: moduleId,
            SubModuleMasterId: subModuleId,
            SubSubModuleMasterId: 0,
            IsAction: subModuleFlags.isAction,
            IsView: subModuleFlags.isView,
            IsExport: subModuleFlags.isExport
          })
        }
        subModule.SubSubModuleData.forEach((child) => {
          const childKey = buildKey(moduleId, subModuleId, child.SubSubModulesMasterId ?? 0)
          const childFlags = ensureFlags(childKey)

          if (childFlags.isAction || childFlags.isView || childFlags.isExport) {
            payload.push({
              ModulesMasterId: moduleId,
              SubModuleMasterId: subModuleId,
              SubSubModuleMasterId: child.SubSubModulesMasterId ?? 0,
              IsAction: childFlags.isAction,
              IsView: childFlags.isView,
              IsExport: childFlags.isExport
            })
          }
        })

      })
    })

    return payload
  }, [ensureFlags, modules])

  const handleSavePermissions = useCallback(async () => {
    if (!designationId) {

      addToast({
        type: 'warning',
        title: 'Designation is missing. Please navigate here via a valid designation.'
      })
      return
    }

    const payload = convertPermissionsToPayload()

    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {
        const response = await employeeModuleAccessService.apiCallAddUpdateEmployeeModuleAccess({
          DesignationMasterId: designationId,
          ModulesPermissionsJsonList: JSON.stringify(payload)
        })

        if (E.isRight(response)) {
          setInitialPermissions(clonePermissionMap(permissions))
          addToast({
            type: 'success',
            title: 'Permissions saved successfully.'
          })
        } else {
          addToast({
            type: 'error',
            title: response.left.message ?? 'Failed to save permissions.'
          })
        }

        return response
      },
      undefined,
      (error: any) => {
        addToast({
          type: 'error',
          title: error?.message ?? 'Failed to save permissions.'
        })
      },
      undefined,
      'Saving module permissions...'
    )
  }, [addToast, convertPermissionsToPayload, designationId, permissions])
  //#endregion

  return (
    

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <Loader loading={isLoading} title={loadingMessage}>
          <div />
        </Loader>
        <div className="z-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {designationName && (
              <span className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-3 py-0.5 text-md font-medium text-blue-700">
                Designation : {designationName}
              </span>
            )}
          </div>

          <label className="flex items-center justify-between px-12 py-2">
            <span className="text-sm text-gray-800 flex-1 pr-[6px]">
              Select All
            </span>
            <Checkbox
              checked={selectAllState.checked}
              indeterminate={selectAllState.indeterminate}
              disabled={allLeafKeys.length === 0}
              onChange={(event) => handleToggleSelectAll(event.target.checked)}
            />
          </label>
        </div>


        <div className="flex-1 space-y-2 px-6 py-3 pb-20 overflow-y-auto thin-scroll ">
          {modules.map((module) => {
            const moduleId = module.ModulesMasterId ?? 0
            const moduleKeys = getModuleLeafKeys(module)
            const moduleSelectState = getSelectAggregate(moduleKeys)
            const expanded = expandedModules[moduleId] ?? false

            return (
              <div key={moduleId} className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                <div className="flex items-center  justify-between px-4 py-2 md:px-6" onClick={() => toggleModuleExpansion(moduleId)}>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      className="flex h-7 w-7 items-center justify-center rounded-full border border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500"
                      aria-label={expanded ? 'Collapse module' : 'Expand module'}
                    >
                      {expanded ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </button>
                    <span className="text-base font-medium text-[#00000]">
                      {module.ModuleName}
                    </span>
                  </div>

                  <Checkbox
                    checked={moduleSelectState.checked}
                    indeterminate={moduleSelectState.indeterminate}
                    disabled={moduleKeys.length === 0}
                    onChange={(event) => handleToggleModuleSelect(module, event.target.checked)}
                    label={null}
                  />
                </div>

                {expanded && (
                  <div className="border-t px-4 py-2 md:px-6 md:py-2">

                    {module.SubModuleData.map((subModule) => {
                      const subModuleId = subModule.SubModulesMasterId ?? 0
                      const subModuleKeys = getSubModuleLeafKeys(module, subModule)
                      const subModuleSelectState = getSelectAggregate(subModuleKeys)
                      const subModuleActionState = getPermissionAggregate(subModuleKeys, 'action')
                      const subModuleExportState = getPermissionAggregate(subModuleKeys, 'export')
                      const subModuleViewState = getPermissionAggregate(subModuleKeys, 'view')
                      const subModuleKey = `${moduleId}-${subModuleId}`
                      const subExpanded = expandedSubModules[subModuleKey] ?? false
                      const hasChildren = subModule.SubSubModuleData.length > 0

                      return (
                        <div key={subModuleId} className="bg-white">
                          <div className="grid grid-cols-[minmax(0,1fr)_repeat(3,120px)] items-start gap-4 px-3 py-1 md:px-4">
                            <div className="flex items-start gap-2" onClick={() => toggleSubModuleExpansion(moduleId, subModuleId)}>
                              {hasChildren ? (
                                <button
                                  type="button"

                                  className="mt-1 flex h-6 w-6 items-center justify-center rounded-full border border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500"
                                  aria-label={subExpanded ? 'Collapse sub module' : 'Expand sub module'}
                                >
                                  {subExpanded ? (
                                    <ChevronDown className="h-3.5 w-3.5" />
                                  ) : (
                                    <ChevronRight className="h-3.5 w-3.5" />
                                  )}
                                </button>
                              ) : (
                                <span className="mt-1 h-6 w-6" />
                              )}

                              <Checkbox
                                checked={subModuleSelectState.checked}
                                indeterminate={subModuleSelectState.indeterminate}
                                disabled={subModuleKeys.length === 0}
                                onChange={(event) => handleToggleSubModuleSelect(module, subModule, event.target.checked)}
                                label={
                                  <span className={hasChildren ? "font-medium text-[#000000] pl-[6px]" : "font-sm text-[#666] pl-[6px]"}>
                                    {subModule.SubModuleName}
                                  </span>
                                }
                                title={subModule.SubModuleName}
                                className="items-start"
                              />
                            </div>
                            <div className="flex items-center justify-center">
                              {hasChildren ? (
                                <span className="text-sm text-gray-300"></span>
                              ) : (
                                <label className="flex items-center justify-between px-3 py-1 ">
                                  <Checkbox
                                    checked={subModuleActionState.checked}
                                    indeterminate={subModuleActionState.indeterminate}
                                    disabled={subModuleKeys.length === 0}
                                    onChange={(event) => handleToggleSubModulePermission(module, subModule, 'action', event.target.checked)}
                                  />
                                  <span className="text-sm text-gray-800 flex-1 pl-[6px]">
                                    Action
                                  </span>
                                </label>
                              )}
                            </div>
                            <div className="flex items-center justify-center">
                              {hasChildren ? (
                                <span className="text-sm text-gray-300"></span>
                              ) : (
                                <label className="flex items-center justify-between px-3 py-1">
                                  <Checkbox
                                    checked={subModuleExportState.checked}
                                    indeterminate={subModuleExportState.indeterminate}
                                    disabled={subModuleKeys.length === 0}
                                    onChange={(event) => handleToggleSubModulePermission(module, subModule, 'export', event.target.checked)}
                                  />
                                  <span className="text-sm text-gray-800 flex-1 pl-[6px]">
                                    Export
                                  </span>
                                </label>
                              )}
                            </div>
                            <div className="flex items-center justify-center">
                              {hasChildren ? (
                                <span className="text-sm text-gray-300"></span>
                              ) : (
                                <label className="flex items-center justify-between px-3 py-1 ">
                                  <Checkbox
                                    checked={subModuleViewState.checked}
                                    indeterminate={subModuleViewState.indeterminate}
                                    disabled={subModuleKeys.length === 0}
                                    onChange={(event) => handleToggleSubModulePermission(module, subModule, 'view', event.target.checked)}
                                  />
                                  <span className="text-sm text-gray-800 flex-1 pl-[6px]">
                                    View
                                  </span>
                                </label>
                              )}
                            </div>
                          </div>

                          {hasChildren && subExpanded && (
                            <div className="relative ml-10 mt-1">
                              {/* Vertical tree line (push it left so checkbox never overlaps) */}
                              <div className="absolute left-0 top-0 bottom-0 w-px bg-gray-300" />

                              <div className="space-y-2">
                                {subModule.SubSubModuleData.map((child) => {
                                  const childKey = buildKey(
                                    moduleId,
                                    subModuleId,
                                    child.SubSubModulesMasterId ?? 0
                                  )
                                  const childFlags = permissions[childKey] ?? createDefaultFlags()
                                  const childChecked =
                                    childFlags.isAction && childFlags.isExport && childFlags.isView
                                  const childIndeterminate =
                                    !childChecked &&
                                    (childFlags.isAction ||
                                      childFlags.isExport ||
                                      childFlags.isView)

                                  return (
                                    <div key={child.SubSubModulesMasterId ?? 0} className="relative pl-4">

                                      {/* horizontal connector */}
                                      <div className="absolute left-0 top-4 w-4 h-px bg-gray-300" />

                                      <div className="grid grid-cols-[minmax(0,1fr)_repeat(3,120px)] items-center gap-4">
                                        <Checkbox
                                          checked={childChecked}
                                          indeterminate={childIndeterminate}
                                          onChange={(event) =>
                                            handleToggleLeaf(
                                              module,
                                              subModule,
                                              child,
                                              'select',
                                              event.target.checked
                                            )
                                          }
                                          label={
                                            <span className="text-sm text-gray-800 pl-[6px]">
                                              {child.SubSubModuleName}
                                            </span>
                                          }
                                        />

                                        <div className="flex items-center justify-center">
                                          <label className="flex items-center justify-between px-3 py-1">
                                            <Checkbox
                                              checked={childFlags.isAction}
                                              onChange={(event) =>
                                                handleToggleLeaf(
                                                  module,
                                                  subModule,
                                                  child,
                                                  'action',
                                                  event.target.checked
                                                )
                                              }
                                            />
                                            <span className="text-sm text-gray-800 flex-1 pl-[6px]">
                                              Action
                                            </span>
                                          </label>
                                        </div>

                                        <div className="flex items-center justify-center">
                                          <label className="flex items-center justify-between px-3 py-1">
                                            <Checkbox
                                              checked={childFlags.isExport}
                                              onChange={(event) =>
                                                handleToggleLeaf(
                                                  module,
                                                  subModule,
                                                  child,
                                                  'export',
                                                  event.target.checked
                                                )
                                              }
                                            />
                                            <span className="text-sm text-gray-800 flex-1 pl-[6px]">
                                              Export
                                            </span>
                                          </label>
                                        </div>

                                        <div className="flex items-center justify-center">
                                          <label className="flex items-center justify-between px-3 py-1">
                                            <Checkbox
                                              checked={childFlags.isView}
                                              onChange={(event) =>
                                                handleToggleLeaf(
                                                  module,
                                                  subModule,
                                                  child,
                                                  'view',
                                                  event.target.checked
                                                )
                                              }
                                            />
                                            <span className="text-sm text-gray-800 flex-1 pl-[6px]">
                                              View
                                            </span>
                                          </label>
                                        </div>

                                      </div>
                                    </div>
                                  )
                                })}
                              </div>
                            </div>
                          )}

                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* ✅ Fixed Bottom SAVE Button */}
        <div className="fixed bottom-0 left-0 right-0 z-10 bg-white border-t border-gray-200 p-2 flex justify-end items-center gap-3 shadow-md h-16"
          style={{ paddingBottom: 'env(safe-area-inset-bottom)', left: "299px", right: '14px' }}>
          <Button
            color="transparent"
            variant='transparent_border'
            size="sm"
            onClick={() => {
              navigate('/designationMaster');
            }}
            className="px-6"
          >
            Cancel
          </Button>
          <Button
            color="blue"
            size="sm"
            disabled={isSaveDisabled}
            onClick={() => handleSavePermissions()}
            className="px-6"
          >
            Save
          </Button>
        </div>


      </div>
  )
}

export default EmployeeModuleAccess
