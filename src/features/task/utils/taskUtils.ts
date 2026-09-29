export const getTaskStatusColor = (status: string = '') => {
    const map: Record<string, { bg: string; text: string }> = {
        'To Do': { bg: '#F5F5F5', text: '#8C8C8C' },
        'In Progress': { bg: '#E6F7FF', text: '#1890FF' },
        'On Hold': { bg: '#FFF7E6', text: '#FA8C16' },
        Completed: { bg: '#F6FFED', text: '#52C41A' },
        Done: { bg: '#F6FFED', text: '#52C41A' },
    }

    return map[status] ?? { bg: '#E6F7FF', text: '#1890FF' }
}

export const getTaskPriorityColor = (priority: string = '') => {
    const map: Record<string, { bg: string; text: string }> = {
        High: { bg: '#F5222D', text: '#FFFFFF' },
        Medium: { bg: '#FFF7E6', text: '#FA8C16' },
        Low: { bg: '#F6FFED', text: '#52C41A' },
    }

    return map[priority] ?? { bg: '#F5F5F5', text: '#595959' }
}
