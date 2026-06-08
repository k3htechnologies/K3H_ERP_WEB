export const getStatusColor = (status: string = "") => {

  const map: Record<string, { bg: string; text: string }> = {

    "On-Going": { bg: "#DBEAFE", text: "#1D4ED8" },
    "Up-Coming": { bg: "#FFEDD5", text: "#C2410C" },
    "Completed": { bg: "#DCFCE7", text: "#15803D" },
    "On-Hold": { bg: "#FEF3C7", text: "#A16207" },
    "Planning": { bg: "#EDE9FE", text: "#6D28D9" },
    "Cancelled": { bg: "#FEE2E2", text: "#B91C1C" },
  };

  return map[status] ?? { bg: "#F3F4F6", text: "#111827" };
};


