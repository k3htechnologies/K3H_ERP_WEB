export const getMaterialRequisitionStatusColor = (status: string = "") => {
  const map: Record<string, { bg: string; text: string }> = {
    "Completed": { bg: "#51E5514A", text: "#48C848" },
    "Closed": { bg: "#FF003726", text: "#FF0037" },
    "Ongoing": { bg: "#DBEAFE", text: "#2563EB" },
  };
  return map[status] ?? { bg: "#F3F4F6", text: "#111827" };
};
