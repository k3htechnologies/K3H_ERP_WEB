import { CheckCircle2, FileText } from "lucide-react";
import type { ReactNode } from "react";
import { FieldItem } from "@/ui/components/forms/FieldItem";
import NoDataView from "@/ui/components/NoDataView/NoDataView";
import type { JobRoleMasterData } from "../models/JobRoleMasterModel";

interface JobRoleDetailContentProps {
  role: JobRoleMasterData;
}

interface SectionProps {
  icon: ReactNode;
  iconBg?: string;
  title: string;
  children: ReactNode;
  last?: boolean;
}

interface ItemListProps {
  title?: string;
  items: string[];
  empty: string;
  grid?: boolean;
}

const splitText = (value?: string) =>
  value
    ? value
        .split(/(?<=\.)\s+|\n+/)
        .map((item) => item.trim())
        .filter(Boolean)
    : [];

const Section = ({ icon, iconBg = "bg-[#EFF8FF]", title, children, last = false }: SectionProps) => (
  <section className={last ? "" : "mb-8 border-b border-dashed border-gray-200 pb-8"}>
    <div className="mb-4 flex items-center gap-3">
      <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${iconBg}`}>{icon}</div>
      <h3 className="text-base font-bold leading-[25.2px] tracking-[0px] text-[#6F767E]">{title}</h3>
    </div>
    {children}
  </section>
);

const ItemList = ({ title, items, empty, grid = false }: ItemListProps) => (
  <div>
    {title && <h4 className="mb-3 text-xs font-bold uppercase tracking-[1px] text-[#9EA5AD]">{title}</h4>}
    {items.length ? (
      <ul
        className={`text-[14px] font-medium leading-[22px] text-[#344054] ${
          grid ? "grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3" : "space-y-3"
        }`}
      >
        {items.map((item, index) => (
          <li key={`${item}-${index}`} className="break-words">
            {item}
          </li>
        ))}
      </ul>
    ) : (
      <NoDataView
        message={empty}
        className="py-3"
        iconClassName="!h-16 !w-16"
      />
    )}
  </div>
);

export const JobRoleDetailContent: React.FC<JobRoleDetailContentProps> = ({ role }) => {
  const responsibilities = splitText(role.RoleResponsibility);
  const requirements = splitText(role.JobRequirement);
  const qualifications = splitText(role.RoleQualification);

  return (
    <div className="min-w-0 rounded-[20px] border border-[#EAECF0] bg-white p-4 sm:p-8">
      <Section
        icon={<FileText className="h-4 w-4 text-[#215EED]" />}
        iconBg="bg-[#EFF8FF]"
        title="Description"
      >
        <FieldItem
          label="Description"
          className="[&>span:first-child]:hidden [&>div]:!mt-0"
          value={
            <p className="break-words whitespace-pre-wrap text-[14px] font-medium leading-[22.4px] tracking-[0px] text-[#344054]">
              {role.RoleDescription || "No role description available."}
            </p>
          }
        />
      </Section>

      <Section
        icon={<CheckCircle2 className="h-4 w-4 text-[#8A33FF]" />}
        iconBg="bg-[#F9F5FF]"
        title="Responsibilities"
      >
        <FieldItem
          label="Responsibilities"
          className="[&>span:first-child]:hidden [&>div]:!mt-0"
          value={<ItemList items={responsibilities} empty="No responsibilities available." grid />}
        />
      </Section>

      <Section
        icon={<FileText className="h-4 w-4 text-[#FF6633]" />}
        iconBg="bg-[#FFF6ED]"
        title="Requirements & Qualifications"
        last
      >
        <FieldItem
          label="Requirements & Qualifications"
          className="[&>span:first-child]:hidden [&>div]:!mt-0"
          value={
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-8">
              <ItemList title="Qualifications" items={qualifications} empty="No qualifications available." />
              <ItemList title="Requirements" items={requirements} empty="No requirements available." />
            </div>
          }
        />
      </Section>
    </div>
  );
};

export default JobRoleDetailContent;
