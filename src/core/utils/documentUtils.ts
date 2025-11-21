export const parseDocumentUrls = (urls?: string | null): string[] => {
    return (urls || '')
        .split(',')
        .map((x) => x.trim())
        .filter((x) => x.length > 0);
};
