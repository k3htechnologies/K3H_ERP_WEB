export const getTicketStatusColor = (status: string = "") => {
  const map: Record<string, { bg: string; text: string }> = {
    "Open": { bg: "#00A8001F", text: "#00A800" },
    "Assigned": { bg: "#135BEC1F", text: "#135BEC" },
    "InProgress": { bg: "#135BEC1F", text: "#0D43A6" },
    "Resolved": { bg: "#FFFB2D4D", text: "#7A6103" },
    "Closed": { bg: "#E92C2C1F", text: "#E92C2C" },
    "ReOpen": { bg: "#1AA0DB1F", text: "#1AA0DB" },
  };

  return map[status] ?? { bg: "#00A8001F", text: "#00A800" };
};
