import { parseDocumentUrls } from '@/core/utils/documentUtils'
import type { AddUpdateEventRequest, EventData } from '@/features/event/event/models/EventModel'
import type {
    AddUpdateMeetingMasterRequest,
    AgendaPriority,
    AgendaStatus,
    ExternalMeetingParticipantRequest,
    MeetingAgenda,
    MeetingDocumentUrlGroups,
    MeetingMasterData,
    MeetingMetadata,
    MeetingMode,
    MeetingParticipantData,
    MeetingParticipantRequest,
    MeetingType,
    PullMeetingMasterRequest
} from '@/features/event/meeting/models/MeetingModel'

export const DEFAULT_UNIQUE_KEY = '3fa85f64-5717-4562-b3fc-2c963f66afa6'

const MEETING_METADATA_PREFIX = '__MEETING_METADATA__:'

export const getMeetingDetailRequest = (meetingId: number): PullMeetingMasterRequest => ({
    PageSize: 1,
    PageNumber: 1,
    MeetingId: meetingId
})

export const getInitialMeetingForm = (): AddUpdateEventRequest => ({
    EventId: 0,
    Uniquekey: DEFAULT_UNIQUE_KEY,
    Type: 'Meeting',
    Title: '',
    ProjectId: '',
    DepartmentId: '',
    EmployeeId: '',
    Date: '',
    DeadlineDate: '',
    StartTime: '',
    EndTime: '',
    Room: '',
    Priority: '',
    Description: '',
    DocumentURL: null,
    RemoveDocumentURL: ''
})

export const getInitialMeetingMetadata = (): MeetingMetadata => ({
    MeetingType: 'Department',
    MeetingMode: 'Physical',
    Remark: '',
    MeetingStatus: 'New',
    DepartmentName: '',
    ExternalParticipants: '',
    ExternalParticipantDetails: {
        ParticipantName: '',
        CompanyName: '',
        DesignationId: '',
        DesignationName: '',
        MobileNumber: '',
        Email: '',
        Remark: ''
    },
    Agendas: []
})

export const parseMeetingMetadata = (description?: string | null): MeetingMetadata => {
    const initial = getInitialMeetingMetadata()

    if (!description?.trim()) return initial

    if (!description.startsWith(MEETING_METADATA_PREFIX)) {
        return { ...initial, Remark: description }
    }

    try {
        const parsed = JSON.parse(description.slice(MEETING_METADATA_PREFIX.length)) as Partial<MeetingMetadata> & { MeetingTypes?: MeetingType[] }
        const meetingType = parsed.MeetingType || parsed.MeetingTypes?.[0] || initial.MeetingType

        return {
            ...initial,
            ...parsed,
            MeetingType: meetingType,
            ExternalParticipantDetails: {
                ...initial.ExternalParticipantDetails,
                ...parsed.ExternalParticipantDetails,
                ParticipantName: parsed.ExternalParticipantDetails?.ParticipantName || parsed.ExternalParticipants || ''
            },
            Agendas: Array.isArray(parsed.Agendas) ? parsed.Agendas : []
        }
    } catch {
        return { ...initial, Remark: description }
    }
}

const serializeMeetingMetadata = (metadata: MeetingMetadata): string =>
    `${MEETING_METADATA_PREFIX}${JSON.stringify(metadata)}`

export const mapEventToMeetingForm = (meeting: EventData): AddUpdateEventRequest => ({
    EventId: meeting.EventId,
    Uniquekey: meeting.Uniquekey || DEFAULT_UNIQUE_KEY,
    Type: 'Meeting',
    Title: meeting.Title || '',
    ProjectId: meeting.ProjectId || '',
    DepartmentId: meeting.DepartmentId || '',
    EmployeeId: meeting.EmployeeId || '',
    Date: meeting.Date?.slice(0, 10) || '',
    DeadlineDate: '',
    StartTime: meeting.StartTime || '',
    EndTime: meeting.EndTime || '',
    Room: meeting.Room || '',
    Priority: meeting.Priority || '',
    Description: meeting.Description || '',
    DocumentURL: meeting.DocumentURL ? parseDocumentUrls(meeting.DocumentURL) : null,
    RemoveDocumentURL: ''
})

