import React from 'react'
import { FieldItem } from '@/ui/components/forms/FieldItem'
import { formatDate_dd_MonthName_yy } from '@/core/utils/dateFormat'
import { formatCurrency } from '@/core/utils/comman'
import type { ProjectMasterData } from '@/features/projectMaster/models/ProjectMasterModel'

interface OverviewProps {
    projectData: ProjectMasterData | undefined
}

export const Overview: React.FC<OverviewProps> = ({ projectData }) => {
    if (!projectData) {
        return (
            <div className="py-6 text-center text-gray-500 text-sm">
                No project details available.
            </div>
        )
    }

    const isTender = projectData.Category?.toUpperCase() === 'TENDER'

    return (
        <div className="lg:col-span-2 space-y-6 max-h-[70vh] overflow-y-auto p-1">
            <section className="bg-white rounded-xl shadow-sm p-6 border border-[#3333334f]">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">
                    Basic Project Details
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 border-b border-[#135bec2e] pb-4">
                    <FieldItem label="Redevelopment" value={projectData.IsRedevelopment === true ? 'YES' : 'NO'} />
                    <FieldItem label="Project Name" value={projectData.ProjectName ?? '-'} />
                    <FieldItem label="Business Category" value={projectData.BussinessCategory ?? '-'} />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-5 pb-4 border-b border-[#135bec2e]">
                    <FieldItem label="File Number" value={projectData.FileNumber ?? '-'} />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-4 pt-5 pb-4 border-b border-[#135bec2e]">
                    <FieldItem label="CTS Number" value={projectData.CTSNumber ?? '-'} />
                </div>
                
                {!isTender && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-4 pt-5 pb-4 border-b border-[#135bec2e]">
                        <FieldItem label="Category" value={projectData.Category ?? '-'} />
                    </div>
                )}

                {isTender && (
                    <>
                        <h4 className="text-lg font-semibold text-gray-900 mb-4 pt-2">
                            Project Category
                        </h4>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 border-b border-[#135bec2e] pb-4">
                            <FieldItem label="Category" value={projectData.Category ?? '-'} />
                            <FieldItem label="Amount" value={formatCurrency(projectData.TenderAmount)} />
                            <FieldItem label="EMD Amount" value={formatCurrency(projectData.TenderEMDAmount)} />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 border-b border-[#135bec2e] pb-4 pt-5">
                            <FieldItem label="Purchase Start Date" value={projectData.TenderPurchaseStartDate ? formatDate_dd_MonthName_yy(projectData.TenderPurchaseStartDate) : '-'}/>
                            <FieldItem label="Purchase End Date" value={projectData.TenderPurchaseEndDate ? formatDate_dd_MonthName_yy(projectData.TenderPurchaseEndDate) : '-'}/>
                            <FieldItem label="Cheque Number" value={projectData.TenderChequeNumber ?? '-'} urls={projectData.TenderChequeNumberURL ?? '-'} isIcon/>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 border-b border-[#135bec2e] pb-4 pt-5">
                            <FieldItem label="Submission Date" value={projectData.TenderSubmissionDate ? formatDate_dd_MonthName_yy(projectData.TenderSubmissionDate) : '-'}/>
                            <FieldItem label="Issue Date" value={projectData.TenderIssueDate ? formatDate_dd_MonthName_yy(projectData.TenderIssueDate) : '-'}/>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-4 pt-5">
                            <FieldItem label="Payorder Remark" value={projectData.TenderPayorderRemark ?? '-'} />
                        </div>
                    </>
                )}

                <h4 className="text-lg font-semibold text-gray-900 mb-4 pt-2">
                    Liasoning Architect
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-4 border-b border-[#135bec2e]">
                    <FieldItem label="Name" value={projectData.LiasoningArchitectName ?? '-'} />
                    <FieldItem label="Mobile Number" value={projectData.LiasoningArchitectMobileNumber ? `+91 ${projectData.LiasoningArchitectMobileNumber}` : '-'} />
                </div>

                <h4 className="text-lg font-semibold text-gray-900 mb-4 pt-2">
                    Designing Architect
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-4 border-b border-[#135bec2e]">
                    <FieldItem label="Name" value={projectData.DesigningArchitectName ?? '-'} />
                    <FieldItem label="Mobile Number" value={projectData.DesigningArchitectMobileNumber ? `+91 ${projectData.DesigningArchitectMobileNumber}` : '-'} />
                </div>

                <h4 className="text-lg font-semibold text-gray-900 mb-4 pt-2">
                    RCC Consultant
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-5 border-b border-[#135bec2e]">
                    <FieldItem label="Name" value={projectData.RCCConsultantName ?? '-'} />
                    <FieldItem label="Mobile Number" value={projectData.RCCConsultantMobileNumber ? `+91 ${projectData.RCCConsultantMobileNumber}` : '-'} />
                </div>

                <h4 className="text-lg font-semibold text-gray-900 mb-4 pt-2">
                    Location Details
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-4 pb-4 border-b border-[#135bec2e]">
                    <FieldItem label="Project Location" value={projectData.ProjectLocation ?? '-'} />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-1 pt-4 pb-4 border-b border-[#135bec2e]">
                    <div className="text-sm font-medium text-[#1D1D1D80] truncate">
                        Google Location
                    </div>
                    {projectData.GoogleLocation ? (
                        <span 
                            className="text-blue-600 underline cursor-pointer break-all whitespace-normal text-sm"
                            onClick={() => window.open(projectData.GoogleLocation, "_blank")}
                        >
                            {projectData.GoogleLocation}
                        </span>
                    ) : "-"}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 border-b border-[#135bec2e] pb-4 pt-4">
                    <FieldItem label="Country" value={projectData.CountryName ?? '-'} />
                    <FieldItem label="State" value={projectData.StateName ?? '-'} />
                    <FieldItem label="District" value={projectData.DistrictName ?? '-'} />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-4 pt-4 border-b border-[#135bec2e]">
                    <FieldItem label="City" value={projectData.CityName ?? '-'} />
                    <FieldItem label="Village" value={projectData.VillageName ?? '-'} />
                    <FieldItem label="PIN Code" value={projectData.ZipCode ?? '-'} />
                </div>

                <h4 className="text-lg font-semibold text-gray-900 mb-4 pt-5">
                    Scheme & Scope Details
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-4 border-b border-[#135bec2e]">
                    <FieldItem label="Project Scope" value={projectData.ProjectScope ?? '-'} />
                    <FieldItem label="Project Scheme" value={projectData.ProjectScheme ?? '-'} />
                    <FieldItem label="Project Sub Scheme" value={projectData.ProjectSubScheme ?? '-'} />
                </div>

                <h4 className="text-lg font-semibold text-gray-900 mb-4 pt-5">
                    Project Documentation
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-4 border-b border-[#135bec2e]">
                    <FieldItem label="RERA Number" value={projectData.RERANumber ?? '-'} />
                    <FieldItem label="RERA Certificate Date" value={projectData.RERACertificateDate ? formatDate_dd_MonthName_yy(projectData.RERACertificateDate) : '-'} />
                    <FieldItem label="RERA Completion Date" value={projectData.RERAComplitionDate ? formatDate_dd_MonthName_yy(projectData.RERAComplitionDate) : '-'} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 border-b border-[#135bec2e] pb-4 pt-5">
                    <FieldItem label="APF Number" value={projectData.APFNumber ?? '-'} />
                </div>

                <h4 className="text-lg font-semibold text-gray-900 mb-4 pt-5">
                    Project Timeline
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-4 border-b border-[#135bec2e]">
                    <FieldItem label="Survey Date" value={projectData.SurveyDate ? formatDate_dd_MonthName_yy(projectData.SurveyDate) : '-'} />
                    <FieldItem label="Expected Start Date" value={projectData.ExpectedStartDate ? formatDate_dd_MonthName_yy(projectData.ExpectedStartDate) : '-'} />
                    <FieldItem label="Execution Start Date" value={projectData.ExecutionStartDate ? formatDate_dd_MonthName_yy(projectData.ExecutionStartDate) : '-'} />
                </div>

                <h4 className="text-lg font-semibold text-gray-900 mb-4 pt-5">
                    Contact Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <FieldItem label="Site Contact Name" value={projectData.SiteContactName ?? '-'} />
                    <FieldItem label="Site Contact Mobile Number" value={projectData.SiteContactMobileNumber ?? '-'} />
                    <FieldItem label="Project Status" value={projectData.ProjectStatus ?? '-'} />
                </div>
            </section>
        </div>
    )
}

export default Overview