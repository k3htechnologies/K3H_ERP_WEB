export const updateFilter = <T extends Record<string, unknown>>(
    filters: T,
    key: string,
    value: unknown
): T => {
    
    const updated = { ...filters } as Record<string, unknown>;

    if (value !== undefined && value !== null && String(value).trim() !== '') {
        
        updated[key] = typeof value === 'string' ? value.trim() : value;
    } else {
        
        delete updated[key];
    }

    return updated as T;
};
