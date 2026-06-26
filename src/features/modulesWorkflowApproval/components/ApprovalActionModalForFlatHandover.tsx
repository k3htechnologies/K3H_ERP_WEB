import React, { useState, useEffect } from "react";
import { Modal } from "@/ui/components/Modal/Modal";
import { TextArea } from "@/ui/components/forms/Textarea";
import type { PayTrackBookingData } from "@/features/crmPayTrack/models/PayTrackBookingModel";
import { formatCurrency, getSafeString } from "@/core/utils/comman";
import { FieldItem } from "@/ui/components/forms/FieldItem";
import { getNameInitials } from "@/core/utils/getNameInitials";
import { Phone } from "lucide-react";

interface Props {
    isOpen: boolean;
    title?: string
    onClose: () => void;
    onSubmit: (remark: string) => void;
    loading?: boolean;
    actionType: "approve" | "reject";
    titleText?: string;
    subTitleText?: string;
    subSubTitleText?: string;
    bookingData: PayTrackBookingData
}

const ApprovalActionModalForFlatHandover: React.FC<Props> = ({
    isOpen,
    title,
    onClose,
    onSubmit,
    loading,
    actionType,
    titleText,
    subTitleText,
    subSubTitleText,
    bookingData,

}) => {

    const [remark, setRemark] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        if (isOpen) {
            setRemark("");
            setError("");
        }
    }, [isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!remark.trim()) {
            setError("Remark is required");
            return;
        }

        setError("");
        onSubmit(remark.trim());
    };

    const modalTitle = (<span className="font-semibold"> {actionType === "approve" ? "Approve" : "Reject"} {title}
        {titleText && (
            <span className="text-gray-500 font-medium">
                {" : "}
                {titleText}
                {subTitleText && <> {" > "} {subTitleText}</>}
                {subSubTitleText && <> {" > "} {subSubTitleText}</>}
            </span>
        )}
    </span>
    );

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            onCancel={onClose}
            onSubmit={handleSubmit}
            title={modalTitle}
            saveText={actionType === "approve" ? "Approve" : "Reject"}
            size="xxl"
            loading={loading}
        >
            <div className="bg-[#f8fafc]">
                <div className="space-y-6 p-6">
                    
                    <section>
                        <h4 className="text-sm font-semibold text-gray-500">
                            Unit Details
                        </h4>
                        <div className="grid grid-cols-2 divide-x divide-gray-200 bg-white rounded-lg border border-[#33333321] mt-2 box-shadow: 0px 1px 2px 0px #0000000D">
                            <div className="grid grid-cols-1 gap-x-6 gap-y-4 p-4">
                                <FieldItem label="Project Name" value={getSafeString(bookingData.ProjectName)} isRow withBorder={false} />
                                <FieldItem label="Wing" value={getSafeString(bookingData.Wing)} isRow withBorder={false} />
                                <FieldItem label="Floor" value={getSafeString(bookingData.Floor)} isRow withBorder={false} />
                                <FieldItem label="Unit Number" value={getSafeString(bookingData.Flat)} isRow withBorder={false} />
                            </div>
                            <div className="grid grid-cols-1 gap-x-6 gap-y-4 p-4">
                                <FieldItem label="Configuration" value={getSafeString(bookingData.FlatConfiguration)} isRow withBorder={false} />
                                <FieldItem label="RERA Carpet Area (SqFt)" value={getSafeString(bookingData.RERACarpetAreaSqFt)} isRow withBorder={false} />
                                <FieldItem label="Agreement Value (With TDS) (₹)" value={formatCurrency(bookingData.AgreementValue)} isRow withBorder={false} />
                                <FieldItem label="Number Of Parking" value={getSafeString(bookingData.NumberOfParking)} isRow withBorder={false} />
                            </div>

                        </div>
                    </section>

                    {bookingData.BookingApplicantData && bookingData.BookingApplicantData.length > 0 && (

                        <section>
                            <h4 className="text-sm font-semibold text-gray-500">
                                Applicant & Co-Applicant Details
                            </h4>

                            <div className="mt-2 space-y-3">
                                {bookingData.BookingApplicantData.map((applicant, i) => (
                                    <div key={applicant.BookingApplicantId ?? i}
                                        className="flex items-center justify-between bg-white border border-[#E5E7EB] rounded-xl p-4 box-shadow: 0px 1px 2px 0px #0000000D">

                                        <div className="flex items-center gap-4">
                                            {applicant?.PhotoURL && applicant.PhotoURL !== "—" ? (
                                                <img
                                                    src={applicant.PhotoURL}
                                                    alt="Profile"
                                                    className="w-14 h-14 rounded-full object-cover border border-[#E5E7EB]"
                                                />
                                            ) : (
                                                <div className="w-14 h-14 rounded-full bg-[#E0E7FF] flex items-center justify-center text-[#1E40AF] font-semibold text-xl">
                                                    {getNameInitials(getSafeString(applicant.ApplicantName))}
                                                </div>
                                            )}

                                            <div>
                                                <FieldItem label="" value={getSafeString(applicant.ApplicantName)} urls={applicant?.PhotoURL} isIcon />

                                                <div className="flex items-center gap-1 mt-1 text-[#64748B] text-sm">
                                                    <Phone size={14} className="text-[#2563EB]" />

                                                    <span>
                                                        {getSafeString(applicant.ApplicantMobileNumberCountryCode ?? "+91")}{" "} {getSafeString(applicant.ApplicantMobileNumber)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <span className="px-4 py-1.5 rounded-full bg-[#F4F2FC] border border-[#C4C5D5] text-[#475569] text-sm font-medium">
                                            {getSafeString(applicant.ApplicantType)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {bookingData.ParkingData && bookingData.ParkingData.length > 0 && (
                        <section>
                                <h4 className="text-sm font-semibold text-gray-500">
                                    Parking Details
                                </h4>
                            <div className="p-4 bg-white rounded-lg border border-[#33333321] mt-2 box-shadow: 0px 1px 2px 0px #0000000D">
                                {bookingData.ParkingData.map((parking, index) => {

                                    const isLast = index === (bookingData.ParkingData?.length ?? 0) - 1;

                                    return (
                                        <div key={parking.ParkingId || index} >
                                            <h3 className="text-sm font-semibold text-gray-500">
                                                Parking {index + 1}
                                            </h3>
                                            <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4 ${!isLast ? "border-b border-[#135bec2e] pb-4" : "border-b border-[#135bec2e] pb-4 pt-4"} `} >
                                                <FieldItem label="Parking Number" value={getSafeString(parking.ParkingNumber)} />
                                                <FieldItem label="Category" value={getSafeString(parking.ParkingCategory)} />
                                                <FieldItem label="Type" value={getSafeString(parking.ParkingType)} />
                                            </div>

                                            <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4 ${!isLast ? "border-b border-[#135bec2e] pb-4" : ""} `} >
                                                <FieldItem label="Size" value={getSafeString(parking.ParkingSubType)} />
                                                <FieldItem label="Dimensions" value={getSafeString(parking.ParkingDimensions)} />

                                                <FieldItem label="EV Charging" value={parking.IsEVChargingAvailable ? 'Yes' : 'No'} />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </section>
                    )}

                    <TextArea
                        label="Remark"
                        placeholder="Enter Remark"
                        value={remark}
                        required
                        error={error}
                        onChange={(e) => {
                            setRemark(e.target.value);
                            if (error) setError("");
                        }}
                    />

                </div>
            </div>
        </Modal>
    );
};

export default ApprovalActionModalForFlatHandover;