export const parseExternalParticipantJson = (value?: string | null): ExternalMeetingParticipantRequest[] => {
    if (!value?.trim()) return []

    try {
        let parsed: unknown = JSON.parse(value)

        if (typeof parsed === 'string') parsed = JSON.parse(parsed)

        const items = Array.isArray(parsed) ? parsed : [parsed]

        return items
            .filter((item): item is Record<string, unknown> => typeof item === 'object' && item !== null)
            .map((item) => ({
                FullName: String(item.FullName ?? item.ParticipantName ?? ''),
                Email: String(item.Email ?? item.EmaEmail ?? ''),
                MobileNo: String(item.MobileNo ?? item.MobileNumber ?? ''),
                OrganizationName: String(item.OrganizationName ?? item.CompanyName ?? ''),
                NoOfParticipants: Number(item.NoOfParticipants) || 1,
                ClientRegistrationId: Number(item.ClientRegistrationId) || 0,
                DesignationName: String(item.DesignationName ?? item.Designation ?? ''),
                Remark: String(item.Remark ?? '')
            }))
            .filter((participant) => participant.FullName.trim() || participant.Email.trim() || participant.MobileNo.trim())
    } catch {
        return []
    }
}

const getRecordArray = (source: Record<string, unknown>, keys: string[]): Record<string, unknown>[] => {
    for (const key of keys) {
        const value = source[key]

        if (Array.isArray(value)) {
            return value.filter((item): item is Record<string, unknown> => typeof item === 'object' && item !== null)
        }
    }

    return []
}

const normalizeParticipants = (
    participants: Record<string, unknown>[],
    meeting: MeetingMasterData,
    isExternal = false
): MeetingParticipantData[] =>
    participants.map((participant) => ({
        ParticipantId: Number(participant.ParticipantId ?? participant.ExternalMeetingParticipantId ?? participant.ExternalParticipantId ?? participant.ExternalId ?? participant.EmployeeId ?? participant.DepartmentId ?? 0),
        ParticipantName: String(participant.ParticipantName ?? participant.FullName ?? participant.EmployeeName ?? participant.DepartmentName ?? ''),
        ProfilePhotoURL: String(participant.ProfilePhotoURL ?? ''),
        MeetingType: String(participant.MeetingType ?? participant.ParticipantType ?? (isExternal ? 'External Participant' : meeting.MeetingType) ?? ''),
        UniqueKey: String(participant.UniqueKey ?? participant.Uniquekey ?? ''),
        DesignationName: String(participant.DesignationName ?? participant.Designation ?? participant.OrganizationName ?? participant.CompanyName ?? ''),
        DepartmentName: String(participant.DepartmentName ?? ''),
        ExternalId: Number(participant.ExternalId ?? participant.ExternalMeetingParticipantId ?? participant.ExternalParticipantId ?? (isExternal ? participant.ParticipantId ?? 1 : 0)),
        EmaEmail: String(participant.EmaEmail ?? participant.Email ?? participant.EmailId ?? ''),
        MobileNo: String(participant.MobileNo ?? participant.MobileNumber ?? ''),
        OrganizationName: String(participant.OrganizationName ?? participant.CompanyName ?? ''),
        Remark: String(participant.Remark ?? participant.ParticipantRemark ?? ''),
        CreatedDate: participant.CreatedDate ? String(participant.CreatedDate) : null,
        ModifiedDate: participant.ModifiedDate ? String(participant.ModifiedDate) : null
    }))

