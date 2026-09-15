export function normalizeSkill(skill: string) {
  return skill
    .trim()
    .toLowerCase()
    .replace(/[.\-_]/g, '')
    .replace(/\s+/g, '');
}
