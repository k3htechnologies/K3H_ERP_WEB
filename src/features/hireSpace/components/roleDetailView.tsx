import { Briefcase, CheckCircle2, Clock, Copy, FileText, Loader2, MapPin } from "lucide-react";
import { useMemo } from "react";
import type { JobRole } from "../models/JobRoleModel";
import { getJobRoleSkills } from "../utils/jobRoleUtils";

interface RoleDetailViewProps {
  selectedRole: JobRole | null;
  isDuplicating?: boolean;
  onDuplicate: (role: JobRole) => void;
}

const splitText = (value?: string) =>
  value
    ? value
        .split(/(?<=\.)\s+|\n+/)
        .map((item) => item.trim())
        .filter(Boolean)
    : [];

const RoleDetailView = ({ selectedRole, isDuplicating = false, onDuplicate }: RoleDetailViewProps) => {
  const skills = useMemo(() => {
    if (!selectedRole) return [];
    return getJobRoleSkills(selectedRole.RoleSkills);
  }, [selectedRole]);

  if (!selectedRole) return null;

  const responsibilities = splitText(selectedRole.RoleResponsibility);
  const requirements = splitText(selectedRole.JobRequirement);
  const qualifications = splitText(selectedRole.RoleQualification);
  const experience = [selectedRole.ExperienceYears, selectedRole.ExperienceMonths].filter((value) => value !== undefined).join("y ");

  return (
    <div className="thin-scroll h-full min-h-0 overflow-y-auto pr-1">
      {/* Header Info */}
      <div className="mb-6">
        <h1 className="mb-3 text-[16px] font-semibold leading-[33.6px] tracking-[-0.7px] text-[#1A1D1F]">
          {selectedRole.RoleName}
        </h1>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[13px] font-medium text-[#6F767E]">
          <span className="flex items-center gap-1.5">
            <Briefcase className="h-4 w-4 text-[#9EA5AD]" />
            {experience || "Experience not specified"}
          </span>
          <span className="flex items-center gap-1.5">
            <MapPin className="h-4 w-4 text-[#9EA5AD]" />
            {selectedRole.WorkLocation || selectedRole.WorkMode || "Not specified"}
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="h-4 w-4 text-[#9EA5AD]" />
            {selectedRole.EmploymentType || "Not specified"}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        {/* Description Card */}
        <div className="min-w-0 rounded-[20px] border border-[#EAECF0] bg-white p-4 sm:p-8">
          <Section icon={<FileText className="h-4 w-4 text-[#215EED]" />} iconBg="bg-[#EFF8FF]" title="Description" last>
            <p className="break-words whitespace-pre-wrap text-[14px] font-medium leading-[22.4px] tracking-[0px] text-[#344054]">
              {selectedRole.RoleDescription || "No role description available."}
            </p>
          </Section>
        </div>

        {/* Sidebar - Skills and duplicate action */}
        <aside className="flex w-full flex-col gap-4 xl:w-[320px]">
          {/* Tech Stack Card */}
          <div className="flex-1 overflow-hidden rounded-[20px] border border-[#EAECF0] bg-white p-4 sm:p-6">
            <h3 className="mb-5 text-[14px] font-bold leading-[20px] tracking-[0px] text-[#1A1D1F]">Tech Stack</h3>
            {skills.length ? (
              <div className="flex flex-wrap gap-2.5">
                {skills.map((skill) => (
                  <span
                    key={skill}
                    className="rounded-lg bg-[#F0F5FF] px-3.5 py-1.5 text-[12px] font-medium text-[#215EED]"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-[13px] italic text-gray-400">No technical skills assigned.</p>
            )}
          </div>

          {/* Duplicate Job Role Card */}
          <div className="rounded-[20px] bg-[#101828] px-4 py-5 text-center text-white">
            <p className="mb-3 text-center align-middle text-[12px] font-normal leading-[16px] tracking-[0px] text-[#D0D5DD]">
              Need to duplicate this role?
            </p>
            <button
              type="button"
              onClick={() => onDuplicate(selectedRole)}
              disabled={isDuplicating}
              className="flex h-9 w-full items-center justify-center gap-2 rounded-lg border border-[#475467] bg-[#344054] px-3 text-center align-middle text-[14px] font-semibold leading-[16px] tracking-[0px] transition-colors hover:bg-[#475467] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isDuplicating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Copy className="h-4 w-4" />}
              {isDuplicating ? "Duplicating..." : "Duplicate Job Role"}
            </button>
          </div>
        </aside>

        {/* Long-form content uses the free space below the sidebar. */}
        <div className="min-w-0 rounded-[20px] border border-[#EAECF0] bg-white p-4 sm:p-8 xl:col-span-2">
          <Section icon={<CheckCircle2 className="h-4 w-4 text-[#8A33FF]" />} iconBg="bg-[#F9F5FF]" title="Responsibilities">
            <ItemList items={responsibilities} empty="No responsibilities available." grid />
          </Section>

          <Section icon={<FileText className="h-4 w-4 text-[#FF6633]" />} iconBg="bg-[#FFF6ED]" title="Requirements & Qualifications" last>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-8">
              <ItemList title="Qualifications" items={qualifications} empty="No qualifications available." />
              <ItemList title="Requirements" items={requirements} empty="No requirements available." />
            </div>
          </Section>
        </div>
      </div>
    </div>
  );
};

interface SectionProps {
  icon: React.ReactNode;
  iconBg?: string;
  title: string;
  children: React.ReactNode;
  last?: boolean;
}

const Section = ({ icon, iconBg = "bg-[#EFF8FF]", title, children, last = false }: SectionProps) => (
  <section className={last ? "" : "mb-8 border-b border-dashed border-gray-200 pb-8"}>
    <div className="mb-4 flex items-center gap-3">
      <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${iconBg}`}>{icon}</div>
      <h3 className="text-[15px] font-bold leading-[25.2px] tracking-[0px] text-[#6F767E]">{title}</h3>
    </div>
    {children}
  </section>
);

const ItemList = ({ title, items, empty, grid = false }: { title?: string; items: string[]; empty: string; grid?: boolean }) => (
  <div>
    {title && <h4 className="mb-3 text-[11px] font-bold uppercase tracking-[1px] text-[#9EA5AD]">{title}</h4>}
    {items.length ? (
      <ul
        className={`text-[14px] font-medium leading-[22px] text-[#344054] ${
          grid ? "grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3" : "space-y-3"
        }`}
      >
        {items.map((item, idx) => (
          <li key={idx} className="break-words">
            {item}
          </li>
        ))}
      </ul>
    ) : (
      <p className="text-sm italic text-gray-400">{empty}</p>
    )}
  </div>
);

export default RoleDetailView;
