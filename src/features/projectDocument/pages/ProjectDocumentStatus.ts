export const getDocumentStatusColor = (status: string = ""): string => {
  const map: Record<string, string> = {
    "Applied": "bg-[#135BEC33] text-[#135BEC]",
    "Doc Missing": "bg-[#FF9F2D33] text-[#FF9F2D]",
    "In Process": "bg-[#FFFB2D33] text-[#7B6B28]",
    "Issued": "bg-[#1212584A] text-[#121258]",
    "Not Applied": "bg-[#00000026] text-[#000000]",
    "Not Applicable": "bg-[#00000026] text-[#000000]",
    "Paid": "bg-[#00A80033] text-[#008F00]",
    "Payment Due": "bg-[#8A38F533] text-[#561F64]",
    "Rejected": "bg-[#FF104433] text-[#FF0037]",
  };

  return map[status] ?? "bg-[#F3F4F6] text-[#111827]";
};


