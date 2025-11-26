// ----------------------------------
// 🔹 FILTER ONLY NUMBERS
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

export const isValidMobile = (mobile: string): boolean => {
    if (!mobile) return false;
    const regex = /^[6-9]\d{9}$/;
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
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[A-Za-z]{2,}$/;
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