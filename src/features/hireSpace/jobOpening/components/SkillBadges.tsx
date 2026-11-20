import React from 'react';
import { parseSkills } from '@/features/hireSpace/jobOpening/utils/jobOpeningUtils';

interface SkillBadgesProps {
  skills?: string | string[] | null;
  emptyMessage?: string;
  className?: string;
}

export const SkillBadges: React.FC<SkillBadgesProps> = ({
  skills,
  emptyMessage = '-',
  className = '',
}) => {
  const skillList = parseSkills(skills);

  if (skillList.length === 0) {
    return <span className="text-sm text-gray-500">{emptyMessage}</span>;
  }

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {skillList.map((skill, index) => (
        <span
          key={`${skill}-${index}`}
          className="rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-600"
        >
          {skill}
        </span>
      ))}
    </div>
  );
};