export const getMeetingParticipants = (meeting: MeetingMasterData): MeetingParticipantData[] => {
    const source = meeting as unknown as Record<string, unknown>

    let participants = getRecordArray(source, [
        'Participants',
        'ParticipantDetails',
        'ParticipantData',
        'MeetingParticipants',
        'MeetingParticipantData'
    ])

    if (participants.length === 0) {
        const dynamicParticipants = Object.entries(source).find(
            ([key, value]) =>
                key.toLowerCase().includes('participant') &&
                !key.toLowerCase().includes('external') &&
                Array.isArray(value)
        )?.[1]

        participants = Array.isArray(dynamicParticipants)
            ? dynamicParticipants.filter((item): item is Record<string, unknown> => typeof item === 'object' && item !== null)
            : []
    }

    return normalizeParticipants(participants, meeting)
}

export const getExternalMeetingParticipants = (meeting: MeetingMasterData): MeetingParticipantData[] => {
    const source = meeting as unknown as Record<string, unknown>
    const externalRows = Object.entries(source)
        .filter(([key, value]) =>
            key.toLowerCase().includes('external') &&
            key.toLowerCase().includes('participant') &&
            Array.isArray(value)
        )
        .flatMap(([, value]) =>
            (value as unknown[]).filter(
                (item): item is Record<string, unknown> =>
                    typeof item === 'object' && item !== null
            )
        )
    const externalDetail = source.ExternalParticipantDetails
    const detailRows =
        externalDetail && typeof externalDetail === 'object' && !Array.isArray(externalDetail)
            ? [externalDetail as Record<string, unknown>]
            : []
    const embeddedRows = getMeetingParticipants(meeting)
        .filter((participant) =>
            participant.ExternalId > 0 ||
            participant.MeetingType.toLowerCase().includes('external')
        )
        .map((participant) => participant as unknown as Record<string, unknown>)
    const jsonRows = parseExternalParticipantJson(meeting.ExternalParticipantJson)
        .map((participant) => participant as unknown as Record<string, unknown>)
    const participants = normalizeParticipants(
        [...externalRows, ...detailRows, ...embeddedRows, ...jsonRows],
        meeting,
        true
    )
    const uniqueParticipants = new Map<string, MeetingParticipantData>()

    participants.forEach((participant, index) => {
        const identity = (
            participant.EmaEmail ||
            participant.MobileNo ||
            participant.ParticipantName ||
            participant.UniqueKey ||
            `${participant.ParticipantId}-${index}`
        ).trim().toLowerCase()
        const existing = uniqueParticipants.get(identity)

        uniqueParticipants.set(identity, existing
            ? {
                ...existing,
                ParticipantId: existing.ParticipantId || participant.ParticipantId,
                ParticipantName: existing.ParticipantName || participant.ParticipantName,
                UniqueKey: existing.UniqueKey || participant.UniqueKey,
                DesignationName: existing.DesignationName || participant.DesignationName,
                DepartmentName: existing.DepartmentName || participant.DepartmentName,
                ExternalId: existing.ExternalId || participant.ExternalId,
                EmaEmail: existing.EmaEmail || participant.EmaEmail,
                MobileNo: existing.MobileNo || participant.MobileNo,
                OrganizationName: existing.OrganizationName || participant.OrganizationName,
                Remark: existing.Remark || participant.Remark
            }
            : participant
        )
    })

    return Array.from(uniqueParticipants.values())
}

