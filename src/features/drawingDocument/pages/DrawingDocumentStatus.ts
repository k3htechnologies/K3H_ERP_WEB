export const getDocumentStatusColor = (status: string = ""): string => {
  const map: Record<string, string> = {
    "Advance": "bg-[#135BEC33] text-[#135BEC]",
    "Good For Construction (GFC)": "bg-[#FF9F2D33] text-[#FF9F2D]",
  };

  return map[status] ?? "bg-[#F3F4F6] text-[#111827]";
};


