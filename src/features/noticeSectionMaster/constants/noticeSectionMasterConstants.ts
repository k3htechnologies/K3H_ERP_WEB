import type { AddUpdateNoticeSectionMasterRequest } from "@/features/noticeSectionMaster/models/NoticeSectionMasterModel";
import type { TableColumn } from '@/ui/components/DataTable/DataTable';

export const INITIAL_FORM_STATE: AddUpdateNoticeSectionMasterRequest = {
    NoticeSectionMasterId: 0,
    Uniquekey: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
    GovernmentCompliance: '',
    GovernmentCompliance: '',
    NoticeSection: ''
};

export const REQUIRED_COLUMN_KEYS: string[] = ['NoticeSection', 'Actions'];

export const getInitialFormState = (): AddUpdateNoticeSectionMasterRequest => ({
    ...INITIAL_FORM_STATE
});

export const getNoticeSectionMasterColumns = (): TableColumn[] => [
    // {
    //     key: 'GovernmentCompliance',
    //     label: 'Government Compliance',
    //     width: '30',
    //     sortable: true,
    //     fixed: 'left',
    //     align: 'left'
    // },
    {
        key: 'NoticeSection',
        label: 'Notice Section',
        width: '30',
        sortable: true,
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