export const getMeetingAgendas = (meeting: MeetingMasterData): MeetingAgenda[] => {
    const source = meeting as unknown as Record<string, unknown>

    let agendaRows = getRecordArray(source, [
        'Agendas',
        'Agenda',
        'AgendaDetails',
        'MeetingAgendas',
        'MeetingAgendaDetails',
        'MeetingAgendaData'
    ])

    if (agendaRows.length === 0 && typeof source.AgendaJson === 'string') {
        try {
            const parsed = JSON.parse(source.AgendaJson)

            agendaRows = Array.isArray(parsed)
                ? parsed.filter((item): item is Record<string, unknown> => typeof item === 'object' && item !== null)
                : []
        } catch {
            agendaRows = []
        }
    }

    return agendaRows.map((agenda, index) => {
        const priorityValue = String(agenda.Priority ?? agenda.AgendaPriority ?? 'Medium')
        const priority = `${priorityValue.charAt(0).toUpperCase()}${priorityValue.slice(1).toLowerCase()}`
        const status = String(agenda.Status ?? agenda.AgendaStatus ?? 'Pending')

        return {
            AgendaId: String(agenda.AgendaId ?? agenda.MeetingAgendaId ?? agenda.UniqueKey ?? `agenda-${index}`),
            UniqueKey: String(agenda.UniqueKey ?? ''),
            Title: String(agenda.Title ?? agenda.AgendaTitle ?? ''),
            Description: String(agenda.Description ?? agenda.AgendaDescription ?? ''),
            CreatedBy: String(agenda.CreatedBy ?? agenda.CreatedByName ?? ''),
            ResponsiblePersonId: String(agenda.ResponsiblePersonId ?? agenda.EmployeeId ?? ''),
            ResponsiblePerson: String(agenda.ResponsiblePerson ?? agenda.ResponsiblePersonName ?? ''),
            ResponsiblePersonJson: String(agenda.ResponsiblePersonJson ?? ''),
            Priority: (['Low', 'Medium', 'High'].includes(priority) ? priority : 'Medium') as AgendaPriority,
            Status: (['active', 'inactive', 'Pending', 'In Progress', 'Completed'].includes(status) ? status : 'Pending') as AgendaStatus,
            Remark: String(agenda.Remark ?? ''),
            Discussion: String(agenda.Discussion ?? agenda.AgendaDiscussion ?? agenda.Remark ?? ''),
            Conclusion: String(agenda.Conclusion ?? agenda.AgendaConclusion ?? ''),
            DocumentUrl: String(agenda.DocumentUrl ?? agenda.DocumentURL ?? agenda.DocumentURLs ?? ''),
            MeetingTitle: String(agenda.MeetingTitle ?? ''),
            MeetingDate: String(agenda.MeetingDate ?? '')
        }
    })
}

const getMeetingDocumentUrls = (meeting: MeetingMasterData): string[] => {
    const source = meeting as unknown as Record<string, unknown>
    const urls: string[] = []

    const addValue = (value: unknown) => {
        if (Array.isArray(value)) {
            value.forEach(addValue)
            return
        }

        if (typeof value === 'string') {
            urls.push(...parseDocumentUrls(value))
            return
        }

        if (typeof value === 'object' && value !== null) {
            const document = value as Record<string, unknown>

            addValue(
                document.DocumentURL ??
                document.DocumentUrl ??
                document.FileURL ??
                document.FileUrl ??
                document.DocumentPath ??
                document.FilePath ??
                document.URL ??
                document.Url
            )
        }
    }

    [
        'Documents',
        'DocumentDetails',
        'MeetingDocuments',
        'MeetingDocumentDetails',
        'MeetingDocumentData',
        'PresentationDocumentUrl',
        'PresentationDocumentURL',
        'PresentationDocumentUrls',
        'MOMDocumentUrl',
        'MOMDocumentURL',
        'MOMDocumentUrls',
        'SupportingDocumentUrl',
        'SupportingDocumentURL',
        'SupportingDocumentUrls',
        'DocumentURL'
    ].forEach((key) => addValue(source[key]))

    return Array.from(new Set(urls.filter(Boolean)))
}

