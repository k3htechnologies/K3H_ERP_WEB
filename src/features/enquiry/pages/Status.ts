export const getStatusColor = (status: string = "") => {

  const map: Record<string, { bg: string; text: string }> = {

    "Booking Done": { bg: "#51E5514A", text: "#48C848" },
    "Blocked": { bg: "#CC00FF4A", text: "#561F64" },
    "Cancelled": { bg: "#1D1D1D26", text: "#333333" },
    "Negotiation": { bg: "#FBFF0026", text: "#7B6B28" },
    "Lost": { bg: "#FF003726", text: "#FF0037" },
    "Retention": { bg: "#1AA0DB26", text: "#1AA0DB" },
    "Re - visit Scheduled": { bg: "#D1FAE5", text: "#065F46" },
    "Re - visit Proposed": { bg: "#FFA5004A", text: "#FF6600" },
    "Re - Visit": { bg: "#FFA5004A", text: "#FF6600" },
    "Follow - UP": { bg: "#FFA5004A", text: "#FF6600" },
    "Site Visit": { bg: "#FECACA", text: "#7F1D1D" },
    "Unit Selection / Blocked": { bg: "#FECACA", text: "#7F1D1D" },
  };

  return map[status] ?? { bg: "#F3F4F6", text: "#111827" };
};

export const getFollowUpColor = (status: string = "") => {

    const map = [
        { key: "no follow up", text: "#000" },
        { key: "today follow up", text: "#135BEC" },
        { key: "overdue by", text: "#FF0000" },
        { key: "follow up in", text: "#008000" },
    ];

    const found = map.find(x =>
        status.toLowerCase().includes(x.key)
    );

    return found ?? { text: "#111827" };
};
