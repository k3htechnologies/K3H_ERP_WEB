import React from "react";
import { Phone, ChevronDown, InfoIcon } from "lucide-react";
import ReactCountryFlag from "react-country-flag";
import { Input } from "./Input";
import { SinglePageSelection } from "../DropDown/SinglePageSelection";

export interface CountryCode {
    name: string;
    code: string;
    countryCode: string;
    mobileLength: number;
    regex?: RegExp;
}

interface MobileNumberInputProps {
    label?: string,
    mobileNumber: string;
    countryCode: string;
    disabled?: boolean;
    error?: string;
    required?: boolean;
    onMobileChange: (value: string) => void;
    onCountryCodeChange: (value: string) => void;
}

export const countryList: CountryCode[] = [
    { name: "Afghanistan", code: "+93", countryCode: "AF", mobileLength: 9, regex: /^\d{9}$/, },
    { name: "Albania", code: "+355", countryCode: "AL", mobileLength: 9, regex: /^\d{9}$/, },
    { name: "Algeria", code: "+213", countryCode: "DZ", mobileLength: 9 },
    { name: "Andorra", code: "+376", countryCode: "AD", mobileLength: 6 },
    { name: "Angola", code: "+244", countryCode: "AO", mobileLength: 9 },
    { name: "Argentina", code: "+54", countryCode: "AR", mobileLength: 10 },
    { name: "Armenia", code: "+374", countryCode: "AM", mobileLength: 8 },
    { name: "Australia", code: "+61", countryCode: "AU", mobileLength: 9 },
    { name: "Austria", code: "+43", countryCode: "AT", mobileLength: 10 },
    { name: "Azerbaijan", code: "+994", countryCode: "AZ", mobileLength: 9 },
    { name: "Bahrain", code: "+973", countryCode: "BH", mobileLength: 8 },
    { name: "Bangladesh", code: "+880", countryCode: "BD", mobileLength: 10 },
    { name: "Belarus", code: "+375", countryCode: "BY", mobileLength: 9 },
    { name: "Belgium", code: "+32", countryCode: "BE", mobileLength: 9 },
    { name: "Bhutan", code: "+975", countryCode: "BT", mobileLength: 8 },
    { name: "Bolivia", code: "+591", countryCode: "BO", mobileLength: 8 },
    { name: "Bosnia and Herzegovina", code: "+387", countryCode: "BA", mobileLength: 8 },
    { name: "Botswana", code: "+267", countryCode: "BW", mobileLength: 8 },
    { name: "Brazil", code: "+55", countryCode: "BR", mobileLength: 11 },
    { name: "Brunei", code: "+673", countryCode: "BN", mobileLength: 7 },
    { name: "Bulgaria", code: "+359", countryCode: "BG", mobileLength: 9 },
    { name: "Cambodia", code: "+855", countryCode: "KH", mobileLength: 9 },
    { name: "Cameroon", code: "+237", countryCode: "CM", mobileLength: 9 },
    { name: "Canada", code: "+1", countryCode: "CA", mobileLength: 10 },
    { name: "Chile", code: "+56", countryCode: "CL", mobileLength: 9 },
    { name: "China", code: "+86", countryCode: "CN", mobileLength: 11 },
    { name: "Colombia", code: "+57", countryCode: "CO", mobileLength: 10 },
    { name: "Costa Rica", code: "+506", countryCode: "CR", mobileLength: 8 },
    { name: "Croatia", code: "+385", countryCode: "HR", mobileLength: 9 },
    { name: "Cyprus", code: "+357", countryCode: "CY", mobileLength: 8 },
    { name: "Czech Republic", code: "+420", countryCode: "CZ", mobileLength: 9 },
    { name: "Denmark", code: "+45", countryCode: "DK", mobileLength: 8 },
    { name: "Dominican Republic", code: "+1", countryCode: "DO", mobileLength: 10 },
    { name: "Egypt", code: "+20", countryCode: "EG", mobileLength: 10 },
    { name: "Estonia", code: "+372", countryCode: "EE", mobileLength: 8 },
    { name: "Ethiopia", code: "+251", countryCode: "ET", mobileLength: 9 },
    { name: "Finland", code: "+358", countryCode: "FI", mobileLength: 10 },
    { name: "France", code: "+33", countryCode: "FR", mobileLength: 9 },
    { name: "Georgia", code: "+995", countryCode: "GE", mobileLength: 9 },
    { name: "Germany", code: "+49", countryCode: "DE", mobileLength: 11 },
    { name: "Ghana", code: "+233", countryCode: "GH", mobileLength: 9 },
    { name: "Greece", code: "+30", countryCode: "GR", mobileLength: 10 },
    { name: "Hong Kong", code: "+852", countryCode: "HK", mobileLength: 8 },
    { name: "Hungary", code: "+36", countryCode: "HU", mobileLength: 9 },
    { name: "Iceland", code: "+354", countryCode: "IS", mobileLength: 7 },
    { name: "India", code: "+91", countryCode: "IN", mobileLength: 10, regex: /^[6-9]\d{9}$/, },
    { name: "Indonesia", code: "+62", countryCode: "ID", mobileLength: 11 },
    { name: "Iran", code: "+98", countryCode: "IR", mobileLength: 10 },
    { name: "Iraq", code: "+964", countryCode: "IQ", mobileLength: 10 },
    { name: "Ireland", code: "+353", countryCode: "IE", mobileLength: 9 },
    { name: "Israel", code: "+972", countryCode: "IL", mobileLength: 9 },
    { name: "Italy", code: "+39", countryCode: "IT", mobileLength: 10 },
    { name: "Japan", code: "+81", countryCode: "JP", mobileLength: 10 },
    { name: "Jordan", code: "+962", countryCode: "JO", mobileLength: 9 },
    { name: "Kazakhstan", code: "+7", countryCode: "KZ", mobileLength: 10 },
    { name: "Kenya", code: "+254", countryCode: "KE", mobileLength: 9 },
    { name: "Kuwait", code: "+965", countryCode: "KW", mobileLength: 8 },
    { name: "Lebanon", code: "+961", countryCode: "LB", mobileLength: 8 },
    { name: "Luxembourg", code: "+352", countryCode: "LU", mobileLength: 9 },
    { name: "Malaysia", code: "+60", countryCode: "MY", mobileLength: 10 },
    { name: "Maldives", code: "+960", countryCode: "MV", mobileLength: 7 },
    { name: "Mexico", code: "+52", countryCode: "MX", mobileLength: 10 },
    { name: "Morocco", code: "+212", countryCode: "MA", mobileLength: 9 },
    { name: "Myanmar", code: "+95", countryCode: "MM", mobileLength: 9 },
    { name: "Nepal", code: "+977", countryCode: "NP", mobileLength: 10 },
    { name: "Netherlands", code: "+31", countryCode: "NL", mobileLength: 9 },
    { name: "New Zealand", code: "+64", countryCode: "NZ", mobileLength: 9 },
    { name: "Nigeria", code: "+234", countryCode: "NG", mobileLength: 10 },
    { name: "Norway", code: "+47", countryCode: "NO", mobileLength: 8 },
    { name: "Oman", code: "+968", countryCode: "OM", mobileLength: 8 },
    { name: "Pakistan", code: "+92", countryCode: "PK", mobileLength: 10, regex: /^3\d{9}$/, },
    { name: "Philippines", code: "+63", countryCode: "PH", mobileLength: 10 },
    { name: "Poland", code: "+48", countryCode: "PL", mobileLength: 9 },
    { name: "Portugal", code: "+351", countryCode: "PT", mobileLength: 9 },
    { name: "Qatar", code: "+974", countryCode: "QA", mobileLength: 8 },
    { name: "Romania", code: "+40", countryCode: "RO", mobileLength: 9 },
    { name: "Russia", code: "+7", countryCode: "RU", mobileLength: 10 },
    { name: "Saudi Arabia", code: "+966", countryCode: "SA", mobileLength: 9, regex: /^5\d{8}$/, },
    { name: "Singapore", code: "+65", countryCode: "SG", mobileLength: 8 },
    { name: "South Africa", code: "+27", countryCode: "ZA", mobileLength: 9 },
    { name: "South Korea", code: "+82", countryCode: "KR", mobileLength: 10 },
    { name: "Spain", code: "+34", countryCode: "ES", mobileLength: 9 },
    { name: "Sri Lanka", code: "+94", countryCode: "LK", mobileLength: 9 },
    { name: "Sweden", code: "+46", countryCode: "SE", mobileLength: 9 },
    { name: "Switzerland", code: "+41", countryCode: "CH", mobileLength: 9 },
    { name: "Taiwan", code: "+886", countryCode: "TW", mobileLength: 9 },
    { name: "Thailand", code: "+66", countryCode: "TH", mobileLength: 9 },
    { name: "Turkey", code: "+90", countryCode: "TR", mobileLength: 10 },
    { name: "Ukraine", code: "+380", countryCode: "UA", mobileLength: 9 },
    { name: "United Arab Emirates", code: "+971", countryCode: "AE", mobileLength: 9, regex: /^5\d{8}$/, },
    { name: "United Kingdom", code: "+44", countryCode: "GB", mobileLength: 10, regex: /^\d{10}$/, },
    { name: "United States", code: "+1", countryCode: "US", mobileLength: 10, regex: /^\d{10}$/, },
    { name: "Uruguay", code: "+598", countryCode: "UY", mobileLength: 8 },
    { name: "Uzbekistan", code: "+998", countryCode: "UZ", mobileLength: 9 },
    { name: "Vietnam", code: "+84", countryCode: "VN", mobileLength: 9 },
    { name: "Yemen", code: "+967", countryCode: "YE", mobileLength: 9 },
    { name: "Zimbabwe", code: "+263", countryCode: "ZW", mobileLength: 9 },
];