export const getMeetingDocumentUrlGroups = (meeting: MeetingMasterData): MeetingDocumentUrlGroups => {
    const source = meeting as unknown as Record<string, unknown>

    const readUrls = (keys: string[]): string[] =>
        Array.from(
            new Set(
                keys.flatMap((key) => {
                    const value = source[key]

                    if (Array.isArray(value)) {
                        return value.flatMap((item) => typeof item === 'string' ? parseDocumentUrls(item) : [])
                    }

                    return typeof value === 'string' ? parseDocumentUrls(value) : []
                })
            )
        ).filter(Boolean)

    return {
        presentation: readUrls(['PresentationDocumentUrl', 'PresentationDocumentURL', 'PresentationDocumentUrls']),
        mom: readUrls(['MOMDocumentUrl', 'MOMDocumentURL', 'MOMDocumentUrls']),
        supporting: readUrls(['SupportingDocumentUrl', 'SupportingDocumentURL', 'SupportingDocumentUrls'])
    }
}

export const mapMeetingMasterToEventData = (meeting: MeetingMasterData): EventData => {
    const participants = getMeetingParticipants(meeting)
    const externalParticipants = getExternalMeetingParticipants(meeting)
    const normalizedMeetingType = (meeting.MeetingType || '').trim().toLowerCase()
    const isEmployeeMeeting = normalizedMeetingType.includes('employee')
    const isExternalMeeting = normalizedMeetingType.includes('external')

    const employeeIds = isEmployeeMeeting || isExternalMeeting
        ? participants.map((participant) => participant.ParticipantId).filter((participantId) => participantId > 0).join(',')
        : ''

    const departmentId = !isEmployeeMeeting && !isExternalMeeting
        ? participants.map((participant) => participant.ParticipantId).filter((participantId) => participantId > 0).join(',')
        : ''

    const externalParticipant = externalParticipants[0] ?? participants.find(
        (participant) => participant.ExternalId > 0 || participant.MeetingType.toLowerCase().includes('external')
    )

    const externalParticipantFromJson = parseExternalParticipantJson(meeting.ExternalParticipantJson)[0]

    const meetingType: MeetingType = isEmployeeMeeting
        ? 'Employees'
        : isExternalMeeting
            ? 'External Participant'
            : 'Department'

    const metadata: MeetingMetadata = {
        ...getInitialMeetingMetadata(),
        MeetingType: meetingType,
        MeetingMode: (['Online', 'Physical', 'Onsite', 'Offline'].includes(meeting.MeetingMode) ? meeting.MeetingMode : 'Physical') as MeetingMode,
        MeetingStatus: meeting.MeetingStatus,
        Remark: meeting.Remark || '',
        DepartmentName: participants[0]?.DepartmentName || (!isEmployeeMeeting && !isExternalMeeting ? participants[0]?.ParticipantName : '') || '',
        ExternalParticipants: externalParticipant?.ParticipantName || externalParticipantFromJson?.FullName || '',
        ExternalParticipantDetails: {
            ...getInitialMeetingMetadata().ExternalParticipantDetails,
            ParticipantName: externalParticipant?.ParticipantName || externalParticipantFromJson?.FullName || '',
            CompanyName: externalParticipantFromJson?.OrganizationName || '',
            DesignationName: externalParticipant?.DesignationName || '',
            MobileNumber: externalParticipant?.MobileNo || externalParticipantFromJson?.MobileNo || '',
            Email: externalParticipant?.EmaEmail || externalParticipantFromJson?.Email || ''
        },
        Agendas: getMeetingAgendas(meeting)
    }

    return {
        EventId: meeting.MeetingId,
        Uniquekey: meeting.UniqueKey,
        Type: 'Meeting',
        Title: meeting.MeetingTitle || meeting.MeetingName || '',
        DepartmentId: departmentId,
        DepartmentName: metadata.DepartmentName,
        EmployeeId: employeeIds,
        Date: meeting.MeetingDate,
        StartTime: meeting.MeetingStartTime,
        EndTime: meeting.MeetingEndTime,
        Room: metadata.MeetingMode === 'Online'
            ? meeting.MeetingLink || meeting.MeetingLocation
            : metadata.MeetingMode === 'Physical'
                ? String(meeting.ConferenceRoomId || meeting.RoomName || meeting.MeetingLocation || '')
                : meeting.MeetingLocation,
        Description: serializeMeetingMetadata(metadata),
        DocumentURL: getMeetingDocumentUrls(meeting).join(','),
        CreatedById: meeting.CreatedById,
        CreatedBy: '',
        CreatedDate: meeting.CreatedDate,
        ModifiedById: meeting.ModifiedById,
        ModifiedBy: '',
        ModifiedDate: meeting.ModifiedDate,
        LastModifiedBy: '',
        LastModifiedDate: meeting.ModifiedDate
    }
}

