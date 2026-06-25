import React, { useState, useEffect } from "react";
import { Modal } from "@/ui/components/Modal/Modal";
import { TextArea } from "@/ui/components/forms/Textarea";
import type { PayTrackBookingData } from "@/features/crmPayTrack/models/PayTrackBookingModel";
import { formatCurrency, getSafeString } from "@/core/utils/comman";
import { FieldItem } from "@/ui/components/forms/FieldItem";

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
            <div className="bg-[#F9FAFB]">
                <div className="space-y-6 p-6">
                    <section className="border-[0.1px] rounded-xl border-[#33333321] rounded-sm overflow-hidden">

                        <div className="bg-[#F6F9FF] px-3 py-2 border-b border-[#D0D7DE]">
                            <h4 className="text-sm font-semibold text-[#13367A]">
                                Unit Details
                            </h4>
                        </div>
                        <div className="p-4 bg-white">
                            <div className="grid grid-cols-4 gap-4 bg-white rounded-lg pt-4">
                                <FieldItem label="Project Name" value={getSafeString(bookingData.ProjectName)} />
                                <FieldItem label="Wing" value={getSafeString(bookingData.Wing)} />
                                <FieldItem label="Floor" value={getSafeString(bookingData.Floor)} />
                                <FieldItem label="Unit Number" value={getSafeString(bookingData.Flat)} />
                                <FieldItem label="Configuration" value={getSafeString(bookingData.FlatConfiguration)} />
                                <FieldItem label="RERA Carpet Area (SqFt)" value={getSafeString(bookingData.RERACarpetAreaSqFt)} />
                                <FieldItem label="Agreement Value (With TDS) (₹)" value={formatCurrency(bookingData.AgreementValue)} />
                                <FieldItem label="Number Of Parking" value={getSafeString(bookingData.NumberOfParking)} />

                            </div>
                        </div>
                    </section>

                    {bookingData.BookingApplicantData && bookingData.BookingApplicantData.length > 0 && (
                        <section className="border-[0.1px] rounded-xl border-[#33333321] rounded-sm overflow-hidden">

                            <div className="bg-[#FFF6EB] px-3 py-2 border-b border-[#D0D7DE]">
                                <h4 className="text-sm font-semibold text-[#C2410C]">
                                    Applicant & Co - Applicant Details
                                </h4>
                            </div>
                            <div className="p-4 bg-white">
                                {bookingData.BookingApplicantData.map((applicant, i) => (
                                    <div key={applicant.BookingApplicantId ?? i} className="">
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                            <FieldItem label="Type" value={getSafeString(applicant.ApplicantType)} className='text-blue-900 bold' />
                                            <FieldItem label="Applicant Name" value={getSafeString(applicant.ApplicantName)} urls={applicant?.PhotoURL} isIcon />
                                            <FieldItem label="Mobile Number" value={`${getSafeString(applicant?.ApplicantMobileNumberCountryCode ?? "+91")}  ${getSafeString(applicant?.ApplicantMobileNumber)}`} />

                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {bookingData.ParkingData && bookingData.ParkingData.length > 0 && (
                        <section className="border-[0.1px] rounded-xl border-[#33333321] rounded-sm overflow-hidden">

                            <div className="bg-[#F6F9FF] px-3 py-2 border-b border-[#D0D7DE]">
                                <h4 className="text-sm font-semibold text-[#13367A]">
                                    Parking Details
                                </h4>
                            </div>
                            <div className="p-4 bg-white">
                                {bookingData.ParkingData.map((parking, index) => {

                                    const isLast = index === (bookingData.ParkingData?.length ?? 0) - 1;

                                    return (
                                        <div key={parking.ParkingId || index} className="pt-4">
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