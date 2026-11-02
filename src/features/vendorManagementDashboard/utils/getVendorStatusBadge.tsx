
export const getVendorStatusBadge = (status: string) => {
    const normalized = status?.toLowerCase()?.trim();

    let styles = 'bg-slate-100 text-slate-700 border-slate-200'; // Fallback default

    if (normalized === 'completed') {
        styles = 'bg-[#ebfaf2] text-[#1a9e75] border-[#b2ebd4]';
    } else if (normalized === 'pending') {
        styles = 'bg-[#fff9e6] text-[#d48b00] border-[#ffebb3]';
    } else if (normalized === 'failed' || normalized === 'rejected') {
        styles = 'bg-[#fdeeed] text-[#e53935] border-[#f9b8b5]';
    } else if (normalized === 'in progress' || normalized === 'processing') {
        styles = 'bg-[#eff6ff] text-[#2563eb] border-[#bfdbfe]';
    }

    return (
        <span
            className={`inline-flex items-center justify-center px-3 py-1 text-xs font-semibold rounded-md border tracking-wide select-none ${styles}`}
        >
            {status}
        </span>
    );
};