import type { TableColumn } from "@/ui/components/DataTable/DataTable";

export const getMaterialRequisitionTableColumns = (): TableColumn[] => [
    {
        key: 'SystemGeneratedCode',
        label: 'Unique Id',
        width: '20',
        sortable: true,
        fixed: 'left',
        align: 'left'
    },
    {
        key: 'MaterialRequisitionStage',
        label: 'Stage',
        width: '15',
        sortable: false,
        align: 'left',
        render: (value) => value || '-'
    },
    {
        key: 'FinalVendor',
        label: 'Vendor Name',
        width: '15',
        sortable: true,
        align: 'left',
        render: (value) => value || '-'
    },
    {
        key: 'MaterialRequisitionStatus',
        label: 'Status',
        width: '15',
        sortable: false,
        align: 'left',
        render: (value) => value || '-'
    },
    {
        key: 'TotalPoAmount',
        label: 'Total Po Amount',
        width: '15',
        sortable: false,
        align: 'right',
        render: (value) => value !== undefined && value !== null ? value : '-'
    },
    {
        key: 'TotalInvoiceAmount',
        label: 'Total Invoice Amount',
        width: '15',
        sortable: false,
        align: 'right',
        render: (value) => value !== undefined && value !== null ? value : '-'
    },
    {
        key: 'Actions',
        label: 'Actions',
        width: '12',
        fixed: 'right',
        align: 'center'
    }
];
