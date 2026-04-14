export const getNameInitials = (name?: string): string => {
  if (!name || !name.trim()) return "NA";

  const words = name.trim().split(/\s+/);

  // Single word (e.g. "Prachin")
  if (words.length === 1) {
    return words[0].slice(0, 2).toUpperCase();
  }

  // Multiple words (e.g. "Prachin Bari")
  return (words[0][0] + words[1][0]).toUpperCase();
};