export type DropdownValue = {
  label: string;
  value: string | number;
};

export const createDropdownInitialValue = (
  id: number | string | null | undefined,
  label?: string
): DropdownValue | null => {
  if (!id) return null;

  return {
    label: label || String(id),
    value: String(id),
  };
};
