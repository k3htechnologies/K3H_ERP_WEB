// ----------------------------------
// 🔹 FILTER ONLY NUMBERS

import { countryList } from "@/ui/components/forms/MobileNumberInput";

// ----------------------------------
export const filterNumbers = (value: string): string =>
  value.replace(/[^0-9]/g, "");

// ----------------------------------
// 🔹 FILTER ONLY LETTERS (A–Z + space)
// ----------------------------------
export const filterLetters = (value: string): string =>
  value.replace(/[^A-Za-z\s]/g, "");

// ----------------------------------
// 🔹 FILTER ALPHA-NUMERIC + SPACE
// ----------------------------------
export const filterAlphaNumeric = (value: string): string =>
  value.replace(/[^A-Za-z0-9\s]/g, "");

// ----------------------------------
// 🔹 FILTER MOBILE NUMBER (max 10 digits)
// ----------------------------------
export const filterMobile = (value: string): string =>
  value.replace(/[^0-9]/g, "").slice(0, 10);

// export const isValidMobile = (mobile: string): boolean => {
//   if (!mobile) return false;
//   const regex = /^[6-9]\d{9}$/;
//   return regex.test(mobile.trim());
// };

export const isValidMobile = ( mobile: string, countryCode?: string): boolean => {

  if(!countryCode){

    countryCode = "+91";
  }

  if (!mobile) return false;

  const country = countryList.find( (x) => x.code === countryCode);

  if (!country) return false;
  
  const regex = country.regex || new RegExp( `^\\d{${country.mobileLength}}$`);

  return regex.test(mobile.trim());
};

// ----------------------------------
// 🔹 FILTER LANDLINE (numbers + dash)
// Example: 079-12345678
// ----------------------------------
export const filterLandline = (value: string): string =>
  value.replace(/[^0-9-]/g, "");

export const isValidLandline = (number: string): boolean => {
  if (!number) return false;
  const regex = /^0\d{2,4}[-]?\d{6,8}$/;
  return regex.test(number.trim());
};
// ----------------------------------
// 🔹 FILTER PAN (ABCDE1234F)
// Only uppercase letters + numbers
// ----------------------------------
export const filterPAN = (value: string): string =>
  value.replace(/[^A-Za-z0-9]/g, "").toUpperCase().slice(0, 10);

export const isValidPAN = (pan: string): boolean => {
  if (!pan) return false;
  const value = pan.toUpperCase().trim();
  const regex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
  return regex.test(value);
};
// ----------------------------------
// 🔹 FILTER AADHAAR (only 12 digits)
// ----------------------------------
export const filterAadhaar = (value: string): string =>
  value.replace(/[^0-9]/g, "").slice(0, 12);

export const isValidAadhaar = (aadhaar: string): boolean => {
  if (!aadhaar) return false;
  const regex = /^\d{12}$/;
  return regex.test(aadhaar.trim());
};

// ----------------------------------
// 🔹 FILTER EMAIL (only valid chars)
// ----------------------------------
export const filterEmail = (value: string): string =>
  value.replace(/[^a-zA-Z0-9@._+-]/g, "");

export const isValidEmail = (email: string): boolean => {
  if (!email) return false;
  const regex = /^[a-zA-Z0-9._%+-]+@[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)+$/;
  return regex.test(email.trim());
};


// ----------------------------------
// 🔹 FILTER GST NUMBER (A–Z + 0–9 only)
// ----------------------------------
export const filterGST = (value: string): string =>
  value.replace(/[^A-Za-z0-9]/g, "").toUpperCase().slice(0, 15);

export const isValidGST = (gst: string): boolean => {
  if (!gst) return false;
  const value = gst.toUpperCase().trim();
  if (value.length !== 15) return false;

  const regex =
    /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
  return regex.test(value);
};

// Only A-Z + 0-9 and max 21 chars
export const filterCIN = (value: string): string =>
  value.replace(/[^A-Za-z0-9]/g, "").toUpperCase().slice(0, 21);

export const isValidCIN = (cin: string): boolean => {
  if (!cin) return false;
  const value = cin.toUpperCase().trim();
  if (value.length !== 21) return false;

  const regex = /^[LU]\d{5}[A-Z]{2}\d{4}[A-Z]{3}\d{6}$/;
  return regex.test(value);
};

// Allowed: A-Z, 0-9, -, /    | Max Length = 20
export const filterRERA = (value: string): string =>
  value.replace(/[^A-Za-z0-9\-\/]/g, "").toUpperCase().slice(0, 20);


