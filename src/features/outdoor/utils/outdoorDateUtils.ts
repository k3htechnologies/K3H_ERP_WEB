export const parseOutdoorDate = (dateString: string): Date | null => {
  if (!dateString) return null;
  
  const trimmedDate = dateString.trim();
  const dateMatch = trimmedDate.match(/^(\d{4}-\d{2}-\d{2})/);
  
  if (dateMatch) {
    const datePart = dateMatch[1];
    return new Date(datePart + 'T00:00:00');
  }
  
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmedDate)) {
    return new Date(trimmedDate + 'T00:00:00');
  }
  
  const parsed = new Date(trimmedDate);
  return isNaN(parsed.getTime()) ? null : parsed;
};

export const parseOutdoorTime = (dateString: string, timeString: string): Date | null => {
  if (!dateString || !timeString) return null;
  
  const trimmedTime = timeString.trim();
  
  if (/^\d{2}:\d{2}$/.test(trimmedTime)) {
    const [hours, minutes] = trimmedTime.split(':');
    return new Date(`${dateString}T${hours}:${minutes}:00`);
  }
  
  const parsed = new Date(timeString);
  if (!isNaN(parsed.getTime())) {
    return parsed;
  }
  
  const timeMatch = timeString.match(/T(\d{2}):(\d{2})/);
  if (timeMatch) {
    return new Date(`${dateString}T${timeMatch[1]}:${timeMatch[2]}:00`);
  }
  
  return null;
};

export const isToday = (date: Date): boolean => {
  const today = new Date();
  return (
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate()
  );
};

export const isPreviousDate = (date: Date): boolean => {
  const today = new Date();
  const todayYear = today.getFullYear();
  const todayMonth = today.getMonth();
  const todayDay = today.getDate();
  
  const dateYear = date.getFullYear();
  const dateMonth = date.getMonth();
  const dateDay = date.getDate();
  
  return (
    dateYear < todayYear ||
    (dateYear === todayYear && dateMonth < todayMonth) ||
    (dateYear === todayYear && dateMonth === todayMonth && dateDay < todayDay)
  );
};


