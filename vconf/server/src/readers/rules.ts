import path from 'node:path';
import type { RuleEntry, RulesData } from '../../../shared/types.js';
import { fileRef, readText, walkFiles, parseFrontmatter, exists } from './util.js';

export async function readRules(configRoot: string): Promise<RulesData> {
  const dir = path.join(configRoot, 'rules');
  if (!exists(dir)) return { rules: [] };

  const relFiles = (await walkFiles(dir, (rel) => rel.endsWith('.md'))).sort();
  const rules: RuleEntry[] = [];

  for (const rel of relFiles) {
    const p = path.join(dir, rel);
    const raw = await readText(p);
    if (raw === null) continue;
    const { frontmatter, body } = parseFrontmatter(raw);
    rules.push({
      ...fileRef(p),
      id: rel,
      relPath: rel,
      title: rel,
      paths: Array.isArray(frontmatter.paths) ? (frontmatter.paths as string[]) : undefined,
      frontmatter,
      content: body,
    });
  }

  return { rules };
}
