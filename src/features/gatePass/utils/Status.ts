export const getStatusColor = (status: string = "") => {

  const map: Record<string, { bg: string; text: string }> = {

    "Delivery": { bg: "#51E5514A", text: "#48C848" },
    "Guest": { bg: "#CC00FF4A", text: "#561F64" },
    "Interview": { bg: "#1D1D1D26", text: "#333333" },
    "Meeting": { bg: "#FBFF0026", text: "#7B6B28" },
    "Others": { bg: "#FF003726", text: "#FF0037" },
  };

  return map[status] ?? { bg: "#F3F4F6", text: "#111827" };
};

