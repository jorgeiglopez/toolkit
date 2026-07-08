import path from 'node:path';
import type { AgentEntry, AgentsData } from '../../../shared/types.js';
import { fileRef, readText, listDir, parseFrontmatter, exists } from './util.js';

export async function readAgents(configRoot: string): Promise<AgentsData> {
  const dir = path.join(configRoot, 'agents');
  if (!exists(dir)) return { agents: [] };

  const files = (await listDir(dir)).filter((f) => f.endsWith('.md'));
  const agents: AgentEntry[] = [];

  for (const file of files) {
    const p = path.join(dir, file);
    const raw = await readText(p);
    if (raw === null) continue;
    const { frontmatter, body } = parseFrontmatter(raw);
    agents.push({
      ...fileRef(p),
      id: path.basename(file, '.md'),
      name: (frontmatter.name as string) || path.basename(file, '.md'),
      description: frontmatter.description as string | undefined,
      model: frontmatter.model as string | undefined,
      tools: frontmatter.tools as string | string[] | undefined,
      frontmatter,
      hasHooks: 'hooks' in frontmatter && !!frontmatter.hooks,
      body,
    });
  }

  agents.sort((a, b) => a.name.localeCompare(b.name));
  return { agents };
}
