export const parseDocumentUrls = (urls?: string | null): string[] => {
    return (urls || '')
        .split(',')
        .map((x) => x.trim())
        .filter((x) => x.length > 0);
};

export const getDocumentNameFromUrl = (url: string): string => {
    const path = url.split('?')[0];
    const name = path.split('/').pop() || 'Document';

    try {
        return decodeURIComponent(name);
    } catch {
        return name;
    }
};