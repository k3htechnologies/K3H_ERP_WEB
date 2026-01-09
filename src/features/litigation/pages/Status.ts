export const getStatuscolor = (status: string = "") => {
  const map: Record<string, { bg: string; text: string }> = {
    "Open": { bg: "#51E5514A", text: "#48C848" },
    "Closed": { bg: "#FF003726", text: "#FF0037" },
    "Reopen": { bg: "#FECACA", text: "#7F1D1D" },

  };

  return map[status] ?? { bg: "#F3F4F6", text: "#111827" };
};
