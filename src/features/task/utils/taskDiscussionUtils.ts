import { MENTION_TOKEN_REGEX } from '@/features/task/constants/taskConstants'
import type { AgendaData } from '@/features/meeting/models/AgendaModel'
import type { TaskDetails } from '@/features/task/models/TaskModel'
import type { TaskMentionUser } from '@/features/task/models/TaskDiscussionModel'

export const splitTextWithMentions = (text: string): string[] => {
    const parts: string[] = []
    let lastIndex = 0

    for (const match of text.matchAll(MENTION_TOKEN_REGEX)) {
        const index = match.index ?? 0

        if (index > lastIndex) {
            parts.push(text.slice(lastIndex, index))
        }

        parts.push(match[0])
        lastIndex = index + match[0].length
    }

    if (lastIndex < text.length) {
        parts.push(text.slice(lastIndex))
    }

    return parts.length > 0 ? parts : [text]
}

export const extractMentionUsers = (
    item: TaskDetails | AgendaData | null,
    subItems: (TaskDetails | AgendaData)[] = [],
): TaskMentionUser[] => {
    if (!item) return []

    const users = new Map<string, TaskMentionUser>()

    const addUser = (id: string | number | undefined, name?: string | null) => {
        if (!name) return

        const key = name.toLowerCase()
        if (!users.has(key)) {
            users.set(key, { id: String(id ?? key), name })
        }
    }

    if ('AssigneeId' in item) {
        addUser(item.AssigneeId, item.AssigneeName)
    }
    if ('ResponsiblePersonDetails' in item && item.ResponsiblePersonDetails) {
        item.ResponsiblePersonDetails.forEach((person) => {
            addUser(person.ResponsiblePersonId, person.ResponsiblePersonName)
        })
    }

    addUser(item.CreatedById, item.CreatedBy)
    addUser(item.ModifiedById, item.ModifiedBy)

    item.ReviewerDetails?.forEach((reviewer) => {
        addUser(reviewer.ReviewerId, reviewer.ReviewerName)
    })

    item.TagsEmployeeDetails?.forEach((tag) => {
        addUser(tag.TagId, tag.TagsName)
    })

    subItems.forEach((subItem) => {
        if ('AssigneeId' in subItem) {
            addUser(subItem.AssigneeId, subItem.AssigneeName)
        }
        if ('ResponsiblePersonDetails' in subItem && subItem.ResponsiblePersonDetails) {
            subItem.ResponsiblePersonDetails.forEach((person) => {
                addUser(person.ResponsiblePersonId, person.ResponsiblePersonName)
            })
        }
    })

    return Array.from(users.values()).sort((a, b) => a.name.localeCompare(b.name))
}

export const findActiveMentionQuery = (
    value: string,
    cursorPosition: number,
): { query: string; startIndex: number } | null => {
    const textBeforeCursor = value.slice(0, cursorPosition)
    const mentionMatch = textBeforeCursor.match(/@([^\s@]*)$/)

    if (!mentionMatch) return null

    return {
        query: mentionMatch[1],
        startIndex: textBeforeCursor.length - mentionMatch[0].length,
    }
}

export const insertMention = (
    value: string,
    startIndex: number,
    cursorPosition: number,
    userName: string,
): { value: string; cursor: number } => {
    const before = value.slice(0, startIndex)
    const after = value.slice(cursorPosition)
    const mentionText = `@${userName} `
    const nextValue = `${before}${mentionText}${after}`
    const nextCursor = before.length + mentionText.length

    return { value: nextValue, cursor: nextCursor }
}
