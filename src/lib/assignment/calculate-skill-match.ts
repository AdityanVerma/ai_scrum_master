import { normalizeSkill } from '@/lib/assignment/normalize-skill';

export type SkillMatchResult = {
  matchedSkills: string[];
  missingSkills: string[];
  matchPercentage: number;
};

export function calculateSkillMatch(
  requiredSkills: string[],
  memberSkills: string[],
): SkillMatchResult {
  const normalizedMemberSkills = new Set(
    memberSkills.map(normalizeSkill).filter(Boolean),
  );

  const matchedSkills: string[] = [];
  const missingSkills: string[] = [];

  for (const requiredSkill of requiredSkills) {
    const normalizedRequiredSkill = normalizeSkill(requiredSkill);

    if (!normalizedRequiredSkill) {
      continue;
    }

    if (normalizedMemberSkills.has(normalizedRequiredSkill)) {
      matchedSkills.push(requiredSkill);
    } else {
      missingSkills.push(requiredSkill);
    }
  }

  const totalRequiredSkills = matchedSkills.length + missingSkills.length;

  const matchPercentage =
    totalRequiredSkills === 0
      ? 0
      : Math.round((matchedSkills.length / totalRequiredSkills) * 100);

  return {
    matchedSkills,
    missingSkills,
    matchPercentage,
  };
}
