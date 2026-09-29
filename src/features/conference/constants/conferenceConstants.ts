export const DAY_HOUR_HEIGHT = 72;
export const DAY_START_HOUR = 8;
export const DAY_END_HOUR = 20;
export const DAY_HOURS = Array.from(
  { length: DAY_END_HOUR - DAY_START_HOUR },
  (_, i) => DAY_START_HOUR + i,
);

export const DAY_CARD_THEMES = [
  {
    bgClass: 'bg-[#E8F8F0]',
    borderClass: 'border-[#E8F8F0] border-l-[#22C55E]',
    timeClass: 'text-[#15803D]',
  },
  {
    bgClass: 'bg-[#F3E8FF]',
    borderClass: 'border-[#F3E8FF] border-l-[#A855F7]',
    timeClass: 'text-[#7E22CE]',
  },
  {
    bgClass: 'bg-[#DBEAFE]',
    borderClass: 'border-[#DBEAFE] border-l-[#3B82F6]',
    timeClass: 'text-[#1D4ED8]',
  },
  {
    bgClass: 'bg-[#FFEDD5]',
    borderClass: 'border-[#FFEDD5] border-l-[#F97316]',
    timeClass: 'text-[#C2410C]',
  },
  {
    bgClass: 'bg-[#FCE7F3]',
    borderClass: 'border-[#FCE7F3] border-l-[#EC4899]',
    timeClass: 'text-[#BE185D]',
  },
] as const;
