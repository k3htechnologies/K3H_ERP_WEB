import React from "react";
import { Input } from "../forms";
import { Check } from "lucide-react";

export interface VerificationStep {
  id: string;
  label: string;
  completed?: boolean;
  mobileNumber?: string;
}

interface CompleteVerificationSectionProps {
  steps: VerificationStep[];
  otp: string;
  onOtpChange: (otp: string) => void;
  subtitle?: string;
  mobileNumber?: string;
}

const CompleteVerificationSection: React.FC<CompleteVerificationSectionProps> = ({
  steps,
  otp,
  onOtpChange,
  subtitle = "Verify Details To Continue",
  mobileNumber,
}) => {
  return (
    <div className="bg-white rounded-lg w-full max-w-md">

      {/* Header */}
      <div className="flex justify-between items-start mb-3">

        <div>
          <p className="text-sm text-gray-500">

            {subtitle}
          </p>
        </div>

      </div>

      {/* Step List */}
      <div className="space-y-3 mt-4">

        {steps.map((step) => (
          <div key={step.id} className="flex items-center gap-3">

            <div className={`w-6 h-6 rounded-md flex items-center justify-center border-2 transition-all duration-200 ${step.completed ? "bg-blue-600 text-white" : "bg-blue-200 text-transparent"}`} >{step.completed && <Check size={14} strokeWidth={3} />}</div>

            <span className={`text-sm ${step.completed ? "text-gray-900 font-medium" : "text-gray-500"}`} >
              {step.label}
            </span>

          </div>
        ))}

      </div>

      {/* OTP Section */}
      <div className="mt-5">

        <div className="flex gap-2 mt-2">

          <Input
            label={`Verify OTP ${mobileNumber ? `+91 ${mobileNumber}` : ""}`}
            value={otp}
            maxLength={4}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, '').slice(0, 4);
              onOtpChange(value);
            }}
            placeholder="Enter OTP"
          />

        </div>


      </div>

    </div>
  );
};

export default CompleteVerificationSection;
