import { formatDate_dd_MonthName_yy } from "@/core/utils/dateFormat";

export interface VerificationStep {
    id: string;
    label: string;
    completed: boolean;
    value:string;
}

interface LitigationVerificationParams {
    formData: any;
}

export const getLitigationVerificationSteps = ({
    formData
}: LitigationVerificationParams): VerificationStep[] => {

    const isTitleCompleted = !!formData.Title;

    const isDateOfFillingCompleted = !!formData.DateOfFilling;

    const isCaseTypeCompleted = !!formData.CaseType;

    const isCaseNumberCompleted = !!formData.CaseNumber;

    return [


        {
            id: "title",
            label: "Title",
            completed: isTitleCompleted,
            value: formData.Title
        },

        {
            id: "dateOFFilling",
            label: "Date Of Filling",
            completed: isDateOfFillingCompleted,
            value: formatDate_dd_MonthName_yy(formData.DateOfFilling)
        },

        {
            id: "caseType",
            label: "Case Type",
            completed: isCaseTypeCompleted,
            value: formData.CaseType
        },

        {
            id: "caseNumber",
            label: "Case Number",
            completed: isCaseNumberCompleted,
            value: formData.CaseNumber
        }

    ];
};