const MobileNumberInput: React.FC<MobileNumberInputProps> = ({
    label,
    mobileNumber,
    countryCode,
    disabled = false,
    error,
    required = false,
    onMobileChange,
    onCountryCodeChange,
}) => {

    const selectedCountry = countryList.find((x) => x.code === countryCode) || countryList.find((x) => x.code === "+91") || countryList[0];

    return (
        <div style={{ width: "100%" }}>

            <label
                style={{
                    display: "block",
                    fontSize: "14px",
                    fontWeight: 500,
                    marginBottom: "4px",
                    color: "#00000080",
                }}
            >
                {label ?? "Mobile Number"}

                {required && (
                    <span style={{ color: "red", marginLeft: "4px" }}>
                        *
                    </span>
                )}
            </label>

            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    border: error ? "1px solid #ef4444" : "1px solid #d1d5db",
                    borderRadius: "0.5rem",
                    overflow: "hidden",
                    background: "#fff",
                    height: "44px",
                }}>

                <div style={{ width: "150px" }}>

                    <SinglePageSelection
                        value={countryCode || "+91"}
                        disabled={disabled}
                        isBorderRadius={false}
                        onChange={(value) => onCountryCodeChange(String(value))}
                        isShowClearSelection={false}
                        selectedTextColor="#A9A9A9"
                        searchable={false}
                        options={countryList.map((country) => ({
                            label: (
                                <div
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "8px",
                                    }}
                                >
                                    <ReactCountryFlag
                                        countryCode={country.countryCode}
                                        svg
                                        style={{
                                            width: "18px",
                                            height: "18px",

                                        }}
                                    />

                                    <span>
                                        {country.countryCode}

                                        <span
                                            style={{ color: "#A9A9A9", marginLeft: "4px", }}
                                        >
                                            {country.code}
                                        </span>
                                    </span>
                                </div>
                            ),
                            searchText: `${country.name} ${country.code}`,

                            value: country.code,
                        }))}
                    />

                    {/* Arrow */}
                    <ChevronDown
                        size={16}
                        style={{
                            position: "absolute",
                            right: "10px",
                            top: "50%",
                            transform: "translateY(-50%)",
                            pointerEvents: "none",
                            color: "#6b7280",
                        }}
                    />
                </div>


                <div style={{ flex: 1, }}>
                    <Input
                        type="text"
                        value={mobileNumber}
                        disabled={disabled}
                        isBorderRadius={false}
                        placeholder="Enter Mobile Number"
                        rightIcon={
                            <Phone className="h-4 w-4 text-gray-400" />
                        }
                        onChange={(e) => {
                            const mobile = e.target.value.replace(/[^0-9]/g, "").slice(0, selectedCountry.mobileLength);

                            onMobileChange(mobile);
                        }}
                        style={{
                            border: "none",
                            borderRadius: "0",
                            boxShadow: "none",
                            height: "44px",
                        }}
                    />
                </div>
            </div>

            {error && (
                <div
                    style={{
                        marginTop: "4px",
                        fontSize: "14px",
                        color: error ? "#dc2626" : "#6b7280",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                    }}
                >
                    <InfoIcon
                        style={{
                            fontSize: "10px",
                            color: error ? "#dc2626" : "#6b7280",
                            height: 14
                        }}
                    />
                    {error}
                </div>
            )}
        </div>
    );
};

export default MobileNumberInput;