const normalizeMeetingTime = (time?: string): string => {
    const value = time?.trim() || ''
    return /^\d{2}:\d{2}$/.test(value) ? `${value}:00` : value
}

const toParticipantId = (value: string | number): number | null => {
    const participantId = Number(value)
    return Number.isInteger(participantId) && participantId > 0 ? participantId : null
}

export const buildMeetingMasterRequest = (
    form: AddUpdateEventRequest,
    metadata: MeetingMetadata,
    employeeIds: Array<string | number>,
    clientRegistrationId: number,
    conferenceId: number
): AddUpdateMeetingMasterRequest => {
    const participants: MeetingParticipantRequest[] = []

    if (metadata.MeetingType === 'Department') {
        Array.from(new Set(String(form.DepartmentId || '').split(',').map((departmentId) => departmentId.trim()).filter(Boolean))).forEach((departmentId) => {
            const participantId = toParticipantId(departmentId)

            if (participantId) {
                participants.push({
                    ParticipantType: 'Department',
                    ParticipantId: participantId
                })
            }
        })
    } else if (metadata.MeetingType === 'Employees') {
        Array.from(new Set(employeeIds.map(String))).forEach((employeeId) => {
            const participantId = toParticipantId(employeeId)

            if (participantId) {
                participants.push({
                    ParticipantType: 'Employee',
                    ParticipantId: participantId
                })
            }
        })
    }

    const externalParticipants: ExternalMeetingParticipantRequest[] = []

    if (metadata.MeetingType === 'External Participant') {
        const participant = metadata.ExternalParticipantDetails

        externalParticipants.push({
            FullName: participant.ParticipantName.trim(),
            Email: participant.Email.trim(),
            MobileNo: participant.MobileNumber.trim(),
            OrganizationName: participant.CompanyName.trim(),
            NoOfParticipants: 1,
            ClientRegistrationId: clientRegistrationId
        })
    }

    const meetingId = Math.max(0, Number(form.EventId) || 0)
    const meetingDate = form.Date?.slice(0, 10) || ''

    return {
        MeetingId: meetingId,
        UniqueKey: form.Uniquekey || DEFAULT_UNIQUE_KEY,
        MeetingStartTime: normalizeMeetingTime(form.StartTime),
        MeetingEndTime: normalizeMeetingTime(form.EndTime),
        MeetingDate: meetingDate ? `${meetingDate}T00:00:00.000Z` : '',
        MeetingTitle: form.Title?.trim() || '',
        MeetingType: metadata.MeetingType === 'External Participant'
            ? 'External'
            : metadata.MeetingType === 'Employees'
                ? 'Employee'
                : 'Department',
        MeetingLocation: '',
        MeetingLink: metadata.MeetingMode === 'Online' ? form.Room || '' : '',
        MeetingStatus: meetingId > 0 ? metadata.MeetingStatus : 'New',
        ParticipantDetailsJson: JSON.stringify(participants),
        ExternalParticipantJson: JSON.stringify(externalParticipants),
        MeetingMode: metadata.MeetingMode,
        Remark: metadata.Remark.trim(),
        ConferenceId: metadata.MeetingMode === 'Physical' ? conferenceId : 0,
        ConferenceRoomId: metadata.MeetingMode === 'Physical' ? Number(form.Room) || 0 : 0
    }
}
