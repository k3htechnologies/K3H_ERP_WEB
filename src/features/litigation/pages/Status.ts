export const getLitigationStatuscolor = (status: string = "") => {
  const map: Record<string, { bg: string; text: string }> = {
    open: { bg: "#51E5514A", text: "#48C848" },
    closed: { bg: "#FF003726", text: "#FF0037" },
    reopen: { bg: "#FFA5004A", text: "#FF6600" },
  };

  return map[status.toLowerCase()] ?? { bg: "#F3F4F6", text: "#111827" };
};