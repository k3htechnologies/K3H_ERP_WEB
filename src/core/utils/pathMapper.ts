export const normalizePath = (p?: string): string => {
    if (!p && p !== '') return ''
    const s = String(p || '').trim()
    if (s === '') return ''
    let out = s.toLowerCase()
    // ensure leading slash
    if (!out.startsWith('/')) out = '/' + out
    // remove trailing slashes (except root '/')
    if (out.length > 1) out = out.replace(/\/+$/, '')
    return out
}

export const mapPathToRoute = (apiPath: string): string => {
    const normalized = normalizePath(apiPath);
    
    const routeMap: Record<string, string> = {
        '/departmentmaster': '/departmentMaster',
        '/designationmaster': '/designationMaster',
        '/employeemaster': '/employeeMaster'
    }

    // If a mapped route exists, return it (normalized)
    if (normalized && routeMap[normalized]) {
        // keep the mapped value as-is (your app routes may be camelCase intentionally)
        return routeMap[normalized]
    }

    // Otherwise, return normalized API path so caller can still compare reliably.
    // (This avoids silently mapping unknowns to '/dashboard'.)
    return normalized || ''
}

