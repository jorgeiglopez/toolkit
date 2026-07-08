import fs from 'node:fs';
import path from 'node:path';
import type { SkillEntry, SkillsData, SkillSupportFile } from '../../../shared/types.js';
import { fileRef, readText, listDir, parseFrontmatter, exists } from './util.js';

/** Read ~/.claude/skills/<name>/ dirs. Each surfaces RULES.md (optional) + SKILL.md + support files. */
export async function readSkills(configRoot: string): Promise<SkillsData> {
  const dir = path.join(configRoot, 'skills');
  if (!exists(dir)) return { skills: [] };

  const entries = await listDir(dir);
  const skills: SkillEntry[] = [];

  for (const name of entries) {
    const skillDir = path.join(dir, name);
    let isDir = false;
    try {
      isDir = fs.statSync(skillDir).isDirectory();
    } catch {
      continue;
    }
    if (!isDir) continue;

    const skillMdPath = path.join(skillDir, 'SKILL.md');
    if (!exists(skillMdPath)) continue; // not a skill dir

    const ref = fileRef(skillDir);
    const skillRaw = (await readText(skillMdPath)) ?? '';
    const { frontmatter, body } = parseFrontmatter(skillRaw);

    const rulesPath = path.join(skillDir, 'RULES.md');
    const rulesMd = exists(rulesPath) ? await readText(rulesPath) : null;

    // Support files: anything in the dir that isn't SKILL.md / RULES.md
    const supportFiles: SkillSupportFile[] = [];
    for (const f of await listDir(skillDir)) {
      if (f === 'SKILL.md' || f === 'RULES.md') continue;
      const fp = path.join(skillDir, f);
      let isSubDir = false;
      try {
        isSubDir = fs.statSync(fp).isDirectory();
      } catch {
        /* ignore */
      }
      if (isSubDir) {
        // list one level of nested support files (references/, bin/, etc.)
        for (const nested of await listDir(fp)) {
          supportFiles.push({ name: `${f}/${nested}`, relPath: `${f}/${nested}`, path: path.join(fp, nested) });
        }
      } else {
        supportFiles.push({ name: f, relPath: f, path: fp });
      }
    }

    skills.push({
      ...ref,
      id: name,
      name: (frontmatter.name as string) || name,
      description: frontmatter.description as string | undefined,
      frontmatter,
      rulesMd,
      skillMd: body,
      supportFiles,
      source: ref.isSymlink ? 'symlink' : 'local',
    });
  }

  skills.sort((a, b) => a.name.localeCompare(b.name));
  return { skills };
}
