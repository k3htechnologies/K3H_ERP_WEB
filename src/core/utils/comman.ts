export function getTimeDuration(startTime: string, endTime: string): string {
  if (!startTime || !endTime) return "";

  const [sH, sM] = startTime.split(":").map(Number);
  const [eH, eM] = endTime.split(":").map(Number);

  const start = sH * 60 + sM;
  let end = eH * 60 + eM;

  // Handle next day (cross midnight)
  if (end < start) {
    end += 24 * 60;
  }

  const diff = end - start;
  const hours = Math.floor(diff / 60);
  const minutes = diff % 60;

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

export const toMinutes = (time: string) => {
  if (!time) return 0;
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
};

export const toHHMM = (minutes: number) => {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
};

export const calculateAge = (dob: string) => {
  if (!dob) return ''

  const birthDate = new Date(dob)
  const today = new Date()

  let age = today.getFullYear() - birthDate.getFullYear()
  const monthDiff = today.getMonth() - birthDate.getMonth()

  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--
  }

  return age.toString()
}

export function formatToKLCr(value: number): string {
  if (value >= 10000000) {
    return (value / 10000000).toFixed(value % 10000000 === 0 ? 0 : 1) + " CR";
  }

  if (value >= 100000) {
    return (value / 100000).toFixed(value % 100000 === 0 ? 0 : 1) + " L";
  }

  if (value >= 1000) {
    return (value / 1000).toFixed(value % 1000 === 0 ? 0 : 1) + " K";
  }

  return value.toString();
}

const parseDDMMYYYY = (value: string | Date): Date => {
  if (value instanceof Date) return value;

  const [dd, mm, yyyy] = value.split("-");
  return new Date(Number(yyyy), Number(mm) - 1, Number(dd));
};

export const isToDateGreaterOrEqualFromDate = (
  fromDate: string | Date,
  toDate: string | Date
): boolean => {
  if (!fromDate || !toDate) return false;

  const from = parseDDMMYYYY(fromDate);
  const to = parseDDMMYYYY(toDate);

  return to.getTime() >= from.getTime();
};

//Common Validation: Allow Only Past N Days (Including Today)

export const isDateWithinPastDays = (dateStr: string | null | undefined, pastDays: number): boolean => {

  if (!dateStr) return false;

  const inputDate = new Date(dateStr);
  const today = new Date();

  // Normalize to date-only (important)
  inputDate.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);

  const minAllowedDate = new Date(today);
  minAllowedDate.setDate(today.getDate() - pastDays);

  return inputDate >= minAllowedDate && inputDate <= today;

};

export const format24To12Hour = (hour: string, minute: string) => {
  const h = Number(hour)
  const ampm = h >= 12 ? "PM" : "AM"
  const displayHour = h >= 13 ? h - 12 : h
  return `${displayHour.toString().padStart(2, "0")}:${minute} ${ampm}`
}
export const getMonthDateRange = (date: Date) => {

  const fromDate = new Date(date.getFullYear(), date.getMonth(), 1);
  const toDate = new Date(date.getFullYear(), date.getMonth() + 1, 0);

  fromDate.setHours(0, 0, 0, 0);
  toDate.setHours(23, 59, 59, 999);

  return { fromDate, toDate };
};

export const getCurrentTime = () => {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
};

export const getTodayDateRange = () => {

  const today = new Date();

  const fromDate = new Date(today);
  const toDate = new Date(today);

  fromDate.setHours(0, 0, 0, 0);
  toDate.setHours(23, 59, 59, 999);

  return { fromDate, toDate };
};

export const getWeekToDateRange = () => {

  const now = new Date();

  const today = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  );

  const day = today.getDay();

  const diffToTuesday = (day >= 2) ? day - 2 : day + 5;

  const fromDate = new Date(today);
  fromDate.setDate(today.getDate() - diffToTuesday);

  const toDate = new Date(fromDate);
  toDate.setDate(fromDate.getDate() + 6);

  fromDate.setHours(0, 0, 0, 0);
  toDate.setHours(23, 59, 59, 999);

  return { fromDate, toDate };
};
export const getYearToDateRange = () => {

  const today = new Date();

  const fromDate = new Date(today.getFullYear(), 0, 1);
  const toDate = new Date(today);

  fromDate.setHours(0, 0, 0, 0);
  toDate.setHours(23, 59, 59, 999);

  return { fromDate, toDate };
};

export const getSafeString = (value: any, fallback: string = "-"): string => {
  if (value === null || value === undefined) return fallback;
  if (typeof value === "object" && Object.keys(value).length === 0) return fallback;
  if (typeof value === "object") return fallback;
  if (String(value).trim() === "") return fallback;
  return String(value);
};

export const formatCurrency = (value: number | null | undefined): string => {
  if (value === null || value === undefined) return '-';
  return `₹${Number(value).toLocaleString('en-IN')}`;
};

export const cleanHtml = (html: string) => {
  if (!html) return ''

  const parser = new DOMParser()
  const doc = parser.parseFromString(html, 'text/html')

  // ✅ Remove Quill UI
  doc.querySelectorAll('.ql-ui').forEach(el => el.remove())

  // ✅ Convert OL → UL (bullet)
  doc.querySelectorAll('ol').forEach(ol => {
    const isBullet = ol.querySelector('li[data-list="bullet"]')

    if (isBullet) {
      const ul = doc.createElement('ul')

      ol.querySelectorAll('li').forEach(li => {
        const newLi = doc.createElement('li')
        newLi.innerHTML = li.innerHTML
        ul.appendChild(newLi)
      })

      ol.replaceWith(ul)
    }
  })

  // ✅ Remove data-list
  doc.querySelectorAll('[data-list]').forEach(el =>
    el.removeAttribute('data-list')
  )

  // ✅ Handle indent
  doc.querySelectorAll('[class*="ql-indent-"]').forEach(el => {
    const match = el.className.match(/ql-indent-(\d+)/)

    if (match) {
      const level = parseInt(match[1], 10)
      el.setAttribute('style', `margin-left:${level * 20}px`)
    }

    el.removeAttribute('class')
  })

  // ✅ Remove remaining ql classes
  doc.querySelectorAll('[class]').forEach(el => {
    if (el.className.startsWith('ql-')) {
      el.removeAttribute('class')
    }
  })

  // ✅ Remove empty paragraphs
  doc.querySelectorAll('p').forEach(p => {
    if (p.innerHTML === '<br>' || p.innerText.trim() === '') {
      p.remove()
    }
  })

  return doc.body.innerHTML.trim()
}

export const copyToClipboard = async (text?: string): Promise<boolean> => {
  if (!text) {
    return false;
  }
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    return false;
  }
};

export const sendEmail = (email: string) => {
  if (email) {
    window.open(`https://mail.google.com/mail/?view=cm&fs=1&to=${email}`, '_blank');
  }
}

