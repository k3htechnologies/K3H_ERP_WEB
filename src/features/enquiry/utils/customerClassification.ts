export type CustomerClassification = "Cold" | "Warm" | "Hot";

interface ClassificationInput {
  Budget?: any;
  PossessionType?: any;
  Requirement?: any;
  VillageMasterId?: string;
  Timeline?: string;
}

export const getCustomerClassification = (input: ClassificationInput): CustomerClassification => {

  const filledCount = [
    input.Budget,
    input.PossessionType,
    input.Requirement,
    input.VillageMasterId && input.VillageMasterId.trim() !== ""
  ].filter(Boolean).length;

  if (filledCount >= 3 && input.Timeline === "Within 1 Month") {
    return "Hot";
  }

  if (filledCount >= 3 && input.Timeline === "Beyond 1 Month") {
    return "Warm";
  }

  if (filledCount === 3) {
    return "Warm";
  }

  if (filledCount > 3) {
    return "Warm";
  }

  return "Cold";
};
