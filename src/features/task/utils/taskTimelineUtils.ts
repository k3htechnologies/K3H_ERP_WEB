export const getTimelinePillClasses = (activityType: string = '') => {
    const map: Record<string, string> = {
        TASK_ASSIGNED: 'bg-[#E8F7EF] text-[#389E0D] border-[#B7EB8F]',
        TASKASSIGNED: 'bg-[#E8F7EF] text-[#389E0D] border-[#B7EB8F]',
        TASK_REASSIGNED: 'bg-[#F3E8FF] text-[#722ED1] border-[#D3ADF7]',
        TASK_TRANSFERRED: 'bg-[#F3E8FF] text-[#722ED1] border-[#D3ADF7]',
        TASKTRANSFERRED: 'bg-[#F3E8FF] text-[#722ED1] border-[#D3ADF7]',
        TASK_UPDATED: 'bg-[#FFF7E6] text-[#D48806] border-[#FFD591]',
        REQUIREMENT_UPDATE: 'bg-[#FFF7E6] text-[#D48806] border-[#FFD591]',
        REQUIREMENTUPDATE: 'bg-[#FFF7E6] text-[#D48806] border-[#FFD591]',
        REVIEWER_ASSIGNED: 'bg-[#E6F4FF] text-[#1890FF] border-[#91D5FF]',
        REVIEWERASSIGNED: 'bg-[#E6F4FF] text-[#1890FF] border-[#91D5FF]',
        STATUS_UPDATE: 'bg-[#E8F7EF] text-[#389E0D] border-[#B7EB8F]',
        STATUSUPDATE: 'bg-[#E8F7EF] text-[#389E0D] border-[#B7EB8F]',
        SUBTASK_CREATED: 'bg-[#E6F4FF] text-[#1890FF] border-[#91D5FF]',
        SUBTASKCREATED: 'bg-[#E6F4FF] text-[#1890FF] border-[#91D5FF]',
        DISCUSSION_ADDED: 'bg-[#FFF1F0] text-[#CF1322] border-[#FFA39E]',
        DISCUSSIONADDED: 'bg-[#FFF1F0] text-[#CF1322] border-[#FFA39E]',
        DOCUMENT_UPLOADED: 'bg-[#F5F5F5] text-[#595959] border-[#D9D9D9]',
        DOCUMENTUPLOADED: 'bg-[#F5F5F5] text-[#595959] border-[#D9D9D9]',
    }

    const normalized = activityType.trim().toUpperCase().replace(/[\s-]+/g, '_')
    const compact = normalized.replace(/_/g, '')

    return map[normalized] || map[compact] || 'bg-[#F5F5F5] text-[#595959] border-[#D9D9D9]'
}

export const getTimelineEventDateKey = (createdDate?: string | null): string => {
    const raw = createdDate?.trim() || ''
    if (!raw) return ''

    const datePart = raw.split(/[T\s]/)[0]
    if (/^\d{4}-\d{2}-\d{2}$/.test(datePart)) {
        return datePart
    }

    const parsed = new Date(raw)
    if (Number.isNaN(parsed.getTime())) return ''

    const year = parsed.getFullYear()
    const month = String(parsed.getMonth() + 1).padStart(2, '0')
    const day = String(parsed.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
}

export const getTimelineRangeEnd = (rangeStart: Date): Date =>
    new Date(rangeStart.getFullYear(), rangeStart.getMonth() + 2, 0)

export const toTimelineDateKey = (date: Date): string => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
}

export const parseTimelineJson = (value?: string | null): { [key: string]: any } | null => {
    if (!value || !value.trim()) return null

    try {
        const parsed = JSON.parse(value)
        if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
            return parsed
        }
    } catch {
        return null
    }

    return null
}

export const formatTimelineFieldValue = (value: any): string => {
    if (value == null || value === '') return '-'
    if (Array.isArray(value)) {
        return value.length > 0 ? value.join(', ') : '-'
    }
    return String(value)
}

export const getTimelineValueSummary = (value?: string | null): string => {
    const parsed = parseTimelineJson(value)

    if (!parsed) {
        return value?.trim() || ''
    }

    return Object.keys(parsed)
        .filter((key) => {
            const fieldValue = parsed[key]
            if (fieldValue == null || fieldValue === '') return false
            if (Array.isArray(fieldValue) && fieldValue.length === 0) return false
            return true
        })
        .map((key) => `${key}: ${formatTimelineFieldValue(parsed[key])}`)
        .join(' • ')
}
