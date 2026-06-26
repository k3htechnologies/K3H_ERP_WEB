export const getStatusColor = (status: string): string => {
  
  const normalized = status?.toLowerCase().trim();

  switch (normalized) {
    case "approved":
      return "bg-[#DCFCE7] text-[#00A800]  !important";

    case "rejected":
      return "bg-[#FFDEDE] text-[#FF0000]  !important";

    case "pending":
      return "bg-[#FFF0C2] text-[#7E4604]  !important";

    case "partial pending":
      return "bg-[#F9DFFF] text-[#561F64]  !important";

    case "cancel":
      return "bg-[#E8EFF8] text-[#1D1D1D]  !important";

    case "refund":
      return "bg-[#DEE9FF] text-[#1D4ED8]  !important";

    case "completed":
      return "bg-[#15803D] text-[#CEFFCE]  !important";

      case "yes":
      return "bg-[#2E844A1A] text-[#2E844A]  !important";

    default:
      return "bg-gray-100 text-gray-700";
  }
};
