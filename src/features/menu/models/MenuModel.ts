export interface PullMenuRequest {
    EmployeeId: number | 0
}

export interface ModuleData {
    ModulesMasterId: number | 0
    ModuleName: string | ''
    Icon: string | ''
    SubModuleData: SubModuleData[]
}

export interface SubModuleData {
    SubModulesMasterId: number | 0
    SubModuleName: string | ''
    Icon: string | ''
    Path: string | ''
    IsAction: boolean | false
    IsView: boolean | false
    IsExport: boolean | false
    SubSubModuleData: SubSubModuleData[]
}
export interface SubSubModuleData {
    SubSubModulesMasterId: number | 0
    SubSubModuleName: string | ''
    Icon: string | ''
    Path: string | ''
    IsDisplay: boolean | false
    IsAction: boolean | false
    IsView: boolean | false
    IsExport: boolean | false
}