export const isValidRERA = (rera: string): boolean => {
  if (!rera) return false;
  const value = rera.toUpperCase().trim();
  const regex = /^[A-Z0-9\-\/]{6,20}$/;
  return regex.test(value);
};


// ----------------------------------
// 🔹 FILTER IFSC (Uppercase, 11 chars, A–Z + 0–9)
// Format: 4 letters + '0' + 6 alphanum (e.g. HDFC0ABCD12)
// ----------------------------------
export const filterIFSC = (value: string): string =>
  value.replace(/[^A-Za-z0-9]/g, "").toUpperCase().slice(0, 11);

export const isValidIFSC = (ifsc: string): boolean => {
  if (!ifsc) return false;
  const value = ifsc.toUpperCase().trim();
  // Indian IFSC: 4 letters, '0', then 6 alpha-numeric characters
  const regex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
  return regex.test(value);
};

// ----------------------------------
// 🔹 FILTER ONLY NUMBERS AND DECIMAL
// ----------------------------------

export const filterNumbersWithDecimal = (value: string): string => {
  // Allow only digits and dot
  value = value.replace(/[^0-9.]/g, "");

  // Allow only one dot
  const parts = value.split(".");
  if (parts.length > 2) {
    value = parts[0] + "." + parts.slice(1).join("");
  }

  // Split integer & decimal
  let [intPart = "", decimalPart = ""] = value.split(".");

  // Max 16 digits before decimal
  intPart = intPart.slice(0, 16);

  // Max 2 digits after decimal
  decimalPart = decimalPart.slice(0, 2);

  // Build final value
  return value.includes(".") ? `${intPart}.${decimalPart}` : intPart;
};
// ----------------------------------
// PERCENTAGE
// ----------------------------------

export const filterPercentage = (value: string): string =>
  value
    .replace(/[^0-9.]/g, '')          // allow digits & dot
    .replace(/(\..*)\./g, '$1')       // only one dot
    .slice(0, 6);                     // e.g. 100.00

export const isValidPercentage = (value: string): boolean => {
  if (!value) return false;

  const num = Number(value);
  if (isNaN(num)) return false;

  return num >= 0 && num <= 100;
};

export const allowPercentage = (value: string) => {
  // Allow empty
  if (value === "") return value;

  // Allow only digits & single decimal
  if (!/^\d*\.?\d*$/.test(value)) return null;

  const num = Number(value);

  // Block values greater than 100
  if (num > 100) return null;

  return value;
};


// ----------------------------------
// CALCULATE PERCENTAGE
// ----------------------------------

export const calculatePercentageAmount = (
  amount: number | null | undefined,
  percentage: number | null | undefined,
  decimals = 2
): number | null => {
  if (
    amount == null ||
    percentage == null ||
    isNaN(amount) ||
    isNaN(percentage)
  ) {
    return null;
  }

  const result = (amount * percentage) / 100;

  return (
    Math.round(result * Math.pow(10, decimals)) /
    Math.pow(10, decimals)
  );
};

// ----------------------------------
// 🔹 FILTER PASSPORT (A1234567)
// 1 letter + 7 digits (India)
// ----------------------------------
export const filterPassportNumber = (value: string): string =>
  value.replace(/[^A-Za-z0-9]/g, "").toUpperCase().slice(0, 8);

export const isValidPassportNumber = (passport: string): boolean => {
  if (!passport) return false;
  const value = passport.toUpperCase().trim();
  const regex = /^[A-Z]{1}[0-9]{7}$/;
  return regex.test(value);
};

// ----------------------------------
// 🔹 FILTER DRIVING LICENSE
// Example: MH1420110062271
// ----------------------------------
export const filterDrivingLicenseNumber = (value: string): string =>
  value.replace(/[^A-Za-z0-9]/g, "").toUpperCase().slice(0, 16);

export const isValidDrivingLicenseNumber = (dl: string): boolean => {
  if (!dl) return false;
  const value = dl.toUpperCase().trim();
  const regex = /^[A-Z]{2}[0-9]{13,14}$/;
  return regex.test(value);
};

// ----------------------------------
// 🔹 FILTER VOTER ID (EPIC)
// ABC1234567
// ----------------------------------
export const filterVoterId = (value: string): string =>
  value.replace(/[^A-Za-z0-9]/g, "").toUpperCase().slice(0, 10);

