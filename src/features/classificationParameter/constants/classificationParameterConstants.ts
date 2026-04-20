import type { AddUpdateClassificationParameterRequest } from '@/features/classificationParameter/models/ClassificationParameterModel';
import type { TableColumn } from '@/ui/components/DataTable/DataTable';


export const INITIAL_FORM_STATE: AddUpdateClassificationParameterRequest = {
    ClassificationParameterId: 0,
    Uniquekey: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
    ProjectId: 0,
    MinBudget: "",
    PossessionType: '',
    Requirement: '',
    RequirementType: '',
    TimeLine: '',
    VillageMasterId: "",
};


export const REQUIRED_COLUMN_KEYS: string[] = ['PossessionType', 'RequirementType', 'Requirement', 'Location', 'TimeLine', 'MinBudget'];

export const getInitialFormState = (): AddUpdateClassificationParameterRequest => ({
    ...INITIAL_FORM_STATE
});

export const getClassificationParameterColumns = (): TableColumn[] => [
    {
        key: 'MinBudget',
        label: 'Min Budget (In CR)',
        width: '30',
        fixed: 'left',
        align: 'left'
    },
    {
        key: 'PossessionType',
        label: 'Possession Type',
        width: '30',
        fixed: 'left',
        align: 'left'
    },
    {
        key: 'Requirement',
        label: 'Requirement',
        width: '30',
        fixed: 'left',
        align: 'left'
    },
    {
        key: 'RequirementType',
        label: 'Requirement Type',
        width: '30',
        fixed: 'left',
        align: 'left'
    },
    {
        key: 'VillageName',
        label: 'Location',
        width: '30',
        fixed: 'left',
        align: 'left'
    },
    {
        key: 'TimeLine',
        label: 'Timeline Of Purchase',
        width: '30',
        fixed: 'left',
        align: 'left'
    },
    {
        key: 'Actions',
        label: 'Actions',
        width: '30',
        fixed: 'right',
        align: 'center'
    }
]