import type { AddUpdateCompOff } from '@/features/compOff/models/compOff';
import type { TableColumn } from '@/ui/components/DataTable/DataTable';
import TooltipText from '@/ui/components/Tooltip/TooltipText';
import { formatDate_dd_mm_yyyy } from '@/core/utils/dateFormat';

export const INITIAL_FORM_STATE: AddUpdateCompOff = {
    CompOffId: 0,
    Uniquekey: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
    CompOffDate: null,
    WorkingDate: null,
    Reason: null
};

export const REQUIRED_COLUMN_KEYS: string[] = ['CompOffDate', 'Actions'];

export const getInitialFormState = (): AddUpdateCompOff => ({
    ...INITIAL_FORM_STATE
});

export const getCompOffColumns = (onView?: (row: any) => void): TableColumn[] => [
    {
        key: 'CompOffDate',
        label: 'Comp Off Date',
        width: '25',
        sortable: true,
        fixed: 'left',
        align: 'left',
        render: (value, row) => (
            <div className="flex items-center justify-start">
                <TooltipText
                    text={formatDate_dd_mm_yyyy(value)}
                    maxWidth="300px"
                    tooltipThreshold={30}
                    onClick={() => onView?.(row)}
                />
            </div>
        )
    },
    {
        key: 'WorkingDate',
        label: 'Working Date',
        width: '25',
        sortable: false,
        align: 'left',
        render: (value) => (
            <TooltipText
                text={formatDate_dd_mm_yyyy(value)}
                maxWidth="300px"
                tooltipThreshold={30}
            />
        )
    },
    {
        key: 'Reason',
        label: 'Reason',
        width: '50',
        sortable: false,
        align: 'left',
        render: (value) => (
            <TooltipText
                text={value || '-'}
                maxWidth="500px"
                tooltipThreshold={50}
            />
        )
    },
    {
        key: 'Actions',
        label: 'Actions',
        width: '12',
        fixed: 'right',
        align: 'center'
    }
];