export const isValidVoterId = (voterId: string): boolean => {
  if (!voterId) return false;
  const value = voterId.toUpperCase().trim();
  const regex = /^[A-Z]{3}[0-9]{7}$/;
  return regex.test(value);
};

// ----------------------------------
// 🔹 FILTER GOOGLE MAPS URL
// ----------------------------------
export const filterGoogleMapsUrl = (value: string): string => {
  // remove spaces
  value = value.replace(/\s+/g, '');

  // allow only URL-safe characters
  value = value.replace(/[^a-zA-Z0-9/:.?&=_\-#%]/g, '');

  return value;
};

export const isValidGoogleMapsUrl = (url: string): boolean => {
  if (!url) return false;

  const googleMapsRegex =
    /^(https?:\/\/)?(www\.)?(google\.com\/maps|maps\.google\.com|goo\.gl\/maps|maps\.app\.goo\.gl)\/?.*/i;

  return googleMapsRegex.test(url);
};


// ----------------------------------
// 🔹 FILTER WEBSITE URL
// ----------------------------------
export const filterWebsiteUrl = (value: string): string => {
  // remove spaces
  value = value.replace(/\s+/g, '');

  // allow only URL-safe characters
  value = value.replace(/[^a-zA-Z0-9/:.?&=_\-#%]/g, '');

  return value;
};


export const isValidWebsiteUrl = (url: string): boolean => {

  if (!url) return false;

  const urlRegex =
    /^(https?:\/\/)?(www\.)?[a-zA-Z0-9-]+\.[a-zA-Z]{2,}(\/.*)?$/i;

  return urlRegex.test(url);
  
};

// ----------------------------------
// 🔹 FILTER ACCOUNT NUMBER
// ----------------------------------

export const isValidAccount = (num: string) =>
  /^[0-9]{6,18}$/.test(num);

// ----------------------------------
// 🔹 FILE PICKER
// ----------------------------------

export const hasAnyFile = (files: (File | string)[], existingUrl?: string) =>
  files.length > 0 || (!!existingUrl && existingUrl.trim().length > 0);

// ----------------------------------
// 🔹 CHECK MINIMUM AGE (Default 18)
// ----------------------------------
export const isAtLeastAge = (
  dobInput: string | Date | null | undefined,
  minAge = 18
): boolean => {

  if (!dobInput) return false;

  const dob = new Date(dobInput);
  if (isNaN(dob.getTime())) return false; // invalid date

  const today = new Date();

  // Person's birthday after adding minAge years
  const minAgeDate = new Date(
    dob.getFullYear() + minAge,
    dob.getMonth(),
    dob.getDate()
  );

  return minAgeDate <= today;
};

// ----------------------------------
// 🔹 CHECK PATH IS SUB SUB
// ----------------------------------
export const isSubSubRoute = (pathname: string): boolean => {
  const parts = pathname
    .replace(/^\/+|\/+$/g, '') // remove leading & trailing slashes
    .split('/')
    .filter(x => x); // remove empty strings if any

  return parts.length >= 2;
};

// ----------------------------------
// 🔹 CALCULATED HOW MUCH FILE WE MARGE FOR VALIDATION
// ----------------------------------

export const calculateMergedFiles = (
  existingFiles?: (File | string)[],
  currentStateFiles?: (File | string)[],
  removedUrls?: string[]
): (File | string)[] => {
  const removedSet = new Set((removedUrls || []).map(url => url.trim()).filter(Boolean));

  const existingUrls = (existingFiles || [])
    .filter(file => typeof file === 'string')
    .map(url => String(url).trim());

  const currentStateUrls = (currentStateFiles || [])
    .filter(file => typeof file === 'string')
    .map(url => String(url).trim());

  const currentStateUrlSet = new Set(currentStateUrls);

  const preservedExisting = existingUrls
    .filter(url => !removedSet.has(url))
    .filter(url => currentStateUrlSet.has(url))
    .map(url => url);

  const newFiles = (currentStateFiles || [])
    .filter(file => file instanceof File);

  return [...preservedExisting, ...newFiles];
};

// ----------------------------------
//HELPER FUNCTION TO MERGE FILES PROPERLY : PRESERVES EXISTING FILES (STRINGS) THAT WEREN'T REMOVED, ADDS NEW FILES (FILE OBJECTS)
// ----------------------------------
export const mergeFiles = (
  existingFiles?: (File | string)[],
  currentStateFiles?: (File | string)[],
  removedUrls?: string[]
): (File | string)[] => {
  const removedSet = new Set((removedUrls || []).map(url => url.trim()).filter(Boolean));

  const existingUrls = (existingFiles || [])
    .filter(file => typeof file === 'string')
    .map(url => String(url).trim());

  const currentStateUrls = (currentStateFiles || [])
    .filter(file => typeof file === 'string')
    .map(url => String(url).trim());

  const currentStateUrlSet = new Set(currentStateUrls);

  const preservedExisting = existingUrls
    .filter(url => !removedSet.has(url))
    .filter(url => currentStateUrlSet.has(url))
    .map(url => url);

  const newFiles = (currentStateFiles || [])
    .filter(file => file instanceof File);

  return [...preservedExisting, ...newFiles];
};

// ----------------------------------
// HELPER FUNCTION TO CREATE URL STRING FROM MERGED FILES
// ----------------------------------
export const createFileUrlString = (mergedFiles: (File | string)[]): string => {
  return mergedFiles
    .map(file => typeof file === 'string' ? file : file.name)
    .filter(Boolean)
    .join(',');
};

// ----------------------------------
// 🔹 CALCULATED HOW MUCH REMOVED FILE WE MARGE FOR VALIDATION
// ----------------------------------

export const calculateRemovedFiles = (
  originalFiles?: (File | string)[],
  currentStateFiles?: (File | string)[],
  existingRemovedUrls?: string[]
): string[] => {
  if (!originalFiles || originalFiles.length === 0) return existingRemovedUrls || [];


  // Get original file URLs (strings only)
  const originalUrls = originalFiles
    .filter(file => typeof file === 'string')
    .map(url => String(url).trim());

  // Get current state file URLs (strings only)
  const currentStateUrls = (currentStateFiles || [])
    .filter(file => typeof file === 'string')
    .map(url => String(url).trim());

  const currentStateUrlSet = new Set(currentStateUrls);

  // Find files that were in original but not in current state (removed via onChange)
  const removedViaOnChange = originalUrls.filter(url => !currentStateUrlSet.has(url));

  // Combine existing removed URLs with newly detected removed files
  const allRemoved = [...(existingRemovedUrls || []), ...removedViaOnChange];

  // Remove duplicates
  return Array.from(new Set(allRemoved.map(url => url.trim()).filter(Boolean)));
};
// ----------------------------------
//HAS ANY FILE PRESENT IN FILE DayPicker
// ----------------------------------

export const hasAnyDocumentFile = (
  documentFiles: (File | string)[] = [],
  documentURL?: string | null,
  removedDocumentURLs: string[] = []
): boolean => {

  const hasNewFiles = documentFiles?.some(f => f instanceof File);

  const existingUrls = (documentURL ?? "")
    .split(",")
    .map(x => x.trim())
    .filter(x => x !== "");

  const remainingExisting = existingUrls.filter(
    url => !removedDocumentURLs?.includes(url)
  );

  return hasNewFiles || remainingExisting.length > 0;
};
// ----------------------------------
//CHECK END TIME GREATER THAN START TIME
// ----------------------------------
export function isEndTimeGreater(startTime: string, endTime: string): boolean {
  if (!startTime || !endTime) return false;

  const [sH, sM] = startTime.split(":").map(Number);
  const [eH, eM] = endTime.split(":").map(Number);

  const startMinutes = sH * 60 + sM;
  const endMinutes = eH * 60 + eM;

  return endMinutes > startMinutes;
}

// ----------------------------------
// 🔹 FILTER TAN (ABCD12345E)
// Only uppercase letters + numbers
// ----------------------------------
export const filterTAN = (value: string): string =>
  value.replace(/[^A-Za-z0-9]/g, "").toUpperCase().slice(0, 10);

// ----------------------------------
// 🔹 VALIDATE TAN
// ----------------------------------
export const isValidTAN = (tan: string): boolean => {
  if (!tan) return false;
  const value = tan.toUpperCase().trim();
  const regex = /^[A-Z]{4}[0-9]{5}[A-Z]{1}$/;
  return regex.test(value);
};

// Allowed: A-Z, 0-9, -, / | Max Length = 20
export const filterAPF = (value: string): string =>
  value.replace(/[^A-Za-z0-9\-\/]/g, "").toUpperCase().slice(0, 20);

export const isValidAPF = (apf: string): boolean => {
  if (!apf) return false;

  const value = apf.toUpperCase().trim();

  const regex = /^[A-Z0-9\-\/]{6,20}$/;

  return regex.test(value);
};



