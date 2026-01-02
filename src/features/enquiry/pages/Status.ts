export const getStatusColor = (status: string = "") => {
  const map: Record<string, { bg: string; text: string }> = {
    "Follow-up":      { bg: "#CC00FF4A", text: "#561F64" },
    "Booking Done":   { bg: "#51E5514A", text: "#48C848" },
    "Enquiry":        { bg: "#1AA0DB26", text: "#1AA0DB" },
    "Lost":           { bg: "#FF003726", text: "#FF0037" },
    "Inactive":       { bg: "#1D1D1D26", text: "#333333" },
    "Negotiation":    { bg: "#FBFF0026", text: "#7B6B28" },
    "Revisit":        { bg: "#D1FAE5", text: "#065F46" },
    "Site Visit":     { bg: "#FFA5004A", text: "#FF6600" },
    "Rejected":       { bg: "#FECACA", text: "#7F1D1D" },
  };

  return map[status] ?? { bg: "#F3F4F6", text: "#111827" };
};
